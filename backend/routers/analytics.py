import json
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from database import get_session
from models import PlannerTask, UserProfile
from services.gamification_service import (
    classify_topic_subject,
    award_xp,
    calculate_level_from_xp,
    BADGES_BY_LEVEL,
)

router = APIRouter(prefix="/api", tags=["Analytics & Gamification"])

SUBJECT_COLORS = {
    "Mathematics": "#20B2AA",       # Teal-500
    "Physics": "#FA8072",           # Salmon-500
    "Chemistry": "#E96D60",         # Salmon-600
    "Biology": "#008080",           # Teal-600
    "Computer Science": "#38BDF8",  # Sky-400
    "Economics/Management": "#A78BFA", # Purple-400
    "General Academic": "#94A3B8"   # Slate-400
}

class AwardXPRequest(BaseModel):
    student_id: str
    amount: int
    reason: Optional[str] = "Manual award"

@router.get("/analytics/subject-progress/{student_id}")
def get_subject_progress(student_id: str, session: Session = Depends(get_session)):
    tasks = session.exec(
        select(PlannerTask).where(PlannerTask.student_id == student_id)
    ).all()

    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    today_date = datetime.utcnow().date()
    
    # Sprint week: past 7 days up to today
    week_start_date = today_date - timedelta(days=6)
    week_start_str = week_start_date.strftime("%Y-%m-%d")

    # Group by subject
    grouped: Dict[str, Dict[str, Any]] = {}

    for t in tasks:
        subj = classify_topic_subject(t.topic_name, getattr(t, "subject", "General"))
        if subj not in grouped:
            grouped[subj] = {
                "subject": subj,
                "color": SUBJECT_COLORS.get(subj, "#20B2AA"),
                "total_tasks": 0,
                "completed_tasks": 0,
                "remaining_tasks": 0,
                "today_total": 0,
                "today_completed": 0,
                "week_total": 0,
                "week_completed": 0
            }

        data = grouped[subj]
        data["total_tasks"] += 1
        if t.is_completed:
            data["completed_tasks"] += 1
        else:
            data["remaining_tasks"] += 1

        if t.scheduled_date == today_str:
            data["today_total"] += 1
            if t.is_completed:
                data["today_completed"] += 1

        if week_start_str <= t.scheduled_date <= today_str:
            data["week_total"] += 1
            if t.is_completed:
                data["week_completed"] += 1

    # Format output list with calculated percentages
    subject_list = []
    total_today_tasks = 0
    total_today_completed = 0
    total_week_tasks = 0
    total_week_completed = 0

    for s_name, s_data in grouped.items():
        total_tasks = s_data["total_tasks"]
        comp = s_data["completed_tasks"]
        pct = round((comp / total_tasks * 100), 1) if total_tasks > 0 else 0.0
        
        today_tot = s_data["today_total"]
        today_comp = s_data["today_completed"]
        today_pct = round((today_comp / today_tot * 100), 1) if today_tot > 0 else 0.0

        week_tot = s_data["week_total"]
        week_comp = s_data["week_completed"]
        week_pct = round((week_comp / week_tot * 100), 1) if week_tot > 0 else 0.0

        total_today_tasks += today_tot
        total_today_completed += today_comp
        total_week_tasks += week_tot
        total_week_completed += week_comp

        subject_list.append({
            "subject": s_name,
            "color": s_data["color"],
            "total_tasks": total_tasks,
            "completed_tasks": comp,
            "remaining_tasks": s_data["remaining_tasks"],
            "completion_percentage": pct,
            "today_total": today_tot,
            "today_completed": today_comp,
            "today_percentage": today_pct,
            "week_total": week_tot,
            "week_completed": week_comp,
            "week_percentage": week_pct
        })

    # Sort by total_tasks descending
    subject_list.sort(key=lambda x: x["total_tasks"], reverse=True)

    overall_today_pct = round((total_today_completed / total_today_tasks * 100), 1) if total_today_tasks > 0 else 0.0
    overall_week_pct = round((total_week_completed / total_week_tasks * 100), 1) if total_week_tasks > 0 else 0.0

    return {
        "student_id": student_id,
        "today_date": today_str,
        "week_range": f"{week_start_str} to {today_str}",
        "subjects": subject_list,
        "overall_today_percentage": overall_today_pct,
        "overall_week_percentage": overall_week_pct,
        "total_today_tasks": total_today_tasks,
        "total_today_completed": total_today_completed,
        "total_week_tasks": total_week_tasks,
        "total_week_completed": total_week_completed
    }

@router.get("/gamification/status/{student_id}")
def get_gamification_status(student_id: str, session: Session = Depends(get_session)):
    profile = session.exec(select(UserProfile).where(UserProfile.id == student_id)).first()
    if not profile:
        profile = UserProfile(id=student_id, full_name="Scholar", xp=0, level=1)
        session.add(profile)
        session.commit()
        session.refresh(profile)

    total_xp = profile.xp or 0
    level, xp_into_level, xp_to_next = calculate_level_from_xp(total_xp)

    try:
        badges = json.loads(profile.badges_json or "[]")
    except Exception:
        badges = []

    badge_current = BADGES_BY_LEVEL.get(level, f"Level {level} Titan")
    if badge_current not in badges:
        badges.append(badge_current)
        profile.badges_json = json.dumps(badges)
        profile.level = level
        session.add(profile)
        session.commit()

    progress_pct = round((xp_into_level / 500) * 100, 1)

    return {
        "student_id": student_id,
        "total_xp": total_xp,
        "level": level,
        "xp_into_level": xp_into_level,
        "xp_to_next": xp_to_next,
        "progress_percentage": progress_pct,
        "current_badge": badge_current,
        "unlocked_badges": badges
    }

@router.post("/gamification/award-xp")
def post_award_xp(req: AwardXPRequest, session: Session = Depends(get_session)):
    result = award_xp(session, req.student_id, req.amount, req.reason or "Task completed")
    return result

