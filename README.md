# Calibrate

Calibrate is a modern, AI-powered task management application designed to protect your time and prevent burnout through realistic time estimation and capacity tracking. 

## What's Built

### Frontend (React + Vite + TailwindCSS)
- **Responsive UI**: A beautiful, modern interface with support for dark mode.
- **Daily Dashboard**: View tasks and a real-time capacity meter.
- **Weekly Capacity Planning**: A 7-day grid view with drag-and-drop task rescheduling.
- **Task Management**: Interactive modals to add and edit tasks with your own optimistic or realistic estimates.
- **AI Breakdown Integration**: Generate subtasks and accurate time estimates directly from the Add Task modal using the AI Engine.

### Backend Application (FastAPI + PostgreSQL)
- **User Authentication**: Secure JWT-based login, registration, and session management.
- **Task Services**: Full CRUD REST APIs for managing tasks and nested subtasks.
- **Automatic AI Delegation**: Secretly fetches subtasks from the AI Engine if a user adds a vague task without explicitly hitting generate.
- **Capacity Calculator Engine**: Dynamic algorithmic tracking of used capacity vs available hours, identifying planned overcommitments and generating real-time suggestions to prevent burnout.
- **Suggest Redistribution System**: A greedy load-balancing algorithm that looks at your 7-day task schedule and suggests how to move loaded tasks to lighter days.

### AI Engine (FastAPI + Groq)
- **Task Analysis (NLP)**: A flexible decoupled micro-service leveraging Groq's high-speed LLM (`llama-3.1-8b-instant`) to parse natural language tasks.
- **Granular Subtasking**: Converts a single task intent into sequential, bite-sized subtasks.
- **Time Prediction**: Generates realistic time limits based on accumulated predicted subtask timings (best case, realistic case, and worst case constraints).

## Architecture

Calibrate operates natively as a decoupled micro-service environment:
- `frontend/`: Port 5173 (Vite Server)
- `backend/`: Port 8000 (Main FastAPI Server handling Database & Auth)
- `ai-engine/`: Port 8001 (FastAPI Server handling LLM operations)

*More features and deeper integrations are currently in active development.*