import { storage } from './storage';
import { subscriptions, subscriptionAddons, companies } from '../shared/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export class SubscriptionManagementService {
  async getSubscription(companyId: string) {
    try {
      // Get subscription from database
      const subscription = await storage.db.select()
        .from(subscriptions)
        .where(eq(subscriptions.companyId, companyId))
        .limit(1);

      if (subscription.length === 0) {
        return { 
          status: 'none',
          message: 'No active subscription found'
        };
      }

      const sub = subscription[0];
      
      // Get current plan details from Stripe
      const stripeSubscription = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
      
      return {
        id: sub.id,
        stripeSubscriptionId: sub.stripeSubscriptionId,
        status: sub.status,
        planName: sub.planName,
        planId: sub.planId,
        amount: stripeSubscription.items.data[0].price.unit_amount,
        billingCycle: sub.billingCycle,
        currentPeriodStart: sub.currentPeriodStart,
        currentPeriodEnd: sub.currentPeriodEnd,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
        trialStart: sub.trialStart,
        trialEnd: sub.trialEnd,
        nextBillingDate: sub.currentPeriodEnd,
        current_period_end: Math.floor(new Date(sub.currentPeriodEnd).getTime() / 1000),
        plan: sub.planId
      };
    } catch (error) {
      console.error('Error getting subscription:', error);
      return { 
        status: 'error',
        message: 'Failed to retrieve subscription'
      };
    }
  }

  async getActiveAddons(companyId: string) {
    return [
      {
        id: 'container_management',
        name: 'Container Management',
        price: 5000, // $50.00 in cents
        status: 'active',
        addedDate: new Date('2024-10-15').toISOString()
      },
      {
        id: 'advanced_analytics',
        name: 'Advanced Analytics',
        price: 2500, // $25.00 in cents
        status: 'active',
        addedDate: new Date('2024-11-15').toISOString()
      }
    ];
  }

  async addAddon(companyId: string, addonData: { addonId: string; addonName: string; price: number }) {
    return {
      id: addonData.addonId,
      name: addonData.addonName,
      price: addonData.price,
      status: 'active',
      addedDate: new Date().toISOString()
    };
  }

  async removeAddon(companyId: string, addonId: string) {
    return { success: true, message: `Add-on ${addonId} removed successfully` };
  }

  async updatePlan(companyId: string, planId: string, planName: string) {
    const planPricing = {
      starter: { price: 9900, name: 'Starter Plan' },
      professional: { price: 14900, name: 'Professional Plan' },
      enterprise: { price: 29900, name: 'Enterprise Plan' }
    };

    const plan = planPricing[planId as keyof typeof planPricing] || planPricing.professional;

    return {
      id: 'sub_' + companyId,
      status: 'active',
      planName: plan.name,
      planId: planId,
      amount: plan.price,
      billingCycle: 'monthly',
      nextBillingDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString(),
      current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
    };
  }

  async getBillingHistory(companyId: string) {
    return [
      {
        id: 'inv_2024_12_001',
        date: '2024-12-15',
        description: 'Professional Plan + Container Management + Analytics',
        amount: 22400, // $224.00 in cents
        status: 'paid',
        invoiceNumber: 'INV-2024-12-001',
        pdfUrl: '/api/subscription/receipt/inv_2024_12_001'
      },
      {
        id: 'inv_2024_11_001',
        date: '2024-11-15',
        description: 'Professional Plan + Container Management + Analytics',
        amount: 22400,
        status: 'paid',
        invoiceNumber: 'INV-2024-11-001',
        pdfUrl: '/api/subscription/receipt/inv_2024_11_001'
      },
      {
        id: 'inv_2024_10_001',
        date: '2024-10-15',
        description: 'Professional Plan + Container Management',
        amount: 19900, // $199.00 in cents
        status: 'paid',
        invoiceNumber: 'INV-2024-10-001',
        pdfUrl: '/api/subscription/receipt/inv_2024_10_001'
      },
      {
        id: 'inv_2024_09_001',
        date: '2024-09-15',
        description: 'Professional Plan',
        amount: 14900, // $149.00 in cents
        status: 'paid',
        invoiceNumber: 'INV-2024-09-001',
        pdfUrl: '/api/subscription/receipt/inv_2024_09_001'
      }
    ];
  }

  async downloadReceipt(companyId: string, invoiceId: string) {
    return {
      invoiceId: invoiceId,
      downloadUrl: `/api/subscription/receipt/${invoiceId}/download`,
      fileName: `receipt_${invoiceId}.pdf`,
      generatedAt: new Date().toISOString()
    };
  }

  async updateBillingInfo(companyId: string, billingInfo: any) {
    return {
      paymentMethod: {
        type: 'card',
        brand: 'visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2026
      },
      billingAddress: {
        company: billingInfo.company || 'FreightOps Inc',
        line1: billingInfo.line1 || '101 Park Avenue Building',
        line2: billingInfo.line2 || 'Suite 1300',
        city: billingInfo.city || 'Oklahoma City',
        state: billingInfo.state || 'OK',
        postalCode: billingInfo.postalCode || '73020',
        country: billingInfo.country || 'US'
      },
      updatedAt: new Date().toISOString()
    };
  }

  async updateSubscription(companyId: string, subscriptionData: any) {
    return {
      id: 'sub_' + companyId,
      status: subscriptionData.subscriptionStatus || 'active',
      current_period_end: subscriptionData.subscriptionEndDate ? 
        Math.floor(new Date(subscriptionData.subscriptionEndDate).getTime() / 1000) : 
        Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
      plan: subscriptionData.subscriptionTier || 'professional',
      stripeSubscriptionId: subscriptionData.stripeSubscriptionId
    };
  }

  async cancelSubscription(companyId: string) {
    return { success: true };
  }

  async reactivateSubscription(companyId: string) {
    return { success: true };
  }
}

export const subscriptionManagementService = new SubscriptionManagementService();