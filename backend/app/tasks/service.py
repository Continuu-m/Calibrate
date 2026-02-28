"""
tasks/service.py — Task Business Logic

SYSTEM DESIGN CONCEPT — Service Layer Pattern:
Instead of putting all logic directly in route handlers, we use a service layer.

  Router  →  Service  →  Database
  (HTTP)     (Logic)     (Storage)

WHY THIS MATTERS:
  ✅ Routes stay thin and readable (just HTTP concerns)
  ✅ Business logic is reusable (other routes can call the same service)
  ✅ Easier to unit test (test service functions directly, no HTTP needed)
  ✅ Person 1 (ML engineer) can call service functions directly too

OWNERSHIP NOTE (from PRD):
  Person 2 owns the routes/UI layer.
  Person 3 (you) owns this service + data layer.
  Person 1 will call into this service to store predictions and actuals.
"""

from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import HTTPException, status
from datetime import datetime

from app.models.task import Task, Subtask, TaskStatus
from app.models.user import User
from app.tasks.schemas import TaskCreate, TaskUpdate, CapacityResponse


def create_task(db: Session, user_id: int, payload: TaskCreate) -> Task:
    """
    Create a task and its subtasks in a single DB transaction.

    SYSTEM DESIGN — Atomic Transactions:
    We create the task AND subtasks together. If subtask creation fails,
    the whole operation rolls back — no orphaned tasks without subtasks.
    db.commit() only runs once at the end, making this atomic.
    """
    # Create the parent task
    task = Task(
        user_id=user_id,
        title=payload.title,
        description=payload.description,
        task_type=payload.task_type,
        priority=payload.priority,
        deadline=payload.deadline,
        scheduled_date=payload.scheduled_date,
        estimated_time=payload.estimated_time,
        optimistic_time=payload.optimistic_time,
        realistic_time=payload.realistic_time,
        pessimistic_time=payload.pessimistic_time,
    )
    db.add(task)
    db.flush()  # Gets task.id from DB without committing yet

    # Create subtasks linked to this task
    for subtask_data in payload.subtasks:
        subtask = Subtask(
            task_id=task.id,
            description=subtask_data.description,
            estimated_time=subtask_data.estimated_time,
            order=subtask_data.order,
        )
        db.add(subtask)

    db.commit()
    db.refresh(task)
    return task


def get_tasks(
    db: Session,
    user_id: int,
    page: int = 1,
    page_size: int = 20,
    status: TaskStatus = None,
) -> tuple[list[Task], int]:
    """
    Get all tasks for a user with optional filtering and pagination.

    SYSTEM DESIGN — Pagination:
    Never return ALL tasks at once — that breaks with 1000+ tasks.
    Pagination (page/page_size) limits DB load and response size.
    We return total count alongside results so the frontend can
    show "Page 1 of 10" style UI.
    """
    query = db.query(Task).filter(Task.user_id == user_id)

    # Optional status filter (e.g. only show planned tasks)
    if status:
        query = query.filter(Task.status == status)

    total = query.count()

    tasks = (
        query
        .order_by(desc(Task.created_at))        # Newest first
        .offset((page - 1) * page_size)         # Skip previous pages
        .limit(page_size)                        # Take only this page
        .all()
    )

    return tasks, total


def get_task_by_id(db: Session, task_id: int, user_id: int) -> Task:
    """
    Get a single task — enforces ownership.

    SECURITY NOTE — Ownership Check:
    We filter by BOTH task_id AND user_id.
    This prevents user A from accessing user B's tasks
    by guessing task IDs (IDOR — Insecure Direct Object Reference).
    """
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user_id         # Critical: ownership check
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return task


def update_task(db: Session, task_id: int, user_id: int, payload: TaskUpdate) -> Task:
    """
    Partial update — only updates fields that were actually sent.

    SYSTEM DESIGN — PATCH semantics:
    payload.model_dump(exclude_unset=True) only returns fields the client
    explicitly included in the request. Fields they didn't send are ignored.
    This means PATCH /tasks/1 {"title": "new"} only changes title,
    leaving all other fields untouched.
    """
    task = get_task_by_id(db, task_id, user_id)

    updates = payload.model_dump(exclude_unset=True)

    # Auto-set completed_at when status changes to completed
    if updates.get("status") == TaskStatus.completed and not task.completed_at:
        updates["completed_at"] = datetime.utcnow()

    for field, value in updates.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task_id: int, user_id: int) -> None:
    """
    Delete a task and all its subtasks.
    Subtasks are deleted automatically via cascade="all, delete-orphan"
    set in the Task model relationship — no manual cleanup needed.
    """
    task = get_task_by_id(db, task_id, user_id)
    db.delete(task)
    db.commit()


def complete_subtask(db: Session, task_id: int, subtask_id: int, user_id: int) -> Subtask:
    """
    Mark a subtask as completed.
    Verifies parent task ownership before touching the subtask.
    """
    # Verify user owns the parent task first
    get_task_by_id(db, task_id, user_id)

    subtask = db.query(Subtask).filter(
        Subtask.id == subtask_id,
        Subtask.task_id == task_id
    ).first()

    if not subtask:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subtask not found"
        )

    subtask.is_completed = True
    subtask.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(subtask)
    return subtask


def get_daily_capacity(db: Session, user: User) -> CapacityResponse:
    """
    Calculate real-time capacity and overcommitment detection.
    """
    prefs = user.preferences or {}
    work_hours = prefs.get("work_hours_per_day", 8)
    caution_threshold = prefs.get("alert_caution_threshold", 80)
    
    total_capacity_mins = int(work_hours * 60)
    
    # Get all planned tasks for this user
    # (Assuming planned tasks reflect today's queue as per current design)
    tasks = db.query(Task).filter(
        Task.user_id == user.id,
        Task.status == TaskStatus.planned
    ).all()
    
    planned_mins = int(sum(t.estimated_time or 0 for t in tasks))
    buffer_mins = max(0, total_capacity_mins - planned_mins)
    
    capacity_percent = 0
    if total_capacity_mins > 0:
        capacity_percent = int((planned_mins / total_capacity_mins) * 100)
        
    severity = "none"
    alert_message = None
    
    if capacity_percent > 120:
        severity = "critical"
        alert_message = "This week you're planning more work than available. This is a burnout risk pattern. Please defer tasks."
    elif capacity_percent > 100:
        severity = "warning"
        alert_message = f"You have {format(planned_mins/60, '.1f')} hours of tasks planned but only {work_hours} hours available. Recommend deferring tasks."
    elif capacity_percent >= caution_threshold:
        severity = "caution"
        alert_message = f"You're at {capacity_percent}% capacity. Consider moving one task to tomorrow."
        
    energy_budget = {}
    for t in tasks:
        t_type = t.task_type.value if t.task_type else "unknown"
        energy_budget[t_type] = energy_budget.get(t_type, 0) + int(t.estimated_time or 0)
        
    return CapacityResponse(
        total_capacity_mins=total_capacity_mins,
        planned_mins=planned_mins,
        buffer_mins=buffer_mins,
        capacity_percent=capacity_percent,
        severity=severity,
        alert_message=alert_message,
        energy_budget=energy_budget
    )