"""
Location estimation algorithms for Bluetooth-based asset tracking
"""

import logging
import math
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, List, Optional

import numpy as np

from config.cache import CacheManager
from config.settings import settings

logger = logging.getLogger(__name__)


@dataclass
class GatewayObservation:
    """Gateway observation data"""

    gateway_id: str
    latitude: float
    longitude: float
    rssi: int
    timestamp: datetime
    battery_level: Optional[int] = None
    temperature: Optional[float] = None


@dataclass
class EstimatedLocation:
    """Estimated location result"""

    asset_id: str
    latitude: float
    longitude: float
    altitude: Optional[float] = None
    uncertainty_radius: float = 0.0
    confidence: float = 0.0
    algorithm: str = "UNKNOWN"
    timestamp: datetime = None
    gateway_count: int = 0
    gateway_ids: List[str] = None
    speed: Optional[float] = None
    bearing: Optional[float] = None
    distance_from_previous: Optional[float] = None
    signal_quality_score: Optional[float] = None
    rssi_variance: Optional[float] = None
    metadata: Dict[str, Any] = None


class LocationEstimator:
    """Location estimation service using various algorithms"""

    def __init__(self, cache: CacheManager):
        self.cache = cache
        self.path_loss_exponent = settings.rssi_path_loss_exponent
        self.reference_distance = settings.rssi_reference_distance
        self.reference_power = settings.rssi_reference_power

    async def estimate_location(
        self, asset_id: str, observations: List[GatewayObservation]
    ) -> EstimatedLocation:
        """Main location estimation method"""
        if not observations:
            return await self._get_last_known_location(asset_id)

        # Sort observations by timestamp
        observations.sort(key=lambda x: x.timestamp)

        # Calculate signal quality metrics
        signal_quality_score = self._calculate_signal_quality(observations)
        rssi_variance = self._calculate_rssi_variance(observations)

        # Choose estimation algorithm based on number of gateways
        if len(observations) == 1:
            result = self._single_gateway_estimate(observations[0])
        elif len(observations) == 2:
            result = self._midpoint_estimate(observations)
        elif len(observations) >= 3:
            result = self._trilateration_estimate(observations)
        else:
            result = await self._get_last_known_location(asset_id)

        # Set common properties
        result.asset_id = asset_id
        result.timestamp = observations[0].timestamp
        result.gateway_count = len(observations)
        result.gateway_ids = [obs.gateway_id for obs in observations]
        result.signal_quality_score = signal_quality_score
        result.rssi_variance = rssi_variance

        # Calculate movement metrics if we have previous location
        await self._calculate_movement_metrics(asset_id, result)

        # Cache the result
        await self._cache_location(asset_id, result)

        return result

    def _single_gateway_estimate(
        self, observation: GatewayObservation
    ) -> EstimatedLocation:
        """Estimate location using single gateway (high uncertainty)"""
        # For single gateway, we can only estimate that the asset is within
        # the gateway's transmission range
        estimated_distance = self._rssi_to_distance(observation.rssi)

        return EstimatedLocation(
            asset_id="",  # Will be set by caller
            latitude=observation.latitude,
            longitude=observation.longitude,
            uncertainty_radius=estimated_distance * 2,  # High uncertainty
            confidence=30.0,  # Low confidence
            algorithm="SINGLE_GATEWAY",
            metadata={
                "estimated_distance": estimated_distance,
                "gateway_rssi": observation.rssi,
            },
        )

    def _midpoint_estimate(
        self, observations: List[GatewayObservation]
    ) -> EstimatedLocation:
        """Estimate location as midpoint between two gateways"""
        if len(observations) != 2:
            raise ValueError("Midpoint estimation requires exactly 2 observations")

        obs1, obs2 = observations

        # Calculate midpoint
        lat = (obs1.latitude + obs2.latitude) / 2
        lng = (obs1.longitude + obs2.longitude) / 2

        # Calculate uncertainty based on distance between gateways
        distance_between_gateways = self._calculate_distance(
            obs1.latitude, obs1.longitude, obs2.latitude, obs2.longitude
        )

        # Weight by signal strength
        weight1 = self._rssi_to_weight(obs1.rssi)
        weight2 = self._rssi_to_weight(obs2.rssi)

        # Weighted midpoint
        total_weight = weight1 + weight2
        lat = (obs1.latitude * weight1 + obs2.latitude * weight2) / total_weight
        lng = (obs1.longitude * weight1 + obs2.longitude * weight2) / total_weight

        return EstimatedLocation(
            asset_id="",  # Will be set by caller
            latitude=lat,
            longitude=lng,
            uncertainty_radius=distance_between_gateways / 2,
            confidence=60.0,  # Medium confidence
            algorithm="MIDPOINT",
            metadata={
                "distance_between_gateways": distance_between_gateways,
                "gateway_weights": [weight1, weight2],
            },
        )

    def _trilateration_estimate(
        self, observations: List[GatewayObservation]
    ) -> EstimatedLocation:
        """Estimate location using weighted trilateration"""
        if len(observations) < 3:
            raise ValueError("Trilateration requires at least 3 observations")

        # Convert RSSI to distance estimates
        distances = [self._rssi_to_distance(obs.rssi) for obs in observations]

        # Calculate weights based on signal strength
        weights = [self._rssi_to_weight(obs.rssi) for obs in observations]

        # Weighted centroid calculation
        total_weight = sum(weights)
        lat = (
            sum(obs.latitude * weight for obs, weight in zip(observations, weights))
            / total_weight
        )
        lng = (
            sum(obs.longitude * weight for obs, weight in zip(observations, weights))
            / total_weight
        )

        # Calculate uncertainty based on distance variance and signal quality
        uncertainty = self._calculate_uncertainty(observations, distances)

        # Calculate confidence based on number of gateways and signal quality
        confidence = min(
            95.0,
            len(observations) * 20 + self._calculate_signal_quality(observations) * 0.3,
        )

        return EstimatedLocation(
            asset_id="",  # Will be set by caller
            latitude=lat,
            longitude=lng,
            uncertainty_radius=uncertainty,
            confidence=confidence,
            algorithm="TRILATERATION",
            metadata={
                "distances": distances,
                "weights": weights,
                "gateway_count": len(observations),
            },
        )

    def _rssi_to_distance(self, rssi: int) -> float:
        """Convert RSSI to estimated distance using path loss model"""
        # Path loss model: RSSI = -10 * n * log10(d) + A
        # Where A is RSSI at reference distance
        try:
            distance = self.reference_distance * (
                10 ** ((self.reference_power - rssi) / (10 * self.path_loss_exponent))
            )
            return max(0.1, min(distance, 1000))  # Clamp 0.1m-1000m
        except (ValueError, ZeroDivisionError):
            return 50.0  # Default fallback distance

    def _rssi_to_weight(self, rssi: int) -> float:
        """Convert RSSI to weight for averaging (stronger = higher weight)"""
        # Normalize RSSI to 0-1 range, then convert to weight
        # RSSI typically ranges from -100 to -30 dBm
        normalized_rssi = (rssi + 100) / 70  # Normalize to 0-1
        normalized_rssi = max(0, min(1, normalized_rssi))  # Clamp
        return 10 ** (normalized_rssi * 2)  # Exponential weight

    def _calculate_distance(
        self, lat1: float, lng1: float, lat2: float, lng2: float
    ) -> float:
        """Calculate distance between two points using Haversine formula"""
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

    def _calculate_uncertainty(
        self, observations: List[GatewayObservation], distances: List[float]
    ) -> float:
        """Calculate location uncertainty based on observations"""
        if not observations:
            return 100.0  # High uncertainty if no observations

        # Base uncertainty on distance variance
        distance_variance = (
            np.var(distances)
            if len(distances) > 1
            else distances[0] if distances else 50.0
        )

        # Factor in signal quality
        signal_quality = self._calculate_signal_quality(observations)
        quality_factor = max(0.5, 1.0 - (signal_quality / 100))

        # Factor in number of gateways
        gateway_factor = max(0.3, 1.0 - (len(observations) - 3) * 0.1)

        uncertainty = distance_variance * quality_factor * gateway_factor
        return max(5.0, min(uncertainty, 200.0))  # Clamp between 5m and 200m

    def _calculate_signal_quality(
        self, observations: List[GatewayObservation]
    ) -> float:
        """Calculate overall signal quality score (0-100)"""
        if not observations:
            return 0.0

        # Average RSSI (higher is better)
        avg_rssi = sum(obs.rssi for obs in observations) / len(observations)

        # Convert to quality score (RSSI -100 to -30 maps to 0-100)
        quality = max(0, min(100, (avg_rssi + 100) / 70 * 100))

        # Bonus for multiple gateways
        gateway_bonus = min(20, len(observations) * 5)

        return min(100, quality + gateway_bonus)

    def _calculate_rssi_variance(self, observations: List[GatewayObservation]) -> float:
        """Calculate RSSI variance across observations"""
        if len(observations) < 2:
            return 0.0

        rssi_values = [obs.rssi for obs in observations]
        return float(np.var(rssi_values))

    async def _get_last_known_location(self, asset_id: str) -> EstimatedLocation:
        """Get last known location from cache"""
        cache_key = f"last_location:{asset_id}"
        cached_location = await self.cache.get(cache_key)

        if cached_location:
            return EstimatedLocation(
                asset_id=asset_id,
                latitude=cached_location["latitude"],
                longitude=cached_location["longitude"],
                uncertainty_radius=cached_location.get("uncertainty_radius", 100.0),
                confidence=cached_location.get("confidence", 10.0),
                algorithm="LAST_KNOWN",
                timestamp=datetime.now(),
                gateway_count=0,
                gateway_ids=[],
                metadata={"source": "cache"},
            )

        # Return default location if no cache
        return EstimatedLocation(
            asset_id=asset_id,
            latitude=0.0,
            longitude=0.0,
            uncertainty_radius=1000.0,
            confidence=0.0,
            algorithm="DEFAULT",
            timestamp=datetime.now(),
            gateway_count=0,
            gateway_ids=[],
            metadata={"source": "default"},
        )

    async def _calculate_movement_metrics(
        self, asset_id: str, current_location: EstimatedLocation
    ):
        """Calculate speed, bearing, and distance from previous location"""
        cache_key = f"last_location:{asset_id}"
        previous_location = await self.cache.get(cache_key)

        if previous_location:
            # Calculate distance
            distance = self._calculate_distance(
                previous_location["latitude"],
                previous_location["longitude"],
                current_location.latitude,
                current_location.longitude,
            )
            current_location.distance_from_previous = distance

            # Calculate speed (if we have timestamps)
            if previous_location.get("timestamp") and current_location.timestamp:
                time_diff = (
                    current_location.timestamp
                    - datetime.fromisoformat(previous_location["timestamp"])
                ).total_seconds()
                if time_diff > 0:
                    current_location.speed = distance / time_diff  # m/s

            # Calculate bearing
            current_location.bearing = self._calculate_bearing(
                previous_location["latitude"],
                previous_location["longitude"],
                current_location.latitude,
                current_location.longitude,
            )

    def _calculate_bearing(
        self, lat1: float, lng1: float, lat2: float, lng2: float
    ) -> float:
        """Calculate bearing between two points"""
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lng = math.radians(lng2 - lng1)

        y = math.sin(delta_lng) * math.cos(lat2_rad)
        x = math.cos(lat1_rad) * math.sin(lat2_rad) - math.sin(lat1_rad) * math.cos(
            lat2_rad
        ) * math.cos(delta_lng)

        bearing = math.atan2(y, x)
        bearing = math.degrees(bearing)
        bearing = (bearing + 360) % 360  # Normalize to 0-360

        return bearing

    async def _cache_location(self, asset_id: str, location: EstimatedLocation):
        """Cache the estimated location"""
        cache_key = f"last_location:{asset_id}"
        cache_data = {
            "latitude": location.latitude,
            "longitude": location.longitude,
            "uncertainty_radius": location.uncertainty_radius,
            "confidence": location.confidence,
            "timestamp": location.timestamp.isoformat(),
            "algorithm": location.algorithm,
        }
        await self.cache.set(cache_key, cache_data, ttl=3600)  # Cache for 1 hour
