"""
Analytics aggregators for utilization and cost tracking
"""
import logging
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from sqlalchemy import text

from config.database import get_db

logger = logging.getLogger(__name__)


@dataclass
class UtilizationMetrics:
    """Utilization metrics for an asset"""

    asset_id: str
    date: datetime
    hours_active: float
    total_distance: float
    utilization_rate: float
    unique_gateways: int
    movement_events: int


@dataclass
class CostMetrics:
    """Cost metrics for an asset"""

    asset_id: str
    period_start: datetime
    period_end: datetime
    total_cost: float
    utilization_cost: float
    maintenance_cost: float
    fuel_cost: float
    depreciation_cost: float


class UtilizationAnalyzer:
    """Analyzer for asset utilization metrics"""

    def __init__(self):
        self.db = None

    async def _get_db(self):
        """Get database session"""
        if not self.db:
            self.db = await get_db()
        return self.db

    async def calculate_daily_utilization(
        self, asset_id: str, date: datetime
    ) -> UtilizationMetrics:
        """Calculate daily utilization metrics for an asset"""
        try:
            db = await self._get_db()

            # Get location data for the day
            start_time = date.replace(hour=0, minute=0, second=0, microsecond=0)
            end_time = start_time + timedelta(days=1)

            query = text(
                """
                SELECT 
                    COUNT(*) as total_locations,
                    COUNT(DISTINCT gateway_ids) as unique_gateways,
                    SUM(distance_from_previous) as total_distance,
                    COUNT(CASE WHEN distance_from_previous > 0 THEN 1 END) as movement_events,
                    EXTRACT(EPOCH FROM (MAX(estimated_at) - MIN(estimated_at))) / 3600 as hours_active
                FROM estimated_locations
                WHERE asset_id = :asset_id
                    AND estimated_at >= :start_time
                    AND estimated_at < :end_time
            """
            )

            result = await db.execute(
                query,
                {"asset_id": asset_id, "start_time": start_time, "end_time": end_time},
            )

            row = result.fetchone()

            if not row or row.total_locations == 0:
                return UtilizationMetrics(
                    asset_id=asset_id,
                    date=date,
                    hours_active=0.0,
                    total_distance=0.0,
                    utilization_rate=0.0,
                    unique_gateways=0,
                    movement_events=0,
                )

            # Calculate utilization rate (hours active / 24 hours)
            hours_active = float(row.hours_active or 0)
            utilization_rate = min(hours_active / 24.0, 1.0)

            return UtilizationMetrics(
                asset_id=asset_id,
                date=date,
                hours_active=hours_active,
                total_distance=float(row.total_distance or 0),
                utilization_rate=utilization_rate,
                unique_gateways=int(row.unique_gateways or 0),
                movement_events=int(row.movement_events or 0),
            )

        except Exception as e:
            logger.error(
                f"Error calculating daily utilization for asset {asset_id}: {e}"
            )
            return UtilizationMetrics(
                asset_id=asset_id,
                date=date,
                hours_active=0.0,
                total_distance=0.0,
                utilization_rate=0.0,
                unique_gateways=0,
                movement_events=0,
            )

    async def calculate_weekly_utilization(
        self, asset_id: str, week_start: datetime
    ) -> Dict[str, Any]:
        """Calculate weekly utilization metrics"""
        try:
            daily_metrics = []
            total_hours = 0.0
            total_distance = 0.0
            total_movement_events = 0
            unique_gateways = set()

            for i in range(7):
                date = week_start + timedelta(days=i)
                daily_metric = await self.calculate_daily_utilization(asset_id, date)
                daily_metrics.append(daily_metric)

                total_hours += daily_metric.hours_active
                total_distance += daily_metric.total_distance
                total_movement_events += daily_metric.movement_events
                unique_gateways.update([daily_metric.unique_gateways])

            avg_utilization_rate = total_hours / (7 * 24.0)

            return {
                "asset_id": asset_id,
                "week_start": week_start.isoformat(),
                "week_end": (week_start + timedelta(days=6)).isoformat(),
                "total_hours_active": total_hours,
                "total_distance": total_distance,
                "total_movement_events": total_movement_events,
                "unique_gateways": len(unique_gateways),
                "average_utilization_rate": avg_utilization_rate,
                "daily_metrics": [
                    {
                        "date": metric.date.isoformat(),
                        "hours_active": metric.hours_active,
                        "total_distance": metric.total_distance,
                        "utilization_rate": metric.utilization_rate,
                        "movement_events": metric.movement_events,
                    }
                    for metric in daily_metrics
                ],
            }

        except Exception as e:
            logger.error(
                f"Error calculating weekly utilization for asset {asset_id}: {e}"
            )
            return {"asset_id": asset_id, "error": str(e)}

    async def calculate_monthly_utilization(
        self, asset_id: str, month: int, year: int
    ) -> Dict[str, Any]:
        """Calculate monthly utilization metrics"""
        try:
            start_date = datetime(year, month, 1)
            if month == 12:
                end_date = datetime(year + 1, 1, 1)
            else:
                end_date = datetime(year, month + 1, 1)

            db = await self._get_db()

            query = text(
                """
                SELECT 
                    COUNT(*) as total_locations,
                    COUNT(DISTINCT gateway_ids) as unique_gateways,
                    SUM(distance_from_previous) as total_distance,
                    COUNT(CASE WHEN distance_from_previous > 0 THEN 1 END) as movement_events,
                    EXTRACT(EPOCH FROM (MAX(estimated_at) - MIN(estimated_at))) / 3600 as hours_active,
                    COUNT(DISTINCT DATE(estimated_at)) as active_days
                FROM estimated_locations
                WHERE asset_id = :asset_id
                    AND estimated_at >= :start_date
                    AND estimated_at < :end_date
            """
            )

            result = await db.execute(
                query,
                {"asset_id": asset_id, "start_date": start_date, "end_date": end_date},
            )

            row = result.fetchone()

            if not row or row.total_locations == 0:
                return {
                    "asset_id": asset_id,
                    "month": month,
                    "year": year,
                    "total_hours_active": 0.0,
                    "total_distance": 0.0,
                    "total_movement_events": 0,
                    "unique_gateways": 0,
                    "active_days": 0,
                    "utilization_rate": 0.0,
                }

            # Calculate utilization rate
            days_in_month = (end_date - start_date).days
            hours_active = float(row.hours_active or 0)
            utilization_rate = min(hours_active / (days_in_month * 24.0), 1.0)

            return {
                "asset_id": asset_id,
                "month": month,
                "year": year,
                "total_hours_active": hours_active,
                "total_distance": float(row.total_distance or 0),
                "total_movement_events": int(row.movement_events or 0),
                "unique_gateways": int(row.unique_gateways or 0),
                "active_days": int(row.active_days or 0),
                "utilization_rate": utilization_rate,
            }

        except Exception as e:
            logger.error(
                f"Error calculating monthly utilization for asset {asset_id}: {e}"
            )
            return {"asset_id": asset_id, "month": month, "year": year, "error": str(e)}


class CostAnalyzer:
    """Analyzer for cost tracking metrics"""

    def __init__(self):
        self.db = None

    async def _get_db(self):
        """Get database session"""
        if not self.db:
            self.db = await get_db()
        return self.db

    async def calculate_asset_costs(
        self, asset_id: str, start_date: datetime, end_date: datetime
    ) -> CostMetrics:
        """Calculate total costs for an asset over a period"""
        try:
            db = await self._get_db()

            # Get maintenance costs
            maintenance_query = text(
                """
                SELECT COALESCE(SUM(actual_cost), 0) as maintenance_cost
                FROM maintenance_records
                WHERE asset_id = :asset_id
                    AND completed_date >= :start_date
                    AND completed_date < :end_date
                    AND actual_cost IS NOT NULL
            """
            )

            maintenance_result = await db.execute(
                maintenance_query,
                {"asset_id": asset_id, "start_date": start_date, "end_date": end_date},
            )
            maintenance_cost = float(
                maintenance_result.fetchone().maintenance_cost or 0
            )

            # Get utilization costs (based on hours used)
            utilization_query = text(
                """
                SELECT 
                    COUNT(*) as total_locations,
                    EXTRACT(EPOCH FROM (MAX(estimated_at) - MIN(estimated_at))) / 3600 as hours_active
                FROM estimated_locations
                WHERE asset_id = :asset_id
                    AND estimated_at >= :start_date
                    AND estimated_at < :end_date
            """
            )

            utilization_result = await db.execute(
                utilization_query,
                {"asset_id": asset_id, "start_date": start_date, "end_date": end_date},
            )
            utilization_row = utilization_result.fetchone()

            hours_active = (
                float(utilization_row.hours_active or 0) if utilization_row else 0.0
            )
            hourly_rate = 50.0  # Default hourly rate, should be configurable
            utilization_cost = hours_active * hourly_rate

            # Get fuel costs (estimated based on distance)
            distance_query = text(
                """
                SELECT COALESCE(SUM(distance_from_previous), 0) as total_distance
                FROM estimated_locations
                WHERE asset_id = :asset_id
                    AND estimated_at >= :start_date
                    AND estimated_at < :end_date
                    AND distance_from_previous IS NOT NULL
            """
            )

            distance_result = await db.execute(
                distance_query,
                {"asset_id": asset_id, "start_date": start_date, "end_date": end_date},
            )
            total_distance = float(distance_result.fetchone().total_distance or 0)

            fuel_efficiency = 10.0  # km per liter, should be configurable
            fuel_price = 1.5  # per liter, should be configurable
            fuel_cost = (
                (total_distance / 1000) / fuel_efficiency * fuel_price
            )  # Convert to km

            # Depreciation cost (simplified)
            days_in_period = (end_date - start_date).days
            annual_depreciation = 10000.0  # Should be configurable per asset
            depreciation_cost = (annual_depreciation / 365) * days_in_period

            total_cost = (
                maintenance_cost + utilization_cost + fuel_cost + depreciation_cost
            )

            return CostMetrics(
                asset_id=asset_id,
                period_start=start_date,
                period_end=end_date,
                total_cost=total_cost,
                utilization_cost=utilization_cost,
                maintenance_cost=maintenance_cost,
                fuel_cost=fuel_cost,
                depreciation_cost=depreciation_cost,
            )

        except Exception as e:
            logger.error(f"Error calculating costs for asset {asset_id}: {e}")
            return CostMetrics(
                asset_id=asset_id,
                period_start=start_date,
                period_end=end_date,
                total_cost=0.0,
                utilization_cost=0.0,
                maintenance_cost=0.0,
                fuel_cost=0.0,
                depreciation_cost=0.0,
            )

    async def calculate_organization_costs(
        self, organization_id: str, start_date: datetime, end_date: datetime
    ) -> Dict[str, Any]:
        """Calculate total costs for an organization"""
        try:
            db = await self._get_db()

            # Get all assets for the organization
            assets_query = text(
                """
                SELECT id FROM assets
                WHERE organization_id = :organization_id
            """
            )

            assets_result = await db.execute(
                assets_query, {"organization_id": organization_id}
            )
            asset_ids = [str(row.id) for row in assets_result.fetchall()]

            total_costs = {
                "total_cost": 0.0,
                "utilization_cost": 0.0,
                "maintenance_cost": 0.0,
                "fuel_cost": 0.0,
                "depreciation_cost": 0.0,
                "asset_count": len(asset_ids),
                "asset_costs": [],
            }

            for asset_id in asset_ids:
                asset_cost = await self.calculate_asset_costs(
                    asset_id, start_date, end_date
                )
                total_costs["total_cost"] += asset_cost.total_cost
                total_costs["utilization_cost"] += asset_cost.utilization_cost
                total_costs["maintenance_cost"] += asset_cost.maintenance_cost
                total_costs["fuel_cost"] += asset_cost.fuel_cost
                total_costs["depreciation_cost"] += asset_cost.depreciation_cost

                total_costs["asset_costs"].append(
                    {
                        "asset_id": asset_id,
                        "total_cost": asset_cost.total_cost,
                        "utilization_cost": asset_cost.utilization_cost,
                        "maintenance_cost": asset_cost.maintenance_cost,
                        "fuel_cost": asset_cost.fuel_cost,
                        "depreciation_cost": asset_cost.depreciation_cost,
                    }
                )

            return total_costs

        except Exception as e:
            logger.error(f"Error calculating organization costs: {e}")
            return {"error": str(e), "total_cost": 0.0, "asset_count": 0}


class HeatmapAnalyzer:
    """Analyzer for location heatmap data"""

    def __init__(self):
        self.db = None

    async def _get_db(self):
        """Get database session"""
        if not self.db:
            self.db = await get_db()
        return self.db

    async def generate_location_heatmap(
        self,
        organization_id: str,
        start_date: datetime,
        end_date: datetime,
        grid_size: float = 0.001,  # Grid size in degrees
    ) -> Dict[str, Any]:
        """Generate location heatmap data"""
        try:
            db = await self._get_db()

            query = text(
                """
                SELECT 
                    ROUND(latitude / :grid_size) * :grid_size as grid_lat,
                    ROUND(longitude / :grid_size) * :grid_size as grid_lng,
                    COUNT(*) as location_count,
                    COUNT(DISTINCT asset_id) as unique_assets
                FROM estimated_locations el
                JOIN assets a ON el.asset_id = a.id
                WHERE a.organization_id = :organization_id
                    AND el.estimated_at >= :start_date
                    AND el.estimated_at < :end_date
                GROUP BY grid_lat, grid_lng
                HAVING COUNT(*) > 0
                ORDER BY location_count DESC
            """
            )

            result = await db.execute(
                query,
                {
                    "organization_id": organization_id,
                    "start_date": start_date,
                    "end_date": end_date,
                    "grid_size": grid_size,
                },
            )

            heatmap_data = []
            for row in result.fetchall():
                heatmap_data.append(
                    {
                        "latitude": float(row.grid_lat),
                        "longitude": float(row.grid_lng),
                        "intensity": int(row.location_count),
                        "unique_assets": int(row.unique_assets),
                    }
                )

            return {
                "organization_id": organization_id,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "grid_size": grid_size,
                "total_points": len(heatmap_data),
                "heatmap_data": heatmap_data,
            }

        except Exception as e:
            logger.error(f"Error generating location heatmap: {e}")
            return {
                "organization_id": organization_id,
                "error": str(e),
                "heatmap_data": [],
            }
