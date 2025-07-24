/**
 * Feature Flag Configuration
 * Enables safe deployment of new features with instant rollback capability
 */

export interface FeatureFlags {
  // Navigation and UI Features
  ENHANCED_NAVIGATION: boolean;
  NEW_DASHBOARD_LAYOUT: boolean;
  ADVANCED_FLEET_MANAGEMENT: boolean;
  
  // Dispatch Features
  AI_ROUTE_OPTIMIZATION: boolean;
  REAL_TIME_TRACKING: boolean;
  LOAD_BOARD_V2: boolean;
  
  // Financial Features
  ADVANCED_ACCOUNTING: boolean;
  AUTOMATED_BILLING: boolean;
  PAYMENT_PROCESSING_V2: boolean;
  
  // Banking Integration
  RAILSR_BANKING_LIVE: boolean;
  STRIPE_CONNECT_PAYMENTS: boolean;
  ACH_TRANSFERS: boolean;
  
  // Enterprise Features
  MULTI_TENANT_SUPPORT: boolean;
  CUSTOM_DOMAIN_SUPPORT: boolean;
  WHITE_LABEL_BRANDING: boolean;
  
  // AI and Analytics
  AI_FINANCIAL_INSIGHTS: boolean;
  PREDICTIVE_MAINTENANCE: boolean;
  COMPLIANCE_MONITORING: boolean;
  
  // Experimental Features
  MOBILE_APP_INTEGRATION: boolean;
  API_V2_ENDPOINTS: boolean;
  WEBHOOK_NOTIFICATIONS: boolean;
}

/**
 * Get feature flags based on environment
 */
export function getFeatureFlags(): FeatureFlags {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isStaging = process.env.NODE_ENV === 'staging';

  // Production: Only stable, tested features
  if (isProduction) {
    return {
      // Stable Navigation Features (already tested)
      ENHANCED_NAVIGATION: true,
      NEW_DASHBOARD_LAYOUT: true,
      ADVANCED_FLEET_MANAGEMENT: true,
      
      // Dispatch Features (core functionality)
      AI_ROUTE_OPTIMIZATION: false, // Keep disabled until fully tested
      REAL_TIME_TRACKING: true,
      LOAD_BOARD_V2: true,
      
      // Financial Features (critical for business)
      ADVANCED_ACCOUNTING: true,
      AUTOMATED_BILLING: true,
      PAYMENT_PROCESSING_V2: false, // Keep legacy payment processing
      
      // Banking Integration (use only if API keys configured)
      RAILSR_BANKING_LIVE: process.env.RAILSR_PRIVATE_KEY ? true : false,
      STRIPE_CONNECT_PAYMENTS: process.env.STRIPE_SECRET_KEY ? true : false,
      ACH_TRANSFERS: false, // Disable until compliance verified
      
      // Enterprise Features
      MULTI_TENANT_SUPPORT: true,
      CUSTOM_DOMAIN_SUPPORT: false, // Manual setup required
      WHITE_LABEL_BRANDING: false,
      
      // AI and Analytics (gradual rollout)
      AI_FINANCIAL_INSIGHTS: false,
      PREDICTIVE_MAINTENANCE: false,
      COMPLIANCE_MONITORING: true,
      
      // Experimental Features (disabled in production)
      MOBILE_APP_INTEGRATION: false,
      API_V2_ENDPOINTS: false,
      WEBHOOK_NOTIFICATIONS: false,
    };
  }

  // Staging: Testing production-ready features
  if (isStaging) {
    return {
      ENHANCED_NAVIGATION: true,
      NEW_DASHBOARD_LAYOUT: true,
      ADVANCED_FLEET_MANAGEMENT: true,
      
      AI_ROUTE_OPTIMIZATION: true, // Test before production
      REAL_TIME_TRACKING: true,
      LOAD_BOARD_V2: true,
      
      ADVANCED_ACCOUNTING: true,
      AUTOMATED_BILLING: true,
      PAYMENT_PROCESSING_V2: true, // Test new payment system
      
      RAILSR_BANKING_LIVE: true,
      STRIPE_CONNECT_PAYMENTS: true,
      ACH_TRANSFERS: true, // Test ACH functionality
      
      MULTI_TENANT_SUPPORT: true,
      CUSTOM_DOMAIN_SUPPORT: true, // Test custom domains
      WHITE_LABEL_BRANDING: true,
      
      AI_FINANCIAL_INSIGHTS: true, // Test AI features
      PREDICTIVE_MAINTENANCE: true,
      COMPLIANCE_MONITORING: true,
      
      MOBILE_APP_INTEGRATION: true, // Test mobile integration
      API_V2_ENDPOINTS: true,
      WEBHOOK_NOTIFICATIONS: true,
    };
  }

  // Development: All features enabled for testing
  return {
    ENHANCED_NAVIGATION: true,
    NEW_DASHBOARD_LAYOUT: true,
    ADVANCED_FLEET_MANAGEMENT: true,
    
    AI_ROUTE_OPTIMIZATION: true,
    REAL_TIME_TRACKING: true,
    LOAD_BOARD_V2: true,
    
    ADVANCED_ACCOUNTING: true,
    AUTOMATED_BILLING: true,
    PAYMENT_PROCESSING_V2: true,
    
    RAILSR_BANKING_LIVE: true,
    STRIPE_CONNECT_PAYMENTS: true,
    ACH_TRANSFERS: true,
    
    MULTI_TENANT_SUPPORT: true,
    CUSTOM_DOMAIN_SUPPORT: true,
    WHITE_LABEL_BRANDING: true,
    
    AI_FINANCIAL_INSIGHTS: true,
    PREDICTIVE_MAINTENANCE: true,
    COMPLIANCE_MONITORING: true,
    
    MOBILE_APP_INTEGRATION: true,
    API_V2_ENDPOINTS: true,
    WEBHOOK_NOTIFICATIONS: true,
  };
}

/**
 * Hook for accessing feature flags in React components
 */
export function useFeatureFlags(): FeatureFlags {
  return getFeatureFlags();
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[feature];
}

/**
 * Environment-specific overrides via environment variables
 * Format: FEATURE_[FEATURE_NAME]=true/false
 */
export function getEnvironmentOverrides(): Partial<FeatureFlags> {
  const overrides: Partial<FeatureFlags> = {};
  
  // Check for environment variable overrides
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('FEATURE_')) {
      const featureName = key.replace('FEATURE_', '') as keyof FeatureFlags;
      const value = process.env[key]?.toLowerCase() === 'true';
      overrides[featureName] = value;
    }
  });
  
  return overrides;
}

/**
 * Get final feature flags with environment overrides applied
 */
export function getFinalFeatureFlags(): FeatureFlags {
  const baseFlags = getFeatureFlags();
  const overrides = getEnvironmentOverrides();
  
  return {
    ...baseFlags,
    ...overrides,
  };
}