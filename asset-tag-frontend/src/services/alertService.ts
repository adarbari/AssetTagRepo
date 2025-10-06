import { Alert } from '../types';
import { mockAlerts } from '../data/mockData';
import { apiClient, shouldUseMockData } from './api';

/**
 * Alert Service
 *
 * This service handles all alert-related operations.
 * Uses backend APIs when available, falls back to mock data.
 */

// In-memory storage (fallback for mock data)
const alerts = [...mockAlerts];

/**
 * Get all alerts
 * Backend equivalent: GET /api/alerts
 */
export async function getAllAlerts(): Promise<Alert[]> {
  try {
    if (shouldUseMockData()) {
      return alerts;
    }

    const response = await apiClient.get('/alerts');
    return response.data;
  } catch (error) {
// console.error('Failed to fetch alerts:', error);
    // Fallback to mock data on error
    return alerts;
  }
}

/**
 * Get alert by ID
 * Backend equivalent: GET /api/alerts/:id
 */
export async function getAlertById(alertId: string): Promise<Alert | null> {
  try {
    if (shouldUseMockData()) {
      const alert = alerts.find(a => a.id === alertId);
      return alert || null;
    }

    const response = await apiClient.get(`/alerts/${alertId}`);
    return response.data;
  } catch (error) {
// console.error('Failed to fetch alert:', error);
    // Fallback to mock data on error
    const alert = alerts.find(a => a.id === alertId);
    return alert || null;
  }
}

/**
 * Update alert status
 * Backend equivalent: PATCH /api/alerts/:id/status
 */
export async function updateAlertStatus(
  alertId: string,
  status: 'active' | 'acknowledged' | 'resolved',
  notes?: string
): Promise<Alert> {
  try {
    if (shouldUseMockData()) {
      const alertIndex = alerts.findIndex(a => a.id === alertId);
      if (alertIndex === -1) {
        throw new Error(`Alert ${alertId} not found`);
      }

      const updatedAlert = {
        ...alerts[alertIndex],
        status,
        // Add resolution timestamp if resolving
        ...(status === 'resolved' && { resolvedAt: new Date().toISOString() }),
        // Add acknowledgment timestamp if acknowledging
        ...(status === 'acknowledged' && {
          acknowledgedAt: new Date().toISOString(),
        }),
        // Add notes if provided
        ...(notes && { resolutionNotes: notes }),
      };

      alerts[alertIndex] = updatedAlert;
      return updatedAlert;
    }

    const response = await apiClient.patch(`/alerts/${alertId}/status`, {
      status,
      notes,
      timestamp: new Date().toISOString(),
    });
    return response.data;
  } catch (error) {
// console.error('Failed to update alert status:', error);
    throw error;
  }
}

/**
 * Acknowledge an alert
 * Backend equivalent: POST /api/alerts/:id/acknowledge
 */
export async function acknowledgeAlert(
  alertId: string,
  notes?: string
): Promise<Alert> {
  return updateAlertStatus(alertId, 'acknowledged', notes);
}

/**
 * Resolve an alert
 * Backend equivalent: POST /api/alerts/:id/resolve
 */
export async function resolveAlert(
  alertId: string,
  notes?: string
): Promise<Alert> {
  return updateAlertStatus(alertId, 'resolved', notes);
}

/**
 * Execute workflow action on an alert
 * Backend equivalent: POST /api/alerts/:id/workflow
 */
export async function executeWorkflowAction(
  alertId: string,
  action: string,
  input?: string,
  notes?: string
): Promise<Alert> {
  try {
    // Current: update mock data with workflow execution
    const alertIndex = alerts.findIndex(a => a.id === alertId);
    if (alertIndex === -1) {
      throw new Error(`Alert ${alertId} not found`);
    }

    const updatedAlert = {
      ...alerts[alertIndex],
      // Add workflow execution metadata
      workflowActions: [
        ...(alerts[alertIndex].workflowActions || []),
        {
          action,
          input,
          notes,
          executedAt: new Date().toISOString(),
        },
      ],
      // Update status based on action type
      status:
        action.includes('resolve') || action.includes('complete')
          ? ('resolved' as const)
          : alerts[alertIndex].status,
    };

    alerts[alertIndex] = updatedAlert;

    // Backend implementation would be:
    // const response = await apiClient.post(`/api/alerts/${alertId}/workflow`, {
    //   action,
    //   input,
    //   notes,
    //   timestamp: new Date().toISOString(),
    // });
    // return response.data;

    return updatedAlert;
  } catch (error) {
// console.error('Failed to execute workflow action:', error);
    throw error;
  }
}

/**
 * Get alerts by status
 * Backend equivalent: GET /api/alerts?status=:status
 */
export async function getAlertsByStatus(
  status: 'active' | 'acknowledged' | 'resolved'
): Promise<Alert[]> {
  try {
    if (shouldUseMockData()) {
      return alerts.filter(a => a.status === status);
    }

    const response = await apiClient.get('/alerts', { params: { status } });
    return response.data;
  } catch (error) {
// console.error('Failed to fetch alerts by status:', error);
    // Fallback to mock data on error
    return alerts.filter(a => a.status === status);
  }
}

/**
 * Get alerts by asset ID
 * Backend equivalent: GET /api/assets/:assetId/alerts
 */
export async function getAlertsByAsset(assetId: string): Promise<Alert[]> {
  try {
    if (shouldUseMockData()) {
      return alerts.filter(a => a.assetId === assetId);
    }

    const response = await apiClient.get('/alerts', {
      params: { asset_assetId },
    });
    return response.data;
  } catch (error) {
// console.error('Failed to fetch alerts by asset:', error);
    // Fallback to mock data on error
    return alerts.filter(a => a.assetId === assetId);
  }
}

/**
 * Create a new alert
 * Backend equivalent: POST /api/alerts
 */
export async function createAlert(
  alertData: Omit<Alert, 'id'>
): Promise<Alert> {
  try {
    if (shouldUseMockData()) {
      const newAlert: Alert = {
        id: `ALT-${Date.now()}`,
        ...alertData,
      };

      alerts.push(newAlert);
      return newAlert;
    }

    const response = await apiClient.post('/alerts', alertData);
    return response.data;
  } catch (error) {
// console.error('Failed to create alert:', error);
    throw error;
  }
}

/**
 * Delete an alert
 * Backend equivalent: DELETE /api/alerts/:id
 */
export async function deleteAlert(alertId: string): Promise<boolean> {
  try {
    // Current: remove from mock data
    const alertIndex = alerts.findIndex(a => a.id === alertId);
    if (alertIndex === -1) {
      return false;
    }

    alerts.splice(alertIndex, 1);

    // Backend implementation would be:
    // await apiClient.delete(`/api/alerts/${alertId}`);
    // return true;

    return true;
  } catch (error) {
// console.error('Failed to delete alert:', error);
    throw error;
  }
}

/**
 * Get alert statistics
 * Backend equivalent: GET /api/alerts/stats
 */
export async function getAlertStatistics(): Promise<{
  total: number;
  active: number;
  acknowledged: number;
  resolved: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
}> {
  try {
    if (shouldUseMockData()) {
      const stats = {
        total: alerts.length,
        active: alerts.filter(a => a.status === 'active').length,
        acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
        resolved: alerts.filter(a => a.status === 'resolved').length,
        byType: {} as Record<string, number>,
        bySeverity: {} as Record<string, number>,
      };

      // Count by type
      alerts.forEach(alert => {
        stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1;
      });

      // Count by severity
      alerts.forEach(alert => {
        stats.bySeverity[alert.severity] =
          (stats.bySeverity[alert.severity] || 0) + 1;
      });

      return stats;
    }

    const response = await apiClient.get('/alerts/stats');
    return response.data;
  } catch (error) {
// console.error('Failed to fetch alert statistics:', error);
    // Fallback to mock data calculation
    const stats = {
      total: alerts.length,
      active: alerts.filter(a => a.status === 'active').length,
      acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
      resolved: alerts.filter(a => a.status === 'resolved').length,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
    };

    alerts.forEach(alert => {
      stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1;
      stats.bySeverity[alert.severity] =
        (stats.bySeverity[alert.severity] || 0) + 1;
    });

    return stats;
  }
}
