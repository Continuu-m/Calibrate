from fastapi import FastAPI, Depends, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.db.database import engine, get_db, Base
from app.models import *  # Registers all models with Base.metadata
from app.auth.router import router as auth_router
from app.tasks.router import router as tasks_router
from app.limiter import limiter
from app.scheduler import setup_scheduler, shutdown_scheduler
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    setup_scheduler()
    yield
    # Shutdown
    shutdown_scheduler()

limiter = limiter
app = FastAPI(
    title="Calibrate API",
    version="0.1.0",
    description="Task Reality Checker — AI-powered time estimation",
    lifespan=lifespan
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    return JSONResponse(
        status_code=500,
        content={"detail": "Database error occurred", "message": str(exc)},
    )

from fastapi import HTTPException

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        # Let FastAPI's default handler deal with HTTP Exceptions
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
        
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred", "message": str(exc)},
    )

app.add_middleware(SlowAPIMiddleware)

# ─── CORS Configuration ──────────────────────────────────────────────────────
# Allows the frontend to communicate with the backend across different ports.
# In production, specify the actual domain instead of "*"
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create all DB tables on startup
# In production: switch to Alembic migrations
# Base.metadata.create_all(bind=engine)

# ─── Register Routers ─────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(tasks_router)


# ─── Health Routes ────────────────────────────────────────────────────────────

@app.get("/")
def health():
    return {"status": "ok"}


@app.get("/ping-db")
def ping_db(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"db": "connected"}