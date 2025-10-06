"""
Database configuration and connection management
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import create_engine
from config.settings import settings
import logging

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
    if settings.environment.value == "test":
        from tests.conftest import TestSessionLocal
        async with TestSessionLocal() as session:
            try:
                yield session
            except Exception as e:
                logger.error(f"Database session error: {e}")
                await session.rollback()
                raise
            finally:
                await session.close()
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
    if settings.environment.value == "test":
        from tests.conftest import test_engine
        async with test_engine.begin() as conn:
            # Import all models to ensure they're registered
            from modules.shared.database import models

            await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables created successfully")
    else:
        async with async_engine.begin() as conn:
            # Import all models to ensure they're registered
            from modules.shared.database import models

            await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables created successfully")


async def close_db():
    """Close database connections"""
    await async_engine.dispose()
    logger.info("Database connections closed")
