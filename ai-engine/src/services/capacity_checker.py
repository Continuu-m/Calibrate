#PRD 3.3


from jinja2 import Environment, FileSystemLoader
from models import ModelTask


class CapacityChecker:
    def __init__(self, prompts_dir: str = "../prompts"):
        self.env = Environment(loader=FileSystemLoader(prompts_dir))
        self.model_task = ModelTask(name="capacity")

    def check(self, task_desc: str, est_tokens: int, max_tokens: int = 8000) -> Dict:
        template = self.env.get_template("capacity_check.jinja")
        prompt = template.render(
            task_description=task_desc,
            estimated_tokens=est_tokens,
            max_tokens=max_tokens
        )
        result = self.model_task.run([{"prompt": prompt}])
        return {
            "can_handle": est_tokens <= max_tokens,
            "analysis": result[0]["prediction"]
        }
