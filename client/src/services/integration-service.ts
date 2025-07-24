import { apiRequest } from "../lib/queryClient";

export interface IntegrationCredentials {
  id: string;
  serviceName: string;
  credentials: Record<string, string>;
  isActive: boolean;
  lastSync?: string;
  connectionStatus: 'connected' | 'disconnected' | 'error';
}

export interface IntegrationStatus {
  serviceName: string;
  isConnected: boolean;
  lastSync?: string;
  errorMessage?: string;
}

export class IntegrationService {
  async getIntegrationCredentials(companyId: string): Promise<IntegrationCredentials[]> {
    const response = await apiRequest("GET", `/api/integrations/credentials?companyId=${companyId}`);
    return await response.json();
  }

  async saveCredentials(companyId: string, serviceName: string, credentials: Record<string, string>): Promise<void> {
    await apiRequest("POST", `/api/integrations/credentials`, {
      companyId,
      serviceName,
      credentials
    });
  }

  async testConnection(companyId: string, serviceName: string): Promise<IntegrationStatus> {
    const response = await apiRequest("POST", `/api/integrations/test`, {
      companyId,
      serviceName
    });
    return await response.json();
  }

  async toggleIntegration(companyId: string, serviceName: string, isActive: boolean): Promise<void> {
    await apiRequest("PATCH", `/api/integrations/toggle`, {
      companyId,
      serviceName,
      isActive
    });
  }

  async syncIntegration(companyId: string, serviceName: string): Promise<void> {
    await apiRequest("POST", `/api/integrations/sync`, {
      companyId,
      serviceName
    });
  }

  // QuickBooks specific methods
  async connectQuickBooks(companyId: string, authCode: string): Promise<void> {
    await apiRequest("POST", `/api/integrations/quickbooks/connect`, {
      companyId,
      authCode
    });
  }

  // Gusto specific methods
  async connectGusto(companyId: string, apiKey: string): Promise<void> {
    await apiRequest("POST", `/api/integrations/gusto/connect`, {
      companyId,
      apiKey
    });
  }
}

export const integrationService = new IntegrationService();