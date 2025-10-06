"""
Alert Rules Engine
"""
import logging
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from config.cache import get_cache
from modules.alerts.models import Alert
from modules.alerts.schemas import AlertCreate

logger = logging.getLogger(__name__)


@dataclass
class AlertRule:
    """Alert rule definition"""

    rule_id: str
    name: str
    description: str
    alert_type: str
    severity: str
    conditions: Dict[str, Any]
    enabled: bool = True
    cooldown_minutes: int = 30  # Prevent spam alerts


class AlertRulesEngine:
    """Alert rules engine for evaluating conditions and generating alerts"""

    def __init__(self):
        self.cache = None
        self.rules: Dict[str, AlertRule] = {}
        self._initialize_default_rules()

    async def _get_cache(self):
        """Get cache client"""
        if not self.cache:
            self.cache = await get_cache()
        return self.cache

    def _initialize_default_rules(self):
        """Initialize default alert rules"""
        self.rules = {
            "battery_low": AlertRule(
                rule_id="battery_low",
                name="Low Battery Alert",
                description="Alert when asset battery level is below threshold",
                alert_type="battery_low",
                severity="warning",
                conditions={
                    "battery_threshold": 20,
                    "check_interval_minutes": 15,
                },  # 20%
            ),
            "battery_critical": AlertRule(
                rule_id="battery_critical",
                name="Critical Battery Alert",
                description="Alert when asset battery level is critically low",
                alert_type="battery_critical",
                severity="critical",
                conditions={
                    "battery_threshold": 10,
                    "check_interval_minutes": 5,
                },  # 10%
            ),
            "offline": AlertRule(
                rule_id="offline",
                name="Asset Offline Alert",
                description="Alert when asset has not been seen for specified time",
                alert_type="offline",
                severity="warning",
                conditions={
                    "offline_threshold_minutes": 30,
                    "check_interval_minutes": 10,
                },
            ),
            "unauthorized_zone": AlertRule(
                rule_id="unauthorized_zone",
                name="Unauthorized Zone Entry",
                description="Alert when asset enters unauthorized geofence",
                alert_type="unauthorized_zone",
                severity="critical",
                conditions={
                    "geofence_types": ["restricted", "unauthorized"],
                    "check_immediately": True,
                },
            ),
            "geofence_exit": AlertRule(
                rule_id="geofence_exit",
                name="Authorized Zone Exit",
                description="Alert when asset exits authorized geofence",
                alert_type="geofence_exit",
                severity="warning",
                conditions={
                    "geofence_types": ["authorized", "work_area"],
                    "check_immediately": True,
                },
            ),
            "theft_detection": AlertRule(
                rule_id="theft_detection",
                name="Theft Detection",
                description="Alert when asset moves outside working hours",
                alert_type="theft_detection",
                severity="critical",
                conditions={
                    "working_hours_start": "06:00",
                    "working_hours_end": "18:00",
                    "movement_threshold_meters": 100,
                    "check_interval_minutes": 5,
                },
            ),
            "underutilization": AlertRule(
                rule_id="underutilization",
                name="Asset Underutilization",
                description="Alert when asset has no movement for extended period",
                alert_type="underutilization",
                severity="info",
                conditions={
                    "no_movement_threshold_hours": 24,
                    "check_interval_minutes": 60,
                },
            ),
            "maintenance_overdue": AlertRule(
                rule_id="maintenance_overdue",
                name="Maintenance Overdue",
                description="Alert when maintenance is overdue",
                alert_type="maintenance_overdue",
                severity="warning",
                conditions={
                    "overdue_threshold_days": 1,
                    "check_interval_minutes": 1440,
                },  # Daily
            ),
        }

    async def evaluate_asset_conditions(
        self, asset_id: str, asset_data: Dict[str, Any]
    ) -> List[AlertCreate]:
        """Evaluate all rules for an asset and return alerts to create"""
        alerts_to_create = []
        cache = await self._get_cache()

        for rule_id, rule in self.rules.items():
            if not rule.enabled:
                continue

            # Check cooldown
            cooldown_key = f"alert_cooldown:{rule_id}:{asset_id}"
            if await cache.get(cooldown_key):
                continue

            # Evaluate rule conditions
            should_alert = await self._evaluate_rule(rule, asset_id, asset_data, cache)

            if should_alert:
                alert_data = await self._create_alert_data(rule, asset_id, asset_data)
                alerts_to_create.append(alert_data)

                # Set cooldown
                await cache.set(cooldown_key, True, ttl=rule.cooldown_minutes * 60)

        return alerts_to_create

    async def _evaluate_rule(
        self, rule: AlertRule, asset_id: str, asset_data: Dict[str, Any], cache
    ) -> bool:
        """Evaluate a specific rule"""
        try:
            if rule.rule_id == "battery_low":
                return await self._check_battery_low(rule, asset_data)
            elif rule.rule_id == "battery_critical":
                return await self._check_battery_critical(rule, asset_data)
            elif rule.rule_id == "offline":
                return await self._check_offline(rule, asset_id, cache)
            elif rule.rule_id == "unauthorized_zone":
                return await self._check_unauthorized_zone(rule, asset_data)
            elif rule.rule_id == "geofence_exit":
                return await self._check_geofence_exit(rule, asset_data)
            elif rule.rule_id == "theft_detection":
                return await self._check_theft_detection(rule, asset_data)
            elif rule.rule_id == "underutilization":
                return await self._check_underutilization(rule, asset_id, cache)
            elif rule.rule_id == "maintenance_overdue":
                return await self._check_maintenance_overdue(rule, asset_id, cache)

            return False

        except Exception as e:
            logger.error(f"Error evaluating rule {rule.rule_id}: {e}")
            return False

    async def _check_battery_low(
        self, rule: AlertRule, asset_data: Dict[str, Any]
    ) -> bool:
        """Check if battery is low"""
        battery_level = asset_data.get("battery_level")
        if battery_level is None:
            return False

        threshold = rule.conditions["battery_threshold"]
        return battery_level <= threshold

    async def _check_battery_critical(
        self, rule: AlertRule, asset_data: Dict[str, Any]
    ) -> bool:
        """Check if battery is critically low"""
        battery_level = asset_data.get("battery_level")
        if battery_level is None:
            return False

        threshold = rule.conditions["battery_threshold"]
        return battery_level <= threshold

    async def _check_offline(self, rule: AlertRule, asset_id: str, cache) -> bool:
        """Check if asset is offline"""
        last_seen_key = f"asset_last_seen:{asset_id}"
        last_seen = await cache.get(last_seen_key)

        if not last_seen:
            return True  # Never seen, consider offline

        last_seen_time = datetime.fromisoformat(last_seen)
        threshold_minutes = rule.conditions["offline_threshold_minutes"]
        offline_threshold = datetime.now() - timedelta(minutes=threshold_minutes)

        return last_seen_time < offline_threshold

    async def _check_unauthorized_zone(
        self, rule: AlertRule, asset_data: Dict[str, Any]
    ) -> bool:
        """Check if asset entered unauthorized zone"""
        geofence_events = asset_data.get("geofence_events", [])
        if not geofence_events:
            return False

        # Check recent geofence events
        for event in geofence_events:
            if event.get("event_type") == "entry":
                geofence_type = event.get("geofence_type", "").lower()
                if geofence_type in rule.conditions["geofence_types"]:
                    return True

        return False

    async def _check_geofence_exit(
        self, rule: AlertRule, asset_data: Dict[str, Any]
    ) -> bool:
        """Check if asset exited authorized zone"""
        geofence_events = asset_data.get("geofence_events", [])
        if not geofence_events:
            return False

        # Check recent geofence events
        for event in geofence_events:
            if event.get("event_type") == "exit":
                geofence_type = event.get("geofence_type", "").lower()
                if geofence_type in rule.conditions["geofence_types"]:
                    return True

        return False

    async def _check_theft_detection(
        self, rule: AlertRule, asset_data: Dict[str, Any]
    ) -> bool:
        """Check for theft detection (movement outside working hours)"""
        current_time = datetime.now()
        current_hour = current_time.hour

        # Parse working hours
        start_hour = int(rule.conditions["working_hours_start"].split(":")[0])
        end_hour = int(rule.conditions["working_hours_end"].split(":")[0])

        # Check if outside working hours
        if not (start_hour <= current_hour < end_hour):
            # Check if there's significant movement
            movement = asset_data.get("movement_distance_meters", 0)
            threshold = rule.conditions["movement_threshold_meters"]

            if movement > threshold:
                return True

        return False

    async def _check_underutilization(
        self, rule: AlertRule, asset_id: str, cache
    ) -> bool:
        """Check if asset is underutilized"""
        last_movement_key = f"asset_last_movement:{asset_id}"
        last_movement = await cache.get(last_movement_key)

        if not last_movement:
            return True  # No movement recorded

        last_movement_time = datetime.fromisoformat(last_movement)
        threshold_hours = rule.conditions["no_movement_threshold_hours"]
        underutilization_threshold = datetime.now() - timedelta(hours=threshold_hours)

        return last_movement_time < underutilization_threshold

    async def _check_maintenance_overdue(
        self, rule: AlertRule, asset_id: str, cache
    ) -> bool:
        """Check if maintenance is overdue"""
        # This would typically query the maintenance records
        # For now, we'll use a simplified approach
        maintenance_key = f"asset_maintenance_due:{asset_id}"
        maintenance_due = await cache.get(maintenance_key)

        if not maintenance_due:
            return False

        due_date = datetime.fromisoformat(maintenance_due)
        overdue_threshold = datetime.now() - timedelta(
            days=rule.conditions["overdue_threshold_days"]
        )

        return due_date < overdue_threshold

    async def _create_alert_data(
        self, rule: AlertRule, asset_id: str, asset_data: Dict[str, Any]
    ) -> AlertCreate:
        """Create alert data from rule and asset data"""
        asset_name = asset_data.get("name", f"Asset {asset_id}")

        # Generate alert message based on rule type
        message = self._generate_alert_message(rule, asset_data)
        description = self._generate_alert_description(rule, asset_data)
        suggested_action = self._generate_suggested_action(rule)

        return AlertCreate(
            alert_type=rule.alert_type,
            severity=rule.severity,
            asset_id=asset_id,
            asset_name=asset_name,
            message=message,
            description=description,
            suggested_action=suggested_action,
            triggered_at=datetime.now().isoformat(),
            auto_resolvable=rule.severity != "critical",
            metadata={
                "rule_id": rule.rule_id,
                "rule_name": rule.name,
                "asset_data": asset_data,
            },
        )

    def _generate_alert_message(
        self, rule: AlertRule, asset_data: Dict[str, Any]
    ) -> str:
        """Generate alert message based on rule type"""
        asset_name = asset_data.get("name", "Asset")

        if rule.rule_id == "battery_low":
            battery_level = asset_data.get("battery_level", 0)
            return f"{asset_name} battery is low ({battery_level}%)"
        elif rule.rule_id == "battery_critical":
            battery_level = asset_data.get("battery_level", 0)
            return f"{asset_name} battery is critically low ({battery_level}%)"
        elif rule.rule_id == "offline":
            return f"{asset_name} has been offline for extended period"
        elif rule.rule_id == "unauthorized_zone":
            return f"{asset_name} entered unauthorized zone"
        elif rule.rule_id == "geofence_exit":
            return f"{asset_name} exited authorized zone"
        elif rule.rule_id == "theft_detection":
            return f"{asset_name} detected movement outside working hours"
        elif rule.rule_id == "underutilization":
            return f"{asset_name} has been underutilized"
        elif rule.rule_id == "maintenance_overdue":
            return f"{asset_name} maintenance is overdue"
        else:
            return f"{asset_name} alert triggered"

    def _generate_alert_description(
        self, rule: AlertRule, asset_data: Dict[str, Any]
    ) -> str:
        """Generate alert description"""
        return f"{rule.description}. Asset: {asset_data.get('name', 'Unknown')}"

    def _generate_suggested_action(self, rule: AlertRule) -> str:
        """Generate suggested action based on rule type"""
        if rule.rule_id in ["battery_low", "battery_critical"]:
            return "Check and replace battery if necessary"
        elif rule.rule_id == "offline":
            return "Check asset connectivity and location"
        elif rule.rule_id in ["unauthorized_zone", "theft_detection"]:
            return "Investigate immediately and contact security if needed"
        elif rule.rule_id == "geofence_exit":
            return "Verify asset location and return to authorized area"
        elif rule.rule_id == "underutilization":
            return "Review asset utilization and consider reassignment"
        elif rule.rule_id == "maintenance_overdue":
            return "Schedule maintenance immediately"
        else:
            return "Review and take appropriate action"

    def add_rule(self, rule: AlertRule):
        """Add a new alert rule"""
        self.rules[rule.rule_id] = rule

    def remove_rule(self, rule_id: str):
        """Remove an alert rule"""
        if rule_id in self.rules:
            del self.rules[rule_id]

    def update_rule(self, rule_id: str, updates: Dict[str, Any]):
        """Update an existing alert rule"""
        if rule_id in self.rules:
            rule = self.rules[rule_id]
            for key, value in updates.items():
                if hasattr(rule, key):
                    setattr(rule, key, value)

    def get_rule(self, rule_id: str) -> Optional[AlertRule]:
        """Get an alert rule by ID"""
        return self.rules.get(rule_id)

    def get_all_rules(self) -> Dict[str, AlertRule]:
        """Get all alert rules"""
        return self.rules.copy()
