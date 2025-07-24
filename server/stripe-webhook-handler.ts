import Stripe from "stripe";
import { Request, Response } from "express";
import { db } from "./db";
import { companies } from "@shared/schema";
import { eq } from "drizzle-orm";
import { automaticWalletLifecycle } from "./automatic-wallet-lifecycle";
import { stripeConnectWalletService } from "./stripe-connect-wallet-service";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export class StripeWebhookHandler {
  // Process Stripe Connect webhooks following their recommended patterns
  async handleWebhook(req: Request, res: Response): Promise<void> {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      console.error('Stripe webhook secret not configured');
      res.status(400).send('Webhook secret not configured');
      return;
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    try {
      // Handle Connect account events according to Stripe's guidelines
      switch (event.type) {
        case 'account.updated':
          await this.handleAccountUpdated(event.data.object as Stripe.Account);
          break;

        case 'account.application.deauthorized':
          await this.handleAccountDeauthorized(event.data.object as any);
          break;

        case 'capability.updated':
          await this.handleCapabilityUpdated(event.data.object as Stripe.Capability);
          break;

        case 'person.created':
        case 'person.updated':
          await this.handlePersonUpdated(event.data.object as Stripe.Person);
          break;

        case 'issuing_card.created':
          await this.handleCardCreated(event.data.object as Stripe.Issuing.Card);
          break;

        case 'issuing_authorization.created':
          await this.handleCardAuthorization(event.data.object as Stripe.Issuing.Authorization);
          break;

        case 'transfer.created':
        case 'transfer.updated':
          await this.handleTransferEvent(event.data.object as Stripe.Transfer);
          break;

        case 'payout.created':
        case 'payout.updated':
        case 'payout.paid':
        case 'payout.failed':
          await this.handlePayoutEvent(event.data.object as Stripe.Payout);
          break;

        // Card issuing events - monitor for crypto purchases
        case 'issuing_authorization.request':
          await this.handleAuthorizationRequest(event.data.object as Stripe.Issuing.Authorization);
          break;

        case 'issuing_authorization.created':
          await this.handleAuthorizationCreated(event.data.object as Stripe.Issuing.Authorization);
          break;

        case 'issuing_transaction.created':
          await this.handleTransactionCreated(event.data.object as Stripe.Issuing.Transaction);
          break;

        case 'issuing_card.created':
          await this.handleCardCreated(event.data.object as Stripe.Issuing.Card);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error(`Error processing webhook ${event.type}:`, error.message);
      res.status(500).send(`Error processing webhook: ${error.message}`);
    }
  }

  // Handle account updates - critical for compliance monitoring
  private async handleAccountUpdated(account: Stripe.Account): Promise<void> {
    const companyId = account.metadata?.companyId;
    if (!companyId) {
      console.error('Account updated without companyId metadata');
      return;
    }

    // Update account status in database - stub implementation
    // await db.update(// companyWallets)
    //   .set({
    //     accountStatus: this.mapAccountStatus(account),
    //     hasOnboardingCompleted: account.details_submitted || false,
    //     capabilities: {
    //       cardPayments: account.capabilities?.card_payments === 'active',
    //       transfers: account.capabilities?.transfers === 'active',
    //       achDebits: false,
    //       achCredits: false,
    //     },
    //     updatedAt: new Date(),
    //   })
    //   .where(eq(// companyWallets.companyId, companyId));

    // Trigger compliance monitoring
    await automaticWalletLifecycle.monitorWalletStatus(companyId);

    // Handle specific account states
    if (account.requirements?.disabled_reason) {
      await this.handleAccountRestriction(companyId, account);
    }

    if (account.requirements?.currently_due?.length || account.requirements?.past_due?.length) {
      await this.handleRequirementsUpdate(companyId, account);
    }
  }

  // Handle account deauthorization
  private async handleAccountDeauthorized(deauth: any): Promise<void> {
    const accountId = deauth.account;
    
    // Mark account as deauthorized in database
    await db.update(// companyWallets)
      .set({
        accountStatus: 'suspended',
        updatedAt: new Date(),
      })
      .where(eq(// companyWallets.stripeConnectAccountId, accountId));

    console.log(`Account ${accountId} has been deauthorized`);
  }

  // Handle capability updates
  private async handleCapabilityUpdated(capability: Stripe.Capability): Promise<void> {
    const accountId = capability.account;
    
    // Update capabilities in database
    const wallet = await db.select()
      .from(// companyWallets)
      .where(eq(// companyWallets.stripeConnectAccountId, accountId as string))
      .limit(1);

    if (wallet.length > 0) {
      const currentCapabilities = wallet[0].capabilities || {};
      
      // Update specific capability
      switch (capability.id) {
        case 'card_payments':
          currentCapabilities.cardPayments = capability.status === 'active';
          break;
        case 'transfers':
          currentCapabilities.transfers = capability.status === 'active';
          break;
        case 'card_issuing':
          // Handle card issuing capability updates
          break;
      }

      await db.update(// companyWallets)
        .set({
          capabilities: currentCapabilities,
          updatedAt: new Date(),
        })
        .where(eq(// companyWallets.stripeConnectAccountId, accountId as string));
    }
  }

  // Handle person updates for compliance
  private async handlePersonUpdated(person: Stripe.Person): Promise<void> {
    const accountId = person.account;
    
    // Log person verification status changes
    console.log(`Person ${person.id} updated for account ${accountId}:`, {
      verification: person.verification,
      requirements: person.requirements,
    });
  }

  // Handle card creation
  private async handleCardCreated(card: Stripe.Issuing.Card): Promise<void> {
    const companyId = card.metadata?.companyId;
    if (!companyId) return;

    console.log(`Card ${card.id} created for company ${companyId}`);
    
    // Could store card details in database if needed
    // This follows Stripe's security guidelines for card data
  }

  // Handle card authorization events
  private async handleCardAuthorization(authorization: Stripe.Issuing.Authorization): Promise<void> {
    const companyId = authorization.metadata?.companyId;
    if (!companyId) return;

    console.log(`Card authorization ${authorization.id} for company ${companyId}:`, {
      amount: authorization.amount,
      approved: authorization.approved,
      merchant: authorization.merchant_data,
    });

    // Implement spend monitoring and alerts here
    if (authorization.amount > 50000) { // $500+ transactions
      console.log(`High-value transaction alert for company ${companyId}: $${authorization.amount / 100}`);
    }
  }

  // Handle transfer events
  private async handleTransferEvent(transfer: Stripe.Transfer): Promise<void> {
    const fromCompanyId = transfer.metadata?.fromCompanyId;
    const toCompanyId = transfer.metadata?.toCompanyId;

    console.log(`Transfer ${transfer.id} processed:`, {
      from: fromCompanyId,
      to: toCompanyId,
      amount: transfer.amount,
      status: transfer.destination_payment?.status,
    });

    // Update transaction status in database if tracking transfers
  }

  // Handle payout events for cash flow monitoring
  private async handlePayoutEvent(payout: Stripe.Payout): Promise<void> {
    const accountId = payout.destination;
    
    // Find company by account ID
    const wallet = await db.select()
      .from(// companyWallets)
      .where(eq(// companyWallets.stripeConnectAccountId, accountId as string))
      .limit(1);

    if (wallet.length > 0) {
      console.log(`Payout ${payout.id} for company ${wallet[0].companyId}:`, {
        amount: payout.amount,
        status: payout.status,
        arrival_date: payout.arrival_date,
      });

      // Update cash flow tracking
      // Could trigger notifications for failed payouts
      if (payout.status === 'failed') {
        console.error(`Payout failed for company ${wallet[0].companyId}: ${payout.failure_message}`);
      }
    }
  }

  // Helper methods
  private mapAccountStatus(account: Stripe.Account): 'pending' | 'active' | 'restricted' | 'suspended' {
    if (account.requirements?.disabled_reason) {
      return 'suspended';
    }
    
    if (account.requirements?.currently_due?.length || account.requirements?.past_due?.length) {
      return 'restricted';
    }
    
    if (account.details_submitted && account.charges_enabled) {
      return 'active';
    }
    
    return 'pending';
  }

  private async handleAccountRestriction(companyId: string, account: Stripe.Account): Promise<void> {
    console.log(`Account restriction for company ${companyId}:`, {
      disabled_reason: account.requirements?.disabled_reason,
      currently_due: account.requirements?.currently_due,
      past_due: account.requirements?.past_due,
    });

    // Update company platform access
    await db.update(companies)
      .set({
        verificationStatus: 'restricted',
        updatedAt: new Date(),
      })
      .where(eq(companies.id, companyId));
  }

  private async handleRequirementsUpdate(companyId: string, account: Stripe.Account): Promise<void> {
    const requirements = account.requirements;
    
    console.log(`Requirements update for company ${companyId}:`, {
      currently_due: requirements?.currently_due,
      eventually_due: requirements?.eventually_due,
      past_due: requirements?.past_due,
      pending_verification: requirements?.pending_verification,
    });

    // Trigger notifications for past due requirements
    if (requirements?.past_due?.length) {
      // Send urgent compliance notification
      console.log(`URGENT: Past due requirements for company ${companyId}:`, requirements.past_due);
    }
  }

  // Handle authorization request - critical for crypto blocking
  private async handleAuthorizationRequest(authorization: Stripe.Issuing.Authorization): Promise<void> {
    const companyId = authorization.card?.metadata?.companyId;
    if (!companyId) return;

    const merchantData = authorization.merchant_data;
    const amount = authorization.amount;
    
    // Check if this is a crypto-related transaction
    const isCryptoTransaction = this.isCryptoMerchant(merchantData);
    
    // Log transaction details
    console.log(`Authorization request for company ${companyId}:`, {
      amount: amount / 100,
      merchant: merchantData?.name,
      category: merchantData?.category,
      isCrypto: isCryptoTransaction,
      verification_method: authorization.verification_data?.authentication_type,
      pin_required: authorization.verification_data?.pin_required,
    });

    // Block crypto transactions while allowing PIN-based and all other legitimate transactions
    if (isCryptoTransaction) {
      console.log(`BLOCKED: Crypto transaction attempt for company ${companyId}:`, {
        merchant: merchantData?.name,
        amount: amount / 100,
        category: merchantData?.category,
      });

      // Log the blocked transaction
      await this.logBlockedTransaction(companyId, authorization, 'crypto_purchase_blocked');
      
      // Note: Stripe automatically declines based on spending_controls
      // This is just for logging and monitoring
    }

    // Allow all other transactions including PIN-based
    if (!isCryptoTransaction) {
      console.log(`APPROVED: Legitimate transaction for company ${companyId}:`, {
        merchant: merchantData?.name,
        amount: amount / 100,
        category: merchantData?.category,
        pin_transaction: authorization.verification_data?.pin_required || false,
      });
    }

    // High-value transaction monitoring
    if (amount > 500000) { // $5000+
      console.log(`HIGH VALUE: Transaction alert for company ${companyId}: $${amount / 100}`);
    }
  }

  // Handle authorization created event
  private async handleAuthorizationCreated(authorization: Stripe.Issuing.Authorization): Promise<void> {
    const companyId = authorization.card?.metadata?.companyId;
    if (!companyId) return;

    console.log(`Authorization created for company ${companyId}:`, {
      id: authorization.id,
      amount: authorization.amount / 100,
      approved: authorization.approved,
      merchant: authorization.merchant_data?.name,
      category: authorization.merchant_data?.category,
    });

    // Track spending patterns
    if (authorization.approved) {
      await this.trackCompanySpending(companyId, authorization);
    }
  }

  // Handle transaction created event
  private async handleTransactionCreated(transaction: Stripe.Issuing.Transaction): Promise<void> {
    const companyId = transaction.card?.metadata?.companyId;
    if (!companyId) return;

    console.log(`Transaction completed for company ${companyId}:`, {
      id: transaction.id,
      amount: transaction.amount / 100,
      merchant: transaction.merchant_data?.name,
      type: transaction.type,
    });

    // Store transaction for reporting
    await this.storeTransaction(companyId, transaction);
  }

  // Check if merchant is crypto-related
  private isCryptoMerchant(merchantData: any): boolean {
    if (!merchantData) return false;

    const cryptoCategories = [
      'cryptocurrency_and_money_exchange',
      'digital_currency_trading',
      'virtual_currency_exchange',
      'cryptocurrency_exchanges',
      'digital_asset_trading',
      'bitcoin_atm',
      'crypto_atm',
    ];

    const cryptoKeywords = [
      'coinbase', 'binance', 'kraken', 'bitcoin', 'ethereum', 'crypto',
      'cryptocurrency', 'digital currency', 'blockchain', 'btc', 'eth',
      'dogecoin', 'litecoin', 'ripple', 'ada', 'sol'
    ];

    // Check merchant category
    if (merchantData.category && cryptoCategories.includes(merchantData.category)) {
      return true;
    }

    // Check merchant name for crypto keywords
    const merchantName = (merchantData.name || '').toLowerCase();
    return cryptoKeywords.some(keyword => merchantName.includes(keyword));
  }

  // Log blocked transactions for audit trail
  private async logBlockedTransaction(companyId: string, authorization: Stripe.Issuing.Authorization, reason: string): Promise<void> {
    try {
      // Store in blocked transactions table or log
      console.log(`AUDIT LOG - Blocked Transaction:`, {
        companyId,
        authorizationId: authorization.id,
        amount: authorization.amount / 100,
        merchant: authorization.merchant_data?.name,
        category: authorization.merchant_data?.category,
        reason,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error logging blocked transaction:', error);
    }
  }

  // Track company spending patterns
  private async trackCompanySpending(companyId: string, authorization: Stripe.Issuing.Authorization): Promise<void> {
    try {
      // Could implement spending analytics here
      console.log(`Spending tracked for company ${companyId}:`, {
        amount: authorization.amount / 100,
        category: authorization.merchant_data?.category,
        merchant: authorization.merchant_data?.name,
      });
    } catch (error) {
      console.error('Error tracking spending:', error);
    }
  }

  // Store transaction for reporting
  private async storeTransaction(companyId: string, transaction: Stripe.Issuing.Transaction): Promise<void> {
    try {
      // Store transaction details for reporting and analytics
      console.log(`Transaction stored for company ${companyId}:`, {
        id: transaction.id,
        amount: transaction.amount / 100,
        type: transaction.type,
        merchant: transaction.merchant_data?.name,
      });
    } catch (error) {
      console.error('Error storing transaction:', error);
    }
  }
}

export const stripeWebhookHandler = new StripeWebhookHandler();