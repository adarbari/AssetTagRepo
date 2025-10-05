# Testing Guide for AssetTag Application

This guide provides comprehensive information about the testing setup and how to run tests for the AssetTag application.

## Overview

The AssetTag application includes comprehensive unit tests for all major components:

- **Sites Management**: Sites, SiteDetails, CreateSite
- **Live Map**: AssetMap with real-time tracking
- **Dashboard**: Main dashboard with analytics and charts
- **Maintenance**: Maintenance tasks, history, and predictive alerts
- **Vehicle Asset Pairing**: Vehicle and asset pairing management

## Test Structure

```
src/
├── components/
│   └── __tests__/
│       ├── Sites.test.tsx
│       ├── SiteDetails.test.tsx
│       ├── CreateSite.test.tsx
│       ├── AssetMap.test.tsx
│       ├── Dashboard.test.tsx
│       ├── Maintenance.test.tsx
│       ├── VehicleAssetPairing.test.tsx
│       ├── IssueDetails.test.tsx
│       ├── IssueTracking.test.tsx
│       └── JobManagement.test.tsx
├── test/
│   ├── setup.ts
│   ├── test-utils.tsx
│   ├── test-config.ts
│   └── run-all-tests.ts
└── vitest.config.ts
```

## Test Configuration

### Vitest Configuration

The application uses Vitest as the test runner with the following configuration:

- **Environment**: jsdom (for DOM testing)
- **Setup**: Custom setup file with global mocks
- **CSS**: Enabled for component styling tests
- **Aliases**: Path aliases for clean imports

### Test Setup

The `src/test/setup.ts` file provides:
- Global mocks for browser APIs
- ResizeObserver and IntersectionObserver mocks
- Console method mocks
- Window object mocks

### Test Utilities

The `src/test/test-utils.tsx` file provides:
- Custom render function with providers
- Mock data for all components
- Mock functions for event handlers
- Navigation context mocks
- Utility functions for testing

## Running Tests

### Available Test Scripts

```bash
# Run all tests
npm run test:all

# Run specific component tests
npm run test:sites          # Sites, SiteDetails, CreateSite
npm run test:map            # AssetMap
npm run test:dashboard      # Dashboard
npm run test:maintenance    # Maintenance
npm run test:vehicle-pairing # VehicleAssetPairing

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run button-specific tests
npm run test:buttons
```

### Individual Test Commands

```bash
# Run all tests
npm test

# Run tests once (CI mode)
npm run test:run

# Run specific test file
npx vitest run src/components/__tests__/Sites.test.tsx

# Run tests matching pattern
npx vitest run --grep "Sites"
```

## Test Coverage

### Sites Components

**Sites.test.tsx**
- ✅ Rendering and basic functionality
- ✅ Search functionality
- ✅ Filter functionality (status, state, asset count)
- ✅ Site interaction (click, dropdown actions)
- ✅ Pagination
- ✅ Navigation integration
- ✅ Accessibility
- ✅ Error handling

**SiteDetails.test.tsx**
- ✅ Rendering and basic functionality
- ✅ Tab navigation (Overview, Assets, Location, Activity)
- ✅ Edit functionality
- ✅ Location and boundary management
- ✅ Geofence management
- ✅ Activity tab with time range selection
- ✅ Navigation
- ✅ Accessibility
- ✅ Error handling

**CreateSite.test.tsx**
- ✅ Rendering and basic functionality
- ✅ Form interaction
- ✅ Form validation
- ✅ Form submission
- ✅ Navigation
- ✅ Boundary type handling
- ✅ Accessibility
- ✅ Form reset and state management

### Live Map (AssetMap)

**AssetMap.test.tsx**
- ✅ Rendering and basic functionality
- ✅ Search functionality
- ✅ Filter functionality (type, status)
- ✅ Map controls (geofences, clusters, sites)
- ✅ Asset interaction
- ✅ Navigation
- ✅ Violation mode
- ✅ Asset highlighting
- ✅ Asset filtering
- ✅ Accessibility
- ✅ Map loading
- ✅ Responsive design
- ✅ Performance

### Dashboard

**Dashboard.test.tsx**
- ✅ Rendering and basic functionality
- ✅ Stats cards
- ✅ Interactive elements
- ✅ Charts and visualizations
- ✅ Recent activity
- ✅ Performance metrics
- ✅ Data loading and error handling
- ✅ Accessibility
- ✅ Responsive design
- ✅ Real-time updates
- ✅ System status display

### Maintenance

**Maintenance.test.tsx**
- ✅ Rendering and basic functionality
- ✅ Tasks tab
- ✅ History tab
- ✅ Predictive alerts tab
- ✅ Analytics tab
- ✅ Task actions (start, complete, edit)
- ✅ Create new task
- ✅ Audit log
- ✅ Error handling
- ✅ Accessibility
- ✅ Data refresh

### Vehicle Asset Pairing

**VehicleAssetPairing.test.tsx**
- ✅ Rendering and basic functionality
- ✅ Vehicles tab
- ✅ Asset loading dialog
- ✅ Asset pairing actions
- ✅ Pairing history tab
- ✅ Search and filtering
- ✅ Form submission
- ✅ Navigation
- ✅ Accessibility
- ✅ Error handling
- ✅ Real-time updates

## Test Data and Mocks

### Mock Data

The test suite includes comprehensive mock data for:
- Sites with various statuses and configurations
- Assets with different types and locations
- Vehicles with pairing information
- Maintenance tasks and history
- Dashboard statistics and charts
- Geofences and boundaries

### Mock Functions

All event handlers and service functions are mocked:
- Navigation functions
- API service calls
- Form submissions
- User interactions
- Toast notifications

### Service Mocks

External services are mocked:
- Maintenance service
- Dashboard data service
- Site activity service
- Geofence service
- Asset tracking service

## Testing Best Practices

### Component Testing

1. **Render Testing**: Verify components render without errors
2. **Props Testing**: Test component behavior with different props
3. **User Interaction**: Test user interactions (clicks, form inputs)
4. **State Management**: Test component state changes
5. **Error Handling**: Test error scenarios and edge cases

### Accessibility Testing

1. **ARIA Labels**: Verify proper ARIA labels and roles
2. **Keyboard Navigation**: Test keyboard accessibility
3. **Screen Reader**: Ensure components are screen reader friendly
4. **Focus Management**: Test focus behavior

### Performance Testing

1. **Large Datasets**: Test with large amounts of data
2. **Async Operations**: Test loading states and async behavior
3. **Memory Leaks**: Ensure proper cleanup
4. **Rendering Performance**: Test component rendering performance

## Debugging Tests

### Common Issues

1. **Async Operations**: Use `waitFor` for async operations
2. **Mock Data**: Ensure mock data matches component expectations
3. **DOM Queries**: Use appropriate query methods
4. **Event Simulation**: Use `userEvent` for realistic interactions

### Debug Commands

```bash
# Run tests with verbose output
npx vitest run --reporter=verbose

# Run specific test with debug info
npx vitest run --reporter=verbose src/components/__tests__/Sites.test.tsx

# Run tests in watch mode for development
npm run test:watch
```

## Continuous Integration

### GitHub Actions

The test suite is designed to run in CI environments:

```yaml
- name: Run Tests
  run: npm run test:run

- name: Run Tests with Coverage
  run: npm run test:coverage
```

### Test Reports

Tests generate detailed reports including:
- Test results and coverage
- Performance metrics
- Error details
- Component-specific results

## Contributing

### Adding New Tests

1. Create test file in `src/components/__tests__/`
2. Follow existing test patterns
3. Use provided mock data and utilities
4. Include comprehensive test coverage
5. Update this guide if needed

### Test Naming Convention

- Test files: `ComponentName.test.tsx`
- Test suites: `describe('ComponentName Component', () => {})`
- Test cases: `it('should do something specific', () => {})`

### Mock Data Updates

When adding new features:
1. Update mock data in `test-utils.tsx`
2. Add new mock functions as needed
3. Update test configuration if required
4. Ensure backward compatibility

## Troubleshooting

### Common Problems

1. **Import Errors**: Check path aliases in vitest.config.ts
2. **Mock Issues**: Verify mock setup in test files
3. **Async Timeouts**: Increase timeout values if needed
4. **DOM Issues**: Ensure jsdom environment is properly configured

### Getting Help

1. Check existing test files for examples
2. Review test utilities and configuration
3. Consult Vitest and Testing Library documentation
4. Check component implementation for expected behavior

## Performance Metrics

The test suite is optimized for:
- **Fast Execution**: Tests run in under 30 seconds
- **Reliable Results**: Consistent test outcomes
- **Good Coverage**: Comprehensive component testing
- **Maintainable**: Easy to update and extend

## Future Enhancements

Planned improvements:
- Integration tests for component interactions
- E2E tests for complete user workflows
- Visual regression testing
- Performance benchmarking
- Automated test generation
