# AAPADAMITRA Development Setup Script (Windows 10 / PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   AAPADAMITRA — Initializing Development Environment     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Install pnpm dependencies
Write-Host "`n[1/3] Installing monorepo dependencies with pnpm..." -ForegroundColor Yellow
pnpm install

# 2. Build shared contracts
Write-Host "`n[2/3] Compiling @aapadamitra/contracts..." -ForegroundColor Yellow
pnpm --filter @aapadamitra/contracts build

# 3. Setup Python AI Engine virtual environment
Write-Host "`n[3/3] Setting up Python AI Engine virtual environment..." -ForegroundColor Yellow
$aiDir = Join-Path $PSScriptRoot "..\services\ai-engine"
Push-Location $aiDir
try {
    if (-not (Test-Path ".venv")) {
        Write-Host "Creating Python virtual environment in $aiDir\.venv..."
        python -m venv .venv
    }
    Write-Host "Installing Python requirements..."
    & ".\.venv\Scripts\pip.exe" install -r requirements.txt
} finally {
    Pop-Location
}

Write-Host "`n[SUCCESS] AAPADAMITRA development environment initialized successfully!" -ForegroundColor Green
Write-Host "Use 'pnpm dev:api' to start backend, 'pnpm dev:web' for frontend, and run uvicorn in services/ai-engine." -ForegroundColor Cyan

