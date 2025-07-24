import { db } from "./db";
import { 
  companyBenefitsConfig,
  benefitsEnrollmentEvents,
  employeeBenefits,
  employees,
  type CompanyBenefitsConfig,
  type InsertCompanyBenefitsConfig,
  type BenefitsEnrollmentEvent,
  type InsertBenefitsEnrollmentEvent
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import axios from "axios";

// Gusto API Types - Based on Gusto's actual API structure
export interface GustoBenefitsQuoteRequest {
  companyId: string;
  effectiveDate: string;
  zipCode: string;
  employeeCount: number;
  benefitTypes: ('medical' | 'dental' | 'vision' | 'retirement')[];
}

export interface GustoBenefitPlan {
  id: string;
  type: string;
  name: string;
  carrier: {
    name: string;
    logo_url: string;
  };
  premium: {
    employee: number;
    employee_spouse: number;
    employee_children: number;
    employee_family: number;
  };
  deductible: {
    individual: number;
    family: number;
  };
  out_of_pocket_max: {
    individual: number;
    family: number;
  };
  network_type: string;
  plan_type: string;
  features: string[];
}

export interface GustoCompanyBenefits {
  id: string;
  company_id: string;
  plans: GustoBenefitPlan[];
  enrollment_deadline: string;
  effective_date: string;
  contribution_strategy: {
    medical: {
      employer_contribution_percent: number;
      cap_amount?: number;
    };
    dental: {
      employer_contribution_percent: number;
    };
    vision: {
      employer_contribution_percent: number;
    };
  };
}

export interface GustoEmployeeBenefitEnrollment {
  employee_id: string;
  plan_id: string;
  coverage_tier: 'employee_only' | 'employee_spouse' | 'employee_children' | 'employee_family';
  dependents?: Array<{
    first_name: string;
    last_name: string;
    relationship: string;
    date_of_birth: string;
  }>;
}

export class GustoBenefitsService {
  private readonly gustoApiBase = 'https://api.gusto.com/v1';
  private readonly gustoHeaders = {
    'Authorization': `Bearer ${process.env.GUSTO_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  };
  
  // Step 1: Get benefits quotes from Gusto API
  async getBenefitsQuote(request: GustoBenefitsQuoteRequest): Promise<GustoBenefitPlan[]> {
    try {
      const response = await axios.get(`${this.gustoApiBase}/companies/${request.companyId}/benefits/plans`, {
        headers: this.gustoHeaders,
        params: {
          effective_date: request.effectiveDate,
          zip_code: request.zipCode,
          employee_count: request.employeeCount,
          benefit_types: request.benefitTypes.join(',')
        }
      });
      
      return response.data.plans || [];
    } catch (error) {
      console.error('Error fetching Gusto benefits quote:', error);
      throw new Error('Unable to fetch benefits quote from Gusto');
    }
  }
  
  // Step 2: Company selects benefits to offer employees
  async setupCompanyBenefits(
    companyId: string, 
    selectedPlans: Array<{
      planId: string;
      employerContributionPercent: number;
    }>,
    effectiveDate: string
  ): Promise<GustoCompanyBenefits> {
    try {
      // Create benefits package in Gusto
      const response = await axios.post(`${this.gustoApiBase}/companies/${companyId}/benefits`, {
        plans: selectedPlans,
        effective_date: effectiveDate,
        enrollment_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      }, {
        headers: this.gustoHeaders
      });
      
      const gustoBenefits = response.data;
      
      // Store configuration in our database
      await this.storeCompanyBenefitsConfig(companyId, gustoBenefits);
      
      return gustoBenefits;
    } catch (error) {
      console.error('Error setting up company benefits:', error);
      throw new Error('Unable to setup benefits with Gusto');
    }
  }
  
  // Step 3: Employees view benefits available to them from their company
  async getAvailableBenefitsForEmployee(employeeId: string): Promise<{
    availablePlans: GustoBenefitPlan[];
    enrollmentDeadline: Date;
    currentEnrollments: any[];
  }> {
    try {
      const employee = await db.select()
        .from(employees)
        .where(eq(employees.id, employeeId))
        .limit(1);
      
      if (!employee.length) {
        throw new Error('Employee not found');
      }
      
      // Get company's configured benefits from Gusto
      const response = await axios.get(`${this.gustoApiBase}/companies/${employee[0].companyId}/benefits`, {
        headers: this.gustoHeaders
      });
      
      const companyBenefits = response.data;
      
      // Get employee's current enrollments
      const currentEnrollments = await db.select()
        .from(employeeBenefits)
        .where(eq(employeeBenefits.employeeId, employeeId));
      
      return {
        availablePlans: companyBenefits.plans || [],
        enrollmentDeadline: new Date(companyBenefits.enrollment_deadline),
        currentEnrollments
      };
    } catch (error) {
      console.error('Error fetching employee benefits:', error);
      return {
        availablePlans: [],
        enrollmentDeadline: new Date(),
        currentEnrollments: []
      };
    }
  }
  
  // Step 4: Employee enrolls in benefits selected by their company
  async enrollEmployeeInBenefits(
    employeeId: string, 
    enrollmentData: GustoEmployeeBenefitEnrollment[]
  ): Promise<BenefitsEnrollmentEvent> {
    try {
      const employee = await db.select()
        .from(employees)
        .where(eq(employees.id, employeeId))
        .limit(1);
      
      if (!employee.length) {
        throw new Error('Employee not found');
      }
      
      // Submit enrollment to Gusto
      const response = await axios.post(`${this.gustoApiBase}/employees/${employeeId}/benefits/enrollments`, {
        enrollments: enrollmentData
      }, {
        headers: this.gustoHeaders
      });
      
      // Create enrollment event record
      const enrollmentEvent: InsertBenefitsEnrollmentEvent = {
        employeeId,
        companyId: employee[0].companyId,
        eventType: 'enrollment',
        eventDate: new Date(),
        effectiveDate: new Date(response.data.effective_date),
        reason: 'employee_enrollment',
        newBenefits: enrollmentData,
        status: 'completed'
      };
      
      const [event] = await db
        .insert(benefitsEnrollmentEvents)
        .values(enrollmentEvent)
        .returning();
      
      // Update employee benefits record
      await this.updateEmployeeBenefitsRecord(employeeId, enrollmentData);
      
      return event;
    } catch (error) {
      console.error('Error enrolling employee in benefits:', error);
      throw new Error('Unable to enroll employee in benefits');
    }
  }
  
  // Helper method to store company benefits configuration
  private async storeCompanyBenefitsConfig(companyId: string, gustoBenefits: GustoCompanyBenefits): Promise<void> {
    const benefitsConfig: InsertCompanyBenefitsConfig = {
      companyId,
      gustoApiConnected: true,
      
      // Set enabled benefits based on Gusto configuration
      healthInsuranceEnabled: gustoBenefits.plans.some(p => p.type === 'medical'),
      dentalInsuranceEnabled: gustoBenefits.plans.some(p => p.type === 'dental'),
      visionInsuranceEnabled: gustoBenefits.plans.some(p => p.type === 'vision'),
      retirement401kEnabled: gustoBenefits.plans.some(p => p.type === 'retirement'),
      
      // Set contribution rates from Gusto
      healthInsuranceEmployerContribution: gustoBenefits.contribution_strategy.medical?.employer_contribution_percent?.toString() || "0",
      dentalInsuranceEmployerContribution: gustoBenefits.contribution_strategy.dental?.employer_contribution_percent?.toString() || "0",
      visionInsuranceEmployerContribution: gustoBenefits.contribution_strategy.vision?.employer_contribution_percent?.toString() || "0",
      
      // Set enrollment period
      openEnrollmentEnd: new Date(gustoBenefits.enrollment_deadline),
      benefitYearStart: new Date(gustoBenefits.effective_date)
    };
    
    await db
      .insert(companyBenefitsConfig)
      .values(benefitsConfig)
      .onConflictDoUpdate({
        target: companyBenefitsConfig.companyId,
        set: {
          ...benefitsConfig,
          updatedAt: new Date()
        }
      });
  }
  
  // Helper method to update employee benefits record
  private async updateEmployeeBenefitsRecord(employeeId: string, enrollmentData: GustoEmployeeBenefitEnrollment[]): Promise<void> {
    // Process enrollment data into our database format
    const healthEnrollment = enrollmentData.find(e => e.plan_id.includes('medical') || e.plan_id.includes('health'));
    const dentalEnrollment = enrollmentData.find(e => e.plan_id.includes('dental'));
    const visionEnrollment = enrollmentData.find(e => e.plan_id.includes('vision'));
    const retirementEnrollment = enrollmentData.find(e => e.plan_id.includes('401k') || e.plan_id.includes('retirement'));
    
    await db
      .insert(employeeBenefits)
      .values({
        employeeId,
        companyId: '', // Will be filled from employee record
        healthInsuranceEnrolled: !!healthEnrollment,
        healthInsurancePlan: healthEnrollment?.plan_id,
        dentalInsuranceEnrolled: !!dentalEnrollment,
        dentalInsurancePlan: dentalEnrollment?.plan_id,
        visionInsuranceEnrolled: !!visionEnrollment,
        visionInsurancePlan: visionEnrollment?.plan_id,
        retirement401kEnrolled: !!retirementEnrollment,
        retirement401kContributionPercent: "3" // Default 3% contribution
      })
      .onConflictDoUpdate({
        target: [employeeBenefits.employeeId],
        set: {
          healthInsuranceEnrolled: !!healthEnrollment,
          healthInsurancePlan: healthEnrollment?.plan_id,
          dentalInsuranceEnrolled: !!dentalEnrollment,
          dentalInsurancePlan: dentalEnrollment?.plan_id,
          visionInsuranceEnrolled: !!visionEnrollment,
          visionInsurancePlan: visionEnrollment?.plan_id,
          retirement401kEnrolled: !!retirementEnrollment,
          updatedAt: new Date()
        }
      });
  }
  
  // Get company benefits configuration
  async getCompanyBenefitsConfig(companyId: string): Promise<CompanyBenefitsConfig | null> {
    const [config] = await db.select()
      .from(companyBenefitsConfig)
      .where(eq(companyBenefitsConfig.companyId, companyId))
      .limit(1);
    
    return config || null;
  }
  
  // Get enrollment events for reporting
  async getEnrollmentEvents(companyId: string): Promise<BenefitsEnrollmentEvent[]> {
    return await db.select()
      .from(benefitsEnrollmentEvents)
      .where(eq(benefitsEnrollmentEvents.companyId, companyId));
  }
}

export const gustoBenefitsService = new GustoBenefitsService();