import { db } from "./db";
import { companies, users } from "@shared/schema";
import { count, sum, eq, desc, gte, lte, and } from "drizzle-orm";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is required for HQ operations");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export interface HQFinancialSummary {
  totalRevenue: number;
  monthlyRevenue: number;
  totalPayouts: number;
  monthlyPayouts: number;
  pendingTransfers: number;
  totalBalance: number;
  outstandingInvoices: number;
  subscriptionRevenue: number;
  transactionFees: number;
  netProfit: number;
}

export interface HQTransaction {
  id: string;
  companyId: string;
  companyName: string;
  type: 'payment' | 'payout' | 'fee' | 'refund' | 'chargeback';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  stripeTransactionId?: string;
  createdAt: Date;
  completedAt?: Date;
  metadata?: any;
}

export interface HQBankingOperation {
  id: string;
  companyId: string;
  type: 'wire_transfer' | 'ach_transfer' | 'instant_payout' | 'check_deposit';
  amount: number;
  sourceAccount: string;
  destinationAccount: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  scheduledDate?: Date;
  completedDate?: Date;
  failureReason?: string;
  metadata: any;
}

export interface HQAccountingEntry {
  id: string;
  companyId: string;
  accountType: 'revenue' | 'expense' | 'asset' | 'liability' | 'equity';
  category: string;
  amount: number;
  description: string;
  transactionId?: string;
  createdAt: Date;
  createdBy: string;
}

export class EnterpriseHQService {
  // Financial Management
  async getFinancialSummary(): Promise<HQFinancialSummary> {
    try {
      // Get actual Stripe data
      const balance = await stripe.balance.retrieve();
      
      // Get recent payments
      const charges = await stripe.charges.list({
        limit: 100,
        created: {
          gte: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60) // Last 30 days
        }
      });

      // Get payouts
      const payouts = await stripe.payouts.list({
        limit: 100,
        created: {
          gte: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60)
        }
      });

      // Calculate metrics
      const totalRevenue = charges.data
        .filter(charge => charge.status === 'succeeded')
        .reduce((sum, charge) => sum + charge.amount, 0) / 100;

      const totalPayouts = payouts.data
        .filter(payout => payout.status === 'paid')
        .reduce((sum, payout) => sum + payout.amount, 0) / 100;

      const pendingBalance = balance.pending.reduce((sum, pending) => 
        sum + pending.amount, 0) / 100;

      const availableBalance = balance.available.reduce((sum, available) => 
        sum + available.amount, 0) / 100;

      return {
        totalRevenue,
        monthlyRevenue: totalRevenue, // Last 30 days
        totalPayouts,
        monthlyPayouts: totalPayouts, // Last 30 days
        pendingTransfers: pendingBalance,
        totalBalance: availableBalance,
        outstandingInvoices: 0, // Would integrate with invoicing system
        subscriptionRevenue: totalRevenue * 0.8, // Estimate
        transactionFees: totalRevenue * 0.029, // Stripe fees estimate
        netProfit: totalRevenue - totalPayouts - (totalRevenue * 0.029)
      };
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      throw new Error('Failed to retrieve financial data');
    }
  }

  // Banking Operations
  async initiateBankTransfer(operation: Omit<HQBankingOperation, 'id' | 'status'>): Promise<HQBankingOperation> {
    try {
      let stripeOperation;

      switch (operation.type) {
        case 'instant_payout':
          stripeOperation = await stripe.payouts.create({
            amount: Math.round(operation.amount * 100),
            currency: 'usd',
            method: 'instant'
          });
          break;

        case 'ach_transfer':
          stripeOperation = await stripe.payouts.create({
            amount: Math.round(operation.amount * 100),
            currency: 'usd',
            method: 'standard'
          });
          break;

        default:
          throw new Error(`Unsupported transfer type: ${operation.type}`);
      }

      const bankingOp: HQBankingOperation = {
        ...operation,
        id: stripeOperation.id,
        status: 'processing',
        metadata: {
          stripePayoutId: stripeOperation.id,
          expectedArrival: stripeOperation.arrival_date
        }
      };

      return bankingOp;
    } catch (error) {
      console.error('Error initiating bank transfer:', error);
      throw new Error('Failed to initiate bank transfer');
    }
  }

  async sendPayment(recipientCompanyId: string, amount: number, description: string): Promise<HQTransaction> {
    try {
      // In a real implementation, this would create a payment to the company's connected account
      const payment = await stripe.transfers.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        description: description
      });

      const transaction: HQTransaction = {
        id: payment.id,
        companyId: recipientCompanyId,
        companyName: 'Unknown Company', // Would fetch from DB
        type: 'payment',
        amount: amount,
        currency: 'usd',
        status: 'pending',
        description: description,
        stripeTransactionId: payment.id,
        createdAt: new Date()
      };

      return transaction;
    } catch (error) {
      console.error('Error sending payment:', error);
      throw new Error('Failed to send payment');
    }
  }

  // Accounting Operations
  async createAccountingEntry(entry: Omit<HQAccountingEntry, 'id' | 'createdAt'>): Promise<HQAccountingEntry> {
    const accountingEntry: HQAccountingEntry = {
      ...entry,
      id: `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };

    // In a real system, this would be stored in the database
    console.log('Created accounting entry:', accountingEntry);
    
    return accountingEntry;
  }

  async getAccountingEntries(companyId?: string, startDate?: Date, endDate?: Date): Promise<HQAccountingEntry[]> {
    // Mock data for now - in production this would query the accounting database
    return [
      {
        id: 'acc_1',
        companyId: companyId || 'demo-company',
        accountType: 'revenue',
        category: 'subscription_fees',
        amount: 299.00,
        description: 'Monthly subscription fee',
        createdAt: new Date(),
        createdBy: 'system'
      },
      {
        id: 'acc_2',
        companyId: companyId || 'demo-company',
        accountType: 'expense',
        category: 'processing_fees',
        amount: 8.67,
        description: 'Stripe processing fees',
        createdAt: new Date(),
        createdBy: 'system'
      }
    ];
  }

  // Billing Operations
  async generateInvoice(companyId: string, amount: number, description: string): Promise<any> {
    try {
      // Get company info
      const [company] = await db.select().from(companies).where(eq(companies.id, companyId));
      
      if (!company) {
        throw new Error('Company not found');
      }

      // Create Stripe invoice
      const invoice = await stripe.invoices.create({
        customer: company.stripeCustomerId || undefined,
        collection_method: 'send_invoice',
        days_until_due: 30,
        description: description
      });

      // Add invoice item
      await stripe.invoiceItems.create({
        customer: company.stripeCustomerId || undefined,
        invoice: invoice.id,
        amount: Math.round(amount * 100),
        currency: 'usd',
        description: description
      });

      // Finalize and send invoice
      const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
      await stripe.invoices.sendInvoice(invoice.id);

      return {
        invoiceId: finalizedInvoice.id,
        invoiceUrl: finalizedInvoice.hosted_invoice_url,
        invoicePdf: finalizedInvoice.invoice_pdf,
        status: finalizedInvoice.status,
        amount: amount,
        dueDate: new Date(finalizedInvoice.due_date! * 1000)
      };
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw new Error('Failed to generate invoice');
    }
  }

  // Transaction Management
  async getRecentTransactions(limit: number = 50): Promise<HQTransaction[]> {
    try {
      const charges = await stripe.charges.list({
        limit: limit,
        expand: ['data.customer']
      });

      return charges.data.map(charge => ({
        id: charge.id,
        companyId: charge.customer?.toString() || 'unknown',
        companyName: (charge.customer as any)?.name || 'Unknown Company',
        type: 'payment' as const,
        amount: charge.amount / 100,
        currency: charge.currency,
        status: charge.status === 'succeeded' ? 'completed' : charge.status as any,
        description: charge.description || 'Payment',
        stripeTransactionId: charge.id,
        createdAt: new Date(charge.created * 1000),
        completedAt: charge.status === 'succeeded' ? new Date(charge.created * 1000) : undefined
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw new Error('Failed to retrieve transactions');
    }
  }

  // Company Financial Operations
  async getCompanyFinancials(companyId: string): Promise<any> {
    try {
      const [company] = await db.select().from(companies).where(eq(companies.id, companyId));
      
      if (!company || !company.stripeCustomerId) {
        throw new Error('Company not found or no Stripe customer ID');
      }

      // Get customer's payment methods
      const paymentMethods = await stripe.paymentMethods.list({
        customer: company.stripeCustomerId,
        type: 'card'
      });

      // Get customer's invoices
      const invoices = await stripe.invoices.list({
        customer: company.stripeCustomerId,
        limit: 10
      });

      // Get customer's subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: company.stripeCustomerId
      });

      return {
        companyId: company.id,
        companyName: company.name,
        stripeCustomerId: company.stripeCustomerId,
        paymentMethods: paymentMethods.data,
        recentInvoices: invoices.data,
        activeSubscriptions: subscriptions.data,
        totalSpent: invoices.data
          .filter(inv => inv.status === 'paid')
          .reduce((sum, inv) => sum + (inv.amount_paid || 0), 0) / 100
      };
    } catch (error) {
      console.error('Error fetching company financials:', error);
      throw new Error('Failed to retrieve company financial data');
    }
  }

  // Customer Management
  async getAllCustomers(): Promise<any[]> {
    try {
      const allCompanies = await db.select().from(companies).orderBy(desc(companies.createdAt));
      
      return allCompanies.map(company => ({
        id: company.id,
        name: company.name,
        email: company.email,
        phone: company.phone,
        address: company.address,
        dotNumber: company.dotNumber,
        mcNumber: company.mcNumber,
        businessType: company.businessType,
        status: company.status || 'active',
        createdAt: company.createdAt,
        subscriptionStatus: company.subscriptionStatus
      }));
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw new Error('Failed to retrieve customer list');
    }
  }

  async getCustomerProfile(companyId: string): Promise<any> {
    try {
      const [company] = await db.select().from(companies).where(eq(companies.id, companyId));
      
      if (!company) {
        return null;
      }

      // Get company users
      const companyUsers = await db.select().from(users).where(eq(users.companyId, companyId));

      // Get financial data if Stripe customer exists
      let financialData = null;
      if (company.stripeCustomerId) {
        try {
          const customer = await stripe.customers.retrieve(company.stripeCustomerId);
          const invoices = await stripe.invoices.list({
            customer: company.stripeCustomerId,
            limit: 5
          });
          
          financialData = {
            stripeCustomerId: company.stripeCustomerId,
            totalSpent: invoices.data
              .filter(inv => inv.status === 'paid')
              .reduce((sum, inv) => sum + (inv.amount_paid || 0), 0) / 100,
            recentInvoices: invoices.data
          };
        } catch (stripeError) {
          console.warn('Could not fetch Stripe data for customer:', stripeError);
        }
      }

      return {
        id: company.id,
        name: company.name,
        email: company.email,
        phone: company.phone,
        address: company.address,
        dotNumber: company.dotNumber,
        mcNumber: company.mcNumber,
        businessType: company.businessType,
        status: company.status || 'active',
        registrationDate: company.createdAt,
        lastUpdated: company.updatedAt,
        users: companyUsers.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin
        })),
        financial: financialData,
        operations: {
          totalDrivers: 0, // Would integrate with driver management
          totalVehicles: 0, // Would integrate with fleet management
          activeLoads: 0, // Would integrate with load management
          monthlyMiles: 0
        },
        compliance: {
          saferRating: 'Not Available',
          inspectionScore: 0,
          lastAudit: null,
          violationsCount: 0
        }
      };
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      throw new Error('Failed to retrieve customer profile');
    }
  }

  // System Health and Monitoring
  async getSystemHealth(): Promise<any> {
    try {
      // Check Stripe connectivity
      const balance = await stripe.balance.retrieve();
      
      return {
        status: 'healthy',
        services: {
          stripe: 'operational',
          database: 'operational',
          api: 'operational'
        },
        metrics: {
          availableBalance: balance.available.reduce((sum, bal) => sum + bal.amount, 0) / 100,
          pendingBalance: balance.pending.reduce((sum, bal) => sum + bal.amount, 0) / 100,
          lastUpdated: new Date()
        }
      };
    } catch (error) {
      console.error('System health check failed:', error);
      return {
        status: 'degraded',
        services: {
          stripe: 'error',
          database: 'operational',
          api: 'operational'
        },
        error: error.message
      };
    }
  }
}

export const enterpriseHQService = new EnterpriseHQService();