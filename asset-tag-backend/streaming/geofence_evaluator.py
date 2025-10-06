"""
Geofence evaluation service
"""
import logging
from datetime import datetime
from typing import Any, Dict, List

from shapely.geometry import Point, Polygon

from config.cache import get_cache
from modules.locations.estimator import EstimatedLocation

logger = logging.getLogger(__name__)


class GeofenceEvaluator:
    """Geofence evaluation service for detecting entry/exit events"""

    def __init__(self):
        self.cache = None

    async def evaluate_location(self, asset_id: str, location: EstimatedLocation):
        """Evaluate location against all relevant geofences"""
        try:
            if not self.cache:
                self.cache = await get_cache()

            # Get geofences for the asset's organization
            geofences = await self._get_relevant_geofences(asset_id)

            if not geofences:
                return

            # Create point from location
            point = Point(location.longitude, location.latitude)

            # Evaluate each geofence
            for geofence in geofences:
                await self._evaluate_geofence(asset_id, point, geofence, location)

        except Exception as e:
            logger.error(f"Error evaluating geofences for asset {asset_id}: {e}")

    async def _get_relevant_geofences(self, asset_id: str) -> List[Dict[str, Any]]:
        """Get geofences relevant to the asset"""
        try:
            # For now, return empty list - this would query the database
            # to get geofences for the asset's organization
            return []
        except Exception as e:
            logger.error(f"Error getting relevant geofences: {e}")
            return []

    async def _evaluate_geofence(
        self,
        asset_id: str,
        point: Point,
        geofence: Dict[str, Any],
        location: EstimatedLocation,
    ):
        """Evaluate a single geofence"""
        try:
            # Check if point is inside geofence
            is_inside = self._point_in_geofence(point, geofence)

            # Get previous state from cache
            cache_key = f"geofence:{geofence['id']}:asset:{asset_id}"
            was_inside = await self.cache.get(cache_key)

            # Detect entry/exit events
            if is_inside and not was_inside:
                await self._handle_geofence_entry(asset_id, geofence, location)
            elif not is_inside and was_inside:
                await self._handle_geofence_exit(asset_id, geofence, location)

            # Update cache with current state
            await self.cache.set(cache_key, is_inside, ttl=3600)

        except Exception as e:
            logger.error(f"Error evaluating geofence {geofence.get('id')}: {e}")

    def _point_in_geofence(self, point: Point, geofence: Dict[str, Any]) -> bool:
        """Check if point is within geofence"""
        try:
            geofence_type = geofence.get("type", "circular")

            if geofence_type == "circular":
                # Circular geofence
                center_lat = geofence.get("center_latitude")
                center_lng = geofence.get("center_longitude")
                radius = geofence.get("radius", 0)

                if center_lat is None or center_lng is None:
                    return False

                center = Point(center_lng, center_lat)
                distance = (
                    point.distance(center) * 111000
                )  # Convert to meters (rough approximation)

                return distance <= radius
            else:
                # Polygon geofence
                coordinates = geofence.get("coordinates", [])
                if not coordinates or len(coordinates) < 3:
                    return False

                # Convert coordinates to polygon
                polygon_coords = [
                    (coord[1], coord[0]) for coord in coordinates
                ]  # (lng, lat)
                polygon = Polygon(polygon_coords)

                return polygon.contains(point)

        except Exception as e:
            logger.error(f"Error checking point in geofence: {e}")
            return False

    async def _handle_geofence_entry(
        self, asset_id: str, geofence: Dict[str, Any], location: EstimatedLocation
    ):
        """Handle geofence entry event"""
        try:
            logger.info(f"Asset {asset_id} entered geofence {geofence.get('id')}")

            # Create geofence event record
            event_data = {
                "asset_id": asset_id,
                "geofence_id": geofence["id"],
                "event_type": "entry",
                "timestamp": location.timestamp.isoformat(),
                "latitude": location.latitude,
                "longitude": location.longitude,
                "confidence": location.confidence,
            }

            # Store event in database
            await self._store_geofence_event(event_data)

            # Trigger alert if configured
            if geofence.get("alert_on_entry", True):
                await self._trigger_geofence_alert(
                    asset_id, geofence, "entry", location
                )

        except Exception as e:
            logger.error(f"Error handling geofence entry: {e}")

    async def _handle_geofence_exit(
        self, asset_id: str, geofence: Dict[str, Any], location: EstimatedLocation
    ):
        """Handle geofence exit event"""
        try:
            logger.info(f"Asset {asset_id} exited geofence {geofence.get('id')}")

            # Create geofence event record
            event_data = {
                "asset_id": asset_id,
                "geofence_id": geofence["id"],
                "event_type": "exit",
                "timestamp": location.timestamp.isoformat(),
                "latitude": location.latitude,
                "longitude": location.longitude,
                "confidence": location.confidence,
            }

            # Store event in database
            await self._store_geofence_event(event_data)

            # Trigger alert if configured
            if geofence.get("alert_on_exit", True):
                await self._trigger_geofence_alert(asset_id, geofence, "exit", location)

        except Exception as e:
            logger.error(f"Error handling geofence exit: {e}")

    async def _store_geofence_event(self, event_data: Dict[str, Any]):
        """Store geofence event in database"""
        try:
            # Import here to avoid circular imports
            from config.database import get_db
            from modules.geofences.models import GeofenceEvent

            async for db in get_db():
                event = GeofenceEvent(
                    organization_id="00000000-0000-0000-0000-000000000000",  # Default org
                    geofence_id=event_data["geofence_id"],
                    asset_id=event_data["asset_id"],
                    event_type=event_data["event_type"],
                    timestamp=event_data["timestamp"],
                    latitude=event_data["latitude"],
                    longitude=event_data["longitude"],
                    confidence=event_data.get("confidence"),
                )

                db.add(event)
                await db.commit()
                break

        except Exception as e:
            logger.error(f"Error storing geofence event: {e}")

    async def _trigger_geofence_alert(
        self,
        asset_id: str,
        geofence: Dict[str, Any],
        event_type: str,
        location: EstimatedLocation,
    ):
        """Trigger alert for geofence event"""
        try:
            # Import here to avoid circular imports
            from streaming.alert_generator import AlertGenerator

            alert_generator = AlertGenerator()

            # Create alert data
            alert_data = {
                "asset_id": asset_id,
                "alert_type": "geofence_violation",
                "severity": "warning",
                "message": f"Asset {asset_id} {event_type} geofence {geofence.get('name', geofence.get('id'))}",
                "description": f"Asset {asset_id} {event_type} geofence at {location.latitude}, {location.longitude}",
                "geofence_id": geofence["id"],
                "geofence_name": geofence.get("name"),
                "latitude": location.latitude,
                "longitude": location.longitude,
                "triggered_at": location.timestamp.isoformat(),
            }

            await alert_generator.create_alert(alert_data)

        except Exception as e:
            logger.error(f"Error triggering geofence alert: {e}")
