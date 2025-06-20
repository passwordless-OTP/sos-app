# Development Workflow - Working on an Issue

## Overview
This guide walks through the complete process of working on a GitHub issue from start to finish.

## Workflow Steps

### 1. Issue Assignment & Setup

```bash
# View available issues
gh issue list --assignee @me

# Assign yourself to an issue
gh issue edit 3 --add-assignee @me

# View issue details
gh issue view 3
```

**GitHub Actions automatically**:
- Moves issue to "In Progress" when assigned
- Adds "in-progress" label

### 2. Create Feature Branch

```bash
# Ensure you're on main and up-to-date
git checkout main
git pull origin main

# Create feature branch (use issue number for reference)
git checkout -b feature/issue-3-multi-source-fraud-apis

# Alternative naming conventions:
# git checkout -b fix/issue-9-typescript-errors
# git checkout -b enhance/issue-6-voice-features
```

### 3. Link Branch to Issue

```bash
# Push branch and set upstream
git push -u origin feature/issue-3-multi-source-fraud-apis

# Create draft PR immediately (links to issue)
gh pr create --draft --title "feat: Integrate multi-source fraud detection APIs" \
  --body "## Description
Implementing multiple fraud detection service integrations.

## Related Issue
Closes #3

## Changes
- [ ] Add AbuseIPDB integration
- [ ] Add EmailRep integration  
- [ ] Add IPQualityScore integration
- [ ] Create unified scoring algorithm
- [ ] Add caching layer

## Testing
- [ ] Unit tests for each service
- [ ] Integration tests
- [ ] Performance benchmarks"
```

### 4. Development Process

```bash
# Regular commits with conventional format
git add .
git commit -m "feat: add AbuseIPDB service integration"
git commit -m "test: add unit tests for AbuseIPDB client"
git commit -m "docs: update API documentation"

# Push changes regularly
git push

# Keep branch updated with main
git fetch origin
git rebase origin/main
```

**Commit Message Convention**:
```
feat: add new feature
fix: fix a bug
docs: documentation changes
test: add or update tests
refactor: code refactoring
style: formatting changes
chore: maintenance tasks
```

### 5. Code Review Preparation

```bash
# Run linting
npm run lint

# Run tests
npm test

# Check TypeScript
npm run typecheck

# Update PR to ready for review
gh pr ready

# Request reviewers
gh pr edit --add-reviewer teammate1,teammate2
```

### 6. PR Management

```bash
# View PR status
gh pr view

# Check CI status
gh pr checks

# Address review comments
git add .
git commit -m "fix: address review feedback"
git push

# View and respond to comments
gh pr review
```

### 7. Merging Process

```bash
# Final rebase before merge
git fetch origin
git rebase origin/main
git push --force-with-lease

# Merge PR (after approvals)
gh pr merge --squash --delete-branch

# Or from GitHub UI for better merge commit message
```

**GitHub Actions automatically**:
- Closes linked issue (#3)
- Moves issue to "Done" in project board
- Updates project metrics

### 8. Post-Merge Cleanup

```bash
# Switch back to main
git checkout main
git pull origin main

# Delete local feature branch
git branch -d feature/issue-3-multi-source-fraud-apis

# Verify issue is closed
gh issue view 3
```

## Complete Example Workflow

```bash
# 1. Start work on issue #3
gh issue edit 3 --add-assignee @me
git checkout main && git pull
git checkout -b feature/issue-3-multi-source-fraud-apis

# 2. Create draft PR immediately
gh pr create --draft --title "feat: Multi-source fraud detection APIs" --body "Closes #3"

# 3. Development work
# ... write code ...
git add src/services/abuseipdb.ts
git commit -m "feat: implement AbuseIPDB client"

# ... write tests ...
git add tests/services/abuseipdb.test.ts
git commit -m "test: add AbuseIPDB client tests"

# 4. Push and update PR
git push
gh pr ready

# 5. After reviews and CI passes
gh pr merge --squash --delete-branch

# 6. Cleanup
git checkout main && git pull
git branch -d feature/issue-3-multi-source-fraud-apis
```

## GitHub Project Board Updates

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│    TODO     │     │ IN PROGRESS  │     │    DONE     │
├─────────────┤     ├──────────────┤     ├─────────────┤
│ Issue #3    │ --> │              │     │             │
│ Issue #4    │     │              │     │             │
│ Issue #5    │     │              │     │             │
└─────────────┘     └──────────────┘     └─────────────┘
       │                                          
       │ Assign issue                             
       ▼                                          
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│    TODO     │     │ IN PROGRESS  │     │    DONE     │
├─────────────┤     ├──────────────┤     ├─────────────┤
│ Issue #4    │     │ Issue #3 🔄  │     │             │
│ Issue #5    │     │              │     │             │
└─────────────┘     └──────────────┘     └─────────────┘
                            │                     
                            │ Merge PR            
                            ▼                     
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│    TODO     │     │ IN PROGRESS  │     │    DONE     │
├─────────────┤     ├──────────────┤     ├─────────────┤
│ Issue #4    │     │              │     │ Issue #3 ✓  │
│ Issue #5    │     │              │     │             │
└─────────────┘     └──────────────┘     └─────────────┘
```

## Best Practices

### 1. Branch Naming
- `feature/issue-{number}-{brief-description}`
- `fix/issue-{number}-{brief-description}`
- `chore/issue-{number}-{brief-description}`

### 2. Commit Messages
- Use conventional commits format
- Reference issue number in commit body if needed
- Keep commits atomic and focused

### 3. PR Guidelines
- Create draft PR early for visibility
- Link to issue with "Closes #X"
- Keep PR description updated
- Add screenshots/videos for UI changes
- Request reviews when ready

### 4. Code Quality
- Run all checks locally before pushing
- Address linter warnings
- Ensure tests pass
- Update documentation

### 5. Communication
- Comment on issue when starting work
- Update PR description as you progress
- Respond to review comments promptly
- Mention blockers early

## Automation Benefits

### What GitHub Actions Does For You:
1. **Issue Assignment** → Status changes to "In Progress"
2. **PR Created** → Links to issue, runs CI checks
3. **PR Approved** → Enables merge button
4. **PR Merged** → Closes issue, moves to "Done"
5. **Daily** → Cleans up stale branches

### Time Saved:
- No manual board updates
- Automatic issue linking
- CI/CD runs automatically
- Notifications sent automatically

## Common Commands Reference

```bash
# Issues
gh issue list --assignee @me          # Your assigned issues
gh issue create                       # Create new issue
gh issue view 3                       # View issue details
gh issue edit 3 --add-label "bug"    # Add labels

# Pull Requests  
gh pr create --draft                  # Create draft PR
gh pr list                           # List PRs
gh pr view                           # View current PR
gh pr checks                         # Check CI status
gh pr merge --squash                 # Merge PR

# Git
git checkout -b feature/...          # Create branch
git rebase origin/main               # Update branch
git push --force-with-lease          # Safe force push
git branch -d feature/...            # Delete branch
```

## Troubleshooting

### Merge Conflicts
```bash
git fetch origin
git rebase origin/main
# Resolve conflicts in editor
git add .
git rebase --continue
git push --force-with-lease
```

### CI Failures
```bash
# Check what failed
gh pr checks

# Run tests locally
npm test

# Check specific workflow
gh run view
```

### Stale Branch
```bash
# Update your branch
git fetch origin
git rebase origin/main
git push --force-with-lease
```