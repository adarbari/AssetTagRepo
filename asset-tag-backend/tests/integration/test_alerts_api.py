"""
Integration tests for Alerts API endpoints
"""
import pytest


class TestAlertsAPI:
    """Test Alerts API endpoints"""

    def test_create_alert(self, client, sample_alert_data):
        """Test creating an alert via API"""
        response = client.post("/api/v1/alerts", json=sample_alert_data)

        assert response.status_code == 201
        data = response.json()
        
        assert data["alert_type"] == sample_alert_data["alert_type"]
        assert data["severity"] == sample_alert_data["severity"]
        assert data["asset_id"] == sample_alert_data["asset_id"]
        assert data["message"] == sample_alert_data["message"]
        assert data["status"] == "active"  # Default status
        assert "id" in data
        assert "created_at" in data

    def test_get_alerts(self, client, sample_alert_data):
        """Test getting list of alerts"""
        # Create a test alert first
        client.post("/api/v1/alerts", json=sample_alert_data)

        response = client.get("/api/v1/alerts")

        assert response.status_code == 200
        data = response.json()

        assert isinstance(data, list)
        assert len(data) >= 1

        # Check that our created alert is in the list
        alert_types = [alert["alert_type"] for alert in data]
        assert sample_alert_data["alert_type"] in alert_types

    def test_get_alert_by_id(self, client, sample_alert_data):
        """Test getting a specific alert by ID"""
        # Create a test alert first
        create_response = client.post("/api/v1/alerts", json=sample_alert_data)
        alert_id = create_response.json()["id"]

        response = client.get(f"/api/v1/alerts/{alert_id}")

        assert response.status_code == 200
        data = response.json()

        assert data["id"] == alert_id
        assert data["alert_type"] == sample_alert_data["alert_type"]
        assert data["severity"] == sample_alert_data["severity"]

    def test_acknowledge_alert(self, client, sample_alert_data):
        """Test acknowledging an alert"""
        # Create a test alert first
        create_response = client.post("/api/v1/alerts", json=sample_alert_data)
        alert_id = create_response.json()["id"]

        # Acknowledge the alert
        response = client.patch(f"/api/v1/alerts/{alert_id}/acknowledge")

        assert response.status_code == 200
        data = response.json()

        assert data["status"] == "acknowledged"
        assert data["acknowledged_at"] is not None

    def test_resolve_alert(self, client, sample_alert_data):
        """Test resolving an alert"""
        # Create a test alert first
        create_response = client.post("/api/v1/alerts", json=sample_alert_data)
        alert_id = create_response.json()["id"]

        # Resolve the alert
        response = client.patch(f"/api/v1/alerts/{alert_id}/resolve")

        assert response.status_code == 200
        data = response.json()

        assert data["status"] == "resolved"
        assert data["resolved_at"] is not None

    def test_alert_filtering(self, client, sample_alert_data):
        """Test filtering alerts by various criteria"""
        # Create test alerts with different properties
        alert1_data = sample_alert_data.copy()
        alert1_data["alert_type"] = "battery_low"
        alert1_data["severity"] = "warning"

        alert2_data = sample_alert_data.copy()
        alert2_data["alert_type"] = "maintenance_due"
        alert2_data["severity"] = "info"

        client.post("/api/v1/alerts", json=alert1_data)
        client.post("/api/v1/alerts", json=alert2_data)

        # Filter by alert type
        response = client.get("/api/v1/alerts?alert_type=battery_low")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert all(alert["alert_type"] == "battery_low" for alert in data)

        # Filter by severity
        response = client.get("/api/v1/alerts?severity=warning")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert all(alert["severity"] == "warning" for alert in data)

        # Filter by status
        response = client.get("/api/v1/alerts?status=active")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 2
        assert all(alert["status"] == "active" for alert in data)

    def test_alert_pagination(self, client, sample_alert_data):
        """Test pagination of alerts"""
        # Create multiple test alerts
        for i in range(5):
            alert_data = sample_alert_data.copy()
            alert_data["message"] = f"Test alert {i}"
            client.post("/api/v1/alerts", json=alert_data)

        # Test first page
        response = client.get("/api/v1/alerts?page=1&size=2")
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 2

        # Test second page
        response = client.get("/api/v1/alerts?page=2&size=2")
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 2

    def test_alert_statistics(self, client, sample_alert_data):
        """Test alert statistics endpoint"""
        # Create some test alerts
        client.post("/api/v1/alerts", json=sample_alert_data)

        response = client.get("/api/v1/alerts/statistics")

        assert response.status_code == 200
        data = response.json()

        assert "total_alerts" in data
        assert "active_alerts" in data
        assert "resolved_alerts" in data
        assert "acknowledged_alerts" in data
        assert "alerts_by_type" in data
        assert "alerts_by_severity" in data

    def test_alert_validation(self, client):
        """Test alert validation"""
        # Test with invalid data
        invalid_data = {
            "alert_type": "invalid_type",
            "severity": "invalid_severity",
            "asset_id": "",  # Empty asset ID
            "message": "",  # Empty message
        }

        response = client.post("/api/v1/alerts", json=invalid_data)
        assert response.status_code == 422  # Validation error

    def test_alert_workflow(self, client, sample_alert_data):
        """Test complete alert workflow: create -> acknowledge -> resolve"""
        # Create alert
        create_response = client.post("/api/v1/alerts", json=sample_alert_data)
        assert create_response.status_code == 201
        alert_id = create_response.json()["id"]

        # Verify alert is active
        response = client.get(f"/api/v1/alerts/{alert_id}")
        assert response.json()["status"] == "active"

        # Acknowledge alert
        response = client.patch(f"/api/v1/alerts/{alert_id}/acknowledge")
        assert response.status_code == 200
        assert response.json()["status"] == "acknowledged"

        # Resolve alert
        response = client.patch(f"/api/v1/alerts/{alert_id}/resolve")
        assert response.status_code == 200
        assert response.json()["status"] == "resolved"

    def test_nonexistent_alert_operations(self, client):
        """Test operations on nonexistent alerts"""
        nonexistent_id = "00000000-0000-0000-0000-000000000000"

        # Try to get nonexistent alert
        response = client.get(f"/api/v1/alerts/{nonexistent_id}")
        assert response.status_code == 404

        # Try to acknowledge nonexistent alert
        response = client.patch(f"/api/v1/alerts/{nonexistent_id}/acknowledge")
        assert response.status_code == 404

        # Try to resolve nonexistent alert
        response = client.patch(f"/api/v1/alerts/{nonexistent_id}/resolve")
        assert response.status_code == 404
