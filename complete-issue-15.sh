#!/bin/bash
cd /Users/jarvis/Downloads/development/SOS
git add docs/product/
git commit -F COMMIT_MESSAGE_ISSUE_15.txt
git push origin feature/issue-15-phase-1-documentation--product-vision---
gh pr create --title "docs: Complete Phase 1 Product Vision & Mission documentation" --body "Closes #15" --base main