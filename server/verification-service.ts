import { storage } from "./storage";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export interface VerificationDocument {
  type: 'identity' | 'business_license' | 'insurance' | 'tax_document' | 'bank_statement';
  documentId: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: Date;
  verifiedAt?: Date;
  rejectionReason?: string;
}

export interface CompanyVerification {
  companyId: string;
  verificationLevel: 'none' | 'basic' | 'enhanced' | 'full';
  identityVerified: boolean;
  businessVerified: boolean;
  bankingEnabled: boolean;
  payrollEnabled: boolean;
  documents: VerificationDocument[];
  stripeAccountId?: string;
  lastVerificationCheck: Date;
  complianceScore: number;
}

export interface VerificationRequirement {
  type: string;
  description: string;
  required: boolean;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  documents: string[];
}

export class VerificationService {
  async getVerificationStatus(companyId: string): Promise<CompanyVerification> {
    const verification = await storage.getCompanyVerification(companyId);
    
    if (!verification) {
      // Create initial verification record
      const newVerification: CompanyVerification = {
        companyId,
        verificationLevel: 'none',
        identityVerified: false,
        businessVerified: false,
        bankingEnabled: false,
        payrollEnabled: false,
        documents: [],
        lastVerificationCheck: new Date(),
        complianceScore: 0
      };
      
      await storage.createCompanyVerification(newVerification);
      return newVerification;
    }
    
    return verification;
  }

  async getVerificationRequirements(companyId: string): Promise<VerificationRequirement[]> {
    const verification = await this.getVerificationStatus(companyId);
    
    const requirements: VerificationRequirement[] = [
      {
        type: 'identity_verification',
        description: 'Verify company owner identity with government-issued ID',
        required: true,
        status: verification.identityVerified ? 'completed' : 'not_started',
        documents: ['drivers_license', 'passport', 'state_id']
      },
      {
        type: 'business_verification',
        description: 'Verify business legitimacy with official documents',
        required: true,
        status: verification.businessVerified ? 'completed' : 'not_started',
        documents: ['business_license', 'ein_certificate', 'articles_of_incorporation']
      },
      {
        type: 'insurance_verification',
        description: 'Verify commercial trucking insurance coverage',
        required: true,
        status: this.hasDocumentType(verification, 'insurance') ? 'completed' : 'not_started',
        documents: ['insurance_certificate', 'liability_policy']
      },
      {
        type: 'banking_setup',
        description: 'Connect and verify business bank account',
        required: true,
        status: verification.bankingEnabled ? 'completed' : 'not_started',
        documents: ['bank_statement', 'void_check']
      },
      {
        type: 'tax_compliance',
        description: 'Verify tax compliance and filing status',
        required: false,
        status: this.hasDocumentType(verification, 'tax_document') ? 'completed' : 'not_started',
        documents: ['tax_return', 'quarterly_filing', 'tax_exempt_certificate']
      }
    ];

    return requirements;
  }

  private hasDocumentType(verification: CompanyVerification, type: string): boolean {
    return verification.documents.some(doc => doc.type === type && doc.status === 'verified');
  }

  async uploadVerificationDocument(
    companyId: string, 
    documentType: string, 
    fileBuffer: Buffer, 
    fileName: string
  ): Promise<{ documentId: string; uploadUrl?: string }> {
    try {
      // For real implementation, upload to secure document storage
      // This example uses Stripe for identity verification
      
      if (documentType === 'identity') {
        const verification = await this.getVerificationStatus(companyId);
        
        if (!verification.stripeAccountId) {
          // Create Stripe Connect account for identity verification
          const account = await stripe.accounts.create({
            type: 'express',
            country: 'US',
            email: `company-${companyId}@freightops.com`,
            capabilities: {
              card_payments: { requested: true },
              transfers: { requested: true },
            },
          });
          
          verification.stripeAccountId = account.id;
          await storage.updateCompanyVerification(companyId, verification);
        }
      }

      // Generate document ID and store metadata
      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const document: VerificationDocument = {
        type: documentType as any,
        documentId,
        status: 'pending',
        uploadedAt: new Date()
      };

      // Add document to verification record
      const verification = await this.getVerificationStatus(companyId);
      verification.documents.push(document);
      await storage.updateCompanyVerification(companyId, verification);

      // In production, upload to secure storage (AWS S3, Google Cloud Storage, etc.)
      // For now, simulate successful upload
      setTimeout(async () => {
        await this.processVerificationDocument(companyId, documentId);
      }, 2000);

      return {
        documentId,
        uploadUrl: `/api/verification/upload/${documentId}`
      };

    } catch (error) {
      console.error('Document upload error:', error);
      throw new Error('Failed to upload verification document');
    }
  }

  async processVerificationDocument(companyId: string, documentId: string): Promise<void> {
    const verification = await this.getVerificationStatus(companyId);
    const document = verification.documents.find(doc => doc.documentId === documentId);
    
    if (!document) {
      throw new Error('Document not found');
    }

    // Simulate document verification process
    // In production, integrate with verification services like Jumio, Onfido, etc.
    const verificationSuccess = Math.random() > 0.1; // 90% success rate for demo
    
    if (verificationSuccess) {
      document.status = 'verified';
      document.verifiedAt = new Date();
      
      // Update verification flags based on document type
      switch (document.type) {
        case 'identity':
          verification.identityVerified = true;
          break;
        case 'business_license':
          verification.businessVerified = true;
          break;
      }
      
      // Check if banking can be enabled
      if (verification.identityVerified && verification.businessVerified) {
        verification.bankingEnabled = true;
        verification.verificationLevel = 'enhanced';
      }
      
      // Check if payroll can be enabled
      if (verification.bankingEnabled && this.hasDocumentType(verification, 'insurance')) {
        verification.payrollEnabled = true;
        verification.verificationLevel = 'full';
      }
      
    } else {
      document.status = 'rejected';
      document.rejectionReason = 'Document quality insufficient or information does not match records';
    }

    // Update compliance score
    verification.complianceScore = this.calculateComplianceScore(verification);
    verification.lastVerificationCheck = new Date();
    
    await storage.updateCompanyVerification(companyId, verification);
  }

  private calculateComplianceScore(verification: CompanyVerification): number {
    let score = 0;
    const maxScore = 100;
    
    // Identity verification (30 points)
    if (verification.identityVerified) score += 30;
    
    // Business verification (25 points)
    if (verification.businessVerified) score += 25;
    
    // Banking setup (20 points)
    if (verification.bankingEnabled) score += 20;
    
    // Insurance verification (15 points)
    if (this.hasDocumentType(verification, 'insurance')) score += 15;
    
    // Tax compliance (10 points)
    if (this.hasDocumentType(verification, 'tax_document')) score += 10;
    
    return Math.min(score, maxScore);
  }

  async initiateStripeOnboarding(companyId: string): Promise<{ accountLinkUrl: string; accountId: string }> {
    try {
      const verification = await this.getVerificationStatus(companyId);
      let accountId = verification.stripeAccountId;
      
      if (!accountId) {
        // Create new Stripe Connect account
        const account = await stripe.accounts.create({
          type: 'express',
          country: 'US',
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
        });
        
        accountId = account.id;
        verification.stripeAccountId = accountId;
        await storage.updateCompanyVerification(companyId, verification);
      }
      
      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${process.env.BASE_URL || 'http://localhost:5000'}/verification/reauth`,
        return_url: `${process.env.BASE_URL || 'http://localhost:5000'}/verification/complete`,
        type: 'account_onboarding',
      });
      
      return {
        accountLinkUrl: accountLink.url,
        accountId
      };
      
    } catch (error) {
      console.error('Stripe onboarding error:', error);
      throw new Error('Failed to initiate Stripe onboarding');
    }
  }

  async checkStripeAccountStatus(companyId: string): Promise<{
    accountId: string;
    verified: boolean;
    requirementsNeeded: string[];
    paymentsEnabled: boolean;
    transfersEnabled: boolean;
  }> {
    const verification = await this.getVerificationStatus(companyId);
    
    if (!verification.stripeAccountId) {
      throw new Error('No Stripe account found for company');
    }
    
    try {
      const account = await stripe.accounts.retrieve(verification.stripeAccountId);
      
      return {
        accountId: account.id,
        verified: account.details_submitted && !account.requirements?.currently_due?.length,
        requirementsNeeded: account.requirements?.currently_due || [],
        paymentsEnabled: account.charges_enabled,
        transfersEnabled: account.payouts_enabled
      };
      
    } catch (error) {
      console.error('Stripe account status error:', error);
      throw new Error('Failed to check Stripe account status');
    }
  }

  async enableBankingFeatures(companyId: string): Promise<boolean> {
    const verification = await this.getVerificationStatus(companyId);
    
    // Check requirements
    if (!verification.identityVerified || !verification.businessVerified) {
      throw new Error('Identity and business verification required before enabling banking');
    }
    
    const stripeStatus = await this.checkStripeAccountStatus(companyId);
    if (!stripeStatus.verified || !stripeStatus.paymentsEnabled) {
      throw new Error('Stripe account verification incomplete');
    }
    
    verification.bankingEnabled = true;
    verification.verificationLevel = 'enhanced';
    await storage.updateCompanyVerification(companyId, verification);
    
    return true;
  }

  async enablePayrollFeatures(companyId: string): Promise<boolean> {
    const verification = await this.getVerificationStatus(companyId);
    
    // Check requirements
    if (!verification.bankingEnabled) {
      throw new Error('Banking must be enabled before payroll');
    }
    
    if (!this.hasDocumentType(verification, 'insurance')) {
      throw new Error('Insurance verification required for payroll features');
    }
    
    verification.payrollEnabled = true;
    verification.verificationLevel = 'full';
    await storage.updateCompanyVerification(companyId, verification);
    
    return true;
  }

  async getSecurityChecklistItems(companyId: string): Promise<Array<{
    id: string;
    title: string;
    description: string;
    completed: boolean;
    required: boolean;
    category: 'identity' | 'business' | 'financial' | 'compliance';
  }>> {
    const verification = await this.getVerificationStatus(companyId);
    const stripeStatus = verification.stripeAccountId ? 
      await this.checkStripeAccountStatus(companyId).catch(() => null) : null;
    
    return [
      {
        id: 'identity_verification',
        title: 'Identity Verification',
        description: 'Verify your identity with government-issued photo ID',
        completed: verification.identityVerified,
        required: true,
        category: 'identity'
      },
      {
        id: 'business_license',
        title: 'Business License',
        description: 'Upload valid business license and registration documents',
        completed: verification.businessVerified,
        required: true,
        category: 'business'
      },
      {
        id: 'insurance_coverage',
        title: 'Insurance Coverage',
        description: 'Verify commercial trucking insurance with minimum coverage',
        completed: this.hasDocumentType(verification, 'insurance'),
        required: true,
        category: 'business'
      },
      {
        id: 'bank_account',
        title: 'Bank Account Verification',
        description: 'Connect and verify your business bank account',
        completed: stripeStatus?.verified || false,
        required: true,
        category: 'financial'
      },
      {
        id: 'tax_compliance',
        title: 'Tax Compliance',
        description: 'Verify tax filing status and compliance documentation',
        completed: this.hasDocumentType(verification, 'tax_document'),
        required: false,
        category: 'compliance'
      },
      {
        id: 'background_check',
        title: 'Background Check',
        description: 'Complete background check for enhanced security',
        completed: verification.complianceScore >= 80,
        required: false,
        category: 'compliance'
      }
    ];
  }

  // Transfer verification codes for transaction security
  private transferCodes = new Map<string, {
    code: string;
    type: 'email' | 'phone';
    expiresAt: Date;
    attempts: number;
    companyId: string;
    transferData: any;
    transferType: 'ach' | 'instant';
  }>();

  // Generate 6-digit verification code
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send verification code for transfer authorization
  async sendTransferVerificationCode(
    companyId: string,
    contactInfo: string,
    contactType: 'email' | 'phone',
    transferData: any,
    transferType: 'ach' | 'instant'
  ): Promise<{ success: boolean; codeId?: string; error?: string }> {
    try {
      const code = this.generateCode();
      const codeId = `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      this.transferCodes.set(codeId, {
        code,
        type: contactType,
        expiresAt,
        attempts: 0,
        companyId,
        transferData,
        transferType,
      });

      if (contactType === 'email') {
        // In production, integrate with SendGrid
        console.log(`Transfer verification email code for ${contactInfo}: ${code}`);
        console.log(`Transfer details: ${transferType.toUpperCase()} $${transferData.amount} to ${transferData.destination?.accountNumber || 'external account'}`);
      } else {
        // In production, integrate with Twilio
        console.log(`Transfer verification SMS code for ${contactInfo}: ${code}`);
        console.log(`Transfer details: ${transferType.toUpperCase()} $${transferData.amount} to ${transferData.destination?.accountNumber || 'external account'}`);
      }
      
      return { success: true, codeId };
    } catch (error) {
      console.error('Transfer verification code error:', error);
      return { success: false, error: 'Failed to send verification code' };
    }
  }

  // Verify transfer code and execute transfer
  async verifyTransferCode(
    codeId: string, 
    code: string
  ): Promise<{ success: boolean; transfer?: any; error?: string }> {
    const verification = this.transferCodes.get(codeId);

    if (!verification) {
      return { success: false, error: 'Transfer verification not found or expired' };
    }

    if (verification.expiresAt < new Date()) {
      this.transferCodes.delete(codeId);
      return { success: false, error: 'Verification code has expired' };
    }

    if (verification.attempts >= 3) {
      this.transferCodes.delete(codeId);
      return { success: false, error: 'Too many verification attempts' };
    }

    verification.attempts++;

    if (verification.code === code) {
      this.transferCodes.delete(codeId);
      
      try {
        // Import banking service
        const { bankingService } = await import('./banking-services');

        // Execute the transfer based on type
        let transfer;
        if (verification.transferType === 'ach') {
          transfer = await bankingService.createACHTransfer(
            verification.companyId,
            verification.transferData.amount,
            verification.transferData.destination,
            verification.transferData.description
          );
        } else {
          transfer = await bankingService.createInstantTransfer(
            verification.companyId,
            verification.transferData.amount,
            verification.transferData.destination,
            verification.transferData.description,
            verification.transferData.transferType || 'standard'
          );
        }

        console.log(`Transfer executed for company ${verification.companyId}: ${verification.transferType.toUpperCase()} $${verification.transferData.amount}`);

        return { success: true, transfer };
      } catch (error) {
        console.error('Transfer execution error:', error);
        return { success: false, error: 'Failed to execute transfer' };
      }
    }

    this.transferCodes.set(codeId, verification);
    return { success: false, error: 'Invalid verification code' };
  }
}

export const verificationService = new VerificationService();