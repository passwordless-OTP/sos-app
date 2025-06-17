#!/bin/bash

echo "🔍 Testing Gadget API Directly"
echo ""

# Get the API URL from ggt status
API_URL="https://sosv02--development.gadget.app"

echo "1️⃣ Testing API Playground:"
echo "   URL: https://sosv02.gadget.app/api/playground/javascript?environment=development"
open "https://sosv02.gadget.app/api/playground/javascript?environment=development"

echo ""
echo "2️⃣ Opening Gadget Editor to run queries:"
echo "   URL: https://sosv02.gadget.app/edit/development"
open "https://sosv02.gadget.app/edit/development"

echo ""
echo "📝 Sample queries to run in the playground:"
echo ""
echo "// Get shops"
echo "const shops = await api.shopifyShop.findMany();"
echo "console.log(shops);"
echo ""
echo "// Test getTodaysSales"
echo "const result = await api.getTodaysSales({ shopId: '1' });"
echo "console.log(result);"
echo ""
echo "// Get fraud checks"
echo "const checks = await api.fraudCheck.findMany({ first: 5 });"
echo "console.log(checks);"