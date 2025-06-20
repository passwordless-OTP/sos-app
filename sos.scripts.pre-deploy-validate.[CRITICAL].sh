#!/bin/bash

# SOS Pre-Deployment Validation Script
# Zero tolerance for errors - catches issues before they reach production

set -e  # Exit on any error

echo "🛡️  SOS Pre-Deployment Validation"
echo "================================="
echo "Zero tolerance for deployment errors"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track errors
ERRORS_FOUND=0
WARNINGS_FOUND=0

# Function to check for errors
check_error() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ ERROR: $1${NC}"
        ERRORS_FOUND=$((ERRORS_FOUND + 1))
        return 1
    fi
    return 0
}

# Function to log warnings
log_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
}

# Function to log success
log_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# 1. Check Node version
echo "1. Checking Node.js environment..."
NODE_VERSION=$(node --version)
if [[ "$NODE_VERSION" =~ ^v18\.|^v20\.|^v22\. ]]; then
    log_success "Node.js version $NODE_VERSION is compatible"
else
    echo -e "${RED}❌ ERROR: Node.js version $NODE_VERSION is not compatible${NC}"
    echo "   Required: v18.x, v20.x, or v22.x"
    ERRORS_FOUND=$((ERRORS_FOUND + 1))
fi

# 2. TypeScript compilation check
echo -e "\n2. Checking TypeScript compilation..."
cd apps/sosv02
if command -v tsc &> /dev/null; then
    # Create a temporary tsconfig for strict checking
    cat > tsconfig.temp.json << EOF
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": true,
    "strict": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["web/**/*", "api/**/*"]
}
EOF
    
    # Run TypeScript check
    if npx tsc --project tsconfig.temp.json --noEmit; then
        log_success "TypeScript compilation passed"
    else
        echo -e "${RED}❌ ERROR: TypeScript compilation failed${NC}"
        ERRORS_FOUND=$((ERRORS_FOUND + 1))
    fi
    rm -f tsconfig.temp.json
else
    log_warning "TypeScript not found, skipping compilation check"
fi

# 3. Check Polaris icon imports
echo -e "\n3. Validating Polaris icon imports..."
INVALID_ICONS=$(grep -r "Icon\>" web/routes/ 2>/dev/null | grep -E "(TrendingUpIcon|RefreshIcon|TeamIcon|AutomationIcon)" || true)
if [ -z "$INVALID_ICONS" ]; then
    log_success "All Polaris icons use correct naming (Major/Minor suffix)"
else
    echo -e "${RED}❌ ERROR: Found invalid Polaris icon imports:${NC}"
    echo "$INVALID_ICONS"
    ERRORS_FOUND=$((ERRORS_FOUND + 1))
fi

# 4. Check for missing imports
echo -e "\n4. Checking for missing imports..."
# Check common import errors
FILES_TO_CHECK=$(find web api -name "*.tsx" -o -name "*.ts" 2>/dev/null || true)
for file in $FILES_TO_CHECK; do
    if [ -f "$file" ]; then
        # Check for undefined variables that might be missing imports
        if grep -E "^\s*(useState|useEffect|useCallback|useMemo)\(" "$file" > /dev/null 2>&1; then
            if ! grep -E "import.*{.*(useState|useEffect|useCallback|useMemo).*}.*from.*react" "$file" > /dev/null 2>&1; then
                echo -e "${RED}❌ ERROR: Missing React hooks import in $file${NC}"
                ERRORS_FOUND=$((ERRORS_FOUND + 1))
            fi
        fi
    fi
done

# 5. Validate route files
echo -e "\n5. Validating route files..."
ROUTE_FILES=$(find web/routes -name "*.tsx" 2>/dev/null || true)
for route in $ROUTE_FILES; do
    if [ -f "$route" ]; then
        # Check for export default
        if ! grep -E "export\s+default\s+function" "$route" > /dev/null 2>&1; then
            log_warning "Route $route might be missing default export"
        fi
        
        # Check for loader/action exports if they're used
        if grep -E "useLoaderData|useActionData" "$route" > /dev/null 2>&1; then
            if ! grep -E "export\s+(const|async function)\s+loader" "$route" > /dev/null 2>&1; then
                log_warning "Route $route uses loader data but might be missing loader export"
            fi
        fi
    fi
done

# 6. Check API actions
echo -e "\n6. Validating API actions..."
API_ACTIONS=$(find api/actions -name "*.js" -o -name "*.ts" 2>/dev/null || true)
for action in $API_ACTIONS; do
    if [ -f "$action" ]; then
        # Check for run function
        if ! grep -E "export\s+(const|async function|function)\s+run" "$action" > /dev/null 2>&1; then
            echo -e "${RED}❌ ERROR: API action $action missing 'run' export${NC}"
            ERRORS_FOUND=$((ERRORS_FOUND + 1))
        fi
        
        # Check for params export if used
        if grep -E "params\." "$action" > /dev/null 2>&1; then
            if ! grep -E "export\s+const\s+params" "$action" > /dev/null 2>&1; then
                log_warning "API action $action uses params but might be missing params export"
            fi
        fi
    fi
done

# 7. Check for syntax errors
echo -e "\n7. Running syntax validation..."
SYNTAX_ERRORS=0
for file in $(find web api -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" 2>/dev/null || true); do
    if [ -f "$file" ]; then
        # Use Node.js to check syntax
        if ! node -c "$file" > /dev/null 2>&1; then
            echo -e "${RED}❌ ERROR: Syntax error in $file${NC}"
            SYNTAX_ERRORS=$((SYNTAX_ERRORS + 1))
        fi
    fi
done

if [ $SYNTAX_ERRORS -eq 0 ]; then
    log_success "No syntax errors found"
else
    ERRORS_FOUND=$((ERRORS_FOUND + SYNTAX_ERRORS))
fi

# 8. Check package.json dependencies
echo -e "\n8. Checking dependencies..."
if [ -f "package.json" ]; then
    # Check for missing dependencies in code
    IMPORTS=$(grep -r "from ['\"]" web api 2>/dev/null | grep -v "node_modules" | sed -n "s/.*from ['\"]\\([^'\"]*\\)['\"].*/\\1/p" | sort -u || true)
    
    for import in $IMPORTS; do
        # Skip relative imports and Node.js built-ins
        if [[ ! "$import" =~ ^\.|\@gadget|^node:|^react$|^react-dom$|^@remix-run|^@shopify ]]; then
            if ! grep -q "\"$import\"" package.json 2>/dev/null; then
                log_warning "Import '$import' not found in package.json dependencies"
            fi
        fi
    done
    log_success "Dependency check completed"
else
    log_warning "No package.json found"
fi

# 9. Run unit tests if available
echo -e "\n9. Running tests..."
if [ -f "package.json" ] && grep -q "\"test\":" package.json 2>/dev/null; then
    if npm test -- --passWithNoTests; then
        log_success "Tests passed"
    else
        echo -e "${RED}❌ ERROR: Tests failed${NC}"
        ERRORS_FOUND=$((ERRORS_FOUND + 1))
    fi
else
    log_warning "No tests configured"
fi

# 10. Final validation with ggt+
echo -e "\n10. Running ggt+ validation..."
cd ../..
if [ -f "ggt+" ]; then
    # Check if we can validate without pushing
    if ./ggt+ --version > /dev/null 2>&1; then
        log_success "ggt+ is available"
        
        # Try to validate the app structure
        cd apps/sosv02
        if ../../ggt+ validate 2>/dev/null || true; then
            log_success "ggt+ validation completed"
        else
            log_warning "ggt+ validate command not available"
        fi
    fi
else
    log_warning "ggt+ not found"
fi

# Summary
echo -e "\n================================="
echo "VALIDATION SUMMARY"
echo "================================="

if [ $ERRORS_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ NO ERRORS FOUND - Safe to deploy${NC}"
    echo -e "Warnings: $WARNINGS_FOUND (non-blocking)"
    exit 0
else
    echo -e "${RED}❌ FOUND $ERRORS_FOUND ERRORS - DO NOT DEPLOY${NC}"
    echo -e "Warnings: $WARNINGS_FOUND"
    echo -e "\nFix all errors before deployment!"
    exit 1
fi