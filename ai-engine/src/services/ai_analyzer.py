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
Your job is to break down a user's task into manageable subtasks with REALISTIC time estimates.

CRITICAL TIME ESTIMATION RULES:
- Quick tasks (like a presentation, demo, or meeting): Keep subtasks 2-5 minutes each
- Be AGGRESSIVE about reducing time - most tasks take less time than people think
- For "presentation" tasks: 5-15 min total ONLY (intro 2min, main content 8min, Q&A 5min)
- Do NOT bloat estimates - a 10-minute task should have 10-minute subtasks, not 30-60 min
- If total would exceed 30 minutes, you're estimating too high - revise downward

Output ONLY a valid JSON object with a single key "subtasks" containing an array of subtask objects.
Each subtask must conform to this schema:
{
  "id": integer (starting at 1),
  "title": string,
  "description": string (short actionable step),
  "estimated_time_mins": integer (realistic time estimate - be conservative),
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
