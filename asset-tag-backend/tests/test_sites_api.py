"""
Test cases for Sites API
"""
import pytest
from fastapi.testclient import TestClient


class TestSitesAPI:
    """Test cases for Sites API endpoints"""

    def test_get_sites_empty(self, client: TestClient):
        """Test getting sites when none exist"""
        response = client.get("/api/v1/sites")
        assert response.status_code == 200
        assert response.json() == []

    def test_create_site(self, client: TestClient, sample_site_data: dict):
        """Test creating a new site"""
        response = client.post("/api/v1/sites", json=sample_site_data)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == sample_site_data["name"]
        assert data["location"] == sample_site_data["location"]
        assert data["latitude"] == sample_site_data["latitude"]
        assert data["longitude"] == sample_site_data["longitude"]
        assert "id" in data
        assert "created_at" in data

    def test_get_site_by_id(self, client: TestClient, sample_site_data: dict):
        """Test getting a specific site by ID"""
        # Create site first
        create_response = client.post("/api/v1/sites", json=sample_site_data)
        assert create_response.status_code == 201
        site_id = create_response.json()["id"]

        # Get site by ID
        response = client.get(f"/api/v1/sites/{site_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == site_id
        assert data["name"] == sample_site_data["name"]
        assert "assets" in data
        assert "personnel" in data
        assert "gateways" in data

    def test_get_site_not_found(self, client: TestClient):
        """Test getting a non-existent site"""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = client.get(f"/api/v1/sites/{fake_id}")
        assert response.status_code == 404

    def test_update_site(self, client: TestClient, sample_site_data: dict):
        """Test updating a site"""
        # Create site first
        create_response = client.post("/api/v1/sites", json=sample_site_data)
        assert create_response.status_code == 201
        site_id = create_response.json()["id"]

        # Update site
        update_data = {"name": "Updated Site Name", "radius": 200}
        response = client.put(f"/api/v1/sites/{site_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Site Name"
        assert data["radius"] == 200

    def test_delete_site(self, client: TestClient, sample_site_data: dict):
        """Test deleting a site"""
        # Create site first
        create_response = client.post("/api/v1/sites", json=sample_site_data)
        assert create_response.status_code == 201
        site_id = create_response.json()["id"]

        # Delete site
        response = client.delete(f"/api/v1/sites/{site_id}")
        assert response.status_code == 200

        # Verify site is deleted
        get_response = client.get(f"/api/v1/sites/{site_id}")
        assert get_response.status_code == 404

    def test_get_sites_with_filters(self, client: TestClient, sample_site_data: dict):
        """Test getting sites with filters"""
        # Create multiple sites with different statuses
        site_data_1 = sample_site_data.copy()
        site_data_1["name"] = "Active Site"
        site_data_1["status"] = "active"

        site_data_2 = sample_site_data.copy()
        site_data_2["name"] = "Inactive Site"
        site_data_2["status"] = "inactive"

        client.post("/api/v1/sites", json=site_data_1)
        client.post("/api/v1/sites", json=site_data_2)

        # Filter by status
        response = client.get("/api/v1/sites?status=active")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["status"] == "active"

    def test_get_site_assets(self, client: TestClient, sample_site_data: dict):
        """Test getting assets for a specific site"""
        # Create site first
        create_response = client.post("/api/v1/sites", json=sample_site_data)
        assert create_response.status_code == 201
        site_id = create_response.json()["id"]

        # Get site assets
        response = client.get(f"/api/v1/sites/{site_id}/assets")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_site_personnel(self, client: TestClient, sample_site_data: dict):
        """Test getting personnel for a specific site"""
        # Create site first
        create_response = client.post("/api/v1/sites", json=sample_site_data)
        assert create_response.status_code == 201
        site_id = create_response.json()["id"]

        # Get site personnel
        response = client.get(f"/api/v1/sites/{site_id}/personnel")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_site_activity(self, client: TestClient, sample_site_data: dict):
        """Test getting activity for a specific site"""
        # Create site first
        create_response = client.post("/api/v1/sites", json=sample_site_data)
        assert create_response.status_code == 201
        site_id = create_response.json()["id"]

        # Get site activity
        response = client.get(f"/api/v1/sites/{site_id}/activity")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_sites_stats(self, client: TestClient):
        """Test getting sites statistics"""
        response = client.get("/api/v1/sites/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_sites" in data
        assert "active_sites" in data
        assert "total_assets" in data
        assert "total_personnel" in data

    def test_create_personnel(self, client: TestClient, sample_personnel_data: dict):
        """Test creating new personnel"""
        response = client.post("/api/v1/sites/personnel", json=sample_personnel_data)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == sample_personnel_data["name"]
        assert data["role"] == sample_personnel_data["role"]
        assert "id" in data
        assert "created_at" in data

    def test_get_personnel(self, client: TestClient, sample_personnel_data: dict):
        """Test getting personnel list"""
        # Create personnel first
        create_response = client.post("/api/v1/sites/personnel", json=sample_personnel_data)
        assert create_response.status_code == 201

        # Get personnel list
        response = client.get("/api/v1/sites/personnel")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["name"] == sample_personnel_data["name"]

    def test_get_personnel_by_id(self, client: TestClient, sample_personnel_data: dict):
        """Test getting specific personnel by ID"""
        # Create personnel first
        create_response = client.post("/api/v1/sites/personnel", json=sample_personnel_data)
        assert create_response.status_code == 201
        personnel_id = create_response.json()["id"]

        # Get personnel by ID
        response = client.get(f"/api/v1/sites/personnel/{personnel_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == personnel_id
        assert data["name"] == sample_personnel_data["name"]

    def test_update_personnel(self, client: TestClient, sample_personnel_data: dict):
        """Test updating personnel"""
        # Create personnel first
        create_response = client.post("/api/v1/sites/personnel", json=sample_personnel_data)
        assert create_response.status_code == 201
        personnel_id = create_response.json()["id"]

        # Update personnel
        update_data = {"name": "Updated Personnel Name", "role": "supervisor"}
        response = client.put(f"/api/v1/sites/personnel/{personnel_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Personnel Name"
        assert data["role"] == "supervisor"

    def test_delete_personnel(self, client: TestClient, sample_personnel_data: dict):
        """Test deleting personnel"""
        # Create personnel first
        create_response = client.post("/api/v1/sites/personnel", json=sample_personnel_data)
        assert create_response.status_code == 201
        personnel_id = create_response.json()["id"]

        # Delete personnel
        response = client.delete(f"/api/v1/sites/personnel/{personnel_id}")
        assert response.status_code == 200

        # Verify personnel is deleted
        get_response = client.get(f"/api/v1/sites/personnel/{personnel_id}")
        assert get_response.status_code == 404

    def test_create_site_validation_error(self, client: TestClient):
        """Test creating site with invalid data"""
        invalid_data = {"name": "", "latitude": 200.0}  # Empty name should fail  # Invalid latitude
        response = client.post("/api/v1/sites", json=invalid_data)
        assert response.status_code == 422  # Validation error
