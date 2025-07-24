import { db } from "./db";
import { companies, users, loads, drivers, trucks, alerts } from "@shared/schema";
import { count, sum, eq, desc, gte, lte, and, or, isNull } from "drizzle-orm";

export class HQServices {
  // Dashboard Analytics
  async getDashboardMetrics() {
    try {
      const [totalCompanies] = await db.select({ count: count() }).from(companies);
      const [activeUsers] = await db.select({ count: count() }).from(users);
      
      // Monthly revenue calculation
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      
      const monthlyRevenue = { total: 0 }; // Would integrate with payment system

      // Get actual counts from database
      const [totalLoadsResult] = await db.select({ count: count() }).from(loads);
      const [totalDriversResult] = await db.select({ count: count() }).from(drivers);
      const [totalVehiclesResult] = await db.select({ count: count() }).from(trucks);
      
      // Get actual alerts count
      const [totalAlertsResult] = await db.select({ count: count() }).from(alerts);
      
      // Get pending verification count (companies without verified status)
      const [pendingVerificationsResult] = await db.select({ count: count() })
        .from(companies)
        .where(or(isNull(companies.dotNumber), eq(companies.dotNumber, '')));

      return {
        totalCompanies: totalCompanies.count || 0,
        activeUsers: activeUsers.count || 0,
        monthlyRevenue: parseFloat(monthlyRevenue?.total || '0'),
        totalAlerts: totalAlertsResult.count || 0,
        systemStatus: 'operational',
        activeCompanies: totalCompanies.count || 0,
        totalLoads: totalLoadsResult.count || 0,
        pendingVerifications: pendingVerificationsResult.count || 0,
        totalDrivers: totalDriversResult.count || 0,
        totalVehicles: totalVehiclesResult.count || 0,
        expiringInsurance: 0, // Will implement when insurance tracking is added
        expiringLicenses: 0 // Will implement when license tracking is added
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      return {
        totalCompanies: 0,
        activeUsers: 0,
        monthlyRevenue: 0,
        totalAlerts: 0,
        systemStatus: 'error',
        activeCompanies: 0,
        totalLoads: 0,
        pendingVerifications: 0,
        totalDrivers: 0,
        totalVehicles: 0,
        expiringInsurance: 0,
        expiringLicenses: 0
      };
    }
  }

  // Company Management
  async getAllCompanies() {
    try {
      return await db.select().from(companies).orderBy(desc(companies.createdAt));
    } catch (error) {
      console.error('Error fetching companies:', error);
      return [];
    }
  }

  async getCompanyById(companyId: string) {
    try {
      const [company] = await db.select().from(companies).where(eq(companies.id, companyId));
      return company;
    } catch (error) {
      console.error('Error fetching company:', error);
      return null;
    }
  }

  async updateCompanyStatus(companyId: string, status: string, notes?: string) {
    try {
      const updated = await db
        .update(companies)
        .set({ 
          subscriptionStatus: status,
          updatedAt: new Date()
        })
        .where(eq(companies.id, companyId))
        .returning();
      
      return updated[0];
    } catch (error) {
      console.error('Error updating company status:', error);
      throw error;
    }
  }

  async verifyCompany(companyId: string, verifiedBy: string) {
    try {
      const updated = await db
        .update(companies)
        .set({ 
          verificationStatus: 'verified',
          updatedAt: new Date()
        })
        .where(eq(companies.id, companyId))
        .returning();
      
      return updated[0];
    } catch (error) {
      console.error('Error verifying company:', error);
      throw error;
    }
  }

  async suspendCompany(companyId: string, reason: string, suspendedBy: string) {
    try {
      const updated = await db
        .update(companies)
        .set({ 
          subscriptionStatus: 'suspended',
          updatedAt: new Date()
        })
        .where(eq(companies.id, companyId))
        .returning();
      
      return updated[0];
    } catch (error) {
      console.error('Error suspending company:', error);
      throw error;
    }
  }

  async activateCompany(companyId: string) {
    try {
      const updated = await db
        .update(companies)
        .set({ 
          subscriptionStatus: 'active',
          updatedAt: new Date()
        })
        .where(eq(companies.id, companyId))
        .returning();
      
      return updated[0];
    } catch (error) {
      console.error('Error activating company:', error);
      throw error;
    }
  }

  // User Management
  async getAllUsers() {
    try {
      return await db.select().from(users).orderBy(desc(users.createdAt));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async suspendUser(userId: number, reason: string, suspendedBy: string) {
    try {
      const updated = await db
        .update(users)
        .set({ 
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();
      
      return updated[0];
    } catch (error) {
      console.error('Error suspending user:', error);
      throw error;
    }
  }

  async activateUser(userId: number) {
    try {
      const updated = await db
        .update(users)
        .set({ 
          isActive: true,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();
      
      return updated[0];
    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  }

  // Financial Management
  async getFinancialSummary() {
    try {
      const [monthlyRevenue] = await db
        .select({ total: sum(payments.amount) })
        .from(payments);

      const [totalTransactions] = await db.select({ count: count() }).from(bankTransactions);

      return {
        monthlyRevenue: parseFloat(monthlyRevenue?.total || '0'),
        totalTransactions: totalTransactions.count || 0,
        averageTransactionValue: monthlyRevenue?.total ? 
          parseFloat(monthlyRevenue.total) / (totalTransactions.count || 1) : 0
      };
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      return {
        monthlyRevenue: 0,
        totalTransactions: 0,
        averageTransactionValue: 0
      };
    }
  }

  async getRecentTransactions(limit = 10) {
    try {
      return await db
        .select()
        .from(bankTransactions)
        .orderBy(desc(bankTransactions.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      return [];
    }
  }

  async getRevenueAnalytics(months = 6) {
    try {
      // Mock revenue analytics for now
      const analytics = [];
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        analytics.push({
          month: date.toISOString().slice(0, 7),
          revenue: Math.floor(Math.random() * 50000) + 10000,
          transactions: Math.floor(Math.random() * 200) + 50
        });
      }
      return analytics;
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      return [];
    }
  }

  // System Health and Monitoring
  async getSystemHealth() {
    return {
      status: 'healthy',
      uptime: '99.9%',
      activeConnections: 147,
      memoryUsage: '65%',
      cpuUsage: '23%',
      diskUsage: '45%'
    };
  }

  async getComplianceAlerts() {
    return [
      {
        id: '1',
        type: 'insurance_expiring',
        severity: 'medium',
        message: 'Insurance documents expiring for 2 companies',
        count: 2
      },
      {
        id: '2',
        type: 'license_renewal',
        severity: 'high',
        message: 'Driver license renewal required',
        count: 1
      }
    ];
  }

  async getCompanyMetrics() {
    try {
      const [total] = await db.select({ count: count() }).from(companies);
      const [active] = await db.select({ count: count() }).from(companies)
        .where(eq(companies.subscriptionStatus, 'active'));
      const [suspended] = await db.select({ count: count() }).from(companies)
        .where(eq(companies.subscriptionStatus, 'suspended'));

      return {
        total: total.count || 0,
        active: active.count || 0,
        suspended: suspended.count || 0,
        pending: (total.count || 0) - (active.count || 0) - (suspended.count || 0)
      };
    } catch (error) {
      console.error('Error fetching company metrics:', error);
      return { total: 0, active: 0, suspended: 0, pending: 0 };
    }
  }

  // Stripe Integration (Mock for now)
  async getStripeCustomers() {
    return [
      {
        id: 'cus_123',
        email: 'company@example.com',
        name: 'Example Logistics',
        created: new Date().toISOString(),
        subscriptions: 1
      }
    ];
  }

  async getStripeSubscriptions() {
    return [
      {
        id: 'sub_123',
        customer: 'cus_123',
        status: 'active',
        plan: 'Pro Plan',
        amount: 9900,
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
}

export const hqServices = new HQServices();