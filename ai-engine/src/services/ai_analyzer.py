import json
from typing import List, Dict
from pydantic import BaseModel, parse_obj_as
from ..llm_client import GroqClient

class Subtask(BaseModel):
    id: int
    title: str
    description: str
    estimated_time_mins: int
    dependencies: list[int]
    type: str

class AIAnalyzer:
    def __init__(self):
        self.llm = GroqClient()

    def analyze_task(self, description: str) -> List[Dict]:
        system_prompt = """You are an expert project manager and productivity assistant.
Your job is to break down a user's task into manageable subtasks.
Output ONLY a valid JSON object with a single key "subtasks" containing an array of subtask objects.
Each subtask must conform to this schema:
{
  "id": integer (starting at 1),
  "title": string,
  "description": string (short actionable step),
  "estimated_time_mins": integer (realistic time estimate),
  "dependencies": array of integer ids (subtasks that must be completed before this one),
  "type": string (one of "creative", "analytical", "administrative", "collaborative")
}
"""
        
        user_prompt = f"Break down this task:\n{description}"
        
        result = self.llm.generate_json(system_prompt, user_prompt)
        
        # We can validate via pydantic if necessary, but returning dict is fine for now
        if "subtasks" in result:
            return result["subtasks"]
        return result
