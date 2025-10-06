# 🤖 Auto-Fix System for GitHub Actions

This repository includes an automated system to monitor GitHub Actions failures and create fixes for common issues.

## 🚀 Features

- **Automatic Monitoring**: Monitors CI workflows for failures
- **Error Detection**: Identifies common issues like missing dependencies
- **Auto-Fixing**: Creates branches and PRs with fixes
- **Smart Notifications**: Creates issues and comments on PRs
- **Configurable**: Easy to customize via configuration files

## 📁 Files

### GitHub Actions Workflows
- `.github/workflows/auto-fix-monitor.yml` - Monitors workflow runs and creates issues
- `.github/workflows/auto-fix-bot.yml` - Creates PRs with fixes

### Scripts
- `scripts/monitor-ci.py` - Local monitoring script

### Configuration
- `.github/auto-fix-config.yml` - Configuration for the auto-fix system

## 🔧 Setup

### 1. Enable GitHub Actions

The workflows are automatically enabled when pushed to the repository.

### 2. Configure Permissions

Ensure the `GITHUB_TOKEN` has the following permissions:
- `actions: read`
- `issues: write`
- `pull-requests: write`
- `contents: write`

### 3. Set Up Local Monitoring (Optional)

```bash
# Install dependencies
pip install requests

# Run the monitor
python scripts/monitor-ci.py adarbari/AssetTagRepo YOUR_GITHUB_TOKEN
```

## 🎯 Supported Fixes

### Currently Supported
- ✅ **Email Validator**: Adds `email-validator` dependency to requirements files
- ✅ **Missing Dependencies**: Detects and suggests fixes for missing modules

### Planned
- 🔄 **Version Updates**: Automatic dependency version updates
- 🔄 **Linting Fixes**: Auto-fix common linting issues
- 🔄 **Test Fixes**: Fix common test failures

## 📊 How It Works

1. **Monitoring**: The system monitors GitHub Actions workflows
2. **Detection**: When a workflow fails, it analyzes the logs
3. **Analysis**: Identifies known error patterns
4. **Fixing**: Creates a branch with the fix
5. **PR Creation**: Opens a pull request with the fix
6. **Notification**: Comments on issues and PRs

## 🔍 Error Patterns

The system recognizes these error patterns:

```yaml
# Email validator missing
"email-validator is not installed" → Add email-validator dependency

# Missing Python modules
"ModuleNotFoundError" → Analyze and suggest dependency

# Import errors
"ImportError" → Analyze and suggest fix

# Test failures
"pytest" + "FAILED" → Analyze test failures
```

## ⚙️ Configuration

Edit `.github/auto-fix-config.yml` to customize:

```yaml
monitoring:
  enabled: true
  workflows:
    - "Backend CI"
    - "Frontend CI"
  check_interval: 5

fixes:
  email_validator:
    enabled: true
    pattern: "email-validator is not installed"
    action: "add_dependency"
```

## 🚨 Manual Override

You can manually trigger fixes by commenting on issues:

```
/auto-fix
```

## 📈 Monitoring

### GitHub Actions Dashboard
- View workflow runs in the Actions tab
- Check auto-fix workflow status

### Issues
- Auto-detected issues are labeled with `auto-detected`
- Fix PRs are labeled with `auto-generated`

### Pull Requests
- Auto-fix PRs are clearly marked
- Include detailed descriptions of changes

## 🔒 Security

- Only modifies allowed file patterns
- Requires manual review for sensitive changes
- Uses GitHub's built-in security features

## 🐛 Troubleshooting

### Common Issues

1. **Permission Denied**
   - Check GitHub token permissions
   - Ensure workflows have write access

2. **Fix Not Applied**
   - Check if the error pattern is supported
   - Verify configuration settings

3. **Multiple Fixes**
   - System limits fixes per day
   - Check configuration for limits

### Debug Mode

Enable debug logging by setting:
```yaml
monitoring:
  debug: true
```

## 🤝 Contributing

To add new auto-fix patterns:

1. Add the pattern to `auto-fix-config.yml`
2. Implement the fix logic in the workflows
3. Test with sample error logs
4. Update this documentation

## 📝 Examples

### Email Validator Fix
```
Error: ImportError: email-validator is not installed
↓
Auto-Fix: Adds email-validator==2.1.0 to requirements.txt
↓
PR: "🤖 Auto-fix: Add email-validator dependency"
```

### Missing Module Fix
```
Error: ModuleNotFoundError: No module named 'requests'
↓
Auto-Fix: Analyzes and suggests adding requests to requirements
↓
Issue: "🚨 Auto-detected CI Failure: missing_module"
```

## 🎉 Benefits

- **Faster Resolution**: Common issues fixed automatically
- **Reduced Manual Work**: Less time spent on repetitive fixes
- **Better Visibility**: Clear tracking of CI issues
- **Learning**: Patterns help identify recurring problems
- **Consistency**: Standardized fix approaches
