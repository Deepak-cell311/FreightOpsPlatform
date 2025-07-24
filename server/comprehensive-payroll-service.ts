import { nanoid } from "nanoid";
import { storage } from "./storage-simple";

// Universal Employee Interface
export interface UniversalEmployee {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  employeeType: 'driver' | 'office' | 'dispatcher' | 'mechanic' | 'manager' | 'developer' | 'support' | 'sales' | 'admin';
  payType: 'hourly' | 'salary' | 'mileage' | 'commission';
  hourlyRate?: number;
  salaryAmount?: number;
  mileageRate?: number;
  commissionRate?: number;
  department: string;
  jobTitle: string;
  hireDate: Date;
  status: 'active' | 'inactive';
  
  // Benefits
  healthInsurance: boolean;
  healthInsuranceDeduction: number;
  retirement401k: number; // percentage
  retirement401kAmount: number;
  
  // Tax info
  taxWithholdings: {
    federalExemptions: number;
    stateExemptions: number;
    additionalFederal: number;
    additionalState: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// Universal Payroll Record
export interface UniversalPayroll {
  id: string;
  employeeId: string;
  companyId: string;
  payPeriodStart: Date;
  payPeriodEnd: Date;
  employeeType: 'driver' | 'office' | 'dispatcher' | 'mechanic' | 'manager' | 'developer' | 'support' | 'sales' | 'admin';
  payType: 'hourly' | 'salary' | 'mileage' | 'commission';
  
  // Time-based pay
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  hourlyRate: number;
  regularPay: number;
  overtimePay: number;
  
  // Salary pay
  salaryAmount: number;
  salaryPay: number;
  
  // Transportation-specific pay
  totalMiles: number;
  mileageRate: number;
  mileagePay: number;
  
  // Sales/commission pay
  salesAmount: number;
  commissionRate: number;
  commissionPay: number;
  
  // Additional compensation
  bonusPay: number;
  
  // Total compensation
  grossPay: number;
  
  // Deductions
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  healthInsurance: number;
  retirement401k: number;
  totalDeductions: number;
  netPay: number;
  
  status: 'draft' | 'approved' | 'paid';
  createdAt: Date;
  updatedAt: Date;
}

export interface PayrollRun {
  id: string;
  companyId: string;
  companyType: 'hq' | 'tenant';
  payPeriodStart: Date;
  payPeriodEnd: Date;
  payDate: Date;
  totalEmployees: number;
  totalGrossPay: number;
  totalNetPay: number;
  totalTaxes: number;
  status: 'processing' | 'approved' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  companyId: string;
  clockIn: Date;
  clockOut?: Date;
  totalHours: number;
  miles?: number; // for drivers
  loadId?: string; // for drivers
  projectId?: string; // for office workers
  taskDescription?: string; // for office workers
  location?: string;
  notes?: string;
  employeeType: 'driver' | 'office' | 'dispatcher' | 'mechanic' | 'manager' | 'developer' | 'support' | 'sales' | 'admin';
  status: 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export class ComprehensivePayrollService {
  private payrollRuns = new Map<string, PayrollRun[]>();
  private employeePayrolls = new Map<string, UniversalPayroll[]>();
  private timeEntries = new Map<string, TimeEntry[]>();
  private employees = new Map<string, UniversalEmployee[]>();

  constructor() {
    this.initializeData();
  }

  private initializeData(): void {
    // Initialize HQ employees (platform staff)
    const hqEmployees: UniversalEmployee[] = [
      {
        id: nanoid(),
        companyId: "hq-admin",
        name: "John Developer",
        email: "john@freightopspro.com",
        phone: "(555) 100-0001",
        employeeType: 'developer',
        payType: 'salary',
        salaryAmount: 95000,
        department: "Engineering",
        jobTitle: "Senior Full Stack Developer",
        hireDate: new Date('2023-01-15'),
        status: 'active',
        healthInsurance: true,
        healthInsuranceDeduction: 250,
        retirement401k: 6,
        retirement401kAmount: 0,
        taxWithholdings: {
          federalExemptions: 2,
          stateExemptions: 2,
          additionalFederal: 0,
          additionalState: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: nanoid(),
        companyId: "hq-admin",
        name: "Sarah Support",
        email: "sarah@freightopspro.com",
        phone: "(555) 100-0002",
        employeeType: 'support',
        payType: 'hourly',
        hourlyRate: 28,
        department: "Customer Success",
        jobTitle: "Customer Support Specialist",
        hireDate: new Date('2023-03-20'),
        status: 'active',
        healthInsurance: true,
        healthInsuranceDeduction: 180,
        retirement401k: 4,
        retirement401kAmount: 0,
        taxWithholdings: {
          federalExemptions: 1,
          stateExemptions: 1,
          additionalFederal: 0,
          additionalState: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: nanoid(),
        companyId: "hq-admin",
        name: "Mike Sales",
        email: "mike@freightopspro.com",
        phone: "(555) 100-0003",
        employeeType: 'sales',
        payType: 'commission',
        hourlyRate: 20, // base pay
        commissionRate: 0.08, // 8% commission
        department: "Sales",
        jobTitle: "Enterprise Sales Manager",
        hireDate: new Date('2023-05-10'),
        status: 'active',
        healthInsurance: true,
        healthInsuranceDeduction: 220,
        retirement401k: 5,
        retirement401kAmount: 0,
        taxWithholdings: {
          federalExemptions: 2,
          stateExemptions: 2,
          additionalFederal: 100,
          additionalState: 50
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Initialize FreightOps employees (transportation-specific)
    const freightOpsEmployees: UniversalEmployee[] = [
      {
        id: nanoid(),
        companyId: "8AlKIByX8Am2H0TnUlU-Q", // FreightOps company ID
        name: "Mike Rodriguez",
        email: "mike.rodriguez@freightops.com",
        phone: "(713) 555-0123",
        employeeType: 'driver',
        payType: 'mileage',
        mileageRate: 0.65,
        hourlyRate: 25, // backup hourly rate
        department: "Operations",
        jobTitle: "Commercial Driver",
        hireDate: new Date('2023-06-01'),
        status: 'active',
        healthInsurance: true,
        healthInsuranceDeduction: 280,
        retirement401k: 3,
        retirement401kAmount: 0,
        taxWithholdings: {
          federalExemptions: 3,
          stateExemptions: 3,
          additionalFederal: 0,
          additionalState: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: nanoid(),
        companyId: "8AlKIByX8Am2H0TnUlU-Q",
        name: "Sarah Johnson",
        email: "sarah.johnson@freightops.com",
        phone: "(713) 555-0124",
        employeeType: 'driver',
        payType: 'mileage',
        mileageRate: 0.63,
        hourlyRate: 24,
        department: "Operations",
        jobTitle: "Commercial Driver",
        hireDate: new Date('2023-08-15'),
        status: 'active',
        healthInsurance: true,
        healthInsuranceDeduction: 280,
        retirement401k: 4,
        retirement401kAmount: 0,
        taxWithholdings: {
          federalExemptions: 1,
          stateExemptions: 1,
          additionalFederal: 0,
          additionalState: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: nanoid(),
        companyId: "8AlKIByX8Am2H0TnUlU-Q",
        name: "Lisa Dispatcher",
        email: "lisa@freightops.com",
        phone: "(713) 555-0125",
        employeeType: 'dispatcher',
        payType: 'salary',
        salaryAmount: 52000,
        department: "Operations",
        jobTitle: "Load Dispatcher",
        hireDate: new Date('2023-04-10'),
        status: 'active',
        healthInsurance: true,
        healthInsuranceDeduction: 240,
        retirement401k: 5,
        retirement401kAmount: 0,
        taxWithholdings: {
          federalExemptions: 2,
          stateExemptions: 2,
          additionalFederal: 0,
          additionalState: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.employees.set("hq-admin", hqEmployees);
    this.employees.set("8AlKIByX8Am2H0TnUlU-Q", freightOpsEmployees);

    // Initialize sample time entries
    this.initializeTimeEntries();
  }

  private initializeTimeEntries(): void {
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    
    // HQ time entries
    const hqTimeEntries: TimeEntry[] = [
      {
        id: nanoid(),
        employeeId: this.employees.get("hq-admin")?.[0]?.id || "dev-1",
        companyId: "hq-admin",
        clockIn: new Date(weekStart.getTime() + (1 * 24 * 60 * 60 * 1000) + (9 * 60 * 60 * 1000)),
        clockOut: new Date(weekStart.getTime() + (1 * 24 * 60 * 60 * 1000) + (17 * 60 * 60 * 1000)),
        totalHours: 8,
        projectId: "platform-v2",
        taskDescription: "API development",
        employeeType: 'developer',
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.timeEntries.set("hq-admin", hqTimeEntries);
  }

  async calculateEmployeePayroll(companyId: string, employeeId: string, payPeriodStart: Date, payPeriodEnd: Date): Promise<UniversalPayroll> {
    const companyEmployees = this.employees.get(companyId) || [];
    const employee = companyEmployees.find(emp => emp.id === employeeId);
    
    if (!employee) {
      throw new Error("Employee not found");
    }

    // Get time entries for the pay period
    const companyTimeEntries = this.timeEntries.get(companyId) || [];
    const employeeTimeEntries = companyTimeEntries.filter(entry => 
      entry.employeeId === employeeId &&
      entry.clockIn >= payPeriodStart &&
      entry.clockIn <= payPeriodEnd &&
      entry.status === 'completed'
    );

    // Calculate time-based totals
    const totalHours = employeeTimeEntries.reduce((sum, entry) => sum + entry.totalHours, 0);
    const regularHours = Math.min(totalHours, 40);
    const overtimeHours = Math.max(totalHours - 40, 0);

    let payroll: UniversalPayroll = {
      id: nanoid(),
      employeeId,
      companyId,
      payPeriodStart,
      payPeriodEnd,
      employeeType: employee.employeeType,
      payType: employee.payType,
      totalHours,
      regularHours,
      overtimeHours,
      hourlyRate: employee.hourlyRate || 0,
      regularPay: 0,
      overtimePay: 0,
      salaryAmount: employee.salaryAmount || 0,
      salaryPay: 0,
      totalMiles: 0,
      mileageRate: employee.mileageRate || 0,
      mileagePay: 0,
      salesAmount: 0,
      commissionRate: employee.commissionRate || 0,
      commissionPay: 0,
      bonusPay: 0,
      grossPay: 0,
      federalTax: 0,
      stateTax: 0,
      socialSecurity: 0,
      medicare: 0,
      healthInsurance: employee.healthInsuranceDeduction,
      retirement401k: 0,
      totalDeductions: 0,
      netPay: 0,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Calculate pay based on type
    switch (employee.payType) {
      case 'hourly':
        payroll.regularPay = regularHours * (employee.hourlyRate || 0);
        payroll.overtimePay = overtimeHours * (employee.hourlyRate || 0) * 1.5;
        break;
        
      case 'salary':
        // Bi-weekly salary calculation (26 pay periods per year)
        payroll.salaryPay = (employee.salaryAmount || 0) / 26;
        break;
        
      case 'mileage':
        // For drivers - calculate miles from time entries
        const totalMiles = employeeTimeEntries.reduce((sum, entry) => sum + (entry.miles || 0), 0);
        payroll.totalMiles = totalMiles;
        payroll.mileagePay = totalMiles * (employee.mileageRate || 0);
        // Also pay hourly for non-driving time
        payroll.regularPay = regularHours * (employee.hourlyRate || 0);
        payroll.overtimePay = overtimeHours * (employee.hourlyRate || 0) * 1.5;
        break;
        
      case 'commission':
        // Base hourly pay plus commission
        payroll.regularPay = regularHours * (employee.hourlyRate || 0);
        payroll.overtimePay = overtimeHours * (employee.hourlyRate || 0) * 1.5;
        // Commission calculation would need sales data - simplified for demo
        payroll.salesAmount = 50000; // Demo sales amount
        payroll.commissionPay = payroll.salesAmount * (employee.commissionRate || 0);
        break;
    }

    // Calculate gross pay
    payroll.grossPay = payroll.regularPay + payroll.overtimePay + payroll.salaryPay + 
                      payroll.mileagePay + payroll.commissionPay + payroll.bonusPay;

    // Calculate taxes and deductions
    payroll.federalTax = payroll.grossPay * 0.22; // Simplified federal tax
    payroll.stateTax = payroll.grossPay * 0.06; // Simplified state tax
    payroll.socialSecurity = payroll.grossPay * 0.062;
    payroll.medicare = payroll.grossPay * 0.0145;
    payroll.retirement401k = payroll.grossPay * (employee.retirement401k / 100);
    
    payroll.totalDeductions = payroll.federalTax + payroll.stateTax + payroll.socialSecurity + 
                              payroll.medicare + payroll.healthInsurance + payroll.retirement401k;
    
    payroll.netPay = payroll.grossPay - payroll.totalDeductions;

    // Store the payroll record
    const companyPayrolls = this.employeePayrolls.get(companyId) || [];
    companyPayrolls.push(payroll);
    this.employeePayrolls.set(companyId, companyPayrolls);

    return payroll;
  }

  async processPayrollRun(companyId: string, payPeriodStart: Date, payPeriodEnd: Date, payDate: Date): Promise<PayrollRun> {
    const companyEmployees = this.employees.get(companyId) || [];
    const employeePayrolls: UniversalPayroll[] = [];

    // Calculate payroll for each employee
    for (const employee of companyEmployees.filter(emp => emp.status === 'active')) {
      try {
        const payroll = await this.calculateEmployeePayroll(companyId, employee.id, payPeriodStart, payPeriodEnd);
        employeePayrolls.push(payroll);
      } catch (error) {
        console.error(`Error calculating payroll for employee ${employee.id}:`, error);
      }
    }

    // Calculate totals
    const totalEmployees = employeePayrolls.length;
    const totalGrossPay = employeePayrolls.reduce((sum, payroll) => sum + payroll.grossPay, 0);
    const totalNetPay = employeePayrolls.reduce((sum, payroll) => sum + payroll.netPay, 0);
    const totalTaxes = employeePayrolls.reduce((sum, payroll) => sum + payroll.totalDeductions, 0);

    const payrollRun: PayrollRun = {
      id: nanoid(),
      companyId,
      companyType: companyId === "hq-admin" ? 'hq' : 'tenant',
      payPeriodStart,
      payPeriodEnd,
      payDate,
      totalEmployees,
      totalGrossPay,
      totalNetPay,
      totalTaxes,
      status: 'processing',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store the payroll run
    const companyRuns = this.payrollRuns.get(companyId) || [];
    companyRuns.push(payrollRun);
    this.payrollRuns.set(companyId, companyRuns);

    return payrollRun;
  }

  async getEmployees(companyId: string): Promise<UniversalEmployee[]> {
    console.log(`Getting employees for company: ${companyId}`);
    console.log(`Available companies:`, Array.from(this.employees.keys()));
    
    // If this is a FreightOps company that doesn't have employees set up yet, create them
    if (!this.employees.has(companyId) && companyId !== "hq-admin") {
      console.log(`Initializing FreightOps employees for new company: ${companyId}`);
      this.initializeFreightOpsEmployees(companyId);
      console.log(`Created employees for ${companyId}:`, this.employees.get(companyId)?.length);
    }
    
    const employees = this.employees.get(companyId) || [];
    console.log(`Found ${employees.length} employees for ${companyId}`);
    return employees;
  }

  private initializeFreightOpsEmployees(companyId: string): void {
    const freightOpsEmployees: UniversalEmployee[] = [
      {
        id: nanoid(),
        companyId,
        name: "Mike Rodriguez",
        email: "mike.rodriguez@freightops.com",
        phone: "(713) 555-0123",
        employeeType: 'driver',
        payType: 'mileage',
        mileageRate: 0.65,
        hourlyRate: 25,
        department: "Operations",
        jobTitle: "Commercial Driver",
        hireDate: new Date('2023-06-01'),
        status: 'active',
        healthInsurance: true,
        healthInsuranceDeduction: 280,
        retirement401k: 3,
        retirement401kAmount: 0,
        taxWithholdings: {
          federalExemptions: 3,
          stateExemptions: 3,
          additionalFederal: 0,
          additionalState: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: nanoid(),
        companyId,
        name: "Sarah Johnson",
        email: "sarah.johnson@freightops.com",
        phone: "(713) 555-0124",
        employeeType: 'driver',
        payType: 'mileage',
        mileageRate: 0.63,
        hourlyRate: 24,
        department: "Operations",
        jobTitle: "Commercial Driver",
        hireDate: new Date('2023-08-15'),
        status: 'active',
        healthInsurance: true,
        healthInsuranceDeduction: 280,
        retirement401k: 4,
        retirement401kAmount: 0,
        taxWithholdings: {
          federalExemptions: 1,
          stateExemptions: 1,
          additionalFederal: 0,
          additionalState: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: nanoid(),
        companyId,
        name: "Lisa Dispatcher",
        email: "lisa@freightops.com",
        phone: "(713) 555-0125",
        employeeType: 'dispatcher',
        payType: 'salary',
        salaryAmount: 52000,
        department: "Operations",
        jobTitle: "Load Dispatcher",
        hireDate: new Date('2023-04-10'),
        status: 'active',
        healthInsurance: true,
        healthInsuranceDeduction: 240,
        retirement401k: 5,
        retirement401kAmount: 0,
        taxWithholdings: {
          federalExemptions: 2,
          stateExemptions: 2,
          additionalFederal: 0,
          additionalState: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.employees.set(companyId, freightOpsEmployees);
  }

  async getPayrollRuns(companyId: string): Promise<PayrollRun[]> {
    return this.payrollRuns.get(companyId) || [];
  }

  async getEmployeePayrolls(companyId: string, employeeId?: string): Promise<UniversalPayroll[]> {
    const companyPayrolls = this.employeePayrolls.get(companyId) || [];
    
    if (employeeId) {
      return companyPayrolls.filter(payroll => payroll.employeeId === employeeId);
    }
    
    return companyPayrolls;
  }

  async clockIn(employeeId: string, companyId: string, location?: string, projectId?: string): Promise<TimeEntry> {
    const companyEmployees = this.employees.get(companyId) || [];
    const employee = companyEmployees.find(emp => emp.id === employeeId);
    
    if (!employee) {
      throw new Error("Employee not found");
    }

    // Check if employee is already clocked in
    const companyTimeEntries = this.timeEntries.get(companyId) || [];
    const activeEntry = companyTimeEntries.find(entry => 
      entry.employeeId === employeeId && entry.status === 'active'
    );

    if (activeEntry) {
      throw new Error("Employee is already clocked in");
    }

    const timeEntry: TimeEntry = {
      id: nanoid(),
      employeeId,
      companyId,
      clockIn: new Date(),
      totalHours: 0,
      location,
      projectId,
      employeeType: employee.employeeType,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    companyTimeEntries.push(timeEntry);
    this.timeEntries.set(companyId, companyTimeEntries);

    return timeEntry;
  }

  async clockOut(employeeId: string, companyId: string, miles?: number, loadId?: string, taskDescription?: string): Promise<TimeEntry> {
    const companyTimeEntries = this.timeEntries.get(companyId) || [];
    const activeEntryIndex = companyTimeEntries.findIndex(entry => 
      entry.employeeId === employeeId && entry.status === 'active'
    );

    if (activeEntryIndex === -1) {
      throw new Error("No active clock-in found for employee");
    }

    const activeEntry = companyTimeEntries[activeEntryIndex];
    const clockOut = new Date();
    const totalHours = (clockOut.getTime() - activeEntry.clockIn.getTime()) / (1000 * 60 * 60);

    const updatedEntry: TimeEntry = {
      ...activeEntry,
      clockOut,
      totalHours: Math.round(totalHours * 100) / 100,
      miles,
      loadId,
      taskDescription,
      status: 'completed',
      updatedAt: new Date()
    };

    companyTimeEntries[activeEntryIndex] = updatedEntry;
    this.timeEntries.set(companyId, companyTimeEntries);

    return updatedEntry;
  }

  async generatePayStub(companyId: string, payrollId: string): Promise<any> {
    const companyPayrolls = this.employeePayrolls.get(companyId) || [];
    const payroll = companyPayrolls.find(p => p.id === payrollId);
    
    if (!payroll) {
      throw new Error("Payroll record not found");
    }

    const companyEmployees = this.employees.get(companyId) || [];
    const employee = companyEmployees.find(emp => emp.id === payroll.employeeId);

    return {
      payrollId: payroll.id,
      company: {
        name: companyId === "hq-admin" ? "FreightOps Pro HQ" : "FreightOps",
        address: companyId === "hq-admin" ? "123 Tech Drive, Austin, TX 78701" : "456 Freight Ave, Houston, TX 77001"
      },
      employee: {
        name: employee?.name || "Unknown Employee",
        id: employee?.id,
        jobTitle: employee?.jobTitle,
        department: employee?.department
      },
      payPeriod: {
        start: payroll.payPeriodStart,
        end: payroll.payPeriodEnd
      },
      earnings: {
        regular: {
          hours: payroll.regularHours,
          rate: payroll.hourlyRate,
          amount: payroll.regularPay
        },
        overtime: {
          hours: payroll.overtimeHours,
          rate: payroll.hourlyRate * 1.5,
          amount: payroll.overtimePay
        },
        salary: payroll.salaryPay,
        mileage: {
          miles: payroll.totalMiles,
          rate: payroll.mileageRate,
          amount: payroll.mileagePay
        },
        commission: {
          sales: payroll.salesAmount,
          rate: payroll.commissionRate,
          amount: payroll.commissionPay
        },
        bonus: payroll.bonusPay,
        gross: payroll.grossPay
      },
      deductions: {
        federalTax: payroll.federalTax,
        stateTax: payroll.stateTax,
        socialSecurity: payroll.socialSecurity,
        medicare: payroll.medicare,
        healthInsurance: payroll.healthInsurance,
        retirement401k: payroll.retirement401k,
        total: payroll.totalDeductions
      },
      netPay: payroll.netPay
    };
  }
}

export const comprehensivePayrollService = new ComprehensivePayrollService();