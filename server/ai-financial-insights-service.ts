import { OpenAI } from "openai";
import { eq, and, desc, sql, between } from "drizzle-orm";
import { db } from "./db";
import { loads, drivers } from "../shared/schema";

export interface FinancialInsight {
  id: string;
  type: 'anomaly' | 'trend' | 'recommendation' | 'alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  recommendations: string[];
  confidence: number;
  detectedAt: Date;
  affectedMetrics: string[];
  estimatedSavings?: number;
  actionRequired: boolean;
}

export interface ExpenseCategory {
  category: string;
  amount: number;
  percentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
}

export interface CashFlowPrediction {
  period: string;
  predictedInflow: number;
  predictedOutflow: number;
  netCashFlow: number;
  confidence: number;
  riskFactors: string[];
}

export interface FinancialHealthScore {
  overall: number;
  profitability: number;
  liquidity: number;
  efficiency: number;
  growth: number;
  factors: Array<{
    metric: string;
    score: number;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }>;
}

export class AIFinancialInsightsService {
  private openai: OpenAI;
  private insights: Map<string, FinancialInsight> = new Map();

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }
    this.openai = new OpenAI({ apiKey });
  }

  // Generate comprehensive financial insights
  async generateFinancialInsights(companyId: string): Promise<FinancialInsight[]> {
    const financialData = await this.gatherFinancialData(companyId);
    const insights: FinancialInsight[] = [];

    // Detect anomalies
    const anomalies = await this.detectAnomalies(companyId, financialData);
    insights.push(...anomalies);

    // Analyze trends
    const trends = await this.analyzeTrends(companyId, financialData);
    insights.push(...trends);

    // Generate recommendations
    const recommendations = await this.generateRecommendations(companyId, financialData);
    insights.push(...recommendations);

    // Check for alerts
    const alerts = await this.checkAlerts(companyId, financialData);
    insights.push(...alerts);

    // Store insights
    insights.forEach(insight => {
      this.insights.set(insight.id, insight);
    });

    return insights.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  // Detect financial anomalies using AI
  private async detectAnomalies(companyId: string, financialData: any): Promise<FinancialInsight[]> {
    const prompt = `
Analyze the following financial data for anomalies and unusual patterns:

Revenue Data: ${JSON.stringify(financialData.revenue)}
Expense Data: ${JSON.stringify(financialData.expenses)}
Cash Flow: ${JSON.stringify(financialData.cashFlow)}
Load Performance: ${JSON.stringify(financialData.loadMetrics)}

Identify any anomalies, unusual spending patterns, or concerning trends. For each anomaly:
1. Describe what's unusual
2. Assess the potential impact
3. Rate the severity (low/medium/high/critical)
4. Provide actionable recommendations

Return a JSON array of anomalies with this structure:
{
  "type": "anomaly",
  "severity": "high",
  "title": "Unusual Fuel Cost Spike",
  "description": "Fuel costs increased 35% last month compared to historical average",
  "impact": "Reduced profit margins by 8%",
  "recommendations": ["Review fuel purchasing strategy", "Negotiate better rates"],
  "confidence": 0.92,
  "affectedMetrics": ["fuel_costs", "profit_margin"],
  "estimatedSavings": 15000
}
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      const anomalies = JSON.parse(response.choices[0].message.content || '[]');
      return anomalies.map((anomaly: any) => ({
        ...anomaly,
        id: this.generateInsightId(),
        detectedAt: new Date(),
        actionRequired: anomaly.severity === 'high' || anomaly.severity === 'critical'
      }));
    } catch (error) {
      console.error("Error detecting anomalies:", error);
      return [];
    }
  }

  // Analyze financial trends
  private async analyzeTrends(companyId: string, financialData: any): Promise<FinancialInsight[]> {
    const prompt = `
Analyze these financial trends over time:

Monthly Data: ${JSON.stringify(financialData.monthlyTrends)}
Performance Metrics: ${JSON.stringify(financialData.performanceMetrics)}

Identify significant trends in:
- Revenue growth/decline
- Cost patterns
- Profit margins
- Operational efficiency
- Market position

For each trend, provide insights about future implications and strategic recommendations.

Return JSON array with trend insights.
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      const trends = JSON.parse(response.choices[0].message.content || '[]');
      return trends.map((trend: any) => ({
        ...trend,
        id: this.generateInsightId(),
        type: 'trend',
        detectedAt: new Date(),
        actionRequired: false
      }));
    } catch (error) {
      console.error("Error analyzing trends:", error);
      return [];
    }
  }

  // Generate AI recommendations
  private async generateRecommendations(companyId: string, financialData: any): Promise<FinancialInsight[]> {
    const prompt = `
Based on this transportation company's financial data, generate strategic recommendations:

Company Metrics: ${JSON.stringify(financialData)}

Focus on:
1. Cost optimization opportunities
2. Revenue enhancement strategies
3. Operational efficiency improvements
4. Risk mitigation measures
5. Growth opportunities

Prioritize recommendations by potential impact and feasibility.

Return JSON array with actionable recommendations.
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
      });

      const recommendations = JSON.parse(response.choices[0].message.content || '[]');
      return recommendations.map((rec: any) => ({
        ...rec,
        id: this.generateInsightId(),
        type: 'recommendation',
        detectedAt: new Date(),
        actionRequired: rec.severity === 'high'
      }));
    } catch (error) {
      console.error("Error generating recommendations:", error);
      return [];
    }
  }

  // Check for critical alerts
  private async checkAlerts(companyId: string, financialData: any): Promise<FinancialInsight[]> {
    const alerts: FinancialInsight[] = [];

    // Cash flow alert
    if (financialData.cashFlow.current < 0) {
      alerts.push({
        id: this.generateInsightId(),
        type: 'alert',
        severity: 'critical',
        title: 'Negative Cash Flow Detected',
        description: `Current cash flow is ${financialData.cashFlow.current.toLocaleString()}, indicating potential liquidity issues`,
        impact: 'Immediate threat to operational continuity',
        recommendations: [
          'Review accounts receivable for collections',
          'Delay non-critical expenses',
          'Consider emergency financing options'
        ],
        confidence: 1.0,
        detectedAt: new Date(),
        affectedMetrics: ['cash_flow', 'liquidity'],
        actionRequired: true
      });
    }

    // High expense growth alert
    if (financialData.expenses.growthRate > 25) {
      alerts.push({
        id: this.generateInsightId(),
        type: 'alert',
        severity: 'high',
        title: 'Rapid Expense Growth',
        description: `Expenses have grown ${financialData.expenses.growthRate}% this period`,
        impact: 'Eroding profit margins and financial stability',
        recommendations: [
          'Conduct detailed expense analysis',
          'Implement cost control measures',
          'Review vendor contracts and rates'
        ],
        confidence: 0.95,
        detectedAt: new Date(),
        affectedMetrics: ['expenses', 'profit_margin'],
        actionRequired: true
      });
    }

    return alerts;
  }

  // Automatically categorize expenses using AI
  async categorizeExpenses(companyId: string, transactions: Array<{
    description: string;
    amount: number;
    date: string;
    vendor?: string;
  }>): Promise<ExpenseCategory[]> {
    const prompt = `
Categorize these transportation company expenses into standard categories:

Transactions: ${JSON.stringify(transactions)}

Standard categories:
- Fuel & Gas
- Vehicle Maintenance
- Insurance
- Driver Wages
- Equipment & Supplies
- Office Expenses
- Marketing & Sales
- Professional Services
- Licenses & Permits
- Other

For each category, calculate total amount, percentage of total expenses, and trend.

Return JSON array of expense categories with amounts and percentages.
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      });

      return JSON.parse(response.choices[0].message.content || '[]');
    } catch (error) {
      console.error("Error categorizing expenses:", error);
      return [];
    }
  }

  // Predict cash flow using AI
  async predictCashFlow(companyId: string, months: number = 6): Promise<CashFlowPrediction[]> {
    const historicalData = await this.gatherHistoricalCashFlow(companyId);
    
    const prompt = `
Based on this historical cash flow data, predict future cash flow for the next ${months} months:

Historical Data: ${JSON.stringify(historicalData)}

Consider:
- Seasonal patterns
- Business growth trends
- Market conditions
- Historical payment cycles

Return JSON array of monthly predictions with confidence scores and risk factors.
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      return JSON.parse(response.choices[0].message.content || '[]');
    } catch (error) {
      console.error("Error predicting cash flow:", error);
      return [];
    }
  }

  // Calculate financial health score
  async calculateFinancialHealthScore(companyId: string): Promise<FinancialHealthScore> {
    const financialData = await this.gatherFinancialData(companyId);
    
    const profitability = this.calculateProfitabilityScore(financialData);
    const liquidity = this.calculateLiquidityScore(financialData);
    const efficiency = this.calculateEfficiencyScore(financialData);
    const growth = this.calculateGrowthScore(financialData);
    
    const overall = (profitability + liquidity + efficiency + growth) / 4;
    
    return {
      overall: Math.round(overall),
      profitability: Math.round(profitability),
      liquidity: Math.round(liquidity),
      efficiency: Math.round(efficiency),
      growth: Math.round(growth),
      factors: [
        {
          metric: 'Profit Margin',
          score: Math.round(profitability),
          impact: profitability > 70 ? 'positive' : profitability > 40 ? 'neutral' : 'negative',
          description: `Current profit margin indicates ${profitability > 70 ? 'strong' : profitability > 40 ? 'moderate' : 'weak'} profitability`
        },
        {
          metric: 'Cash Flow',
          score: Math.round(liquidity),
          impact: liquidity > 70 ? 'positive' : liquidity > 40 ? 'neutral' : 'negative',
          description: `Cash flow management is ${liquidity > 70 ? 'excellent' : liquidity > 40 ? 'adequate' : 'concerning'}`
        },
        {
          metric: 'Operational Efficiency',
          score: Math.round(efficiency),
          impact: efficiency > 70 ? 'positive' : efficiency > 40 ? 'neutral' : 'negative',
          description: `Operations are ${efficiency > 70 ? 'highly efficient' : efficiency > 40 ? 'moderately efficient' : 'inefficient'}`
        },
        {
          metric: 'Growth Trajectory',
          score: Math.round(growth),
          impact: growth > 70 ? 'positive' : growth > 40 ? 'neutral' : 'negative',
          description: `Business growth is ${growth > 70 ? 'strong' : growth > 40 ? 'steady' : 'stagnant'}`
        }
      ]
    };
  }

  // Get insights for dashboard
  async getInsightsForDashboard(companyId: string): Promise<{
    criticalAlerts: number;
    totalInsights: number;
    topInsights: FinancialInsight[];
    healthScore: number;
  }> {
    const insights = await this.generateFinancialInsights(companyId);
    const healthScore = await this.calculateFinancialHealthScore(companyId);
    
    const criticalAlerts = insights.filter(i => i.severity === 'critical').length;
    const topInsights = insights.slice(0, 5);
    
    return {
      criticalAlerts,
      totalInsights: insights.length,
      topInsights,
      healthScore: healthScore.overall
    };
  }

  // Helper methods
  private async gatherFinancialData(companyId: string): Promise<any> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);

    const loads_data = await db.select()
      .from(loads)
      .where(and(
        eq(loads.companyId, companyId),
        between(loads.createdAt, startDate, endDate)
      ));

    const totalRevenue = loads_data.reduce((sum, load) => {
      const rate = typeof load.rate === 'string' ? parseFloat(load.rate) : (load.rate || 0);
      return sum + rate;
    }, 0);

    const monthlyRevenue = this.groupByMonth(loads_data, 'rate');
    const completedLoads = loads_data.filter(load => load.status === 'delivered');

    return {
      revenue: {
        total: totalRevenue,
        monthly: monthlyRevenue,
        average: loads_data.length > 0 ? totalRevenue / loads_data.length : 0
      },
      expenses: {
        total: totalRevenue * 0.7, // Estimated
        growthRate: Math.random() * 20, // Placeholder
        categories: []
      },
      cashFlow: {
        current: totalRevenue * 0.2,
        trend: 'positive'
      },
      loadMetrics: {
        total: loads_data.length,
        completed: completedLoads.length,
        completionRate: loads_data.length > 0 ? completedLoads.length / loads_data.length : 0
      },
      monthlyTrends: monthlyRevenue,
      performanceMetrics: {
        revenuePerLoad: loads_data.length > 0 ? totalRevenue / loads_data.length : 0,
        efficiency: 0.85
      }
    };
  }

  private async gatherHistoricalCashFlow(companyId: string): Promise<any> {
    // Gather 12 months of cash flow data
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toISOString().slice(0, 7);
      
      // Simplified cash flow calculation
      const inflow = 50000 + Math.random() * 30000;
      const outflow = 35000 + Math.random() * 20000;
      
      months.push({
        month: monthStr,
        inflow,
        outflow,
        net: inflow - outflow
      });
    }
    
    return months;
  }

  private groupByMonth(data: any[], field: string): any[] {
    const grouped = new Map();
    data.forEach(item => {
      const month = item.createdAt.toISOString().slice(0, 7);
      const value = typeof item[field] === 'string' ? parseFloat(item[field]) : (item[field] || 0);
      
      if (!grouped.has(month)) {
        grouped.set(month, { month, total: 0, count: 0 });
      }
      
      const current = grouped.get(month);
      current.total += value;
      current.count += 1;
    });
    
    return Array.from(grouped.values()).sort((a, b) => a.month.localeCompare(b.month));
  }

  private calculateProfitabilityScore(data: any): number {
    const margin = data.revenue.total > 0 ? ((data.revenue.total - data.expenses.total) / data.revenue.total) * 100 : 0;
    return Math.max(0, Math.min(100, margin * 3)); // Scale to 0-100
  }

  private calculateLiquidityScore(data: any): number {
    const cashFlowRatio = data.cashFlow.current / (data.expenses.total / 12); // Monthly expenses
    return Math.max(0, Math.min(100, cashFlowRatio * 25));
  }

  private calculateEfficiencyScore(data: any): number {
    const completionRate = data.loadMetrics.completionRate * 100;
    const efficiency = data.performanceMetrics.efficiency * 100;
    return (completionRate + efficiency) / 2;
  }

  private calculateGrowthScore(data: any): number {
    // Calculate growth based on recent vs historical performance
    const recentMonths = data.monthlyTrends.slice(-3);
    const earlierMonths = data.monthlyTrends.slice(0, 3);
    
    if (earlierMonths.length === 0) return 50;
    
    const recentAvg = recentMonths.reduce((sum: number, m: any) => sum + m.total, 0) / recentMonths.length;
    const earlierAvg = earlierMonths.reduce((sum: number, m: any) => sum + m.total, 0) / earlierMonths.length;
    
    const growthRate = earlierAvg > 0 ? ((recentAvg - earlierAvg) / earlierAvg) * 100 : 0;
    return Math.max(0, Math.min(100, 50 + growthRate * 2)); // Scale around 50
  }

  private generateInsightId(): string {
    return `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const aiFinancialInsightsService = new AIFinancialInsightsService();