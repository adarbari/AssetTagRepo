# Developer Checklist - Backend Integration

## ✅ Phase 1: Setup & Configuration (Completed)

- [x] Created type definitions in `/types/assetDetails.ts`
- [x] Created API client in `/services/api.ts`
- [x] Created asset service in `/services/assetService.ts`
- [x] Created React hooks in `/hooks/useAssetDetails.ts`
- [x] Created environment configuration template (`.env.example`)
- [x] Created comprehensive documentation

## 🔄 Phase 2: Component Integration (Completed)

- [x] Updated `AssetDetails` component to use hooks
- [x] Added loading states with skeleton UI
- [x] Updated `EditAssetDialog` to use mutations
- [x] Added error handling with toast notifications
- [x] Implemented optimistic updates

## 🚀 Phase 3: Production Integration (TODO)

### Backend API Development

- [ ] **Set up backend endpoints** (Backend team)
  - [ ] `GET /api/v1/assets/:assetId`
  - [ ] `PUT /api/v1/assets/:assetId`
  - [ ] `GET /api/v1/assets/:assetId/battery-history`
  - [ ] `GET /api/v1/assets/:assetId/location-history`
  - [ ] `GET /api/v1/assets/:assetId/activity-log`
  - [ ] `GET /api/v1/assets/:assetId/maintenance`
  - [ ] `POST /api/v1/assets/:assetId/maintenance`
  - [ ] `GET /api/v1/assets/:assetId/alerts`
  - [ ] `POST /api/v1/assets/:assetId/check-in`
  - [ ] `POST /api/v1/assets/:assetId/check-out`

- [ ] **Implement authentication** (Backend team)
  - [ ] JWT token generation
  - [ ] Token refresh mechanism
  - [ ] Authorization middleware
  - [ ] Role-based access control

- [ ] **Configure CORS** (Backend team)
  - [ ] Allow frontend origin
  - [ ] Allow credentials
  - [ ] Set proper headers

### Frontend Configuration

- [ ] **Environment Setup**
  ```bash
  # Copy and configure environment file
  cp .env.example .env.local
  ```
  
- [ ] **Update `.env.local`**
  ```env
  VITE_API_BASE_URL=https://your-api.com
  VITE_API_VERSION=v1
  VITE_USE_MOCK_DATA=false  # Set to false for production
  ```

- [ ] **Test API connection**
  - [ ] Verify API URL is accessible
  - [ ] Test authentication flow
  - [ ] Verify CORS configuration

### Service Layer Updates

Update `/services/assetService.ts` to use real API:

- [ ] **Update `getAssetDetails()`**
  ```typescript
  static async getAssetDetails(assetId: string) {
    if (shouldUseMockData()) {
      return this.getMockAssetDetails(assetId);
    }
    return apiClient.get(`/assets/${assetId}/details`);
  }
  ```

- [ ] **Update `getBatteryHistory()`**
  ```typescript
  static async getBatteryHistory(assetId: string, params?: DateRangeParams) {
    if (shouldUseMockData()) {
      // return mock data
    }
    return apiClient.get(`/assets/${assetId}/battery-history`, { params });
  }
  ```

- [ ] **Update `getLocationHistory()`**
- [ ] **Update `getActivityLog()`**
- [ ] **Update `getMaintenanceSchedule()`**
- [ ] **Update `getAlerts()`**
- [ ] **Update `updateAsset()`**
- [ ] **Update `checkIn()`**
- [ ] **Update `checkOut()`**

### Authentication Integration

- [ ] **Create auth service** (`/services/authService.ts`)
  ```typescript
  export async function login(email: string, password: string) {
    const response = await apiClient.post('/auth/login', { email, password });
    setAuthToken(response.token);
    return response;
  }
  ```

- [ ] **Add login page/component**
- [ ] **Add token refresh logic**
- [ ] **Add logout functionality**
- [ ] **Add authentication guard for routes**

### Error Handling

- [ ] **Add global error boundary**
  ```typescript
  class ErrorBoundary extends React.Component {
    componentDidCatch(error: Error) {
      if (error instanceof ApiError) {
        // Handle API errors
      }
    }
  }
  ```

- [ ] **Add 401 redirect to login**
- [ ] **Add 403 permission denied UI**
- [ ] **Add 404 not found UI**
- [ ] **Add network error retry logic**
- [ ] **Add error logging service** (Sentry, LogRocket, etc.)

### Loading States

- [ ] **Verify skeleton loaders display correctly**
- [ ] **Add loading indicators for mutations**
- [ ] **Test loading states with slow network** (Chrome DevTools throttling)
- [ ] **Add progress indicators for long operations**

### Testing

#### Unit Tests
- [ ] Test API client methods
- [ ] Test service layer methods
- [ ] Test hook logic
- [ ] Test error handling

#### Integration Tests
- [ ] Test component + hook integration
- [ ] Test mutation flows
- [ ] Test error recovery
- [ ] Test loading states

#### E2E Tests
- [ ] Test full asset details flow
- [ ] Test asset editing flow
- [ ] Test check-in/out flow
- [ ] Test error scenarios

### Performance Optimization

- [ ] **Add data caching**
  - [ ] Install React Query or SWR
  ```bash
  npm install @tanstack/react-query
  ```
  - [ ] Configure cache times
  - [ ] Set up cache invalidation

- [ ] **Add pagination**
  - [ ] Activity log pagination
  - [ ] Location history pagination
  - [ ] Maintenance records pagination

- [ ] **Add virtual scrolling** (for large lists)
  - [ ] Install react-window
  - [ ] Implement virtual list for activity log

- [ ] **Optimize bundle size**
  - [ ] Code splitting
  - [ ] Lazy loading components
  - [ ] Tree shaking

### Real-Time Updates (Optional)

- [ ] **Set up WebSocket connection**
  ```typescript
  const ws = new WebSocket(import.meta.env.VITE_WS_URL);
  ws.onmessage = (event) => {
    // Handle real-time updates
  };
  ```

- [ ] **Subscribe to asset updates**
- [ ] **Update UI in real-time**
- [ ] **Add connection status indicator**
- [ ] **Handle reconnection logic**

### Security

- [ ] **Sanitize user inputs**
- [ ] **Validate API responses**
- [ ] **Use HTTPS in production**
- [ ] **Implement CSP headers**
- [ ] **Add rate limiting**
- [ ] **Audit dependencies** (`npm audit`)

### Deployment

- [ ] **Set up CI/CD pipeline**
- [ ] **Configure environment variables** (in deployment platform)
- [ ] **Build production bundle**
  ```bash
  npm run build
  ```
- [ ] **Test production build locally**
  ```bash
  npm run preview
  ```
- [ ] **Deploy to staging**
- [ ] **Run smoke tests**
- [ ] **Deploy to production**

### Monitoring & Logging

- [ ] **Add analytics tracking**
  - [ ] Page views
  - [ ] User actions
  - [ ] Error rates

- [ ] **Add performance monitoring**
  - [ ] API response times
  - [ ] Component render times
  - [ ] Core Web Vitals

- [ ] **Add error tracking**
  - [ ] Set up Sentry or similar
  - [ ] Configure error alerts
  - [ ] Add user context to errors

### Documentation

- [ ] **Update API documentation**
- [ ] **Document authentication flow**
- [ ] **Document error codes**
- [ ] **Create runbook for common issues**
- [ ] **Update README with setup instructions**

---

## 📋 Quick Reference: Common Tasks

### Adding a New Data Hook

```typescript
// 1. Add type in /types/assetDetails.ts
export interface MyNewData {
  id: string;
  value: string;
}

// 2. Add service method in /services/assetService.ts
static async getMyNewData(assetId: string): Promise<MyNewData> {
  if (shouldUseMockData()) {
    return { id: assetId, value: 'mock' };
  }
  return apiClient.get(`/assets/${assetId}/my-new-data`);
}

// 3. Add hook in /hooks/useAssetDetails.ts
export function useMyNewData(assetId: string) {
  const [data, setData] = useState<MyNewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    
    assetService.getMyNewData(assetId)
      .then(result => !cancelled && setData(result))
      .catch(err => !cancelled && setError(err))
      .finally(() => !cancelled && setLoading(false));
    
    return () => { cancelled = true; };
  }, [assetId]);

  return { data, loading, error };
}

// 4. Use in component
const { data, loading, error } = useMyNewData(asset.id);
```

### Adding a New Mutation

```typescript
// 1. Add types for request/response
export interface MyActionData {
  param1: string;
  param2: number;
}

// 2. Add service method
static async performMyAction(assetId: string, data: MyActionData) {
  if (shouldUseMockData()) {
    return { success: true };
  }
  return apiClient.post(`/assets/${assetId}/my-action`, data);
}

// 3. Add to mutation hook
export function useAssetMutations(assetId: string) {
  // ... existing code
  
  const performMyAction = async (data: MyActionData) => {
    try {
      setLoading(true);
      const result = await assetService.performMyAction(assetId, data);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    // ... existing mutations
    performMyAction,
    loading,
    error,
  };
}
```

### Testing with Mock Data

```typescript
// In your component test file
import { render } from '@testing-library/react';

// Mock the hook
jest.mock('../hooks/useAssetDetails', () => ({
  useBatteryHistory: () => ({
    data: { dataPoints: [{ time: '00:00', battery: 90 }] },
    loading: false,
    error: null,
  }),
}));

test('renders battery data', () => {
  const { getByText } = render(<AssetDetails asset={mockAsset} />);
  expect(getByText('90%')).toBeInTheDocument();
});
```

---

## 🆘 Troubleshooting Guide

### Problem: API calls return 401 Unauthorized
**Solution:**
1. Check auth token is set: `console.log(getAuthToken())`
2. Verify token format in Authorization header
3. Check token expiration
4. Implement token refresh logic

### Problem: CORS errors
**Solution:**
1. Verify backend CORS configuration
2. Check allowed origins include your frontend URL
3. Ensure credentials are allowed if using cookies
4. Check preflight OPTIONS requests are handled

### Problem: Data not updating after mutation
**Solution:**
1. Check `onAssetUpdate` callback is being called
2. Verify parent component state is updated
3. Check React DevTools for state changes
4. Consider using React Query for automatic refetching

### Problem: Loading states stuck
**Solution:**
1. Check API endpoint is returning response
2. Verify error handling is catching failures
3. Check network tab for request status
4. Add timeout to requests

### Problem: Mock data still showing in production
**Solution:**
1. Check `VITE_USE_MOCK_DATA=false` in environment
2. Verify build process includes correct .env file
3. Check `shouldUseMockData()` logic in services
4. Clear browser cache and rebuild

---

## 📞 Support

- **Documentation**: See `BACKEND_INTEGRATION_PROPOSAL.md`
- **Quick Start**: See `BACKEND_INTEGRATION_QUICKSTART.md`
- **Architecture**: See `ARCHITECTURE_DIAGRAM.md`
- **Status**: See `BACKEND_INTEGRATION_STATUS.md`

---

## ✨ Next Steps

1. ✅ Review this checklist
2. ✅ Set up backend API endpoints
3. ✅ Configure environment variables
4. ✅ Update service layer to use real API
5. ✅ Test thoroughly
6. ✅ Deploy to staging
7. ✅ Monitor and optimize
8. ✅ Deploy to production

**Ready to integrate? Start with Phase 3: Production Integration!**