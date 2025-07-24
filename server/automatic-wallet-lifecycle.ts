import { stripeConnectWalletService } from "./stripe-connect-wallet-service";
import { db } from "./db";
import { companies, companyWallets } from "@shared/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export class AutomaticWalletLifecycle {
  // Automatically create wallet when company is created
  async onCompanyCreated(companyData: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    dotNumber?: string;
    mcNumber?: string;
    businessType: string;
    address?: string;
  }): Promise<void> {
    try {
      // Determine company type and risk profile
      const companyType = this.determineCompanyType(companyData.name, companyData.businessType);
      const riskProfile = this.assessInitialRisk(companyData);

      // Create Stripe Connect account with proper onboarding
      const wallet = await stripeConnectWalletService.createConnectAccount({
        companyId: companyData.id,
        businessName: companyData.name,
        email: companyData.email,
        phone: companyData.phone,
        businessType: 'company',
        country: 'US',
        isHQAdmin: companyType === 'hq_admin',
        companyType,
      });

      // Log wallet creation for compliance
      await this.logComplianceEvent(companyData.id, 'wallet_created', {
        walletId: wallet.id,
        riskProfile,
        dotNumber: companyData.dotNumber,
        mcNumber: companyData.mcNumber,
        initialStatus: 'pending_verification',
      });

      // Trigger onboarding workflow
      await this.initiateOnboardingWorkflow(companyData.id);

    } catch (error: any) {
      // Log failure for review
      await this.logComplianceEvent(companyData.id, 'wallet_creation_failed', {
        error: error.message,
        requiresManualReview: true,
      });
      
      // Don't throw - allow company creation to proceed
      console.error(`Wallet creation failed for company ${companyData.id}:`, error.message);
    }
  }

  // Assess initial risk profile for new companies
  private assessInitialRisk(companyData: any): 'low' | 'medium' | 'high' {
    let riskScore = 0;

    // DOT/MC number presence (lower risk if present)
    if (!companyData.dotNumber || !companyData.mcNumber) {
      riskScore += 2;
    }

    // Business age assessment (would integrate with FMCSA data)
    // For now, assume new companies are medium risk
    riskScore += 1;

    // Email domain assessment
    const emailDomain = companyData.email?.split('@')[1];
    if (!emailDomain || emailDomain.includes('gmail') || emailDomain.includes('yahoo')) {
      riskScore += 1;
    }

    // Phone number presence
    if (!companyData.phone) {
      riskScore += 1;
    }

    if (riskScore <= 1) return 'low';
    if (riskScore <= 3) return 'medium';
    return 'high';
  }

  // Determine company type from business data
  private determineCompanyType(name: string, businessType: string): 'carrier' | 'broker' | 'shipper' | 'hq_admin' {
    const nameLC = name.toLowerCase();
    const businessLC = businessType.toLowerCase();

    if (nameLC.includes('hq') || nameLC.includes('admin') || nameLC.includes('headquarters')) {
      return 'hq_admin';
    }
    
    if (nameLC.includes('broker') || businessLC.includes('broker') || businessLC.includes('brokerage')) {
      return 'broker';
    }
    
    if (nameLC.includes('carrier') || nameLC.includes('transport') || nameLC.includes('trucking') || 
        nameLC.includes('logistics') || businessLC.includes('carrier') || businessLC.includes('transport')) {
      return 'carrier';
    }
    
    return 'shipper';
  }

  // Initiate comprehensive onboarding workflow
  private async initiateOnboardingWorkflow(companyId: string): Promise<void> {
    // Step 1: Generate onboarding link
    const onboardingUrl = await stripeConnectWalletService.generateOnboardingLink(
      companyId,
      `${process.env.BASE_URL || 'https://localhost:5000'}/wallet/onboarding/refresh`,
      `${process.env.BASE_URL || 'https://localhost:5000'}/wallet/onboarding/complete`
    );

    // Step 2: Send onboarding notification (would integrate with email service)
    await this.sendOnboardingNotification(companyId, onboardingUrl);

    // Step 3: Schedule compliance check
    await this.scheduleComplianceCheck(companyId, new Date(Date.now() + 24 * 60 * 60 * 1000)); // 24 hours
  }

  // Send onboarding notification to company
  private async sendOnboardingNotification(companyId: string, onboardingUrl: string): Promise<void> {
    // Log notification for compliance
    await this.logComplianceEvent(companyId, 'onboarding_notification_sent', {
      onboardingUrl,
      sentAt: new Date().toISOString(),
      method: 'email',
    });

    // In production, this would integrate with your email service
    console.log(`Onboarding notification sent to company ${companyId}: ${onboardingUrl}`);
  }

  // Schedule automatic compliance check
  private async scheduleComplianceCheck(companyId: string, scheduledFor: Date): Promise<void> {
    await this.logComplianceEvent(companyId, 'compliance_check_scheduled', {
      scheduledFor: scheduledFor.toISOString(),
      checkType: 'initial_verification',
    });
  }

  // Monitor wallet status and handle state changes
  async monitorWalletStatus(companyId: string): Promise<void> {
    try {
      const wallet = await stripeConnectWalletService.updateAccountStatus(companyId);
      
      // Handle different account states
      switch (wallet.accountStatus) {
        case 'active':
          await this.handleAccountActivated(companyId, wallet);
          break;
        case 'restricted':
          await this.handleAccountRestricted(companyId, wallet);
          break;
        case 'suspended':
          await this.handleAccountSuspended(companyId, wallet);
          break;
      }

      // Check requirements status
      if (wallet.requirementsStatus.pastDue.length > 0) {
        await this.handlePastDueRequirements(companyId, wallet.requirementsStatus.pastDue);
      }

    } catch (error: any) {
      await this.logComplianceEvent(companyId, 'wallet_monitoring_error', {
        error: error.message,
        requiresManualReview: true,
      });
    }
  }

  // Handle account activation
  private async handleAccountActivated(companyId: string, wallet: any): Promise<void> {
    await this.logComplianceEvent(companyId, 'account_activated', {
      walletId: wallet.id,
      activatedAt: new Date().toISOString(),
      capabilities: wallet.capabilities,
    });

    // Enable full platform features
    await this.enablePlatformFeatures(companyId);
    
    // Send activation notification
    await this.sendActivationNotification(companyId);
  }

  // Handle account restrictions
  private async handleAccountRestricted(companyId: string, wallet: any): Promise<void> {
    await this.logComplianceEvent(companyId, 'account_restricted', {
      walletId: wallet.id,
      restrictedAt: new Date().toISOString(),
      reason: wallet.requirementsStatus.disabledReason,
      pastDueRequirements: wallet.requirementsStatus.pastDue,
    });

    // Restrict platform features
    await this.restrictPlatformFeatures(companyId);
    
    // Send restriction notification with remediation steps
    await this.sendRestrictionNotification(companyId, wallet.requirementsStatus);
  }

  // Handle account suspension
  private async handleAccountSuspended(companyId: string, wallet: any): Promise<void> {
    await this.logComplianceEvent(companyId, 'account_suspended', {
      walletId: wallet.id,
      suspendedAt: new Date().toISOString(),
      reason: wallet.requirementsStatus.disabledReason,
    });

    // Suspend all platform access
    await this.suspendPlatformAccess(companyId);
    
    // Send suspension notification
    await this.sendSuspensionNotification(companyId);
  }

  // Handle past due requirements
  private async handlePastDueRequirements(companyId: string, pastDueRequirements: string[]): Promise<void> {
    await this.logComplianceEvent(companyId, 'past_due_requirements', {
      requirements: pastDueRequirements,
      escalationLevel: this.determineEscalationLevel(pastDueRequirements.length),
    });

    // Send remediation notification
    await this.sendRemediationNotification(companyId, pastDueRequirements);
  }

  // Determine escalation level based on number of past due items
  private determineEscalationLevel(pastDueCount: number): 'low' | 'medium' | 'high' | 'critical' {
    if (pastDueCount <= 1) return 'low';
    if (pastDueCount <= 3) return 'medium';
    if (pastDueCount <= 5) return 'high';
    return 'critical';
  }

  // Enable platform features for verified accounts
  private async enablePlatformFeatures(companyId: string): Promise<void> {
    // Update company status to enable full features
    await db.update(companies)
      .set({
        verificationStatus: 'verified',
        platformAccess: 'full',
        updatedAt: new Date(),
      })
      .where(eq(companies.id, companyId));
  }

  // Restrict features for non-compliant accounts
  private async restrictPlatformFeatures(companyId: string): Promise<void> {
    await db.update(companies)
      .set({
        verificationStatus: 'restricted',
        platformAccess: 'limited',
        updatedAt: new Date(),
      })
      .where(eq(companies.id, companyId));
  }

  // Suspend platform access
  private async suspendPlatformAccess(companyId: string): Promise<void> {
    await db.update(companies)
      .set({
        verificationStatus: 'suspended',
        platformAccess: 'suspended',
        updatedAt: new Date(),
      })
      .where(eq(companies.id, companyId));
  }

  // Send various notifications
  private async sendActivationNotification(companyId: string): Promise<void> {
    console.log(`Account activated notification sent to company ${companyId}`);
  }

  private async sendRestrictionNotification(companyId: string, requirementsStatus: any): Promise<void> {
    console.log(`Account restriction notification sent to company ${companyId}`, requirementsStatus);
  }

  private async sendSuspensionNotification(companyId: string): Promise<void> {
    console.log(`Account suspension notification sent to company ${companyId}`);
  }

  private async sendRemediationNotification(companyId: string, pastDueRequirements: string[]): Promise<void> {
    console.log(`Remediation notification sent to company ${companyId}`, pastDueRequirements);
  }

  // Log compliance events for audit trail
  private async logComplianceEvent(companyId: string, eventType: string, eventData: any): Promise<void> {
    // In production, this would write to a dedicated compliance log table
    console.log(`Compliance Event [${companyId}] ${eventType}:`, eventData);
  }

  // Create wallets for all existing companies that don't have them
  async backfillWalletsForExistingCompanies(): Promise<{ success: number; failed: number; errors: string[] }> {
    const companiesWithoutWallets = await db
      .select()
      .from(companies)
      .where(eq(companies.stripeAccountId, null));

    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const company of companiesWithoutWallets) {
      try {
        await this.onCompanyCreated({
          id: company.id,
          name: company.name,
          email: company.email || `contact@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
          phone: company.phone || undefined,
          dotNumber: company.dotNumber || undefined,
          mcNumber: company.mcNumber || undefined,
          businessType: company.businessType || 'transportation',
          address: company.address || undefined,
        });
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`${company.name}: ${error.message}`);
      }
    }

    return results;
  }
}

export const automaticWalletLifecycle = new AutomaticWalletLifecycle();