import { storage } from "./storage";
import { SUBSCRIPTION_TIER_PRICING } from "./pricing-config";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

interface UsageCalculation {
  companyId: string;
  currentUsers: number;
  includedUsers: number;
  extraUsers: number;
  extraUserFee: number;
  totalOverageFee: number;
  tier: string;
}

export class OverageBillingService {
  
  async calculateUsageForAllCompanies(): Promise<UsageCalculation[]> {
    const companies = await storage.getAllActiveCompanies();
    const calculations: UsageCalculation[] = [];

    for (const company of companies) {
      if (company.subscriptionTier && company.subscriptionTier !== 'enterprise') {
        const calculation = await this.calculateCompanyUsage(company.id);
        if (calculation.extraUsers > 0) {
          calculations.push(calculation);
        }
      }
    }

    return calculations;
  }

  async calculateCompanyUsage(companyId: string): Promise<UsageCalculation> {
    const company = await storage.getCompany(companyId);
    if (!company) {
      throw new Error(`Company not found: ${companyId}`);
    }

    const currentUsers = await storage.getActiveUserCount(companyId);
    const tierConfig = SUBSCRIPTION_TIER_PRICING[company.subscriptionTier as keyof typeof SUBSCRIPTION_TIER_PRICING];
    
    const includedUsers = tierConfig.includedUsers as number;
    const extraUserFee = tierConfig.extraUserFee as number || 0;
    const extraUsers = Math.max(0, currentUsers - includedUsers);
    const totalOverageFee = extraUsers * extraUserFee;

    return {
      companyId,
      currentUsers,
      includedUsers,
      extraUsers,
      extraUserFee,
      totalOverageFee,
      tier: company.subscriptionTier || 'starter'
    };
  }

  async addOverageToNextBilling(calculation: UsageCalculation): Promise<void> {
    if (calculation.totalOverageFee <= 0) return;

    const company = await storage.getCompany(calculation.companyId);
    if (!company?.stripeCustomerId) {
      console.error(`No Stripe customer ID for company: ${calculation.companyId}`);
      return;
    }

    try {
      // Add overage charges to be billed with next subscription cycle
      await stripe.invoiceItems.create({
        customer: company.stripeCustomerId,
        amount: Math.round(calculation.totalOverageFee * 100), // Convert to cents
        currency: 'usd',
        description: `${calculation.extraUsers} additional users @ $${calculation.extraUserFee}/user`,
        metadata: {
          type: 'user_overage',
          companyId: calculation.companyId,
          extraUsers: calculation.extraUsers.toString(),
          extraUserFee: calculation.extraUserFee.toString(),
          billingPeriod: new Date().toISOString().slice(0, 7) // YYYY-MM format
        }
      });

      // Record overage billing in database
      await storage.recordOverageBilling({
        companyId: calculation.companyId,
        billingPeriod: new Date().toISOString().slice(0, 7),
        extraUsers: calculation.extraUsers,
        amountCharged: calculation.totalOverageFee.toString(),
        stripeInvoiceId: '', // Will be set when subscription invoice is created
        status: 'pending'
      });

      console.log(`Overage charges added to next billing cycle for company ${calculation.companyId}: $${calculation.totalOverageFee}`);
    } catch (error) {
      console.error(`Failed to add overage charges for company ${calculation.companyId}:`, error);
      throw error;
    }
  }

  async processMonthlyOverages(): Promise<void> {
    console.log('Starting monthly overage billing process...');
    
    try {
      const usageCalculations = await this.calculateUsageForAllCompanies();
      
      console.log(`Found ${usageCalculations.length} companies with overage charges`);
      
      for (const calculation of usageCalculations) {
        try {
          await this.processOverageInvoice(calculation);
        } catch (error) {
          console.error(`Failed to process overage for company ${calculation.companyId}:`, error);
          // Continue processing other companies
        }
      }
      
      console.log('Monthly overage billing process completed');
    } catch (error) {
      console.error('Monthly overage billing process failed:', error);
      throw error;
    }
  }

  async getCompanyUsageStatus(companyId: string): Promise<{
    currentUsers: number;
    includedUsers: number;
    extraUsers: number;
    monthlyOverageCost: number;
    tier: string;
    isOverLimit: boolean;
  }> {
    const calculation = await this.calculateCompanyUsage(companyId);
    
    return {
      currentUsers: calculation.currentUsers,
      includedUsers: calculation.includedUsers,
      extraUsers: calculation.extraUsers,
      monthlyOverageCost: calculation.totalOverageFee,
      tier: calculation.tier,
      isOverLimit: calculation.extraUsers > 0
    };
  }

  async checkUserLimitBeforeAdding(companyId: string): Promise<{
    canAddUser: boolean;
    currentUsers: number;
    limit: number;
    wouldCauseOverage: boolean;
    additionalCost: number;
  }> {
    const company = await storage.getCompany(companyId);
    if (!company) {
      throw new Error(`Company not found: ${companyId}`);
    }

    const currentUsers = await storage.getActiveUserCount(companyId);
    const tierConfig = SUBSCRIPTION_TIER_PRICING[company.subscriptionTier as keyof typeof SUBSCRIPTION_TIER_PRICING];
    
    // For starter tier, hard limit (no overage allowed)
    if (company.subscriptionTier === 'starter') {
      return {
        canAddUser: currentUsers < (tierConfig.includedUsers as number),
        currentUsers,
        limit: tierConfig.includedUsers as number,
        wouldCauseOverage: false,
        additionalCost: 0
      };
    }

    // For professional tier, allow overage with fee
    const wouldCauseOverage = currentUsers >= (tierConfig.includedUsers as number);
    const additionalCost = wouldCauseOverage ? (tierConfig.extraUserFee as number) : 0;

    return {
      canAddUser: true,
      currentUsers,
      limit: tierConfig.includedUsers as number,
      wouldCauseOverage,
      additionalCost
    };
  }

  async processOverageInvoice(calculation: UsageCalculation): Promise<void> {
    // Record the overage billing in our database
    await storage.recordOverageBilling({
      companyId: calculation.companyId,
      billingPeriod: new Date().toISOString().slice(0, 7), // YYYY-MM format
      extraUsers: calculation.extraUsers,
      amountCharged: calculation.totalOverageFee.toString(),
      status: 'pending'
    });

    console.log(`Created overage invoice for company ${calculation.companyId}: $${calculation.totalOverageFee}`);
  }
}

export const overageBillingService = new OverageBillingService();