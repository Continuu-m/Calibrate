from sqlalchemy import (
    Column, Integer, String, DateTime, Float,
    ForeignKey, Enum, Text, Boolean
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum


class TaskType(str, enum.Enum):
    creative = "creative"
    analytical = "analytical"
    administrative = "administrative"
    collaborative = "collaborative"
    unknown = "unknown"


class TaskPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"


class TaskStatus(str, enum.Enum):
    planned = "planned"
    in_progress = "in_progress"
    completed = "completed"
    deferred = "deferred"
    delegated = "delegated"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    # Classification
    task_type = Column(Enum(TaskType), default=TaskType.unknown)
    priority = Column(Enum(TaskPriority), default=TaskPriority.medium)
    status = Column(Enum(TaskStatus), default=TaskStatus.planned)

    # Time fields (all in minutes)
    estimated_time = Column(Float, nullable=True)       # AI best-guess
    optimistic_time = Column(Float, nullable=True)      # Best case
    realistic_time = Column(Float, nullable=True)       # Most likely
    pessimistic_time = Column(Float, nullable=True)     # Worst case
    actual_time = Column(Float, nullable=True)          # Logged on completion

    # Scheduling
    deadline = Column(DateTime(timezone=True), nullable=True)
    scheduled_date = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="tasks")
    subtasks = relationship("Subtask", back_populates="task", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="task", cascade="all, delete-orphan")
    actuals = relationship("Actual", back_populates="task", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Task id={self.id} title={self.title} status={self.status}>"


class Subtask(Base):
    __tablename__ = "subtasks"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)

    description = Column(String, nullable=False)
    estimated_time = Column(Float, nullable=True)   # In minutes
    order = Column(Integer, default=0)              # Display order
    is_completed = Column(Boolean, default=False)
    is_implicit = Column(Boolean, default=False)    # True if AI added it (user didn't mention it)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    task = relationship("Task", back_populates="subtasks")

    def __repr__(self):
        return f"<Subtask id={self.id} task_id={self.task_id} order={self.order}>"