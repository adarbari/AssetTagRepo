"""
Integration tests for Assets API endpoints
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


class TestAssetsAPI:
    """Test Assets API endpoints"""
    
    @pytest.mark.asyncio
    async def test_create_asset(self, client: AsyncClient, sample_asset_data):
        """Test creating an asset via API"""
        response = await client.post("/assets", json=sample_asset_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["name"] == sample_asset_data["name"]
        assert data["asset_type"] == sample_asset_data["asset_type"]
        assert data["status"] == sample_asset_data["status"]
        assert data["battery_level"] == sample_asset_data["battery_level"]
        assert "id" in data
        assert "created_at" in data
    
    @pytest.mark.asyncio
    async def test_get_assets(self, client: AsyncClient, sample_asset_data):
        """Test getting list of assets"""
        # Create a test asset first
        await client.post("/assets", json=sample_asset_data)
        
        response = await client.get("/assets")
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) >= 1
        
        # Check that our created asset is in the list
        asset_names = [asset["name"] for asset in data]
        assert sample_asset_data["name"] in asset_names
    
    @pytest.mark.asyncio
    async def test_get_asset_by_id(self, client: AsyncClient, sample_asset_data):
        """Test getting a specific asset by ID"""
        # Create a test asset first
        create_response = await client.post("/assets", json=sample_asset_data)
        asset_id = create_response.json()["id"]
        
        response = await client.get(f"/assets/{asset_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == asset_id
        assert data["name"] == sample_asset_data["name"]
        assert data["asset_type"] == sample_asset_data["asset_type"]
    
    @pytest.mark.asyncio
    async def test_get_nonexistent_asset(self, client: AsyncClient):
        """Test getting a non-existent asset"""
        response = await client.get("/assets/nonexistent-id")
        
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_update_asset(self, client: AsyncClient, sample_asset_data):
        """Test updating an asset"""
        # Create a test asset first
        create_response = await client.post("/assets", json=sample_asset_data)
        asset_id = create_response.json()["id"]
        
        # Update the asset
        update_data = {
            "name": "Updated Asset Name",
            "battery_level": 95
        }
        
        response = await client.put(f"/assets/{asset_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["name"] == update_data["name"]
        assert data["battery_level"] == update_data["battery_level"]
        assert data["asset_type"] == sample_asset_data["asset_type"]  # Should remain unchanged
    
    @pytest.mark.asyncio
    async def test_delete_asset(self, client: AsyncClient, sample_asset_data):
        """Test deleting an asset"""
        # Create a test asset first
        create_response = await client.post("/assets", json=sample_asset_data)
        asset_id = create_response.json()["id"]
        
        # Delete the asset
        response = await client.delete(f"/assets/{asset_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Asset deleted successfully"
        
        # Verify asset is deleted (should return 404)
        get_response = await client.get(f"/assets/{asset_id}")
        assert get_response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_asset_filtering(self, client: AsyncClient):
        """Test asset filtering by status and type"""
        # Create test assets with different statuses
        asset1_data = {
            "name": "Active Asset",
            "asset_type": "excavator",
            "status": "active"
        }
        asset2_data = {
            "name": "Inactive Asset",
            "asset_type": "bulldozer",
            "status": "inactive"
        }
        
        await client.post("/assets", json=asset1_data)
        await client.post("/assets", json=asset2_data)
        
        # Test filtering by status
        response = await client.get("/assets?status=active")
        assert response.status_code == 200
        data = response.json()
        
        active_assets = [asset for asset in data if asset["status"] == "active"]
        assert len(active_assets) >= 1
        
        # Test filtering by asset type
        response = await client.get("/assets?asset_type=excavator")
        assert response.status_code == 200
        data = response.json()
        
        excavators = [asset for asset in data if asset["asset_type"] == "excavator"]
        assert len(excavators) >= 1
    
    @pytest.mark.asyncio
    async def test_asset_pagination(self, client: AsyncClient):
        """Test asset pagination"""
        # Create multiple test assets
        for i in range(5):
            asset_data = {
                "name": f"Test Asset {i}",
                "asset_type": "excavator",
                "status": "active"
            }
            await client.post("/assets", json=asset_data)
        
        # Test pagination
        response = await client.get("/assets?skip=0&limit=3")
        assert response.status_code == 200
        data = response.json()
        
        assert len(data) <= 3
        
        # Test second page
        response = await client.get("/assets?skip=3&limit=3")
        assert response.status_code == 200
        data = response.json()
        
        assert len(data) <= 3
    
    @pytest.mark.asyncio
    async def test_asset_validation(self, client: AsyncClient):
        """Test asset data validation"""
        # Test with missing required fields
        invalid_data = {
            "name": "Test Asset"
            # Missing asset_type and status
        }
        
        response = await client.post("/assets", json=invalid_data)
        assert response.status_code == 422  # Validation error
        
        # Test with invalid battery level
        invalid_data = {
            "name": "Test Asset",
            "asset_type": "excavator",
            "status": "active",
            "battery_level": 150  # Invalid: > 100
        }
        
        response = await client.post("/assets", json=invalid_data)
        assert response.status_code == 422  # Validation error
    
    @pytest.mark.asyncio
    async def test_asset_search(self, client: AsyncClient, sample_asset_data):
        """Test asset search functionality"""
        # Create a test asset
        await client.post("/assets", json=sample_asset_data)
        
        # Test search by name
        response = await client.get(f"/assets?search={sample_asset_data['name']}")
        assert response.status_code == 200
        data = response.json()
        
        assert len(data) >= 1
        assert any(asset["name"] == sample_asset_data["name"] for asset in data)
    
    @pytest.mark.asyncio
    async def test_asset_battery_history(self, client: AsyncClient, sample_asset_data):
        """Test getting asset battery history"""
        # Create a test asset
        create_response = await client.post("/assets", json=sample_asset_data)
        asset_id = create_response.json()["id"]
        
        # Get battery history
        response = await client.get(f"/assets/{asset_id}/battery-history")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "assetId" in data
        assert "dataPoints" in data
        assert "statistics" in data
        assert data["assetId"] == asset_id
