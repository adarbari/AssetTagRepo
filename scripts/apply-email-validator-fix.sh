#!/bin/bash
set -e

echo "🔧 Applying email-validator fix..."

# Add email-validator to requirements.txt
if [ -f "asset-tag-backend/requirements.txt" ]; then
    if ! grep -q "email-validator" asset-tag-backend/requirements.txt; then
        echo "Adding email-validator to requirements.txt"
        # Find pydantic line and add email-validator after it
        sed -i.bak '/^pydantic==/a\
email-validator==2.1.0' asset-tag-backend/requirements.txt
        rm asset-tag-backend/requirements.txt.bak
    fi
fi

# Add email-validator to requirements-minimal.txt
if [ -f "asset-tag-backend/requirements-minimal.txt" ]; then
    if ! grep -q "email-validator" asset-tag-backend/requirements-minimal.txt; then
        echo "Adding email-validator to requirements-minimal.txt"
        echo "email-validator>=2.0.0" >> asset-tag-backend/requirements-minimal.txt
    fi
fi

# Commit the changes
git config --local user.email "action@github.com"
git config --local user.name "GitHub Action"

git add asset-tag-backend/requirements*.txt
git commit -m "fix: add email-validator dependency

Auto-generated fix for CI failure:
- Added email-validator==2.1.0 to requirements.txt
- Added email-validator>=2.0.0 to requirements-minimal.txt

Resolves: email-validator import error"

echo "✅ Email-validator fix applied successfully"
