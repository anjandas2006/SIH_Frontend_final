@echo off
title BusSense AI - Fullstack System Runner (24*7)
color 0B
echo ================================================================
echo       BusSense AI: Mobile Urban Intelligence Platform
echo ================================================================
echo.
echo [1/2] Starting Python FastAPI Backend on http://127.0.0.1:8000 ...
start "BusSense Backend (FastAPI)" cmd /k "cd /d C:\Users\victus\Downloads\sih_backend && venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload"

echo Waiting for backend initialization...
timeout /t 3 /nobreak > nul

echo [2/2] Starting Vite React Frontend on http://127.0.0.1:5173 ...
start "BusSense Frontend (Vite)" cmd /k "cd /d C:\Users\victus\Downloads\sih_frontend && npx vite --host 0.0.0.0 --port 5173"

echo.
echo ================================================================
echo BOTH FRONTEND AND BACKEND ARE NOW RUNNING TOGETHER!
echo.
echo  Localhost Link:   http://localhost:5173
echo  Network Link:     http://127.0.0.1:5173
echo  Backend Swagger:  http://127.0.0.1:8000/docs
echo  Live Cloud Link:  https://sih-frontend-delta.vercel.app
echo ================================================================
pause
