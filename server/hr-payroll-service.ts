import { db } from "./db";
import { drivers } from "@shared/schema";
import { eq } from "drizzle-orm";

export class HRPayrollService {
  async createEmployee(companyId: string, employeeData: any) {
    try {
      const [newDriver] = await db.insert(drivers).values({
        companyId,
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        email: employeeData.email,
        phone: employeeData.phone || '',
        licenseNumber: employeeData.licenseNumber || '',
        licenseClass: employeeData.licenseClass || 'CDL-A',
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      return {
        id: newDriver.id,
        firstName: newDriver.firstName,
        lastName: newDriver.lastName,
        email: newDriver.email,
        position: 'Driver',
        department: 'Operations',
        status: 'active'
      };
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  async getEmployee(employeeId: string) {
    try {
      const employee = await db.select().from(drivers).where(eq(drivers.id, employeeId)).limit(1);
      if (employee.length === 0) return null;
      
      const driver = employee[0];
      return {
        id: driver.id,
        firstName: driver.firstName,
        lastName: driver.lastName,
        email: driver.email,
        position: 'Driver',
        department: 'Operations',
        status: driver.status === 'available' ? 'active' : 'inactive'
      };
    } catch (error) {
      console.error('Error fetching employee:', error);
      return null;
    }
  }

  async updateEmployee(employeeId: string, employeeData: any) {
    try {
      const [updatedDriver] = await db.update(drivers)
        .set({
          firstName: employeeData.firstName,
          lastName: employeeData.lastName,
          email: employeeData.email,
          phone: employeeData.phone,
          updatedAt: new Date()
        })
        .where(eq(drivers.id, employeeId))
        .returning();
      
      return {
        id: updatedDriver.id,
        firstName: updatedDriver.firstName,
        lastName: updatedDriver.lastName,
        email: updatedDriver.email,
        position: 'Driver',
        department: 'Operations'
      };
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }

  async getEmployeeBenefits(employeeId: string) {
    try {
      return {
        healthInsurance: { enrolled: true, plan: 'Premium Health', cost: 250 },
        dental: { enrolled: true, plan: 'Basic Dental', cost: 30 },
        vision: { enrolled: false, plan: 'None', cost: 0 },
        retirement401k: { enrolled: true, contribution: 5, match: 4 }
      };
    } catch (error) {
      console.error('Error fetching employee benefits:', error);
      return {};
    }
  }

  async updateEmployeeBenefits(employeeId: string, benefitsData: any) {
    try {
      // In a real implementation, this would update benefits in database
      return benefitsData;
    } catch (error) {
      console.error('Error updating employee benefits:', error);
      throw error;
    }
  }

  async clockIn(employeeId: string, companyId: string, location?: string, ipAddress?: string) {
    try {
      const timeEntry = {
        id: `te_${Date.now()}`,
        employeeId,
        clockIn: new Date().toISOString(),
        location: location || 'Office',
        ipAddress: ipAddress || '127.0.0.1'
      };
      
      return timeEntry;
    } catch (error) {
      console.error('Error clocking in employee:', error);
      throw error;
    }
  }

  async clockOut(employeeId: string) {
    try {
      const timeEntry = {
        id: `te_${Date.now()}`,
        employeeId,
        clockOut: new Date().toISOString(),
        totalHours: 8.5
      };
      
      return timeEntry;
    } catch (error) {
      console.error('Error clocking out employee:', error);
      throw error;
    }
  }

  async submitLeaveRequest(employeeId: string, companyId: string, leaveType: string, startDate: string, endDate: string, totalDays: number, totalHours: number, reason: string) {
    try {
      const leaveRequest = {
        id: `lr_${Date.now()}`,
        employeeId,
        companyId,
        leaveType,
        startDate,
        endDate,
        totalDays,
        totalHours,
        reason,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };
      
      return leaveRequest;
    } catch (error) {
      console.error('Error submitting leave request:', error);
      throw error;
    }
  }

  async approveLeaveRequest(requestId: string, approverId: string, approvalNotes?: string) {
    try {
      const leaveRequest = {
        id: requestId,
        status: 'approved',
        approverId,
        approvalNotes: approvalNotes || '',
        approvedAt: new Date().toISOString()
      };
      
      return leaveRequest;
    } catch (error) {
      console.error('Error approving leave request:', error);
      throw error;
    }
  }

  async uploadEmployeeDocument(employeeId: string, companyId: string, documentName: string, documentType: string, fileName: string, fileUrl: string, uploadedBy: string, isRequired?: boolean, expirationDate?: string) {
    try {
      const document = {
        id: `doc_${Date.now()}`,
        employeeId,
        companyId,
        documentName,
        documentType,
        fileName,
        fileUrl,
        uploadedBy,
        isRequired: isRequired || false,
        expirationDate: expirationDate || null,
        uploadedAt: new Date().toISOString()
      };
      
      return document;
    } catch (error) {
      console.error('Error uploading employee document:', error);
      throw error;
    }
  }

  async getEmployeeDocuments(employeeId: string) {
    try {
      return [
        {
          id: 'doc_1',
          documentName: 'Driver License',
          documentType: 'License',
          fileName: 'driver_license.pdf',
          uploadedAt: new Date().toISOString(),
          expirationDate: '2025-12-31'
        }
      ];
    } catch (error) {
      console.error('Error fetching employee documents:', error);
      return [];
    }
  }

  async createPayrollRun(companyId: string, payPeriodStart: string, payPeriodEnd: string, checkDate: string, createdBy: string) {
    try {
      const payrollRun = {
        id: `pr_${Date.now()}`,
        companyId,
        payPeriodStart,
        payPeriodEnd,
        checkDate,
        createdBy,
        status: 'draft',
        createdAt: new Date().toISOString()
      };
      
      return payrollRun;
    } catch (error) {
      console.error('Error creating payroll run:', error);
      throw error;
    }
  }

  async getPayrollDashboard(companyId: string) {
    try {
      return {
        currentPeriod: 'June 1-15, 2024',
        status: 'Processing',
        dueDate: '2024-06-20',
        employeesProcessed: 25,
        totalGross: 87500,
        totalNet: 71750,
        totalTaxes: 15750,
        recentRuns: [
          {
            id: 'pr_1',
            payPeriod: 'May 16-31, 2024',
            payDate: '2024-06-05',
            status: 'completed',
            employeeCount: 24,
            totalGross: 84000
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching payroll dashboard:', error);
      return {};
    }
  }

  async generateW2(employeeId: string, taxYear: number) {
    try {
      const w2Form = {
        employeeId,
        taxYear,
        wages: 65000,
        federalTaxWithheld: 8500,
        socialSecurityWages: 65000,
        socialSecurityTaxWithheld: 4030,
        medicareWages: 65000,
        medicareTaxWithheld: 942.50,
        generatedAt: new Date().toISOString()
      };
      
      return w2Form;
    } catch (error) {
      console.error('Error generating W2:', error);
      throw error;
    }
  }

  async generate1099(contractorId: string, taxYear: number) {
    try {
      const form1099 = {
        contractorId,
        taxYear,
        nonEmployeeCompensation: 45000,
        federalTaxWithheld: 0,
        generatedAt: new Date().toISOString()
      };
      
      return form1099;
    } catch (error) {
      console.error('Error generating 1099:', error);
      throw error;
    }
  }
}

export const hrPayrollService = new HRPayrollService();