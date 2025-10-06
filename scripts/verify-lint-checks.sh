#!/bin/bash

# Script to verify all lint checks pass before CI runs
# This ensures that linting issues are caught and fixed early

set -e

echo "🔍 Verifying all lint checks..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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
    esac
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if we're in the right directory
if [ ! -d "asset-tag-backend" ] || [ ! -d "asset-tag-frontend" ]; then
    print_status "error" "Please run this script from the repository root"
    exit 1
fi

# Initialize error tracking
ERRORS=0

# Backend lint checks
echo "🐍 Running backend lint checks..."

if [ -d "asset-tag-backend" ]; then
    cd asset-tag-backend
    
    # Check if Python tools are available
    if command_exists python3; then
        # Install dependencies if needed
        if [ ! -d ".venv" ] && [ ! -f "requirements-dev.txt" ]; then
            print_status "warning" "Development dependencies not found, installing..."
            python3 -m pip install --user -r requirements-dev.txt
        fi
        
        # Run isort check
        echo "  📦 Checking import sorting with isort..."
        if python3 -m isort --check-only . >/dev/null 2>&1; then
            print_status "success" "Import sorting is correct"
        else
            print_status "error" "Import sorting issues found"
            ERRORS=$((ERRORS + 1))
        fi
        
        # Run black check
        echo "  🎨 Checking code formatting with black..."
        if python3 -m black --check . >/dev/null 2>&1; then
            print_status "success" "Code formatting is correct"
        else
            print_status "error" "Code formatting issues found"
            ERRORS=$((ERRORS + 1))
        fi
        
        # Run flake8 check with specific error codes (same as CI)
        echo "  🔍 Running flake8 critical issues check..."
        if python3 -m flake8 modules tests --count --select=E9,F63,F7,F82 --show-source --statistics >/dev/null 2>&1; then
            print_status "success" "Flake8 critical issues check passed"
        else
            print_status "error" "Flake8 critical issues found"
            ERRORS=$((ERRORS + 1))
        fi
        
        # Run flake8 general check (same as CI)
        echo "  🔍 Running flake8 general linting..."
        if python3 -m flake8 modules tests --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics >/dev/null 2>&1; then
            print_status "success" "Flake8 general linting passed"
        else
            print_status "error" "Flake8 general linting issues found"
            ERRORS=$((ERRORS + 1))
        fi
        
        # Run mypy type checking (same as CI)
        echo "  🔬 Running type checking with mypy..."
        if python3 -m mypy modules --ignore-missing-imports >/dev/null 2>&1; then
            print_status "success" "Type checking passed"
        else
            print_status "error" "Type checking issues found"
            ERRORS=$((ERRORS + 1))
        fi
        
        # Run bandit security scan (same as CI)
        echo "  🛡️ Running bandit security scan..."
        if python3 -m bandit -r modules -f json -o bandit-report.json >/dev/null 2>&1; then
            print_status "success" "Bandit security scan passed"
        else
            print_status "warning" "Bandit security issues found (non-blocking)"
        fi
        
        # Run safety check (same as CI)
        echo "  🔒 Running safety dependency check..."
        if python3 -m safety check --json --output safety-report.json >/dev/null 2>&1; then
            print_status "success" "Safety dependency check passed"
        else
            print_status "warning" "Safety dependency issues found (non-blocking)"
        fi
        
    else
        print_status "error" "Python3 not found"
        ERRORS=$((ERRORS + 1))
    fi
    
    cd ..
else
    print_status "warning" "Backend directory not found, skipping backend checks"
fi

# Frontend lint checks
echo "🎨 Running frontend lint checks..."

if [ -d "asset-tag-frontend" ]; then
    cd asset-tag-frontend
    
    # Check if Node.js tools are available
    if command_exists npm; then
        # Check if dependencies are installed
        if [ ! -d "node_modules" ]; then
            print_status "warning" "Node modules not found, installing dependencies..."
            npm ci
        fi
        
        # Run ESLint check (same as CI would run)
        echo "  🔍 Running ESLint..."
        if npm run lint >/dev/null 2>&1; then
            print_status "success" "ESLint checks passed"
        else
            print_status "error" "ESLint issues found"
            ERRORS=$((ERRORS + 1))
        fi
        
        # Run Prettier check (same as CI would run)
        echo "  🎨 Checking code formatting with Prettier..."
        if npm run format:check >/dev/null 2>&1; then
            print_status "success" "Prettier formatting is correct"
        else
            print_status "error" "Prettier formatting issues found"
            ERRORS=$((ERRORS + 1))
        fi
        
        # Run TypeScript check (same as CI would run)
        echo "  🔬 Running TypeScript check..."
        if npm run type-check >/dev/null 2>&1; then
            print_status "success" "TypeScript checks passed"
        else
            print_status "error" "TypeScript issues found"
            ERRORS=$((ERRORS + 1))
        fi
        
        # Run npm audit security check (same as CI)
        echo "  🛡️ Running npm security audit..."
        if npm audit --audit-level=moderate >/dev/null 2>&1; then
            print_status "success" "npm security audit passed"
        else
            print_status "warning" "npm security issues found (non-blocking)"
        fi
        
        # Run build check (same as CI)
        echo "  🏗️ Running build check..."
        if npm run build >/dev/null 2>&1; then
            print_status "success" "Build check passed"
        else
            print_status "error" "Build check failed"
            ERRORS=$((ERRORS + 1))
        fi
        
    else
        print_status "error" "npm not found"
        ERRORS=$((ERRORS + 1))
    fi
    
    cd ..
else
    print_status "warning" "Frontend directory not found, skipping frontend checks"
fi

# Summary
echo ""
echo "📊 Lint Check Summary:"
if [ $ERRORS -eq 0 ]; then
    print_status "success" "All lint checks passed! 🎉"
    exit 0
else
    print_status "error" "Found $ERRORS lint check failure(s)"
    echo ""
    echo "💡 To fix these issues automatically, run:"
    echo "   ./scripts/auto-fix-imports.sh"
    echo "   or"
    echo "   make format"
    exit 1
fi
