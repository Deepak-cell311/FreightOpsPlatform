import { Router } from 'express';
import Stripe from 'stripe';
import { storage } from '../storage';
import { subscriptions, companies } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { SUBSCRIPTION_TIER_PRICING } from '../pricing-config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const router = Router();

// Create subscription checkout session
router.post('/create-subscription-checkout', async (req, res) => {
  try {
    const { planId, billingCycle = 'monthly', email, companyName } = req.body;
    
    if (!planId || !SUBSCRIPTION_TIER_PRICING[planId as keyof typeof SUBSCRIPTION_TIER_PRICING]) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }
    
    const planConfig = SUBSCRIPTION_TIER_PRICING[planId as keyof typeof SUBSCRIPTION_TIER_PRICING];
    const amount = billingCycle === 'yearly' ? planConfig.yearlyFee : planConfig.monthlyFee;
    
    // Create or get Stripe customer
    let customer;
    if (email) {
      const existingCustomers = await stripe.customers.list({ email });
      customer = existingCustomers.data[0] || await stripe.customers.create({
        email,
        name: companyName,
        metadata: { planId, companyName }
      });
    }
    
    // Create Stripe Price if needed
    const priceId = await createOrGetStripePrice(planId, amount, billingCycle);
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer?.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/subscription/cancel`,
      metadata: {
        planId,
        companyName: companyName || '',
        billingCycle
      },
      subscription_data: {
        trial_period_days: planConfig.trialDays,
        metadata: {
          planId,
          companyName: companyName || '',
          billingCycle
        }
      }
    });
    
    res.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error('Error creating subscription checkout:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Handle successful subscription creation
router.post('/handle-subscription-success', async (req, res) => {
  try {
    const { sessionId, companyId } = req.body;
    
    if (!sessionId || !companyId) {
      return res.status(400).json({ error: 'Missing session ID or company ID' });
    }
    
    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session.subscription) {
      return res.status(400).json({ error: 'No subscription found in session' });
    }
    
    // Get subscription details from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string);
    
    // Create subscription record in database
    const subscriptionData = {
      companyId,
      stripeSubscriptionId: stripeSubscription.id,
      stripeCustomerId: stripeSubscription.customer as string,
      planId: session.metadata?.planId || 'professional',
      planName: SUBSCRIPTION_TIER_PRICING[session.metadata?.planId as keyof typeof SUBSCRIPTION_TIER_PRICING]?.name || 'Professional Plan',
      status: stripeSubscription.status,
      billingCycle: session.metadata?.billingCycle || 'monthly',
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : null,
      trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
    };
    
    await storage.db.insert(subscriptions).values(subscriptionData);
    
    // Update company subscription status
    await storage.db.update(companies)
      .set({ 
        subscriptionStatus: 'active',
        subscriptionPlan: session.metadata?.planId || 'professional',
        stripeCustomerId: stripeSubscription.customer as string
      })
      .where(eq(companies.id, companyId));
    
    res.json({ 
      success: true,
      message: 'Subscription created successfully',
      subscription: subscriptionData
    });
  } catch (error) {
    console.error('Error handling subscription success:', error);
    res.status(500).json({ error: 'Failed to process subscription' });
  }
});

// Create or get Stripe price
async function createOrGetStripePrice(planId: string, amount: number, billingCycle: string) {
  const priceKey = `${planId}_${billingCycle}`;
  
  // Check if price already exists
  const existingPrices = await stripe.prices.list({
    lookup_keys: [priceKey]
  });
  
  if (existingPrices.data.length > 0) {
    return existingPrices.data[0].id;
  }
  
  // Create new price
  const price = await stripe.prices.create({
    unit_amount: amount * 100, // Convert to cents
    currency: 'usd',
    recurring: {
      interval: billingCycle === 'yearly' ? 'year' : 'month',
    },
    product_data: {
      name: `FreightOps ${SUBSCRIPTION_TIER_PRICING[planId as keyof typeof SUBSCRIPTION_TIER_PRICING]?.name}`,
      description: SUBSCRIPTION_TIER_PRICING[planId as keyof typeof SUBSCRIPTION_TIER_PRICING]?.description,
    },
    lookup_key: priceKey,
  });
  
  return price.id;
}

export default router;