"""
Pytest configuration and fixtures
"""

import asyncio
import os
import uuid
from typing import AsyncGenerator, Generator

# Set test environment BEFORE any imports
os.environ["ASSET_TAG_ENVIRONMENT"] = "test"
os.environ["ASSET_TAG_POSTGRES_HOST"] = "localhost"
os.environ["ASSET_TAG_DATABASE_URL"] = "postgresql+asyncpg://dev_user:dev_pass@localhost:5432/asset_tag_test"

import pytest
import pytest_asyncio
import sqlalchemy as sa
from fastapi.testclient import TestClient
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

# Set up UUID compatibility BEFORE importing models
from config.uuid_compat import setup_uuid_compatibility

setup_uuid_compatibility()

from config.database import Base, get_db
from config.settings import settings
# Import test database configuration from separate module
from config.test_database import TestSessionLocal, test_engine
from main import app
# Import all models to ensure they're registered with SQLAlchemy
from modules.shared.database import models


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session", autouse=True)
def mock_external_services() -> None:
    """Mock all external services for testing"""
    import config.cache
    import config.elasticsearch
    import config.streaming
    import ml.serving.model_loader
    import streaming.stream_processor_coordinator

    # Mock all async startup/shutdown functions
    async def mock_async_noop(*args, **kwargs) -> None:
        pass

    # Mock streaming services
    config.streaming.start_streaming = mock_async_noop
    config.streaming.stop_streaming = mock_async_noop

    # Mock Elasticsearch
    class MockESManager:
        async def close(self) -> None:
            pass

    config.elasticsearch.get_elasticsearch_manager = lambda: MockESManager()

    # Mock cache
    config.cache.close_cache = mock_async_noop

    # Mock ML services
    ml.serving.model_loader.start_model_refresh_scheduler = mock_async_noop
    ml.serving.model_loader.stop_model_refresh_scheduler = mock_async_noop
    ml.serving.model_loader.preload_common_models = mock_async_noop

    # Mock stream processors
    streaming.stream_processor_coordinator.start_all_stream_processors = mock_async_noop
    streaming.stream_processor_coordinator.stop_all_stream_processors = mock_async_noop


@pytest_asyncio.fixture(scope="function")
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


@pytest_asyncio.fixture(scope="function")
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """Create an async test client with database override."""
    
    # Clean up database before each test
    async with test_engine.begin() as conn:
        # Drop all tables individually to avoid circular dependency issues
        await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS geofence_events CASCADE")))
        await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS alerts CASCADE")))
        await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS estimated_locations CASCADE")))
        await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS observations CASCADE")))
        await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS maintenance_records CASCADE")))
        await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS job_assets CASCADE")))
        await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS vehicle_asset_pairings CASCADE")))
        await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS assets CASCADE")))
        await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS jobs CASCADE")))
        await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS geofences CASCADE")))
        await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS sites CASCADE")))
        await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS vehicles CASCADE")))
        await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS users CASCADE")))
        await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS organizations CASCADE")))
        await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS gateways CASCADE")))
        await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS personnel CASCADE")))
        await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS personnel_activities CASCADE")))
        # Create tables using SQLAlchemy instead of migrations
        await conn.run_sync(Base.metadata.create_all)

    # Override database dependency
    from config.test_database import get_test_db
    app.dependency_overrides[get_db] = get_test_db

    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

    # Clean up override
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def client(event_loop) -> TestClient:
    """Create a synchronous test client for backward compatibility."""
    
    # Clean up database before each test using existing event loop
    async def cleanup_db() -> None:
        async with test_engine.begin() as conn:
            # Drop all tables individually to avoid circular dependency issues
            await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS geofence_events CASCADE")))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS alerts CASCADE")))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS estimated_locations CASCADE")))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS observations CASCADE")))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS maintenance_records CASCADE")))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS job_assets CASCADE")))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS vehicle_asset_pairings CASCADE")))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS assets CASCADE")))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS jobs CASCADE")))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS geofences CASCADE")))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS sites CASCADE")))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS vehicles CASCADE")))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS users CASCADE")))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS organizations CASCADE")))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS gateways CASCADE")))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS personnel CASCADE")))
            await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text("DROP TABLE IF EXISTS personnel_activities CASCADE")))
            # Create tables using SQLAlchemy instead of migrations
            await conn.run_sync(Base.metadata.create_all)

    # Run cleanup using the existing event loop
    event_loop.run_until_complete(cleanup_db())

    # Override database dependency
    from config.test_database import get_test_db
    app.dependency_overrides[get_db] = get_test_db

    with TestClient(app) as tc:
        yield tc

    # Clean up override
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def sync_client() -> TestClient:
    """Create a synchronous test client."""
    return TestClient(app)


@pytest.fixture
def sample_asset_data() -> None:
    """Sample asset data for testing."""
    from datetime import datetime

    return {
        "name": "Test Excavator",
        "serial_number": "EXC-001",
        "asset_type": "excavator",
        "status": "active",
        "current_site_id": "550e8400-e29b-41d4-a716-446655440001",
        "assigned_to_user_id": "550e8400-e29b-41d4-a716-446655440002",
        "battery_level": 85,
        "last_seen": "2024-01-01T12:00:00Z",
        "asset_metadata": {"model": "CAT 320", "year": 2020},
    }


@pytest.fixture
def sample_site_data() -> None:
    """Sample site data for testing."""
    return {
        "name": "Test Construction Site",
        "location": "123 Test St, Test City, TC 12345",
        "status": "active",
        "address": "123 Test St, Test City, TC 12345",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "metadata": {"project_id": "PROJ-001"},
    }


@pytest.fixture
def sample_observation_data() -> None:
    """Sample observation data for testing."""
    from datetime import datetime

    return {
        "asset_id": "550e8400-e29b-41d4-a716-446655440001",
        "gateway_id": "550e8400-e29b-41d4-a716-446655440002",
        "rssi": -65,
        "battery_level": 80,
        "temperature": 25.5,
        "observed_at": "2024-01-01T12:00:00Z",
        "metadata": {"signal_quality": "good"},
    }


@pytest.fixture
def sample_alert_data() -> None:
    """Sample alert data for testing."""
    from datetime import datetime

    return {
        "alert_type": "battery_low",
        "severity": "warning",
        "asset_id": "550e8400-e29b-41d4-a716-446655440000",
        "asset_name": "Test Asset",
        "message": "Battery level is low",
        "description": "Asset battery has dropped below 20%",
        "triggered_at": "2024-01-01T12:00:00Z",
    }


@pytest.fixture
def sample_job_data() -> None:
    """Sample job data for testing."""
    from datetime import datetime

    return {
        "name": "Test Job",
        "description": "Test job description",
        "job_type": "maintenance",
        "status": "pending",
        "priority": "medium",
        "scheduled_start": "2024-01-01T09:00:00Z",
        "scheduled_end": "2024-01-01T17:00:00Z",
        "assigned_to_user_id": "test-user-1",
        "site_id": "test-site-1",
    }


@pytest.fixture
def sample_maintenance_data() -> None:
    """Sample maintenance data for testing."""
    from datetime import datetime

    return {
        "asset_id": "test-asset-1",
        "maintenance_type": "scheduled",
        "status": "pending",
        "priority": "medium",
        "scheduled_date": "2024-01-01T10:00:00Z",
        "assigned_to_user_id": "test-user-1",
        "description": "Regular maintenance check",
    }


@pytest.fixture
def sample_geofence_data() -> None:
    """Sample geofence data for testing."""
    return {
        "name": "Test Geofence",
        "geofence_type": "circular",
        "status": "active",
        "center_latitude": 40.7128,
        "center_longitude": -74.0060,
        "radius": 100,
        "coordinates": [[40.7128, -74.0060]],  # Array of [lat, lng] pairs
        "site_id": "550e8400-e29b-41d4-a716-446655440001",
        "geofence_classification": "authorized",
    }


@pytest.fixture
def sample_checkin_data() -> None:
    """Sample checkin data for testing."""
    from datetime import datetime, timedelta

    return {
        "asset_id": "550e8400-e29b-41d4-a716-446655440000",
        "user_id": "550e8400-e29b-41d4-a716-446655440001",
        "user_name": "Test User",
        "check_in_location_lat": 40.7128,
        "check_in_location_lng": -74.0060,
        "check_in_location_description": "Test location",
        "purpose": "Test checkin",
        "expected_duration_hours": 2.0,
        "notes": "Test checkin",
        "checkout_metadata": {"test": True},
    }


@pytest.fixture
def sample_vehicle_data() -> None:
    """Sample vehicle data for testing."""
    return {
        "name": "Test Vehicle",
        "vehicle_type": "truck",
        "license_plate": "ABC-123",
        "status": "active",
        "current_latitude": 40.7128,
        "current_longitude": -74.0060,
        "last_seen": "2024-01-01T12:00:00Z",
        "assigned_driver_name": "Test Driver",
        "metadata": {"model": "Ford F-150", "year": 2020},
    }


@pytest.fixture
def sample_personnel_data() -> None:
    """Sample personnel data for testing."""
    return {
        "name": "Test Personnel",
        "role": "operator",
        "status": "active",
        "site_id": "550e8400-e29b-41d4-a716-446655440001",
        "contact_info": {"email": "test@example.com", "phone": "555-0123"},
        "metadata": {"department": "operations"},
    }
