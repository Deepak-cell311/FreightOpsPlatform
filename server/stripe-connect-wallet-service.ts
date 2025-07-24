import Stripe from "stripe";
import { db } from "./db";
import { companies } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export interface StripeConnectAccount {
  id: string;
  companyId: string;
  stripeAccountId: string;
  stripeCustomerId: string;
  accountStatus: 'pending' | 'active' | 'restricted' | 'suspended';
  onboardingCompleted: boolean;
  capabilities: {
    cardPayments: boolean;
    transfers: boolean;
    cardIssuing: boolean;
  };
  balances: {
    available: number;
    pending: number;
    reserved: number;
  };
  businessProfile: {
    name: string;
    url?: string;
    supportEmail: string;
    supportPhone?: string;
    mcc: string;
  };
  requirementsStatus: {
    currentlyDue: string[];
    eventuallyDue: string[];
    pastDue: string[];
    disabledReason?: string;
  };
  metadata: {
    isHQAdmin: boolean;
    companyType: 'carrier' | 'broker' | 'shipper' | 'hq_admin';
    createdAt: Date;
    lastUpdated: Date;
  };
}

export interface IssuedCard {
  id: string;
  companyId: string;
  stripeCardId: string;
  cardholderName: string;
  type: 'virtual' | 'physical';
  status: 'active' | 'inactive' | 'blocked' | 'canceled';
  last4: string;
  expMonth: number;
  expYear: number;
  brand: string;
  spendingControls: {
    spendingLimits: {
      amount: number;
      interval: 'per_authorization' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time';
    }[];
    allowedCategories: string[];
    blockedCategories: string[];
  };
  metadata: {
    purpose: string;
    assignedTo?: string;
    department?: string;
  };
  createdAt: Date;
}

export class StripeConnectWalletService {
  // Create Stripe Connect Express account for company
  async createConnectAccount(companyData: {
    companyId: string;
    businessName: string;
    email: string;
    phone?: string;
    website?: string;
    businessType: 'company' | 'individual';
    country: string;
    isHQAdmin?: boolean;
    companyType: 'carrier' | 'broker' | 'shipper' | 'hq_admin';
  }): Promise<StripeConnectAccount> {
    try {
      // Create Stripe Express Connect account
      const account = await stripe.accounts.create({
        type: 'express',
        country: companyData.country || 'US',
        email: companyData.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
          card_issuing: { requested: true }, // Enable card issuing
        },
        business_type: companyData.businessType,
        company: companyData.businessType === 'company' ? {
          name: companyData.businessName,
          phone: companyData.phone,
        } : undefined,
        individual: companyData.businessType === 'individual' ? {
          email: companyData.email,
          phone: companyData.phone,
        } : undefined,
        business_profile: {
          name: companyData.businessName,
          url: companyData.website,
          support_email: companyData.email,
          support_phone: companyData.phone,
          mcc: this.getMCCForCompanyType(companyData.companyType),
        },
        settings: {
          payouts: {
            schedule: {
              interval: 'daily',
            },
          },
        },
        metadata: {
          companyId: companyData.companyId,
          isHQAdmin: companyData.isHQAdmin?.toString() || 'false',
          companyType: companyData.companyType,
        },
      });

      // Create customer for the company
      const customer = await stripe.customers.create({
        name: companyData.businessName,
        email: companyData.email,
        phone: companyData.phone,
        metadata: {
          companyId: companyData.companyId,
          stripeAccountId: account.id,
        },
      });

      // Store in database - stub implementation
      const walletId = nanoid();
      // await db.insert(companyWallets).values({
      //   id: walletId,
      //   companyId: companyData.companyId,
      //   stripeConnectAccountId: account.id,
      //   stripeCustomerId: customer.id,
      //   accountStatus: 'pending',
      //   hasOnboardingCompleted: false,
      //   capabilities: {
      //     cardPayments: false,
      //     transfers: false,
      //     achDebits: false,
      //     achCredits: false,
      //   },
      //   balances: {
      //     available: 0,
      //     pending: 0,
      //     connectReserved: 0,
      //   },
      //   businessProfile: {
      //     name: companyData.businessName,
      //     url: companyData.website,
      //     supportEmail: companyData.email,
      //     supportPhone: companyData.phone,
      //   },
      //   metadata: {
      //     isHQAdmin: companyData.isHQAdmin || false,
      //     companyType: companyData.companyType,
      //     createdAt: new Date(),
      //     lastUpdated: new Date(),
      //   },
      // });

      // Update company record with Stripe IDs - stub implementation
      // await db.update(companies)
      //   .set({
      //     stripeAccountId: account.id,
      //     stripeCustomerId: customer.id,
      //     updatedAt: new Date(),
      //   })
      //   .where(eq(companies.id, companyData.companyId));

      return this.formatConnectAccount(account, customer.id, companyData);
    } catch (error: any) {
      throw new Error(`Failed to create Connect account: ${error.message}`);
    }
  }

  // Generate onboarding link for Express account
  async generateOnboardingLink(companyId: string, refreshUrl: string, returnUrl: string): Promise<string> {
    const wallet = await this.getWalletByCompanyId(companyId);
    if (!wallet) {
      throw new Error("Company wallet not found");
    }

    const accountLink = await stripe.accountLinks.create({
      account: wallet.stripeConnectAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return accountLink.url;
  }

  // Issue a card for the company with comprehensive spending controls
  async issueCard(companyId: string, cardData: {
    cardholderName: string;
    type: 'virtual' | 'physical';
    cardholderRole: 'driver' | 'manager' | 'admin' | 'owner';
    spendingLimits?: {
      amount: number;
      interval: 'per_authorization' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time';
    }[];
    allowedCategories?: string[];
    blockedCategories?: string[];
    metadata?: {
      purpose: string;
      assignedTo?: string;
      department?: string;
      employeeId?: string;
    };
    shippingAddress?: {
      name: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  }): Promise<IssuedCard> {
    const wallet = await this.getWalletByCompanyId(companyId);
    if (!wallet) {
      throw new Error("Company wallet not found");
    }

    // Check if card issuing is enabled
    const account = await stripe.accounts.retrieve(wallet.stripeConnectAccountId);
    if (account.capabilities?.card_issuing !== 'active') {
      throw new Error("Card issuing not enabled for this account");
    }

    // Create cardholder
    const cardholder = await stripe.issuing.cardholders.create({
      name: cardData.cardholderName,
      email: wallet.businessProfile.supportEmail,
      phone_number: wallet.businessProfile.supportPhone,
      type: 'company',
      company: {
        tax_id: '000000000', // This would be the actual tax ID
      },
      billing: {
        address: {
          line1: '123 Business St',
          city: 'Business City',
          state: 'CA',
          postal_code: '90210',
          country: 'US',
        },
      },
      metadata: {
        companyId,
        purpose: cardData.metadata?.purpose || 'business_expenses',
      },
    }, {
      stripeAccount: wallet.stripeConnectAccountId,
    });

    // Create the card with comprehensive crypto restrictions
    const card = await stripe.issuing.cards.create({
      cardholder: cardholder.id,
      currency: 'usd',
      type: cardData.type,
      spending_controls: {
        spending_limits: cardData.spendingLimits || [{
          amount: 100000, // $1000 default limit
          interval: 'monthly',
        }],
        // Block only crypto-specific merchant categories
        blocked_categories: this.getCryptoBlockedCategories().concat(cardData.blockedCategories || []),
        // Use role-based categories or admin-specified categories
        allowed_categories: cardData.allowedCategories || this.getAllowedCategoriesByRole(cardData.cardholderRole),
        // Additional authorization controls
        allowed_merchant_countries: ['US', 'CA', 'MX'], // North America freight corridor
        blocked_merchant_countries: [], // Will be populated with high-risk countries for crypto
      },
      shipping: cardData.type === 'physical' && cardData.shippingAddress ? {
        name: cardData.shippingAddress.name,
        address: {
          line1: cardData.shippingAddress.line1,
          line2: cardData.shippingAddress.line2,
          city: cardData.shippingAddress.city,
          state: cardData.shippingAddress.state,
          postal_code: cardData.shippingAddress.postal_code,
          country: cardData.shippingAddress.country,
        },
        type: 'individual',
      } : undefined,
      metadata: {
        companyId,
        purpose: cardData.metadata?.purpose || 'business_expenses',
        assignedTo: cardData.metadata?.assignedTo || '',
        department: cardData.metadata?.department || '',
        employeeId: cardData.metadata?.employeeId || '',
        cardholderRole: cardData.cardholderRole,
        cryptoBlocked: 'true',
        restrictions: 'crypto_only_blocked',
        allowedServices: 'cash_app,western_union,moneygram,atm,digital_goods,pin_transactions',
        pinTransactionsEnabled: 'true',
        roleBasedLimits: 'true',
      },
    }, {
      stripeAccount: wallet.stripeConnectAccountId,
    });

    return {
      id: nanoid(),
      companyId,
      stripeCardId: card.id,
      cardholderName: cardData.cardholderName,
      type: cardData.type,
      status: 'active',
      last4: card.last4,
      expMonth: card.exp_month,
      expYear: card.exp_year,
      brand: card.brand,
      spendingControls: {
        spendingLimits: cardData.spendingLimits || [{
          amount: 100000,
          interval: 'monthly',
        }],
        allowedCategories: cardData.allowedCategories || [],
        blockedCategories: cardData.blockedCategories || [],
      },
      metadata: cardData.metadata || {
        purpose: 'business_expenses',
      },
      createdAt: new Date(),
    };
  }

  // Transfer funds between Connect accounts
  async transferFunds(fromCompanyId: string, toCompanyId: string, amount: number, currency: string = 'usd', description?: string): Promise<string> {
    const fromWallet = await this.getWalletByCompanyId(fromCompanyId);
    const toWallet = await this.getWalletByCompanyId(toCompanyId);

    if (!fromWallet || !toWallet) {
      throw new Error("One or both company wallets not found");
    }

    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      destination: toWallet.stripeConnectAccountId,
      description: description || `Transfer from ${fromCompanyId} to ${toCompanyId}`,
      metadata: {
        fromCompanyId,
        toCompanyId,
      },
    }, {
      stripeAccount: fromWallet.stripeConnectAccountId,
    });

    // Record transaction - stub implementation
    // await db.insert(walletTransactions).values({
    //   id: nanoid(),
    //   walletId: fromWallet.id,
    //   stripeTransferId: transfer.id,
    //   type: 'transfer_out',
    //   amount: amount.toString(),
    //   currency,
    //   status: 'pending',
    //   description: description || `Transfer to ${toCompanyId}`,
    //   metadata: {
    //     toCompanyId,
    //     transferId: transfer.id,
    //   },
    // });

    return transfer.id;
  }

  // Get account status and update capabilities
  async updateAccountStatus(companyId: string): Promise<StripeConnectAccount> {
    const wallet = await this.getWalletByCompanyId(companyId);
    if (!wallet) {
      throw new Error("Company wallet not found");
    }

    const account = await stripe.accounts.retrieve(wallet.stripeConnectAccountId);
    
    // Update wallet status in database - stub implementation
    // await db.update(companyWallets)
    //   .set({
    //     accountStatus: account.details_submitted ? 'active' : 'pending',
    //     hasOnboardingCompleted: account.details_submitted,
    //     capabilities: {
    //       cardPayments: account.capabilities?.card_payments === 'active',
    //       transfers: account.capabilities?.transfers === 'active',
    //       achDebits: false,
    //       achCredits: false,
    //     },
    //     updatedAt: new Date(),
    //   })
    //   .where(eq(companyWallets.companyId, companyId));

    return this.formatConnectAccount(account, wallet.stripeCustomerId, {
      companyId,
      businessName: account.business_profile?.name || '',
      email: account.email || '',
      companyType: 'carrier',
    });
  }

  // Create wallets for all existing companies
  async createWalletsForAllCompanies(): Promise<{ success: number; failed: number; errors: string[] }> {
    // const allCompanies = await db.select().from(companies);
    const allCompanies: any[] = [];
    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const company of allCompanies) {
      try {
        if (!company.stripeAccountId) {
          await this.createConnectAccount({
            companyId: company.id,
            businessName: company.name,
            email: company.email || `contact@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
            phone: company.phone || undefined,
            website: company.website || undefined,
            businessType: 'company',
            country: 'US',
            isHQAdmin: company.name.toLowerCase().includes('hq') || company.name.toLowerCase().includes('admin'),
            companyType: this.determineCompanyType(company.name),
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

  // Get wallet by company ID
  private async getWalletByCompanyId(companyId: string) {
    // const wallet = await db.select()
    //   .from(companyWallets)
    //   .where(eq(companyWallets.companyId, companyId))
    //   .limit(1);
    const wallet: any[] = [];

    return wallet.length > 0 ? wallet[0] : null;
  }

  // Get MCC (Merchant Category Code) for company type
  private getMCCForCompanyType(companyType: string): string {
    switch (companyType) {
      case 'carrier':
        return '4214'; // Motor Freight Carriers and Trucking
      case 'broker':
        return '4214'; // Motor Freight Carriers and Trucking
      case 'shipper':
        return '4214'; // Motor Freight Carriers and Trucking
      case 'hq_admin':
        return '7372'; // Computer Programming Services
      default:
        return '4214';
    }
  }

  // Determine company type from name
  private determineCompanyType(companyName: string): 'carrier' | 'broker' | 'shipper' | 'hq_admin' {
    const name = companyName.toLowerCase();
    if (name.includes('hq') || name.includes('admin')) return 'hq_admin';
    if (name.includes('broker')) return 'broker';
    if (name.includes('carrier') || name.includes('transport') || name.includes('trucking')) return 'carrier';
    return 'shipper';
  }

  // Get specific crypto-only merchant categories to block
  private getCryptoBlockedCategories(): string[] {
    return [
      // Direct cryptocurrency exchanges and services only
      'cryptocurrency_and_money_exchange',
      'digital_currency_trading',
      'virtual_currency_exchange',
      // Crypto-specific investment platforms
      'cryptocurrency_exchanges',
      'digital_asset_trading',
      'bitcoin_atm',
      'crypto_atm',
      // Remove general categories that include legitimate services
      // Note: We specifically allow:
      // - Cash App, Western Union, MoneyGram (money_transfer_money_order)
      // - ATMs (automated_cash_disbursement)
      // - Digital goods purchases (digital_goods_*)
      // - Investment services (securities_commodities_and_financial_services)
    ];
  }

  // Get role-based spending categories
  private getAllowedCategoriesByRole(role: 'driver' | 'manager' | 'admin' | 'owner'): string[] {
    const driverCategories = [
      // Vehicle maintenance and repairs
      'automotive_parts_accessories_stores',
      'motor_vehicle_supplies_and_new_parts',
      'automotive_tire_stores',
      'automotive_body_repair_shops',
      'automotive_service_shops',
      // Fuel and energy
      'service_stations',
      'fuel_dealers_non_automotive',
      // Transportation and logistics
      'trucking_freight',
      'motor_freight_carriers_and_trucking',
      'truck_and_utility_trailer_rentals',
      // Supplies and equipment
      'hardware_stores',
      'industrial_supplies',
      'equipment_rental',
      // Government and permits
      'government_services',
      'toll_and_bridge_fees',
      'tax_payments_government_agencies',
      // Lodging for drivers
      'lodging_hotels_motels_resorts',
      'campgrounds_and_trailer_parks',
      // Food (limited for drivers on road)
      'eating_places_restaurants',
      'fast_food_restaurants',
      'truck_stops',
      'grocery_stores_supermarkets',
      // Essential financial services
      'automated_cash_disbursement', // ATMs
    ];

    const managerCategories = [
      ...driverCategories,
      // Additional business operations
      'office_supplies_and_equipment',
      'telecommunications_services',
      'business_services',
      'professional_services',
      'computer_software_stores',
      'insurance_not_elsewhere_classified',
      // Financial services
      'money_transfer_money_order',
      'wire_transfer_money_order',
      'stored_value_card_purchase_load',
      // Marketing and business development
      'advertising_services',
      'business_and_secretarial_schools',
      // Additional equipment and supplies
      'miscellaneous_business_services',
    ];

    const adminCategories = [
      ...managerCategories,
      // Full business operations
      'financial_institutions',
      'securities_commodities_and_financial_services',
      'digital_goods_media',
      'digital_goods_applications',
      'computer_network_services',
      'transportation_services',
      'delivery_services',
      'warehousing_storage',
      'logistics_and_distribution',
      // Administrative services
      'business_services_not_elsewhere_classified',
    ];

    const ownerCategories = [
      ...adminCategories,
      // Complete business freedom (except crypto)
      'digital_goods_games',
      'motor_vehicle_dealers_used_only',
      'real_estate_agents_and_managers_rentals',
      'construction_materials',
      'wholesale_clubs',
    ];

    switch (role) {
      case 'driver':
        return driverCategories;
      case 'manager':
        return managerCategories;
      case 'admin':
        return adminCategories;
      case 'owner':
        return ownerCategories;
      default:
        return driverCategories; // Default to most restrictive
    }
  }

  // Update card spending controls (admin management)
  async updateCardControls(companyId: string, cardId: string, updates: {
    status?: 'active' | 'inactive' | 'blocked';
    spendingLimits?: {
      amount: number;
      interval: 'per_authorization' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time';
    }[];
    allowedCategories?: string[];
    blockedCategories?: string[];
    cardholderRole?: 'driver' | 'manager' | 'admin' | 'owner';
  }): Promise<void> {
    const wallet = await this.getWalletByCompanyId(companyId);
    if (!wallet) {
      throw new Error("Company wallet not found");
    }

    // Update card status if provided
    if (updates.status) {
      await stripe.issuing.cards.update(cardId, {
        status: updates.status,
      }, {
        stripeAccount: wallet.stripeConnectAccountId,
      });
    }

    // Update spending controls
    if (updates.spendingLimits || updates.allowedCategories || updates.blockedCategories || updates.cardholderRole) {
      // Determine allowed categories based on role or admin override
      let allowedCategories = updates.allowedCategories;
      
      // If role is specified and no custom categories, use role-based categories
      if (updates.cardholderRole && !updates.allowedCategories) {
        allowedCategories = this.getAllowedCategoriesByRole(updates.cardholderRole);
      }

      const updateData: any = {
        spending_controls: {
          spending_limits: updates.spendingLimits,
          allowed_categories: allowedCategories,
          // Always ensure crypto categories remain blocked
          blocked_categories: this.getCryptoBlockedCategories().concat(updates.blockedCategories || []),
          // North America freight corridor
          allowed_merchant_countries: ['US', 'CA', 'MX'],
        },
      };

      // Update metadata if role changed
      if (updates.cardholderRole) {
        updateData.metadata = {
          cardholderRole: updates.cardholderRole,
          restrictions: 'crypto_only_blocked',
          allowedServices: 'cash_app,western_union,moneygram,atm,digital_goods,pin_transactions',
          pinTransactionsEnabled: 'true',
          roleBasedLimits: updates.allowedCategories ? 'admin_override' : 'true',
        };
      }

      await stripe.issuing.cards.update(cardId, updateData, {
        stripeAccount: wallet.stripeConnectAccountId,
      });
    }
  }

  // Get all cards for a company
  async getCompanyCards(companyId: string): Promise<any[]> {
    const wallet = await this.getWalletByCompanyId(companyId);
    if (!wallet) {
      throw new Error("Company wallet not found");
    }

    const cards = await stripe.issuing.cards.list({
      limit: 100,
    }, {
      stripeAccount: wallet.stripeConnectAccountId,
    });

    return cards.data.map(card => ({
      id: card.id,
      last4: card.last4,
      brand: card.brand,
      exp_month: card.exp_month,
      exp_year: card.exp_year,
      cardholder: card.cardholder,
      status: card.status,
      type: card.type,
      spending_controls: card.spending_controls,
      metadata: card.metadata,
      created: card.created,
    }));
  }

  // Block suspicious crypto transactions in real-time
  async blockCryptoTransaction(authorizationId: string, companyId: string): Promise<void> {
    const wallet = await this.getWalletByCompanyId(companyId);
    if (!wallet) {
      throw new Error("Company wallet not found");
    }

    // Decline the authorization if it's for crypto
    await stripe.issuing.authorizations.decline(authorizationId, {
      metadata: {
        decline_reason: 'crypto_purchase_blocked',
        company_policy: 'no_cryptocurrency_purchases',
        blocked_at: new Date().toISOString(),
      },
    }, {
      stripeAccount: wallet.stripeConnectAccountId,
    });
  }

  // Format Stripe account to our interface
  private formatConnectAccount(account: Stripe.Account, customerId: string, companyData: any): StripeConnectAccount {
    return {
      id: nanoid(),
      companyId: companyData.companyId,
      stripeAccountId: account.id,
      stripeCustomerId: customerId,
      accountStatus: account.details_submitted ? 'active' : 'pending',
      onboardingCompleted: account.details_submitted || false,
      capabilities: {
        cardPayments: account.capabilities?.card_payments === 'active',
        transfers: account.capabilities?.transfers === 'active',
        cardIssuing: account.capabilities?.card_issuing === 'active',
      },
      balances: {
        available: 0,
        pending: 0,
        reserved: 0,
      },
      businessProfile: {
        name: account.business_profile?.name || companyData.businessName,
        url: account.business_profile?.url,
        supportEmail: account.business_profile?.support_email || companyData.email,
        supportPhone: account.business_profile?.support_phone,
        mcc: account.business_profile?.mcc || this.getMCCForCompanyType(companyData.companyType),
      },
      requirementsStatus: {
        currentlyDue: account.requirements?.currently_due || [],
        eventuallyDue: account.requirements?.eventually_due || [],
        pastDue: account.requirements?.past_due || [],
        disabledReason: account.requirements?.disabled_reason || undefined,
      },
      metadata: {
        isHQAdmin: companyData.isHQAdmin || false,
        companyType: companyData.companyType,
        createdAt: new Date(account.created * 1000),
        lastUpdated: new Date(),
      },
    };
  }
}

export const stripeConnectWalletService = new StripeConnectWalletService();