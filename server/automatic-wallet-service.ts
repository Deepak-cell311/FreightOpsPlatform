import Stripe from "stripe";
import { db } from "./db";
import { companies, users, companyWallets, walletTransactions } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export interface CompanyWallet {
  id: string;
  companyId: string;
  stripeConnectAccountId: string;
  stripeCustomerId: string;
  accountStatus: 'pending' | 'active' | 'restricted' | 'suspended';
  hasOnboardingCompleted: boolean;
  capabilities: {
    cardPayments: boolean;
    transfers: boolean;
    achDebits: boolean;
    achCredits: boolean;
  };
  balances: {
    available: number;
    pending: number;
    connectReserved: number;
  };
  businessProfile: {
    name: string;
    url?: string;
    supportEmail: string;
    supportPhone?: string;
  };
  metadata: {
    isHQAdmin: boolean;
    companyType: 'carrier' | 'broker' | 'shipper' | 'hq_admin';
    createdAt: Date;
    lastUpdated: Date;
  };
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  stripeTransferId?: string;
  stripePaymentIntentId?: string;
  type: 'transfer_in' | 'transfer_out' | 'payment_received' | 'payment_sent' | 'fee' | 'refund';
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  description: string;
  metadata: {
    loadId?: string;
    invoiceId?: string;
    relatedCompanyId?: string;
  };
  createdAt: Date;
}

export class AutomaticWalletService {
  // Create wallet for new company
  async createCompanyWallet(companyId: string, companyData: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    taxId?: string;
    website?: string;
    isHQAdmin?: boolean;
    companyType: 'carrier' | 'broker' | 'shipper' | 'hq_admin';
  }): Promise<CompanyWallet> {
    try {
      // Create Stripe Connect Express account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: companyData.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'company',
        company: {
          name: companyData.name,
          phone: companyData.phone,
          tax_id: companyData.taxId,
        },
        business_profile: {
          name: companyData.name,
          url: companyData.website,
          support_email: companyData.email,
          support_phone: companyData.phone,
          mcc: '4214', // Motor freight carriers and trucking
        },
        settings: {
          payouts: {
            schedule: {
              interval: 'daily',
            },
          },
        },
        metadata: {
          companyId,
          isHQAdmin: companyData.isHQAdmin?.toString() || 'false',
          companyType: companyData.companyType,
        },
      });

      // Create Stripe Customer for the company
      const customer = await stripe.customers.create({
        name: companyData.name,
        email: companyData.email,
        phone: companyData.phone,
        metadata: {
          companyId,
          stripeAccountId: account.id,
          companyType: companyData.companyType,
        },
      });

      // Create wallet record
      const wallet: CompanyWallet = {
        id: nanoid(),
        companyId,
        stripeConnectAccountId: account.id,
        stripeCustomerId: customer.id,
        accountStatus: 'pending',
        hasOnboardingCompleted: false,
        capabilities: {
          cardPayments: account.capabilities?.card_payments === 'active',
          transfers: account.capabilities?.transfers === 'active',
          achDebits: account.capabilities?.ach_debit_payments === 'active',
          achCredits: account.capabilities?.ach_credit_transfers === 'active',
        },
        balances: {
          available: 0,
          pending: 0,
          connectReserved: 0,
        },
        businessProfile: {
          name: companyData.name,
          url: companyData.website,
          supportEmail: companyData.email,
          supportPhone: companyData.phone,
        },
        metadata: {
          isHQAdmin: companyData.isHQAdmin || false,
          companyType: companyData.companyType,
          createdAt: new Date(),
          lastUpdated: new Date(),
        },
      };

      // Store wallet in database (would need to add wallet table to schema)
      await this.storeWalletInDatabase(wallet);

      // Update company record with Stripe IDs
      await db.update(companies)
        .set({
          stripeAccountId: account.id,
          stripeCustomerId: customer.id,
          updatedAt: new Date(),
        })
        .where(eq(companies.id, companyId));

      return wallet;
    } catch (error: any) {
      throw new Error(`Failed to create company wallet: ${error.message}`);
    }
  }

  // Generate onboarding link for company to complete Stripe Connect setup
  async generateOnboardingLink(companyId: string): Promise<string> {
    const company = await db.select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (!company.length || !company[0].stripeAccountId) {
      throw new Error("Company wallet not found");
    }

    const accountLink = await stripe.accountLinks.create({
      account: company[0].stripeAccountId,
      refresh_url: `${process.env.BASE_URL}/wallet/onboarding/refresh`,
      return_url: `${process.env.BASE_URL}/wallet/onboarding/complete`,
      type: 'account_onboarding',
    });

    return accountLink.url;
  }

  // Check and update account status
  async updateAccountStatus(companyId: string): Promise<CompanyWallet> {
    const company = await db.select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (!company.length || !company[0].stripeAccountId) {
      throw new Error("Company wallet not found");
    }

    const account = await stripe.accounts.retrieve(company[0].stripeAccountId);
    
    const wallet: CompanyWallet = {
      id: nanoid(),
      companyId,
      stripeConnectAccountId: account.id,
      stripeCustomerId: company[0].stripeCustomerId || '',
      accountStatus: account.details_submitted ? 'active' : 'pending',
      hasOnboardingCompleted: account.details_submitted,
      capabilities: {
        cardPayments: account.capabilities?.card_payments === 'active',
        transfers: account.capabilities?.transfers === 'active',
        achDebits: account.capabilities?.ach_debit_payments === 'active',
        achCredits: account.capabilities?.ach_credit_transfers === 'active',
      },
      balances: {
        available: 0,
        pending: 0,
        connectReserved: 0,
      },
      businessProfile: {
        name: account.business_profile?.name || company[0].name,
        url: account.business_profile?.url,
        supportEmail: account.business_profile?.support_email || company[0].email || '',
        supportPhone: account.business_profile?.support_phone,
      },
      metadata: {
        isHQAdmin: company[0].name.toLowerCase().includes('hq') || company[0].name.toLowerCase().includes('admin'),
        companyType: this.determineCompanyType(company[0]),
        createdAt: new Date(account.created * 1000),
        lastUpdated: new Date(),
      },
    };

    // Get account balance
    try {
      const balance = await stripe.balance.retrieve({
        stripeAccount: account.id,
      });
      
      wallet.balances = {
        available: balance.available.reduce((sum, bal) => sum + bal.amount, 0) / 100,
        pending: balance.pending.reduce((sum, bal) => sum + bal.amount, 0) / 100,
        connectReserved: balance.connect_reserved?.reduce((sum, bal) => sum + bal.amount, 0) / 100 || 0,
      };
    } catch (error) {
      // Balance might not be available for pending accounts
    }

    await this.storeWalletInDatabase(wallet);
    return wallet;
  }

  // Transfer funds between wallets
  async transferFunds(fromCompanyId: string, toCompanyId: string, amount: number, description: string, metadata?: any): Promise<WalletTransaction> {
    const fromCompany = await db.select()
      .from(companies)
      .where(eq(companies.id, fromCompanyId))
      .limit(1);

    const toCompany = await db.select()
      .from(companies)
      .where(eq(companies.id, toCompanyId))
      .limit(1);

    if (!fromCompany.length || !toCompany.length) {
      throw new Error("One or both companies not found");
    }

    if (!fromCompany[0].stripeAccountId || !toCompany[0].stripeAccountId) {
      throw new Error("One or both companies don't have wallets set up");
    }

    // Create transfer
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      destination: toCompany[0].stripeAccountId,
      description,
      metadata: {
        fromCompanyId,
        toCompanyId,
        ...metadata,
      },
    }, {
      stripeAccount: fromCompany[0].stripeAccountId,
    });

    const transaction: WalletTransaction = {
      id: nanoid(),
      walletId: fromCompany[0].stripeAccountId,
      stripeTransferId: transfer.id,
      type: 'transfer_out',
      amount: amount,
      currency: 'usd',
      status: 'pending',
      description,
      metadata: {
        relatedCompanyId: toCompanyId,
        ...metadata,
      },
      createdAt: new Date(),
    };

    await this.storeTransactionInDatabase(transaction);
    return transaction;
  }

  // Process payment for load
  async processLoadPayment(payerCompanyId: string, payeeCompanyId: string, amount: number, loadId: string): Promise<WalletTransaction> {
    return this.transferFunds(
      payerCompanyId,
      payeeCompanyId,
      amount,
      `Load payment for ${loadId}`,
      { loadId, type: 'load_payment' }
    );
  }

  // Get wallet for company
  async getCompanyWallet(companyId: string): Promise<CompanyWallet | null> {
    const company = await db.select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (!company.length || !company[0].stripeAccountId) {
      return null;
    }

    return this.updateAccountStatus(companyId);
  }

  // Automatically create wallets for all existing companies
  async createWalletsForAllCompanies(): Promise<{ success: number; failed: number; errors: string[] }> {
    const allCompanies = await db.select().from(companies);
    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const company of allCompanies) {
      try {
        if (!company.stripeAccountId) {
          await this.createCompanyWallet(company.id, {
            name: company.name,
            email: company.email || `admin@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
            phone: company.phone,
            isHQAdmin: company.name.toLowerCase().includes('hq') || company.name.toLowerCase().includes('admin'),
            companyType: this.determineCompanyType(company),
          });
          results.success++;
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push(`${company.name}: ${error.message}`);
      }
    }

    return results;
  }

  private determineCompanyType(company: any): 'carrier' | 'broker' | 'shipper' | 'hq_admin' {
    const name = company.name.toLowerCase();
    if (name.includes('hq') || name.includes('admin')) return 'hq_admin';
    if (name.includes('broker')) return 'broker';
    if (name.includes('carrier') || name.includes('transport') || name.includes('trucking')) return 'carrier';
    return 'shipper';
  }

  private async storeWalletInDatabase(wallet: CompanyWallet): Promise<void> {
    // This would store the wallet in a dedicated wallets table
    // For now, we're updating the companies table with Stripe IDs
    console.log('Storing wallet:', wallet.id);
  }

  private async storeTransactionInDatabase(transaction: WalletTransaction): Promise<void> {
    // This would store the transaction in a dedicated transactions table
    console.log('Storing transaction:', transaction.id);
  }
}

export const automaticWalletService = new AutomaticWalletService();