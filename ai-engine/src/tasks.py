#CORE LOGIC

# src/tasks.py

from jinja2 import Environment, FileSystemLoader
from models import ModelTask
from services import AIAnalyzer, CapacityChecker
from data.persistence import load_tasks, save_tasks

analyser = AIAnalyzer()
subtasks=analyser.analyze_task("Analyse data")

checker=CapacityChecker()
capacity=checker.check("Complex Task", 5000)

analyzer = AIAnalyzer()
checker = CapacityChecker()

def detect_subtasks(task: str):
    return analyzer.analyze_task(task)

def calculate_capacity(tasks: list):
    total_h = sum(t.get("est_hours", 1) for t in tasks if not t.get("complete"))
    return total_h  # checker.check() for AI boost

def detect_overcommitment(tasks: list):
    cap = calculate_capacity(tasks)
    if cap > 8:
        return {"excess": cap - 8, "recommendations": ["Prioritize"]}
    return None

class AgentTasks:
    def __init__(self):
        self.prompts_dir = "../prompts"
        self.env = Environment(loader=FileSystemLoader(self.prompts_dir))
        self.model_task = ModelTask(...)  # Init your model

    def calibrate(self, model_name: str, samples: list):
        template = self.env.get_template("calib.jinja")
        prompt = template.render(model_name=model_name, calibration_samples=samples)
        return self.model_task.run([{"prompt": prompt}])

    def capacity_check(self, task_desc: str, tokens: int):
        template = self.env.get_template("capacity_check.jinja")
        prompt = template.render(task_description=task_desc, estimated_tokens=tokens)
        return self.model_task.run([{"prompt": prompt}])

    def breakdown(self, main_task: str):
        template = self.env.get_template("task_breakdown.jinja")
        prompt = template.render(main_task=main_task)
        return self.model_task.run([{"prompt": prompt}])
