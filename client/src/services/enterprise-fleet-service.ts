import { apiRequest } from "../lib/queryClient";

export interface FleetOverview {
  totalVehicles: number;
  activeVehicles: number;
  totalDrivers: number;
  activeDrivers: number;
  maintenanceIssues: number;
  complianceAlerts: number;
}

export interface DriverStats {
  totalDrivers: number;
  availableDrivers: number;
  onDutyDrivers: number;
  violationCount: number;
}

export interface ComplianceStatus {
  dotCompliant: boolean;
  insuranceValid: boolean;
  registrationValid: boolean;
  driversLicensed: number;
  totalDrivers: number;
}

export class EnterpriseFleetService {
  async getFleetOverview(companyId: string): Promise<FleetOverview> {
    const response = await apiRequest("GET", `/api/fleet/overview?companyId=${companyId}`);
    return await response.json();
  }

  async getDriverStats(companyId: string): Promise<DriverStats> {
    const response = await apiRequest("GET", `/api/fleet/drivers/stats?companyId=${companyId}`);
    return await response.json();
  }

  async getComplianceStatus(companyId: string): Promise<ComplianceStatus> {
    const response = await apiRequest("GET", `/api/fleet/compliance?companyId=${companyId}`);
    return await response.json();
  }
}

export const enterpriseFleetService = new EnterpriseFleetService();