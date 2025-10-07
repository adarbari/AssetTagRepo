"""
Unit tests for Assets module
"""

import uuid
from datetime import datetime

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from modules.assets.models import Asset
from modules.assets.schemas import AssetCreate, AssetUpdate


class TestAssetModel:
    """Test Asset model functionality"""

    @pytest.mark.asyncio
    async def test_create_asset(self, db_session, test_organization_sync, test_site_sync, test_user_sync) -> None:
        """Test creating an asset"""
        asset = Asset(
            organization_id=test_organization_sync.id,
            name="Test Excavator",
            serial_number="EXC-001",
            asset_type="excavator",
            status="active",
            current_site_id=test_site_sync.id,
            assigned_to_user_id=test_user_sync.id,
            battery_level=85,
            asset_metadata={"model": "CAT 320", "year": 2020}
        )

        db_session.add(asset)
        await db_session.commit()
        await db_session.refresh(asset)

        assert asset.id is not None
        assert asset.name == "Test Excavator"
        assert asset.asset_type == "excavator"
        assert asset.status == "active"
        assert asset.battery_level == 85

    @pytest.mark.asyncio
    async def test_asset_soft_delete(self, db_session, test_organization_sync, test_site_sync, test_user_sync) -> None:
        """Test soft delete functionality"""
        asset = Asset(
            organization_id=test_organization_sync.id,
            name="Test Excavator",
            serial_number="EXC-002",
            asset_type="excavator",
            status="active",
            current_site_id=test_site_sync.id,
            assigned_to_user_id=test_user_sync.id,
            battery_level=85
        )

        db_session.add(asset)
        await db_session.commit()
        await db_session.refresh(asset)

        # Soft delete
        asset.deleted_at = datetime.now()
        await db_session.commit()

        assert asset.deleted_at is not None

    @pytest.mark.asyncio
    async def test_asset_metadata(self, db_session, test_organization_sync, test_site_sync, test_user_sync) -> None:
        """Test asset metadata handling"""
        metadata = {"model": "CAT 320", "year": 2020}
        asset = Asset(
            organization_id=test_organization_sync.id,
            name="Test Excavator",
            serial_number="EXC-003",
            asset_type="excavator",
            status="active",
            current_site_id=test_site_sync.id,
            assigned_to_user_id=test_user_sync.id,
            battery_level=85,
            asset_metadata=metadata
        )

        db_session.add(asset)
        await db_session.commit()
        await db_session.refresh(asset)

        assert asset.asset_metadata == metadata
        assert asset.asset_metadata["model"] == "CAT 320"
        assert asset.asset_metadata["year"] == 2020


class TestAssetSchemas:
    """Test Asset Pydantic schemas"""

    def test_asset_create_schema(self, sample_asset_data) -> None:
        """Test AssetCreate schema validation"""
        asset_create = AssetCreate(**sample_asset_data)

        assert asset_create.name == sample_asset_data["name"]
        assert asset_create.asset_type == sample_asset_data["asset_type"]
        assert asset_create.status == sample_asset_data["status"]
        assert asset_create.battery_level == sample_asset_data["battery_level"]

    def test_asset_create_validation(self) -> None:
        """Test AssetCreate validation rules"""
        # Test required fields
        with pytest.raises(ValueError):
            AssetCreate()

        # Test valid data
        valid_data = {
            "name": "Test Asset",
            "serial_number": "TEST-001",
            "asset_type": "excavator",
            "status": "active",
            "organization_id": "550e8400-e29b-41d4-a716-446655440003",
        }
        asset_create = AssetCreate(**valid_data)
        assert asset_create.name == "Test Asset"

    def test_asset_update_schema(self) -> None:
        """Test AssetUpdate schema"""
        update_data = {"name": "Updated Asset Name", "battery_level": 90}

        asset_update = AssetUpdate(**update_data)
        assert asset_update.name == "Updated Asset Name"
        assert asset_update.battery_level == 90

    def test_asset_update_partial(self) -> None:
        """Test partial updates with AssetUpdate"""
        # Should work with empty dict
        asset_update = AssetUpdate()
        assert asset_update.name is None

        # Should work with partial data
        asset_update = AssetUpdate(name="New Name")
        assert asset_update.name == "New Name"
        assert asset_update.battery_level is None


class TestAssetBusinessLogic:
    """Test asset business logic"""

    def test_battery_level_validation(self) -> None:
        """Test battery level validation"""
        # Valid battery levels
        valid_data = {
            "name": "Test Asset",
            "serial_number": "TEST-001",
            "asset_type": "excavator",
            "battery_level": 50,
            "organization_id": "550e8400-e29b-41d4-a716-446655440003",
        }
        asset = AssetCreate(**valid_data)
        assert asset.battery_level == 50

        # Edge cases
        valid_data["battery_level"] = 0
        asset = AssetCreate(**valid_data)
        assert asset.battery_level == 0

        valid_data["battery_level"] = 100
        asset = AssetCreate(**valid_data)
        assert asset.battery_level == 100

    def test_asset_status_validation(self) -> None:
        """Test asset status validation"""
        valid_statuses = ["active", "inactive", "maintenance", "retired"]

        for status in valid_statuses:
            data = {
                "name": "Test Asset",
                "serial_number": "TEST-001",
                "asset_type": "excavator",
                "status": status,
                "organization_id": "550e8400-e29b-41d4-a716-446655440003",
            }
            asset = AssetCreate(**data)
            assert asset.status == status

    def test_asset_type_validation(self) -> None:
        """Test asset type validation"""
        valid_types = ["excavator", "bulldozer", "crane", "truck", "generator"]

        for asset_type in valid_types:
            data = {
                "name": "Test Asset",
                "serial_number": "TEST-001",
                "asset_type": asset_type,
                "status": "active",
                "organization_id": "550e8400-e29b-41d4-a716-446655440003",
            }
            asset = AssetCreate(**data)
            assert asset.asset_type == asset_type
