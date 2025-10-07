#!/usr/bin/env python3
"""
Manual Beta Data Refresh Script

This script allows you to manually refresh the beta environment data
by nuking all existing data and reseeding with fresh mock data.

Usage:
    python scripts/refresh_beta_data.py

Environment Variables:
    ASSET_TAG_ENVIRONMENT=beta (required)
"""

import asyncio
import logging
import os
import sys
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from config.database import get_db
from config.settings import settings, Environment
from modules.shared.seed_data.seeder import refresh_beta_data, get_seed_data_summary

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def main():
    """Main function to refresh beta data"""
    
    # Check environment
    if settings.environment != Environment.BETA:
        logger.error("This script can only be run in BETA environment")
        logger.error(f"Current environment: {settings.environment}")
        logger.error("Set ASSET_TAG_ENVIRONMENT=beta and try again")
        sys.exit(1)
    
    logger.info("=" * 60)
    logger.info("BETA DATA REFRESH SCRIPT")
    logger.info("=" * 60)
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Database: {settings.database_url}")
    logger.info("")
    
    # Get current data summary
    logger.info("Getting current data summary...")
    async with get_db() as session:
        try:
            current_summary = await get_seed_data_summary(session)
            logger.info("Current data in database:")
            for entity, count in current_summary.items():
                logger.info(f"  {entity}: {count}")
        except Exception as e:
            logger.warning(f"Could not get current data summary: {e}")
            current_summary = {}
    
    logger.info("")
    
    # Confirmation prompt
    print("\n" + "=" * 60)
    print("⚠️  WARNING: This will DELETE ALL DATA in the beta database!")
    print("=" * 60)
    print("This operation will:")
    print("  • Delete all existing assets, sites, users, jobs, alerts, etc.")
    print("  • Reseed the database with fresh mock data")
    print("  • Cannot be undone")
    print("")
    
    # Check if there's any data to delete
    total_items = sum(current_summary.values())
    if total_items > 0:
        print(f"Current database contains {total_items} total items.")
        print("")
    
    response = input("Are you sure you want to continue? Type 'yes' to confirm: ").strip().lower()
    
    if response != 'yes':
        logger.info("Operation cancelled by user")
        sys.exit(0)
    
    logger.info("")
    logger.info("Starting data refresh operation...")
    
    # Perform the refresh
    try:
        async with get_db() as session:
            summary = await refresh_beta_data(session)
            
        logger.info("")
        logger.info("✅ Data refresh completed successfully!")
        logger.info("")
        logger.info("New data summary:")
        for entity, count in summary.items():
            logger.info(f"  {entity}: {count}")
        
        total_new = sum(summary.values())
        logger.info(f"")
        logger.info(f"Total items seeded: {total_new}")
        logger.info("")
        logger.info("🎉 Beta environment is now ready with fresh data!")
        
    except Exception as e:
        logger.error(f"❌ Data refresh failed: {e}")
        logger.error("Check the logs above for details")
        sys.exit(1)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("\nOperation cancelled by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        sys.exit(1)
