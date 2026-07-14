@echo off
cd /d "%~dp0"
title MedMinute AI Setup

echo ==============================================
echo         MedMinute AI Setup for Windows
echo ==============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed.
  echo Opening the official Node.js download page...
  start https://nodejs.org/en/download
  echo Install the LTS version, then run this file again.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing MedMinute requirements...
  call npm install
  if errorlevel 1 (
    echo Installation failed.
    pause
    exit /b 1
  )
)

if not exist .env (
  echo.
  echo Your OpenAI API key is required.
  echo It will be saved only in this local folder.
  set /p OPENAI_KEY=Paste your OpenAI API key: 
  if "%OPENAI_KEY%"=="" (
    echo No key entered.
    pause
    exit /b 1
  )
  set /p OPENAI_MODEL_NAME=Model name [gpt-5-mini]: 
  if "%OPENAI_MODEL_NAME%"=="" set OPENAI_MODEL_NAME=gpt-5-mini

  (
    echo OPENAI_API_KEY=%OPENAI_KEY%
    echo OPENAI_MODEL=%OPENAI_MODEL_NAME%
    echo PORT=3000
  ) > .env
)

echo.
echo Starting MedMinute...
start "" http://localhost:3000/ai-tutor.html
call npm start
