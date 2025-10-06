#!/usr/bin/env python3
"""
Debug test to see the actual error
"""
import pytest
import asyncio
from fastapi.testclient import TestClient
from main import app
from config.database import get_db, Base
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
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

async def setup_test_db():
    """Setup test database"""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def cleanup_test_db():
    """Cleanup test database"""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

async def test_debug():
    """Debug test to see the actual error"""
    await setup_test_db()
    
    try:
        # Create a test client with database dependency override
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
        
        with TestClient(app) as client:
            sample_alert_data = {
                "alert_type": "battery_low",
                "severity": "warning",
                "asset_id": "test-asset-1",
                "asset_name": "Test Asset",
                "message": "Battery level is low",
                "description": "Asset battery has dropped below 20%",
                "triggered_at": "2024-01-01T12:00:00Z"
            }
            
            response = client.post("/api/v1/alerts", json=sample_alert_data)
            print(f'Status: {response.status_code}')
            print(f'Response: {response.text}')
            
            if response.status_code != 200:
                print(f'Error details: {response.json()}')
        
        # Restore original lifespan
        app.router.lifespan_context = original_lifespan
        app.dependency_overrides.clear()
        
    finally:
        await cleanup_test_db()

if __name__ == "__main__":
    asyncio.run(test_debug())