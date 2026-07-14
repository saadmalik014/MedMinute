#!/bin/bash
set -e
cd "$(dirname "$0")"

clear
echo "=============================================="
echo "        MedMinute AI Setup for macOS"
echo "=============================================="
echo

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed."
  echo "Opening the official Node.js download page..."
  open "https://nodejs.org/en/download"
  echo
  echo "Install the LTS version, then run this file again."
  read -p "Press Enter to close..."
  exit 1
fi

NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "Node.js 20 or newer is required."
  open "https://nodejs.org/en/download"
  read -p "Press Enter to close..."
  exit 1
fi

echo "Node.js detected: $(node --version)"
echo

if [ ! -d "node_modules" ]; then
  echo "Installing MedMinute requirements..."
  npm install
else
  echo "Requirements are already installed."
fi

echo
if [ ! -f ".env" ]; then
  echo "Your OpenAI API key is required."
  echo "It will be saved only in this private local folder."
  echo "Do not share the key with anyone."
  echo
  read -s -p "Paste your OpenAI API key: " OPENAI_KEY
  echo
  if [ -z "$OPENAI_KEY" ]; then
    echo "No key was entered."
    read -p "Press Enter to close..."
    exit 1
  fi
  echo
  read -p "Model name [gpt-5-mini]: " OPENAI_MODEL_NAME
  OPENAI_MODEL_NAME=${OPENAI_MODEL_NAME:-gpt-5-mini}

  cat > .env <<EOF
OPENAI_API_KEY=$OPENAI_KEY
OPENAI_MODEL=$OPENAI_MODEL_NAME
PORT=3000
EOF
  chmod 600 .env
  echo ".env created securely."
else
  echo "Existing .env file found."
fi

echo
echo "Starting MedMinute..."
echo "Keep this Terminal window open while using the AI."
echo
npm start &
SERVER_PID=$!

sleep 3
open "http://localhost:3000/ai-tutor.html"

echo
echo "MedMinute AI Tutor should now be open in your browser."
echo "Press Control+C in this window to stop the server."
wait $SERVER_PID
