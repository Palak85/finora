Set-Location "$PSScriptRoot\backend"
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting Finora Backend at http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "Swagger UI: http://127.0.0.1:8000/api/docs/" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
& ".\venv\Scripts\python.exe" manage.py runserver 127.0.0.1:8000
