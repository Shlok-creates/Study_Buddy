import uuid
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from database import get_session
from models import StudySquad, SquadMember, SquadFeedItem, UserProfile

router = APIRouter(prefix="/api/squads", tags=["Social Squads & Milestone Feed"])

class CreateSquadRequest(BaseModel):
    name: str
    created_by: str
    description: Optional[str] = "Collaborative Study Squad"

class JoinSquadRequest(BaseModel):
    invite_code: str
    student_id: str
    student_name: Optional[str] = "Scholar"

class ReactFeedRequest(BaseModel):
    emoji: str # "🔥", "👏", "🎯"
    student_id: Optional[str] = None

class PostMessageRequest(BaseModel):
    student_id: str
    student_name: Optional[str] = "Scholar"
    message: str

def parse_reactions(raw_json: str) -> Dict[str, int]:
    try:
        data = json.loads(raw_json or "{}")
        return {
            "🔥": data.get("🔥", 0),
            "👏": data.get("👏", 0),
            "🎯": data.get("🎯", 0)
        }
    except Exception:
        return {"🔥": 0, "👏": 0, "🎯": 0}

@router.post("/create")
def create_squad(req: CreateSquadRequest, session: Session = Depends(get_session)):
    name = req.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Squad name is required")

    invite_code = f"SQUAD-{uuid.uuid4().hex[:6].upper()}"

    squad = StudySquad(
        name=name,
        invite_code=invite_code,
        created_by=req.created_by,
        description=req.description or "Collaborative Study Squad",
        member_count=1
    )
    session.add(squad)
    session.commit()
    session.refresh(squad)

    # Get student name
    profile = session.get(UserProfile, req.created_by)
    student_name = profile.full_name if profile else "Scholar"

    # Add creator as first member
    member = SquadMember(
        squad_id=squad.id,
        student_id=req.created_by,
        student_name=student_name
    )
    session.add(member)

    # Add initial feed announcement
    feed_item = SquadFeedItem(
        squad_id=squad.id,
        student_id=req.created_by,
        student_name=student_name,
        event_type="cheer",
        message=f"🚀 {student_name} founded the squad \"{name}\"! Welcome study buddies!",
        reactions_json='{"🔥": 2, "👏": 3, "🎯": 1}'
    )
    session.add(feed_item)
    session.commit()

    return {
        "message": f"Study Squad '{name}' created successfully!",
        "squad": squad
    }

@router.post("/join")
def join_squad(req: JoinSquadRequest, session: Session = Depends(get_session)):
    code = req.invite_code.strip().upper()
    squad = session.exec(select(StudySquad).where(StudySquad.invite_code == code)).first()
    if not squad:
        raise HTTPException(status_code=404, detail="Invalid squad invite code. Please check and try again.")

    # Check if already joined
    existing = session.exec(
        select(SquadMember).where(
            SquadMember.squad_id == squad.id,
            SquadMember.student_id == req.student_id
        )
    ).first()

    if existing:
        return {
            "message": f"You are already a member of '{squad.name}'!",
            "squad": squad,
            "already_member": True
        }

    profile = session.get(UserProfile, req.student_id)
    name = req.student_name or (profile.full_name if profile else "Scholar")

    member = SquadMember(
        squad_id=squad.id,
        student_id=req.student_id,
        student_name=name
    )
    session.add(member)

    squad.member_count += 1
    session.add(squad)

    # Add feed announcement
    feed_item = SquadFeedItem(
        squad_id=squad.id,
        student_id=req.student_id,
        student_name=name,
        event_type="cheer",
        message=f"👋 {name} joined the squad! Let's crush our goals together.",
        reactions_json='{"🔥": 1, "👏": 2, "🎯": 0}'
    )
    session.add(feed_item)
    session.commit()
    session.refresh(squad)

    return {
        "message": f"Successfully joined squad '{squad.name}'!",
        "squad": squad,
        "already_member": False
    }

@router.get("/my/{student_id}")
def get_student_squads(student_id: str, session: Session = Depends(get_session)):
    memberships = session.exec(
        select(SquadMember).where(SquadMember.student_id == student_id)
    ).all()

    squad_ids = [m.squad_id for m in memberships]
    if not squad_ids:
        # Check if default alpha squad exists, otherwise create it so student can explore immediately
        default_squad = session.exec(select(StudySquad)).first()
        if default_squad:
            # Auto-join default squad
            profile = session.get(UserProfile, student_id)
            name = profile.full_name if profile else "Scholar"
            m = SquadMember(squad_id=default_squad.id, student_id=student_id, student_name=name)
            session.add(m)
            default_squad.member_count += 1
            session.add(default_squad)
            session.commit()
            squad_ids = [default_squad.id]

    squads = session.exec(select(StudySquad).where(StudySquad.id.in_(squad_ids))).all()

    res = []
    for s in squads:
        members = session.exec(select(SquadMember).where(SquadMember.squad_id == s.id)).all()
        res.append({
            "id": s.id,
            "name": s.name,
            "invite_code": s.invite_code,
            "description": s.description,
            "member_count": s.member_count,
            "created_by": s.created_by,
            "members": [
                {"student_id": m.student_id, "student_name": m.student_name, "joined_at": m.joined_at}
                for m in members
            ]
        })

    return {"squads": res}

@router.get("/{squad_id}/feed")
def get_squad_feed(squad_id: int, session: Session = Depends(get_session)):
    items = session.exec(
        select(SquadFeedItem)
        .where(SquadFeedItem.squad_id == squad_id)
        .order_by(SquadFeedItem.created_at.desc())
    ).all()

    feed_list = []
    for item in items:
        feed_list.append({
            "id": item.id,
            "squad_id": item.squad_id,
            "student_id": item.student_id,
            "student_name": item.student_name,
            "event_type": item.event_type,
            "message": item.message,
            "reactions": parse_reactions(item.reactions_json),
            "created_at": item.created_at
        })

    return {
        "squad_id": squad_id,
        "feed": feed_list
    }

@router.post("/feed/{item_id}/react")
def react_to_feed_item(item_id: int, req: ReactFeedRequest, session: Session = Depends(get_session)):
    item = session.get(SquadFeedItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Feed item not found")

    reactions = parse_reactions(item.reactions_json)
    if req.emoji in ("🔥", "👏", "🎯"):
        reactions[req.emoji] = reactions.get(req.emoji, 0) + 1
        item.reactions_json = json.dumps(reactions)
        session.add(item)
        session.commit()
        session.refresh(item)

    return {
        "id": item.id,
        "reactions": reactions
    }

@router.post("/feed/{squad_id}/post")
def post_to_feed(squad_id: int, req: PostMessageRequest, session: Session = Depends(get_session)):
    msg = req.message.strip()
    if not msg:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    squad = session.get(StudySquad, squad_id)
    if not squad:
        raise HTTPException(status_code=404, detail="Squad not found")

    item = SquadFeedItem(
        squad_id=squad_id,
        student_id=req.student_id,
        student_name=req.student_name or "Scholar",
        event_type="cheer",
        message=msg,
        reactions_json='{"🔥": 0, "👏": 0, "🎯": 0}'
    )
    session.add(item)
    session.commit()
    session.refresh(item)

    return {
        "id": item.id,
        "squad_id": squad_id,
        "student_id": item.student_id,
        "student_name": item.student_name,
        "event_type": item.event_type,
        "message": item.message,
        "reactions": {"🔥": 0, "👏": 0, "🎯": 0},
        "created_at": item.created_at
    }

