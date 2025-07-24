import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

interface PlaidCredentials {
  companyId: string;
  accessToken: string;
  accountId: string;
  institutionName: string;
  accountName: string;
  accountType: string;
  connectedAt: Date;
}

interface BankTransaction {
  id: string;
  accountId: string;
  amount: number;
  date: string;
  description: string;
  category: string[];
  merchantName?: string;
  pending: boolean;
  transactionType: 'debit' | 'credit';
  rawData: any;
}

interface TransactionMatch {
  bankTransactionId: string;
  loadId?: string;
  expenseId?: string;
  invoiceId?: string;
  matchType: 'load_payment' | 'fuel_expense' | 'maintenance' | 'driver_pay' | 'other';
  confidence: number;
  matchedAt: Date;
  verifiedAt?: Date;
  status: 'suggested' | 'confirmed' | 'rejected';
}

export class PlaidBankingService {
  private plaid: PlaidApi;
  private credentials: Map<string, PlaidCredentials> = new Map();
  private transactions: Map<string, BankTransaction[]> = new Map();
  private matches: Map<string, TransactionMatch[]> = new Map();

  constructor() {
    this.plaid = new PlaidApi(new Configuration({
      basePath: process.env.PLAID_ENV === 'production' 
        ? PlaidEnvironments.production 
        : PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
          'PLAID-SECRET': process.env.PLAID_SECRET,
        },
      },
    }));
  }

  // Create Link Token for bank connection
  async createLinkToken(companyId: string, userId: string): Promise<string> {
    try {
      const response = await this.plaid.linkTokenCreate({
        user: {
          client_user_id: userId,
        },
        client_name: 'FreightOps Pro',
        products: ['transactions', 'accounts'],
        country_codes: ['US'],
        language: 'en',
        account_filters: {
          depository: {
            account_subtypes: ['checking', 'savings'],
          },
        },
      });

      return response.data.link_token;
    } catch (error: any) {
      console.error('Plaid Link Token creation failed:', error);
      throw new Error('Failed to create bank connection token');
    }
  }

  // Exchange public token for access token
  async exchangePublicToken(companyId: string, publicToken: string): Promise<PlaidCredentials> {
    try {
      const response = await this.plaid.linkTokenExchange({
        public_token: publicToken,
      });

      const accessToken = response.data.access_token;
      
      // Get account information
      const accountsResponse = await this.plaid.accountsGet({
        access_token: accessToken,
      });

      const account = accountsResponse.data.accounts[0]; // Use first account
      const institution = accountsResponse.data.item.institution_id;

      const credentials: PlaidCredentials = {
        companyId,
        accessToken,
        accountId: account.account_id,
        institutionName: institution || 'Unknown Bank',
        accountName: account.name,
        accountType: account.subtype || 'checking',
        connectedAt: new Date(),
      };

      this.credentials.set(companyId, credentials);
      return credentials;
    } catch (error: any) {
      console.error('Plaid token exchange failed:', error);
      throw new Error('Failed to connect bank account');
    }
  }

  // Fetch recent transactions
  async fetchTransactions(companyId: string, startDate?: Date, endDate?: Date): Promise<BankTransaction[]> {
    const credentials = this.credentials.get(companyId);
    if (!credentials) {
      throw new Error('No bank connection found for company');
    }

    try {
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const end = endDate || new Date();

      const response = await this.plaid.transactionsGet({
        access_token: credentials.accessToken,
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0],
        count: 500,
      });

      const bankTransactions: BankTransaction[] = response.data.transactions.map(tx => ({
        id: tx.transaction_id,
        accountId: tx.account_id,
        amount: tx.amount,
        date: tx.date,
        description: tx.name,
        category: tx.category || [],
        merchantName: tx.merchant_name || undefined,
        pending: tx.pending,
        transactionType: tx.amount > 0 ? 'debit' : 'credit',
        rawData: tx,
      }));

      this.transactions.set(companyId, bankTransactions);
      return bankTransactions;
    } catch (error: any) {
      console.error('Failed to fetch transactions:', error);
      throw new Error('Failed to retrieve bank transactions');
    }
  }

  // Intelligent transaction matching
  async matchTransactions(companyId: string, loads: any[], expenses: any[]): Promise<TransactionMatch[]> {
    const transactions = this.transactions.get(companyId) || [];
    const matches: TransactionMatch[] = [];

    for (const transaction of transactions) {
      // Skip if already matched
      const existingMatches = this.matches.get(companyId) || [];
      if (existingMatches.some(m => m.bankTransactionId === transaction.id)) {
        continue;
      }

      // Match load payments (credits)
      if (transaction.transactionType === 'credit') {
        const loadMatch = this.findLoadMatch(transaction, loads);
        if (loadMatch) {
          matches.push({
            bankTransactionId: transaction.id,
            loadId: loadMatch.loadId,
            matchType: 'load_payment',
            confidence: loadMatch.confidence,
            matchedAt: new Date(),
            status: loadMatch.confidence > 0.8 ? 'confirmed' : 'suggested',
          });
          continue;
        }
      }

      // Match expenses (debits)
      if (transaction.transactionType === 'debit') {
        const expenseMatch = this.findExpenseMatch(transaction, expenses);
        if (expenseMatch) {
          matches.push({
            bankTransactionId: transaction.id,
            expenseId: expenseMatch.expenseId,
            matchType: expenseMatch.type,
            confidence: expenseMatch.confidence,
            matchedAt: new Date(),
            status: expenseMatch.confidence > 0.8 ? 'confirmed' : 'suggested',
          });
        }
      }
    }

    // Store matches
    const companyMatches = this.matches.get(companyId) || [];
    companyMatches.push(...matches);
    this.matches.set(companyId, companyMatches);

    return matches;
  }

  private findLoadMatch(transaction: BankTransaction, loads: any[]): { loadId: string; confidence: number } | null {
    for (const load of loads) {
      let confidence = 0;

      // Amount matching (within 5% tolerance)
      const amountDiff = Math.abs(Math.abs(transaction.amount) - load.rate) / load.rate;
      if (amountDiff < 0.05) confidence += 0.4;
      else if (amountDiff < 0.1) confidence += 0.2;

      // Customer name matching
      if (load.customerName && transaction.description.toLowerCase().includes(load.customerName.toLowerCase())) {
        confidence += 0.3;
      }

      // Load number matching
      if (load.loadNumber && transaction.description.includes(load.loadNumber)) {
        confidence += 0.3;
      }

      // Date proximity (within 7 days of delivery)
      if (load.deliveryDate) {
        const deliveryDate = new Date(load.deliveryDate);
        const transactionDate = new Date(transaction.date);
        const daysDiff = Math.abs((transactionDate.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 7) confidence += 0.2;
      }

      if (confidence > 0.5) {
        return { loadId: load.id, confidence };
      }
    }

    return null;
  }

  private findExpenseMatch(transaction: BankTransaction, expenses: any[]): { expenseId: string; type: string; confidence: number } | null {
    // Fuel expense matching
    if (this.isFuelTransaction(transaction)) {
      return this.matchFuelExpense(transaction, expenses);
    }

    // Maintenance expense matching
    if (this.isMaintenanceTransaction(transaction)) {
      return this.matchMaintenanceExpense(transaction, expenses);
    }

    // Driver pay matching
    if (this.isDriverPayTransaction(transaction)) {
      return this.matchDriverPay(transaction, expenses);
    }

    return null;
  }

  private isFuelTransaction(transaction: BankTransaction): boolean {
    const fuelKeywords = ['fuel', 'gas', 'diesel', 'pilot', 'loves', 'ta travel', 'flying j', 'shell', 'exxon', 'bp'];
    const description = transaction.description.toLowerCase();
    return fuelKeywords.some(keyword => description.includes(keyword));
  }

  private isMaintenanceTransaction(transaction: BankTransaction): boolean {
    const maintenanceKeywords = ['repair', 'maintenance', 'tire', 'parts', 'service', 'garage', 'mechanic'];
    const description = transaction.description.toLowerCase();
    return maintenanceKeywords.some(keyword => description.includes(keyword));
  }

  private isDriverPayTransaction(transaction: BankTransaction): boolean {
    const payrollKeywords = ['payroll', 'salary', 'driver pay', 'wage'];
    const description = transaction.description.toLowerCase();
    return payrollKeywords.some(keyword => description.includes(keyword));
  }

  private matchFuelExpense(transaction: BankTransaction, expenses: any[]): { expenseId: string; type: string; confidence: number } | null {
    // Implementation for fuel expense matching
    return { expenseId: 'fuel-' + transaction.id, type: 'fuel_expense', confidence: 0.7 };
  }

  private matchMaintenanceExpense(transaction: BankTransaction, expenses: any[]): { expenseId: string; type: string; confidence: number } | null {
    // Implementation for maintenance expense matching
    return { expenseId: 'maint-' + transaction.id, type: 'maintenance', confidence: 0.6 };
  }

  private matchDriverPay(transaction: BankTransaction, expenses: any[]): { expenseId: string; type: string; confidence: number } | null {
    // Implementation for driver pay matching
    return { expenseId: 'pay-' + transaction.id, type: 'driver_pay', confidence: 0.8 };
  }

  // Get transaction matches for review
  async getTransactionMatches(companyId: string): Promise<{
    transactions: BankTransaction[];
    matches: TransactionMatch[];
    unmatched: BankTransaction[];
  }> {
    const transactions = this.transactions.get(companyId) || [];
    const matches = this.matches.get(companyId) || [];
    
    const matchedTransactionIds = new Set(matches.map(m => m.bankTransactionId));
    const unmatched = transactions.filter(tx => !matchedTransactionIds.has(tx.id));

    return {
      transactions,
      matches,
      unmatched,
    };
  }

  // Confirm or reject a suggested match
  async updateMatchStatus(companyId: string, bankTransactionId: string, status: 'confirmed' | 'rejected'): Promise<void> {
    const matches = this.matches.get(companyId) || [];
    const match = matches.find(m => m.bankTransactionId === bankTransactionId);
    
    if (match) {
      match.status = status;
      if (status === 'confirmed') {
        match.verifiedAt = new Date();
      }
    }
  }

  // Get bank connection status
  getBankConnectionStatus(companyId: string): PlaidCredentials | null {
    return this.credentials.get(companyId) || null;
  }

  // Disconnect bank account
  async disconnectBank(companyId: string): Promise<void> {
    this.credentials.delete(companyId);
    this.transactions.delete(companyId);
    this.matches.delete(companyId);
  }
}

export const plaidBankingService = new PlaidBankingService();