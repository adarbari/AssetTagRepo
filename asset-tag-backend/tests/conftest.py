"""
Pytest configuration and fixtures
"""
import asyncio
from typing import AsyncGenerator, Generator

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from config.database import Base, get_db
from config.settings import settings
from main import app

# Import all models to ensure they're registered with SQLAlchemy
from modules.shared.database import models

# Test database URL - use file-based SQLite to avoid UUID issues
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test_integration.db"

# Create test engine with SQLite-specific configuration
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    future=True,
    connect_args={"check_same_thread": False},
)

# Monkey patch UUID type for SQLite compatibility
from sqlalchemy.dialects.sqlite.base import SQLiteTypeCompiler
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.types import TypeDecorator, String
import uuid

class SQLiteUUID(TypeDecorator):
    """UUID type for SQLite compatibility"""
    impl = String
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif isinstance(value, uuid.UUID):
            return str(value)
        else:
            return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            return uuid.UUID(value)

def visit_UUID(self, type_, **kw):
    return "TEXT"

SQLiteTypeCompiler.visit_UUID = visit_UUID

# Replace UUID type with SQLiteUUID for testing
import sqlalchemy.dialects.postgresql
sqlalchemy.dialects.postgresql.UUID = SQLiteUUID

# Also patch the base model to use String instead of UUID for testing
import modules.shared.database.base
original_uuid_mixin = modules.shared.database.base.UUIDMixin

class TestUUIDMixin:
    """Test UUID mixin that uses String instead of UUID"""
    from sqlalchemy import Column, String
    import uuid
    
    @property
    def id(cls):
        return Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

modules.shared.database.base.UUIDMixin = TestUUIDMixin

# Create test session factory
TestSessionLocal = sessionmaker(
    test_engine, class_=AsyncSession, expire_on_commit=False
)


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


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

    # Create a test app with minimal lifespan
    from contextlib import asynccontextmanager

    from fastapi import FastAPI

    @asynccontextmanager
    async def test_lifespan(app):
        # Create tables for testing
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        yield
        # Clean up tables after testing
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)

    # Create a new test app instance with same configuration as main app
    test_app = FastAPI(
        title=app.title,
        description=app.description,
        version=app.version,
        docs_url=app.docs_url,
        redoc_url=app.redoc_url,
        lifespan=test_lifespan,
    )

    # Copy all routes from the main app
    for route in app.routes:
        test_app.router.routes.append(route)

    # Copy middleware
    for middleware in app.user_middleware:
        test_app.add_middleware(middleware.cls, **middleware.kwargs)

    from fastapi.testclient import TestClient

    with TestClient(test_app) as tc:
        yield tc

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
        "current_site_id": "550e8400-e29b-41d4-a716-446655440001",
        "assigned_to_user_id": "550e8400-e29b-41d4-a716-446655440002",
        "battery_level": 85,
        "last_seen": "2024-01-01T12:00:00Z",
        "asset_metadata": {"model": "CAT 320", "year": 2020},
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
        "metadata": {"project_id": "PROJ-001"},
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
        "metadata": {"signal_quality": "good"},
    }


@pytest.fixture
def sample_alert_data():
    """Sample alert data for testing."""
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
        "site_id": "test-site-1",
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
        "description": "Regular maintenance check",
    }


@pytest.fixture
def sample_geofence_data():
    """Sample geofence data for testing."""
    return {
        "name": "Test Geofence",
        "geofence_type": "polygon",
        "status": "active",
        "coordinates": [
            [-74.0060, 40.7128],
            [-74.0050, 40.7128],
            [-74.0050, 40.7138],
            [-74.0060, 40.7138],
            [-74.0060, 40.7128],
        ],
        "site_id": "test-site-1",
        "geofence_classification": "authorized",
    }
