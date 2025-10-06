#!/usr/bin/env python3
"""
Startup script for Asset Tag Backend
"""
import asyncio
import logging
import sys
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from config.settings import settings

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


async def start_services() -> None:
    """Start all backend services"""
    logger.info("Starting Asset Tag Backend services...")

    # Start observation consumer
    if settings.environment == "local":
        logger.info("Starting mock observation producer for local development")
        from streaming.kinesis_consumer import start_mock_producer

        await start_mock_producer()
    else:
        logger.info("Starting observation consumer")
        from streaming.kinesis_consumer import start_observation_consumer

        await start_observation_consumer()


if __name__ == "__main__":
    try:
        asyncio.run(start_services())
    except KeyboardInterrupt:
        logger.info("Shutting down services...")
    except Exception as e:
        logger.error(f"Error starting services: {e}")
        sys.exit(1)
