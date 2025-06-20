# Zero-Error Deployment Process for SOS

## Philosophy
**Zero tolerance for runtime errors**. Bugs are acceptable during development, but errors that crash the app or show 500 errors to users are NOT acceptable.

## Pre-Deployment Checklist

### 1. Icon Validation (Most Common Error Source)
```bash
# Run before EVERY deployment
node sos.scripts.validate-polaris-icons.[SPECIFIC].js
```

**Common mistakes:**
- ❌ `TrendingUpIcon` → ✅ `AnalyticsMajor`
- ❌ `RefreshIcon` → ✅ `RefreshMajor`
- ❌ `TeamIcon` → ✅ `CustomersMajor`

### 2. Syntax Validation
```bash
# Check all files for syntax errors
find apps/sosv02 -name "*.js" -o -name "*.ts" | xargs -I {} node -c {}
```

### 3. Required Exports Check
**Routes must have:**
```typescript
export default function RouteName() { ... }
export const loader = async () => { ... }  // if using useLoaderData
```

**API Actions must have:**
```typescript
export const run = async ({ params, logger, api }) => { ... }
export const params = { ... }  // if accepting parameters
```

### 4. Import Validation
Common missing imports that cause runtime errors:
```typescript
// React hooks
import { useState, useEffect, useCallback } from 'react';

// Remix
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

// Always use correct icon names
import { AnalyticsMajor, CustomersMajor } from '@shopify/polaris-icons';
```

## Automated Validation Scripts

### Quick Validation (before commit)
```bash
./sos.scripts.validate-polaris-icons.[SPECIFIC].js
```

### Full Validation (before deployment)
```bash
./sos.scripts.pre-deploy-validate.[CRITICAL].sh
```

### Safe Push (validates then pushes)
```bash
./sos.scripts.ggt-safe-push.[WRAPPER].sh
```

## Setting Up Pre-Commit Hooks
```bash
# Install automated validation
./sos.scripts.install-pre-commit.[SETUP].sh
```

## Emergency Fixes

### If you get a 500 error after deployment:

1. **Check logs immediately**
```bash
cd apps/sosv02
ggt+ logs --tail
```

2. **Common fixes:**
   - Wrong icon names → Update to Major/Minor suffix
   - Missing imports → Add proper import statements
   - Missing exports → Add export default or export const

3. **Quick rollback**
```bash
ggt+ deploy --env=development --rollback
```

## Best Practices

1. **Always validate locally first**
   - Run the app locally with `ggt+ dev`
   - Test all new routes/features
   - Check browser console for errors

2. **Use TypeScript when possible**
   - Catches many errors at compile time
   - Better IDE support

3. **Follow naming conventions**
   - Icons: Always use Major/Minor suffix
   - Files: Use DNS-style naming
   - Routes: Follow Remix conventions

4. **Test on multiple devices**
   - Desktop browser
   - Mobile browser
   - Shopify admin embed

## Zero-Error Commitment

Before ANY deployment, ask yourself:
- ✅ Did I run icon validation?
- ✅ Did I check for syntax errors?
- ✅ Did I test locally with ggt+ dev?
- ✅ Did I check browser console for errors?

If any answer is NO, do NOT deploy.

## Quick Reference Card

```bash
# Before coding
git pull
ggt+ pull

# During development
ggt+ dev  # Keep running in terminal

# Before committing
node sos.scripts.validate-polaris-icons.[SPECIFIC].js

# Before pushing
./sos.scripts.ggt-safe-push.[WRAPPER].sh

# If errors occur
ggt+ logs --tail
# Fix the error
ggt+ push  # Re-deploy
```

Remember: **It's better to delay deployment by 5 minutes than to have users see a 500 error.**