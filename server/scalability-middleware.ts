import { RequestHandler } from 'express';
import { createHash } from 'crypto';
import { getPoolStats } from './db';

// Redis-like in-memory cache for high-performance caching
class PerformanceCache {
  private cache = new Map<string, { data: any; expiry: number }>();
  private maxSize = 10000; // Maximum cache entries
  
  set(key: string, data: any, ttlSeconds: number = 300) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      data,
      expiry: Date.now() + (ttlSeconds * 1000)
    });
  }
  
  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  clear() {
    this.cache.clear();
  }
  
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize
    };
  }
}

export const performanceCache = new PerformanceCache();

// Rate limiting for driver app endpoints
class RateLimiter {
  private requests = new Map<string, number[]>();
  private readonly windowMs = 60000; // 1 minute window
  private readonly maxRequests = 1000; // Increased to 1000 requests per minute per IP for development
  
  isAllowed(ip: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Clean old requests
    let userRequests = this.requests.get(ip) || [];
    userRequests = userRequests.filter(time => time > windowStart);
    
    // Check if under limit
    if (userRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    userRequests.push(now);
    this.requests.set(ip, userRequests);
    
    return true;
  }
}

export const rateLimiter = new RateLimiter();

// High-performance caching middleware
export const cacheMiddleware = (ttlSeconds: number = 300): RequestHandler => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') return next();
    
    // Skip caching for authenticated user-specific data
    if (req.path.includes('/user') || req.path.includes('/profile')) {
      return next();
    }
    
    const cacheKey = createHash('md5')
      .update(`${req.path}:${JSON.stringify(req.query)}:${req.user?.companyId || 'public'}`)
      .digest('hex');
    
    const cached = performanceCache.get(cacheKey);
    if (cached) {
      if (!res.headersSent) {
        res.setHeader('X-Cache', 'HIT');
      }
      return res.json(cached);
    }
    
    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data) {
      if (!res.headersSent) {
        res.setHeader('X-Cache', 'MISS');
      }
      performanceCache.set(cacheKey, data, ttlSeconds);
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Rate limiting middleware for driver app protection
export const rateLimitMiddleware: RequestHandler = (req, res, next) => {
  // Skip rate limiting for development and Vite resources
  if (process.env.NODE_ENV === 'development' || 
      req.path.startsWith('/@vite/') || 
      req.path.startsWith('/src/') ||
      req.path.startsWith('/@fs/') ||
      req.path.includes('.js') ||
      req.path.includes('.css') ||
      req.path.includes('.tsx') ||
      req.path.includes('.ts') ||
      req.path.startsWith('/health') ||
      req.path.startsWith('/api/websocket/stats')) {
    return next();
  }
  
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  
  if (!rateLimiter.isAllowed(clientIp)) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests from this IP address'
    });
  }
  
  next();
};

// Database connection monitoring middleware
export const connectionMonitorMiddleware: RequestHandler = (req, res, next) => {
  const stats = getPoolStats();
  
  // Warning if connection pool is getting full
  if (stats.totalConnections > 40) {
    console.warn(`⚠️  High database connection usage: ${stats.totalConnections}/50`);
  }
  
  // Block requests if no connections available
  if (stats.waitingClients > 10) {
    return res.status(503).json({
      error: 'Service temporarily unavailable',
      message: 'Database connection pool exhausted'
    });
  }
  
  next();
};

// Performance monitoring middleware
export const performanceMiddleware: RequestHandler = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log slow queries for optimization
    if (duration > 1000) {
      console.warn(`🐌 Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
    
    // Don't set headers after response is sent
    try {
      if (!res.headersSent) {
        res.setHeader('X-Response-Time', `${duration}ms`);
      }
    } catch (error) {
      // Headers already sent, ignore
    }
  });
  
  next();
};

// Driver app specific middleware for real-time updates
export const driverAppMiddleware: RequestHandler = (req, res, next) => {
  // Identify driver app requests
  const userAgent = req.get('User-Agent') || '';
  const isDriverApp = userAgent.includes('FreightOps-Driver') || 
                     req.headers['x-app-type'] === 'driver' ||
                     req.path.startsWith('/api/driver/');
  
  if (isDriverApp) {
    // Set headers only if not already sent
    try {
      if (!res.headersSent) {
        // Lower cache TTL for driver app data (more real-time)
        res.setHeader('Cache-Control', 'no-cache, max-age=30');
        
        // Priority handling for driver requests
        res.setHeader('X-Priority', 'driver-app');
        
        // Enable real-time headers
        res.setHeader('X-Real-Time', 'enabled');
      }
    } catch (error) {
      // Headers already sent, ignore
    }
  }
  
  next();
};

// Health check endpoint for load balancer
export const healthCheckHandler: RequestHandler = (req, res) => {
  const dbStats = getPoolStats();
  const cacheStats = performanceCache.getStats();
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: {
      connections: dbStats.totalConnections,
      idle: dbStats.idleConnections,
      waiting: dbStats.waitingClients
    },
    cache: cacheStats,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    }
  };
  
  // Return 503 if system is under stress
  if (dbStats.waitingClients > 5 || dbStats.totalConnections > 45) {
    health.status = 'degraded';
    return res.status(503).json(health);
  }
  
  res.json(health);
};

// Graceful shutdown handler
export const gracefulShutdown = () => {
  console.log('🔄 Initiating graceful shutdown...');
  
  // Clear caches
  performanceCache.clear();
  
  // Close database connections handled in db.ts
  
  console.log('✅ Graceful shutdown completed');
};