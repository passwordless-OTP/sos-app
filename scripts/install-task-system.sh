#!/bin/bash

echo "🚀 Installing SOS Task Management System"
echo "======================================"

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Create symlink for global access
echo "Creating global 'task' command..."
sudo ln -sf "$SCRIPT_DIR/task" /usr/local/bin/task

# Add useful git aliases
echo "Adding Git aliases..."
git config --global alias.task '!task'
git config --global alias.t '!task'

# Create shell aliases
echo ""
echo "Add these to your ~/.bashrc or ~/.zshrc:"
echo "========================================="
echo "# SOS Task Management Aliases"
echo "alias t='task'"
echo "alias ts='task switch'"
echo "alias tl='task list'"
echo "alias tf='task finish'"
echo ""

# Install completion (optional)
if [ -n "$ZSH_VERSION" ]; then
    # Zsh completion
    cat > ~/.oh-my-zsh/completions/_task << 'EOF'
#compdef task

_task() {
    local -a commands
    commands=(
        'current:Show current task status'
        'switch:Switch to a different task'
        'start:Start working on a new task'
        'list:List all active tasks'
        'pause:Save work and return to main'
        'finish:Mark task ready for review'
        'help:Show help information'
    )
    
    if (( CURRENT == 2 )); then
        _describe 'command' commands
    elif (( CURRENT == 3 )); then
        case $words[2] in
            switch|sw)
                # Complete with issue numbers
                local issues=$(gh issue list --assignee @me --state open --json number,title | jq -r '.[] | "\(.number):\(.title)"')
                _describe 'issue' issues
                ;;
        esac
    fi
}

compdef _task task
EOF
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "Usage:"
echo "  task              # Show current task"
echo "  task switch 9     # Switch to issue #9"
echo "  task list         # List all active tasks"
echo ""
echo "Try it now: task"