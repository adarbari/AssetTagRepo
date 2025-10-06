#!/usr/bin/env python3

import os
import sys

import pytest

# Add the project root to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import fixtures from conftest
from tests.conftest import client, sample_alert_data


def test_debug_alert_creation():
    """Debug test to see the actual error response"""
    client_fixture = client()
    sample_data = sample_alert_data()
    response = client_fixture.post("/api/v1/alerts", json=sample_data)

    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Text: {response.text}")

    if response.status_code != 200:
        try:
            error_data = response.json()
            print(f"Error JSON: {error_data}")
        except Exception as e:
            print(f"Could not parse error response as JSON: {e}")

    # Don't assert anything, just print the response
    assert True


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
