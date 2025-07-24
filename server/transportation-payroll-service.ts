import { nanoid } from "nanoid";
import { storage } from "./storage-simple";

export interface EmployeePayroll {
  id: string;
  employeeId: string;
  companyId: string;
  payPeriodStart: Date;
  payPeriodEnd: Date;
  employeeType: 'driver' | 'office' | 'dispatcher' | 'mechanic' | 'manager';
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
  
  // Driver-specific pay
  totalMiles: number;
  mileageRate: number;
  mileagePay: number;
  
  // Additional compensation
  bonusPay: number;
  commissionPay: number;
  
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

export interface Employee {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  employeeType: 'driver' | 'office' | 'dispatcher' | 'mechanic' | 'manager';
  payType: 'hourly' | 'salary' | 'mileage' | 'commission';
  hourlyRate?: number;
  salaryAmount?: number;
  mileageRate?: number;
  commissionRate?: number;
  department: string;
  jobTitle: string;
  hireDate: Date;
  status: 'active' | 'inactive';
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
  miles?: number;
  loadId?: string;
  location?: string;
  notes?: string;
  employeeType: 'driver' | 'office' | 'dispatcher' | 'mechanic' | 'manager';
  status: 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export class TransportationPayrollService {
  private payrollRuns = new Map<string, PayrollRun[]>();
  private employeePayrolls = new Map<string, EmployeePayroll[]>();
  private timeEntries = new Map<string, TimeEntry[]>();
  private employees = new Map<string, Employee[]>();

  constructor() {
    this.initializeDemoData();
  }

  private initializeDemoData(): void {
    // Sample time entries for demo
    const sampleTimeEntries: TimeEntry[] = [
      {
        id: nanoid(),
        driverId: "driver-1",
        companyId: "demo-company",
        clockIn: new Date('2024-12-09T06:00:00'),
        clockOut: new Date('2024-12-09T16:00:00'),
        totalHours: 10,
        miles: 520,
        loadId: "load-1",
        location: "Houston, TX",
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: nanoid(),
        driverId: "driver-2", 
        companyId: "demo-company",
        clockIn: new Date('2024-12-09T05:30:00'),
        clockOut: new Date('2024-12-09T15:30:00'),
        totalHours: 10,
        miles: 480,
        loadId: "load-2",
        location: "Dallas, TX",
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.timeEntries.set("demo-company", sampleTimeEntries);
  }

  async calculateDriverPayroll(companyId: string, driverId: string, payPeriodStart: Date, payPeriodEnd: Date): Promise<DriverPayroll> {
    const driver = await storage.getDriver(companyId, driverId);
    if (!driver) {
      throw new Error("Driver not found");
    }

    // Get time entries for the pay period
    const companyTimeEntries = this.timeEntries.get(companyId) || [];
    const driverTimeEntries = companyTimeEntries.filter(entry => 
      entry.driverId === driverId &&
      entry.clockIn >= payPeriodStart &&
      entry.clockIn <= payPeriodEnd &&
      entry.status === 'completed'
    );

    // Calculate totals
    const totalMiles = driverTimeEntries.reduce((sum, entry) => sum + (entry.miles || 0), 0);
    const totalHours = driverTimeEntries.reduce((sum, entry) => sum + entry.totalHours, 0);

    // Transportation industry standard rates
    const mileageRate = 0.60; // $0.60 per mile
    const hourlyRate = 25.00; // $25/hour base rate
    
    // Calculate pay components
    const mileagePay = totalMiles * mileageRate;
    const hourlyPay = totalHours * hourlyRate;
    const bonusPay = totalMiles > 2000 ? 500 : 0; // Bonus for high mileage
    const grossPay = mileagePay + hourlyPay + bonusPay;

    // Calculate taxes (simplified)
    const federalTax = grossPay * 0.22;
    const stateTax = grossPay * 0.06;
    const socialSecurity = grossPay * 0.062;
    const medicare = grossPay * 0.0145;
    const totalDeductions = federalTax + stateTax + socialSecurity + medicare;
    const netPay = grossPay - totalDeductions;

    const driverPayroll: DriverPayroll = {
      id: nanoid(),
      driverId,
      companyId,
      payPeriodStart,
      payPeriodEnd,
      totalMiles,
      totalHours,
      mileageRate,
      hourlyRate,
      mileagePay,
      hourlyPay,
      bonusPay,
      grossPay,
      federalTax,
      stateTax,
      socialSecurity,
      medicare,
      totalDeductions,
      netPay,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store the payroll record
    const companyPayrolls = this.driverPayrolls.get(companyId) || [];
    companyPayrolls.push(driverPayroll);
    this.driverPayrolls.set(companyId, companyPayrolls);

    return driverPayroll;
  }

  async processPayrollRun(companyId: string, payPeriodStart: Date, payPeriodEnd: Date, payDate: Date): Promise<PayrollRun> {
    const drivers = await storage.getDrivers(companyId);
    const driverPayrolls: DriverPayroll[] = [];

    // Calculate payroll for each driver
    for (const driver of drivers) {
      try {
        const payroll = await this.calculateDriverPayroll(companyId, driver.id, payPeriodStart, payPeriodEnd);
        driverPayrolls.push(payroll);
      } catch (error) {
        console.error(`Error calculating payroll for driver ${driver.id}:`, error);
      }
    }

    // Calculate totals
    const totalEmployees = driverPayrolls.length;
    const totalGrossPay = driverPayrolls.reduce((sum, payroll) => sum + payroll.grossPay, 0);
    const totalNetPay = driverPayrolls.reduce((sum, payroll) => sum + payroll.netPay, 0);
    const totalTaxes = driverPayrolls.reduce((sum, payroll) => sum + payroll.totalDeductions, 0);

    const payrollRun: PayrollRun = {
      id: nanoid(),
      companyId,
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

  async clockIn(driverId: string, companyId: string, location?: string): Promise<TimeEntry> {
    const driver = await storage.getDriver(companyId, driverId);
    if (!driver) {
      throw new Error("Driver not found");
    }

    // Check if driver is already clocked in
    const companyTimeEntries = this.timeEntries.get(companyId) || [];
    const activeEntry = companyTimeEntries.find(entry => 
      entry.driverId === driverId && entry.status === 'active'
    );

    if (activeEntry) {
      throw new Error("Driver is already clocked in");
    }

    const timeEntry: TimeEntry = {
      id: nanoid(),
      driverId,
      companyId,
      clockIn: new Date(),
      totalHours: 0,
      location,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    companyTimeEntries.push(timeEntry);
    this.timeEntries.set(companyId, companyTimeEntries);

    return timeEntry;
  }

  async clockOut(driverId: string, companyId: string, miles?: number, loadId?: string): Promise<TimeEntry> {
    const companyTimeEntries = this.timeEntries.get(companyId) || [];
    const activeEntryIndex = companyTimeEntries.findIndex(entry => 
      entry.driverId === driverId && entry.status === 'active'
    );

    if (activeEntryIndex === -1) {
      throw new Error("No active clock-in found for driver");
    }

    const activeEntry = companyTimeEntries[activeEntryIndex];
    const clockOut = new Date();
    const totalHours = (clockOut.getTime() - activeEntry.clockIn.getTime()) / (1000 * 60 * 60);

    const updatedEntry: TimeEntry = {
      ...activeEntry,
      clockOut,
      totalHours: Math.round(totalHours * 100) / 100, // Round to 2 decimal places
      miles,
      loadId,
      status: 'completed',
      updatedAt: new Date()
    };

    companyTimeEntries[activeEntryIndex] = updatedEntry;
    this.timeEntries.set(companyId, companyTimeEntries);

    return updatedEntry;
  }

  async getPayrollRuns(companyId: string): Promise<PayrollRun[]> {
    return this.payrollRuns.get(companyId) || [];
  }

  async getDriverPayrolls(companyId: string, driverId?: string): Promise<DriverPayroll[]> {
    const companyPayrolls = this.driverPayrolls.get(companyId) || [];
    
    if (driverId) {
      return companyPayrolls.filter(payroll => payroll.driverId === driverId);
    }
    
    return companyPayrolls;
  }

  async getTimeEntries(companyId: string, driverId?: string): Promise<TimeEntry[]> {
    const companyTimeEntries = this.timeEntries.get(companyId) || [];
    
    if (driverId) {
      return companyTimeEntries.filter(entry => entry.driverId === driverId);
    }
    
    return companyTimeEntries;
  }

  async approvePayroll(companyId: string, payrollId: string): Promise<DriverPayroll> {
    const companyPayrolls = this.driverPayrolls.get(companyId) || [];
    const payrollIndex = companyPayrolls.findIndex(p => p.id === payrollId);
    
    if (payrollIndex === -1) {
      throw new Error("Payroll record not found");
    }

    companyPayrolls[payrollIndex].status = 'approved';
    companyPayrolls[payrollIndex].updatedAt = new Date();
    
    this.driverPayrolls.set(companyId, companyPayrolls);
    return companyPayrolls[payrollIndex];
  }

  async generatePayStub(companyId: string, payrollId: string): Promise<any> {
    const companyPayrolls = this.driverPayrolls.get(companyId) || [];
    const payroll = companyPayrolls.find(p => p.id === payrollId);
    
    if (!payroll) {
      throw new Error("Payroll record not found");
    }

    const driver = await storage.getDriver(companyId, payroll.driverId);
    const company = await storage.getCompany(companyId);

    return {
      payrollId: payroll.id,
      company: {
        name: company?.name || "Unknown Company",
        address: company?.address || ""
      },
      employee: {
        name: driver?.name || "Unknown Driver",
        id: driver?.id
      },
      payPeriod: {
        start: payroll.payPeriodStart,
        end: payroll.payPeriodEnd
      },
      earnings: {
        mileage: {
          miles: payroll.totalMiles,
          rate: payroll.mileageRate,
          amount: payroll.mileagePay
        },
        hourly: {
          hours: payroll.totalHours,
          rate: payroll.hourlyRate,
          amount: payroll.hourlyPay
        },
        bonus: payroll.bonusPay,
        gross: payroll.grossPay
      },
      deductions: {
        federalTax: payroll.federalTax,
        stateTax: payroll.stateTax,
        socialSecurity: payroll.socialSecurity,
        medicare: payroll.medicare,
        total: payroll.totalDeductions
      },
      netPay: payroll.netPay
    };
  }
}

export const transportationPayrollService = new TransportationPayrollService();