import { db } from "./db";
import { companies, bankingApplications, documents } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { RailsrService } from "./services/railsr-service";
import { notificationService } from "./notification-service";

export interface BankingApplication {
  id: string;
  tenantId: string;
  applicationStatus: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'requires_documents';
  railsrApplicationId?: string;
  businessType: 'carrier' | 'broker' | 'shipper';
  businessInfo: {
    legalName: string;
    dbaName?: string;
    ein: string;
    dotNumber?: string;
    mcNumber?: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    phone: string;
    email: string;
    website?: string;
  };
  requiredDocuments: {
    articlesOfIncorporation: boolean;
    operatingAuthority: boolean;
    insurance: boolean;
    bankStatements: boolean;
    driversLicense: boolean;
  };
  submittedDocuments: string[];
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TenantBankingApplicationService {
  
  // Tenant initiates banking application
  async startBankingApplication(tenantId: string, businessInfo: any): Promise<BankingApplication> {
    const applicationId = `app_${Date.now()}_${tenantId.slice(0, 8)}`;
    
    const application: BankingApplication = {
      id: applicationId,
      tenantId,
      applicationStatus: 'draft',
      businessType: this.determineBusinessType(businessInfo),
      businessInfo,
      requiredDocuments: this.getRequiredDocuments(businessInfo),
      submittedDocuments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store in database
    await this.storeBankingApplication(application);
    
    return application;
  }

  // Tenant uploads required documents
  async uploadDocument(tenantId: string, applicationId: string, documentType: string, filePath: string): Promise<boolean> {
    try {
      const application = await this.getBankingApplication(tenantId, applicationId);
      
      if (!application) {
        throw new Error('Application not found');
      }

      // Add document to submitted list
      application.submittedDocuments.push(documentType);
      application.updatedAt = new Date();

      // Check if all required documents are submitted
      const allDocumentsSubmitted = this.checkAllDocumentsSubmitted(application);
      
      if (allDocumentsSubmitted) {
        application.applicationStatus = 'submitted';
        await this.submitToRailsrForReview(application);
      }

      await this.updateBankingApplication(application);
      
      return true;
    } catch (error) {
      console.error('Document upload error:', error);
      return false;
    }
  }

  // Submit application to Railsr for review
  private async submitToRailsrForReview(application: BankingApplication): Promise<void> {
    try {
      // Create Railsr enduser application
      const railsrService = new RailsrService();
      const railsrApplication = await railsrService.createEnduser({
        type: 'company',
        name: application.businessInfo.legalName,
        dba: application.businessInfo.dbaName,
        ein: application.businessInfo.ein,
        address: application.businessInfo.address,
        phone: application.businessInfo.phone,
        email: application.businessInfo.email,
        website: application.businessInfo.website,
        businessType: application.businessType
      });

      application.railsrApplicationId = railsrApplication.enduser_id;
      application.applicationStatus = 'under_review';
      
      // Notify tenant that application is under review
      await notificationService.sendNotification(
        application.tenantId,
        'Banking Application Submitted',
        'Your banking application has been submitted for review. You will be notified of the decision within 2-3 business days.',
        'banking'
      );

      await this.updateBankingApplication(application);
    } catch (error) {
      console.error('Railsr submission error:', error);
      application.applicationStatus = 'requires_documents';
      await this.updateBankingApplication(application);
    }
  }

  // Check application status with Railsr
  async checkApplicationStatus(tenantId: string, applicationId: string): Promise<BankingApplication> {
    const application = await this.getBankingApplication(tenantId, applicationId);
    
    if (!application?.railsrApplicationId) {
      return application;
    }

    try {
      const railsrService = new RailsrService();
      const railsrStatus = await railsrService.getEnduserDetails(application.railsrApplicationId);
      
      const previousStatus = application.applicationStatus;
      application.applicationStatus = this.mapRailsrStatusToApplication(railsrStatus.status);
      
      // If status changed, notify tenant
      if (previousStatus !== application.applicationStatus) {
        await this.notifyStatusChange(application, previousStatus);
      }

      await this.updateBankingApplication(application);
      
      return application;
    } catch (error) {
      console.error('Status check error:', error);
      return application;
    }
  }

  // Automated status checking for all pending applications
  async checkAllPendingApplications(): Promise<void> {
    try {
      const pendingApplications = await this.getPendingApplications();
      
      for (const app of pendingApplications) {
        await this.checkApplicationStatus(app.tenantId, app.id);
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Batch status check error:', error);
    }
  }

  // Determine required documents based on business type
  private getRequiredDocuments(businessInfo: any) {
    const baseDocuments = {
      articlesOfIncorporation: true,
      bankStatements: true,
      driversLicense: true,
      insurance: false,
      operatingAuthority: false
    };

    if (businessInfo.businessType === 'carrier') {
      baseDocuments.operatingAuthority = true;
      baseDocuments.insurance = true;
    }

    return baseDocuments;
  }

  private determineBusinessType(businessInfo: any): 'carrier' | 'broker' | 'shipper' {
    if (businessInfo.dotNumber || businessInfo.mcNumber) {
      return 'carrier';
    }
    return 'shipper'; // Default
  }

  private checkAllDocumentsSubmitted(application: BankingApplication): boolean {
    const required = Object.entries(application.requiredDocuments)
      .filter(([_, required]) => required)
      .map(([docType, _]) => docType);
    
    return required.every(docType => application.submittedDocuments.includes(docType));
  }

  private mapRailsrStatusToApplication(railsrStatus: string): BankingApplication['applicationStatus'] {
    switch (railsrStatus?.toLowerCase()) {
      case 'pending':
      case 'review':
        return 'under_review';
      case 'approved':
      case 'active':
        return 'approved';
      case 'denied':
      case 'rejected':
        return 'rejected';
      default:
        return 'under_review';
    }
  }

  private async notifyStatusChange(application: BankingApplication, previousStatus: string): Promise<void> {
    let message = '';
    
    switch (application.applicationStatus) {
      case 'approved':
        message = 'Congratulations! Your banking application has been approved. Your account will be activated within 24 hours.';
        break;
      case 'rejected':
        message = 'Your banking application has been declined. Please contact support for more information.';
        break;
      case 'requires_documents':
        message = 'Additional documentation is required for your banking application. Please check your dashboard for details.';
        break;
    }

    if (message) {
      await notificationService.sendNotification(
        application.tenantId,
        'Banking Application Update',
        message,
        'banking'
      );
    }
  }

  private async storeBankingApplication(application: BankingApplication): Promise<void> {
    // Store in database - implementation depends on schema
    console.log('Storing banking application:', application.id);
  }

  private async updateBankingApplication(application: BankingApplication): Promise<void> {
    // Update in database
    console.log('Updating banking application:', application.id);
  }

  private async getBankingApplication(tenantId: string, applicationId: string): Promise<BankingApplication | null> {
    // Fetch from database
    console.log('Fetching banking application:', applicationId);
    return null;
  }

  private async getPendingApplications(): Promise<BankingApplication[]> {
    // Fetch all pending applications from database
    return [];
  }
}

export const tenantBankingApplicationService = new TenantBankingApplicationService();