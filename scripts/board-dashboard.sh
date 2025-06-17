#!/bin/bash

# SOS Development Roadmap - Interactive Dashboard
# Provides real-time board status and management options

clear
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         SOS Development Roadmap - Board Dashboard          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project constants
PROJECT_ID="PVT_kwHOB3B9VM4A7qjs"
REPO="passwordless-OTP/sos-app"

# Function to show board status
show_board_status() {
  echo -e "${BLUE}📊 Current Board Status${NC}"
  echo "========================"
  
  # Get all issues with their project status
  ITEMS=$(gh api graphql -f query='
  query {
    node(id: "PVT_kwHOB3B9VM4A7qjs") {
      ... on ProjectV2 {
        items(first: 100) {
          nodes {
            fieldValues(first: 10) {
              nodes {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                  field {
                    ... on ProjectV2SingleSelectField {
                      name
                    }
                  }
                }
              }
            }
            content {
              ... on Issue {
                number
                title
                state
                labels(first: 5) {
                  nodes {
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  }' 2>/dev/null)
  
  # Count by status
  TODO=$(echo "$ITEMS" | jq '[.data.node.items.nodes[] | select(.fieldValues.nodes[] | select(.field.name == "Status" and .name == "Todo"))] | length')
  IN_PROGRESS=$(echo "$ITEMS" | jq '[.data.node.items.nodes[] | select(.fieldValues.nodes[] | select(.field.name == "Status" and .name == "In Progress"))] | length')
  DONE=$(echo "$ITEMS" | jq '[.data.node.items.nodes[] | select(.fieldValues.nodes[] | select(.field.name == "Status" and .name == "Done"))] | length')
  
  echo -e "${YELLOW}Todo:${NC}        $TODO items"
  echo -e "${GREEN}In Progress:${NC} $IN_PROGRESS items"
  echo -e "${BLUE}Done:${NC}        $DONE items"
  echo "------------------------"
  echo "Total:       $((TODO + IN_PROGRESS + DONE)) items"
  echo ""
}

# Function to show priority breakdown
show_priority_breakdown() {
  echo -e "${BLUE}🎯 Priority Breakdown${NC}"
  echo "====================="
  
  # Get issues by priority
  HIGH=$(gh issue list --repo $REPO --label "priority:high" --state open --json number | jq length)
  MEDIUM=$(gh issue list --repo $REPO --label "priority:medium" --state open --json number | jq length)
  LOW=$(gh issue list --repo $REPO --label "priority:low" --state open --json number | jq length)
  NO_PRIORITY=$(gh issue list --repo $REPO --state open --json number,labels | jq '[.[] | select(.labels | map(.name) | map(test("priority:")) | any | not)] | length')
  
  echo -e "${RED}High Priority:${NC}    $HIGH issues"
  echo -e "${YELLOW}Medium Priority:${NC} $MEDIUM issues"
  echo -e "${GREEN}Low Priority:${NC}    $LOW issues"
  echo -e "No Priority:     $NO_PRIORITY issues"
  echo ""
}

# Function to show recent activity
show_recent_activity() {
  echo -e "${BLUE}📅 Recent Activity (Last 7 days)${NC}"
  echo "================================"
  
  # Recent issues
  RECENT_ISSUES=$(gh issue list --repo $REPO --state all --search "created:>7d" --json number,title,createdAt | jq -r '.[] | "  #\(.number) - \(.title[:50])... (\(.createdAt | split("T")[0]))"')
  
  if [ -n "$RECENT_ISSUES" ]; then
    echo "New Issues:"
    echo "$RECENT_ISSUES"
  else
    echo "No new issues in the last 7 days"
  fi
  
  echo ""
}

# Function to show alerts
show_alerts() {
  echo -e "${RED}⚠️  Alerts & Actions Needed${NC}"
  echo "============================"
  
  # Check for unlabeled issues
  UNLABELED=$(gh issue list --repo $REPO --state open --json number,labels | jq -r '.[] | select(.labels | length == 0) | "  #\(.number) - Needs labels"')
  
  if [ -n "$UNLABELED" ]; then
    echo "Issues without labels:"
    echo "$UNLABELED"
  fi
  
  # Check for stale in-progress
  STALE=$(gh issue list --repo $REPO --state open --search "updated:<7d" --json number,title | jq -r '.[] | "  #\(.number) - \(.title[:40])... (stale)"')
  
  if [ -n "$STALE" ]; then
    echo -e "\nStale issues (no updates >7 days):"
    echo "$STALE"
  fi
  
  if [ -z "$UNLABELED" ] && [ -z "$STALE" ]; then
    echo -e "${GREEN}✅ No alerts - board is healthy!${NC}"
  fi
  
  echo ""
}

# Function to show menu
show_menu() {
  echo -e "${BLUE}🔧 Board Management Options${NC}"
  echo "==========================="
  echo "1. Update all issue statuses"
  echo "2. Add labels to unlabeled issues"
  echo "3. Generate sprint plan"
  echo "4. Export board to CSV"
  echo "5. View detailed issue list"
  echo "6. Refresh dashboard"
  echo "0. Exit"
  echo ""
  read -p "Select an option: " choice
  
  case $choice in
    1)
      echo "Updating issue statuses..."
      ./update-project-board.sh
      ;;
    2)
      add_labels_to_issues
      ;;
    3)
      generate_sprint_plan
      ;;
    4)
      export_to_csv
      ;;
    5)
      show_detailed_issues
      ;;
    6)
      clear
      main
      ;;
    0)
      echo "Goodbye!"
      exit 0
      ;;
    *)
      echo "Invalid option"
      ;;
  esac
}

# Function to add labels to issues
add_labels_to_issues() {
  echo -e "\n${YELLOW}Adding labels to unlabeled issues...${NC}"
  
  UNLABELED_ISSUES=$(gh issue list --repo $REPO --state open --json number,labels | jq -r '.[] | select(.labels | length == 0) | .number')
  
  for issue in $UNLABELED_ISSUES; do
    echo "Processing issue #$issue..."
    # Add default labels
    gh issue edit $issue --repo $REPO --add-label "enhancement,priority:medium"
    echo "✅ Added default labels to #$issue"
  done
}

# Function to generate sprint plan
generate_sprint_plan() {
  echo -e "\n${BLUE}📋 Suggested Sprint Plan${NC}"
  echo "========================"
  
  # Get high priority issues
  echo -e "\n${RED}High Priority Issues:${NC}"
  gh issue list --repo $REPO --label "priority:high" --state open --json number,title,labels | \
    jq -r '.[] | "  #\(.number) - \(.title) [\(.labels | map(.name) | join(", "))]"'
  
  echo -e "\n${YELLOW}Suggested Sprint Items (2 weeks):${NC}"
  gh issue list --repo $REPO --label "priority:high" --state open --limit 3 --json number,title | \
    jq -r '.[] | "  #\(.number) - \(.title)"'
  
  gh issue list --repo $REPO --label "priority:medium,effort:2-3days" --state open --limit 2 --json number,title | \
    jq -r '.[] | "  #\(.number) - \(.title)"'
}

# Function to export to CSV
export_to_csv() {
  FILENAME="sos-board-export-$(date +%Y%m%d-%H%M%S).csv"
  echo "Exporting to $FILENAME..."
  
  echo "Number,Title,Status,Priority,Effort,Labels,Created,Updated" > "$FILENAME"
  
  gh issue list --repo $REPO --state all --limit 100 --json number,title,state,labels,createdAt,updatedAt | \
    jq -r '.[] | [
      .number,
      .title,
      .state,
      (.labels | map(select(.name | startswith("priority:"))) | .[0].name // "none"),
      (.labels | map(select(.name | startswith("effort:"))) | .[0].name // "none"),
      (.labels | map(.name) | join(";")),
      .createdAt,
      .updatedAt
    ] | @csv' >> "$FILENAME"
  
  echo "✅ Exported to $FILENAME"
}

# Function to show detailed issues
show_detailed_issues() {
  echo -e "\n${BLUE}📝 Detailed Issue List${NC}"
  echo "======================"
  
  gh issue list --repo $REPO --state open --json number,title,labels,assignees | \
    jq -r '.[] | "
Issue #\(.number): \(.title)
Labels: \(.labels | map(.name) | join(", "))
Assignees: \(.assignees | map(.login) | join(", ") // "Unassigned")
---"'
}

# Main function
main() {
  show_board_status
  show_priority_breakdown
  show_recent_activity
  show_alerts
  show_menu
}

# Run main function
main