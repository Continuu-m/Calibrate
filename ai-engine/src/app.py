from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
from pathlib import Path

# Add src to path so we can import services
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.services.ai_analyzer import AIAnalyzer

app = FastAPI(title="Calibrate AI Engine", version="1.0.0")

# Allow requests from frontend
import os
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

analyzer = AIAnalyzer()

class AnalyzeRequest(BaseModel):
    task_description: str

@app.post("/api/v1/analyze")
async def analyze_task(request: AnalyzeRequest):
    try:
        subtasks = analyzer.analyze_task(request.task_description)
        
        # Calculate optimistic and worst case based on sum of realistic estimates
        total_realistic_mins = sum(handle_estimate(st.get("estimated_time_mins", 15)) for st in subtasks) if isinstance(subtasks, list) else 60
        
        return {
            "subtasks": subtasks,
            "estimates": {
                "realistic_mins": total_realistic_mins,
                "optimistic_mins": int(total_realistic_mins * 0.8),
                "worst_case_mins": int(total_realistic_mins * 1.5)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def handle_estimate(est):
    try:
        return int(est)
    except:
        return 30

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-engine"}
