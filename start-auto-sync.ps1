# Table 1837 Auto-Sync Manager PowerShell Script
# This script starts the auto-sync process that commits and pushes code every 5 minutes

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Table 1837 Auto-Sync Manager" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting auto-sync every 5 minutes..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the auto-sync manager" -ForegroundColor Yellow
Write-Host ""
Write-Host "Log file: auto-sync.log" -ForegroundColor Gray
Write-Host ""

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if the auto-sync script exists
if (-not (Test-Path "auto-sync-every-5min.js")) {
    Write-Host "❌ Auto-sync script not found: auto-sync-every-5min.js" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "🚀 Starting auto-sync manager..." -ForegroundColor Green
Write-Host ""

# Start the auto-sync process
try {
    node auto-sync-every-5min.js
} catch {
    Write-Host "❌ Error starting auto-sync: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Auto-sync manager stopped." -ForegroundColor Yellow
Read-Host "Press Enter to exit" 