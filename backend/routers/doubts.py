import os
import uuid
import json
from pathlib import Path
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import FlashcardSet
from services.groq_service import analyze_question_image, clean_json_response

router = APIRouter(prefix="/api/doubts", tags=["Snap Doubt Solver"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads" / "questions"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/snap-solve")
async def snap_solve_question(
    file: UploadFile = File(...),
    student_id: str = Form(...),
    grade_stream: str = Form("Class 11 Science"),
    session: Session = Depends(get_session)
):
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="Question image file is required.")

    # Validate file extension
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "jpg"
    if ext not in ["jpg", "jpeg", "png", "webp"]:
        ext = "jpg"

    unique_filename = f"{uuid.uuid4().hex}.{ext}"
    file_path = UPLOAD_DIR / unique_filename

    image_bytes = await file.read()
    if not image_bytes or len(image_bytes) < 100:
        raise HTTPException(status_code=400, detail="Uploaded image is empty or too small.")

    with open(file_path, "wb") as f:
        f.write(image_bytes)

    mime_type = file.content_type or f"image/{ext}"
    if not mime_type.startswith("image/"):
        mime_type = "image/jpeg"

    # Call Groq Vision Inference
    result = analyze_question_image(image_bytes, mime_type=mime_type, grade_stream=grade_stream)

    if "error" in result:
        return {
            "success": False,
            "error": result["error"],
            "detail": result.get("detail", "Failed to analyze question image.")
        }

    # Save to FlashcardSet table
    flashcards_list = result.get("flashcards", [])
    topic_summary = "Doubt Resolution Session"
    if flashcards_list and len(flashcards_list) > 0:
        first_q = flashcards_list[0].get("front", "")
        topic_summary = first_q[:60] + "..." if len(first_q) > 60 else first_q

    flashcard_set = FlashcardSet(
        student_id=student_id,
        topic=topic_summary,
        image_path=f"/uploads/questions/{unique_filename}",
        cards_json=json.dumps(flashcards_list),
        srs_interval=1
    )
    session.add(flashcard_set)
    session.commit()
    session.refresh(flashcard_set)

    return {
        "success": True,
        "image_url": f"/uploads/questions/{unique_filename}",
        "flashcard_set_id": flashcard_set.id,
        "data": result
    }

@router.get("/flashcards/{student_id}")
def get_student_flashcards(student_id: str, session: Session = Depends(get_session)):
    sets = session.exec(
        select(FlashcardSet)
        .where(FlashcardSet.student_id == student_id)
        .order_by(FlashcardSet.id.desc())
    ).all()

    parsed_results = []
    for s in sets:
        try:
            cards = json.loads(s.cards_json)
        except Exception:
            cards = []
        parsed_results.append({
            "id": s.id,
            "topic": s.topic,
            "image_path": s.image_path,
            "cards": cards,
            "next_review_date": s.next_review_date,
            "srs_interval": s.srs_interval,
            "created_at": s.created_at
        })
    return parsed_results
