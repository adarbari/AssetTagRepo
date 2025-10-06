"""
Alert generation service
"""
import logging
from datetime import datetime
from typing import Any, Dict

from config.database import get_db
from modules.alerts.models import Alert

logger = logging.getLogger(__name__)


class AlertGenerator:
    """Alert generation service"""

    def __init__(self):
        pass

    async def create_alert(self, alert_data: Dict[str, Any]):
        """Create a new alert"""
        try:
            async for db in get_db():
                alert = Alert(
                    organization_id="00000000-0000-0000-0000-000000000000",  # Default org
                    alert_type=alert_data["alert_type"],
                    severity=alert_data["severity"],
                    status="active",
                    asset_id=alert_data["asset_id"],
                    asset_name=alert_data.get(
                        "asset_name", f"Asset {alert_data['asset_id']}"
                    ),
                    message=alert_data["message"],
                    description=alert_data.get("description"),
                    reason=alert_data.get("reason"),
                    suggested_action=alert_data.get("suggested_action"),
                    location_description=alert_data.get("location_description"),
                    latitude=alert_data.get("latitude"),
                    longitude=alert_data.get("longitude"),
                    geofence_id=alert_data.get("geofence_id"),
                    geofence_name=alert_data.get("geofence_name"),
                    triggered_at=datetime.fromisoformat(alert_data["triggered_at"]),
                    auto_resolvable=alert_data.get("auto_resolvable", False),
                    metadata=alert_data.get("metadata", {}),
                )

                db.add(alert)
                await db.commit()

                logger.info(
                    f"Created alert {alert.id} for asset {alert_data['asset_id']}"
                )
                break

        except Exception as e:
            logger.error(f"Error creating alert: {e}")

    async def acknowledge_alert(self, alert_id: str, user_id: str = None):
        """Acknowledge an alert"""
        try:
            async for db in get_db():
                result = await db.execute(db.query(Alert).where(Alert.id == alert_id))
                alert = result.scalar_one_or_none()

                if alert:
                    alert.status = "acknowledged"
                    alert.acknowledged_at = datetime.now()
                    await db.commit()
                    logger.info(f"Alert {alert_id} acknowledged")
                break

        except Exception as e:
            logger.error(f"Error acknowledging alert {alert_id}: {e}")

    async def resolve_alert(
        self, alert_id: str, user_id: str = None, notes: str = None
    ):
        """Resolve an alert"""
        try:
            async for db in get_db():
                result = await db.execute(db.query(Alert).where(Alert.id == alert_id))
                alert = result.scalar_one_or_none()

                if alert:
                    alert.status = "resolved"
                    alert.resolved_at = datetime.now()
                    alert.resolution_notes = notes
                    if user_id:
                        alert.resolved_by_user_id = user_id
                    await db.commit()
                    logger.info(f"Alert {alert_id} resolved")
                break

        except Exception as e:
            logger.error(f"Error resolving alert {alert_id}: {e}")
