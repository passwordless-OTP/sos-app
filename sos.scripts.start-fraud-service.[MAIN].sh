#!/bin/bash

# SOS Fraud Detection Service Starter
# This script starts the lookup-aggregator service for fraud detection

echo "🚀 Starting SOS Fraud Detection Service..."

# Check if we're in the right directory
if [ ! -d "services/lookup-aggregator" ]; then
    echo "❌ Error: services/lookup-aggregator directory not found"
    echo "Please run this script from the SOS project root directory"
    exit 1
fi

# Navigate to service directory
cd services/lookup-aggregator

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "📝 Created .env file. Please add your API keys:"
        echo "   - ABUSEIPDB_API_KEY"
        echo "   - EMAILREP_API_KEY"
        echo "   - NUMVERIFY_API_KEY"
    else
        # Create a basic .env file
        cat > .env << EOF
# Fraud Detection API Keys
ABUSEIPDB_API_KEY=
EMAILREP_API_KEY=
NUMVERIFY_API_KEY=

# Redis URL (optional, defaults to localhost)
REDIS_URL=redis://localhost:6379

# Service Port
PORT=3001
EOF
        echo "📝 Created .env file with defaults"
    fi
fi

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
    echo "⚠️  Warning: Redis is not running. Starting Redis..."
    if command -v redis-server > /dev/null; then
        redis-server --daemonize yes
        echo "✅ Redis started"
    else
        echo "❌ Redis is not installed. The service will work but without caching."
        echo "Install Redis with: brew install redis"
    fi
fi

# Start the service
echo ""
echo "🔍 Starting Fraud Detection Service on port 3001..."
echo "📊 Dashboard: http://localhost:3001/health"
echo "📝 Logs will appear below. Press Ctrl+C to stop."
echo "----------------------------------------"

# Use the updated version with multiple API support
node src/index-updated.js