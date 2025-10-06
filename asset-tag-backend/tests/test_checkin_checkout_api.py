"""
Test cases for Check-in/Check-out API
"""
from datetime import datetime, timedelta

import pytest
from fastapi.testclient import TestClient


class TestCheckInCheckOutAPI:
    """Test cases for Check-in/Check-out API endpoints"""

    def test_check_in_asset(self, client: TestClient, sample_checkin_data: dict):
        """Test checking in an asset"""
        response = client.post(
            "/api/v1/checkin-checkout/checkin", json=sample_checkin_data
        )
        assert response.status_code == 201
        data = response.json()
        assert data["asset_id"] == sample_checkin_data["asset_id"]
        assert data["action"] == sample_checkin_data["action"]
        assert data["checked_out_by"] == sample_checkin_data["checked_out_by"]
        assert "id" in data
        assert "created_at" in data

    def test_check_out_asset(self, client: TestClient):
        """Test checking out an asset"""
        checkout_data = {
            "asset_id": "test-asset-001",
            "asset_name": "Test Asset",
            "action": "checkout",
            "checked_out_by": "user-001",
            "expected_return_date": (datetime.utcnow() + timedelta(days=7))
            .date()
            .isoformat(),
            "location": "Test location",
            "notes": "Test checkout",
            "metadata": {"test": True},
        }

        response = client.post("/api/v1/checkin-checkout/checkout", json=checkout_data)
        assert response.status_code == 201
        data = response.json()
        assert data["asset_id"] == checkout_data["asset_id"]
        assert data["action"] == checkout_data["action"]
        assert data["checked_out_by"] == checkout_data["checked_out_by"]
        assert data["expected_return_date"] == checkout_data["expected_return_date"]

    def test_check_in_checked_out_asset(self, client: TestClient):
        """Test checking in an asset that was previously checked out"""
        # First check out an asset
        checkout_data = {
            "asset_id": "test-asset-002",
            "asset_name": "Test Asset 2",
            "action": "checkout",
            "checked_out_by": "user-001",
            "expected_return_date": (datetime.utcnow() + timedelta(days=7))
            .date()
            .isoformat(),
            "location": "Test location",
            "notes": "Test checkout",
        }

        checkout_response = client.post(
            "/api/v1/checkin-checkout/checkout", json=checkout_data
        )
        assert checkout_response.status_code == 201

        # Then check it back in
        checkin_data = {
            "asset_id": "test-asset-002",
            "asset_name": "Test Asset 2",
            "action": "checkin",
            "checked_in_by": "user-002",
            "location": "Test return location",
            "notes": "Test checkin",
        }

        response = client.post("/api/v1/checkin-checkout/checkin", json=checkin_data)
        assert response.status_code == 201
        data = response.json()
        assert data["asset_id"] == checkin_data["asset_id"]
        assert data["action"] == checkin_data["action"]
        assert data["checked_in_by"] == checkin_data["checked_in_by"]

    def test_get_checkin_checkout_records(
        self, client: TestClient, sample_checkin_data: dict
    ):
        """Test getting check-in/check-out records"""
        # Create a record first
        create_response = client.post(
            "/api/v1/checkin-checkout/checkin", json=sample_checkin_data
        )
        assert create_response.status_code == 201

        # Get all records
        response = client.get("/api/v1/checkin-checkout/records")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["asset_id"] == sample_checkin_data["asset_id"]

    def test_get_checkin_checkout_records_with_filters(
        self, client: TestClient, sample_checkin_data: dict
    ):
        """Test getting check-in/check-out records with filters"""
        # Create a record first
        create_response = client.post(
            "/api/v1/checkin-checkout/checkin", json=sample_checkin_data
        )
        assert create_response.status_code == 201

        # Filter by asset_id
        response = client.get(
            f"/api/v1/checkin-checkout/records?asset_id={sample_checkin_data['asset_id']}"
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["asset_id"] == sample_checkin_data["asset_id"]

        # Filter by action
        response = client.get(
            f"/api/v1/checkin-checkout/records?action={sample_checkin_data['action']}"
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["action"] == sample_checkin_data["action"]

    def test_get_checkin_checkout_record_by_id(
        self, client: TestClient, sample_checkin_data: dict
    ):
        """Test getting a specific check-in/check-out record by ID"""
        # Create a record first
        create_response = client.post(
            "/api/v1/checkin-checkout/checkin", json=sample_checkin_data
        )
        assert create_response.status_code == 201
        record_id = create_response.json()["id"]

        # Get record by ID
        response = client.get(f"/api/v1/checkin-checkout/records/{record_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == record_id
        assert data["asset_id"] == sample_checkin_data["asset_id"]

    def test_get_checkin_checkout_record_not_found(self, client: TestClient):
        """Test getting a non-existent check-in/check-out record"""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = client.get(f"/api/v1/checkin-checkout/records/{fake_id}")
        assert response.status_code == 404

    def test_get_current_status(self, client: TestClient):
        """Test getting current check-in/check-out status"""
        response = client.get("/api/v1/checkin-checkout/status")
        assert response.status_code == 200
        data = response.json()
        assert "checked_out_assets" in data
        assert "checked_in_assets" in data
        assert "total_checked_out" in data
        assert "total_checked_in" in data
        assert isinstance(data["checked_out_assets"], list)
        assert isinstance(data["checked_in_assets"], list)

    def test_get_current_status_for_asset(
        self, client: TestClient, sample_checkin_data: dict
    ):
        """Test getting current status for a specific asset"""
        # Create a record first
        create_response = client.post(
            "/api/v1/checkin-checkout/checkin", json=sample_checkin_data
        )
        assert create_response.status_code == 201

        # Get status for specific asset
        response = client.get(
            f"/api/v1/checkin-checkout/status/{sample_checkin_data['asset_id']}"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["asset_id"] == sample_checkin_data["asset_id"]
        assert "current_status" in data
        assert "last_action" in data
        assert "last_action_date" in data

    def test_get_overdue_checkins(self, client: TestClient):
        """Test getting overdue check-ins"""
        # Create a record with past expected return date
        overdue_data = {
            "asset_id": "overdue-asset",
            "asset_name": "Overdue Asset",
            "action": "checkout",
            "checked_out_by": "user-001",
            "expected_return_date": (datetime.utcnow() - timedelta(days=1))
            .date()
            .isoformat(),
            "location": "Test location",
            "notes": "Overdue checkout",
        }

        create_response = client.post(
            "/api/v1/checkin-checkout/checkout", json=overdue_data
        )
        assert create_response.status_code == 201

        # Get overdue check-ins
        response = client.get("/api/v1/checkin-checkout/overdue")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["asset_id"] == overdue_data["asset_id"]

    def test_get_checkin_checkout_stats(
        self, client: TestClient, sample_checkin_data: dict
    ):
        """Test getting check-in/check-out statistics"""
        # Create a record first
        create_response = client.post(
            "/api/v1/checkin-checkout/checkin", json=sample_checkin_data
        )
        assert create_response.status_code == 201

        # Get statistics
        response = client.get("/api/v1/checkin-checkout/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_records" in data
        assert "checkout_count" in data
        assert "checkin_count" in data
        assert "overdue_count" in data
        assert "most_checked_out_assets" in data
        assert "most_active_users" in data
        assert "checkout_trends" in data
        assert isinstance(data["most_checked_out_assets"], list)
        assert isinstance(data["most_active_users"], list)
        assert isinstance(data["checkout_trends"], list)

    def test_get_checkin_checkout_stats_with_date_range(
        self, client: TestClient, sample_checkin_data: dict
    ):
        """Test getting check-in/check-out statistics with date range"""
        # Create a record first
        create_response = client.post(
            "/api/v1/checkin-checkout/checkin", json=sample_checkin_data
        )
        assert create_response.status_code == 201

        # Get statistics with date range
        start_date = "2025-01-01"
        end_date = "2025-12-31"

        response = client.get(
            f"/api/v1/checkin-checkout/stats?start_date={start_date}&end_date={end_date}"
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_records" in data
        assert "checkout_count" in data
        assert "checkin_count" in data

    def test_checkin_validation_error(self, client: TestClient):
        """Test checking in with invalid data"""
        invalid_data = {
            "asset_id": "",  # Empty asset_id should fail
            "action": "invalid_action",  # Invalid action
            "checked_in_by": "",  # Empty checked_in_by should fail
        }
        response = client.post("/api/v1/checkin-checkout/checkin", json=invalid_data)
        assert response.status_code == 422  # Validation error

    def test_checkout_validation_error(self, client: TestClient):
        """Test checking out with invalid data"""
        invalid_data = {
            "asset_id": "",  # Empty asset_id should fail
            "action": "checkout",
            "checked_out_by": "",  # Empty checked_out_by should fail
            "expected_return_date": "invalid-date",  # Invalid date format
        }
        response = client.post("/api/v1/checkin-checkout/checkout", json=invalid_data)
        assert response.status_code == 422  # Validation error

    def test_get_checkin_checkout_records_pagination(self, client: TestClient):
        """Test getting check-in/check-out records with pagination"""
        # Create multiple records
        for i in range(5):
            record_data = {
                "asset_id": f"asset-{i}",
                "asset_name": f"Asset {i}",
                "action": "checkout",
                "checked_out_by": f"user-{i}",
                "expected_return_date": (datetime.utcnow() + timedelta(days=7))
                .date()
                .isoformat(),
                "location": f"Location {i}",
                "notes": f"Test checkout {i}",
            }
            client.post("/api/v1/checkin-checkout/checkout", json=record_data)

        # Test pagination
        response = client.get("/api/v1/checkin-checkout/records?skip=0&limit=3")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3

        response = client.get("/api/v1/checkin-checkout/records?skip=3&limit=3")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2  # Only 2 remaining
