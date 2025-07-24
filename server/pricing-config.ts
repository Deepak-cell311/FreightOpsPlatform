// FreightOps Pro - Motor Carrier Pricing Configuration
// Updated pricing based on user requirements - focus exclusively on motor carriers

export const SUBSCRIPTION_TIER_PRICING = {
  starter: {
    name: "Starter",
    monthlyFee: 99,
    yearlyFee: 999, // 17% savings
    trialDays: 30,
    includedDrivers: 5,
    extraDriverFee: 10, // Per additional driver beyond 5
    description: "Essential trucking management for small carriers (up to 5 drivers)",
    trialFeatures: "Full access to all features during 30-day trial",
    features: {
      drivers: 5,
      vehicles: "unlimited",
      loads: "unlimited", 
      dispatch: "full",
      fleetManagement: true,
      driverManagement: true,
      payroll: true, // via Wallet integration
      billing: true,
      invoicing: true,
      onboarding: true,
      hrTools: true,
      reporting: true,
      metrics: true,
      quickbooks: true,
      eld: true,
      banking: true, // via API
      support: "support_panel"
    }
  },
  pro: {
    name: "Pro", 
    monthlyFee: 199,
    yearlyFee: 1999, // 17% savings
    trialDays: 30,
    includedDrivers: 15,
    extraDriverFee: 8, // Per additional driver beyond 15
    description: "Complete trucking operations for growing carriers (up to 15 drivers, $8 per additional driver)",
    trialFeatures: "Full access to all premium features during 30-day trial",
    features: {
      drivers: 15,
      vehicles: "unlimited",
      loads: "unlimited",
      dispatch: "advanced",
      fleetManagement: true,
      maintenance: true,
      driverManagement: true,
      payroll: true, // via Wallet integration
      billing: true,
      invoicing: true,
      onboarding: true,
      hrTools: true,
      reporting: "advanced",
      metrics: "advanced",
      quickbooks: true,
      eld: true,
      banking: true, // via API
      support: "support_panel",
      multiLocation: true,
      advancedIntegrations: true
    }
  }
};

// AI Features Pricing Configuration - Optimized Pricing
export const AI_FEATURE_PRICING = {
  ai_bundle: {
    name: "AI Operations Bundle",
    description: "Complete AI suite: Logbook auditing, accountant analysis, predictive maintenance & route optimization",
    monthlyFee: 39.00, // Optimized for competitive margins
    yearlyFee: 390.00, // 17% savings
    features: [
      "AI Logbook Auditing",
      "AI Accountant Analysis", 
      "Predictive Maintenance",
      "Route Optimization"
    ],
    usageLimits: {
      logbook_audits: 100,
      accountant_reports: 50,
      maintenance_predictions: 200,
      route_optimizations: 500
    },
    overageFees: {
      logbook_audits: 0.25,
      accountant_reports: 0.50,
      maintenance_predictions: 0.15,
      route_optimizations: 0.10
    },
    tier: "addon",
    savings: 44.97 // vs individual pricing
  },
  // Individual features still available for smaller operations
  logbook_auditing: {
    name: "AI Logbook Auditing",
    description: "Automated DOT compliance analysis and violation detection",
    monthlyFee: 19.99,
    yearlyFee: 199.90,
    usageLimit: 100,
    overageFee: 0.25,
    tier: "addon"
  },
  ai_accountant: {
    name: "AI Accountant",
    description: "Intelligent financial analysis and tax optimization",
    monthlyFee: 24.99,
    yearlyFee: 249.90,
    usageLimit: 50,
    overageFee: 0.50,
    tier: "addon"
  }
};

// Port Capabilities Pricing - Updated for Better Margins
export const PORT_CAPABILITIES_PRICING = {
  name: "Advanced Port Operations",
  description: "Container tracking, chassis management, and automated fee calculation",
  monthlyFee: 30.00, // Updated for sustainable margins
  yearlyFee: 300.00, // 17% savings
  features: [
    "Real-time container tracking",
    "Chassis rental management", 
    "Automated demurrage calculation",
    "Port scheduling integration",
    "Fee optimization alerts",
    "Container pre-pull management",
    "Automated billing reconciliation"
  ],
  tier: "addon"
};

// Drayage Fee Structure
export const DRAYAGE_FEE_TYPES = {
  demurrage: {
    name: "Container Demurrage",
    description: "Fees for containers held beyond free time",
    freeTime: 3, // days
    dailyRate: 150.00,
    maxFee: 2000.00
  },
  detention: {
    name: "Chassis Detention",
    description: "Fees for chassis held beyond scheduled time",
    freeTime: 2, // hours
    hourlyRate: 75.00,
    maxFee: 1500.00
  },
  port_fee: {
    name: "Port Access Fee",
    description: "Base fee for port entry and services",
    baseFee: 25.00,
    perContainer: 15.00
  },
  chassis_rental: {
    name: "Chassis Rental",
    description: "Daily chassis rental fees",
    dailyRate: 45.00,
    weeklyRate: 280.00,
    monthlyRate: 1100.00
  },
  fuel_surcharge: {
    name: "Fuel Surcharge",
    description: "Variable fuel cost adjustment",
    percentage: 15.5, // percentage of base rate
    minimumFee: 25.00
  },
  pre_pull: {
    name: "Container Pre-Pull",
    description: "Early container pickup service",
    baseFee: 125.00,
    storagePerDay: 35.00
  }
};

// Port Operating Hours (Major US Ports)
export const DEFAULT_PORTS = [
  {
    portCode: "USLAX",
    portName: "Port of Los Angeles",
    city: "Los Angeles",
    state: "CA",
    timezone: "America/Los_Angeles",
    operatingHours: {
      monday: { open: "06:00", close: "18:00" },
      tuesday: { open: "06:00", close: "18:00" },
      wednesday: { open: "06:00", close: "18:00" },
      thursday: { open: "06:00", close: "18:00" },
      friday: { open: "06:00", close: "18:00" },
      saturday: { open: "08:00", close: "16:00" },
      sunday: { closed: true }
    }
  },
  {
    portCode: "USLGB",
    portName: "Port of Long Beach",
    city: "Long Beach",
    state: "CA",
    timezone: "America/Los_Angeles",
    operatingHours: {
      monday: { open: "06:00", close: "18:00" },
      tuesday: { open: "06:00", close: "18:00" },
      wednesday: { open: "06:00", close: "18:00" },
      thursday: { open: "06:00", close: "18:00" },
      friday: { open: "06:00", close: "18:00" },
      saturday: { open: "08:00", close: "16:00" },
      sunday: { closed: true }
    }
  },
  {
    portCode: "USNYC",
    portName: "Port of New York/New Jersey",
    city: "New York",
    state: "NY",
    timezone: "America/New_York",
    operatingHours: {
      monday: { open: "06:00", close: "19:00" },
      tuesday: { open: "06:00", close: "19:00" },
      wednesday: { open: "06:00", close: "19:00" },
      thursday: { open: "06:00", close: "19:00" },
      friday: { open: "06:00", close: "19:00" },
      saturday: { open: "08:00", close: "17:00" },
      sunday: { closed: true }
    }
  },
  {
    portCode: "USSAV",
    portName: "Port of Savannah",
    city: "Savannah",
    state: "GA",
    timezone: "America/New_York",
    operatingHours: {
      monday: { open: "06:00", close: "18:00" },
      tuesday: { open: "06:00", close: "18:00" },
      wednesday: { open: "06:00", close: "18:00" },
      thursday: { open: "06:00", close: "18:00" },
      friday: { open: "06:00", close: "18:00" },
      saturday: { open: "08:00", close: "16:00" },
      sunday: { closed: true }
    }
  },
  {
    portCode: "USHOU",
    portName: "Port of Houston",
    city: "Houston",
    state: "TX",
    timezone: "America/Chicago",
    operatingHours: {
      monday: { open: "06:00", close: "18:00" },
      tuesday: { open: "06:00", close: "18:00" },
      wednesday: { open: "06:00", close: "18:00" },
      thursday: { open: "06:00", close: "18:00" },
      friday: { open: "06:00", close: "18:00" },
      saturday: { open: "08:00", close: "16:00" },
      sunday: { closed: true }
    }
  }
];

// Container Size Specifications
export const CONTAINER_SPECS = {
  "20": {
    length: 20,
    width: 8,
    height: 8.5,
    maxWeight: 67200, // lbs
    tareWeight: 4850 // lbs
  },
  "40": {
    length: 40,
    width: 8,
    height: 8.5,
    maxWeight: 67200, // lbs
    tareWeight: 8200 // lbs
  },
  "45": {
    length: 45,
    width: 8,
    height: 9.5,
    maxWeight: 67200, // lbs
    tareWeight: 9260 // lbs
  },
  "53": {
    length: 53,
    width: 8.5,
    height: 9.5,
    maxWeight: 80000, // lbs
    tareWeight: 15000 // lbs
  }
};

// Chassis Rental Rates by Size and Type
export const CHASSIS_RENTAL_RATES = {
  "20": {
    daily: 35.00,
    weekly: 210.00,
    monthly: 850.00
  },
  "40": {
    daily: 45.00,
    weekly: 280.00,
    monthly: 1100.00
  },
  "45": {
    daily: 50.00,
    weekly: 315.00,
    monthly: 1250.00
  },
  "53": {
    daily: 55.00,
    weekly: 350.00,
    monthly: 1400.00
  }
};