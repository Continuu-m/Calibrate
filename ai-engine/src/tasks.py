#CORE LOGIC

# src/tasks.py

from jinja2 import Environment, FileSystemLoader
from models import ModelTask

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
