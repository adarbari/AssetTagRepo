"""
Test database configuration module
Separate from main database.py to avoid circular imports
"""
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from config.database import Base

# Test database URL - use file-based SQLite to avoid UUID issues
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test_integration.db"

# Create test engine with SQLite-specific configuration
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    future=True,
    connect_args={"check_same_thread": False},
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


async def init_test_db():
    """Initialize test database tables"""
    async with test_engine.begin() as conn:
        # Import all models to ensure they're registered
        from modules.shared.database import models
        
        await conn.run_sync(Base.metadata.create_all)


async def close_test_db():
    """Close test database connections"""
    await test_engine.dispose()
