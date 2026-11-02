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
    xp: int = Field(default=0)
    level: int = Field(default=1)
    badges_json: str = Field(default="[]") # JSON list of unlocked badges
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class PlannerTask(SQLModel, table=True):
    __tablename__ = "planner_task"
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: str = Field(index=True)
    topic_name: str
    subject: str = Field(default="General", index=True) # Mathematics, Physics, Chemistry, Biology, Computer Science, Economics/Management, General
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
    is_completed: bool = Field(default=False)
    quiz_json: str # JSON array of at least 10 MCQs

class StudyRoom(SQLModel, table=True):
    __tablename__ = "study_room"
    id: Optional[int] = Field(default=None, primary_key=True)
    room_code: str = Field(index=True)
    student_id: str = Field(index=True)
    student_name: Optional[str] = Field(default="Scholar")
    tasks_completed_count: int = Field(default=0)
    last_active: str = Field(default_factory=lambda: datetime.utcnow().strftime("%Y-%m-%d %H:%M"))

class StudySquad(SQLModel, table=True):
    __tablename__ = "study_squad"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    invite_code: str = Field(index=True, unique=True)
    created_by: str = Field(index=True)
    description: Optional[str] = Field(default="")
    member_count: int = Field(default=1)
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class SquadMember(SQLModel, table=True):
    __tablename__ = "squad_member"
    id: Optional[int] = Field(default=None, primary_key=True)
    squad_id: int = Field(index=True)
    student_id: str = Field(index=True)
    student_name: str = Field(default="Scholar")
    joined_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class SquadFeedItem(SQLModel, table=True):
    __tablename__ = "squad_feed_item"
    id: Optional[int] = Field(default=None, primary_key=True)
    squad_id: int = Field(index=True)
    student_id: str = Field(index=True)
    student_name: str
    event_type: str = Field(default="task_completed") # task_completed, streak_milestone, level_up, cheer
    message: str
    reactions_json: str = Field(default='{"🔥": 0, "👏": 0, "🎯": 0}')
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class CareerGuidanceSession(SQLModel, table=True):
    __tablename__ = "career_guidance_session"
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: str = Field(index=True)
    stream_track: str = Field(index=True) # Tech, Medical, Management
    query: str
    ai_response_json: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
