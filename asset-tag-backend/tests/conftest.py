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

    # Clean up - drop tables in reverse dependency order to avoid circular dependency issues
    async with test_engine.begin() as conn:
        # Drop tables in specific order to avoid circular dependencies
        drop_order = [
            "geofence_events", "alerts", "estimated_locations", "observations", 
            "maintenance_records", "job_assets", "vehicle_asset_pairings", 
            "assets", "jobs", "geofences", "sites", "vehicles", "users", 
            "organizations", "audit_logs"
        ]
        
        for table in drop_order:
            await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text(f"DROP TABLE IF EXISTS {table} CASCADE")))


@pytest_asyncio.fixture(scope="function")
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """Create an async test client with database override."""
    
    # Clean up database before each test
    async with test_engine.begin() as conn:
        # Drop tables in specific order to avoid circular dependencies
        drop_order = [
            "geofence_events", "alerts", "estimated_locations", "observations", 
            "maintenance_records", "job_assets", "vehicle_asset_pairings", 
            "assets", "jobs", "geofences", "sites", "vehicles", "users", 
            "organizations", "audit_logs", "gateways", "personnel", "personnel_activities"
        ]
        
        for table in drop_order:
            await conn.run_sync(lambda sync_conn: sync_conn.execute(sa.text(f"DROP TABLE IF EXISTS {table} CASCADE")))
        
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
def client() -> TestClient:
    """Create a synchronous test client for backward compatibility."""
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


@pytest.fixture
async def test_organization(db_session) -> None:
    """Create a test organization."""
    from modules.shared.database.models import Organization
    
    org = Organization(
        id=uuid.UUID("550e8400-e29b-41d4-a716-446655440003"),
        name="Test Organization",
        is_active=True
    )
    db_session.add(org)
    await db_session.commit()
    return org


@pytest.fixture
async def test_user(db_session, test_organization) -> None:
    """Create a test user."""
    from modules.shared.database.models import User
    
    # Await the async fixture
    organization = await test_organization
    
    user = User(
        id=uuid.UUID("550e8400-e29b-41d4-a716-446655440002"),
        organization_id=organization.id,
        username="testuser",
        email="test@example.com",
        full_name="Test User",
        hashed_password="hashed_password_here",
        role="operator",
        is_active=True
    )
    db_session.add(user)
    await db_session.commit()
    return user


@pytest.fixture
async def test_site(db_session, test_organization) -> None:
    """Create a test site."""
    from modules.sites.models import Site
    
    # Await the async fixture
    organization = await test_organization
    
    site = Site(
        id=uuid.UUID("550e8400-e29b-41d4-a716-446655440001"),
        organization_id=organization.id,
        name="Test Site",
        location="Test Location",
        status="active",
        address="123 Test St",
        latitude=40.7128,
        longitude=-74.0060
    )
    db_session.add(site)
    await db_session.commit()
    return site


@pytest.fixture
async def test_asset(db_session, test_organization, test_site, test_user) -> None:
    """Create a test asset."""
    from modules.assets.models import Asset

    # Await the async fixtures
    organization = await test_organization
    site = await test_site
    user = await test_user

    asset = Asset(
        id=uuid.UUID("550e8400-e29b-41d4-a716-446655440000"),
        organization_id=organization.id,
        name="Test Asset",
        serial_number="TEST-001",
        asset_type="excavator",
        status="active",
        current_site_id=site.id,
        assigned_to_user_id=user.id,
        battery_level=85
    )
    db_session.add(asset)
    await db_session.commit()
    return asset


# Synchronous versions of test fixtures for integration tests
@pytest.fixture
def test_organization_sync():
    """Create a test organization for sync tests."""
    from modules.shared.database.models import Organization
    import uuid
    from datetime import datetime
    
    organization = Organization(
            id=uuid.uuid4(),
            name=f"Test Organization {uuid.uuid4().hex[:8]}",
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    
    # Add to database using sync session
    from config.test_database import TestSessionLocalSync
    with TestSessionLocalSync() as session:
        session.add(organization)
        session.commit()
        session.refresh(organization)
        return organization


@pytest.fixture
def test_user_sync(test_organization_sync):
    """Create a test user for sync tests."""
    from modules.shared.database.models import User
    import uuid
    from datetime import datetime
    
    user = User(
        id=uuid.uuid4(),
        organization_id=test_organization_sync.id,
        username=f"testuser_{uuid.uuid4().hex[:8]}",
        email=f"test_{uuid.uuid4().hex[:8]}@example.com",
        full_name="Test User",
        role="operator",
        is_active=True,
        hashed_password="hashed_password_here",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    from config.test_database import TestSessionLocalSync
    with TestSessionLocalSync() as session:
        session.add(user)
        session.commit()
        session.refresh(user)
        return user


@pytest.fixture
def test_site_sync(test_organization_sync):
    """Create a test site for sync tests."""
    from modules.sites.models import Site
    import uuid
    from datetime import datetime
    
    site = Site(
        id=uuid.uuid4(),
        organization_id=test_organization_sync.id,
        name=f"Test Site {uuid.uuid4().hex[:8]}",
        location="Test Location",
        address="123 Test St",
        latitude=40.7128,
        longitude=-74.0060,
        status="active",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    from config.test_database import TestSessionLocalSync
    with TestSessionLocalSync() as session:
        session.add(site)
        session.commit()
        session.refresh(site)
        return site


@pytest.fixture
def test_asset_sync(test_organization_sync, test_site_sync, test_user_sync):
    """Create a test asset for sync tests."""
    from modules.assets.models import Asset
    import uuid
    from datetime import datetime
    
    asset = Asset(
        id=uuid.uuid4(),
        organization_id=test_organization_sync.id,
        name=f"Test Asset {uuid.uuid4().hex[:8]}",
        serial_number=f"TEST-{uuid.uuid4().hex[:8]}",
        asset_type="excavator",
        status="active",
        current_site_id=test_site_sync.id,
        assigned_to_user_id=test_user_sync.id,
        battery_level=85,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    from config.test_database import TestSessionLocalSync
    with TestSessionLocalSync() as session:
        session.add(asset)
        session.commit()
        session.refresh(asset)
        return asset
