#!/bin/bash

# Safe push wrapper for ggt+
# Validates everything before pushing to Gadget

set -e  # Exit on any error

echo "🚀 SOS Safe Push to Gadget"
echo "=========================="
echo "Zero tolerance for errors policy"
echo ""

# Check if we're in the right directory
if [ ! -f "apps/sosv02/package.json" ]; then
    echo "❌ Error: Must run from SOS project root"
    exit 1
fi

# Step 1: Run icon validation
echo "1️⃣ Validating Polaris icons..."
if node 'sos.scripts.validate-polaris-icons.[SPECIFIC].js'; then
    echo "✅ Icons validated"
else
    echo "❌ Icon validation failed - fix errors before pushing"
    exit 1
fi

# Step 2: Check for syntax errors
echo -e "\n2️⃣ Checking JavaScript/TypeScript syntax..."
ERROR_COUNT=0
for file in $(find apps/sosv02/web apps/sosv02/api -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" 2>/dev/null || true); do
    if [ -f "$file" ]; then
        if ! node -c "$file" > /dev/null 2>&1; then
            echo "❌ Syntax error in: $file"
            ERROR_COUNT=$((ERROR_COUNT + 1))
        fi
    fi
done

if [ $ERROR_COUNT -eq 0 ]; then
    echo "✅ No syntax errors found"
else
    echo "❌ Found $ERROR_COUNT syntax errors - fix before pushing"
    exit 1
fi

# Step 3: Check for missing exports
echo -e "\n3️⃣ Validating route exports..."
ROUTE_ERRORS=0
for route in apps/sosv02/web/routes/*.tsx; do
    if [ -f "$route" ]; then
        if ! grep -q "export default" "$route"; then
            echo "❌ Missing default export in: $route"
            ROUTE_ERRORS=$((ROUTE_ERRORS + 1))
        fi
    fi
done

if [ $ROUTE_ERRORS -eq 0 ]; then
    echo "✅ All routes have default exports"
else
    echo "❌ Found $ROUTE_ERRORS route errors"
    exit 1
fi

# Step 4: Check API actions
echo -e "\n4️⃣ Validating API actions..."
ACTION_ERRORS=0
for action in apps/sosv02/api/actions/*.js apps/sosv02/api/actions/*.ts; do
    if [ -f "$action" ] && [[ ! "$action" =~ "checkOrder$" ]]; then  # Skip directory
        if ! grep -q "export.*run" "$action"; then
            echo "❌ Missing 'run' export in: $action"
            ACTION_ERRORS=$((ACTION_ERRORS + 1))
        fi
    fi
done

if [ $ACTION_ERRORS -eq 0 ]; then
    echo "✅ All API actions validated"
else
    echo "❌ Found $ACTION_ERRORS action errors"
    exit 1
fi

# Step 5: Test with ggt+ status
echo -e "\n5️⃣ Checking ggt+ connection..."
cd apps/sosv02
if ../../ggt+ whoami > /dev/null 2>&1; then
    echo "✅ ggt+ is connected"
else
    echo "⚠️  Warning: Not logged in to ggt+"
    echo "Run: ggt+ login"
fi

# Step 6: Perform the push
echo -e "\n6️⃣ All validations passed! Pushing to Gadget..."
echo "Running: ggt+ push"

if ../../ggt+ push; then
    echo ""
    echo "✅ Successfully pushed to Gadget!"
    echo ""
    echo "🎉 Deployment successful with zero errors!"
else
    echo ""
    echo "❌ Push failed - check error messages above"
    exit 1
fi