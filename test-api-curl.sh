#!/bin/bash

# Test Gadget API with curl
API_KEY="${GADGET_API_KEY:-your-api-key-here}"
API_URL="https://sosv02--development.gadget.app/api/graphql"

echo "🔍 Testing Gadget API with curl"
echo ""

# Test 1: Get shops
echo "1️⃣ Fetching shops..."
curl -s -X POST $API_URL \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ shopifyShops { edges { node { id domain currency } } } }"}' | jq '.'

echo -e "\n2️⃣ Testing getTodaysSales..."
# First get a shop ID, then test getTodaysSales
SHOP_ID=$(curl -s -X POST $API_URL \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ shopifyShops(first: 1) { edges { node { id } } } }"}' | jq -r '.data.shopifyShops.edges[0].node.id')

if [ "$SHOP_ID" != "null" ] && [ -n "$SHOP_ID" ]; then
  echo "Found shop ID: $SHOP_ID"
  
  curl -s -X POST $API_URL \
    -H "Authorization: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"query\":\"mutation { getTodaysSales(shopId: \\\"$SHOP_ID\\\") { success errors { message } result } }\"}" | jq '.'
else
  echo "No shop found or authentication failed"
fi

echo -e "\n3️⃣ Checking fraud checks..."
curl -s -X POST $API_URL \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ fraudChecks(first: 5) { edges { node { id orderId riskScore status } } } }"}' | jq '.'