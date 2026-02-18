from sqlalchemy import Column, Integer, String
from app.db.database import Base  # Changed from base to Base

class Task(Base):  # Changed from base to Base
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)