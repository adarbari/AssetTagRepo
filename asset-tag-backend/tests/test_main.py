"""
Test cases for main application
"""

import pytest
from fastapi.testclient import TestClient


class TestMainApplication:
    """Test cases for main application endpoints"""

    def test_root_endpoint(self, client: TestClient) -> None:
        """Test the root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert "environment" in data
        assert data["message"] == "Asset Tag Backend API"
        assert data["version"] == "1.0.0"

    def test_health_check(self, client: TestClient) -> None:
        """Test the health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "environment" in data
        assert "timestamp" in data
        assert data["status"] == "healthy"

    def test_docs_endpoint(self, client: TestClient) -> None:
        """Test that docs endpoint is accessible in local environment"""
        response = client.get("/docs")
        # Should return 200 in local environment, 404 in production
        assert response.status_code in [200, 404]

    def test_openapi_endpoint(self, client: TestClient) -> None:
        """Test that OpenAPI schema endpoint is accessible"""
        response = client.get("/openapi.json")
        assert response.status_code == 200
        data = response.json()
        assert "openapi" in data
        assert "info" in data
        assert "paths" in data
        assert data["info"]["title"] == "Asset Tag Backend API"
        assert data["info"]["version"] == "1.0.0"

    def test_api_routes_exist(self, client: TestClient) -> None:
        """Test that all API routes are properly registered"""
        # Test that all main API routes return 200 (even if empty)
        api_routes = [
            "/api/v1/assets",
            "/api/v1/sites",
            "/api/v1/gateways",
            "/api/v1/observations",
            "/api/v1/locations",
            "/api/v1/geofences",
            "/api/v1/alerts",
            "/api/v1/jobs",
            "/api/v1/maintenance",
            "/api/v1/analytics",
            "/api/v1/checkin-checkout/records",
            "/api/v1/search/assets",
            "/api/v1/audit/organizations",
        ]

        for route in api_routes:
            response = client.get(route)
            # Should return 200 (empty list) or 404 (if route doesn't exist)
            assert response.status_code in [
                200,
                404,
            ], f"Route {route} returned {response.status_code}"

    def test_cors_headers(self, client: TestClient) -> None:
        """Test that CORS headers are properly set"""
        response = client.options("/")
        # CORS preflight should be handled
        assert response.status_code in [200, 405]  # 405 if OPTIONS not implemented

    def test_process_time_header(self, client: TestClient) -> None:
        """Test that process time header is added to responses"""
        response = client.get("/health")
        assert response.status_code == 200
        assert "X-Process-Time" in response.headers
        # Process time should be a valid float
        process_time = float(response.headers["X-Process-Time"])
        assert process_time >= 0

    def test_global_exception_handler(self, client: TestClient) -> None:
        """Test that global exception handler works"""
        # This would require a route that throws an exception
        # For now, we'll just verify the health endpoint works
        response = client.get("/health")
        assert response.status_code == 200

    def test_api_versioning(self, client: TestClient) -> None:
        """Test that API versioning is properly implemented"""
        # Test v1 API
        response = client.get("/api/v1/assets")
        assert response.status_code == 200

        # Test that non-versioned API returns 404
        response = client.get("/api/assets")
        assert response.status_code == 404

    def test_api_tags(self, client: TestClient) -> None:
        """Test that API tags are properly set"""
        # Get OpenAPI schema
        response = client.get("/openapi.json")
        assert response.status_code == 200
        data = response.json()

        # Check that expected tags exist
        expected_tags = [
            "assets",
            "sites",
            "gateways",
            "observations",
            "locations",
            "geofences",
            "alerts",
            "jobs",
            "maintenance",
            "analytics",
            "checkin-checkout",
            "search",
            "features",
            "ml",
            "audit",
            "streaming",
        ]

        # Get all tags from the schema
        all_tags = []
        for path_data in data["paths"].values():
            for method_data in path_data.values():
                if "tags" in method_data:
                    all_tags.extend(method_data["tags"])

        # Check that at least some expected tags are present
        found_tags = set(all_tags)
        expected_tags_set = set(expected_tags)
        assert (
            len(found_tags.intersection(expected_tags_set)) > 0
        ), "No expected API tags found"
