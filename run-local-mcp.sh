#!/bin/bash

# Virtualized run-local.sh for MCP environment
# This script runs Docker commands from the virtualized path

echo "========================================="
echo "SOS Docker Runner (MCP Environment)"
echo "========================================="

# Set the project directory
PROJECT_DIR="/projects/Downloads/development/SOS"

# Check if directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo "Error: Project directory not found at $PROJECT_DIR"
    exit 1
fi

# Navigate to project directory
cd "$PROJECT_DIR" || exit 1

echo "Working directory: $(pwd)"

# Check for required files
echo "Checking for required files..."
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found in $PROJECT_DIR"
    exit 1
fi

if [ ! -f "docker-compose.simple.yml" ]; then
    echo "Error: docker-compose.simple.yml not found"
    exit 1
fi

if [ ! -f "infrastructure/docker/Dockerfile.fixed" ]; then
    echo "Error: Dockerfile.fixed not found"
    exit 1
fi

echo "✓ All required files found"
echo ""

# Display current Docker status
echo "Current Docker containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(NAME|redis|sos)" || echo "No relevant containers running"
echo ""

# Check for port conflicts
echo "Checking for port conflicts..."
if lsof -i :6001 > /dev/null 2>&1; then
    echo "Warning: Port 6001 is already in use"
fi

if docker ps | grep -q "0.0.0.0:6379->6379"; then
    echo "Info: Redis is already running on port 6379 (container: $(docker ps --format '{{.Names}}' | grep redis))"
fi
echo ""

# Build and run
echo "Building Docker image..."
docker-compose -f docker-compose.simple.yml build

echo ""
echo "Starting services..."
docker-compose -f docker-compose.simple.yml up

# Alternative commands that can be used:
# docker-compose -f docker-compose.simple.yml up -d     # Run in background
# docker-compose -f docker-compose.simple.yml logs -f  # Follow logs
# docker-compose -f docker-compose.simple.yml down     # Stop and remove containers
