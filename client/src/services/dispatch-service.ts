import { apiRequest } from "../lib/queryClient";

export interface ScheduledLoad {
  id: string;
  loadNumber: string;
  customerName: string;
  pickupLocation: string;
  deliveryLocation: string;
  pickupDate: string;
  deliveryDate: string;
  status: string;
  driverId?: string;
  truckId?: string;
}

export interface DriverAssignment {
  loadId: string;
  driverId: string;
  truckId?: string;
  assignedAt: string;
}

export interface DriverHOS {
  driverId: string;
  currentStatus: string;
  hoursRemaining: number;
  nextBreakRequired: string;
  violations: string[];
}

export class DispatchService {
  async getScheduledLoads(tenantId: string): Promise<ScheduledLoad[]> {
    const response = await apiRequest("GET", `/api/dispatch/loads?tenantId=${tenantId}`);
    return await response.json();
  }

  async assignDriverToLoad(loadId: string, driverId: string, truckId?: string): Promise<DriverAssignment> {
    const response = await apiRequest("POST", `/api/dispatch/assign`, {
      loadId,
      driverId,
      truckId
    });
    return await response.json();
  }

  async checkDriverHOS(driverId: string): Promise<DriverHOS> {
    const response = await apiRequest("GET", `/api/dispatch/drivers/${driverId}/hos`);
    return await response.json();
  }

  async getAvailableDrivers(tenantId: string): Promise<any[]> {
    const response = await apiRequest("GET", `/api/dispatch/drivers/available?tenantId=${tenantId}`);
    return await response.json();
  }

  async getAvailableTrucks(tenantId: string): Promise<any[]> {
    const response = await apiRequest("GET", `/api/dispatch/trucks/available?tenantId=${tenantId}`);
    return await response.json();
  }
}

export const dispatchService = new DispatchService();