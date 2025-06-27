#!/bin/bash
# Automated development startup script for AI agents

# Load environment variables
source "$(dirname "$0")/../.env.development"

echo "🚀 Starting SOS Development Environment..."

# 1. Ensure correct Node version
echo "📦 Setting Node version to $REQUIRED_NODE_VERSION..."
nvm use $REQUIRED_NODE_VERSION

# 2. Navigate to Gadget app
echo "📁 Navigating to Gadget app directory..."
cd "$GADGET_APP_DIR"

# 3. Kill any existing ggt processes
echo "🔄 Cleaning up existing processes..."
pkill -f "ggt dev" 2>/dev/null || true

# 4. Start ggt dev in background
echo "🔗 Starting ggt dev sync..."
nohup ggt dev > "$GGT_LOG_FILE" 2>&1 &
GGT_PID=$!

# 5. Wait for startup
echo "⏳ Waiting for ggt to initialize..."
sleep 5

# 6. Verify ggt is running
if ps -p $GGT_PID > /dev/null; then
    echo "✅ ggt dev is running (PID: $GGT_PID)"
else
    echo "❌ Failed to start ggt dev"
    exit 1
fi

# 7. Test endpoints
echo "🧪 Testing endpoints..."
for url in "$MAIN_APP_URL" "$INVESTOR_DEMO_URL"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    if [ "$STATUS" = "200" ]; then
        echo "✅ $url - OK"
    else
        echo "⚠️  $url - Status: $STATUS"
    fi
done

echo ""
echo "📊 Development environment ready!"
echo "📝 Logs: tail -f $GGT_LOG_FILE"
echo "🔍 Status: ggt status"
echo "🛑 Stop: pkill -f 'ggt dev'"