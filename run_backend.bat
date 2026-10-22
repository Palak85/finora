@echo off
title Finora Backend (Django)
cd /d "%~dp0backend"
echo ========================================================
echo Starting Finora Backend at http://127.0.0.1:8000
echo Swagger UI Docs: http://127.0.0.1:8000/api/docs/
echo ========================================================
call .\venv\Scripts\activate
python manage.py runserver 127.0.0.1:8000
pause
