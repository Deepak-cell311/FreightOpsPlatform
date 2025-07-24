import axios from "axios";

export interface TaxCalculationRequest {
  amount: number;
  fromAddress: {
    country: string;
    state: string;
    zip: string;
    city: string;
    street: string;
  };
  toAddress: {
    country: string;
    state: string;
    zip: string;
    city: string;
    street: string;
  };
  lineItems: Array<{
    id: string;
    quantity: number;
    productTaxCode?: string;
    unitPrice: number;
    discount?: number;
  }>;
}

export interface TaxCalculationResponse {
  taxAmount: number;
  taxRate: number;
  breakdown: Array<{
    jurisdiction: string;
    rate: number;
    amount: number;
    type: 'state' | 'county' | 'city' | 'special';
  }>;
  confidence: number;
}

export class TaxIntegrationService {
  private taxjarApiKey: string;
  private avalaraApiKey: string;
  private baseURL = 'https://api.taxjar.com/v2';
  private avalaraURL = 'https://rest.avatax.com/api/v2';

  constructor() {
    this.taxjarApiKey = process.env.TAXJAR_API_KEY || '';
    this.avalaraApiKey = process.env.AVALARA_API_KEY || '';
  }

  // Calculate tax using TaxJar API
  async calculateTaxWithTaxJar(request: TaxCalculationRequest): Promise<TaxCalculationResponse> {
    if (!this.taxjarApiKey) {
      throw new Error("TaxJar API key not configured");
    }

    try {
      const taxjarRequest = {
        from_country: request.fromAddress.country,
        from_zip: request.fromAddress.zip,
        from_state: request.fromAddress.state,
        from_city: request.fromAddress.city,
        from_street: request.fromAddress.street,
        to_country: request.toAddress.country,
        to_zip: request.toAddress.zip,
        to_state: request.toAddress.state,
        to_city: request.toAddress.city,
        to_street: request.toAddress.street,
        amount: request.amount,
        shipping: 0,
        line_items: request.lineItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          product_tax_code: item.productTaxCode,
          unit_price: item.unitPrice,
          discount: item.discount || 0
        }))
      };

      const response = await axios.post(`${this.baseURL}/taxes`, taxjarRequest, {
        headers: {
          'Authorization': `Bearer ${this.taxjarApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const taxData = response.data.tax;
      
      return {
        taxAmount: taxData.amount_to_collect,
        taxRate: taxData.rate,
        breakdown: taxData.breakdown?.jurisdictions?.map((jurisdiction: any) => ({
          jurisdiction: jurisdiction.jurisdiction_name,
          rate: jurisdiction.rate,
          amount: jurisdiction.tax_collectable,
          type: this.mapJurisdictionType(jurisdiction.jurisdiction_type)
        })) || [],
        confidence: 0.95
      };
    } catch (error: any) {
      console.error("TaxJar API error:", error.response?.data || error.message);
      throw new Error(`Tax calculation failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Calculate tax using Avalara API
  async calculateTaxWithAvalara(request: TaxCalculationRequest): Promise<TaxCalculationResponse> {
    if (!this.avalaraApiKey) {
      throw new Error("Avalara API key not configured");
    }

    try {
      const avalaraRequest = {
        type: 'SalesInvoice',
        companyCode: 'DEFAULT',
        date: new Date().toISOString().split('T')[0],
        customerCode: 'CUSTOMER',
        addresses: {
          shipFrom: {
            line1: request.fromAddress.street,
            city: request.fromAddress.city,
            region: request.fromAddress.state,
            country: request.fromAddress.country,
            postalCode: request.fromAddress.zip
          },
          shipTo: {
            line1: request.toAddress.street,
            city: request.toAddress.city,
            region: request.toAddress.state,
            country: request.toAddress.country,
            postalCode: request.toAddress.zip
          }
        },
        lines: request.lineItems.map((item, index) => ({
          number: (index + 1).toString(),
          quantity: item.quantity,
          amount: item.unitPrice * item.quantity - (item.discount || 0),
          taxCode: item.productTaxCode || 'FR',
          itemCode: item.id,
          description: `Transportation Service ${item.id}`
        }))
      };

      const response = await axios.post(`${this.avalaraURL}/transactions/create`, avalaraRequest, {
        headers: {
          'Authorization': `Bearer ${this.avalaraApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const taxData = response.data;
      
      return {
        taxAmount: taxData.totalTax,
        taxRate: taxData.totalTax / request.amount,
        breakdown: taxData.summary?.map((summary: any) => ({
          jurisdiction: summary.jurisName,
          rate: summary.rate,
          amount: summary.tax,
          type: this.mapAvalaraJurisdictionType(summary.jurisType)
        })) || [],
        confidence: 0.98
      };
    } catch (error: any) {
      console.error("Avalara API error:", error.response?.data || error.message);
      throw new Error(`Tax calculation failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Primary tax calculation method with fallback
  async calculateTax(request: TaxCalculationRequest): Promise<TaxCalculationResponse> {
    try {
      // Try TaxJar first
      return await this.calculateTaxWithTaxJar(request);
    } catch (error) {
      console.log("TaxJar failed, trying Avalara:", error.message);
      try {
        // Fallback to Avalara
        return await this.calculateTaxWithAvalara(request);
      } catch (avalaraError) {
        console.log("Both tax services failed, using fallback calculation");
        // Fallback to basic state tax calculation
        return this.calculateFallbackTax(request);
      }
    }
  }

  // Fallback tax calculation for common states
  private calculateFallbackTax(request: TaxCalculationRequest): TaxCalculationResponse {
    const stateTaxRates: { [key: string]: number } = {
      'CA': 0.0825, // California
      'TX': 0.0625, // Texas
      'FL': 0.06,   // Florida
      'NY': 0.08,   // New York
      'IL': 0.0625, // Illinois
      'PA': 0.06,   // Pennsylvania
      'OH': 0.0575, // Ohio
      'GA': 0.04,   // Georgia
      'NC': 0.0475, // North Carolina
      'MI': 0.06,   // Michigan
    };

    const stateCode = request.toAddress.state.toUpperCase();
    const taxRate = stateTaxRates[stateCode] || 0.05; // Default 5% if state not found
    const taxAmount = request.amount * taxRate;

    return {
      taxAmount,
      taxRate,
      breakdown: [{
        jurisdiction: `${request.toAddress.state} State Tax`,
        rate: taxRate,
        amount: taxAmount,
        type: 'state'
      }],
      confidence: 0.75 // Lower confidence for fallback calculation
    };
  }

  // Store tax liability for reporting
  async recordTaxLiability(companyId: string, taxData: TaxCalculationResponse, invoiceId: string): Promise<void> {
    // This would integrate with your accounting system to record tax liabilities
    console.log(`Recording tax liability for company ${companyId}:`, {
      invoiceId,
      taxAmount: taxData.taxAmount,
      taxRate: taxData.taxRate,
      breakdown: taxData.breakdown
    });
  }

  // Generate tax report for authorities
  async generateTaxReport(companyId: string, startDate: string, endDate: string): Promise<{
    totalTaxCollected: number;
    totalTaxLiability: number;
    breakdown: Array<{
      jurisdiction: string;
      collected: number;
      liability: number;
      difference: number;
    }>;
  }> {
    // This would query your database for tax data in the date range
    // For now, return a sample structure
    return {
      totalTaxCollected: 45000,
      totalTaxLiability: 44500,
      breakdown: [
        {
          jurisdiction: 'California State',
          collected: 25000,
          liability: 24800,
          difference: 200
        },
        {
          jurisdiction: 'Texas State',
          collected: 20000,
          liability: 19700,
          difference: 300
        }
      ]
    };
  }

  private mapJurisdictionType(type: string): 'state' | 'county' | 'city' | 'special' {
    switch (type.toLowerCase()) {
      case 'state': return 'state';
      case 'county': return 'county';
      case 'city': return 'city';
      default: return 'special';
    }
  }

  private mapAvalaraJurisdictionType(type: string): 'state' | 'county' | 'city' | 'special' {
    switch (type.toLowerCase()) {
      case 'sta': return 'state';
      case 'cou': return 'county';
      case 'cit': return 'city';
      default: return 'special';
    }
  }
}

export const taxIntegrationService = new TaxIntegrationService();