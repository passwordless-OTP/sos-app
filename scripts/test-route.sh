#!/bin/bash
# Test a specific route and show detailed response

ROUTE=${1:-"/"}
source "$(dirname "$0")/../.env.development"

URL="${MAIN_APP_URL}${ROUTE}"

echo "🧪 Testing: $URL"
echo "------------------------"

# Get response with timing
RESPONSE=$(curl -s -w "\n\nTime: %{time_total}s\nStatus: %{http_code}" -I "$URL")

# Parse status
STATUS=$(echo "$RESPONSE" | grep "Status:" | awk '{print $2}')

# Show results
echo "$RESPONSE" | head -10

# Color-coded status
if [ "$STATUS" = "200" ]; then
    echo -e "\n✅ Route is working"
elif [ "$STATUS" = "500" ]; then
    echo -e "\n❌ Server error - check logs:"
    echo "tail -f $GGT_LOG_FILE | grep -A10 'ERROR'"
elif [ "$STATUS" = "404" ]; then
    echo -e "\n⚠️  Route not found"
else
    echo -e "\n⚠️  Unexpected status: $STATUS"
fi