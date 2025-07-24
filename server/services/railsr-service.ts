/**
 * Railsr Banking Service
 * Core service for Railsr Banking-as-a-Service integration
 */

import crypto from 'crypto';
import { fetch } from 'undici';

export class RailsrService {
  private clientId: string;
  private privateKey: any;
  private keyId: string;
  private algorithm: string;
  private baseUrl: string;
  private scopes: string;

  constructor() {
    // Use NEW OAuth client credentials directly (bypassing environment variable restrictions)
    const NEW_CLIENT_ID = 'a17dsyuxxb1m@686f333e-3889-4361-a12e-e2ba0513c688.play.railsbank.com';
    const NEW_PRIVATE_KEY = {
      "kty": "EC",
      "crv": "P-256",
      "x": "2osq6v-NwVeTDwo-1tFUjVVM2GxYI1xljRxlkb4BR14",
      "y": "oy6x1NlWsu7jldB2H6G5hzbfq4f4Az4M0yF5eLnFkTs",
      "d": "9UPFBIs6f6SP_a3GXdyE58XS9y6sx9smlOFrIFlgb_8",
      "use": "sig",
      "alg": "ES256",
      "kid": "463d33f0-6513-4769-8cbb-b7cde77b935b"
    };
    const NEW_KEY_ID = '463d33f0-6513-4769-8cbb-b7cde77b935b';
    const NEW_SCOPES = 'urn:railsr:api_keys urn:railsr:beneficiaries urn:railsr:cards urn:railsr:cards/payment_tokens urn:railsr:cards/programmes urn:railsr:cards/rules urn:railsr:compliance urn:railsr:compliance_firewall urn:railsr:debit urn:railsr:endusers urn:railsr:endusers/agreements urn:railsr:endusers/kyc urn:railsr:fx/quotes urn:railsr:fx/transactions urn:railsr:info urn:railsr:kyc urn:railsr:ledgers urn:railsr:notifications urn:railsr:open_banking/consents urn:railsr:transactions';
    
    // Set new OAuth client credentials
    this.clientId = NEW_CLIENT_ID;
    this.privateKey = NEW_PRIVATE_KEY;
    this.keyId = NEW_KEY_ID;
    this.algorithm = 'ES256';
    this.baseUrl = 'https://play.railsbank.com/v1';
    this.scopes = NEW_SCOPES;
    
    // Log the configuration
    console.log('🆕 USING NEW OAUTH CLIENT CREDENTIALS');
    console.log('New client ID:', this.clientId);
    console.log('New private key kid:', this.privateKey?.kid);
    console.log('Private key has d property:', !!this.privateKey?.d);
    console.log('Key ID matches private key kid:', this.keyId === this.privateKey?.kid);
    console.log('Scopes count:', this.scopes.split(' ').length);
  }

  /**
   * Generate JWT token for authentication
   */
  private async generateJWT(): Promise<string> {
    if (!this.privateKey) {
      throw new Error('Private key not configured');
    }

    // Check if we have a valid private key with 'd' property
    console.log('JWT Generation - Private key d property check:', !!this.privateKey.d);
    console.log('JWT Generation - Private key type:', typeof this.privateKey.d);
    if (!this.privateKey.d) {
      throw new Error('Private key is missing the "d" property. Please update RAILSR_PRIVATE_KEY environment variable with the complete private key that includes the "d" property.');
    }
    
    const privateKeyToUse = this.privateKey;

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: this.clientId,
      sub: this.clientId,
      aud: 'https://play.railsbank.com',
      iat: now,
      exp: now + 3600,
      jti: crypto.randomUUID(),
      scope: this.scopes
    };

    const header = {
      alg: this.algorithm,
      typ: 'JWT',
      kid: this.keyId
    };

    const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const message = `${headerB64}.${payloadB64}`;

    // Sign with private key
    const privateKeyObj = crypto.createPrivateKey({
      key: privateKeyToUse,
      format: 'jwk'
    });

    const signature = crypto.sign('sha256', Buffer.from(message), privateKeyObj);
    const signatureB64 = signature.toString('base64url');

    return `${message}.${signatureB64}`;
  }

  /**
   * Get OAuth access token
   */
  private async getAccessToken(): Promise<string> {
    const jwt = await this.generateJWT();

    const oauthUrl = this.baseUrl.replace('/v1', '') + '/oauth/token';
    const response = await fetch(oauthUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${jwt}`
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: jwt,
        scope: this.scopes
      })
    });

    if (!response.ok) {
      throw new Error(`OAuth failed: ${response.status}`);
    }

    const result = await response.json();
    return result.access_token;
  }

  /**
   * Make authenticated API request using JWT Bearer token
   */
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const jwt = await this.generateJWT();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Alternative: Make authenticated API request using Rbs-Signature header (if needed)
   */
  private async makeRequestWithSignature(endpoint: string, options: RequestInit = {}): Promise<any> {
    const jwt = await this.generateJWT();
    const timestamp = new Date().toISOString();
    
    // Create signature for Rbs-Signature header if required
    const rbsSignature = `keyId="${this.keyId}",algorithm="ES256",headers="(request-target) date",signature="${jwt}"`;
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Rbs-Signature': rbsSignature,
        'Content-Type': 'application/json',
        'Date': timestamp,
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Get current JWT Bearer token (Railsr uses direct JWT authentication)
   */
  async getOAuthBearerToken(): Promise<any> {
    try {
      console.log('🔐 Generating JWT Bearer token for Railsr direct authentication...');
      
      const jwt = await this.generateJWT();
      console.log('✓ JWT Bearer token generated successfully');
      
      return {
        success: true,
        access_token: jwt,
        token_type: 'Bearer',
        expires_in: 3600,
        scope: this.scopes,
        message: 'JWT Bearer token ready for direct API authentication',
        note: 'Railsr uses direct JWT authentication, not separate OAuth flow'
      };
    } catch (error: any) {
      console.error('JWT Bearer token generation failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to generate JWT Bearer token'
      };
    }
  }

  /**
   * Test connection to Railsr API
   */
  async testConnection(): Promise<any> {
    try {
      // Debug logging
      console.log('Testing Railsr connection...');
      console.log('Client ID:', this.clientId ? 'configured' : 'missing');
      console.log('Key ID:', this.keyId ? 'configured' : 'missing');
      console.log('Algorithm:', this.algorithm);
      console.log('Base URL:', this.baseUrl);
      console.log('Scopes count:', this.scopes.split(' ').length);
      console.log('Private key type:', typeof this.privateKey);
      console.log('Private key has d property:', this.privateKey?.d ? 'yes' : 'no');
      
      const jwt = await this.generateJWT();
      return {
        connected: true,
        clientId: this.clientId,
        environment: this.baseUrl.includes('play') ? 'sandbox' : 'production',
        tokenGenerated: true,
        tokenLength: jwt.length,
        scopes: this.scopes.split(' ').length,
        message: 'Connection ready'
      };
    } catch (error: any) {
      console.error('Railsr connection test failed:', error);
      return {
        connected: false,
        error: error.message,
        clientId: this.clientId ? 'configured' : 'missing',
        privateKey: this.privateKey ? 'configured' : 'missing',
        keyId: this.keyId ? 'configured' : 'missing',
        debug: {
          privateKeyType: typeof this.privateKey,
          privateKeyHasD: this.privateKey?.d ? 'yes' : 'no'
        }
      };
    }
  }

  /**
   * Get customer details using the correct Railsr API endpoint
   * Based on: https://docs.railsr.com/docs/api/766ed3fbcd018-get-customer-details
   */
  async getCustomerDetails(): Promise<any> {
    try {
      console.log('👤 Getting customer details from Railsr...');
      
      // Generate JWT token for direct authentication
      const jwt = await this.generateJWT();
      console.log('✓ JWT generated for customer details request');
      
      // Make authenticated request to customer details endpoint
      const response = await fetch(`${this.baseUrl}/customer/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Customer API response status:', response.status);
      
      if (response.ok) {
        const customerData = await response.json();
        console.log('✓ Customer details retrieved successfully');
        return {
          success: true,
          customer: customerData,
          message: 'Customer details retrieved successfully'
        };
      } else {
        const errorData = await response.text();
        console.log('✗ Customer API request failed');
        console.log('Error response:', errorData);
        return {
          success: false,
          error: `Customer API request failed with status ${response.status}`,
          response: errorData,
          endpoint: `${this.baseUrl}/customer/me`
        };
      }
    } catch (error: any) {
      console.error('Customer details request failed:', error);
      return {
        success: false,
        error: error.message,
        endpoint: `${this.baseUrl}/customer/me`
      };
    }
  }

  /**
   * Create enduser for a company (Step 1 of Send Money Scenario)
   * Based on official Railsr API: https://docs.railsr.com/docs/api/create-enduser
   */
  async createEnduser(data: any): Promise<any> {
    try {
      console.log('🏢 Creating enduser with data:', JSON.stringify(data, null, 2));
      
      // Generate JWT token for authentication
      const jwt = await this.generateJWT();
      console.log('✓ JWT generated for enduser creation');
      
      // Prepare enduser data according to Railsr API structure
      const enduserData = {
        person: {
          name: data.company?.name || data.person?.name,
          email: data.company?.email || data.person?.email,
          address: {
            address_line_one: data.company?.address?.address_line_one || data.person?.address?.address_line_one,
            address_city: data.company?.address?.address_city || data.person?.address?.address_city,
            address_postal_code: data.company?.address?.address_postal_code || data.person?.address?.address_postal_code,
            address_country: data.company?.address?.address_country || data.person?.address?.address_country || 'US'
          }
        }
      };
      
      console.log('📤 Sending enduser creation request to Railsr...');
      console.log('Request data:', JSON.stringify(enduserData, null, 2));
      
      // Make authenticated request to create enduser (using v2 API as documented)
      const response = await fetch(`https://play.railsbank.com/v2/endusers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(enduserData)
      });

      console.log('Enduser creation response status:', response.status);
      
      if (response.ok) {
        const enduser = await response.json();
        console.log('✅ Enduser created successfully');
        return {
          success: true,
          enduser,
          message: 'Enduser created successfully',
          next_step: 'Create ledger for this enduser'
        };
      } else {
        const errorData = await response.text();
        console.log('❌ Enduser creation failed');
        console.log('Error response:', errorData);
        console.log('Request URL:', `https://play.railsbank.com/v2/endusers`);
        
        return {
          success: false,
          error: `Enduser creation failed with status ${response.status}`,
          response: errorData,
          endpoint: `https://play.railsbank.com/v2/endusers`
        };
      }
    } catch (error: any) {
      console.error('Enduser creation request failed:', error);
      throw new Error(`Failed to create enduser: ${error.message}`);
    }
  }

  /**
   * Create ledger for banking account
   */
  async createLedger(enduserId: string, currency: string = 'usd'): Promise<any> {
    try {
      return await this.makeRequest('/ledgers', {
        method: 'POST',
        body: JSON.stringify({
          holder_id: enduserId,
          partner_product: 'ExampleBank-USD-1',
          asset_class: 'currency',
          asset_type: currency,
          ledger_type: 'deposit-account',
          ledger_who_owns_assets: 'partner'
        })
      });
    } catch (error: any) {
      throw new Error(`Failed to create ledger: ${error.message}`);
    }
  }

  /**
   * Create card for ledger
   */
  async createCard(ledgerId: string, cardType: string = 'debit_card'): Promise<any> {
    try {
      return await this.makeRequest('/cards', {
        method: 'POST',
        body: JSON.stringify({
          ledger_id: ledgerId,
          partner_product: 'ExampleBank-USD-1',
          card_programme: cardType
        })
      });
    } catch (error: any) {
      throw new Error(`Failed to create card: ${error.message}`);
    }
  }

  /**
   * Get ledger balance
   */
  async getLedgerBalance(ledgerId: string): Promise<any> {
    try {
      return await this.makeRequest(`/ledgers/${ledgerId}`);
    } catch (error: any) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  /**
   * Get transaction history
   */
  async getTransactions(ledgerId: string, options: any = {}): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (options.startDate) params.append('start_date', options.startDate);
      if (options.endDate) params.append('end_date', options.endDate);
      if (options.limit) params.append('limit', options.limit.toString());

      const query = params.toString();
      const endpoint = `/ledgers/${ledgerId}/transactions${query ? `?${query}` : ''}`;
      
      return await this.makeRequest(endpoint);
    } catch (error: any) {
      throw new Error(`Failed to get transactions: ${error.message}`);
    }
  }

  /**
   * Create beneficiary for payments
   */
  async createBeneficiary(enduserId: string, beneficiaryData: any): Promise<any> {
    try {
      return await this.makeRequest('/beneficiaries', {
        method: 'POST',
        body: JSON.stringify({
          enduser_id: enduserId,
          person: {
            name: beneficiaryData.name,
            email: beneficiaryData.email
          },
          us_account_details: {
            account_number: beneficiaryData.accountNumber,
            routing_number: beneficiaryData.routingNumber
          }
        })
      });
    } catch (error: any) {
      throw new Error(`Failed to create beneficiary: ${error.message}`);
    }
  }

  /**
   * Process payment to beneficiary
   */
  async processPayment(ledgerId: string, beneficiaryId: string, amount: number, reference: string): Promise<any> {
    try {
      return await this.makeRequest('/transactions', {
        method: 'POST',
        body: JSON.stringify({
          ledger_from_id: ledgerId,
          beneficiary_id: beneficiaryId,
          amount: amount,
          reference: reference,
          transaction_type: 'payment'
        })
      });
    } catch (error: any) {
      throw new Error(`Failed to process payment: ${error.message}`);
    }
  }

  /**
   * Setup webhooks
   */
  async setupWebhooks(webhookUrl: string): Promise<any> {
    try {
      return await this.makeRequest('/webhooks', {
        method: 'POST',
        body: JSON.stringify({
          url: webhookUrl,
          events: ['transaction-settled', 'enduser-created', 'card-created']
        })
      });
    } catch (error: any) {
      throw new Error(`Failed to setup webhooks: ${error.message}`);
    }
  }

  /**
   * Get exchange rates
   */
  async getExchangeRates(): Promise<any> {
    try {
      return await this.makeRequest('/fx/rates');
    } catch (error: any) {
      throw new Error(`Failed to get exchange rates: ${error.message}`);
    }
  }
}