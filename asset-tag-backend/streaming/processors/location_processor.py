"""
Enhanced location estimation processor
"""
import logging
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from collections import defaultdict, deque
import numpy as np

from config.database import get_db
from config.cache import get_cache
from modules.locations.estimator import LocationEstimator, GatewayObservation
from modules.locations.models import EstimatedLocation
from modules.assets.models import Asset
from modules.gateways.models import Gateway

logger = logging.getLogger(__name__)


class LocationProcessor:
    """Enhanced location estimation processor with buffering and parallelization"""
    
    def __init__(self, buffer_size: int = 10, processing_interval: float = 1.0):
        self.buffer_size = buffer_size
        self.processing_interval = processing_interval
        self.observation_buffers = defaultdict(lambda: deque(maxlen=buffer_size))
        self.location_estimator = None
        self.cache = None
        self.db = None
        self.processing_lock = asyncio.Lock()
        self.running = False
        self.processing_task = None
    
    async def _get_cache(self):
        """Get cache manager"""
        if not self.cache:
            self.cache = await get_cache()
        return self.cache
    
    async def _get_db(self):
        """Get database session"""
        if not self.db:
            self.db = await get_db()
        return self.db
    
    async def start(self):
        """Start the location processor"""
        if self.running:
            return
        
        self.running = True
        self.processing_task = asyncio.create_task(self._processing_loop())
        logger.info("Location processor started")
    
    async def stop(self):
        """Stop the location processor"""
        self.running = False
        if self.processing_task:
            self.processing_task.cancel()
            try:
                await self.processing_task
            except asyncio.CancelledError:
                pass
        logger.info("Location processor stopped")
    
    async def process_observation(self, observation_data: Dict[str, Any]):
        """Process a single observation and add to buffer"""
        try:
            asset_id = observation_data.get('asset_tag_id')
            if not asset_id:
                logger.warning("Observation missing asset_tag_id")
                return
            
            # Add to buffer
            async with self.processing_lock:
                self.observation_buffers[asset_id].append({
                    **observation_data,
                    'received_at': datetime.now()
                })
            
            logger.debug(f"Added observation to buffer for asset {asset_id}")
            
        except Exception as e:
            logger.error(f"Error processing observation: {e}")
    
    async def _processing_loop(self):
        """Main processing loop"""
        while self.running:
            try:
                await asyncio.sleep(self.processing_interval)
                
                if self.running:
                    await self._process_buffers()
                    
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in location processing loop: {e}")
                await asyncio.sleep(5)  # Wait before retrying
    
    async def _process_buffers(self):
        """Process all observation buffers"""
        try:
            async with self.processing_lock:
                # Get all assets with enough observations
                assets_to_process = []
                for asset_id, buffer in self.observation_buffers.items():
                    if len(buffer) >= 3:  # Minimum observations for trilateration
                        assets_to_process.append(asset_id)
                
                if not assets_to_process:
                    return
                
                # Process assets in parallel
                tasks = []
                for asset_id in assets_to_process:
                    task = asyncio.create_task(self._process_asset_location(asset_id))
                    tasks.append(task)
                
                # Wait for all tasks to complete
                if tasks:
                    await asyncio.gather(*tasks, return_exceptions=True)
                    
        except Exception as e:
            logger.error(f"Error processing buffers: {e}")
    
    async def _process_asset_location(self, asset_id: str):
        """Process location estimation for a specific asset"""
        try:
            # Get observations from buffer
            async with self.processing_lock:
                observations = list(self.observation_buffers[asset_id])
                self.observation_buffers[asset_id].clear()
            
            if not observations:
                return
            
            # Convert to GatewayObservation objects
            gateway_observations = await self._convert_to_gateway_observations(observations)
            
            if len(gateway_observations) < 3:
                logger.debug(f"Insufficient gateway observations for asset {asset_id}")
                return
            
            # Initialize location estimator if needed
            if not self.location_estimator:
                cache = await self._get_cache()
                self.location_estimator = LocationEstimator(cache)
            
            # Estimate location
            estimated_location = await self.location_estimator.estimate_location(
                asset_id, gateway_observations
            )
            
            if estimated_location:
                # Store estimated location
                await self._store_estimated_location(estimated_location)
                
                # Update cache
                await self._update_location_cache(asset_id, estimated_location)
                
                # Trigger downstream processing
                await self._trigger_downstream_processing(estimated_location)
                
                logger.debug(f"Processed location for asset {asset_id}")
            
        except Exception as e:
            logger.error(f"Error processing location for asset {asset_id}: {e}")
    
    async def _convert_to_gateway_observations(self, observations: List[Dict[str, Any]]) -> List[GatewayObservation]:
        """Convert observation data to GatewayObservation objects"""
        try:
            gateway_observations = []
            db = await self._get_db()
            
            for obs_data in observations:
                gateway_id = obs_data.get('gateway_id')
                if not gateway_id:
                    continue
                
                # Get gateway location
                gateway = await db.get(Gateway, gateway_id)
                if not gateway:
                    continue
                
                gateway_obs = GatewayObservation(
                    gateway_id=gateway_id,
                    latitude=float(gateway.latitude),
                    longitude=float(gateway.longitude),
                    rssi=obs_data.get('rssi', -100),
                    timestamp=datetime.fromisoformat(obs_data.get('timestamp', datetime.now().isoformat())),
                    battery_level=obs_data.get('battery_level'),
                    temperature=obs_data.get('temperature')
                )
                gateway_observations.append(gateway_obs)
            
            return gateway_observations
            
        except Exception as e:
            logger.error(f"Error converting to gateway observations: {e}")
            return []
    
    async def _store_estimated_location(self, location):
        """Store estimated location in database"""
        try:
            db = await self._get_db()
            
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
                metadata=location.metadata or {}
            )
            
            db.add(estimated_location)
            await db.commit()
            
            logger.debug(f"Stored estimated location for asset {location.asset_id}")
            
        except Exception as e:
            logger.error(f"Error storing estimated location: {e}")
    
    async def _update_location_cache(self, asset_id: str, location):
        """Update location cache"""
        try:
            cache = await self._get_cache()
            
            location_data = {
                "asset_id": asset_id,
                "latitude": float(location.latitude),
                "longitude": float(location.longitude),
                "altitude": float(location.altitude) if location.altitude else None,
                "uncertainty_radius": float(location.uncertainty_radius),
                "confidence": float(location.confidence),
                "algorithm": location.algorithm,
                "estimated_at": location.timestamp.isoformat(),
                "speed": float(location.speed) if location.speed else None,
                "bearing": float(location.bearing) if location.bearing else None
            }
            
            await cache.set_with_strategy("asset_location", location_data, asset_id=asset_id)
            
        except Exception as e:
            logger.error(f"Error updating location cache: {e}")
    
    async def _trigger_downstream_processing(self, location):
        """Trigger downstream processing (geofence evaluation, anomaly detection)"""
        try:
            # This would trigger other processors
            # For now, we'll just log
            logger.debug(f"Triggering downstream processing for asset {location.asset_id}")
            
        except Exception as e:
            logger.error(f"Error triggering downstream processing: {e}")
    
    async def get_processing_stats(self) -> Dict[str, Any]:
        """Get processing statistics"""
        try:
            async with self.processing_lock:
                buffer_stats = {}
                for asset_id, buffer in self.observation_buffers.items():
                    buffer_stats[asset_id] = {
                        "buffer_size": len(buffer),
                        "max_buffer_size": buffer.maxlen,
                        "oldest_observation": buffer[0]['received_at'].isoformat() if buffer else None,
                        "newest_observation": buffer[-1]['received_at'].isoformat() if buffer else None
                    }
                
                return {
                    "running": self.running,
                    "processing_interval": self.processing_interval,
                    "buffer_size": self.buffer_size,
                    "active_buffers": len(self.observation_buffers),
                    "buffer_stats": buffer_stats
                }
                
        except Exception as e:
            logger.error(f"Error getting processing stats: {e}")
            return {"error": str(e)}


# Global location processor instance
location_processor = LocationProcessor()


async def get_location_processor() -> LocationProcessor:
    """Get location processor instance"""
    return location_processor


async def start_location_processor():
    """Start the location processor"""
    await location_processor.start()


async def stop_location_processor():
    """Stop the location processor"""
    await location_processor.stop()
