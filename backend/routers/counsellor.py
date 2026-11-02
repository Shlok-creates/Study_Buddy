import json
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from database import get_session
from models import UserProfile, PlannerTask, CareerGuidanceSession
from services.groq_service import advise_career_counsellor
from routers.analytics import get_subject_progress

router = APIRouter(prefix="/api/counsellor", tags=["AI Career & Academic Counsellor"])

class AdviseRequest(BaseModel):
    student_id: str
    stream_track: str # "Tech", "Medical", "Management"
    query: str

class ApplyMilestonesRequest(BaseModel):
    student_id: str
    tasks: List[Dict[str, Any]]

CURATED_TRACKS = [
    {
        "id": "tech",
        "key": "Tech",
        "title": "Technology & Engineering",
        "badge": "STEM • High-Growth",
        "description": "Software Engineering, AI/ML, Cybersecurity, Cloud Infrastructure, Robotics, and Electronics & Communication.",
        "icon": "Cpu",
        "color": "teal",
        "domains": [
            "Full-Stack AI & Cloud Systems",
            "Machine Learning & Data Science",
            "Cybersecurity & Defensive Engineering",
            "Embedded Systems & Robotics",
            "Blockchain & Distributed Systems"
        ],
        "key_exams": [
            {"name": "JEE Main & Advanced", "focus": "IITs, NITs, IIITs (PCM 75% required)"},
            {"name": "BITSAT", "focus": "BITS Pilani, Goa, Hyderabad campuses"},
            {"name": "State CETs (MHT-CET, WBJEE, KCET)", "focus": "Top State Engineering Colleges"}
        ],
        "accelerator_pathways": [
            "Open-source contributions on GitHub",
            "National & Global Hackathons (Smart India Hackathon, MLH)",
            "LeetCode / Codeforces algorithmic problem solving"
        ]
    },
    {
        "id": "medical",
        "key": "Medical",
        "title": "Medical & Healthcare Sciences",
        "badge": "Life Sciences • High-Impact",
        "description": "MBBS, BDS, Biotechnology, Biomedical Engineering, Clinical Genetics, and Allied Medical Specialties.",
        "icon": "Stethoscope",
        "color": "salmon",
        "domains": [
            "Clinical Medicine & Surgery (MBBS)",
            "Dental Surgery & Orthodontics (BDS)",
            "Biotechnology & Synthetic Genetics",
            "Biomedical Technology & Diagnostics",
            "Public Health & Epidemiology"
        ],
        "key_exams": [
            {"name": "NEET-UG", "focus": "AIIMS, JIPMER, Central & State Government Medical Colleges"},
            {"name": "CUET-UG Life Sciences", "focus": "Central Universities for Biotech, Microbiology"},
            {"name": "IAT / NEST", "focus": "IISERs & NISER for pure scientific research"}
        ],
        "accelerator_pathways": [
            "NCERT 100% active recall line-by-line flashcard mastery",
            "Hospital volunteer shadowing & public health awareness",
            "Scientific literature review on PubMed / clinical case studies"
        ]
    },
    {
        "id": "management",
        "key": "Management",
        "title": "Management & Financial Strategy",
        "badge": "Business • Leadership",
        "description": "IIM 5-Year Dual Degrees (IPMAT), CUET (BBA, BMS, B.Com Hons), FinTech, Product Management, and CFA/CA.",
        "icon": "TrendingUp",
        "color": "purple",
        "domains": [
            "Investment Banking & Quantitative Finance",
            "Technology Product Management (PM)",
            "Management Consulting & Strategy",
            "FinTech & Algorithmic Trading",
            "Corporate Law & Mergers (BBA LLB)"
        ],
        "key_exams": [
            {"name": "IPMAT (Indore / Rohtak / Ranchi)", "focus": "IIM 5-Year Integrated Program in Management"},
            {"name": "CUET-UG (DU SRCC, SSCBS)", "focus": "B.Com (Hons), BMS, BBA-FIA"},
            {"name": "NPAT / SET", "focus": "NMIMS Mumbai, Symbiosis Pune"}
        ],
        "accelerator_pathways": [
            "High-speed Quantitative Aptitude & Data Interpretation speed drills",
            "Financial modeling in Excel & Python",
            "Business Case competitions (Harvard / McKinsey framework)"
        ]
    }
]

@router.get("/roadmaps")
def get_curated_roadmaps():
    return {"tracks": CURATED_TRACKS}

@router.post("/advise")
def advise_student(req: AdviseRequest, session: Session = Depends(get_session)):
    query = req.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    # Fetch student profile
    profile = session.get(UserProfile, req.student_id)
    profile_dict = profile.model_dump() if profile else {
        "grade_stream": "Class 11 Science",
        "focus_span_minutes": 45,
        "peak_energy": "Late Night"
    }

    # Fetch subject performance data
    try:
        subject_perf = get_subject_progress(req.student_id, session=session)
    except Exception as e:
        print(f"[Subject Perf Warning] {e}")
        subject_perf = {"subjects": []}

    # Generate personalized guidance with Groq
    guidance = advise_career_counsellor(
        student_profile=profile_dict,
        subject_performance=subject_perf,
        stream_track=req.stream_track,
        user_query=query
    )

    # Persist session in database
    session_record = CareerGuidanceSession(
        student_id=req.student_id,
        stream_track=req.stream_track,
        query=query,
        ai_response_json=json.dumps(guidance)
    )
    session.add(session_record)
    session.commit()
    session.refresh(session_record)

    return {
        "session_id": session_record.id,
        "student_id": req.student_id,
        "stream_track": req.stream_track,
        "query": query,
        "guidance": guidance,
        "timestamp": session_record.timestamp
    }

@router.post("/apply-milestones")
def apply_milestones(req: ApplyMilestonesRequest, session: Session = Depends(get_session)):
    if not req.tasks:
        raise HTTPException(status_code=400, detail="No tasks provided")

    today = datetime.utcnow().date()
    added_tasks = []

    for idx, item in enumerate(req.tasks):
        # Schedule each task 1 to 3 days ahead
        scheduled_date = (today + timedelta(days=idx + 1)).strftime("%Y-%m-%d")
        topic_name = item.get("topic_name") or f"Career Milestone: Step {idx+1}"
        subject = item.get("subject") or "General Academic"
        duration = int(item.get("duration_minutes") or 45)

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
        added_tasks.append(task)

    session.commit()

    return {
        "message": f"Successfully added {len(added_tasks)} recommended milestones to your Adaptive Study Planner!",
        "added_count": len(added_tasks),
        "tasks": [t.model_dump() for t in added_tasks]
    }

@router.get("/history/{student_id}")
def get_guidance_history(student_id: str, session: Session = Depends(get_session)):
    sessions = session.exec(
        select(CareerGuidanceSession)
        .where(CareerGuidanceSession.student_id == student_id)
        .order_by(CareerGuidanceSession.timestamp.desc())
    ).all()

    res = []
    for s in sessions:
        try:
            parsed = json.loads(s.ai_response_json)
        except Exception:
            parsed = {}
        res.append({
            "id": s.id,
            "stream_track": s.stream_track,
            "query": s.query,
            "guidance": parsed,
            "timestamp": s.timestamp
        })

    return {"sessions": res}

