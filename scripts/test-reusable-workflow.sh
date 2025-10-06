#!/bin/bash
set -e

echo "🧪 Testing Reusable Workflow Auto-Fix System"
echo "=============================================="

# Test 1: Test the reusable workflow directly
echo "📋 Test 1: Testing reusable workflow with email-validator error"
gh workflow run auto-fix-reusable.yml \
  -f workflow-name="Test Workflow" \
  -f workflow-conclusion="failure" \
  -f logs-content="email-validator is not installed" \
  -f error-context="Test email-validator error"

echo "✅ Test 1 initiated - check GitHub Actions for results"

# Test 2: Test with missing module error
echo "📋 Test 2: Testing reusable workflow with missing module error"
gh workflow run auto-fix-reusable.yml \
  -f workflow-name="Test Workflow" \
  -f workflow-conclusion="failure" \
  -f logs-content="ModuleNotFoundError: No module named 'requests'" \
  -f error-context="Test missing module error"

echo "✅ Test 2 initiated - check GitHub Actions for results"

# Test 3: Test with npm error
echo "📋 Test 3: Testing reusable workflow with npm error"
gh workflow run auto-fix-reusable.yml \
  -f workflow-name="Test Workflow" \
  -f workflow-conclusion="failure" \
  -f logs-content="npm ERR! something went wrong" \
  -f error-context="Test npm error"

echo "✅ Test 3 initiated - check GitHub Actions for results"

# Test 4: Test with unknown error
echo "📋 Test 4: Testing reusable workflow with unknown error"
gh workflow run auto-fix-reusable.yml \
  -f workflow-name="Test Workflow" \
  -f workflow-conclusion="failure" \
  -f logs-content="Some unknown error occurred" \
  -f error-context="Test unknown error"

echo "✅ Test 4 initiated - check GitHub Actions for results"

echo ""
echo "🎉 All tests initiated! Check the GitHub Actions tab to see the results."
echo "📊 Expected results:"
echo "   - Test 1: Should apply email-validator fix and create PR"
echo "   - Test 2: Should create issue for missing module"
echo "   - Test 3: Should create issue for npm error"
echo "   - Test 4: Should create generic issue"
echo ""
echo "🔍 To monitor the results:"
echo "   gh run list --workflow=auto-fix-reusable.yml"
echo "   gh run view <run-id>"
