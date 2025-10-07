# CI Pipeline Guide for Two-Mode Configuration

## Overview

This guide explains how the CI pipeline handles the two-mode configuration (TEST and BETA modes) and what changes are needed for your CI environment.

## CI Pipeline Structure

### **1. Main CI Pipeline** (`.github/workflows/main-ci.yml`)

**Execution Flow:**
```
1. Lint Checks → 2. TEST Mode → 3. BETA Mode (conditional) → 4. Frontend Tests
```

**Jobs:**
- **Lint**: Code quality, security, and formatting checks
- **Test Mode**: Fast tests with mocked services (PostgreSQL only)
- **Beta Mode**: Full integration tests with all services (PostgreSQL, Redis, Elasticsearch, MinIO)
- **Frontend**: React/TypeScript tests and build

### **2. Test Mode Workflow** (`.github/workflows/test-mode.yml`)

**Purpose**: Fast, isolated testing for development
**Services**: PostgreSQL only
**Database**: `asset_tag_test`
**Environment**: `ASSET_TAG_ENVIRONMENT=test`

**What it tests:**
- ✅ Unit tests
- ✅ Integration tests (with mocked external services)
- ✅ Code coverage
- ❌ Search APIs (mocked)
- ❌ File uploads (mocked)
- ❌ Real-time features (mocked)

### **3. Beta Mode Workflow** (`.github/workflows/beta-mode.yml`)

**Purpose**: Full integration testing with all services
**Services**: PostgreSQL, Redis, Elasticsearch, MinIO
**Database**: `asset_tag_beta`
**Environment**: `ASSET_TAG_ENVIRONMENT=beta`

**What it tests:**
- ✅ All integration tests with real services
- ✅ Search APIs with Elasticsearch
- ✅ File uploads with MinIO
- ✅ Caching with Redis
- ✅ API endpoint health checks
- ✅ Full service integration

## Environment Variables in CI

### **TEST Mode Environment Variables:**
```yaml
env:
  ASSET_TAG_ENVIRONMENT: test
  ASSET_TAG_POSTGRES_HOST: localhost
  ASSET_TAG_POSTGRES_PORT: 5432
  ASSET_TAG_POSTGRES_USER: dev_user
  ASSET_TAG_POSTGRES_PASSWORD: dev_pass
  ASSET_TAG_POSTGRES_DB: asset_tag_test
```

### **BETA Mode Environment Variables:**
```yaml
env:
  ASSET_TAG_ENVIRONMENT: beta
  ASSET_TAG_POSTGRES_HOST: localhost
  ASSET_TAG_POSTGRES_PORT: 5432
  ASSET_TAG_POSTGRES_USER: dev_user
  ASSET_TAG_POSTGRES_PASSWORD: dev_pass
  ASSET_TAG_POSTGRES_DB: asset_tag_beta
  ASSET_TAG_USE_REDIS: true
  ASSET_TAG_USE_LOCAL_ELASTICSEARCH: true
  ASSET_TAG_USE_LOCAL_STORAGE: true
  ASSET_TAG_ENABLE_STREAMING: true
  ASSET_TAG_USE_LOCAL_STREAMING: true
  ASSET_TAG_ELASTICSEARCH_HOST: localhost
  ASSET_TAG_ELASTICSEARCH_PORT: 9200
  ASSET_TAG_REDIS_HOST: localhost
  ASSET_TAG_REDIS_PORT: 6379
  ASSET_TAG_S3_ENDPOINT_URL: http://localhost:9000
  ASSET_TAG_S3_ACCESS_KEY: minioadmin
  ASSET_TAG_S3_SECRET_KEY: minioadmin
  ASSET_TAG_S3_BUCKET: asset-tag-data
```

## Service Configuration in CI

### **PostgreSQL Service:**
```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_USER: dev_user
      POSTGRES_PASSWORD: dev_pass
      POSTGRES_DB: asset_tag_test  # or asset_tag_beta
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
    ports:
      - 5432:5432
```

### **Redis Service (BETA mode only):**
```yaml
services:
  redis:
    image: redis:7-alpine
    options: >-
      --health-cmd "redis-cli ping"
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
    ports:
      - 6379:6379
```

### **Elasticsearch Service (BETA mode only):**
```yaml
services:
  elasticsearch:
    image: elasticsearch:8.11.0
    env:
      discovery.type: single-node
      xpack.security.enabled: false
      ES_JAVA_OPTS: "-Xms512m -Xmx512m"
    options: >-
      --health-cmd "curl -f http://localhost:9200/_cluster/health || exit 1"
      --health-interval 30s
      --health-timeout 10s
      --health-retries 5
    ports:
      - 9200:9200
```

### **MinIO Service (BETA mode only):**
```yaml
services:
  minio:
    image: minio/minio:latest
    env:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    options: >-
      --health-cmd "curl -f http://localhost:9000/minio/health/live || exit 1"
      --health-interval 30s
      --health-timeout 10s
      --health-retries 5
    ports:
      - 9000:9000
    command: server /data --console-address ":9001"
```

## Database Setup in CI

### **Database Creation:**
```bash
# Create test databases
PGPASSWORD=dev_pass psql -h localhost -U dev_user -d postgres -c "CREATE DATABASE asset_tag_test;"
PGPASSWORD=dev_pass psql -h localhost -U dev_user -d postgres -c "CREATE DATABASE asset_tag_beta;"
```

### **Database Migrations:**
```bash
# Run migrations for TEST mode
ASSET_TAG_ENVIRONMENT=test alembic upgrade head

# Run migrations for BETA mode
ASSET_TAG_ENVIRONMENT=beta alembic upgrade head
```

## Test Execution in CI

### **TEST Mode Tests:**
```bash
# Unit tests
ASSET_TAG_ENVIRONMENT=test python -m pytest tests/unit/ -v --cov=modules --cov-report=xml

# Integration tests (mocked services)
ASSET_TAG_ENVIRONMENT=test python -m pytest tests/integration/ -v --tb=short
```

### **BETA Mode Tests:**
```bash
# Integration tests (full services)
ASSET_TAG_ENVIRONMENT=beta python -m pytest tests/integration/ -v --tb=short

# API endpoint tests
ASSET_TAG_ENVIRONMENT=beta uvicorn main:app --host 0.0.0.0 --port 8000 &
curl -f http://localhost:8000/health
curl -f http://localhost:8000/api/v1/assets
curl -f http://localhost:8000/api/v1/alerts
```

## Conditional Execution

### **BETA Mode Conditions:**
```yaml
# Only run BETA mode on main branch or pull requests
if: github.ref == 'refs/heads/main' || github.event_name == 'pull_request'
```

### **Path-based Execution:**
```yaml
# Only run backend tests when backend files change
paths:
  - 'asset-tag-backend/**'
```

## Performance Considerations

### **TEST Mode (Fast):**
- **Duration**: 2-3 minutes
- **Services**: PostgreSQL only
- **Tests**: Unit + Integration (mocked)
- **Resource Usage**: Low

### **BETA Mode (Comprehensive):**
- **Duration**: 5-8 minutes
- **Services**: All services (PostgreSQL, Redis, Elasticsearch, MinIO)
- **Tests**: Full integration + API tests
- **Resource Usage**: High

## Monitoring and Debugging

### **Service Health Checks:**
```bash
# PostgreSQL
PGPASSWORD=dev_pass psql -h localhost -U dev_user -d asset_tag_test -c "SELECT 1;"

# Redis
redis-cli -h localhost ping

# Elasticsearch
curl -f http://localhost:9200/_cluster/health

# MinIO
curl -f http://localhost:9000/minio/health/live
```

### **Debug Mode:**
```yaml
env:
  ACTIONS_STEP_DEBUG: 'true'
  ACTIONS_RUNNER_DEBUG: 'true'
```

## Pre-commit Integration

### **Environment Configuration Check:**
```yaml
- id: check-environment-config
  name: Check environment configuration files
  entry: ./scripts/check-environment-config.sh
  language: script
  files: ^asset-tag-backend/\.env\.(beta|example)$
  pass_filenames: true
```

## Expected Results

### **TEST Mode Success:**
- ✅ All unit tests pass
- ✅ Integration tests pass (with mocked services)
- ✅ Code coverage > 80%
- ✅ No linting errors

### **BETA Mode Success:**
- ✅ All integration tests pass (with real services)
- ✅ Search APIs work with Elasticsearch
- ✅ File uploads work with MinIO
- ✅ Caching works with Redis
- ✅ API endpoints respond correctly

## Troubleshooting

### **Common Issues:**

#### **1. Database Connection Failures:**
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check database exists
PGPASSWORD=dev_pass psql -h localhost -U dev_user -d postgres -c "\l"
```

#### **2. Service Health Check Failures:**
```bash
# Wait longer for services to start
sleep 30

# Check service logs
docker logs <container_name>
```

#### **3. Environment Variable Issues:**
```bash
# Verify environment variables are set
env | grep ASSET_TAG

# Check .env files
cat asset-tag-backend/.env.beta
```

#### **4. Test Failures:**
```bash
# Run tests locally first
ASSET_TAG_ENVIRONMENT=test python -m pytest tests/integration/ -v

# Check test logs
python -m pytest tests/integration/ -v --tb=long
```

## Benefits of Two-Mode CI

### **Development Efficiency:**
- ✅ **Fast Feedback**: TEST mode provides quick results
- ✅ **Comprehensive Testing**: BETA mode ensures full functionality
- ✅ **Resource Optimization**: Services only run when needed
- ✅ **Parallel Execution**: Multiple test modes can run simultaneously

### **Quality Assurance:**
- ✅ **Isolation**: TEST mode prevents external service dependencies
- ✅ **Integration**: BETA mode tests real service interactions
- ✅ **Coverage**: Both modes ensure comprehensive test coverage
- ✅ **Reliability**: Multiple test environments catch different issues

---

**🎯 Result**: Your CI pipeline now supports both TEST and BETA modes, providing fast development feedback while ensuring comprehensive integration testing with all services!
