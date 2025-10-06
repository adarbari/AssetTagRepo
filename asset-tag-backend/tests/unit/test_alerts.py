"""
Unit tests for Alerts module
"""

import uuid
from datetime import datetime

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from modules.alerts.models import Alert
from modules.alerts.rules_engine import AlertRule, AlertRulesEngine
from modules.alerts.schemas import AlertCreate, AlertUpdate


class TestAlertModel:
    """Test Alert model functionality"""

    @pytest.mark.asyncio
    async def test_create_alert(self, db_session, sample_alert_data):
        """Test creating an alert"""
        from datetime import datetime

        # Convert string timestamp to datetime object
        alert_data = sample_alert_data.copy()
        alert_data["triggered_at"] = datetime.fromisoformat(
            alert_data["triggered_at"].replace("Z", "+00:00")
        )

        alert = Alert(
            organization_id=uuid.UUID("550e8400-e29b-41d4-a716-446655440003"),
            **alert_data,
        )

        db_session.add(alert)
        await db_session.commit()
        await db_session.refresh(alert)

        assert alert.id is not None
        assert alert.alert_type == sample_alert_data["alert_type"]
        assert alert.severity == sample_alert_data["severity"]
        assert alert.asset_id == uuid.UUID(sample_alert_data["asset_id"])
        assert alert.message == sample_alert_data["message"]
        assert alert.status == "active"  # Default status

    @pytest.mark.asyncio
    async def test_alert_status_transitions(self, db_session, sample_alert_data):
        """Test alert status transitions"""
        from datetime import datetime

        # Convert string timestamp to datetime object
        alert_data = sample_alert_data.copy()
        alert_data["triggered_at"] = datetime.fromisoformat(
            alert_data["triggered_at"].replace("Z", "+00:00")
        )

        alert = Alert(
            organization_id=uuid.UUID("550e8400-e29b-41d4-a716-446655440003"),
            **alert_data,
        )

        db_session.add(alert)
        await db_session.commit()
        await db_session.refresh(alert)

        # Test acknowledge
        alert.status = "acknowledged"
        alert.acknowledged_at = datetime.now()
        await db_session.commit()

        assert alert.status == "acknowledged"
        assert alert.acknowledged_at is not None

        # Test resolve
        alert.status = "resolved"
        alert.resolved_at = datetime.now()
        await db_session.commit()

        assert alert.status == "resolved"
        assert alert.resolved_at is not None

    @pytest.mark.asyncio
    async def test_alert_metadata(self, db_session, sample_alert_data):
        """Test alert metadata handling"""
        from datetime import datetime

        # Convert string timestamp to datetime object
        alert_data = sample_alert_data.copy()
        alert_data["triggered_at"] = datetime.fromisoformat(
            alert_data["triggered_at"].replace("Z", "+00:00")
        )

        metadata = {"rule_id": "battery_low", "threshold": 20}
        alert = Alert(
            organization_id=uuid.UUID("550e8400-e29b-41d4-a716-446655440003"),
            **alert_data,
            metadata=metadata,
        )

        db_session.add(alert)
        await db_session.commit()
        await db_session.refresh(alert)

        assert alert.metadata == metadata
        assert alert.metadata["rule_id"] == "battery_low"


class TestAlertSchemas:
    """Test Alert Pydantic schemas"""

    def test_alert_create_schema(self, sample_alert_data):
        """Test AlertCreate schema validation"""
        alert_create = AlertCreate(**sample_alert_data)

        assert alert_create.alert_type == sample_alert_data["alert_type"]
        assert alert_create.severity == sample_alert_data["severity"]
        assert alert_create.asset_id == sample_alert_data["asset_id"]
        assert alert_create.message == sample_alert_data["message"]
        assert alert_create.status == "active"  # Default status

    def test_alert_create_validation(self):
        """Test AlertCreate validation rules"""
        # Test required fields
        with pytest.raises(ValueError):
            AlertCreate()

        # Test valid data
        valid_data = {
            "alert_type": "battery_low",
            "severity": "warning",
            "asset_id": "test-asset-1",
            "asset_name": "Test Asset",
            "triggered_at": "2024-01-01T12:00:00Z",
            "message": "Battery is low",
        }
        alert_create = AlertCreate(**valid_data)
        assert alert_create.alert_type == "battery_low"

    def test_alert_update_schema(self):
        """Test AlertUpdate schema"""
        update_data = {"status": "acknowledged", "resolution_notes": "Issue resolved"}

        alert_update = AlertUpdate(**update_data)
        assert alert_update.status == "acknowledged"
        assert alert_update.resolution_notes == "Issue resolved"

    def test_alert_severity_validation(self):
        """Test alert severity validation"""
        valid_severities = ["low", "medium", "high", "critical"]

        for severity in valid_severities:
            data = {
                "alert_type": "test",
                "severity": severity,
                "asset_id": "test-asset-1",
                "asset_name": "Test Asset",
                "triggered_at": "2024-01-01T12:00:00Z",
                "message": "Test alert",
            }
            alert = AlertCreate(**data)
            assert alert.severity == severity


class TestAlertRulesEngine:
    """Test AlertRulesEngine functionality"""

    def test_engine_initialization(self):
        """Test rules engine initialization"""
        engine = AlertRulesEngine()

        assert engine.rules is not None
        assert len(engine.rules) > 0
        assert "battery_low" in engine.rules
        assert "offline" in engine.rules
        assert "unauthorized_zone" in engine.rules

    @pytest.mark.asyncio
    async def test_battery_low_rule(self):
        """Test battery low rule evaluation"""
        engine = AlertRulesEngine()

        # Test with low battery
        asset_data = {"battery_level": 15}
        rule = engine.rules["battery_low"]

        # Mock the evaluation method
        result = await engine._check_battery_low(rule, asset_data)
        assert result is True

        # Test with normal battery
        asset_data = {"battery_level": 50}
        result = await engine._check_battery_low(rule, asset_data)
        assert result is False

    @pytest.mark.asyncio
    async def test_battery_critical_rule(self):
        """Test battery critical rule evaluation"""
        engine = AlertRulesEngine()

        # Test with critical battery
        asset_data = {"battery_level": 5}
        rule = engine.rules["battery_critical"]

        result = await engine._check_battery_critical(rule, asset_data)
        assert result is True

        # Test with normal battery
        asset_data = {"battery_level": 20}
        result = await engine._check_battery_critical(rule, asset_data)
        assert result is False

    @pytest.mark.asyncio
    async def test_unauthorized_zone_rule(self):
        """Test unauthorized zone rule evaluation"""
        engine = AlertRulesEngine()

        # Test with unauthorized zone entry
        asset_data = {
            "geofence_events": [{"event_type": "entry", "geofence_type": "restricted"}]
        }
        rule = engine.rules["unauthorized_zone"]

        result = await engine._check_unauthorized_zone(rule, asset_data)
        assert result is True

        # Test with authorized zone entry
        asset_data = {
            "geofence_events": [{"event_type": "entry", "geofence_type": "authorized"}]
        }

        result = await engine._check_unauthorized_zone(rule, asset_data)
        assert result is False

    @pytest.mark.asyncio
    async def test_geofence_exit_rule(self):
        """Test geofence exit rule evaluation"""
        engine = AlertRulesEngine()

        # Test with authorized zone exit
        asset_data = {
            "geofence_events": [{"event_type": "exit", "geofence_type": "authorized"}]
        }
        rule = engine.rules["geofence_exit"]

        result = await engine._check_geofence_exit(rule, asset_data)
        assert result is True

        # Test with unauthorized zone exit
        asset_data = {
            "geofence_events": [{"event_type": "exit", "geofence_type": "restricted"}]
        }

        result = await engine._check_geofence_exit(rule, asset_data)
        assert result is False

    @pytest.mark.asyncio
    async def test_theft_detection_rule(self):
        """Test theft detection rule evaluation"""
        engine = AlertRulesEngine()

        # Test movement outside working hours
        asset_data = {"movement_distance_meters": 150}  # Significant movement
        rule = engine.rules["theft_detection"]

        # Mock current time outside working hours (e.g., 2 AM)
        import datetime
        from unittest.mock import patch

        with patch("modules.alerts.rules_engine.datetime") as mock_datetime:
            mock_datetime.now.return_value = datetime.datetime(2024, 1, 1, 2, 0, 0)
            result = await engine._check_theft_detection(rule, asset_data)
            assert result is True

        # Test movement during working hours
        with patch("modules.alerts.rules_engine.datetime") as mock_datetime:
            mock_datetime.now.return_value = datetime.datetime(2024, 1, 1, 10, 0, 0)
            result = await engine._check_theft_detection(rule, asset_data)
            assert result is False

    def test_rule_management(self):
        """Test rule management functionality"""
        engine = AlertRulesEngine()

        # Test adding a new rule
        new_rule = AlertRule(
            rule_id="test_rule",
            name="Test Rule",
            description="A test rule",
            alert_type="test",
            severity="low",
            conditions={"test_condition": True},
        )

        engine.add_rule(new_rule)
        assert "test_rule" in engine.rules
        assert engine.get_rule("test_rule") == new_rule

        # Test updating a rule
        engine.update_rule("test_rule", {"enabled": False})
        assert engine.get_rule("test_rule").enabled is False

        # Test removing a rule
        engine.remove_rule("test_rule")
        assert "test_rule" not in engine.rules
        assert engine.get_rule("test_rule") is None

    def test_alert_message_generation(self):
        """Test alert message generation"""
        engine = AlertRulesEngine()

        # Test battery low message
        asset_data = {"name": "Test Asset", "battery_level": 15}
        rule = engine.rules["battery_low"]

        message = engine._generate_alert_message(rule, asset_data)
        assert "Test Asset" in message
        assert "15%" in message
        assert "battery" in message.lower()

    def test_suggested_action_generation(self):
        """Test suggested action generation"""
        engine = AlertRulesEngine()

        # Test battery low action
        rule = engine.rules["battery_low"]
        action = engine._generate_suggested_action(rule)
        assert "battery" in action.lower()
        assert "replace" in action.lower()

        # Test theft detection action
        rule = engine.rules["theft_detection"]
        action = engine._generate_suggested_action(rule)
        assert "investigate" in action.lower()
        assert "security" in action.lower()
