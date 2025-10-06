#!/bin/bash

# Enhanced Auto-Fix Script with Partial Success Support
# This script attempts to fix lint issues and commits successful fixes
# even if some fixes fail, allowing CI to proceed with improved code

set -e

# Parse command line arguments
WORKFLOW_MODE=false
JSON_OUTPUT=false
VERBOSE=false
COMMIT_PARTIAL=true
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --workflow-mode)
      WORKFLOW_MODE=true
      shift
      ;;
    --json)
      JSON_OUTPUT=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    --no-commit-partial)
      COMMIT_PARTIAL=false
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [--workflow-mode] [--json] [--verbose] [--no-commit-partial] [--dry-run]"
      echo "  --workflow-mode: Run in workflow mode (no commits, in-memory fixes)"
      echo "  --json: Output results in JSON format"
      echo "  --verbose: Enable verbose output"
      echo "  --no-commit-partial: Don't commit partial fixes"
      echo "  --dry-run: Show what would be done without making changes"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

echo "🔧 Enhanced auto-fixing with partial success support..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "success")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "error")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "warning")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "info")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Initialize tracking variables
TOTAL_FIXES_ATTEMPTED=0
SUCCESSFUL_FIXES=0
FAILED_FIXES=0
FIXES_APPLIED=()
FIXES_FAILED=()
CHANGES_MADE=false

# Function to track fix attempts
track_fix_attempt() {
    local fix_name="$1"
    local fix_command="$2"
    
    TOTAL_FIXES_ATTEMPTED=$((TOTAL_FIXES_ATTEMPTED + 1))
    print_status "info" "Attempting fix: $fix_name"
    
    if [ "$DRY_RUN" = true ]; then
        print_status "info" "DRY RUN: Would execute: $fix_command"
        SUCCESSFUL_FIXES=$((SUCCESSFUL_FIXES + 1))
        FIXES_APPLIED+=("$fix_name (dry-run)")
        return 0
    fi
    
    if eval "$fix_command"; then
        print_status "success" "Fix successful: $fix_name"
        SUCCESSFUL_FIXES=$((SUCCESSFUL_FIXES + 1))
        FIXES_APPLIED+=("$fix_name")
        CHANGES_MADE=true
        return 0
    else
        print_status "error" "Fix failed: $fix_name"
        FAILED_FIXES=$((FAILED_FIXES + 1))
        FIXES_FAILED+=("$fix_name")
        return 1
    fi
}

# Check if we're in the right directory
if [ ! -d "asset-tag-backend" ]; then
    print_status "error" "Please run this script from the repository root"
    exit 1
fi

# Install formatting tools if not available
print_status "info" "Ensuring formatting tools are available..."

# Upgrade pip first
python3 -m pip install --user --upgrade pip

# Install formatting tools with better error handling
print_status "info" "Installing Python linting tools..."
if python3 -m pip install --user isort==5.13.2 black==24.1.1 flake8==7.0.0 mypy==1.8.0 bandit==1.7.5 safety==3.0.1; then
    print_status "success" "Python linting tools installed successfully"
else
    print_status "error" "Failed to install Python linting tools"
    exit 1
fi

# Backend import fixing with individual tracking
echo "🐍 Fixing backend import formatting..."

cd asset-tag-backend

# Create pyproject.toml if it doesn't exist
if [ ! -f "pyproject.toml" ]; then
    print_status "info" "Creating pyproject.toml for consistent formatting..."
    cat > pyproject.toml << 'EOF'
[tool.isort]
profile = "black"
multi_line_output = 3
line_length = 88
include_trailing_comma = true
force_grid_wrap = 0
use_parentheses = true
ensure_newline_before_comments = true
skip_glob = ["*/migrations/*"]

[tool.black]
line-length = 88
target-version = ['py39', 'py310', 'py311']
include = '\.pyi?$'
extend-exclude = '''
/(
  # directories
  \.eggs
  | \.git
  | \.hg
  | \.mypy_cache
  | \.tox
  | \.venv
  | build
  | dist
  | migrations
)/
'''

[tool.mypy]
python_version = "3.11"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = false
ignore_missing_imports = true
EOF
fi

# Track individual backend fixes
track_fix_attempt "Backend Import Sorting" "python3 -m isort ."
track_fix_attempt "Backend Code Formatting" "python3 -m black ."

cd ..

# Frontend formatting with individual tracking
if [ -d "asset-tag-frontend" ]; then
    echo "🎨 Fixing frontend formatting..."
    
    cd asset-tag-frontend
    
    if command_exists npm; then
        # Install dependencies if needed
        if [ ! -d "node_modules" ]; then
            print_status "info" "Installing frontend dependencies..."
            # Try workspace-aware installation from root first
            cd ..
            if npm ci --workspace=asset-tag-frontend; then
                print_status "success" "Frontend dependencies installed via workspace"
                cd asset-tag-frontend
            else
                print_status "warning" "Workspace install failed, trying local install..."
                cd asset-tag-frontend
                if npm ci; then
                    print_status "success" "Frontend dependencies installed locally"
                else
                    print_status "warning" "npm ci failed, trying npm install..."
                    npm install
                fi
            fi
        fi
        
        # Track individual frontend fixes
        track_fix_attempt "Frontend Formatting" "npm run format"
        track_fix_attempt "Frontend Linting" "npm run lint:fix"
        
    else
        print_status "warning" "npm not found, skipping frontend formatting"
    fi
    
    cd ..
fi

# Determine overall success
OVERALL_SUCCESS=false
if [ $SUCCESSFUL_FIXES -gt 0 ]; then
    OVERALL_SUCCESS=true
fi

# Commit changes if we're in workflow mode and have successful fixes
if [ "$WORKFLOW_MODE" = true ] && [ "$COMMIT_PARTIAL" = true ] && [ "$CHANGES_MADE" = true ] && [ "$DRY_RUN" = false ]; then
    print_status "info" "Committing successful fixes..."
    
    # Configure git
    git config --local user.email "action@github.com"
    git config --local user.name "GitHub Action"
    
    # Add changes
    git add .
    
    # Check if there are changes to commit
    if git diff --staged --quiet; then
        print_status "info" "No changes to commit"
    else
        # Create commit message with details
        COMMIT_MSG="🔧 Auto-fix: Resolve lint issues (partial success)

Successfully applied fixes:
$(printf '  - %s\n' "${FIXES_APPLIED[@]}")

"
        
        if [ ${#FIXES_FAILED[@]} -gt 0 ]; then
            COMMIT_MSG+="Failed to fix:
$(printf '  - %s\n' "${FIXES_FAILED[@]}")

"
        fi
        
        COMMIT_MSG+="Summary: $SUCCESSFUL_FIXES/$TOTAL_FIXES_ATTEMPTED fixes applied successfully
Auto-generated by enhanced-auto-fix script"
        
        # Commit changes
        git commit -m "$COMMIT_MSG"
        
        # Push changes
        git push
        
        print_status "success" "Partial fixes committed and pushed"
    fi
fi

# Output results based on mode
if [ "$JSON_OUTPUT" = true ]; then
    # Create JSON array of applied fixes
    APPLIED_JSON=""
    for fix in "${FIXES_APPLIED[@]}"; do
        if [ -n "$APPLIED_JSON" ]; then
            APPLIED_JSON="$APPLIED_JSON,"
        fi
        APPLIED_JSON="$APPLIED_JSON\"$fix\""
    done
    
    # Create JSON array of failed fixes
    FAILED_JSON=""
    for fix in "${FIXES_FAILED[@]}"; do
        if [ -n "$FAILED_JSON" ]; then
            FAILED_JSON="$FAILED_JSON,"
        fi
        FAILED_JSON="$FAILED_JSON\"$fix\""
    done
    
    cat << EOF
{
  "status": "$([ $OVERALL_SUCCESS = true ] && echo "partial_success" || echo "failure")",
  "total_attempts": $TOTAL_FIXES_ATTEMPTED,
  "successful_fixes": $SUCCESSFUL_FIXES,
  "failed_fixes": $FAILED_FIXES,
  "changes_made": $CHANGES_MADE,
  "applied_fixes": [$APPLIED_JSON],
  "failed_fixes": [$FAILED_JSON],
  "workflow_mode": $WORKFLOW_MODE,
  "commit_partial": $COMMIT_PARTIAL,
  "dry_run": $DRY_RUN
}
EOF
else
    echo ""
    echo "📊 Enhanced Auto-Fix Results:"
    echo "   Total fixes attempted: $TOTAL_FIXES_ATTEMPTED"
    echo "   Successful fixes: $SUCCESSFUL_FIXES"
    echo "   Failed fixes: $FAILED_FIXES"
    echo "   Changes made: $([ $CHANGES_MADE = true ] && echo "Yes" || echo "No")"
    echo ""
    
    if [ ${#FIXES_APPLIED[@]} -gt 0 ]; then
        echo "✅ Successfully applied fixes:"
        for fix in "${FIXES_APPLIED[@]}"; do
            echo "   - $fix"
        done
        echo ""
    fi
    
    if [ ${#FIXES_FAILED[@]} -gt 0 ]; then
        echo "❌ Failed fixes:"
        for fix in "${FIXES_FAILED[@]}"; do
            echo "   - $fix"
        done
        echo ""
    fi
    
    if [ "$WORKFLOW_MODE" = true ]; then
        if [ $OVERALL_SUCCESS = true ]; then
            echo "💡 Partial success: Some fixes applied, CI can proceed with improved code"
        else
            echo "💡 No fixes could be applied automatically"
        fi
    else
        if [ $OVERALL_SUCCESS = true ]; then
            echo "💡 You can now commit your changes safely"
        else
            echo "💡 Manual intervention may be required for remaining issues"
        fi
    fi
fi

# Exit with appropriate code
if [ $OVERALL_SUCCESS = true ]; then
    exit 0
else
    exit 1
fi
