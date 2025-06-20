# Working on Multiple Issues Simultaneously

## The Answer: ONE Clone, Multiple Branches

You only need **one clone** of the repository. Git's branching system is designed for exactly this scenario.

## Visual Overview

```
SOS Repository (One Clone)
│
├── main (branch)
│   └── Clean, stable code
│
├── feature/issue-3-fraud-apis (branch)
│   └── Working on fraud detection APIs
│
├── fix/issue-9-typescript (branch)
│   └── Fixing TypeScript errors
│
└── feature/issue-6-voice-tts (branch)
    └── Adding text-to-speech features
```

## Workflow for Multiple Issues

### Initial Setup (One Time)

```bash
# Clone once
git clone https://github.com/passwordless-OTP/sos-app.git
cd sos-app
```

### Working on Issue #3

```bash
# Start from main
git checkout main
git pull origin main

# Create branch for issue #3
git checkout -b feature/issue-3-fraud-apis

# Work on the feature
code src/services/fraud-detection.ts
git add .
git commit -m "feat: add AbuseIPDB integration"
git push -u origin feature/issue-3-fraud-apis
```

### Switch to Issue #9 (TypeScript fixes)

```bash
# Save any uncommitted work first
git stash  # (if you have uncommitted changes)

# Switch to main
git checkout main
git pull origin main

# Create branch for issue #9
git checkout -b fix/issue-9-typescript

# Work on TypeScript fixes
code src/types/index.ts
git add .
git commit -m "fix: resolve TypeScript errors in dashboard"
git push -u origin fix/issue-9-typescript
```

### Switch Back to Issue #3

```bash
# Just checkout the existing branch
git checkout feature/issue-3-fraud-apis

# Continue where you left off
# All your previous work is here!
```

### Quick Switch to Issue #6

```bash
# Create another branch
git checkout main
git checkout -b feature/issue-6-voice-tts

# Work on voice features
code src/components/VoiceControls.tsx
```

## Managing Multiple Active Branches

### View All Your Branches

```bash
# See all local branches (* marks current branch)
git branch

# Output:
# * feature/issue-3-fraud-apis
#   feature/issue-6-voice-tts
#   fix/issue-9-typescript
#   main
```

### Check Status Anytime

```bash
# See which branch you're on and changes
git status

# Output:
# On branch feature/issue-3-fraud-apis
# Your branch is up to date with 'origin/feature/issue-3-fraud-apis'
```

### Quick Branch Switching

```bash
# List recent branches for easy switching
git branch --sort=-committerdate

# Quick switch to previous branch
git checkout -
```

## Pro Tips for Multiple Issues

### 1. Use Git Stash for Quick Switches

```bash
# Working on issue #3 but need to urgently fix issue #9
git stash save "WIP: issue 3 - fraud API integration"

# Switch to issue #9
git checkout fix/issue-9-typescript
# ... fix the bug ...

# Come back to issue #3
git checkout feature/issue-3-fraud-apis
git stash pop
```

### 2. Use Worktrees (Advanced - Multiple Working Directories)

If you really want separate directories:

```bash
# From main repo
git worktree add ../sos-issue-3 feature/issue-3-fraud-apis
git worktree add ../sos-issue-9 fix/issue-9-typescript

# Now you have:
# /sos-app (main clone)
# /sos-issue-3 (issue #3 work)
# /sos-issue-9 (issue #9 work)
```

### 3. Branch Status Dashboard

Create a simple script to see all branch statuses:

```bash
#!/bin/bash
# save as: branch-status.sh

echo "🌿 Branch Status Overview"
echo "========================"

for branch in $(git branch | grep -v '*'); do
    echo -n "→ $branch: "
    git log -1 --pretty=format:"%h - %s (%cr)" $branch
    echo ""
done
```

## Common Scenarios

### Scenario 1: Emergency Fix While Working on Feature

```bash
# Working on issue #3 (fraud APIs)
git stash
git checkout main
git checkout -b hotfix/issue-15-critical-bug
# ... fix bug ...
git push
gh pr create --title "hotfix: critical payment bug"

# Back to issue #3
git checkout feature/issue-3-fraud-apis
git stash pop
```

### Scenario 2: Applying Same Fix to Multiple Branches

```bash
# Fixed something in issue #9 that issue #3 also needs
git checkout feature/issue-3-fraud-apis
git cherry-pick <commit-hash-from-issue-9>
```

### Scenario 3: Checking Progress Across All Issues

```bash
# See all active PRs
gh pr list --author @me

# See all branches with recent activity
git for-each-ref --sort=-committerdate refs/heads/ --format='%(committerdate:short) %(refname:short) %(subject)'
```

## Best Practices

### 1. **Keep Branches Focused**
- One branch per issue
- Clear naming: `type/issue-number-description`

### 2. **Commit Frequently**
- Small, atomic commits
- Easy to switch contexts

### 3. **Push Regularly**
- Backup your work
- Enable collaboration
- Trigger CI/CD

### 4. **Clean Up After Merging**
```bash
# Delete local branch after PR merge
git branch -d feature/issue-3-fraud-apis

# Prune remote tracking branches
git remote prune origin
```

### 5. **Use Branch Protection**
- Can't accidentally commit to main
- Forces PR workflow

## Quick Reference Card

```bash
# WORKING ON MULTIPLE ISSUES
# ========================

# Start new issue
git checkout main && git pull
git checkout -b feature/issue-X-description

# Switch between issues
git checkout feature/issue-3-fraud-apis
git checkout fix/issue-9-typescript

# Save work temporarily
git stash                    # save
git stash pop               # restore

# See what you're working on
git branch                  # all branches
git status                  # current branch status
gh pr list --author @me     # your PRs

# Clean up
git branch -d branch-name   # delete local branch
```

## Visual: One Clone, Multiple Issues

```
Your Computer
└── /Development/SOS/
    ├── .git/                    # Git repository (shared)
    ├── src/                     # Source code
    ├── package.json            
    └── [Current Branch Files]   # Changes based on checked-out branch
    
    Git Branches (in .git):
    ├── main                     
    ├── feature/issue-3-fraud-apis     ← Different versions
    ├── fix/issue-9-typescript         ← of the same files
    └── feature/issue-6-voice-tts      ← stored efficiently
```

## Summary

- **1 Clone** = Multiple branches for multiple issues ✅
- **Switch branches** = Switch between issues instantly ✅
- **No confusion** = Git keeps everything separate ✅
- **Efficient** = Shared repository objects, only differences stored ✅

You do NOT need multiple clones unless you want to view two issues side-by-side in different editors!