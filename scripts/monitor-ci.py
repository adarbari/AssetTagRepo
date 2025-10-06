#!/usr/bin/env python3
"""
GitHub Actions CI Monitor and Auto-Fixer

This script monitors GitHub Actions workflows and can automatically
create fixes for common issues like missing dependencies.
"""

import os
import sys
import json
import time
import requests
from typing import Dict, List, Optional
from dataclasses import dataclass
from pathlib import Path

@dataclass
class WorkflowRun:
    id: int
    name: str
    status: str
    conclusion: str
    html_url: str
    head_sha: str
    created_at: str

class GitHubCIMonitor:
    def __init__(self, repo: str, token: str):
        self.repo = repo
        self.token = token
        self.base_url = f"https://api.github.com/repos/{repo}"
        self.headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json"
        }
    
    def get_workflow_runs(self, workflow_id: str = None, status: str = "completed") -> List[WorkflowRun]:
        """Get recent workflow runs"""
        url = f"{self.base_url}/actions/runs"
        params = {"status": status, "per_page": 10}
        if workflow_id:
            params["workflow_id"] = workflow_id
        
        response = requests.get(url, headers=self.headers, params=params)
        response.raise_for_status()
        
        runs = []
        for run_data in response.json()["workflow_runs"]:
            runs.append(WorkflowRun(
                id=run_data["id"],
                name=run_data["name"],
                status=run_data["status"],
                conclusion=run_data["conclusion"],
                html_url=run_data["html_url"],
                head_sha=run_data["head_sha"],
                created_at=run_data["created_at"]
            ))
        
        return runs
    
    def get_workflow_logs(self, run_id: int) -> str:
        """Get workflow run logs"""
        url = f"{self.base_url}/actions/runs/{run_id}/logs"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.text
    
    def analyze_logs(self, logs: str) -> Dict[str, str]:
        """Analyze logs for common errors"""
        errors = {}
        
        if "email-validator is not installed" in logs:
            errors["email_validator"] = "Missing email-validator dependency"
        
        if "ModuleNotFoundError" in logs:
            errors["missing_module"] = "Missing Python module"
        
        if "ImportError" in logs:
            errors["import_error"] = "Import error detected"
        
        if "pytest" in logs and "FAILED" in logs:
            errors["test_failure"] = "Test failures detected"
        
        return errors
    
    def create_fix_branch(self, error_type: str) -> str:
        """Create a new branch for the fix"""
        import subprocess
        
        branch_name = f"auto-fix/{error_type}-{int(time.time())}"
        
        # Create and checkout new branch
        subprocess.run(["git", "checkout", "-b", branch_name], check=True)
        
        return branch_name
    
    def apply_email_validator_fix(self):
        """Apply email-validator fix"""
        requirements_file = Path("asset-tag-backend/requirements.txt")
        minimal_file = Path("asset-tag-backend/requirements-minimal.txt")
        
        # Add to main requirements
        if requirements_file.exists():
            content = requirements_file.read_text()
            if "email-validator" not in content:
                # Find pydantic line and add email-validator after it
                lines = content.split('\n')
                for i, line in enumerate(lines):
                    if line.startswith("pydantic=="):
                        lines.insert(i + 1, "email-validator==2.1.0")
                        break
                requirements_file.write_text('\n'.join(lines))
        
        # Add to minimal requirements
        if minimal_file.exists():
            content = minimal_file.read_text()
            if "email-validator" not in content:
                minimal_file.write_text(content + "\nemail-validator>=2.0.0\n")
    
    def commit_and_push_fix(self, error_type: str, branch_name: str):
        """Commit and push the fix"""
        import subprocess
        
        # Add files
        subprocess.run(["git", "add", "asset-tag-backend/requirements*.txt"], check=True)
        
        # Commit
        commit_msg = f"fix: auto-fix {error_type} error\n\nAuto-generated fix for CI failure"
        subprocess.run(["git", "commit", "-m", commit_msg], check=True)
        
        # Push
        subprocess.run(["git", "push", "origin", branch_name], check=True)
        
        return f"https://github.com/{self.repo}/compare/{branch_name}"
    
    def create_pull_request(self, branch_name: str, error_type: str, fix_url: str):
        """Create a pull request for the fix"""
        title = f"🤖 Auto-fix: {error_type.replace('_', ' ').title()}"
        body = f"""
## Automated Fix for CI Failure

This PR automatically fixes the {error_type} error detected in the CI pipeline.

**Changes:**
- ✅ Applied automated fix for {error_type}

**Testing:**
- [ ] Verify CI passes after merge
- [ ] Test functionality

**Fix URL:** {fix_url}

---
*This PR was automatically created by the CI Monitor*
        """
        
        data = {
            "title": title,
            "head": branch_name,
            "base": "main",
            "body": body
        }
        
        response = requests.post(
            f"{self.base_url}/pulls",
            headers=self.headers,
            json=data
        )
        response.raise_for_status()
        
        return response.json()["html_url"]

def main():
    """Main monitoring loop"""
    if len(sys.argv) < 3:
        print("Usage: python monitor-ci.py <repo> <github_token>")
        print("Example: python monitor-ci.py adarbari/AssetTagRepo ghp_xxxxx")
        sys.exit(1)
    
    repo = sys.argv[1]
    token = sys.argv[2]
    
    monitor = GitHubCIMonitor(repo, token)
    
    print(f"🔍 Monitoring CI for {repo}...")
    
    # Get recent failed runs
    failed_runs = [run for run in monitor.get_workflow_runs() if run.conclusion == "failure"]
    
    if not failed_runs:
        print("✅ No failed runs found")
        return
    
    print(f"❌ Found {len(failed_runs)} failed runs")
    
    for run in failed_runs:
        print(f"\n🔍 Analyzing {run.name} (Run #{run.id})")
        
        try:
            logs = monitor.get_workflow_logs(run.id)
            errors = monitor.analyze_logs(logs)
            
            if not errors:
                print("   No auto-fixable errors found")
                continue
            
            print(f"   Found errors: {list(errors.keys())}")
            
            # Apply fixes
            for error_type, description in errors.items():
                print(f"   🔧 Fixing {error_type}: {description}")
                
                if error_type == "email_validator":
                    branch_name = monitor.create_fix_branch(error_type)
                    monitor.apply_email_validator_fix()
                    fix_url = monitor.commit_and_push_fix(error_type, branch_name)
                    pr_url = monitor.create_pull_request(branch_name, error_type, fix_url)
                    print(f"   ✅ Created PR: {pr_url}")
                
                else:
                    print(f"   ⚠️  Auto-fix not implemented for {error_type}")
        
        except Exception as e:
            print(f"   ❌ Error analyzing run {run.id}: {e}")

if __name__ == "__main__":
    main()
