import crypto from 'crypto';

interface UserDeviceFingerprint {
  userId: string;
  deviceId: string;
  userAgent: string;
  ipAddress: string;
  registrationDate: Date;
  lastSeenDate: Date;
  trusted: boolean;
  riskScore: number;
}

interface PhoneNumberHistory {
  phoneNumber: string;
  userId: string;
  registrationDate: Date;
  lastVerificationDate: Date;
  verificationCount: number;
  simSwapDetected: boolean;
  carrierInfo?: string;
  riskFlags: string[];
}

interface SIMSwapRiskAssessment {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  flags: string[];
  requiresAdditionalVerification: boolean;
  blockedUntilManualReview: boolean;
  recommendations: string[];
}

export class SIMSwapProtectionService {
  private deviceFingerprints: Map<string, UserDeviceFingerprint> = new Map();
  private phoneHistory: Map<string, PhoneNumberHistory> = new Map();
  private suspiciousActivities: Map<string, Date[]> = new Map();
  
  // Risk thresholds
  private readonly HIGH_RISK_THRESHOLD = 70;
  private readonly CRITICAL_RISK_THRESHOLD = 85;
  private readonly MAX_VERIFICATION_ATTEMPTS_PER_HOUR = 5;
  private readonly DEVICE_TRUST_PERIOD_DAYS = 30;

  async registerUserDevice(
    userId: string,
    phoneNumber: string,
    deviceInfo: {
      userAgent: string;
      ipAddress: string;
      deviceId?: string;
    }
  ): Promise<{ deviceId: string; trusted: boolean }> {
    
    const deviceId = deviceInfo.deviceId || this.generateDeviceFingerprint(deviceInfo);
    
    const deviceFingerprint: UserDeviceFingerprint = {
      userId,
      deviceId,
      userAgent: deviceInfo.userAgent,
      ipAddress: deviceInfo.ipAddress,
      registrationDate: new Date(),
      lastSeenDate: new Date(),
      trusted: false, // New devices start as untrusted
      riskScore: 0
    };

    this.deviceFingerprints.set(deviceId, deviceFingerprint);

    // Initialize phone number history
    if (!this.phoneHistory.has(phoneNumber)) {
      this.phoneHistory.set(phoneNumber, {
        phoneNumber,
        userId,
        registrationDate: new Date(),
        lastVerificationDate: new Date(),
        verificationCount: 0,
        simSwapDetected: false,
        riskFlags: []
      });
    }

    console.log(`Device registered for user ${userId}: ${deviceId}`);
    return { deviceId, trusted: deviceFingerprint.trusted };
  }

  async assessSIMSwapRisk(
    userId: string,
    phoneNumber: string,
    deviceInfo: {
      userAgent: string;
      ipAddress: string;
      deviceId?: string;
    }
  ): Promise<SIMSwapRiskAssessment> {
    
    let riskScore = 0;
    const flags: string[] = [];
    const recommendations: string[] = [];

    // 1. Check if this is a known/trusted device
    const deviceId = deviceInfo.deviceId || this.generateDeviceFingerprint(deviceInfo);
    const device = this.deviceFingerprints.get(deviceId);
    
    if (!device) {
      riskScore += 25;
      flags.push('Unknown device attempting verification');
      recommendations.push('Device registration required');
    } else if (!device.trusted) {
      riskScore += 15;
      flags.push('Untrusted device');
    } else {
      // Check if device hasn't been seen recently
      const daysSinceLastSeen = (Date.now() - device.lastSeenDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastSeen > this.DEVICE_TRUST_PERIOD_DAYS) {
        riskScore += 10;
        flags.push('Device not seen recently');
      }
    }

    // 2. Check phone number history and patterns
    const phoneHistory = this.phoneHistory.get(phoneNumber);
    if (phoneHistory) {
      // Check for rapid verification attempts
      const recentActivity = this.suspiciousActivities.get(`${userId}_${phoneNumber}`) || [];
      const recentAttempts = recentActivity.filter(date => 
        Date.now() - date.getTime() < 60 * 60 * 1000 // Last hour
      ).length;

      if (recentAttempts > this.MAX_VERIFICATION_ATTEMPTS_PER_HOUR) {
        riskScore += 30;
        flags.push('Excessive verification attempts');
        recommendations.push('Rate limiting applied');
      }

      // Check if phone number recently changed ownership
      if (phoneHistory.userId !== userId) {
        riskScore += 40;
        flags.push('Phone number ownership change detected');
        recommendations.push('Manual verification required');
      }

      // Check for SIM swap indicators
      if (phoneHistory.simSwapDetected) {
        riskScore += 50;
        flags.push('Previous SIM swap detected');
        recommendations.push('Enhanced verification required');
      }
    } else {
      riskScore += 20;
      flags.push('No phone number history');
    }

    // 3. Geographic and network analysis
    if (device && device.ipAddress !== deviceInfo.ipAddress) {
      // Simple IP change detection (in production, use geolocation services)
      const ipChanged = await this.detectSuspiciousIPChange(device.ipAddress, deviceInfo.ipAddress);
      if (ipChanged) {
        riskScore += 20;
        flags.push('Suspicious location change');
        recommendations.push('Additional identity verification required');
      }
    }

    // 4. Behavioral patterns
    const behaviorRisk = await this.analyzeBehavioralPatterns(userId, phoneNumber);
    riskScore += behaviorRisk.score;
    flags.push(...behaviorRisk.flags);

    // 5. Time-based analysis
    const timeRisk = this.analyzeTimeBasedRisk();
    riskScore += timeRisk.score;
    flags.push(...timeRisk.flags);

    // Determine risk level and actions
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    let requiresAdditionalVerification = false;
    let blockedUntilManualReview = false;

    if (riskScore >= this.CRITICAL_RISK_THRESHOLD) {
      riskLevel = 'critical';
      blockedUntilManualReview = true;
      recommendations.push('Block all transactions pending manual review');
    } else if (riskScore >= this.HIGH_RISK_THRESHOLD) {
      riskLevel = 'high';
      requiresAdditionalVerification = true;
      recommendations.push('Require multi-factor authentication');
      recommendations.push('Contact user through alternate channels');
    } else if (riskScore >= 40) {
      riskLevel = 'medium';
      requiresAdditionalVerification = true;
      recommendations.push('Additional verification steps required');
    } else {
      riskLevel = 'low';
    }

    // Log this assessment
    this.logRiskAssessment(userId, phoneNumber, riskLevel, riskScore, flags);

    return {
      riskLevel,
      riskScore,
      flags,
      requiresAdditionalVerification,
      blockedUntilManualReview,
      recommendations
    };
  }

  async performEnhancedVerification(
    userId: string,
    phoneNumber: string,
    verificationData: {
      smsCode?: string;
      emailCode?: string;
      securityQuestions?: Array<{ question: string; answer: string }>;
      biometricData?: string;
      deviceId: string;
    }
  ): Promise<{ verified: boolean; trustLevel: number; message: string }> {
    
    let trustLevel = 0;
    const verificationSteps: string[] = [];

    // 1. SMS verification (base level)
    if (verificationData.smsCode) {
      trustLevel += 20;
      verificationSteps.push('SMS verified');
    }

    // 2. Email verification (additional channel)
    if (verificationData.emailCode) {
      trustLevel += 25;
      verificationSteps.push('Email verified');
    }

    // 3. Security questions
    if (verificationData.securityQuestions && verificationData.securityQuestions.length > 0) {
      trustLevel += 30;
      verificationSteps.push('Security questions verified');
    }

    // 4. Device trust building
    const device = this.deviceFingerprints.get(verificationData.deviceId);
    if (device) {
      device.lastSeenDate = new Date();
      if (trustLevel >= 70) {
        device.trusted = true;
        trustLevel += 15;
        verificationSteps.push('Device marked as trusted');
      }
    }

    // 5. Update phone number history
    const phoneHistory = this.phoneHistory.get(phoneNumber);
    if (phoneHistory) {
      phoneHistory.lastVerificationDate = new Date();
      phoneHistory.verificationCount++;
      
      // Clear SIM swap flag if verification successful through multiple channels
      if (trustLevel >= 75 && phoneHistory.simSwapDetected) {
        phoneHistory.simSwapDetected = false;
        phoneHistory.riskFlags = phoneHistory.riskFlags.filter(flag => 
          !flag.includes('SIM swap')
        );
        verificationSteps.push('SIM swap flag cleared');
      }
    }

    const verified = trustLevel >= 45; // Minimum threshold for verification
    const message = verified 
      ? `Verification successful: ${verificationSteps.join(', ')}`
      : 'Verification failed - insufficient trust level';

    if (verified) {
      // Record successful verification
      this.recordSuccessfulVerification(userId, phoneNumber, verificationData.deviceId);
    }

    return { verified, trustLevel, message };
  }

  async detectPotentialSIMSwap(
    phoneNumber: string,
    userId: string,
    currentDeviceInfo: {
      userAgent: string;
      ipAddress: string;
      deviceId: string;
    }
  ): Promise<{ detected: boolean; confidence: number; indicators: string[] }> {
    
    const indicators: string[] = [];
    let confidence = 0;

    const phoneHistory = this.phoneHistory.get(phoneNumber);
    if (!phoneHistory) {
      return { detected: false, confidence: 0, indicators: ['No history available'] };
    }

    // 1. Check for device inconsistencies
    const knownDevices = Array.from(this.deviceFingerprints.values())
      .filter(device => device.userId === userId);
    
    const currentDevice = this.deviceFingerprints.get(currentDeviceInfo.deviceId);
    if (!currentDevice || !knownDevices.some(device => device.deviceId === currentDeviceInfo.deviceId)) {
      confidence += 30;
      indicators.push('Unknown device accessing account');
    }

    // 2. Check for rapid network changes
    if (currentDevice) {
      const timeSinceLastSeen = Date.now() - currentDevice.lastSeenDate.getTime();
      const ipChanged = currentDevice.ipAddress !== currentDeviceInfo.ipAddress;
      
      if (ipChanged && timeSinceLastSeen < 24 * 60 * 60 * 1000) { // Less than 24 hours
        confidence += 25;
        indicators.push('Rapid network location change');
      }
    }

    // 3. Check verification patterns
    const recentActivity = this.suspiciousActivities.get(`${userId}_${phoneNumber}`) || [];
    const last24Hours = recentActivity.filter(date => 
      Date.now() - date.getTime() < 24 * 60 * 60 * 1000
    );

    if (last24Hours.length > 3) {
      confidence += 20;
      indicators.push('Unusual verification frequency');
    }

    // 4. Check for carrier-level indicators (simulated)
    const carrierRisk = await this.checkCarrierLevelIndicators(phoneNumber);
    confidence += carrierRisk.score;
    indicators.push(...carrierRisk.indicators);

    // 5. Time-based analysis
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) { // Outside normal hours
      confidence += 10;
      indicators.push('Verification attempt outside normal hours');
    }

    const detected = confidence >= 60; // 60% confidence threshold

    if (detected) {
      // Mark in phone history
      phoneHistory.simSwapDetected = true;
      phoneHistory.riskFlags.push(`SIM swap detected with ${confidence}% confidence`);
      
      // Alert security team
      await this.alertSecurityTeam(userId, phoneNumber, confidence, indicators);
    }

    return { detected, confidence, indicators };
  }

  private generateDeviceFingerprint(deviceInfo: { userAgent: string; ipAddress: string }): string {
    const data = `${deviceInfo.userAgent}:${deviceInfo.ipAddress}:${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
  }

  private async detectSuspiciousIPChange(oldIP: string, newIP: string): Promise<boolean> {
    // In production, this would use geolocation services to detect impossible travel
    // For now, simple IP comparison
    return oldIP !== newIP;
  }

  private async analyzeBehavioralPatterns(userId: string, phoneNumber: string): Promise<{ score: number; flags: string[] }> {
    const flags: string[] = [];
    let score = 0;

    // Analyze historical patterns
    const recentActivity = this.suspiciousActivities.get(`${userId}_${phoneNumber}`) || [];
    
    // Check for clustering of attempts
    const last4Hours = recentActivity.filter(date => 
      Date.now() - date.getTime() < 4 * 60 * 60 * 1000
    );

    if (last4Hours.length > 2) {
      score += 15;
      flags.push('Multiple verification attempts in short timeframe');
    }

    return { score, flags };
  }

  private analyzeTimeBasedRisk(): { score: number; flags: string[] } {
    const flags: string[] = [];
    let score = 0;

    const now = new Date();
    const hour = now.getHours();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;

    // Risk during off-hours
    if (hour < 6 || hour > 22) {
      score += 10;
      flags.push('Off-hours activity');
    }

    // Weekend activity
    if (isWeekend) {
      score += 5;
      flags.push('Weekend activity');
    }

    return { score, flags };
  }

  private async checkCarrierLevelIndicators(phoneNumber: string): Promise<{ score: number; indicators: string[] }> {
    // In production, this would integrate with carrier APIs to check:
    // - Recent SIM card changes
    // - Port-in/port-out activity
    // - Account security flags
    
    // Simulated carrier check
    const indicators: string[] = [];
    let score = 0;

    // Simulate random carrier risk
    if (Math.random() > 0.9) { // 10% chance of carrier flag
      score += 35;
      indicators.push('Carrier reports recent SIM activity');
    }

    return { score, indicators };
  }

  private logRiskAssessment(
    userId: string,
    phoneNumber: string,
    riskLevel: string,
    riskScore: number,
    flags: string[]
  ): void {
    console.log(`SIM Swap Risk Assessment for ${userId}:`);
    console.log(`  Phone: ${phoneNumber}`);
    console.log(`  Risk Level: ${riskLevel}`);
    console.log(`  Risk Score: ${riskScore}`);
    console.log(`  Flags: ${flags.join(', ')}`);
  }

  private recordSuccessfulVerification(userId: string, phoneNumber: string, deviceId: string): void {
    // Record this verification attempt
    const key = `${userId}_${phoneNumber}`;
    const activities = this.suspiciousActivities.get(key) || [];
    activities.push(new Date());
    this.suspiciousActivities.set(key, activities);

    // Update device trust
    const device = this.deviceFingerprints.get(deviceId);
    if (device) {
      device.lastSeenDate = new Date();
      device.riskScore = Math.max(0, device.riskScore - 5); // Reduce risk over time
    }
  }

  private async alertSecurityTeam(
    userId: string,
    phoneNumber: string,
    confidence: number,
    indicators: string[]
  ): Promise<void> {
    const alert = {
      timestamp: new Date().toISOString(),
      userId,
      phoneNumber: phoneNumber.replace(/\d(?=\d{4})/g, '*'), // Mask phone number
      confidence,
      indicators,
      action: 'SIM_SWAP_DETECTED'
    };

    console.log('🚨 SECURITY ALERT - Potential SIM Swap Detected:');
    console.log(JSON.stringify(alert, null, 2));

    // In production: send to security monitoring system, email alerts, etc.
  }

  async getDeviceTrustStatus(deviceId: string): Promise<{
    trusted: boolean;
    riskScore: number;
    lastSeen: Date;
    registrationDate: Date;
  } | null> {
    const device = this.deviceFingerprints.get(deviceId);
    if (!device) return null;

    return {
      trusted: device.trusted,
      riskScore: device.riskScore,
      lastSeen: device.lastSeenDate,
      registrationDate: device.registrationDate
    };
  }

  async updatePhoneNumberRisk(phoneNumber: string, riskFlags: string[]): Promise<void> {
    const history = this.phoneHistory.get(phoneNumber);
    if (history) {
      history.riskFlags = [...new Set([...history.riskFlags, ...riskFlags])];
    }
  }
}

export const simSwapProtectionService = new SIMSwapProtectionService();