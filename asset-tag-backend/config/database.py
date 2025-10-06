"""
Database configuration and connection management
"""
import logging
import os

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base

from config.settings import settings

# Check if we're in test environment early
IS_TEST_ENV = os.getenv("ASSET_TAG_ENVIRONMENT") == "test"

logger = logging.getLogger(__name__)

# Base class for all models
Base = declarative_base()

# Async engine for FastAPI
async_engine = create_async_engine(
    settings.database_url,
    echo=settings.environment == "local",
    pool_pre_ping=True,
    pool_recycle=300,
)

# Sync engine for Alembic migrations
sync_engine = create_engine(
    settings.sync_database_url,
    echo=settings.environment == "local",
    pool_pre_ping=True,
    pool_recycle=300,
)

# Session factory
AsyncSessionLocal = async_sessionmaker(
    async_engine, class_=AsyncSession, expire_on_commit=False
)


async def get_db() -> AsyncSession:
    """Dependency to get database session"""
    # Use test session if in test environment
    if IS_TEST_ENV:
        from config.test_database import get_test_db

        async for session in get_test_db():
            yield session
    else:
        async with AsyncSessionLocal() as session:
            try:
                yield session
            except Exception as e:
                logger.error(f"Database session error: {e}")
                await session.rollback()
                raise
            finally:
                await session.close()


async def init_db():
    """Initialize database tables"""
    # Use test engine if in test environment
    if IS_TEST_ENV:
        from config.test_database import init_test_db

        await init_test_db()
        logger.info("Database tables created successfully")
    else:
        async with async_engine.begin() as conn:
            # Import all models to ensure they're registered
            from modules.shared.database import models

            await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables created successfully")


async def close_db():
    """Close database connections"""
    if IS_TEST_ENV:
        from config.test_database import close_test_db

        await close_test_db()
    else:
        await async_engine.dispose()
    logger.info("Database connections closed")
