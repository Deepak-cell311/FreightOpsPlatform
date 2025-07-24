import crypto from 'crypto';
import axios from 'axios';

interface GustoCompany {
  id: string;
  name: string;
  ein: string;
  entityType: string;
  locationId: string;
}

interface GustoEmployee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  ssn?: string;
  dateOfBirth?: string;
  homeAddress?: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
  };
  workAddress?: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
  };
  jobTitle?: string;
  department?: string;
  hireDate?: string;
  terminationDate?: string;
  employmentStatus: 'active' | 'terminated';
  payType: 'salary' | 'hourly';
  rate?: number;
  paySchedule?: string;
}

interface GustoPayrollRun {
  id: string;
  companyId: string;
  payrollId: string;
  payPeriodStartDate: string;
  payPeriodEndDate: string;
  checkDate: string;
  processed: boolean;
  totalGross: number;
  totalNet: number;
  totalEmployeeTaxes: number;
  totalEmployerTaxes: number;
  employees: Array<{
    employeeId: string;
    grossPay: number;
    netPay: number;
    employeeTaxes: number;
    employerTaxes: number;
    deductions: number;
  }>;
}

interface GustoWebhookEvent {
  event_type: string;
  resource: string;
  resource_id: string;
  resource_uuid: string;
  company_id: string;
  company_uuid: string;
  timestamp: string;
  entity_type: string;
  entity_id: string;
  entity_uuid: string;
}

export class GustoPayrollService {
  private baseURL = 'https://api.gusto.com/v1';
  private partnerURL = 'https://api.gusto.com/partner/v1';
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private webhookSecret: string;
  private accessTokens: Map<string, string> = new Map(); // companyId -> accessToken

  constructor() {
    this.clientId = process.env.GUSTO_CLIENT_ID || '';
    this.clientSecret = process.env.GUSTO_CLIENT_SECRET || '';
    this.redirectUri = process.env.GUSTO_REDIRECT_URI || '';
    this.webhookSecret = process.env.GUSTO_WEBHOOK_SECRET || '';
  }

  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }

  // Get Partner API headers for embedded payroll
  private getPartnerHeaders(): Record<string, string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    return {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  // Get Company API headers with access token
  private getCompanyHeaders(companyId: string): Record<string, string> {
    const accessToken = this.accessTokens.get(companyId);
    if (!accessToken) {
      throw new Error(`No access token found for company ${companyId}`);
    }
    return {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  // OAuth Flow - Step 1: Generate authorization URL
  generateAuthURL(companyId: string, state?: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'payroll_read payroll_write employee_read employee_write company_read',
      state: state || companyId
    });

    return `https://api.gusto.com/oauth/authorize?${params.toString()}`;
  }

  // OAuth Flow - Step 2: Exchange code for access token
  async exchangeCodeForToken(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    token_type: string;
    scope: string;
    expires_in: number;
  }> {
    try {
      const response = await axios.post('https://api.gusto.com/oauth/token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        code: code,
        grant_type: 'authorization_code'
      });

      return response.data;
    } catch (error: any) {
      console.error('Error exchanging code for token:', error.response?.data || error.message);
      throw new Error('Failed to exchange authorization code for access token');
    }
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
    token_type: string;
    scope: string;
    expires_in: number;
  }> {
    try {
      const response = await axios.post('https://api.gusto.com/oauth/token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      });

      return response.data;
    } catch (error: any) {
      console.error('Error refreshing token:', error.response?.data || error.message);
      throw new Error('Failed to refresh access token');
    }
  }

  // Company Management
  async getCompanies(accessToken: string): Promise<GustoCompany[]> {
    try {
      const response = await axios.get(`${this.baseURL}/companies`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.map((company: any) => ({
        id: company.id || company.uuid,
        name: company.name,
        ein: company.ein,
        entityType: company.entity_type,
        locationId: company.locations?.[0]?.id
      }));
    } catch (error: any) {
      console.error('Error fetching companies:', error.response?.data || error.message);
      throw new Error('Failed to fetch companies from Gusto');
    }
  }

  async getCompany(companyId: string, accessToken: string): Promise<GustoCompany> {
    try {
      const response = await axios.get(`${this.baseURL}/companies/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const company = response.data;
      return {
        id: company.id || company.uuid,
        name: company.name,
        ein: company.ein,
        entityType: company.entity_type,
        locationId: company.locations?.[0]?.id
      };
    } catch (error: any) {
      console.error('Error fetching company:', error.response?.data || error.message);
      throw new Error('Failed to fetch company from Gusto');
    }
  }

  // Employee Management
  async getEmployees(companyId: string, accessToken: string): Promise<GustoEmployee[]> {
    try {
      const response = await axios.get(`${this.baseURL}/companies/${companyId}/employees`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.map((emp: any) => ({
        id: emp.id || emp.uuid,
        firstName: emp.first_name,
        lastName: emp.last_name,
        email: emp.email,
        ssn: emp.ssn,
        dateOfBirth: emp.date_of_birth,
        homeAddress: emp.home_address ? {
          street1: emp.home_address.street_1,
          street2: emp.home_address.street_2,
          city: emp.home_address.city,
          state: emp.home_address.state,
          zip: emp.home_address.zip
        } : undefined,
        workAddress: emp.work_address ? {
          street1: emp.work_address.street_1,
          street2: emp.work_address.street_2,
          city: emp.work_address.city,
          state: emp.work_address.state,
          zip: emp.work_address.zip
        } : undefined,
        jobTitle: emp.jobs?.[0]?.title,
        department: emp.jobs?.[0]?.location?.street_1, // Gusto uses location for department
        hireDate: emp.jobs?.[0]?.hire_date,
        terminationDate: emp.terminations?.[0]?.effective_date,
        employmentStatus: emp.terminations?.length > 0 ? 'terminated' : 'active',
        payType: emp.jobs?.[0]?.payment_unit === 'Hour' ? 'hourly' : 'salary',
        rate: emp.jobs?.[0]?.rate,
        paySchedule: emp.jobs?.[0]?.pay_schedule?.frequency
      }));
    } catch (error: any) {
      console.error('Error fetching employees:', error.response?.data || error.message);
      throw new Error('Failed to fetch employees from Gusto');
    }
  }

  async createEmployee(companyId: string, employeeData: Partial<GustoEmployee>, accessToken: string): Promise<GustoEmployee> {
    try {
      const gustoEmployeeData = {
        first_name: employeeData.firstName,
        last_name: employeeData.lastName,
        email: employeeData.email,
        ssn: employeeData.ssn,
        date_of_birth: employeeData.dateOfBirth,
        home_address: employeeData.homeAddress ? {
          street_1: employeeData.homeAddress.street1,
          street_2: employeeData.homeAddress.street2,
          city: employeeData.homeAddress.city,
          state: employeeData.homeAddress.state,
          zip: employeeData.homeAddress.zip
        } : undefined
      };

      const response = await axios.post(
        `${this.baseURL}/companies/${companyId}/employees`,
        gustoEmployeeData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const emp = response.data;
      return {
        id: emp.id || emp.uuid,
        firstName: emp.first_name,
        lastName: emp.last_name,
        email: emp.email,
        ssn: emp.ssn,
        dateOfBirth: emp.date_of_birth,
        homeAddress: emp.home_address ? {
          street1: emp.home_address.street_1,
          street2: emp.home_address.street_2,
          city: emp.home_address.city,
          state: emp.home_address.state,
          zip: emp.home_address.zip
        } : undefined,
        employmentStatus: 'active',
        payType: 'hourly',
        rate: 0
      };
    } catch (error: any) {
      console.error('Error creating employee:', error.response?.data || error.message);
      throw new Error('Failed to create employee in Gusto');
    }
  }

  // Payroll Management
  async getPayrollRuns(companyId: string, accessToken: string, startDate?: string, endDate?: string): Promise<GustoPayrollRun[]> {
    try {
      let url = `${this.baseURL}/companies/${companyId}/payrolls`;
      const params = new URLSearchParams();
      
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.map((payroll: any) => ({
        id: payroll.id || payroll.uuid,
        companyId: companyId,
        payrollId: payroll.id,
        payPeriodStartDate: payroll.pay_period_start_date,
        payPeriodEndDate: payroll.pay_period_end_date,
        checkDate: payroll.check_date,
        processed: payroll.processed,
        totalGross: payroll.totals?.company_debit || 0,
        totalNet: payroll.totals?.net_pay || 0,
        totalEmployeeTaxes: payroll.totals?.employee_taxes || 0,
        totalEmployerTaxes: payroll.totals?.employer_taxes || 0,
        employees: payroll.employee_compensations?.map((comp: any) => ({
          employeeId: comp.employee_id,
          grossPay: comp.gross_pay || 0,
          netPay: comp.net_pay || 0,
          employeeTaxes: comp.employee_taxes || 0,
          employerTaxes: comp.employer_taxes || 0,
          deductions: comp.employee_deductions || 0
        })) || []
      }));
    } catch (error: any) {
      console.error('Error fetching payroll runs:', error.response?.data || error.message);
      throw new Error('Failed to fetch payroll runs from Gusto');
    }
  }

  async createPayrollRun(companyId: string, payrollData: {
    payPeriodStartDate: string;
    payPeriodEndDate: string;
    checkDate: string;
  }, accessToken: string): Promise<GustoPayrollRun> {
    try {
      const response = await axios.post(
        `${this.baseURL}/companies/${companyId}/payrolls`,
        {
          pay_period_start_date: payrollData.payPeriodStartDate,
          pay_period_end_date: payrollData.payPeriodEndDate,
          check_date: payrollData.checkDate
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const payroll = response.data;
      return {
        id: payroll.id || payroll.uuid,
        companyId: companyId,
        payrollId: payroll.id,
        payPeriodStartDate: payroll.pay_period_start_date,
        payPeriodEndDate: payroll.pay_period_end_date,
        checkDate: payroll.check_date,
        processed: payroll.processed || false,
        totalGross: 0,
        totalNet: 0,
        totalEmployeeTaxes: 0,
        totalEmployerTaxes: 0,
        employees: []
      };
    } catch (error: any) {
      console.error('Error creating payroll run:', error.response?.data || error.message);
      throw new Error('Failed to create payroll run in Gusto');
    }
  }

  async processPayroll(payrollId: string, accessToken: string): Promise<boolean> {
    try {
      await axios.put(
        `${this.baseURL}/payrolls/${payrollId}/submit`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return true;
    } catch (error: any) {
      console.error('Error processing payroll:', error.response?.data || error.message);
      throw new Error('Failed to process payroll in Gusto');
    }
  }

  // Webhook verification
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret || this.webhookSecret === 'your_webhook_secret') {
      console.warn('Webhook secret not configured, skipping verification');
      return true; // Allow webhooks when not configured for development
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload, 'utf8')
        .digest('hex');

      const providedSignature = signature.replace('sha256=', '');
      
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(providedSignature, 'hex')
      );
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  // Verify webhook subscription with Gusto
  async verifyWebhookSubscription(webhookUuid: string, verificationToken: string): Promise<void> {
    try {
      console.log(`Verifying webhook subscription: ${webhookUuid}`);
      
      const response = await axios.put(
        `${this.baseURL}/webhook_subscriptions/${webhookUuid}/verify`,
        {
          verification_token: verificationToken
        },
        {
          headers: this.getPartnerHeaders()
        }
      );

      console.log('Webhook subscription verified successfully:', response.data);
      
      // Store the verification token as the webhook secret for future signature verification
      this.webhookSecret = verificationToken;
      
    } catch (error: any) {
      console.error('Error verifying webhook subscription:', error.response?.data || error.message);
      throw new Error(`Failed to verify webhook subscription: ${error.response?.data?.message || error.message}`);
    }
  }

  // Process webhook events
  async processWebhookEvent(event: GustoWebhookEvent): Promise<void> {
    console.log(`Processing Gusto webhook event: ${event.event_type} for ${event.resource}`);

    switch (event.event_type) {
      case 'employee.created':
        await this.handleEmployeeCreated(event);
        break;
      case 'employee.updated':
        await this.handleEmployeeUpdated(event);
        break;
      case 'employee.terminated':
        await this.handleEmployeeTerminated(event);
        break;
      case 'payroll.processed':
        await this.handlePayrollProcessed(event);
        break;
      case 'payroll.submitted':
        await this.handlePayrollSubmitted(event);
        break;
      default:
        console.log(`Unhandled webhook event type: ${event.event_type}`);
    }
  }

  private async handleEmployeeCreated(event: GustoWebhookEvent): Promise<void> {
    // Handle employee creation webhook
    console.log(`Employee created: ${event.entity_id} in company ${event.company_id}`);
  }

  private async handleEmployeeUpdated(event: GustoWebhookEvent): Promise<void> {
    // Handle employee update webhook
    console.log(`Employee updated: ${event.entity_id} in company ${event.company_id}`);
  }

  private async handleEmployeeTerminated(event: GustoWebhookEvent): Promise<void> {
    // Handle employee termination webhook
    console.log(`Employee terminated: ${event.entity_id} in company ${event.company_id}`);
  }

  private async handlePayrollProcessed(event: GustoWebhookEvent): Promise<void> {
    // Handle payroll processed webhook
    console.log(`Payroll processed: ${event.entity_id} in company ${event.company_id}`);
  }

  private async handlePayrollSubmitted(event: GustoWebhookEvent): Promise<void> {
    // Handle payroll submitted webhook
    console.log(`Payroll submitted: ${event.entity_id} in company ${event.company_id}`);
  }

  // Generate embedded iframe URL for Gusto (following Gusto's exact embedded specs)
  generateEmbeddedIframeUrl(companyId: string, accessToken: string, product: 'payroll' | 'benefits' | 'time-tracking' = 'payroll'): string {
    // Gusto embedded URLs follow this exact pattern
    const baseUrl = 'https://embedded.gusto.com';
    const params = new URLSearchParams({
      access_token: accessToken,
      company_uuid: companyId,
      product: product,
      embed: 'true'
    });

    return `${baseUrl}/${product}?${params.toString()}`;
  }

  // Generate Gusto Connect embedded link (for initial setup)
  generateConnectEmbedUrl(partnerToken: string, redirectUri: string): string {
    const baseUrl = 'https://embedded.gusto.com/connect';
    const params = new URLSearchParams({
      partner_token: partnerToken,
      redirect_uri: redirectUri,
      product: 'payroll'
    });

    return `${baseUrl}?${params.toString()}`;
  }

  // Generate webhook registration URL
  getWebhookRegistrationData(webhookUrl: string, events: string[] = ['*']): {
    url: string;
    events: string[];
    verification_token: string;
  } {
    return {
      url: webhookUrl,
      events: events,
      verification_token: this.webhookSecret
    };
  }
}

export const gustoPayrollService = new GustoPayrollService();