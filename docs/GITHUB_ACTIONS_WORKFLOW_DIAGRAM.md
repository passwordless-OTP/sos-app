# GitHub Actions Workflow - Visual Guide

## Overview
This document visualizes how GitHub Actions automatically maintains the SOS Development Roadmap project board.

## Workflow Visualization

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          GITHUB ACTIONS WORKFLOW VISUALIZATION                       │
└─────────────────────────────────────────────────────────────────────────────────────┘

   USER ACTION                    GITHUB                      ACTIONS RUNNER              PROJECT BOARD
       │                            │                              │                           │
       │                            │                              │                           │
   ┌───▼───┐                        │                              │                           │
   │ CREATE│                        │                              │                           │
   │ ISSUE │                        │                              │                           │
   └───┬───┘                        │                              │                           │
       │                            │                              │                           │
       │    POST /repos/.../issues  │                              │                           │
       ├───────────────────────────►│                              │                           │
       │                            │                              │                           │
       │                         ┌──▼──┐                           │                           │
       │                         │EVENT│                           │                           │
       │                         │FIRED│                           │                           │
       │                         └──┬──┘                           │                           │
       │                            │                              │                           │
       │                            │   Webhook: issue.opened      │                           │
       │                            ├─────────────────────────────►│                           │
       │                            │                              │                           │
       │                            │                          ┌───▼────┐                      │
       │                            │                          │WORKFLOW│                      │
       │                            │                          │TRIGGERS│                      │
       │                            │                          └───┬────┘                      │
       │                            │                              │                           │
       │                            │                              ├──┐                        │
       │                            │                              │  │ CHECK CONTENT          │
       │                            │                              │◄─┘ if "bug" → add label  │
       │                            │                              │                           │
       │                            │     Add Label "bug"          │                           │
       │                            │◄─────────────────────────────┤                           │
       │                            │                              │                           │
       │                            │     Post Comment             │                           │
       │                            │◄─────────────────────────────┤                           │
       │                            │                              │                           │
       │                            │                              │    GraphQL: Add to Board  │
       │                            │                              ├──────────────────────────►│
       │                            │                              │                           │
       │                            │                              │    Set Status = "Todo"    │
       │                            │                              ├──────────────────────────►│
       │                            │                              │                           │
       │  Issue Updated ✓           │                              │                       ┌───▼───┐
       │◄───────────────────────────┤                              │                       │ BOARD │
       │  • Label: bug              │                              │                       │UPDATED│
       │  • Comment posted          │                              │                       └───────┘
       │  • In project board        │                              │
       │                            │                              │
═══════╪════════════════════════════╪══════════════════════════════╪═══════════════════════════════
       │                            │                              │
   ┌───▼───┐                        │                              │
   │ CLOSE │                        │                              │
   │ ISSUE │                        │                              │
   └───┬───┘                        │                              │
       │                            │                              │
       │    PATCH /repos/.../issues │                              │
       ├───────────────────────────►│                              │
       │                            │                              │
       │                         ┌──▼──┐                           │
       │                         │EVENT│                           │
       │                         │FIRED│                           │
       │                         └──┬──┘                           │
       │                            │                              │
       │                            │   Webhook: issue.closed      │
       │                            ├─────────────────────────────►│
       │                            │                              │
       │                            │                          ┌───▼────┐
       │                            │                          │WORKFLOW│
       │                            │                          │TRIGGERS│
       │                            │                          └───┬────┘
       │                            │                              │
       │                            │                              │    GraphQL: Find Item
       │                            │                              ├──────────────────────────►│
       │                            │                              │                           │
       │                            │                              │    Set Status = "Done"    │
       │                            │                              ├──────────────────────────►│
       │                            │                              │                           │
       │                            │                              │                       ┌───▼───┐
       │  Board Updated ✓           │                              │                       │ MOVED │
       │◄───────────────────────────┤                              │                       │TO DONE│
       │                            │                              │                       └───────┘
       │                            │                              │
═══════╪════════════════════════════╪══════════════════════════════╪═══════════════════════════════
       │                            │                              │
       │                            │                              │
                                 ┌──┴──┐                       ┌───┴────┐
                                 │DAILY│                       │CRON JOB│
                                 │9 AM │                       │TRIGGERS│
                                 └──┬──┘                       └───┬────┘
                                    │                              │
                                    │   Schedule: 0 9 * * *       │
                                    ├─────────────────────────────►│
                                    │                              │
                                    │                              ├──┐
                                    │                              │  │ Find stale items
                                    │                              │◄─┘ Check missing labels
                                    │                              │
                                    │     Bulk Updates             │
                                    │◄─────────────────────────────┤
                                    │                              │
                                    │                          ┌───▼────┐
                                    │                          │ BOARD  │
                                    │                          │CLEANED │
                                    │                          └────────┘


 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                              AUTOMATION BENEFITS                                 │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │                                                                                 │
 │  MANUAL PROCESS (Before)                    AUTOMATED PROCESS (After)           │
 │  ────────────────────────                   ─────────────────────────          │
 │                                                                                 │
 │  1. Create issue         (30s)              1. Create issue                    │
 │  2. Add labels          (30s)              2. Everything automatic (2s)        │
 │  3. Add to project      (30s)                                                  │
 │  4. Set status          (30s)              Total: 2 seconds                    │
 │  5. Close issue         (30s)                                                  │
 │  6. Update board        (30s)              Savings: 98% time reduction         │
 │                                                                                 │
 │  Total: 3 minutes                          Board always in sync ✓              │
 │                                                                                 │
 └─────────────────────────────────────────────────────────────────────────────────┘
```

## Workflow Components Explained

### 1. Event Triggers
The workflow responds to these GitHub events:
- **issues.opened** - When a new issue is created
- **issues.closed** - When an issue is closed
- **issues.labeled** - When labels are added/removed
- **pull_request.opened** - When a PR is created
- **pull_request.merged** - When a PR is merged
- **schedule.cron** - Daily at 9 AM UTC

### 2. Automated Actions

#### On Issue Creation:
1. **Content Analysis** - Scans issue body for keywords
2. **Auto-labeling** - Adds appropriate labels (bug, enhancement, etc.)
3. **Project Board Addition** - Adds to SOS Development Roadmap
4. **Status Assignment** - Sets to "Todo" status
5. **Welcome Comment** - Posts helpful guidance

#### On Issue Closure:
1. **Status Update** - Automatically moves to "Done"
2. **Board Sync** - Ensures project board reflects current state

#### Daily Maintenance (9 AM UTC):
1. **Stale Item Check** - Identifies items without recent updates
2. **Label Audit** - Finds issues missing required labels
3. **Status Verification** - Ensures all items have proper status
4. **Report Generation** - Creates summary of board health

### 3. Technical Implementation

#### GitHub Action Location:
```
.github/workflows/update-project-board.yml
```

#### Key Technologies:
- **GitHub GraphQL API** - For project board manipulation
- **GitHub REST API** - For issue/PR updates
- **GitHub Actions** - Workflow automation platform
- **Node.js** - Runtime for action scripts

### 4. Time Savings Analysis

| Task | Manual Time | Automated Time | Savings |
|------|------------|----------------|---------|
| Add labels | 30 seconds | 1 second | 97% |
| Add to project | 30 seconds | 1 second | 97% |
| Update status | 30 seconds | 1 second | 97% |
| Post comments | 60 seconds | 1 second | 98% |
| **Total per issue** | **3 minutes** | **4 seconds** | **98%** |

### 5. Benefits

#### Immediate Benefits:
- ✅ Zero manual board maintenance
- ✅ Consistent labeling and organization
- ✅ Real-time status updates
- ✅ Automatic project tracking

#### Long-term Benefits:
- 📈 Better project visibility
- 🎯 More time for actual development
- 🔄 Consistent workflow enforcement
- 📊 Accurate project metrics

## Configuration

### Project Constants:
```javascript
PROJECT_ID = "PVT_kwHOB3B9VM4A7qjs"        // SOS Development Roadmap
FIELD_ID = "PVTSSF_lAHOB3B9VM4A7qjszgv5Tas" // Status field
TODO_ID = "f75ad846"                        // Todo status
IN_PROGRESS_ID = "47fc9ee4"                 // In Progress status
DONE_ID = "98236657"                        // Done status
```

### Repository:
```
passwordless-OTP/sos-app
```

## Monitoring

### View Action Runs:
https://github.com/passwordless-OTP/sos-app/actions

### View Project Board:
https://github.com/users/passwordless-OTP/projects/7

### Check Workflow Status:
```bash
gh run list --workflow=update-project-board.yml
```

## Troubleshooting

### Common Issues:

1. **Action not triggering**
   - Check if workflow file is in main branch
   - Verify GitHub Actions is enabled for repo
   - Check workflow syntax

2. **Permission errors**
   - Ensure workflow has `write` permissions
   - Check API token scopes

3. **Board not updating**
   - Verify project ID is correct
   - Check field IDs match current board
   - Review action logs for errors

## Future Enhancements

1. **Slack Integration** - Send notifications on critical updates
2. **Custom Labels** - More sophisticated labeling logic
3. **Sprint Management** - Automatic sprint assignment
4. **Metrics Dashboard** - Track velocity and throughput
5. **AI-Powered Triage** - Use AI to categorize and prioritize issues