import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import compression from "compression";
import { registerRoutes } from "./routes";
import hqLoginRouter from "./hq-login";
import { setupVite, serveStatic, log } from "./vite";
import { 
  rateLimitMiddleware, 
  connectionMonitorMiddleware, 
  performanceMiddleware,
  driverAppMiddleware,
  healthCheckHandler,
  gracefulShutdown
} from "./scalability-middleware";
import { sessionConfig } from "./session-store";
import path from "path";

const app = express();

// CRITICAL API PROTECTION - MUST BE FIRST MIDDLEWARE
app.use((req, res, next) => {
  if (req.url.startsWith('/api/')) {
    // Force JSON response for all API routes
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    
    // Override res.send to ensure JSON
    const originalSend = res.send;
    res.send = function(data) {
      if (typeof data === 'object') {
        return originalSend.call(this, JSON.stringify(data));
      }
      return originalSend.call(this, data);
    };
  }
  next();
});

console.log("🚀 STARTING CLEAN SERVER - ENFORCING LOGIN");

// CORS middleware - MUST be first
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-API-Route');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Simple API middleware for JSON responses
app.use((req, res, next) => {
  if (req.url.startsWith('/api/') || req.url.startsWith('/hq/api/') || req.url.startsWith('/hq/login')) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-API-Route', 'true');
    res.setHeader('Cache-Control', 'no-cache');
  }
  next();
});

// Scalability middleware stack
app.use(compression()); // Response compression for better performance
app.use(express.json({ limit: '10mb' })); // Increased limit for driver app data
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

// Performance and security middleware
app.use(rateLimitMiddleware);
app.use(connectionMonitorMiddleware);
app.use(performanceMiddleware);
app.use(driverAppMiddleware);

// High-performance session configuration
app.use(session(sessionConfig));

// Sessions now managed by PostgreSQL - no file restoration needed
console.log('✓ Session store configured with PostgreSQL');

// Force clean session start - no session restoration
console.log('✓ Starting with clean session store - login required');

// Clear all existing sessions on server restart to force re-authentication
import { sessionStore } from './session-store';
// Use SQL to clear sessions since connect-pg-simple doesn't have clear method
import { pool } from './db';
pool.query('DELETE FROM session', (err) => {
  if (err) {
    console.error('Error clearing sessions:', err);
  } else {
    console.log('✓ All existing sessions cleared - users must log in again');
  }
});

// Session middleware is already configured above - no duplicate needed

// Session authentication is handled in routes.ts middleware

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// This middleware needs to be after routes are registered

(async () => {
  // CRITICAL: Register API routes BEFORE Vite middleware
  console.log("🚀 REGISTERING ROUTES");
  app.use('/', hqLoginRouter);
  const server = await registerRoutes(app);

  // Block vulnerable admin routes for security
  app.use('/admin*', (req, res) => {
    res.status(403).json({ 
      message: "Access Denied - Use /hq/auth for admin access",
      redirectTo: "/hq/auth"
    });
  });

  // COMPLETE API ROUTE BYPASS: Block Vite middleware completely
  app.use((req, res, next) => {
    if (req.url.startsWith('/api/') || req.url.startsWith('/hq/api/')) {
      // Force JSON response and bypass all Vite processing
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('X-API-Bypass', 'true');
      res.setHeader('Cache-Control', 'no-cache');
      
      // Override any potential HTML responses
      const originalSend = res.send;
      res.send = function(data) {
        if (typeof data === 'object' && data !== null) {
          res.setHeader('Content-Type', 'application/json');
          return originalSend.call(this, JSON.stringify(data));
        }
        return originalSend.call(this, data);
      };
      
      // Mark as API route for complete Vite bypass
      (req as any).bypassVite = true;
      (req as any).isAPIRoute = true;
    }
    next();
  });

  // Create a separate Express instance for non-API routes to completely isolate API handling
  const frontendApp = express();
  
  // Setup Vite or static serving only for frontend routes
  if (app.get("env") === "development") {
    await setupVite(frontendApp, server);
  } else {
    serveStatic(frontendApp);
  }
  
  // Use frontend app only for non-API routes
  app.use((req, res, next) => {
    if (req.url.startsWith('/api/') || req.url.startsWith('/hq/api/')) {
      // API routes already handled above, skip frontend processing
      return next();
    }
    // Forward to frontend app for all other routes
    frontendApp(req, res, next);
  });

  // Global error handler for non-API routes
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Start server only if not in Vercel environment
  if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });
  }
})();

export { app };
