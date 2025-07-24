/**
 * Gusto API Service - Real Gusto Payroll Integration
 * Implements complete Gusto API functionality for payroll and HR management
 */

import axios, { AxiosInstance } from 'axios';
import { storage } from '../storage';

interface GustoConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  apiBaseUrl: string;
}

interface GustoEmployee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  ssn: string;
  start_date: string;
  home_address: {
    street_1: string;
    street_2?: string;
    city: string;
    state: string;
    zip: string;
  };
  work_address?: {
    street_1: string;
    street_2?: string;
    city: string;
    state: string;
    zip: string;
  };
}

interface GustoPayroll {
  id: string;
  company_id: string;
  pay_period: {
    start_date: string;
    end_date: string;
  };
  check_date: string;
  processed: boolean;
  totals: {
    gross_pay: string;
    net_pay: string;
    employer_taxes: string;
    employee_taxes: string;
    employee_deductions: string;
    employer_contributions: string;
  };
}

interface GustoJob {
  id: string;
  employee_id: string;
  title: string;
  hire_date: string;
  location_id: string;
  rate: string;
  payment_unit: string;
  flsa_status: string;
}

interface GustoCompensation {
  id: string;
  job_id: string;
  rate: string;
  payment_unit: string;
  flsa_status: string;
  effective_date: string;
}

export class GustoService {
  private client: AxiosInstance;
  private config: GustoConfig;

  constructor() {
    this.config = {
      clientId: process.env.GUSTO_CLIENT_ID || '',
      clientSecret: process.env.GUSTO_CLIENT_SECRET || '',
      redirectUri: process.env.GUSTO_REDIRECT_URI || '',
      apiBaseUrl: process.env.GUSTO_API_BASE_URL || 'https://api.gusto.com/v1',
    };

    this.client = axios.create({
      baseURL: this.config.apiBaseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Gusto API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  /**
   * Generate OAuth authorization URL
   */
  generateAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: 'employee_read employee_write company_read company_write payroll_read payroll_write',
      state,
    });

    return `https://api.gusto.com/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<any> {
    try {
      const response = await axios.post('https://api.gusto.com/oauth/token', {
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.config.redirectUri,
      });

      return response.data;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<any> {
    try {
      const response = await axios.post('https://api.gusto.com/oauth/token', {
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      });

      return response.data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  /**
   * Set authentication token for requests
   */
  private setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Get company information
   */
  async getCompany(companyId: string): Promise<any> {
    try {
      const integration = await storage.getGustoIntegration(companyId);
      if (!integration) {
        throw new Error('Gusto integration not found');
      }

      this.setAuthToken(integration.accessToken);
      const response = await this.client.get(`/companies/${integration.gustoCompanyId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching company:', error);
      throw error;
    }
  }

  /**
   * Get all employees for a company
   */
  async getCompanyEmployees(companyId: string): Promise<GustoEmployee[]> {
    try {
      const integration = await storage.getGustoIntegration(companyId);
      if (!integration) {
        throw new Error('Gusto integration not found');
      }

      this.setAuthToken(integration.accessToken);
      const response = await this.client.get(`/companies/${integration.gustoCompanyId}/employees`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  }

  /**
   * Create new employee
   */
  async createEmployee(companyId: string, employeeData: Partial<GustoEmployee>): Promise<GustoEmployee> {
    try {
      const integration = await storage.getGustoIntegration(companyId);
      if (!integration) {
        throw new Error('Gusto integration not found');
      }

      this.setAuthToken(integration.accessToken);
      const response = await this.client.post(`/companies/${integration.gustoCompanyId}/employees`, employeeData);
      return response.data;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  /**
   * Update employee information
   */
  async updateEmployee(employeeId: string, employeeData: Partial<GustoEmployee>): Promise<GustoEmployee> {
    try {
      const response = await this.client.put(`/employees/${employeeId}`, employeeData);
      return response.data;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }

  /**
   * Create job for employee
   */
  async createJob(companyId: string, jobData: any): Promise<GustoJob> {
    try {
      const integration = await storage.getGustoIntegration(companyId);
      if (!integration) {
        throw new Error('Gusto integration not found');
      }

      this.setAuthToken(integration.accessToken);
      const response = await this.client.post(`/companies/${integration.gustoCompanyId}/jobs`, jobData);
      return response.data;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  /**
   * Create compensation for job
   */
  async createCompensation(jobId: string, compensationData: any): Promise<GustoCompensation> {
    try {
      const response = await this.client.post(`/jobs/${jobId}/compensations`, compensationData);
      return response.data;
    } catch (error) {
      console.error('Error creating compensation:', error);
      throw error;
    }
  }

  /**
   * Get payrolls for company
   */
  async getCompanyPayrolls(companyId: string, filters?: any): Promise<GustoPayroll[]> {
    try {
      const integration = await storage.getGustoIntegration(companyId);
      if (!integration) {
        throw new Error('Gusto integration not found');
      }

      this.setAuthToken(integration.accessToken);
      
      const params = new URLSearchParams();
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.processed) params.append('processed', filters.processed);

      const response = await this.client.get(`/companies/${integration.gustoCompanyId}/payrolls?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payrolls:', error);
      throw error;
    }
  }

  /**
   * Create payroll
   */
  async createPayroll(companyId: string, payrollData: any): Promise<GustoPayroll> {
    try {
      const integration = await storage.getGustoIntegration(companyId);
      if (!integration) {
        throw new Error('Gusto integration not found');
      }

      this.setAuthToken(integration.accessToken);
      const response = await this.client.post(`/companies/${integration.gustoCompanyId}/payrolls`, payrollData);
      return response.data;
    } catch (error) {
      console.error('Error creating payroll:', error);
      throw error;
    }
  }

  /**
   * Submit payroll for processing
   */
  async submitPayroll(companyId: string, payrollId: string): Promise<GustoPayroll> {
    try {
      const integration = await storage.getGustoIntegration(companyId);
      if (!integration) {
        throw new Error('Gusto integration not found');
      }

      this.setAuthToken(integration.accessToken);
      const response = await this.client.put(`/companies/${integration.gustoCompanyId}/payrolls/${payrollId}/submit`);
      return response.data;
    } catch (error) {
      console.error('Error submitting payroll:', error);
      throw error;
    }
  }

  /**
   * Get employee benefits
   */
  async getEmployeeBenefits(employeeId: string): Promise<any[]> {
    try {
      const response = await this.client.get(`/employees/${employeeId}/benefits`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee benefits:', error);
      throw error;
    }
  }

  /**
   * Enroll employee in benefit
   */
  async enrollEmployeeInBenefit(employeeId: string, benefitData: any): Promise<any> {
    try {
      const response = await this.client.post(`/employees/${employeeId}/benefits`, benefitData);
      return response.data;
    } catch (error) {
      console.error('Error enrolling employee in benefit:', error);
      throw error;
    }
  }

  /**
   * Get company benefits
   */
  async getCompanyBenefits(companyId: string): Promise<any[]> {
    try {
      const integration = await storage.getGustoIntegration(companyId);
      if (!integration) {
        throw new Error('Gusto integration not found');
      }

      this.setAuthToken(integration.accessToken);
      const response = await this.client.get(`/companies/${integration.gustoCompanyId}/benefits`);
      return response.data;
    } catch (error) {
      console.error('Error fetching company benefits:', error);
      throw error;
    }
  }

  /**
   * Get employee time off requests
   */
  async getEmployeeTimeOffRequests(employeeId: string): Promise<any[]> {
    try {
      const response = await this.client.get(`/employees/${employeeId}/time_off_requests`);
      return response.data;
    } catch (error) {
      console.error('Error fetching time off requests:', error);
      throw error;
    }
  }

  /**
   * Create time off request
   */
  async createTimeOffRequest(employeeId: string, timeOffData: any): Promise<any> {
    try {
      const response = await this.client.post(`/employees/${employeeId}/time_off_requests`, timeOffData);
      return response.data;
    } catch (error) {
      console.error('Error creating time off request:', error);
      throw error;
    }
  }

  /**
   * Sync employee from Gusto to FreightOps
   */
  async syncEmployeeToFreightOps(companyId: string, gustoEmployee: GustoEmployee): Promise<any> {
    try {
      // Check if driver already exists
      const existingDriver = await storage.getDriverByEmail(gustoEmployee.email);
      
      if (existingDriver) {
        // Update existing driver with Gusto data
        await storage.updateDriver(existingDriver.id, {
          firstName: gustoEmployee.first_name,
          lastName: gustoEmployee.last_name,
          email: gustoEmployee.email,
          phone: gustoEmployee.phone,
          gustoEmployeeId: gustoEmployee.id,
          syncedAt: new Date(),
        });
        return existingDriver;
      } else {
        // Create new driver from Gusto employee
        const driverData = {
          companyId,
          firstName: gustoEmployee.first_name,
          lastName: gustoEmployee.last_name,
          email: gustoEmployee.email,
          phone: gustoEmployee.phone,
          licenseNumber: '', // Will be updated later
          licenseState: '', // Will be updated later
          licenseExpiry: new Date(), // Will be updated later
          status: 'active',
          gustoEmployeeId: gustoEmployee.id,
          syncedAt: new Date(),
        };

        return await storage.createDriver(driverData);
      }
    } catch (error) {
      console.error('Error syncing employee to FreightOps:', error);
      throw error;
    }
  }

  /**
   * Webhook handler for Gusto events
   */
  async handleWebhook(webhookData: any): Promise<void> {
    try {
      const { event_type, resource_type, resource_id, company_id } = webhookData;

      console.log('Gusto webhook received:', { event_type, resource_type, resource_id, company_id });

      switch (event_type) {
        case 'employee.created':
          await this.handleEmployeeCreated(company_id, resource_id);
          break;
        case 'employee.updated':
          await this.handleEmployeeUpdated(company_id, resource_id);
          break;
        case 'payroll.processed':
          await this.handlePayrollProcessed(company_id, resource_id);
          break;
        default:
          console.log('Unhandled webhook event:', event_type);
      }
    } catch (error) {
      console.error('Error handling Gusto webhook:', error);
      throw error;
    }
  }

  /**
   * Handle employee created webhook
   */
  private async handleEmployeeCreated(companyId: string, employeeId: string): Promise<void> {
    try {
      const integration = await storage.getGustoIntegration(companyId);
      if (!integration) {
        console.error('Gusto integration not found for company:', companyId);
        return;
      }

      this.setAuthToken(integration.accessToken);
      const response = await this.client.get(`/employees/${employeeId}`);
      const gustoEmployee = response.data;

      await this.syncEmployeeToFreightOps(companyId, gustoEmployee);
    } catch (error) {
      console.error('Error handling employee created webhook:', error);
    }
  }

  /**
   * Handle employee updated webhook
   */
  private async handleEmployeeUpdated(companyId: string, employeeId: string): Promise<void> {
    try {
      const integration = await storage.getGustoIntegration(companyId);
      if (!integration) {
        console.error('Gusto integration not found for company:', companyId);
        return;
      }

      this.setAuthToken(integration.accessToken);
      const response = await this.client.get(`/employees/${employeeId}`);
      const gustoEmployee = response.data;

      await this.syncEmployeeToFreightOps(companyId, gustoEmployee);
    } catch (error) {
      console.error('Error handling employee updated webhook:', error);
    }
  }

  /**
   * Handle payroll processed webhook
   */
  private async handlePayrollProcessed(companyId: string, payrollId: string): Promise<void> {
    try {
      const integration = await storage.getGustoIntegration(companyId);
      if (!integration) {
        console.error('Gusto integration not found for company:', companyId);
        return;
      }

      this.setAuthToken(integration.accessToken);
      const response = await this.client.get(`/companies/${integration.gustoCompanyId}/payrolls/${payrollId}`);
      const payroll = response.data;

      // Update payroll status in FreightOps
      // This would integrate with accounting system
      console.log('Payroll processed:', payroll);
    } catch (error) {
      console.error('Error handling payroll processed webhook:', error);
    }
  }
}

// Export singleton instance
export const gustoService = new GustoService();