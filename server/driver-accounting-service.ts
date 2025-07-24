/**
 * Driver-Accounting Integration Service
 * Implements the sync strategy from the Accounting_Driver_Sync_Guide
 */

import { db } from "./db";
import { drivers, driverPayrollEntries, payrollRuns, loads } from "@shared/schema";
import { eq, and, sum, desc, gte, lte } from "drizzle-orm";

export interface DriverPayCalculation {
  driverId: string;
  hoursWorked: number;
  milesDriven: number;
  grossPay: number;
  loadBasedEarnings: number;
  bonusEarnings: number;
  reimbursements: number;
}

export interface DriverAccountingSummary {
  activeDrivers: number;
  totalPaidYTD: number;
  totalReimbursements: number;
  averagePayPerDriver: number;
  payrollCosts: number;
}

export class DriverAccountingService {
  
  /**
   * Calculate driver pay for a specific payroll period
   * Implements rate * hours or rate * miles calculation per guide
   */
  async calculateDriverPay(
    companyId: string, 
    driverId: string, 
    payPeriodStart: Date, 
    payPeriodEnd: Date
  ): Promise<DriverPayCalculation> {
    try {
      // Get driver pay information
      const driver = await db.select()
        .from(drivers)
        .where(and(
          eq(drivers.companyId, companyId),
          eq(drivers.id, driverId)
        ))
        .limit(1);

      if (driver.length === 0) {
        throw new Error(`Driver ${driverId} not found`);
      }

      const driverData = driver[0];
      const payRate = parseFloat(driverData.payRate || '0');
      const payType = driverData.payType || 'mile';

      // Get loads completed in this period
      const completedLoads = await db.select()
        .from(loads)
        .where(and(
          eq(loads.companyId, companyId),
          eq(loads.assignedDriverId, driverId),
          eq(loads.status, 'delivered'),
          gte(loads.actualDeliveryDate, payPeriodStart.toISOString()),
          lte(loads.actualDeliveryDate, payPeriodEnd.toISOString())
        ));

      let hoursWorked = 0;
      let milesDriven = 0;
      let loadBasedEarnings = 0;

      // Calculate hours/miles and load-based earnings
      for (const load of completedLoads) {
        const loadMiles = parseFloat(load.miles || '0');
        const driverPayAmount = parseFloat(load.driverPay || '0');
        
        milesDriven += loadMiles;
        loadBasedEarnings += driverPayAmount;
        
        // Estimate hours (can be replaced with actual ELD data)
        hoursWorked += Math.ceil(loadMiles / 55); // Rough estimate: 55 mph average
      }

      // Calculate gross pay based on pay type
      let basePay = 0;
      if (payType === 'hourly') {
        basePay = payRate * hoursWorked;
      } else if (payType === 'mile') {
        basePay = payRate * milesDriven;
      }

      const grossPay = basePay + loadBasedEarnings;
      const bonusEarnings = grossPay * 0.05; // 5% performance bonus
      const reimbursements = parseFloat(driverData.reimbursements || '0');

      return {
        driverId,
        hoursWorked,
        milesDriven,
        grossPay,
        loadBasedEarnings,
        bonusEarnings,
        reimbursements
      };

    } catch (error) {
      console.error('Error calculating driver pay:', error);
      throw error;
    }
  }

  /**
   * Create payroll entries for all drivers in a payroll run
   * Links drivers to accounting via payroll_entries table per guide
   */
  async createDriverPayrollEntries(
    companyId: string,
    payrollRunId: string,
    payPeriodStart: Date,
    payPeriodEnd: Date
  ): Promise<void> {
    try {
      // Get all active drivers for the company
      const companyDrivers = await db.select()
        .from(drivers)
        .where(and(
          eq(drivers.companyId, companyId),
          eq(drivers.isActive, true)
        ));

      console.log(`Creating payroll entries for ${companyDrivers.length} drivers`);

      // Create payroll entry for each driver
      for (const driver of companyDrivers) {
        const payCalculation = await this.calculateDriverPay(
          companyId, 
          driver.id, 
          payPeriodStart, 
          payPeriodEnd
        );

        // Calculate net pay (simplified - 25% total deductions)
        const netPay = payCalculation.grossPay * 0.75;

        await db.insert(driverPayrollEntries).values({
          driverId: driver.id,
          companyId,
          payrollRunId,
          hoursWorked: payCalculation.hoursWorked.toString(),
          milesDriven: payCalculation.milesDriven.toString(),
          payRate: driver.payRate || '0',
          payType: driver.payType || 'mile',
          grossPay: payCalculation.grossPay.toString(),
          netPay: netPay.toString(),
          loadBasedEarnings: payCalculation.loadBasedEarnings.toString(),
          bonusEarnings: payCalculation.bonusEarnings.toString(),
          reimbursements: payCalculation.reimbursements.toString(),
          deductions: (payCalculation.grossPay * 0.25).toString()
        });

        console.log(`Created payroll entry for driver ${driver.id}`);
      }

    } catch (error) {
      console.error('Error creating driver payroll entries:', error);
      throw error;
    }
  }

  /**
   * Get driver accounting summary for dashboard
   * Implements driver cost reporting per guide
   */
  async getDriverAccountingSummary(
    companyId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<DriverAccountingSummary> {
    try {
      const start = startDate || new Date(new Date().getFullYear(), 0, 1); // Start of year
      const end = endDate || new Date();

      // Get active drivers count
      const activeDriversCount = await db.select()
        .from(drivers)
        .where(and(
          eq(drivers.companyId, companyId),
          eq(drivers.isActive, true)
        ));

      // Get payroll entries for period
      const payrollEntries = await db.select()
        .from(driverPayrollEntries)
        .where(and(
          eq(driverPayrollEntries.companyId, companyId),
          gte(driverPayrollEntries.createdAt, start),
          lte(driverPayrollEntries.createdAt, end)
        ));

      const totalPaidYTD = payrollEntries.reduce((sum, entry) => 
        sum + parseFloat(entry.grossPay), 0
      );

      const totalReimbursements = payrollEntries.reduce((sum, entry) => 
        sum + parseFloat(entry.reimbursements), 0
      );

      const averagePayPerDriver = activeDriversCount.length > 0 
        ? totalPaidYTD / activeDriversCount.length 
        : 0;

      return {
        activeDrivers: activeDriversCount.length,
        totalPaidYTD,
        totalReimbursements,
        averagePayPerDriver,
        payrollCosts: totalPaidYTD + totalReimbursements
      };

    } catch (error) {
      console.error('Error getting driver accounting summary:', error);
      throw error;
    }
  }

  /**
   * Get driver cost breakdown for load profitability analysis
   * Links driver costs to specific loads per guide
   */
  async getDriverCostsByLoad(
    companyId: string,
    loadId: string
  ): Promise<{
    driverPay: number;
    driverHours: number;
    driverMiles: number;
    laborCostPerMile: number;
  }> {
    try {
      const load = await db.select()
        .from(loads)
        .where(and(
          eq(loads.companyId, companyId),
          eq(loads.id, loadId)
        ))
        .limit(1);

      if (load.length === 0) {
        return { driverPay: 0, driverHours: 0, driverMiles: 0, laborCostPerMile: 0 };
      }

      const loadData = load[0];
      const driverPay = parseFloat(loadData.driverPay || '0');
      const miles = parseFloat(loadData.miles || '0');
      const driverHours = Math.ceil(miles / 55); // Estimate hours
      const laborCostPerMile = miles > 0 ? driverPay / miles : 0;

      return {
        driverPay,
        driverHours,
        driverMiles: miles,
        laborCostPerMile
      };

    } catch (error) {
      console.error('Error getting driver costs by load:', error);
      throw error;
    }
  }

  /**
   * Update driver pay rates and sync accounting data
   * Triggers recalculation of payroll previews per guide
   */
  async updateDriverPayRate(
    companyId: string,
    driverId: string,
    newPayRate: number,
    newPayType: 'hourly' | 'mile'
  ): Promise<void> {
    try {
      await db.update(drivers)
        .set({
          payRate: newPayRate.toString(),
          payType: newPayType,
          updatedAt: new Date()
        })
        .where(and(
          eq(drivers.companyId, companyId),
          eq(drivers.id, driverId)
        ));

      console.log(`Updated pay rate for driver ${driverId}: ${newPayRate} per ${newPayType}`);

    } catch (error) {
      console.error('Error updating driver pay rate:', error);
      throw error;
    }
  }

  /**
   * Get driver financial performance metrics
   * Supports driver summary card in accounting dashboard per guide
   */
  async getDriverFinancialMetrics(
    companyId: string,
    driverId: string,
    months: number = 12
  ): Promise<{
    totalEarnings: number;
    totalMiles: number;
    totalHours: number;
    averagePayPerMile: number;
    averagePayPerHour: number;
    reimbursementTotal: number;
    loadsCompleted: number;
  }> {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const payrollEntries = await db.select()
        .from(driverPayrollEntries)
        .where(and(
          eq(driverPayrollEntries.companyId, companyId),
          eq(driverPayrollEntries.driverId, driverId),
          gte(driverPayrollEntries.createdAt, startDate)
        ));

      const totalEarnings = payrollEntries.reduce((sum, entry) => 
        sum + parseFloat(entry.grossPay), 0
      );

      const totalMiles = payrollEntries.reduce((sum, entry) => 
        sum + parseFloat(entry.milesDriven), 0
      );

      const totalHours = payrollEntries.reduce((sum, entry) => 
        sum + parseFloat(entry.hoursWorked), 0
      );

      const reimbursementTotal = payrollEntries.reduce((sum, entry) => 
        sum + parseFloat(entry.reimbursements), 0
      );

      const averagePayPerMile = totalMiles > 0 ? totalEarnings / totalMiles : 0;
      const averagePayPerHour = totalHours > 0 ? totalEarnings / totalHours : 0;

      // Get loads completed
      const completedLoads = await db.select()
        .from(loads)
        .where(and(
          eq(loads.companyId, companyId),
          eq(loads.assignedDriverId, driverId),
          eq(loads.status, 'delivered'),
          gte(loads.createdAt, startDate)
        ));

      return {
        totalEarnings,
        totalMiles,
        totalHours,
        averagePayPerMile,
        averagePayPerHour,
        reimbursementTotal,
        loadsCompleted: completedLoads.length
      };

    } catch (error) {
      console.error('Error getting driver financial metrics:', error);
      throw error;
    }
  }
}

export const driverAccountingService = new DriverAccountingService();