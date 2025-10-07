"""
Test database configuration module
Separate from main database.py to avoid circular imports
"""

import os

from sqlalchemy.ext.asyncio import (AsyncSession, async_sessionmaker,
                                    create_async_engine)
from sqlalchemy.orm import declarative_base

from config.database import Base

# Test database URL - use PostgreSQL to support UUID types
TEST_DATABASE_URL = "postgresql+asyncpg://dev_user:dev_pass@localhost:5432/asset_tag"

# Create test engine with PostgreSQL configuration
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    future=True,
)

# Create test session factory
TestSessionLocal = async_sessionmaker(
    test_engine, class_=AsyncSession, expire_on_commit=False
)


async def get_test_db() -> AsyncSession:
    """Get test database session"""
    async with TestSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_test_db() -> None:
    """Initialize test database tables"""
    async with test_engine.begin() as conn:
        # Import all models to ensure they're registered
        from modules.shared.database import models

        await conn.run_sync(Base.metadata.create_all)


async def close_test_db() -> None:
    """Close test database connections"""
    await test_engine.dispose()
