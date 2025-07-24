import { Express, Request, Response, NextFunction } from 'express';

/**
 * ULTIMATE VITE API BYPASS SOLUTION
 * Research shows Vite's connect middleware intercepts all requests.
 * This implements complete request termination for API routes.
 */
export function implementUltimateViteFix(app: Express) {
  // Step 1: Early request marking and response override
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.url.startsWith('/api/') || req.url.startsWith('/hq/api/')) {
      // Mark as API request
      (req as any).isAPIRequest = true;
      
      // Override ALL response methods immediately
      const originalJson = res.json;
      const originalSend = res.send;
      const originalEnd = res.end;
      
      // Force JSON response and immediate termination
      res.json = function(obj: any) {
        if (!this.headersSent) {
          this.setHeader('Content-Type', 'application/json');
          this.statusCode = this.statusCode || 200;
          const data = JSON.stringify(obj);
          
          // Write and end immediately - bypass all middleware
          this.write(data);
          this.end();
        }
        return this;
      };
      
      // Override send for object responses
      res.send = function(body: any) {
        if (typeof body === 'object' && body !== null) {
          return this.json(body);
        }
        return originalSend.call(this, body);
      };
      
      // Set API headers immediately
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('X-API-Handler', 'express-direct');
    }
    next();
  });
  
  // Step 2: API request termination barrier
  app.use((req: Request, res: Response, next: NextFunction) => {
    if ((req as any).isAPIRequest) {
      // If API request reaches this point without being handled, terminate
      if (!res.headersSent) {
        res.status(404).json({ error: 'API endpoint not found' });
        return; // Do not call next() - terminate here
      }
    }
    next();
  });
  
  return app;
}

/**
 * Pre-Vite request interceptor that completely blocks API requests from reaching Vite
 */
export function createAPIRequestBlocker() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Block API requests from going to Vite entirely
    if (req.url.startsWith('/api/') || req.url.startsWith('/hq/api/')) {
      // If headers not sent, API route wasn't handled - return error
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'API route not properly handled',
          url: req.url,
          method: req.method 
        });
        return; // Stop processing here
      }
    }
    next();
  };
}