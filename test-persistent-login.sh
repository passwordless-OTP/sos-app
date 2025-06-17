#!/bin/bash

echo "🔍 Testing Persistent Login"
echo "=========================="
echo ""
echo "This will launch the browser with your saved session."
echo "If you're already logged in, it should go directly to the Gadget editor."
echo ""
echo "Press Enter to continue..."
read

cd /Users/jarvis/Downloads/development/SOS
node browser-config-fixed.js