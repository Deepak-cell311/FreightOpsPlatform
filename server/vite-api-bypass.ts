import { ViteDevServer } from 'vite';
import { Express } from 'express';

/**
 * DEFINITIVE VITE API BYPASS SOLUTION
 * Based on extensive research of Vite + Express integration patterns
 * This approach modifies Vite's middleware stack to exclude API routes
 */
export function createViteAPIBypass(app: Express, vite: ViteDevServer) {
  // Store original middleware stack
  const originalMiddlewares = vite.middlewares.stack;
  
  // Create new middleware stack that excludes API routes
  vite.middlewares.stack = originalMiddlewares.map((middleware) => {
    const originalHandle = middleware.handle;
    
    // Wrap each Vite middleware to skip API routes
    middleware.handle = function(req: any, res: any, next: any) {
      // Skip Vite processing for API routes
      if (req.url?.startsWith('/api/') || req.url?.startsWith('/hq/api/')) {
        return next();
      }
      
      // Call original Vite middleware for non-API routes
      return originalHandle.call(this, req, res, next);
    };
    
    return middleware;
  });
  
  return vite;
}

/**
 * Alternative approach: Custom connect middleware that intercepts before Vite
 */
export function createPreViteAPIHandler(app: Express) {
  return (req: any, res: any, next: any) => {
    // Mark API requests and ensure JSON response
    if (req.url?.startsWith('/api/') || req.url?.startsWith('/hq/api/')) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('X-Vite-Bypass', 'true');
      
      // Override end method to prevent Vite interference
      const originalEnd = res.end;
      res.end = function(chunk?: any, encoding?: any) {
        // Ensure proper JSON content type
        if (!this.headersSent) {
          this.setHeader('Content-Type', 'application/json');
        }
        return originalEnd.call(this, chunk, encoding);
      };
    }
    next();
  };
}