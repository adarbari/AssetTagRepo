"""
Test cases for Observations API
"""
from datetime import datetime

import pytest
from fastapi.testclient import TestClient


class TestObservationsAPI:
    """Test cases for Observations API endpoints"""

    def test_get_observations_empty(self, client: TestClient):
        """Test getting observations when none exist"""
        response = client.get("/api/v1/observations")
        assert response.status_code == 200
        assert response.json() == []

    def test_create_observation(self, client: TestClient, sample_observation_data: dict):
        """Test creating a new observation"""
        response = client.post("/api/v1/observations", json=sample_observation_data)
        assert response.status_code == 201
        data = response.json()
        assert data["asset_id"] == sample_observation_data["asset_id"]
        assert data["gateway_id"] == sample_observation_data["gateway_id"]
        assert data["rssi"] == sample_observation_data["rssi"]
        assert data["battery_level"] == sample_observation_data["battery_level"]
        assert "id" in data
        assert "created_at" in data

    def test_create_observations_bulk(self, client: TestClient):
        """Test creating multiple observations in bulk"""
        bulk_data = {
            "observations": [
                {
                    "asset_id": "asset-1",
                    "gateway_id": "gateway-1",
                    "rssi": -65,
                    "battery_level": 85,
                    "temperature": 22.5,
                    "observed_at": datetime.utcnow().isoformat(),
                    "signal_quality": "good",
                },
                {
                    "asset_id": "asset-2",
                    "gateway_id": "gateway-1",
                    "rssi": -70,
                    "battery_level": 90,
                    "temperature": 23.0,
                    "observed_at": datetime.utcnow().isoformat(),
                    "signal_quality": "fair",
                },
            ],
            "batch_id": "test-batch-001",
        }

        response = client.post("/api/v1/observations/bulk", json=bulk_data)
        assert response.status_code == 201
        data = response.json()
        assert data["created_count"] == 2
        assert data["failed_count"] == 0
        assert data["batch_id"] == "test-batch-001"
        assert len(data["errors"]) == 0

    def test_get_observation_by_id(self, client: TestClient, sample_observation_data: dict):
        """Test getting a specific observation by ID"""
        # Create observation first
        create_response = client.post("/api/v1/observations", json=sample_observation_data)
        assert create_response.status_code == 201
        observation_id = create_response.json()["id"]

        # Get observation by ID
        response = client.get(f"/api/v1/observations/{observation_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == observation_id
        assert data["asset_id"] == sample_observation_data["asset_id"]

    def test_get_observation_not_found(self, client: TestClient):
        """Test getting a non-existent observation"""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = client.get(f"/api/v1/observations/{fake_id}")
        assert response.status_code == 404

    def test_update_observation(self, client: TestClient, sample_observation_data: dict):
        """Test updating an observation"""
        # Create observation first
        create_response = client.post("/api/v1/observations", json=sample_observation_data)
        assert create_response.status_code == 201
        observation_id = create_response.json()["id"]

        # Update observation
        update_data = {"rssi": -60, "battery_level": 95}
        response = client.put(f"/api/v1/observations/{observation_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["rssi"] == -60
        assert data["battery_level"] == 95

    def test_get_latest_observation_for_asset(self, client: TestClient, sample_observation_data: dict):
        """Test getting the latest observation for an asset"""
        asset_id = sample_observation_data["asset_id"]

        # Create observation first
        create_response = client.post("/api/v1/observations", json=sample_observation_data)
        assert create_response.status_code == 201

        # Get latest observation for asset
        response = client.get(f"/api/v1/observations/assets/{asset_id}/latest")
        assert response.status_code == 200
        data = response.json()
        assert data["asset_id"] == asset_id

    def test_get_asset_observation_history(self, client: TestClient, sample_observation_data: dict):
        """Test getting observation history for an asset"""
        asset_id = sample_observation_data["asset_id"]

        # Create observation first
        create_response = client.post("/api/v1/observations", json=sample_observation_data)
        assert create_response.status_code == 201

        # Get observation history for asset
        response = client.get(f"/api/v1/observations/assets/{asset_id}/history")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["asset_id"] == asset_id

    def test_get_recent_observations_for_gateway(self, client: TestClient, sample_observation_data: dict):
        """Test getting recent observations for a gateway"""
        gateway_id = sample_observation_data["gateway_id"]

        # Create observation first
        create_response = client.post("/api/v1/observations", json=sample_observation_data)
        assert create_response.status_code == 201

        # Get recent observations for gateway
        response = client.get(f"/api/v1/observations/gateways/{gateway_id}/recent")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["gateway_id"] == gateway_id

    def test_get_observation_stats(self, client: TestClient, sample_observation_data: dict):
        """Test getting observation statistics"""
        # Create observation first
        create_response = client.post("/api/v1/observations", json=sample_observation_data)
        assert create_response.status_code == 201

        # Get observation stats
        response = client.get("/api/v1/observations/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_observations" in data
        assert "unique_assets" in data
        assert "unique_gateways" in data
        assert "avg_rssi" in data
        assert "min_rssi" in data
        assert "max_rssi" in data
        assert "avg_battery_level" in data
        assert "avg_temperature" in data
        assert "time_range" in data
        assert "signal_quality_distribution" in data

    def test_get_observations_with_filters(self, client: TestClient, sample_observation_data: dict):
        """Test getting observations with filters"""
        # Create observation first
        create_response = client.post("/api/v1/observations", json=sample_observation_data)
        assert create_response.status_code == 201

        # Filter by asset_id
        response = client.get(f"/api/v1/observations?asset_id={sample_observation_data['asset_id']}")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["asset_id"] == sample_observation_data["asset_id"]

        # Filter by gateway_id
        response = client.get(f"/api/v1/observations?gateway_id={sample_observation_data['gateway_id']}")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["gateway_id"] == sample_observation_data["gateway_id"]

        # Filter by signal_quality
        response = client.get(f"/api/v1/observations?signal_quality={sample_observation_data['signal_quality']}")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["signal_quality"] == sample_observation_data["signal_quality"]

    def test_get_observations_with_time_range(self, client: TestClient, sample_observation_data: dict):
        """Test getting observations with time range filters"""
        # Create observation first
        create_response = client.post("/api/v1/observations", json=sample_observation_data)
        assert create_response.status_code == 201

        # Filter by time range
        start_time = "2025-01-01T00:00:00Z"
        end_time = "2025-12-31T23:59:59Z"

        response = client.get(f"/api/v1/observations?start_time={start_time}&end_time={end_time}")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1

    def test_get_observations_pagination(self, client: TestClient):
        """Test getting observations with pagination"""
        # Create multiple observations
        for i in range(5):
            observation_data = {
                "asset_id": f"asset-{i}",
                "gateway_id": f"gateway-{i}",
                "rssi": -65 - i,
                "battery_level": 85 - i,
                "temperature": 22.5 + i,
                "observed_at": datetime.utcnow().isoformat(),
                "signal_quality": "good",
            }
            client.post("/api/v1/observations", json=observation_data)

        # Test pagination
        response = client.get("/api/v1/observations?skip=0&limit=3")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3

        response = client.get("/api/v1/observations?skip=3&limit=3")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2  # Only 2 remaining

    def test_create_observation_batch(self, client: TestClient):
        """Test creating an observation batch record"""
        batch_data = {
            "batch_id": "test-batch-002",
            "start_time": datetime.utcnow().isoformat(),
            "end_time": datetime.utcnow().isoformat(),
            "observation_count": 10,
            "processing_status": "completed",
        }

        response = client.post("/api/v1/observations/batches", json=batch_data)
        assert response.status_code == 201
        data = response.json()
        assert data["batch_id"] == batch_data["batch_id"]
        assert data["observation_count"] == batch_data["observation_count"]
        assert data["processing_status"] == batch_data["processing_status"]

    def test_get_observation_batches(self, client: TestClient):
        """Test getting observation batches"""
        response = client.get("/api/v1/observations/batches")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_create_observation_validation_error(self, client: TestClient):
        """Test creating observation with invalid data"""
        invalid_data = {
            "asset_id": "",  # Empty asset_id should fail
            "gateway_id": "",  # Empty gateway_id should fail
            "rssi": 100,  # Invalid RSSI value (should be negative)
            "battery_level": 150,  # Invalid battery level (should be 0-100)
        }
        response = client.post("/api/v1/observations", json=invalid_data)
        assert response.status_code == 422  # Validation error

    def test_create_observations_bulk_validation_error(self, client: TestClient):
        """Test creating bulk observations with invalid data"""
        invalid_bulk_data = {
            "observations": [
                {
                    "asset_id": "",  # Empty asset_id should fail
                    "gateway_id": "gateway-1",
                    "rssi": -65,
                    "observed_at": datetime.utcnow().isoformat(),
                }
            ]
        }

        response = client.post("/api/v1/observations/bulk", json=invalid_bulk_data)
        assert response.status_code == 201  # Bulk creation should still succeed
        data = response.json()
        assert data["created_count"] == 0
        assert data["failed_count"] == 1
        assert len(data["errors"]) == 1
