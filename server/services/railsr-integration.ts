/**
 * Railsr Integration Service
 * Business logic for FreightOps Pro banking integration
 */

import { storage } from '../storage';
import { RailsrService } from './railsr-service';
import { randomUUID } from 'crypto';

export class RailsrIntegration {
  private railsrService: RailsrService;

  constructor() {
    this.railsrService = new RailsrService();
  }

  /**
   * Initialize banking for a company
   */
  async initializeCompanyBanking(companyId: string): Promise<any> {
    try {
      // Get company details
      const company = await storage.getCompany(companyId);
      if (!company) {
        throw new Error('Company not found');
      }

      // Check if already initialized
      if (company.railsrEnduserId) {
        return {
          message: 'Banking already initialized',
          enduserId: company.railsrEnduserId,
          ledgerId: company.railsrLedgerId
        };
      }

      // Create enduser in Railsr
      const enduser = await this.railsrService.createEnduser({
        name: company.name,
        email: company.email,
        phone: company.phone,
        address: company.address,
        city: company.city || 'Unknown',
        postalCode: company.postalCode || '00000',
        country: 'US'
      });

      // Create USD ledger
      const ledger = await this.railsrService.createLedger(enduser.enduser_id, 'usd');

      // Update company with Railsr IDs
      await storage.updateCompany(companyId, {
        railsrEnduserId: enduser.enduser_id,
        railsrLedgerId: ledger.ledger_id,
        bankAccountNumber: ledger.account_number || null
      });

      return {
        message: 'Banking initialized successfully',
        enduserId: enduser.enduser_id,
        ledgerId: ledger.ledger_id,
        accountNumber: ledger.account_number
      };
    } catch (error: any) {
      throw new Error(`Failed to initialize banking: ${error.message}`);
    }
  }

  /**
   * Create driver card
   */
  async createDriverCard(companyId: string, driverId: string, cardData: any): Promise<any> {
    try {
      const company = await storage.getCompany(companyId);
      if (!company?.railsrLedgerId) {
        throw new Error('Company banking not initialized');
      }

      const driver = await storage.getDriver(driverId);
      if (!driver) {
        throw new Error('Driver not found');
      }

      // Create card in Railsr
      const card = await this.railsrService.createCard(
        company.railsrLedgerId,
        cardData.cardType || 'debit_card'
      );

      // Store card information
      const cardRecord = {
        id: randomUUID(),
        companyId,
        driverId,
        railsrCardId: card.card_id,
        cardType: cardData.cardType || 'debit_card',
        status: 'active',
        lastFour: card.last_four || '0000',
        expiryMonth: card.expiry_month || '12',
        expiryYear: card.expiry_year || '2025',
        dailyLimit: cardData.dailyLimit || 500,
        monthlyLimit: cardData.monthlyLimit || 5000
      };

      await storage.addDriverCard(cardRecord);

      return {
        message: 'Driver card created successfully',
        cardId: card.card_id,
        cardDetails: cardRecord
      };
    } catch (error: any) {
      throw new Error(`Failed to create driver card: ${error.message}`);
    }
  }

  /**
   * Process vendor payment
   */
  async processVendorPayment(companyId: string, paymentData: any): Promise<any> {
    try {
      const company = await storage.getCompany(companyId);
      if (!company?.railsrEnduserId || !company?.railsrLedgerId) {
        throw new Error('Company banking not initialized');
      }

      // Create beneficiary if not exists
      let beneficiary;
      try {
        beneficiary = await this.railsrService.createBeneficiary(company.railsrEnduserId, {
          name: paymentData.vendorName,
          email: paymentData.vendorEmail,
          accountNumber: paymentData.accountNumber,
          routingNumber: paymentData.routingNumber
        });
      } catch (error: any) {
        // If beneficiary already exists, continue
        if (error.message.includes('already exists')) {
          beneficiary = { beneficiary_id: paymentData.beneficiaryId };
        } else {
          throw error;
        }
      }

      // Process payment
      const payment = await this.railsrService.processPayment(
        company.railsrLedgerId,
        beneficiary.beneficiary_id,
        paymentData.amount,
        paymentData.reference || `Payment to ${paymentData.vendorName}`
      );

      // Store payment record
      const paymentRecord = {
        id: randomUUID(),
        companyId,
        railsrTransactionId: payment.transaction_id,
        vendorName: paymentData.vendorName,
        amount: paymentData.amount,
        reference: paymentData.reference,
        status: 'pending',
        createdAt: new Date()
      };

      await storage.addPaymentRecord(paymentRecord);

      return {
        message: 'Payment processed successfully',
        transactionId: payment.transaction_id,
        paymentRecord
      };
    } catch (error: any) {
      throw new Error(`Failed to process vendor payment: ${error.message}`);
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(companyId: string): Promise<any> {
    try {
      const company = await storage.getCompany(companyId);
      if (!company?.railsrLedgerId) {
        throw new Error('Company banking not initialized');
      }

      const balance = await this.railsrService.getLedgerBalance(company.railsrLedgerId);
      
      return {
        ledgerId: company.railsrLedgerId,
        balance: balance.balance || 0,
        currency: balance.currency || 'USD',
        status: balance.status || 'active'
      };
    } catch (error: any) {
      throw new Error(`Failed to get account balance: ${error.message}`);
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(companyId: string, options: any = {}): Promise<any> {
    try {
      const company = await storage.getCompany(companyId);
      if (!company?.railsrLedgerId) {
        throw new Error('Company banking not initialized');
      }

      const transactions = await this.railsrService.getTransactions(
        company.railsrLedgerId,
        options
      );
      
      return {
        ledgerId: company.railsrLedgerId,
        transactions: transactions.transactions || [],
        totalCount: transactions.total_count || 0
      };
    } catch (error: any) {
      throw new Error(`Failed to get transaction history: ${error.message}`);
    }
  }

  /**
   * Setup webhooks for real-time notifications
   */
  async setupWebhooks(companyId: string): Promise<any> {
    try {
      const webhookUrl = `${process.env.BASE_URL || 'https://your-app.replit.app'}/api/railsr/webhook`;
      
      const webhook = await this.railsrService.setupWebhooks(webhookUrl);
      
      return {
        message: 'Webhooks setup successfully',
        webhookId: webhook.webhook_id,
        url: webhookUrl,
        events: webhook.events
      };
    } catch (error: any) {
      throw new Error(`Failed to setup webhooks: ${error.message}`);
    }
  }

  /**
   * Currency exchange
   */
  async currencyExchange(companyId: string, exchangeData: any): Promise<any> {
    try {
      const rates = await this.railsrService.getExchangeRates();
      
      const fromCurrency = exchangeData.fromCurrency.toUpperCase();
      const toCurrency = exchangeData.toCurrency.toUpperCase();
      const amount = exchangeData.amount;
      
      // Calculate exchange (simplified)
      const rate = rates[`${fromCurrency}_${toCurrency}`] || 1;
      const exchangedAmount = amount * rate;
      
      return {
        message: 'Currency exchange calculated',
        fromCurrency,
        toCurrency,
        amount,
        rate,
        exchangedAmount,
        fees: exchangedAmount * 0.01 // 1% fee
      };
    } catch (error: any) {
      throw new Error(`Failed to process currency exchange: ${error.message}`);
    }
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<any> {
    return await this.railsrService.testConnection();
  }
}