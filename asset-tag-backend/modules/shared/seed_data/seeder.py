"""
Main seeder orchestration module
Coordinates the seeding of all data types in the correct order
"""

import logging
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from .helpers import check_if_database_empty, get_seed_data_summary
from .seed_assets import seed_organizations, seed_users, seed_sites, seed_assets, seed_geofences
from .seed_alerts import seed_alerts
from .seed_vehicles import seed_vehicles, seed_vehicle_asset_pairings
from .seed_jobs import seed_jobs, seed_job_assets, seed_job_alerts
from .seed_issues import seed_issues
from .seed_reports import seed_compliance_records
from .seed_settings import seed_additional_users

logger = logging.getLogger(__name__)


async def nuke_database(session: AsyncSession) -> None:
    """
    Drop all data in correct dependency order to avoid foreign key constraints
    """
    logger.info("Starting database nuke operation...")
    
    # Define the order to delete data (child tables first)
    delete_order = [
        "geofence_events",
        "alerts", 
        "estimated_locations",
        "observations",
        "maintenance_records",
        "job_assets",
        "vehicle_asset_pairings",
        "job_alerts",
        "issues",
        "compliance_records",
        "assets",
        "jobs", 
        "geofences",
        "sites",
        "vehicles",
        "users",
        "organizations",
        "audit_logs"
    ]
    
    for table in delete_order:
        try:
            await session.execute(text(f"DELETE FROM {table}"))
            logger.debug(f"Cleared table: {table}")
        except Exception as e:
            # Table might not exist, which is fine
            logger.debug(f"Could not clear table {table}: {e}")
    
    await session.commit()
    logger.info("Database nuke operation completed")


async def seed_all(session: AsyncSession, force: bool = False) -> Dict[str, Any]:
    """
    Main orchestrator for seeding all data
    
    Args:
        session: Database session
        force: If True, skip empty database check and force seeding
    
    Returns:
        Dictionary with summary of seeded data
    """
    logger.info("Starting seed data operation...")
    
    # Check if database is empty (unless forced)
    if not force:
        is_empty = await check_if_database_empty(session)
        if not is_empty:
            logger.info("Database is not empty, skipping seed operation")
            return await get_seed_data_summary(session)
    
    try:
        # Step 1: Create organization
        logger.info("Seeding organizations...")
        org_map = await seed_organizations(session)
        org_id = list(org_map.values())[0]  # Get the first (and only) org ID
        
        # Step 2: Create users and personnel
        logger.info("Seeding users...")
        user_map = await seed_users(session, org_id)
        
        # Step 3: Create additional team members
        logger.info("Seeding additional team members...")
        additional_users = await seed_additional_users(session, org_id)
        user_map.update(additional_users)
        
        # Step 4: Create sites
        logger.info("Seeding sites...")
        site_map = await seed_sites(session, org_id, user_map)
        
        # Step 5: Create assets
        logger.info("Seeding assets...")
        asset_map = await seed_assets(session, org_id, site_map, user_map)
        
        # Step 6: Create geofences
        logger.info("Seeding geofences...")
        geofence_map = await seed_geofences(session, org_id, site_map)
        
        # Step 7: Create vehicles
        logger.info("Seeding vehicles...")
        vehicle_map = await seed_vehicles(session, org_id, user_map)
        
        # Step 8: Create vehicle-asset pairings
        logger.info("Seeding vehicle-asset pairings...")
        pairing_map = await seed_vehicle_asset_pairings(session, vehicle_map, asset_map, user_map)
        
        # Step 9: Create jobs
        logger.info("Seeding jobs...")
        job_map = await seed_jobs(session, org_id, site_map, user_map)
        
        # Step 10: Create job-asset relationships
        logger.info("Seeding job-asset relationships...")
        job_asset_map = await seed_job_assets(session, job_map, asset_map)
        
        # Step 11: Create job alerts
        logger.info("Seeding job alerts...")
        job_alert_map = await seed_job_alerts(session, job_map)
        
        # Step 12: Create alerts
        logger.info("Seeding alerts...")
        alert_map = await seed_alerts(session, asset_map)
        
        # Step 13: Create issues
        logger.info("Seeding issues...")
        issue_map = await seed_issues(session, org_id, asset_map, user_map)
        
        # Step 14: Create compliance records
        logger.info("Seeding compliance records...")
        compliance_map = await seed_compliance_records(session, org_id, asset_map)
        
        # Commit all changes
        await session.commit()
        
        # Get summary
        summary = await get_seed_data_summary(session)
        
        logger.info("Seed data operation completed successfully")
        logger.info(f"Seeded data summary: {summary}")
        
        return summary
        
    except Exception as e:
        logger.error(f"Error during seeding: {e}")
        await session.rollback()
        raise


async def seed_test_data(session: AsyncSession) -> Dict[str, Any]:
    """
    Seed data specifically for test environment
    Always nukes and reseeds
    """
    logger.info("Seeding test data (nuke and reseed)...")
    
    # Always nuke test database
    await nuke_database(session)
    
    # Seed all data
    return await seed_all(session, force=True)


async def seed_beta_data(session: AsyncSession) -> Dict[str, Any]:
    """
    Seed data for beta environment
    Only seeds if database is empty
    """
    logger.info("Seeding beta data (only if empty)...")
    
    # Check if database is empty
    is_empty = await check_if_database_empty(session)
    if not is_empty:
        logger.info("Beta database is not empty, skipping seed operation")
        return await get_seed_data_summary(session)
    
    # Seed all data
    return await seed_all(session, force=False)


async def refresh_beta_data(session: AsyncSession) -> Dict[str, Any]:
    """
    Refresh beta data by nuking and reseeding
    Used by manual refresh script
    """
    logger.info("Refreshing beta data (nuke and reseed)...")
    
    # Always nuke beta database
    await nuke_database(session)
    
    # Seed all data
    return await seed_all(session, force=True)
