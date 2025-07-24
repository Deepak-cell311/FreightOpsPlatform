import type { Express, Request, Response, NextFunction } from "express";

/**
 * CRITICAL FIX: DO NOT REMOVE OR MODIFY
 * This middleware prevents Vite from intercepting API routes in development mode.
 * Without this, all API calls return HTML instead of JSON, breaking authentication
 * and all frontend functionality.
 * 
 * Issue: Vite middleware catches API requests before Express can handle them
 * Solution: Mark API routes and prevent Vite interception
 */
export function createAPIRouteGuard() {
  return (req: Request, res: Response, next: NextFunction) => {
    // If this is an API route, ensure it gets handled by Express
    if (req.path.startsWith('/api/') || req.path.startsWith('/hq/api/')) {
      // CRITICAL: Mark this request as handled by API
      (req as any).isAPIRoute = true;
      
      // Force early response completion to prevent Vite interception
      const originalEnd = res.end;
      const originalSend = res.send;
      const originalJson = res.json;
      
      // Override json method
      res.json = function(obj?: any) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('X-API-Route', 'true');
        
        // Force immediate response to prevent Vite interception
        const jsonString = JSON.stringify(obj);
        res.setHeader('Content-Length', Buffer.byteLength(jsonString));
        originalEnd.call(this, jsonString);
        return this;
      };
      
      // Override send method
      res.send = function(body?: any) {
        res.setHeader('X-API-Route', 'true');
        
        if (typeof body === 'object' && body !== null) {
          res.setHeader('Content-Type', 'application/json');
          const jsonString = JSON.stringify(body);
          res.setHeader('Content-Length', Buffer.byteLength(jsonString));
          originalEnd.call(this, jsonString);
        } else {
          originalSend.call(this, body);
        }
        return this;
      };
    }
    next();
  };
}

// Middleware to bypass Vite for completed API responses
export function createViteBypass() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip Vite processing for API routes that have been handled
    if (res.locals.isAPIRoute && res.headersSent) {
      return;
    }
    next();
  };
}