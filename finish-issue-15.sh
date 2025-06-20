#!/bin/bash

# Finish Issue #15 - Product Vision & Mission Documentation

echo "📝 Finishing Issue #15 - Product Vision & Mission Documentation"
echo "================================================"

# Change to project directory
cd /Users/jarvis/Downloads/development/SOS

# Check current branch
echo "Current branch:"
git branch --show-current

# Stage all product documentation
echo -e "\n📦 Staging product documentation..."
git add docs/product/

# Show what will be committed
echo -e "\n📋 Files to be committed:"
git status --short docs/product/

# Commit with the prepared message
echo -e "\n💾 Creating commit..."
git commit -F COMMIT_MESSAGE_ISSUE_15.txt

# Push to remote
echo -e "\n🚀 Pushing to remote..."
git push origin feature/issue-15-phase-1-documentation--product-vision---

# Create PR
echo -e "\n🔄 Creating Pull Request..."
gh pr create --title "docs: Complete Phase 1 Product Vision & Mission documentation" \
  --body "## Summary
This PR completes all documentation requirements for Issue #15 - Phase 1 Documentation: Product Vision & Mission.

## Documentation Added
- Main vision & mission statement
- Quick reference summary 
- Vision variants comparison
- Supporting strategy documents (Friction as a Weapon, UX KPIs, etc.)

## Key Concepts
- VMS (Visitor Management System)
- SEN (Security Events Network)  
- Intelligent friction optimization

Closes #15

## Review Checklist
- [ ] Vision aligns with investor pitch
- [ ] Mission is clear and actionable
- [ ] Core values are well-defined
- [ ] Strategic goals are measurable" \
  --base main

echo -e "\n✅ Issue #15 completed! PR created for review."
echo "================================================"

# Clean up
rm -f COMMIT_MESSAGE_ISSUE_15.txt
echo "🧹 Cleaned up temporary files"