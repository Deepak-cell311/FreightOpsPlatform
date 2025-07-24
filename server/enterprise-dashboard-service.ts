/**
 * Enterprise Dashboard Service - Live Implementation
 * Provides real database-backed dashboard analytics
 */

import { db } from './db';
import { loads, drivers, vehicles, companies, invoices, bills } from '../shared/schema';
import { eq, and, desc, sum, gte, lte, sql, count } from 'drizzle-orm';

export interface DashboardMetrics {
  totalRevenue: number;
  totalLoads: number;
  activeDrivers: number;
  activeVehicles: number;
  avgRevenuePerLoad: number;
  profitMargin: number;
  fuelEfficiency: number;
  onTimeDelivery: number;
}

export interface FleetAnalytics {
  utilizationRate: number;
  maintenanceAlerts: number;
  complianceScore: number;
  totalMiles: number;
  fuelCost: number;
  safetyScore: number;
}

export class EnterpriseDashboardService {
  static async getDashboardMetrics(companyId: string): Promise<DashboardMetrics> {
    try {
      const [loadsData, driversData, vehiclesData, invoicesData, billsData] = await Promise.all([
        db.select().from(loads).where(eq(loads.companyId, companyId)),
        db.select().from(drivers).where(eq(drivers.companyId, companyId)),
        db.select().from(vehicles).where(eq(vehicles.companyId, companyId)),
        db.select().from(invoices).where(eq(invoices.companyId, companyId)),
        db.select().from(bills).where(eq(bills.companyId, companyId))
      ]);

      const totalRevenue = invoicesData.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || '0'), 0);
      const totalExpenses = billsData.reduce((sum, bill) => sum + parseFloat(bill.totalAmount || '0'), 0);
      const activeDrivers = driversData.filter(d => d.status === 'active').length;
      const activeVehicles = vehiclesData.filter(v => v.status === 'active').length;

      return {
        totalRevenue,
        totalLoads: loadsData.length,
        activeDrivers,
        activeVehicles,
        avgRevenuePerLoad: loadsData.length > 0 ? totalRevenue / loadsData.length : 0,
        profitMargin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0,
        fuelEfficiency: this.calculateFuelEfficiency(vehiclesData),
        onTimeDelivery: this.calculateOnTimeDelivery(loadsData)
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  static async getFleetAnalytics(companyId: string): Promise<FleetAnalytics> {
    try {
      const [vehiclesData, driversData, billsData] = await Promise.all([
        db.select().from(vehicles).where(eq(vehicles.companyId, companyId)),
        db.select().from(drivers).where(eq(drivers.companyId, companyId)),
        db.select().from(bills).where(and(
          eq(bills.companyId, companyId),
          sql`${bills.vendorName} ILIKE '%fuel%'`
        ))
      ]);

      const totalMiles = vehiclesData.reduce((sum, v) => sum + (v.mileage || 0), 0);
      const fuelCost = billsData.reduce((sum, bill) => sum + parseFloat(bill.totalAmount || '0'), 0);
      
      return {
        utilizationRate: this.calculateUtilizationRate(vehiclesData),
        maintenanceAlerts: this.getMaintenanceAlerts(vehiclesData),
        complianceScore: this.calculateComplianceScore(driversData),
        totalMiles,
        fuelCost,
        safetyScore: this.calculateSafetyScore(driversData)
      };
    } catch (error) {
      console.error('Error fetching fleet analytics:', error);
      throw error;
    }
  }

  private static calculateFuelEfficiency(vehicles: any[]): number {
    if (vehicles.length === 0) return 0;
    const totalEfficiency = vehicles.reduce((sum, v) => sum + (v.fuelEfficiency || 7.0), 0);
    return totalEfficiency / vehicles.length;
  }

  private static calculateOnTimeDelivery(loads: any[]): number {
    if (loads.length === 0) return 100;
    const onTimeLoads = loads.filter(load => {
      if (!load.deliveryDate || !load.scheduledDelivery) return true;
      return new Date(load.deliveryDate) <= new Date(load.scheduledDelivery);
    });
    return (onTimeLoads.length / loads.length) * 100;
  }

  private static calculateUtilizationRate(vehicles: any[]): number {
    if (vehicles.length === 0) return 0;
    const activeVehicles = vehicles.filter(v => v.status === 'active').length;
    return (activeVehicles / vehicles.length) * 100;
  }

  private static getMaintenanceAlerts(vehicles: any[]): number {
    return vehicles.filter(v => {
      const nextService = new Date(v.nextServiceDate || '2099-12-31');
      const today = new Date();
      const daysUntilService = Math.ceil((nextService.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilService <= 30;
    }).length;
  }

  private static calculateComplianceScore(drivers: any[]): number {
    if (drivers.length === 0) return 100;
    const compliantDrivers = drivers.filter(d => {
      const licenseExpiry = new Date(d.licenseExpiry || '2099-12-31');
      const medicalExpiry = new Date(d.medicalCertExpiry || '2099-12-31');
      const today = new Date();
      return licenseExpiry > today && medicalExpiry > today;
    });
    return (compliantDrivers.length / drivers.length) * 100;
  }

  private static calculateSafetyScore(drivers: any[]): number {
    if (drivers.length === 0) return 100;
    const safeDrivers = drivers.filter(d => (d.violations?.length || 0) === 0);
    return (safeDrivers.length / drivers.length) * 100;
  }
}

export const dashboardService = new EnterpriseDashboardService();