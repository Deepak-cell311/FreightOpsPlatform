import axios from 'axios';

export interface GustoCompany {
  id: string;
  name: string;
  trade_name?: string;
  ein: string;
  entity_type: string;
  company_status: string;
  locations: GustoLocation[];
  payroll_admin: GustoPayrollAdmin;
}

export interface GustoLocation {
  id: string;
  phone_number?: string;
  street_1: string;
  street_2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface GustoPayrollAdmin {
  id: string;
  version: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface GustoEmployee {
  id: string;
  version: string;
  first_name: string;
  middle_initial?: string;
  last_name: string;
  email?: string;
  ssn?: string;
  date_of_birth?: string;
  jobs: GustoJob[];
  home_address: GustoAddress;
  phone?: string;
  employee_number?: string;
  two_percent_shareholder?: boolean;
  terminated?: boolean;
  termination_date?: string;
  eligible_paid_time_off?: boolean;
  onboarding_status: string;
}

export interface GustoJob {
  id: string;
  version: string;
  employee_id: string;
  location_id: string;
  hire_date: string;
  title: string;
  rate: string;
  payment_unit: 'Hour' | 'Week' | 'Month' | 'Year' | 'Payroll';
  flsa_status: 'Exempt' | 'Nonexempt';
  current_compensation?: GustoCompensation;
}

export interface GustoCompensation {
  id: string;
  version: string;
  job_id: string;
  rate: string;
  payment_unit: string;
  flsa_status: string;
  effective_date: string;
}

export interface GustoAddress {
  id?: string;
  version?: string;
  street_1: string;
  street_2?: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

export interface GustoPayroll {
  id: string;
  version: string;
  company_id: string;
  start_date: string;
  end_date: string;
  pay_date: string;
  payroll_status: 'open' | 'processed' | 'canceled';
  totals: GustoPayrollTotals;
  employee_compensations: GustoEmployeeCompensation[];
}

export interface GustoPayrollTotals {
  company_debit: string;
  reimbursements: string;
  net_pay: string;
  gross_pay: string;
  employer_taxes: string;
  employee_taxes: string;
  benefits: string;
  employer_benefits: string;
}

export interface GustoEmployeeCompensation {
  employee_id: string;
  gross_pay: string;
  net_pay: string;
  payment_method: 'Direct Deposit' | 'Check';
  fixed_compensations: GustoFixedCompensation[];
  hourly_compensations: GustoHourlyCompensation[];
  paid_time_off: GustoPaidTimeOff[];
  deductions: GustoDeduction[];
  taxes: GustoTax[];
  benefits: GustoBenefit[];
}

export interface GustoFixedCompensation {
  name: string;
  amount: string;
  job_id: string;
}

export interface GustoHourlyCompensation {
  name: string;
  hours: string;
  job_id: string;
  compensation_multiplier: number;
}

export interface GustoPaidTimeOff {
  name: string;
  hours: string;
}

export interface GustoDeduction {
  name: string;
  amount: string;
}

export interface GustoTax {
  name: string;
  amount: string;
  employer: boolean;
}

export interface GustoBenefit {
  name: string;
  amount: string;
  employer_amount?: string;
}

export interface GustoTimeOffPolicy {
  id: string;
  name: string;
  policy_type: 'Vacation' | 'Sick' | 'Holiday' | 'Personal' | 'Bereavement' | 'Jury Duty' | 'Volunteer' | 'Military';
  accrual_unit: 'Hour' | 'Day';
  accrual_period: 'Hour' | 'Day' | 'Week' | 'Month' | 'Year' | 'Payroll';
  accrual_rate: string;
  accrual_balance: string;
  maximum_accrual_balance?: string;
  paid: boolean;
}

export interface GustoContractor {
  id: string;
  version: string;
  first_name: string;
  last_name: string;
  middle_initial?: string;
  email?: string;
  phone?: string;
  start_date: string;
  end_date?: string;
  wage_type: 'Fixed' | 'Hourly';
  hourly_rate?: string;
  business_name?: string;
  ein?: string;
  type: 'Individual' | 'Business';
  self_onboarding: boolean;
  onboarding_status: string;
}

export interface GustoEmployeeBenefit {
  id: string;
  version: string;
  employee_id: string;
  benefit_id: string;
  active: boolean;
  employee_deduction: string;
  company_contribution: string;
  employee_deduction_annual_maximum?: string;
  company_contribution_annual_maximum?: string;
  deduct_as_percentage: boolean;
  contribute_as_percentage: boolean;
  catch_up?: boolean;
  coverage_amount?: string;
  coverage_salary_multiplier?: string;
}

export class GustoService {
  private apiKey: string;
  private baseUrl: string;
  private axios: any;

  constructor() {
    this.apiKey = process.env.GUSTO_API_KEY || '';
    this.baseUrl = process.env.GUSTO_ENVIRONMENT === 'production' 
      ? 'https://api.gusto.com/v1' 
      : 'https://api.gusto-demo.com/v1';
    
    this.axios = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // Company Management
  async getCompany(companyId: string): Promise<GustoCompany> {
    try {
      const response = await this.axios.get(`/companies/${companyId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching company:', error);
      throw new Error('Failed to fetch company from Gusto');
    }
  }

  async createCompany(companyData: {
    name: string;
    trade_name?: string;
    ein: string;
    entity_type: string;
    addresses: GustoAddress[];
  }): Promise<GustoCompany> {
    try {
      const response = await this.axios.post('/companies', companyData);
      return response.data;
    } catch (error) {
      console.error('Error creating company:', error);
      throw new Error('Failed to create company in Gusto');
    }
  }

  // Employee Management
  async getEmployees(companyId: string): Promise<GustoEmployee[]> {
    try {
      const response = await this.axios.get(`/companies/${companyId}/employees`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw new Error('Failed to fetch employees from Gusto');
    }
  }

  async createEmployee(companyId: string, employeeData: {
    first_name: string;
    last_name: string;
    email: string;
    ssn?: string;
    date_of_birth?: string;
    home_address: GustoAddress;
    jobs: Partial<GustoJob>[];
  }): Promise<GustoEmployee> {
    try {
      const response = await this.axios.post(`/companies/${companyId}/employees`, employeeData);
      return response.data;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw new Error('Failed to create employee in Gusto');
    }
  }

  async updateEmployee(companyId: string, employeeId: string, employeeData: Partial<GustoEmployee>): Promise<GustoEmployee> {
    try {
      const response = await this.axios.put(`/companies/${companyId}/employees/${employeeId}`, employeeData);
      return response.data;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw new Error('Failed to update employee in Gusto');
    }
  }

  async terminateEmployee(companyId: string, employeeId: string, terminationDate: string, runTerminationPayroll: boolean = false): Promise<GustoEmployee> {
    try {
      const response = await this.axios.put(`/companies/${companyId}/employees/${employeeId}`, {
        terminated: true,
        termination_date: terminationDate,
        run_termination_payroll: runTerminationPayroll,
      });
      return response.data;
    } catch (error) {
      console.error('Error terminating employee:', error);
      throw new Error('Failed to terminate employee in Gusto');
    }
  }

  // Payroll Management
  async getCurrentPayrolls(companyId: string): Promise<GustoPayroll[]> {
    try {
      const response = await this.axios.get(`/companies/${companyId}/payrolls`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payrolls:', error);
      throw new Error('Failed to fetch payrolls from Gusto');
    }
  }

  async createPayroll(companyId: string, payrollData: {
    start_date: string;
    end_date: string;
    pay_date: string;
  }): Promise<GustoPayroll> {
    try {
      const response = await this.axios.post(`/companies/${companyId}/payrolls`, payrollData);
      return response.data;
    } catch (error) {
      console.error('Error creating payroll:', error);
      throw new Error('Failed to create payroll in Gusto');
    }
  }

  async updatePayroll(companyId: string, payrollId: string, payrollData: {
    employee_compensations: GustoEmployeeCompensation[];
  }): Promise<GustoPayroll> {
    try {
      const response = await this.axios.put(`/companies/${companyId}/payrolls/${payrollId}`, payrollData);
      return response.data;
    } catch (error) {
      console.error('Error updating payroll:', error);
      throw new Error('Failed to update payroll in Gusto');
    }
  }

  async calculatePayroll(companyId: string, payrollId: string): Promise<GustoPayroll> {
    try {
      const response = await this.axios.put(`/companies/${companyId}/payrolls/${payrollId}/calculate`);
      return response.data;
    } catch (error) {
      console.error('Error calculating payroll:', error);
      throw new Error('Failed to calculate payroll in Gusto');
    }
  }

  async submitPayroll(companyId: string, payrollId: string): Promise<GustoPayroll> {
    try {
      const response = await this.axios.put(`/companies/${companyId}/payrolls/${payrollId}/submit`);
      return response.data;
    } catch (error) {
      console.error('Error submitting payroll:', error);
      throw new Error('Failed to submit payroll to Gusto');
    }
  }

  async cancelPayroll(companyId: string, payrollId: string): Promise<GustoPayroll> {
    try {
      const response = await this.axios.put(`/companies/${companyId}/payrolls/${payrollId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error canceling payroll:', error);
      throw new Error('Failed to cancel payroll in Gusto');
    }
  }

  // Time Off Management
  async getTimeOffPolicies(companyId: string): Promise<GustoTimeOffPolicy[]> {
    try {
      const response = await this.axios.get(`/companies/${companyId}/time_off_policies`);
      return response.data;
    } catch (error) {
      console.error('Error fetching time off policies:', error);
      throw new Error('Failed to fetch time off policies from Gusto');
    }
  }

  async createTimeOffPolicy(companyId: string, policyData: {
    name: string;
    policy_type: string;
    accrual_unit: string;
    accrual_period: string;
    accrual_rate: string;
    paid: boolean;
  }): Promise<GustoTimeOffPolicy> {
    try {
      const response = await this.axios.post(`/companies/${companyId}/time_off_policies`, policyData);
      return response.data;
    } catch (error) {
      console.error('Error creating time off policy:', error);
      throw new Error('Failed to create time off policy in Gusto');
    }
  }

  // Benefits Management
  async getEmployeeBenefits(companyId: string, employeeId: string): Promise<GustoEmployeeBenefit[]> {
    try {
      const response = await this.axios.get(`/companies/${companyId}/employees/${employeeId}/employee_benefits`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee benefits:', error);
      throw new Error('Failed to fetch employee benefits from Gusto');
    }
  }

  async enrollEmployeeInBenefits(companyId: string, employeeId: string, benefitData: {
    benefit_id: string;
    employee_deduction?: string;
    company_contribution?: string;
    deduct_as_percentage?: boolean;
    contribute_as_percentage?: boolean;
    coverage_amount?: string;
  }): Promise<GustoEmployeeBenefit> {
    try {
      const response = await this.axios.post(`/companies/${companyId}/employees/${employeeId}/employee_benefits`, benefitData);
      return response.data;
    } catch (error) {
      console.error('Error enrolling employee in benefits:', error);
      throw new Error('Failed to enroll employee in benefits');
    }
  }

  // Contractor Management
  async getContractors(companyId: string): Promise<GustoContractor[]> {
    try {
      const response = await this.axios.get(`/companies/${companyId}/contractors`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contractors:', error);
      throw new Error('Failed to fetch contractors from Gusto');
    }
  }

  async createContractor(companyId: string, contractorData: {
    first_name: string;
    last_name: string;
    email: string;
    start_date: string;
    wage_type: 'Fixed' | 'Hourly';
    hourly_rate?: string;
    type: 'Individual' | 'Business';
  }): Promise<GustoContractor> {
    try {
      const response = await this.axios.post(`/companies/${companyId}/contractors`, contractorData);
      return response.data;
    } catch (error) {
      console.error('Error creating contractor:', error);
      throw new Error('Failed to create contractor in Gusto');
    }
  }

  // Tax and Compliance
  async getTaxLiabilities(companyId: string, startDate?: string, endDate?: string): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await this.axios.get(`/companies/${companyId}/tax_liabilities?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tax liabilities:', error);
      throw new Error('Failed to fetch tax liabilities from Gusto');
    }
  }

  async getPaystub(companyId: string, employeeId: string, payrollId: string): Promise<any> {
    try {
      const response = await this.axios.get(`/companies/${companyId}/employees/${employeeId}/pay_stubs`, {
        params: { payroll_id: payrollId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching paystub:', error);
      throw new Error('Failed to fetch paystub from Gusto');
    }
  }

  // Time Tracking Integration
  async importTimeEntries(companyId: string, payrollId: string, timeEntries: {
    employee_id: string;
    date: string;
    hours: number;
    job_id: string;
  }[]): Promise<any> {
    try {
      const response = await this.axios.post(`/companies/${companyId}/payrolls/${payrollId}/employee_compensations/import_hours`, {
        time_entries: timeEntries
      });
      return response.data;
    } catch (error) {
      console.error('Error importing time entries:', error);
      throw new Error('Failed to import time entries to Gusto');
    }
  }

  // Onboarding
  async generateOnboardingLink(companyId: string, employeeId: string): Promise<{ url: string }> {
    try {
      const response = await this.axios.post(`/companies/${companyId}/employees/${employeeId}/onboarding_link`);
      return response.data;
    } catch (error) {
      console.error('Error generating onboarding link:', error);
      throw new Error('Failed to generate onboarding link');
    }
  }

  async getOnboardingStatus(companyId: string, employeeId: string): Promise<{ status: string; completed_steps: string[] }> {
    try {
      const response = await this.axios.get(`/companies/${companyId}/employees/${employeeId}/onboarding_status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
      throw new Error('Failed to fetch onboarding status');
    }
  }

  // Utility Methods
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== '';
  }

  getApiStatus(): { configured: boolean; environment: string } {
    return {
      configured: this.isConfigured(),
      environment: process.env.GUSTO_ENVIRONMENT || 'not-set'
    };
  }
}

export const gustoService = new GustoService();