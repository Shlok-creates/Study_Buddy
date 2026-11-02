import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from database import get_session
from models import SkillNode, StudyRoom, UserProfile
from services.gamification_service import award_xp

router = APIRouter(prefix="/api", tags=["Gamified Skill Trees & Pods"])

class QuizSubmission(BaseModel):
    node_id: str
    score_percentage: float # 0 to 100
    student_id: Optional[str] = None

class JoinPodRequest(BaseModel):
    room_code: str
    student_id: str
    student_name: Optional[str] = "Student"

@router.get("/skills/tracks")
def get_available_tracks(session: Session = Depends(get_session)):
    nodes = session.exec(select(SkillNode.track).distinct()).all()
    # Flatten if needed
    tracks = list(dict.fromkeys(nodes))
    return {"tracks": tracks}

@router.get("/skills/tree/{track}")
def get_skill_tree(track: str, session: Session = Depends(get_session)):
    nodes = session.exec(
        select(SkillNode)
        .where(SkillNode.track == track)
        .order_by(SkillNode.level_order.asc())
    ).all()
    
    if not nodes:
        raise HTTPException(status_code=404, detail=f"No skill tree found for track '{track}'")

    result = []
    for n in nodes:
        try:
            quiz = json.loads(n.quiz_json)
        except Exception:
            quiz = []
        result.append({
            "id": n.id,
            "track": n.track,
            "title": n.title,
            "level_order": n.level_order,
            "is_unlocked": n.is_unlocked,
            "is_completed": bool(getattr(n, "is_completed", False)),
            "quiz": quiz
        })
    return result

@router.post("/skills/submit-quiz")
def submit_skill_quiz(submission: QuizSubmission, session: Session = Depends(get_session)):
    current_node = session.get(SkillNode, submission.node_id)
    if not current_node:
        raise HTTPException(status_code=404, detail="Skill node not found")

    passed = submission.score_percentage >= 80.0

    unlocked_next_node = None
    gamification_res = None
    if passed:
        # Mark current level completed
        current_node.is_completed = True
        current_node.is_unlocked = True
        session.add(current_node)

        # Award +100 XP for mastering a skill level
        if submission.student_id:
            try:
                gamification_res = award_xp(
                    session,
                    submission.student_id,
                    100,
                    f"Passed Quiz: {current_node.title}"
                )
            except Exception as e:
                print(f"[Gamification Quiz Award Error] {e}")

        # Find next node in same track with level_order == current_node.level_order + 1
        next_node = session.exec(
            select(SkillNode)
            .where(
                SkillNode.track == current_node.track,
                SkillNode.level_order == current_node.level_order + 1
            )
        ).first()

        if next_node:
            next_node.is_unlocked = True
            session.add(next_node)
            unlocked_next_node = next_node.title

        session.commit()
        session.refresh(current_node)
        if next_node:
            session.refresh(next_node)

    return {
        "passed": passed,
        "is_completed": passed,
        "unlocked_next": bool(unlocked_next_node),
        "score_percentage": submission.score_percentage,
        "message": f"Awesome! Level unlocked: {unlocked_next_node}" if (passed and unlocked_next_node) else (
            "Congratulations! You completed the track master level!" if passed else "Score was below 80%. Review and try again!"
        ),
        "unlocked_node": unlocked_next_node,
        "gamification": gamification_res
    }

@router.get("/pods/leaderboard/{room_code}")
def get_pod_leaderboard(room_code: str, session: Session = Depends(get_session)):
    members = session.exec(
        select(StudyRoom)
        .where(StudyRoom.room_code == room_code)
        .order_by(StudyRoom.tasks_completed_count.desc())
    ).all()

    leaderboard = []
    for rank, m in enumerate(members, start=1):
        leaderboard.append({
            "rank": rank,
            "student_id": m.student_id,
            "student_name": m.student_name or f"Scholar-{m.student_id[-4:]}",
            "tasks_completed_count": m.tasks_completed_count,
            "last_active": m.last_active
        })

    return {
        "room_code": room_code,
        "active_students_count": len(leaderboard),
        "leaderboard": leaderboard
    }

@router.post("/pods/join")
def join_pod(req: JoinPodRequest, session: Session = Depends(get_session)):
    room_code = req.room_code.strip().upper()
    member = session.exec(
        select(StudyRoom).where(
            StudyRoom.room_code == room_code,
            StudyRoom.student_id == req.student_id
        )
    ).first()

    if not member:
        member = StudyRoom(
            room_code=room_code,
            student_id=req.student_id,
            student_name=req.student_name,
            tasks_completed_count=12,
            last_active="Just now"
        )
        session.add(member)
        session.commit()
        session.refresh(member)

    return {"message": f"Successfully joined pod {room_code}", "pod": member}

