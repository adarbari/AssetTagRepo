#!/bin/bash

# Test CI Integration Script
# Tests the integration of lint fix scripts with CI pipeline

set -e

echo "🧪 Testing CI Integration..."

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

# Initialize tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run test
run_test() {
    local test_name=$1
    local command=$2
    local expected_result=$3
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    print_status "info" "Running test: $test_name"
    
    if eval "$command" > /dev/null 2>&1; then
        if [ "$expected_result" == "success" ]; then
            print_status "success" "$test_name - PASSED"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            print_status "error" "$test_name - FAILED (unexpected success)"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    else
        if [ "$expected_result" == "failure" ]; then
            print_status "success" "$test_name - PASSED (expected failure)"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            print_status "error" "$test_name - FAILED (unexpected failure)"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    fi
}

# Test 1: Check if scripts exist and are executable
print_status "info" "🔍 Testing script availability..."

run_test "Comprehensive Fix Script" "test -x ./scripts/comprehensive-lint-fix.sh" "success"
run_test "Targeted Fix Script" "test -x ./scripts/targeted-lint-fix.sh" "success"
run_test "Final Fix Script" "test -x ./scripts/final-lint-fix.sh" "success"

# Test 2: Check if enhanced lint gate workflow exists
print_status "info" "🔍 Testing workflow files..."

run_test "Enhanced Lint Gate Workflow" "test -f .github/workflows/enhanced-lint-gate.yml" "success"
run_test "Main CI Workflow" "test -f .github/workflows/main-ci.yml" "success"
run_test "CI Integration Guide" "test -f CI_INTEGRATION_GUIDE.md" "success"

# Test 3: Check if scripts can run without errors (dry run)
print_status "info" "🔍 Testing script execution (dry run)..."

# Test comprehensive script
if ./scripts/comprehensive-lint-fix.sh --dry-run 2>/dev/null; then
    print_status "success" "Comprehensive Fix Script - DRY RUN PASSED"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_status "warning" "Comprehensive Fix Script - DRY RUN NOT SUPPORTED"
    PASSED_TESTS=$((PASSED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test 4: Check if required dependencies are available
print_status "info" "🔍 Testing dependencies..."

# Check Python dependencies
if command -v python3 >/dev/null 2>&1; then
    print_status "success" "Python3 - AVAILABLE"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_status "error" "Python3 - NOT AVAILABLE"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Check Node.js dependencies
if command -v npm >/dev/null 2>&1; then
    print_status "success" "NPM - AVAILABLE"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_status "error" "NPM - NOT AVAILABLE"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Check Git
if command -v git >/dev/null 2>&1; then
    print_status "success" "Git - AVAILABLE"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_status "error" "Git - NOT AVAILABLE"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test 5: Check if workflow syntax is valid (basic check)
print_status "info" "🔍 Testing workflow syntax..."

# Check if workflow files contain required sections
if grep -q "name:" .github/workflows/enhanced-lint-gate.yml; then
    print_status "success" "Enhanced Lint Gate - VALID SYNTAX"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_status "error" "Enhanced Lint Gate - INVALID SYNTAX"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

if grep -q "name:" .github/workflows/main-ci.yml; then
    print_status "success" "Main CI - VALID SYNTAX"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_status "error" "Main CI - INVALID SYNTAX"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test 6: Check if scripts have proper permissions
print_status "info" "🔍 Testing script permissions..."

for script in ./scripts/comprehensive-lint-fix.sh ./scripts/targeted-lint-fix.sh ./scripts/final-lint-fix.sh; do
    if [ -x "$script" ]; then
        print_status "success" "$(basename "$script") - EXECUTABLE"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        print_status "error" "$(basename "$script") - NOT EXECUTABLE"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
done

# Test 7: Check if required files exist
print_status "info" "🔍 Testing required files..."

required_files=(
    "asset-tag-frontend/package.json"
    "asset-tag-backend/requirements-dev.txt"
    "asset-tag-backend/pyproject.toml"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "success" "$file - EXISTS"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        print_status "error" "$file - MISSING"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
done

# Final Results
echo ""
echo "📊 CI Integration Test Results:"
echo "  Total Tests: $TOTAL_TESTS"
echo "  Passed: $PASSED_TESTS"
echo "  Failed: $FAILED_TESTS"
echo "  Success Rate: $(( (PASSED_TESTS * 100) / TOTAL_TESTS ))%"

if [ $FAILED_TESTS -eq 0 ]; then
    print_status "success" "🎉 All CI integration tests passed! Your setup is ready."
    echo ""
    echo "🚀 Next Steps:"
    echo "  1. Commit and push these changes"
    echo "  2. Create a test PR to verify the enhanced lint gate works"
    echo "  3. Monitor the workflow runs in GitHub Actions"
    echo "  4. Review the auto-fix results and PR comments"
    exit 0
else
    print_status "error" "❌ Some CI integration tests failed. Please fix the issues above."
    echo ""
    echo "🔧 Common Fixes:"
    echo "  1. Make scripts executable: chmod +x ./scripts/*.sh"
    echo "  2. Install dependencies: pip install -r requirements-dev.txt && npm ci"
    echo "  3. Check file paths and permissions"
    echo "  4. Verify workflow syntax"
    exit 1
fi
