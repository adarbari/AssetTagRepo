"""
Unit tests for Geofences module
"""
import uuid
from datetime import datetime

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

# from modules.geofences.geofence_evaluator import GeofenceEvaluator  # Module not implemented yet
from modules.geofences.models import Geofence
from modules.geofences.schemas import GeofenceCreate, GeofenceUpdate


class TestGeofenceModel:
    """Test Geofence model functionality"""

    @pytest.mark.asyncio
    async def test_create_geofence(
        self, db_session, sample_geofence_data
    ):
        """Test creating a geofence"""
        geofence = Geofence(organization_id=uuid.UUID("550e8400-e29b-41d4-a716-446655440003"), **sample_geofence_data)

        db_session.add(geofence)
        await db_session.commit()
        await db_session.refresh(geofence)

        assert geofence.id is not None
        assert geofence.name == sample_geofence_data["name"]
        assert geofence.geofence_type == sample_geofence_data["geofence_type"]
        assert geofence.status == sample_geofence_data["status"]
        assert geofence.geometry == sample_geofence_data["geometry"]

    @pytest.mark.asyncio
    async def test_geofence_soft_delete(
        self, db_session, sample_geofence_data
    ):
        """Test soft delete functionality"""
        geofence = Geofence(organization_id=uuid.UUID("550e8400-e29b-41d4-a716-446655440003"), **sample_geofence_data)

        db_session.add(geofence)
        await db_session.commit()
        await db_session.refresh(geofence)

        # Soft delete
        geofence.deleted_at = datetime.now()
        await db_session.commit()

        assert geofence.deleted_at is not None

    @pytest.mark.asyncio
    async def test_geofence_geometry_validation(self, db_session):
        """Test geofence geometry validation"""
        # Test with valid polygon geometry
        valid_geometry = {
            "type": "Polygon",
            "coordinates": [
                [
                    [-74.0060, 40.7128],
                    [-74.0050, 40.7128],
                    [-74.0050, 40.7138],
                    [-74.0060, 40.7138],
                    [-74.0060, 40.7128],
                ]
            ],
        }

        geofence = Geofence(
            organization_id=uuid.UUID("550e8400-e29b-41d4-a716-446655440003"),
            name="Test Geofence",
            geofence_type="authorized",
            status="active",
            geometry=valid_geometry,
        )

        db_session.add(geofence)
        await db_session.commit()
        await db_session.refresh(geofence)

        assert geofence.geometry == valid_geometry


class TestGeofenceSchemas:
    """Test Geofence Pydantic schemas"""

    def test_geofence_create_schema(self, sample_geofence_data):
        """Test GeofenceCreate schema validation"""
        geofence_create = GeofenceCreate(**sample_geofence_data)

        assert geofence_create.name == sample_geofence_data["name"]
        assert geofence_create.geofence_type == sample_geofence_data["geofence_type"]
        assert geofence_create.status == sample_geofence_data["status"]
        assert geofence_create.geometry == sample_geofence_data["geometry"]

    def test_geofence_create_validation(self):
        """Test GeofenceCreate validation rules"""
        # Test required fields
        with pytest.raises(ValueError):
            GeofenceCreate()

        # Test valid data
        valid_data = {
            "name": "Test Geofence",
            "geofence_type": "polygon",
            "status": "active",
            "coordinates": [
                [-74.0060, 40.7128],
                [-74.0050, 40.7128],
                [-74.0050, 40.7138],
                [-74.0060, 40.7138],
                [-74.0060, 40.7128],
            ],
        }
        geofence_create = GeofenceCreate(**valid_data)
        assert geofence_create.name == "Test Geofence"

    def test_geofence_update_schema(self):
        """Test GeofenceUpdate schema"""
        update_data = {"name": "Updated Geofence Name", "status": "inactive"}

        geofence_update = GeofenceUpdate(**update_data)
        assert geofence_update.name == "Updated Geofence Name"
        assert geofence_update.status == "inactive"

    def test_geofence_type_validation(self):
        """Test geofence type validation"""
        valid_types = ["circular", "polygon"]

        for geofence_type in valid_types:
            data = {
                "name": "Test Geofence",
                "geofence_type": geofence_type,
                "status": "active",
                "coordinates": [
                    [-74.0060, 40.7128],
                    [-74.0050, 40.7128],
                    [-74.0050, 40.7138],
                    [-74.0060, 40.7138],
                    [-74.0060, 40.7128],
                ],
            }
            geofence = GeofenceCreate(**data)
            assert geofence.geofence_type == geofence_type


# class TestGeofenceEvaluator:
#     """Test GeofenceEvaluator functionality - DISABLED: Module not implemented yet"""
#
#     def test_evaluator_initialization(self):
#         """Test evaluator initialization"""
#         evaluator = GeofenceEvaluator()
#         assert evaluator is not None
#
#     def test_point_in_polygon(self):
#         """Test point-in-polygon detection"""
#         evaluator = GeofenceEvaluator()
#
#         # Define a simple square polygon
#         polygon_coords = [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]
#
#         # Test point inside polygon
#         point_inside = (5, 5)
#         result = evaluator.point_in_polygon(point_inside, polygon_coords)
#         assert result is True
#
#         # Test point outside polygon
#         point_outside = (15, 15)
#         result = evaluator.point_in_polygon(point_outside, polygon_coords)
#         assert result is False
#
#         # Test point on boundary
#         point_boundary = (0, 5)
#         result = evaluator.point_in_polygon(point_boundary, polygon_coords)
#         assert result is True  # Boundary points are considered inside
#
#     def test_evaluate_geofence_entry(self):
#         """Test geofence entry evaluation"""
#         evaluator = GeofenceEvaluator()
#
#         # Define geofence
#         geofence = {
#             "id": "test-geofence-1",
#             "name": "Test Geofence",
#             "geofence_type": "authorized",
#             "geometry": {"type": "Polygon", "coordinates": [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]]},
#         }
#
#         # Test entry event
#         previous_location = {"latitude": 15, "longitude": 15}  # Outside
#         current_location = {"latitude": 5, "longitude": 5}  # Inside
#
#         result = evaluator.evaluate_geofence_event(geofence, previous_location, current_location)
#
#         assert result is not None
#         assert result["event_type"] == "entry"
#         assert result["geofence_id"] == "test-geofence-1"
#         assert result["geofence_type"] == "authorized"
#
#     def test_evaluate_geofence_exit(self):
#         """Test geofence exit evaluation"""
#         evaluator = GeofenceEvaluator()
#
#         # Define geofence
#         geofence = {
#             "id": "test-geofence-1",
#             "name": "Test Geofence",
#             "geofence_type": "authorized",
#             "geometry": {"type": "Polygon", "coordinates": [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]]},
#         }
#
#         # Test exit event
#         previous_location = {"latitude": 5, "longitude": 5}  # Inside
#         current_location = {"latitude": 15, "longitude": 15}  # Outside
#
#         result = evaluator.evaluate_geofence_event(geofence, previous_location, current_location)
#
#         assert result is not None
#         assert result["event_type"] == "exit"
#         assert result["geofence_id"] == "test-geofence-1"
#         assert result["geofence_type"] == "authorized"
#
#     def test_no_geofence_event(self):
#         """Test when no geofence event occurs"""
#         evaluator = GeofenceEvaluator()
#
#         # Define geofence
#         geofence = {
#             "id": "test-geofence-1",
#             "name": "Test Geofence",
#             "geofence_type": "authorized",
#             "geometry": {"type": "Polygon", "coordinates": [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]]},
#         }
#
#         # Test movement within geofence
#         previous_location = {"latitude": 2, "longitude": 2}  # Inside
#         current_location = {"latitude": 8, "longitude": 8}  # Inside
#
#         result = evaluator.evaluate_geofence_event(geofence, previous_location, current_location)
#
#         assert result is None  # No event should be generated
#
#     def test_multiple_geofences(self):
#         """Test evaluation with multiple geofences"""
#         evaluator = GeofenceEvaluator()
#
#         # Define multiple geofences
#         geofences = [
#             {
#                 "id": "geofence-1",
#                 "name": "Authorized Area",
#                 "geofence_type": "authorized",
#                 "geometry": {"type": "Polygon", "coordinates": [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]]},
#             },
#             {
#                 "id": "geofence-2",
#                 "name": "Restricted Area",
#                 "geofence_type": "restricted",
#                 "geometry": {"type": "Polygon", "coordinates": [[[5, 5], [15, 5], [15, 15], [5, 15], [5, 5]]]},
#             },
#         ]
#
#         # Test movement from authorized to restricted area
#         previous_location = {"latitude": 2, "longitude": 2}  # In authorized area
#         current_location = {"latitude": 8, "longitude": 8}  # In restricted area
#
#         events = evaluator.evaluate_all_geofences(geofences, previous_location, current_location)
#
#         assert len(events) == 2
#         assert any(event["event_type"] == "exit" and event["geofence_id"] == "geofence-1" for event in events)
#         assert any(event["event_type"] == "entry" and event["geofence_id"] == "geofence-2" for event in events)
#
#     def test_invalid_geometry(self):
#         """Test handling of invalid geometry"""
#         evaluator = GeofenceEvaluator()
#
#         # Test with invalid polygon (not closed)
#         invalid_polygon = [[0, 0], [10, 0], [10, 10], [0, 10]]  # Missing closing point
#
#         point = (5, 5)
#
#         # Should handle invalid geometry gracefully
#         try:
#             result = evaluator.point_in_polygon(point, invalid_polygon)
#             # If it doesn't raise an exception, result should be False or None
#             assert result is False or result is None
#         except Exception:
#             # It's acceptable for invalid geometry to raise an exception
#             pass
#
#     def test_edge_cases(self):
#         """Test edge cases for geofence evaluation"""
#         evaluator = GeofenceEvaluator()
#
#         # Test with very small polygon
#         small_polygon = [[0, 0], [0.001, 0], [0.001, 0.001], [0, 0.001], [0, 0]]
#
#         point_inside = (0.0005, 0.0005)
#         result = evaluator.point_in_polygon(point_inside, small_polygon)
#         assert result is True
#
#         # Test with point at exact coordinates
#         point_exact = (0, 0)
#         result = evaluator.point_in_polygon(point_exact, small_polygon)
#         assert result is True  # Boundary points are considered inside
