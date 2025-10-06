# CI/CD Workflows

This directory contains the GitHub Actions workflows for the Asset Tag Repository.

## Workflow Overview

### Main Workflows

1. **`main-ci.yml`** - Primary CI/CD pipeline
   - Runs on pushes to `main`/`develop` and pull requests
   - Includes backend linting, testing, security scanning
   - Includes frontend testing and building
   - Generates coverage reports
   - **Recommended for production use**

2. **`quick-test.yml`** - Fast testing for development
   - Runs on pushes and pull requests (ignores docs changes)
   - Only runs tests for changed components
   - Faster feedback for developers
   - **Recommended for development workflow**

3. **`combined-coverage.yml`** - Coverage aggregation
   - Runs after main CI completes successfully
   - Combines frontend and backend coverage
   - Updates README with coverage badges
   - Posts combined coverage reports to PRs

### Legacy Workflows (Kept for Reference)

4. **`simple-ci.yml`** - Basic test workflow
   - Simple artifact upload/download test
   - Can be removed if not needed

5. **`ci.yml`** - Original main CI pipeline
   - Basic backend and frontend testing
   - Can be removed in favor of `main-ci.yml`

6. **`backend-ci.yml`** - Backend-specific CI
   - Comprehensive backend testing and linting
   - Can be removed in favor of `main-ci.yml`

7. **`frontend-ci.yml`** - Frontend-specific CI
   - Comprehensive frontend testing and building
   - Can be removed in favor of `main-ci.yml`

### Reusable Workflows

8. **`auto-fix-reusable.yml`** - Auto-fix functionality
   - Called by other workflows when they fail
   - Attempts to automatically fix common issues
   - Creates issues for unfixable problems

## Workflow Selection Guide

### For Production/Release
- Use **`main-ci.yml`** - Comprehensive testing, security scanning, coverage

### For Development
- Use **`quick-test.yml`** - Fast feedback, only tests changed components

### For Specific Components
- Use **`backend-ci.yml`** or **`frontend-ci.yml`** - Component-specific testing

## Recent Changes

### Fixed Issues
1. **Permission Errors**: Added proper permissions to all workflows calling `auto-fix-reusable.yml`
2. **Missing Job References**: Removed references to non-existent jobs
3. **Redundant Workflows**: Removed duplicate `backend-ci-improved.yml`
4. **Backup Files**: Cleaned up `.backup` files

### Improvements
1. **Consolidated Main CI**: Created `main-ci.yml` with best practices from all workflows
2. **Quick Testing**: Added `quick-test.yml` for faster development feedback
3. **Better Organization**: Clear separation between main and legacy workflows
4. **Consistent Structure**: Standardized job naming and structure across workflows

## Migration Path

### Phase 1: Use New Workflows (Current)
- Start using `main-ci.yml` for comprehensive testing
- Use `quick-test.yml` for development

### Phase 2: Remove Legacy Workflows (Future)
- Remove `simple-ci.yml`, `ci.yml`, `backend-ci.yml`, `frontend-ci.yml`
- Keep only `main-ci.yml`, `quick-test.yml`, `combined-coverage.yml`, and `auto-fix-reusable.yml`

## Workflow Triggers

| Workflow | Push (main/develop) | PR | Paths |
|----------|-------------------|----|-------| 
| main-ci.yml | ✅ | ✅ | All |
| quick-test.yml | ✅ | ✅ | Excludes docs |
| combined-coverage.yml | ✅ | ❌ | After main-ci |
| simple-ci.yml | ✅ | ✅ | All |
| ci.yml | ✅ | ✅ | All |
| backend-ci.yml | ✅ | ✅ | Backend only |
| frontend-ci.yml | ✅ | ✅ | Frontend only |

## Environment Variables

- `PYTHON_VERSION`: '3.11'
- `NODE_VERSION`: '20.x'

## Dependencies

### Backend
- Python 3.9, 3.10, 3.11
- pip dependencies from `requirements.txt` and `requirements-dev.txt`

### Frontend
- Node.js 20.x
- npm dependencies from `package.json`

## Artifacts

- `frontend-build`: Built frontend application
- `security-reports`: Backend security scan results
- `combined-coverage-report`: Aggregated coverage data

## Auto-Fix Integration

All workflows include auto-fix integration that:
- Detects common issues (missing dependencies, import errors, etc.)
- Attempts automatic fixes where possible
- Creates GitHub issues for unfixable problems
- Requires `contents: write`, `issues: write`, `pull-requests: write` permissions
