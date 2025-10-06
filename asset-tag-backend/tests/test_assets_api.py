"""
Test cases for Assets API
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession


class TestAssetsAPI:
    """Test cases for Assets API endpoints"""

    def test_get_assets_empty(self, client: TestClient):
        """Test getting assets when none exist"""
        response = client.get("/api/v1/assets")
        assert response.status_code == 200
        assert response.json() == []

    def test_create_asset(self, client: TestClient, sample_asset_data: dict):
        """Test creating a new asset"""
        response = client.post("/api/v1/assets", json=sample_asset_data)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == sample_asset_data["name"]
        assert data["serial_number"] == sample_asset_data["serial_number"]
        assert data["asset_type"] == sample_asset_data["asset_type"]
        assert "id" in data
        assert "created_at" in data

    def test_get_asset_by_id(self, client: TestClient, sample_asset_data: dict):
        """Test getting a specific asset by ID"""
        # Create asset first
        create_response = client.post("/api/v1/assets", json=sample_asset_data)
        assert create_response.status_code == 201
        asset_id = create_response.json()["id"]

        # Get asset by ID
        response = client.get(f"/api/v1/assets/{asset_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == asset_id
        assert data["name"] == sample_asset_data["name"]

    def test_get_asset_not_found(self, client: TestClient):
        """Test getting a non-existent asset"""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = client.get(f"/api/v1/assets/{fake_id}")
        assert response.status_code == 404

    def test_update_asset(self, client: TestClient, sample_asset_data: dict):
        """Test updating an asset"""
        # Create asset first
        create_response = client.post("/api/v1/assets", json=sample_asset_data)
        assert create_response.status_code == 201
        asset_id = create_response.json()["id"]

        # Update asset
        update_data = {"name": "Updated Asset Name", "battery_level": 95}
        response = client.put(f"/api/v1/assets/{asset_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Asset Name"
        assert data["battery_level"] == 95

    def test_delete_asset(self, client: TestClient, sample_asset_data: dict):
        """Test deleting an asset"""
        # Create asset first
        create_response = client.post("/api/v1/assets", json=sample_asset_data)
        assert create_response.status_code == 201
        asset_id = create_response.json()["id"]

        # Delete asset
        response = client.delete(f"/api/v1/assets/{asset_id}")
        assert response.status_code == 200

        # Verify asset is deleted
        get_response = client.get(f"/api/v1/assets/{asset_id}")
        assert get_response.status_code == 404

    def test_get_assets_with_filters(self, client: TestClient, sample_asset_data: dict):
        """Test getting assets with filters"""
        # Create multiple assets with different types
        asset_data_1 = sample_asset_data.copy()
        asset_data_1["asset_type"] = "sensor"
        asset_data_1["name"] = "Sensor Asset"

        asset_data_2 = sample_asset_data.copy()
        asset_data_2["asset_type"] = "tracker"
        asset_data_2["name"] = "Tracker Asset"

        client.post("/api/v1/assets", json=asset_data_1)
        client.post("/api/v1/assets", json=asset_data_2)

        # Filter by asset type
        response = client.get("/api/v1/assets?asset_type=sensor")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["asset_type"] == "sensor"

        # Filter by status
        response = client.get("/api/v1/assets?status=active")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert all(asset["status"] == "active" for asset in data)

    def test_get_assets_pagination(self, client: TestClient, sample_asset_data: dict):
        """Test getting assets with pagination"""
        # Create multiple assets
        for i in range(5):
            asset_data = sample_asset_data.copy()
            asset_data["name"] = f"Asset {i}"
            client.post("/api/v1/assets", json=asset_data)

        # Test pagination
        response = client.get("/api/v1/assets?skip=0&limit=3")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3

        response = client.get("/api/v1/assets?skip=3&limit=3")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2  # Only 2 remaining

    def test_get_asset_current_location(self, client: TestClient, sample_asset_data: dict):
        """Test getting current location of an asset"""
        # Create asset first
        create_response = client.post("/api/v1/assets", json=sample_asset_data)
        assert create_response.status_code == 201
        asset_id = create_response.json()["id"]

        # Get current location
        response = client.get(f"/api/v1/assets/{asset_id}/current-location")
        assert response.status_code == 200
        # Should return empty or null since no location data exists yet

    def test_get_asset_location_history(self, client: TestClient, sample_asset_data: dict):
        """Test getting location history of an asset"""
        # Create asset first
        create_response = client.post("/api/v1/assets", json=sample_asset_data)
        assert create_response.status_code == 201
        asset_id = create_response.json()["id"]

        # Get location history
        response = client.get(f"/api/v1/assets/{asset_id}/location-history")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_create_asset_validation_error(self, client: TestClient):
        """Test creating asset with invalid data"""
        invalid_data = {"name": "", "asset_type": "invalid_type"}  # Empty name should fail
        response = client.post("/api/v1/assets", json=invalid_data)
        assert response.status_code == 422  # Validation error

    def test_update_asset_validation_error(self, client: TestClient, sample_asset_data: dict):
        """Test updating asset with invalid data"""
        # Create asset first
        create_response = client.post("/api/v1/assets", json=sample_asset_data)
        assert create_response.status_code == 201
        asset_id = create_response.json()["id"]

        # Try to update with invalid data
        invalid_data = {"battery_level": 150}  # Invalid battery level
        response = client.put(f"/api/v1/assets/{asset_id}", json=invalid_data)
        assert response.status_code == 422  # Validation error
