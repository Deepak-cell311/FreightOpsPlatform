import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { pool } from './db';

// PostgreSQL session store for scalability
const PgSession = connectPgSimple(session);

// High-performance session configuration for 1000+ users
export const sessionStore = new PgSession({
  pool: pool,
  tableName: 'session',
  createTableIfMissing: true,
  // Scalability optimizations
  ttl: 2 * 60 * 60, // 2 hours session TTL
  disableTouch: false, // Enable session updates
  // Performance settings
  pruneSessionInterval: 60 * 15, // Clean expired sessions every 15 minutes
  errorLog: (error) => {
    console.error('Session store error:', error);
  }
});

// Session middleware configuration optimized for driver apps
export const sessionConfig = {
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'freightops-scalable-secret-2025',
  resave: false,
  saveUninitialized: false,
  name: 'freightops.sid',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 2 * 60 * 60 * 1000, // 2 hours
    sameSite: 'lax' as const
  },
  // Performance optimizations
  rolling: true, // Reset expiry on activity
  unset: 'destroy' // Clean up on logout
};

// Driver app session extension for longer sessions
export const extendDriverSession = (req: any) => {
  if (req.session && req.user?.role === 'driver') {
    // Extend driver sessions to 8 hours for mobile app usage
    req.session.cookie.maxAge = 8 * 60 * 60 * 1000;
  }
};

// Session cleanup utility
export const cleanupSessions = async () => {
  try {
    const result = await pool.query(`
      DELETE FROM session 
      WHERE expire < NOW()
    `);
    console.log(`🧹 Cleaned ${result.rowCount} expired sessions`);
  } catch (error) {
    console.error('Session cleanup error:', error);
  }
};

// Initialize session cleanup interval
setInterval(cleanupSessions, 15 * 60 * 1000); // Every 15 minutes