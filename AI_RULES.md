# AI Agent Rules for SOS/Gadget Development

## 🚨 CRITICAL RULES - NEVER VIOLATE

### 1. NEVER Assume Exports Exist
```bash
# ❌ WRONG: Guessing icon names
import { AnalyticsIcon } from '@shopify/polaris-icons';

# ✅ RIGHT: Verify first
grep -h "Icon.*from.*polaris-icons" web/routes/*.tsx | sort | uniq
# Then use EXACTLY what you find
```

### 2. NEVER Make Multiple Changes Without Testing
```bash
# ❌ WRONG: Edit 5 files, then test
# ✅ RIGHT: Edit 1 file → Test → Confirm working → Next file
```

### 3. NEVER Use Context Parameters in Demo Loaders
```typescript
// ❌ WRONG - Causes session errors
export const loader = async ({ context }: LoaderFunctionArgs) => {
  const shop = context.session?.get("shop");
}

// ✅ RIGHT - Simple and works
export const loader = async () => {
  return json({ shopDomain: "demo-shop.myshopify.com" });
}
```

## 📋 MANDATORY CHECKS

### Before ANY Import Change
```bash
# 1. Find working examples
grep -r "from '@shopify/polaris-icons'" web/ | head -20

# 2. Verify exact export name
# All Polaris v9 icons end with "Icon"
```

### After EVERY File Edit
```bash
# 1. Check sync completed
tail -5 /tmp/ggt-dev.log | grep "Pushed file"

# 2. Test the route
curl -I -s "https://sosv02--development.gadget.app/[route]" | grep HTTP
```

### When Adding New Routes
```typescript
// 1. Must export default function
export default function RouteName() { }

// 2. Must import from correct packages
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
```

## 🔧 TECHNOLOGY RULES

### Gadget.dev Specific
- **USES Remix** - Found in root.tsx
- **NO direct database access** - Use api object
- **NO environment variables in code** - Hardcode for demos
- **AUTO-SYNC via ggt dev** - Don't use ggt deploy

### Polaris v9 Icons
```typescript
// Pattern: [Name]Icon (no Major/Minor suffixes)
TeamIcon          // ✅ (not CustomersMajor)
ChartLineIcon     // ✅ (not AnalyticsMajor)
RefreshIcon       // ✅ (not RefreshMajor)
AutomationIcon    // ✅ (not AutomationMajor)
```

### Shopify App Context
- Routes under `/web/routes/_app.*.tsx` are app routes
- Must be embedded in Shopify admin
- Session handling is automatic via Gadget

## 🛑 FORBIDDEN ACTIONS

1. **DON'T use ggt deploy** - It's broken
2. **DON'T access context.session directly** - Gadget handles it
3. **DON'T create files unless necessary** - Edit existing files
4. **DON'T batch commits** - Commit working changes immediately
5. **DON'T ignore TypeScript errors** - They indicate real problems

## ✅ REQUIRED WORKFLOW

### 1. Start Session
```bash
cd /Users/jarvis/Downloads/development/SOS
./scripts/dev-start.sh
```

### 2. Before Making Changes
```bash
# Verify current state works
./scripts/test-route.sh /
./scripts/test-route.sh /investor-demo
```

### 3. For EVERY Change
```bash
# Edit file
vi web/routes/[file].tsx

# Wait for sync (watch logs)
tail -f /tmp/ggt-dev.log

# Test immediately
./scripts/test-route.sh /[route]

# Only proceed if HTTP 200
```

### 4. When Errors Occur
```bash
# 1. Read EXACT error
grep -A10 "ERROR" /tmp/ggt-dev.log

# 2. Check AI_DEV_WORKFLOW.md for pattern
# 3. Find working example
# 4. Make minimal fix
# 5. Test again
```

## 📊 DECISION TREE

### Icon Import Error?
1. Check exact error message
2. Find working icon imports: `grep -h "Icon.*from" web/routes/*.tsx`
3. Use EXACT name found
4. All v9 icons end with "Icon"

### 500 Error?
1. Check logs for specific error
2. If "module not found" → Fix import
3. If "session" error → Remove context parameter
4. If unclear → Check loader function

### Sync Not Working?
1. Check ggt dev is running: `ps aux | grep ggt`
2. Touch file to force: `touch web/routes/[file].tsx`
3. Check logs for "Pushed file"
4. If stuck → Restart: `pkill -f ggt && ./scripts/dev-start.sh`

## 🎯 SUCCESS METRICS

Your changes are successful when:
1. ✅ `curl -I [url]` returns `HTTP/2 200`
2. ✅ No errors in `/tmp/ggt-dev.log`
3. ✅ Changes visible in browser
4. ✅ All tests pass

## 💡 WISDOM FROM EXPERIENCE

1. **Gadget is NOT standard Remix** - Has its own patterns
2. **Icons are the #1 source of errors** - Always verify names
3. **Simple loaders work best** - Don't overcomplicate
4. **Trust the tools** - If TypeScript says it doesn't exist, it doesn't
5. **ggt dev is fragile** - Keep it running, restart if weird

## 🚀 QUICK REFERENCE

```bash
# Most common fixes
sed -i '' 's/CustomersMajor/TeamIcon/g' file.tsx
sed -i '' 's/AnalyticsMajor/ChartLineIcon/g' file.tsx
sed -i '' 's/({ context }: LoaderFunctionArgs)/()/' file.tsx

# Test everything
for route in "" "investor-demo"; do
  curl -s -o /dev/null -w "%{url} -> %{http_code}\n" \
    "https://sosv02--development.gadget.app/$route"
done
```

## ⚡ EMERGENCY RECOVERY

When everything is broken:
```bash
# Nuclear option - start fresh
pkill -f ggt
cd /Users/jarvis/Downloads/development/SOS
git stash
git checkout feature/issue-27-investor-demo-dashboard
git pull origin feature/issue-27-investor-demo-dashboard
./scripts/dev-start.sh
```

Remember: **VERIFY, DON'T ASSUME** - This is the golden rule!