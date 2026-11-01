from typing import Optional, List
from sqlmodel import SQLModel, Field
from datetime import datetime

class UserProfile(SQLModel, table=True):
    __tablename__ = "user_profile"
    id: str = Field(primary_key=True)
    full_name: str = Field(default="Student")
    email: Optional[str] = Field(default="")
    grade_stream: str = Field(default="Class 11 Science")
    focus_span_minutes: int = Field(default=45)
    school_start_time: str = Field(default="08:00")
    school_end_time: str = Field(default="15:00")
    sleep_start_time: str = Field(default="23:00")
    peak_energy: str = Field(default="Late Night") # "Morning" or "Late Night"
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class PlannerTask(SQLModel, table=True):
    __tablename__ = "planner_task"
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: str = Field(index=True)
    topic_name: str
    scheduled_date: str = Field(index=True) # YYYY-MM-DD
    duration_minutes: int = Field(default=45)
    is_completed: bool = Field(default=False)
    is_missed: bool = Field(default=False)

class FlashcardSet(SQLModel, table=True):
    __tablename__ = "flashcard_set"
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: str = Field(index=True)
    topic: str
    image_path: Optional[str] = Field(default=None)
    cards_json: str # JSON array of [{"front": "...", "back": "..."}]
    next_review_date: str = Field(default_factory=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    srs_interval: int = Field(default=1) # 1, 3, or 7
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class SkillNode(SQLModel, table=True):
    __tablename__ = "skill_node"
    id: str = Field(primary_key=True)
    track: str = Field(index=True) # "Web Development", "NEET Biology", "Financial Accounting", etc.
    title: str
    level_order: int
    is_unlocked: bool = Field(default=False)
    quiz_json: str # JSON array of at least 10 MCQs

class StudyRoom(SQLModel, table=True):
    __tablename__ = "study_room"
    id: Optional[int] = Field(default=None, primary_key=True)
    room_code: str = Field(index=True)
    student_id: str = Field(index=True)
    student_name: Optional[str] = Field(default="Scholar")
    tasks_completed_count: int = Field(default=0)
    last_active: str = Field(default_factory=lambda: datetime.utcnow().strftime("%Y-%m-%d %H:%M"))
