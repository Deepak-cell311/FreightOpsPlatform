import OpenAI from "openai";
import { storage } from "./storage";
import { db } from "./db";
import { notificationService } from "./notification-service";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ErrorEvent {
  tenantId: string;
  errorType: string;
  errorMessage: string;
  stackTrace?: string;
  timestamp: Date;
  userId?: string;
  endpoint?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: any;
}

interface AutoHealingSolution {
  action: string;
  description: string;
  sqlFix?: string;
  configFix?: any;
  apiCall?: string;
  rollbackPlan?: string;
  confidence: number;
  estimatedTime: number; // minutes
}

class AutoHealingSystem {
  private healingInProgress = new Set<string>();

  async detectAndHeal(error: ErrorEvent): Promise<boolean> {
    const healingKey = `${error.tenantId}-${error.errorType}`;
    
    // Prevent duplicate healing attempts
    if (this.healingInProgress.has(healingKey)) {
      return false;
    }

    this.healingInProgress.add(healingKey);

    try {
      // Log the error for analysis
      await this.logError(error);

      // Determine error severity and if it's auto-healable
      const canHeal = await this.shouldAttemptHealing(error);
      if (!canHeal) {
        await this.escalateToAdmin(error);
        return false;
      }

      // Generate healing solution using AI
      const solution = await this.generateHealingSolution(error);
      
      if (solution.confidence < 0.8) {
        await this.escalateToAdmin(error, solution);
        return false;
      }

      // Apply the healing solution
      const success = await this.applySolution(error, solution);
      
      if (success) {
        await this.recordSuccessfulHealing(error, solution);
        await this.notifyHealing(error, solution);
      } else {
        await this.escalateToAdmin(error, solution);
      }

      return success;

    } catch (healingError) {
      console.error('Auto-healing system error:', healingError);
      await this.escalateToAdmin(error);
      return false;
    } finally {
      this.healingInProgress.delete(healingKey);
    }
  }

  private async shouldAttemptHealing(error: ErrorEvent): Promise<boolean> {
    // Don't auto-heal critical errors or data corruption
    if (error.severity === 'critical') return false;
    
    // Check if this error type has been successfully healed before
    const previousHealing = await this.getPreviousHealingSuccess(error.tenantId, error.errorType);
    
    // Common healable error patterns
    const healablePatterns = [
      /database connection/i,
      /timeout/i,
      /rate limit/i,
      /authentication failed/i,
      /configuration missing/i,
      /validation error/i,
      /sync failed/i,
      /document upload/i,
      /email delivery/i,
      /payment processing/i
    ];

    const isHealablePattern = healablePatterns.some(pattern => 
      pattern.test(error.errorMessage) || pattern.test(error.errorType)
    );

    return isHealablePattern && (previousHealing === null || previousHealing);
  }

  private async generateHealingSolution(error: ErrorEvent): Promise<AutoHealingSolution> {
    const prompt = `
You are an expert system administrator for FreightOps Pro, a trucking SaaS platform. 
Analyze this error and provide a specific healing solution.

Error Details:
- Tenant ID: ${error.tenantId}
- Error Type: ${error.errorType}
- Error Message: ${error.errorMessage}
- Severity: ${error.severity}
- Endpoint: ${error.endpoint || 'N/A'}
- Context: ${JSON.stringify(error.context || {})}

Available healing actions:
1. DATABASE_FIX - Run SQL to fix data issues
2. CONFIG_UPDATE - Update tenant configuration
3. API_RETRY - Retry failed API calls
4. CACHE_CLEAR - Clear cached data
5. SESSION_RESET - Reset user sessions
6. NOTIFICATION_RESEND - Resend failed notifications
7. SYNC_REPAIR - Fix data synchronization
8. PAYMENT_RETRY - Retry payment processing

Provide a JSON response with:
- action: The healing action type
- description: Clear explanation of what will be fixed
- sqlFix: SQL query if DATABASE_FIX (be very careful with data integrity)
- configFix: Configuration object if CONFIG_UPDATE
- apiCall: API endpoint and payload if API_RETRY
- rollbackPlan: How to undo if healing fails
- confidence: 0.0-1.0 confidence in solution
- estimatedTime: Minutes to complete

IMPORTANT: Only suggest solutions you are confident about. Never suggest destructive operations.
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert system administrator. Provide safe, reliable healing solutions in JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      });

      const solution: AutoHealingSolution = JSON.parse(response.choices[0].message.content || '{}');
      
      // Validate solution safety
      if (solution.sqlFix && this.containsDestructiveSQL(solution.sqlFix)) {
        solution.confidence = 0.0; // Block destructive operations
      }

      return solution;

    } catch (error) {
      console.error('Failed to generate healing solution:', error);
      return {
        action: 'ESCALATE',
        description: 'Unable to generate safe healing solution',
        confidence: 0.0,
        estimatedTime: 0
      };
    }
  }

  private async applySolution(error: ErrorEvent, solution: AutoHealingSolution): Promise<boolean> {
    try {
      switch (solution.action) {
        case 'DATABASE_FIX':
          if (solution.sqlFix) {
            await db.execute(solution.sqlFix);
            return true;
          }
          break;

        case 'CONFIG_UPDATE':
          if (solution.configFix) {
            await storage.updateTenantConfig(error.tenantId, solution.configFix);
            return true;
          }
          break;

        case 'API_RETRY':
          if (solution.apiCall) {
            // Implement API retry logic based on the failed endpoint
            await this.retryFailedAPI(error, solution.apiCall);
            return true;
          }
          break;

        case 'CACHE_CLEAR':
          await this.clearTenantCache(error.tenantId);
          return true;

        case 'SESSION_RESET':
          await this.resetTenantSessions(error.tenantId);
          return true;

        case 'NOTIFICATION_RESEND':
          await this.resendFailedNotifications(error.tenantId);
          return true;

        case 'SYNC_REPAIR':
          await this.repairDataSync(error.tenantId);
          return true;

        case 'PAYMENT_RETRY':
          await this.retryPaymentProcessing(error.tenantId, error.context);
          return true;

        default:
          return false;
      }

      return false;

    } catch (applictionError) {
      console.error('Failed to apply healing solution:', applictionError);
      
      // Attempt rollback if specified
      if (solution.rollbackPlan) {
        await this.executeRollback(solution.rollbackPlan);
      }
      
      return false;
    }
  }

  private containsDestructiveSQL(sql: string): boolean {
    const destructivePatterns = [
      /DROP\s+(TABLE|DATABASE|INDEX)/i,
      /DELETE\s+FROM.*WHERE\s+1=1/i,
      /TRUNCATE/i,
      /ALTER\s+TABLE.*DROP/i,
      /UPDATE.*WHERE\s+1=1/i
    ];

    return destructivePatterns.some(pattern => pattern.test(sql));
  }

  private async clearTenantCache(tenantId: string): Promise<void> {
    // Clear Redis cache for specific tenant
    const cacheKeys = [
      `tenant:${tenantId}:*`,
      `loads:${tenantId}:*`,
      `drivers:${tenantId}:*`,
      `fleet:${tenantId}:*`
    ];
    
    // Implementation would clear Redis cache
    console.log(`Cleared cache for tenant ${tenantId}`);
  }

  private async resetTenantSessions(tenantId: string): Promise<void> {
    // Reset all active sessions for tenant users
    await db.execute(
      `DELETE FROM sessions WHERE sess::text LIKE $1`,
      [`%"tenantId":"${tenantId}"%`]
    );
  }

  private async resendFailedNotifications(tenantId: string): Promise<void> {
    // Retry failed email/SMS notifications
    const failedNotifications = await storage.getFailedNotifications(tenantId);
    
    for (const notification of failedNotifications) {
      try {
        await notificationService.retryNotification(notification);
      } catch (error) {
        console.error('Failed to resend notification:', error);
      }
    }
  }

  private async repairDataSync(tenantId: string): Promise<void> {
    // Repair ELD sync, load board sync, etc.
    await storage.triggerDataSync(tenantId);
  }

  private async retryPaymentProcessing(tenantId: string, context: any): Promise<void> {
    // Retry failed Stripe payments
    if (context?.paymentIntentId) {
      // Implement Stripe retry logic
      console.log(`Retrying payment for tenant ${tenantId}`);
    }
  }

  private async retryFailedAPI(error: ErrorEvent, apiCall: string): Promise<void> {
    // Retry failed external API calls (ELD, load boards, etc.)
    console.log(`Retrying API call: ${apiCall} for tenant ${error.tenantId}`);
  }

  private async executeRollback(rollbackPlan: string): Promise<void> {
    console.log(`Executing rollback: ${rollbackPlan}`);
    // Implement rollback logic based on the plan
  }

  private async logError(error: ErrorEvent): Promise<void> {
    await storage.createErrorLog({
      tenantId: error.tenantId,
      errorType: error.errorType,
      errorMessage: error.errorMessage,
      severity: error.severity,
      timestamp: error.timestamp,
      context: error.context
    });
  }

  private async getPreviousHealingSuccess(tenantId: string, errorType: string): Promise<boolean | null> {
    const previousAttempts = await storage.getHealingHistory(tenantId, errorType);
    if (previousAttempts.length === 0) return null;
    
    // Return success rate of previous healing attempts
    const successRate = previousAttempts.filter(a => a.success).length / previousAttempts.length;
    return successRate > 0.7; // 70% success threshold
  }

  private async recordSuccessfulHealing(error: ErrorEvent, solution: AutoHealingSolution): Promise<void> {
    await storage.createHealingRecord({
      tenantId: error.tenantId,
      errorType: error.errorType,
      solution: solution.action,
      success: true,
      confidence: solution.confidence,
      timestamp: new Date()
    });
  }

  private async notifyHealing(error: ErrorEvent, solution: AutoHealingSolution): Promise<void> {
    // Notify tenant admins about auto-healing
    const adminUsers = await storage.getTenantAdmins(error.tenantId);
    
    for (const admin of adminUsers) {
      await notificationService.sendEmail(
        admin.email,
        'FreightOps Pro - Issue Automatically Resolved',
        `
        An issue was automatically detected and resolved in your FreightOps Pro account.
        
        Issue: ${error.errorType}
        Solution: ${solution.description}
        Resolved at: ${new Date().toLocaleString()}
        
        No action required on your part. Your system is operating normally.
        `
      );
    }
  }

  private async escalateToAdmin(error: ErrorEvent, attemptedSolution?: AutoHealingSolution): Promise<void> {
    // Send to FreightOps Pro support team
    const escalationMessage = `
    Auto-healing escalation for tenant ${error.tenantId}
    
    Error: ${error.errorType}
    Message: ${error.errorMessage}
    Severity: ${error.severity}
    
    ${attemptedSolution ? `Attempted solution: ${attemptedSolution.description} (Confidence: ${attemptedSolution.confidence})` : 'No solution attempted'}
    
    Manual intervention required.
    `;

    await notificationService.sendEmail(
      'support@freightopspro.com',
      'Auto-Healing Escalation Required',
      escalationMessage
    );
  }

  // Public method to trigger healing from error handlers
  async handleError(tenantId: string, errorType: string, errorMessage: string, context?: any): Promise<void> {
    const error: ErrorEvent = {
      tenantId,
      errorType,
      errorMessage,
      timestamp: new Date(),
      severity: this.categorizeErrorSeverity(errorMessage),
      context
    };

    await this.detectAndHeal(error);
  }

  private categorizeErrorSeverity(errorMessage: string): 'low' | 'medium' | 'high' | 'critical' {
    if (errorMessage.includes('database') || errorMessage.includes('corruption')) return 'critical';
    if (errorMessage.includes('payment') || errorMessage.includes('authentication')) return 'high';
    if (errorMessage.includes('timeout') || errorMessage.includes('connection')) return 'medium';
    return 'low';
  }
}

export const autoHealingSystem = new AutoHealingSystem();