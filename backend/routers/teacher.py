import io
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from pypdf import PdfReader
from services.groq_service import explain_notes_as_teacher
from services.tts_service import synthesize_speech, AUDIO_DIR

router = APIRouter(prefix="/api/teacher", tags=["AI Teacher Explainer"])

def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    """Extract clean text from PDF or plain text files with defensive error handling."""
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty (0 bytes).")

    filename_lower = filename.lower()
    if filename_lower.endswith(".pdf"):
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Uploaded PDF could not be parsed: {str(e)}. Please check if file is corrupted."
            )
        
        extracted_pages = []
        for idx, page in enumerate(reader.pages[:15]):
            try:
                text = page.extract_text()
                if text and text.strip():
                    extracted_pages.append(text.strip())
            except Exception:
                continue

        combined = "\n\n".join(extracted_pages).strip()
        if not combined:
            raise HTTPException(
                status_code=400,
                detail="The uploaded PDF contains no extractable text (it may be a scanned image). Please paste notes directly into the text box."
            )
        return combined
    else:
        # Plain text, markdown, or notes
        try:
            text = file_bytes.decode("utf-8").strip()
        except UnicodeDecodeError:
            try:
                text = file_bytes.decode("latin-1").strip()
            except Exception:
                text = ""

        if not text:
            raise HTTPException(status_code=400, detail="The uploaded text file is empty or unreadable.")
        return text

@router.post("/explain")
async def explain_notes(
    file: Optional[UploadFile] = File(None),
    text_content: Optional[str] = Form(None),
    student_grade: str = Form("Class 11"),
    student_stream: str = Form("Science"),
    grade_stream: Optional[str] = Form(None)
):
    # Formulate resolved grade stream
    resolved_stream = grade_stream if grade_stream else f"{student_grade} {student_stream}".strip()

    notes_raw = ""
    if file and file.filename:
        file_bytes = await file.read()
        notes_raw = extract_text_from_file(file_bytes, file.filename)
    elif text_content and text_content.strip():
        notes_raw = text_content.strip()
    else:
        raise HTTPException(
            status_code=400,
            detail="Please provide study notes by uploading a valid PDF/TXT file or entering text notes."
        )

    if len(notes_raw) < 10:
        raise HTTPException(
            status_code=400,
            detail="Study notes content is too short to generate an explanation (minimum 10 characters)."
        )

    # 1. AI Teacher High-Reasoning explanation in spoken prose
    explanation = explain_notes_as_teacher(notes_raw, resolved_stream)

    # 2. edge-tts voice synthesis
    audio_filename = await synthesize_speech(explanation, voice="en-IN-NeerjaNeural")

    return {
        "success": True,
        "grade_stream": resolved_stream,
        "explanation_text": explanation,
        "audio_url": f"/api/teacher/audio/{audio_filename}",
        "raw_character_count": len(notes_raw)
    }

@router.get("/audio/{filename}")
def stream_audio(filename: str):
    file_path = AUDIO_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    return FileResponse(
        path=str(file_path),
        media_type="audio/mpeg",
        filename=filename
    )
