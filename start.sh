#!/bin/bash
echo "Starting SOS services..."

# Start Redis if not running
if ! docker ps | grep -q sos-redis; then
  docker run --name sos-redis -p 6379:6379 -d redis:7-alpine
fi

# Start the API service
node services/lookup-aggregator/src/index.js &

# Start web UI
cd apps/shopify-app/frontend && python3 -m http.server 8080 &

echo "✅ SOS is running!"
echo "🌐 Web UI: http://localhost:8080"
echo "🔌 API: http://localhost:3001/api/lookup"

wait
