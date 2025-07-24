import { WebSocketServer, WebSocket } from 'ws';
import { createServer, type Server } from 'http';
import type { Express } from 'express';
import { driverRealtimeManager, handleDriverMessage } from './driver-realtime';
import { verifyToken } from './auth-utils';

// High-performance WebSocket server for real-time driver communication
export const setupWebSocketServer = (app: Express): Server => {
  const httpServer = createServer(app);
  
  // WebSocket server on dedicated path to avoid conflicts with Vite HMR
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    // Performance optimizations
    maxPayload: 1024 * 1024, // 1MB max message size
    compression: true,
    perMessageDeflate: {
      threshold: 1024, // Compress messages larger than 1KB
      concurrencyLimit: 10,
      memLevel: 7
    }
  });
  
  console.log('✓ WebSocket server initialized for driver real-time communication');
  
  // WebSocket connection handler
  wss.on('connection', async (ws: WebSocket, req) => {
    console.log('📱 New WebSocket connection attempt');
    
    let connectionId: string | null = null;
    let driverId: string | null = null;
    let companyId: string | null = null;
    
    // Authentication for WebSocket connections
    try {
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const token = url.searchParams.get('token') || 
                   req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        ws.close(1008, 'Authentication token required');
        return;
      }
      
      // Verify token and get user info
      const user = await verifyToken(token);
      if (!user) {
        ws.close(1008, 'Invalid authentication token');
        return;
      }
      
      driverId = user.id;
      companyId = user.companyId;
      
      // Register driver connection
      connectionId = driverRealtimeManager.addConnection(ws, driverId, companyId);
      
    } catch (error) {
      console.error('WebSocket authentication error:', error);
      ws.close(1008, 'Authentication failed');
      return;
    }
    
    // Message handler
    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (connectionId) {
          await handleDriverMessage(connectionId, message);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format',
          timestamp: Date.now()
        }));
      }
    });
    
    // Ping/pong for connection health
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 30000); // Ping every 30 seconds
    
    ws.on('pong', () => {
      // Update last ping time
      if (connectionId && driverId) {
        const connection = driverRealtimeManager.connections.get(connectionId);
        if (connection) {
          connection.lastPing = Date.now();
        }
      }
    });
    
    // Connection cleanup
    ws.on('close', () => {
      clearInterval(pingInterval);
      if (connectionId) {
        driverRealtimeManager.removeConnection(connectionId);
      }
      console.log(`📱 WebSocket connection closed for driver ${driverId}`);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clearInterval(pingInterval);
      if (connectionId) {
        driverRealtimeManager.removeConnection(connectionId);
      }
    });
  });
  
  // WebSocket server statistics endpoint
  app.get('/api/websocket/stats', (req, res) => {
    const stats = {
      connectedClients: wss.clients.size,
      driverConnections: driverRealtimeManager.getStats(),
      timestamp: Date.now()
    };
    res.json(stats);
  });
  
  return httpServer;
};

// Token verification utility
const verifyToken = async (token: string): Promise<any> => {
  // TODO: Implement proper JWT token verification
  // For now, return mock user for testing
  return {
    id: 'driver-001',
    companyId: 'company-1',
    role: 'driver'
  };
};