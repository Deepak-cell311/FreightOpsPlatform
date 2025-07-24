import axios from "axios";

export interface QuickBooksCredentials {
  accessToken: string;
  refreshToken: string;
  realmId: string;
  expiresAt: Date;
}

export interface XeroCredentials {
  accessToken: string;
  refreshToken: string;
  tenantId: string;
  expiresAt: Date;
}

export interface SyncResult {
  success: boolean;
  recordsSynced: number;
  errors: string[];
  lastSyncAt: Date;
}

export class QuickBooksXeroIntegrationService {
  private qbBaseURL = 'https://sandbox-quickbooks.api.intuit.com';
  private xeroBaseURL = 'https://api.xero.com/api.xro/2.0';
  private qbClientId: string;
  private qbClientSecret: string;
  private xeroClientId: string;
  private xeroClientSecret: string;

  constructor() {
    this.qbClientId = process.env.QUICKBOOKS_CLIENT_ID || '';
    this.qbClientSecret = process.env.QUICKBOOKS_CLIENT_SECRET || '';
    this.xeroClientId = process.env.XERO_CLIENT_ID || '';
    this.xeroClientSecret = process.env.XERO_CLIENT_SECRET || '';
  }

  // QuickBooks OAuth token refresh
  async refreshQuickBooksToken(refreshToken: string): Promise<QuickBooksCredentials> {
    if (!this.qbClientId || !this.qbClientSecret) {
      throw new Error("QuickBooks credentials not configured");
    }

    try {
      const response = await axios.post('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', 
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        }), {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.qbClientId}:${this.qbClientSecret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const data = response.data;
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        realmId: data.realmId,
        expiresAt: new Date(Date.now() + data.expires_in * 1000)
      };
    } catch (error: any) {
      console.error("QuickBooks token refresh error:", error.response?.data || error.message);
      throw new Error(`QuickBooks token refresh failed: ${error.response?.data?.error_description || error.message}`);
    }
  }

  // Xero OAuth token refresh
  async refreshXeroToken(refreshToken: string): Promise<XeroCredentials> {
    if (!this.xeroClientId || !this.xeroClientSecret) {
      throw new Error("Xero credentials not configured");
    }

    try {
      const response = await axios.post('https://identity.xero.com/connect/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        }), {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.xeroClientId}:${this.xeroClientSecret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const data = response.data;
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tenantId: data.tenant_id,
        expiresAt: new Date(Date.now() + data.expires_in * 1000)
      };
    } catch (error: any) {
      console.error("Xero token refresh error:", error.response?.data || error.message);
      throw new Error(`Xero token refresh failed: ${error.response?.data?.error_description || error.message}`);
    }
  }

  // Sync invoices to QuickBooks
  async syncInvoicesToQuickBooks(companyId: string, credentials: QuickBooksCredentials, invoices: any[]): Promise<SyncResult> {
    const errors: string[] = [];
    let recordsSynced = 0;

    for (const invoice of invoices) {
      try {
        const qbInvoice = {
          Name: `Invoice-${invoice.invoiceNumber}`,
          Line: [{
            Amount: invoice.totalAmount,
            DetailType: "SalesItemLineDetail",
            SalesItemLineDetail: {
              ItemRef: {
                value: "1",
                name: "Services"
              }
            }
          }],
          CustomerRef: {
            value: "1"
          }
        };

        await axios.post(`${this.qbBaseURL}/v3/company/${credentials.realmId}/invoice`, qbInvoice, {
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        recordsSynced++;
      } catch (error: any) {
        errors.push(`Invoice ${invoice.invoiceNumber}: ${error.response?.data?.Fault?.Error?.[0]?.Detail || error.message}`);
      }
    }

    return {
      success: errors.length === 0,
      recordsSynced,
      errors,
      lastSyncAt: new Date()
    };
  }

  // Sync invoices to Xero
  async syncInvoicesToXero(companyId: string, credentials: XeroCredentials, invoices: any[]): Promise<SyncResult> {
    const errors: string[] = [];
    let recordsSynced = 0;

    for (const invoice of invoices) {
      try {
        const xeroInvoice = {
          Type: "ACCREC",
          Contact: {
            Name: invoice.customerName || "Unknown Customer"
          },
          Date: invoice.issueDate,
          DueDate: invoice.dueDate,
          LineItems: [{
            Description: `Transportation Service - ${invoice.invoiceNumber}`,
            Quantity: 1,
            UnitAmount: invoice.totalAmount,
            AccountCode: "200"
          }],
          Reference: invoice.invoiceNumber,
          Status: invoice.status === 'paid' ? 'PAID' : 'AUTHORISED'
        };

        await axios.post(`${this.xeroBaseURL}/Invoices`, { Invoices: [xeroInvoice] }, {
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
            'Xero-tenant-id': credentials.tenantId,
            'Content-Type': 'application/json'
          }
        });

        recordsSynced++;
      } catch (error: any) {
        errors.push(`Invoice ${invoice.invoiceNumber}: ${error.response?.data?.Message || error.message}`);
      }
    }

    return {
      success: errors.length === 0,
      recordsSynced,
      errors,
      lastSyncAt: new Date()
    };
  }

  // Pull customers from QuickBooks
  async pullCustomersFromQuickBooks(credentials: QuickBooksCredentials): Promise<any[]> {
    try {
      const response = await axios.get(`${this.qbBaseURL}/v3/company/${credentials.realmId}/customers`, {
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`
        }
      });

      return response.data.QueryResponse?.Customer || [];
    } catch (error: any) {
      console.error("QuickBooks customers pull error:", error.response?.data || error.message);
      throw new Error(`Failed to pull customers from QuickBooks: ${error.response?.data?.Fault?.Error?.[0]?.Detail || error.message}`);
    }
  }

  // Pull customers from Xero
  async pullCustomersFromXero(credentials: XeroCredentials): Promise<any[]> {
    try {
      const response = await axios.get(`${this.xeroBaseURL}/Contacts`, {
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`,
          'Xero-tenant-id': credentials.tenantId
        }
      });

      return response.data.Contacts || [];
    } catch (error: any) {
      console.error("Xero customers pull error:", error.response?.data || error.message);
      throw new Error(`Failed to pull customers from Xero: ${error.response?.data?.Message || error.message}`);
    }
  }

  // Sync chart of accounts from QuickBooks
  async syncChartOfAccountsFromQuickBooks(credentials: QuickBooksCredentials): Promise<any[]> {
    try {
      const response = await axios.get(`${this.qbBaseURL}/v3/company/${credentials.realmId}/accounts`, {
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`
        }
      });

      const accounts = response.data.QueryResponse?.Account || [];
      
      return accounts.map((account: any) => ({
        externalId: account.Id,
        accountNumber: account.AcctNum,
        accountName: account.Name,
        accountType: account.AccountType,
        accountSubType: account.AccountSubType,
        description: account.Description,
        isActive: account.Active,
        balance: account.CurrentBalance || 0,
        source: 'quickbooks'
      }));
    } catch (error: any) {
      console.error("QuickBooks chart of accounts sync error:", error.response?.data || error.message);
      throw new Error(`Failed to sync chart of accounts from QuickBooks: ${error.response?.data?.Fault?.Error?.[0]?.Detail || error.message}`);
    }
  }

  // Sync chart of accounts from Xero
  async syncChartOfAccountsFromXero(credentials: XeroCredentials): Promise<any[]> {
    try {
      const response = await axios.get(`${this.xeroBaseURL}/Accounts`, {
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`,
          'Xero-tenant-id': credentials.tenantId
        }
      });

      const accounts = response.data.Accounts || [];
      
      return accounts.map((account: any) => ({
        externalId: account.AccountID,
        accountNumber: account.Code,
        accountName: account.Name,
        accountType: account.Type,
        accountSubType: account.Class,
        description: account.Description,
        isActive: account.Status === 'ACTIVE',
        balance: 0, // Xero doesn't return current balance in this endpoint
        source: 'xero'
      }));
    } catch (error: any) {
      console.error("Xero chart of accounts sync error:", error.response?.data || error.message);
      throw new Error(`Failed to sync chart of accounts from Xero: ${error.response?.data?.Message || error.message}`);
    }
  }

  // Bi-directional sync manager
  async performBidirectionalSync(companyId: string, syncConfig: {
    quickbooks?: { credentials: QuickBooksCredentials; enabled: boolean };
    xero?: { credentials: XeroCredentials; enabled: boolean };
    syncDirection: 'to_external' | 'from_external' | 'bidirectional';
    entities: string[]; // ['invoices', 'customers', 'accounts']
  }): Promise<{ [entity: string]: SyncResult }> {
    const results: { [entity: string]: SyncResult } = {};

    // Get local data that needs to be synced
    // This would typically fetch from your database
    const localInvoices = []; // await this.getLocalInvoices(companyId);
    const localCustomers = []; // await this.getLocalCustomers(companyId);

    for (const entity of syncConfig.entities) {
      try {
        switch (entity) {
          case 'invoices':
            if (syncConfig.quickbooks?.enabled && syncConfig.syncDirection !== 'from_external') {
              results[`invoices_to_quickbooks`] = await this.syncInvoicesToQuickBooks(
                companyId, 
                syncConfig.quickbooks.credentials, 
                localInvoices
              );
            }
            
            if (syncConfig.xero?.enabled && syncConfig.syncDirection !== 'from_external') {
              results[`invoices_to_xero`] = await this.syncInvoicesToXero(
                companyId, 
                syncConfig.xero.credentials, 
                localInvoices
              );
            }
            break;

          case 'customers':
            if (syncConfig.quickbooks?.enabled && syncConfig.syncDirection !== 'to_external') {
              const qbCustomers = await this.pullCustomersFromQuickBooks(syncConfig.quickbooks.credentials);
              results[`customers_from_quickbooks`] = {
                success: true,
                recordsSynced: qbCustomers.length,
                errors: [],
                lastSyncAt: new Date()
              };
            }
            
            if (syncConfig.xero?.enabled && syncConfig.syncDirection !== 'to_external') {
              const xeroCustomers = await this.pullCustomersFromXero(syncConfig.xero.credentials);
              results[`customers_from_xero`] = {
                success: true,
                recordsSynced: xeroCustomers.length,
                errors: [],
                lastSyncAt: new Date()
              };
            }
            break;

          case 'accounts':
            if (syncConfig.quickbooks?.enabled && syncConfig.syncDirection !== 'to_external') {
              const qbAccounts = await this.syncChartOfAccountsFromQuickBooks(syncConfig.quickbooks.credentials);
              results[`accounts_from_quickbooks`] = {
                success: true,
                recordsSynced: qbAccounts.length,
                errors: [],
                lastSyncAt: new Date()
              };
            }
            
            if (syncConfig.xero?.enabled && syncConfig.syncDirection !== 'to_external') {
              const xeroAccounts = await this.syncChartOfAccountsFromXero(syncConfig.xero.credentials);
              results[`accounts_from_xero`] = {
                success: true,
                recordsSynced: xeroAccounts.length,
                errors: [],
                lastSyncAt: new Date()
              };
            }
            break;
        }
      } catch (error: any) {
        results[entity] = {
          success: false,
          recordsSynced: 0,
          errors: [error.message],
          lastSyncAt: new Date()
        };
      }
    }

    return results;
  }

  // Get OAuth URLs for initial connection
  getQuickBooksOAuthURL(companyId: string, redirectUri: string): string {
    const state = Buffer.from(JSON.stringify({ companyId, service: 'quickbooks' })).toString('base64');
    const params = new URLSearchParams({
      client_id: this.qbClientId,
      scope: 'com.intuit.quickbooks.accounting',
      redirect_uri: redirectUri,
      response_type: 'code',
      access_type: 'offline',
      state
    });
    
    return `https://appcenter.intuit.com/connect/oauth2?${params.toString()}`;
  }

  getXeroOAuthURL(companyId: string, redirectUri: string): string {
    const state = Buffer.from(JSON.stringify({ companyId, service: 'xero' })).toString('base64');
    const params = new URLSearchParams({
      client_id: this.xeroClientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'accounting.transactions accounting.contacts accounting.settings',
      state
    });
    
    return `https://login.xero.com/identity/connect/authorize?${params.toString()}`;
  }

  // Store and retrieve credentials (implement with your database)
  async storeCredentials(companyId: string, service: 'quickbooks' | 'xero', credentials: QuickBooksCredentials | XeroCredentials): Promise<void> {
    // Implementation would store encrypted credentials in database
    console.log(`Storing ${service} credentials for company ${companyId}`);
  }

  async getStoredCredentials(companyId: string, service: 'quickbooks' | 'xero'): Promise<QuickBooksCredentials | XeroCredentials | null> {
    // Implementation would retrieve and decrypt credentials from database
    console.log(`Retrieving ${service} credentials for company ${companyId}`);
    return null;
  }
}

export const quickBooksXeroIntegrationService = new QuickBooksXeroIntegrationService();