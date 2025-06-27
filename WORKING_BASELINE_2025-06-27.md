# Working Baseline - 2025-06-27

## Status: ✅ BOTH DEMOS WORKING

### Live URLs
- **Main Dashboard**: https://sosv02--development.gadget.app/
- **Investor Demo**: https://sosv02--development.gadget.app/investor-demo

### Current Branch
- `feature/issue-27-investor-demo-dashboard`
- Latest commit: `45b8db3`

## Key Fixes Applied

### 1. Gadget Uses Remix (Not Standalone React)
- Found in `root.tsx` and `_app.tsx` - Gadget DOES use Remix
- Loaders are simplified to return hardcoded demo data
- No context parameter needed for demo routes

### 2. Correct Polaris v9 Icon Names
All icons must use the "Icon" suffix:
- ✅ `ChartLineIcon` (not AnalyticsIcon or AnalyticsMajor)
- ✅ `TeamIcon` (not CustomersIcon or CustomersMajor)
- ✅ `RefreshIcon` (not RefreshMajor)
- ✅ `AutomationIcon` (not AutomationMajor)
- ✅ `ChevronRightIcon`, `ChevronLeftIcon`

### 3. Working Icon Imports Reference
```typescript
// From _app._index.tsx (working)
import {
  CashDollarIcon,
  OrderIcon,
  AlertCircleIcon,
  TeamIcon,
  SearchIcon
} from '@shopify/polaris-icons';

// From _app.investor-demo.tsx (working)
import {
  ChartLineIcon,
  RefreshIcon,
  TeamIcon,
  AutomationIcon,
  ChevronRightIcon,
  ChevronLeftIcon
} from '@shopify/polaris-icons';
```

## Development Workflow

### 1. Keep ggt+ dev Running
```bash
nvm use v22.9.0 && ggt dev
```
This auto-syncs changes to Gadget workspace.

### 2. Verify Changes Deploy
Watch the ggt+ output for:
```
✔ Pushed file. → 
±  web/routes/[filename]  updated
```

### 3. Test URLs After Changes
Both routes should return HTTP 200.

## Common Issues and Solutions

### Issue: 500 Error - Icon Not Found
**Solution**: Check exact icon name in Polaris v9. All icons end with "Icon".

### Issue: Session Creation Errors
**Solution**: Use simple loaders without context parameter for demos.

### Issue: Changes Not Syncing
**Solution**: 
1. Ensure ggt+ dev is running
2. Touch the file to force sync
3. Check ggt+ output for push confirmation

## Next Steps for Demo

1. **Test on actual device** before presentation
2. **Keep ggt+ dev running** during demo for any quick fixes
3. **Have backup**: HTML demo files exist if needed

## Session Saved
- Date: 2025-06-27
- Time: 23:20 PST
- Both demos confirmed working