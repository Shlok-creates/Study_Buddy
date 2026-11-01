from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.youtube_service import fetch_youtube_transcript
from services.groq_service import analyze_youtube_transcript

router = APIRouter(prefix="/api/youtube", tags=["YouTube Study Suite"])

class YouTubeAnalyzeRequest(BaseModel):
    url: str

@router.post("/analyze")
def analyze_video(req: YouTubeAnalyzeRequest):
    if not req.url:
        raise HTTPException(status_code=400, detail="YouTube URL is required")

    try:
        video_id, video_title, transcript_text = fetch_youtube_transcript(req.url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process YouTube link: {str(e)}")

    analysis = analyze_youtube_transcript(transcript_text, video_title=video_title)

    return {
        "video_id": video_id,
        "video_title": video_title,
        "video_url": f"https://www.youtube.com/watch?v={video_id}",
        "embed_url": f"https://www.youtube.com/embed/{video_id}",
        "transcript_length": len(transcript_text),
        "summary": analysis.get("summary", ""),
        "flashcards": analysis.get("flashcards", []),
        "quiz": analysis.get("quiz", [])
    }
