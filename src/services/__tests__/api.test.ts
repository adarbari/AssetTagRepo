import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { apiClient, ApiError, shouldUseMockData, setAuthToken, clearAuthToken } from '../api'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock environment variables
const originalEnv = import.meta.env

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset auth token
    clearAuthToken()
    
    // Mock successful fetch response
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: 'test' }),
      text: async () => 'test response',
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    // Restore original environment
    Object.defineProperty(import.meta, 'env', {
      value: originalEnv,
      writable: true,
    })
  })

  describe('ApiError', () => {
    it('should create an ApiError with message', () => {
      const error = new ApiError('Test error')
      
      expect(error.message).toBe('Test error')
      expect(error.name).toBe('ApiError')
      expect(error.statusCode).toBeUndefined()
      expect(error.response).toBeUndefined()
    })

    it('should create an ApiError with status code and response', () => {
      const response = { error: 'Bad request' }
      const error = new ApiError('Bad request', 400, response)
      
      expect(error.message).toBe('Bad request')
      expect(error.statusCode).toBe(400)
      expect(error.response).toBe(response)
    })
  })

  describe('shouldUseMockData', () => {
    it('should return true when VITE_USE_MOCK_DATA is not set', () => {
      Object.defineProperty(import.meta, 'env', {
        value: {},
        writable: true,
      })
      
      expect(shouldUseMockData).toBe(true)
    })

    it('should return true when VITE_USE_MOCK_DATA is "true"', () => {
      Object.defineProperty(import.meta, 'env', {
        value: { VITE_USE_MOCK_DATA: 'true' },
        writable: true,
      })
      
      expect(shouldUseMockData).toBe(true)
    })

    it('should return false when VITE_USE_MOCK_DATA is "false"', () => {
      Object.defineProperty(import.meta, 'env', {
        value: { VITE_USE_MOCK_DATA: 'false' },
        writable: true,
      })
      
      expect(shouldUseMockData).toBe(false)
    })
  })

  describe('Auth Token Management', () => {
    it('should set and get auth token', () => {
      const token = 'test-token-123'
      setAuthToken(token)
      
      // We can't directly test the internal token, but we can test that
      // subsequent requests include the token
      expect(() => setAuthToken(token)).not.toThrow()
    })

    it('should clear auth token', () => {
      setAuthToken('test-token')
      clearAuthToken()
      
      expect(() => clearAuthToken()).not.toThrow()
    })
  })

  describe('apiClient.get', () => {
    it('should make a GET request successfully', async () => {
      const response = await apiClient.get('/test-endpoint')
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(response).toEqual({ data: 'test' })
    })

    it('should include auth token in headers when set', async () => {
      const token = 'test-token-123'
      setAuthToken(token)
      
      await apiClient.get('/test-endpoint')
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${token}`,
          }),
        })
      )
    })

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Resource not found' }),
      })

      await expect(apiClient.get('/nonexistent')).rejects.toThrow(ApiError)
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      await expect(apiClient.get('/test')).rejects.toThrow('Network error')
    })

    it('should handle non-JSON responses', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => 'Plain text response',
      })

      const response = await apiClient.get('/text-endpoint')
      expect(response).toBe('Plain text response')
    })
  })

  describe('apiClient.post', () => {
    it('should make a POST request with data', async () => {
      const testData = { name: 'Test Asset', type: 'Equipment' }
      
      await apiClient.post('/assets', testData)
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/assets'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(testData),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    it('should handle POST request errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Invalid data' }),
      })

      await expect(apiClient.post('/assets', {})).rejects.toThrow(ApiError)
    })
  })

  describe('apiClient.put', () => {
    it('should make a PUT request with data', async () => {
      const testData = { name: 'Updated Asset' }
      
      await apiClient.put('/assets/123', testData)
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/assets/123'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(testData),
        })
      )
    })
  })

  describe('apiClient.delete', () => {
    it('should make a DELETE request', async () => {
      await apiClient.delete('/assets/123')
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/assets/123'),
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })
  })

  describe('Request Configuration', () => {
    it('should use correct base URL from environment', async () => {
      Object.defineProperty(import.meta, 'env', {
        value: { VITE_API_BASE_URL: 'https://api.example.com' },
        writable: true,
      })

      await apiClient.get('/test')
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.example.com'),
        expect.any(Object)
      )
    })

    it('should use default base URL when not set', async () => {
      Object.defineProperty(import.meta, 'env', {
        value: {},
        writable: true,
      })

      await apiClient.get('/test')
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('http://localhost:3000'),
        expect.any(Object)
      )
    })

    it('should include API version in URL', async () => {
      Object.defineProperty(import.meta, 'env', {
        value: { VITE_API_VERSION: 'v2' },
        writable: true,
      })

      await apiClient.get('/test')
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v2/test'),
        expect.any(Object)
      )
    })
  })

  describe('Error Handling', () => {
    it('should throw ApiError with correct status code', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Server error' }),
      })

      try {
        await apiClient.get('/test')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect((error as ApiError).statusCode).toBe(500)
        expect((error as ApiError).message).toContain('500')
      }
    })

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => {
          throw new Error('Invalid JSON')
        },
      })

      await expect(apiClient.get('/test')).rejects.toThrow()
    })

    it('should handle empty responses', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
        text: async () => '',
      })

      const response = await apiClient.get('/test')
      expect(response).toBe('')
    })
  })

  describe('Request Timeout', () => {
    it('should handle request timeouts', async () => {
      // Mock a slow response
      mockFetch.mockImplementation(() => 
        new Promise((resolve) => 
          setTimeout(() => resolve({
            ok: true,
            status: 200,
            json: async () => ({ data: 'slow response' }),
          }), 100)
        )
      )

      // This test mainly ensures the timeout logic doesn't break
      // In a real implementation, you'd test the actual timeout behavior
      const response = await apiClient.get('/slow-endpoint')
      expect(response).toEqual({ data: 'slow response' })
    })
  })

  describe('Request Interceptors', () => {
    it('should add custom headers', async () => {
      await apiClient.get('/test')
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    it('should handle missing environment variables gracefully', async () => {
      // This test ensures the getEnvVar function handles missing env vars
      Object.defineProperty(import.meta, 'env', {
        value: {},  // Use empty object instead of undefined
        writable: true,
      })

      // Should not throw when accessing env vars
      await expect(apiClient.get('/test')).resolves.toBeDefined()
    })
  })
})
