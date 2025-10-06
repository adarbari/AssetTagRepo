#!/bin/bash

# Format Code Script
# This script formats Python code using Black and isort
# Usage: ./scripts/format-code.sh [--check] [--all]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
CHECK_ONLY=false
FORMAT_ALL=false
BACKEND_DIR="asset-tag-backend"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --check)
            CHECK_ONLY=true
            shift
            ;;
        --all)
            FORMAT_ALL=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [--check] [--all]"
            echo "  --check    Only check formatting, don't fix"
            echo "  --all      Format all Python files (default: only changed files)"
            echo "  -h, --help Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option $1"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}🔧 Code Formatting Tool${NC}"
echo "================================"

# Check if we're in the right directory
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Error: $BACKEND_DIR directory not found${NC}"
    echo "Please run this script from the repository root"
    exit 1
fi

# Check if Black and isort are installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Error: Python3 not found${NC}"
    exit 1
fi

# Install dependencies if needed
echo -e "${YELLOW}📦 Checking dependencies...${NC}"
cd "$BACKEND_DIR"
if ! python3 -c "import black, isort" 2>/dev/null; then
    echo -e "${YELLOW}Installing formatting dependencies...${NC}"
    pip install -r requirements-dev.txt
fi

# Determine which files to format
if [ "$FORMAT_ALL" = true ]; then
    echo -e "${YELLOW}📁 Formatting all Python files...${NC}"
    FILES_TO_FORMAT=$(find modules tests -name "*.py" 2>/dev/null || echo "")
else
    echo -e "${YELLOW}📁 Finding changed Python files...${NC}"
    # Get changed files from git
    if git rev-parse --git-dir > /dev/null 2>&1; then
        FILES_TO_FORMAT=$(git diff --cached --name-only --diff-filter=ACM | grep '\.py$' || echo "")
        if [ -z "$FILES_TO_FORMAT" ]; then
            FILES_TO_FORMAT=$(git diff --name-only --diff-filter=ACM | grep '\.py$' || echo "")
        fi
    else
        echo -e "${YELLOW}⚠️  Not in a git repository, formatting all Python files${NC}"
        FILES_TO_FORMAT=$(find modules tests -name "*.py" 2>/dev/null || echo "")
    fi
fi

if [ -z "$FILES_TO_FORMAT" ]; then
    echo -e "${GREEN}✅ No Python files to format${NC}"
    exit 0
fi

echo -e "${BLUE}Files to format:${NC}"
echo "$FILES_TO_FORMAT" | sed 's/^/  /'

# Format with Black
echo -e "\n${YELLOW}🎨 Running Black formatter...${NC}"
if [ "$CHECK_ONLY" = true ]; then
    if python3 -m black --check $FILES_TO_FORMAT; then
        echo -e "${GREEN}✅ Black formatting check passed${NC}"
    else
        echo -e "${RED}❌ Black formatting check failed${NC}"
        echo -e "${YELLOW}Run without --check to fix formatting issues${NC}"
        exit 1
    fi
else
    if python3 -m black $FILES_TO_FORMAT; then
        echo -e "${GREEN}✅ Black formatting completed${NC}"
    else
        echo -e "${RED}❌ Black formatting failed${NC}"
        exit 1
    fi
fi

# Sort imports with isort
echo -e "\n${YELLOW}📋 Running isort...${NC}"
if [ "$CHECK_ONLY" = true ]; then
    if python3 -m isort --check-only --profile=black $FILES_TO_FORMAT; then
        echo -e "${GREEN}✅ Import sorting check passed${NC}"
    else
        echo -e "${RED}❌ Import sorting check failed${NC}"
        echo -e "${YELLOW}Run without --check to fix import sorting issues${NC}"
        exit 1
    fi
else
    if python3 -m isort --profile=black $FILES_TO_FORMAT; then
        echo -e "${GREEN}✅ Import sorting completed${NC}"
    else
        echo -e "${RED}❌ Import sorting failed${NC}"
        exit 1
    fi
fi

# Run flake8 linting
echo -e "\n${YELLOW}🔍 Running flake8 linting...${NC}"
if python3 -m flake8 --max-line-length=88 --extend-ignore=E203,W503 $FILES_TO_FORMAT; then
    echo -e "${GREEN}✅ Linting check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Linting issues found (non-blocking)${NC}"
fi

echo -e "\n${GREEN}🎉 Code formatting completed successfully!${NC}"

# Show summary
if [ "$CHECK_ONLY" = false ]; then
    echo -e "\n${BLUE}📊 Summary:${NC}"
    echo "  • Files formatted: $(echo "$FILES_TO_FORMAT" | wc -l)"
    echo "  • Black: Applied formatting"
    echo "  • isort: Sorted imports"
    echo "  • flake8: Checked code style"
    echo -e "\n${YELLOW}💡 Tip: Run 'git diff' to see the changes${NC}"
fi
