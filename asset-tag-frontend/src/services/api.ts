/**
 * API Client - Unified Backend Communication Layer
 *
 * This module provides a centralized API client for all backend communication.
 * It handles authentication, error handling, request/response formatting,
 * and provides a consistent interface for all API calls.
 *
 * Features:
 * - Automatic authentication header injection
 * - Centralized error handling
 * - Request/response interceptors
 * - Type-safe API calls
 * - Development mode with mock data
 *
 * Production Integration:
 * 1. Set VITE_API_BASE_URL in environment variables
 * 2. Configure authentication token storage
 * 3. Update error handling to match your backend responses
 * 4. Add any custom headers required by your API
 */

// API Configuration - Safe access to environment variables
export const getEnvVar = (key: string, defaultValue: string = ''): string => {
  try {
    return import.meta?.env?.[key] ?? defaultValue;
  } catch {
    return defaultValue;
  }
};

// Export getter functions for testability
export const getApiConfig = () => ({
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3000'),
  API_VERSION: getEnvVar('VITE_API_VERSION', 'v1'),
  API_TIMEOUT: parseInt(getEnvVar('VITE_API_TIMEOUT', '30000')),
  USE_MOCK_DATA: getEnvVar('VITE_USE_MOCK_DATA', 'true') !== 'false',
});

// Module-level constants (can be overridden by mocking getApiConfig)
const API_BASE_URL = getEnvVar('VITE_API_BASE_URL', 'http://localhost:3000');
const API_VERSION = getEnvVar('VITE_API_VERSION', 'v1');
const API_TIMEOUT = parseInt(getEnvVar('VITE_API_TIMEOUT', '30000'));
const USE_MOCK_DATA = getEnvVar('VITE_USE_MOCK_DATA', 'true') !== 'false'; // Default to true in dev

// API Error Class
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Auth token management
let authToken: string | null = null;

export function setAuthToken(token: string) {
  authToken = token;
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
}

export function getAuthToken(): string | null {
  if (authToken) return authToken;
  if (typeof window !== 'undefined') {
    authToken = localStorage.getItem('auth_token');
  }
  return authToken;
}

export function clearAuthToken() {
  authToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
}

// Request options interface
interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
  timeout?: number;
}

/**
 * Core API client with common HTTP methods
 */
export const apiClient = {
  /**
   * GET request
   */
  async get<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  },

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  },

  /**
   * Core request handler
   */
  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    // Build URL with query parameters
    const url = this.buildUrl(endpoint, options.params);

    // Build headers
    const headers = this.buildHeaders(options.headers);

    // Setup timeout
    const timeout = options.timeout || API_TIMEOUT;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle non-OK responses
      if (!response.ok) {
        const error = await this.handleErrorResponse(response);
        throw error;
      }

      // Parse response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return (await response.text()) as any;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle timeout
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }

      // Re-throw API errors
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle network errors
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error occurred',
        0
      );
    }
  },

  /**
   * Build full URL with query parameters
   */
  buildUrl(endpoint: string, params?: Record<string, any>): string {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/')
      ? endpoint.slice(1)
      : endpoint;

    let url = `${API_BASE_URL}/api/${API_VERSION}/${cleanEndpoint}`;

    // Add query parameters
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return url;
  },

  /**
   * Build request headers
   */
  buildHeaders(customHeaders?: HeadersInit): Headers {
    const headers = new Headers(customHeaders);

    // Add content type if not set
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    // Add authentication
    const token = getAuthToken();
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  },

  /**
   * Handle error responses
   */
  async handleErrorResponse(response: Response): Promise<ApiError> {
    let errorMessage = `API Error: ${response.statusText}`;
    let errorData: any;

    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } else {
        errorMessage = (await response.text()) || errorMessage;
      }
    } catch (e) {
      // Failed to parse error response
    }

    return new ApiError(errorMessage, response.status, errorData);
  },
};

/**
 * Helper to check if we should use mock data
 */
export function shouldUseMockData(): boolean {
  const config = getApiConfig();
  return (
    config.USE_MOCK_DATA ||
    !config.API_BASE_URL ||
    config.API_BASE_URL.includes('localhost')
  );
}

// ============================================================================
// SITE ACTIVITY API (keeping existing functionality)
// ============================================================================

export interface SiteActivityData {
  time: string;
  assets: number;
  personnel: number;
}

export interface SiteActivityResponse {
  siteId: string;
  startDate: string;
  endDate: string;
  data: SiteActivityData[];
}

/**
 * Fetch site activity data for a given date range
 * @param siteId - The site ID
 * @param startDate - Start date for the range
 * @param endDate - End date for the range
 * @param granularity - Data granularity: 'hourly', 'daily', 'weekly'
 */
export async function fetchSiteActivity(
  siteId: string,
  startDate: Date,
  endDate: Date,
  granularity: 'hourly' | 'daily' | 'weekly' = 'daily'
): Promise<SiteActivityResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // In production, this would be:
  // const response = await fetch(`/api/sites/${siteId}/activity`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ startDate, endDate, granularity })
  // });
  // return await response.json();

  // Import activity data from mockData
  const { assetActivityMap, mockPersonnel } = await import('../data/mockData');

  // Aggregate activity from all assets and personnel
  const allAssetActivity: any[] = [];
  assetActivityMap.forEach(activities => {
    allAssetActivity.push(...activities);
  });

  const allPersonnelActivity = mockPersonnel.flatMap(p => p.activityHistory);

  // Helper to count entities at site during a time period
  const countEntitiesAtSite = (
    activities: any[],
    targetSiteId: string,
    periodStart: Date,
    periodEnd: Date
  ): number => {
    const entitiesAtSite = new Set<string>();

    activities.forEach(event => {
      if (event.siteId !== targetSiteId) return;

      const eventTime = new Date(event.timestamp);
      if (eventTime < periodStart || eventTime > periodEnd) return;

      if (event.type === 'arrival') {
        entitiesAtSite.add(event.id.split('-')[0]); // Extract entity ID
      }
    });

    return entitiesAtSite.size;
  };

  const data: SiteActivityData[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  const daysDiff = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (granularity === 'hourly') {
    // Generate hourly data for the date range (max 48 hours)
    const hours = Math.min(daysDiff * 24, 48);
    for (let i = 0; i <= hours; i++) {
      const date = new Date(start);
      date.setHours(date.getHours() + i);

      const periodStart = new Date(date);
      const periodEnd = new Date(date);
      periodEnd.setHours(periodEnd.getHours() + 1);

      const assets = countEntitiesAtSite(
        allAssetActivity,
        siteId,
        periodStart,
        periodEnd
      );
      const personnel = countEntitiesAtSite(
        allPersonnelActivity,
        siteId,
        periodStart,
        periodEnd
      );

      data.push({
        time: `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`,
        assets,
        personnel,
      });
    }
  } else if (granularity === 'daily') {
    // Generate daily data
    for (let i = 0; i <= daysDiff; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);

      const periodStart = new Date(date);
      const periodEnd = new Date(date);
      periodEnd.setDate(periodEnd.getDate() + 1);

      const assets = countEntitiesAtSite(
        allAssetActivity,
        siteId,
        periodStart,
        periodEnd
      );
      const personnel = countEntitiesAtSite(
        allPersonnelActivity,
        siteId,
        periodStart,
        periodEnd
      );

      data.push({
        time: `${date.getMonth() + 1}/${date.getDate()}`,
        assets,
        personnel,
      });
    }
  } else {
    // Weekly granularity
    const weeks = Math.ceil(daysDiff / 7);
    for (let i = 0; i < weeks; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i * 7);
      date.setHours(0, 0, 0, 0);

      const periodStart = new Date(date);
      const periodEnd = new Date(date);
      periodEnd.setDate(periodEnd.getDate() + 7);

      const assets = countEntitiesAtSite(
        allAssetActivity,
        siteId,
        periodStart,
        periodEnd
      );
      const personnel = countEntitiesAtSite(
        allPersonnelActivity,
        siteId,
        periodStart,
        periodEnd
      );

      data.push({
        time: `Week ${i + 1}`,
        assets,
        personnel,
      });
    }
  }

  return {
    siteId,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    data,
  };
}

/**
 * Get preset date ranges for common time periods
 */
export function getPresetDateRange(preset: '24h' | '7d' | '30d'): {
  start: Date;
  end: Date;
  granularity: 'hourly' | 'daily';
} {
  const end = new Date();
  const start = new Date();

  switch (preset) {
    case '24h':
      start.setHours(start.getHours() - 24);
      return { start, end, granularity: 'hourly' };
    case '7d':
      start.setDate(start.getDate() - 7);
      return { start, end, granularity: 'daily' };
    case '30d':
      start.setDate(start.getDate() - 30);
      return { start, end, granularity: 'daily' };
    default:
      return { start, end, granularity: 'daily' };
  }
}
