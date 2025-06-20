#!/bin/bash

# Test script for investor demo
echo "🎯 Testing SOS Investor Demo Dashboard"
echo "======================================"
echo ""

# Check if the app is running
echo "1. Checking if Gadget app is accessible..."
APP_URL="https://sosv02--development.gadget.app"

# Try to access the app
if curl -s -o /dev/null -w "%{http_code}" "$APP_URL" | grep -q "200\|302"; then
    echo "✅ App is accessible"
else
    echo "❌ App is not accessible. Make sure it's deployed."
    exit 1
fi

echo ""
echo "2. Demo Dashboard URLs:"
echo "   - Main Dashboard: $APP_URL/"
echo "   - Investor Demo: $APP_URL/investor-demo"
echo ""

echo "3. Test on different devices:"
echo "   📱 iPhone: Open Safari → Request Desktop Site → Visit URL"
echo "   📱 iPad: Open directly in Safari"
echo "   💻 Desktop: Open in any browser"
echo ""

echo "4. Key Features to Test:"
echo "   ✓ Toggle between 'With SOS' and 'Without'"
echo "   ✓ Tap '+47%' to see conversion breakdown"
echo "   ✓ Swipe or click between 4 tabs"
echo "   ✓ Check all metrics update when toggling"
echo ""

echo "5. Demo Talking Points:"
echo "   • Tab 1: \"47% conversion lift - tap to see how\""
echo "   • Tab 2: \"1.2M verifications recycled - network effect\""
echo "   • Tab 3: \"Smart visitor segmentation - VIP fast lane\""
echo "   • Tab 4: \"14K automated decisions daily - 99.7% accurate\""
echo ""

echo "6. Quick Launch Commands:"
echo "   • Open in browser: open '$APP_URL/investor-demo'"
echo "   • Mobile preview: open -a 'Safari' '$APP_URL/investor-demo'"
echo ""

echo "✅ Demo is ready for investors!"