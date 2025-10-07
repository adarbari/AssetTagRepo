#!/bin/bash

# Check environment configuration files
# Ensures .env.beta and .env.example have required variables

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    local status=$1
    local message=$2
    case $status in
        "success")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "error")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "warning")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
    esac
}

# Required environment variables for BETA mode
REQUIRED_BETA_VARS=(
    "ASSET_TAG_ENVIRONMENT=beta"
    "ASSET_TAG_USE_REDIS=true"
    "ASSET_TAG_USE_LOCAL_ELASTICSEARCH=true"
    "ASSET_TAG_USE_LOCAL_STORAGE=true"
    "ASSET_TAG_ENABLE_STREAMING=true"
    "ASSET_TAG_USE_LOCAL_STREAMING=true"
    "ASSET_TAG_USE_LOCAL_MLFLOW=true"
)

# Required environment variables for example
REQUIRED_EXAMPLE_VARS=(
    "ASSET_TAG_ENVIRONMENT"
    "ASSET_TAG_POSTGRES_HOST"
    "ASSET_TAG_POSTGRES_PORT"
    "ASSET_TAG_POSTGRES_USER"
    "ASSET_TAG_POSTGRES_PASSWORD"
    "ASSET_TAG_POSTGRES_DB"
)

check_file() {
    local file=$1
    local file_type=$2
    
    if [ ! -f "$file" ]; then
        print_status "error" "File $file does not exist"
        return 1
    fi
    
    print_status "success" "Checking $file_type file: $file"
    
    if [ "$file_type" = "beta" ]; then
        for var in "${REQUIRED_BETA_VARS[@]}"; do
            if grep -q "^$var" "$file"; then
                print_status "success" "Found required variable: $var"
            else
                print_status "error" "Missing required variable: $var"
                return 1
            fi
        done
    elif [ "$file_type" = "example" ]; then
        for var in "${REQUIRED_EXAMPLE_VARS[@]}"; do
            if grep -q "^$var=" "$file"; then
                print_status "success" "Found required variable: $var"
            else
                print_status "error" "Missing required variable: $var"
                return 1
            fi
        done
    fi
    
    return 0
}

# Main execution
echo "🔍 Checking environment configuration files..."

ERRORS=0

# Check .env.beta if it exists
if [ -f "asset-tag-backend/.env.beta" ]; then
    if ! check_file "asset-tag-backend/.env.beta" "beta"; then
        ERRORS=$((ERRORS + 1))
    fi
else
    print_status "warning" ".env.beta file not found - this is expected if not created yet"
fi

# Check .env.example
if [ -f "asset-tag-backend/.env.example" ]; then
    if ! check_file "asset-tag-backend/.env.example" "example"; then
        ERRORS=$((ERRORS + 1))
    fi
else
    print_status "error" ".env.example file not found"
    ERRORS=$((ERRORS + 1))
fi

# Check for duplicate variables
if [ -f "asset-tag-backend/.env.beta" ]; then
    echo "🔍 Checking for duplicate variables in .env.beta..."
    duplicates=$(sort "asset-tag-backend/.env.beta" | uniq -d | wc -l)
    if [ "$duplicates" -gt 0 ]; then
        print_status "error" "Found duplicate variables in .env.beta"
        ERRORS=$((ERRORS + 1))
    else
        print_status "success" "No duplicate variables found in .env.beta"
    fi
fi

# Final result
if [ $ERRORS -eq 0 ]; then
    print_status "success" "All environment configuration checks passed!"
    exit 0
else
    print_status "error" "Found $ERRORS configuration issues"
    exit 1
fi
