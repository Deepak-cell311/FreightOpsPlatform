import { OpenAI } from 'openai';
import Stripe from 'stripe';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Enterprise HR Management
export interface Employee {
  id: string;
  employeeId: string;
  companyId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: Date;
    ssn: string; // Encrypted
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    phone: string;
    email: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  employment: {
    hireDate: Date;
    terminationDate?: Date;
    status: 'active' | 'terminated' | 'on_leave' | 'suspended';
    department: string;
    position: string;
    reportingManager: string;
    workLocation: string;
    employmentType: 'full_time' | 'part_time' | 'contractor' | 'seasonal';
    workSchedule: {
      hoursPerWeek: number;
      standardDays: string[];
      startTime: string;
      endTime: string;
    };
  };
  compensation: {
    payType: 'salary' | 'hourly' | 'commission' | 'piece_rate';
    basePay: number;
    currency: string;
    payFrequency: 'weekly' | 'biweekly' | 'monthly' | 'semi_monthly';
    overtime: {
      eligible: boolean;
      rate: number; // Multiplier (e.g., 1.5 for time and a half)
    };
    benefits: {
      healthInsurance: boolean;
      dentalInsurance: boolean;
      visionInsurance: boolean;
      retirement401k: boolean;
      paidTimeOff: number; // Hours per year
      sickLeave: number; // Hours per year
    };
    deductions: {
      federalTax: number;
      stateTax: number;
      socialSecurity: number;
      medicare: number;
      healthInsurancePremium: number;
      retirement401k: number;
      otherDeductions: Record<string, number>;
    };
  };
  compliance: {
    i9Verified: boolean;
    w4OnFile: boolean;
    backgroundCheckComplete: boolean;
    drugTestComplete: boolean;
    cdlValid?: boolean;
    cdlExpiration?: Date;
    dotPhysicalValid?: boolean;
    dotPhysicalExpiration?: Date;
    trainingRecords: Array<{
      type: string;
      completedDate: Date;
      expirationDate?: Date;
      certificateUrl?: string;
    }>;
  };
  performance: {
    lastReviewDate?: Date;
    nextReviewDate?: Date;
    performanceRating?: number; // 1-5 scale
    goals: string[];
    disciplinaryActions: Array<{
      date: Date;
      type: string;
      description: string;
      actionTaken: string;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Payroll Processing
export interface PayrollRun {
  id: string;
  companyId: string;
  payPeriod: {
    startDate: Date;
    endDate: Date;
    payDate: Date;
  };
  status: 'draft' | 'processing' | 'completed' | 'cancelled';
  totalGrossPay: number;
  totalNetPay: number;
  totalTaxes: number;
  totalDeductions: number;
  employeeCount: number;
  payrollEntries: PayrollEntry[];
  taxFilings: TaxFiling[];
  bankTransfers: BankTransfer[];
  createdAt: Date;
  processedAt?: Date;
  createdBy: string;
}

export interface PayrollEntry {
  id: string;
  employeeId: string;
  payrollRunId: string;
  earnings: {
    regularHours: number;
    overtimeHours: number;
    regularPay: number;
    overtimePay: number;
    commissions: number;
    bonuses: number;
    reimbursements: number;
    grossPay: number;
  };
  deductions: {
    federalIncomeTax: number;
    stateIncomeTax: number;
    socialSecurityTax: number;
    medicareTax: number;
    unemploymentTax: number;
    healthInsurance: number;
    dentalInsurance: number;
    visionInsurance: number;
    retirement401k: number;
    otherDeductions: Record<string, number>;
    totalDeductions: number;
  };
  netPay: number;
  paymentMethod: 'direct_deposit' | 'check' | 'card';
  bankAccount?: {
    routingNumber: string;
    accountNumber: string;
    accountType: 'checking' | 'savings';
  };
  paystubUrl?: string;
  status: 'pending' | 'paid' | 'failed';
  paidAt?: Date;
}

// Tax Management
export interface TaxFiling {
  id: string;
  companyId: string;
  filingType: 'federal_940' | 'federal_941' | 'state_quarterly' | 'state_annual' | 'local';
  taxPeriod: {
    year: number;
    quarter?: number;
    month?: number;
  };
  totalWages: number;
  totalTaxWithheld: number;
  employerTaxLiability: number;
  filingStatus: 'draft' | 'submitted' | 'accepted' | 'rejected';
  dueDate: Date;
  submittedAt?: Date;
  confirmationNumber?: string;
  filingUrl?: string;
  penalties?: number;
  interest?: number;
}

export interface BankTransfer {
  id: string;
  companyId: string;
  payrollRunId: string;
  transferType: 'payroll' | 'taxes' | 'fees';
  amount: number;
  currency: string;
  bankAccount: {
    routingNumber: string;
    accountNumber: string;
    accountName: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  scheduledDate: Date;
  processedDate?: Date;
  stripeTransferId?: string;
  failureReason?: string;
}

// Time and Attendance
export interface TimeEntry {
  id: string;
  employeeId: string;
  companyId: string;
  date: Date;
  clockIn: Date;
  clockOut?: Date;
  breakStart?: Date;
  breakEnd?: Date;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  notes?: string;
  approvedBy?: string;
  approvedAt?: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export class EnterpriseHRService {
  private stripe: Stripe;

  constructor() {
    this.stripe = stripe;
  }

  // Employee Management
  async createEmployee(employeeData: Partial<Employee>): Promise<Employee> {
    try {
      const employee: Employee = {
        id: `emp_${Date.now()}`,
        employeeId: this.generateEmployeeId(),
        companyId: employeeData.companyId!,
        personalInfo: employeeData.personalInfo!,
        employment: {
          ...employeeData.employment!,
          status: 'active',
        },
        compensation: employeeData.compensation!,
        compliance: {
          i9Verified: false,
          w4OnFile: false,
          backgroundCheckComplete: false,
          drugTestComplete: false,
          trainingRecords: [],
        },
        performance: {
          goals: [],
          disciplinaryActions: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create Stripe customer for employee payroll
      const stripeCustomer = await this.stripe.customers.create({
        email: employee.personalInfo.email,
        name: `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`,
        metadata: {
          employeeId: employee.id,
          companyId: employee.companyId,
        },
      });

      return employee;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  // Payroll Processing
  async processPayroll(companyId: string, payPeriod: any): Promise<PayrollRun> {
    try {
      const payrollRun: PayrollRun = {
        id: `pr_${Date.now()}`,
        companyId,
        payPeriod,
        status: 'processing',
        totalGrossPay: 0,
        totalNetPay: 0,
        totalTaxes: 0,
        totalDeductions: 0,
        employeeCount: 0,
        payrollEntries: [],
        taxFilings: [],
        bankTransfers: [],
        createdAt: new Date(),
        createdBy: 'system',
      };

      // Get all active employees
      const employees = await this.getActiveEmployees(companyId);
      
      for (const employee of employees) {
        const timeEntries = await this.getTimeEntries(employee.id, payPeriod.startDate, payPeriod.endDate);
        const payrollEntry = await this.calculatePayrollEntry(employee, timeEntries, payrollRun.id);
        
        payrollRun.payrollEntries.push(payrollEntry);
        payrollRun.totalGrossPay += payrollEntry.earnings.grossPay;
        payrollRun.totalNetPay += payrollEntry.netPay;
        payrollRun.totalTaxes += payrollEntry.deductions.federalIncomeTax + 
                                 payrollEntry.deductions.stateIncomeTax +
                                 payrollEntry.deductions.socialSecurityTax +
                                 payrollEntry.deductions.medicareTax;
        payrollRun.totalDeductions += payrollEntry.deductions.totalDeductions;
      }

      payrollRun.employeeCount = employees.length;

      // Generate tax filings
      payrollRun.taxFilings = await this.generateTaxFilings(payrollRun);

      // Create bank transfers
      payrollRun.bankTransfers = await this.createBankTransfers(payrollRun);

      payrollRun.status = 'completed';
      payrollRun.processedAt = new Date();

      return payrollRun;
    } catch (error) {
      console.error('Error processing payroll:', error);
      throw error;
    }
  }

  private async calculatePayrollEntry(employee: Employee, timeEntries: TimeEntry[], payrollRunId: string): Promise<PayrollEntry> {
    // Calculate total hours
    const totalRegularHours = timeEntries.reduce((sum, entry) => sum + entry.regularHours, 0);
    const totalOvertimeHours = timeEntries.reduce((sum, entry) => sum + entry.overtimeHours, 0);

    // Calculate earnings
    const regularPay = totalRegularHours * employee.compensation.basePay;
    const overtimePay = totalOvertimeHours * employee.compensation.basePay * employee.compensation.overtime.rate;
    const grossPay = regularPay + overtimePay;

    // Calculate taxes and deductions
    const federalIncomeTax = this.calculateFederalTax(grossPay, employee);
    const stateTax = this.calculateStateTax(grossPay, employee);
    const socialSecurityTax = Math.min(grossPay * 0.062, 10453.20); // 2024 limit
    const medicareTax = grossPay * 0.0145;
    const healthInsurance = employee.compensation.deductions.healthInsurancePremium;
    const retirement401k = grossPay * (employee.compensation.deductions.retirement401k / 100);

    const totalDeductions = federalIncomeTax + stateTax + socialSecurityTax + 
                           medicareTax + healthInsurance + retirement401k;

    const payrollEntry: PayrollEntry = {
      id: `pe_${Date.now()}_${employee.id}`,
      employeeId: employee.id,
      payrollRunId,
      earnings: {
        regularHours: totalRegularHours,
        overtimeHours: totalOvertimeHours,
        regularPay,
        overtimePay,
        commissions: 0,
        bonuses: 0,
        reimbursements: 0,
        grossPay,
      },
      deductions: {
        federalIncomeTax,
        stateIncomeTax: stateTax,
        socialSecurityTax,
        medicareTax,
        unemploymentTax: 0,
        healthInsurance,
        dentalInsurance: 0,
        visionInsurance: 0,
        retirement401k,
        otherDeductions: {},
        totalDeductions,
      },
      netPay: grossPay - totalDeductions,
      paymentMethod: 'direct_deposit',
      status: 'pending',
    };

    return payrollEntry;
  }

  // Tax Calculations
  private calculateFederalTax(grossPay: number, employee: Employee): number {
    // Simplified federal tax calculation - would use actual tax tables
    const annualizedPay = grossPay * this.getPayPeriods(employee.compensation.payFrequency);
    
    // 2024 tax brackets for single filer (simplified)
    let tax = 0;
    if (annualizedPay > 609350) {
      tax = 183647.25 + (annualizedPay - 609350) * 0.37;
    } else if (annualizedPay > 243725) {
      tax = 55678.50 + (annualizedPay - 243725) * 0.35;
    } else if (annualizedPay > 191950) {
      tax = 37104.00 + (annualizedPay - 191950) * 0.32;
    } else if (annualizedPay > 100525) {
      tax = 16290.00 + (annualizedPay - 100525) * 0.24;
    } else if (annualizedPay > 47150) {
      tax = 5426.00 + (annualizedPay - 47150) * 0.22;
    } else if (annualizedPay > 11000) {
      tax = 1100.00 + (annualizedPay - 11000) * 0.12;
    } else {
      tax = annualizedPay * 0.10;
    }

    return tax / this.getPayPeriods(employee.compensation.payFrequency);
  }

  private calculateStateTax(grossPay: number, employee: Employee): number {
    // Simplified state tax calculation - would vary by state
    const stateRate = 0.05; // 5% average state tax
    return grossPay * stateRate;
  }

  private getPayPeriods(frequency: string): number {
    switch (frequency) {
      case 'weekly': return 52;
      case 'biweekly': return 26;
      case 'semi_monthly': return 24;
      case 'monthly': return 12;
      default: return 26;
    }
  }

  // Time and Attendance
  async clockIn(employeeId: string, location?: any): Promise<TimeEntry> {
    const timeEntry: TimeEntry = {
      id: `te_${Date.now()}`,
      employeeId,
      companyId: '', // Would be retrieved from employee
      date: new Date(),
      clockIn: new Date(),
      totalHours: 0,
      regularHours: 0,
      overtimeHours: 0,
      location,
      status: 'pending',
    };

    return timeEntry;
  }

  async clockOut(timeEntryId: string): Promise<TimeEntry> {
    // Retrieve and update time entry
    const timeEntry = await this.getTimeEntry(timeEntryId);
    timeEntry.clockOut = new Date();
    
    const hoursWorked = (timeEntry.clockOut.getTime() - timeEntry.clockIn.getTime()) / (1000 * 60 * 60);
    timeEntry.totalHours = hoursWorked;
    
    if (hoursWorked > 8) {
      timeEntry.regularHours = 8;
      timeEntry.overtimeHours = hoursWorked - 8;
    } else {
      timeEntry.regularHours = hoursWorked;
      timeEntry.overtimeHours = 0;
    }

    return timeEntry;
  }

  // Compliance and Training
  async scheduleTraining(employeeId: string, trainingType: string): Promise<void> {
    // Schedule required training based on employee role and compliance requirements
    const trainingModules = await this.getRequiredTraining(employeeId, trainingType);
    
    for (const module of trainingModules) {
      await this.createTrainingAssignment(employeeId, module);
    }
  }

  async generateComplianceReport(companyId: string): Promise<any> {
    const employees = await this.getActiveEmployees(companyId);
    
    const report = {
      totalEmployees: employees.length,
      i9Compliance: employees.filter(e => e.compliance.i9Verified).length,
      w4Compliance: employees.filter(e => e.compliance.w4OnFile).length,
      backgroundChecks: employees.filter(e => e.compliance.backgroundCheckComplete).length,
      drugTests: employees.filter(e => e.compliance.drugTestComplete).length,
      cdlExpirations: employees.filter(e => 
        e.compliance.cdlExpiration && 
        e.compliance.cdlExpiration < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ),
      dotPhysicalExpirations: employees.filter(e => 
        e.compliance.dotPhysicalExpiration && 
        e.compliance.dotPhysicalExpiration < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ),
      overallComplianceScore: this.calculateComplianceScore(employees),
    };

    return report;
  }

  // Benefits Administration
  async enrollInBenefits(employeeId: string, benefitSelections: any): Promise<void> {
    const employee = await this.getEmployee(employeeId);
    
    // Update employee benefits
    employee.compensation.benefits = {
      ...employee.compensation.benefits,
      ...benefitSelections,
    };

    // Calculate new deductions
    employee.compensation.deductions = await this.calculateBenefitDeductions(employee, benefitSelections);
    
    // Create benefit enrollment records
    await this.createBenefitEnrollment(employeeId, benefitSelections);
  }

  // Performance Management
  async schedulePerformanceReview(employeeId: string, reviewDate: Date): Promise<void> {
    const employee = await this.getEmployee(employeeId);
    employee.performance.nextReviewDate = reviewDate;
    
    // Create review workflow
    await this.createReviewWorkflow(employeeId, reviewDate);
  }

  async recordDisciplinaryAction(employeeId: string, action: any): Promise<void> {
    const employee = await this.getEmployee(employeeId);
    employee.performance.disciplinaryActions.push({
      date: new Date(),
      type: action.type,
      description: action.description,
      actionTaken: action.actionTaken,
    });
    
    // Generate compliance documentation
    await this.generateDisciplinaryDocuments(employeeId, action);
  }

  // Utility Methods
  private generateEmployeeId(): string {
    return `EMP${Date.now().toString().slice(-6)}`;
  }

  private async getActiveEmployees(companyId: string): Promise<Employee[]> {
    // Mock implementation - would query database
    return [];
  }

  private async getTimeEntries(employeeId: string, startDate: Date, endDate: Date): Promise<TimeEntry[]> {
    // Mock implementation
    return [];
  }

  private async getTimeEntry(timeEntryId: string): Promise<TimeEntry> {
    // Mock implementation
    return {} as TimeEntry;
  }

  private async getEmployee(employeeId: string): Promise<Employee> {
    // Mock implementation
    return {} as Employee;
  }

  private async generateTaxFilings(payrollRun: PayrollRun): Promise<TaxFiling[]> {
    // Generate required tax filings
    return [];
  }

  private async createBankTransfers(payrollRun: PayrollRun): Promise<BankTransfer[]> {
    // Create bank transfers for payroll
    return [];
  }

  private async getRequiredTraining(employeeId: string, trainingType: string): Promise<any[]> {
    return [];
  }

  private async createTrainingAssignment(employeeId: string, module: any): Promise<void> {
    // Create training assignment
  }

  private calculateComplianceScore(employees: Employee[]): number {
    if (employees.length === 0) return 100;
    
    const totalChecks = employees.length * 4; // 4 main compliance items
    const completedChecks = employees.reduce((sum, emp) => {
      let score = 0;
      if (emp.compliance.i9Verified) score++;
      if (emp.compliance.w4OnFile) score++;
      if (emp.compliance.backgroundCheckComplete) score++;
      if (emp.compliance.drugTestComplete) score++;
      return sum + score;
    }, 0);
    
    return Math.round((completedChecks / totalChecks) * 100);
  }

  private async calculateBenefitDeductions(employee: Employee, benefitSelections: any): Promise<any> {
    // Calculate benefit deductions based on selections
    return employee.compensation.deductions;
  }

  private async createBenefitEnrollment(employeeId: string, benefitSelections: any): Promise<void> {
    // Create benefit enrollment records
  }

  private async createReviewWorkflow(employeeId: string, reviewDate: Date): Promise<void> {
    // Create performance review workflow
  }

  private async generateDisciplinaryDocuments(employeeId: string, action: any): Promise<void> {
    // Generate required disciplinary documentation
  }
}

export const enterpriseHRService = new EnterpriseHRService();