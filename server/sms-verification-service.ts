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

export class SMSVerificationService {
  private twilioClient: any = null;
  private verificationCodes: Map<string, VerificationCode> = new Map();
  private maxAttempts = 3;
  private codeExpiryMinutes = 10;

  constructor() {
    // Initialize Twilio only if credentials are available
    this.initializeTwilio();
  }

  private async initializeTwilio() {
    try {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        const Twilio = (await import('twilio')).default;
        this.twilioClient = Twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
      }
    } catch (error) {
      console.log('Twilio not available, using simulation mode');
      this.twilioClient = null;
    }
  }

  async sendTransferVerificationCode(
    phoneNumber: string, 
    amount: number, 
    recipientInfo: string,
    userId: string,
    deviceInfo: {
      userAgent: string;
      ipAddress: string;
      deviceId?: string;
    }
  ): Promise<{ 
    success: boolean; 
    verificationId: string; 
    message: string;
    requiresEnhancedVerification: boolean;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    blockedUntilReview: boolean;
  }> {
    
    // Step 1: Assess SIM swap risk
    const riskAssessment = await simSwapProtectionService.assessSIMSwapRisk(
      userId,
      phoneNumber,
      deviceInfo
    );

    // Step 2: Check for potential SIM swap
    const simSwapCheck = await simSwapProtectionService.detectPotentialSIMSwap(
      phoneNumber,
      userId,
      {
        userAgent: deviceInfo.userAgent,
        ipAddress: deviceInfo.ipAddress,
        deviceId: deviceInfo.deviceId || 'unknown'
      }
    );

    // Step 3: Block if critical risk or SIM swap detected
    if (riskAssessment.blockedUntilManualReview || 
        (simSwapCheck.detected && simSwapCheck.confidence > 80)) {
      return {
        success: false,
        verificationId: '',
        message: 'Transaction blocked for security review. Please contact support.',
        requiresEnhancedVerification: true,
        riskLevel: 'critical',
        blockedUntilReview: true
      };
    }

    const code = this.generateSecurityCode();
    const verificationId = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const verification: VerificationCode = {
      code,
      phoneNumber: this.formatPhoneNumber(phoneNumber),
      purpose: 'transfer',
      amount,
      recipientInfo,
      expiresAt: new Date(Date.now() + this.codeExpiryMinutes * 60 * 1000),
      attempts: 0,
      verified: false,
      userId,
      deviceInfo: {
        ...deviceInfo,
        deviceId: deviceInfo.deviceId || 'unknown'
      },
      simSwapRisk: {
        riskLevel: riskAssessment.riskLevel,
        riskScore: riskAssessment.riskScore,
        requiresEnhanced: riskAssessment.requiresAdditionalVerification
      }
    };

    this.verificationCodes.set(verificationId, verification);

    // Enhanced message based on risk level
    let message = `FreightOps Security: Your verification code for transfer of $${amount.toLocaleString()} to ${recipientInfo} is: ${code}. Code expires in ${this.codeExpiryMinutes} minutes. Do not share this code.`;
    
    if (riskAssessment.riskLevel === 'high') {
      message += ` HIGH RISK: If you did not initiate this transfer, contact support immediately.`;
    } else if (riskAssessment.riskLevel === 'medium') {
      message += ` Additional verification may be required.`;
    }

    try {
      if (this.twilioClient && process.env.TWILIO_PHONE_NUMBER) {
        await this.twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: verification.phoneNumber
        });
        console.log(`SMS verification code sent to ${phoneNumber} for transfer (Risk: ${riskAssessment.riskLevel})`);
      } else {
        console.log(`SMS would be sent to ${phoneNumber}: ${message}`);
      }

      // Register device if not already known
      if (!deviceInfo.deviceId) {
        await simSwapProtectionService.registerUserDevice(userId, phoneNumber, deviceInfo);
      }

      return {
        success: true,
        verificationId,
        message: `Verification code sent to ${this.maskPhoneNumber(phoneNumber)}`,
        requiresEnhancedVerification: riskAssessment.requiresAdditionalVerification,
        riskLevel: riskAssessment.riskLevel,
        blockedUntilReview: false
      };
    } catch (error) {
      console.error('Failed to send SMS verification:', error);
      return {
        success: false,
        verificationId: '',
        message: 'Failed to send verification code',
        requiresEnhancedVerification: false,
        riskLevel: 'low',
        blockedUntilReview: false
      };
    }
  }

  async verifyTransferCode(
    verificationId: string, 
    inputCode: string
  ): Promise<{ success: boolean; message: string; transferApproved: boolean }> {
    const verification = this.verificationCodes.get(verificationId);
    
    if (!verification) {
      return {
        success: false,
        message: 'Invalid verification request',
        transferApproved: false
      };
    }

    if (verification.verified) {
      return {
        success: false,
        message: 'Verification code already used',
        transferApproved: false
      };
    }

    if (new Date() > verification.expiresAt) {
      this.verificationCodes.delete(verificationId);
      return {
        success: false,
        message: 'Verification code expired',
        transferApproved: false
      };
    }

    verification.attempts++;

    if (verification.attempts > this.maxAttempts) {
      this.verificationCodes.delete(verificationId);
      await this.sendSecurityAlert(verification);
      return {
        success: false,
        message: 'Too many failed attempts. Transfer blocked for security.',
        transferApproved: false
      };
    }

    if (verification.code !== inputCode.trim()) {
      this.verificationCodes.set(verificationId, verification);
      return {
        success: false,
        message: `Invalid code. ${this.maxAttempts - verification.attempts} attempts remaining.`,
        transferApproved: false
      };
    }

    // Code verified successfully
    verification.verified = true;
    this.verificationCodes.set(verificationId, verification);
    
    // Auto-cleanup after successful verification
    setTimeout(() => {
      this.verificationCodes.delete(verificationId);
    }, 60000); // Clean up after 1 minute

    return {
      success: true,
      message: 'Transfer approved and authorized',
      transferApproved: true
    };
  }

  async sendCardActivationCode(phoneNumber: string, cardNumber: string): Promise<{ success: boolean; verificationId: string; message: string }> {
    const code = this.generateSecurityCode();
    const verificationId = `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const verification: VerificationCode = {
      code,
      phoneNumber: this.formatPhoneNumber(phoneNumber),
      purpose: 'card_activation',
      recipientInfo: cardNumber,
      expiresAt: new Date(Date.now() + this.codeExpiryMinutes * 60 * 1000),
      attempts: 0,
      verified: false
    };

    this.verificationCodes.set(verificationId, verification);

    const message = `FreightOps Security: Your card activation code for card ending in ${cardNumber.slice(-4)} is: ${code}. Code expires in ${this.codeExpiryMinutes} minutes.`;

    try {
      if (this.twilioClient && process.env.TWILIO_PHONE_NUMBER) {
        await this.twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: verification.phoneNumber
        });
        console.log(`SMS card activation code sent to ${phoneNumber}`);
      } else {
        console.log(`SMS would be sent to ${phoneNumber}: ${message}`);
      }

      return {
        success: true,
        verificationId,
        message: `Activation code sent to ${this.maskPhoneNumber(phoneNumber)}`
      };
    } catch (error) {
      console.error('Failed to send card activation SMS:', error);
      return {
        success: false,
        verificationId: '',
        message: 'Failed to send activation code'
      };
    }
  }

  private generateSecurityCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private formatPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }
    return phoneNumber;
  }

  private maskPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      const last4 = cleaned.slice(-4);
      return `***-***-${last4}`;
    }
    return phoneNumber;
  }

  private async sendSecurityAlert(verification: VerificationCode): Promise<void> {
    const alertMessage = `FreightOps Security Alert: Multiple failed verification attempts for transfer of $${verification.amount?.toLocaleString()} to ${verification.recipientInfo}. Transfer has been blocked. Contact support if this was not you.`;

    try {
      if (this.twilioClient && process.env.TWILIO_PHONE_NUMBER) {
        await this.twilioClient.messages.create({
          body: alertMessage,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: verification.phoneNumber
        });
        console.log(`Security alert sent to ${verification.phoneNumber}`);
      } else {
        console.log(`Security alert would be sent: ${alertMessage}`);
      }
    } catch (error) {
      console.error('Failed to send security alert:', error);
    }
  }

  async getVerificationStatus(verificationId: string): Promise<{
    exists: boolean;
    expired: boolean;
    verified: boolean;
    attemptsRemaining: number;
    purpose: string;
  }> {
    const verification = this.verificationCodes.get(verificationId);
    
    if (!verification) {
      return {
        exists: false,
        expired: false,
        verified: false,
        attemptsRemaining: 0,
        purpose: ''
      };
    }

    const expired = new Date() > verification.expiresAt;
    
    return {
      exists: true,
      expired,
      verified: verification.verified,
      attemptsRemaining: this.maxAttempts - verification.attempts,
      purpose: verification.purpose
    };
  }

  async cleanupExpiredCodes(): Promise<void> {
    const now = new Date();
    const expiredIds: string[] = [];

    this.verificationCodes.forEach((verification, id) => {
      if (now > verification.expiresAt) {
        expiredIds.push(id);
      }
    });

    expiredIds.forEach(id => {
      this.verificationCodes.delete(id);
    });

    if (expiredIds.length > 0) {
      console.log(`Cleaned up ${expiredIds.length} expired verification codes`);
    }
  }
}

export const smsVerificationService = new SMSVerificationService();

// Cleanup expired codes every 5 minutes
setInterval(() => {
  smsVerificationService.cleanupExpiredCodes();
}, 5 * 60 * 1000);