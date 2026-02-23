# Import all models here so SQLAlchemy's Base.metadata knows about them.
# This is critical for Alembic migrations and Base.metadata.create_all() to work correctly.

from app.models.user import User
from app.models.task import Task, Subtask, TaskType, TaskPriority, TaskStatus
from app.models.prediction import Prediction, Actual
from app.models.user_pattern import UserPattern

__all__ = [
    "User",
    "Task",
    "Subtask",
    "TaskType",
    "TaskPriority",
    "TaskStatus",
    "Prediction",
    "Actual",
    "UserPattern",
]