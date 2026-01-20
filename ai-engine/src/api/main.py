 # uvicorn src.api.main:app


import json
import os
from pydantic import BaseModel, Field
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from typing import List, Dict, Any

def save_tasks(filename: str, tasks: List[Dict[str, Any]]) -> None:
    os.makedirs(os.path.dirname(filename) if os.path.dirname(filename) else '.', exist_ok=True)
    with open(filename, 'w') as f:
        json.dump(tasks, f, indent=4)

def load_tasks(filename: str) -> List[Dict[str, Any]]:
    if os.path.exists(filename):
        try:
            with open(filename, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return []
    return []

def add_task(tasks: List[Dict[str, Any]], description: str) -> None:
    task = {"description": description, "completed": False}
    tasks.append(task)

def view_tasks(tasks: List[Dict[str, Any]]) -> None:
    if not tasks:
        print("No tasks.")
        return
    for i, task in enumerate(tasks, 1):
        status = "✓" if task.get("completed") else "○"
        print(f"{i}. [{status}] {task['description']}")

def remove_task(tasks: List[Dict[str, Any]], index: int) -> Dict[str, Any] | None:
    if 0 <= index < len(tasks):
        return tasks.pop(index)
    return None

def mark_complete(tasks: List[Dict[str, Any]], index: int) -> bool:
    if 0 <= index < len(tasks):
        tasks[index]["completed"] = True
        return True
    return False

if __name__ == "__main__":
    tasks = load_tasks("../data/tasks.json")
    view_tasks(tasks)


class Subtask(BaseModel):
    id: int = Field(..., description="ID")
    description: str = Field(..., description="Subtask")
    type: str = Field(..., description="personal/technical/historical")

class Subtasks(BaseModel):
    subtasks: list[Subtask]

def detect_subtasks(task: str) -> list[Subtask]:
    llm = ChatGroq(model="llama3.1-8b-instant", groq_api_key=os.getenv("GROQ_API_KEY"))
    prompt = PromptTemplate.from_template(
        "Break '{task}' into 3-5 subtasks. Classify: personal/technical/historical. JSON only."
    )
    chain = prompt | llm.with_structured_output(Subtasks)
    result = chain.invoke({"task": task})
    return result.subtasks
def analyze_task(task: str) -> dict:
    subtasks = detect_subtasks(task)  # Your Groq LLM
    # PRD Time Prediction (3.2)
    times = predict_realistic_time(task, subtasks)  # New func
    return {
        "original": task,
        "subtasks": subtasks,
        "estimates": times,  # {best: "2h", realistic: "3.5h", worst: "5h"}
        "confidence": 0.78
    }

def predict_realistic_time(task: str, subtasks: list) -> dict:
    # PRD Factors: complexity, context switches, historical
    base_time = len(subtasks) * 30  # min/subtask
    realistic = base_time * 1.5 / 60  # hours +50% buffer
    return {"best": f"{base_time/60:.1f}h", "realistic": f"{realistic:.1f}h", "worst": f"{realistic*1.4:.1f}h"}
