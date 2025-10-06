"""
Enhanced geofence evaluation processor
"""

import asyncio
import logging
import math
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Set

from config.cache import get_cache
from config.database import get_db
from modules.alerts.models import Alert
from modules.assets.models import Asset
from modules.geofences.models import Geofence

logger = logging.getLogger(__name__)


class GeofenceProcessor:
    """Enhanced geofence evaluation processor with caching and optimization"""

    def __init__(self, processing_interval: float = 5.0):
        self.processing_interval = processing_interval
        self.cache = None
        self.db = None
        self.running = False
        self.processing_task = None
        self.asset_geofence_states = defaultdict(
            set
        )  # Track which geofences each asset is in
        self.geofence_cache = {}  # Cache geofence boundaries
        self.cache_ttl = timedelta(hours=1)  # Cache TTL
        self.last_cache_update = datetime.min

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
        """Start the geofence processor"""
        if self.running:
            return

        self.running = True
        self.processing_task = asyncio.create_task(self._processing_loop())
        logger.info("Geofence processor started")

    async def stop(self):
        """Stop the geofence processor"""
        self.running = False
        if self.processing_task:
            self.processing_task.cancel()
            try:
                await self.processing_task
            except asyncio.CancelledError:
                pass
        logger.info("Geofence processor stopped")

    async def process_location_update(self, location_data: Dict[str, Any]):
        """Process location update for geofence evaluation"""
        try:
            asset_id = location_data.get("asset_id")
            latitude = location_data.get("latitude")
            longitude = location_data.get("longitude")

            if not all([asset_id, latitude, longitude]):
                logger.warning("Location data missing required fields")
                return

            # Evaluate geofences for this location
            await self._evaluate_geofences(asset_id, float(latitude), float(longitude))

        except Exception as e:
            logger.error(
                f"Error processing location update for geofence evaluation: {e}"
            )

    async def _processing_loop(self):
        """Main processing loop for periodic geofence cache updates"""
        while self.running:
            try:
                await asyncio.sleep(self.processing_interval)

                if self.running:
                    # Update geofence cache if needed
                    if self._should_update_cache():
                        await self._update_geofence_cache()

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in geofence processing loop: {e}")
                await asyncio.sleep(30)  # Wait before retrying

    def _should_update_cache(self) -> bool:
        """Check if geofence cache should be updated"""
        return datetime.now() - self.last_cache_update > self.cache_ttl

    async def _update_geofence_cache(self):
        """Update geofence cache from database"""
        try:
            db = await self._get_db()
            cache = await self._get_cache()

            # Get all active geofences
            result = await db.execute(
                "SELECT * FROM geofences WHERE status = 'active' AND deleted_at IS NULL"
            )
            geofences = result.fetchall()

            # Update cache
            self.geofence_cache.clear()
            for geofence in geofences:
                geofence_id = str(geofence.id)
                self.geofence_cache[geofence_id] = {
                    "id": geofence_id,
                    "name": geofence.name,
                    "geofence_type": geofence.geofence_type,
                    "center_latitude": float(geofence.center_latitude),
                    "center_longitude": float(geofence.center_longitude),
                    "radius": float(geofence.radius) if geofence.radius else None,
                    "boundary_coordinates": geofence.boundary_coordinates,
                    "organization_id": str(geofence.organization_id),
                    "alert_on_entry": geofence.alert_on_entry,
                    "alert_on_exit": geofence.alert_on_exit,
                    "metadata": geofence.metadata or {},
                }

                # Also cache in Redis
                await cache.set_with_strategy(
                    "geofence_boundary",
                    self.geofence_cache[geofence_id],
                    geofence_id=geofence_id,
                )

            self.last_cache_update = datetime.now()
            logger.info(
                f"Updated geofence cache with {len(self.geofence_cache)} geofences"
            )

        except Exception as e:
            logger.error(f"Error updating geofence cache: {e}")

    async def _evaluate_geofences(
        self, asset_id: str, latitude: float, longitude: float
    ):
        """Evaluate all geofences for a location"""
        try:
            # Ensure cache is up to date
            if not self.geofence_cache or self._should_update_cache():
                await self._update_geofence_cache()

            current_geofences = set()

            # Check each geofence
            for geofence_id, geofence_data in self.geofence_cache.items():
                is_inside = await self._is_location_in_geofence(
                    latitude, longitude, geofence_data
                )

                if is_inside:
                    current_geofences.add(geofence_id)

            # Get previous state
            previous_geofences = self.asset_geofence_states[asset_id]

            # Check for entries and exits
            entries = current_geofences - previous_geofences
            exits = previous_geofences - current_geofences

            # Process entries
            for geofence_id in entries:
                await self._handle_geofence_entry(
                    asset_id, geofence_id, latitude, longitude
                )

            # Process exits
            for geofence_id in exits:
                await self._handle_geofence_exit(
                    asset_id, geofence_id, latitude, longitude
                )

            # Update state
            self.asset_geofence_states[asset_id] = current_geofences

            if entries or exits:
                logger.debug(
                    f"Asset {asset_id}: entries={len(entries)}, exits={len(exits)}"
                )

        except Exception as e:
            logger.error(f"Error evaluating geofences for asset {asset_id}: {e}")

    async def _is_location_in_geofence(
        self, latitude: float, longitude: float, geofence_data: Dict[str, Any]
    ) -> bool:
        """Check if location is inside a geofence"""
        try:
            geofence_type = geofence_data.get("geofence_type")

            if geofence_type == "circle":
                return self._is_in_circle_geofence(latitude, longitude, geofence_data)
            elif geofence_type == "polygon":
                return self._is_in_polygon_geofence(latitude, longitude, geofence_data)
            else:
                logger.warning(f"Unknown geofence type: {geofence_type}")
                return False

        except Exception as e:
            logger.error(f"Error checking geofence containment: {e}")
            return False

    def _is_in_circle_geofence(
        self, latitude: float, longitude: float, geofence_data: Dict[str, Any]
    ) -> bool:
        """Check if location is inside a circular geofence"""
        try:
            center_lat = geofence_data["center_latitude"]
            center_lng = geofence_data["center_longitude"]
            radius = geofence_data["radius"]

            if not radius:
                return False

            # Calculate distance using Haversine formula
            distance = self._calculate_distance(
                latitude, longitude, center_lat, center_lng
            )

            return distance <= radius

        except Exception as e:
            logger.error(f"Error checking circle geofence: {e}")
            return False

    def _is_in_polygon_geofence(
        self, latitude: float, longitude: float, geofence_data: Dict[str, Any]
    ) -> bool:
        """Check if location is inside a polygon geofence"""
        try:
            boundary_coordinates = geofence_data.get("boundary_coordinates")

            if not boundary_coordinates:
                return False

            # Parse polygon coordinates
            if isinstance(boundary_coordinates, str):
                import json

                boundary_coordinates = json.loads(boundary_coordinates)

            # Use ray casting algorithm
            return self._point_in_polygon(latitude, longitude, boundary_coordinates)

        except Exception as e:
            logger.error(f"Error checking polygon geofence: {e}")
            return False

    def _calculate_distance(
        self, lat1: float, lng1: float, lat2: float, lng2: float
    ) -> float:
        """Calculate distance between two points using Haversine formula"""
        try:
            R = 6371000  # Earth's radius in meters

            lat1_rad = math.radians(lat1)
            lat2_rad = math.radians(lat2)
            delta_lat = math.radians(lat2 - lat1)
            delta_lng = math.radians(lng2 - lng1)

            a = (
                math.sin(delta_lat / 2) ** 2
                + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng / 2) ** 2
            )
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

            return R * c

        except Exception as e:
            logger.error(f"Error calculating distance: {e}")
            return float("inf")

    def _point_in_polygon(
        self, latitude: float, longitude: float, polygon: List[List[float]]
    ) -> bool:
        """Check if point is inside polygon using ray casting algorithm"""
        try:
            x, y = longitude, latitude
            n = len(polygon)
            inside = False

            p1x, p1y = polygon[0]
            for i in range(1, n + 1):
                p2x, p2y = polygon[i % n]
                if y > min(p1y, p2y):
                    if y <= max(p1y, p2y):
                        if x <= max(p1x, p2x):
                            if p1y != p2y:
                                xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                            if p1x == p2x or x <= xinters:
                                inside = not inside
                p1x, p1y = p2x, p2y

            return inside

        except Exception as e:
            logger.error(f"Error in point-in-polygon check: {e}")
            return False

    async def _handle_geofence_entry(
        self, asset_id: str, geofence_id: str, latitude: float, longitude: float
    ):
        """Handle geofence entry event"""
        try:
            geofence_data = self.geofence_cache.get(geofence_id)
            if not geofence_data:
                return

            # Check if alerts are enabled for entry
            if not geofence_data.get("alert_on_entry", True):
                return

            # Create entry alert
            await self._create_geofence_alert(
                asset_id, geofence_id, "entry", latitude, longitude, geofence_data
            )

        except Exception as e:
            logger.error(f"Error handling geofence entry: {e}")

    async def _handle_geofence_exit(
        self, asset_id: str, geofence_id: str, latitude: float, longitude: float
    ):
        """Handle geofence exit event"""
        try:
            geofence_data = self.geofence_cache.get(geofence_id)
            if not geofence_data:
                return

            # Check if alerts are enabled for exit
            if not geofence_data.get("alert_on_exit", True):
                return

            # Create exit alert
            await self._create_geofence_alert(
                asset_id, geofence_id, "exit", latitude, longitude, geofence_data
            )

        except Exception as e:
            logger.error(f"Error handling geofence exit: {e}")

    async def _create_geofence_alert(
        self,
        asset_id: str,
        geofence_id: str,
        event_type: str,
        latitude: float,
        longitude: float,
        geofence_data: Dict[str, Any],
    ):
        """Create geofence alert"""
        try:
            db = await self._get_db()

            # Get asset information
            asset = await db.get(Asset, asset_id)
            if not asset:
                logger.warning(f"Asset {asset_id} not found for geofence alert")
                return

            # Determine alert severity
            severity = "warning" if event_type == "exit" else "info"

            # Create alert message
            action = "entered" if event_type == "entry" else "exited"
            message = f"Asset {asset.name} {action} geofence {geofence_data['name']}"
            description = f"Asset {action} the geofence at coordinates ({latitude:.6f}, {longitude:.6f})"

            # Create alert
            alert = Alert(
                organization_id=asset.organization_id,
                alert_type="geofence",
                severity=severity,
                status="active",
                asset_id=asset_id,
                asset_name=asset.name,
                message=message,
                description=description,
                reason=f"Geofence {event_type} detected",
                suggested_action=f"Verify asset location and geofence {event_type}",
                location_description=f"Geofence {event_type} location",
                latitude=latitude,
                longitude=longitude,
                geofence_id=geofence_id,
                geofence_name=geofence_data["name"],
                triggered_at=datetime.now(),
                auto_resolvable=True,
                metadata={
                    "event_type": event_type,
                    "geofence_type": geofence_data.get("geofence_type"),
                    "geofence_radius": geofence_data.get("radius"),
                },
            )

            db.add(alert)
            await db.commit()

            logger.info(f"Created geofence {event_type} alert for asset {asset_id}")

        except Exception as e:
            logger.error(f"Error creating geofence alert: {e}")

    async def get_processing_stats(self) -> Dict[str, Any]:
        """Get processing statistics"""
        try:
            return {
                "running": self.running,
                "processing_interval": self.processing_interval,
                "cached_geofences": len(self.geofence_cache),
                "assets_tracked": len(self.asset_geofence_states),
                "cache_last_updated": self.last_cache_update.isoformat(),
                "cache_ttl_hours": self.cache_ttl.total_seconds() / 3600,
            }

        except Exception as e:
            logger.error(f"Error getting processing stats: {e}")
            return {"error": str(e)}

    async def force_geofence_evaluation(
        self, asset_id: str, latitude: float, longitude: float
    ) -> Dict[str, Any]:
        """Force geofence evaluation for a specific asset and location"""
        try:
            await self._evaluate_geofences(asset_id, latitude, longitude)

            return {
                "asset_id": asset_id,
                "latitude": latitude,
                "longitude": longitude,
                "current_geofences": list(self.asset_geofence_states[asset_id]),
                "timestamp": datetime.now().isoformat(),
            }

        except Exception as e:
            logger.error(f"Error in forced geofence evaluation: {e}")
            return {"error": str(e)}


# Global geofence processor instance
geofence_processor = GeofenceProcessor()


async def get_geofence_processor() -> GeofenceProcessor:
    """Get geofence processor instance"""
    return geofence_processor


async def start_geofence_processor():
    """Start the geofence processor"""
    await geofence_processor.start()


async def stop_geofence_processor():
    """Stop the geofence processor"""
    await geofence_processor.stop()
