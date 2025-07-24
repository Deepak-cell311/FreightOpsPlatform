import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { nanoid } from 'nanoid';
import { db } from './db';
import { drivers, loads, trucks } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

// Real-time driver tracking and communication system
interface DriverConnection {
  id: string;
  ws: WebSocket;
  driverId: string;
  companyId: string;
  lastPing: number;
  currentLoad?: string;
  location?: {
    lat: number;
    lng: number;
    timestamp: number;
  };
}

class DriverRealtimeManager {
  public connections = new Map<string, DriverConnection>();
  private driverToConnection = new Map<string, string>();
  private loadSubscriptions = new Map<string, Set<string>>();
  
  // Add new driver connection
  addConnection(ws: WebSocket, driverId: string, companyId: string) {
    const connectionId = nanoid();
    
    // Remove existing connection for same driver
    const existingConnectionId = this.driverToConnection.get(driverId);
    if (existingConnectionId) {
      this.removeConnection(existingConnectionId);
    }
    
    const connection: DriverConnection = {
      id: connectionId,
      ws,
      driverId,
      companyId,
      lastPing: Date.now()
    };
    
    this.connections.set(connectionId, connection);
    this.driverToConnection.set(driverId, connectionId);
    
    // Send connection confirmation
    this.sendToDriver(driverId, {
      type: 'connection_established',
      connectionId,
      timestamp: Date.now()
    });
    
    console.log(`🚛 Driver ${driverId} connected (${this.connections.size} active)`);
    
    return connectionId;
  }
  
  // Remove driver connection
  removeConnection(connectionId: string) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      this.driverToConnection.delete(connection.driverId);
      this.connections.delete(connectionId);
      
      // Remove from load subscriptions
      this.loadSubscriptions.forEach((drivers, loadId) => {
        drivers.delete(connectionId);
        if (drivers.size === 0) {
          this.loadSubscriptions.delete(loadId);
        }
      });
      
      console.log(`🚛 Driver ${connection.driverId} disconnected (${this.connections.size} active)`);
    }
  }
  
  // Send message to specific driver
  sendToDriver(driverId: string, message: any) {
    const connectionId = this.driverToConnection.get(driverId);
    if (connectionId) {
      const connection = this.connections.get(connectionId);
      if (connection && connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(JSON.stringify(message));
        return true;
      }
    }
    return false;
  }
  
  // Broadcast to all drivers in company
  broadcastToCompany(companyId: string, message: any) {
    const companyConnections = Array.from(this.connections.values())
      .filter(conn => conn.companyId === companyId);
    
    companyConnections.forEach(connection => {
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(JSON.stringify(message));
      }
    });
  }
  
  // Subscribe driver to load updates
  subscribeToLoad(driverId: string, loadId: string) {
    const connectionId = this.driverToConnection.get(driverId);
    if (connectionId) {
      if (!this.loadSubscriptions.has(loadId)) {
        this.loadSubscriptions.set(loadId, new Set());
      }
      this.loadSubscriptions.get(loadId)!.add(connectionId);
    }
  }
  
  // Broadcast load updates to subscribed drivers
  broadcastLoadUpdate(loadId: string, update: any) {
    const subscribedConnections = this.loadSubscriptions.get(loadId);
    if (subscribedConnections) {
      subscribedConnections.forEach(connectionId => {
        const connection = this.connections.get(connectionId);
        if (connection && connection.ws.readyState === WebSocket.OPEN) {
          connection.ws.send(JSON.stringify({
            type: 'load_update',
            loadId,
            update,
            timestamp: Date.now()
          }));
        }
      });
    }
  }
  
  // Update driver location
  async updateDriverLocation(driverId: string, location: { lat: number; lng: number }) {
    const connectionId = this.driverToConnection.get(driverId);
    if (connectionId) {
      const connection = this.connections.get(connectionId);
      if (connection) {
        connection.location = {
          ...location,
          timestamp: Date.now()
        };
        
        // Update database with latest location
        try {
          await db.update(drivers)
            .set({ 
              currentLocation: `${location.lat},${location.lng}`,
              lastLocationUpdate: new Date()
            })
            .where(eq(drivers.id, driverId));
        } catch (error) {
          console.error('Failed to update driver location:', error);
        }
        
        // Broadcast location to company dispatchers
        this.broadcastToCompany(connection.companyId, {
          type: 'driver_location_update',
          driverId,
          location,
          timestamp: Date.now()
        });
      }
    }
  }
  
  // Get active driver locations for company
  getCompanyDriverLocations(companyId: string) {
    return Array.from(this.connections.values())
      .filter(conn => conn.companyId === companyId && conn.location)
      .map(conn => ({
        driverId: conn.driverId,
        location: conn.location
      }));
  }
  
  // Health check - remove stale connections
  cleanup() {
    const now = Date.now();
    const staleConnections = Array.from(this.connections.values())
      .filter(conn => now - conn.lastPing > 60000); // 1 minute timeout
    
    staleConnections.forEach(conn => {
      this.removeConnection(conn.id);
    });
  }
  
  // Get connection statistics
  getStats() {
    return {
      totalConnections: this.connections.size,
      loadSubscriptions: this.loadSubscriptions.size,
      connectionsByCompany: Array.from(this.connections.values())
        .reduce((acc, conn) => {
          acc[conn.companyId] = (acc[conn.companyId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
    };
  }
}

export const driverRealtimeManager = new DriverRealtimeManager();

// Export the connections map for the driver-routes.ts to access
export const driverConnections = driverRealtimeManager;

// WebSocket message handlers
export const handleDriverMessage = async (connectionId: string, message: any) => {
  const connection = driverRealtimeManager.connections.get(connectionId);
  if (!connection) return;
  
  try {
    switch (message.type) {
      case 'ping':
        connection.lastPing = Date.now();
        connection.ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        break;
        
      case 'location_update':
        await driverRealtimeManager.updateDriverLocation(
          connection.driverId,
          message.location
        );
        break;
        
      case 'load_status_update':
        // Update load status and broadcast to dispatchers
        await updateLoadStatus(message.loadId, message.status, connection.companyId);
        driverRealtimeManager.broadcastLoadUpdate(message.loadId, {
          status: message.status,
          updatedBy: connection.driverId,
          timestamp: Date.now()
        });
        break;
        
      case 'subscribe_load':
        driverRealtimeManager.subscribeToLoad(connection.driverId, message.loadId);
        break;
        
      case 'emergency_alert':
        // Handle emergency situations
        driverRealtimeManager.broadcastToCompany(connection.companyId, {
          type: 'emergency_alert',
          driverId: connection.driverId,
          location: connection.location,
          message: message.message,
          timestamp: Date.now()
        });
        break;
    }
  } catch (error) {
    console.error('Driver message handling error:', error);
    connection.ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to process message',
      timestamp: Date.now()
    }));
  }
};

// Update load status in database
const updateLoadStatus = async (loadId: string, status: string, companyId: string) => {
  try {
    await db.update(loads)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(and(
        eq(loads.id, loadId),
        eq(loads.companyId, companyId)
      ));
  } catch (error) {
    console.error('Failed to update load status:', error);
  }
};

// Cleanup interval for stale connections
setInterval(() => {
  driverRealtimeManager.cleanup();
}, 30000); // Every 30 seconds