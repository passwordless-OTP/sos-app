#!/bin/bash

# SOS Development Roadmap - Board Update Script
# Updates GitHub Project Board status based on issue states

PROJECT_ID="PVT_kwHOB3B9VM4A7qjs"
FIELD_ID="PVTSSF_lAHOB3B9VM4A7qjszgv5Tas"
TODO_ID="f75ad846"
IN_PROGRESS_ID="47fc9ee4"
DONE_ID="98236657"

echo "🔄 Updating SOS Development Roadmap Board..."
echo "================================================"

# Function to update item status
update_status() {
  local item_id=$1
  local status_id=$2
  local status_name=$3
  
  gh api graphql -f query="
  mutation {
    updateProjectV2ItemFieldValue(
      input: {
        projectId: \"$PROJECT_ID\"
        itemId: \"$item_id\"
        fieldId: \"$FIELD_ID\"
        value: {singleSelectOptionId: \"$status_id\"}
      }
    ) {
      projectV2Item { id }
    }
  }" > /dev/null 2>&1
  
  echo "✅ Updated to $status_name"
}

# Get all project items with their current status
echo -e "\n📋 Fetching current board state..."
ITEMS=$(gh api graphql -f query='
query {
  node(id: "PVT_kwHOB3B9VM4A7qjs") {
    ... on ProjectV2 {
      items(first: 100) {
        nodes {
          id
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
              labels(first: 10) {
                nodes {
                  name
                }
              }
            }
            ... on PullRequest {
              number
              title
              state
              isDraft
              merged
            }
          }
        }
      }
    }
  }
}' | jq -r '.data.node.items.nodes')

# Process each item
echo "$ITEMS" | jq -c '.[]' | while read -r item; do
  ITEM_ID=$(echo "$item" | jq -r '.id')
  ISSUE_NUMBER=$(echo "$item" | jq -r '.content.number // empty')
  ISSUE_TITLE=$(echo "$item" | jq -r '.content.title // empty')
  ISSUE_STATE=$(echo "$item" | jq -r '.content.state // empty')
  CURRENT_STATUS=$(echo "$item" | jq -r '.fieldValues.nodes[] | select(.field.name == "Status") | .name // "No Status"')
  
  # Check if it's a PR
  IS_PR=$(echo "$item" | jq -r 'if .content.isDraft != null then "true" else "false" end')
  PR_MERGED=$(echo "$item" | jq -r '.content.merged // false')
  
  if [ -n "$ISSUE_NUMBER" ]; then
    echo -e "\n🔍 Processing #$ISSUE_NUMBER: ${ISSUE_TITLE:0:50}..."
    echo "   Current Status: $CURRENT_STATUS"
    
    # Logic for status updates
    if [ "$IS_PR" = "true" ]; then
      # Pull Request logic
      if [ "$PR_MERGED" = "true" ]; then
        if [ "$CURRENT_STATUS" != "Done" ]; then
          update_status "$ITEM_ID" "$DONE_ID" "Done"
        fi
      elif [ "$ISSUE_STATE" = "OPEN" ]; then
        if [ "$CURRENT_STATUS" = "No Status" ] || [ "$CURRENT_STATUS" = "Todo" ]; then
          update_status "$ITEM_ID" "$IN_PROGRESS_ID" "In Progress"
        fi
      elif [ "$ISSUE_STATE" = "CLOSED" ]; then
        if [ "$CURRENT_STATUS" != "Done" ]; then
          update_status "$ITEM_ID" "$DONE_ID" "Done"
        fi
      fi
    else
      # Issue logic
      if [ "$ISSUE_STATE" = "CLOSED" ]; then
        if [ "$CURRENT_STATUS" != "Done" ]; then
          update_status "$ITEM_ID" "$DONE_ID" "Done"
        fi
      elif [ "$CURRENT_STATUS" = "No Status" ]; then
        update_status "$ITEM_ID" "$TODO_ID" "Todo"
      fi
    fi
  fi
done

echo -e "\n📊 Generating status summary..."

# Count items by status
TODO_COUNT=$(echo "$ITEMS" | jq '[.[] | select(.fieldValues.nodes[] | select(.field.name == "Status" and .name == "Todo"))] | length')
IN_PROGRESS_COUNT=$(echo "$ITEMS" | jq '[.[] | select(.fieldValues.nodes[] | select(.field.name == "Status" and .name == "In Progress"))] | length')
DONE_COUNT=$(echo "$ITEMS" | jq '[.[] | select(.fieldValues.nodes[] | select(.field.name == "Status" and .name == "Done"))] | length')

echo -e "\n📈 Board Status Summary:"
echo "========================"
echo "Todo:        $TODO_COUNT items"
echo "In Progress: $IN_PROGRESS_COUNT items"
echo "Done:        $DONE_COUNT items"
echo "========================"
echo "Total:       $((TODO_COUNT + IN_PROGRESS_COUNT + DONE_COUNT)) items"

# Check for issues without labels
echo -e "\n⚠️  Issues needing attention:"
gh issue list --repo passwordless-OTP/sos-app --limit 50 --json number,labels | \
  jq -r '.[] | select(.labels | length == 0) | "   - Issue #\(.number) has no labels"'

# Check for stale in-progress items
echo -e "\n🕰️  Stale In Progress items (>7 days):"
gh issue list --repo passwordless-OTP/sos-app --state open --search "updated:<7d" --json number,title,updatedAt | \
  jq -r '.[] | "   - #\(.number): \(.title) (Last updated: \(.updatedAt | split("T")[0]))"'

echo -e "\n✅ Board update complete!"
echo "View the board: https://github.com/users/passwordless-OTP/projects/7"