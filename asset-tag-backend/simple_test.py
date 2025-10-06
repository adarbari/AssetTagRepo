#!/usr/bin/env python3
"""
Simple Asset Tag Backend Test - No Database Required
Tests basic functionality without requiring database connections
"""

import sys
from pathlib import Path

def test_file_structure():
    """Test that all required files exist"""
    print("🔍 Testing file structure...")
    
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
        "Makefile"
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

def test_schemas_only():
    """Test Pydantic schemas without database dependencies"""
    print("\n🔍 Testing Pydantic schemas...")
    
    try:
        # Test individual schema files
        import importlib.util
        
        schema_files = [
            "modules/assets/schemas.py",
            "modules/sites/schemas.py", 
            "modules/geofences/schemas.py",
            "modules/observations/schemas.py"
        ]
        
        for schema_file in schema_files:
            try:
                spec = importlib.util.spec_from_file_location("schema", schema_file)
                schema_module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(schema_module)
                print(f"✅ {schema_file} imported successfully")
            except Exception as e:
                print(f"❌ {schema_file} import failed: {e}")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ Schema test failed: {e}")
        return False

def test_api_structure():
    """Test API file structure without importing"""
    print("\n🔍 Testing API file structure...")
    
    api_files = [
        "modules/assets/api.py",
        "modules/sites/api.py",
        "modules/gateways/api.py", 
        "modules/observations/api.py",
        "modules/locations/api.py",
        "modules/geofences/api.py",
        "modules/alerts/api.py",
        "modules/jobs/api.py",
        "modules/maintenance/api.py",
        "modules/analytics/api.py",
        "modules/checkin_checkout/api.py",
        "modules/search/api.py",
        "modules/audit/api.py"
    ]
    
    missing_apis = []
    for api_file in api_files:
        if not Path(api_file).exists():
            missing_apis.append(api_file)
        else:
            print(f"✅ {api_file}")
    
    if missing_apis:
        print(f"❌ Missing API files: {missing_apis}")
        return False
    else:
        print("✅ All API files exist")
        return True

def test_requirements():
    """Test that requirements.txt is properly formatted"""
    print("\n🔍 Testing requirements.txt...")
    
    try:
        with open("requirements.txt", "r") as f:
            requirements = f.read()
        
        # Check for key dependencies
        key_deps = [
            "fastapi",
            "uvicorn", 
            "sqlalchemy",
            "alembic",
            "pydantic",
            "redis",
            "boto3"
        ]
        
        missing_deps = []
        for dep in key_deps:
            if dep not in requirements:
                missing_deps.append(dep)
            else:
                print(f"✅ {dep} found in requirements")
        
        if missing_deps:
            print(f"❌ Missing dependencies: {missing_deps}")
            return False
        else:
            print("✅ All key dependencies found")
            return True
            
    except Exception as e:
        print(f"❌ Requirements test failed: {e}")
        return False

def test_migrations():
    """Test that migration files exist"""
    print("\n🔍 Testing migration files...")
    
    migration_files = [
        "migrations/versions/001_enable_timescaledb.py",
        "migrations/versions/002_create_hypertables.py", 
        "migrations/versions/003_create_analytics_views.py",
        "migrations/versions/004_create_all_tables.py"
    ]
    
    missing_migrations = []
    for migration_file in migration_files:
        if not Path(migration_file).exists():
            missing_migrations.append(migration_file)
        else:
            print(f"✅ {migration_file}")
    
    if missing_migrations:
        print(f"❌ Missing migration files: {missing_migrations}")
        return False
    else:
        print("✅ All migration files exist")
        return True

def test_docker_config():
    """Test Docker configuration files"""
    print("\n🔍 Testing Docker configuration...")
    
    docker_files = [
        "Dockerfile",
        "docker-compose.yml",
        ".gitignore"
    ]
    
    missing_docker = []
    for docker_file in docker_files:
        if not Path(docker_file).exists():
            missing_docker.append(docker_file)
        else:
            print(f"✅ {docker_file}")
    
    if missing_docker:
        print(f"❌ Missing Docker files: {missing_docker}")
        return False
    else:
        print("✅ All Docker files exist")
        return True

def main():
    """Run all simple validation tests"""
    print("🚀 Asset Tag Backend - Simple Validation")
    print("=" * 50)
    
    tests = [
        ("File Structure", test_file_structure),
        ("API Structure", test_api_structure),
        ("Requirements", test_requirements),
        ("Migrations", test_migrations),
        ("Docker Config", test_docker_config),
        ("Pydantic Schemas", test_schemas_only)
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
        print("🎉 All validation tests passed! Backend structure is correct.")
        print("\n📝 Next steps to run the full backend:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Set up PostgreSQL database")
        print("3. Run migrations: alembic upgrade head")
        print("4. Start the server: uvicorn main:app --reload")
        return 0
    else:
        print("⚠️  Some validation tests failed. Check the output above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
