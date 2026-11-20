@echo off
title NexusAI Backend Server
echo Starting NexusAI FastAPI Backend on http://localhost:8000...
cd /d "%~dp0backend"
if exist .venv\Scripts\python.exe (
    .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
) else (
    echo Python virtual environment not found in %~dp0backend\.venv!
    echo Please create the virtual environment first.
    pause
)
