import axios from "axios";

export interface CurrencyRate {
  from: string;
  to: string;
  rate: number;
  timestamp: Date;
}

export interface MultiCurrencyAmount {
  amount: number;
  currency: string;
  baseAmount: number;
  baseCurrency: string;
  exchangeRate: number;
  convertedAt: Date;
}

export class MultiCurrencyService {
  private openExchangeApiKey: string;
  private baseURL = 'https://openexchangerates.org/api';
  private baseCurrency = 'USD';
  private rateCache: Map<string, { rate: number; timestamp: Date }> = new Map();
  private cacheExpiry = 3600000; // 1 hour in milliseconds

  constructor() {
    this.openExchangeApiKey = process.env.OPENEXCHANGE_API_KEY || '';
  }

  // Get current exchange rates
  async getCurrentRates(): Promise<{ [key: string]: number }> {
    if (!this.openExchangeApiKey) {
      throw new Error("OpenExchangeRates API key not configured");
    }

    try {
      const response = await axios.get(`${this.baseURL}/latest.json`, {
        params: {
          app_id: this.openExchangeApiKey,
          base: this.baseCurrency
        }
      });

      const rates = response.data.rates;
      
      // Cache rates with timestamp
      Object.entries(rates).forEach(([currency, rate]) => {
        this.rateCache.set(currency, {
          rate: rate as number,
          timestamp: new Date()
        });
      });

      return rates;
    } catch (error: any) {
      console.error("OpenExchangeRates API error:", error.response?.data || error.message);
      throw new Error(`Currency rates fetch failed: ${error.response?.data?.description || error.message}`);
    }
  }

  // Get specific currency rate with caching
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) {
      return 1;
    }

    const cacheKey = `${fromCurrency}_${toCurrency}`;
    const cached = this.rateCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp.getTime()) < this.cacheExpiry) {
      return cached.rate;
    }

    try {
      // Get fresh rates
      const rates = await this.getCurrentRates();
      
      let rate: number;
      
      if (fromCurrency === this.baseCurrency) {
        rate = rates[toCurrency];
      } else if (toCurrency === this.baseCurrency) {
        rate = 1 / rates[fromCurrency];
      } else {
        // Convert through base currency
        const fromToBase = 1 / rates[fromCurrency];
        const baseToTarget = rates[toCurrency];
        rate = fromToBase * baseToTarget;
      }

      if (!rate) {
        throw new Error(`Exchange rate not available for ${fromCurrency} to ${toCurrency}`);
      }

      // Cache the calculated rate
      this.rateCache.set(cacheKey, {
        rate,
        timestamp: new Date()
      });

      return rate;
    } catch (error) {
      // Fallback to stored rates if API fails
      const fallbackRate = this.getFallbackRate(fromCurrency, toCurrency);
      if (fallbackRate) {
        console.warn(`Using fallback rate for ${fromCurrency} to ${toCurrency}: ${fallbackRate}`);
        return fallbackRate;
      }
      throw error;
    }
  }

  // Convert amount between currencies
  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<MultiCurrencyAmount> {
    const exchangeRate = await this.getExchangeRate(fromCurrency, toCurrency);
    const convertedAmount = amount * exchangeRate;
    
    // Also calculate base currency amount
    const baseRate = fromCurrency === this.baseCurrency ? 1 : await this.getExchangeRate(fromCurrency, this.baseCurrency);
    const baseAmount = amount * baseRate;

    return {
      amount: convertedAmount,
      currency: toCurrency,
      baseAmount,
      baseCurrency: this.baseCurrency,
      exchangeRate,
      convertedAt: new Date()
    };
  }

  // Convert invoice to multiple currencies
  async convertInvoiceAmounts(invoiceAmount: number, invoiceCurrency: string, targetCurrencies: string[]): Promise<{
    original: MultiCurrencyAmount;
    conversions: MultiCurrencyAmount[];
  }> {
    const baseRate = invoiceCurrency === this.baseCurrency ? 1 : await this.getExchangeRate(invoiceCurrency, this.baseCurrency);
    const baseAmount = invoiceAmount * baseRate;

    const original: MultiCurrencyAmount = {
      amount: invoiceAmount,
      currency: invoiceCurrency,
      baseAmount,
      baseCurrency: this.baseCurrency,
      exchangeRate: 1,
      convertedAt: new Date()
    };

    const conversions: MultiCurrencyAmount[] = [];
    
    for (const targetCurrency of targetCurrencies) {
      if (targetCurrency !== invoiceCurrency) {
        const converted = await this.convertCurrency(invoiceAmount, invoiceCurrency, targetCurrency);
        conversions.push(converted);
      }
    }

    return { original, conversions };
  }

  // Get historical rates for a specific date
  async getHistoricalRate(date: string, fromCurrency: string, toCurrency: string): Promise<number> {
    if (!this.openExchangeApiKey) {
      throw new Error("OpenExchangeRates API key not configured");
    }

    try {
      const response = await axios.get(`${this.baseURL}/historical/${date}.json`, {
        params: {
          app_id: this.openExchangeApiKey,
          base: this.baseCurrency
        }
      });

      const rates = response.data.rates;
      
      if (fromCurrency === this.baseCurrency) {
        return rates[toCurrency];
      } else if (toCurrency === this.baseCurrency) {
        return 1 / rates[fromCurrency];
      } else {
        const fromToBase = 1 / rates[fromCurrency];
        const baseToTarget = rates[toCurrency];
        return fromToBase * baseToTarget;
      }
    } catch (error: any) {
      console.error("Historical rates API error:", error.response?.data || error.message);
      throw new Error(`Historical rate fetch failed: ${error.response?.data?.description || error.message}`);
    }
  }

  // Format currency amount with proper symbols and formatting
  formatCurrency(amount: number, currency: string): string {
    const currencyFormats: { [key: string]: { symbol: string; decimals: number; position: 'before' | 'after' } } = {
      'USD': { symbol: '$', decimals: 2, position: 'before' },
      'EUR': { symbol: '€', decimals: 2, position: 'after' },
      'GBP': { symbol: '£', decimals: 2, position: 'before' },
      'JPY': { symbol: '¥', decimals: 0, position: 'before' },
      'CAD': { symbol: 'C$', decimals: 2, position: 'before' },
      'AUD': { symbol: 'A$', decimals: 2, position: 'before' },
      'CHF': { symbol: 'CHF', decimals: 2, position: 'after' },
      'CNY': { symbol: '¥', decimals: 2, position: 'before' },
      'INR': { symbol: '₹', decimals: 2, position: 'before' },
      'MXN': { symbol: '$', decimals: 2, position: 'before' }
    };

    const format = currencyFormats[currency] || { symbol: currency, decimals: 2, position: 'after' };
    const formattedAmount = amount.toFixed(format.decimals);
    
    if (format.position === 'before') {
      return `${format.symbol}${formattedAmount}`;
    } else {
      return `${formattedAmount} ${format.symbol}`;
    }
  }

  // Get supported currencies
  getSupportedCurrencies(): string[] {
    return [
      'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'MXN',
      'BRL', 'KRW', 'SGD', 'HKD', 'NOK', 'SEK', 'DKK', 'PLN', 'CZK', 'HUF',
      'TRY', 'ZAR', 'ILS', 'AED', 'SAR', 'THB', 'MYR', 'IDR', 'PHP', 'VND'
    ];
  }

  // Update financial report totals to include multi-currency
  async calculateMultiCurrencyTotals(transactions: Array<{ amount: number; currency: string; date: Date }>): Promise<{
    totalByOriginalCurrency: { [currency: string]: number };
    totalInBaseCurrency: number;
    exchangeRateVariance: number;
  }> {
    const totalByOriginalCurrency: { [currency: string]: number } = {};
    let totalInBaseCurrency = 0;
    let exchangeRateVariance = 0;

    for (const transaction of transactions) {
      // Sum by original currency
      if (!totalByOriginalCurrency[transaction.currency]) {
        totalByOriginalCurrency[transaction.currency] = 0;
      }
      totalByOriginalCurrency[transaction.currency] += transaction.amount;

      // Convert to base currency using historical rate
      const dateString = transaction.date.toISOString().split('T')[0];
      try {
        const historicalRate = await this.getHistoricalRate(dateString, transaction.currency, this.baseCurrency);
        const currentRate = await this.getExchangeRate(transaction.currency, this.baseCurrency);
        
        const baseAmount = transaction.amount * historicalRate;
        const currentBaseAmount = transaction.amount * currentRate;
        
        totalInBaseCurrency += baseAmount;
        exchangeRateVariance += Math.abs(currentBaseAmount - baseAmount);
      } catch (error) {
        console.warn(`Could not get rates for ${transaction.currency} on ${dateString}, using current rate`);
        const currentRate = await this.getExchangeRate(transaction.currency, this.baseCurrency);
        totalInBaseCurrency += transaction.amount * currentRate;
      }
    }

    return {
      totalByOriginalCurrency,
      totalInBaseCurrency,
      exchangeRateVariance
    };
  }

  // Fallback rates for common currency pairs (used when API is unavailable)
  private getFallbackRate(fromCurrency: string, toCurrency: string): number | null {
    const fallbackRates: { [key: string]: number } = {
      'USD_EUR': 0.85,
      'USD_GBP': 0.73,
      'USD_JPY': 110,
      'USD_CAD': 1.25,
      'USD_AUD': 1.35,
      'EUR_GBP': 0.86,
      'EUR_JPY': 129,
      'GBP_JPY': 150
    };

    const key = `${fromCurrency}_${toCurrency}`;
    const reverseKey = `${toCurrency}_${fromCurrency}`;
    
    if (fallbackRates[key]) {
      return fallbackRates[key];
    } else if (fallbackRates[reverseKey]) {
      return 1 / fallbackRates[reverseKey];
    }
    
    return null;
  }

  // Clear cache (useful for testing or forcing fresh rates)
  clearRateCache(): void {
    this.rateCache.clear();
  }
}

export const multiCurrencyService = new MultiCurrencyService();