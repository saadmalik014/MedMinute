#!/bin/bash
set -e
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed. Run SETUP_MEDMINUTE_AI.command first."
  read -p "Press Enter to close..."
  exit 1
fi

if [ ! -f ".env" ] || [ ! -d "node_modules" ]; then
  echo "MedMinute has not been set up yet."
  echo "Launching setup..."
  exec ./SETUP_MEDMINUTE_AI.command
fi

npm start &
SERVER_PID=$!
sleep 2
open "http://localhost:3000/ai-tutor.html"
echo "MedMinute is running. Press Control+C to stop."
wait $SERVER_PID
