# AI Agent Onboarding Checklist

## 🚀 Quick Start (5 minutes)

```bash
# 1. Clone the project
git clone --recursive https://github.com/passwordless-OTP/SOS.git
cd SOS

# 2. Check project status
./scripts/ai-status

# 3. Read the main AI guide
cat AI_PROJECT_MANAGER.md

# 4. See what needs doing
gh issue list --label "priority:high" --state open
```

## 📋 Complete Onboarding Checklist

### Step 1: Understand the Project (10 min)
- [ ] Read `AI_PROJECT_MANAGER.md` - Complete project overview
- [ ] Read `README.md` - Technical overview
- [ ] Read `docs/TIMELINE_STATUS.md` - Current progress
- [ ] Run `./scripts/ai-status` - Quick status check

### Step 2: Set Up Environment (5 min)
- [ ] Install task system: `./scripts/install-task-system.sh`
- [ ] Verify GitHub CLI: `gh auth status`
- [ ] Check both repos exist:
  ```bash
  ls -la apps/sosv02/apps/sosv02  # Should show sos-app
  git remote -v                    # Should show SOS
  ```

### Step 3: Understand Current State (10 min)
- [ ] Check timeline week: `./scripts/ai-status | grep "Current Week"`
- [ ] View active PRs: `gh pr list --state open`
- [ ] See blocked items: `gh issue list --label "blocked"`
- [ ] Review completed work: `gh issue list --state closed --limit 5`

### Step 4: Find Your Task (5 min)
- [ ] View high priority: `gh issue list --label "priority:high"`
- [ ] Check assigned work: `gh issue list --assignee @me`
- [ ] See project board: `gh project view 7 --owner passwordless-OTP --web`

### Step 5: Start Working (2 min)
- [ ] Pick an issue number
- [ ] Run: `./scripts/task start <issue-number>`
- [ ] You're now on a feature branch with everything set up!

## 🎯 Key Things Every AI Agent Must Know

### 1. Two Repositories
```
SOS/                    # Main project (you are here)
├── docs/              # All documentation
├── infrastructure/    # Docker, deployment
├── services/          # Microservices
└── apps/sosv02/apps/sosv02/  # sos-app (submodule)
    ├── api/          # Gadget backend
    └── web/          # React frontend
```

### 2. Issue Identification
- **sos-app #N** = Shopify/frontend work
- **SOS #N** = Infrastructure/services work

### 3. Current Priorities (Week 1)
1. Multi-source fraud APIs (#3) - HIGH
2. TypeScript errors (#9) - HIGH  
3. API account setup (#2) - MEDIUM

### 4. Daily Workflow
```bash
# Morning
./scripts/ai-status              # Get oriented
./scripts/task list              # See your work

# Working
./scripts/task switch <number>   # Jump between tasks
git add . && git commit -m "feat: description"
git push

# End of day
gh issue comment <number> --body "Progress: completed X, working on Y"
vi docs/TIMELINE_STATUS.md       # Update if needed
```

### 5. Communication Protocol
- **Progress**: Comment on GitHub issues
- **Blockers**: Add "blocked" label + comment
- **Decisions**: Document in `/docs/decisions/`
- **Timeline**: Update `docs/TIMELINE_STATUS.md`

## 🚨 Critical Information

### API Keys & Security
- NEVER commit API keys
- Use environment variables
- Keys are in 1Password (ask for access)

### Gadget.dev Specifics
- The sos-app runs on Gadget cloud
- Local `npm run dev` connects to Gadget
- Deployments are automatic on push

### Testing
- Run tests before pushing
- TypeScript must pass: `npm run typecheck`
- Linting must pass: `npm run lint`

## 📊 Progress Tracking

### How We Track Progress
1. **GitHub Issues** - Work items
2. **Project Board** - Visual status
3. **Timeline Doc** - Weekly milestones
4. **AI Status Script** - Quick overview

### Updating Progress
```bash
# When starting work
gh issue comment 3 --body "Starting work on this"
gh issue edit 3 --add-assignee @me

# During work
git commit -m "feat: implement AbuseIPDB client"

# When complete
gh pr create --title "feat: Multi-source fraud detection"
./scripts/task finish
```

## 🆘 If You Get Stuck

### Common Issues

**Q: Where do I find API documentation?**
A: Check `/docs/external-apis/` folder

**Q: How do I test locally?**
A: sos-app uses Gadget cloud, SOS services run locally

**Q: What's the deployment process?**
A: Automatic via GitHub Actions on merge to main

**Q: How do I switch between repos?**
A: The task script handles this automatically

### Getting Help
1. Check existing docs in `/docs/`
2. Look at closed PRs for examples
3. Review issue comments for context
4. Check GitHub Discussions

## ✅ Ready Checklist

Before starting work, ensure you can answer:
- [ ] What week of the project are we in? 
- [ ] What are the top 3 priorities?
- [ ] Which repo does my issue belong to?
- [ ] What's currently blocked?
- [ ] How do I update progress?

## 🎉 You're Ready!

Run your first command:
```bash
./scripts/ai-status
```

Then pick an issue and start:
```bash
./scripts/task start <issue-number>
```

Welcome to the SOS project! 🚀