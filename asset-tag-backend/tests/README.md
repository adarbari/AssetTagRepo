# Asset Tag Backend Tests

This directory contains comprehensive unit and integration tests for the Asset Tag Backend system.

## Test Structure

```
tests/
├── __init__.py                 # Test package initialization
├── conftest.py                 # Pytest configuration and fixtures
├── run_tests.py               # Test runner script
├── README.md                  # This file
├── unit/                      # Unit tests
│   ├── test_assets.py         # Asset model and business logic tests
│   ├── test_locations.py      # Location estimation tests
│   ├── test_alerts.py         # Alert rules engine tests
│   ├── test_geofences.py      # Geofence evaluation tests
│   └── test_ml_models.py      # ML model tests
└── integration/               # Integration tests
    ├── test_assets_api.py     # Asset API endpoint tests
    └── test_alerts_api.py     # Alert API endpoint tests
```

## Running Tests

### Prerequisites

Install test dependencies:

```bash
pip install -r requirements-dev.txt
```

### Running All Tests

```bash
# Run all tests with coverage
python tests/run_tests.py

# Or using pytest directly
pytest tests/ -v --cov=modules --cov-report=html
```

### Running Specific Test Types

```bash
# Run only unit tests
python tests/run_tests.py unit

# Run only integration tests
python tests/run_tests.py integration

# Run specific test file
python tests/run_tests.py specific tests/unit/test_assets.py

# Run tests with specific markers
pytest -m unit
pytest -m integration
pytest -m api
```

### Running Individual Test Files

```bash
# Run specific test file
pytest tests/unit/test_assets.py -v

# Run specific test function
pytest tests/unit/test_assets.py::TestAssetModel::test_create_asset -v
```

## Test Categories

### Unit Tests

Unit tests focus on testing individual components in isolation:

- **Models**: Database model functionality, validation, relationships
- **Business Logic**: Core algorithms, calculations, data processing
- **Schemas**: Pydantic model validation and serialization
- **ML Models**: Machine learning model training and prediction
- **Utilities**: Helper functions and utility classes

### Integration Tests

Integration tests verify that different components work together correctly:

- **API Endpoints**: HTTP request/response handling, authentication
- **Database Operations**: CRUD operations, transactions, constraints
- **External Services**: Third-party API integrations, message queues
- **End-to-End Workflows**: Complete user scenarios

## Test Fixtures

The `conftest.py` file provides common fixtures for all tests:

### Database Fixtures

- `db_session`: Async database session for testing
- `client`: Async HTTP client for API testing
- `sync_client`: Synchronous HTTP client for API testing

### Data Fixtures

- `sample_asset_data`: Sample asset data for testing
- `sample_site_data`: Sample site data for testing
- `sample_observation_data`: Sample observation data for testing
- `sample_alert_data`: Sample alert data for testing
- `sample_job_data`: Sample job data for testing
- `sample_maintenance_data`: Sample maintenance data for testing
- `sample_geofence_data`: Sample geofence data for testing

## Test Database

Tests use an in-memory SQLite database (`test.db`) to ensure:

- **Isolation**: Each test runs with a clean database
- **Speed**: In-memory database is faster than file-based
- **Reliability**: No external database dependencies

## Coverage

Test coverage is automatically generated and includes:

- **HTML Report**: `htmlcov/index.html` - Interactive coverage report
- **Terminal Report**: Shows missing lines in terminal output
- **Coverage Threshold**: Minimum 80% coverage required

## Writing New Tests

### Unit Test Example

```python
import pytest
from modules.assets.models import Asset

class TestAssetModel:
    @pytest.mark.asyncio
    async def test_create_asset(self, db_session, sample_asset_data):
        """Test creating an asset"""
        asset = Asset(**sample_asset_data)
        
        db_session.add(asset)
        await db_session.commit()
        await db_session.refresh(asset)
        
        assert asset.id is not None
        assert asset.name == sample_asset_data["name"]
```

### Integration Test Example

```python
import pytest
from httpx import AsyncClient

class TestAssetsAPI:
    @pytest.mark.asyncio
    async def test_create_asset(self, client: AsyncClient, sample_asset_data):
        """Test creating an asset via API"""
        response = await client.post("/assets", json=sample_asset_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == sample_asset_data["name"]
```

## Test Markers

Use pytest markers to categorize tests:

```python
@pytest.mark.unit
def test_asset_validation():
    """Unit test for asset validation"""

@pytest.mark.integration
def test_asset_api():
    """Integration test for asset API"""

@pytest.mark.slow
def test_large_dataset():
    """Slow test for large dataset processing"""
```

## Best Practices

### Test Naming

- Use descriptive test names that explain what is being tested
- Follow the pattern: `test_<functionality>_<scenario>`
- Example: `test_create_asset_with_valid_data`

### Test Organization

- Group related tests in classes
- Use fixtures for common setup
- Keep tests independent and isolated

### Assertions

- Use specific assertions: `assert asset.name == "Test Asset"`
- Test both positive and negative cases
- Verify error conditions and edge cases

### Async Testing

- Use `@pytest.mark.asyncio` for async tests
- Use `AsyncClient` for API testing
- Properly handle async database operations

## Continuous Integration

Tests are automatically run in CI/CD pipeline:

1. **Code Quality**: Linting, formatting, type checking
2. **Unit Tests**: Fast, isolated component tests
3. **Integration Tests**: API and database integration tests
4. **Coverage**: Ensure minimum coverage threshold
5. **Performance**: Monitor test execution time

## Troubleshooting

### Common Issues

1. **Database Connection Errors**: Ensure test database is properly configured
2. **Async Test Failures**: Check `@pytest.mark.asyncio` decorator
3. **Fixture Not Found**: Verify fixture is defined in `conftest.py`
4. **Import Errors**: Check Python path and module structure

### Debug Mode

Run tests in debug mode for detailed output:

```bash
pytest tests/ -v -s --tb=long
```

### Test Isolation

If tests are interfering with each other:

1. Check for shared state between tests
2. Ensure proper cleanup in fixtures
3. Use unique identifiers for test data
4. Verify database transactions are properly handled

## Performance

### Test Speed Optimization

- Use in-memory database for unit tests
- Mock external services and APIs
- Run tests in parallel when possible
- Cache expensive setup operations

### Monitoring

- Track test execution time
- Monitor test coverage trends
- Identify flaky tests
- Optimize slow-running tests

## Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain or improve coverage
4. Update test documentation
5. Add appropriate test markers

## Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [SQLAlchemy Testing](https://docs.sqlalchemy.org/en/14/orm/session_transaction.html#joining-a-session-into-an-external-transaction-such-as-for-test-suites)
- [Async Testing](https://pytest-asyncio.readthedocs.io/)
