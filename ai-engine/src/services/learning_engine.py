#PRD 3.5
import json
import os
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
