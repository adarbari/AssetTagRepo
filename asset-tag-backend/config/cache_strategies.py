"""
Redis cache strategies and key management
"""

import json
import logging
from dataclasses import dataclass
from enum import Enum
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class CacheStrategy:
    """Cache strategy definitions with TTL and key patterns"""

    # Current asset locations (TTL: 60s)
    ASSET_LOCATION = ("asset:location:{asset_id}", 60)

    # Asset current state (TTL: 30s)
    ASSET_STATE = ("asset:state:{asset_id}", 30)

    # Geofence boundaries (TTL: 3600s)
    GEOFENCE_BOUNDARY = ("geofence:boundary:{geofence_id}", 3600)

    # Geofence rules (TTL: 1800s)
    GEOFENCE_RULES = ("geofence:rules:{geofence_id}", 1800)

    # Asset baselines for anomaly detection (TTL: 86400s)
    ASSET_BASELINE = ("asset:baseline:{asset_id}", 86400)

    # Real-time feature cache (TTL: 300s)
    ASSET_FEATURES = ("asset:features:{asset_id}", 300)

    # Gateway locations (TTL: 1800s)
    GATEWAY_LOCATION = ("gateway:location:{gateway_id}", 1800)

    # Site information (TTL: 3600s)
    SITE_INFO = ("site:info:{site_id}", 3600)

    # User session data (TTL: 1800s)
    USER_SESSION = ("user:session:{user_id}", 1800)

    # Alert configurations (TTL: 1800s)
    ALERT_CONFIG = ("alert:config:{organization_id}", 1800)

    # Analytics dashboard data (TTL: 300s)
    DASHBOARD_METRICS = ("analytics:dashboard:{organization_id}", 300)

    # Search results cache (TTL: 600s)
    SEARCH_RESULTS = ("search:results:{query_hash}", 600)

    # ML model predictions (TTL: 60s)
    ML_PREDICTIONS = ("ml:predictions:{asset_id}", 60)

    # Rate limiting (TTL: 60s)
    RATE_LIMIT = ("rate:limit:{identifier}", 60)

    # WebSocket connections (TTL: 300s)
    WEBSOCKET_CONNECTION = ("ws:connection:{connection_id}", 300)


@dataclass
class CacheKey:
    """Cache key with metadata"""

    pattern: str
    ttl: int
    description: str
    category: str


class CacheCategory(Enum):
    """Cache categories for organization"""

    ASSET = "asset"
    GEOFENCE = "geofence"
    GATEWAY = "gateway"
    SITE = "site"
    USER = "user"
    ALERT = "alert"
    ANALYTICS = "analytics"
    SEARCH = "search"
    ML = "ml"
    SYSTEM = "system"


class CacheKeyManager:
    """Manages cache keys and strategies"""

    def __init__(self) -> None:
        self.strategies = {
            "asset_location": CacheKey(
                pattern="asset:location:{asset_id}",
                ttl=60,
                description="Current asset location data",
                category=CacheCategory.ASSET,
            ),
            "asset_state": CacheKey(
                pattern="asset:state:{asset_id}",
                ttl=30,
                description="Current asset state (battery, temperature, etc.)",
                category=CacheCategory.ASSET,
            ),
            "asset_baseline": CacheKey(
                pattern="asset:baseline:{asset_id}",
                ttl=86400,
                description="Asset baseline features for anomaly detection",
                category=CacheCategory.ASSET,
            ),
            "asset_features": CacheKey(
                pattern="asset:features:{asset_id}",
                ttl=300,
                description="Real-time computed features",
                category=CacheCategory.ASSET,
            ),
            "geofence_boundary": CacheKey(
                pattern="geofence:boundary:{geofence_id}",
                ttl=3600,
                description="Geofence boundary coordinates",
                category=CacheCategory.GEOFENCE,
            ),
            "geofence_rules": CacheKey(
                pattern="geofence:rules:{geofence_id}",
                ttl=1800,
                description="Geofence rules and conditions",
                category=CacheCategory.GEOFENCE,
            ),
            "gateway_location": CacheKey(
                pattern="gateway:location:{gateway_id}",
                ttl=1800,
                description="Gateway location coordinates",
                category=CacheCategory.GATEWAY,
            ),
            "site_info": CacheKey(
                pattern="site:info:{site_id}",
                ttl=3600,
                description="Site information and metadata",
                category=CacheCategory.SITE,
            ),
            "user_session": CacheKey(
                pattern="user:session:{user_id}",
                ttl=1800,
                description="User session data",
                category=CacheCategory.USER,
            ),
            "alert_config": CacheKey(
                pattern="alert:config:{organization_id}",
                ttl=1800,
                description="Alert configuration settings",
                category=CacheCategory.ALERT,
            ),
            "dashboard_metrics": CacheKey(
                pattern="analytics:dashboard:{organization_id}",
                ttl=300,
                description="Dashboard analytics metrics",
                category=CacheCategory.ANALYTICS,
            ),
            "search_results": CacheKey(
                pattern="search:results:{query_hash}",
                ttl=600,
                description="Cached search results",
                category=CacheCategory.SEARCH,
            ),
            "ml_predictions": CacheKey(
                pattern="ml:predictions:{asset_id}",
                ttl=60,
                description="ML model predictions",
                category=CacheCategory.ML,
            ),
            "rate_limit": CacheKey(
                pattern="rate:limit:{identifier}",
                ttl=60,
                description="Rate limiting counters",
                category=CacheCategory.SYSTEM,
            ),
            "websocket_connection": CacheKey(
                pattern="ws:connection:{connection_id}",
                ttl=300,
                description="WebSocket connection state",
                category=CacheCategory.SYSTEM,
            ),
        }

    def get_key(self, strategy_name: str, **kwargs) -> str:
        """Generate cache key from strategy and parameters"""
        if strategy_name not in self.strategies:
            raise ValueError(f"Unknown cache strategy: {strategy_name}")

        strategy = self.strategies[strategy_name]
        return strategy.pattern.format(**kwargs)

    def get_ttl(self, strategy_name: str) -> int:
        """Get TTL for a cache strategy"""
        if strategy_name not in self.strategies:
            raise ValueError(f"Unknown cache strategy: {strategy_name}")

        return self.strategies[strategy_name].ttl

    def get_keys_by_category(self, category: CacheCategory) -> List[str]:
        """Get all strategy names for a category"""
        return [
            name
            for name, strategy in self.strategies.items()
            if strategy.category == category
        ]

    def get_all_strategies(self) -> Dict[str, CacheKey]:
        """Get all cache strategies"""
        return self.strategies.copy()


class CacheMetrics:
    """Cache performance metrics"""

    def __init__(self) -> None:
        self.hits = 0
        self.misses = 0
        self.sets = 0
        self.deletes = 0
        self.errors = 0

    def record_hit(self) -> None:
        """Record a cache hit"""
        self.hits += 1

    def record_miss(self) -> None:
        """Record a cache miss"""
        self.misses += 1

    def record_set(self) -> None:
        """Record a cache set operation"""
        self.sets += 1

    def record_delete(self) -> None:
        """Record a cache delete operation"""
        self.deletes += 1

    def record_error(self) -> None:
        """Record a cache error"""
        self.errors += 1

    @property
    def hit_rate(self) -> float:
        """Calculate cache hit rate"""
        total = self.hits + self.misses
        return self.hits / total if total > 0 else 0.0

    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        return {
            "hits": self.hits,
            "misses": self.misses,
            "sets": self.sets,
            "deletes": self.deletes,
            "errors": self.errors,
            "hit_rate": self.hit_rate,
            "total_operations": self.hits + self.misses + self.sets + self.deletes,
        }


# Global instances
cache_key_manager = CacheKeyManager()
cache_metrics = CacheMetrics()


# Utility functions
def generate_asset_location_key(asset_id: str) -> str:
    """Generate cache key for asset location"""
    return cache_key_manager.get_key("asset_location", asset_id=asset_id)


def generate_asset_state_key(asset_id: str) -> str:
    """Generate cache key for asset state"""
    return cache_key_manager.get_key("asset_state", asset_id=asset_id)


def generate_geofence_boundary_key(geofence_id: str) -> str:
    """Generate cache key for geofence boundary"""
    return cache_key_manager.get_key("geofence_boundary", geofence_id=geofence_id)


def generate_search_results_key(query: str, filters: Dict[str, Any]) -> str:
    """Generate cache key for search results"""
    import hashlib

    query_data = {"query": query, "filters": filters}
    query_hash = hashlib.sha256(
        json.dumps(query_data, sort_keys=True).encode()
    ).hexdigest()
    return cache_key_manager.get_key("search_results", query_hash=query_hash)


def generate_dashboard_metrics_key(organization_id: str) -> str:
    """Generate cache key for dashboard metrics"""
    return cache_key_manager.get_key(
        "dashboard_metrics", organization_id=organization_id
    )


def generate_ml_predictions_key(asset_id: str) -> str:
    """Generate cache key for ML predictions"""
    return cache_key_manager.get_key("ml_predictions", asset_id=asset_id)


# Cache invalidation patterns
class CacheInvalidation:
    """Cache invalidation utilities"""

    @staticmethod
    async def invalidate_asset_cache(redis_client, asset_id: str) -> None:
        """Invalidate all cache entries for an asset"""
        patterns = [
            "asset:location:{asset_id}",
            "asset:state:{asset_id}",
            "asset:baseline:{asset_id}",
            "asset:features:{asset_id}",
            "ml:predictions:{asset_id}",
        ]

        for pattern in patterns:
            key = pattern.format(asset_id=asset_id)
            await redis_client.delete(key)
            logger.debug(f"Invalidated cache key: {key}")

    @staticmethod
    async def invalidate_geofence_cache(redis_client, geofence_id: str) -> None:
        """Invalidate all cache entries for a geofence"""
        patterns = ["geofence:boundary:{geofence_id}", "geofence:rules:{geofence_id}"]

        for pattern in patterns:
            key = pattern.format(geofence_id=geofence_id)
            await redis_client.delete(key)
            logger.debug(f"Invalidated cache key: {key}")

    @staticmethod
    async def invalidate_organization_cache(redis_client, organization_id: str) -> None:
        """Invalidate organization-wide cache entries"""
        patterns = [
            "alert:config:{organization_id}",
            "analytics:dashboard:{organization_id}",
        ]

        for pattern in patterns:
            key = pattern.format(organization_id=organization_id)
            await redis_client.delete(key)
            logger.debug(f"Invalidated cache key: {key}")

    @staticmethod
    async def invalidate_search_cache(redis_client) -> None:
        """Invalidate all search result caches"""
        keys = await redis_client.keys("search:results:*")
        if keys:
            await redis_client.delete(*keys)
            logger.debug(f"Invalidated {len(keys)} search cache keys")
