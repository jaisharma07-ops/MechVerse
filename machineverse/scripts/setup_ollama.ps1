# Ollama bootstrapper (Windows)
# Installs Ollama via winget (if missing) and pulls the two models the gateway
# is configured to use as local fallbacks. Re-running is safe — pulls are
# no-ops if the model is already present.

$ErrorActionPreference = "Stop"

function Test-Cmd($name) {
  $null -ne (Get-Command $name -ErrorAction SilentlyContinue)
}

if (-not (Test-Cmd "ollama")) {
  Write-Host "[setup_ollama] Ollama not found — installing via winget..." -ForegroundColor Yellow
  winget install --id=Ollama.Ollama --accept-package-agreements --accept-source-agreements --silent
  Write-Host "[setup_ollama] Installed. You may need to reopen your terminal so `ollama` is on PATH." -ForegroundColor Green
} else {
  Write-Host "[setup_ollama] Ollama already installed: $(ollama --version)" -ForegroundColor Green
}

Write-Host "[setup_ollama] Ensuring Ollama daemon is running..." -ForegroundColor Cyan
$daemon = Get-Process ollama -ErrorAction SilentlyContinue
if (-not $daemon) {
  Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
  Start-Sleep -Seconds 2
}

Write-Host "[setup_ollama] Pulling llama3.2:3b (primary local model, ~2 GB)..." -ForegroundColor Cyan
ollama pull llama3.2:3b

Write-Host "[setup_ollama] Pulling qwen2.5:7b (heavier alternative, ~4.4 GB)..." -ForegroundColor Cyan
ollama pull qwen2.5:7b

Write-Host "[setup_ollama] Done." -ForegroundColor Green
Write-Host "Verify with: curl http://localhost:11434/api/tags" -ForegroundColor Gray
