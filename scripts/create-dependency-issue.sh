#!/bin/bash
set -e

ERROR_TYPE="$1"
ERROR_CONTEXT="$2"

echo "🔧 Creating issue for error type: $ERROR_TYPE"

# Create issue using GitHub CLI
TITLE="🚨 Auto-detected CI Failure: $ERROR_TYPE"
BODY="## Automated Error Detection

**Error Type:** $ERROR_TYPE
**Context:** $ERROR_CONTEXT
**Detected At:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")

## Suggested Actions

$(case "$ERROR_TYPE" in
    "email-validator")
        echo "1. Add \`email-validator\` to requirements.txt
2. Run \`pip install email-validator\`
3. Verify pydantic email validation works"
        ;;
    "missing_module")
        echo "1. Check missing dependencies in requirements.txt or package.json
2. Run \`pip install -r requirements.txt\` or \`npm install\`
3. Verify all imports are correct"
        ;;
    "import_error")
        echo "1. Check import statements
2. Verify module names and paths
3. Check if dependencies are installed"
        ;;
    "npm_error")
        echo "1. Check npm dependencies
2. Run \`npm ci\` or \`npm install\`
3. Verify package-lock.json is up to date
4. Check for version conflicts"
        ;;
    "no_logs")
        echo "1. Check the workflow run logs manually
2. Verify all dependencies are properly configured
3. Check for infrastructure issues"
        ;;
    *)
        echo "1. Review the workflow logs
2. Check for common CI issues
3. Verify all dependencies and configurations"
        ;;
esac)

## Workflow Details
- **Repository:** ${{ github.repository }}
- **Workflow:** ${{ github.workflow }}
- **Run ID:** ${{ github.run_id }}

---
*This issue was automatically created by the Auto-Fix Monitor*"

# Create the issue
gh issue create \
    --title "$TITLE" \
    --body "$BODY" \
    --label "bug,ci-failure,auto-detected" \
    --assignee "${{ github.actor }}"

echo "✅ Issue created successfully"
