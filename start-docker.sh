#!/bin/bash

# Quick start script for Docker deployment
# Uses your existing .env file and Supabase database

echo ""
echo "=========================================="
echo "  finapp - Docker Quick Start"
echo "=========================================="
echo ""
echo "Using your existing .env configuration"
echo "Database: Supabase PostgreSQL"
echo ""

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "[ERROR] Docker is not running!"
    echo "Please start Docker and try again."
    exit 1
fi

echo "[1/4] Stopping existing containers..."
docker-compose down

echo ""
echo "[2/4] Building Docker image..."
docker-compose build

echo ""
echo "[3/4] Starting services..."
docker-compose up -d

echo ""
echo "[4/4] Waiting for services to be healthy..."
sleep 10

echo ""
echo "=========================================="
echo "  finapp is running!"
echo "=========================================="
echo ""
echo "  App:      http://localhost:8080"
echo "  Database: Supabase (remote)"
echo ""
echo "Commands:"
echo "  View logs:    docker-compose logs -f app"
echo "  Stop:         docker-compose down"
echo "  Restart:      docker-compose restart"
echo ""

# Check if app is healthy
echo "Checking application health..."
sleep 5
if curl -sf http://localhost:8080/actuator/health >/dev/null 2>&1; then
    echo "[SUCCESS] Application is healthy!"
else
    echo "[WARNING] App may still be starting up..."
    echo "Run 'docker-compose logs app' to check status"
fi

echo ""
echo "Opening application in browser..."
if command -v xdg-open >/dev/null; then
    xdg-open http://localhost:8080
elif command -v open >/dev/null; then
    open http://localhost:8080
fi

echo ""
echo "To stop: docker-compose down"
echo ""
