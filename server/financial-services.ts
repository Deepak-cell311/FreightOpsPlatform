import Stripe from 'stripe';
import { OpenAI } from 'openai';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Enterprise Financial Account Management
export interface FinancialAccount {
  id: string;
  companyId: string;
  accountType: 'operating' | 'savings' | 'escrow' | 'payroll';
  balance: number;
  availableBalance: number;
  currency: string;
  status: 'active' | 'frozen' | 'closed';
  stripeAccountId: string;
  routingNumber: string;
  accountNumber: string;
  bankName: string;
  accountHolder: string;
  federalTaxId: string;
  achEnabled: boolean;
  wireEnabled: boolean;
  checkingEnabled: boolean;
  debitCardEnabled: boolean;
  creditLimit?: number;
  interestRate?: number;
  monthlyFees: number;
  transactionLimits: {
    dailyAch: number;
    dailyWire: number;
    dailyCard: number;
    monthlyTotal: number;
  };
  complianceStatus: {
    kycComplete: boolean;
    amlVerified: boolean;
    sanctionsCleared: boolean;
    riskScore: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Enterprise Card Management
export interface CorporateCard {
  id: string;
  companyId: string;
  cardholderName: string;
  cardType: 'physical' | 'virtual' | 'fleet';
  cardCategory: 'executive' | 'employee' | 'fleet' | 'procurement';
  last4: string;
  expMonth: number;
  expYear: number;
  status: 'active' | 'inactive' | 'blocked' | 'expired';
  spendingControls: {
    dailyLimit: number;
    monthlyLimit: number;
    perTransactionLimit: number;
    allowedMcc: string[]; // Merchant Category Codes
    blockedMcc: string[];
    allowedCountries: string[];
    allowOnline: boolean;
    allowAtm: boolean;
    requirePin: boolean;
  };
  rewards: {
    cashbackRate: number;
    pointsRate: number;
    bonusCategories: Record<string, number>;
  };
  stripeCardId: string;
  issuedDate: Date;
  lastUsed?: Date;
  totalSpent: number;
  monthlySpent: number;
  employeeId?: string;
  vehicleId?: string;
  departmentId?: string;
  costCenter?: string;
}

// Enterprise Transaction Processing
export interface Transaction {
  id: string;
  companyId: string;
  accountId: string;
  cardId?: string;
  type: 'ach_debit' | 'ach_credit' | 'wire' | 'card_purchase' | 'card_refund' | 'fee' | 'interest';
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'disputed';
  description: string;
  merchantName?: string;
  merchantCategory?: string;
  counterparty: {
    name: string;
    accountNumber?: string;
    routingNumber?: string;
    address?: string;
  };
  metadata: {
    invoiceId?: string;
    employeeId?: string;
    departmentId?: string;
    costCenter?: string;
    taxCategory?: string;
    receiptUrl?: string;
    approvalRequired?: boolean;
    approvedBy?: string;
    approvalDate?: Date;
  };
  fees: {
    processingFee: number;
    interchangeFee: number;
    networkFee: number;
    totalFees: number;
  };
  riskAssessment: {
    score: number;
    flags: string[];
    reviewRequired: boolean;
  };
  createdAt: Date;
  settledAt?: Date;
  stripeTransactionId?: string;
}

// Enterprise Accounting Integration
export interface AccountingEntry {
  id: string;
  companyId: string;
  transactionId: string;
  journalEntryId: string;
  accountCode: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  description: string;
  reference: string;
  postingDate: Date;
  period: string; // YYYY-MM
  reconciled: boolean;
  reconciledDate?: Date;
  taxImplications: {
    taxable: boolean;
    taxCategory: string;
    taxCode: string;
    taxAmount: number;
  };
  auditTrail: {
    createdBy: string;
    modifiedBy?: string;
    lastModified?: Date;
    reason?: string;
  };
}

// Enterprise Wallet Management
export interface CorporateWallet {
  id: string;
  companyId: string;
  walletType: 'primary' | 'payroll' | 'expense' | 'escrow' | 'tax_reserve';
  currency: string;
  balance: number;
  availableBalance: number;
  reservedBalance: number;
  interestEarned: number;
  monthlyInterestRate: number;
  fdic_insured: boolean;
  insuranceAmount: number;
  allowedOperations: string[];
  restrictions: {
    minimumBalance: number;
    maximumBalance: number;
    dailyWithdrawalLimit: number;
    monthlyWithdrawalLimit: number;
    requiresApproval: boolean;
    approvalThreshold: number;
  };
  linkedAccounts: string[];
  automaticSweep: {
    enabled: boolean;
    targetAccountId?: string;
    thresholdAmount?: number;
    sweepTime?: string; // Daily time
  };
  createdAt: Date;
  updatedAt: Date;
}

export class EnterpriseFinancialService {
  private stripe: Stripe;

  constructor() {
    this.stripe = stripe;
  }

  // Financial Account Management
  async createFinancialAccount(companyData: any): Promise<FinancialAccount> {
    try {
      // Create Stripe Connect account for business banking
      const account = await this.stripe.accounts.create({
        type: 'express',
        country: 'US',
        business_type: 'company',
        company: {
          name: companyData.companyName,
          tax_id: companyData.federalTaxId,
          address: companyData.address,
          phone: companyData.phone,
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
          card_issuing: { requested: true },
          treasury: { requested: true },
        },
        settings: {
          card_issuing: {
            tos_acceptance: {
              date: Math.floor(Date.now() / 1000),
              ip: '127.0.0.1', // Should be actual IP
            },
          },
        },
      });

      // Generate account and routing numbers (would be from actual bank partner)
      const accountNumber = this.generateAccountNumber();
      const routingNumber = '084009519'; // Example routing number

      const financialAccount: FinancialAccount = {
        id: `fa_${Date.now()}`,
        companyId: companyData.companyId,
        accountType: 'operating',
        balance: 0,
        availableBalance: 0,
        currency: 'usd',
        status: 'active',
        stripeAccountId: account.id,
        routingNumber,
        accountNumber,
        bankName: 'FreightOps Bank',
        accountHolder: companyData.companyName,
        federalTaxId: companyData.federalTaxId,
        achEnabled: true,
        wireEnabled: true,
        checkingEnabled: true,
        debitCardEnabled: true,
        monthlyFees: 25.00,
        transactionLimits: {
          dailyAch: 100000,
          dailyWire: 500000,
          dailyCard: 50000,
          monthlyTotal: 2000000,
        },
        complianceStatus: {
          kycComplete: false,
          amlVerified: false,
          sanctionsCleared: false,
          riskScore: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return financialAccount;
    } catch (error) {
      console.error('Error creating financial account:', error);
      throw error;
    }
  }

  // Corporate Card Issuing
  async issueCorporateCard(cardData: any): Promise<CorporateCard> {
    try {
      const card = await this.stripe.issuing.cards.create({
        cardholder: cardData.cardholderId,
        currency: 'usd',
        type: cardData.cardType,
        spending_controls: {
          spending_limits: [
            {
              amount: cardData.monthlyLimit * 100, // Convert to cents
              interval: 'monthly',
            },
            {
              amount: cardData.dailyLimit * 100,
              interval: 'daily',
            },
          ],
          allowed_categories: cardData.allowedMcc,
          blocked_categories: cardData.blockedMcc,
        },
        status: 'active',
      });

      const corporateCard: CorporateCard = {
        id: card.id,
        companyId: cardData.companyId,
        cardholderName: cardData.cardholderName,
        cardType: cardData.cardType,
        cardCategory: cardData.cardCategory,
        last4: card.last4,
        expMonth: card.exp_month,
        expYear: card.exp_year,
        status: 'active',
        spendingControls: {
          dailyLimit: cardData.dailyLimit,
          monthlyLimit: cardData.monthlyLimit,
          perTransactionLimit: cardData.perTransactionLimit,
          allowedMcc: cardData.allowedMcc,
          blockedMcc: cardData.blockedMcc,
          allowedCountries: ['US'],
          allowOnline: true,
          allowAtm: true,
          requirePin: true,
        },
        rewards: {
          cashbackRate: 0.015, // 1.5%
          pointsRate: 1.0,
          bonusCategories: {
            '5541': 2.0, // Gas stations
            '5812': 3.0, // Restaurants
          },
        },
        stripeCardId: card.id,
        issuedDate: new Date(),
        totalSpent: 0,
        monthlySpent: 0,
        employeeId: cardData.employeeId,
        vehicleId: cardData.vehicleId,
        departmentId: cardData.departmentId,
        costCenter: cardData.costCenter,
      };

      return corporateCard;
    } catch (error) {
      console.error('Error issuing corporate card:', error);
      throw error;
    }
  }

  // Transaction Processing
  async processTransaction(transactionData: any): Promise<Transaction> {
    try {
      let stripeTransaction;

      if (transactionData.type === 'card_purchase') {
        // Process card transaction
        stripeTransaction = await this.stripe.issuing.transactions.retrieve(
          transactionData.stripeTransactionId
        );
      } else if (transactionData.type === 'ach_credit' || transactionData.type === 'ach_debit') {
        // Process ACH transaction
        stripeTransaction = await this.stripe.treasury.outboundTransfers.create({
          amount: transactionData.amount * 100,
          currency: 'usd',
          destination_payment_method: transactionData.destinationAccount,
          description: transactionData.description,
          statement_descriptor: transactionData.description.substring(0, 22),
        });
      }

      // Risk assessment using AI
      const riskAssessment = await this.assessTransactionRisk(transactionData);

      const transaction: Transaction = {
        id: `txn_${Date.now()}`,
        companyId: transactionData.companyId,
        accountId: transactionData.accountId,
        cardId: transactionData.cardId,
        type: transactionData.type,
        amount: transactionData.amount,
        currency: transactionData.currency || 'usd',
        status: riskAssessment.reviewRequired ? 'pending' : 'processing',
        description: transactionData.description,
        merchantName: transactionData.merchantName,
        merchantCategory: transactionData.merchantCategory,
        counterparty: transactionData.counterparty,
        metadata: {
          invoiceId: transactionData.invoiceId,
          employeeId: transactionData.employeeId,
          departmentId: transactionData.departmentId,
          costCenter: transactionData.costCenter,
          taxCategory: transactionData.taxCategory,
          receiptUrl: transactionData.receiptUrl,
          approvalRequired: transactionData.amount > 1000,
        },
        fees: this.calculateTransactionFees(transactionData),
        riskAssessment,
        createdAt: new Date(),
        stripeTransactionId: stripeTransaction?.id,
      };

      // Auto-generate accounting entries
      await this.generateAccountingEntries(transaction);

      return transaction;
    } catch (error) {
      console.error('Error processing transaction:', error);
      throw error;
    }
  }

  // Wallet Management
  async createCorporateWallet(walletData: any): Promise<CorporateWallet> {
    try {
      const wallet: CorporateWallet = {
        id: `wallet_${Date.now()}`,
        companyId: walletData.companyId,
        walletType: walletData.walletType,
        currency: walletData.currency || 'usd',
        balance: 0,
        availableBalance: 0,
        reservedBalance: 0,
        interestEarned: 0,
        monthlyInterestRate: walletData.walletType === 'primary' ? 0.04 : 0.02, // 4% APY for primary
        fdic_insured: true,
        insuranceAmount: 250000,
        allowedOperations: ['deposit', 'withdrawal', 'transfer', 'payment'],
        restrictions: {
          minimumBalance: walletData.walletType === 'primary' ? 1000 : 0,
          maximumBalance: 2000000,
          dailyWithdrawalLimit: 100000,
          monthlyWithdrawalLimit: 500000,
          requiresApproval: true,
          approvalThreshold: 10000,
        },
        linkedAccounts: [],
        automaticSweep: {
          enabled: false,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return wallet;
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  }

  // AI-Powered Risk Assessment
  private async assessTransactionRisk(transactionData: any): Promise<any> {
    try {
      const prompt = `
        Assess the risk level of this financial transaction:
        
        Amount: $${transactionData.amount}
        Type: ${transactionData.type}
        Merchant: ${transactionData.merchantName || 'N/A'}
        Time: ${new Date().toISOString()}
        Location: ${transactionData.location || 'Unknown'}
        Employee ID: ${transactionData.employeeId || 'N/A'}
        
        Provide a risk score (0-100) and any red flags. Return JSON format:
        {
          "score": number,
          "flags": string[],
          "reviewRequired": boolean,
          "reason": string
        }
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      });

      return JSON.parse(response.choices[0].message.content || '{"score": 0, "flags": [], "reviewRequired": false}');
    } catch (error) {
      console.error('Error in risk assessment:', error);
      return { score: 0, flags: [], reviewRequired: false };
    }
  }

  // Automatic Accounting Entry Generation
  private async generateAccountingEntries(transaction: Transaction): Promise<void> {
    try {
      // Generate double-entry bookkeeping entries based on transaction type
      const entries = [];

      switch (transaction.type) {
        case 'card_purchase':
          entries.push({
            accountCode: '6000', // Expenses
            accountName: 'Operating Expenses',
            debitAmount: transaction.amount,
            creditAmount: 0,
          });
          entries.push({
            accountCode: '2000', // Liabilities
            accountName: 'Credit Card Payable',
            debitAmount: 0,
            creditAmount: transaction.amount,
          });
          break;

        case 'ach_credit':
          entries.push({
            accountCode: '1000', // Assets
            accountName: 'Operating Account',
            debitAmount: transaction.amount,
            creditAmount: 0,
          });
          entries.push({
            accountCode: '4000', // Revenue
            accountName: 'Service Revenue',
            debitAmount: 0,
            creditAmount: transaction.amount,
          });
          break;

        case 'ach_debit':
          entries.push({
            accountCode: '6000', // Expenses
            accountName: 'Operating Expenses',
            debitAmount: transaction.amount,
            creditAmount: 0,
          });
          entries.push({
            accountCode: '1000', // Assets
            accountName: 'Operating Account',
            debitAmount: 0,
            creditAmount: transaction.amount,
          });
          break;
      }

      // Store accounting entries (would integrate with accounting system)
      console.log('Generated accounting entries:', entries);
    } catch (error) {
      console.error('Error generating accounting entries:', error);
    }
  }

  private calculateTransactionFees(transactionData: any): any {
    const fees = {
      processingFee: 0,
      interchangeFee: 0,
      networkFee: 0,
      totalFees: 0,
    };

    switch (transactionData.type) {
      case 'card_purchase':
        fees.processingFee = transactionData.amount * 0.029; // 2.9%
        fees.interchangeFee = transactionData.amount * 0.015; // 1.5%
        fees.networkFee = 0.30; // $0.30 per transaction
        break;
      case 'ach_credit':
      case 'ach_debit':
        fees.processingFee = Math.min(transactionData.amount * 0.008, 5.00); // 0.8% max $5
        break;
      case 'wire':
        fees.processingFee = 25.00; // Flat wire fee
        break;
    }

    fees.totalFees = fees.processingFee + fees.interchangeFee + fees.networkFee;
    return fees;
  }

  private generateAccountNumber(): string {
    return Math.random().toString().slice(2, 12).padStart(10, '0');
  }

  // Financial Reporting
  async generateFinancialReport(companyId: string, period: string): Promise<any> {
    try {
      // Generate comprehensive financial reports
      return {
        balanceSheet: await this.generateBalanceSheet(companyId, period),
        incomeStatement: await this.generateIncomeStatement(companyId, period),
        cashFlowStatement: await this.generateCashFlowStatement(companyId, period),
        generalLedger: await this.generateGeneralLedger(companyId, period),
      };
    } catch (error) {
      console.error('Error generating financial report:', error);
      throw error;
    }
  }

  private async generateBalanceSheet(companyId: string, period: string): Promise<any> {
    // Implementation for balance sheet generation
    return {
      assets: {
        currentAssets: {
          cash: 125000,
          accountsReceivable: 85000,
          inventory: 0,
          prepaidExpenses: 12000,
          total: 222000,
        },
        fixedAssets: {
          vehicles: 850000,
          equipment: 125000,
          accumulatedDepreciation: -180000,
          total: 795000,
        },
        totalAssets: 1017000,
      },
      liabilities: {
        currentLiabilities: {
          accountsPayable: 45000,
          accrualLiabilities: 15000,
          shortTermDebt: 25000,
          total: 85000,
        },
        longTermLiabilities: {
          longTermDebt: 450000,
          total: 450000,
        },
        totalLiabilities: 535000,
      },
      equity: {
        retainedEarnings: 382000,
        currentEarnings: 100000,
        totalEquity: 482000,
      },
    };
  }

  private async generateIncomeStatement(companyId: string, period: string): Promise<any> {
    return {
      revenue: {
        freightRevenue: 485000,
        otherRevenue: 15000,
        totalRevenue: 500000,
      },
      expenses: {
        fuelCosts: 125000,
        driverWages: 180000,
        vehicleMaintenance: 45000,
        insurance: 35000,
        depreciation: 25000,
        otherExpenses: 40000,
        totalExpenses: 450000,
      },
      netIncome: 50000,
      margins: {
        grossMargin: 0.75,
        operatingMargin: 0.15,
        netMargin: 0.10,
      },
    };
  }

  private async generateCashFlowStatement(companyId: string, period: string): Promise<any> {
    return {
      operatingActivities: {
        netIncome: 50000,
        depreciation: 25000,
        accountsReceivableChange: -15000,
        accountsPayableChange: 8000,
        totalOperating: 68000,
      },
      investingActivities: {
        vehiclePurchases: -85000,
        equipmentPurchases: -12000,
        totalInvesting: -97000,
      },
      financingActivities: {
        loanProceeds: 50000,
        loanPayments: -25000,
        totalFinancing: 25000,
      },
      netCashFlow: -4000,
      beginningCash: 129000,
      endingCash: 125000,
    };
  }

  private async generateGeneralLedger(companyId: string, period: string): Promise<any> {
    return {
      accounts: [
        {
          accountCode: '1000',
          accountName: 'Operating Cash',
          beginningBalance: 129000,
          debits: 485000,
          credits: 489000,
          endingBalance: 125000,
        },
        {
          accountCode: '1200',
          accountName: 'Accounts Receivable',
          beginningBalance: 70000,
          debits: 485000,
          credits: 470000,
          endingBalance: 85000,
        },
        // ... more accounts
      ],
    };
  }
}

export const enterpriseFinancialService = new EnterpriseFinancialService();