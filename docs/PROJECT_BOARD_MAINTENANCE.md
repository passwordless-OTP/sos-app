# SOS Development Roadmap - Board Maintenance Guide

## Overview
This document outlines how to keep the GitHub Project Board (https://github.com/users/passwordless-OTP/projects/7) up-to-date at all times.

## Board Structure

### Columns/Status
1. **Todo** - New issues ready for development
2. **In Progress** - Active development work
3. **Done** - Completed work

### Priority Levels
- **P0 (Critical)** - Blockers, security issues
- **P1 (High)** - Core features, major bugs
- **P2 (Medium)** - Enhancements, minor bugs
- **P3 (Low)** - Nice-to-have features

### Effort Estimates
- **XS** - < 1 day
- **S** - 1-2 days
- **M** - 3-4 days
- **L** - 1 week
- **XL** - 1-2 weeks
- **XXL** - > 2 weeks

## Maintenance Schedule

### Daily Updates
- [ ] Check for new issues without labels
- [ ] Verify issue status matches actual work
- [ ] Update "In Progress" items
- [ ] Move completed items to "Done"

### Weekly Reviews
- [ ] Prioritize backlog items
- [ ] Review effort estimates
- [ ] Archive completed items > 2 weeks old
- [ ] Check for stale "In Progress" items

### Sprint Planning (Bi-weekly)
- [ ] Move priority items to "Todo"
- [ ] Assign developers to issues
- [ ] Set sprint milestones
- [ ] Update roadmap timeline

## Automation Rules

### Auto-labeling
- Bug reports → `bug` label
- Feature requests → `enhancement` label
- Questions → `question` label

### Auto-assignment
- Frontend issues → Frontend team
- API issues → Backend team
- Fraud detection → Core team

### Status Updates
- PR linked → Move to "In Progress"
- PR merged → Move to "Done"
- Issue closed → Move to "Done"

## Issue Templates

### Bug Report
```markdown
**Description**: Clear description of the bug
**Steps to Reproduce**: 
1. Step one
2. Step two
**Expected**: What should happen
**Actual**: What actually happens
**Environment**: Browser, OS, etc.
```

### Feature Request
```markdown
**Problem**: What problem does this solve?
**Solution**: Proposed solution
**Alternatives**: Other options considered
**Additional Context**: Screenshots, examples
```

## Metrics to Track

### Velocity
- Issues completed per sprint
- Story points delivered
- Cycle time (Todo → Done)

### Quality
- Bug escape rate
- Time to resolution
- Customer satisfaction

### Health
- Work in progress limits
- Blocked items count
- Technical debt ratio

## Board Queries

### High Priority Items
```
is:open label:priority:high sort:created-asc
```

### Stale In Progress
```
is:open status:"In Progress" updated:<7d
```

### Unestimated Items
```
is:open -label:effort:*
```

## Integration Points

### Slack Notifications
- New high priority issues
- Status changes
- Sprint start/end

### Weekly Reports
- Velocity charts
- Burndown graphs
- Upcoming milestones

### Dashboard
- Real-time board status
- Team workload
- Progress indicators

## Best Practices

1. **One source of truth** - All work tracked in GitHub
2. **Clear definitions** - Everyone understands statuses
3. **Regular grooming** - Keep backlog manageable
4. **Limit WIP** - Max 3 items per developer
5. **Document decisions** - Use issue comments

## Maintenance Checklist

### New Issue Created
- [ ] Add priority label
- [ ] Add effort estimate
- [ ] Add feature category
- [ ] Add to project board
- [ ] Set initial status

### Issue In Progress
- [ ] Assign developer
- [ ] Link PR when created
- [ ] Update progress daily
- [ ] Flag blockers immediately

### Issue Completed
- [ ] Verify acceptance criteria
- [ ] Update documentation
- [ ] Close linked PRs
- [ ] Move to Done
- [ ] Notify stakeholders

## Emergency Procedures

### Critical Bug
1. Create issue with P0 label
2. Assign to on-call developer
3. Move directly to In Progress
4. Notify team in Slack
5. Daily updates until resolved

### Security Issue
1. Create private issue
2. Limited visibility
3. Immediate assignment
4. Follow security protocol
5. Post-mortem required