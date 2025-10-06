"""
Debug test to check client fixture
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_client_fixture(client: AsyncClient):
    """Test that client fixture works correctly"""
    print(f"Client type: {type(client)}")
    print(f"Client has post method: {hasattr(client, 'post')}")

    # Test a simple request
    response = await client.get("/health")
    print(f"Response status: {response.status_code}")
    print(f"Response data: {response.json()}")

    assert response.status_code == 200
