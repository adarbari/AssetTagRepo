# Code Formatting Setup Guide

This guide explains how to set up automated code formatting to prevent CI formatting errors.

## 🎯 Overview

We use several tools to maintain consistent code formatting:
- **Black**: Python code formatter
- **isort**: Import sorting
- **flake8**: Linting
- **pre-commit**: Git hooks for automated formatting

## 🚀 Quick Setup

### 1. Install Pre-commit Hooks (Recommended)

```bash
# Install pre-commit hooks
pre-commit install

# Run on all files (first time)
pre-commit run --all-files
```

### 2. Manual Formatting

```bash
# Format all Python files
./scripts/format-code.sh --all

# Check formatting without fixing
./scripts/format-code.sh --check

# Format only changed files
./scripts/format-code.sh
```

## 🔧 Available Tools

### Pre-commit Hooks

The `.pre-commit-config.yaml` file includes:
- **Black**: Formats Python code
- **isort**: Sorts imports
- **flake8**: Lints code
- **bandit**: Security checks
- **mypy**: Type checking
- **General hooks**: File validation, whitespace cleanup

### Format Script

The `scripts/format-code.sh` script provides:
- Automatic dependency installation
- Git-aware file selection
- Check-only mode
- Colored output
- Summary reporting

## 📋 Workflow Integration

### CI/CD Pipeline

The CI pipeline automatically:
1. **Checks formatting** with Black
2. **Auto-fixes** formatting errors when detected
3. **Creates PRs** with fixes when needed

### Auto-Fix Workflow

The `.github/workflows/auto-fix-reusable.yml` now handles:
- Black formatting errors
- Dependency issues
- Import errors
- npm errors

## 🛠️ Development Workflow

### Before Committing

```bash
# Option 1: Use pre-commit (automatic)
git add .
git commit -m "Your commit message"

# Option 2: Manual formatting
./scripts/format-code.sh
git add .
git commit -m "Your commit message"
```

### IDE Integration

#### VS Code
Add to `.vscode/settings.json`:
```json
{
  "python.formatting.provider": "black",
  "python.sortImports.args": ["--profile", "black"],
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

#### PyCharm
1. Go to Settings → Tools → External Tools
2. Add Black as external tool
3. Enable "Reformat code" on save

## 🚨 Troubleshooting

### Common Issues

#### Pre-commit Hook Fails
```bash
# Update hooks
pre-commit autoupdate

# Run specific hook
pre-commit run black --all-files
```

#### Format Script Permission Denied
```bash
chmod +x scripts/format-code.sh
```

#### Dependencies Not Found
```bash
cd asset-tag-backend
pip install -r requirements-dev.txt
```

#### NPM Workspace Issues
If you see errors like "loadVirtual requires existing shrinkwrap file":

```bash
# Fix npm workspace issues
./scripts/fix-npm-workspace.sh

# Or manually:
rm -f package-lock.json asset-tag-frontend/package-lock.json
npm cache clean --force
npm install
```

**Important**: This is a monorepo with workspaces. Always run npm commands from the repository root:
```bash
# ✅ Correct (from repository root)
npm run test:frontend
npm run build:frontend
npm ci --workspace=asset-tag-frontend

# ❌ Incorrect (from asset-tag-frontend directory)
cd asset-tag-frontend
npm ci  # This will fail!
```

### CI Formatting Errors

If you see formatting errors in CI:

1. **Local Fix**:
   ```bash
   ./scripts/format-code.sh --all
   git add .
   git commit -m "Fix formatting"
   ```

2. **Auto-Fix**: The CI will automatically create a PR with fixes

3. **Manual Check**:
   ```bash
   cd asset-tag-backend
   python3 -m black --check modules tests
   ```

## 📊 Configuration Details

### Black Configuration
- Line length: 88 characters
- Target Python: 3.9+
- Files: `*.py`

### isort Configuration
- Profile: black
- Line length: 88 characters
- Files: `*.py`

### flake8 Configuration
- Max line length: 88
- Ignore: E203, W503
- Files: `*.py`

## 🔄 Maintenance

### Update Tools
```bash
# Update pre-commit hooks
pre-commit autoupdate

# Update Python dependencies
cd asset-tag-backend
pip install -r requirements-dev.txt --upgrade
```

### Check Status
```bash
# Check pre-commit status
pre-commit run --all-files

# Check formatting
./scripts/format-code.sh --check
```

## 📚 Additional Resources

- [Black Documentation](https://black.readthedocs.io/)
- [isort Documentation](https://pycqa.github.io/isort/)
- [pre-commit Documentation](https://pre-commit.com/)
- [flake8 Documentation](https://flake8.pycqa.org/)

## 🎉 Benefits

With this setup, you get:
- ✅ **Consistent formatting** across the codebase
- ✅ **Automated fixes** in CI/CD
- ✅ **Pre-commit validation** before commits
- ✅ **Easy local formatting** with scripts
- ✅ **IDE integration** for seamless development
- ✅ **No more formatting CI errors** 🎯
