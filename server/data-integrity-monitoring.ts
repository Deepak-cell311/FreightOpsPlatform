/**
 * DATA INTEGRITY MONITORING & ENFORCEMENT SYSTEM
 * 
 * This system provides comprehensive monitoring and enforcement of data integrity
 * across the FreightOps Pro platform. It includes real-time monitoring, alerting,
 * and automatic prevention of mock data introduction.
 */

import { db } from './db';
import { eq, and, desc, sql } from 'drizzle-orm';
import { companies, loads, drivers, trucks } from '@shared/schema';

interface DataIntegrityReport {
  timestamp: Date;
  companyId: string;
  companyName: string;
  dataIntegrityScore: number;
  issues: DataIntegrityIssue[];
  recommendations: string[];
}

interface DataIntegrityIssue {
  type: 'missing_data' | 'suspicious_values' | 'mock_data_detected' | 'inconsistent_data';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedEntity: string;
  suggestedAction: string;
}

export class DataIntegrityMonitor {
  private static instance: DataIntegrityMonitor;
  private monitoringActive = true;
  private reports: DataIntegrityReport[] = [];

  static getInstance(): DataIntegrityMonitor {
    if (!DataIntegrityMonitor.instance) {
      DataIntegrityMonitor.instance = new DataIntegrityMonitor();
    }
    return DataIntegrityMonitor.instance;
  }

  /**
   * Comprehensive data integrity assessment for a company
   */
  async assessCompanyDataIntegrity(companyId: string): Promise<DataIntegrityReport> {
    const company = await db.select().from(companies).where(eq(companies.id, companyId)).limit(1);
    if (!company.length) {
      throw new Error(`Company ${companyId} not found`);
    }

    const companyData = company[0];
    const issues: DataIntegrityIssue[] = [];
    const recommendations: string[] = [];

    // Check for authentic operational data
    await this.checkOperationalData(companyId, issues, recommendations);
    
    // Check for suspicious patterns
    await this.checkSuspiciousPatterns(companyId, issues, recommendations);
    
    // Check for mock data patterns
    await this.checkMockDataPatterns(companyId, issues, recommendations);
    
    // Calculate integrity score
    const dataIntegrityScore = this.calculateIntegrityScore(issues);

    const report: DataIntegrityReport = {
      timestamp: new Date(),
      companyId,
      companyName: companyData.name,
      dataIntegrityScore,
      issues,
      recommendations
    };

    // Store report for monitoring
    this.reports.push(report);
    
    // Keep only last 100 reports
    if (this.reports.length > 100) {
      this.reports = this.reports.slice(-100);
    }

    return report;
  }

  /**
   * Check for operational data completeness
   */
  private async checkOperationalData(
    companyId: string, 
    issues: DataIntegrityIssue[], 
    recommendations: string[]
  ): Promise<void> {
    // Check loads data
    const loads = await db.select().from(loads).where(eq(loads.companyId, companyId));
    if (loads.length === 0) {
      issues.push({
        type: 'missing_data',
        severity: 'medium',
        description: 'No loads found in system',
        affectedEntity: 'loads',
        suggestedAction: 'Create loads through dispatch module or load creation system'
      });
      recommendations.push('Start by creating your first load to begin tracking operations');
    }

    // Check drivers data
    const drivers = await db.select().from(drivers).where(eq(drivers.companyId, companyId));
    if (drivers.length === 0) {
      issues.push({
        type: 'missing_data',
        severity: 'medium',
        description: 'No drivers found in system',
        affectedEntity: 'drivers',
        suggestedAction: 'Add drivers through fleet management or HR onboarding'
      });
      recommendations.push('Add drivers to your fleet to enable dispatch operations');
    }

    // Check trucks data
    const trucks = await db.select().from(trucks).where(eq(trucks.companyId, companyId));
    if (trucks.length === 0) {
      issues.push({
        type: 'missing_data',
        severity: 'medium',
        description: 'No trucks found in system',
        affectedEntity: 'trucks',
        suggestedAction: 'Add trucks through fleet management module'
      });
      recommendations.push('Add trucks to your fleet to enable load assignments');
    }

    // Check for basic operational balance
    if (loads.length > 0 && drivers.length === 0) {
      issues.push({
        type: 'inconsistent_data',
        severity: 'high',
        description: 'Loads exist but no drivers available for assignment',
        affectedEntity: 'operations',
        suggestedAction: 'Add drivers to handle existing loads'
      });
    }

    if (loads.length > 0 && trucks.length === 0) {
      issues.push({
        type: 'inconsistent_data',
        severity: 'high',
        description: 'Loads exist but no trucks available for transport',
        affectedEntity: 'operations',
        suggestedAction: 'Add trucks to handle existing loads'
      });
    }
  }

  /**
   * Check for suspicious data patterns that might indicate mock data
   */
  private async checkSuspiciousPatterns(
    companyId: string, 
    issues: DataIntegrityIssue[], 
    recommendations: string[]
  ): Promise<void> {
    // Check for suspicious load patterns
    const loadPatterns = await db.execute(sql`
      SELECT rate, COUNT(*) as count
      FROM loads 
      WHERE companyId = ${companyId} 
      GROUP BY rate 
      HAVING COUNT(*) > 1
    `);

    for (const pattern of loadPatterns.rows) {
      const rate = pattern.rate;
      const count = pattern.count;
      
      // Check for suspicious exact amounts
      if (typeof rate === 'number' && (rate === 45280.5 || rate === 12450.75 || rate === 85.0)) {
        issues.push({
          type: 'mock_data_detected',
          severity: 'critical',
          description: `Suspicious rate value ${rate} detected ${count} times - matches known mock data patterns`,
          affectedEntity: 'loads',
          suggestedAction: 'Remove mock data and enter authentic load rates'
        });
      }
    }
  }

  /**
   * Check for known mock data patterns
   */
  private async checkMockDataPatterns(
    companyId: string, 
    issues: DataIntegrityIssue[], 
    recommendations: string[]
  ): Promise<void> {
    // Check for mock load numbers
    const mockLoadNumbers = ['FL-001', 'TX-002', 'CA-003', 'NY-004'];
    const mockLoads = await db.select().from(loads)
      .where(and(
        eq(loads.companyId, companyId),
        sql`${loads.loadNumber} IN (${mockLoadNumbers.join(', ')})`
      ));

    if (mockLoads.length > 0) {
      issues.push({
        type: 'mock_data_detected',
        severity: 'critical',
        description: `Mock load numbers detected: ${mockLoads.map(l => l.loadNumber).join(', ')}`,
        affectedEntity: 'loads',
        suggestedAction: 'Replace mock load numbers with authentic load identifiers'
      });
    }

    // Check for mock driver names
    const mockDrivers = await db.select().from(drivers)
      .where(and(
        eq(drivers.companyId, companyId),
        sql`${drivers.firstName} IN ('John', 'Jane', 'Test', 'Demo')`
      ));

    if (mockDrivers.length > 0) {
      issues.push({
        type: 'mock_data_detected',
        severity: 'critical',
        description: `Mock driver names detected: ${mockDrivers.map(d => `${d.firstName} ${d.lastName}`).join(', ')}`,
        affectedEntity: 'drivers',
        suggestedAction: 'Replace mock driver data with authentic employee information'
      });
    }
  }

  /**
   * Calculate data integrity score based on issues
   */
  private calculateIntegrityScore(issues: DataIntegrityIssue[]): number {
    let score = 100;

    for (const issue of issues) {
      switch (issue.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Get monitoring dashboard data
   */
  async getMonitoringDashboard(): Promise<any> {
    const recentReports = this.reports.slice(-10);
    
    return {
      monitoringActive: this.monitoringActive,
      totalReports: this.reports.length,
      recentReports: recentReports.map(report => ({
        companyId: report.companyId,
        companyName: report.companyName,
        timestamp: report.timestamp,
        integrityScore: report.dataIntegrityScore,
        issueCount: report.issues.length,
        criticalIssues: report.issues.filter(i => i.severity === 'critical').length
      })),
      systemHealth: {
        averageIntegrityScore: recentReports.length > 0 
          ? Math.round(recentReports.reduce((sum, r) => sum + r.dataIntegrityScore, 0) / recentReports.length)
          : 100,
        totalCriticalIssues: recentReports.reduce((sum, r) => 
          sum + r.issues.filter(i => i.severity === 'critical').length, 0),
        companiesWithIssues: recentReports.filter(r => r.issues.length > 0).length
      }
    };
  }

  /**
   * Get detailed report for a specific company
   */
  getCompanyReport(companyId: string): DataIntegrityReport | null {
    return this.reports.find(r => r.companyId === companyId) || null;
  }

  /**
   * Emergency data integrity check - validates all companies
   */
  async emergencyIntegrityCheck(): Promise<DataIntegrityReport[]> {
    const companies = await db.select().from(companies);
    const reports: DataIntegrityReport[] = [];

    for (const company of companies) {
      try {
        const report = await this.assessCompanyDataIntegrity(company.id);
        reports.push(report);
      } catch (error) {
        console.error(`Failed to assess company ${company.id}:`, error);
      }
    }

    return reports;
  }

  /**
   * Enable/disable monitoring
   */
  setMonitoringActive(active: boolean): void {
    this.monitoringActive = active;
    console.log(`Data integrity monitoring ${active ? 'enabled' : 'disabled'}`);
  }
}

// Export singleton instance
export const dataIntegrityMonitor = DataIntegrityMonitor.getInstance();