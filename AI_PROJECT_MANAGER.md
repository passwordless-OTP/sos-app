# AI Project Manager - SOS Project

## 🤖 AI Agent Instructions
If you're an AI agent working on this project, this document contains everything you need to understand and manage the SOS project.

## 🎯 Project Overview
**SOS (Store Operations Shield)** - AI-powered fraud prevention network for Shopify merchants
- **Vision**: "Waze for Shopify Security" - merchants share security signals
- **Stage**: MVP Development
- **Timeline**: 8 weeks total (Started: Week of Jan 13, 2025)

## 📁 Repository Structure
This project has **TWO repositories**:

### 1. SOS Repository (THIS REPO)
- **Purpose**: Documentation, infrastructure, microservices
- **Location**: You are here
- **Contains**: 
  - `/docs` - All documentation
  - `/infrastructure` - Docker, deployment configs
  - `/services` - Microservices (lookup-aggregator)
  - `/.github` - CI/CD workflows

### 2. sos-app Repository  
- **Purpose**: Shopify app built on Gadget.dev
- **Location**: Submodule at `/apps/sosv02/apps/sosv02/`
- **Framework**: Gadget.dev (handles Shopify OAuth, webhooks, hosting)
- **Contains**:
  - `/api` - Backend models and actions
  - `/web` - React frontend with Polaris UI
  - `/services` - App-specific services

## 📊 Project Management

### GitHub Project Board
- **URL**: https://github.com/users/passwordless-OTP/projects/7
- **Name**: SOS Development Roadmap
- **Columns**: Todo, In Progress, Done

### Finding Work
```bash
# View all open issues across both repos
gh issue list --repo passwordless-OTP/sos-app --state open
gh issue list --repo passwordless-OTP/SOS --state open

# View project board items
gh project item-list 7 --owner passwordless-OTP

# See your assigned issues
gh issue list --assignee @me --state open
```

### Issue Naming Convention
- **sos-app issues**: Frontend, Shopify integration, Gadget.dev work
- **SOS issues**: Infrastructure, services, documentation

## 🚀 Getting Started as an AI Agent

### 1. Initial Setup
```bash
# Clone with submodules
git clone --recursive https://github.com/passwordless-OTP/SOS.git
cd SOS

# Install task management system
./scripts/install-task-system.sh

# Check project status
./scripts/task list
```

### 2. Understanding Current State
```bash
# Read project timeline and progress
cat docs/TIMELINE_STATUS.md

# Check what's been completed
gh issue list --repo passwordless-OTP/sos-app --state closed
gh issue list --repo passwordless-OTP/SOS --state closed

# See active work
gh pr list --state open
```

### 3. Starting Work
```bash
# Pick an issue from the board
gh issue list --state open --label "priority:high"

# Start working on it
./scripts/task start 3  # Replace 3 with issue number
```

## 📅 Timeline & Milestones

### Week 1-2: Core Lookup (COMPLETED ✅)
- Basic order check endpoint
- Single fraud service integration
- Database schema

### Week 3-4: Multi-Service Integration (CURRENT 🔄)
- **Issue #3**: Integrate multiple fraud APIs
- **Issue #2**: Configure API accounts
- Circuit breakers and caching

### Week 5-6: Network Intelligence (UPCOMING)
- Community reporting features
- Pattern detection
- Network effects

### Week 7-8: Polish & Launch (FUTURE)
- Performance optimization
- Documentation
- Shopify app submission

## 🔧 Technical Context

### Key Technologies
- **Shopify App**: Gadget.dev framework
- **Frontend**: React, TypeScript, Polaris
- **Backend**: Node.js, PostgreSQL, Redis
- **APIs**: AbuseIPDB, EmailRep, IPQualityScore
- **AI**: OpenAI for natural language

### Critical Files
```
sos-app/
├── api/actions/checkOrder.js      # Main fraud check logic
├── api/models/                    # Data models
├── web/routes/_app._index.tsx     # Dashboard UI
└── settings.gadget.ts             # App configuration

SOS/
├── services/lookup-aggregator/    # Microservice
├── docs/                          # All documentation
└── infrastructure/                # Deployment
```

### Environment Setup
```bash
# For sos-app (Gadget)
cd apps/sosv02/apps/sosv02
npm install
npm run dev  # Starts on gadget.dev cloud

# For SOS services
cd services/lookup-aggregator
npm install
npm run dev
```

## 🎮 AI Agent Commands

### Daily Workflow
```bash
# 1. Check what needs doing
./scripts/task list
gh issue list --label "priority:high" --state open

# 2. Pick highest priority
./scripts/task start <issue-number>

# 3. Work on it
# ... make changes ...

# 4. Track progress
git add .
git commit -m "feat: implement fraud scoring algorithm"
git push

# 5. When complete
gh pr create --title "feat: Multi-source fraud detection"
./scripts/task finish
```

### Switching Tasks (Common)
```bash
# Save current work and switch
./scripts/task switch 9

# Come back later
./scripts/task switch 3
```

### Updating Project Status
```bash
# Add comment to issue with progress
gh issue comment 3 --body "Completed AbuseIPDB integration, working on EmailRep next"

# Update timeline doc if milestone reached
vi docs/TIMELINE_STATUS.md
```

## 📋 Current Priorities (Jan 17, 2025)

### High Priority
1. **Issue #3**: Multi-source fraud API integration (sos-app)
2. **Issue #9**: Fix TypeScript errors (sos-app)
3. **Issue #2**: Configure all API accounts (SOS)

### Medium Priority
1. **Issue #6**: Voice features enhancement (sos-app)
2. **Issue #5**: Usage-based billing (sos-app)
3. **Issue #8**: Advanced analytics (sos-app)

### Blocked/Waiting
- API key authentication (Gadget platform limitation)

## 🤝 Collaboration Guidelines

### For AI Agents
1. **Always update this file** when project state changes significantly
2. **Document decisions** in `/docs/decisions/`
3. **Comment on issues** with progress updates
4. **Use conventional commits**: feat:, fix:, docs:, test:
5. **Run tests** before pushing: `npm test`

### Communication
- **Progress**: Comment on GitHub issues
- **Blockers**: Create issue with "blocked" label
- **Questions**: Check docs first, then create discussion

## 🚨 Important Warnings

1. **Two Repositories**: Always check which repo an issue belongs to
2. **Gadget.dev**: The sos-app runs on Gadget cloud, not locally
3. **API Keys**: Never commit keys, use environment variables
4. **Submodules**: Use `git clone --recursive` or `git submodule update --init`

## 🎯 Success Metrics

### MVP Complete When:
- [ ] 5+ fraud services integrated
- [ ] Network reporting working
- [ ] <200ms response time
- [ ] 99.9% uptime
- [ ] Shopify app approved

### Current Status: 35% Complete
- ✅ Basic infrastructure
- ✅ Single fraud check
- ✅ Network Intelligence Dashboard (completed 2025-06-17)
- 🔄 Multi-service integration
- ⏳ Performance optimization

### Recent Progress (2025-06-17)
- **Completed Network Dashboard**: Full network effect visualization with real-time updates
- **Customer Risk Intelligence**: Implemented retroactive risk assessment
- **Network Economics**: Shows trust economy with 48K daily actions, $1.3M protected
- **Demo Ready**: Created standalone demos for investor presentation

## 🆘 If You're Stuck

1. **Check documentation**: `/docs/` folder
2. **Review closed PRs**: Learn from past implementations
3. **Check GitHub Discussions**: Common issues discussed
4. **Review this file**: It's the source of truth

---

**Last Updated**: June 17, 2025
**Updated By**: Claude (Network Dashboard Session)
**Next Review**: After investor demo feedback