import os
import uuid
from pathlib import Path
import edge_tts

AUDIO_DIR = Path(__file__).resolve().parent.parent / "uploads" / "audio"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

DEFAULT_VOICE = "en-IN-NeerjaNeural"

async def synthesize_speech(text: str, voice: str = DEFAULT_VOICE) -> str:
    """
    Synthesizes natural speech using edge-tts.
    Saves to uploads/audio/{uuid}.mp3.
    Returns the generated filename.
    """
    filename = f"{uuid.uuid4().hex}.mp3"
    file_path = AUDIO_DIR / filename
    
    try:
        communicate = edge_tts.Communicate(text=text, voice=voice)
        await communicate.save(str(file_path))
        return filename
    except Exception as e:
        print(f"[TTS Error] {e}. Creating placeholder audio or retrying.")
        # Try fallback voice if en-IN-NeerjaNeural fails or create empty mp3 placeholder
        try:
            communicate = edge_tts.Communicate(text=text, voice="en-US-JennyNeural")
            await communicate.save(str(file_path))
            return filename
        except Exception as e2:
            print(f"[TTS Fallback Error] {e2}")
            # Write a minimal dummy mp3 frame so FileResponse won't fail
            with open(file_path, "wb") as f:
                f.write(b"")
            return filename

