# 🎯 Calibrate: AI-Powered Reality Checker

Calibrate is a premium, AI-driven task management ecosystem designed to protect your time and prevent burnout. Unlike traditional todo lists, Calibrate uses a **Reality Checker** engine to measure your capacity, predict task durations, and learn from your actual performance patterns.

![Calibrate Dashboard](https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=2072&auto=format&fit=crop)

## ✨ Core Features

### 🧠 The Intelligence Engine (AI/ML)
*   **Task Auto-Breakdown**: Converts vague intents into 5-7 actionable, bite-sized subtasks using high-speed LLMs (Groq/Llama 3).
*   **Three-Point Estimation**: Generates *Optimistic*, *Realistic*, and *Pessimistic* time predictions for every task.
*   **Pattern Recognition**: Automatically detects systematic biases (e.g., "You tend to underestimate Design tasks by 35%") and adjusts future estimates.
*   **Natural Language parsing**: Extracts intent and complexity directly from simple task descriptions.

### 📊 Capacity & Planning
*   **Real-time Capacity Meter**: A dynamic gauge that tracks your used mins vs. available hours, accounting for meetings and context-switching penalties.
*   **Suggest Redistribution**: A greedy load-balancing algorithm that identifies overloaded days and suggests optimal moves to balance your week.
*   **Weekly Heatmap**: A 7-day visualization of your commitments and available "focus blocks."
*   **Google Calendar Sync**: Native OAuth integration to import meetings and automatically subtract recovery time from your daily budget.

### 📈 Performance Insights
*   **Accuracy Trends**: A 7-day rolling chart of your "Estimation Accuracy" (Actual vs. Predicted time).
*   **Focus Analytics**: Tracks total focus hours, completed wins, and behavioral patterns.
*   **Task Reflection**: A structured post-game for your tasks—log actual time spent and note what caused delays to train the local calibration model.
*   **Completed History**: A chronological log of your past accomplishments grouped by date.

## 🏗️ Technical Architecture

Calibrate is built as a highly decoupled micro-service environment for maximum performance and isolation:

| Service | Port | Tech Stack | Responsibility |
| :--- | :--- | :--- | :--- |
| **Frontend** | 5173 | React, Vite, Tailwind, Recharts | Premium UI, Data Viz, State Mgmt |
| **Backend** | 8000 | FastAPI, PostgreSQL, SQLAlchemy | Auth, Business Logic, Capacity Engine |
| **AI Engine** | 8001 | FastAPI, Groq (Llama 3), Pydantic | LLM Orchestration, NLP, Estimation |

### 🛠️ Key Technologies
*   **Frontend**: React 18, Vite, Tailwind CSS, Recharts (Data Viz)
*   **Backend**: Python 3.11+, FastAPI, PostgreSQL (Neon), JWT Auth
*   **AI**: Groq Cloud API, Llama-3-8B/70B
*   **Infrastructure**: Decoupled service architecture, RESTful API design

## 🚀 Getting Started

### 1. Prerequisites
*   Node.js (v18+)
*   Python (v3.11+)
*   PostgreSQL Database
*   Groq API Key (for the AI Engine)

### 2. Environment Setup
Create `.env` files in each service directory (see `.env.example` in each folder for details).

### 3. Run the Services
We recommend running each in a separate terminal:

```bash
# Terminal 1: AI Engine
cd ai-engine && uvicorn src.app:app --port 8001 --reload

# Terminal 2: Backend
cd backend && uvicorn app.main:app --reload

# Terminal 3: Frontend
cd frontend && npm run dev
```

---
*Developed with focus and precision to help you win your day.*