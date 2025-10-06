#!/usr/bin/env python3
"""
Test runner script for Asset Tag Backend
"""
import sys
import subprocess
import os
from pathlib import Path


def run_tests():
    """Run all tests with pytest"""
    
    # Get the project root directory
    project_root = Path(__file__).parent.parent
    
    # Change to project root directory
    os.chdir(project_root)
    
    # Test command
    test_command = [
        sys.executable, "-m", "pytest",
        "tests/",
        "-v",  # Verbose output
        "--tb=short",  # Short traceback format
        "--cov=modules",  # Coverage for modules
        "--cov-report=html",  # HTML coverage report
        "--cov-report=term-missing",  # Terminal coverage report
        "--asyncio-mode=auto",  # Auto async mode
        "-x",  # Stop on first failure
    ]
    
    print("Running tests for Asset Tag Backend...")
    print(f"Command: {' '.join(test_command)}")
    print("-" * 50)
    
    try:
        result = subprocess.run(test_command, check=True)
        print("\n" + "=" * 50)
        print("✅ All tests passed!")
        print("📊 Coverage report generated in htmlcov/index.html")
        return 0
    except subprocess.CalledProcessError as e:
        print("\n" + "=" * 50)
        print("❌ Tests failed!")
        print(f"Exit code: {e.returncode}")
        return e.returncode


def run_unit_tests():
    """Run only unit tests"""
    
    project_root = Path(__file__).parent.parent
    os.chdir(project_root)
    
    test_command = [
        sys.executable, "-m", "pytest",
        "tests/unit/",
        "-v",
        "--tb=short",
        "--asyncio-mode=auto",
    ]
    
    print("Running unit tests...")
    print(f"Command: {' '.join(test_command)}")
    print("-" * 50)
    
    try:
        result = subprocess.run(test_command, check=True)
        print("\n" + "=" * 50)
        print("✅ All unit tests passed!")
        return 0
    except subprocess.CalledProcessError as e:
        print("\n" + "=" * 50)
        print("❌ Unit tests failed!")
        return e.returncode


def run_integration_tests():
    """Run only integration tests"""
    
    project_root = Path(__file__).parent.parent
    os.chdir(project_root)
    
    test_command = [
        sys.executable, "-m", "pytest",
        "tests/integration/",
        "-v",
        "--tb=short",
        "--asyncio-mode=auto",
    ]
    
    print("Running integration tests...")
    print(f"Command: {' '.join(test_command)}")
    print("-" * 50)
    
    try:
        result = subprocess.run(test_command, check=True)
        print("\n" + "=" * 50)
        print("✅ All integration tests passed!")
        return 0
    except subprocess.CalledProcessError as e:
        print("\n" + "=" * 50)
        print("❌ Integration tests failed!")
        return e.returncode


def run_specific_test(test_path):
    """Run a specific test file or test function"""
    
    project_root = Path(__file__).parent.parent
    os.chdir(project_root)
    
    test_command = [
        sys.executable, "-m", "pytest",
        test_path,
        "-v",
        "--tb=short",
        "--asyncio-mode=auto",
    ]
    
    print(f"Running specific test: {test_path}")
    print(f"Command: {' '.join(test_command)}")
    print("-" * 50)
    
    try:
        result = subprocess.run(test_command, check=True)
        print("\n" + "=" * 50)
        print("✅ Test passed!")
        return 0
    except subprocess.CalledProcessError as e:
        print("\n" + "=" * 50)
        print("❌ Test failed!")
        return e.returncode


def main():
    """Main function to handle command line arguments"""
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "unit":
            return run_unit_tests()
        elif command == "integration":
            return run_integration_tests()
        elif command == "specific":
            if len(sys.argv) > 2:
                test_path = sys.argv[2]
                return run_specific_test(test_path)
            else:
                print("Usage: python run_tests.py specific <test_path>")
                return 1
        else:
            print("Usage: python run_tests.py [unit|integration|specific <test_path>]")
            return 1
    else:
        return run_tests()


if __name__ == "__main__":
    sys.exit(main())
