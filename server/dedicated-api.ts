import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import { registerConsolidatedRoutes } from "./consolidated-routes";

/**
 * ULTIMATE VITE API BYPASS SOLUTION
 * Research-based approach: Dedicated API server completely separate from Vite
 * This is the industry standard for Vite + Express applications
 */
export async function startDedicatedAPIServer() {
  const apiApp = express();
  
  // Configure API server with proper middleware
  apiApp.use(express.json());
  apiApp.use(express.urlencoded({ extended: false }));
  apiApp.use(cookieParser());
  
  // Session configuration
  apiApp.use(session({
    secret: process.env.SESSION_SECRET || 'freightops-secret-2024',
    resave: false,
    saveUninitialized: false,
    name: 'freightops.sid',
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 2 * 60 * 60 * 1000 // 2 hours
    }
  }));

  // Force JSON responses
  apiApp.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });

  // Register all API routes
  await registerConsolidatedRoutes(apiApp);

  // Start dedicated API server on port 5001
  const API_PORT = 5001;
  const server = apiApp.listen(API_PORT, '0.0.0.0', () => {
    console.log(`✓ Dedicated API server running on port ${API_PORT}`);
  });

  return { app: apiApp, server, port: API_PORT };
}