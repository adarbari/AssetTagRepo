import { useState, useEffect, useCallback } from 'react';

export interface AsyncDataState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface UseAsyncDataOptions {
  /**
   * If true, the fetch will happen automatically on mount
   * @default true
   */
  immediate?: boolean;
  /**
   * Dependencies array to trigger refetch
   */
  deps?: unknown[];
}

/**
 * Custom hook for managing async data fetching with loading and error states
 *
 * @example
 * ```tsx
 * const { data, loading, error, refetch } = useAsyncData(
 *   async () => {
 *     const response = await api.getAssets();
 *     return response.data;
 * },
 *   { immediate: true }
 * );
 * ```
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  options: UseAsyncDataOptions = {}
) {
  const { immediate = true, deps = [] } = options;

  const [state, setState] = useState<AsyncDataState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await fetcher();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({ data: null, loading: false, error });
      // Don't throw the error to prevent unhandled promise rejections
// console.error('useAsyncData error:', error);
      return null;
    }
  }, [fetcher]);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  useEffect(() => {
    if (immediate) {
      execute().catch(err => {
// console.error('Unhandled promise rejection in useAsyncData:', err);
      });
    }
  }, [...deps, immediate, execute]);

  return {
    ...state,
    refetch,
    execute,
  };
}

/**
 * Hook for managing multiple async data sources
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useAsyncDataAll({
 *   assets: () => api.getAssets(),
 *   sites: () => api.getSites(),
 * });
 * // data will be { assets: [...], sites: [...] }
 * ```
 */
export function useAsyncDataAll<T extends Record<string, () => Promise<any>>>(
  fetchers: T,
  options: UseAsyncDataOptions = {}
): AsyncDataState<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
  const { immediate = true, deps = [] } = options;

  const [state, setState] = useState<AsyncDataState<any>>({
    data: null,
    loading: immediate,
    error: null,
  });

  useEffect(() => {
    if (!immediate) return;

    const execute = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const entries = Object.entries(fetchers);
        const results = await Promise.all(
          entries.map(([key, fetcher]) => fetcher())
        );

        const data = Object.fromEntries(
          entries.map(([key], index) => [key, results[index]])
        );

        setState({ data, loading: false, error: null });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState({ data: null, loading: false, error });
        // Log the error to prevent unhandled promise rejection
// console.error('useAsyncDataAll error:', error);
      }
    };

    // Handle promise rejection properly
    execute().catch(err => {
// console.error('Unhandled promise rejection in useAsyncDataAll:', err);
    });
  }, [...deps, immediate]);

  return state;
}
