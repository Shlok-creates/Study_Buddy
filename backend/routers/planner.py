import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from database import get_session
from models import UserProfile, PlannerTask, SquadMember, SquadFeedItem
from services.groq_service import generate_planner_roadmap
from services.gamification_service import classify_topic_subject, award_xp

router = APIRouter(prefix="/api", tags=["Planner & Onboarding"])

class ProfileUpdateRequest(BaseModel):
    id: Optional[str] = None
    full_name: Optional[str] = "Student"
    email: Optional[str] = ""
    grade_stream: str = "Class 11-12 Science (PCM/JEE)"
    focus_span_minutes: int = 45
    school_start_time: str = "08:00"
    school_end_time: str = "15:00"
    sleep_start_time: str = "23:00"
    peak_energy: str = "Late Night"

class StudentLoginRequest(BaseModel):
    identifier: str # Email or Full Name

class GenerateRoadmapRequest(BaseModel):
    student_id: str
    target_goal: str
    deadline_date: str
    daily_hours: float = 2.5

class ToggleTaskRequest(BaseModel):
    is_completed: Optional[bool] = None

@router.get("/onboarding/profile/{student_id}")
def get_user_profile(student_id: str, session: Session = Depends(get_session)):
    profile = session.exec(select(UserProfile).where(UserProfile.id == student_id)).first()
    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found. Please complete onboarding or log in."
        )
    return profile

@router.post("/onboarding/login")
def login_student_profile(req: StudentLoginRequest, session: Session = Depends(get_session)):
    ident = req.identifier.strip()
    if not ident:
        raise HTTPException(status_code=400, detail="Please enter your email or full name to log in.")
    
    # 1. First search by exact match or substring
    profile = session.exec(
        select(UserProfile).where(
            (UserProfile.email.ilike(ident)) |
            (UserProfile.full_name.ilike(ident)) |
            (UserProfile.email.ilike(f"%{ident}%")) |
            (UserProfile.full_name.ilike(f"%{ident}%"))
        )
    ).first()

    # 2. Safety: If not found, immediately create profile so demo/submission is never blocked
    if not profile:
        clean_name = ident.split("@")[0].strip().title()
        user_id = f"user-{uuid.uuid4().hex[:12]}"
        profile = UserProfile(
            id=user_id,
            full_name=clean_name,
            email=ident if "@" in ident else "",
            grade_stream="UG 1st Year B.Tech / Engineering",
            focus_span_minutes=45,
            school_start_time="08:00",
            school_end_time="14:30",
            sleep_start_time="23:30",
            peak_energy="Late Night"
        )
        session.add(profile)
        session.commit()
        session.refresh(profile)

    return {
        "message": f"Welcome back, {profile.full_name}!",
        "user_id": profile.id,
        "profile": profile
    }

@router.post("/onboarding/profile")
def save_or_update_profile(req: ProfileUpdateRequest, session: Session = Depends(get_session)):
    user_id = req.id if req.id and req.id.strip() else f"user-{uuid.uuid4().hex[:12]}"
    profile = session.exec(select(UserProfile).where(UserProfile.id == user_id)).first()
    
    if not profile:
        profile = UserProfile(id=user_id)

    profile.full_name = req.full_name or profile.full_name or "Scholar"
    profile.email = req.email or profile.email or ""
    profile.grade_stream = req.grade_stream
    profile.focus_span_minutes = req.focus_span_minutes
    profile.school_start_time = req.school_start_time
    profile.school_end_time = req.school_end_time
    profile.sleep_start_time = req.sleep_start_time
    profile.peak_energy = req.peak_energy

    session.add(profile)
    session.commit()
    session.refresh(profile)
    return {
        "message": "Profile saved successfully",
        "user_id": profile.id,
        "profile": profile
    }

@router.get("/planner/tasks/{student_id}")
def get_student_tasks(student_id: str, session: Session = Depends(get_session)):
    tasks = session.exec(
        select(PlannerTask)
        .where(PlannerTask.student_id == student_id)
        .order_by(PlannerTask.scheduled_date.asc(), PlannerTask.id.asc())
    ).all()
    return tasks

@router.post("/planner/generate")
def generate_schedule(req: GenerateRoadmapRequest, session: Session = Depends(get_session)):
    if not req.target_goal or not req.target_goal.strip():
        raise HTTPException(status_code=400, detail="Target goal is required")

    profile = session.exec(select(UserProfile).where(UserProfile.id == req.student_id)).first()
    profile_dict = profile.model_dump() if profile else {
        "grade_stream": "General Academic",
        "focus_span_minutes": 45,
        "school_start_time": "08:00",
        "school_end_time": "15:00",
        "sleep_start_time": "23:00",
        "peak_energy": "Late Night"
    }

    # 1. FIX TASK DUPLICATION: Delete previous uncompleted tasks for this plan/topic
    import re
    goal_clean = req.target_goal.strip()
    goal_lower = goal_clean.lower()
    keywords = [w.lower() for w in re.split(r'[\s&,:-]+', goal_clean) if len(w) >= 3]

    existing_uncompleted = session.exec(
        select(PlannerTask).where(
            PlannerTask.student_id == req.student_id,
            PlannerTask.is_completed == False
        )
    ).all()

    deleted_duplicates_count = 0
    for t in existing_uncompleted:
        t_lower = t.topic_name.lower()
        # Match exact goal, prefix, or major keywords
        if (
            goal_lower in t_lower or
            t_lower.startswith(goal_lower[:8]) or
            (len(keywords) > 0 and sum(1 for kw in keywords if kw in t_lower) >= max(1, len(keywords) // 2))
        ):
            session.delete(t)
            deleted_duplicates_count += 1

    if deleted_duplicates_count > 0:
        session.commit()

    # 2. Generate roadmap strictly tailored to target_goal
    raw_tasks = generate_planner_roadmap(
        target_goal=req.target_goal.strip(),
        deadline_date=req.deadline_date,
        daily_hours=req.daily_hours,
        user_profile=profile_dict
    )

    created_tasks = []
    for item in raw_tasks:
        scheduled_date = item.get("scheduled_date") or item.get("date") or datetime.utcnow().strftime("%Y-%m-%d")
        raw_topic = item.get("topic_name") or item.get("topic") or "Study Sprint"
        if not raw_topic.lower().startswith(goal_lower[:8]) and not goal_lower in raw_topic.lower():
            topic_name = f"{goal_clean}: {raw_topic}"
        else:
            topic_name = raw_topic

        duration = int(item.get("duration_minutes") or profile_dict.get("focus_span_minutes", 45))
        subject = item.get("subject") or classify_topic_subject(topic_name)

        task = PlannerTask(
            student_id=req.student_id,
            topic_name=topic_name,
            subject=subject,
            scheduled_date=scheduled_date,
            duration_minutes=duration,
            is_completed=False,
            is_missed=False
        )
        session.add(task)
        created_tasks.append(task)

    session.commit()
    return {
        "message": f"Successfully created {len(created_tasks)} tasks for '{req.target_goal}'" + (
            f" (replaced {deleted_duplicates_count} previous uncompleted tasks)." if deleted_duplicates_count > 0 else "."
        ),
        "tasks": [t.model_dump() for t in created_tasks]
    }

@router.post("/planner/reschedule-missed/{student_id}")
def reschedule_missed_tasks(student_id: str, session: Session = Depends(get_session)):
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    today_date = datetime.utcnow().date()

    missed_tasks = session.exec(
        select(PlannerTask).where(
            PlannerTask.student_id == student_id,
            PlannerTask.scheduled_date < today_str,
            PlannerTask.is_completed == False
        )
    ).all()

    if not missed_tasks:
        return {"message": "No missed backlog tasks found to reschedule.", "rescheduled_count": 0}

    rescheduled_count = len(missed_tasks)
    for idx, task in enumerate(missed_tasks):
        days_ahead = (idx % 4) + 1
        new_date = (today_date + timedelta(days=days_ahead)).strftime("%Y-%m-%d")
        task.scheduled_date = new_date
        task.is_missed = False
        session.add(task)

    session.commit()
    return {
        "message": f"Successfully rebalanced {rescheduled_count} missed tasks across upcoming study sessions.",
        "rescheduled_count": rescheduled_count
    }

@router.patch("/planner/tasks/{task_id}/toggle")
def toggle_task_status(task_id: int, req: Optional[ToggleTaskRequest] = None, session: Session = Depends(get_session)):
    task = session.get(PlannerTask, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    old_status = task.is_completed
    if req and req.is_completed is not None:
        new_status = req.is_completed
    else:
        new_status = not old_status

    task.is_completed = new_status
    session.add(task)
    session.commit()
    session.refresh(task)

    gamification_res = None
    if new_status and not old_status:
        # Task was completed -> Award +50 XP
        gamification_res = award_xp(session, task.student_id, 50, f"Completed: {task.topic_name}")
        
        # Broadcast to squads if student is a squad member
        try:
            profile = session.get(UserProfile, task.student_id)
            student_name = profile.full_name if profile else "Scholar"
            squad_memberships = session.exec(
                select(SquadMember).where(SquadMember.student_id == task.student_id)
            ).all()
            for sm in squad_memberships:
                feed = SquadFeedItem(
                    squad_id=sm.squad_id,
                    student_id=task.student_id,
                    student_name=student_name,
                    event_type="task_completed",
                    message=f"🎯 {student_name} finished study task: \"{task.topic_name}\"",
                    reactions_json='{"🔥": 0, "👏": 1, "🎯": 0}'
                )
                session.add(feed)
            if squad_memberships:
                session.commit()
        except Exception as e:
            print(f"[Squad Broadcast Notice] {e}")

    elif not new_status and old_status:
        # Task was uncompleted -> Deduct 50 XP
        gamification_res = award_xp(session, task.student_id, -50, "Uncompleted task")

    return {
        "message": "Task updated",
        "task": task,
        "gamification": gamification_res
    }

@router.get("/planner/analytics/{student_id}")
def get_planner_analytics(student_id: str, session: Session = Depends(get_session)):
    all_tasks = session.exec(select(PlannerTask).where(PlannerTask.student_id == student_id)).all()
    today_str = datetime.utcnow().strftime("%Y-%m-%d")

    total = len(all_tasks)
    completed = sum(1 for t in all_tasks if t.is_completed)
    backlogs = sum(1 for t in all_tasks if t.scheduled_date < today_str and not t.is_completed)

    heatmap: Dict[str, int] = {}
    for t in all_tasks:
        if t.is_completed:
            heatmap[t.scheduled_date] = heatmap.get(t.scheduled_date, 0) + 1

    # Real streak calculation: consecutive active days with >=1 completed task
    streak = 0
    curr_date = datetime.utcnow().date()
    # Check if today has completed tasks, otherwise check starting from yesterday
    if heatmap.get(curr_date.strftime("%Y-%m-%d"), 0) == 0:
        curr_date = curr_date - timedelta(days=1)

    while True:
        d_str = curr_date.strftime("%Y-%m-%d")
        if heatmap.get(d_str, 0) > 0:
            streak += 1
            curr_date -= timedelta(days=1)
        else:
            break

    return {
        "student_id": student_id,
        "total_tasks": total,
        "completed_tasks": completed,
        "completion_rate": round((completed / total * 100), 1) if total > 0 else 0.0,
        "streak_days": streak,
        "backlog_count": backlogs,
        "heatmap": heatmap
    }
