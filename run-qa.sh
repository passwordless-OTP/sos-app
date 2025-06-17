#!/bin/bash

# Quick QA Check - Run after every change
echo "🤖 Running Automated QA..."
echo "========================="

# Set up colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Run the automated tests
cd test-framework
node automated-qa.js

# Check exit code
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ All tests passed! Safe to continue.${NC}"
    
    # Optional: Open latest screenshots
    echo -e "\n📸 Opening test results..."
    open results/
else
    echo -e "\n${RED}❌ Tests failed! Check the report.${NC}"
    
    # Show which tests failed
    echo -e "\nFailed tests:"
    cat results/qa-report-*.json | jq '.tests[] | select(.status == "failed") | .name'
fi