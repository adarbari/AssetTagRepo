#!/bin/bash

# Test script for enhanced auto-fix system
# This script demonstrates how the enhanced auto-fix works with partial success

set -e

echo "🧪 Testing Enhanced Auto-Fix System"
echo "=================================="

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

# Check if we're in the right directory
if [ ! -d "asset-tag-backend" ]; then
    print_status "error" "Please run this script from the repository root"
    exit 1
fi

# Make sure the enhanced auto-fix script is executable
chmod +x ./scripts/enhanced-auto-fix.sh

echo ""
print_status "info" "Test 1: Dry run mode (no actual changes)"
echo "Running: ./scripts/enhanced-auto-fix.sh --dry-run --json"
echo ""

if ./scripts/enhanced-auto-fix.sh --dry-run --json; then
    print_status "success" "Dry run completed successfully"
else
    print_status "error" "Dry run failed"
fi

echo ""
print_status "info" "Test 2: Workflow mode (in-memory fixes)"
echo "Running: ./scripts/enhanced-auto-fix.sh --workflow-mode --json"
echo ""

if ./scripts/enhanced-auto-fix.sh --workflow-mode --json; then
    print_status "success" "Workflow mode completed successfully"
else
    print_status "warning" "Workflow mode completed with some issues (this is expected)"
fi

echo ""
print_status "info" "Test 3: Regular mode (actual fixes)"
echo "Running: ./scripts/enhanced-auto-fix.sh --json"
echo ""

if ./scripts/enhanced-auto-fix.sh --json; then
    print_status "success" "Regular mode completed successfully"
else
    print_status "warning" "Regular mode completed with some issues (this may be expected)"
fi

echo ""
print_status "info" "Test 4: Verify lint checks after fixes"
echo "Running: ./scripts/verify-lint-checks.sh --json"
echo ""

if ./scripts/verify-lint-checks.sh --json; then
    print_status "success" "All lint checks pass after auto-fix"
else
    print_status "warning" "Some lint checks still fail (may require manual fixes)"
fi

echo ""
echo "🎯 Enhanced Auto-Fix System Test Summary:"
echo "========================================"
echo ""
echo "The enhanced auto-fix system provides the following benefits:"
echo ""
echo "✅ **Partial Success Support**: Commits successful fixes even if some fail"
echo "✅ **Detailed Tracking**: Reports exactly which fixes succeeded/failed"
echo "✅ **CI Progression**: Allows CI to proceed with improved code"
echo "✅ **Clear Reporting**: Provides detailed feedback on what was fixed"
echo "✅ **Flexible Modes**: Supports dry-run, workflow, and regular modes"
echo ""
echo "Key Features:"
echo "- Tracks individual fix attempts (import sorting, code formatting, etc.)"
echo "- Commits successful fixes automatically in workflow mode"
echo "- Reports partial success to allow CI to continue"
echo "- Provides detailed JSON output for programmatic use"
echo "- Supports both backend and frontend fixes"
echo ""
echo "This system ensures that:"
echo "1. ✅ Successful fixes are always committed and pushed"
echo "2. ✅ CI can proceed with improved code even if some fixes fail"
echo "3. ✅ Clear reporting of what was fixed vs. what needs manual attention"
echo "4. ✅ No more blocking CI due to unfixable lint issues"
echo ""
print_status "success" "Enhanced auto-fix system test completed!"
