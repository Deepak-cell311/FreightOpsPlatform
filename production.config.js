/**
 * Production Configuration for FreightOps Pro - Vercel Deployment
 * Environment-specific settings for safe production deployment
 */

const productionConfig = {
  // Database Configuration
  database: {
    maxConnections: 10,
    connectionTimeout: 30000,
    idleTimeout: 600000,
    ssl: process.env.NODE_ENV === 'production'
  },

  // Server Configuration
  server: {
    port: process.env.PORT || 80,
    host: '0.0.0.0',
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
      credentials: true
    }
  },

  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
  },

  // External Services
  services: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      publicKey: process.env.VITE_STRIPE_PUBLIC_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4o'
    },
    gusto: {
      clientId: process.env.GUSTO_CLIENT_ID,
      clientSecret: process.env.GUSTO_CLIENT_SECRET,
      redirectUri: process.env.GUSTO_REDIRECT_URI
    }
  },

  // Performance Settings
  performance: {
    enableCompression: true,
    enableCaching: true,
    staticMaxAge: 31536000, // 1 year
    apiCacheMaxAge: 0 // No cache for API
  },

  // Security Settings
  security: {
    enableHelmet: true,
    enableRateLimit: true,
    maxRequestsPerMinute: 100,
    trustedProxies: ['127.0.0.1', '::1']
  }
};

function validateConfig() {
  const required = [
    'DATABASE_URL',
    'SESSION_SECRET',
    'STRIPE_SECRET_KEY',
    'OPENAI_API_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return true;
}

export { productionConfig, validateConfig };