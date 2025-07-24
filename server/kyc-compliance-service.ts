import { z } from "zod";

// Patriot Act Section 326 - Customer Identification Program (CIP)
export interface CustomerIdentificationData {
  // Required CIP Information
  businessName: string;
  ein: string;
  businessType: 'corporation' | 'llc' | 'partnership' | 'sole_proprietorship';
  dateOfIncorporation: Date;
  stateOfIncorporation: string;
  businessAddress: {
    street: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  mailingAddress?: {
    street: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone: string;
  website?: string;
  businessDescription: string;
  naicsCode: string;
  expectedMonthlyVolume: number;
  expectedTransactionTypes: string[];
  
  // Beneficial Ownership (31 CFR 1010.230)
  beneficialOwners: BeneficialOwner[];
  controlPerson: ControlPerson;
  
  // Additional Risk Assessment
  sourceOfFunds: string;
  purposeOfAccount: string;
  riskCategory: 'low' | 'medium' | 'high';
  
  // Document Requirements
  documentationProvided: {
    articlesOfIncorporation: boolean;
    operatingAgreement: boolean;
    businessLicense: boolean;
    taxIdVerification: boolean;
    bankStatements: boolean;
    financialStatements: boolean;
    beneficialOwnershipCertification: boolean;
  };
}

// 31 CFR 1010.230 - Beneficial Ownership Requirements
export interface BeneficialOwner {
  id: string;
  type: 'ownership' | 'control'; // 25%+ ownership OR significant control
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  ssn: string; // Encrypted
  address: {
    street: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  percentageOwnership?: number;
  controlDescription?: string;
  citizenshipCountry: string;
  identificationType: 'drivers_license' | 'passport' | 'state_id';
  identificationNumber: string; // Encrypted
  identificationExpiry: Date;
  identificationIssuingState?: string;
  identificationIssuingCountry: string;
  
  // PEP and Sanctions Screening
  isPoliticallyExposed: boolean;
  sanctionsScreeningStatus: 'clear' | 'flagged' | 'pending';
  
  // Enhanced Due Diligence if required
  enhancedDueDiligence?: {
    sourceOfWealth: string;
    sourceOfFunds: string;
    expectedActivityLevel: string;
    riskJustification: string;
  };
}

export interface ControlPerson {
  firstName: string;
  lastName: string;
  title: string;
  dateOfBirth: Date;
  ssn: string; // Encrypted
  address: {
    street: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  controlDescription: string;
  citizenshipCountry: string;
  identificationType: 'drivers_license' | 'passport' | 'state_id';
  identificationNumber: string; // Encrypted
  identificationExpiry: Date;
  identificationIssuingState?: string;
  identificationIssuingCountry: string;
  isPoliticallyExposed: boolean;
  sanctionsScreeningStatus: 'clear' | 'flagged' | 'pending';
}

export interface KYCVerificationResult {
  status: 'approved' | 'rejected' | 'manual_review' | 'pending_documents';
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'prohibited';
  verificationChecks: {
    businessVerification: boolean;
    einVerification: boolean;
    addressVerification: boolean;
    beneficialOwnerVerification: boolean;
    sanctionsScreening: boolean;
    pepScreening: boolean;
    ofacScreening: boolean;
    documentVerification: boolean;
  };
  flags: KYCFlag[];
  requiredDocuments: string[];
  nextReviewDate?: Date;
  complianceNotes: string;
}

export interface KYCFlag {
  type: 'sanctions' | 'pep' | 'high_risk_jurisdiction' | 'incomplete_documents' | 'verification_failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  source: string;
  dateIdentified: Date;
  status: 'active' | 'resolved' | 'false_positive';
  resolutionNotes?: string;
}

// BSA/AML Transaction Monitoring
export interface TransactionMonitoringRule {
  id: string;
  name: string;
  type: 'velocity' | 'amount' | 'pattern' | 'geographic' | 'counterparty';
  threshold: number;
  timeframe: 'daily' | 'weekly' | 'monthly';
  action: 'flag' | 'block' | 'enhance_monitoring' | 'file_sar';
  isActive: boolean;
}

export interface SuspiciousActivityAlert {
  id: string;
  accountId: string;
  transactionId?: string;
  alertType: 'unusual_activity' | 'structuring' | 'money_laundering' | 'terrorist_financing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  dateGenerated: Date;
  status: 'new' | 'investigating' | 'sar_filed' | 'false_positive' | 'closed';
  investigationNotes: string[];
  sarFilingNumber?: string;
  sarFilingDate?: Date;
}

class KYCComplianceService {
  private railsrApiUrl = 'https://play.railsbank.com';
  private railsrPrivateKey = process.env.RAILSR_PRIVATE_KEY;

  constructor() {
    if (!this.railsrPrivateKey) {
      console.warn('RAILSR_PRIVATE_KEY not configured - KYC features will not work');
    }
  }

  // Perform comprehensive KYC verification
  async performKYCVerification(customerData: CustomerIdentificationData): Promise<KYCVerificationResult> {
    try {
      const verificationResult: KYCVerificationResult = {
        status: 'pending_documents',
        riskScore: 0,
        riskLevel: 'medium',
        verificationChecks: {
          businessVerification: false,
          einVerification: false,
          addressVerification: false,
          beneficialOwnerVerification: false,
          sanctionsScreening: false,
          pepScreening: false,
          ofacScreening: false,
          documentVerification: false,
        },
        flags: [],
        requiredDocuments: [],
        complianceNotes: '',
      };

      // 1. Business Entity Verification
      const businessVerified = await this.verifyBusinessEntity(customerData);
      verificationResult.verificationChecks.businessVerification = businessVerified;

      // 2. EIN Verification with IRS
      const einVerified = await this.verifyEIN(customerData.ein);
      verificationResult.verificationChecks.einVerification = einVerified;

      // 3. Address Verification
      const addressVerified = await this.verifyBusinessAddress(customerData.businessAddress);
      verificationResult.verificationChecks.addressVerification = addressVerified;

      // 4. Beneficial Owner Verification (31 CFR 1010.230)
      const beneficialOwnersVerified = await this.verifyBeneficialOwners(customerData.beneficialOwners, customerData.controlPerson);
      verificationResult.verificationChecks.beneficialOwnerVerification = beneficialOwnersVerified;

      // 5. OFAC Sanctions Screening
      const sanctionsClean = await this.performSanctionsScreening(customerData);
      verificationResult.verificationChecks.ofacScreening = sanctionsClean;

      // 6. PEP Screening
      const pepClean = await this.performPEPScreening(customerData);
      verificationResult.verificationChecks.pepScreening = pepClean;

      // 7. Document Verification
      const documentsVerified = await this.verifyRequiredDocuments(customerData);
      verificationResult.verificationChecks.documentVerification = documentsVerified;

      // Calculate risk score and determine status
      verificationResult.riskScore = this.calculateRiskScore(verificationResult.verificationChecks, customerData);
      verificationResult.riskLevel = this.determineRiskLevel(verificationResult.riskScore);
      verificationResult.status = this.determineVerificationStatus(verificationResult);

      // Determine required documents if any are missing
      verificationResult.requiredDocuments = this.getRequiredDocuments(customerData);

      return verificationResult;
    } catch (error) {
      console.error('KYC verification error:', error);
      throw new Error('KYC verification failed');
    }
  }

  private async verifyBusinessEntity(customerData: CustomerIdentificationData): Promise<boolean> {
    // Verify business exists in state records
    // This would integrate with state business registries
    // For now, basic validation
    return customerData.businessName.length > 0 && 
           customerData.stateOfIncorporation.length === 2 &&
           customerData.dateOfIncorporation < new Date();
  }

  private async verifyEIN(ein: string): Promise<boolean> {
    // Verify EIN format and potentially validate with IRS
    const einRegex = /^\d{2}-\d{7}$/;
    return einRegex.test(ein);
  }

  private async verifyBusinessAddress(address: any): Promise<boolean> {
    // Address verification service integration
    // Basic validation for now
    return address.street.length > 0 && 
           address.city.length > 0 && 
           address.state.length === 2 && 
           /^\d{5}(-\d{4})?$/.test(address.zipCode);
  }

  private async verifyBeneficialOwners(beneficialOwners: BeneficialOwner[], controlPerson: ControlPerson): Promise<boolean> {
    // Verify each beneficial owner and control person
    for (const owner of beneficialOwners) {
      const verified = await this.verifyIndividual(owner);
      if (!verified) return false;
    }
    
    return this.verifyIndividual(controlPerson);
  }

  private async verifyIndividual(person: BeneficialOwner | ControlPerson): Promise<boolean> {
    // Individual identity verification
    // This would integrate with identity verification services
    const ssnValid = /^\d{3}-\d{2}-\d{4}$/.test(person.ssn);
    const dobValid = person.dateOfBirth < new Date();
    const addressValid = person.address.street.length > 0;
    
    return ssnValid && dobValid && addressValid;
  }

  private async performSanctionsScreening(customerData: CustomerIdentificationData): Promise<boolean> {
    // Screen against OFAC, EU, UN sanctions lists
    // This would integrate with sanctions screening services
    
    // Check business name
    const businessClean = await this.screenName(customerData.businessName);
    
    // Check all beneficial owners
    for (const owner of customerData.beneficialOwners) {
      const ownerClean = await this.screenName(`${owner.firstName} ${owner.lastName}`);
      if (!ownerClean) return false;
    }
    
    // Check control person
    const controlPersonClean = await this.screenName(`${customerData.controlPerson.firstName} ${customerData.controlPerson.lastName}`);
    
    return businessClean && controlPersonClean;
  }

  private async screenName(name: string): Promise<boolean> {
    // Mock sanctions screening - would integrate with real service
    const sanctionedNames = ['BLOCKED PERSON', 'SANCTIONED ENTITY'];
    return !sanctionedNames.some(blocked => name.toUpperCase().includes(blocked));
  }

  private async performPEPScreening(customerData: CustomerIdentificationData): Promise<boolean> {
    // Screen for Politically Exposed Persons
    // Check if any beneficial owners or control person are PEPs
    const anyPEP = customerData.beneficialOwners.some(owner => owner.isPoliticallyExposed) ||
                   customerData.controlPerson.isPoliticallyExposed;
    
    // PEPs require enhanced due diligence but aren't automatically rejected
    return true; // Would perform enhanced screening for PEPs
  }

  private async verifyRequiredDocuments(customerData: CustomerIdentificationData): Promise<boolean> {
    const docs = customerData.documentationProvided;
    
    // Required documents per banking regulations
    return docs.articlesOfIncorporation &&
           docs.taxIdVerification &&
           docs.beneficialOwnershipCertification &&
           docs.businessLicense;
  }

  private calculateRiskScore(checks: any, customerData: CustomerIdentificationData): number {
    let score = 0;
    
    // Base score from verification checks
    Object.values(checks).forEach(check => {
      if (check) score += 10;
    });
    
    // Risk factors
    if (customerData.expectedMonthlyVolume > 1000000) score -= 5; // High volume
    if (customerData.riskCategory === 'high') score -= 15;
    if (customerData.beneficialOwners.some(o => o.isPoliticallyExposed)) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'prohibited' {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'high';
    return 'prohibited';
  }

  private determineVerificationStatus(result: KYCVerificationResult): 'approved' | 'rejected' | 'manual_review' | 'pending_documents' {
    if (result.requiredDocuments.length > 0) return 'pending_documents';
    if (result.riskLevel === 'prohibited') return 'rejected';
    if (result.riskLevel === 'high' || result.flags.some(f => f.severity === 'critical')) return 'manual_review';
    if (Object.values(result.verificationChecks).every(check => check)) return 'approved';
    return 'manual_review';
  }

  private getRequiredDocuments(customerData: CustomerIdentificationData): string[] {
    const required = [];
    const docs = customerData.documentationProvided;
    
    if (!docs.articlesOfIncorporation) required.push('Articles of Incorporation');
    if (!docs.taxIdVerification) required.push('IRS Tax ID Verification (SS-4 or CP-575)');
    if (!docs.beneficialOwnershipCertification) required.push('Beneficial Ownership Certification');
    if (!docs.businessLicense) required.push('Business License');
    if (!docs.bankStatements) required.push('Recent Bank Statements (3 months)');
    
    return required;
  }

  // Generate SAR (Suspicious Activity Report) if needed
  async generateSAR(alert: SuspiciousActivityAlert): Promise<string> {
    // Generate SAR filing
    const sarNumber = `SAR-${Date.now()}`;
    
    // This would integrate with FinCEN BSA E-Filing system
    console.log(`SAR ${sarNumber} generated for suspicious activity: ${alert.description}`);
    
    return sarNumber;
  }

  // Transaction monitoring for BSA compliance
  async monitorTransaction(transaction: any): Promise<SuspiciousActivityAlert[]> {
    const alerts: SuspiciousActivityAlert[] = [];
    
    // Check for structuring (multiple transactions under $10k)
    if (transaction.amount > 9000 && transaction.amount < 10000) {
      alerts.push({
        id: `ALERT-${Date.now()}`,
        accountId: transaction.accountId,
        transactionId: transaction.id,
        alertType: 'structuring',
        severity: 'medium',
        description: 'Transaction amount suggests potential structuring',
        dateGenerated: new Date(),
        status: 'new',
        investigationNotes: []
      });
    }
    
    // Check for large cash transactions (>$10k reporting requirement)
    if (transaction.amount >= 10000 && transaction.type === 'cash') {
      alerts.push({
        id: `ALERT-${Date.now()}`,
        accountId: transaction.accountId,
        transactionId: transaction.id,
        alertType: 'unusual_activity',
        severity: 'high',
        description: 'Large cash transaction requiring CTR filing',
        dateGenerated: new Date(),
        status: 'new',
        investigationNotes: ['CTR filing required within 15 days']
      });
    }
    
    return alerts;
  }
}

export const kycComplianceService = new KYCComplianceService();