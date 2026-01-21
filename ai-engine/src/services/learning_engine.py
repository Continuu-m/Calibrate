#PRD 3.5

from jinja2 import Environment, FileSystemLoader
from models import ModelTask
from typing import List


class LearningEngine:
    def __init__(self, prompts_dir: str = "../prompts"):
        self.env = Environment(loader=FileSystemLoader(prompts_dir))
        self.model_task = ModelTask(name="learning")
        self.performance_log = []  # Persist to data/

    def calibrate(self, samples: List[Dict]) -> str:
        template = self.env.get_template("calib.jinja")
        prompt = template.render(
            model_name="agent",
            calibration_samples=samples,
            expected_style="accurate subtasks"
        )
        result = self.model_task.run([{"prompt": prompt}])
        self.performance_log.append(result)
        return result[0]["prediction"]
