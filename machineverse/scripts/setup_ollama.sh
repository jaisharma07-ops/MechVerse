#!/usr/bin/env bash
# Ollama bootstrapper (macOS / Linux)
# Installs Ollama (if missing) and pulls the two models the gateway is
# configured to use as local fallbacks. Re-running is safe.

set -euo pipefail

if ! command -v ollama >/dev/null 2>&1; then
  echo "[setup_ollama] Ollama not found — installing..."
  curl -fsSL https://ollama.com/install.sh | sh
else
  echo "[setup_ollama] Ollama already installed: $(ollama --version || true)"
fi

if ! pgrep -x ollama >/dev/null 2>&1; then
  echo "[setup_ollama] Starting Ollama daemon..."
  ollama serve >/tmp/ollama.log 2>&1 &
  sleep 2
fi

echo "[setup_ollama] Pulling llama3.2:3b (primary local model, ~2 GB)..."
ollama pull llama3.2:3b

echo "[setup_ollama] Pulling qwen2.5:7b (heavier alternative, ~4.4 GB)..."
ollama pull qwen2.5:7b

echo "[setup_ollama] Done."
echo "Verify with: curl http://localhost:11434/api/tags"
