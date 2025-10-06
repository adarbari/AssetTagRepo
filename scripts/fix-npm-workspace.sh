#!/bin/bash

# Fix NPM Workspace Issues Script
# This script fixes common npm workspace configuration issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Fixing NPM Workspace Issues${NC}"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "asset-tag-frontend" ]; then
    echo -e "${RED}❌ Error: Not in the repository root or missing workspace directories${NC}"
    echo "Please run this script from the repository root"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ Error: npm not found${NC}"
    echo "Please install Node.js and npm"
    exit 1
fi

echo -e "${YELLOW}📋 Current npm and Node versions:${NC}"
npm --version
node --version

# Check workspace configuration
echo -e "\n${YELLOW}🔍 Checking workspace configuration...${NC}"
if grep -q '"workspaces"' package.json; then
    echo -e "${GREEN}✅ Workspace configuration found${NC}"
else
    echo -e "${RED}❌ No workspace configuration found${NC}"
    exit 1
fi

# Fix package-lock.json issues
echo -e "\n${YELLOW}🔧 Fixing package-lock.json issues...${NC}"

# Remove problematic lockfiles
if [ -f "package-lock.json" ]; then
    echo "Removing root package-lock.json..."
    rm -f package-lock.json
fi

if [ -f "asset-tag-frontend/package-lock.json" ]; then
    echo "Removing frontend package-lock.json..."
    rm -f asset-tag-frontend/package-lock.json
fi

# Clean npm cache
echo -e "\n${YELLOW}🧹 Cleaning npm cache...${NC}"
npm cache clean --force

# Install dependencies from root
echo -e "\n${YELLOW}📦 Installing dependencies from root...${NC}"
npm install

# Verify installation
echo -e "\n${YELLOW}✅ Verifying installation...${NC}"
if [ -f "package-lock.json" ]; then
    echo -e "${GREEN}✅ Root package-lock.json created${NC}"
else
    echo -e "${RED}❌ Root package-lock.json not created${NC}"
fi

if [ -f "asset-tag-frontend/package-lock.json" ]; then
    echo -e "${GREEN}✅ Frontend package-lock.json created${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend package-lock.json not created (this may be normal for workspaces)${NC}"
fi

# Test workspace commands
echo -e "\n${YELLOW}🧪 Testing workspace commands...${NC}"
if npm run --workspace=asset-tag-frontend --silent 2>/dev/null; then
    echo -e "${GREEN}✅ Workspace commands working${NC}"
else
    echo -e "${YELLOW}⚠️  Some workspace commands may not be available${NC}"
fi

echo -e "\n${GREEN}🎉 NPM workspace fix completed!${NC}"
echo -e "\n${BLUE}📋 What was fixed:${NC}"
echo "  • Removed problematic package-lock.json files"
echo "  • Cleaned npm cache"
echo "  • Reinstalled dependencies from root"
echo "  • Verified workspace configuration"

echo -e "\n${BLUE}🎯 Next steps:${NC}"
echo "  • Test: npm run test:frontend"
echo "  • Build: npm run build:frontend"
echo "  • Dev: npm run dev:frontend"

echo -e "\n${YELLOW}💡 Pro tip: Always run npm commands from the repository root when using workspaces!${NC}"
