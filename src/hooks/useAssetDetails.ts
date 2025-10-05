// React Hooks for Asset Details Data Fetching
// These hooks provide a clean interface for components to fetch asset data
// Can be easily migrated to React Query or SWR for production

import { useState, useEffect } from "react";
import { assetService } from "../services/assetService";
import type {
  AssetDetailsResponse,
  BatteryHistory,
  LocationHistory,
  ActivityLog,
  MaintenanceSchedule,
  AssetAlertHistory,
} from "../types/assetDetails";
import type { Asset } from "../types";

/**
 * Hook to fetch complete asset details
 * @param assetId - The asset ID to fetch details for
 * @returns Asset details data, loading state, and error
 */
export function useAssetDetails(assetId: string) {
  const [data, setData] = useState<AssetDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await assetService.getAssetDetails(assetId);
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to fetch asset details"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [assetId]);

  return { data, loading, error };
}

/**
 * Hook to fetch battery history
 */
export function useBatteryHistory(assetId: string, params?: { days?: number }) {
  const [data, setData] = useState<BatteryHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await assetService.getBatteryHistory(assetId, params);
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to fetch battery history"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [assetId, params?.days]);

  return { data, loading, error };
}

/**
 * Hook to fetch location history
 */
export function useLocationHistory(assetId: string, params?: { days?: number }) {
  const [data, setData] = useState<LocationHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await assetService.getLocationHistory(assetId, params);
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to fetch location history"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [assetId, params?.days]);

  return { data, loading, error };
}

/**
 * Hook to fetch activity log
 */
export function useActivityLog(assetId: string, params?: { page?: number; pageSize?: number }) {
  const [data, setData] = useState<ActivityLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await assetService.getActivityLog(assetId, params);
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to fetch activity log"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [assetId, params?.page, params?.pageSize]);

  return { data, loading, error };
}

/**
 * Hook to fetch maintenance schedule
 */
export function useMaintenanceSchedule(assetId: string) {
  const [data, setData] = useState<MaintenanceSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await assetService.getMaintenanceSchedule(assetId);
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to fetch maintenance schedule"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [assetId]);

  return { data, loading, error };
}

/**
 * Hook to fetch asset alerts
 */
export function useAssetAlerts(assetId: string, filters?: { status?: string }) {
  const [data, setData] = useState<AssetAlertHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await assetService.getAlerts(assetId, filters);
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to fetch alerts"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [assetId, filters?.status]);

  return { data, loading, error };
}

/**
 * Hook for asset mutations (update, check-in, check-out)
 */
export function useAssetMutations(assetId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateAsset = async (updates: Partial<Asset>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await assetService.updateAsset(assetId, updates);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to update asset");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkIn = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await assetService.checkIn(assetId, data);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to check in asset");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkOut = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await assetService.checkOut(assetId, data);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to check out asset");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateAsset,
    checkIn,
    checkOut,
    loading,
    error,
  };
}

/**
 * Example usage with React Query (for future migration):
 * 
 * import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 * 
 * export function useAssetDetails(assetId: string) {
 *   return useQuery({
 *     queryKey: ['asset', assetId, 'details'],
 *     queryFn: () => assetService.getAssetDetails(assetId),
 *     staleTime: 30000, // 30 seconds
 *     cacheTime: 300000, // 5 minutes
 *   });
 * }
 * 
 * export function useUpdateAsset(assetId: string) {
 *   const queryClient = useQueryClient();
 *   
 *   return useMutation({
 *     mutationFn: (updates: Partial<Asset>) => assetService.updateAsset(assetId, updates),
 *     onSuccess: (updatedAsset) => {
 *       queryClient.setQueryData(['asset', assetId, 'details'], (old: any) => ({
 *         ...old,
 *         asset: updatedAsset,
 *       }));
 *       queryClient.invalidateQueries(['asset', assetId]);
 *     },
 *   });
 * }
 */
