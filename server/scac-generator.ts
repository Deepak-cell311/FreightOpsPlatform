/**
 * SCAC-Style Company Identifier Generator
 * Based on Standard Carrier Alpha Code (SCAC) methodology
 * 
 * SCAC Format Rules:
 * - 2-4 letters (alphanumeric characters)
 * - Unique identifiers for transportation companies
 * - Special ending letters for different transportation modes
 * - "U" Ending: Freight containers
 * - "X" Ending: Privately owned railroad cars
 * - "Z" Ending: Truck chassis and trailers used in intermodal service
 */

import { storage } from "./storage";
import { randomBytes } from "crypto";

// Reserved endings for different transportation modes
const SCAC_ENDINGS = {
  MOTOR_CARRIER: 'M',     // Motor carriers (trucking)
  RAIL_CARRIER: 'R',      // Rail carriers
  OCEAN_CARRIER: 'O',     // Ocean carriers
  AIR_CARRIER: 'A',       // Air carriers
  FREIGHT_FORWARDER: 'F', // Freight forwarders
  LOGISTICS_PROVIDER: 'L', // Logistics providers
  INTERMODAL: 'I',        // Intermodal services
  GENERAL: 'G'            // General transportation
};

// Avoid confusing characters
const VALID_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// Reserved codes that should not be generated
const RESERVED_CODES = [
  'ZZZ', 'MIL', 'USA', 'DOT', 'EPA', 'FDA', 'TSA', 'CBP', 'ICE', 'DHS',
  'FBI', 'CIA', 'NSA', 'DEA', 'ATF', 'IRS', 'SEC', 'FTC', 'FCC', 'OSHA',
  'NULL', 'VOID', 'TEST', 'DEMO', 'TEMP', 'FAKE', 'MOCK', 'XXXX'
];

export class SCACGenerator {
  
  /**
   * Generate a SCAC-style company identifier
   * @param companyName - Company name for context
   * @param businessType - Type of transportation business
   * @param length - Code length (2-4 characters)
   * @returns Promise<string> - Unique company identifier
   */
  static async generateCompanyIdentifier(
    companyName: string,
    businessType: 'motor_carrier' | 'rail_carrier' | 'ocean_carrier' | 'air_carrier' | 'freight_forwarder' | 'logistics_provider' | 'intermodal' | 'general' = 'motor_carrier',
    length: 2 | 3 | 4 = 4
  ): Promise<string> {
    const maxAttempts = 100;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const identifier = this.generateSCAC(companyName, businessType, length);
      
      // Check if identifier is unique in database
      const isUnique = await this.isIdentifierUnique(identifier);
      if (isUnique) {
        return identifier;
      }
      
      attempts++;
    }
    
    throw new Error('Failed to generate unique company identifier after 100 attempts');
  }
  
  /**
   * Generate a single SCAC-style code
   * @param companyName - Company name for context
   * @param businessType - Type of transportation business
   * @param length - Code length (2-4 characters)
   * @returns string - Generated SCAC code
   */
  private static generateSCAC(
    companyName: string,
    businessType: 'motor_carrier' | 'rail_carrier' | 'ocean_carrier' | 'air_carrier' | 'freight_forwarder' | 'logistics_provider' | 'intermodal' | 'general',
    length: 2 | 3 | 4
  ): string {
    const ending = this.getBusinessTypeEnding(businessType);
    const prefixLength = length - 1;
    
    // Strategy 1: Use company name initials + random + ending
    if (Math.random() > 0.3) {
      const initials = this.extractInitials(companyName);
      if (initials.length >= prefixLength) {
        const prefix = initials.substring(0, prefixLength);
        const code = prefix + ending;
        if (!RESERVED_CODES.includes(code)) {
          return code;
        }
      }
    }
    
    // Strategy 2: Pure random generation
    let prefix = '';
    for (let i = 0; i < prefixLength; i++) {
      const randomIndex = Math.floor(Math.random() * VALID_CHARACTERS.length);
      prefix += VALID_CHARACTERS[randomIndex];
    }
    
    const code = prefix + ending;
    
    // Avoid reserved codes
    if (RESERVED_CODES.includes(code)) {
      return this.generateSCAC(companyName, businessType, length);
    }
    
    return code;
  }
  
  /**
   * Extract initials from company name
   * @param companyName - Company name
   * @returns string - Company initials
   */
  private static extractInitials(companyName: string): string {
    return companyName
      .toUpperCase()
      .split(/\s+/)
      .map(word => word.charAt(0))
      .filter(char => VALID_CHARACTERS.includes(char))
      .join('');
  }
  
  /**
   * Get business type ending character
   * @param businessType - Type of transportation business
   * @returns string - Ending character
   */
  private static getBusinessTypeEnding(businessType: string): string {
    switch (businessType) {
      case 'motor_carrier':
        return SCAC_ENDINGS.MOTOR_CARRIER;
      case 'rail_carrier':
        return SCAC_ENDINGS.RAIL_CARRIER;
      case 'ocean_carrier':
        return SCAC_ENDINGS.OCEAN_CARRIER;
      case 'air_carrier':
        return SCAC_ENDINGS.AIR_CARRIER;
      case 'freight_forwarder':
        return SCAC_ENDINGS.FREIGHT_FORWARDER;
      case 'logistics_provider':
        return SCAC_ENDINGS.LOGISTICS_PROVIDER;
      case 'intermodal':
        return SCAC_ENDINGS.INTERMODAL;
      default:
        return SCAC_ENDINGS.GENERAL;
    }
  }
  
  /**
   * Check if identifier is unique in database
   * @param identifier - Company identifier to check
   * @returns Promise<boolean> - True if unique
   */
  private static async isIdentifierUnique(identifier: string): Promise<boolean> {
    try {
      // Check if any company has this identifier as their ID
      const companies = await storage.getCompanies();
      const existingIds = companies.map(c => c.id);
      
      return !existingIds.includes(identifier);
    } catch (error) {
      console.error('Error checking identifier uniqueness:', error);
      return false;
    }
  }
  
  /**
   * Generate multiple identifier options
   * @param companyName - Company name
   * @param businessType - Type of transportation business
   * @param count - Number of options to generate
   * @returns Promise<string[]> - Array of unique identifiers
   */
  static async generateIdentifierOptions(
    companyName: string,
    businessType: 'motor_carrier' | 'rail_carrier' | 'ocean_carrier' | 'air_carrier' | 'freight_forwarder' | 'logistics_provider' | 'intermodal' | 'general' = 'motor_carrier',
    count: number = 5
  ): Promise<string[]> {
    const options: string[] = [];
    const maxAttempts = count * 10;
    let attempts = 0;
    
    while (options.length < count && attempts < maxAttempts) {
      try {
        const identifier = await this.generateCompanyIdentifier(companyName, businessType, 4);
        if (!options.includes(identifier)) {
          options.push(identifier);
        }
      } catch (error) {
        // Continue trying
      }
      attempts++;
    }
    
    return options;
  }
  
  /**
   * Validate SCAC-style identifier format
   * @param identifier - Identifier to validate
   * @returns boolean - True if valid format
   */
  static isValidSCACFormat(identifier: string): boolean {
    // Must be 2-4 characters
    if (identifier.length < 2 || identifier.length > 4) {
      return false;
    }
    
    // Must contain only valid characters
    for (const char of identifier) {
      if (!VALID_CHARACTERS.includes(char)) {
        return false;
      }
    }
    
    // Must not be a reserved code
    if (RESERVED_CODES.includes(identifier)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Get business type from SCAC ending
   * @param scacCode - SCAC code
   * @returns string - Business type
   */
  static getBusinessTypeFromSCAC(scacCode: string): string {
    if (!scacCode || scacCode.length < 2) {
      return 'general';
    }
    
    const ending = scacCode.charAt(scacCode.length - 1);
    
    switch (ending) {
      case SCAC_ENDINGS.MOTOR_CARRIER:
        return 'motor_carrier';
      case SCAC_ENDINGS.RAIL_CARRIER:
        return 'rail_carrier';
      case SCAC_ENDINGS.OCEAN_CARRIER:
        return 'ocean_carrier';
      case SCAC_ENDINGS.AIR_CARRIER:
        return 'air_carrier';
      case SCAC_ENDINGS.FREIGHT_FORWARDER:
        return 'freight_forwarder';
      case SCAC_ENDINGS.LOGISTICS_PROVIDER:
        return 'logistics_provider';
      case SCAC_ENDINGS.INTERMODAL:
        return 'intermodal';
      default:
        return 'general';
    }
  }
}