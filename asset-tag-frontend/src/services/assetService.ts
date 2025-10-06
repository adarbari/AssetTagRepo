// Asset Service - API Integration Layer
// This service handles all asset-related API calls

import type { Asset } from '../types';
import type {
  BatteryHistory,
  LocationHistory,
  ActivityLog,
  MaintenanceSchedule,
  AssetAlertHistory,
  AssetDetailsResponse,
  DateRangeParams,
  PaginationParams,
  AlertFilters,
  CheckInData,
  CheckOutData,
} from '../types/assetDetails';
import { apiClient, shouldUseMockData } from './api';
import { mockAssets } from '../data/mockData';

export class AssetService {
  /**
   * Get full asset details with all related data
   * Uses composite endpoint for better performance
   */
  static async getAssetDetails(
    assetId: string,
    includes?: string[]
  ): Promise<AssetDetailsResponse> {
    if (shouldUseMockData()) {
      return this.getMockAssetDetails(assetId);
    }

    try {
      const params = includes ? `?include=${includes.join(',')}` : '';
      const response = await apiClient.get(
        `/assets/${assetId}/details${params}`
      );
      return response.data;
    } catch (error) {
// // // // // // console.error('Error fetching asset details:', error);
      // Fallback to mock data on error
      return this.getMockAssetDetails(assetId);
    }
  }

  /**
   * Get basic asset information
   */
  static async getAssetById(assetId: string): Promise<Asset> {
    if (shouldUseMockData()) {
      const asset = mockAssets.find(a => a.id === assetId);
      if (!asset) {
        throw new Error(`Asset ${assetId} not found`);
      }
      return asset;
    }

    try {
      const response = await apiClient.get(`/assets/${assetId}`);
      return response.data;
    } catch (error) {
// // // // // // console.error('Error fetching asset:', error);
      // Fallback to mock data on error
      const asset = mockAssets.find(a => a.id === assetId);
      if (!asset) {
        throw new Error(`Asset ${assetId} not found`);
      }
      return asset;
    }
  }

  /**
   * Update asset details
   */
  static async updateAsset(
    assetId: string,
    updates: Partial<Asset>
  ): Promise<Asset> {
    if (shouldUseMockData()) {
      const assetIndex = mockAssets.findIndex(a => a.id === assetId);
      if (assetIndex !== -1) {
        Object.assign(mockAssets[assetIndex], updates);
        return mockAssets[assetIndex];
      }
      throw new Error(`Asset ${assetId} not found`);
    }

    try {
      const response = await apiClient.put(`/assets/${assetId}`, updates);
      return response.data;
    } catch (error) {
// // // // // // console.error('Error updating asset:', error);
      throw error;
    }
  }

  /**
   * Get battery history for an asset
   */
  static async getBatteryHistory(
    assetId: string,
    params?: DateRangeParams
  ): Promise<BatteryHistory> {
    if (shouldUseMockData()) {
      return {
        assetId,
        startDate:
          params?.startDate ||
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endDate: params?.endDate || new Date().toISOString(),
        dataPoints: [
          { time: '00:00', battery: 92 },
          { time: '04:00', battery: 90 },
          { time: '08:00', battery: 88 },
          { time: '12:00', battery: 85 },
          { time: '16:00', battery: 83 },
          { time: '20:00', battery: 87 },
        ],
        statistics: {
          average: 87.5,
          min: 83,
          max: 92,
          currentLevel: 87,
        },
      };
    }

    try {
      const response = await apiClient.get(
        `/assets/${assetId}/battery-history`,
        { params }
      );
      return response.data;
    } catch (error) {
// // // // // // console.error('Error fetching battery history:', error);
      // Return mock data as fallback
      return {
        assetId,
        startDate:
          params?.startDate ||
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endDate: params?.endDate || new Date().toISOString(),
        dataPoints: [],
        statistics: {
          average: 0,
          min: 0,
          max: 0,
          currentLevel: 0,
        },
      };
    }
  }

  /**
   * Get location history for an asset
   */
  static async getLocationHistory(
    assetId: string,
    params?: DateRangeParams & PaginationParams
  ): Promise<LocationHistory> {
    if (shouldUseMockData()) {
      return {
        assetId,
        startDate:
          params?.startDate ||
          new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: params?.endDate || new Date().toISOString(),
        trackingPoints: [
          {
            timestamp: '2024-01-04 14:30',
            location: 'Main Warehouse',
            lat: 37.7849,
            lng: -122.4194,
            event: 'arrived',
            speed: 0,
            distance: 24.3,
          },
          {
            timestamp: '2024-01-04 12:15',
            location: 'In Transit',
            lat: 37.7799,
            lng: -122.4244,
            event: 'moving',
            speed: 22,
            distance: 23.1,
          },
          {
            timestamp: '2024-01-04 09:00',
            location: 'Construction Site B',
            lat: 37.7649,
            lng: -122.4194,
            event: 'departed',
            speed: 5,
            distance: 14.2,
          },
          {
            timestamp: '2024-01-04 06:00',
            location: 'Construction Site B',
            lat: 37.7649,
            lng: -122.4194,
            event: 'arrived',
            speed: 0,
            distance: 14.2,
          },
          {
            timestamp: '2024-01-03 18:30',
            location: 'In Transit',
            lat: 37.7699,
            lng: -122.4344,
            event: 'moving',
            speed: 28,
            distance: 12.8,
          },
          {
            timestamp: '2024-01-03 08:00',
            location: 'Main Warehouse',
            lat: 37.7849,
            lng: -122.4194,
            event: 'departed',
            speed: 8,
            distance: 2.1,
          },
        ],
        totalDistance: 24.3,
        averageSpeed: 18.5,
        maxSpeed: 28,
      };
    }

    try {
      const response = await apiClient.get(`/locations/${assetId}/history`, {
        params,
      });
      return response.data;
    } catch (error) {
// // // // // // console.error('Error fetching location history:', error);
      // Return mock data as fallback
      return {
        assetId,
        startDate:
          params?.startDate ||
          new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: params?.endDate || new Date().toISOString(),
        trackingPoints: [],
        totalDistance: 0,
        averageSpeed: 0,
        maxSpeed: 0,
      };
    }
  }

  /**
   * Get activity log for an asset
   */
  static async getActivityLog(
    assetId: string,
    params?: PaginationParams & { type?: string }
  ): Promise<ActivityLog> {
    // In production:
    // return apiClient.get(`/assets/${assetId}/activity-log`, { params });

    return {
      assetId,
      entries: [
        {
          id: 1,
          timestamp: '2024-01-04 14:30',
          type: 'location',
          description: 'Arrived at Main Warehouse',
          user: 'System',
        },
        {
          id: 2,
          timestamp: '2024-01-04 13:15',
          type: 'status',
          description: 'Status changed to Active',
          user: 'John Martinez',
        },
        {
          id: 3,
          timestamp: '2024-01-04 12:00',
          type: 'checkout',
          description: 'Checked out for Site B work',
          user: 'John Martinez',
        },
        {
          id: 4,
          timestamp: '2024-01-04 09:00',
          type: 'maintenance',
          description: 'Scheduled maintenance completed',
          user: 'Mike Chen',
        },
        {
          id: 5,
          timestamp: '2024-01-03 16:45',
          type: 'alert',
          description: 'Low battery alert resolved',
          user: 'System',
        },
        {
          id: 6,
          timestamp: '2024-01-03 08:00',
          type: 'checkin',
          description: 'Checked in from overnight storage',
          user: 'Sarah Johnson',
        },
      ],
      pagination: {
        total: 6,
        page: params?.page || 1,
        pageSize: params?.pageSize || 50,
        hasMore: false,
      },
    };
  }

  /**
   * Get maintenance schedule for an asset
   */
  static async getMaintenanceSchedule(
    assetId: string
  ): Promise<MaintenanceSchedule> {
    if (shouldUseMockData()) {
      return {
        assetId,
        upcoming: [
          {
            id: 'MAINT-001',
            date: '2024-01-10',
            type: 'Scheduled',
            description: '50-hour service inspection',
            technician: 'Sarah Wilson',
            priority: 'High',
            assignedTo: 'Sarah Wilson',
            status: 'scheduled',
          },
          {
            id: 'MAINT-002',
            date: '2024-03-15',
            type: 'Scheduled',
            description: 'Hydraulic system inspection',
            technician: 'David Lee',
            priority: 'Medium',
            assignedTo: 'David Lee',
            status: 'scheduled',
          },
          {
            id: 'MAINT-003',
            date: '2024-04-04',
            type: 'Scheduled',
            description: 'Oil change and filter replacement',
            technician: 'Mike Chen',
            priority: 'Medium',
            assignedTo: 'Mike Chen',
            status: 'scheduled',
          },
        ],
        history: [
          {
            id: 1,
            date: '2024-01-04',
            type: 'Scheduled',
            description: 'Oil change and filter replacement',
            technician: 'Mike Chen',
            status: 'completed',
            nextDue: '2024-04-04',
          },
          {
            id: 2,
            date: '2023-12-15',
            type: 'Scheduled',
            description: 'Hydraulic system inspection',
            technician: 'David Lee',
            status: 'completed',
            nextDue: '2024-03-15',
          },
          {
            id: 3,
            date: '2023-11-20',
            type: 'Repair',
            description: 'Replaced worn track pads',
            technician: 'Mike Chen',
            status: 'completed',
            nextDue: '-',
          },
          {
            id: 4,
            date: '2023-10-10',
            type: 'Scheduled',
            description: '50-hour service inspection',
            technician: 'Sarah Wilson',
            status: 'completed',
            nextDue: '2024-01-10',
          },
        ],
        nextMaintenance: {
          id: 'MAINT-001',
          date: '2024-01-10',
          type: 'Scheduled',
          description: '50-hour service inspection',
          daysUntil: 6,
        },
      };
    }

    try {
      const response = await apiClient.get(`/maintenance/asset/${assetId}`);
      return response.data;
    } catch (error) {
// // // // // // console.error('Error fetching maintenance schedule:', error);
      // Return mock data as fallback
      return {
        assetId,
        upcoming: [],
        history: [],
        nextMaintenance: null,
      };
    }
  }

  /**
   * Get alerts for an asset
   */
  static async getAlerts(
    assetId: string,
    filters?: AlertFilters
  ): Promise<AssetAlertHistory> {
    if (shouldUseMockData()) {
      return {
        assetId,
        alerts: [
          {
            id: 1,
            date: '2024-01-03 16:30',
            severity: 'medium',
            category: 'Battery',
            message: 'Battery level below 20%',
            status: 'resolved',
          },
          {
            id: 2,
            date: '2024-01-02 14:20',
            severity: 'low',
            category: 'Maintenance',
            message: 'Upcoming scheduled maintenance',
            status: 'acknowledged',
          },
          {
            id: 3,
            date: '2023-12-28 10:15',
            severity: 'high',
            category: 'Geofence',
            message: 'Asset left authorized zone',
            status: 'resolved',
          },
        ],
        statistics: {
          total: 3,
          active: 0,
          resolved: 2,
          byType: {
            Battery: 1,
            Maintenance: 1,
            Geofence: 1,
          },
          bySeverity: {
            high: 1,
            medium: 1,
            low: 1,
          },
        },
      };
    }

    try {
      const response = await apiClient.get(`/alerts`, {
        params: { asset_id: assetId, ...filters },
      });
      return response.data;
    } catch (error) {
// // // // // // console.error('Error fetching alerts:', error);
      // Return mock data as fallback
      return {
        assetId,
        alerts: [],
        statistics: {
          total: 0,
          active: 0,
          resolved: 0,
          byType: {},
          bySeverity: {},
        },
      };
    }
  }

  /**
   * Check in an asset
   */
  static async checkIn(assetId: string, data: CheckInData) {
    if (shouldUseMockData()) {
// // // // // // console.log('Check in asset:', assetId, data);
      return {
        success: true,
        message: 'Asset checked in successfully',
      };
    }

    try {
      const response = await apiClient.post(`/checkin`, {
        asset_id: assetId,
        ...data,
      });
      return response.data;
    } catch (error) {
// // // // // // console.error('Error checking in asset:', error);
      throw error;
    }
  }

  /**
   * Check out an asset
   */
  static async checkOut(assetId: string, data: CheckOutData) {
    if (shouldUseMockData()) {
// // // // // // console.log('Check out asset:', assetId, data);
      return {
        success: true,
        message: 'Asset checked out successfully',
      };
    }

    try {
      const response = await apiClient.post(`/checkout`, {
        asset_id: assetId,
        ...data,
      });
      return response.data;
    } catch (error) {
// // // // // // console.error('Error checking out asset:', error);
      throw error;
    }
  }

  /**
   * Mock implementation for composite endpoint
   */
  private static async getMockAssetDetails(
    assetId: string
  ): Promise<AssetDetailsResponse> {
    const asset = await this.getAssetById(assetId);
    const batteryHistory = await this.getBatteryHistory(assetId);
    const locationHistory = await this.getLocationHistory(assetId);
    const activityLog = await this.getActivityLog(assetId);
    const maintenanceSchedule = await this.getMaintenanceSchedule(assetId);
    const alerts = await this.getAlerts(assetId);

    return {
      asset,
      batteryHistory,
      locationHistory,
      activityLog,
      maintenanceSchedule,
      alerts,
      summary: {
        batteryLevel: asset.battery,
        lastUpdate: asset.lastSeen,
        currentSite: asset.site || 'Unknown',
        assignedTo: asset.assignedTo || 'Unassigned',
        upcomingMaintenance: maintenanceSchedule.upcoming.length,
        activeAlerts: alerts.statistics?.active || 0,
      },
    };
  }
}

// Export singleton instance for convenience
export const assetService = AssetService;
