#!/bin/bash
set -e

WORKFLOW_NAME="$1"
FIX_TYPE="$2"

echo "🔧 Creating pull request for fix: $FIX_TYPE"

# Create a new branch
BRANCH_NAME="auto-fix/${FIX_TYPE}-$(date +%Y%m%d-%H%M%S)"
git checkout -b "$BRANCH_NAME"

# Push the branch
git push origin "$BRANCH_NAME"

# Create pull request
TITLE="🤖 Auto-fix: $FIX_TYPE"
BODY="## Automated Fix for CI Failure

This PR automatically fixes the $FIX_TYPE error detected in the $WORKFLOW_NAME workflow.

**Changes:**
- ✅ Applied automated fix for $FIX_TYPE
- ✅ Updated dependency files as needed

**Testing:**
- [ ] Verify CI passes after merge
- [ ] Test functionality
- [ ] Check that the fix resolves the original error

**Original Error:**
- **Workflow:** $WORKFLOW_NAME
- **Error Type:** $FIX_TYPE
- **Fix Applied:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")

---
*This PR was automatically created by the Auto-Fix Monitor*"

gh pr create \
    --title "$TITLE" \
    --body "$BODY" \
    --label "auto-generated,ci-fix" \
    --assignee "${{ github.actor }}"

echo "✅ Pull request created successfully"
