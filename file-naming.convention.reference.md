# DNS-Style File Naming Convention Reference

## Pattern
`[level1].[level2].[level3].[descriptor].[extension]`

## Quick Reference
- Periods separate hierarchy levels
- Hyphens within a level for multi-word names
- Brackets for descriptors/variants
- All lowercase (except descriptors)

## Common Patterns
- `[product].[feature].[component].[variant].[ext]`
- `[date].[event].[type].[version].[ext]`
- `[category].[subcategory].[detail].[status].[ext]`

## Examples from Your ~/Downloads
```
dashboard.investor-demo.wireframes.html
security.analysis.email-auth-drawbacks.[DETAILED].png
business.legal.apa.geostock.2024-12.signed.pdf
finance.projections.monthly-quarterly.main.csv
technical.diagram.mermaid.2025-01-16.[V3].png
```

## SOS Project Examples
```
sos.dashboard.investor-demo.wireframe.[BIG-NUMBERS].png
sos.api.fraud-check.[MAIN].ts
sos.docs.product.vision-mission.[VMS-VARIANT].md
sos.config.gadget.settings.[DEVELOPMENT].ts
```

## Descriptors in Brackets
- `[MAIN]` - Primary version
- `[BACKUP]` - Backup copy
- `[DRAFT]` - Work in progress
- `[FINAL]` - Finalized version
- `[V1]`, `[V2]` - Version numbers
- `[DETAILED]` - Comprehensive version
- `[SUMMARY]` - Condensed version
- `[2025-01-17]` - Date stamps

## Benefits
1. **Sortable**: Files group together alphabetically by category
2. **Searchable**: Easy to find with partial names (e.g., `ls sos.api.*`)
3. **Scalable**: Can add more subcategories without breaking structure
4. **Self-documenting**: File purpose is clear from the name
5. **Git-friendly**: Clear diffs when renaming or versioning

## Shell Usage
```bash
# List all SOS API files
ls sos.api.*

# Find all investor demo files
ls *investor-demo*

# List all PNG wireframes
ls *.wireframe.*.png

# Find all MAIN versions
ls *.[MAIN].*
```