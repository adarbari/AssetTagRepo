#!/usr/bin/env python3

import asyncio
import sys
import os

# Add the project root to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import the test fixtures
from tests.conftest import client


def test_alert_creation():
    """Test alert creation to see the actual error"""
    # Use the client fixture from conftest.py
    client_fixture = client()

    sample_alert_data = {
        "alert_type": "battery_low",
        "severity": "warning",
        "asset_id": "550e8400-e29b-41d4-a716-446655440000",
        "asset_name": "Test Asset",
        "message": "Battery level is low",
        "description": "Asset battery has dropped below 20%",
        "triggered_at": "2024-01-01T12:00:00Z",
    }

    print("Making POST request to /api/v1/alerts...")
    response = client_fixture.post("/api/v1/alerts", json=sample_alert_data)

    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")

    if response.status_code != 200:
        try:
            print(f"Error details: {response.json()}")
        except:
            print("Could not parse error response as JSON")


if __name__ == "__main__":
    test_alert_creation()
