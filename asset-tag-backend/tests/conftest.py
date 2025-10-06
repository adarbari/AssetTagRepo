"""
Pytest configuration and fixtures
"""
import pytest
import asyncio
from typing import AsyncGenerator, Generator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from httpx import AsyncClient
from fastapi.testclient import TestClient
import pytest_asyncio

from config.database import get_db, Base
from main import app
from config.settings import settings

# Import all models to ensure they're registered with SQLAlchemy
from modules.shared.database import models

# Test database URL
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

# Create test engine
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    future=True
)

# Create test session factory
TestSessionLocal = sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False
)


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Create a test database session."""
    # Create tables
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Create session
    async with TestSessionLocal() as session:
        yield session
    
    # Clean up
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(scope="function")
def client():
    """Create a test client with database dependency override."""
    
    # Create a new test session for this test
    async def override_get_db():
        async with TestSessionLocal() as session:
            try:
                yield session
            except Exception as e:
                await session.rollback()
                raise
            finally:
                await session.close()
    
    app.dependency_overrides[get_db] = override_get_db
    
    # Override the lifespan to skip database initialization during testing
    from contextlib import asynccontextmanager
    
    @asynccontextmanager
    async def test_lifespan(app):
        # Skip all initialization for testing
        yield
        # Skip all cleanup for testing
    
    # Temporarily replace the lifespan
    original_lifespan = app.router.lifespan_context
    app.router.lifespan_context = test_lifespan
    
    from fastapi.testclient import TestClient
    with TestClient(app) as tc:
        yield tc
    
    # Restore original lifespan
    app.router.lifespan_context = original_lifespan
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def sync_client() -> TestClient:
    """Create a synchronous test client."""
    return TestClient(app)


@pytest.fixture
def sample_asset_data():
    """Sample asset data for testing."""
    return {
        "name": "Test Excavator",
        "serial_number": "EXC-001",
        "asset_type": "excavator",
        "status": "active",
        "site_id": "test-site-1",
        "assigned_to_user_id": "test-user-1",
        "battery_level": 85,
        "last_seen": "2024-01-01T12:00:00Z",
        "asset_metadata": {"model": "CAT 320", "year": 2020}
    }


@pytest.fixture
def sample_site_data():
    """Sample site data for testing."""
    return {
        "name": "Test Construction Site",
        "site_type": "construction",
        "status": "active",
        "address": "123 Test St, Test City, TC 12345",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "metadata": {"project_id": "PROJ-001"}
    }


@pytest.fixture
def sample_observation_data():
    """Sample observation data for testing."""
    return {
        "asset_id": "test-asset-1",
        "gateway_id": "test-gateway-1",
        "rssi": -65,
        "battery_level": 80,
        "temperature": 25.5,
        "observed_at": "2024-01-01T12:00:00Z",
        "metadata": {"signal_quality": "good"}
    }


@pytest.fixture
def sample_alert_data():
    """Sample alert data for testing."""
    return {
        "alert_type": "battery_low",
        "severity": "warning",
        "asset_id": "test-asset-1",
        "asset_name": "Test Asset",
        "message": "Battery level is low",
        "description": "Asset battery has dropped below 20%",
        "triggered_at": "2024-01-01T12:00:00Z"
    }


@pytest.fixture
def sample_job_data():
    """Sample job data for testing."""
    return {
        "name": "Test Job",
        "description": "Test job description",
        "job_type": "maintenance",
        "status": "pending",
        "priority": "medium",
        "scheduled_start": "2024-01-01T09:00:00Z",
        "scheduled_end": "2024-01-01T17:00:00Z",
        "assigned_to_user_id": "test-user-1",
        "site_id": "test-site-1"
    }


@pytest.fixture
def sample_maintenance_data():
    """Sample maintenance data for testing."""
    return {
        "asset_id": "test-asset-1",
        "maintenance_type": "scheduled",
        "status": "pending",
        "priority": "medium",
        "scheduled_date": "2024-01-01T10:00:00Z",
        "assigned_to_user_id": "test-user-1",
        "description": "Regular maintenance check"
    }


@pytest.fixture
def sample_geofence_data():
    """Sample geofence data for testing."""
    return {
        "name": "Test Geofence",
        "geofence_type": "authorized",
        "status": "active",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [-74.0060, 40.7128],
                [-74.0050, 40.7128],
                [-74.0050, 40.7138],
                [-74.0060, 40.7138],
                [-74.0060, 40.7128]
            ]]
        },
        "site_id": "test-site-1"
    }