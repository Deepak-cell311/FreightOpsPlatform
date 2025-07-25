import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import { registerConsolidatedRoutes } from "./consolidated-routes";

/**
 * Dedicated API server to completely bypass Vite middleware interference
 * This ensures all API routes return proper JSON responses
 */
export async function createAPIServer() {
  const apiApp = express();

  // Basic middleware for API handling
  apiApp.use(express.json());
  apiApp.use(express.urlencoded({ extended: false }));
  apiApp.use(cookieParser());

  // Session middleware
  // apiApp.use(session({
  //   secret: process.env.SESSION_SECRET || 'your-secret-key',
  //   resave: false,
  //   saveUninitialized: false,
  //   cookie: {
  //     secure: false,
  //     httpOnly: true,
  //     maxAge: 24 * 60 * 60 * 1000
  //   }
  // }));

  // Force JSON responses for all routes
  apiApp.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    
    // Override response methods to ensure JSON
    const originalJson = res.json;
    res.json = function(obj) {
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'application/json');
        return originalJson.call(this, obj);
      }
      return this;
    };
    
    next();
  });

  // Register all API routes
  await registerConsolidatedRoutes(apiApp);

  return apiApp;
}