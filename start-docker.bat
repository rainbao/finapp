@echo off
REM Quick start script for Docker deployment
REM Uses your existing .env file and Supabase database

echo.
echo ==========================================
echo   finapp - Docker Quick Start
echo ==========================================
echo.
echo Using your existing .env configuration
echo Database: Supabase PostgreSQL
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [1/4] Stopping existing containers...
docker-compose down

echo.
echo [2/4] Building Docker image...
docker-compose build

echo.
echo [3/4] Starting services...
docker-compose up -d

echo.
echo [4/4] Waiting for services to be healthy...
timeout /t 10 /nobreak >nul

echo.
echo ==========================================
echo   finapp is running!
echo ==========================================
echo.
echo   App:      http://localhost:8080
echo   Database: Supabase (remote)
echo.
echo Commands:
echo   View logs:    docker-compose logs -f app
echo   Stop:         docker-compose down
echo   Restart:      docker-compose restart
echo.

REM Check if app is healthy
echo Checking application health...
timeout /t 5 /nobreak >nul
curl -s http://localhost:8080/actuator/health >nul 2>&1
if errorlevel 1 (
    echo [WARNING] App may still be starting up...
    echo Run 'docker-compose logs app' to check status
) else (
    echo [SUCCESS] Application is healthy!
)

echo.
echo Press any key to open the application in your browser...
pause >nul
start http://localhost:8080

echo.
echo To stop: docker-compose down
echo.
