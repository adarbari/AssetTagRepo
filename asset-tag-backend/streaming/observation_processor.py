"""
Observation processing pipeline
"""

import asyncio
import logging
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Any, Dict, List

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from config.cache import get_cache
from config.database import get_db
from modules.assets.models import Asset
from modules.gateways.models import Gateway
from modules.locations.estimator import GatewayObservation, LocationEstimator
from modules.observations.models import Observation

logger = logging.getLogger(__name__)


class ObservationProcessor:
    """Process and store Bluetooth observations"""

    def __init__(self) -> None:
        self.location_estimator = None
        self.observation_buffer = defaultdict(list)  # asset_id -> observations
        self.buffer_lock = asyncio.Lock()

    async def process_observation(self, observation_data: Dict[str, Any]) -> None:
        """Process a single observation"""
        try:
            # Get database session
            async for db in get_db():
                # Store the observation
                await self._store_observation(db, observation_data)

                # Add to buffer for location estimation
                await self._add_to_buffer(observation_data)

                # Update asset battery level
                await self._update_asset_battery(db, observation_data)

                break  # Exit the async generator

        except Exception as e:
            logger.error(f"Error processing observation: {e}")

    async def _store_observation(
        self, db: AsyncSession, observation_data: Dict[str, Any]
    ):
        """Store observation in database"""
        try:
            # Get asset and gateway IDs
            asset_id = await self._get_asset_id(db, observation_data["asset_tag_id"])
            gateway_id = await self._get_gateway_id(db, observation_data["gateway_id"])

            if not asset_id or not gateway_id:
                logger.warning(f"Asset or gateway not found: {observation_data}")
                return

            # Create observation record
            observation = Observation(
                organization_id="00000000-0000-0000-0000-000000000000",  # Default org for now
                asset_id=asset_id,
                gateway_id=gateway_id,
                rssi=observation_data["rssi"],
                battery_level=observation_data.get("battery_level"),
                temperature=observation_data.get("temperature"),
                observed_at=datetime.fromisoformat(observation_data["timestamp"]),
                received_at=datetime.now(),
                metadata=observation_data.get("metadata", {}),
            )

            db.add(observation)
            await db.commit()

            logger.debug(
                f"Stored observation for asset {asset_id} from gateway {gateway_id}"
            )

        except Exception as e:
            logger.error(f"Error storing observation: {e}")
            await db.rollback()

    async def _get_asset_id(self, db: AsyncSession, asset_tag_id: str) -> str:
        """Get asset ID from asset tag ID"""
        try:
            result = await db.execute(
                select(Asset.id).where(Asset.serial_number == asset_tag_id)
            )
            asset_id = result.scalar_one_or_none()
            return str(asset_id) if asset_id else None
        except Exception as e:
            logger.error(f"Error getting asset ID for {asset_tag_id}: {e}")
            return None

    async def _get_gateway_id(self, db: AsyncSession, gateway_id: str) -> str:
        """Get gateway ID from gateway ID string"""
        try:
            result = await db.execute(
                select(Gateway.id).where(Gateway.gateway_id == gateway_id)
            )
            gateway_id = result.scalar_one_or_none()
            return str(gateway_id) if gateway_id else None
        except Exception as e:
            logger.error(f"Error getting gateway ID for {gateway_id}: {e}")
            return None

    async def _update_asset_battery(
        self, db: AsyncSession, observation_data: Dict[str, Any]
    ):
        """Update asset battery level"""
        try:
            battery_level = observation_data.get("battery_level")
            if battery_level is not None:
                asset_id = await self._get_asset_id(
                    db, observation_data["asset_tag_id"]
                )
                if asset_id:
                    await db.execute(
                        update(Asset)
                        .where(Asset.id == asset_id)
                        .values(battery_level=battery_level)
                    )
                    await db.commit()

        except Exception as e:
            logger.error(f"Error updating asset battery: {e}")

    async def _add_to_buffer(self, observation_data: Dict[str, Any]) -> None:
        """Add observation to buffer for location estimation"""
        async with self.buffer_lock:
            asset_id = observation_data["asset_tag_id"]
            self.observation_buffer[asset_id].append(observation_data)

            # If we have enough observations, trigger location estimation
            if len(self.observation_buffer[asset_id]) >= 3:
                await self._process_location_estimation(asset_id)

    async def _process_location_estimation(self, asset_id: str) -> None:
        """Process location estimation for an asset"""
        try:
            async with self.buffer_lock:
                observations = self.observation_buffer[asset_id]
                self.observation_buffer[asset_id] = []  # Clear buffer

            if not observations:
                return

            # Get cache manager
            cache = await get_cache()
            if not self.location_estimator:
                self.location_estimator = LocationEstimator(cache)

            # Convert to GatewayObservation objects
            gateway_observations = []
            async for db in get_db():
                for obs_data in observations:
                    gateway_id = await self._get_gateway_id(db, obs_data["gateway_id"])
                    if gateway_id:
                        # Get gateway location
                        gateway = await db.get(Gateway, gateway_id)
                        if gateway:
                            gateway_obs = GatewayObservation(
                                gateway_id=gateway_id,
                                latitude=float(gateway.latitude),
                                longitude=float(gateway.longitude),
                                rssi=obs_data["rssi"],
                                timestamp=datetime.fromisoformat(obs_data["timestamp"]),
                                battery_level=obs_data.get("battery_level"),
                                temperature=obs_data.get("temperature"),
                            )
                            gateway_observations.append(gateway_obs)
                break  # Exit the async generator

            if gateway_observations:
                # Estimate location
                estimated_location = await self.location_estimator.estimate_location(
                    asset_id, gateway_observations
                )

                # Store estimated location
                await self._store_estimated_location(estimated_location)

                # Trigger geofence evaluation
                await self._trigger_geofence_evaluation(estimated_location)

        except Exception as e:
            logger.error(f"Error processing location estimation: {e}")

    async def _store_estimated_location(self, location) -> None:
        """Store estimated location in database"""
        try:
            async for db in get_db():
                from modules.locations.models import EstimatedLocation

                estimated_location = EstimatedLocation(
                    organization_id="00000000-0000-0000-0000-000000000000",  # Default org
                    asset_id=location.asset_id,
                    latitude=location.latitude,
                    longitude=location.longitude,
                    altitude=location.altitude,
                    uncertainty_radius=location.uncertainty_radius,
                    confidence=location.confidence,
                    algorithm=location.algorithm,
                    estimated_at=location.timestamp,
                    gateway_count=location.gateway_count,
                    gateway_ids=location.gateway_ids,
                    speed=location.speed,
                    bearing=location.bearing,
                    distance_from_previous=location.distance_from_previous,
                    signal_quality_score=location.signal_quality_score,
                    rssi_variance=location.rssi_variance,
                    metadata=location.metadata or {},
                )

                db.add(estimated_location)
                await db.commit()

                logger.debug(f"Stored estimated location for asset {location.asset_id}")
                break

        except Exception as e:
            logger.error(f"Error storing estimated location: {e}")

    async def _trigger_geofence_evaluation(self, location) -> None:
        """Trigger geofence evaluation for the location"""
        try:
            # Import here to avoid circular imports
            from streaming.geofence_evaluator import GeofenceEvaluator

            evaluator = GeofenceEvaluator()
            await evaluator.evaluate_location(location.asset_id, location)

        except Exception as e:
            logger.error(f"Error triggering geofence evaluation: {e}")


# Background task to process buffered observations
async def process_buffered_observations() -> None:
    """Background task to process any remaining buffered observations"""
    processor = ObservationProcessor()

    while True:
        try:
            # Process any observations that have been in buffer for too long
            current_time = datetime.now()
            cutoff_time = current_time - timedelta(minutes=1)  # 1 minute window

            # This would be implemented to process stale observations
            # For now, just sleep
            await asyncio.sleep(30)  # Check every 30 seconds

        except Exception as e:
            logger.error(f"Error in background observation processing: {e}")
            await asyncio.sleep(60)  # Wait longer on error
