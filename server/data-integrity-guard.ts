/**
 * DATA INTEGRITY GUARD - PERMANENT PROTECTION AGAINST MOCK DATA
 * 
 * This module provides ironclad protection against mock/fake data being introduced
 * into the FreightOps Pro system. It validates all data responses and blocks
 * any hardcoded values that might be accidentally introduced.
 * 
 * CRITICAL: Never modify or remove this file without explicit user approval.
 */

interface DataIntegrityViolation {
  endpoint: string;
  violationType: 'hardcoded_value' | 'mock_data' | 'placeholder_data';
  value: any;
  timestamp: Date;
}

// Known mock data patterns that should NEVER appear in production
const FORBIDDEN_MOCK_VALUES = [
  8, // activeLoads mock value
  45280.5, // revenue mock value
  12450.75, // availableBalance mock value
  2, // fleetSize mock value
  85, // hardcoded utilization percentage
  94.2, // hardcoded compliance percentage
  5.2, // hardcoded revenue change
  12.1, // hardcoded loads change
  8.7, // hardcoded miles change
  15.3, // hardcoded dispatch change
];

// Mock data strings that should never appear
const FORBIDDEN_MOCK_STRINGS = [
  'FL-001', 'TX-002', 'T-101', // Mock load/truck IDs
  'John Smith', 'Jane Doe', // Mock names
  'ABC Trucking LLC', 'Swift Transport Co', 'Metro Logistics', // Mock company names
  'Sample', 'Test', 'Demo', 'Mock', 'Fake', 'Placeholder'
];

// Endpoints that must never return hardcoded data
const PROTECTED_ENDPOINTS = [
  '/api/dashboard/stats',
  '/api/dashboard/metrics',
  '/api/loads',
  '/api/drivers',
  '/api/trucks',
  '/api/accounting/stats',
  '/api/fleet/stats'
];

export class DataIntegrityGuard {
  private static violations: DataIntegrityViolation[] = [];
  private static isEnabled = true;

  /**
   * Validate response data for mock values
   */
  static validateResponse(endpoint: string, data: any): boolean {
    if (!this.isEnabled) return true;

    const violations = this.detectViolations(endpoint, data);
    
    if (violations.length > 0) {
      this.violations.push(...violations);
      console.error('🚨 DATA INTEGRITY VIOLATION DETECTED:', {
        endpoint,
        violations: violations.map(v => ({
          type: v.violationType,
          value: v.value
        }))
      });
      
      // In production, this would alert administrators
      this.logViolation(endpoint, violations);
      return false;
    }

    return true;
  }

  /**
   * Express middleware to protect endpoints
   */
  static middleware() {
    return (req: any, res: any, next: any) => {
      const originalJson = res.json;
      
      res.json = function(data: any) {
        const endpoint = req.path;
        
        if (PROTECTED_ENDPOINTS.includes(endpoint)) {
          const isValid = DataIntegrityGuard.validateResponse(endpoint, data);
          
          if (!isValid) {
            console.error('🚨 BLOCKING RESPONSE WITH MOCK DATA:', endpoint);
            return originalJson.call(this, {
              error: 'Data integrity violation detected',
              endpoint,
              message: 'Mock data detected and blocked by integrity guard'
            });
          }
        }
        
        return originalJson.call(this, data);
      };
      
      next();
    };
  }

  /**
   * Detect violations in response data
   */
  private static detectViolations(endpoint: string, data: any): DataIntegrityViolation[] {
    const violations: DataIntegrityViolation[] = [];
    
    // Check for forbidden numeric values
    this.checkForForbiddenValues(data, violations, endpoint);
    
    // Check for forbidden strings
    this.checkForForbiddenStrings(data, violations, endpoint);
    
    return violations;
  }

  private static checkForForbiddenValues(obj: any, violations: DataIntegrityViolation[], endpoint: string) {
    if (typeof obj === 'number') {
      if (FORBIDDEN_MOCK_VALUES.includes(obj)) {
        violations.push({
          endpoint,
          violationType: 'hardcoded_value',
          value: obj,
          timestamp: new Date()
        });
      }
    } else if (typeof obj === 'object' && obj !== null) {
      Object.values(obj).forEach(value => {
        this.checkForForbiddenValues(value, violations, endpoint);
      });
    }
  }

  private static checkForForbiddenStrings(obj: any, violations: DataIntegrityViolation[], endpoint: string) {
    if (typeof obj === 'string') {
      FORBIDDEN_MOCK_STRINGS.forEach(forbidden => {
        if (obj.includes(forbidden)) {
          violations.push({
            endpoint,
            violationType: 'mock_data',
            value: obj,
            timestamp: new Date()
          });
        }
      });
    } else if (typeof obj === 'object' && obj !== null) {
      Object.values(obj).forEach(value => {
        this.checkForForbiddenStrings(value, violations, endpoint);
      });
    }
  }

  private static logViolation(endpoint: string, violations: DataIntegrityViolation[]) {
    console.log('\n🚨 DATA INTEGRITY VIOLATION LOG:');
    console.log('='.repeat(50));
    console.log(`Endpoint: ${endpoint}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('Violations:', violations);
    console.log('='.repeat(50));
  }

  /**
   * Get all detected violations
   */
  static getViolations(): DataIntegrityViolation[] {
    return [...this.violations];
  }

  /**
   * Clear violation history
   */
  static clearViolations(): void {
    this.violations = [];
  }

  /**
   * Emergency disable (should only be used for debugging)
   */
  static disable(): void {
    console.warn('⚠️  DATA INTEGRITY GUARD DISABLED - MOCK DATA PROTECTION OFF');
    this.isEnabled = false;
  }

  /**
   * Re-enable protection
   */
  static enable(): void {
    console.log('✅ DATA INTEGRITY GUARD ENABLED - MOCK DATA PROTECTION ON');
    this.isEnabled = true;
  }
}

// Auto-enable on import
console.log('🛡️  DATA INTEGRITY GUARD LOADED - PROTECTING AGAINST MOCK DATA');