#!/bin/bash

# Dashboard Verification Script for SOS App
# Usage: ./check-dashboard.sh

echo "🔍 SOS Dashboard Verification Tool"
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URLs to check
PREVIEW_URL="https://sosv02--development.gadget.app"
EDITOR_URL="https://sosv02.gadget.app/edit/development"

echo -e "\n📋 Checking Dashboard Components:"
echo "1. AI Store Assistant"
echo "2. Sales/Orders/Risk Metrics"
echo "3. Recent Fraud Checks Table"
echo "4. Shopify Polaris UI"

# Function to check a URL
check_url() {
    local url=$1
    local name=$2
    echo -e "\n🌐 Checking $name..."
    echo "   URL: $url"
    
    # Use curl to check if URL is accessible
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|302"; then
        echo -e "   Status: ${GREEN}✓ Accessible${NC}"
    else
        echo -e "   Status: ${RED}✗ Not accessible (may require auth)${NC}"
    fi
}

# Check URLs
check_url "$PREVIEW_URL" "Preview Environment"
check_url "$EDITOR_URL" "Gadget Editor"

echo -e "\n📝 Next Steps:"
echo "1. If preview requires auth, install the app on a Shopify dev store"
echo "2. Access via Shopify admin panel > Apps > SOS"
echo "3. Or use Gadget editor to preview changes"

echo -e "\n🤖 AI Assistant Features to Verify:"
echo "- Text input field with placeholder 'What were my sales yesterday?'"
echo "- 'Ask AI' button (should be blue/primary)"
echo "- Response area below input"
echo "- Demo responses for 'sales' and 'fraud' queries"

echo -e "\n✅ Dashboard Ready Checklist:"
echo "- [ ] ggt dev is running"
echo "- [ ] No TypeScript errors in console"
echo "- [ ] Polaris components rendering correctly"
echo "- [ ] AI Assistant section visible"
echo "- [ ] Fraud checks table populated"

echo -e "\n🚀 Quick Test Commands:"
echo "cd /Users/jarvis/Downloads/development/SOS/apps/sosv02/apps/sosv02"
echo "/Users/jarvis/Downloads/development/SOS/ggt+ dev"