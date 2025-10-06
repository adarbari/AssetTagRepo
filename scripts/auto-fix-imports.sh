#!/bin/bash

# Script to automatically fix import formatting issues
# This ensures consistent import formatting across the codebase

set -e

echo "🔧 Auto-fixing import formatting issues..."

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

# Check if we're in the right directory
if [ ! -d "asset-tag-backend" ]; then
    print_status "error" "Please run this script from the repository root"
    exit 1
fi

# Check if Python tools are available
if ! command_exists python3; then
    print_status "error" "Python3 not found"
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

# Backend import fixing
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

# Run isort to fix import sorting
print_status "info" "Running isort to fix import sorting..."
if python3 -m isort .; then
    print_status "success" "Import sorting fixed"
else
    print_status "error" "Failed to fix import sorting"
    exit 1
fi

# Run black to fix code formatting
print_status "info" "Running black to fix code formatting..."
if python3 -m black .; then
    print_status "success" "Code formatting fixed"
else
    print_status "error" "Failed to fix code formatting"
    exit 1
fi

# Verify the fixes
print_status "info" "Verifying fixes..."

# Check isort
if python3 -m isort --check-only . >/dev/null 2>&1; then
    print_status "success" "Import sorting verification passed"
else
    print_status "error" "Import sorting verification failed"
    exit 1
fi

# Check black
if python3 -m black --check . >/dev/null 2>&1; then
    print_status "success" "Code formatting verification passed"
else
    print_status "error" "Code formatting verification failed"
    exit 1
fi

cd ..

# Frontend formatting (if frontend exists)
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
        
        # Run Prettier to fix formatting
        print_status "info" "Running Prettier to fix formatting..."
        if npm run format; then
            print_status "success" "Frontend formatting fixed"
        else
            print_status "warning" "Frontend formatting had issues (non-blocking)"
        fi
        
        # Run ESLint with auto-fix
        print_status "info" "Running ESLint with auto-fix..."
        if npm run lint:fix; then
            print_status "success" "Frontend linting issues fixed"
        else
            print_status "warning" "Some frontend linting issues could not be auto-fixed"
        fi
        
        # Run TypeScript check (informational)
        print_status "info" "Running TypeScript check..."
        if npm run type-check; then
            print_status "success" "TypeScript checks passed"
        else
            print_status "warning" "TypeScript issues found (may require manual fixes)"
        fi
        
        # Run npm audit (informational)
        print_status "info" "Running npm security audit..."
        if npm audit --audit-level=moderate; then
            print_status "success" "npm security audit passed"
        else
            print_status "warning" "npm security issues found (may require manual fixes)"
        fi
    else
        print_status "warning" "npm not found, skipping frontend formatting"
    fi
    
    cd ..
fi

# Final verification
echo ""
print_status "info" "Running final verification..."

if ./scripts/verify-lint-checks.sh; then
    print_status "success" "All lint checks now pass! 🎉"
    echo ""
    echo "📝 Changes made:"
    echo "   - Fixed import sorting with isort"
    echo "   - Fixed code formatting with black"
    echo "   - Applied consistent formatting rules"
    echo ""
    echo "💡 You can now commit your changes safely."
else
    print_status "error" "Some lint checks still fail. Please review manually."
    exit 1
fi
