#!/bin/bash

# Setup Code Formatting Script
# This script sets up pre-commit hooks and formatting tools

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Setting up Code Formatting${NC}"
echo "=================================="

# Check if we're in the right directory
if [ ! -f ".pre-commit-config.yaml" ]; then
    echo -e "${RED}❌ Error: .pre-commit-config.yaml not found${NC}"
    echo "Please run this script from the repository root"
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Error: Python3 not found${NC}"
    echo "Please install Python 3.9 or higher"
    exit 1
fi

# Install backend dependencies
echo -e "${YELLOW}📦 Installing Python dependencies...${NC}"
cd asset-tag-backend
pip install -r requirements-dev.txt
cd ..

# Install pre-commit
echo -e "${YELLOW}🔧 Installing pre-commit hooks...${NC}"
pre-commit install

# Run pre-commit on all files (first time)
echo -e "${YELLOW}🎨 Running formatting on all files (first time)...${NC}"
pre-commit run --all-files || true

# Make format script executable
chmod +x scripts/format-code.sh

echo -e "\n${GREEN}✅ Setup completed successfully!${NC}"
echo -e "\n${BLUE}📋 What's been set up:${NC}"
echo "  • Pre-commit hooks installed"
echo "  • Python dependencies installed"
echo "  • Format script made executable"
echo "  • Initial formatting applied"

echo -e "\n${BLUE}🎯 Next steps:${NC}"
echo "  • Format code: ./scripts/format-code.sh"
echo "  • Check formatting: ./scripts/format-code.sh --check"
echo "  • Pre-commit will run automatically on commits"

echo -e "\n${YELLOW}💡 Pro tip: Your IDE can be configured to format on save!${NC}"
echo "See docs/guides/code-formatting-setup.md for IDE setup instructions"
