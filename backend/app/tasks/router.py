"""
tasks/router.py — Task API Routes

SYSTEM DESIGN CONCEPT — RESTful Resource Design:
Routes follow REST conventions for predictable, standard API design:

  POST   /tasks              → create task
  GET    /tasks              → list all my tasks (paginated)
  GET    /tasks/{id}         → get one task
  PATCH  /tasks/{id}         → partial update
  DELETE /tasks/{id}         → delete task
  PATCH  /tasks/{id}/complete           → mark task complete
  PATCH  /tasks/{id}/subtasks/{sub_id}/complete → mark subtask complete

ALL routes use Depends(get_current_user) — every request must have
a valid JWT. Users can only ever see/modify their own tasks.

INTEGRATION POINT (from PRD):
Person 2 (frontend) calls these routes to build the UI.
Person 1 (ML) will add POST /tasks/{id}/predictions here later.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.database import get_db
from app.models.user import User
from app.models.task import TaskStatus
from app.auth.dependencies import get_current_user
from app.tasks import service
from app.tasks.schemas import (
    TaskCreate, TaskUpdate, TaskResponse, TaskListResponse, SubtaskResponse
)

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post("", response_model=TaskResponse, status_code=201)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new task (with optional subtasks).

    Example body:
    {
      "title": "Write project proposal",
      "priority": "high",
      "deadline": "2026-03-01T17:00:00",
      "estimated_time": 120,
      "subtasks": [
        {"description": "Research competitors", "estimated_time": 30},
        {"description": "Write first draft", "estimated_time": 60}
      ]
    }
    """
    return service.create_task(db, current_user.id, payload)


@router.get("", response_model=TaskListResponse)
def get_tasks(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    status: TaskStatus = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all tasks for the current user.

    Query params:
      ?page=1           → page number (default 1)
      ?page_size=20     → results per page (default 20, max 100)
      ?status=planned   → filter by status (optional)

    Example: GET /tasks?status=planned&page=1
    """
    tasks, total = service.get_tasks(
        db, current_user.id, page, page_size, status
    )
    return TaskListResponse(
        tasks=tasks,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a single task by ID. Returns 404 if not found or not yours."""
    return service.get_task_by_id(db, task_id, current_user.id)


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Partially update a task — only send fields you want to change.

    Example: change just the priority:
    PATCH /tasks/1
    {"priority": "urgent"}
    """
    return service.update_task(db, task_id, current_user.id, payload)


@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a task and all its subtasks.
    Returns 204 No Content on success (standard REST for delete).
    """
    service.delete_task(db, task_id, current_user.id)


@router.patch("/{task_id}/complete", response_model=TaskResponse)
def complete_task(
    task_id: int,
    actual_time: float = Query(description="How long it actually took (minutes)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mark a task as completed and log actual time spent.
    This feeds the ML learning system (Person 1's prediction accuracy tracker).

    Example: PATCH /tasks/1/complete?actual_time=95
    """
    payload = TaskUpdate(
        status=TaskStatus.completed,
        actual_time=actual_time,
        completed_at=datetime.utcnow()
    )
    return service.update_task(db, task_id, current_user.id, payload)


@router.patch("/{task_id}/subtasks/{subtask_id}/complete", response_model=SubtaskResponse)
def complete_subtask(
    task_id: int,
    subtask_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a single subtask as completed."""
    return service.complete_subtask(db, task_id, subtask_id, current_user.id)