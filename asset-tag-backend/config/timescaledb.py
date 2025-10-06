"""
TimescaleDB configuration and utilities
"""

import logging
from typing import Any, Dict, List, Optional

from sqlalchemy import text

from config.database import get_db
from config.settings import settings

logger = logging.getLogger(__name__)


class TimescaleDBManager:
    """TimescaleDB management utilities"""

    def __init__(self) -> None:
        self.db = None

    async def _get_db(self) -> None:
        """Get database session"""
        if not self.db:
            self.db = await get_db()
        return self.db

    async def get_hypertable_info(self) -> List[Dict[str, Any]]:
        """Get information about all hypertables"""
        try:
            db = await self._get_db()
            result = await db.execute(
                text(
                    """
                SELECT 
                    hypertable_name,
                    num_dimensions,
                    num_chunks,
                    table_size,
                    index_size,
                    toast_size,
                    total_size
                FROM timescaledb_information.hypertables
                ORDER BY hypertable_name;
            """
                )
            )

            return [dict(row._mapping) for row in result.fetchall()]

        except Exception as e:
            logger.error(f"Error getting hypertable info: {e}")
            return []

    async def get_chunk_info(self, hypertable_name: str) -> List[Dict[str, Any]]:
        """Get information about chunks for a hypertable"""
        try:
            db = await self._get_db()
            result = await db.execute(
                text(
                    """
                SELECT 
                    chunk_name,
                    range_start,
                    range_end,
                    table_size,
                    index_size,
                    toast_size,
                    total_size
                FROM timescaledb_information.chunks
                WHERE hypertable_name = :hypertable_name
                ORDER BY range_start DESC;
            """
                ),
                {"hypertable_name": hypertable_name},
            )

            return [dict(row._mapping) for row in result.fetchall()]

        except Exception as e:
            logger.error(f"Error getting chunk info for {hypertable_name}: {e}")
            return []

    async def get_compression_info(self) -> List[Dict[str, Any]]:
        """Get compression information"""
        try:
            db = await self._get_db()
            result = await db.execute(
                text(
                    """
                SELECT 
                    hypertable_name,
                    before_compression_total_bytes,
                    after_compression_total_bytes,
                    compression_ratio,
                    number_of_chunks
                FROM timescaledb_information.compression_stats
                ORDER BY compression_ratio DESC;
            """
                )
            )

            return [dict(row._mapping) for row in result.fetchall()]

        except Exception as e:
            logger.error(f"Error getting compression info: {e}")
            return []

    async def get_retention_policies(self) -> List[Dict[str, Any]]:
        """Get retention policies"""
        try:
            db = await self._get_db()
            result = await db.execute(
                text(
                    """
                SELECT 
                    hypertable_name,
                    policy_name,
                    retention_interval,
                    created
                FROM timescaledb_information.jobs
                WHERE proc_name = 'policy_retention'
                ORDER BY hypertable_name;
            """
                )
            )

            return [dict(row._mapping) for row in result.fetchall()]

        except Exception as e:
            logger.error(f"Error getting retention policies: {e}")
            return []

    async def refresh_materialized_views(self) -> bool:
        """Refresh all analytics materialized views"""
        try:
            db = await self._get_db()
            await db.execute(text("SELECT refresh_analytics_views();"))
            await db.commit()
            logger.info("Successfully refreshed all analytics materialized views")
            return True

        except Exception as e:
            logger.error(f"Error refreshing materialized views: {e}")
            return False

    async def get_continuous_aggregates(self) -> List[Dict[str, Any]]:
        """Get information about continuous aggregates"""
        try:
            db = await self._get_db()
            result = await db.execute(
                text(
                    """
                SELECT 
                    view_name,
                    view_owner,
                    materialized_only,
                    finalized,
                    bucket_width,
                    compression_enabled,
                    materialization_hypertable,
                    materialization_hypertable_schema
                FROM timescaledb_information.continuous_aggregates
                ORDER BY view_name;
            """
                )
            )

            return [dict(row._mapping) for row in result.fetchall()]

        except Exception as e:
            logger.error(f"Error getting continuous aggregates: {e}")
            return []

    async def create_continuous_aggregate(
        self, view_name: str, query: str, bucket_width: str = "1 hour"
    ) -> bool:
        """Create a continuous aggregate"""
        try:
            db = await self._get_db()
            await db.execute(
                text(
                    f"""
                CREATE MATERIALIZED VIEW {view_name}
                WITH (timescaledb.continuous) AS
                {query}
            """
                )
            )
            await db.commit()
            logger.info(f"Successfully created continuous aggregate: {view_name}")
            return True

        except Exception as e:
            logger.error(f"Error creating continuous aggregate {view_name}: {e}")
            return False

    async def get_hypertable_stats(
        self, hypertable_name: str
    ) -> Optional[Dict[str, Any]]:
        """Get detailed statistics for a hypertable"""
        try:
            db = await self._get_db()

            # Get basic stats
            result = await db.execute(
                text(
                    """
                SELECT 
                    hypertable_name,
                    num_dimensions,
                    num_chunks,
                    table_size,
                    index_size,
                    toast_size,
                    total_size
                FROM timescaledb_information.hypertables
                WHERE hypertable_name = :hypertable_name;
            """
                ),
                {"hypertable_name": hypertable_name},
            )

            stats = result.fetchone()
            if not stats:
                return None

            stats_dict = dict(stats._mapping)

            # Get chunk count by time range
            chunk_result = await db.execute(
                text(
                    """
                SELECT 
                    COUNT(*) as chunk_count,
                    MIN(range_start) as oldest_chunk,
                    MAX(range_end) as newest_chunk
                FROM timescaledb_information.chunks
                WHERE hypertable_name = :hypertable_name;
            """
                ),
                {"hypertable_name": hypertable_name},
            )

            chunk_stats = chunk_result.fetchone()
            if chunk_stats:
                stats_dict.update(dict(chunk_stats._mapping))

            return stats_dict

        except Exception as e:
            logger.error(f"Error getting stats for {hypertable_name}: {e}")
            return None


# Global TimescaleDB manager instance
timescaledb_manager = TimescaleDBManager()


async def get_timescaledb_manager() -> TimescaleDBManager:
    """Dependency to get TimescaleDB manager"""
    return timescaledb_manager


# Utility functions for common operations
async def get_hypertable_size(hypertable_name: str) -> Optional[str]:
    """Get human-readable size of a hypertable"""
    try:
        manager = await get_timescaledb_manager()
        stats = await manager.get_hypertable_stats(hypertable_name)
        if stats and "total_size" in stats:
            return stats["total_size"]
        return None
    except Exception as e:
        logger.error(f"Error getting size for {hypertable_name}: {e}")
        return None


async def get_compression_ratio(hypertable_name: str) -> Optional[float]:
    """Get compression ratio for a hypertable"""
    try:
        manager = await get_timescaledb_manager()
        compression_info = await manager.get_compression_info()
        for info in compression_info:
            if info["hypertable_name"] == hypertable_name:
                return info.get("compression_ratio")
        return None
    except Exception as e:
        logger.error(f"Error getting compression ratio for {hypertable_name}: {e}")
        return None
