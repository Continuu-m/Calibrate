from jinja2 import Environment, FileSystemLoader
from models import ModelTask
from typing import List, Dict


class AIAnalyzer:
    def __init__(self, prompts_dir: str = "../prompts"):
        self.env = Environment(loader=FileSystemLoader(prompts_dir))
        self.model_task = ModelTask(name="analyzer")  # Your model setup

    def analyze_task(self, description: str) -> List[Dict]:
        template = self.env.get_template("task_breakdown.jinja")
        prompt = template.render(main_task=description)
        result = self.model_task.run([{"prompt": prompt}])
        return self._parse_subtasks(result[0]["prediction"])

    def _parse_subtasks(self, output: str) -> List[Dict]:
        # TODO: JSON/logit parser for subtasks
        return [{"id": 1, "desc": "Placeholder", "type": "action"}]
