/**
 * TenStreet DOT Compliance Service
 * Provides DOT-compliant driver application processing, background checks, and onboarding
 */

import axios, { AxiosInstance } from 'axios';
import { storage } from '../storage';

interface TenStreetConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  environment: 'sandbox' | 'production';
}

interface DriverApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  ssn: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  cdlNumber: string;
  cdlClass: string;
  cdlState: string;
  cdlExpirationDate: string;
  employmentHistory: Array<{
    companyName: string;
    position: string;
    startDate: string;
    endDate: string;
    reason: string;
    supervisorName: string;
    supervisorPhone: string;
  }>;
  safetyRecord: {
    accidents: Array<{
      date: string;
      description: string;
      injuryFatality: boolean;
      hazmatInvolved: boolean;
    }>;
    violations: Array<{
      date: string;
      violation: string;
      location: string;
      description: string;
    }>;
    suspensions: Array<{
      date: string;
      reason: string;
      duration: string;
      state: string;
    }>;
  };
  references: Array<{
    name: string;
    relationship: string;
    phone: string;
    email: string;
  }>;
  consent: {
    backgroundCheck: boolean;
    drugScreen: boolean;
    mvr: boolean;
    psp: boolean;
    digitalSignature: string;
    signatureDate: string;
    ipAddress: string;
  };
}

interface BackgroundCheck {
  id: string;
  applicationId: string;
  checkType: 'PSP' | 'MVR' | 'CDLIS' | 'drug_screen' | 'employment_verification' | 'reference_check';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  results: any;
  orderedAt: Date;
  completedAt?: Date;
  vendorId: string;
  vendorReference: string;
}

interface OnboardingStep {
  id: string;
  name: string;
  description: string;
  required: boolean;
  order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completedAt?: Date;
  documents: string[];
}

export class TenStreetService {
  private client: AxiosInstance;
  private config: TenStreetConfig;
  private companyId: string;

  constructor(companyId: string) {
    this.companyId = companyId;
    this.config = {
      apiKey: process.env.TENSTREET_API_KEY || '',
      apiSecret: process.env.TENSTREET_API_SECRET || '',
      baseUrl: process.env.TENSTREET_BASE_URL || 'https://api.tenstreet.com/v1',
      environment: (process.env.TENSTREET_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
      },
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        const timestamp = Date.now();
        const signature = this.generateSignature(timestamp);
        config.headers['X-Timestamp'] = timestamp.toString();
        config.headers['X-Signature'] = signature;
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('TenStreet API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  /**
   * Generate HMAC signature for API authentication
   */
  private generateSignature(timestamp: number): string {
    const crypto = require('crypto');
    const message = `${timestamp}${this.config.apiKey}`;
    return crypto.createHmac('sha256', this.config.apiSecret).update(message).digest('hex');
  }

  /**
   * Create driver application
   */
  async createDriverApplication(applicationData: Partial<DriverApplication>): Promise<DriverApplication> {
    try {
      const response = await this.client.post('/applications', {
        ...applicationData,
        companyId: this.companyId,
      });
      
      // Store application in database
      const dbApplication = await storage.createDriverApplication({
        ...response.data,
        companyId: this.companyId,
      });
      
      return dbApplication;
    } catch (error) {
      console.error('Error creating driver application:', error);
      throw error;
    }
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(applicationId: string, status: string): Promise<void> {
    try {
      await this.client.put(`/applications/${applicationId}/status`, {
        status,
        companyId: this.companyId,
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }

  /**
   * Order PSP (Pre-Employment Screening Program) report
   */
  async orderPSPReport(application: DriverApplication): Promise<BackgroundCheck> {
    try {
      const response = await this.client.post('/background-checks/psp', {
        applicationId: application.id,
        driverInfo: {
          firstName: application.firstName,
          lastName: application.lastName,
          dateOfBirth: application.dateOfBirth,
          cdlNumber: application.cdlNumber,
          cdlState: application.cdlState,
        },
        companyId: this.companyId,
      });

      const backgroundCheck: BackgroundCheck = {
        id: response.data.id,
        applicationId: application.id,
        checkType: 'PSP',
        status: 'pending',
        results: null,
        orderedAt: new Date(),
        vendorId: 'fmcsa',
        vendorReference: response.data.reference,
      };

      return backgroundCheck;
    } catch (error) {
      console.error('Error ordering PSP report:', error);
      throw error;
    }
  }

  /**
   * Order MVR (Motor Vehicle Record) report
   */
  async orderMVRReport(application: DriverApplication): Promise<BackgroundCheck> {
    try {
      const response = await this.client.post('/background-checks/mvr', {
        applicationId: application.id,
        driverInfo: {
          firstName: application.firstName,
          lastName: application.lastName,
          dateOfBirth: application.dateOfBirth,
          licenseNumber: application.cdlNumber,
          licenseState: application.cdlState,
        },
        companyId: this.companyId,
      });

      const backgroundCheck: BackgroundCheck = {
        id: response.data.id,
        applicationId: application.id,
        checkType: 'MVR',
        status: 'pending',
        results: null,
        orderedAt: new Date(),
        vendorId: 'mvr_provider',
        vendorReference: response.data.reference,
      };

      return backgroundCheck;
    } catch (error) {
      console.error('Error ordering MVR report:', error);
      throw error;
    }
  }

  /**
   * Order CDLIS (Commercial Driver License Information System) check
   */
  async orderCDLISCheck(application: DriverApplication): Promise<BackgroundCheck> {
    try {
      const response = await this.client.post('/background-checks/cdlis', {
        applicationId: application.id,
        driverInfo: {
          firstName: application.firstName,
          lastName: application.lastName,
          dateOfBirth: application.dateOfBirth,
          cdlNumber: application.cdlNumber,
          cdlState: application.cdlState,
        },
        companyId: this.companyId,
      });

      const backgroundCheck: BackgroundCheck = {
        id: response.data.id,
        applicationId: application.id,
        checkType: 'CDLIS',
        status: 'pending',
        results: null,
        orderedAt: new Date(),
        vendorId: 'aamva',
        vendorReference: response.data.reference,
      };

      return backgroundCheck;
    } catch (error) {
      console.error('Error ordering CDLIS check:', error);
      throw error;
    }
  }

  /**
   * Schedule drug screen
   */
  async scheduleDrugScreen(application: DriverApplication): Promise<void> {
    try {
      await this.client.post('/drug-screens/schedule', {
        applicationId: application.id,
        driverInfo: {
          firstName: application.firstName,
          lastName: application.lastName,
          phone: application.phone,
          email: application.email,
          address: application.address,
          city: application.city,
          state: application.state,
          zipCode: application.zipCode,
        },
        companyId: this.companyId,
        testType: 'DOT_5_Panel',
        priority: 'standard',
      });
    } catch (error) {
      console.error('Error scheduling drug screen:', error);
      throw error;
    }
  }

  /**
   * Verify employment history
   */
  async verifyEmploymentHistory(application: DriverApplication): Promise<void> {
    try {
      for (const employment of application.employmentHistory) {
        await this.client.post('/employment-verification', {
          applicationId: application.id,
          employmentInfo: employment,
          companyId: this.companyId,
        });
      }
    } catch (error) {
      console.error('Error verifying employment history:', error);
      throw error;
    }
  }

  /**
   * Check references
   */
  async checkReferences(application: DriverApplication): Promise<void> {
    try {
      for (const reference of application.references) {
        await this.client.post('/reference-checks', {
          applicationId: application.id,
          referenceInfo: reference,
          companyId: this.companyId,
        });
      }
    } catch (error) {
      console.error('Error checking references:', error);
      throw error;
    }
  }

  /**
   * Initialize onboarding process
   */
  async initiateOnboarding(applicationId: string): Promise<void> {
    try {
      const onboardingSteps: OnboardingStep[] = [
        {
          id: 'welcome',
          name: 'Welcome & Orientation',
          description: 'Company introduction and orientation materials',
          required: true,
          order: 1,
          status: 'pending',
          documents: ['employee_handbook', 'safety_manual'],
        },
        {
          id: 'paperwork',
          name: 'Complete Paperwork',
          description: 'I-9, W-4, and other required forms',
          required: true,
          order: 2,
          status: 'pending',
          documents: ['i9_form', 'w4_form', 'emergency_contact'],
        },
        {
          id: 'drug_screen',
          name: 'Drug Screen',
          description: 'DOT-required drug and alcohol screening',
          required: true,
          order: 3,
          status: 'pending',
          documents: ['drug_screen_results'],
        },
        {
          id: 'dot_physical',
          name: 'DOT Physical',
          description: 'DOT medical examination and certification',
          required: true,
          order: 4,
          status: 'pending',
          documents: ['dot_medical_certificate'],
        },
        {
          id: 'training',
          name: 'Safety Training',
          description: 'Company safety training and certification',
          required: true,
          order: 5,
          status: 'pending',
          documents: ['safety_training_certificate'],
        },
        {
          id: 'equipment',
          name: 'Equipment Assignment',
          description: 'Vehicle and equipment assignment',
          required: true,
          order: 6,
          status: 'pending',
          documents: ['vehicle_assignment', 'equipment_checklist'],
        },
      ];

      await this.client.post('/onboarding/initiate', {
        applicationId,
        companyId: this.companyId,
        steps: onboardingSteps,
      });
    } catch (error) {
      console.error('Error initiating onboarding:', error);
      throw error;
    }
  }

  /**
   * Complete onboarding step
   */
  async completeOnboardingStep(applicationId: string, stepId: string): Promise<void> {
    try {
      await this.client.put(`/onboarding/${applicationId}/steps/${stepId}/complete`, {
        companyId: this.companyId,
        completedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error completing onboarding step:', error);
      throw error;
    }
  }

  /**
   * Check DOT compliance status
   */
  async checkDOTCompliance(employeeId: string): Promise<any> {
    try {
      const response = await this.client.get(`/compliance/dot/${employeeId}`, {
        params: {
          companyId: this.companyId,
        },
      });

      return {
        compliant: response.data.compliant,
        violations: response.data.violations || [],
        expiringDocuments: response.data.expiringDocuments || [],
        requiredActions: response.data.requiredActions || [],
        lastChecked: new Date(),
      };
    } catch (error) {
      console.error('Error checking DOT compliance:', error);
      throw error;
    }
  }

  /**
   * Generate I-9 form
   */
  async generateI9Form(applicationId: string): Promise<string> {
    try {
      const response = await this.client.post(`/forms/i9/generate`, {
        applicationId,
        companyId: this.companyId,
      });

      return response.data.formUrl;
    } catch (error) {
      console.error('Error generating I-9 form:', error);
      throw error;
    }
  }

  /**
   * Process I-9 verification
   */
  async processI9Verification(applicationId: string, verificationData: any): Promise<void> {
    try {
      await this.client.post(`/forms/i9/verify`, {
        applicationId,
        companyId: this.companyId,
        verificationData,
      });
    } catch (error) {
      console.error('Error processing I-9 verification:', error);
      throw error;
    }
  }

  /**
   * Schedule DOT physical
   */
  async scheduleDOTPhysical(applicationId: string, locationPreference?: string): Promise<void> {
    try {
      await this.client.post('/medical/schedule-physical', {
        applicationId,
        companyId: this.companyId,
        locationPreference,
        testType: 'DOT_Physical',
      });
    } catch (error) {
      console.error('Error scheduling DOT physical:', error);
      throw error;
    }
  }

  /**
   * Upload document
   */
  async uploadDocument(applicationId: string, documentType: string, fileBuffer: Buffer, fileName: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', fileBuffer, fileName);
      formData.append('applicationId', applicationId);
      formData.append('companyId', this.companyId);
      formData.append('documentType', documentType);

      const response = await this.client.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.documentId;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  /**
   * Get document by ID
   */
  async getDocument(documentId: string): Promise<Buffer> {
    try {
      const response = await this.client.get(`/documents/${documentId}`, {
        responseType: 'arraybuffer',
        params: {
          companyId: this.companyId,
        },
      });

      return Buffer.from(response.data);
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  }

  /**
   * Webhook handler for TenStreet events
   */
  async handleWebhook(webhookData: any): Promise<void> {
    try {
      const { event_type, application_id, data } = webhookData;

      console.log('TenStreet webhook received:', { event_type, application_id });

      switch (event_type) {
        case 'background_check_completed':
          await this.handleBackgroundCheckCompleted(application_id, data);
          break;
        case 'drug_screen_completed':
          await this.handleDrugScreenCompleted(application_id, data);
          break;
        case 'onboarding_step_completed':
          await this.handleOnboardingStepCompleted(application_id, data);
          break;
        default:
          console.log('Unhandled webhook event:', event_type);
      }
    } catch (error) {
      console.error('Error handling TenStreet webhook:', error);
      throw error;
    }
  }

  /**
   * Handle background check completed webhook
   */
  private async handleBackgroundCheckCompleted(applicationId: string, data: any): Promise<void> {
    try {
      await storage.updateDriverApplication(applicationId, {
        backgroundCheckStatus: data.status,
        backgroundCheckResults: data.results,
        backgroundCheckCompletedAt: new Date(),
      });

      // Auto-advance application if all checks pass
      if (data.status === 'clear') {
        await this.updateApplicationStatus(applicationId, 'background_check_passed');
      }
    } catch (error) {
      console.error('Error handling background check completed:', error);
    }
  }

  /**
   * Handle drug screen completed webhook
   */
  private async handleDrugScreenCompleted(applicationId: string, data: any): Promise<void> {
    try {
      await storage.updateDriverApplication(applicationId, {
        drugScreenStatus: data.status,
        drugScreenResults: data.results,
        drugScreenCompletedAt: new Date(),
      });

      // Auto-advance application if drug screen passes
      if (data.status === 'negative') {
        await this.updateApplicationStatus(applicationId, 'drug_screen_passed');
      }
    } catch (error) {
      console.error('Error handling drug screen completed:', error);
    }
  }

  /**
   * Handle onboarding step completed webhook
   */
  private async handleOnboardingStepCompleted(applicationId: string, data: any): Promise<void> {
    try {
      // Update onboarding progress
      const onboardingStatus = await storage.getOnboardingStatus(applicationId, this.companyId);
      if (onboardingStatus) {
        onboardingStatus.completedSteps.push(data.step_id);
        await storage.updateOnboardingStatus(applicationId, onboardingStatus);
      }

      // Check if all steps are complete
      if (data.all_steps_complete) {
        await this.updateApplicationStatus(applicationId, 'onboarding_complete');
      }
    } catch (error) {
      console.error('Error handling onboarding step completed:', error);
    }
  }
}

/**
 * Factory function to create TenStreet service instance
 */
export function createTenStreetService(companyId: string): TenStreetService {
  return new TenStreetService(companyId);
}