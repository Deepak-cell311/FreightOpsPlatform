import type { Express } from "express";
import { db } from "./db";
import { eq, and, desc, gte, lte, or } from "drizzle-orm";
import { drivers, loads, trucks, companies } from "@shared/schema";
import { cacheMiddleware } from "./scalability-middleware";
import { driverRealtimeManager } from "./driver-realtime";
import { extendDriverSession } from "./session-store";

// Driver-specific authentication middleware
const driverAuth = (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'driver') {
    return res.status(403).json({ error: 'Driver access required' });
  }
  
  // Extend session for driver app usage
  extendDriverSession(req);
  
  next();
};

// Driver-specific routes optimized for mobile app usage
export const registerDriverRoutes = (app: Express) => {
  
  // Driver profile and settings - cached for performance
  app.get("/api/driver/profile", driverAuth, cacheMiddleware(300), async (req: any, res) => {
    try {
      const driverId = req.user.id;
      const companyId = req.user.companyId;
      
      const driver = await db.select().from(drivers)
        .where(and(eq(drivers.id, driverId), eq(drivers.companyId, companyId)))
        .limit(1);
      
      if (!driver[0]) {
        return res.status(404).json({ error: 'Driver not found' });
      }
      
      res.json(driver[0]);
    } catch (error) {
      console.error('Driver profile error:', error);
      res.status(500).json({ error: 'Failed to get driver profile' });
    }
  });
  
  // Driver's current and assigned loads - real-time updates
  app.get("/api/driver/loads", driverAuth, async (req: any, res) => {
    try {
      const driverId = req.user.id;
      const companyId = req.user.companyId;
      
      // Get current and upcoming loads for driver
      const driverLoads = await db.select().from(loads)
        .where(and(
          eq(loads.companyId, companyId),
          eq(loads.driverId, driverId),
          or(
            eq(loads.status, 'assigned'),
            eq(loads.status, 'in_transit'),
            eq(loads.status, 'pickup_complete'),
            eq(loads.status, 'en_route')
          )
        ))
        .orderBy(desc(loads.createdAt));
      
      // Subscribe to load updates for real-time notifications
      driverLoads.forEach(load => {
        driverRealtimeManager.subscribeToLoad(driverId, load.id);
      });
      
      res.json(driverLoads);
    } catch (error) {
      console.error('Driver loads error:', error);
      res.status(500).json({ error: 'Failed to get driver loads' });
    }
  });
  
  // Update load status from driver app
  app.post("/api/driver/loads/:loadId/status", driverAuth, async (req: any, res) => {
    try {
      const loadId = req.params.loadId;
      const driverId = req.user.id;
      const companyId = req.user.companyId;
      const { status, notes, location } = req.body;
      
      // Verify driver has access to this load
      const load = await db.select().from(loads)
        .where(and(
          eq(loads.id, loadId),
          eq(loads.companyId, companyId),
          eq(loads.driverId, driverId)
        ))
        .limit(1);
      
      if (!load[0]) {
        return res.status(404).json({ error: 'Load not found or not assigned to driver' });
      }
      
      // Update load status
      await db.update(loads)
        .set({ 
          status,
          notes: notes || load[0].notes,
          updatedAt: new Date()
        })
        .where(eq(loads.id, loadId));
      
      // Broadcast update to dispatchers via WebSocket
      driverRealtimeManager.broadcastLoadUpdate(loadId, {
        status,
        notes,
        location,
        updatedBy: driverId,
        timestamp: Date.now()
      });
      
      res.json({ success: true, message: 'Load status updated' });
    } catch (error) {
      console.error('Load status update error:', error);
      res.status(500).json({ error: 'Failed to update load status' });
    }
  });
  
  // Driver location update - high frequency endpoint
  app.post("/api/driver/location", driverAuth, async (req: any, res) => {
    try {
      const driverId = req.user.id;
      const { lat, lng, speed, heading } = req.body;
      
      // Validate location data
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ error: 'Invalid location data' });
      }
      
      // Update location via real-time manager
      await driverRealtimeManager.updateDriverLocation(driverId, { lat, lng });
      
      res.json({ success: true, timestamp: Date.now() });
    } catch (error) {
      console.error('Location update error:', error);
      res.status(500).json({ error: 'Failed to update location' });
    }
  });
  
  // Driver's vehicle/truck information - cached
  app.get("/api/driver/vehicle", driverAuth, cacheMiddleware(600), async (req: any, res) => {
    try {
      const driverId = req.user.id;
      const companyId = req.user.companyId;
      
      // Get driver's assigned truck
      const truck = await db.select().from(trucks)
        .where(and(
          eq(trucks.companyId, companyId),
          eq(trucks.driverId, driverId),
          eq(trucks.isActive, true)
        ))
        .limit(1);
      
      if (!truck[0]) {
        return res.status(404).json({ error: 'No vehicle assigned' });
      }
      
      res.json(truck[0]);
    } catch (error) {
      console.error('Driver vehicle error:', error);
      res.status(500).json({ error: 'Failed to get vehicle information' });
    }
  });
  
  // Driver hours of service (HOS) - critical for DOT compliance
  app.get("/api/driver/hos", driverAuth, async (req: any, res) => {
    try {
      const driverId = req.user.id;
      const companyId = req.user.companyId;
      
      // Get driver's recent activity for HOS calculation
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const recentLoads = await db.select().from(loads)
        .where(and(
          eq(loads.companyId, companyId),
          eq(loads.driverId, driverId),
          gte(loads.createdAt, sevenDaysAgo)
        ))
        .orderBy(desc(loads.createdAt));
      
      // Calculate HOS (simplified - in production, use proper HOS service)
      const hosData = {
        driverId,
        currentStatus: 'off_duty',
        hoursRemaining: {
          drive: 11,
          shift: 14,
          cycle: 60
        },
        violations: [],
        lastReset: sevenDaysAgo.toISOString(),
        recentActivity: recentLoads.slice(0, 10)
      };
      
      res.json(hosData);
    } catch (error) {
      console.error('HOS error:', error);
      res.status(500).json({ error: 'Failed to get hours of service' });
    }
  });
  
  // Emergency alert endpoint for driver safety
  app.post("/api/driver/emergency", driverAuth, async (req: any, res) => {
    try {
      const driverId = req.user.id;
      const companyId = req.user.companyId;
      const { type, message, location } = req.body;
      
      // Broadcast emergency alert immediately
      driverRealtimeManager.broadcastToCompany(companyId, {
        type: 'emergency_alert',
        driverId,
        alertType: type,
        message,
        location,
        timestamp: Date.now(),
        severity: 'high'
      });
      
      // Log emergency in database
      // TODO: Add emergency_alerts table
      
      res.json({ success: true, message: 'Emergency alert sent' });
    } catch (error) {
      console.error('Emergency alert error:', error);
      res.status(500).json({ error: 'Failed to send emergency alert' });
    }
  });
  
  // Driver app health check
  app.get("/api/driver/health", driverAuth, (req: any, res) => {
    res.json({
      status: 'healthy',
      driverId: req.user.id,
      timestamp: Date.now(),
      version: '1.0.0'
    });
  });
  
  // Driver notifications - real-time updates
  app.get("/api/driver/notifications", driverAuth, async (req: any, res) => {
    try {
      const driverId = req.user.id;
      const companyId = req.user.companyId;
      
      // Get recent notifications for driver
      // TODO: Implement notifications table
      const notifications = [
        {
          id: '1',
          type: 'load_assignment',
          message: 'New load assigned',
          timestamp: Date.now(),
          read: false
        }
      ];
      
      res.json(notifications);
    } catch (error) {
      console.error('Notifications error:', error);
      res.status(500).json({ error: 'Failed to get notifications' });
    }
  });
  
  // Driver app settings sync
  app.get("/api/driver/settings", driverAuth, cacheMiddleware(1800), async (req: any, res) => {
    try {
      const driverId = req.user.id;
      const companyId = req.user.companyId;
      
      // Get company settings that affect driver app
      const company = await db.select().from(companies)
        .where(eq(companies.id, companyId))
        .limit(1);
      
      if (!company[0]) {
        return res.status(404).json({ error: 'Company not found' });
      }
      
      const settings = {
        companyName: company[0].name,
        locationUpdateInterval: 30, // seconds
        enableHOS: true,
        enableElogs: true,
        enableGeofencing: true,
        emergencyContacts: [
          { name: 'Dispatch', phone: company[0].phone }
        ]
      };
      
      res.json(settings);
    } catch (error) {
      console.error('Driver settings error:', error);
      res.status(500).json({ error: 'Failed to get driver settings' });
    }
  });
  
  console.log('✓ Driver routes registered for mobile app support');
};