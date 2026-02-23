from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Prediction(Base):
    """
    Stores every time the AI makes a time prediction for a task.
    Multiple predictions can exist per task (model improves over time).
    """
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)

    predicted_time = Column(Float, nullable=False)          # In minutes
    confidence = Column(Float, nullable=True)               # 0.0 to 1.0
    confidence_interval_low = Column(Float, nullable=True)  # Lower bound
    confidence_interval_high = Column(Float, nullable=True) # Upper bound

    model_version = Column(String, nullable=True)           # Track which model version made this
    prediction_basis = Column(String, nullable=True)        # e.g. "baseline", "personalized", "collaborative"

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    task = relationship("Task", back_populates="predictions")

    def __repr__(self):
        return f"<Prediction id={self.id} task_id={self.task_id} predicted={self.predicted_time}min confidence={self.confidence}>"


class Actual(Base):
    """
    Stores the real time a user spent on a task after completion.
    Separate from Task.actual_time so we can log multiple sessions.
    """
    __tablename__ = "actuals"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)

    actual_time = Column(Float, nullable=False)     # Minutes spent in this session
    completion_date = Column(DateTime(timezone=True), server_default=func.now())

    # User reflection
    user_notes = Column(Text, nullable=True)        # "What made it longer?"
    delay_reason = Column(String, nullable=True)    # e.g. "interruptions", "scope_creep", "underestimated"

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    task = relationship("Task", back_populates="actuals")

    def __repr__(self):
        return f"<Actual id={self.id} task_id={self.task_id} actual={self.actual_time}min>"