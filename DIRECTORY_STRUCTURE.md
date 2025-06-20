# SOS Project Directory Structure

## 📁 Complete Project Structure

```
SOS/                                    # Main project repository
│
├── 🤖 AI AGENT MANAGEMENT             # AI-specific tools and docs
│   ├── START_HERE_AI_AGENT.md         # Quick start guide for AI agents
│   ├── AI_INSTRUCTIONS.txt            # Simple 4-step instructions
│   ├── AI_PROJECT_MANAGER.md          # Comprehensive project guide
│   ├── AI_AGENT_ONBOARDING.md         # Detailed onboarding checklist
│   └── CLAUDE.md                      # Claude-specific instructions
│
├── 📋 PROJECT MANAGEMENT              # Task and timeline tracking
│   ├── docs/
│   │   ├── TIMELINE_STATUS.md         # Weekly milestones & progress
│   │   ├── DEVELOPMENT_WORKFLOW.md    # Git/GitHub workflow guide
│   │   ├── MULTIPLE_ISSUES_WORKFLOW.md # Multi-task management
│   │   ├── TASK_SYSTEM_DEMO.md        # Task system demonstration
│   │   ├── PROJECT_BOARD_MAINTENANCE.md # Board update procedures
│   │   └── GITHUB_ACTIONS_WORKFLOW_DIAGRAM.md # CI/CD visualization
│   │
│   └── scripts/                       # Automation tools
│       ├── task                       # Task switching system
│       ├── ai-status                  # Quick project status
│       ├── install-task-system.sh     # Setup script
│       ├── update-project-board.sh    # Board automation
│       └── board-dashboard.sh         # Board reporting
│
├── 🏗️ ARCHITECTURE & PLANNING
│   └── docs/
│       ├── tech.architecture.system-design.md  # System architecture
│       ├── implementation.*.md         # Implementation strategies
│       ├── product.strategy.*.md       # Product strategies
│       └── AI_INTEGRATION_PLAN.md      # AI feature planning
│
├── 🔧 GITHUB CONFIGURATION
│   └── .github/
│       ├── workflows/
│       │   ├── ci.yml                 # CI/CD pipeline
│       │   ├── automated-qa.yml       # Quality checks
│       │   └── update-project-board.yml # Project automation
│       └── ISSUE_TEMPLATE/
│           ├── bug_report.md          # Bug template
│           └── feature_request.md     # Feature template
│
├── 🛍️ SHOPIFY APP (Submodule)
│   └── apps/sosv02/apps/sosv02/      # Gadget.dev Shopify app
│       ├── api/                       # Backend models & actions
│       │   ├── actions/               # Global actions
│       │   ├── models/                # Data models
│       │   └── services/              # Service integrations
│       ├── web/                       # React frontend
│       │   ├── components/            # UI components
│       │   └── routes/                # Page routes
│       └── settings.gadget.ts         # App configuration
│
├── 🔌 MICROSERVICES
│   └── services/
│       └── lookup-aggregator/         # Fraud API aggregation
│           ├── src/                   # Service code
│           └── README.md              # Service docs
│
├── 🐳 INFRASTRUCTURE
│   └── infrastructure/
│       └── docker/
│           ├── Dockerfile             # Container definition
│           └── docker-compose.*.yml   # Orchestration
│
├── 📚 DOCUMENTATION
│   ├── README.md                      # Project overview
│   ├── CONTRIBUTING.md                # Contribution guide
│   ├── TASKS.md                       # Task tracking
│   └── *.md                          # Various docs
│
└── 🧪 TESTING & SCRIPTS
    ├── test-*.sh                      # Test scripts
    ├── run-*.sh                       # Run scripts
    └── verify-*.md                    # Verification docs
```

## 🗂️ Key Directories Explained

### `/scripts/` - Task Management Tools

Our custom-built tools for efficient development:

- `task` - Switch between issues with automatic Git management
- `ai-status` - Get instant project overview
- `board-dashboard.sh` - Generate project board reports

### `/docs/` - Comprehensive Documentation

All project knowledge organized by category:

- **Timeline & Status** - Current progress tracking
- **Workflows** - How to work on the project
- **Architecture** - Technical design documents
- **Strategies** - Product and business planning

### `/.github/` - GitHub Automation

- **Workflows** - Automated testing, deployment, board updates
- **Templates** - Standardized issue/PR creation

### `/apps/sosv02/` - Shopify App

The main application (Gadget.dev):

- **api/** - Backend business logic
- **web/** - Frontend UI (React + Polaris)
- **services/** - External integrations

## 📍 Quick Navigation

### For AI Agents

1. Start: `START_HERE_AI_AGENT.md`
2. Status: `./scripts/ai-status`
3. Tasks: `./scripts/task list`
4. Timeline: `docs/TIMELINE_STATUS.md`

### For Development

1. Shopify App: `apps/sosv02/apps/sosv02/`
2. Services: `services/lookup-aggregator/`
3. Docker: `infrastructure/docker/`
4. Tests: `test-*.sh` scripts

### For Project Management

1. Board: `gh project view 7 --owner passwordless-OTP --web`
2. Issues: `gh issue list --state open`
3. PRs: `gh pr list`
4. Timeline: `docs/TIMELINE_STATUS.md`

## 🔑 Important Files

### Entry Points

- `START_HERE_AI_AGENT.md` - AI agent quickstart
- `README.md` - Project overview
- `CLAUDE.md` - Claude-specific instructions

### Status Tracking

- `docs/TIMELINE_STATUS.md` - Weekly progress
- `TASKS.md` - Current task list
- `.github/workflows/update-project-board.yml` - Automation

### Configuration

- `settings.gadget.ts` - Gadget app config
- `docker-compose.yml` - Service orchestration
- `.github/workflows/ci.yml` - CI/CD pipeline

## 🚀 Usage Patterns

### Daily Development Flow

```bash
scripts/ai-status          # Check status
scripts/task switch 9      # Work on issue
scripts/task list          # See all work
```

### Documentation Updates

```bash
docs/TIMELINE_STATUS.md    # Update progress
docs/DEVELOPMENT_WORKFLOW.md # Reference workflows
AI_PROJECT_MANAGER.md      # Update project guide
```

### Automation Scripts

```bash
scripts/update-project-board.sh  # Sync board
scripts/board-dashboard.sh       # Generate reports
.github/workflows/*              # CI/CD automation
```

## 📝 Notes

- **Two Repositories**: This structure spans both SOS and sos-app repos
- **Submodule**: The Shopify app is a Git submodule
- **AI-First**: Heavy focus on AI agent tooling and documentation
- **Automated**: GitHub Actions handle most maintenance tasks

Last Updated: January 17, 2025

