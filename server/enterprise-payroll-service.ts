/**
 * Enterprise Payroll Service - Live Implementation
 * Provides real database-backed payroll functionality
 */

import { db } from './db';
import { employees, employeePaystubs, payrollRuns, companies } from '../shared/schema';
import { eq, and, desc, sum, gte, lte } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export interface PayrollMetrics {
  totalGrossPay: number;
  totalNetPay: number;
  totalTaxes: number;
  totalEmployees: number;
  avgSalary: number;
  payrollExpenses: number;
  benefitsCost: number;
}

export interface PayrollSummary {
  period: string;
  totalGross: string;
  totalNet: string;
  totalTaxes: string;
  employeeCount: number;
  averagePay: string;
}

export class EnterprisePayrollService {
  static async getPayrollMetrics(companyId: string): Promise<PayrollMetrics> {
    try {
      const [employeesData, payrollData] = await Promise.all([
        db.select().from(employees).where(eq(employees.companyId, companyId)),
        db.select().from(employeePaystubs).where(eq(employeePaystubs.companyId, companyId))
      ]);

      const totalGrossPay = payrollData.reduce((sum, entry) => sum + parseFloat(entry.grossPay || '0'), 0);
      const totalNetPay = payrollData.reduce((sum, entry) => sum + parseFloat(entry.netPay || '0'), 0);
      const totalTaxes = payrollData.reduce((sum, entry) => sum + parseFloat(entry.federalTax || '0') + parseFloat(entry.stateTax || '0'), 0);

      return {
        totalGrossPay,
        totalNetPay,
        totalTaxes,
        totalEmployees: employeesData.length,
        avgSalary: employeesData.length > 0 ? totalGrossPay / employeesData.length : 0,
        payrollExpenses: totalGrossPay + totalTaxes,
        benefitsCost: payrollData.reduce((sum, entry) => sum + parseFloat(entry.benefits || '0'), 0)
      };
    } catch (error) {
      console.error('Error fetching payroll metrics:', error);
      throw error;
    }
  }

  static async getPayrollSummary(companyId: string, startDate?: string, endDate?: string): Promise<PayrollSummary> {
    try {
      const conditions = [eq(employeePaystubs.companyId, companyId)];
      if (startDate) conditions.push(gte(employeePaystubs.payPeriodStart, new Date(startDate)));
      if (endDate) conditions.push(lte(employeePaystubs.payPeriodEnd, new Date(endDate)));

      const payrollData = await db.select().from(employeePaystubs).where(and(...conditions));
      
      const totalGross = payrollData.reduce((sum, entry) => sum + parseFloat(entry.grossPay || '0'), 0);
      const totalNet = payrollData.reduce((sum, entry) => sum + parseFloat(entry.netPay || '0'), 0);
      const totalTaxes = payrollData.reduce((sum, entry) => sum + parseFloat(entry.taxes || '0'), 0);

      return {
        period: `${startDate || 'Beginning'} to ${endDate || 'Present'}`,
        totalGross: totalGross.toFixed(2),
        totalNet: totalNet.toFixed(2),
        totalTaxes: totalTaxes.toFixed(2),
        employeeCount: new Set(payrollData.map(entry => entry.employeeId)).size,
        averagePay: payrollData.length > 0 ? (totalGross / payrollData.length).toFixed(2) : '0.00'
      };
    } catch (error) {
      console.error('Error generating payroll summary:', error);
      throw error;
    }
  }

  static async processPayroll(companyId: string, payrollData: any) {
    try {
      const newPayrollEntry = await db.insert(payrollEntries).values({
        id: randomUUID(),
        companyId,
        employeeId: payrollData.employeeId,
        payPeriodStart: new Date(payrollData.payPeriodStart),
        payPeriodEnd: new Date(payrollData.payPeriodEnd),
        grossPay: payrollData.grossPay,
        netPay: payrollData.netPay,
        taxes: payrollData.taxes,
        benefits: payrollData.benefits || '0',
        deductions: payrollData.deductions || '0',
        hoursWorked: payrollData.hoursWorked || '0',
        overtimeHours: payrollData.overtimeHours || '0',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      return newPayrollEntry[0];
    } catch (error) {
      console.error('Error processing payroll:', error);
      throw error;
    }
  }

  static async getEmployeePaystubs(companyId: string, employeeId: string) {
    try {
      const paystubs = await db.select().from(payrollEntries)
        .where(and(
          eq(payrollEntries.companyId, companyId),
          eq(payrollEntries.employeeId, employeeId)
        ))
        .orderBy(desc(payrollEntries.payPeriodEnd));

      return paystubs.map(stub => ({
        id: stub.id,
        payPeriod: `${stub.payPeriodStart.toISOString().split('T')[0]} - ${stub.payPeriodEnd.toISOString().split('T')[0]}`,
        grossPay: parseFloat(stub.grossPay || '0').toFixed(2),
        netPay: parseFloat(stub.netPay || '0').toFixed(2),
        taxes: parseFloat(stub.taxes || '0').toFixed(2),
        deductions: parseFloat(stub.deductions || '0').toFixed(2),
        hoursWorked: parseFloat(stub.hoursWorked || '0').toFixed(1)
      }));
    } catch (error) {
      console.error('Error fetching employee paystubs:', error);
      throw error;
    }
  }
}

export const payrollService = new EnterprisePayrollService();