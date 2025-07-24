import { simSwapProtectionService } from './sim-swap-protection-service';

interface VerificationCode {
  code: string;
  phoneNumber: string;
  purpose: 'transfer' | 'card_activation' | 'account_access';
  amount?: number;
  recipientInfo?: string;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
  userId: string;
  deviceInfo?: {
    userAgent: string;
    ipAddress: string;
    deviceId: string;
  };
  simSwapRisk?: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
    requiresEnhanced: boolean;
  };
}

export class SMSVerificationSimulationService {
  private verificationCodes: Map<string, VerificationCode> = new Map();
  private maxAttempts = 3;
  private codeExpiryMinutes = 10;

  async sendTransferVerificationCode(
    phoneNumber: string, 
    amount: number, 
    recipientInfo: string, 
    userId: string, 
    deviceInfo: { userAgent: string; ipAddress: string }
  ): Promise<{ 
    success: boolean; 
    verificationId: string; 
    message: string; 
    riskLevel?: string;
    requiresEnhancedVerification?: boolean;
    blockedUntilReview?: boolean;
  }> {
    const verificationId = `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Assess SIM swap risk before sending SMS
    const riskAssessment = await simSwapProtectionService.assessSIMSwapRisk(
      userId, 
      phoneNumber, 
      deviceInfo
    );

    const verification: VerificationCode = {
      code: this.generateSecurityCode(),
      phoneNumber: this.formatPhoneNumber(phoneNumber),
      purpose: 'transfer',
      amount,
      recipientInfo,
      expiresAt: new Date(Date.now() + this.codeExpiryMinutes * 60 * 1000),
      attempts: 0,
      verified: false,
      userId,
      deviceInfo,
      simSwapRisk: {
        riskLevel: riskAssessment.riskLevel,
        riskScore: riskAssessment.riskScore,
        requiresEnhanced: riskAssessment.requiresAdditionalVerification
      }
    };

    this.verificationCodes.set(verificationId, verification);

    // Block high-risk transfers
    if (riskAssessment.riskLevel === 'critical' || riskAssessment.blockedUntilManualReview) {
      console.log(`🚨 BLOCKED: High-risk transfer attempt from ${phoneNumber} - Risk Level: ${riskAssessment.riskLevel}`);
      return {
        success: false,
        verificationId,
        message: 'Transfer blocked due to security concerns. Please contact support.',
        riskLevel: riskAssessment.riskLevel,
        requiresEnhancedVerification: true,
        blockedUntilReview: true
      };
    }

    // Simulation mode - always succeed for demonstration
    console.log(`📱 [SMS SIMULATION] Security code ${verification.code} sent to ${phoneNumber}`);
    console.log(`   Transfer: $${amount.toLocaleString()} to ${recipientInfo}`);
    console.log(`   Risk Level: ${riskAssessment.riskLevel} (Score: ${riskAssessment.riskScore})`);
    console.log(`   Enhanced Verification Required: ${riskAssessment.requiresAdditionalVerification}`);

    return {
      success: true,
      verificationId,
      message: `Verification code sent to ${this.maskPhoneNumber(phoneNumber)}`,
      riskLevel: riskAssessment.riskLevel,
      requiresEnhancedVerification: riskAssessment.requiresAdditionalVerification,
      blockedUntilReview: riskAssessment.blockedUntilManualReview
    };
  }

  async verifyTransferCode(
    verificationId: string, 
    code: string
  ): Promise<{ success: boolean; message: string; verified: boolean }> {
    const verification = this.verificationCodes.get(verificationId);

    if (!verification) {
      return { success: false, message: 'Invalid verification ID', verified: false };
    }

    if (verification.verified) {
      return { success: true, message: 'Code already verified', verified: true };
    }

    if (new Date() > verification.expiresAt) {
      this.verificationCodes.delete(verificationId);
      return { success: false, message: 'Verification code expired', verified: false };
    }

    verification.attempts++;

    if (verification.attempts > this.maxAttempts) {
      this.verificationCodes.delete(verificationId);
      return { success: false, message: 'Too many verification attempts', verified: false };
    }

    if (verification.code === code) {
      verification.verified = true;
      console.log(`✅ SMS verification successful for ${verification.phoneNumber}`);
      return { success: true, message: 'Verification successful', verified: true };
    }

    return { 
      success: false, 
      message: `Invalid code. ${this.maxAttempts - verification.attempts} attempts remaining`, 
      verified: false 
    };
  }

  async sendCardActivationCode(phoneNumber: string, cardNumber: string): Promise<{ success: boolean; verificationId: string; message: string }> {
    const verificationId = `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const verification: VerificationCode = {
      code: this.generateSecurityCode(),
      phoneNumber: this.formatPhoneNumber(phoneNumber),
      purpose: 'card_activation',
      recipientInfo: `Card ending in ${cardNumber.slice(-4)}`,
      expiresAt: new Date(Date.now() + this.codeExpiryMinutes * 60 * 1000),
      attempts: 0,
      verified: false,
      userId: 'system'
    };

    this.verificationCodes.set(verificationId, verification);

    console.log(`📱 [SMS SIMULATION] Card activation code ${verification.code} sent to ${phoneNumber}`);
    console.log(`   Card: ****${cardNumber.slice(-4)}`);

    return {
      success: true,
      verificationId,
      message: `Activation code sent to ${this.maskPhoneNumber(phoneNumber)}`
    };
  }

  private generateSecurityCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private formatPhoneNumber(phoneNumber: string): string {
    return phoneNumber.replace(/[^\d+]/g, '');
  }

  private maskPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/[^\d]/g, '');
    if (cleaned.length >= 10) {
      return `****-***-${cleaned.slice(-4)}`;
    }
    return '****-****';
  }

  async getVerificationStatus(verificationId: string): Promise<{
    exists: boolean;
    verified: boolean;
    expired: boolean;
    attemptsRemaining: number;
  }> {
    const verification = this.verificationCodes.get(verificationId);

    if (!verification) {
      return { exists: false, verified: false, expired: false, attemptsRemaining: 0 };
    }

    const expired = new Date() > verification.expiresAt;
    const attemptsRemaining = Math.max(0, this.maxAttempts - verification.attempts);

    return {
      exists: true,
      verified: verification.verified,
      expired,
      attemptsRemaining
    };
  }

  async cleanupExpiredCodes(): Promise<void> {
    const now = new Date();
    for (const [id, verification] of this.verificationCodes.entries()) {
      if (now > verification.expiresAt) {
        this.verificationCodes.delete(id);
      }
    }
  }
}

export const smsVerificationSimulationService = new SMSVerificationSimulationService();