#!/bin/bash

# Test just the getTodaysSales action
API_KEY="${GADGET_API_KEY:-your-api-key-here}"
API_URL="https://sosv02--development.gadget.app/api/graphql"

echo "🔍 Testing getTodaysSales action directly"
echo ""

# Test with hardcoded shop ID
echo "Testing getTodaysSales with shopId '1'..."
curl -s -X POST $API_URL \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { getTodaysSales(shopId: \"1\") { success errors { message } result } }"}' | jq '.'