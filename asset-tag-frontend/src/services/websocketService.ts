/**
 * WebSocket Service for Real-time Updates
 *
 * This service handles WebSocket connections for real-time updates
 * including location updates, alerts, and other live data.
 */

import { Alert } from '../types';

export interface LocationUpdate {
  assetId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  confidence: number;
}

export interface WebSocketMessage {
  type: 'location_update' | 'alert' | 'asset_status' | 'maintenance_reminder';
  data: any;
  timestamp: string;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      ...config,
    };
  }

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;

      try {
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
// console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = event => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
// console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = event => {
// console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.stopHeartbeat();

          if (
            !event.wasClean &&
            this.reconnectAttempts < this.config.maxReconnectAttempts!
          ) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = error => {
// console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.stopHeartbeat();
    this.clearReconnectTimer();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  /**
   * Subscribe to location updates for a specific asset
   */
  subscribeToLocationUpdates(
    assetId: string,
    callback: (update: LocationUpdate) => void
  ): () => void {
    const key = `location:${assetId}`;
    this.addListener(key, callback);

    // Send subscription message
    this.send({
      type: 'subscribe',
      channel: 'location_updates',
      assetId: assetId,
    });

    // Return unsubscribe function
    return () => {
      this.removeListener(key, callback);
      this.send({
        type: 'unsubscribe',
        channel: 'location_updates',
        assetId: assetId,
      });
    };
  }

  /**
   * Subscribe to all alerts
   */
  subscribeToAlerts(callback: (alert: Alert) => void): () => void {
    const key = 'alerts';
    this.addListener(key, callback);

    // Send subscription message
    this.send({
      type: 'subscribe',
      channel: 'alerts',
    });

    // Return unsubscribe function
    return () => {
      this.removeListener(key, callback);
      this.send({
        type: 'unsubscribe',
        channel: 'alerts',
      });
    };
  }

  /**
   * Subscribe to asset status updates
   */
  subscribeToAssetStatus(
    assetId: string,
    callback: (status: any) => void
  ): () => void {
    const key = `asset_status:${assetId}`;
    this.addListener(key, callback);

    // Send subscription message
    this.send({
      type: 'subscribe',
      channel: 'asset_status',
      assetId: assetId,
    });

    // Return unsubscribe function
    return () => {
      this.removeListener(key, callback);
      this.send({
        type: 'unsubscribe',
        channel: 'asset_status',
        assetId: assetId,
      });
    };
  }

  /**
   * Subscribe to maintenance reminders
   */
  subscribeToMaintenanceReminders(
    callback: (reminder: any) => void
  ): () => void {
    const key = 'maintenance_reminders';
    this.addListener(key, callback);

    // Send subscription message
    this.send({
      type: 'subscribe',
      channel: 'maintenance_reminders',
    });

    // Return unsubscribe function
    return () => {
      this.removeListener(key, callback);
      this.send({
        type: 'unsubscribe',
        channel: 'maintenance_reminders',
      });
    };
  }

  /**
   * Send a message to the WebSocket server
   */
  private send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
// console.warn('WebSocket not connected, cannot send message:', message);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'location_update':
        this.notifyListeners(`location:${message.data.assetId}`, message.data);
        break;
      case 'alert':
        this.notifyListeners('alerts', message.data);
        break;
      case 'asset_status':
        this.notifyListeners(
          `asset_status:${message.data.assetId}`,
          message.data
        );
        break;
      case 'maintenance_reminder':
        this.notifyListeners('maintenance_reminders', message.data);
        break;
      default:
// console.warn('Unknown message type:', message.type);
    }
  }

  /**
   * Add a listener for a specific event
   */
  private addListener(key: string, callback: (data: any) => void): void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)?.add(callback);
  }

  /**
   * Remove a listener for a specific event
   */
  private removeListener(key: string, callback: (data: any) => void): void {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.listeners.delete(key);
      }
    }
  }

  /**
   * Notify all listeners for a specific event
   */
  private notifyListeners(key: string, data: any): void {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
// console.error('Error in WebSocket listener:', error);
        }
      });
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectAttempts++;
// console.log(
      `Scheduling reconnect attempt ${this.reconnectAttempts} in ${this.config.reconnectInterval}ms`
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect().catch(error => {
// console.error('Reconnect failed:', error);
      });
    }, this.config.reconnectInterval);
  }

  /**
   * Clear reconnect timer
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    if (this.isConnecting) return 'connecting';
    if (this.ws?.readyState === WebSocket.OPEN) return 'connected';
    if (this.ws?.readyState === WebSocket.CLOSED) return 'disconnected';
    return 'error';
  }

  /**
   * Get connection info
   */
  getConnectionInfo(): {
    status: string;
    reconnectAttempts: number;
    url: string;
  } {
    return {
      status: this.getConnectionStatus(),
      reconnectAttempts: this.reconnectAttempts,
      url: this.config.url,
    };
  }
}

// Create singleton instance
const getWebSocketUrl = (): string => {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  return backendUrl.replace('http', 'ws') + '/ws';
};

export const websocketService = new WebSocketService({
  url: getWebSocketUrl(),
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000,
});

// Export types and service
export { WebSocketService };
export default websocketService;
