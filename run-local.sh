#!/bin/bash

echo "Building and starting SOS server with Docker..."
echo "Running from: $(pwd)"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Please run this script from the SOS project root directory."
    exit 1
fi

# Build and start using the simple docker-compose file
docker-compose -f docker-compose.simple.yml build
docker-compose -f docker-compose.simple.yml up

# To run in detached mode, add -d flag:
# docker-compose -f docker-compose.simple.yml up -d
