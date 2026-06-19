@echo off
title QRPay Pro - Local Launchpad
color 0B

echo ===================================================
echo             WELCOME TO QRPAY PRO LAUNCHER
echo ===================================================
echo.
echo [1/3] Checking environment & dependencies...

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo ERROR: Node.js is not installed or not in system PATH.
    echo Please install Node.js from https://nodejs.org/ before running.
    pause
    exit /b
)

:: Install dependencies if node_modules doesn't exist
if not exist "node_modules\" (
    echo node_modules folder not found. Installing dependencies...
    call npm install
) else (
    echo Dependencies are already installed.
)

echo.
echo [2/3] Checking MongoDB Connection...
echo Make sure MongoDB is running at mongodb://localhost:27017/
echo.

echo [3/3] Launching QRPay Pro (Backend & Frontend)...
echo.
echo ***************************************************
echo   - Frontend: http://localhost:5173
echo   - Backend: http://localhost:5000
echo ***************************************************
echo.
echo Press Ctrl+C in this window to stop the servers.
echo.

:: Start the workspace dev servers
call npm run dev

pause
