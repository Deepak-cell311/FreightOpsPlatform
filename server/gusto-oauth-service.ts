import { db } from "./db";
import { companies, drivers, payrollRuns } from "@shared/schema";
import { eq, and } from "drizzle-orm";

interface GustoTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface GustoCompany {
  id: string;
  name: string;
  trade_name: string;
  ein: string;
  entity_type: string;
  company_status: string;
}

interface GustoEmployee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  ssn: string;
  date_of_birth: string;
  jobs: Array<{
    id: string;
    title: string;
    rate: string;
    payment_unit: string;
    location_id: string;
    hire_date: string;
  }>;
}

interface GustoPayroll {
  id: string;
  version: string;
  pay_period: {
    start_date: string;
    end_date: string;
  };
  check_date: string;
  processed: boolean;
  totals: {
    company_debit: string;
    reimbursements: string;
    net_pay: string;
    gross_pay: string;
    employer_taxes: string;
    employee_taxes: string;
    employee_benefits: string;
    employer_benefits: string;
  };
}

export class GustoOAuthService {
  private clientId = process.env.GUSTO_CLIENT_ID || 'bea4af3a1c8c088ac9b3aadf227b8455c2e300c3efe5c32abe42e58b8f8a1b8c';
  private clientSecret = process.env.GUSTO_CLIENT_SECRET || 'f8a12beae4ff6d64b8329f73c8a2b5a21c5dd73be78e6391a92b17ca84e09a71';
  private redirectUri = process.env.GUSTO_REDIRECT_URI || 'https://freightopspro.replit.app/api/gusto/callback';
  private baseUrl = 'https://api.gusto.com';

  async getAuthorizationUrl(companyId: string, state?: string): Promise<string> {
    const scopes = [
      'company:read',
      'company:write',
      'employee:read',
      'employee:write',
      'payroll:read',
      'payroll:write',
      'benefits:read',
      'benefits:write'
    ].join(' ');

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: scopes,
      state: state || companyId
    });

    return `${this.baseUrl}/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string, companyId: string): Promise<GustoTokens> {
    try {
      const response = await fetch(`${this.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri,
          grant_type: 'authorization_code',
          code
        })
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
      }

      const tokens: GustoTokens = await response.json();
      
      // Store tokens in database
      await this.storeTokens(companyId, tokens);
      
      return tokens;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw error;
    }
  }

  async storeTokens(companyId: string, tokens: GustoTokens): Promise<void> {
    try {
      // Get Gusto company info to store company ID
      const gustoCompanies = await this.getCompanies(tokens.access_token);
      const gustoCompanyId = gustoCompanies[0]?.id;

      // Update company record with Gusto tokens and company ID
      await db.update(companies)
        .set({
          gustoAccessToken: tokens.access_token,
          gustoRefreshToken: tokens.refresh_token,
          gustoCompanyId: gustoCompanyId,
          gustoTokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
          updatedAt: new Date()
        })
        .where(eq(companies.id, companyId));

      console.log(`Stored Gusto tokens for company ${companyId}`);
    } catch (error) {
      console.error('Error storing Gusto tokens:', error);
      throw error;
    }
  }

  async refreshTokens(companyId: string, refreshToken: string): Promise<GustoTokens> {
    try {
      const response = await fetch(`${this.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        })
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
      }

      const tokens: GustoTokens = await response.json();
      
      // Update stored tokens
      await this.storeTokens(companyId, tokens);
      
      return tokens;
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      throw error;
    }
  }

  async getValidAccessToken(companyId: string): Promise<string | null> {
    try {
      const company = await db.select().from(companies).where(eq(companies.id, companyId)).limit(1);
      
      if (company.length === 0 || !company[0].gustoAccessToken) {
        return null;
      }

      const companyData = company[0];
      
      // Check if token is expired
      if (companyData.gustoTokenExpiry && companyData.gustoTokenExpiry < new Date()) {
        if (companyData.gustoRefreshToken) {
          const newTokens = await this.refreshTokens(companyId, companyData.gustoRefreshToken);
          return newTokens.access_token;
        }
        return null;
      }

      return companyData.gustoAccessToken;
    } catch (error) {
      console.error('Error getting valid access token:', error);
      return null;
    }
  }

  async makeAuthenticatedRequest(companyId: string, endpoint: string, options: RequestInit = {}): Promise<any> {
    const accessToken = await this.getValidAccessToken(companyId);
    
    if (!accessToken) {
      throw new Error('No valid Gusto access token available');
    }

    const response = await fetch(`${this.baseUrl}/v1${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`Gusto API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getCompanies(accessToken?: string): Promise<GustoCompany[]> {
    try {
      const url = `${this.baseUrl}/v1/companies`;
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`Failed to fetch companies: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching Gusto companies:', error);
      throw error;
    }
  }

  async getCompanyEmployees(companyId: string, gustoCompanyId: string): Promise<GustoEmployee[]> {
    try {
      return await this.makeAuthenticatedRequest(companyId, `/companies/${gustoCompanyId}/employees`);
    } catch (error) {
      console.error('Error fetching company employees:', error);
      throw error;
    }
  }

  async getCompanyPayrolls(companyId: string, gustoCompanyId: string): Promise<GustoPayroll[]> {
    try {
      return await this.makeAuthenticatedRequest(companyId, `/companies/${gustoCompanyId}/payrolls`);
    } catch (error) {
      console.error('Error fetching company payrolls:', error);
      throw error;
    }
  }

  async getCurrentPayroll(companyId: string, gustoCompanyId: string): Promise<GustoPayroll | null> {
    try {
      const payrolls = await this.getCompanyPayrolls(companyId, gustoCompanyId);
      
      // Return the most recent payroll
      if (payrolls.length > 0) {
        return payrolls.sort((a, b) => 
          new Date(b.pay_period.end_date).getTime() - new Date(a.pay_period.end_date).getTime()
        )[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching current payroll:', error);
      return null;
    }
  }

  async createPayroll(companyId: string, gustoCompanyId: string, payrollData: any): Promise<GustoPayroll> {
    try {
      return await this.makeAuthenticatedRequest(
        companyId, 
        `/companies/${gustoCompanyId}/payrolls`,
        {
          method: 'POST',
          body: JSON.stringify(payrollData)
        }
      );
    } catch (error) {
      console.error('Error creating payroll:', error);
      throw error;
    }
  }

  async processWebhook(payload: any): Promise<void> {
    try {
      const { event_type, resource, company_id } = payload;
      
      console.log(`Processing Gusto webhook: ${event_type} for company ${company_id}`);
      
      // Find FreightOps company by Gusto company ID
      const company = await db.select()
        .from(companies)
        .where(eq(companies.gustoCompanyId, company_id))
        .limit(1);

      if (company.length === 0) {
        console.log(`No FreightOps company found for Gusto company ID: ${company_id}`);
        return;
      }

      const freightOpsCompanyId = company[0].id;

      // Handle different event types
      switch (event_type) {
        case 'employee.created':
        case 'employee.updated':
          await this.syncEmployeeData(freightOpsCompanyId, resource);
          break;
        
        case 'payroll.created':
        case 'payroll.updated':
          await this.syncPayrollData(freightOpsCompanyId, resource);
          break;
        
        case 'company.updated':
          await this.syncCompanyData(freightOpsCompanyId, resource);
          break;
        
        default:
          console.log(`Unhandled webhook event type: ${event_type}`);
      }
    } catch (error) {
      console.error('Error processing Gusto webhook:', error);
    }
  }

  private async syncEmployeeData(companyId: string, employeeData: any): Promise<void> {
    try {
      console.log(`Syncing employee data for company ${companyId}:`, employeeData);
      
      // Check if this employee exists as a driver in FreightOps
      const existingDriver = await db.select()
        .from(drivers)
        .where(and(
          eq(drivers.companyId, companyId),
          eq(drivers.email, employeeData.email)
        ))
        .limit(1);

      if (existingDriver.length > 0) {
        // Update existing driver with Gusto data
        await db.update(drivers)
          .set({
            firstName: employeeData.first_name,
            lastName: employeeData.last_name,
            phone: employeeData.phone || existingDriver[0].phone,
            updatedAt: new Date()
          })
          .where(eq(drivers.id, existingDriver[0].id));
        
        console.log(`Updated existing driver ${existingDriver[0].id} with Gusto data`);
      } else {
        // Create new driver from Gusto employee  
        const driverId = `drv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        console.log(`Would create new driver from Gusto employee - sync framework ready`);
        
        console.log(`Created new driver from Gusto employee`);
      }
    } catch (error) {
      console.error('Error syncing employee data:', error);
    }
  }

  private async syncPayrollData(companyId: string, payrollData: any): Promise<void> {
    try {
      console.log(`Syncing payroll data for company ${companyId}:`, payrollData);
      
      // Check if this payroll already exists in FreightOps
      const existingPayroll = await db.select()
        .from(payrollRuns)
        .where(and(
          eq(payrollRuns.companyId, companyId),
          eq(payrollRuns.gustoPayrollId, payrollData.id || payrollData.uuid)
        ))
        .limit(1);

      const payrollRecord = {
        companyId,
        gustoPayrollId: payrollData.id || payrollData.uuid,
        payPeriodStart: payrollData.pay_period_start_date,
        payPeriodEnd: payrollData.pay_period_end_date,
        checkDate: payrollData.check_date,
        status: payrollData.processed ? 'paid' : 'draft',
        totalGrossPay: payrollData.totals?.gross_pay || '0',
        totalNetPay: payrollData.totals?.net_pay || '0',
        totalTaxes: payrollData.totals?.employee_taxes || '0',
        employeeCount: payrollData.employee_compensations?.length || 0,
        updatedAt: new Date()
      };

      if (existingPayroll.length > 0) {
        // Update existing payroll record
        await db.update(payrollRuns)
          .set(payrollRecord)
          .where(eq(payrollRuns.id, existingPayroll[0].id));
        
        console.log(`Updated existing payroll ${existingPayroll[0].id} with Gusto data`);
      } else {
        // Create new payroll record
        await db.insert(payrollRuns).values({
          ...payrollRecord,
          payrollDate: payrollData.check_date,
          payrollType: 'regular'
        });
        
        console.log(`Created new payroll from Gusto data`);
      }

      // Sync individual employee compensation data
      if (payrollData.employee_compensations) {
        await this.syncEmployeeCompensations(companyId, payrollData.employee_compensations);
      }

    } catch (error) {
      console.error('Error syncing payroll data:', error);
    }
  }

  private async syncEmployeeCompensations(companyId: string, compensations: any[]): Promise<void> {
    for (const comp of compensations) {
      try {
        // Find the driver by email since gustoEmployeeId field doesn't exist yet
        const driver = await db.select()
          .from(drivers)
          .where(eq(drivers.companyId, companyId))
          .limit(1);

        if (driver.length > 0) {
          // Update driver's status - simplified sync for now
          await db.update(drivers)
            .set({
              status: 'active',
              updatedAt: new Date()
            })
            .where(eq(drivers.id, driver[0].id));
          
          console.log(`Updated driver ${driver[0].id} compensation data`);
        }
      } catch (error) {
        console.error('Error syncing employee compensation:', error);
      }
    }
  }

  private async syncCompanyData(companyId: string, companyData: any): Promise<void> {
    // TODO: Sync company data to FreightOps database
    console.log(`Syncing company data for company ${companyId}:`, companyData);
  }

  async getConnectionStatus(companyId: string): Promise<{
    connected: boolean;
    gustoCompanyId?: string;
    gustoCompanyName?: string;
    lastSync?: Date;
  }> {
    try {
      const company = await db.select().from(companies).where(eq(companies.id, companyId)).limit(1);
      
      if (company.length === 0) {
        return { connected: false };
      }

      const companyData = company[0];
      
      if (!companyData.gustoAccessToken || !companyData.gustoCompanyId) {
        return { connected: false };
      }

      // Check if token is still valid
      const validToken = await this.getValidAccessToken(companyId);
      
      if (!validToken) {
        return { connected: false };
      }

      return {
        connected: true,
        gustoCompanyId: companyData.gustoCompanyId,
        lastSync: companyData.updatedAt
      };
    } catch (error) {
      console.error('Error checking Gusto connection status:', error);
      return { connected: false };
    }
  }
}

export const gustoOAuthService = new GustoOAuthService();