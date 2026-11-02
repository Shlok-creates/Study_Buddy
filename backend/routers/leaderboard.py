from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from database import get_session
from models import UserProfile, PlannerTask
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/leaderboard", tags=["Global Competitive Leaderboards"])

AVATARS = ["⚡", "🔥", "🚀", "🎯", "🌟", "💡", "🧠", "💎", "🏆", "👑"]

@router.get("/global")
def get_global_leaderboard(
    student_id: Optional[str] = Query(None),
    timeframe: str = Query("all-time"), # "all-time" or "weekly"
    metric: str = Query("xp"), # "xp", "streak", "tasks_done"
    session: Session = Depends(get_session)
):
    all_profiles = session.exec(select(UserProfile)).all()
    if not all_profiles:
        return {
            "timeframe": timeframe,
            "metric": metric,
            "total_students": 0,
            "user_standing": None,
            "top_50": []
        }

    all_tasks = session.exec(select(PlannerTask)).all()

    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    today_date = datetime.utcnow().date()
    week_start_str = (today_date - timedelta(days=6)).strftime("%Y-%m-%d")

    # Group tasks and calculate streaks / completed tasks by student
    student_tasks: Dict[str, List[PlannerTask]] = {}
    for t in all_tasks:
        student_tasks.setdefault(t.student_id, []).append(t)

    leaderboard_entries: List[Dict[str, Any]] = []

    for idx, p in enumerate(all_profiles):
        tasks = student_tasks.get(p.id, [])
        total_xp = p.xp or 0

        # Completed tasks count
        if timeframe == "weekly":
            completed_tasks = sum(1 for t in tasks if t.is_completed and week_start_str <= t.scheduled_date <= today_str)
        else:
            completed_tasks = sum(1 for t in tasks if t.is_completed)

        # Real streak calculation
        heatmap: Dict[str, int] = {}
        for t in tasks:
            if t.is_completed:
                heatmap[t.scheduled_date] = heatmap.get(t.scheduled_date, 0) + 1

        streak = 0
        curr_d = today_date
        if heatmap.get(curr_d.strftime("%Y-%m-%d"), 0) == 0:
            curr_d = curr_d - timedelta(days=1)
        while True:
            d_str = curr_d.strftime("%Y-%m-%d")
            if heatmap.get(d_str, 0) > 0:
                streak += 1
                curr_d -= timedelta(days=1)
            else:
                break

        # Score computation based on selected metric
        if metric == "streak":
            score = streak
        elif metric == "tasks_done":
            score = completed_tasks
        else: # "xp"
            score = total_xp

        avatar = AVATARS[idx % len(AVATARS)]

        leaderboard_entries.append({
            "student_id": p.id,
            "student_name": p.full_name or f"Scholar-{p.id[-4:]}",
            "grade_stream": p.grade_stream or "General Academic",
            "level": p.level or 1,
            "xp": total_xp,
            "streak": streak,
            "tasks_done": completed_tasks,
            "score": score,
            "avatar": avatar
        })

    # Sort descending by score, tiebreak by XP then streak
    leaderboard_entries.sort(key=lambda x: (x["score"], x["xp"], x["streak"]), reverse=True)

    # Assign ranks
    total_users = len(leaderboard_entries)
    for rank_idx, item in enumerate(leaderboard_entries, start=1):
        item["rank"] = rank_idx

    # Find authenticated student's standing
    user_standing = None
    if student_id:
        for idx, item in enumerate(leaderboard_entries):
            if item["student_id"] == student_id:
                rank = item["rank"]
                # Exact percentile formula: (1 - rank / total_users) * 100
                if total_users > 1:
                    raw_percentile = (1.0 - (rank / total_users)) * 100.0
                    percentile = max(1.0, min(99.9, round(raw_percentile, 1)))
                else:
                    percentile = 100.0

                # Calculate distance to next higher rank
                xp_to_next = 0
                next_rank_name = None
                if idx > 0:
                    higher_entry = leaderboard_entries[idx - 1]
                    xp_to_next = max(1, (higher_entry["score"] - item["score"]) + 1)
                    next_rank_name = higher_entry["student_name"]

                user_standing = {
                    "student_id": item["student_id"],
                    "student_name": item["student_name"],
                    "rank": rank,
                    "score": item["score"],
                    "metric": metric,
                    "percentile": percentile,
                    "level": item["level"],
                    "xp": item["xp"],
                    "streak": item["streak"],
                    "xp_to_next_rank": xp_to_next,
                    "next_rank_name": next_rank_name
                }
                break

    return {
        "timeframe": timeframe,
        "metric": metric,
        "total_students": total_users,
        "user_standing": user_standing,
        "top_50": leaderboard_entries[:50]
    }

