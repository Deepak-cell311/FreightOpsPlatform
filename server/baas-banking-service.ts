import { storage } from "./storage";

// Banking-as-a-Service provider integration
// Using Railsr - supports real ACH/wire receiving for trucking companies

export interface BaaSAccount {
  id: string;
  companyId: string;
  railsrAccountId: string; // Railsr account ID
  accountNumber: string;
  routingNumber: string;
  accountType: 'checking' | 'savings';
  status: 'active' | 'pending' | 'restricted' | 'closed';
  balance: number;
  availableBalance: number;
  currency: string;
  accountHolder: {
    businessName: string;
    ein: string;
    businessType: 'corporation' | 'llc' | 'partnership' | 'sole_proprietorship';
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
  features: {
    achReceiving: boolean;
    wireReceiving: boolean;
    checkDeposit: boolean;
    debitCards: boolean;
    billPay: boolean;
  };
  metadata: {
    createdAt: Date;
    lastActivity: Date;
    complianceStatus: 'verified' | 'pending' | 'rejected';
  };
}

export interface IncomingACHPayment {
  id: string;
  companyId: string;
  railsrTransactionId: string;
  amount: number;
  currency: string;
  originator: {
    name: string;
    routingNumber: string;
    accountNumber: string; // masked
    bankName?: string;
  };
  description: string;
  addendaRecords: string[]; // Customer reference data
  status: 'pending' | 'completed' | 'returned' | 'disputed';
  direction: 'credit' | 'debit';
  effectiveDate: Date;
  settlementDate?: Date;
  returnReason?: string;
  fees: {
    processingFee: number;
    platformFee: number;
  };
  metadata: {
    invoiceNumber?: string;
    customerReference?: string;
    loadNumber?: string;
  };
}

export interface WireTransfer {
  id: string;
  companyId: string;
  railsrTransactionId: string;
  amount: number;
  currency: string;
  originator: {
    name: string;
    bankName: string;
    accountNumber?: string; // masked
    routingNumber?: string;
    swiftCode?: string;
    address?: string;
  };
  beneficiary: {
    name: string;
    accountNumber: string;
    routingNumber: string;
  };
  wireDetails: {
    federalReference: string;
    typeCode: string;
    instructionCode?: string;
    purposeCode?: string;
  };
  status: 'pending' | 'completed' | 'rejected' | 'cancelled';
  receivedAt: Date;
  settledAt?: Date;
  fees: {
    incomingWireFee: number;
    platformFee: number;
  };
  description: string;
  metadata: {
    invoiceNumber?: string;
    customerReference?: string;
  };
}

export interface DebitCard {
  id: string;
  companyId: string;
  railsrCardId: string;
  cardNumber: string; // masked
  expirationDate: string;
  cardholderName: string;
  cardType: 'physical' | 'virtual';
  status: 'active' | 'inactive' | 'blocked' | 'expired';
  spendingLimits: {
    daily: number;
    monthly: number;
    perTransaction: number;
    atmDaily: number;
  };
  allowedCategories: string[];
  blockedCategories: string[];
  metadata: {
    assignedDriver?: string;
    purpose: 'fuel' | 'maintenance' | 'general' | 'emergency';
    issuedAt: Date;
    lastUsed?: Date;
  };
}

class BaaSBankingService {
  private railsrApiUrl = 'https://play.railsbank.com'; // Railsr sandbox environment
  private railsrApiToken = process.env.RAILSR_API_TOKEN;

  constructor() {
    if (!this.railsrApiToken) {
      console.warn('RAILSR_API_TOKEN not configured - BaaS features will not work');
    }
  }

  // Create business bank account for trucking company
  async createBusinessAccount(companyId: string, businessInfo: {
    businessName: string;
    ein: string;
    businessType: 'corporation' | 'llc' | 'partnership' | 'sole_proprietorship';
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    phone: string;
    website?: string;
    industry: string;
    annualRevenue?: number;
    numberOfEmployees?: number;
  }): Promise<BaaSAccount> {
    try {
      // Create application with Railsr
      const applicationResponse = await fetch(`${this.railsrApiUrl}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          'Authorization': `Bearer ${this.railsrApiToken}`,
        },
        body: JSON.stringify({
          data: {
            type: 'businessApplication',
            attributes: {
              name: businessInfo.businessName,
              ein: businessInfo.ein,
              entityType: businessInfo.businessType,
              stateOfIncorporation: businessInfo.address.state,
              address: {
                street: businessInfo.address.street,
                city: businessInfo.address.city,
                state: businessInfo.address.state,
                postalCode: businessInfo.address.zipCode,
                country: 'US',
              },
              phone: {
                countryCode: '1',
                number: businessInfo.phone.replace(/\D/g, ''),
              },
              contact: {
                fullName: businessInfo.businessName,
                email: `admin@${businessInfo.businessName.toLowerCase().replace(/\s/g, '')}.com`,
                phone: {
                  countryCode: '1',
                  number: businessInfo.phone.replace(/\D/g, ''),
                },
              },
              industry: 'Transportation', // Trucking industry
              website: businessInfo.website,
              businessVertical: 'Transportation',
            },
          },
        }),
      });

      if (!applicationResponse.ok) {
        throw new Error(`Railsr application failed: ${applicationResponse.statusText}`);
      }

      const application = await applicationResponse.json();
      const applicationId = application.data.id;

      // Create deposit account after application approval
      const accountResponse = await fetch(`${this.railsrApiUrl}/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          'Authorization': `Bearer ${this.railsrApiToken}`,
        },
        body: JSON.stringify({
          data: {
            type: 'depositAccount',
            attributes: {
              depositProduct: 'checking',
              tags: {
                companyId: companyId,
                platform: 'FreightOps',
                accountType: 'business',
              },
            },
            relationships: {
              customer: {
                data: {
                  type: 'businessCustomer',
                  id: applicationId,
                },
              },
            },
          },
        }),
      });

      if (!accountResponse.ok) {
        throw new Error(`Railsr account creation failed: ${accountResponse.statusText}`);
      }

      const account = await accountResponse.json();
      const railsrAccount = account.data;

      const baasAccount: BaaSAccount = {
        id: `baas_${Date.now()}`,
        companyId,
        railsrAccountId: railsrAccount.id,
        accountNumber: railsrAccount.attributes.routingNumber, // Railsr provides this
        routingNumber: railsrAccount.attributes.accountNumber, // Railsr provides this
        accountType: 'checking',
        status: 'pending',
        balance: 0,
        availableBalance: 0,
        currency: 'USD',
        accountHolder: businessInfo,
        features: {
          achReceiving: true,
          wireReceiving: true,
          checkDeposit: true,
          debitCards: true,
          billPay: true,
        },
        metadata: {
          createdAt: new Date(),
          lastActivity: new Date(),
          complianceStatus: 'pending',
        },
      };

      // Store in database
      await storage.createBaaSAccount(baasAccount);

      return baasAccount;
    } catch (error) {
      console.error('BaaS account creation error:', error);
      throw new Error('Failed to create business banking account');
    }
  }

  // Get incoming ACH payments
  async getIncomingACHPayments(companyId: string, startDate?: Date, endDate?: Date): Promise<IncomingACHPayment[]> {
    try {
      const account = await storage.getBaaSAccount(companyId);
      if (!account) {
        throw new Error('BaaS account not found');
      }

      const params = new URLSearchParams();
      if (startDate) params.append('filter[since]', startDate.toISOString());
      if (endDate) params.append('filter[until]', endDate.toISOString());
      params.append('filter[accountId]', account.railsrAccountId);
      params.append('filter[direction]', 'Credit');
      params.append('filter[type]', 'achTransaction');

      const response = await fetch(`${this.railsrApiUrl}/transactions?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.railsrApiToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ACH payments: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.data.map((tx: any) => ({
        id: `ach_${tx.id}`,
        companyId,
        railsrTransactionId: tx.id,
        amount: tx.attributes.amount / 100, // Convert from cents
        currency: 'USD',
        originator: {
          name: tx.attributes.counterparty?.name || 'Unknown',
          routingNumber: tx.attributes.counterparty?.routingNumber || '',
          accountNumber: `****${tx.attributes.counterparty?.accountNumber?.slice(-4) || ''}`,
          bankName: tx.attributes.counterparty?.bankName,
        },
        description: tx.attributes.description || '',
        addendaRecords: tx.attributes.addenda || [],
        status: tx.attributes.status.toLowerCase(),
        direction: tx.attributes.direction.toLowerCase(),
        effectiveDate: new Date(tx.attributes.createdAt),
        fees: {
          processingFee: 0.25,
          platformFee: tx.attributes.amount * 0.001, // 0.1% platform fee
        },
        metadata: {
          invoiceNumber: this.extractInvoiceNumber(tx.attributes.addenda),
          customerReference: tx.attributes.description,
        },
      }));
    } catch (error) {
      console.error('Get incoming ACH payments error:', error);
      throw error;
    }
  }

  // Get incoming wire transfers
  async getIncomingWireTransfers(companyId: string, startDate?: Date, endDate?: Date): Promise<WireTransfer[]> {
    try {
      const account = await storage.getBaaSAccount(companyId);
      if (!account) {
        throw new Error('BaaS account not found');
      }

      const params = new URLSearchParams();
      if (startDate) params.append('filter[since]', startDate.toISOString());
      if (endDate) params.append('filter[until]', endDate.toISOString());
      params.append('filter[accountId]', account.railsrAccountId);
      params.append('filter[direction]', 'Credit');
      params.append('filter[type]', 'wireTransaction');

      const response = await fetch(`${this.railsrApiUrl}/transactions?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.railsrApiToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch wire transfers: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.data.map((tx: any) => ({
        id: `wire_${tx.id}`,
        companyId,
        railsrTransactionId: tx.id,
        amount: tx.attributes.amount / 100,
        currency: 'USD',
        originator: {
          name: tx.attributes.counterparty?.name || 'Unknown',
          bankName: tx.attributes.counterparty?.bankName || '',
          routingNumber: tx.attributes.counterparty?.routingNumber,
          swiftCode: tx.attributes.counterparty?.swiftCode,
        },
        beneficiary: {
          name: account.accountHolder.businessName,
          accountNumber: account.accountNumber,
          routingNumber: account.routingNumber,
        },
        wireDetails: {
          federalReference: tx.attributes.federalReference || '',
          typeCode: tx.attributes.typeCode || '',
        },
        status: tx.attributes.status.toLowerCase(),
        receivedAt: new Date(tx.attributes.createdAt),
        fees: {
          incomingWireFee: 15.00, // Standard incoming wire fee
          platformFee: tx.attributes.amount * 0.002, // 0.2% platform fee for wires
        },
        description: tx.attributes.description || '',
        metadata: {
          invoiceNumber: this.extractInvoiceNumber([tx.attributes.description]),
          customerReference: tx.attributes.description,
        },
      }));
    } catch (error) {
      console.error('Get incoming wire transfers error:', error);
      throw error;
    }
  }

  // Issue debit card for trucking company
  async issueDebitCard(companyId: string, cardDetails: {
    cardholderName: string;
    purpose: 'fuel' | 'maintenance' | 'general' | 'emergency';
    spendingLimits: {
      daily: number;
      monthly: number;
      perTransaction: number;
    };
    allowedCategories?: string[];
    assignedDriver?: string;
  }): Promise<DebitCard> {
    try {
      const account = await storage.getBaaSAccount(companyId);
      if (!account) {
        throw new Error('BaaS account not found');
      }

      const cardResponse = await fetch(`${this.railsrApiUrl}/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          'Authorization': `Bearer ${this.railsrApiToken}`,
        },
        body: JSON.stringify({
          data: {
            type: 'individualDebitCard',
            attributes: {
              spendingLimits: {
                daily: cardDetails.spendingLimits.daily * 100,
                monthly: cardDetails.spendingLimits.monthly * 100,
                perTransaction: cardDetails.spendingLimits.perTransaction * 100,
              },
              design: 'default',
              tags: {
                companyId: companyId,
                purpose: cardDetails.purpose,
                assignedDriver: cardDetails.assignedDriver,
              },
            },
            relationships: {
              account: {
                data: {
                  type: 'depositAccount',
                  id: account.railsrAccountId,
                },
              },
            },
          },
        }),
      });

      if (!cardResponse.ok) {
        throw new Error(`Card creation failed: ${cardResponse.statusText}`);
      }

      const card = await cardResponse.json();
      const railsrCard = card.data;

      const debitCard: DebitCard = {
        id: `card_${Date.now()}`,
        companyId,
        railsrCardId: railsrCard.id,
        cardNumber: `****-****-****-${railsrCard.attributes.last4Digits}`,
        expirationDate: railsrCard.attributes.expirationDate,
        cardholderName: cardDetails.cardholderName,
        cardType: 'physical',
        status: 'active',
        spendingLimits: {
        ...cardDetails.spendingLimits,
        atmDaily: cardDetails.spendingLimits.daily * 0.5, // Default ATM limit to 50% of daily limit
      },
        allowedCategories: cardDetails.allowedCategories || ['gas_stations', 'automotive_parts_and_accessories'],
        blockedCategories: ['gambling', 'adult_entertainment'],
        metadata: {
          assignedDriver: cardDetails.assignedDriver,
          purpose: cardDetails.purpose,
          issuedAt: new Date(),
        },
      };

      await storage.createDebitCard(debitCard);

      return debitCard;
    } catch (error) {
      console.error('Debit card issuance error:', error);
      throw error;
    }
  }

  // Generate payment instructions for customers
  async generatePaymentInstructions(companyId: string, invoiceAmount: number, invoiceNumber: string): Promise<{
    ach: string;
    wire: string;
    check: string;
  }> {
    try {
      const account = await storage.getBaaSAccount(companyId);
      if (!account) {
        throw new Error('BaaS account not found');
      }

      return {
        ach: `ACH Payment Instructions:
Bank Name: Railsr Bank
Routing Number: ${account.routingNumber}
Account Number: ${account.accountNumber}
Account Holder: ${account.accountHolder.businessName}
Amount: $${invoiceAmount.toFixed(2)}
Reference: Invoice ${invoiceNumber}

Processing Time: 1-3 business days
ACH Fee: $0.25`,

        wire: `Wire Transfer Instructions:
Bank Name: Railsr Bank
Routing Number: ${account.routingNumber}
Account Number: ${account.accountNumber}
SWIFT Code: RAILSRBANK
Bank Address: Railsr Financial Services
Account Holder: ${account.accountHolder.businessName}
Amount: $${invoiceAmount.toFixed(2)}
Reference: Invoice ${invoiceNumber}

Processing Time: Same day
Wire Fee: $15.00`,

        check: `Check Payment Instructions:
Pay to the Order of: ${account.accountHolder.businessName}
Mail to:
${account.accountHolder.businessName}
${account.accountHolder.address.street}
${account.accountHolder.address.city}, ${account.accountHolder.address.state} ${account.accountHolder.address.zipCode}

Amount: $${invoiceAmount.toFixed(2)}
Memo: Invoice ${invoiceNumber}

Processing Time: 3-5 business days after receipt`,
      };
    } catch (error) {
      console.error('Payment instructions generation error:', error);
      throw error;
    }
  }

  // Sync account balance from Railsr
  async syncAccountBalance(companyId: string): Promise<BaaSAccount> {
    try {
      const account = await storage.getBaaSAccount(companyId);
      if (!account) {
        throw new Error('BaaS account not found');
      }

      const response = await fetch(`${this.railsrApiUrl}/accounts/${account.railsrAccountId}`, {
        headers: {
          'Authorization': `Bearer ${this.railsrApiToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to sync balance: ${response.statusText}`);
      }

      const data = await response.json();
      const railsrAccount = data.data;

      const updatedAccount = {
        ...account,
        balance: railsrAccount.attributes.balance / 100,
        availableBalance: railsrAccount.attributes.available / 100,
        status: railsrAccount.attributes.status === 'Open' ? 'active' : 'restricted',
        metadata: {
          ...account.metadata,
          lastActivity: new Date(),
        },
      };

      await storage.updateBaaSAccount(account.id, updatedAccount);

      return updatedAccount;
    } catch (error) {
      console.error('Balance sync error:', error);
      throw error;
    }
  }

  // Utility function to extract invoice numbers from payment descriptions
  private extractInvoiceNumber(addendaRecords: string[]): string | undefined {
    for (const record of addendaRecords) {
      const match = record.match(/(?:invoice|inv|#)\s*(\w+)/i);
      if (match) {
        return match[1];
      }
    }
    return undefined;
  }
}

export const baasBankingService = new BaaSBankingService();