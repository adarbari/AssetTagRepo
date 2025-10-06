import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAsyncData, useAsyncDataAll } from '../useAsyncData';

describe('useAsyncData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should return initial state with loading true when immediate is true', () => {
      const mockFetcher = vi.fn().mockResolvedValue('test data');

      const { result } = renderHook(() => useAsyncData(mockFetcher));

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.refetch).toBe('function');
      expect(typeof result.current.execute).toBe('function');
    });

    it('should return initial state with loading false when immediate is false', () => {
      const mockFetcher = vi.fn().mockResolvedValue('test data');

      const { result } = renderHook(() =>
        useAsyncData(mockFetcher, { immediate: false })
      );

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should fetch data successfully', async () => {
      const mockData = { id: 1, name: 'Test Asset' };
      const mockFetcher = vi.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useAsyncData(mockFetcher));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch errors', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const mockError = new Error('Fetch failed');
      const mockFetcher = vi.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() => useAsyncData(mockFetcher));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toEqual(mockError);
      expect(mockFetcher).toHaveBeenCalledTimes(1);

      consoleSpy.mockRestore();
    });

    it('should handle non-Error exceptions', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const mockFetcher = vi.fn().mockRejectedValue('String error');

      const { result } = renderHook(() => useAsyncData(mockFetcher));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('String error');

      consoleSpy.mockRestore();
    });
  });

  describe('Manual Execution', () => {
    it('should allow manual execution when immediate is false', async () => {
      const mockData = { id: 1, name: 'Test Asset' };
      const mockFetcher = vi.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() =>
        useAsyncData(mockFetcher, { immediate: false })
      );

      expect(result.current.loading).toBe(false);
      expect(mockFetcher).not.toHaveBeenCalled();

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.loading).toBe(false);
      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });

    it('should allow refetching data', async () => {
      const mockData1 = { id: 1, name: 'Test Asset 1' };
      const mockData2 = { id: 2, name: 'Test Asset 2' };
      const mockFetcher = vi
        .fn()
        .mockResolvedValueOnce(mockData1)
        .mockResolvedValueOnce(mockData2);

      const { result } = renderHook(() => useAsyncData(mockFetcher));

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData1);

      // Refetch
      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.data).toEqual(mockData2);
      expect(mockFetcher).toHaveBeenCalledTimes(2);
    });

    it('should handle errors during manual execution', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const mockError = new Error('Manual fetch failed');
      const mockFetcher = vi.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        useAsyncData(mockFetcher, { immediate: false })
      );

      await act(async () => {
        try {
          await result.current.execute();
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toEqual(mockError);
      expect(result.current.loading).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('Dependencies', () => {
    it('should refetch when dependencies change', async () => {
      const mockFetcher = vi.fn().mockResolvedValue('test data');
      let dependency = 'initial';

      const { result, rerender } = renderHook(
        ({ deps }) => useAsyncData(mockFetcher, { deps }),
        { initialProps: { deps: [dependency] } }
      );

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetcher).toHaveBeenCalledTimes(1);

      // Change dependency
      dependency = 'changed';
      rerender({ deps: [dependency] });

      // Wait for refetch
      await waitFor(() => {
        expect(mockFetcher).toHaveBeenCalledTimes(2);
      });
    });

    it('should not refetch when dependencies do not change', async () => {
      const mockFetcher = vi.fn().mockResolvedValue('test data');
      const dependency = 'stable';

      const { result, rerender } = renderHook(
        ({ deps }) => useAsyncData(mockFetcher, { deps }),
        { initialProps: { deps: [dependency] } }
      );

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetcher).toHaveBeenCalledTimes(1);

      // Rerender with same dependency
      rerender({ deps: [dependency] });

      // Should not refetch
      await waitFor(() => {
        expect(mockFetcher).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('State Management', () => {
    it('should set loading to true during fetch', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      const mockFetcher = vi.fn().mockReturnValue(promise);

      const { result } = renderHook(() => useAsyncData(mockFetcher));

      expect(result.current.loading).toBe(true);

      // Resolve the promise
      act(() => {
        resolvePromise!('test data');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should clear error on successful refetch', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const mockError = new Error('Initial error');
      const mockData = { id: 1, name: 'Test Asset' };
      const mockFetcher = vi
        .fn()
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockData);

      const { result } = renderHook(() => useAsyncData(mockFetcher));

      // Wait for initial error
      await waitFor(() => {
        expect(result.current.error).toEqual(mockError);
      });

      // Refetch successfully
      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();

      consoleSpy.mockRestore();
    });
  });
});

describe('useAsyncDataAll', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should return initial state with loading true when immediate is true', () => {
      const mockFetchers = {
        assets: vi.fn().mockResolvedValue([]),
        sites: vi.fn().mockResolvedValue([]),
      };

      const { result } = renderHook(() => useAsyncDataAll(mockFetchers));

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should return initial state with loading false when immediate is false', () => {
      const mockFetchers = {
        assets: vi.fn().mockResolvedValue([]),
        sites: vi.fn().mockResolvedValue([]),
      };

      const { result } = renderHook(() =>
        useAsyncDataAll(mockFetchers, { immediate: false })
      );

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should fetch all data successfully', async () => {
      const mockAssets = [{ id: 1, name: 'Asset 1' }];
      const mockSites = [{ id: 1, name: 'Site 1' }];
      const mockFetchers = {
        assets: vi.fn().mockResolvedValue(mockAssets),
        sites: vi.fn().mockResolvedValue(mockSites),
      };

      const { result } = renderHook(() => useAsyncDataAll(mockFetchers));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual({
        assets: mockAssets,
        sites: mockSites,
      });
      expect(result.current.error).toBeNull();
      expect(mockFetchers.assets).toHaveBeenCalledTimes(1);
      expect(mockFetchers.sites).toHaveBeenCalledTimes(1);
    });

    it('should handle errors from any fetcher', async () => {
      const mockError = new Error('Assets fetch failed');
      const mockFetchers = {
        assets: vi.fn().mockRejectedValue(mockError),
        sites: vi.fn().mockResolvedValue([]),
      };

      const { result } = renderHook(() => useAsyncDataAll(mockFetchers));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toEqual(mockError);
    });

    it('should handle non-Error exceptions', async () => {
      const mockFetchers = {
        assets: vi.fn().mockRejectedValue('String error'),
        sites: vi.fn().mockResolvedValue([]),
      };

      const { result } = renderHook(() => useAsyncDataAll(mockFetchers));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('String error');
    });
  });

  describe('Dependencies', () => {
    it('should refetch when dependencies change', async () => {
      const mockFetchers = {
        assets: vi.fn().mockResolvedValue([]),
        sites: vi.fn().mockResolvedValue([]),
      };
      let dependency = 'initial';

      const { result, rerender } = renderHook(
        ({ deps }) => useAsyncDataAll(mockFetchers, { deps }),
        { initialProps: { deps: [dependency] } }
      );

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetchers.assets).toHaveBeenCalledTimes(1);
      expect(mockFetchers.sites).toHaveBeenCalledTimes(1);

      // Change dependency
      dependency = 'changed';
      rerender({ deps: [dependency] });

      // Wait for refetch
      await waitFor(() => {
        expect(mockFetchers.assets).toHaveBeenCalledTimes(2);
        expect(mockFetchers.sites).toHaveBeenCalledTimes(2);
      });
    });

    it('should not refetch when dependencies do not change', async () => {
      const mockFetchers = {
        assets: vi.fn().mockResolvedValue([]),
        sites: vi.fn().mockResolvedValue([]),
      };
      const dependency = 'stable';

      const { result, rerender } = renderHook(
        ({ deps }) => useAsyncDataAll(mockFetchers, { deps }),
        { initialProps: { deps: [dependency] } }
      );

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetchers.assets).toHaveBeenCalledTimes(1);
      expect(mockFetchers.sites).toHaveBeenCalledTimes(1);

      // Rerender with same dependency
      rerender({ deps: [dependency] });

      // Should not refetch
      await waitFor(() => {
        expect(mockFetchers.assets).toHaveBeenCalledTimes(1);
        expect(mockFetchers.sites).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Complex Data Structures', () => {
    it('should handle complex nested data', async () => {
      const mockComplexData = {
        assets: [
          { id: 1, name: 'Asset 1', location: { lat: 40.7128, lng: -74.006 } },
        ],
        sites: [{ id: 1, name: 'Site 1', assets: [1] }],
        metadata: {
          totalAssets: 1,
          totalSites: 1,
          lastUpdated: '2024-01-01T00:00:00Z',
        },
      };

      const mockFetchers = {
        assets: vi.fn().mockResolvedValue(mockComplexData.assets),
        sites: vi.fn().mockResolvedValue(mockComplexData.sites),
        metadata: vi.fn().mockResolvedValue(mockComplexData.metadata),
      };

      const { result } = renderHook(() => useAsyncDataAll(mockFetchers));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockComplexData);
    });

    it('should handle empty fetcher object', async () => {
      const mockFetchers = {};

      const { result } = renderHook(() => useAsyncDataAll(mockFetchers));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual({});
      expect(result.current.error).toBeNull();
    });
  });

  describe('State Management', () => {
    it('should set loading to true during fetch', async () => {
      let resolveAssets: (value: any) => void;
      let resolveSites: (value: any) => void;

      const assetsPromise = new Promise(resolve => {
        resolveAssets = resolve;
      });
      const sitesPromise = new Promise(resolve => {
        resolveSites = resolve;
      });

      const mockFetchers = {
        assets: vi.fn().mockReturnValue(assetsPromise),
        sites: vi.fn().mockReturnValue(sitesPromise),
      };

      const { result } = renderHook(() => useAsyncDataAll(mockFetchers));

      expect(result.current.loading).toBe(true);

      // Resolve both promises
      act(() => {
        resolveAssets!([{ id: 1, name: 'Asset 1' }]);
        resolveSites!([{ id: 1, name: 'Site 1' }]);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should clear error on successful refetch', async () => {
      const mockError = new Error('Initial error');
      const mockData = {
        assets: [{ id: 1, name: 'Asset 1' }],
        sites: [{ id: 1, name: 'Site 1' }],
      };

      const mockFetchers = {
        assets: vi
          .fn()
          .mockRejectedValueOnce(mockError)
          .mockResolvedValueOnce(mockData.assets),
        sites: vi
          .fn()
          .mockResolvedValueOnce(mockData.sites)
          .mockResolvedValueOnce(mockData.sites),
      };

      const { result, rerender } = renderHook(
        ({ deps }) => useAsyncDataAll(mockFetchers, { deps }),
        { initialProps: { deps: ['initial'] } }
      );

      // Wait for initial error
      await waitFor(() => {
        expect(result.current.error).toEqual(mockError);
      });

      // Trigger refetch by changing dependency
      rerender({ deps: ['changed'] });

      // Wait for successful refetch
      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
        expect(result.current.error).toBeNull();
      });
    });
  });
});
