import { OAuthApi, QuickBooksApi } from 'node-quickbooks';

interface QuickBooksCredentials {
  companyId: string;
  accessToken: string;
  refreshToken: string;
  realmId: string;
  connectedAt: Date;
  expiresAt: Date;
}

interface QBCustomer {
  id: string;
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  qbId: string;
}

interface QBInvoice {
  id: string;
  number: string;
  customerId: string;
  amount: number;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  loadId?: string;
  qbId: string;
}

interface QBExpense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  account: string;
  vendor?: string;
  qbId: string;
}

interface QBPayment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: string;
  reference?: string;
  qbId: string;
}

export class QuickBooksIntegrationService {
  private credentials: Map<string, QuickBooksCredentials> = new Map();
  private qbApi: Map<string, any> = new Map();

  constructor() {
    // Initialize with QuickBooks app credentials
    this.setupOAuth();
  }

  private setupOAuth() {
    // QuickBooks OAuth configuration
    const oauthConfig = {
      consumerKey: process.env.QB_CONSUMER_KEY,
      consumerSecret: process.env.QB_CONSUMER_SECRET,
      callback: process.env.QB_CALLBACK_URL || 'http://localhost:5000/api/quickbooks/callback',
      scope: 'com.intuit.quickbooks.accounting',
      sandbox: process.env.QB_ENVIRONMENT !== 'production',
    };
  }

  // Generate QuickBooks authorization URL
  async getAuthorizationUrl(companyId: string): Promise<string> {
    try {
      const state = `company_${companyId}_${Date.now()}`;
      
      const authUri = `https://appcenter.intuit.com/connect/oauth2?` +
        `client_id=${process.env.QB_CLIENT_ID}&` +
        `scope=com.intuit.quickbooks.accounting&` +
        `redirect_uri=${encodeURIComponent(process.env.QB_CALLBACK_URL || 'http://localhost:5000/api/quickbooks/callback')}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `state=${state}`;

      return authUri;
    } catch (error: any) {
      console.error('QuickBooks auth URL generation failed:', error);
      throw new Error('Failed to generate QuickBooks authorization URL');
    }
  }

  // Exchange authorization code for access tokens
  async exchangeCodeForTokens(companyId: string, code: string, realmId: string): Promise<QuickBooksCredentials> {
    try {
      const tokenResponse = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.QB_CLIENT_ID}:${process.env.QB_CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: process.env.QB_CALLBACK_URL || 'http://localhost:5000/api/quickbooks/callback',
        }),
      });

      const tokens = await tokenResponse.json();

      const credentials: QuickBooksCredentials = {
        companyId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        realmId,
        connectedAt: new Date(),
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      };

      this.credentials.set(companyId, credentials);
      
      // Initialize QuickBooks API client
      const qb = new QuickBooksApi({
        token: tokens.access_token,
        tokenSecret: '',
        oauth_token_secret: '',
        realmId: realmId,
        sandbox: process.env.QB_ENVIRONMENT !== 'production',
      });
      
      this.qbApi.set(companyId, qb);

      return credentials;
    } catch (error: any) {
      console.error('QuickBooks token exchange failed:', error);
      throw new Error('Failed to connect to QuickBooks');
    }
  }

  // Refresh access token
  private async refreshAccessToken(companyId: string): Promise<void> {
    const credentials = this.credentials.get(companyId);
    if (!credentials) {
      throw new Error('No QuickBooks credentials found');
    }

    try {
      const refreshResponse = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.QB_CLIENT_ID}:${process.env.QB_CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: credentials.refreshToken,
        }),
      });

      const tokens = await refreshResponse.json();

      credentials.accessToken = tokens.access_token;
      credentials.refreshToken = tokens.refresh_token;
      credentials.expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

      this.credentials.set(companyId, credentials);
    } catch (error: any) {
      console.error('QuickBooks token refresh failed:', error);
      throw new Error('Failed to refresh QuickBooks connection');
    }
  }

  // Sync customers from QuickBooks
  async syncCustomers(companyId: string): Promise<QBCustomer[]> {
    const qb = await this.getQBClient(companyId);
    
    try {
      return new Promise((resolve, reject) => {
        qb.findCustomers((err: any, customers: any) => {
          if (err) {
            reject(new Error('Failed to fetch QuickBooks customers'));
            return;
          }

          const qbCustomers: QBCustomer[] = customers.QueryResponse?.Customer?.map((customer: any) => ({
            id: `qb_${customer.Id}`,
            name: customer.Name,
            companyName: customer.CompanyName,
            email: customer.PrimaryEmailAddr?.Address,
            phone: customer.PrimaryPhone?.FreeFormNumber,
            address: customer.BillAddr ? 
              `${customer.BillAddr.Line1 || ''} ${customer.BillAddr.City || ''} ${customer.BillAddr.CountrySubDivisionCode || ''} ${customer.BillAddr.PostalCode || ''}`.trim() 
              : undefined,
            qbId: customer.Id,
          })) || [];

          resolve(qbCustomers);
        });
      });
    } catch (error: any) {
      console.error('Customer sync failed:', error);
      throw new Error('Failed to sync customers from QuickBooks');
    }
  }

  // Create invoice in QuickBooks
  async createInvoice(companyId: string, invoiceData: {
    customerId: string;
    items: Array<{
      description: string;
      amount: number;
      quantity?: number;
    }>;
    dueDate?: string;
    loadId?: string;
  }): Promise<QBInvoice> {
    const qb = await this.getQBClient(companyId);

    try {
      const invoice = {
        CustomerRef: { value: invoiceData.customerId },
        Line: invoiceData.items.map((item, index) => ({
          Id: index + 1,
          LineNum: index + 1,
          Amount: item.amount,
          DetailType: 'SalesItemLineDetail',
          SalesItemLineDetail: {
            ItemRef: { value: '1' }, // Default service item
            Qty: item.quantity || 1,
            UnitPrice: item.amount / (item.quantity || 1),
          }
        })),
        DueDate: invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };

      return new Promise((resolve, reject) => {
        qb.createInvoice(invoice, (err: any, result: any) => {
          if (err) {
            reject(new Error('Failed to create QuickBooks invoice'));
            return;
          }

          const qbInvoice: QBInvoice = {
            id: `qb_${result.Id}`,
            number: result.DocNumber,
            customerId: invoiceData.customerId,
            amount: result.TotalAmt,
            dueDate: result.DueDate,
            status: 'sent',
            loadId: invoiceData.loadId,
            qbId: result.Id,
          };

          resolve(qbInvoice);
        });
      });
    } catch (error: any) {
      console.error('Invoice creation failed:', error);
      throw new Error('Failed to create invoice in QuickBooks');
    }
  }

  // Sync payments from QuickBooks
  async syncPayments(companyId: string, startDate?: Date): Promise<QBPayment[]> {
    const qb = await this.getQBClient(companyId);
    
    try {
      return new Promise((resolve, reject) => {
        const query = startDate ? 
          `SELECT * FROM Payment WHERE TxnDate >= '${startDate.toISOString().split('T')[0]}'` :
          "SELECT * FROM Payment";

        qb.reportQuery(query, (err: any, payments: any) => {
          if (err) {
            reject(new Error('Failed to fetch QuickBooks payments'));
            return;
          }

          const qbPayments: QBPayment[] = payments.QueryResponse?.Payment?.map((payment: any) => ({
            id: `qb_${payment.Id}`,
            invoiceId: payment.Line?.[0]?.LinkedTxn?.[0]?.TxnId || '',
            amount: payment.TotalAmt,
            date: payment.TxnDate,
            method: payment.PaymentMethodRef?.name || 'Cash',
            reference: payment.PaymentRefNum,
            qbId: payment.Id,
          })) || [];

          resolve(qbPayments);
        });
      });
    } catch (error: any) {
      console.error('Payment sync failed:', error);
      throw new Error('Failed to sync payments from QuickBooks');
    }
  }

  // Sync expenses from QuickBooks
  async syncExpenses(companyId: string, startDate?: Date): Promise<QBExpense[]> {
    const qb = await this.getQBClient(companyId);
    
    try {
      return new Promise((resolve, reject) => {
        const query = startDate ? 
          `SELECT * FROM Purchase WHERE TxnDate >= '${startDate.toISOString().split('T')[0]}'` :
          "SELECT * FROM Purchase";

        qb.reportQuery(query, (err: any, expenses: any) => {
          if (err) {
            reject(new Error('Failed to fetch QuickBooks expenses'));
            return;
          }

          const qbExpenses: QBExpense[] = expenses.QueryResponse?.Purchase?.map((expense: any) => ({
            id: `qb_${expense.Id}`,
            description: expense.PrivateNote || expense.Line?.[0]?.Description || 'Expense',
            amount: expense.TotalAmt,
            date: expense.TxnDate,
            category: expense.Line?.[0]?.AccountRef?.name || 'General',
            account: expense.AccountRef?.name || 'Checking',
            vendor: expense.EntityRef?.name,
            qbId: expense.Id,
          })) || [];

          resolve(qbExpenses);
        });
      });
    } catch (error: any) {
      console.error('Expense sync failed:', error);
      throw new Error('Failed to sync expenses from QuickBooks');
    }
  }

  // Match FreightOps loads with QuickBooks invoices
  async matchLoadsWithInvoices(companyId: string, loads: any[]): Promise<Array<{
    loadId: string;
    invoiceId: string;
    confidence: number;
  }>> {
    const invoices = await this.getInvoices(companyId);
    const matches: Array<{ loadId: string; invoiceId: string; confidence: number }> = [];

    for (const load of loads) {
      for (const invoice of invoices) {
        let confidence = 0;

        // Amount matching
        const amountDiff = Math.abs(invoice.amount - load.rate) / load.rate;
        if (amountDiff < 0.05) confidence += 0.4;
        else if (amountDiff < 0.1) confidence += 0.2;

        // Customer matching
        if (load.customerName && invoice.customerId.includes(load.customerName)) {
          confidence += 0.3;
        }

        // Load number in invoice notes or description
        if (load.loadNumber && (invoice.number?.includes(load.loadNumber))) {
          confidence += 0.3;
        }

        if (confidence > 0.5) {
          matches.push({
            loadId: load.id,
            invoiceId: invoice.id,
            confidence,
          });
          break; // Found a match, move to next load
        }
      }
    }

    return matches;
  }

  // Get QuickBooks client with automatic token refresh
  private async getQBClient(companyId: string): Promise<any> {
    const credentials = this.credentials.get(companyId);
    if (!credentials) {
      throw new Error('QuickBooks not connected for this company');
    }

    // Check if token needs refresh
    if (credentials.expiresAt.getTime() < Date.now() + 5 * 60 * 1000) { // 5 minutes before expiry
      await this.refreshAccessToken(companyId);
    }

    return this.qbApi.get(companyId);
  }

  // Helper method to get invoices
  private async getInvoices(companyId: string): Promise<QBInvoice[]> {
    const qb = await this.getQBClient(companyId);
    
    return new Promise((resolve, reject) => {
      qb.findInvoices((err: any, invoices: any) => {
        if (err) {
          reject(new Error('Failed to fetch QuickBooks invoices'));
          return;
        }

        const qbInvoices: QBInvoice[] = invoices.QueryResponse?.Invoice?.map((invoice: any) => ({
          id: `qb_${invoice.Id}`,
          number: invoice.DocNumber,
          customerId: invoice.CustomerRef.value,
          amount: invoice.TotalAmt,
          dueDate: invoice.DueDate,
          status: invoice.Balance > 0 ? 'sent' : 'paid',
          qbId: invoice.Id,
        })) || [];

        resolve(qbInvoices);
      });
    });
  }

  // Get connection status
  getQuickBooksStatus(companyId: string): QuickBooksCredentials | null {
    return this.credentials.get(companyId) || null;
  }

  // Disconnect QuickBooks
  async disconnectQuickBooks(companyId: string): Promise<void> {
    this.credentials.delete(companyId);
    this.qbApi.delete(companyId);
  }

  // Generate reconciliation report
  async generateReconciliationReport(companyId: string): Promise<{
    totalInvoiced: number;
    totalPaid: number;
    outstandingAmount: number;
    matchedTransactions: number;
    unmatchedTransactions: number;
  }> {
    try {
      const invoices = await this.getInvoices(companyId);
      const payments = await this.syncPayments(companyId);

      const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0);
      const totalPaid = payments.reduce((sum, pay) => sum + pay.amount, 0);
      const outstandingAmount = totalInvoiced - totalPaid;

      return {
        totalInvoiced,
        totalPaid,
        outstandingAmount,
        matchedTransactions: payments.filter(p => p.invoiceId).length,
        unmatchedTransactions: payments.filter(p => !p.invoiceId).length,
      };
    } catch (error: any) {
      console.error('Reconciliation report generation failed:', error);
      throw new Error('Failed to generate reconciliation report');
    }
  }
}

export const quickBooksService = new QuickBooksIntegrationService();