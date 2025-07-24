/**
 * API Endpoints for Company ID Migration
 * 
 * Provides safe API endpoints for migrating companies to SCAC-style identifiers
 */

import { Router } from "express";
import { CompanyIdMigration } from "./migrate-company-ids";
import { SCACGenerator } from "./scac-generator";
import { storage } from "./storage";
import { requireRole } from "./middleware/auth";

const router = Router();

/**
 * Get current company ID status
 */
router.get('/migration/status', requireRole('admin'), async (req, res) => {
  try {
    const companies = await storage.getCompanies();
    const stats = {
      total: companies.length,
      scacStyle: 0,
      oldStyle: 0,
      companies: companies.map(c => ({
        id: c.id,
        name: c.name,
        isScacStyle: SCACGenerator.isValidSCACFormat(c.id),
        businessType: SCACGenerator.getBusinessTypeFromSCAC(c.id)
      }))
    };
    
    stats.scacStyle = stats.companies.filter(c => c.isScacStyle).length;
    stats.oldStyle = stats.companies.filter(c => !c.isScacStyle).length;
    
    res.json(stats);
  } catch (error) {
    console.error('Migration status error:', error);
    res.status(500).json({ error: 'Failed to get migration status' });
  }
});

/**
 * Preview migration changes
 */
router.get('/migration/preview', requireRole('admin'), async (req, res) => {
  try {
    const companies = await storage.getCompanies();
    const previews = [];
    
    for (const company of companies) {
      if (!SCACGenerator.isValidSCACFormat(company.id)) {
        // Generate preview of new identifier
        const businessType = determineBus

/**
 * Execute migration
 */
router.post('/migration/execute', requireRole('admin'), async (req, res) => {
  try {
    const migrations = await CompanyIdMigration.migrateAllCompanies();
    
    // Validate migration
    const isValid = await CompanyIdMigration.validateMigration();
    
    res.json({
      success: true,
      migrations,
      validated: isValid,
      message: `Successfully migrated ${migrations.length} companies to SCAC-style identifiers`
    });
  } catch (error) {
    console.error('Migration execution error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to execute migration',
      details: error.message
    });
  }
});

/**
 * Generate SCAC identifier for a company
 */
router.post('/scac/generate', requireRole('admin'), async (req, res) => {
  try {
    const { companyName, businessType = 'motor_carrier' } = req.body;
    
    if (!companyName) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    
    // Generate multiple options
    const options = await SCACGenerator.generateIdentifierOptions(
      companyName,
      businessType,
      5
    );
    
    res.json({
      companyName,
      businessType,
      options,
      recommendations: {
        primary: options[0],
        alternates: options.slice(1)
      }
    });
  } catch (error) {
    console.error('SCAC generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate SCAC identifier',
      details: error.message
    });
  }
});

/**
 * Validate SCAC identifier
 */
router.post('/scac/validate', requireRole('admin'), async (req, res) => {
  try {
    const { identifier } = req.body;
    
    if (!identifier) {
      return res.status(400).json({ error: 'Identifier is required' });
    }
    
    const isValid = SCACGenerator.isValidSCACFormat(identifier);
    const businessType = SCACGenerator.getBusinessTypeFromSCAC(identifier);
    
    // Check if already in use
    const existingCompany = await storage.getCompany(identifier);
    
    res.json({
      identifier,
      isValid,
      businessType,
      isAvailable: !existingCompany,
      inUseBy: existingCompany ? existingCompany.name : null
    });
  } catch (error) {
    console.error('SCAC validation error:', error);
    res.status(500).json({ 
      error: 'Failed to validate SCAC identifier',
      details: error.message
    });
  }
});

export { router as companyIdMigrationRouter };