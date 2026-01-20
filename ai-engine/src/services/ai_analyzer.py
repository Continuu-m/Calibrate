#Groq llm calls


from pydantic import BaseModel, Field
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
import os
from typing import List

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
    subtasks = detect_subtasks(task)
    times = predict_realistic_time(task, subtasks)
    return {
        "original": task,
        "subtasks": subtasks,
        "estimates": times,
        "confidence": 0.78
    }

def predict_realistic_time(task: str, subtasks: list) -> dict:
    base_time = len(subtasks) * 30  # min/subtask
    realistic = base_time * 1.5 / 60
    return {"best": f"{base_time/60:.1f}h", "realistic": f"{realistic:.1f}h", "worst": f"{realistic*1.4:.1f}h"}
