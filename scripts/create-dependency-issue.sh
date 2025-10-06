#!/bin/bash
set -e

ERROR_TYPE="$1"
ERROR_CONTEXT="$2"

echo "🔧 Creating issue for error type: $ERROR_TYPE"

# Get GitHub context from environment variables (set by GitHub Actions)
GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-unknown}"
GITHUB_WORKFLOW="${GITHUB_WORKFLOW:-unknown}"
GITHUB_RUN_ID="${GITHUB_RUN_ID:-unknown}"
GITHUB_ACTOR="${GITHUB_ACTOR:-unknown}"

# Create issue using GitHub CLI
TITLE="🚨 Auto-detected CI Failure: $ERROR_TYPE"

# Generate suggested actions based on error type
case "$ERROR_TYPE" in
    "email-validator")
        SUGGESTED_ACTIONS="1. Add \`email-validator\` to requirements.txt
2. Run \`pip install email-validator\`
3. Verify pydantic email validation works"
        ;;
    "missing_module")
        SUGGESTED_ACTIONS="1. Check missing dependencies in requirements.txt or package.json
2. Run \`pip install -r requirements.txt\` or \`npm install\`
3. Verify all imports are correct"
        ;;
    "import_error")
        SUGGESTED_ACTIONS="1. Check import statements
2. Verify module names and paths
3. Check if dependencies are installed"
        ;;
    "npm_error")
        SUGGESTED_ACTIONS="1. Check npm dependencies
2. Run \`npm ci\` or \`npm install\`
3. Verify package-lock.json is up to date
4. Check for version conflicts"
        ;;
    "no_logs")
        SUGGESTED_ACTIONS="1. Check the workflow run logs manually
2. Verify all dependencies are properly configured
3. Check for infrastructure issues"
        ;;
    *)
        SUGGESTED_ACTIONS="1. Review the workflow logs
2. Check for common CI issues
3. Verify all dependencies and configurations"
        ;;
esac

BODY="## Automated Error Detection

**Error Type:** $ERROR_TYPE
**Context:** $ERROR_CONTEXT
**Detected At:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")

## Suggested Actions

$SUGGESTED_ACTIONS

## Workflow Details
- **Repository:** $GITHUB_REPOSITORY
- **Workflow:** $GITHUB_WORKFLOW
- **Run ID:** $GITHUB_RUN_ID

---
*This issue was automatically created by the Auto-Fix Monitor*"

# Create the issue
gh issue create \
    --title "$TITLE" \
    --body "$BODY" \
    --label "bug,ci-failure,auto-detected" \
    --assignee "$GITHUB_ACTOR"

echo "✅ Issue created successfully"
