"""
Test cases for Geofences API
"""
import pytest
from fastapi.testclient import TestClient


class TestGeofencesAPI:
    """Test cases for Geofences API endpoints"""

    def test_get_geofences_empty(self, client: TestClient):
        """Test getting geofences when none exist"""
        response = client.get("/api/v1/geofences")
        assert response.status_code == 200
        assert response.json() == []

    def test_create_circular_geofence(
        self, client: TestClient, sample_geofence_data: dict
    ):
        """Test creating a circular geofence"""
        response = client.post("/api/v1/geofences", json=sample_geofence_data)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == sample_geofence_data["name"]
        assert data["geofence_type"] == "circular"
        assert data["center_latitude"] == sample_geofence_data["center_latitude"]
        assert data["center_longitude"] == sample_geofence_data["center_longitude"]
        assert data["radius"] == sample_geofence_data["radius"]
        assert "id" in data
        assert "created_at" in data

    def test_create_polygon_geofence(self, client: TestClient):
        """Test creating a polygon geofence"""
        polygon_data = {
            "name": "Test Polygon Geofence",
            "description": "Test polygon geofence description",
            "geofence_type": "polygon",
            "status": "active",
            "coordinates": [
                [40.7128, -74.0060],
                [40.7138, -74.0060],
                [40.7138, -74.0050],
                [40.7128, -74.0050],
                [40.7128, -74.0060],
            ],
            "site_id": "test-site-id",
            "alert_on_entry": True,
            "alert_on_exit": True,
            "geofence_classification": "authorized",
            "metadata": {"test": True},
        }

        response = client.post("/api/v1/geofences", json=polygon_data)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == polygon_data["name"]
        assert data["geofence_type"] == "polygon"
        assert data["coordinates"] == polygon_data["coordinates"]

    def test_get_geofence_by_id(self, client: TestClient, sample_geofence_data: dict):
        """Test getting a specific geofence by ID"""
        # Create geofence first
        create_response = client.post("/api/v1/geofences", json=sample_geofence_data)
        assert create_response.status_code == 201
        geofence_id = create_response.json()["id"]

        # Get geofence by ID
        response = client.get(f"/api/v1/geofences/{geofence_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == geofence_id
        assert data["name"] == sample_geofence_data["name"]

    def test_get_geofence_not_found(self, client: TestClient):
        """Test getting a non-existent geofence"""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = client.get(f"/api/v1/geofences/{fake_id}")
        assert response.status_code == 404

    def test_update_geofence(self, client: TestClient, sample_geofence_data: dict):
        """Test updating a geofence"""
        # Create geofence first
        create_response = client.post("/api/v1/geofences", json=sample_geofence_data)
        assert create_response.status_code == 201
        geofence_id = create_response.json()["id"]

        # Update geofence
        update_data = {"name": "Updated Geofence Name", "radius": 200}
        response = client.put(f"/api/v1/geofences/{geofence_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Geofence Name"
        assert data["radius"] == 200

    def test_delete_geofence(self, client: TestClient, sample_geofence_data: dict):
        """Test deleting a geofence"""
        # Create geofence first
        create_response = client.post("/api/v1/geofences", json=sample_geofence_data)
        assert create_response.status_code == 201
        geofence_id = create_response.json()["id"]

        # Delete geofence
        response = client.delete(f"/api/v1/geofences/{geofence_id}")
        assert response.status_code == 200

        # Verify geofence is deleted
        get_response = client.get(f"/api/v1/geofences/{geofence_id}")
        assert get_response.status_code == 404

    def test_evaluate_geofences(self, client: TestClient, sample_geofence_data: dict):
        """Test evaluating geofences for an asset location"""
        # Create geofence first
        create_response = client.post("/api/v1/geofences", json=sample_geofence_data)
        assert create_response.status_code == 201
        geofence_id = create_response.json()["id"]

        # Evaluate geofences
        evaluation_data = {
            "asset_id": "test-asset-id",
            "latitude": 40.7128,  # Same as geofence center
            "longitude": -74.0060,
            "timestamp": "2025-01-27T12:00:00Z",
        }

        response = client.post("/api/v1/geofences/evaluate", json=evaluation_data)
        assert response.status_code == 200
        data = response.json()
        assert data["asset_id"] == evaluation_data["asset_id"]
        assert "evaluations" in data
        assert "triggered_events" in data
        assert len(data["evaluations"]) >= 1

    def test_evaluate_geofences_specific(
        self, client: TestClient, sample_geofence_data: dict
    ):
        """Test evaluating specific geofences for an asset location"""
        # Create geofence first
        create_response = client.post("/api/v1/geofences", json=sample_geofence_data)
        assert create_response.status_code == 201
        geofence_id = create_response.json()["id"]

        # Evaluate specific geofences
        evaluation_data = {
            "asset_id": "test-asset-id",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "timestamp": "2025-01-27T12:00:00Z",
            "geofence_ids": [geofence_id],
        }

        response = client.post("/api/v1/geofences/evaluate", json=evaluation_data)
        assert response.status_code == 200
        data = response.json()
        assert data["asset_id"] == evaluation_data["asset_id"]
        assert len(data["evaluations"]) == 1
        assert data["evaluations"][0]["geofence_id"] == geofence_id

    def test_get_geofence_events(self, client: TestClient):
        """Test getting geofence events"""
        response = client.get("/api/v1/geofences/events")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_geofence_events_with_filters(self, client: TestClient):
        """Test getting geofence events with filters"""
        response = client.get(
            "/api/v1/geofences/events?asset_id=test-asset&event_type=entry"
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_geofence_stats(self, client: TestClient):
        """Test getting geofence statistics"""
        response = client.get("/api/v1/geofences/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_geofences" in data
        assert "active_geofences" in data
        assert "inactive_geofences" in data
        assert "circular_geofences" in data
        assert "polygon_geofences" in data
        assert "total_events_today" in data
        assert "entry_events_today" in data
        assert "exit_events_today" in data
        assert "most_active_geofences" in data

    def test_create_vehicle(self, client: TestClient, sample_vehicle_data: dict):
        """Test creating a new vehicle"""
        response = client.post("/api/v1/geofences/vehicles", json=sample_vehicle_data)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == sample_vehicle_data["name"]
        assert data["vehicle_type"] == sample_vehicle_data["vehicle_type"]
        assert data["license_plate"] == sample_vehicle_data["license_plate"]
        assert "id" in data
        assert "created_at" in data

    def test_get_vehicles(self, client: TestClient, sample_vehicle_data: dict):
        """Test getting vehicles list"""
        # Create vehicle first
        create_response = client.post(
            "/api/v1/geofences/vehicles", json=sample_vehicle_data
        )
        assert create_response.status_code == 201

        # Get vehicles list
        response = client.get("/api/v1/geofences/vehicles")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["name"] == sample_vehicle_data["name"]

    def test_get_vehicle_by_id(self, client: TestClient, sample_vehicle_data: dict):
        """Test getting a specific vehicle by ID"""
        # Create vehicle first
        create_response = client.post(
            "/api/v1/geofences/vehicles", json=sample_vehicle_data
        )
        assert create_response.status_code == 201
        vehicle_id = create_response.json()["id"]

        # Get vehicle by ID
        response = client.get(f"/api/v1/geofences/vehicles/{vehicle_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == vehicle_id
        assert data["name"] == sample_vehicle_data["name"]

    def test_update_vehicle(self, client: TestClient, sample_vehicle_data: dict):
        """Test updating a vehicle"""
        # Create vehicle first
        create_response = client.post(
            "/api/v1/geofences/vehicles", json=sample_vehicle_data
        )
        assert create_response.status_code == 201
        vehicle_id = create_response.json()["id"]

        # Update vehicle
        update_data = {"name": "Updated Vehicle Name", "status": "inactive"}
        response = client.put(
            f"/api/v1/geofences/vehicles/{vehicle_id}", json=update_data
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Vehicle Name"
        assert data["status"] == "inactive"

    def test_delete_vehicle(self, client: TestClient, sample_vehicle_data: dict):
        """Test deleting a vehicle"""
        # Create vehicle first
        create_response = client.post(
            "/api/v1/geofences/vehicles", json=sample_vehicle_data
        )
        assert create_response.status_code == 201
        vehicle_id = create_response.json()["id"]

        # Delete vehicle
        response = client.delete(f"/api/v1/geofences/vehicles/{vehicle_id}")
        assert response.status_code == 200

        # Verify vehicle is deleted
        get_response = client.get(f"/api/v1/geofences/vehicles/{vehicle_id}")
        assert get_response.status_code == 404

    def test_create_geofence_validation_error(self, client: TestClient):
        """Test creating geofence with invalid data"""
        invalid_data = {
            "name": "",  # Empty name should fail
            "geofence_type": "invalid_type",
            "latitude": 200.0,  # Invalid latitude
        }
        response = client.post("/api/v1/geofences", json=invalid_data)
        assert response.status_code == 422  # Validation error

    def test_evaluate_geofences_validation_error(self, client: TestClient):
        """Test evaluating geofences with invalid data"""
        invalid_data = {
            "asset_id": "",  # Empty asset_id should fail
            "latitude": 200.0,  # Invalid latitude
            "longitude": -200.0,  # Invalid longitude
        }
        response = client.post("/api/v1/geofences/evaluate", json=invalid_data)
        assert response.status_code == 422  # Validation error
