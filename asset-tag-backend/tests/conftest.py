"""
Test configuration and fixtures
"""
import pytest
import asyncio
from typing import AsyncGenerator, Generator
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool
import uuid
from datetime import datetime, timedelta

from main import app
from config.database import get_db, Base
from modules.shared.database.models import Organization, User


# Test database URL (using SQLite for testing)
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

# Create test engine
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Create test session factory
TestSessionLocal = async_sessionmaker(
    test_engine, class_=AsyncSession, expire_on_commit=False
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
    
    # Drop tables
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(scope="function")
def client(db_session: AsyncSession) -> TestClient:
    """Create a test client with database session override."""
    
    def override_get_db():
        return db_session
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
async def test_organization(db_session: AsyncSession) -> Organization:
    """Create a test organization."""
    org = Organization(
        id=uuid.uuid4(),
        name="Test Organization",
        domain="test.com",
        settings={"test": True},
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db_session.add(org)
    await db_session.commit()
    await db_session.refresh(org)
    return org


@pytest.fixture
async def test_user(db_session: AsyncSession, test_organization: Organization) -> User:
    """Create a test user."""
    user = User(
        id=uuid.uuid4(),
        organization_id=test_organization.id,
        email="test@test.com",
        username="testuser",
        full_name="Test User",
        hashed_password="hashed_password",
        is_active=True,
        is_superuser=False,
        role="admin",
        preferences={"theme": "dark"},
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user: User) -> dict:
    """Create authentication headers for test user."""
    # In a real implementation, you would generate a proper JWT token
    return {"Authorization": f"Bearer test_token_{test_user.id}"}


@pytest.fixture
def sample_asset_data() -> dict:
    """Sample asset data for testing."""
    return {
        "name": "Test Asset",
        "serial_number": "TEST-001",
        "asset_type": "sensor",
        "status": "active",
        "current_site_id": str(uuid.uuid4()),
        "location_description": "Test Location",
        "battery_level": 85,
        "temperature": 22.5,
        "movement": False,
        "manufacturer": "Test Corp",
        "model": "Test Model",
        "metadata": {"test": True}
    }


@pytest.fixture
def sample_site_data() -> dict:
    """Sample site data for testing."""
    return {
        "name": "Test Site",
        "location": "Test Location",
        "area": "Test Area",
        "status": "active",
        "manager_name": "Test Manager",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "radius": 100,
        "tolerance": 10,
        "address": "123 Test St, Test City, TC 12345",
        "phone": "+1-555-0123",
        "email": "test@testsite.com",
        "description": "Test site description",
        "metadata": {"test": True}
    }


@pytest.fixture
def sample_gateway_data() -> dict:
    """Sample gateway data for testing."""
    return {
        "name": "Test Gateway",
        "gateway_id": "GW-TEST-001",
        "site_id": str(uuid.uuid4()),
        "latitude": 40.7128,
        "longitude": -74.0060,
        "status": "active",
        "is_online": True,
        "battery_level": 90,
        "firmware_version": "1.0.0",
        "metadata": {"test": True}
    }


@pytest.fixture
def sample_observation_data() -> dict:
    """Sample observation data for testing."""
    return {
        "asset_id": str(uuid.uuid4()),
        "gateway_id": str(uuid.uuid4()),
        "rssi": -65,
        "battery_level": 85,
        "temperature": 22.5,
        "observed_at": datetime.utcnow().isoformat(),
        "signal_quality": "good",
        "noise_level": -80,
        "metadata": {"test": True}
    }


@pytest.fixture
def sample_geofence_data() -> dict:
    """Sample geofence data for testing."""
    return {
        "name": "Test Geofence",
        "description": "Test geofence description",
        "geofence_type": "circular",
        "status": "active",
        "center_latitude": 40.7128,
        "center_longitude": -74.0060,
        "radius": 100,
        "site_id": str(uuid.uuid4()),
        "alert_on_entry": True,
        "alert_on_exit": True,
        "geofence_classification": "authorized",
        "tolerance": 10,
        "metadata": {"test": True}
    }


@pytest.fixture
def sample_alert_data() -> dict:
    """Sample alert data for testing."""
    return {
        "alert_type": "battery_low",
        "severity": "warning",
        "status": "active",
        "title": "Low Battery Alert",
        "message": "Asset battery level is below 20%",
        "asset_id": str(uuid.uuid4()),
        "triggered_at": datetime.utcnow().isoformat(),
        "metadata": {"test": True}
    }


@pytest.fixture
def sample_job_data() -> dict:
    """Sample job data for testing."""
    return {
        "name": "Test Job",
        "description": "Test job description",
        "job_type": "maintenance",
        "status": "pending",
        "priority": "medium",
        "scheduled_start": (datetime.utcnow() + timedelta(hours=1)).isoformat(),
        "scheduled_end": (datetime.utcnow() + timedelta(hours=3)).isoformat(),
        "assigned_to_user_id": str(uuid.uuid4()),
        "site_id": str(uuid.uuid4()),
        "location_description": "Test location",
        "estimated_duration_hours": 2.0,
        "estimated_cost": 100.0,
        "metadata": {"test": True}
    }


@pytest.fixture
def sample_maintenance_data() -> dict:
    """Sample maintenance data for testing."""
    return {
        "asset_id": str(uuid.uuid4()),
        "asset_name": "Test Asset",
        "maintenance_type": "preventive",
        "status": "scheduled",
        "priority": "medium",
        "scheduled_date": (datetime.utcnow() + timedelta(days=7)).date().isoformat(),
        "assigned_to_user_id": str(uuid.uuid4()),
        "description": "Test maintenance description",
        "duration_hours": 2.0,
        "cost": 150.0,
        "location": "Test location",
        "category": "routine",
        "metadata": {"test": True}
    }


@pytest.fixture
def sample_personnel_data() -> dict:
    """Sample personnel data for testing."""
    return {
        "name": "Test Personnel",
        "role": "technician",
        "status": "on-duty",
        "current_site_id": str(uuid.uuid4()),
        "email": "personnel@test.com",
        "phone": "+1-555-0124",
        "metadata": {"test": True}
    }


@pytest.fixture
def sample_vehicle_data() -> dict:
    """Sample vehicle data for testing."""
    return {
        "name": "Test Vehicle",
        "vehicle_type": "truck",
        "license_plate": "TEST-001",
        "status": "active",
        "current_latitude": 40.7128,
        "current_longitude": -74.0060,
        "assigned_driver_id": str(uuid.uuid4()),
        "assigned_driver_name": "Test Driver",
        "metadata": {"test": True}
    }


@pytest.fixture
def sample_checkin_data() -> dict:
    """Sample check-in data for testing."""
    return {
        "asset_id": str(uuid.uuid4()),
        "asset_name": "Test Asset",
        "action": "checkout",
        "checked_out_by": str(uuid.uuid4()),
        "expected_return_date": (datetime.utcnow() + timedelta(days=7)).date().isoformat(),
        "location": "Test location",
        "notes": "Test checkout",
        "metadata": {"test": True}
    }
