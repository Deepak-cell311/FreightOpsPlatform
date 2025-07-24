import { storage } from "./storage";
import { randomUUID } from "crypto";

export class TenantVehicleService {
  async getVehiclesByCompanyId(companyId: string) {
    return await storage.getTrucksByCompanyId(companyId);
  }

  async createVehicle(companyId: string, vehicleData: any) {
    const vehicle = {
      id: randomUUID(),
      companyId,
      ...vehicleData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return await storage.addTruck(vehicle);
  }

  async updateVehicle(companyId: string, vehicleId: string, updateData: any) {
    return await storage.updateTruck(vehicleId, {
      ...updateData,
      updatedAt: new Date()
    });
  }

  async deleteVehicle(companyId: string, vehicleId: string) {
    return await storage.deleteTruck(vehicleId);
  }

  async getFleetAnalytics(companyId: string) {
    const vehicles = await this.getVehiclesByCompanyId(companyId);
    return {
      totalVehicles: vehicles.length,
      activeVehicles: vehicles.filter(v => v.status === 'active').length,
      maintenanceDue: vehicles.filter(v => v.maintenanceAlerts).length
    };
  }
}

export class TenantDriverService {
  async getDriversByCompanyId(companyId: string) {
    return await storage.getDriversByCompanyId(companyId);
  }

  async createDriver(companyId: string, driverData: any) {
    const driver = {
      id: randomUUID(),
      companyId,
      ...driverData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return await storage.addDriver(driver);
  }

  async updateDriver(companyId: string, driverId: string, updateData: any) {
    return await storage.updateDriver(driverId, {
      ...updateData,
      updatedAt: new Date()
    });
  }

  async deleteDriver(companyId: string, driverId: string) {
    return await storage.deleteDriver(driverId);
  }

  async getDriverAnalytics(companyId: string) {
    const drivers = await this.getDriversByCompanyId(companyId);
    return {
      totalDrivers: drivers.length,
      activeDrivers: drivers.filter(d => d.status === 'active').length,
      availableDrivers: drivers.filter(d => d.status === 'available').length
    };
  }
}

export class TenantLoadService {
  async getLoadsByCompanyId(companyId: string) {
    return await storage.getLoadsByCompanyId(companyId);
  }

  async createLoad(companyId: string, loadData: any) {
    const load = {
      id: randomUUID(),
      companyId,
      loadNumber: `L${Date.now()}`,
      status: 'pending',
      ...loadData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return await storage.addLoad(load);
  }

  async updateLoad(companyId: string, loadId: string, updateData: any) {
    return await storage.updateLoad(loadId, {
      ...updateData,
      updatedAt: new Date()
    });
  }

  async deleteLoad(companyId: string, loadId: string) {
    return await storage.deleteLoad(loadId);
  }
}

export class TenantDispatchService {
  async getScheduledLoads(companyId: string) {
    const loads = await storage.getLoadsByCompanyId(companyId);
    return loads.filter(load => load.status === 'scheduled');
  }

  async assignDriverToLoad(loadId: string, driverId: string, truckId?: string) {
    const assignment = {
      loadId,
      driverId,
      truckId,
      assignedAt: new Date().toISOString()
    };
    
    await storage.updateLoad(loadId, {
      driverId,
      truckId,
      status: 'assigned',
      updatedAt: new Date()
    });
    
    return assignment;
  }

  async getAvailableDrivers(companyId: string) {
    const drivers = await storage.getDriversByCompanyId(companyId);
    return drivers.filter(driver => driver.status === 'available');
  }

  async getAvailableTrucks(companyId: string) {
    const trucks = await storage.getTrucksByCompanyId(companyId);
    return trucks.filter(truck => truck.status === 'available');
  }
}

export class TenantFinancialService {
  async getFinancialSummary(companyId: string) {
    const loads = await storage.getLoadsByCompanyId(companyId);
    const completedLoads = loads.filter(load => load.status === 'completed');
    
    const revenue = completedLoads.reduce((sum, load) => {
      return sum + (parseFloat(load.rate || '0'));
    }, 0);
    
    return {
      totalRevenue: revenue,
      completedLoads: completedLoads.length,
      pendingLoads: loads.filter(load => load.status === 'pending').length,
      avgRevenuePerLoad: completedLoads.length > 0 ? revenue / completedLoads.length : 0
    };
  }

  async getInvoices(companyId: string) {
    return await storage.getInvoicesByCompanyId(companyId);
  }

  async createInvoice(companyId: string, invoiceData: any) {
    const invoice = {
      id: randomUUID(),
      companyId,
      invoiceNumber: `INV-${Date.now()}`,
      ...invoiceData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return await storage.addInvoice(invoice);
  }

  async getRevenue(companyId: string) {
    const invoices = await this.getInvoices(companyId);
    return invoices.reduce((sum, invoice) => {
      return sum + (parseFloat(invoice.totalAmount || '0'));
    }, 0);
  }

  async getExpenses(companyId: string) {
    const bills = await storage.getBillsByCompanyId(companyId);
    return bills.reduce((sum, bill) => {
      return sum + (parseFloat(bill.totalAmount || '0'));
    }, 0);
  }
}

// Export service instances
export const tenantVehicleService = new TenantVehicleService();
export const tenantDriverService = new TenantDriverService();
export const tenantLoadService = new TenantLoadService();
export const tenantDispatchService = new TenantDispatchService();
export const tenantFinancialService = new TenantFinancialService();