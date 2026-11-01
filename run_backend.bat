@echo off
echo ========================================================
echo Starting AI Study & Career Buddy - FastAPI Backend (Port 8000)
echo ========================================================
cd backend
python -m uvicorn main:app --reload --port 8000
pause

