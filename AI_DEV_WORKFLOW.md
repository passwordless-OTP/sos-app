# AI Agent Development Workflow for SOS/Gadget

## Environment Setup (One-Time)

### 1. Node Version
```bash
nvm use v22.9.0  # Required for ggt+
```

### 2. ggt+ Alias
```bash
# ggt+ is aliased to: nvm use v22.9.0 > /dev/null 2>&1 && ggt
```

## Automated Development Workflow

### 1. Start Development Session
```bash
# Navigate to Gadget app directory
cd /Users/jarvis/Downloads/development/SOS/apps/sosv02

# Start auto-sync (keep running in background)
nohup ggt dev > /tmp/ggt-dev.log 2>&1 &

# Verify it's running
ps aux | grep "ggt dev" | grep -v grep
```

### 2. Making Code Changes
```bash
# Edit files normally
# ggt dev auto-detects and syncs changes

# Monitor sync status
tail -f /tmp/ggt-dev.log | grep -E "Pushed|error|Error"
```

### 3. Verify Changes Deployed
```bash
# Wait for log confirmation: "✔ Pushed file"
# Then test the route
curl -I -s "https://sosv02--development.gadget.app/[route]" | head -5

# Expected: HTTP/2 200
```

### 4. Handle Common Errors

#### Icon Not Found Error
```bash
# Example error: "module '@shopify/polaris-icons' does not provide an export named 'SomeIcon'"

# Find correct icon name from working files
grep -h "Icon.*from.*polaris-icons" web/routes/*.tsx | sort | uniq

# All Polaris v9 icons end with "Icon" suffix
# Common replacements:
# - AnalyticsMajor → ChartLineIcon
# - CustomersMajor → TeamIcon
# - Any "Major/Minor" suffix → remove and add "Icon"
```

#### Session/Context Errors
```bash
# For demos, use simple loaders without context:
export const loader = async () => {
  return json({ 
    shopId: "demo-shop-id",
    shopDomain: "dev-sandbox-vk.myshopify.com"
  });
};
```

#### Sync Not Working
```bash
# Kill and restart ggt
pkill -f "ggt dev"
nvm use v22.9.0 && nohup ggt dev > /tmp/ggt-dev.log 2>&1 &

# Force sync by touching files
touch web/routes/*.tsx

# Check sync status
ggt status
```

### 5. Debugging Workflow

#### Check Error Logs
```bash
# Real-time error monitoring
tail -f /tmp/ggt-dev.log | grep -E "ERROR|error|500|failed"

# Find specific error
grep -A10 -B10 "error.*message" /tmp/ggt-dev.log
```

#### Test Endpoints
```bash
# Quick health check
for route in "" "investor-demo"; do
  echo -n "/$route: "
  curl -s -o /dev/null -w "%{http_code}\n" "https://sosv02--development.gadget.app/$route"
done
```

### 6. Git Workflow
```bash
# Always commit working changes
git add -A
git commit -m "fix: [description]"
git push origin [branch]

# ggt dev will auto-sync committed changes
```

## Critical Rules for AI Agents

### 1. NEVER Assume
- Don't assume library exports exist
- Don't assume API signatures
- Always verify with grep/search first

### 2. Copy Working Patterns
```bash
# Before creating new code, find working examples
grep -r "pattern" web/ --include="*.tsx" | head -10
```

### 3. Test Immediately
```bash
# After ANY change, verify it deployed
tail -10 /tmp/ggt-dev.log  # Check for push confirmation
curl -I [url]              # Verify HTTP 200
```

### 4. Use Correct Imports
```typescript
// Gadget uses Remix (found in root.tsx)
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

// Polaris v9 icons always end with "Icon"
import { TeamIcon, ChartLineIcon } from '@shopify/polaris-icons';
```

### 5. Handle Errors Systematically
1. Read exact error from logs
2. Search for working examples
3. Make minimal fix
4. Test immediately
5. Document if pattern is new

## Environment Variables
```bash
# App URLs
MAIN_APP="https://sosv02--development.gadget.app"
EDITOR="https://sosv02.gadget.app/edit/development"

# Current working directory
GADGET_APP_DIR="/Users/jarvis/Downloads/development/SOS/apps/sosv02"
```

## Quick Commands Reference
```bash
# Start dev
nvm use v22.9.0 && ggt dev

# Check sync
ggt status

# Force push
ggt push --force

# View logs
tail -f /tmp/ggt-dev.log

# Test route
curl -I "$MAIN_APP/route"

# Find icon names
grep -r "Icon.*from.*polaris" web/

# Kill stuck process
pkill -f "ggt dev"
```

## What NOT to Do
- Don't use `ggt deploy` (buggy)
- Don't access context.session directly
- Don't guess icon names
- Don't batch changes without testing
- Don't use Remix patterns that Gadget doesn't support

## Recovery Procedures

### When Everything Breaks
```bash
# 1. Stop everything
pkill -f ggt

# 2. Clear and restart
cd $GADGET_APP_DIR
nvm use v22.9.0

# 3. Pull fresh state
ggt pull --force

# 4. Restart dev
ggt dev

# 5. Verify working
curl -I $MAIN_APP
```

This workflow requires NO manual intervention. An AI agent can execute all steps programmatically.