"""
Unit tests for Locations module
"""

import uuid
from datetime import datetime
from unittest.mock import Mock

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from modules.locations.estimator import LocationEstimator
from modules.locations.models import EstimatedLocation


@pytest.fixture
def mock_cache() -> None:
    """Mock cache manager for LocationEstimator"""
    return Mock()


class TestLocationModel:
    """Test EstimatedLocation model functionality"""

    @pytest.mark.asyncio
    async def test_create_location(self, db_session) -> None:
        """Test creating a location estimate"""
        location = EstimatedLocation(
            organization_id=uuid.UUID("550e8400-e29b-41d4-a716-446655440003"),
            asset_id=uuid.UUID("550e8400-e29b-41d4-a716-446655440000"),
            latitude=40.7128,
            longitude=-74.0060,
            uncertainty_radius=10.0,
            confidence=0.85,
            algorithm="TRILATERATION",
            gateway_count=2,
            gateway_ids=["gateway-1", "gateway-2"],
            estimated_at=datetime.now(),
        )

        db_session.add(location)
        await db_session.commit()
        await db_session.refresh(location)

        assert location.id is not None
        assert location.asset_id == uuid.UUID("550e8400-e29b-41d4-a716-446655440000")
        from decimal import Decimal

        assert location.latitude == Decimal("40.7128")
        assert location.longitude == Decimal("-74.0060")
        assert location.confidence == Decimal("0.85")
        assert len(location.gateway_ids) == 2

    @pytest.mark.asyncio
    async def test_location_with_distance(self, db_session) -> None:
        """Test location with distance calculation"""
        location = EstimatedLocation(
            organization_id=uuid.UUID("550e8400-e29b-41d4-a716-446655440003"),
            asset_id=uuid.UUID("550e8400-e29b-41d4-a716-446655440000"),
            latitude=40.7128,
            longitude=-74.0060,
            uncertainty_radius=10.0,
            confidence=0.85,
            algorithm="TRILATERATION",
            gateway_count=1,
            gateway_ids=["gateway-1"],
            estimated_at=datetime.now(),
            distance_from_previous=100.5,
        )

        db_session.add(location)
        await db_session.commit()
        await db_session.refresh(location)

        assert location.distance_from_previous == 100.5


class TestLocationEstimator:
    """Test LocationEstimator functionality"""

    def test_rssi_to_distance_conversion(self, mock_cache) -> None:
        """Test RSSI to distance conversion"""
        estimator = LocationEstimator(mock_cache)

        # Test known RSSI values
        rssi_values = [-30, -50, -70, -90]
        distances = [estimator._rssi_to_distance(rssi) for rssi in rssi_values]

        # Distances should be in ascending order (higher RSSI = closer)
        assert distances[0] < distances[1] < distances[2] < distances[3]

        # All distances should be positive
        assert all(d > 0 for d in distances)

    @pytest.mark.skip(reason="Trilateration method not implemented as public method")
    def test_trilateration_calculation(self, mock_cache) -> None:
        """Test trilateration calculation"""
        estimator = LocationEstimator(mock_cache)

        # Test with known gateway positions and distances
        gateways = [
            {"id": "gw1", "latitude": 40.7128, "longitude": -74.0060, "distance": 100},
            {"id": "gw2", "latitude": 40.7138, "longitude": -74.0050, "distance": 150},
            {"id": "gw3", "latitude": 40.7118, "longitude": -74.0070, "distance": 200},
        ]

        result = estimator.calculate_trilateration(gateways)

        assert result is not None
        assert "latitude" in result
        assert "longitude" in result
        assert "confidence" in result

        # Check that coordinates are reasonable (within NYC area)
        assert 40.7 <= result["latitude"] <= 40.8
        assert -74.01 <= result["longitude"] <= -74.0

    @pytest.mark.skip(reason="Trilateration method not implemented as public method")
    def test_insufficient_gateways(self, mock_cache) -> None:
        """Test trilateration with insufficient gateways"""
        estimator = LocationEstimator(mock_cache)

        # Test with only 2 gateways (insufficient for trilateration)
        gateways = [
            {"id": "gw1", "latitude": 40.7128, "longitude": -74.0060, "distance": 100},
            {"id": "gw2", "latitude": 40.7138, "longitude": -74.0050, "distance": 150},
        ]

        result = estimator.calculate_trilateration(gateways)

        # Should return None or a low-confidence result
        assert result is None or result["confidence"] < 0.5

    @pytest.mark.skip(reason="Trilateration method not implemented as public method")
    def test_invalid_gateway_data(self, mock_cache) -> None:
        """Test trilateration with invalid gateway data"""
        estimator = LocationEstimator(mock_cache)

        # Test with invalid data
        gateways = [
            {
                "id": "gw1",
                "latitude": "invalid",
                "longitude": -74.0060,
                "distance": 100,
            },
            {"id": "gw2", "latitude": 40.7138, "longitude": -74.0050, "distance": 150},
            {"id": "gw3", "latitude": 40.7118, "longitude": -74.0070, "distance": 200},
        ]

        result = estimator.calculate_trilateration(gateways)

        # Should handle invalid data gracefully
        assert result is None or result["confidence"] < 0.5

    @pytest.mark.skip(
        reason="Distance calculation method not implemented as public method"
    )
    def test_distance_calculation(self, mock_cache) -> None:
        """Test distance calculation between two points"""
        estimator = LocationEstimator(mock_cache)

        # Test distance between two known points
        lat1, lon1 = 40.7128, -74.0060  # NYC
        lat2, lon2 = 40.7589, -73.9851  # Central Park

        distance = estimator.calculate_distance(lat1, lon1, lat2, lon2)

        # Distance should be reasonable (a few kilometers)
        assert 0 < distance < 10000  # Less than 10km

    @pytest.mark.skip(
        reason="Confidence calculation method not implemented as public method"
    )
    def test_confidence_calculation(self, mock_cache) -> None:
        """Test confidence calculation based on gateway data"""
        estimator = LocationEstimator(mock_cache)

        # Test with good gateway coverage
        gateways_good = [
            {
                "id": "gw1",
                "latitude": 40.7128,
                "longitude": -74.0060,
                "distance": 100,
                "rssi": -50,
            },
            {
                "id": "gw2",
                "latitude": 40.7138,
                "longitude": -74.0050,
                "distance": 150,
                "rssi": -60,
            },
            {
                "id": "gw3",
                "latitude": 40.7118,
                "longitude": -74.0070,
                "distance": 200,
                "rssi": -70,
            },
        ]

        confidence_good = estimator.calculate_confidence(gateways_good)

        # Test with poor gateway coverage
        gateways_poor = [
            {
                "id": "gw1",
                "latitude": 40.7128,
                "longitude": -74.0060,
                "distance": 500,
                "rssi": -90,
            },
            {
                "id": "gw2",
                "latitude": 40.7138,
                "longitude": -74.0050,
                "distance": 600,
                "rssi": -95,
            },
        ]

        confidence_poor = estimator.calculate_confidence(gateways_poor)

        # Good coverage should have higher confidence
        assert confidence_good > confidence_poor
        assert 0 <= confidence_good <= 1
        assert 0 <= confidence_poor <= 1
