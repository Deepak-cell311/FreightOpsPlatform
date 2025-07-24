import OpenAI from "openai";
import { storage } from "./storage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

interface LogbookAuditResult {
  totalViolations: number;
  severityScore: number;
  complianceScore: number;
  findings: Array<{
    violationType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    date: string;
    recommendation: string;
  }>;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface AccountantAnalysisResult {
  insights: Array<{
    category: string;
    insight: string;
    impact: 'positive' | 'negative' | 'neutral';
    confidence: number;
  }>;
  recommendations: Array<{
    type: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    estimatedSavings?: number;
  }>;
  anomalies: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    amount?: number;
  }>;
  costSavings: number;
  riskFactors: Array<{
    factor: string;
    risk: 'low' | 'medium' | 'high';
    description: string;
  }>;
  confidenceScore: number;
}

export class AIServices {
  // AI Logbook Auditing Service
  async auditDriverLogbook(
    companyId: string,
    driverId: number,
    auditPeriod: 'daily' | 'weekly' | 'monthly',
    periodStart: Date,
    periodEnd: Date
  ): Promise<LogbookAuditResult> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Check if AI feature is enabled for company
    const aiFeature = await storage.getAIFeature(companyId, 'logbook_auditing');
    if (!aiFeature?.isEnabled) {
      throw new Error('AI Logbook Auditing feature not enabled');
    }

    // Check usage limits
    if (aiFeature.usageCount >= aiFeature.usageLimit) {
      throw new Error('Monthly usage limit exceeded for AI Logbook Auditing');
    }

    const startTime = Date.now();

    try {
      // Get HOS logs for the period
      const hosLogs = await storage.getHOSLogsByPeriod(companyId, driverId, periodStart, periodEnd);
      const driver = await storage.getDriver(driverId);
      
      if (!driver) {
        throw new Error('Driver not found');
      }

      // Prepare data for AI analysis
      const logbookData = {
        driverInfo: {
          id: driver.id,
          name: `${driver.firstName} ${driver.lastName}`,
          licenseNumber: driver.licenseNumber,
          cdlClass: driver.cdlClass
        },
        auditPeriod: {
          type: auditPeriod,
          start: periodStart.toISOString(),
          end: periodEnd.toISOString()
        },
        hosLogs: hosLogs.map(log => ({
          date: log.logDate,
          dutyStatus: log.dutyStatus,
          startTime: log.startTime,
          endTime: log.endTime,
          duration: log.duration,
          location: log.location,
          isViolation: log.isViolation,
          violationType: log.violationType
        })),
        currentHours: {
          driving: driver.currentDrivingHours,
          onDuty: driver.currentOnDutyHours,
          available: driver.availableDrivingHours
        }
      };

      const prompt = `
You are an expert DOT compliance auditor specializing in Hours of Service (HOS) regulations. Analyze the following driver logbook data for violations and compliance issues.

Driver Data:
${JSON.stringify(logbookData, null, 2)}

HOS Regulations to check:
- 11-hour driving limit
- 14-hour on-duty limit  
- 30-minute break requirement after 8 hours
- 10-hour minimum off-duty time
- 60/70 hour weekly limits
- Proper status changes and timing

Analyze this data and provide a comprehensive audit report in JSON format with the following structure:
{
  "totalViolations": number,
  "severityScore": number (0-100, higher = more severe),
  "complianceScore": number (0-100, higher = better compliance),
  "findings": [
    {
      "violationType": "string",
      "severity": "low|medium|high|critical",
      "description": "detailed explanation",
      "date": "ISO date string",
      "recommendation": "specific corrective action"
    }
  ],
  "recommendations": ["string array of general recommendations"],
  "riskLevel": "low|medium|high|critical"
}

Focus on identifying actual violations, potential risks, and providing actionable recommendations for improved compliance.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert DOT compliance auditor. Analyze logbook data for HOS violations and provide detailed compliance reports in JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1 // Low temperature for consistent, accurate analysis
      });

      const processingTime = Math.round((Date.now() - startTime) / 1000);
      const result: LogbookAuditResult = JSON.parse(response.choices[0].message.content || '{}');

      // Update usage count
      await storage.updateAIFeatureUsage(aiFeature.id);

      // Save audit results
      await storage.createAILogbookAudit({
        companyId,
        driverId,
        auditDate: new Date(),
        auditPeriod,
        periodStart,
        periodEnd,
        totalViolations: result.totalViolations,
        severityScore: result.severityScore,
        complianceScore: result.complianceScore,
        findings: result.findings,
        recommendations: result.recommendations,
        riskLevel: result.riskLevel,
        auditStatus: 'completed',
        aiModel: 'gpt-4o',
        processingTime
      });

      return result;

    } catch (error) {
      console.error('AI Logbook Audit error:', error);
      throw new Error('Failed to complete AI logbook audit');
    }
  }

  // AI Accountant Analysis Service
  async analyzeFinancials(
    companyId: string,
    reportType: 'expense_analysis' | 'revenue_optimization' | 'tax_preparation' | 'audit_preparation',
    reportPeriod: 'monthly' | 'quarterly' | 'yearly',
    periodStart: Date,
    periodEnd: Date,
    userId: string
  ): Promise<AccountantAnalysisResult> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Check if AI feature is enabled for company
    const aiFeature = await storage.getAIFeature(companyId, 'ai_accountant');
    if (!aiFeature?.isEnabled) {
      throw new Error('AI Accountant feature not enabled');
    }

    // Check usage limits
    if (aiFeature.usageCount >= aiFeature.usageLimit) {
      throw new Error('Monthly usage limit exceeded for AI Accountant');
    }

    const startTime = Date.now();

    try {
      // Get financial data for the period
      const [transactions, invoices, loads, cardTransactions, bankTransfers] = await Promise.all([
        storage.getWalletTransactionsByPeriod(companyId, periodStart, periodEnd),
        storage.getInvoicesByPeriod(companyId, periodStart, periodEnd),
        storage.getLoadsByPeriod(companyId, periodStart, periodEnd),
        storage.getCardTransactionsByPeriod(companyId, periodStart, periodEnd),
        storage.getBankTransfersByPeriod(companyId, periodStart, periodEnd)
      ]);

      // Prepare comprehensive financial data
      const financialData = {
        reportInfo: {
          type: reportType,
          period: reportPeriod,
          start: periodStart.toISOString(),
          end: periodEnd.toISOString()
        },
        transactions: {
          wallet: transactions.map(t => ({
            type: t.type,
            category: t.category,
            amount: t.amount,
            description: t.description,
            date: t.createdAt
          })),
          cards: cardTransactions.map(t => ({
            amount: t.amount,
            category: t.category,
            merchant: t.merchant,
            date: t.transactionDate
          })),
          bankTransfers: bankTransfers.map(t => ({
            amount: t.amount,
            type: t.transferType,
            description: t.description,
            date: t.transferDate
          }))
        },
        revenue: {
          invoices: invoices.map(i => ({
            amount: i.amount,
            status: i.status,
            issueDate: i.issueDate,
            dueDate: i.dueDate
          })),
          loads: loads.map(l => ({
            revenue: l.revenue,
            status: l.status,
            deliveryDate: l.deliveryDate
          }))
        },
        summary: {
          totalRevenue: invoices.reduce((sum, i) => sum + Number(i.amount || 0), 0),
          totalExpenses: transactions.reduce((sum, t) => sum + (t.type === 'debit' ? Number(t.amount) : 0), 0),
          totalTransactions: transactions.length + cardTransactions.length + bankTransfers.length
        }
      };

      const reportTypePrompts = {
        expense_analysis: "Focus on expense categorization, cost optimization opportunities, and spending patterns analysis.",
        revenue_optimization: "Analyze revenue streams, pricing strategies, and opportunities to increase profitability.",
        tax_preparation: "Identify tax deductions, compliance requirements, and tax optimization strategies.",
        audit_preparation: "Review financial accuracy, identify discrepancies, and ensure audit readiness."
      };

      const prompt = `
You are an expert CPA and financial analyst specializing in trucking industry accounting. Analyze the following financial data and provide comprehensive insights.

Report Type: ${reportType}
${reportTypePrompts[reportType]}

Financial Data:
${JSON.stringify(financialData, null, 2)}

Provide a detailed analysis in JSON format with this structure:
{
  "insights": [
    {
      "category": "string (e.g., 'Fuel Costs', 'Revenue Trends')",
      "insight": "detailed analysis",
      "impact": "positive|negative|neutral",
      "confidence": number (0-100)
    }
  ],
  "recommendations": [
    {
      "type": "string (e.g., 'cost_reduction', 'revenue_increase')",
      "description": "actionable recommendation",
      "priority": "low|medium|high",
      "estimatedSavings": number (optional)
    }
  ],
  "anomalies": [
    {
      "type": "string",
      "description": "description of anomaly",
      "severity": "low|medium|high",
      "amount": number (optional)
    }
  ],
  "costSavings": number (total estimated potential savings),
  "riskFactors": [
    {
      "factor": "string",
      "risk": "low|medium|high",
      "description": "explanation"
    }
  ],
  "confidenceScore": number (0-100)
}

Focus on trucking industry specific insights, regulatory compliance, and actionable financial optimization strategies.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert CPA and financial analyst specializing in trucking industry accounting. Provide detailed, actionable financial analysis in JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2 // Slightly higher for creative insights but still consistent
      });

      const processingTime = Math.round((Date.now() - startTime) / 1000);
      const result: AccountantAnalysisResult = JSON.parse(response.choices[0].message.content || '{}');

      // Update usage count
      await storage.updateAIFeatureUsage(aiFeature.id);

      // Save analysis results
      await storage.createAIAccountantReport({
        companyId,
        reportType,
        reportPeriod,
        periodStart,
        periodEnd,
        totalTransactions: financialData.summary.totalTransactions,
        analysisResults: financialData,
        insights: result.insights,
        recommendations: result.recommendations,
        anomalies: result.anomalies,
        costSavings: result.costSavings,
        riskFactors: result.riskFactors,
        confidenceScore: result.confidenceScore,
        reportStatus: 'completed',
        aiModel: 'gpt-4o',
        processingTime,
        generatedBy: userId
      });

      return result;

    } catch (error) {
      console.error('AI Accountant Analysis error:', error);
      throw new Error('Failed to complete AI financial analysis');
    }
  }

  // Check AI feature availability and usage
  async checkAIFeatureUsage(companyId: string, featureType: string) {
    const feature = await storage.getAIFeature(companyId, featureType);
    if (!feature) {
      return { enabled: false, usage: 0, limit: 0, remaining: 0 };
    }

    return {
      enabled: feature.isEnabled,
      usage: feature.usageCount,
      limit: feature.usageLimit,
      remaining: Math.max(0, feature.usageLimit - feature.usageCount),
      monthlyFee: feature.monthlyFee
    };
  }
}

export const aiServices = new AIServices();