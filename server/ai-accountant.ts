import OpenAI from 'openai';
import { nanoid } from 'nanoid';
import { db } from './db';
import { loadExpenses, invoices, bills, trucks } from '@shared/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { storage } from './storage';

interface FinancialData {
  revenue: number;
  expenses: number;
  cashFlow: number;
  accountsReceivable: number;
  accountsPayable: number;
  bankBalance: number;
  transactions: Array<{
    date: string;
    description: string;
    amount: number;
    category: string;
  }>;
}

interface AccountingInsight {
  id: string;
  type: 'cash_flow' | 'expense_analysis' | 'revenue_trend' | 'tax_optimization' | 'cost_savings';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  estimatedSavings?: number;
  confidence: number;
  actionable: boolean;
}

interface FinancialForecast {
  period: string;
  projectedRevenue: number;
  projectedExpenses: number;
  projectedCashFlow: number;
  confidence: number;
  keyFactors: string[];
}

interface TaxOptimization {
  potentialSavings: number;
  recommendations: Array<{
    strategy: string;
    description: string;
    estimatedSavings: number;
    complexity: 'low' | 'medium' | 'high';
    deadline?: string;
  }>;
}

export class AIAccountant {
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeFinancials(companyId: string, financialData: FinancialData): Promise<AccountingInsight[]> {
    try {
      const prompt = `
        As an expert AI accountant, analyze the following financial data for a trucking company and provide actionable insights:

        Financial Summary:
        - Revenue: $${financialData.revenue.toLocaleString()}
        - Expenses: $${financialData.expenses.toLocaleString()}
        - Cash Flow: $${financialData.cashFlow.toLocaleString()}
        - Accounts Receivable: $${financialData.accountsReceivable.toLocaleString()}
        - Accounts Payable: $${financialData.accountsPayable.toLocaleString()}
        - Bank Balance: $${financialData.bankBalance.toLocaleString()}

        Recent Transactions (sample):
        ${financialData.transactions.slice(0, 10).map(t => 
          `${t.date}: ${t.description} - $${t.amount} (${t.category})`
        ).join('\n')}

        Provide insights in the following JSON format:
        {
          "insights": [
            {
              "type": "cash_flow|expense_analysis|revenue_trend|tax_optimization|cost_savings",
              "title": "Brief insight title",
              "description": "Detailed analysis and explanation",
              "severity": "low|medium|high|critical",
              "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2"],
              "estimatedSavings": 0,
              "confidence": 0.95,
              "actionable": true
            }
          ]
        }

        Focus on:
        1. Cash flow optimization
        2. Expense reduction opportunities
        3. Revenue enhancement strategies
        4. Tax optimization
        5. Financial risk assessment
        6. Working capital management
        7. Industry-specific trucking insights
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return result.insights.map((insight: any) => ({
        id: nanoid(),
        ...insight
      }));
    } catch (error) {
      console.error('AI financial analysis failed:', error);
      throw new Error('Failed to analyze financial data');
    }
  }

  async generateCashFlowForecast(companyId: string, historicalData: FinancialData[]): Promise<FinancialForecast[]> {
    try {
      const prompt = `
        As an expert financial analyst, create a 6-month cash flow forecast based on this historical data for a trucking company:

        Historical Data (last 6 months):
        ${historicalData.map((data, index) => `
        Month ${index + 1}:
        - Revenue: $${data.revenue.toLocaleString()}
        - Expenses: $${data.expenses.toLocaleString()}
        - Cash Flow: $${data.cashFlow.toLocaleString()}
        `).join('\n')}

        Provide forecasts in JSON format:
        {
          "forecasts": [
            {
              "period": "Month 1",
              "projectedRevenue": 0,
              "projectedExpenses": 0,
              "projectedCashFlow": 0,
              "confidence": 0.85,
              "keyFactors": ["Factor 1", "Factor 2"]
            }
          ]
        }

        Consider:
        1. Seasonal trucking trends
        2. Fuel price fluctuations
        3. Economic indicators
        4. Industry growth patterns
        5. Company-specific trends
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 1500,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.forecasts;
    } catch (error) {
      console.error('Cash flow forecast failed:', error);
      throw new Error('Failed to generate cash flow forecast');
    }
  }

  async optimizeTaxStrategy(companyId: string, financialData: FinancialData): Promise<TaxOptimization> {
    try {
      const prompt = `
        As a tax optimization expert for trucking companies, analyze this financial data and provide tax-saving strategies:

        Financial Data:
        - Revenue: $${financialData.revenue.toLocaleString()}
        - Expenses: $${financialData.expenses.toLocaleString()}
        - Cash Flow: $${financialData.cashFlow.toLocaleString()}

        Provide tax optimization recommendations in JSON format:
        {
          "potentialSavings": 0,
          "recommendations": [
            {
              "strategy": "Strategy name",
              "description": "Detailed explanation",
              "estimatedSavings": 0,
              "complexity": "low|medium|high",
              "deadline": "Optional deadline"
            }
          ]
        }

        Focus on trucking industry-specific deductions:
        1. Vehicle depreciation (Section 179, bonus depreciation)
        2. Fuel tax credits
        3. Maintenance and repair deductions
        4. Per-mile deductions
        5. Equipment leasing benefits
        6. Driver expense deductions
        7. Quarterly tax planning
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 1500,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result;
    } catch (error) {
      console.error('Tax optimization failed:', error);
      throw new Error('Failed to optimize tax strategy');
    }
  }

  async categorizeExpenses(transactions: Array<{ description: string; amount: number; date: string }>) {
    try {
      const prompt = `
        Categorize these trucking company expenses into appropriate accounting categories:

        Transactions:
        ${transactions.map(t => `${t.date}: ${t.description} - $${t.amount}`).join('\n')}

        Return JSON with categorized expenses:
        {
          "categorized": [
            {
              "description": "Original description",
              "amount": 0,
              "category": "Fuel & Gas|Vehicle Maintenance|Insurance|Equipment|Driver Wages|Office Expenses|Professional Services|Other",
              "subcategory": "Specific subcategory",
              "deductible": true,
              "confidence": 0.95
            }
          ]
        }

        Use trucking-specific categories:
        - Fuel & Gas
        - Vehicle Maintenance & Repairs
        - Vehicle Insurance
        - Equipment & Tools
        - Driver Wages & Benefits
        - Permits & Licenses
        - Office & Administrative
        - Professional Services
        - Depreciation
        - Other Operating Expenses
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 2000,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.categorized;
    } catch (error) {
      console.error('Expense categorization failed:', error);
      throw new Error('Failed to categorize expenses');
    }
  }

  async generateProfitLossReport(companyId: string, startDate: Date, endDate: Date) {
    try {
      // Pull real revenue data from invoices
      const revenue = await db
        .select({
          total: sql<number>`COALESCE(SUM(total_amount), 0)`
        })
        .from(invoices)
        .where(
          and(
            eq(invoices.companyId, companyId),
            gte(invoices.invoiceDate, startDate),
            lte(invoices.invoiceDate, endDate)
          )
        );

      // Pull real expense data from bills and load expenses
      const billExpenses = await db
        .select({
          total: sql<number>`COALESCE(SUM(total_amount), 0)`
        })
        .from(bills)
        .where(
          and(
            eq(bills.companyId, companyId),
            gte(bills.billDate, startDate),
            lte(bills.billDate, endDate)
          )
        );

      const loadExpenseData = await db
        .select({
          fuel: sql<number>`COALESCE(SUM(CASE WHEN category = 'fuel' THEN amount ELSE 0 END), 0)`,
          maintenance: sql<number>`COALESCE(SUM(CASE WHEN category = 'repairs' OR category = 'maintenance' THEN amount ELSE 0 END), 0)`,
          driverPay: sql<number>`COALESCE(SUM(CASE WHEN category = 'driver_pay' THEN amount ELSE 0 END), 0)`,
          tolls: sql<number>`COALESCE(SUM(CASE WHEN category = 'tolls' THEN amount ELSE 0 END), 0)`,
          total: sql<number>`COALESCE(SUM(amount), 0)`
        })
        .from(loadExpenses)
        .where(
          and(
            eq(loadExpenses.companyId, companyId),
            gte(loadExpenses.createdAt, startDate),
            lte(loadExpenses.createdAt, endDate)
          )
        );

      const revenueTotal = revenue[0]?.total || 0;
      const billExpenseTotal = billExpenses[0]?.total || 0;
      const loadExpenseTotal = loadExpenseData[0]?.total || 0;
      const totalExpenses = billExpenseTotal + loadExpenseTotal;
      
      const netIncome = revenueTotal - totalExpenses;
      const grossMargin = revenueTotal > 0 ? (revenueTotal - totalExpenses) / revenueTotal : 0;
      const netMargin = revenueTotal > 0 ? netIncome / revenueTotal : 0;

      return {
        revenue: {
          freight: revenueTotal,
          fuelSurcharge: 0,
          accessorial: 0,
          total: revenueTotal
        },
        expenses: {
          fuel: loadExpenseData[0]?.fuel || 0,
          driverWages: loadExpenseData[0]?.driverPay || 0,
          vehicleMaintenance: loadExpenseData[0]?.maintenance || 0,
          tolls: loadExpenseData[0]?.tolls || 0,
          other: billExpenseTotal,
          total: totalExpenses
        },
        netIncome,
        margins: {
          gross: grossMargin,
          net: netMargin
        }
      };
    } catch (error) {
      console.error('Failed to generate P&L report:', error);
      throw new Error('Unable to generate profit and loss report');
    }
  }

  async generateBalanceSheet(companyId: string, asOfDate: Date) {
    try {
      // Calculate balance sheet from actual financial data
      const accountsReceivable = await db
        .select({
          total: sql<number>`COALESCE(SUM(total_amount - amount_paid), 0)`
        })
        .from(invoices)
        .where(
          and(
            eq(invoices.companyId, companyId),
            lte(invoices.invoiceDate, asOfDate)
          )
        );

      const accountsPayable = await db
        .select({
          total: sql<number>`COALESCE(SUM(total_amount - amount_paid), 0)`
        })
        .from(bills)
        .where(
          and(
            eq(bills.companyId, companyId),
            lte(bills.billDate, asOfDate)
          )
        );

      const receivables = accountsReceivable[0]?.total || 0;
      const payables = accountsPayable[0]?.total || 0;

      // Get real cash balance from banking integration
      const company = await storage.getCompany(companyId);
      const actualCash = company?.bankBalance || 0;
      
      // Get real vehicle values from fleet data
      const vehicles = await db.select().from(trucks).where(eq(trucks.companyId, companyId));
      const vehicleValue = vehicles.reduce((total, truck) => total + (truck.purchasePrice || 0), 0);
      const depreciation = vehicleValue * 0.2; // Use standard depreciation rate
      const equipmentValue = vehicleValue * 0.1; // Estimate equipment as 10% of vehicle value

      const currentAssets = actualCash + receivables;
      const fixedAssets = vehicleValue + equipmentValue - depreciation;
      const totalAssets = currentAssets + fixedAssets;
      const totalLiabilities = payables;
      const equity = totalAssets - totalLiabilities;

      return {
        assets: {
          current: {
            cash: actualCash,
            accountsReceivable: receivables,
            total: currentAssets
          },
          fixed: {
            vehicles: vehicleValue,
            equipment: equipmentValue,
            accumulatedDepreciation: -depreciation,
            total: fixedAssets
          },
          totalAssets
        },
        liabilities: {
          current: {
            accountsPayable: payables,
            accruedExpenses: 0,
            total: totalLiabilities
          },
          longTerm: {
            loansPayable: 0,
            total: 0
          },
          totalLiabilities
        },
        equity: {
          ownersEquity: equity,
          totalEquity: equity
        }
      };
    } catch (error) {
      console.error('Failed to generate balance sheet:', error);
      throw new Error('Unable to generate balance sheet');
    }
  }

  async detectAnomalies(companyId: string, transactions: Array<{ date: string; description: string; amount: number; category: string }>) {
    try {
      const prompt = `
        Analyze these transactions for anomalies, fraud indicators, or unusual patterns:

        Transactions:
        ${transactions.map(t => `${t.date}: ${t.description} - $${t.amount} (${t.category})`).join('\n')}

        Return JSON with anomaly detection results:
        {
          "anomalies": [
            {
              "transactionIndex": 0,
              "type": "unusual_amount|duplicate|timing|category_mismatch|potential_fraud",
              "severity": "low|medium|high|critical",
              "description": "Explanation of the anomaly",
              "recommendation": "Suggested action"
            }
          ],
          "summary": {
            "totalAnomalies": 0,
            "riskScore": 0.1,
            "requiresReview": false
          }
        }

        Look for:
        1. Unusually high amounts for category
        2. Duplicate transactions
        3. Off-hours transactions
        4. Suspicious vendor patterns
        5. Round number anomalies
        6. Category mismatches
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 1500,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result;
    } catch (error) {
      console.error('Anomaly detection failed:', error);
      throw new Error('Failed to detect anomalies');
    }
  }
}

export const aiAccountant = new AIAccountant();