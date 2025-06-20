#!/usr/bin/env python3
import subprocess
import os

def run_command(cmd, cwd=None):
    """Run a shell command and return the output."""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=cwd)
        print(f"Command: {cmd}")
        print(f"Output: {result.stdout}")
        if result.stderr:
            print(f"Error: {result.stderr}")
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        print(f"Exception running command: {e}")
        return False, "", str(e)

# Change to the project directory
project_dir = "/Users/jarvis/Downloads/development/SOS"
os.chdir(project_dir)

# Check current branch
print("=== Checking current branch ===")
success, stdout, stderr = run_command("git branch --show-current")

# Create and checkout the feature branch
print("\n=== Creating and checking out feature branch ===")
branch_name = "feature/issue-15-phase-1-documentation--product-vision---"
success, stdout, stderr = run_command(f"git checkout -b {branch_name}")
if not success and "already exists" in stderr:
    print("Branch already exists, checking it out...")
    run_command(f"git checkout {branch_name}")

# Stage all files in docs/product/
print("\n=== Staging files in docs/product/ ===")
run_command("git add docs/product/")

# Read the commit message
commit_message = """docs: Complete Phase 1 Product Vision & Mission documentation

Comprehensive documentation package for SOS product vision and strategy:

Vision Documents:
- Add main vision & mission statement ("Waze for E-commerce Security")
- Create quick reference summary for pitches and team alignment
- Document multiple vision variants for stakeholder consideration
- Define core values: Community First, Radical Transparency, Speed, Privacy, Learning

Strategy Documents:
- Implement "Friction as a Weapon" conversion optimization strategy
- Design UX KPI framework with industry standard comparisons
- Create performance and friction balance methodology
- Add checkout funnel friction visualization with citations

Key Concepts Introduced:
- VMS (Visitor Management System) - adaptive friction control
- SEN (Security Events Network) - recycled verifications
- Intelligent friction that improves conversions while securing stores

Targets Defined:
- Year 1: 100 merchants, 10%+ conversion improvement
- Year 3: 10,000 merchants, 100M recycled verifications/month
- Year 5: $10B+ additional merchant revenue

This completes all requirements for Issue #15 (Phase 1 Documentation: Product Vision & Mission).

Closes #15

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"""

# Commit the changes
print("\n=== Committing changes ===")
# Write commit message to temp file to avoid shell escaping issues
with open("/tmp/commit_msg.txt", "w") as f:
    f.write(commit_message)
run_command("git commit -F /tmp/commit_msg.txt")

# Push to remote
print("\n=== Pushing to remote ===")
run_command(f"git push -u origin {branch_name}")

# Create PR
print("\n=== Creating pull request ===")
pr_body = """## Summary
This PR completes Phase 1 of the SOS documentation effort, delivering comprehensive product vision and mission documentation as outlined in Issue #15.

## What's Included

### Vision Documents
- **Main Vision & Mission Statement**: "Waze for E-commerce Security" positioning
- **Quick Reference Summary**: Concise version for pitches and team alignment
- **Vision Variants**: Multiple positioning options for different stakeholders
- **Core Values**: Community First, Radical Transparency, Speed, Privacy, Learning

### Strategy Documents
- **"Friction as a Weapon" Strategy**: How intelligent friction improves conversions
- **UX KPI Framework**: Industry standard comparisons and targets
- **Performance & Friction Balance**: Methodology for optimization
- **Checkout Funnel Visualization**: With academic citations

### Key Concepts
- **VMS (Visitor Management System)**: Adaptive friction control
- **SEN (Security Events Network)**: Recycled verification system
- **Intelligent Friction**: Conversion optimization through security

### Targets
- Year 1: 100 merchants, 10%+ conversion improvement
- Year 3: 10,000 merchants, 100M recycled verifications/month
- Year 5: $10B+ additional merchant revenue

## Files Added
- `VISION_AND_MISSION.md` - Main vision document
- `VISION_MISSION_SUMMARY.md` - Quick reference
- `VISION_VARIANTS_COMPARISON.md` - Alternative positioning
- `VISION_AND_MISSION_VMS_VARIANT.md` - VMS-focused version
- `FRICTION_AS_A_WEAPON_STRATEGY.md` - Core strategy document
- `UX_KPI_FRAMEWORK.md` - Performance metrics
- `INDUSTRY_STANDARD_VS_SOS_KPIS.md` - Competitive analysis
- `PERFORMANCE_AND_FRICTION_STRATEGY.md` - Balance methodology
- `CHECKOUT_FUNNEL_FRICTION_VISUALIZATION.md` - Visual guide
- `CHECKOUT_FUNNEL_FRICTION_VISUALIZATION_CITED.md` - Academic version
- `UX_KPI_GLOSSARY.md` - Terms and definitions
- `INTELLIGENT_FRICTION_EXECUTIVE_SUMMARY.md` - Executive overview
- `DASHBOARD_WIREFRAMES_IPAD.md` - UI wireframes
- `DEMO_IMPLEMENTATION_GUIDE.md` - Technical guide

Closes #15

🤖 Generated with [Claude Code](https://claude.ai/code)"""

# Write PR body to temp file
with open("/tmp/pr_body.txt", "w") as f:
    f.write(pr_body)

run_command('gh pr create --title "docs: Complete Phase 1 Product Vision & Mission documentation" --body-file /tmp/pr_body.txt --base main')

print("\n=== All operations completed! ===")