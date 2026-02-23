"""
tasks/schemas.py — Task Request & Response Contracts

SYSTEM DESIGN CONCEPT — Input Validation Layer:
Pydantic schemas act as a validation firewall between the internet and your DB.
Every field has a type, and optional fields have defaults.
FastAPI rejects malformed requests BEFORE they reach your route logic.

We have 3 schemas per resource (standard REST pattern):
  - CreateSchema   → what you send to CREATE (no id, no timestamps)
  - UpdateSchema   → what you send to UPDATE (all fields optional)
  - ResponseSchema → what you GET back (includes id, timestamps)
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.task import TaskType, TaskPriority, TaskStatus


# ─── Subtask Schemas ──────────────────────────────────────────────────────────

class SubtaskCreate(BaseModel):
    description: str
    estimated_time: Optional[float] = None  # minutes
    order: int = 0


class SubtaskResponse(BaseModel):
    id: int
    description: str
    estimated_time: Optional[float]
    order: int
    is_completed: bool
    is_implicit: bool
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Task Schemas ─────────────────────────────────────────────────────────────

class TaskCreate(BaseModel):
    """What the client sends to create a task."""
    title: str
    description: Optional[str] = None
    task_type: TaskType = TaskType.unknown
    priority: TaskPriority = TaskPriority.medium
    deadline: Optional[datetime] = None
    scheduled_date: Optional[datetime] = None
    estimated_time: Optional[float] = None      # minutes
    optimistic_time: Optional[float] = None
    realistic_time: Optional[float] = None
    pessimistic_time: Optional[float] = None
    subtasks: list[SubtaskCreate] = []          # Can include subtasks on creation


class TaskUpdate(BaseModel):
    """
    All fields optional — client only sends what they want to change.
    This is a PATCH-style update (partial update).
    """
    title: Optional[str] = None
    description: Optional[str] = None
    task_type: Optional[TaskType] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    deadline: Optional[datetime] = None
    scheduled_date: Optional[datetime] = None
    estimated_time: Optional[float] = None
    optimistic_time: Optional[float] = None
    realistic_time: Optional[float] = None
    pessimistic_time: Optional[float] = None
    actual_time: Optional[float] = None         # Logged when task is completed


class TaskResponse(BaseModel):
    """Full task object returned to the client."""
    id: int
    user_id: int
    title: str
    description: Optional[str]
    task_type: TaskType
    priority: TaskPriority
    status: TaskStatus
    estimated_time: Optional[float]
    optimistic_time: Optional[float]
    realistic_time: Optional[float]
    pessimistic_time: Optional[float]
    actual_time: Optional[float]
    deadline: Optional[datetime]
    scheduled_date: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    subtasks: list[SubtaskResponse] = []        # Always include subtasks in response

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    """Paginated list of tasks."""
    tasks: list[TaskResponse]
    total: int
    page: int
    page_size: int