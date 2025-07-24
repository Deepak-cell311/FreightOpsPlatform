import { db } from "./db";
import { 
  users, companies, drivers, trucks, loads, auditLogs, invoices, bills, loadAccessorials, loadExpenses, integrationConfigs,
  type User, type Company, type Driver, type Truck, type Load, type InsertAuditLog, type IntegrationConfig
} from "@shared/schema";
import {
  hqTenants, hqSystemMetrics, hqSupportTickets, hqBillingEvents, hqFeatureUsage, hqEmployees,
  type HQTenant, type InsertHQTenant, type HQSystemMetrics, type InsertHQSystemMetrics,
  type HQSupportTicket, type InsertHQSupportTicket, type HQBillingEvent, type InsertHQBillingEvent,
  type HQFeatureUsage, type InsertHQFeatureUsage
} from "@shared/schema/hq";
import { eq, and, desc, sql } from "drizzle-orm";
import type { PortCredentials, RailCredentials } from "./intermodal-tracking-service";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: Partial<User>): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<boolean>;
  
  getCompany(id: string): Promise<Company | undefined>;
  getCompanies(): Promise<Company[]>;
  createCompany(companyData: Partial<Company>): Promise<Company>;
  updateCompany(id: string, companyData: Partial<Company>): Promise<boolean>;
  
  // Missing methods that routes depend on
  getTransactionsByDateRange(companyId: string, startDate: Date, endDate: Date): Promise<any[]>;
  getRecentCompanies(): Promise<Company[]>;
  getSystemAlerts(): Promise<any[]>;
  createHRDocument(companyData: any): Promise<any>;
  updateCompanyRailsrApplication(companyId: string, applicationData: any): Promise<boolean>;
  
  // HR Integration Methods
  getGustoIntegration(companyId: string): Promise<any>;
  createGustoIntegration(integrationData: any): Promise<any>;
  updateGustoIntegration(companyId: string, integrationData: any): Promise<boolean>;
  
  getDrivers(companyId: string): Promise<Driver[]>;
  getDriversByCompanyId(companyId: string): Promise<Driver[]>;
  createDriver(driverData: Partial<Driver>): Promise<Driver>;
  addDriver(driverData: Partial<Driver>): Promise<Driver>;
  updateDriver(id: string, driverData: Partial<Driver>): Promise<Driver>;
  deleteDriver(id: string): Promise<boolean>;
  
  getTrucks(companyId: string): Promise<Truck[]>;
  getTrucksByCompanyId(companyId: string): Promise<Truck[]>;
  createTruck(truckData: Partial<Truck>): Promise<Truck>;
  addTruck(truckData: Partial<Truck>): Promise<Truck>;
  updateTruck(id: string, truckData: Partial<Truck>): Promise<Truck>;
  deleteTruck(id: string): Promise<boolean>;
  
  getLoads(companyId: string): Promise<Load[]>;
  getLoadsByCompanyId(companyId: string): Promise<Load[]>;
  createLoad(loadData: Partial<Load>): Promise<Load>;
  addLoad(loadData: Partial<Load>): Promise<Load>;
  updateLoad(id: string, loadData: Partial<Load>): Promise<Load>;
  deleteLoad(id: string): Promise<boolean>;
  
  // Invoice and billing methods
  getInvoicesByCompanyId(companyId: string): Promise<any[]>;
  addInvoice(invoiceData: any): Promise<any>;
  getBillsByCompanyId(companyId: string): Promise<any[]>;
  
  // Intermodal tracking credentials
  savePortCredentials(credentials: PortCredentials): Promise<void>;
  saveRailCredentials(credentials: RailCredentials): Promise<void>;
  getCompanyPortCredentials(companyId: string): Promise<PortCredentials[]>;
  getCompanyRailCredentials(companyId: string): Promise<RailCredentials[]>;
  removePortCredentials(companyId: string, portCode: string): Promise<void>;
  removeRailCredentials(companyId: string, railroad: string): Promise<void>;

  // Audit logging for admin actions
  addAuditLog(auditData: InsertAuditLog): Promise<void>;

  // HQ Management Functions
  getAllTenants(): Promise<HQTenant[]>;
  getTenant(companyId: string): Promise<HQTenant | undefined>;
  createTenant(tenantData: InsertHQTenant): Promise<HQTenant>;
  updateTenant(companyId: string, tenantData: Partial<HQTenant>): Promise<boolean>;
  updateTenantMetrics(companyId: string, metrics: Partial<HQTenant>): Promise<boolean>;
  
  // System Metrics
  getLatestSystemMetrics(): Promise<HQSystemMetrics | undefined>;
  createSystemMetrics(metricsData: InsertHQSystemMetrics): Promise<HQSystemMetrics>;
  getSystemMetricsHistory(days: number): Promise<HQSystemMetrics[]>;
  
  // Support Tickets
  getAllSupportTickets(): Promise<HQSupportTicket[]>;
  getSupportTicketsByCompany(companyId: string): Promise<HQSupportTicket[]>;
  createSupportTicket(ticketData: InsertHQSupportTicket): Promise<HQSupportTicket>;
  updateSupportTicket(ticketId: string, ticketData: Partial<HQSupportTicket>): Promise<boolean>;
  
  // Billing Events
  createBillingEvent(eventData: InsertHQBillingEvent): Promise<HQBillingEvent>;
  getBillingEventsByCompany(companyId: string): Promise<HQBillingEvent[]>;
  
  // Feature Usage Tracking
  trackFeatureUsage(companyId: string, featureName: string, featureCategory: string): Promise<void>;
  getFeatureUsageByCompany(companyId: string): Promise<HQFeatureUsage[]>;
  getFeatureUsageStats(): Promise<any>;

  // Missing methods from consolidated routes
  getBankingApplications(companyId: string): Promise<any[]>;
  createBankingApplication(applicationData: any): Promise<any>;
  getCompanySetting(companyId: string, settingName: string): Promise<any>;
  updateCompanySetting(companyId: string, settingName: string, value: any): Promise<boolean>;

  // Driver mobile app methods
  getDriverLoadHistory(driverId: string, startDate: Date): Promise<any[]>;
  getDriverCurrentLoads(driverId: string): Promise<any[]>;
  getLoadBilling(loadId: string): Promise<any>;
  updateLoadBilling(loadId: string, billingData: any): Promise<boolean>;
  getLoadAccessorials(loadId: string): Promise<any[]>;
  createLoadAccessorial(accessorialData: any): Promise<any>;
  deleteLoadAccessorial(accessorialId: string): Promise<boolean>;
  getLoadExpenses(loadId: string): Promise<any[]>;
  createLoadExpense(expenseData: any): Promise<any>;
  deleteLoadExpense(expenseId: string): Promise<boolean>;
  getDispatchActions(companyId: string): Promise<any[]>;
  createDispatchAction(actionData: any): Promise<any>;
  updateDispatchAction(actionId: string, actionData: any): Promise<boolean>;
  deleteDispatchAction(actionId: string): Promise<boolean>;
  saveLoadDispatchActions(loadId: string, actions: any[]): Promise<boolean>;
  getLoadDispatchActions(loadId: string): Promise<any[]>;
  updateTruck(truckId: string, truckData: any): Promise<boolean>;
  deleteTruck(truckId: string): Promise<boolean>;
  updateDriver(driverId: string, driverData: any): Promise<boolean>;
  deleteDriver(driverId: string): Promise<boolean>;
  updateLoad(loadId: string, loadData: any): Promise<boolean>;
  deleteLoad(loadId: string): Promise<boolean>;
  getCompanyReports(companyId: string): Promise<any[]>;
  createReport(reportData: any): Promise<any>;
  getReport(reportId: string): Promise<any>;
  getCompanyLoads(companyId: string): Promise<Load[]>;
  getCompanyDrivers(companyId: string): Promise<Driver[]>;
  getCompanyTrucks(companyId: string): Promise<Truck[]>;
  getCompanyById(companyId: string): Promise<Company | undefined>;
  getLoadById(loadId: string): Promise<Load | undefined>;
  createLocationUpdate(updateData: any): Promise<any>;
  getLocationUpdates(companyId: string): Promise<any[]>;
  createHandoffEvent(eventData: any): Promise<any>;
  getHandoffEvents(companyId: string): Promise<any[]>;
  createGeofence(geofenceData: any): Promise<any>;
  getGeofences(companyId: string): Promise<any[]>;
  updateLoadStatus(loadId: string, status: string): Promise<boolean>;
  getAllCompanies(): Promise<Company[]>;
  getAllDriversAcrossCompanies(): Promise<Driver[]>;
  getAllLoadsAcrossCompanies(): Promise<Load[]>;
  getAllUsers(): Promise<User[]>;
  
  // ELD Integration methods
  getEldIntegrations(companyId: string): Promise<any[]>;
  createEldIntegration(companyId: string, integrationData: any): Promise<any>;
  updateEldIntegration(companyId: string, integrationId: number, updates: any): Promise<any>;
  deleteEldIntegration(companyId: string, integrationId: number): Promise<boolean>;
  
  // Load Board Integration methods
  getLoadBoardIntegrations(companyId: string): Promise<any[]>;
  createLoadBoardIntegration(companyId: string, integrationData: any): Promise<any>;
  updateLoadBoardIntegration(companyId: string, integrationId: number, updates: any): Promise<any>;
  deleteLoadBoardIntegration(companyId: string, integrationId: number): Promise<boolean>;
  
  // Company helper methods
  getCompaniesByUserId(userId: string): Promise<Company[]>;
  
  // HQ Employee Management
  getAllHQEmployees(): Promise<any[]>;
  getHQEmployeeById(employeeId: string): Promise<any>;
  getHQEmployeeByEmail(email: string): Promise<any>;
  createHQEmployee(employeeData: any): Promise<any>;
  updateHQEmployee(employeeId: string, employeeData: any): Promise<any>;
  
  // Tenant HR Management
  getDriverApplications(companyId: string, filters: any): Promise<any[]>;
  getDriverApplication(applicationId: string, companyId: string): Promise<any>;
  updateDriverApplication(applicationId: string, updateData: any): Promise<any>;
  createGustoIntegration(integrationData: any): Promise<any>;
  getGustoIntegration(companyId: string): Promise<any>;
  updateGustoIntegration(companyId: string, updateData: any): Promise<any>;
  getOnboardingStatus(applicationId: string, companyId: string): Promise<any>;
  createEmployeeDocument(documentData: any): Promise<any>;
  getEmployeeDocuments(employeeId: string, companyId: string): Promise<any[]>;
  getDriverByEmail(email: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const [user] = await db.insert(users).values(userData as any).returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<boolean> {
    try {
      await db.update(users).set(userData).where(eq(users.id, id));
      return true;
    } catch (error) {
      console.error('Failed to update user:', error);
      return false;
    }
  }

  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
  }

  async createCompany(companyData: Partial<Company>): Promise<Company> {
    const [company] = await db.insert(companies).values(companyData as any).returning();
    return company;
  }

  async updateCompany(id: string, companyData: Partial<Company>): Promise<boolean> {
    try {
      await db.update(companies).set(companyData).where(eq(companies.id, id));
      return true;
    } catch (error) {
      console.error('Failed to update company:', error);
      return false;
    }
  }

  async getTransactionsByDateRange(companyId: string, startDate: Date, endDate: Date): Promise<any[]> {
    return [];
  }

  async getRecentCompanies(): Promise<Company[]> {
    try {
      const recentCompanies = await db
        .select()
        .from(companies)
        .orderBy(desc(companies.createdAt))
        .limit(10);
      return recentCompanies;
    } catch (error) {
      console.error("Error fetching recent companies:", error);
      return [];
    }
  }

  async getSystemAlerts(): Promise<any[]> {
    return [];
  }

  async createHRDocument(companyData: any): Promise<any> {
    return { id: Date.now().toString(), success: true };
  }

  async updateCompanyRailsrApplication(companyId: string, applicationData: any): Promise<boolean> {
    try {
      await db.update(companies).set({ railsrApplicationId: applicationData.applicationId }).where(eq(companies.id, companyId));
      return true;
    } catch (error) {
      console.error("Error updating company railsr application:", error);
      return false;
    }
  }

  async getDrivers(companyId: string): Promise<Driver[]> {
    return await db.select().from(drivers).where(eq(drivers.companyId, companyId));
  }

  async getDriversByCompanyId(companyId: string): Promise<Driver[]> {
    return await db.select().from(drivers).where(eq(drivers.companyId, companyId));
  }

  async createDriver(driverData: Partial<Driver>): Promise<Driver> {
    const [driver] = await db.insert(drivers).values(driverData as any).returning();
    return driver;
  }

  async addDriver(driverData: Partial<Driver>): Promise<Driver> {
    const [driver] = await db.insert(drivers).values(driverData as any).returning();
    return driver;
  }

  async updateDriver(id: string, driverData: Partial<Driver>): Promise<Driver> {
    const [driver] = await db.update(drivers).set(driverData).where(eq(drivers.id, id)).returning();
    return driver;
  }

  async deleteDriver(id: string): Promise<boolean> {
    try {
      await db.delete(drivers).where(eq(drivers.id, id));
      return true;
    } catch (error) {
      console.error('Failed to delete driver:', error);
      return false;
    }
  }

  async getTrucks(companyId: string): Promise<Truck[]> {
    return await db.select().from(trucks).where(eq(trucks.companyId, companyId));
  }

  async getTrucksByCompanyId(companyId: string): Promise<Truck[]> {
    return await db.select().from(trucks).where(eq(trucks.companyId, companyId));
  }

  async createTruck(truckData: Partial<Truck>): Promise<Truck> {
    const [truck] = await db.insert(trucks).values(truckData as any).returning();
    return truck;
  }

  async addTruck(truckData: Partial<Truck>): Promise<Truck> {
    const [truck] = await db.insert(trucks).values(truckData as any).returning();
    return truck;
  }

  async updateTruck(id: string, truckData: Partial<Truck>): Promise<Truck> {
    const [truck] = await db.update(trucks).set(truckData).where(eq(trucks.id, id)).returning();
    return truck;
  }

  async deleteTruck(id: string): Promise<boolean> {
    try {
      await db.delete(trucks).where(eq(trucks.id, id));
      return true;
    } catch (error) {
      console.error('Failed to delete truck:', error);
      return false;
    }
  }

  async getLoads(companyId: string): Promise<Load[]> {
    return await db.select().from(loads).where(eq(loads.companyId, companyId));
  }

  async getLoadsByCompanyId(companyId: string): Promise<Load[]> {
    return await db.select().from(loads).where(eq(loads.companyId, companyId));
  }

  async createLoad(loadData: Partial<Load>): Promise<Load> {
    const [load] = await db.insert(loads).values(loadData as any).returning();
    return load;
  }

  async addLoad(loadData: Partial<Load>): Promise<Load> {
    const [load] = await db.insert(loads).values(loadData as any).returning();
    return load;
  }

  async updateLoad(id: string, loadData: Partial<Load>): Promise<Load> {
    const [load] = await db.update(loads).set(loadData).where(eq(loads.id, id)).returning();
    return load;
  }

  async deleteLoad(id: string): Promise<boolean> {
    try {
      await db.delete(loads).where(eq(loads.id, id));
      return true;
    } catch (error) {
      console.error('Failed to delete load:', error);
      return false;
    }
  }

  async getInvoicesByCompanyId(companyId: string): Promise<any[]> {
    try {
      // Query invoices table from schema
      const invoices = await db.select().from(invoices).where(eq(invoices.companyId, companyId));
      return invoices;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  }

  async addInvoice(invoiceData: any): Promise<any> {
    try {
      const [invoice] = await db.insert(invoices).values(invoiceData).returning();
      return invoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  async getBillsByCompanyId(companyId: string): Promise<any[]> {
    try {
      // Query bills table from schema
      const bills = await db.select().from(bills).where(eq(bills.companyId, companyId));
      return bills;
    } catch (error) {
      console.error('Error fetching bills:', error);
      return [];
    }
  }



  // Intermodal tracking credentials storage (in-memory for now, can be moved to DB later)
  private portCredentialsStore: Map<string, PortCredentials[]> = new Map();
  private railCredentialsStore: Map<string, RailCredentials[]> = new Map();

  async savePortCredentials(credentials: PortCredentials): Promise<void> {
    const companyCredentials = this.portCredentialsStore.get(credentials.companyId) || [];
    const existingIndex = companyCredentials.findIndex(c => c.portCode === credentials.portCode);
    
    if (existingIndex >= 0) {
      companyCredentials[existingIndex] = credentials;
    } else {
      companyCredentials.push(credentials);
    }
    
    this.portCredentialsStore.set(credentials.companyId, companyCredentials);
  }

  async saveRailCredentials(credentials: RailCredentials): Promise<void> {
    const companyCredentials = this.railCredentialsStore.get(credentials.companyId) || [];
    const existingIndex = companyCredentials.findIndex(c => c.railroad === credentials.railroad);
    
    if (existingIndex >= 0) {
      companyCredentials[existingIndex] = credentials;
    } else {
      companyCredentials.push(credentials);
    }
    
    this.railCredentialsStore.set(credentials.companyId, companyCredentials);
  }

  async getCompanyPortCredentials(companyId: string): Promise<PortCredentials[]> {
    return this.portCredentialsStore.get(companyId) || [];
  }

  async getCompanyRailCredentials(companyId: string): Promise<RailCredentials[]> {
    return this.railCredentialsStore.get(companyId) || [];
  }

  async removePortCredentials(companyId: string, portCode: string): Promise<void> {
    const companyCredentials = this.portCredentialsStore.get(companyId) || [];
    const filtered = companyCredentials.filter(c => c.portCode !== portCode);
    this.portCredentialsStore.set(companyId, filtered);
  }

  async removeRailCredentials(companyId: string, railroad: string): Promise<void> {
    const companyCredentials = this.railCredentialsStore.get(companyId) || [];
    const filtered = companyCredentials.filter(c => c.railroad !== railroad);
    this.railCredentialsStore.set(companyId, filtered);
  }

  // HQ Management Functions Implementation
  async getAllTenants(): Promise<HQTenant[]> {
    return await db.select().from(hqTenants).orderBy(desc(hqTenants.createdAt));
  }

  async getTenant(companyId: string): Promise<HQTenant | undefined> {
    const [tenant] = await db.select().from(hqTenants).where(eq(hqTenants.companyId, companyId));
    return tenant || undefined;
  }

  async createTenant(tenantData: InsertHQTenant): Promise<HQTenant> {
    const [tenant] = await db.insert(hqTenants).values(tenantData).returning();
    return tenant;
  }

  async updateTenant(companyId: string, tenantData: Partial<HQTenant>): Promise<boolean> {
    const result = await db.update(hqTenants)
      .set({ ...tenantData, updatedAt: new Date() })
      .where(eq(hqTenants.companyId, companyId));
    return (result.rowCount || 0) > 0;
  }

  async updateTenantMetrics(companyId: string, metrics: Partial<HQTenant>): Promise<boolean> {
    const result = await db.update(hqTenants)
      .set({ ...metrics, updatedAt: new Date() })
      .where(eq(hqTenants.companyId, companyId));
    return (result.rowCount || 0) > 0;
  }

  // System Metrics Implementation
  async getLatestSystemMetrics(): Promise<HQSystemMetrics | undefined> {
    const [metrics] = await db.select().from(hqSystemMetrics)
      .orderBy(desc(hqSystemMetrics.metricDate))
      .limit(1);
    return metrics || undefined;
  }

  async createSystemMetrics(metricsData: InsertHQSystemMetrics): Promise<HQSystemMetrics> {
    const [metrics] = await db.insert(hqSystemMetrics).values(metricsData).returning();
    return metrics;
  }

  async getSystemMetricsHistory(days: number): Promise<HQSystemMetrics[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return await db.select().from(hqSystemMetrics)
      .where(sql`${hqSystemMetrics.metricDate} >= ${cutoffDate.toISOString().split('T')[0]}`)
      .orderBy(desc(hqSystemMetrics.metricDate));
  }

  // Support Tickets Implementation
  async getAllSupportTickets(): Promise<HQSupportTicket[]> {
    return await db.select().from(hqSupportTickets)
      .orderBy(desc(hqSupportTickets.createdAt));
  }

  async getSupportTicketsByCompany(companyId: string): Promise<HQSupportTicket[]> {
    return await db.select().from(hqSupportTickets)
      .where(eq(hqSupportTickets.companyId, companyId))
      .orderBy(desc(hqSupportTickets.createdAt));
  }

  async createSupportTicket(ticketData: InsertHQSupportTicket): Promise<HQSupportTicket> {
    // Generate ticket number
    const ticketCount = await db.select({ count: sql`count(*)` }).from(hqSupportTickets);
    const ticketNumber = `TICKET-${Date.now()}-${String(Number(ticketCount[0].count) + 1).padStart(4, '0')}`;
    
    const [ticket] = await db.insert(hqSupportTickets)
      .values({ ...ticketData, ticketNumber })
      .returning();
    return ticket;
  }

  async updateSupportTicket(ticketId: string, ticketData: Partial<HQSupportTicket>): Promise<boolean> {
    const result = await db.update(hqSupportTickets)
      .set({ ...ticketData, updatedAt: new Date() })
      .where(eq(hqSupportTickets.id, ticketId));
    return (result.rowCount || 0) > 0;
  }

  // Billing Events Implementation
  async createBillingEvent(eventData: InsertHQBillingEvent): Promise<HQBillingEvent> {
    const [event] = await db.insert(hqBillingEvents).values(eventData).returning();
    return event;
  }

  async getBillingEventsByCompany(companyId: string): Promise<HQBillingEvent[]> {
    return await db.select().from(hqBillingEvents)
      .where(eq(hqBillingEvents.companyId, companyId))
      .orderBy(desc(hqBillingEvents.createdAt));
  }

  // Feature Usage Tracking Implementation
  async trackFeatureUsage(companyId: string, featureName: string, featureCategory: string): Promise<void> {
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM format
    
    // Check if usage record exists for this month
    const [existingUsage] = await db.select().from(hqFeatureUsage)
      .where(and(
        eq(hqFeatureUsage.companyId, companyId),
        eq(hqFeatureUsage.featureName, featureName),
        eq(hqFeatureUsage.usageMonth, currentMonth)
      ));

    if (existingUsage) {
      // Update existing record
      await db.update(hqFeatureUsage)
        .set({
          usageCount: sql`${hqFeatureUsage.usageCount} + 1`,
          lastUsedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(hqFeatureUsage.id, existingUsage.id));
    } else {
      // Create new record
      await db.insert(hqFeatureUsage).values({
        companyId,
        featureName,
        featureCategory,
        usageCount: 1,
        firstUsedAt: new Date(),
        lastUsedAt: new Date(),
        usageMonth: currentMonth
      });
    }
  }

  async getFeatureUsageByCompany(companyId: string): Promise<HQFeatureUsage[]> {
    return await db.select().from(hqFeatureUsage)
      .where(eq(hqFeatureUsage.companyId, companyId))
      .orderBy(desc(hqFeatureUsage.lastUsedAt));
  }

  async getFeatureUsageStats(): Promise<any> {
    const results = await db.select({
      featureName: hqFeatureUsage.featureName,
      featureCategory: hqFeatureUsage.featureCategory,
      totalUsage: sql`sum(${hqFeatureUsage.usageCount})`,
      uniqueCompanies: sql`count(distinct ${hqFeatureUsage.companyId})`,
      lastUsed: sql`max(${hqFeatureUsage.lastUsedAt})`
    })
    .from(hqFeatureUsage)
    .groupBy(hqFeatureUsage.featureName, hqFeatureUsage.featureCategory)
    .orderBy(sql`sum(${hqFeatureUsage.usageCount}) desc`);

    return results;
  }

  // Banking Applications
  async getBankingApplications(companyId: string): Promise<any[]> {
    try {
      // Get company's banking application status from company record
      const [company] = await db.select().from(companies).where(eq(companies.id, companyId));
      
      if (!company) return [];
      
      return [{
        id: `banking_app_${companyId}`,
        companyId,
        status: company.railsrApplicationId ? 'approved' : 'pending',
        applicationId: company.railsrApplicationId || null,
        createdAt: company.createdAt,
        type: 'business_banking'
      }];
    } catch (error) {
      console.error('Error fetching banking applications:', error);
      return [];
    }
  }

  async createBankingApplication(applicationData: any): Promise<any> {
    try {
      const applicationId = `railsr_app_${Date.now()}`;
      
      // Update company with application ID
      await db.update(companies)
        .set({ 
          railsrApplicationId: applicationId,
          updatedAt: new Date()
        })
        .where(eq(companies.id, applicationData.companyId));
      
      return {
        id: applicationId,
        companyId: applicationData.companyId,
        status: 'submitted',
        applicationId,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Error creating banking application:', error);
      throw error;
    }
  }

  // Company Settings
  async getCompanySetting(companyId: string, settingName: string): Promise<any> {
    try {
      // For now, return common default settings since we don't have a settings table yet
      const defaultSettings: { [key: string]: any } = {
        'company_name': '',
        'company_address': '',
        'company_phone': '',
        'company_email': '',
        'notification_preferences': 'email',
        'timezone': 'America/New_York',
        'currency': 'USD',
        'auto_dispatch': false,
        'require_signature': true,
        'enable_tracking': true
      };
      
      return defaultSettings[settingName] || null;
    } catch (error) {
      console.error('Error getting company setting:', error);
      return null;
    }
  }

  async updateCompanySetting(companyId: string, settingName: string, value: any): Promise<boolean> {
    try {
      // In production, this would update a company_settings table
      // For now, we'll update the company record directly where applicable
      if (settingName === 'company_name') {
        await db.update(companies).set({ name: value }).where(eq(companies.id, companyId));
      } else if (settingName === 'company_email') {
        await db.update(companies).set({ email: value }).where(eq(companies.id, companyId));
      } else if (settingName === 'company_phone') {
        await db.update(companies).set({ phone: value }).where(eq(companies.id, companyId));
      }
      // For other settings, they would be stored in a separate settings table
      
      return true;
    } catch (error) {
      console.error('Error updating company setting:', error);
      return false;
    }
  }

  // Load Billing
  async getLoadBilling(loadId: string): Promise<any> {
    try {
      // Query load billing from invoices table
      const [billing] = await db.select().from(invoices).where(eq(invoices.loadId, loadId));
      return billing || null;
    } catch (error) {
      console.error('Error fetching load billing:', error);
      return null;
    }
  }

  async updateLoadBilling(loadId: string, billingData: any): Promise<boolean> {
    try {
      // Update or create invoice for load billing
      await db.update(invoices).set(billingData).where(eq(invoices.loadId, loadId));
      return true;
    } catch (error) {
      console.error('Error updating load billing:', error);
      return false;
    }
  }

  // Load Accessorials
  async getLoadAccessorials(loadId: string): Promise<any[]> {
    try {
      // Query load accessorials from loadAccessorials table
      const accessorials = await db.select().from(loadAccessorials).where(eq(loadAccessorials.loadId, loadId));
      return accessorials;
    } catch (error) {
      console.error('Error fetching load accessorials:', error);
      return [];
    }
  }

  async createLoadAccessorial(accessorialData: any): Promise<any> {
    try {
      const [accessorial] = await db.insert(loadAccessorials).values(accessorialData).returning();
      return accessorial;
    } catch (error) {
      console.error('Error creating load accessorial:', error);
      throw error;
    }
  }

  async deleteLoadAccessorial(accessorialId: string): Promise<boolean> {
    try {
      await db.delete(loadAccessorials).where(eq(loadAccessorials.id, accessorialId));
      return true;
    } catch (error) {
      console.error('Error deleting load accessorial:', error);
      return false;
    }
  }

  // Load Expenses
  async getLoadExpenses(loadId: string): Promise<any[]> {
    try {
      // Query load expenses from loadExpenses table
      const expenses = await db.select().from(loadExpenses).where(eq(loadExpenses.loadId, loadId));
      return expenses;
    } catch (error) {
      console.error('Error fetching load expenses:', error);
      return [];
    }
  }

  async createLoadExpense(expenseData: any): Promise<any> {
    try {
      const [expense] = await db.insert(loadExpenses).values(expenseData).returning();
      return expense;
    } catch (error) {
      console.error('Error creating load expense:', error);
      throw error;
    }
  }

  async deleteLoadExpense(expenseId: string): Promise<boolean> {
    try {
      await db.delete(loadExpenses).where(eq(loadExpenses.id, expenseId));
      return true;
    } catch (error) {
      console.error('Error deleting load expense:', error);
      return false;
    }
  }

  // Dispatch Actions
  async getDispatchActions(companyId: string): Promise<any[]> {
    return [];
  }

  async createDispatchAction(actionData: any): Promise<any> {
    return { id: 'act_' + Date.now(), ...actionData };
  }

  async updateDispatchAction(actionId: string, actionData: any): Promise<boolean> {
    return true;
  }

  async deleteDispatchAction(actionId: string): Promise<boolean> {
    return true;
  }

  async saveLoadDispatchActions(loadId: string, actions: any[]): Promise<boolean> {
    return true;
  }

  async getLoadDispatchActions(loadId: string): Promise<any[]> {
    return [];
  }

  // Truck Operations
  async updateTruck(truckId: string, truckData: any): Promise<boolean> {
    try {
      await db.update(trucks).set(truckData).where(eq(trucks.id, truckId));
      return true;
    } catch (error) {
      console.error('Failed to update truck:', error);
      return false;
    }
  }

  async deleteTruck(truckId: string): Promise<boolean> {
    try {
      await db.delete(trucks).where(eq(trucks.id, truckId));
      return true;
    } catch (error) {
      console.error('Failed to delete truck:', error);
      return false;
    }
  }

  // Driver Operations
  async updateDriver(driverId: string, driverData: any): Promise<boolean> {
    try {
      await db.update(drivers).set(driverData).where(eq(drivers.id, driverId));
      return true;
    } catch (error) {
      console.error('Failed to update driver:', error);
      return false;
    }
  }

  async deleteDriver(driverId: string): Promise<boolean> {
    try {
      await db.delete(drivers).where(eq(drivers.id, driverId));
      return true;
    } catch (error) {
      console.error('Failed to delete driver:', error);
      return false;
    }
  }

  // Load Operations
  async updateLoad(loadId: string, loadData: any): Promise<boolean> {
    try {
      await db.update(loads).set(loadData).where(eq(loads.id, loadId));
      return true;
    } catch (error) {
      console.error('Failed to update load:', error);
      return false;
    }
  }

  async deleteLoad(loadId: string): Promise<boolean> {
    try {
      await db.delete(loads).where(eq(loads.id, loadId));
      return true;
    } catch (error) {
      console.error('Failed to delete load:', error);
      return false;
    }
  }

  // Reports
  async getCompanyReports(companyId: string): Promise<any[]> {
    return [];
  }

  async createReport(reportData: any): Promise<any> {
    return { id: 'rep_' + Date.now(), ...reportData };
  }

  async getReport(reportId: string): Promise<any> {
    return null;
  }

  // Company Data Access
  async getCompanyLoads(companyId: string): Promise<Load[]> {
    return await this.getLoads(companyId);
  }

  async getCompanyDrivers(companyId: string): Promise<Driver[]> {
    return await this.getDrivers(companyId);
  }

  async getCompanyTrucks(companyId: string): Promise<Truck[]> {
    return await this.getTrucks(companyId);
  }

  async getCompanyById(companyId: string): Promise<Company | undefined> {
    return await this.getCompany(companyId);
  }

  async getLoadById(loadId: string): Promise<Load | undefined> {
    const [load] = await db.select().from(loads).where(eq(loads.id, loadId));
    return load || undefined;
  }

  // Location and Tracking
  async createLocationUpdate(updateData: any): Promise<any> {
    return { id: 'loc_' + Date.now(), ...updateData };
  }

  async getLocationUpdates(companyId: string): Promise<any[]> {
    return [];
  }

  async createHandoffEvent(eventData: any): Promise<any> {
    return { id: 'hoff_' + Date.now(), ...eventData };
  }

  async getHandoffEvents(companyId: string): Promise<any[]> {
    return [];
  }

  async createGeofence(geofenceData: any): Promise<any> {
    return { id: 'geo_' + Date.now(), ...geofenceData };
  }

  async getGeofences(companyId: string): Promise<any[]> {
    return [];
  }

  async updateLoadStatus(loadId: string, status: string): Promise<boolean> {
    try {
      await db.update(loads).set({ status }).where(eq(loads.id, loadId));
      return true;
    } catch (error) {
      console.error('Failed to update load status:', error);
      return false;
    }
  }

  // Global Data Access for HQ
  async getAllCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
  }

  async getAllDriversAcrossCompanies(): Promise<Driver[]> {
    return await db.select().from(drivers);
  }

  async getAllLoadsAcrossCompanies(): Promise<Load[]> {
    return await db.select().from(loads);
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getDriverLoadHistory(driverId: string, startDate: Date): Promise<any[]> {
    // Get loads completed by driver since startDate
    const driverLoads = await db
      .select()
      .from(loads)
      .where(eq(loads.driverId, parseInt(driverId)))
      .orderBy(loads.createdAt);
    
    return driverLoads.map(load => ({
      id: load.id,
      loadNumber: load.loadNumber,
      completedAt: load.deliveryDate || load.createdAt,
      pickupCity: load.pickupCity,
      pickupState: load.pickupState,
      deliveryCity: load.deliveryCity,
      deliveryState: load.deliveryState,
      miles: load.miles || 0,
      pay: load.driverPay || 0,
      commodity: load.commodity,
      weight: load.weight,
      deliveredOnTime: true, // Would be calculated from actual vs scheduled delivery
      customerRating: 5.0, // Would come from customer feedback
      bonusEarned: 0 // Would be calculated based on performance
    }));
  }

  async getDriverCurrentLoads(driverId: string): Promise<any[]> {
    // Get active loads assigned to driver
    const currentLoads = await db
      .select()
      .from(loads)
      .where(eq(loads.driverId, parseInt(driverId)));
    
    return currentLoads.filter(load => 
      ['assigned', 'in_transit', 'at_pickup', 'loaded', 'at_delivery'].includes(load.status || '')
    );
  }

  // ELD Integration methods - Use integration_configs table
  async getEldIntegrations(companyId: string): Promise<any[]> {
    try {
      // Query integration_configs table for ELD integrations
      const integrations = await db.select().from(integrationConfigs)
        .where(and(
          eq(integrationConfigs.companyId, companyId),
          eq(integrationConfigs.category, 'eld_systems')
        ));
      return integrations;
    } catch (error) {
      console.error('Error fetching ELD integrations:', error);
      return [];
    }
  }

  async createEldIntegration(companyId: string, integrationData: any): Promise<any> {
    try {
      const [integration] = await db.insert(integrationConfigs).values({
        companyId,
        serviceName: integrationData.provider,
        category: 'eld_systems',
        config: integrationData,
        isActive: integrationData.isActive || true,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      return integration;
    } catch (error) {
      console.error('Error creating ELD integration:', error);
      throw error;
    }
  }

  async updateEldIntegration(companyId: string, integrationId: number, updates: any): Promise<any> {
    try {
      const [integration] = await db.update(integrationConfigs)
        .set({ config: updates, updatedAt: new Date() })
        .where(and(
          eq(integrationConfigs.id, integrationId.toString()),
          eq(integrationConfigs.companyId, companyId)
        ))
        .returning();
      return integration;
    } catch (error) {
      console.error('Error updating ELD integration:', error);
      throw error;
    }
  }

  async deleteEldIntegration(companyId: string, integrationId: number): Promise<boolean> {
    try {
      await db.delete(integrationConfigs)
        .where(and(
          eq(integrationConfigs.id, integrationId.toString()),
          eq(integrationConfigs.companyId, companyId)
        ));
      return true;
    } catch (error) {
      console.error('Error deleting ELD integration:', error);
      return false;
    }
  }

  // Load Board Integration methods - Use integration_configs table
  async getLoadBoardIntegrations(companyId: string): Promise<any[]> {
    try {
      // Query integration_configs table for load board integrations
      const integrations = await db.select().from(integrationConfigs)
        .where(and(
          eq(integrationConfigs.companyId, companyId),
          eq(integrationConfigs.category, 'load_boards')
        ));
      return integrations;
    } catch (error) {
      console.error('Error fetching load board integrations:', error);
      return [];
    }
  }

  async createLoadBoardIntegration(companyId: string, integrationData: any): Promise<any> {
    try {
      const [integration] = await db.insert(integrationConfigs).values({
        companyId,
        serviceName: integrationData.provider,
        category: 'load_boards',
        config: integrationData,
        isActive: integrationData.isActive || true,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      return integration;
    } catch (error) {
      console.error('Error creating load board integration:', error);
      throw error;
    }
  }

  async updateLoadBoardIntegration(companyId: string, integrationId: number, updates: any): Promise<any> {
    try {
      const [integration] = await db.update(integrationConfigs)
        .set({ config: updates, updatedAt: new Date() })
        .where(and(
          eq(integrationConfigs.id, integrationId.toString()),
          eq(integrationConfigs.companyId, companyId)
        ))
        .returning();
      return integration;
    } catch (error) {
      console.error('Error updating load board integration:', error);
      throw error;
    }
  }

  async deleteLoadBoardIntegration(companyId: string, integrationId: number): Promise<boolean> {
    try {
      await db.delete(integrationConfigs)
        .where(and(
          eq(integrationConfigs.id, integrationId.toString()),
          eq(integrationConfigs.companyId, companyId)
        ));
      return true;
    } catch (error) {
      console.error('Error deleting load board integration:', error);
      return false;
    }
  }
  
  async getCompaniesByUserId(userId: string): Promise<Company[]> {
    try {
      const userCompanies = await db
        .select()
        .from(companies)
        .where(eq(companies.ownerId, userId));
      return userCompanies;
    } catch (error) {
      console.error("Error fetching user companies:", error);
      return [];
    }
  }

  async addAuditLog(auditData: InsertAuditLog): Promise<void> {
    try {
      await db.insert(auditLogs).values(auditData);
    } catch (error) {
      console.error('Failed to insert audit log:', error);
      throw error;
    }
  }

  // HQ Employee Management Implementation
  async getAllHQEmployees(): Promise<any[]> {
    try {
      const employees = await db.query.hqEmployees.findMany({
        where: eq(hqEmployees.isActive, true)
      });
      return employees;
    } catch (error) {
      console.error('Error fetching HQ employees:', error);
      return [];
    }
  }

  async getHQEmployeeById(employeeId: string): Promise<any> {
    try {
      const employee = await db.query.hqEmployees.findFirst({
        where: and(
          eq(hqEmployees.employeeId, employeeId),
          eq(hqEmployees.isActive, true)
        )
      });
      return employee;
    } catch (error) {
      console.error('Error fetching HQ employee:', error);
      return null;
    }
  }

  async createHQEmployee(employeeData: any): Promise<any> {
    try {
      const [employee] = await db.insert(hqEmployees).values(employeeData).returning();
      return employee;
    } catch (error) {
      console.error('Error creating HQ employee:', error);
      throw error;
    }
  }

  async updateHQEmployee(employeeId: string, employeeData: any): Promise<any> {
    try {
      const [employee] = await db
        .update(hqEmployees)
        .set(employeeData)
        .where(eq(hqEmployees.employeeId, employeeId))
        .returning();
      return employee;
    } catch (error) {
      console.error('Error updating HQ employee:', error);
      throw error;
    }
  }

  async getHQEmployeeByEmail(email: string): Promise<any> {
    try {
      const employee = await db.query.hqEmployees.findFirst({
        where: eq(hqEmployees.email, email)
      });
      return employee;
    } catch (error) {
      console.error('Error fetching HQ employee by email:', error);
      return null;
    }
  }

  // Tenant HR Management Implementation
  async getDriverApplications(companyId: string, filters: any): Promise<any[]> {
    try {
      // Would implement with HR schema once available
      console.log('Getting driver applications for company:', companyId, filters);
      return [];
    } catch (error) {
      console.error('Error fetching driver applications:', error);
      return [];
    }
  }

  async getDriverApplication(applicationId: string, companyId: string): Promise<any> {
    try {
      // Would implement with HR schema once available
      console.log('Getting driver application:', applicationId, companyId);
      return null;
    } catch (error) {
      console.error('Error fetching driver application:', error);
      return null;
    }
  }

  async updateDriverApplication(applicationId: string, updateData: any): Promise<any> {
    try {
      // Would implement with HR schema once available
      console.log('Updating driver application:', applicationId, updateData);
      return null;
    } catch (error) {
      console.error('Error updating driver application:', error);
      throw error;
    }
  }

  async createGustoIntegration(integrationData: any): Promise<any> {
    try {
      // Update company with Gusto integration data
      await db.update(companies)
        .set({
          gustoCompanyId: integrationData.gustoCompanyId,
          gustoAccessToken: integrationData.accessToken,
          gustoRefreshToken: integrationData.refreshToken,
          gustoTokenExpiry: integrationData.tokenExpiry,
          updatedAt: new Date()
        })
        .where(eq(companies.id, integrationData.companyId));
      
      return integrationData;
    } catch (error) {
      console.error('Error creating Gusto integration:', error);
      throw error;
    }
  }

  async getGustoIntegration(companyId: string): Promise<any> {
    try {
      // Check if integration exists in companies table
      const company = await db.query.companies.findFirst({
        where: eq(companies.id, companyId)
      });
      
      if (!company?.gustoCompanyId) {
        return null;
      }
      
      return {
        companyId,
        gustoCompanyId: company.gustoCompanyId,
        accessToken: company.gustoAccessToken,
        refreshToken: company.gustoRefreshToken,
        tokenExpiry: company.gustoTokenExpiry,
        isActive: true,
        lastSync: new Date(),
        employeeCount: 0
      };
    } catch (error) {
      console.error('Error fetching Gusto integration:', error);
      return null;
    }
  }

  async updateGustoIntegration(companyId: string, updateData: any): Promise<any> {
    try {
      // Would implement with HR schema once available
      console.log('Updating Gusto integration:', companyId, updateData);
      return null;
    } catch (error) {
      console.error('Error updating Gusto integration:', error);
      throw error;
    }
  }

  async getOnboardingStatus(applicationId: string, companyId: string): Promise<any> {
    try {
      // Would implement with HR schema once available
      console.log('Getting onboarding status:', applicationId, companyId);
      return null;
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
      return null;
    }
  }

  async createEmployeeDocument(documentData: any): Promise<any> {
    try {
      // Would implement with HR schema once available
      console.log('Creating employee document:', documentData);
      return documentData;
    } catch (error) {
      console.error('Error creating employee document:', error);
      throw error;
    }
  }

  async getEmployeeDocuments(employeeId: string, companyId: string): Promise<any[]> {
    try {
      // Would implement with HR schema once available
      console.log('Getting employee documents:', employeeId, companyId);
      return [];
    } catch (error) {
      console.error('Error fetching employee documents:', error);
      return [];
    }
  }

  async getDriverByEmail(email: string): Promise<any> {
    try {
      const driver = await db.query.drivers.findFirst({
        where: eq(drivers.email, email)
      });
      return driver;
    } catch (error) {
      console.error('Error fetching driver by email:', error);
      return null;
    }
  }

  async updateGustoIntegration(companyId: string, integrationData: any): Promise<boolean> {
    try {
      await db.update(companies)
        .set({
          gustoAccessToken: integrationData.accessToken,
          gustoRefreshToken: integrationData.refreshToken,
          gustoTokenExpiry: integrationData.tokenExpiry,
          updatedAt: new Date()
        })
        .where(eq(companies.id, companyId));
      return true;
    } catch (error) {
      console.error('Error updating Gusto integration:', error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();