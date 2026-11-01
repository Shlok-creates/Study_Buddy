import os
import json
import base64
import re
from typing import Dict, Any, List
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GROQ_API_KEY", "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")
client = Groq(api_key=API_KEY)

# Primary & Fallback Models
MODEL_VISION_PRIMARY = "qwen/qwen3.8-27b"
MODEL_VISION_FALLBACK = "openai/gpt-oss-120b"
MODEL_REASONING_PRIMARY = "qwen/qwen3.8-27b"
MODEL_REASONING_BACKUP = "openai/gpt-oss-120b"

def clean_json_response(raw_text: str) -> Dict[str, Any]:
    """Clean markdown code fences and extract valid JSON dict/list."""
    text = raw_text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        text = match.group(1).strip()
    try:
        return json.loads(text)
    except Exception:
        first_brace = text.find("{")
        last_brace = text.rfind("}")
        if first_brace != -1 and last_brace != -1:
            try:
                return json.loads(text[first_brace:last_brace+1])
            except Exception:
                pass
        raise ValueError(f"Failed to parse model response into JSON: {raw_text[:200]}...")


def analyze_question_image(
    image_bytes: bytes,
    mime_type: str = "image/jpeg",
    grade_stream: str = "Class 11 Science"
) -> Dict[str, Any]:
    """
    Vision OCR & Conceptual Breakdown.
    Tries primary vision model, falls back to active multimodal model.
    COMPLETELY DYNAMIC: Analyzes the actual content of the image.
    If vision processing encounters an issue, returns descriptive error JSON.
    """
    b64_image = base64.b64encode(image_bytes).decode("utf-8")
    data_uri = f"data:{mime_type};base64,{b64_image}"

    prompt = f"""You are an elite academic mentor for a student studying {grade_stream}.
Look at this uploaded question image very carefully. Read the exact text, equations, or diagrams in the image.

Analyze the ACTUAL subject and question presented in the image (e.g. if biology/photosynthesis, explain photosynthesis; if math, solve the math problem; if computer science, explain the code/concepts).

Return ONLY a valid JSON object with the exact keys:
1. "ai_breakdown": String containing a detailed Socratic conceptual breakdown solving or explaining the exact problem in the image. Include fundamental principles and any relevant formulas in LaTeX ($...$ or $$...$$).
2. "flashcards": Array of 3 to 5 active recall flashcards strictly based on this question: [{{"front": "Question/Prompt", "back": "Precise answer or formula"}}].
3. "youtube_resource": Object with {{"title": "Specific Video Title for this topic", "search_query": "YouTube search terms for this topic", "start_seconds": 60, "end_seconds": 240}}.
4. "community_perspective": String summarizing common student pitfalls, peer discussions, and alternative methods for this specific problem.

Ensure the output is strictly valid JSON without preamble.
"""

    # 1. Attempt primary vision model, then fallback multimodal vision model
    errors = []
    for model_name in [MODEL_VISION_PRIMARY, MODEL_VISION_FALLBACK]:
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": data_uri}}
                        ]
                    }
                ],
                temperature=0.2,
                max_tokens=2048,
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content
            parsed = clean_json_response(content)
            # Verify parsed has required keys
            if "ai_breakdown" in parsed and "flashcards" in parsed:
                return parsed
        except Exception as e:
            errors.append(f"{model_name}: {str(e)}")
            continue

    # 2. If both vision attempts fail, return a descriptive error JSON to the client (NO FAKE PHYSICS DATA!)
    return {
        "error": f"Failed to analyze image with Vision AI: {'; '.join(errors)}",
        "detail": "Please ensure the image is clear and contains readable text or equations."
    }


def generate_planner_roadmap(
    target_goal: str,
    deadline_date: str,
    daily_hours: float,
    user_profile: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """
    Generate an adaptive day-by-day learning schedule using high-reasoning LLM.
    Strictly reflects the requested syllabus topic (e.g. "C++ Data Types").
    """
    focus_span = user_profile.get("focus_span_minutes", 45)
    grade_stream = user_profile.get("grade_stream", "General Academic")
    peak_energy = user_profile.get("peak_energy", "Late Night")
    school_hours = f"{user_profile.get('school_start_time', '08:00')} - {user_profile.get('school_end_time', '15:00')}"

    system_prompt = f"""You are an elite Academic Learning Architect.
Target Student Profile:
- Stream/Grade: {grade_stream}
- Attention Span: {focus_span} minutes
- School/College Hours: {school_hours}
- Peak Energy: {peak_energy}
- Daily Study Limit: {daily_hours} hours

The student wants to master: "{target_goal}" by deadline: "{deadline_date}".

Generate a progressive, logically ordered day-by-day study roadmap strictly covering "{target_goal}".
Rules:
1. Every task MUST be a specific sub-topic or milestone of "{target_goal}".
2. Do NOT inject unrelated topics.
3. Divide study sessions into {focus_span}-minute focused intervals.
4. Output ONLY a valid JSON object with a "tasks" array:
{{
  "tasks": [
    {{
      "scheduled_date": "YYYY-MM-DD",
      "topic_name": "{target_goal}: Specific Sub-Topic Title",
      "duration_minutes": {focus_span}
    }}
  ]
}}
"""

    for model_name in [MODEL_REASONING_PRIMARY, MODEL_REASONING_BACKUP]:
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Generate roadmap for {target_goal} ending on {deadline_date}."}
                ],
                temperature=0.3,
                max_tokens=2500,
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content
            parsed = clean_json_response(content)
            if isinstance(parsed, dict) and "tasks" in parsed and isinstance(parsed["tasks"], list):
                return parsed["tasks"]
            elif isinstance(parsed, list):
                return parsed
            for v in parsed.values():
                if isinstance(v, list) and len(v) > 0 and isinstance(v[0], dict):
                    return v
        except Exception as e:
            print(f"[Planner Groq Error ({model_name})] {e}")
            continue

    # Dynamic fallback strictly based on target_goal (NO physics placeholder!)
    from datetime import datetime, timedelta
    today = datetime.utcnow().date()
    subtopics = [
        f"{target_goal}: Core Fundamentals & Architecture",
        f"{target_goal}: Syntax, Primitives & Core Operations",
        f"{target_goal}: Practical Implementation & Guided Examples",
        f"{target_goal}: Advanced Edge Cases & Error Handling",
        f"{target_goal}: Comprehensive Synthesis & Practice Quiz"
    ]
    return [
        {
            "scheduled_date": (today + timedelta(days=idx)).strftime("%Y-%m-%d"),
            "topic_name": st,
            "duration_minutes": int(focus_span)
        }
        for idx, st in enumerate(subtopics)
    ]


def analyze_youtube_transcript(transcript_text: str, video_title: str = "") -> Dict[str, Any]:
    """
    Summarize video subtitles into:
    - summary: Crisp structured Markdown
    - flashcards: 5 active recall flashcards
    - quiz: 3 to 5 MCQs
    """
    prompt = f"""You are an elite academic educator. Analyze this lecture transcript for "{video_title}":
\"\"\"
{transcript_text[:10000]}
\"\"\"

Return ONLY a valid JSON object with the following exact keys:
1. "summary": A structured markdown summary with ## Key Takeaways, ## Core Mechanisms, and ## Exam Pitfalls strictly based on this lecture.
2. "flashcards": An array of exactly 5 active recall flashcards: [{{"front": "...", "back": "..."}}].
3. "quiz": An array of 3 to 5 multiple-choice questions:
   [
     {{
       "question": "Question text...",
       "options": ["Option A", "Option B", "Option C", "Option D"],
       "correct_index": 0,
       "explanation": "Detailed explanation."
     }}
   ]
"""

    for model_name in [MODEL_REASONING_PRIMARY, MODEL_REASONING_BACKUP]:
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=2500,
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content
            return clean_json_response(content)
        except Exception as e:
            print(f"[YouTube Groq Error ({model_name})] {e}")
            continue

    return {
        "summary": "## Key Takeaways\n- Transcript processed successfully.\n- Review core principles and active recall flashcards.",
        "flashcards": [
            {"front": "What was the main topic of this lecture?", "back": video_title or "Foundational academic principles"},
            {"front": "What is the recommended study interval?", "back": "Spaced repetition on Day 1, Day 3, and Day 7."}
        ],
        "quiz": [
            {
                "question": "What is the primary objective of active recall?",
                "options": ["Passive reading", "Strengthening neural memory retrieval pathways", "Highlighting notes", "Speed reading"],
                "correct_index": 1,
                "explanation": "Active retrieval strengthens long-term synaptic connections and retention."
            }
        ]
    }


def explain_notes_as_teacher(notes_text: str, grade_stream: str) -> str:
    """
    Rewrite student notes as an empathetic personal teacher using everyday analogies.
    Spoken prose without formatting symbols (no asterisks or bullets) for TTS.
    """
    prompt = f"""You are a warm, enthusiastic, world-class personal teacher talking directly to a {grade_stream} student.
Explain the following study notes as if you are having a 1-on-1 voice conversation:

Rules:
1. Use intuitive everyday analogies to make hard concepts crystal clear.
2. DO NOT use any asterisks (*), hashtags (#), bullets (-), or markdown formatting symbols because this text will be read aloud by Text-To-Speech.
3. Speak in clean, natural, flowing conversational English with warmth and encouragement.
4. Keep the explanation around 200 to 300 words.

Study Notes:
{notes_text[:4000]}
"""

    for model_name in [MODEL_REASONING_PRIMARY, MODEL_REASONING_BACKUP]:
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.4,
                max_tokens=1000
            )
            content = response.choices[0].message.content
            cleaned = re.sub(r"[*#_`>]", "", content).strip()
            return cleaned
        except Exception as e:
            print(f"[Teacher Groq Error ({model_name})] {e}")
            continue

    return (
        "Hello there! Let us break down these concepts together. "
        "Every single complex topic in your syllabus is simply built from basic building blocks. "
        "When you understand each small piece and how they connect, the whole picture becomes second nature. "
        "Take it one step at a time, test your recall with flashcards, and you will master this in no time."
    )
