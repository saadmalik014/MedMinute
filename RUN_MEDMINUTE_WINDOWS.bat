@echo off
cd /d "%~dp0"
if not exist .env (
  call SETUP_MEDMINUTE_AI_WINDOWS.bat
  exit /b
)
if not exist node_modules (
  call SETUP_MEDMINUTE_AI_WINDOWS.bat
  exit /b
)
start "" http://localhost:3000/ai-tutor.html
call npm start
