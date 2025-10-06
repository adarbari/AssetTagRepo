"""
Redis cache configuration and client management
"""
import redis.asyncio as redis
from config.settings import settings
from config.cache_strategies import cache_key_manager, cache_metrics, CacheInvalidation
import logging
import json
from typing import Any, Optional, Union, Dict, List

logger = logging.getLogger(__name__)

# Redis connection pool
redis_pool = redis.ConnectionPool.from_url(
    settings.redis_url,
    encoding="utf-8",
    decode_responses=True,
    max_connections=20
)

# Redis client
redis_client = redis.Redis(connection_pool=redis_pool)


class CacheManager:
    """Redis cache manager with JSON serialization and strategy support"""
    
    def __init__(self, client: redis.Redis = redis_client):
        self.client = client
        self.key_manager = cache_key_manager
        self.metrics = cache_metrics
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        try:
            value = await self.client.get(key)
            if value:
                self.metrics.record_hit()
                return json.loads(value)
            self.metrics.record_miss()
            return None
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
            self.metrics.record_error()
            return None
    
    async def set(
        self, 
        key: str, 
        value: Any, 
        ttl: Optional[int] = None
    ) -> bool:
        """Set value in cache"""
        try:
            serialized = json.dumps(value, default=str)
            if ttl:
                await self.client.setex(key, ttl, serialized)
            else:
                await self.client.set(key, serialized)
            self.metrics.record_set()
            return True
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {e}")
            self.metrics.record_error()
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache"""
        try:
            result = await self.client.delete(key)
            self.metrics.record_delete()
            return result > 0
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {e}")
            self.metrics.record_error()
            return False
    
    async def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        try:
            result = await self.client.exists(key)
            return result > 0
        except Exception as e:
            logger.error(f"Cache exists error for key {key}: {e}")
            return False
    
    async def get_many(self, keys: list[str]) -> dict[str, Any]:
        """Get multiple values from cache"""
        try:
            values = await self.client.mget(keys)
            result = {}
            for key, value in zip(keys, values):
                if value:
                    result[key] = json.loads(value)
            return result
        except Exception as e:
            logger.error(f"Cache get_many error: {e}")
            return {}
    
    async def set_many(
        self, 
        mapping: dict[str, Any], 
        ttl: Optional[int] = None
    ) -> bool:
        """Set multiple values in cache"""
        try:
            serialized = {
                key: json.dumps(value, default=str) 
                for key, value in mapping.items()
            }
            if ttl:
                pipe = self.client.pipeline()
                for key, value in serialized.items():
                    pipe.setex(key, ttl, value)
                await pipe.execute()
            else:
                await self.client.mset(serialized)
            return True
        except Exception as e:
            logger.error(f"Cache set_many error: {e}")
            return False
    
    async def increment(self, key: str, amount: int = 1) -> Optional[int]:
        """Increment counter in cache"""
        try:
            return await self.client.incrby(key, amount)
        except Exception as e:
            logger.error(f"Cache increment error for key {key}: {e}")
            return None
    
    async def expire(self, key: str, ttl: int) -> bool:
        """Set expiration for key"""
        try:
            result = await self.client.expire(key, ttl)
            return result
        except Exception as e:
            logger.error(f"Cache expire error for key {key}: {e}")
            return False
    
    # Strategy-based caching methods
    async def get_with_strategy(self, strategy_name: str, **kwargs) -> Optional[Any]:
        """Get value using cache strategy"""
        key = self.key_manager.get_key(strategy_name, **kwargs)
        return await self.get(key)
    
    async def set_with_strategy(self, strategy_name: str, value: Any, **kwargs) -> bool:
        """Set value using cache strategy"""
        key = self.key_manager.get_key(strategy_name, **kwargs)
        ttl = self.key_manager.get_ttl(strategy_name)
        return await self.set(key, value, ttl)
    
    async def delete_with_strategy(self, strategy_name: str, **kwargs) -> bool:
        """Delete value using cache strategy"""
        key = self.key_manager.get_key(strategy_name, **kwargs)
        return await self.delete(key)
    
    async def invalidate_asset_cache(self, asset_id: str):
        """Invalidate all cache entries for an asset"""
        await CacheInvalidation.invalidate_asset_cache(self.client, asset_id)
    
    async def invalidate_geofence_cache(self, geofence_id: str):
        """Invalidate all cache entries for a geofence"""
        await CacheInvalidation.invalidate_geofence_cache(self.client, geofence_id)
    
    async def invalidate_organization_cache(self, organization_id: str):
        """Invalidate organization-wide cache entries"""
        await CacheInvalidation.invalidate_organization_cache(self.client, organization_id)
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache performance statistics"""
        return self.metrics.get_stats()
    
    # Redis Streams support
    async def add_to_stream(self, stream_name: str, fields: Dict[str, Any]) -> str:
        """Add message to Redis stream"""
        try:
            message_id = await self.client.xadd(stream_name, fields)
            return message_id
        except Exception as e:
            logger.error(f"Error adding to stream {stream_name}: {e}")
            return None
    
    async def read_from_stream(self, stream_name: str, count: int = 10) -> List[Dict]:
        """Read messages from Redis stream"""
        try:
            messages = await self.client.xread({stream_name: "$"}, count=count)
            return messages
        except Exception as e:
            logger.error(f"Error reading from stream {stream_name}: {e}")
            return []
    
    # Pub/Sub support
    async def publish(self, channel: str, message: Any) -> int:
        """Publish message to channel"""
        try:
            serialized = json.dumps(message, default=str)
            subscribers = await self.client.publish(channel, serialized)
            return subscribers
        except Exception as e:
            logger.error(f"Error publishing to channel {channel}: {e}")
            return 0
    
    async def subscribe(self, channels: List[str]):
        """Subscribe to channels"""
        try:
            pubsub = self.client.pubsub()
            await pubsub.subscribe(*channels)
            return pubsub
        except Exception as e:
            logger.error(f"Error subscribing to channels {channels}: {e}")
            return None


# Global cache manager instance
cache = CacheManager()


async def get_cache() -> CacheManager:
    """Dependency to get cache manager"""
    return cache


async def close_cache():
    """Close Redis connections"""
    await redis_client.close()
    logger.info("Redis connections closed")
