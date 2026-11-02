import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import init_db, engine
from seed_data import seed_database
from sqlmodel import Session

from routers import planner, doubts, youtube, teacher, skills, analytics, squads, leaderboard, counsellor

# Create upload directories if not already created
BASE_DIR = Path(__file__).resolve().parent
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
(UPLOADS_DIR / "questions").mkdir(parents=True, exist_ok=True)
(UPLOADS_DIR / "audio").mkdir(parents=True, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite tables and populate seed data
    init_db()
    with Session(engine) as session:
        seed_database(session)
    yield

app = FastAPI(
    title="AI Study & Career Buddy API",
    description="Principal Full-Stack AI Academic Assistant for Class 6 to 3rd-Year UG across Science, Commerce, Arts, Medical, and Tech streams.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount StaticFiles for uploaded questions and generated audio
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Include Routers
app.include_router(planner.router)
app.include_router(doubts.router)
app.include_router(youtube.router)
app.include_router(teacher.router)
app.include_router(skills.router)
app.include_router(analytics.router)
app.include_router(squads.router)
app.include_router(leaderboard.router)
app.include_router(counsellor.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "AI Study & Career Buddy API",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

