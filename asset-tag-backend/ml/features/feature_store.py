"""
Feature store for ML model serving
"""
import logging
from typing import Dict, Any, List, Optional, Union
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
import json

from config.database import get_db
from config.cache import get_cache
from sqlalchemy import text

logger = logging.getLogger(__name__)


@dataclass
class FeatureVector:
    """Feature vector for ML models"""

    asset_id: str
    timestamp: datetime
    features: Dict[str, float]
    metadata: Dict[str, Any] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "asset_id": self.asset_id,
            "timestamp": self.timestamp.isoformat(),
            "features": self.features,
            "metadata": self.metadata or {},
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "FeatureVector":
        """Create from dictionary"""
        return cls(
            asset_id=data["asset_id"],
            timestamp=datetime.fromisoformat(data["timestamp"]),
            features=data["features"],
            metadata=data.get("metadata", {}),
        )


@dataclass
class AssetBaseline:
    """Asset baseline features for anomaly detection"""

    asset_id: str
    avg_rssi_per_gateway: Dict[str, float]
    typical_movement_pattern: Dict[str, float]
    normal_battery_drain_rate: float
    avg_temperature: float
    typical_confidence: float
    last_updated: datetime

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "asset_id": self.asset_id,
            "avg_rssi_per_gateway": self.avg_rssi_per_gateway,
            "typical_movement_pattern": self.typical_movement_pattern,
            "normal_battery_drain_rate": self.normal_battery_drain_rate,
            "avg_temperature": self.avg_temperature,
            "typical_confidence": self.typical_confidence,
            "last_updated": self.last_updated.isoformat(),
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AssetBaseline":
        """Create from dictionary"""
        return cls(
            asset_id=data["asset_id"],
            avg_rssi_per_gateway=data["avg_rssi_per_gateway"],
            typical_movement_pattern=data["typical_movement_pattern"],
            normal_battery_drain_rate=data["normal_battery_drain_rate"],
            avg_temperature=data["avg_temperature"],
            typical_confidence=data["typical_confidence"],
            last_updated=datetime.fromisoformat(data["last_updated"]),
        )


class FeatureStore:
    """Feature store for ML model serving"""

    def __init__(self):
        self.cache = None
        self.db = None

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

    async def get_features(self, asset_id: str) -> Optional[FeatureVector]:
        """Get real-time features for an asset"""
        try:
            cache = await self._get_cache()

            # Try cache first (hot cache)
            cached_features = await cache.get_with_strategy(
                "asset_features", asset_id=asset_id
            )
            if cached_features:
                return FeatureVector.from_dict(cached_features)

            # Compute from database
            features = await self._compute_real_time_features(asset_id)
            if features:
                # Cache for 5 minutes
                await cache.set_with_strategy(
                    "asset_features", features.to_dict(), asset_id=asset_id
                )

            return features

        except Exception as e:
            logger.error(f"Error getting features for asset {asset_id}: {e}")
            return None

    async def get_baseline(self, asset_id: str) -> Optional[AssetBaseline]:
        """Get asset baseline features"""
        try:
            cache = await self._get_cache()

            # Try cache first (24 hour TTL)
            cached_baseline = await cache.get_with_strategy(
                "asset_baseline", asset_id=asset_id
            )
            if cached_baseline:
                return AssetBaseline.from_dict(cached_baseline)

            # Compute from database
            baseline = await self._compute_baseline_features(asset_id)
            if baseline:
                # Cache for 24 hours
                await cache.set_with_strategy(
                    "asset_baseline", baseline.to_dict(), asset_id=asset_id
                )

            return baseline

        except Exception as e:
            logger.error(f"Error getting baseline for asset {asset_id}: {e}")
            return None

    async def _compute_real_time_features(
        self, asset_id: str
    ) -> Optional[FeatureVector]:
        """Compute real-time features from database"""
        try:
            db = await self._get_db()

            # Get recent observations (last 10 minutes)
            recent_obs_query = text(
                """
                SELECT 
                    gateway_id,
                    rssi,
                    battery_level,
                    temperature,
                    observed_at
                FROM observations
                WHERE asset_id = :asset_id
                    AND observed_at > NOW() - INTERVAL '10 minutes'
                ORDER BY observed_at DESC
                LIMIT 100;
            """
            )

            obs_result = await db.execute(recent_obs_query, {"asset_id": asset_id})
            observations = obs_result.fetchall()

            if not observations:
                return None

            # Get current location
            location_query = text(
                """
                SELECT 
                    latitude,
                    longitude,
                    confidence,
                    speed,
                    bearing,
                    estimated_at
                FROM estimated_locations
                WHERE asset_id = :asset_id
                ORDER BY estimated_at DESC
                LIMIT 1;
            """
            )

            loc_result = await db.execute(location_query, {"asset_id": asset_id})
            location = loc_result.fetchone()

            # Compute features
            features = {}

            # RSSI features
            rssi_values = [obs.rssi for obs in observations]
            features["avg_rssi"] = sum(rssi_values) / len(rssi_values)
            features["min_rssi"] = min(rssi_values)
            features["max_rssi"] = max(rssi_values)
            features["rssi_std"] = self._calculate_std(rssi_values)

            # Battery features
            battery_values = [
                obs.battery_level
                for obs in observations
                if obs.battery_level is not None
            ]
            if battery_values:
                features["avg_battery"] = sum(battery_values) / len(battery_values)
                features["battery_trend"] = self._calculate_trend(
                    [
                        obs.battery_level
                        for obs in observations
                        if obs.battery_level is not None
                    ]
                )

            # Temperature features
            temp_values = [
                obs.temperature for obs in observations if obs.temperature is not None
            ]
            if temp_values:
                features["avg_temperature"] = sum(temp_values) / len(temp_values)

            # Gateway diversity
            unique_gateways = set(obs.gateway_id for obs in observations)
            features["gateway_count"] = len(unique_gateways)

            # Location features
            if location:
                features["current_confidence"] = float(location.confidence)
                features["current_speed"] = (
                    float(location.speed) if location.speed else 0.0
                )
                features["current_bearing"] = (
                    float(location.bearing) if location.bearing else 0.0
                )

            # Temporal features
            now = datetime.now()
            features["hour_of_day"] = now.hour
            features["day_of_week"] = now.weekday()
            features["is_weekend"] = 1.0 if now.weekday() >= 5 else 0.0

            # Movement features
            if len(observations) > 1:
                time_span = (
                    observations[0].observed_at - observations[-1].observed_at
                ).total_seconds()
                features["observation_rate"] = len(observations) / max(
                    time_span / 60, 1
                )  # per minute

            return FeatureVector(
                asset_id=asset_id,
                timestamp=datetime.now(),
                features=features,
                metadata={
                    "observation_count": len(observations),
                    "has_location": location is not None,
                    "gateway_ids": list(unique_gateways),
                },
            )

        except Exception as e:
            logger.error(f"Error computing real-time features for {asset_id}: {e}")
            return None

    async def _compute_baseline_features(
        self, asset_id: str
    ) -> Optional[AssetBaseline]:
        """Compute baseline features from historical data"""
        try:
            db = await self._get_db()

            # Get historical observations (last 30 days)
            baseline_query = text(
                """
                SELECT 
                    gateway_id,
                    AVG(rssi) as avg_rssi,
                    AVG(battery_level) as avg_battery,
                    AVG(temperature) as avg_temperature
                FROM observations
                WHERE asset_id = :asset_id
                    AND observed_at > NOW() - INTERVAL '30 days'
                GROUP BY gateway_id;
            """
            )

            baseline_result = await db.execute(baseline_query, {"asset_id": asset_id})
            gateway_stats = baseline_result.fetchall()

            if not gateway_stats:
                return None

            # Get location confidence baseline
            confidence_query = text(
                """
                SELECT AVG(confidence) as avg_confidence
                FROM estimated_locations
                WHERE asset_id = :asset_id
                    AND estimated_at > NOW() - INTERVAL '30 days';
            """
            )

            conf_result = await db.execute(confidence_query, {"asset_id": asset_id})
            avg_confidence = conf_result.fetchone()

            # Get movement pattern
            movement_query = text(
                """
                SELECT 
                    AVG(distance_from_previous) as avg_distance,
                    AVG(speed) as avg_speed,
                    COUNT(*) as location_count
                FROM estimated_locations
                WHERE asset_id = :asset_id
                    AND estimated_at > NOW() - INTERVAL '30 days'
                    AND distance_from_previous IS NOT NULL;
            """
            )

            move_result = await db.execute(movement_query, {"asset_id": asset_id})
            movement_stats = move_result.fetchone()

            # Build baseline
            avg_rssi_per_gateway = {
                str(stat.gateway_id): float(stat.avg_rssi) for stat in gateway_stats
            }

            typical_movement_pattern = {
                "avg_distance": float(movement_stats.avg_distance)
                if movement_stats.avg_distance
                else 0.0,
                "avg_speed": float(movement_stats.avg_speed)
                if movement_stats.avg_speed
                else 0.0,
                "location_count": int(movement_stats.location_count)
                if movement_stats.location_count
                else 0,
            }

            # Calculate battery drain rate (simplified)
            battery_values = [
                stat.avg_battery
                for stat in gateway_stats
                if stat.avg_battery is not None
            ]
            normal_battery_drain_rate = 0.1  # Default 10% per day

            avg_temperature = (
                sum(
                    stat.avg_temperature
                    for stat in gateway_stats
                    if stat.avg_temperature is not None
                )
                / len(gateway_stats)
                if gateway_stats
                else 20.0
            )

            return AssetBaseline(
                asset_id=asset_id,
                avg_rssi_per_gateway=avg_rssi_per_gateway,
                typical_movement_pattern=typical_movement_pattern,
                normal_battery_drain_rate=normal_battery_drain_rate,
                avg_temperature=avg_temperature,
                typical_confidence=float(avg_confidence.avg_confidence)
                if avg_confidence and avg_confidence.avg_confidence
                else 0.8,
                last_updated=datetime.now(),
            )

        except Exception as e:
            logger.error(f"Error computing baseline for {asset_id}: {e}")
            return None

    def _calculate_std(self, values: List[float]) -> float:
        """Calculate standard deviation"""
        if len(values) < 2:
            return 0.0

        mean = sum(values) / len(values)
        variance = sum((x - mean) ** 2 for x in values) / (len(values) - 1)
        return variance**0.5

    def _calculate_trend(self, values: List[float]) -> float:
        """Calculate trend (slope) of values"""
        if len(values) < 2:
            return 0.0

        # Simple linear regression slope
        n = len(values)
        x = list(range(n))
        x_mean = sum(x) / n
        y_mean = sum(values) / n

        numerator = sum((x[i] - x_mean) * (values[i] - y_mean) for i in range(n))
        denominator = sum((x[i] - x_mean) ** 2 for i in range(n))

        return numerator / denominator if denominator != 0 else 0.0

    async def store_features(self, feature_vector: FeatureVector) -> bool:
        """Store feature vector in database"""
        try:
            db = await self._get_db()

            # Store in feature_history table (if it exists)
            # For now, we'll just cache it
            cache = await self._get_cache()
            await cache.set_with_strategy(
                "asset_features",
                feature_vector.to_dict(),
                asset_id=feature_vector.asset_id,
            )

            return True

        except Exception as e:
            logger.error(f"Error storing features for {feature_vector.asset_id}: {e}")
            return False

    async def get_feature_history(
        self, asset_id: str, hours: int = 24
    ) -> List[FeatureVector]:
        """Get feature history for an asset"""
        try:
            # For now, return empty list as we're not storing historical features
            # In a full implementation, this would query a feature_history table
            return []

        except Exception as e:
            logger.error(f"Error getting feature history for {asset_id}: {e}")
            return []

    async def invalidate_cache(self, asset_id: str):
        """Invalidate feature cache for an asset"""
        try:
            cache = await self._get_cache()
            await cache.invalidate_asset_cache(asset_id)

        except Exception as e:
            logger.error(f"Error invalidating cache for {asset_id}: {e}")


# Global feature store instance
feature_store = FeatureStore()


async def get_feature_store() -> FeatureStore:
    """Dependency to get feature store"""
    return feature_store
