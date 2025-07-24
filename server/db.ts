import "dotenv/config";
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Use the existing working database connection for now
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Production-optimized connection pool configuration
export const pool = new Pool({ 
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('neon') || databaseUrl.includes('supabase') ? { rejectUnauthorized: false } : undefined,
  // Optimized for stability and performance
  max: 20, // Reduced max connections to prevent overwhelming Neon
  min: 2,  // Minimum connections to maintain
  idleTimeoutMillis: 60000, // 60 seconds idle timeout (increased)
  connectionTimeoutMillis: 10000, // 10 second connection timeout (increased)
  query_timeout: 30000, // 30 second query timeout (increased)
  statement_timeout: 30000, // 30 second statement timeout (increased)
  // Add retry logic for connection failures
  acquireTimeoutMillis: 30000, // 30 seconds to acquire connection
  createTimeoutMillis: 30000, // 30 seconds to create connection
  destroyTimeoutMillis: 5000, // 5 seconds to destroy connection
  // Prevent connection drops
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
});

// High-performance Drizzle configuration with query optimization
export const db = drizzle(pool, { 
  schema,
  logger: process.env.NODE_ENV === 'development' ? true : false, // Query logging only in dev
  casing: 'snake_case' // Optimize column naming
});

// Connection pool monitoring for scalability
pool.on('connect', () => {
  console.log('✓ Database connection established');
});

pool.on('error', (err) => {
  console.error('✗ Database connection error:', err);
});

// Graceful shutdown handler
process.on('SIGINT', async () => {
  console.log('🔄 Closing database connections...');
  await pool.end();
  process.exit(0);
});

// Connection pool health monitoring
export const getPoolStats = () => ({
  totalConnections: pool.totalCount,
  idleConnections: pool.idleCount,
  waitingClients: pool.waitingCount
});