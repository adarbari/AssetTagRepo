# Asset Tag Backend

A production-ready Python FastAPI backend for asset tracking using Bluetooth location estimation.

## Features

- **Bluetooth Signal Processing**: Consumes observations from Kinesis/Redpanda streams
- **Location Estimation**: Calculates precise asset locations using trilateration and ML
- **Geofencing**: Real-time geofence entry/exit detection
- **Alert Generation**: Automatic alert generation based on location and rules
- **REST APIs**: Complete CRUD APIs for all entities
- **Real-time Updates**: WebSocket support for live location and alert updates
- **Local Development**: Free, self-hosted alternatives for all AWS services
- **Production Ready**: Easy configuration switching between local and AWS services

## Architecture

### Modular Monolith Structure
```
asset-tag-backend/
├── config/                 # Configuration management
├── modules/               # Business logic modules
│   ├── assets/           # Asset management
│   ├── sites/            # Site management
│   ├── gateways/         # Bluetooth gateway management
│   ├── observations/     # Bluetooth observation processing
│   ├── locations/        # Location estimation
│   ├── geofences/        # Geofence management
│   ├── alerts/           # Alert generation and management
│   ├── jobs/             # Job management
│   ├── maintenance/      # Maintenance tracking
│   └── analytics/        # Analytics and reporting
├── streaming/            # Stream processing
├── ml/                   # Machine learning models
└── tests/                # Test suites
```

### Technology Stack

**Core Framework**: FastAPI with async/await support
**Database**: PostgreSQL with TimescaleDB for time-series data
**Cache**: Redis for fast lookups and session management
**Streaming**: Redpanda (local) / AWS Kinesis (production)
**Storage**: MinIO (local) / AWS S3 (production)
**Monitoring**: Prometheus + Grafana (local) / AWS CloudWatch (production)
**ML**: MLFlow for model tracking and serving

## Quick Start

### Prerequisites

- Python 3.11+
- **Docker Desktop** (Required for infrastructure services)
- Git

#### Installing Docker Desktop

**For macOS:**
1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop/
2. Install the .dmg file
3. Start Docker Desktop application
4. Verify installation: `docker --version` and `docker-compose --version`

**Alternative installation via Homebrew:**
```bash
brew install --cask docker
```

**Important:** Docker Desktop must be running before starting the backend services.

### Local Development Setup

1. **Clone and navigate to backend directory**:
   ```bash
   cd asset-tag-backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   pip install -r requirements-dev.txt
   ```

4. **Set up environment variables**:
   ```bash
   cp env.example .env
   # The .env file is already configured for local development
   ```

5. **Start Docker Desktop** (if not already running):
   - Open Docker Desktop application
   - Wait for it to fully start (whale icon in menu bar should be stable)

6. **Start infrastructure services**:
   ```bash
   docker-compose up -d
   ```
   
   This will start all required services:
   - PostgreSQL with TimescaleDB (port 5432)
   - Redis (port 6379)
   - MinIO S3-compatible storage (ports 9000, 9001)
   - Elasticsearch (port 9200)
   - Redpanda streaming (port 9092)
   - Prometheus metrics (port 9090)
   - Grafana dashboards (port 3001)
   - MLFlow (port 5000)
   - Jaeger tracing (port 16686)

7. **Verify services are running**:
   ```bash
   docker-compose ps
   ```
   All services should show "Up" status.

8. **Run database migrations**:
   ```bash
   alembic upgrade head
   ```

9. **Start the backend**:
   ```bash
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

10. **Start observation consumer** (in another terminal):
    ```bash
    python -m streaming.kinesis_consumer
    ```

### Access Points

- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **MLFlow**: http://localhost:5000
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)

## Configuration

### Environment Variables

The backend uses environment variables for configuration. Copy `env.example` to `.env` and customize:

```bash
# Environment
ASSET_TAG_ENVIRONMENT=local

# Database
ASSET_TAG_POSTGRES_HOST=localhost
ASSET_TAG_POSTGRES_DB=asset_tag

# Streaming (Local vs AWS)
ASSET_TAG_USE_LOCAL_STREAMING=true
ASSET_TAG_REDPANDA_BROKERS=localhost:9092

# Storage (Local vs AWS)
ASSET_TAG_USE_LOCAL_STORAGE=true
ASSET_TAG_S3_ENDPOINT_URL=http://localhost:9000
```

### Switching to Production

To switch from local services to AWS services, simply change these environment variables:

```bash
ASSET_TAG_USE_LOCAL_STREAMING=false
ASSET_TAG_USE_LOCAL_STORAGE=false
ASSET_TAG_USE_LOCAL_MONITORING=false
```

## API Endpoints

### Assets
- `GET /api/v1/assets` - List assets
- `GET /api/v1/assets/{id}` - Get asset details
- `POST /api/v1/assets` - Create asset
- `PUT /api/v1/assets/{id}` - Update asset
- `DELETE /api/v1/assets/{id}` - Delete asset
- `GET /api/v1/assets/{id}/current-location` - Get current location
- `GET /api/v1/assets/{id}/location-history` - Get location history

### Locations
- `GET /api/v1/locations/{asset_id}/current` - Current location
- `GET /api/v1/locations/{asset_id}/history` - Location history
- `WebSocket /ws/locations/{asset_id}` - Real-time location updates

### Alerts
- `GET /api/v1/alerts` - List alerts
- `GET /api/v1/alerts/{id}` - Get alert details
- `PUT /api/v1/alerts/{id}/acknowledge` - Acknowledge alert
- `PUT /api/v1/alerts/{id}/resolve` - Resolve alert
- `WebSocket /ws/alerts` - Real-time alert updates

### Other Endpoints
- Sites, Gateways, Geofences, Jobs, Maintenance, Analytics APIs

## Location Estimation

The backend implements multiple location estimation algorithms:

1. **Single Gateway**: High uncertainty, low confidence
2. **Midpoint**: Medium confidence for 2 gateways
3. **Trilateration**: High confidence for 3+ gateways
4. **ML Models**: Predictive location estimation

### RSSI to Distance Conversion

Uses path loss model: `RSSI = -10 * n * log10(d) + A`

- `n`: Path loss exponent (configurable, default: 2.0)
- `A`: RSSI at reference distance (configurable, default: -45 dBm)
- `d`: Distance in meters

## Geofencing

Real-time geofence evaluation with:

- **Circular Geofences**: Center point + radius
- **Polygon Geofences**: Complex shapes using Shapely
- **Entry/Exit Detection**: State tracking with Redis cache
- **Alert Generation**: Automatic alerts for violations

## Alert System

Comprehensive alert system with:

- **Rule Engine**: Configurable alert rules
- **Multiple Types**: Theft, battery, compliance, geofence violations
- **Severity Levels**: Critical, warning, info
- **Auto-resolution**: Configurable auto-resolve conditions
- **Notifications**: Email, webhook, push notifications

## Development

### Running Tests

```bash
# Unit tests
pytest tests/unit/

# Integration tests
pytest tests/integration/

# End-to-end tests
pytest tests/e2e/

# All tests
pytest
```

### Code Quality

```bash
# Format code
black .
isort .

# Lint code
flake8 .

# Type checking
mypy .
```

### Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## Deployment

### Docker Deployment

```bash
# Build image
docker build -t asset-tag-backend .

# Run container
docker run -p 8000:8000 --env-file .env asset-tag-backend
```

### Production Deployment

1. Set `ASSET_TAG_ENVIRONMENT=production`
2. Configure AWS services
3. Set production database credentials
4. Configure monitoring and logging
5. Deploy using your preferred method (ECS, Kubernetes, etc.)

## Monitoring

### Metrics

- API response times and error rates
- Location estimation accuracy
- Alert generation rates
- System resource usage

### Logging

- Structured logging with JSON format
- Request/response logging
- Error tracking and alerting
- Performance monitoring

## Troubleshooting

### Common Issues

**1. Docker services not starting:**
```bash
# Check Docker Desktop is running
docker --version

# Check service status
docker-compose ps

# View service logs
docker-compose logs [service-name]

# Restart all services
docker-compose down && docker-compose up -d
```

**2. Database connection errors:**
```bash
# Ensure PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Reset database (WARNING: This will delete all data)
docker-compose down -v && docker-compose up -d
alembic upgrade head
```

**3. Port conflicts:**
If you get "port already in use" errors, check what's using the ports:
```bash
# Check port usage
lsof -i :8000  # Backend API
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :9000  # MinIO
```

**4. UUID/SQLite errors:**
The application requires PostgreSQL with TimescaleDB. SQLite is not supported due to UUID type requirements. Ensure you're using the full Docker infrastructure.

**5. Memory issues:**
If services fail to start due to memory constraints:
- Increase Docker Desktop memory allocation (Settings > Resources > Memory)
- Close other applications to free up system memory

### Service Health Checks

```bash
# Check all services
curl http://localhost:8000/health

# Check individual services
curl http://localhost:9200  # Elasticsearch
curl http://localhost:9090  # Prometheus
curl http://localhost:5000  # MLFlow
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions and support, please open an issue in the repository.
