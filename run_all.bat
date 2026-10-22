@echo off
title Finora Full-Stack Launcher
echo ========================================================
echo Starting Finora Banking & Financial Dashboard
echo ========================================================
start "Finora Backend" cmd /k "%~dp0run_backend.bat"
timeout /t 3 >nul
start "Finora Frontend" cmd /k "%~dp0run_frontend.bat"
echo.
echo Both servers have been launched in separate console windows!
echo - Frontend App: http://localhost:5173
echo - Backend API & Swagger: http://127.0.0.1:8000/api/docs/
echo.
echo Demo Logins:
echo   Customer: customer@finora.com / Password123!
echo   Advisor:  advisor@finora.com  / Password123!
echo   Admin:    admin@finora.com    / Password123!
echo.
pause
