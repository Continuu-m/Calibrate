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
from datetime import datetime, timedelta, timezone

from app.models.task import Task, Subtask, TaskStatus
from app.models.user import User
from app.tasks.schemas import TaskCreate, TaskUpdate, CapacityResponse, RedistributionSuggestion, RedistributionResponse


import httpx

def create_task(db: Session, user_id: int, payload: TaskCreate) -> Task:
    """
    Create a task and its subtasks in a single DB transaction.
    If subtasks are empty, we call the AI Engine running on port 8001
    to automatically generate them.
    """
    
    # 1. Attempt to call AI Engine if no subtasks provided
    if not payload.subtasks:
        try:
            # Note: in production this URL would be in an env var (e.g. AI_ENGINE_URL)
            ai_url = "http://localhost:8001/api/v1/analyze"
            with httpx.Client(timeout=10.0) as client:
                response = client.post(ai_url, json={"task_description": payload.title + " " + (payload.description or "")})
                if response.status_code == 200:
                    ai_data = response.json()
                    # Auto-fill subtasks from AI response
                    from app.tasks.schemas import SubtaskCreate
                    for st in ai_data.get("subtasks", []):
                        payload.subtasks.append(SubtaskCreate(
                            title=st.get("title"),
                            description=st.get("description", "Action step"),
                            estimated_time=st.get("estimated_time_mins", 15),
                            order=st.get("id", len(payload.subtasks) + 1)
                        ))
                    
                    # Auto-fill estimates from AI response if they were default
                    if not payload.estimated_time and ai_data.get("estimates"):
                        payload.estimated_time = ai_data["estimates"].get("realistic_mins")
                        payload.optimistic_time = ai_data["estimates"].get("optimistic_mins")
                        payload.realistic_time = ai_data["estimates"].get("realistic_mins")
                        payload.pessimistic_time = ai_data["estimates"].get("worst_case_mins")
                        
                    # Auto-fill task_type if AI provided one
                    if ai_data.get("subtasks") and len(ai_data["subtasks"]) > 0:
                        first_type = ai_data["subtasks"][0].get("type")
                        if first_type and payload.task_type.value == "unknown":
                            try:
                                from app.models.task import TaskType
                                payload.task_type = TaskType(first_type.lower())
                            except ValueError:
                                pass # ignore invalid enum values
        except Exception as e:
            # If AI engine is down, just proceed with creating the task without subtasks
            print(f"Warning: AI Engine unavailable: {e}")

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
    try:
        db.add(task)
        db.flush()  # Gets task.id from DB without committing yet

        # Create subtasks linked to this task
        for subtask_data in payload.subtasks:
            subtask = Subtask(
                task_id=task.id,
                title=subtask_data.title,
                description=subtask_data.description,
                estimated_time=subtask_data.estimated_time,
                order=subtask_data.order,
            )
            db.add(subtask)

        db.commit()
        db.refresh(task)
        return task
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create task and subtasks."
        )


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
    from sqlalchemy.orm import joinedload
    query = db.query(Task).filter(Task.user_id == user_id).options(joinedload(Task.subtasks))

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
    from sqlalchemy.orm import joinedload
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user_id         # Critical: ownership check
    ).options(joinedload(Task.subtasks)).first()

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

    try:
        for field, value in updates.items():
            setattr(task, field, value)

        db.commit()
        db.refresh(task)
        return task
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update task."
        )


def delete_task(db: Session, task_id: int, user_id: int) -> None:
    """
    Delete a task and all its subtasks.
    Subtasks are deleted automatically via cascade="all, delete-orphan"
    set in the Task model relationship — no manual cleanup needed.
    """
    task = get_task_by_id(db, task_id, user_id)
    try:
        db.delete(task)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete task."
        )


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

    try:
        subtask.is_completed = True
        # subtask.completed_at = datetime.utcnow()
        db.commit()
        db.refresh(subtask)
        return subtask
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to complete subtask."
        )


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
    
    # ─── 💡 Context Switching Penalties ──────────────────────────────────────────
    # 15 minutes of "lost time" for every task scheduled after their 4th task of the day.
    context_switch_penalty_mins = max(0, len(tasks) - 4) * 15
    
    # ─── 📆 Meeting Recovery Buffer ──────────────────────────────────────────────
    # 30 minutes for every external meeting (via Calendar sync).
    meeting_recovery_mins = 0
    meetings_count = 0
    
    if user.google_calendar_connected and user.google_access_token:
        try:
            from app.integrations.google_calendar import get_calendar_service
            import datetime as dt
            
            # Build the calendar client
            service = get_calendar_service(user.google_access_token, user.google_refresh_token)
            
            # Time bounds for "today" in UTC
            now = dt.datetime.utcnow()
            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat() + 'Z'
            today_end = now.replace(hour=23, minute=59, second=59, microsecond=0).isoformat() + 'Z'
            
            # Query the user's schedule for today
            events_result = service.events().list(
                calendarId='primary', timeMin=today_start, timeMax=today_end,
                singleEvents=True, orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            
            # Optionally: we could also add the exact length of the meeting to "planned_mins".
            # For now, we are at least adding the 30-minute recovery penalty per meeting.
            meetings_count = len(events)
            
        except Exception as e:
            print(f"Warning: Failed to fetch calendar events for user {user.id}: {e}")
            
    meeting_recovery_mins = meetings_count * 30
    
    # Total dynamically reduced time
    total_used_mins = planned_mins + context_switch_penalty_mins + meeting_recovery_mins
    
    buffer_mins = max(0, total_capacity_mins - total_used_mins)
    
    capacity_percent = 0
    if total_capacity_mins > 0:
        capacity_percent = int((total_used_mins / total_capacity_mins) * 100)
        
    severity = "none"
    alert_message = None
    
    if capacity_percent > 120:
        severity = "critical"
        alert_message = "This week you're planning more work than available. This is a burnout risk pattern. Please defer tasks."
    elif capacity_percent > 100:
        severity = "warning"
        alert_message = f"You have {format(total_used_mins/60, '.1f')} hours of commitments (tasks + meetings + penalties) but only {work_hours} hours available. Recommend deferring tasks."
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
        context_switch_penalty_mins=context_switch_penalty_mins,
        meeting_recovery_mins=meeting_recovery_mins,
        buffer_mins=buffer_mins,
        capacity_percent=capacity_percent,
        severity=severity,
        alert_message=alert_message,
        energy_budget=energy_budget
    )


def suggest_redistribution(db: Session, user: User) -> RedistributionResponse:
    """
    Greedy weekly load-balancing algorithm.

    ALGORITHM:
    1. Load all non-completed tasks that have a scheduled_date in the next 7 days.
    2. Group tasks by calendar date and compute each day's capacity usage.
    3. Classify days as 'overloaded' (> caution_threshold%) or 'light' (< 50%).
    4. For each overloaded day, sort tasks by estimated_time DESC and try to
       move the largest tasks to the lightest available non-weekend day that
       has enough headroom without itself becoming overloaded.
    5. Return suggestions (read-only — this never writes to the DB).

    Tasks without a scheduled_date (floating tasks) are skipped because they
    don't belong to a specific day.
    """
    prefs = user.preferences or {}
    work_hours = prefs.get("work_hours_per_day", 8)
    caution_threshold = prefs.get("alert_caution_threshold", 80) / 100.0
    base_mins = float(work_hours * 60)

    # ── 1. Build a 7-day window (today → today+6) ─────────────────────────────
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    window = [today + timedelta(days=i) for i in range(7)]
    window_start = window[0]
    window_end = window[-1] + timedelta(days=1)

    # ── 2. Fetch tasks that fall within the 7-day window ──────────────────────
    tasks = db.query(Task).filter(
        Task.user_id == user.id,
        Task.status != TaskStatus.completed,
        Task.scheduled_date.isnot(None),
        Task.scheduled_date >= window_start,
        Task.scheduled_date < window_end,
    ).all()

    # ── 3. Group tasks by date and compute initial loads ──────────────────────
    # day_loads: {date_str -> {"used_mins": float, "tasks": [task]}}
    day_loads: dict[str, dict] = {}
    for day in window:
        day_loads[day.strftime("%Y-%m-%d")] = {"used_mins": 0.0, "tasks": []}

    for task in tasks:
        # Normalise to UTC date
        sched = task.scheduled_date
        if sched.tzinfo is None:
            sched = sched.replace(tzinfo=timezone.utc)
        day_key = sched.strftime("%Y-%m-%d")
        if day_key in day_loads:
            day_loads[day_key]["tasks"].append(task)
            day_loads[day_key]["used_mins"] += float(task.estimated_time or 0)

    # ── 4. Classify days ──────────────────────────────────────────────────────
    def is_weekend(date_str: str) -> bool:
        return datetime.strptime(date_str, "%Y-%m-%d").weekday() >= 5  # Sat=5, Sun=6

    overloaded_days = [
        d for d, info in day_loads.items()
        if base_mins > 0 and (info["used_mins"] / base_mins) > caution_threshold
        and not is_weekend(d)
    ]
    light_days = [
        d for d, info in day_loads.items()
        if base_mins > 0 and (info["used_mins"] / base_mins) < 0.5
        and not is_weekend(d)
    ]

    # ── 5. Greedy moves ───────────────────────────────────────────────────────
    suggestions: list[RedistributionSuggestion] = []

    for from_date in sorted(overloaded_days):
        # Sort tasks on this day largest-first — move the heaviest tasks first
        candidates = sorted(
            day_loads[from_date]["tasks"],
            key=lambda t: float(t.estimated_time or 0),
            reverse=True,
        )

        for task in candidates:
            task_mins = float(task.estimated_time or 0)
            if task_mins == 0:
                continue

            # Find the lightest non-overloaded target day (sorted by load asc)
            light_days_sorted = sorted(
                light_days,
                key=lambda d: day_loads[d]["used_mins"]
            )

            moved = False
            for to_date in light_days_sorted:
                if to_date == from_date:
                    continue

                target_after = day_loads[to_date]["used_mins"] + task_mins
                # Accept if the target day stays under the caution threshold
                if target_after / base_mins <= caution_threshold:
                    # Apply the simulated move (in-memory only)
                    day_loads[from_date]["used_mins"] -= task_mins
                    day_loads[to_date]["used_mins"] += task_mins

                    suggestions.append(RedistributionSuggestion(
                        task_id=task.id,
                        task_title=task.title,
                        from_date=from_date,
                        to_date=to_date,
                        estimated_mins=task_mins,
                    ))
                    moved = True

                    # Re-check whether target is still a light day after the move
                    if (day_loads[to_date]["used_mins"] / base_mins) >= 0.5:
                        light_days = [d for d in light_days if d != to_date]
                    break

            # Stop suggesting from this day if it's no longer overloaded
            if base_mins > 0 and day_loads[from_date]["used_mins"] / base_mins <= caution_threshold:
                break

    # ── 6. Build response message ─────────────────────────────────────────────
    if not suggestions:
        msg = "Your week looks well-balanced — no redistribution needed!"
    elif len(suggestions) == 1:
        msg = "1 task can be redistributed to better balance your week."
    else:
        msg = f"{len(suggestions)} tasks can be redistributed to better balance your week."

    return RedistributionResponse(suggestions=suggestions, message=msg)