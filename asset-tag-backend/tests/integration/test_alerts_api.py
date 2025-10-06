"""
Integration tests for Alerts API endpoints
"""
import pytest
from httpx import AsyncClient


class TestAlertsAPI:
    """Test Alerts API endpoints"""
    
    @pytest.mark.asyncio
    async def test_create_alert(self, client: AsyncClient, sample_alert_data):
        """Test creating an alert via API"""
        response = await client.post("/alerts", json=sample_alert_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["alert_type"] == sample_alert_data["alert_type"]
        assert data["severity"] == sample_alert_data["severity"]
        assert data["asset_id"] == sample_alert_data["asset_id"]
        assert data["message"] == sample_alert_data["message"]
        assert data["status"] == "active"  # Default status
        assert "id" in data
        assert "created_at" in data
    
    @pytest.mark.asyncio
    async def test_get_alerts(self, client: AsyncClient, sample_alert_data):
        """Test getting list of alerts"""
        # Create a test alert first
        await client.post("/alerts", json=sample_alert_data)
        
        response = await client.get("/alerts")
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) >= 1
        
        # Check that our created alert is in the list
        alert_types = [alert["alert_type"] for alert in data]
        assert sample_alert_data["alert_type"] in alert_types
    
    @pytest.mark.asyncio
    async def test_get_alert_by_id(self, client: AsyncClient, sample_alert_data):
        """Test getting a specific alert by ID"""
        # Create a test alert first
        create_response = await client.post("/alerts", json=sample_alert_data)
        alert_id = create_response.json()["id"]
        
        response = await client.get(f"/alerts/{alert_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == alert_id
        assert data["alert_type"] == sample_alert_data["alert_type"]
        assert data["severity"] == sample_alert_data["severity"]
    
    @pytest.mark.asyncio
    async def test_acknowledge_alert(self, client: AsyncClient, sample_alert_data):
        """Test acknowledging an alert"""
        # Create a test alert first
        create_response = await client.post("/alerts", json=sample_alert_data)
        alert_id = create_response.json()["id"]
        
        # Acknowledge the alert
        acknowledge_data = {
            "notes": "Alert acknowledged by operator"
        }
        
        response = await client.post(f"/alerts/{alert_id}/acknowledge", json=acknowledge_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "acknowledged"
        assert data["acknowledged_at"] is not None
        assert data["acknowledgment_notes"] == acknowledge_data["notes"]
    
    @pytest.mark.asyncio
    async def test_resolve_alert(self, client: AsyncClient, sample_alert_data):
        """Test resolving an alert"""
        # Create a test alert first
        create_response = await client.post("/alerts", json=sample_alert_data)
        alert_id = create_response.json()["id"]
        
        # Resolve the alert
        resolve_data = {
            "notes": "Issue has been resolved"
        }
        
        response = await client.post(f"/alerts/{alert_id}/resolve", json=resolve_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "resolved"
        assert data["resolved_at"] is not None
        assert data["resolution_notes"] == resolve_data["notes"]
    
    @pytest.mark.asyncio
    async def test_alert_filtering(self, client: AsyncClient):
        """Test alert filtering by status and severity"""
        # Create test alerts with different statuses and severities
        alert1_data = {
            "alert_type": "battery_low",
            "severity": "warning",
            "asset_id": "test-asset-1",
            "message": "Battery is low"
        }
        alert2_data = {
            "alert_type": "offline",
            "severity": "critical",
            "asset_id": "test-asset-2",
            "message": "Asset is offline"
        }
        
        await client.post("/alerts", json=alert1_data)
        await client.post("/alerts", json=alert2_data)
        
        # Test filtering by status
        response = await client.get("/alerts?status=active")
        assert response.status_code == 200
        data = response.json()
        
        active_alerts = [alert for alert in data if alert["status"] == "active"]
        assert len(active_alerts) >= 2
        
        # Test filtering by severity
        response = await client.get("/alerts?severity=critical")
        assert response.status_code == 200
        data = response.json()
        
        critical_alerts = [alert for alert in data if alert["severity"] == "critical"]
        assert len(critical_alerts) >= 1
        
        # Test filtering by asset_id
        response = await client.get("/alerts?asset_id=test-asset-1")
        assert response.status_code == 200
        data = response.json()
        
        asset_alerts = [alert for alert in data if alert["asset_id"] == "test-asset-1"]
        assert len(asset_alerts) >= 1
    
    @pytest.mark.asyncio
    async def test_alert_pagination(self, client: AsyncClient):
        """Test alert pagination"""
        # Create multiple test alerts
        for i in range(5):
            alert_data = {
                "alert_type": f"test_alert_{i}",
                "severity": "warning",
                "asset_id": f"test-asset-{i}",
                "message": f"Test alert {i}"
            }
            await client.post("/alerts", json=alert_data)
        
        # Test pagination
        response = await client.get("/alerts?skip=0&limit=3")
        assert response.status_code == 200
        data = response.json()
        
        assert len(data) <= 3
        
        # Test second page
        response = await client.get("/alerts?skip=3&limit=3")
        assert response.status_code == 200
        data = response.json()
        
        assert len(data) <= 3
    
    @pytest.mark.asyncio
    async def test_alert_statistics(self, client: AsyncClient, sample_alert_data):
        """Test getting alert statistics"""
        # Create a test alert
        await client.post("/alerts", json=sample_alert_data)
        
        # Get statistics
        response = await client.get("/alerts/stats")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "total" in data
        assert "active" in data
        assert "acknowledged" in data
        assert "resolved" in data
        assert "by_type" in data
        assert "by_severity" in data
        
        assert data["total"] >= 1
        assert data["active"] >= 1
    
    @pytest.mark.asyncio
    async def test_alert_validation(self, client: AsyncClient):
        """Test alert data validation"""
        # Test with missing required fields
        invalid_data = {
            "alert_type": "battery_low"
            # Missing severity, asset_id, message
        }
        
        response = await client.post("/alerts", json=invalid_data)
        assert response.status_code == 422  # Validation error
        
        # Test with invalid severity
        invalid_data = {
            "alert_type": "battery_low",
            "severity": "invalid_severity",
            "asset_id": "test-asset-1",
            "message": "Test message"
        }
        
        response = await client.post("/alerts", json=invalid_data)
        assert response.status_code == 422  # Validation error
    
    @pytest.mark.asyncio
    async def test_alert_workflow(self, client: AsyncClient, sample_alert_data):
        """Test complete alert workflow: create -> acknowledge -> resolve"""
        # Create alert
        create_response = await client.post("/alerts", json=sample_alert_data)
        alert_id = create_response.json()["id"]
        
        # Verify alert is active
        get_response = await client.get(f"/alerts/{alert_id}")
        assert get_response.json()["status"] == "active"
        
        # Acknowledge alert
        acknowledge_data = {"notes": "Alert acknowledged"}
        await client.post(f"/alerts/{alert_id}/acknowledge", json=acknowledge_data)
        
        # Verify alert is acknowledged
        get_response = await client.get(f"/alerts/{alert_id}")
        assert get_response.json()["status"] == "acknowledged"
        
        # Resolve alert
        resolve_data = {"notes": "Issue resolved"}
        await client.post(f"/alerts/{alert_id}/resolve", json=resolve_data)
        
        # Verify alert is resolved
        get_response = await client.get(f"/alerts/{alert_id}")
        assert get_response.json()["status"] == "resolved"
    
    @pytest.mark.asyncio
    async def test_nonexistent_alert_operations(self, client: AsyncClient):
        """Test operations on non-existent alerts"""
        # Test getting non-existent alert
        response = await client.get("/alerts/nonexistent-id")
        assert response.status_code == 404
        
        # Test acknowledging non-existent alert
        response = await client.post("/alerts/nonexistent-id/acknowledge", json={})
        assert response.status_code == 404
        
        # Test resolving non-existent alert
        response = await client.post("/alerts/nonexistent-id/resolve", json={})
        assert response.status_code == 404
