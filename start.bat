@echo off
REM Prompt Economy - Quick Start Script for Windows
REM This script helps you set up and run the application quickly

echo ======================================
echo    Prompt Economy - Quick Start
echo ======================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

node -v
echo Node.js is installed

REM Check if MongoDB is installed
where mongod >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: MongoDB is not installed or not in PATH
    echo Please install MongoDB from https://www.mongodb.com/
    echo.
)

REM Check if npm packages are installed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm run install:all
    echo Dependencies installed
) else (
    echo Dependencies already installed
)

REM Check environment files
if not exist "backend\.env" (
    echo WARNING: backend\.env not found
    echo Please copy .env.example and configure it
    echo See SETUP_GUIDE.md for details
    echo.
)

if not exist "blockchain\.env" (
    echo WARNING: blockchain\.env not found  
    echo You'll need to create blockchain\.env with your Infura key
    echo See SETUP_GUIDE.md for details
    echo.
)

echo.
echo ======================================
echo    Starting Application
echo ======================================
echo.
echo Starting both backend and frontend...
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
echo Press Ctrl+C to stop the servers
echo.

call npm run dev:full
