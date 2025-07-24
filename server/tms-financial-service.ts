import { db } from "./db";
import { loads, invoices, transactions, walletAccounts, customers, bankTransfers } from "@shared/schema";
import { eq, and, desc, asc, sql, count, sum, avg, inArray, or, like, between } from "drizzle-orm";
import { nanoid } from "nanoid";

// Financial Integration for TMS Operations
export interface LoadPayment {
  id: string;
  loadId: number;
  invoiceId: number;
  companyId: string;
  customerId: number;
  amount: number;
  paymentMethod: 'ach' | 'wire' | 'check' | 'factoring' | 'quickpay';
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'disputed';
  paymentDate?: Date;
  expectedPaymentDate: Date;
  paymentReference: string;
  paymentSource: 'customer' | 'factoring_company' | 'quickpay_advance';
  
  // Factoring Integration
  factoringDetails?: {
    factoringCompanyId: string;
    factoringRate: number;
    advancePercentage: number;
    advanceAmount: number;
    reserveAmount: number;
    factoringFee: number;
    submittedAt: Date;
    approvedAt?: Date;
    fundedAt?: Date;
    verificationStatus: 'pending' | 'approved' | 'rejected' | 'additional_docs_required';
    rejectionReason?: string;
    documentsRequired: string[];
    documentsSubmitted: string[];
  };
  
  // Payment Terms
  paymentTerms: {
    net: number; // net_30, net_45, etc.
    discountPercent?: number;
    discountDays?: number;
    lateFeePolitics: {
      enabled: boolean;
      gracePeriod: number;
      feePercentage: number;
      maximumFee: number;
    };
  };
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface DepositMatching {
  id: string;
  companyId: string;
  depositId: string;
  depositAmount: number;
  depositDate: Date;
  bankReference: string;
  payerIdentification: string;
  
  // Matched Loads
  matchedLoads: {
    loadId: number;
    loadNumber: string;
    invoiceNumber: string;
    expectedAmount: number;
    matchedAmount: number;
    matchConfidence: 'high' | 'medium' | 'low';
    matchingCriteria: string[];
  }[];
  
  // Unmatched Amount
  unmatchedAmount: number;
  unmatchedReason?: string;
  requiresManualReview: boolean;
  
  // Status
  matchingStatus: 'auto_matched' | 'partially_matched' | 'manual_review' | 'completed';
  reviewedBy?: string;
  reviewedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface FactoringCompany {
  id: string;
  name: string;
  contactInfo: {
    primaryContact: string;
    phone: string;
    email: string;
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  
  // Terms and Rates
  factoringTerms: {
    advanceRate: number; // 80-95%
    factoringFee: number; // 1-5%
    reserveHoldDays: number;
    minimumVolume: number;
    creditCheckRequired: boolean;
    recourseType: 'recourse' | 'non_recourse';
  };
  
  // Integration
  integrationMethod: 'api' | 'portal' | 'email' | 'manual';
  apiCredentials?: {
    endpoint: string;
    apiKey: string;
    clientId: string;
  };
  
  // Approval Criteria
  approvalCriteria: {
    minimumLoadValue: number;
    maximumLoadValue: number;
    acceptedCustomerTypes: string[];
    restrictedCustomers: string[];
    geographicRestrictions: string[];
    commodityRestrictions: string[];
  };
  
  // Performance
  averageApprovalTime: number; // hours
  averageFundingTime: number; // hours
  approvalRate: number; // percentage
  
  isActive: boolean;
  contractStartDate: Date;
  contractEndDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FactoringSubmission {
  id: string;
  companyId: string;
  factoringCompanyId: string;
  loadId: number;
  invoiceId: number;
  submissionReference: string;
  
  // Submission Details
  loadDetails: {
    loadNumber: string;
    customerName: string;
    pickupDate: Date;
    deliveryDate: Date;
    commodity: string;
    weight: number;
    miles: number;
    ratePerMile: number;
    totalRevenue: number;
  };
  
  // Required Documents
  documents: {
    billOfLading: {
    status: 'missing' | 'submitted' | 'approved' | 'rejected';
      fileUrl?: string;
      rejectionReason?: string;
    };
    rateConfirmation: {
      status: 'missing' | 'submitted' | 'approved' | 'rejected';
      fileUrl?: string;
      rejectionReason?: string;
    };
    proofOfDelivery: {
      status: 'missing' | 'submitted' | 'approved' | 'rejected';
      fileUrl?: string;
      rejectionReason?: string;
    };
    invoice: {
      status: 'missing' | 'submitted' | 'approved' | 'rejected';
      fileUrl?: string;
      rejectionReason?: string;
    };
    additionalDocs: {
      name: string;
      status: 'missing' | 'submitted' | 'approved' | 'rejected';
      fileUrl?: string;
      rejectionReason?: string;
    }[];
  };
  
  // Approval Process
  submissionStatus: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'funded';
  creditCheckStatus: 'not_required' | 'pending' | 'approved' | 'rejected';
  approvalAmount: number;
  advanceAmount: number;
  reserveAmount: number;
  factoringFee: number;
  
  // Timeline
  submittedAt?: Date;
  reviewStartedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  fundedAt?: Date;
  expectedFundingDate?: Date;
  
  // Communication
  statusUpdates: {
    timestamp: Date;
    status: string;
    message: string;
    requiresAction: boolean;
    actionRequired?: string;
  }[];
  
  // Rejection Details
  rejectionReason?: string;
  rejectionCategory?: 'credit' | 'documentation' | 'customer' | 'load_details' | 'other';
  resubmissionAllowed: boolean;
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CashFlowForecast {
  companyId: string;
  forecastPeriod: {
    startDate: Date;
    endDate: Date;
  };
  
  // Expected Inflows
  expectedInflows: {
    customerPayments: {
      customerId: number;
      customerName: string;
      expectedAmount: number;
      expectedDate: Date;
      confidence: 'high' | 'medium' | 'low';
      paymentMethod: string;
      loadIds: number[];
    }[];
    factoringFunds: {
      factoringCompanyId: string;
      factoringCompanyName: string;
      expectedAmount: number;
      expectedDate: Date;
      submissionIds: string[];
    }[];
    otherInflows: {
      description: string;
      amount: number;
      expectedDate: Date;
    }[];
  };
  
  // Expected Outflows
  expectedOutflows: {
    driverPayments: {
      driverId: number;
      driverName: string;
      amount: number;
      paymentDate: Date;
      loadIds: number[];
    }[];
    fuelExpenses: {
      estimatedAmount: number;
      weeklyBreakdown: number[];
    };
    insurancePremiums: {
      amount: number;
      dueDate: Date;
      description: string;
    }[];
    loanPayments: {
      amount: number;
      dueDate: Date;
      lender: string;
    }[];
    otherExpenses: {
      description: string;
      amount: number;
      dueDate: Date;
    }[];
  };
  
  // Summary
  totalExpectedInflows: number;
  totalExpectedOutflows: number;
  netCashFlow: number;
  projectedBalance: number;
  cashFlowGap: number;
  recommendedActions: string[];
  
  generatedAt: Date;
  generatedBy: string;
}

export class TMSFinancialService {
  constructor() {}

  // Load Payment Management
  async createLoadPayment(companyId: string, paymentData: Partial<LoadPayment>): Promise<LoadPayment> {
    const payment: LoadPayment = {
      id: nanoid(),
      companyId,
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...paymentData
    } as LoadPayment;

    // Store payment record
    await this.storeLoadPayment(payment);
    
    // Update load status if payment is completed
    if (payment.paymentStatus === 'completed') {
      await this.updateLoadFinancialStatus(payment.loadId, 'paid');
    }
    
    return payment;
  }

  async processIncomingDeposit(companyId: string, depositData: any): Promise<DepositMatching> {
    // Create deposit matching record
    const matching: DepositMatching = {
      id: nanoid(),
      companyId,
      depositAmount: depositData.amount,
      depositDate: new Date(depositData.date),
      bankReference: depositData.reference,
      payerIdentification: depositData.payer,
      matchedLoads: [],
      unmatchedAmount: depositData.amount,
      requiresManualReview: false,
      matchingStatus: 'auto_matched',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Attempt automatic matching
    const matchResults = await this.attemptAutomaticMatching(companyId, depositData);
    
    matching.matchedLoads = matchResults.matches;
    matching.unmatchedAmount = depositData.amount - matchResults.totalMatched;
    matching.requiresManualReview = matchResults.requiresReview;
    matching.matchingStatus = matchResults.matches.length > 0 ? 
      (matching.unmatchedAmount > 0 ? 'partially_matched' : 'auto_matched') : 
      'manual_review';

    // Store matching record
    await this.storeDepositMatching(matching);
    
    // Update matched loads
    for (const match of matching.matchedLoads) {
      await this.updateLoadPaymentStatus(match.loadId, 'completed', {
        paymentAmount: match.matchedAmount,
        paymentDate: depositData.date,
        paymentReference: depositData.reference
      });
    }
    
    return matching;
  }

  // Factoring Integration
  async submitLoadToFactoring(
    companyId: string, 
    loadId: number, 
    factoringCompanyId: string,
    documents: any[]
  ): Promise<FactoringSubmission> {
    // Get load and invoice details
    const loadDetails = await this.getLoadForFactoring(loadId);
    const factoringCompany = await this.getFactoringCompany(factoringCompanyId);
    
    if (!this.validateLoadForFactoring(loadDetails, factoringCompany)) {
      throw new Error('Load does not meet factoring criteria');
    }

    const submission: FactoringSubmission = {
      id: nanoid(),
      companyId,
      factoringCompanyId,
      loadId,
      invoiceId: loadDetails.invoiceId,
      submissionReference: `FACT-${Date.now()}`,
      loadDetails: {
        loadNumber: loadDetails.loadNumber,
        customerName: loadDetails.customerName,
        pickupDate: loadDetails.pickupDate,
        deliveryDate: loadDetails.deliveryDate,
        commodity: loadDetails.commodity,
        weight: loadDetails.weight,
        miles: loadDetails.miles,
        ratePerMile: loadDetails.ratePerMile,
        totalRevenue: loadDetails.totalRevenue
      },
      documents: {
        billOfLading: { status: 'missing' },
        rateConfirmation: { status: 'missing' },
        proofOfDelivery: { status: 'missing' },
        invoice: { status: 'missing' },
        additionalDocs: []
      },
      submissionStatus: 'draft',
      creditCheckStatus: factoringCompany.factoringTerms.creditCheckRequired ? 'pending' : 'not_required',
      approvalAmount: 0,
      advanceAmount: 0,
      reserveAmount: 0,
      factoringFee: 0,
      statusUpdates: [],
      resubmissionAllowed: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    };

    // Process and validate documents
    await this.processFactoringDocuments(submission, documents);
    
    // Submit to factoring company
    if (factoringCompany.integrationMethod === 'api') {
      await this.submitViaAPI(submission, factoringCompany);
    } else {
      await this.submitViaPortal(submission, factoringCompany);
    }
    
    // Store submission
    await this.storeFactoringSubmission(submission);
    
    // Update load status
    await this.updateLoadFinancialStatus(loadId, 'submitted_for_factoring');
    
    return submission;
  }

  async checkFactoringStatus(submissionId: string): Promise<FactoringSubmission> {
    const submission = await this.getFactoringSubmission(submissionId);
    const factoringCompany = await this.getFactoringCompany(submission.factoringCompanyId);
    
    if (factoringCompany.integrationMethod === 'api') {
      // Poll API for status update
      const statusUpdate = await this.pollFactoringAPI(submission, factoringCompany);
      
      if (statusUpdate.statusChanged) {
        submission.submissionStatus = statusUpdate.newStatus;
        submission.statusUpdates.push({
          timestamp: new Date(),
          status: statusUpdate.newStatus,
          message: statusUpdate.message,
          requiresAction: statusUpdate.requiresAction,
          actionRequired: statusUpdate.actionRequired
        });
        
        // Handle status-specific updates
        await this.handleFactoringStatusUpdate(submission, statusUpdate);
        
        // Store updated submission
        await this.updateFactoringSubmission(submission);
      }
    }
    
    return submission;
  }

  // Cash Flow Management
  async generateCashFlowForecast(companyId: string, forecastDays: number = 30): Promise<CashFlowForecast> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + forecastDays);

    // Get expected customer payments
    const expectedCustomerPayments = await this.getExpectedCustomerPayments(companyId, startDate, endDate);
    
    // Get expected factoring funds
    const expectedFactoringFunds = await this.getExpectedFactoringFunds(companyId, startDate, endDate);
    
    // Get expected outflows
    const expectedOutflows = await this.getExpectedOutflows(companyId, startDate, endDate);
    
    // Calculate totals
    const totalInflows = expectedCustomerPayments.reduce((sum, p) => sum + p.expectedAmount, 0) +
                        expectedFactoringFunds.reduce((sum, f) => sum + f.expectedAmount, 0);
    
    const totalOutflows = expectedOutflows.driverPayments.reduce((sum, p) => sum + p.amount, 0) +
                         expectedOutflows.fuelExpenses.estimatedAmount +
                         expectedOutflows.insurancePremiums.reduce((sum, i) => sum + i.amount, 0) +
                         expectedOutflows.loanPayments.reduce((sum, l) => sum + l.amount, 0);
    
    const currentBalance = await this.getCurrentBalance(companyId);
    const projectedBalance = currentBalance + totalInflows - totalOutflows;
    
    const forecast: CashFlowForecast = {
      companyId,
      forecastPeriod: { startDate, endDate },
      expectedInflows: {
        customerPayments: expectedCustomerPayments,
        factoringFunds: expectedFactoringFunds,
        otherInflows: []
      },
      expectedOutflows,
      totalExpectedInflows: totalInflows,
      totalExpectedOutflows: totalOutflows,
      netCashFlow: totalInflows - totalOutflows,
      projectedBalance,
      cashFlowGap: projectedBalance < 0 ? Math.abs(projectedBalance) : 0,
      recommendedActions: this.generateCashFlowRecommendations(totalInflows, totalOutflows, projectedBalance),
      generatedAt: new Date(),
      generatedBy: 'system'
    };
    
    return forecast;
  }

  // Private helper methods
  private async attemptAutomaticMatching(companyId: string, depositData: any): Promise<any> {
    // Get pending invoices/loads for the company
    const pendingLoads = await this.getPendingPaymentLoads(companyId);
    const matches = [];
    let totalMatched = 0;
    let requiresReview = false;

    // Exact amount matching
    for (const load of pendingLoads) {
      if (Math.abs(load.invoiceAmount - depositData.amount) < 0.01) {
        matches.push({
          loadId: load.id,
          loadNumber: load.loadNumber,
          invoiceNumber: load.invoiceNumber,
          expectedAmount: load.invoiceAmount,
          matchedAmount: depositData.amount,
          matchConfidence: 'high',
          matchingCriteria: ['exact_amount_match']
        });
        totalMatched = depositData.amount;
        break;
      }
    }

    // Multi-load matching if no exact match
    if (matches.length === 0) {
      const combinationMatches = this.findLoadCombinations(pendingLoads, depositData.amount);
      if (combinationMatches.length > 0) {
        matches.push(...combinationMatches);
        totalMatched = combinationMatches.reduce((sum, m) => sum + m.matchedAmount, 0);
        requiresReview = combinationMatches.length > 3; // Review if too many loads
      }
    }

    // Customer name matching for partial matches
    if (totalMatched < depositData.amount * 0.9) {
      requiresReview = true;
    }

    return { matches, totalMatched, requiresReview };
  }

  private findLoadCombinations(loads: any[], targetAmount: number): any[] {
    // Implementation for finding combinations of loads that sum to target amount
    const combinations = [];
    const tolerance = targetAmount * 0.02; // 2% tolerance
    
    // Try combinations of 2-4 loads
    for (let i = 0; i < loads.length; i++) {
      for (let j = i + 1; j < loads.length; j++) {
        const twoLoadSum = loads[i].invoiceAmount + loads[j].invoiceAmount;
        if (Math.abs(twoLoadSum - targetAmount) <= tolerance) {
          combinations.push(
            {
              loadId: loads[i].id,
              loadNumber: loads[i].loadNumber,
              invoiceNumber: loads[i].invoiceNumber,
              expectedAmount: loads[i].invoiceAmount,
              matchedAmount: loads[i].invoiceAmount,
              matchConfidence: 'high',
              matchingCriteria: ['multi_load_combination']
            },
            {
              loadId: loads[j].id,
              loadNumber: loads[j].loadNumber,
              invoiceNumber: loads[j].invoiceNumber,
              expectedAmount: loads[j].invoiceAmount,
              matchedAmount: loads[j].invoiceAmount,
              matchConfidence: 'high',
              matchingCriteria: ['multi_load_combination']
            }
          );
          return combinations;
        }
      }
    }
    
    return combinations;
  }

  private validateLoadForFactoring(loadDetails: any, factoringCompany: FactoringCompany): boolean {
    const criteria = factoringCompany.approvalCriteria;
    
    // Check load value limits
    if (loadDetails.totalRevenue < criteria.minimumLoadValue || 
        loadDetails.totalRevenue > criteria.maximumLoadValue) {
      return false;
    }
    
    // Check customer restrictions
    if (criteria.restrictedCustomers.includes(loadDetails.customerId)) {
      return false;
    }
    
    // Check geographic restrictions
    if (criteria.geographicRestrictions.length > 0) {
      const hasRestrictedLocation = criteria.geographicRestrictions.some(restriction =>
        loadDetails.pickupState === restriction || loadDetails.deliveryState === restriction
      );
      if (hasRestrictedLocation) return false;
    }
    
    // Check commodity restrictions
    if (criteria.commodityRestrictions.includes(loadDetails.commodity)) {
      return false;
    }
    
    return true;
  }

  private generateCashFlowRecommendations(inflows: number, outflows: number, projectedBalance: number): string[] {
    const recommendations = [];
    
    if (projectedBalance < 0) {
      recommendations.push('Consider factoring additional loads to improve cash flow');
      recommendations.push('Review payment terms with customers to accelerate collections');
      recommendations.push('Evaluate delaying non-critical expenses');
    }
    
    if (inflows < outflows * 1.2) {
      recommendations.push('Monitor cash flow closely - operating with thin margins');
      recommendations.push('Consider negotiating extended payment terms with vendors');
    }
    
    if (projectedBalance > outflows * 2) {
      recommendations.push('Consider investing excess cash in growth opportunities');
      recommendations.push('Evaluate early payment discounts from vendors');
    }
    
    return recommendations;
  }

  // Database operations (placeholder implementations)
  private async storeLoadPayment(payment: LoadPayment): Promise<void> {
    // Implementation for storing load payment
  }

  private async storeDepositMatching(matching: DepositMatching): Promise<void> {
    // Implementation for storing deposit matching
  }

  private async updateLoadFinancialStatus(loadId: number, status: string): Promise<void> {
    // Implementation for updating load financial status
  }

  private async updateLoadPaymentStatus(loadId: number, status: string, details: any): Promise<void> {
    // Implementation for updating load payment status
  }

  private async getLoadForFactoring(loadId: number): Promise<any> {
    // Implementation for getting load details for factoring
    return {};
  }

  private async getFactoringCompany(factoringCompanyId: string): Promise<FactoringCompany> {
    // Implementation for getting factoring company details
    return {} as FactoringCompany;
  }

  private async processFactoringDocuments(submission: FactoringSubmission, documents: any[]): Promise<void> {
    // Implementation for processing factoring documents
  }

  private async submitViaAPI(submission: FactoringSubmission, factoringCompany: FactoringCompany): Promise<void> {
    // Implementation for API submission to factoring company
  }

  private async submitViaPortal(submission: FactoringSubmission, factoringCompany: FactoringCompany): Promise<void> {
    // Implementation for portal submission to factoring company
  }

  private async storeFactoringSubmission(submission: FactoringSubmission): Promise<void> {
    // Implementation for storing factoring submission
  }

  private async getFactoringSubmission(submissionId: string): Promise<FactoringSubmission> {
    // Implementation for getting factoring submission
    return {} as FactoringSubmission;
  }

  private async pollFactoringAPI(submission: FactoringSubmission, factoringCompany: FactoringCompany): Promise<any> {
    // Implementation for polling factoring API
    return {};
  }

  private async handleFactoringStatusUpdate(submission: FactoringSubmission, statusUpdate: any): Promise<void> {
    // Implementation for handling factoring status updates
  }

  private async updateFactoringSubmission(submission: FactoringSubmission): Promise<void> {
    // Implementation for updating factoring submission
  }

  private async getPendingPaymentLoads(companyId: string): Promise<any[]> {
    // Implementation for getting loads pending payment
    return [];
  }

  private async getExpectedCustomerPayments(companyId: string, startDate: Date, endDate: Date): Promise<any[]> {
    // Implementation for getting expected customer payments
    return [];
  }

  private async getExpectedFactoringFunds(companyId: string, startDate: Date, endDate: Date): Promise<any[]> {
    // Implementation for getting expected factoring funds
    return [];
  }

  private async getExpectedOutflows(companyId: string, startDate: Date, endDate: Date): Promise<any> {
    // Implementation for getting expected outflows
    return {
      driverPayments: [],
      fuelExpenses: { estimatedAmount: 0, weeklyBreakdown: [] },
      insurancePremiums: [],
      loanPayments: []
    };
  }

  private async getCurrentBalance(companyId: string): Promise<number> {
    // Implementation for getting current balance
    return 0;
  }
}

export const tmsFinancialService = new TMSFinancialService();