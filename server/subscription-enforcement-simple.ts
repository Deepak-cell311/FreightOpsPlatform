import { storage } from './storage';
import { SUBSCRIPTION_TIER_PRICING } from './pricing-config';

export class SubscriptionEnforcementService {
  
  async validateDriverLimit(companyId: string, requestedDriverCount: number = 1): Promise<{ allowed: boolean; message?: string; currentCount: number; limit: number }> {
    try {
      // Get company subscription
      const company = await storage.getCompany(companyId);
      if (!company) {
        return { allowed: false, message: 'Company not found', currentCount: 0, limit: 0 };
      }
      
      // Get current driver count
      const driverList = await storage.getDrivers(companyId);
      const currentCount = driverList.length;
      
      // Get subscription plan limits
      const planId = company.subscriptionPlan || 'starter';
      const planConfig = SUBSCRIPTION_TIER_PRICING[planId as keyof typeof SUBSCRIPTION_TIER_PRICING];
      
      if (!planConfig) {
        return { allowed: false, message: 'Invalid subscription plan', currentCount, limit: 0 };
      }
      
      const driverLimit = planConfig.includedDrivers;
      const totalAfterRequest = currentCount + requestedDriverCount;
      
      if (totalAfterRequest > driverLimit) {
        const extraDrivers = totalAfterRequest - driverLimit;
        const extraCost = extraDrivers * planConfig.extraDriverFee;
        
        return {
          allowed: false,
          message: `Driver limit exceeded. You have ${currentCount} drivers, limit is ${driverLimit}. Adding ${requestedDriverCount} more would require ${extraDrivers} extra driver(s) at $${planConfig.extraDriverFee}/month each (additional $${extraCost}/month).`,
          currentCount,
          limit: driverLimit
        };
      }
      
      return {
        allowed: true,
        currentCount,
        limit: driverLimit
      };
      
    } catch (error) {
      console.error('Error validating driver limit:', error);
      return { allowed: false, message: 'Error validating subscription limits', currentCount: 0, limit: 0 };
    }
  }
  
  async calculateOverageCharges(companyId: string): Promise<{ extraDrivers: number; monthlyCost: number; planName: string }> {
    try {
      const company = await storage.getCompany(companyId);
      if (!company) {
        return { extraDrivers: 0, monthlyCost: 0, planName: 'Unknown' };
      }
      
      const driverList = await storage.getDrivers(companyId);
      const currentCount = driverList.length;
      
      const planId = company.subscriptionPlan || 'starter';
      const planConfig = SUBSCRIPTION_TIER_PRICING[planId as keyof typeof SUBSCRIPTION_TIER_PRICING];
      
      if (!planConfig) {
        return { extraDrivers: 0, monthlyCost: 0, planName: 'Unknown' };
      }
      
      const extraDrivers = Math.max(0, currentCount - planConfig.includedDrivers);
      const monthlyCost = extraDrivers * planConfig.extraDriverFee;
      
      return {
        extraDrivers,
        monthlyCost,
        planName: planConfig.name
      };
      
    } catch (error) {
      console.error('Error calculating overage charges:', error);
      return { extraDrivers: 0, monthlyCost: 0, planName: 'Unknown' };
    }
  }
  
  async getSubscriptionStatus(companyId: string): Promise<{
    planId: string;
    planName: string;
    currentDrivers: number;
    includedDrivers: number;
    extraDrivers: number;
    baseCost: number;
    extraCost: number;
    totalCost: number;
    upgradeRecommended: boolean;
    trialStatus: {
      isTrialActive: boolean;
      trialDaysLeft: number;
      trialEndDate: Date | null;
    };
  }> {
    try {
      const company = await storage.getCompany(companyId);
      if (!company) {
        throw new Error('Company not found');
      }
      
      // Get current driver count
      const driverList = await storage.getDrivers(companyId);
      const currentCount = driverList.length;
      
      const planId = company.subscriptionPlan || 'starter';
      const planConfig = SUBSCRIPTION_TIER_PRICING[planId as keyof typeof SUBSCRIPTION_TIER_PRICING];
      
      if (!planConfig) {
        throw new Error('Invalid subscription plan');
      }
      
      const extraDrivers = Math.max(0, currentCount - planConfig.includedDrivers);
      const extraCost = extraDrivers * planConfig.extraDriverFee;
      const totalCost = planConfig.monthlyFee + extraCost;
      
      // Check if upgrade would be more cost effective
      let upgradeRecommended = false;
      if (planId === 'starter' && currentCount > 10) {
        const proPlan = SUBSCRIPTION_TIER_PRICING.pro;
        const proExtraDrivers = Math.max(0, currentCount - proPlan.includedDrivers);
        const proTotalCost = proPlan.monthlyFee + (proExtraDrivers * proPlan.extraDriverFee);
        upgradeRecommended = proTotalCost < totalCost;
      }
      
      // Check trial status
      const trialStatus = await this.getTrialStatus(companyId);
      
      return {
        planId,
        planName: planConfig.name,
        currentDrivers: currentCount,
        includedDrivers: planConfig.includedDrivers,
        extraDrivers,
        baseCost: planConfig.monthlyFee,
        extraCost,
        totalCost,
        upgradeRecommended,
        trialStatus
      };
      
    } catch (error) {
      console.error('Error getting subscription status:', error);
      throw error;
    }
  }
  
  async getTrialStatus(companyId: string): Promise<{
    isTrialActive: boolean;
    trialDaysLeft: number;
    trialEndDate: Date | null;
  }> {
    try {
      const company = await storage.getCompany(companyId);
      if (!company) {
        return { isTrialActive: false, trialDaysLeft: 0, trialEndDate: null };
      }
      
      // Check if company has trial end date
      const trialEndDate = company.trialEndDate ? new Date(company.trialEndDate) : null;
      
      if (!trialEndDate) {
        // No trial configured, assume trial is active for 30 days from registration
        const registrationDate = new Date(company.createdAt);
        const defaultTrialEnd = new Date(registrationDate);
        defaultTrialEnd.setDate(defaultTrialEnd.getDate() + 30);
        
        const now = new Date();
        const isTrialActive = now < defaultTrialEnd;
        const trialDaysLeft = isTrialActive ? 
          Math.ceil((defaultTrialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
        
        return {
          isTrialActive,
          trialDaysLeft,
          trialEndDate: defaultTrialEnd
        };
      }
      
      const now = new Date();
      const isTrialActive = now < trialEndDate;
      const trialDaysLeft = isTrialActive ? 
        Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      return {
        isTrialActive,
        trialDaysLeft,
        trialEndDate
      };
      
    } catch (error) {
      console.error('Error getting trial status:', error);
      return { isTrialActive: false, trialDaysLeft: 0, trialEndDate: null };
    }
  }
}

export const subscriptionEnforcement = new SubscriptionEnforcementService();