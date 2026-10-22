Set-Location "$PSScriptRoot\frontend"
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting Finora Frontend at http://localhost:5173" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
npm run dev
