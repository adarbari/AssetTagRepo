"""
Redis cache configuration and client management
"""
import redis.asyncio as redis
from config.settings import settings
import logging
import json
from typing import Any, Optional, Union

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
    """Redis cache manager with JSON serialization"""
    
    def __init__(self, client: redis.Redis = redis_client):
        self.client = client
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        try:
            value = await self.client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
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
            return True
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache"""
        try:
            result = await self.client.delete(key)
            return result > 0
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {e}")
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


# Global cache manager instance
cache = CacheManager()


async def get_cache() -> CacheManager:
    """Dependency to get cache manager"""
    return cache


async def close_cache():
    """Close Redis connections"""
    await redis_client.close()
    logger.info("Redis connections closed")
