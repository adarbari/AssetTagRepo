#!/usr/bin/env python3
"""
Asset Tag Backend Validation Script
Tests the basic structure and functionality without requiring a database
"""

import sys
import traceback
from pathlib import Path


def test_imports() -> None:
    """Test that all modules can be imported"""
    print("🔍 Testing module imports...")

    try:
        # Test main app import
        from main import app

        print("✅ Main app imported successfully")

        # Test settings
        from config.settings import settings

        print(f"✅ Settings imported - Environment: {settings.environment}")

        # Test database config (without connecting)
        from config.database import Base

        print("✅ Database base imported successfully")

        # Test all module APIs
        modules = [
            "modules.assets.api",
            "modules.sites.api",
            "modules.gateways.api",
            "modules.observations.api",
            "modules.locations.api",
            "modules.geofences.api",
            "modules.alerts.api",
            "modules.jobs.api",
            "modules.maintenance.api",
            "modules.analytics.api",
            "modules.checkin_checkout.api",
            "modules.search.api",
            "modules.audit.api",
        ]

        for module in modules:
            try:
                __import__(module)
                print(f"✅ {module} imported successfully")
            except Exception as e:
                print(f"❌ {module} import failed: {e}")

        return True

    except Exception as e:
        print(f"❌ Import test failed: {e}")
        traceback.print_exc()
        return False


def test_api_routes() -> None:
    """Test that API routes are properly configured"""
    print("\n🔍 Testing API routes...")

    try:
        from main import app

        # Get all routes
        routes = []
        for route in app.routes:
            if hasattr(route, "path") and hasattr(route, "methods"):
                routes.append(
                    {
                        "path": route.path,
                        "methods": list(route.methods) if route.methods else ["GET"],
                    }
                )

        print(f"✅ Found {len(routes)} routes")

        # Check for key API endpoints
        expected_endpoints = [
            "/api/v1/assets",
            "/api/v1/sites",
            "/api/v1/gateways",
            "/api/v1/observations",
            "/api/v1/geofences",
            "/api/v1/alerts",
            "/api/v1/jobs",
            "/api/v1/maintenance",
            "/api/v1/analytics",
            "/api/v1/checkin-checkout",
            "/health",
        ]

        found_endpoints = []
        for route in routes:
            for endpoint in expected_endpoints:
                if route["path"].startswith(endpoint):
                    found_endpoints.append(endpoint)
                    break

        print(
            f"✅ Found {len(found_endpoints)}/{len(expected_endpoints)} expected endpoints"
        )

        missing_endpoints = set(expected_endpoints) - set(found_endpoints)
        if missing_endpoints:
            print(f"⚠️  Missing endpoints: {missing_endpoints}")
        else:
            print("✅ All expected endpoints found")

        return True

    except Exception as e:
        print(f"❌ Route test failed: {e}")
        traceback.print_exc()
        return False


def test_schemas() -> None:
    """Test that Pydantic schemas are properly defined"""
    print("\n🔍 Testing Pydantic schemas...")

    try:
        # Test key schemas
        from modules.assets.schemas import AssetCreate, AssetResponse
        from modules.geofences.schemas import GeofenceCreate, GeofenceResponse
        from modules.observations.schemas import (ObservationCreate,
                                                  ObservationResponse)
        from modules.sites.schemas import SiteCreate, SiteResponse

        print("✅ Core schemas imported successfully")

        # Test schema validation
        test_asset_data = {
            "name": "Test Asset",
            "asset_type": "sensor",
            "serial_number": "TEST-001",
        }

        asset = AssetCreate(**test_asset_data)
        print("✅ Asset schema validation works")

        test_site_data = {"name": "Test Site", "location": "Test Location"}

        site = SiteCreate(**test_site_data)
        print("✅ Site schema validation works")

        return True

    except Exception as e:
        print(f"❌ Schema test failed: {e}")
        traceback.print_exc()
        return False


def test_models() -> None:
    """Test that SQLAlchemy models are properly defined"""
    print("\n🔍 Testing SQLAlchemy models...")

    try:
        from modules.assets.models import Asset
        from modules.geofences.models import Geofence
        from modules.observations.models import Observation
        from modules.sites.models import Personnel, Site

        print("✅ Core models imported successfully")

        # Test model attributes
        asset_attrs = [attr for attr in dir(Asset) if not attr.startswith("_")]
        site_attrs = [attr for attr in dir(Site) if not attr.startswith("_")]

        print(f"✅ Asset model has {len(asset_attrs)} attributes")
        print(f"✅ Site model has {len(site_attrs)} attributes")

        return True

    except Exception as e:
        print(f"❌ Model test failed: {e}")
        traceback.print_exc()
        return False


def test_file_structure() -> None:
    """Test that all required files exist"""
    print("\n🔍 Testing file structure...")

    required_files = [
        "main.py",
        "requirements.txt",
        "alembic.ini",
        "config/settings.py",
        "config/database.py",
        "modules/assets/api.py",
        "modules/assets/models.py",
        "modules/assets/schemas.py",
        "modules/sites/api.py",
        "modules/sites/models.py",
        "modules/sites/schemas.py",
        "modules/geofences/api.py",
        "modules/geofences/models.py",
        "modules/geofences/schemas.py",
        "modules/observations/api.py",
        "modules/observations/models.py",
        "modules/observations/schemas.py",
        "tests/conftest.py",
        "tests/test_assets_api.py",
        "tests/test_sites_api.py",
        "tests/test_geofences_api.py",
        "tests/test_observations_api.py",
        "pytest.ini",
        "Makefile",
    ]

    missing_files = []
    for file_path in required_files:
        if not Path(file_path).exists():
            missing_files.append(file_path)
        else:
            print(f"✅ {file_path}")

    if missing_files:
        print(f"❌ Missing files: {missing_files}")
        return False
    else:
        print("✅ All required files exist")
        return True


def main() -> None:
    """Run all validation tests"""
    print("🚀 Asset Tag Backend Validation")
    print("=" * 50)

    tests = [
        ("File Structure", test_file_structure),
        ("Module Imports", test_imports),
        ("API Routes", test_api_routes),
        ("Pydantic Schemas", test_schemas),
        ("SQLAlchemy Models", test_models),
    ]

    results = []
    for test_name, test_func in tests:
        print(f"\n📋 Running {test_name} Test...")
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test crashed: {e}")
            results.append((test_name, False))

    # Summary
    print("\n" + "=" * 50)
    print("📊 VALIDATION SUMMARY")
    print("=" * 50)

    passed = 0
    total = len(results)

    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if result:
            passed += 1

    print(f"\n🎯 Results: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All validation tests passed! Backend is ready.")
        return 0
    else:
        print("⚠️  Some validation tests failed. Check the output above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
