import axios from "axios";

export interface CreditScore {
  score: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  lastUpdated: Date;
  source: 'experian' | 'equifax' | 'internal';
}

export interface CreditLimit {
  customerId: string;
  creditLimit: number;
  availableCredit: number;
  outstandingBalance: number;
  utilizationRate: number;
  lastReviewDate: Date;
}

export interface PaymentHistory {
  customerId: string;
  averageDaysToPayment: number;
  onTimePaymentRate: number;
  latePayments: number;
  totalInvoices: number;
  totalPaid: number;
  lastPaymentDate: Date;
}

export class CreditManagementService {
  private experianApiKey: string;
  private experianBaseURL = 'https://api.experian.com/businessinformation/businesses/v1';
  private equifaxApiKey: string;
  private equifaxBaseURL = 'https://api.sandbox.equifax.com/business/commercial-credit/v2';

  constructor() {
    this.experianApiKey = process.env.EXPERIAN_API_KEY || '';
    this.equifaxApiKey = process.env.EQUIFAX_API_KEY || '';
  }

  // Get credit score from Experian
  async getCreditScoreFromExperian(businessName: string, address: string, taxId?: string): Promise<CreditScore> {
    if (!this.experianApiKey) {
      throw new Error("Experian API key not configured");
    }

    try {
      const response = await axios.post(`${this.experianBaseURL}/search`, {
        name: businessName,
        address: {
          street: address,
        },
        taxId: taxId
      }, {
        headers: {
          'Authorization': `Bearer ${this.experianApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const businessInfo = response.data.results?.[0];
      if (!businessInfo) {
        throw new Error("Business not found in Experian database");
      }

      // Get detailed credit report
      const creditResponse = await axios.get(`${this.experianBaseURL}/${businessInfo.bin}/scores`, {
        headers: {
          'Authorization': `Bearer ${this.experianApiKey}`
        }
      });

      const creditData = creditResponse.data;
      const score = creditData.commercialScore?.score || 0;
      
      return {
        score,
        riskLevel: this.mapScoreToRiskLevel(score),
        factors: creditData.riskFactors || [],
        lastUpdated: new Date(),
        source: 'experian'
      };
    } catch (error: any) {
      console.error("Experian API error:", error.response?.data || error.message);
      throw new Error(`Experian credit check failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get credit score from Equifax
  async getCreditScoreFromEquifax(businessName: string, address: string, taxId?: string): Promise<CreditScore> {
    if (!this.equifaxApiKey) {
      throw new Error("Equifax API key not configured");
    }

    try {
      const response = await axios.post(`${this.equifaxBaseURL}/credit-report`, {
        businessInformation: {
          businessName,
          address,
          taxIdentificationNumber: taxId
        }
      }, {
        headers: {
          'Authorization': `Bearer ${this.equifaxApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const creditData = response.data;
      const score = creditData.creditScore?.value || 0;
      
      return {
        score,
        riskLevel: this.mapScoreToRiskLevel(score),
        factors: creditData.riskIndicators || [],
        lastUpdated: new Date(),
        source: 'equifax'
      };
    } catch (error: any) {
      console.error("Equifax API error:", error.response?.data || error.message);
      throw new Error(`Equifax credit check failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get credit score with fallback
  async getCreditScore(businessName: string, address: string, taxId?: string): Promise<CreditScore> {
    try {
      // Try Experian first
      return await this.getCreditScoreFromExperian(businessName, address, taxId);
    } catch (error) {
      console.log("Experian failed, trying Equifax:", error.message);
      try {
        // Fallback to Equifax
        return await this.getCreditScoreFromEquifax(businessName, address, taxId);
      } catch (equifaxError) {
        console.log("Both credit services failed, using internal scoring");
        // Fallback to internal scoring
        return this.calculateInternalCreditScore(businessName);
      }
    }
  }

  // Calculate payment history metrics
  async calculatePaymentHistory(customerId: string, invoices: any[]): Promise<PaymentHistory> {
    const paidInvoices = invoices.filter(inv => inv.status === 'paid' && inv.paidDate);
    
    if (paidInvoices.length === 0) {
      return {
        customerId,
        averageDaysToPayment: 0,
        onTimePaymentRate: 0,
        latePayments: 0,
        totalInvoices: invoices.length,
        totalPaid: 0,
        lastPaymentDate: new Date()
      };
    }

    // Calculate average days to payment
    const daysToPay = paidInvoices.map(inv => {
      const issueDate = new Date(inv.issueDate);
      const paidDate = new Date(inv.paidDate);
      return Math.floor((paidDate.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
    });

    const averageDaysToPayment = daysToPay.reduce((sum, days) => sum + days, 0) / daysToPay.length;

    // Calculate on-time payment rate (assuming 30-day terms)
    const onTimePayments = paidInvoices.filter(inv => {
      const issueDate = new Date(inv.issueDate);
      const paidDate = new Date(inv.paidDate);
      const daysToPay = Math.floor((paidDate.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysToPay <= 30;
    }).length;

    const onTimePaymentRate = (onTimePayments / paidInvoices.length) * 100;
    const latePayments = paidInvoices.length - onTimePayments;
    
    const totalPaid = paidInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || '0'), 0);
    const lastPaymentDate = new Date(Math.max(...paidInvoices.map(inv => new Date(inv.paidDate).getTime())));

    return {
      customerId,
      averageDaysToPayment,
      onTimePaymentRate,
      latePayments,
      totalInvoices: invoices.length,
      totalPaid,
      lastPaymentDate
    };
  }

  // Calculate and set credit limit
  async calculateCreditLimit(customerId: string, creditScore: CreditScore, paymentHistory: PaymentHistory, monthlyRevenue: number): Promise<CreditLimit> {
    let baseCreditLimit = 0;

    // Base credit limit based on credit score
    if (creditScore.score >= 80) {
      baseCreditLimit = monthlyRevenue * 2; // 2 months revenue
    } else if (creditScore.score >= 60) {
      baseCreditLimit = monthlyRevenue * 1.5; // 1.5 months revenue
    } else if (creditScore.score >= 40) {
      baseCreditLimit = monthlyRevenue * 1; // 1 month revenue
    } else {
      baseCreditLimit = monthlyRevenue * 0.5; // 0.5 months revenue
    }

    // Adjust based on payment history
    if (paymentHistory.onTimePaymentRate >= 95) {
      baseCreditLimit *= 1.2; // 20% increase for excellent payment history
    } else if (paymentHistory.onTimePaymentRate >= 85) {
      baseCreditLimit *= 1.1; // 10% increase for good payment history
    } else if (paymentHistory.onTimePaymentRate < 70) {
      baseCreditLimit *= 0.8; // 20% decrease for poor payment history
    }

    // Apply risk level adjustments
    switch (creditScore.riskLevel) {
      case 'low':
        baseCreditLimit *= 1.1;
        break;
      case 'medium':
        // No adjustment
        break;
      case 'high':
        baseCreditLimit *= 0.7;
        break;
      case 'critical':
        baseCreditLimit *= 0.5;
        break;
    }

    // Round to nearest $100
    const creditLimit = Math.round(baseCreditLimit / 100) * 100;
    
    return {
      customerId,
      creditLimit,
      availableCredit: creditLimit - paymentHistory.totalPaid, // Simplified calculation
      outstandingBalance: paymentHistory.totalPaid,
      utilizationRate: paymentHistory.totalPaid > 0 ? (paymentHistory.totalPaid / creditLimit) * 100 : 0,
      lastReviewDate: new Date()
    };
  }

  // Check if customer is over credit limit
  async checkCreditLimitViolation(customerId: string, newInvoiceAmount: number, currentOutstanding: number, creditLimit: number): Promise<{
    isViolation: boolean;
    newUtilization: number;
    recommendedAction: string;
    alternativeOptions: string[];
  }> {
    const newTotal = currentOutstanding + newInvoiceAmount;
    const newUtilization = (newTotal / creditLimit) * 100;
    const isViolation = newTotal > creditLimit;

    let recommendedAction = "Approve invoice";
    const alternativeOptions: string[] = [];

    if (isViolation) {
      recommendedAction = "Reject invoice - credit limit exceeded";
      alternativeOptions.push(
        "Request payment on outstanding invoices",
        "Increase credit limit after review",
        "Require cash on delivery (COD)",
        "Split invoice into smaller amounts"
      );
    } else if (newUtilization > 80) {
      recommendedAction = "Approve with caution - high utilization";
      alternativeOptions.push(
        "Monitor closely for payments",
        "Consider requesting partial payment upfront"
      );
    }

    return {
      isViolation,
      newUtilization,
      recommendedAction,
      alternativeOptions
    };
  }

  // Generate credit alerts
  async generateCreditAlerts(companyId: string, customers: any[]): Promise<Array<{
    customerId: string;
    customerName: string;
    alertType: 'over_limit' | 'high_utilization' | 'late_payment' | 'score_decline';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    recommendedActions: string[];
  }>> {
    const alerts = [];

    for (const customer of customers) {
      // Check for over-limit customers
      if (customer.outstandingBalance > customer.creditLimit) {
        alerts.push({
          customerId: customer.id,
          customerName: customer.name,
          alertType: 'over_limit' as const,
          severity: 'critical' as const,
          message: `Customer is $${(customer.outstandingBalance - customer.creditLimit).toLocaleString()} over their credit limit`,
          recommendedActions: [
            'Suspend new credit sales',
            'Contact customer for immediate payment',
            'Consider collection agency'
          ]
        });
      }

      // Check for high utilization
      const utilization = (customer.outstandingBalance / customer.creditLimit) * 100;
      if (utilization > 85 && utilization <= 100) {
        alerts.push({
          customerId: customer.id,
          customerName: customer.name,
          alertType: 'high_utilization' as const,
          severity: 'high' as const,
          message: `Customer is using ${utilization.toFixed(1)}% of available credit`,
          recommendedActions: [
            'Monitor payment closely',
            'Consider requesting partial payments',
            'Review credit limit'
          ]
        });
      }

      // Check for late payments (simplified - would need actual payment data)
      if (customer.daysPastDue > 30) {
        alerts.push({
          customerId: customer.id,
          customerName: customer.name,
          alertType: 'late_payment' as const,
          severity: customer.daysPastDue > 60 ? 'critical' : 'high',
          message: `Payment is ${customer.daysPastDue} days past due`,
          recommendedActions: [
            'Send payment reminder',
            'Contact customer directly',
            'Consider payment plan'
          ]
        });
      }
    }

    return alerts;
  }

  // Internal credit scoring (fallback when external APIs fail)
  private calculateInternalCreditScore(businessName: string): CreditScore {
    // This would typically use historical payment data, business age, etc.
    // For now, return a conservative score
    const score = 65; // Conservative default score
    
    return {
      score,
      riskLevel: this.mapScoreToRiskLevel(score),
      factors: [
        'Limited credit history available',
        'Score based on internal payment patterns',
        'Recommend manual review for new customers'
      ],
      lastUpdated: new Date(),
      source: 'internal'
    };
  }

  // Map credit score to risk level
  private mapScoreToRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'high';
    return 'critical';
  }

  // Generate credit management report
  async generateCreditReport(companyId: string): Promise<{
    totalCreditExposure: number;
    averageUtilization: number;
    customersOverLimit: number;
    totalPastDue: number;
    riskDistribution: { [key: string]: number };
    recommendations: string[];
  }> {
    // This would fetch actual customer data from database
    // For now, return sample structure
    return {
      totalCreditExposure: 500000,
      averageUtilization: 67.5,
      customersOverLimit: 3,
      totalPastDue: 45000,
      riskDistribution: {
        'low': 45,
        'medium': 35,
        'high': 15,
        'critical': 5
      },
      recommendations: [
        'Review credit limits for high-risk customers',
        'Implement more frequent payment reminders',
        'Consider offering early payment discounts',
        'Tighten credit policies for new customers'
      ]
    };
  }
}

export const creditManagementService = new CreditManagementService();