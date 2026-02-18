from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.db.database import engine, Base, SessionLocal
from app.models.task import Task

app = FastAPI()


Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/getdb")
def db_test(db: Session = Depends(get_db)):
  
    tasks = db.query(Task).all()
    return {"status": "ok", "tasks": tasks}

@app.get('/')
def health():
    return {"Status": "Ok"}


@app.post("/tasks")
def create_task(title: str, description: str, db: Session = Depends(get_db)):
    new_task = Task(title=title, description=description)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task
