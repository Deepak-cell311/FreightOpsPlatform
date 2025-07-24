/**
 * Migration Script: Convert Existing Company IDs to SCAC-Style Identifiers
 * 
 * This script updates existing companies to use SCAC-style identifiers
 * instead of the current "company-1" format for enhanced security.
 */

import { db } from "./db";
import { companies, users, drivers, trucks, loads } from "@shared/schema";
import { SCACGenerator } from "./scac-generator";
import { eq } from "drizzle-orm";

interface CompanyMigration {
  oldId: string;
  newId: string;
  name: string;
  businessType: 'motor_carrier' | 'rail_carrier' | 'ocean_carrier' | 'air_carrier' | 'freight_forwarder' | 'logistics_provider' | 'intermodal' | 'general';
}

export class CompanyIdMigration {
  
  /**
   * Migrate all existing companies to SCAC-style identifiers
   */
  static async migrateAllCompanies(): Promise<CompanyMigration[]> {
    console.log('🔄 Starting company ID migration to SCAC-style identifiers...');
    
    // Get all existing companies
    const existingCompanies = await db.select().from(companies);
    const migrations: CompanyMigration[] = [];
    
    for (const company of existingCompanies) {
      // Skip if already SCAC-style (4 characters, letters only)
      if (SCACGenerator.isValidSCACFormat(company.id)) {
        console.log(`✅ Company ${company.name} (${company.id}) already has SCAC-style identifier`);
        continue;
      }
      
      // Generate new SCAC-style identifier
      const businessType = this.determineBusinessType(company.name);
      const newId = await SCACGenerator.generateCompanyIdentifier(
        company.name,
        businessType,
        4
      );
      
      console.log(`🔄 Migrating ${company.name}: ${company.id} → ${newId}`);
      
      // Perform migration
      await this.migrateCompany(company.id, newId);
      
      migrations.push({
        oldId: company.id,
        newId,
        name: company.name,
        businessType
      });
    }
    
    console.log(`✅ Migration complete! Updated ${migrations.length} companies`);
    return migrations;
  }
  
  /**
   * Migrate a single company and all related records
   */
  static async migrateCompany(oldId: string, newId: string): Promise<void> {
    // Start transaction
    await db.transaction(async (tx) => {
      // First, get the company data
      const [company] = await tx.select().from(companies).where(eq(companies.id, oldId));
      if (!company) {
        throw new Error(`Company not found: ${oldId}`);
      }
      
      // Create new company record with new ID
      await tx.insert(companies).values({
        ...company,
        id: newId
      });
      
      // Update all related records to point to new company ID
      await tx.update(users)
        .set({ companyId: newId })
        .where(eq(users.companyId, oldId));
      
      await tx.update(drivers)
        .set({ companyId: newId })
        .where(eq(drivers.companyId, oldId));
      
      await tx.update(trucks)
        .set({ companyId: newId })
        .where(eq(trucks.companyId, oldId));
      
      await tx.update(loads)
        .set({ companyId: newId })
        .where(eq(loads.companyId, oldId));
      
      // Delete old company record
      await tx.delete(companies).where(eq(companies.id, oldId));
    });
  }
  
  /**
   * Determine business type from company name
   */
  private static determineBusinessType(companyName: string): 'motor_carrier' | 'rail_carrier' | 'ocean_carrier' | 'air_carrier' | 'freight_forwarder' | 'logistics_provider' | 'intermodal' | 'general' {
    const name = companyName.toLowerCase();
    
    // Motor carrier keywords
    if (name.includes('trucking') || name.includes('transport') || name.includes('freight') || 
        name.includes('logistics') || name.includes('carrier') || name.includes('haul')) {
      return 'motor_carrier';
    }
    
    // Rail carrier keywords
    if (name.includes('rail') || name.includes('railroad') || name.includes('railway')) {
      return 'rail_carrier';
    }
    
    // Ocean carrier keywords
    if (name.includes('ocean') || name.includes('marine') || name.includes('shipping') || 
        name.includes('maritime') || name.includes('vessel')) {
      return 'ocean_carrier';
    }
    
    // Air carrier keywords
    if (name.includes('air') || name.includes('aviation') || name.includes('cargo') || 
        name.includes('express') || name.includes('overnight')) {
      return 'air_carrier';
    }
    
    // Freight forwarder keywords
    if (name.includes('forwarder') || name.includes('forwarding') || name.includes('global') || 
        name.includes('international') || name.includes('worldwide')) {
      return 'freight_forwarder';
    }
    
    // Logistics provider keywords
    if (name.includes('logistics') || name.includes('supply') || name.includes('distribution') || 
        name.includes('warehouse') || name.includes('3pl')) {
      return 'logistics_provider';
    }
    
    // Intermodal keywords
    if (name.includes('intermodal') || name.includes('container') || name.includes('multimodal')) {
      return 'intermodal';
    }
    
    // Default to motor carrier for freight operations
    return 'motor_carrier';
  }
  
  /**
   * Rollback migration (emergency use only)
   */
  static async rollbackMigration(migrations: CompanyMigration[]): Promise<void> {
    console.log('🔄 Rolling back company ID migration...');
    
    for (const migration of migrations) {
      console.log(`🔄 Rolling back ${migration.name}: ${migration.newId} → ${migration.oldId}`);
      await this.migrateCompany(migration.newId, migration.oldId);
    }
    
    console.log('✅ Rollback complete!');
  }
  
  /**
   * Validate migration results
   */
  static async validateMigration(): Promise<boolean> {
    const allCompanies = await db.select().from(companies);
    
    for (const company of allCompanies) {
      if (!SCACGenerator.isValidSCACFormat(company.id)) {
        console.error(`❌ Company ${company.name} still has invalid identifier: ${company.id}`);
        return false;
      }
    }
    
    console.log('✅ All companies have valid SCAC-style identifiers');
    return true;
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  CompanyIdMigration.migrateAllCompanies()
    .then((migrations) => {
      console.log('Migration results:', migrations);
      return CompanyIdMigration.validateMigration();
    })
    .then((isValid) => {
      if (isValid) {
        console.log('✅ Migration successful and validated!');
      } else {
        console.error('❌ Migration validation failed!');
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}