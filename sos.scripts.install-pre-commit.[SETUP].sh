#!/bin/bash

# Install pre-commit validation hook

echo "📦 Installing pre-commit validation hook..."

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Create the pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# SOS Pre-commit validation hook
# Prevents committing code with known errors

echo "🛡️ Running pre-commit validation..."

# Run Polaris icon validation
if [ -f "sos.scripts.validate-polaris-icons.[SPECIFIC].js" ]; then
    echo "Checking Polaris icons..."
    if ! node "sos.scripts.validate-polaris-icons.[SPECIFIC].js"; then
        echo "❌ Commit blocked: Fix Polaris icon errors first"
        exit 1
    fi
fi

# Check for console.log statements in production code
echo "Checking for console.log statements..."
CONSOLE_LOGS=$(git diff --cached --name-only | grep -E "\.(js|jsx|ts|tsx)$" | xargs grep -l "console\.log" 2>/dev/null || true)
if [ ! -z "$CONSOLE_LOGS" ]; then
    echo "⚠️  Warning: console.log found in:"
    echo "$CONSOLE_LOGS"
    echo "Consider removing console.log statements before committing"
fi

# Check for TypeScript errors in changed files
echo "Checking TypeScript in changed files..."
CHANGED_TS_FILES=$(git diff --cached --name-only | grep -E "\.(ts|tsx)$" || true)
if [ ! -z "$CHANGED_TS_FILES" ] && command -v tsc &> /dev/null; then
    for file in $CHANGED_TS_FILES; do
        if [ -f "$file" ]; then
            if ! npx tsc --noEmit --skipLibCheck "$file" 2>/dev/null; then
                echo "❌ TypeScript errors in $file"
                echo "Fix TypeScript errors before committing"
                exit 1
            fi
        fi
    done
fi

echo "✅ Pre-commit validation passed"
exit 0
EOF

# Make it executable
chmod +x .git/hooks/pre-commit

echo "✅ Pre-commit hook installed successfully!"
echo ""
echo "The hook will now run automatically before each commit to:"
echo "  - Validate Polaris icon imports"
echo "  - Check for TypeScript errors"
echo "  - Warn about console.log statements"
echo ""
echo "To skip the hook temporarily, use: git commit --no-verify"