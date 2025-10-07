"""
Integration tests for Assets API endpoints
"""

import pytest


class TestAssetsAPI:
    """Test Assets API endpoints"""

    def test_create_asset(self, client, test_organization_sync, test_site_sync, test_user_sync) -> None:
        """Test creating an asset via API"""
        asset_data = {
            "name": "Test Excavator",
            "serial_number": "EXC-001",
            "asset_type": "excavator",
            "status": "active",
            "organization_id": str(test_organization_sync.id),
            "current_site_id": str(test_site_sync.id),
            "assigned_to_user_id": str(test_user_sync.id),
            "battery_level": 85,
            "last_seen": "2024-01-01T12:00:00Z",
            "asset_metadata": {"model": "CAT 320", "year": 2020},
        }
        
        response = client.post("/api/v1/assets", json=asset_data)

        if response.status_code != 201:
            print(f"Response status: {response.status_code}")
            print(f"Response content: {response.text}")
        assert response.status_code == 201
        data = response.json()

        assert data["name"] == asset_data["name"]
        assert data["asset_type"] == asset_data["asset_type"]
        assert data["status"] == asset_data["status"]
        assert data["serial_number"] == asset_data["serial_number"]
        assert "id" in data
        assert "created_at" in data

    def test_get_assets(self, client, test_organization_sync, test_site_sync, test_user_sync) -> None:
        """Test getting list of assets"""
        # Create a test asset first
        asset_data = {
            "name": "Test Excavator",
            "serial_number": "EXC-001",
            "asset_type": "excavator",
            "status": "active",
            "current_site_id": str(test_site_sync.id),
            "assigned_to_user_id": str(test_user_sync.id),
            "battery_level": 85,
            "last_seen": "2024-01-01T12:00:00Z",
            "asset_metadata": {"model": "CAT 320", "year": 2020},
        }
        client.post("/api/v1/assets", json=asset_data)

        response = client.get("/api/v1/assets")

        assert response.status_code == 200
        data = response.json()

        assert isinstance(data, list)
        assert len(data) >= 1

        # Check that our created asset is in the list
        asset_names = [asset["name"] for asset in data]
        assert asset_data["name"] in asset_names

    def test_get_asset_by_id(self, client, test_organization_sync, test_site_sync, test_user_sync) -> None:
        """Test getting a specific asset by ID"""
        # Create a test asset first
        asset_data = {
            "name": "Test Excavator",
            "serial_number": "EXC-001",
            "asset_type": "excavator",
            "status": "active",
            "current_site_id": str(test_site_sync.id),
            "assigned_to_user_id": str(test_user_sync.id),
            "battery_level": 85,
            "last_seen": "2024-01-01T12:00:00Z",
            "asset_metadata": {"model": "CAT 320", "year": 2020},
        }
        create_response = client.post("/api/v1/assets", json=asset_data)
        asset_id = create_response.json()["id"]

        response = client.get(f"/api/v1/assets/{asset_id}")

        assert response.status_code == 200
        data = response.json()

        assert data["id"] == asset_id
        assert data["name"] == asset_data["name"]
        assert data["asset_type"] == asset_data["asset_type"]

    def test_get_nonexistent_asset(self, client) -> None:
        """Test getting a nonexistent asset"""
        nonexistent_id = "00000000-0000-0000-0000-000000000000"
        response = client.get(f"/api/v1/assets/{nonexistent_id}")
        assert response.status_code == 404

    def test_update_asset(self, client, test_organization_sync, test_site_sync, test_user_sync) -> None:
        """Test updating an asset"""
        # Create a test asset first
        asset_data = {
            "name": "Test Excavator",
            "serial_number": "EXC-001",
            "asset_type": "excavator",
            "status": "active",
            "current_site_id": str(test_site_sync.id),
            "assigned_to_user_id": str(test_user_sync.id),
            "battery_level": 85,
            "last_seen": "2024-01-01T12:00:00Z",
            "asset_metadata": {"model": "CAT 320", "year": 2020},
        }
        create_response = client.post("/api/v1/assets", json=asset_data)
        asset_id = create_response.json()["id"]

        # Update the asset
        update_data = {
            "name": "Updated Excavator",
            "status": "maintenance",
            "battery_level": 50,
        }

        response = client.put(f"/api/v1/assets/{asset_id}", json=update_data)

        assert response.status_code == 200
        data = response.json()

        assert data["name"] == update_data["name"]
        assert data["status"] == update_data["status"]
        assert data["battery_level"] == update_data["battery_level"]
        assert (
            data["asset_type"] == asset_data["asset_type"]
        )  # Should remain unchanged

    def test_delete_asset(self, client, test_organization_sync, test_site_sync, test_user_sync) -> None:
        """Test deleting an asset"""
        # Create a test asset first
        asset_data = {
            "name": "Test Excavator",
            "serial_number": "EXC-001",
            "asset_type": "excavator",
            "status": "active",
            "current_site_id": str(test_site_sync.id),
            "assigned_to_user_id": str(test_user_sync.id),
            "battery_level": 85,
            "last_seen": "2024-01-01T12:00:00Z",
            "asset_metadata": {"model": "CAT 320", "year": 2020},
        }
        create_response = client.post("/api/v1/assets", json=asset_data)
        asset_id = create_response.json()["id"]

        # Delete the asset
        response = client.delete(f"/api/v1/assets/{asset_id}")
        assert response.status_code == 200

        # Verify the asset is deleted
        response = client.get(f"/api/v1/assets/{asset_id}")
        assert response.status_code == 404

    def test_asset_filtering(self, client, test_organization_sync, test_site_sync, test_user_sync) -> None:
        """Test filtering assets by various criteria"""
        # Create test assets with different properties
        asset1_data = {
            "name": "Excavator A",
            "serial_number": "EXC-001",
            "asset_type": "excavator",
            "status": "active",
            "current_site_id": str(test_site_sync.id),
            "assigned_to_user_id": str(test_user_sync.id),
            "battery_level": 85,
            "last_seen": "2024-01-01T12:00:00Z",
            "asset_metadata": {"model": "CAT 320", "year": 2020},
        }

        asset2_data = {
            "name": "Bulldozer B",
            "serial_number": "BUL-002",
            "asset_type": "bulldozer",
            "status": "maintenance",
            "current_site_id": str(test_site_sync.id),
            "assigned_to_user_id": str(test_user_sync.id),
            "battery_level": 60,
            "last_seen": "2024-01-01T12:00:00Z",
            "asset_metadata": {"model": "CAT D6", "year": 2019},
        }

        client.post("/api/v1/assets", json=asset1_data)
        client.post("/api/v1/assets", json=asset2_data)

        # Filter by asset type
        response = client.get("/api/v1/assets?asset_type=excavator")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert all(asset["asset_type"] == "excavator" for asset in data)

        # Filter by status
        response = client.get("/api/v1/assets?status=active")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert all(asset["status"] == "active" for asset in data)

        # Filter by site
        response = client.get(
            f"/api/v1/assets?site_id={test_site.id}"
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 2
        assert all(
            asset["current_site_id"] == str(test_site.id)
            for asset in data
        )

    def test_asset_pagination(self, client, test_organization_sync, test_site_sync, test_user_sync) -> None:
        """Test pagination of assets"""
        # Create multiple test assets
        for i in range(5):
            asset_data = {
                "name": f"Test Asset {i}",
                "serial_number": f"TEST-{i:03d}",
                "asset_type": "excavator",
                "status": "active",
                "current_site_id": str(test_site.id),
                "assigned_to_user_id": str(test_user.id),
                "battery_level": 85,
                "last_seen": "2024-01-01T12:00:00Z",
                "asset_metadata": {"model": "CAT 320", "year": 2020},
            }
            client.post("/api/v1/assets", json=asset_data)

        # Test first page
        response = client.get("/api/v1/assets?page=1&size=2")
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 2

        # Test second page
        response = client.get("/api/v1/assets?page=2&size=2")
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 2

    def test_asset_validation(self, client) -> None:
        """Test asset validation"""
        # Test with invalid data
        invalid_data = {
            "name": "",  # Empty name
            "asset_type": "invalid_type",
            "status": "invalid_status",
            "serial_number": "",  # Empty serial number
        }

        response = client.post("/api/v1/assets", json=invalid_data)
        assert response.status_code == 422  # Validation error

    def test_asset_search(self, client, test_organization_sync, test_site_sync, test_user_sync) -> None:
        """Test asset search functionality"""
        # Create a test asset
        asset_data = {
            "name": "Test Excavator",
            "serial_number": "EXC-001",
            "asset_type": "excavator",
            "status": "active",
            "current_site_id": str(test_site_sync.id),
            "assigned_to_user_id": str(test_user_sync.id),
            "battery_level": 85,
            "last_seen": "2024-01-01T12:00:00Z",
            "asset_metadata": {"model": "CAT 320", "year": 2020},
        }
        client.post("/api/v1/assets", json=asset_data)

        # Search by name
        response = client.get(f"/api/v1/assets/search?q={asset_data['name']}")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert any(asset["name"] == asset_data["name"] for asset in data)

        # Search by serial number
        response = client.get(
            f"/api/v1/assets/search?q={asset_data['serial_number']}"
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert any(
            asset["serial_number"] == asset_data["serial_number"]
            for asset in data
        )

    def test_asset_battery_history(self, client, test_organization_sync, test_site_sync, test_user_sync) -> None:
        """Test getting asset battery history"""
        # Create a test asset
        asset_data = {
            "name": "Test Excavator",
            "serial_number": "EXC-001",
            "asset_type": "excavator",
            "status": "active",
            "current_site_id": str(test_site_sync.id),
            "assigned_to_user_id": str(test_user_sync.id),
            "battery_level": 85,
            "last_seen": "2024-01-01T12:00:00Z",
            "asset_metadata": {"model": "CAT 320", "year": 2020},
        }
        create_response = client.post("/api/v1/assets", json=asset_data)
        asset_id = create_response.json()["id"]

        # Get battery history
        response = client.get(f"/api/v1/assets/{asset_id}/battery-history")

        assert response.status_code == 200
        data = response.json()

        assert isinstance(data, list)
        # Should have at least one entry (the initial battery level)
        assert len(data) >= 1
        assert all("battery_level" in entry for entry in data)
        assert all("timestamp" in entry for entry in data)
