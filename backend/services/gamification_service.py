import json
from typing import Dict, Any, Optional, Tuple
from sqlmodel import Session, select
from models import UserProfile, SquadMember, SquadFeedItem

# Tier Badges Milestone Table
BADGES_BY_LEVEL = {
    1: "Novice Scholar",
    2: "Disciplined Focus Cadet",
    3: "Academic Pathfinder",
    4: "Syllabus Conqueror",
    5: "Deep Work Virtuoso",
    6: "Strategic Problem Solver",
    7: "Exam Arena Gladiator",
    8: "Cognitive Luminary",
    9: "Master Academician",
    10: "Grandmaster Scholar"
}

def calculate_level_from_xp(total_xp: int) -> Tuple[int, int, int]:
    """
    Formalized level and XP distribution:
    level = floor(total_xp / 500) + 1
    xp_into_current_level = total_xp % 500
    xp_to_next_level = 500 - xp_into_current_level
    Returns: (level, xp_into_current_level, xp_to_next_level)
    """
    total_xp = max(0, total_xp)
    level = (total_xp // 500) + 1
    xp_into_current_level = total_xp % 500
    xp_to_next_level = 500 - xp_into_current_level
    return level, xp_into_current_level, xp_to_next_level

def award_xp(
    session: Session,
    student_id: str,
    xp_amount: int,
    reason: str = "Task completed"
) -> Dict[str, Any]:
    """
    Award or deduct XP, resolving race conditions and formalizing level transitions.
    Returns:
    {
        "xp_awarded": int,
        "total_xp": int,
        "level": int,
        "xp_into_level": int,
        "xp_to_next": int,
        "leveled_up": bool,
        "new_level": int,
        "badge_unlocked": Optional[str]
    }
    """
    profile = session.exec(select(UserProfile).where(UserProfile.id == student_id)).first()
    if not profile:
        profile = UserProfile(id=student_id, full_name="Scholar", xp=0, level=1)
        session.add(profile)
        session.commit()
        session.refresh(profile)

    old_total_xp = profile.xp or 0
    old_level, _, _ = calculate_level_from_xp(old_total_xp)

    new_total_xp = max(0, old_total_xp + xp_amount)
    new_level, xp_into_level, xp_to_next = calculate_level_from_xp(new_total_xp)

    leveled_up = new_level > old_level
    badge_unlocked: Optional[str] = None

    # Parse and update badges
    try:
        current_badges = json.loads(profile.badges_json or "[]")
    except Exception:
        current_badges = []

    if leveled_up:
        badge_name = BADGES_BY_LEVEL.get(new_level, f"Level {new_level} Titan")
        if badge_name not in current_badges:
            current_badges.append(badge_name)
            badge_unlocked = badge_name

    profile.xp = new_total_xp
    profile.level = new_level
    profile.badges_json = json.dumps(current_badges)
    session.add(profile)
    session.commit()
    session.refresh(profile)

    # If leveled up, broadcast achievement to all squads the student belongs to!
    if leveled_up:
        squad_memberships = session.exec(
            select(SquadMember).where(SquadMember.student_id == student_id)
        ).all()
        for membership in squad_memberships:
            feed_item = SquadFeedItem(
                squad_id=membership.squad_id,
                student_id=student_id,
                student_name=profile.full_name or "Scholar",
                event_type="level_up",
                message=f"🎉 {profile.full_name or 'Scholar'} just reached Level {new_level}! Unlocked: {badge_unlocked or 'New Rank'}",
                reactions_json='{"🔥": 1, "👏": 1, "🎯": 0}'
            )
            session.add(feed_item)
        if squad_memberships:
            session.commit()

    return {
        "xp_awarded": xp_amount,
        "total_xp": new_total_xp,
        "level": new_level,
        "xp_into_level": xp_into_level,
        "xp_to_next": xp_to_next,
        "leveled_up": leveled_up,
        "new_level": new_level,
        "badge_unlocked": badge_unlocked
    }

def classify_topic_subject(topic_name: str, fallback_subject: str = "General") -> str:
    """
    Classify syllabus topic into one of the canonical academic subject streams:
    - Mathematics
    - Physics
    - Chemistry
    - Biology
    - Computer Science
    - Economics/Management
    - General Academic
    """
    if fallback_subject and fallback_subject not in ("General", "", "General Academic"):
        return fallback_subject

    text = topic_name.lower()

    # Computer Science / Programming
    if any(k in text for k in [
        "c++", "python", "javascript", "react", "html", "css", "data structure",
        "algorithm", "array", "binary tree", "sql", "database", "api", "coding",
        "web dev", "frontend", "backend", "git", "oop", "recursion", "dsa"
    ]):
        return "Computer Science"

    # Mathematics
    if any(k in text for k in [
        "calculus", "algebra", "trigonometry", "matrix", "matrices", "derivative",
        "integration", "integral", "limit", "differential", "probability", "statistics",
        "geometry", "coordinate", "vector", "quadratic", "logarithm", "math"
    ]):
        return "Mathematics"

    # Physics
    if any(k in text for k in [
        "physics", "rotational", "kinematics", "torque", "gravitation", "thermodynamics",
        "electrostatics", "magnetism", "circuit", "optics", "quantum", "work energy",
        "friction", "mechanics", "electromagnet", "capacitance", "newton"
    ]):
        return "Physics"

    # Chemistry
    if any(k in text for k in [
        "chemistry", "organic", "inorganic", "periodic", "equilibrium", "chemical bonding",
        "reaction", "stoichiometry", "thermodynamics", "electrochemistry", "polymers",
        "hydrocarbon", "aldehyde", "ketone", "molarity", "acid base"
    ]):
        return "Chemistry"

    # Biology
    if any(k in text for k in [
        "biology", "photosynthesis", "cell", "genetics", "dna", "rna", "neet",
        "botany", "zoology", "ecosystem", "respiration", "human physiology",
        "reproduction", "evolution", "morphology", "anatomy", "microbe"
    ]):
        return "Biology"

    # Economics & Management
    if any(k in text for k in [
        "accounting", "economics", "finance", "management", "business", "balance sheet",
        "ledger", "marketing", "microeconomics", "macroeconomics", "ipmat", "cuet",
        "capital", "gdp", "inflation", "costing", "audit", "banking"
    ]):
        return "Economics/Management"

    return "General Academic"

