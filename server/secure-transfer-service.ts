import { smsVerificationSimulationService } from './sms-verification-simulation';

export interface SecureTransfer {
  id: string;
  fromAccountId: string;
  toAccountInfo: {
    accountNumber: string;
    routingNumber: string;
    accountName: string;
    bankName?: string;
  };
  amount: number;
  currency: string;
  description: string;
  transferType: 'ach' | 'wire' | 'internal';
  status: 'pending_verification' | 'verified' | 'processing' | 'completed' | 'failed' | 'blocked';
  verificationId?: string;
  requesterInfo: {
    userId: string;
    phoneNumber: string;
    email: string;
    name: string;
  };
  securityChecks: {
    smsVerified: boolean;
    amountThreshold: 'low' | 'medium' | 'high';
    riskScore: number;
  };
  fees: {
    transferFee: number;
    expediteFee?: number;
  };
  scheduledDate?: Date;
  processedDate?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SecureTransferService {
  private pendingTransfers: Map<string, SecureTransfer> = new Map();
  private completedTransfers: Map<string, SecureTransfer> = new Map();
  
  // Security thresholds
  private lowThreshold = 1000;
  private mediumThreshold = 10000;
  private highThreshold = 50000;

  async initiateSecureTransfer(transferData: {
    fromAccountId: string;
    toAccountInfo: SecureTransfer['toAccountInfo'];
    amount: number;
    description: string;
    transferType: 'ach' | 'wire' | 'internal';
    requesterInfo: SecureTransfer['requesterInfo'];
    scheduledDate?: Date;
  }): Promise<{
    success: boolean;
    transferId: string;
    verificationId: string;
    message: string;
    requiresVerification: boolean;
  }> {
    
    const transferId = `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate risk score and threshold
    const amountThreshold = this.getAmountThreshold(transferData.amount);
    const riskScore = this.calculateRiskScore(transferData);
    
    // Calculate fees
    const fees = this.calculateTransferFees(transferData.transferType, transferData.amount);
    
    const transfer: SecureTransfer = {
      id: transferId,
      fromAccountId: transferData.fromAccountId,
      toAccountInfo: transferData.toAccountInfo,
      amount: transferData.amount,
      currency: 'USD',
      description: transferData.description,
      transferType: transferData.transferType,
      status: 'pending_verification',
      requesterInfo: transferData.requesterInfo,
      securityChecks: {
        smsVerified: false,
        amountThreshold,
        riskScore
      },
      fees,
      scheduledDate: transferData.scheduledDate || new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.pendingTransfers.set(transferId, transfer);

    // Send SMS verification for all outgoing transfers
    const recipientInfo = `${transfer.toAccountInfo.accountName} (****${transfer.toAccountInfo.accountNumber.slice(-4)})`;
    
    const smsResult = await smsVerificationSimulationService.sendTransferVerificationCode(
      transfer.requesterInfo.phoneNumber,
      transfer.amount,
      recipientInfo,
      transfer.requesterInfo.userId,
      {
        userAgent: 'FreightOps/1.0 (Web)',
        ipAddress: '192.168.1.100'
      }
    );

    if (smsResult.success) {
      transfer.verificationId = smsResult.verificationId;
      this.pendingTransfers.set(transferId, transfer);
      
      return {
        success: true,
        transferId,
        verificationId: smsResult.verificationId,
        message: smsResult.message,
        requiresVerification: true
      };
    } else {
      transfer.status = 'failed';
      transfer.failureReason = 'SMS verification failed';
      this.pendingTransfers.set(transferId, transfer);
      
      return {
        success: false,
        transferId,
        verificationId: '',
        message: 'Failed to send verification code',
        requiresVerification: false
      };
    }
  }

  async verifyAndProcessTransfer(
    transferId: string,
    verificationCode: string
  ): Promise<{
    success: boolean;
    message: string;
    transferStatus: string;
    processedAmount?: number;
  }> {
    
    const transfer = this.pendingTransfers.get(transferId);
    
    if (!transfer) {
      return {
        success: false,
        message: 'Transfer not found',
        transferStatus: 'not_found'
      };
    }

    if (transfer.status !== 'pending_verification') {
      return {
        success: false,
        message: 'Transfer is not pending verification',
        transferStatus: transfer.status
      };
    }

    if (!transfer.verificationId) {
      return {
        success: false,
        message: 'No verification code was sent',
        transferStatus: 'failed'
      };
    }

    // Verify the SMS code
    const verificationResult = await smsVerificationService.verifyTransferCode(
      transfer.verificationId,
      verificationCode
    );

    if (!verificationResult.success) {
      if (verificationResult.message.includes('blocked')) {
        transfer.status = 'blocked';
        transfer.failureReason = 'Security block due to failed verification attempts';
      }
      transfer.updatedAt = new Date();
      this.pendingTransfers.set(transferId, transfer);
      
      return {
        success: false,
        message: verificationResult.message,
        transferStatus: transfer.status
      };
    }

    // Verification successful - process the transfer
    transfer.securityChecks.smsVerified = true;
    transfer.status = 'verified';
    transfer.updatedAt = new Date();

    // Simulate transfer processing
    const processingResult = await this.processVerifiedTransfer(transfer);
    
    if (processingResult.success) {
      transfer.status = 'completed';
      transfer.processedDate = new Date();
      this.completedTransfers.set(transferId, transfer);
      this.pendingTransfers.delete(transferId);
      
      return {
        success: true,
        message: 'Transfer completed successfully',
        transferStatus: 'completed',
        processedAmount: transfer.amount
      };
    } else {
      transfer.status = 'failed';
      transfer.failureReason = processingResult.reason;
      transfer.updatedAt = new Date();
      this.pendingTransfers.set(transferId, transfer);
      
      return {
        success: false,
        message: processingResult.reason || 'Transfer processing failed',
        transferStatus: 'failed'
      };
    }
  }

  private async processVerifiedTransfer(transfer: SecureTransfer): Promise<{
    success: boolean;
    reason?: string;
  }> {
    try {
      // Simulate processing delay based on transfer type
      const processingDelay = transfer.transferType === 'wire' ? 2000 : 
                            transfer.transferType === 'ach' ? 1500 : 500;
      
      await new Promise(resolve => setTimeout(resolve, processingDelay));
      
      // Simulate success/failure based on risk score
      if (transfer.securityChecks.riskScore > 85) {
        return {
          success: false,
          reason: 'Transfer blocked due to high risk score'
        };
      }
      
      // Log successful transfer
      console.log(`Transfer ${transfer.id} processed: $${transfer.amount} to ${transfer.toAccountInfo.accountName}`);
      
      return { success: true };
      
    } catch (error) {
      return {
        success: false,
        reason: 'Processing system error'
      };
    }
  }

  private getAmountThreshold(amount: number): 'low' | 'medium' | 'high' {
    if (amount <= this.lowThreshold) return 'low';
    if (amount <= this.mediumThreshold) return 'medium';
    return 'high';
  }

  private calculateRiskScore(transferData: any): number {
    let riskScore = 0;
    
    // Amount-based risk
    if (transferData.amount > this.highThreshold) riskScore += 30;
    else if (transferData.amount > this.mediumThreshold) riskScore += 15;
    else if (transferData.amount > this.lowThreshold) riskScore += 5;
    
    // Transfer type risk
    if (transferData.transferType === 'wire') riskScore += 20;
    else if (transferData.transferType === 'ach') riskScore += 10;
    
    // Time-based risk (transfers outside business hours)
    const hour = new Date().getHours();
    if (hour < 8 || hour > 18) riskScore += 10;
    
    // Weekend transfers
    const day = new Date().getDay();
    if (day === 0 || day === 6) riskScore += 5;
    
    return Math.min(riskScore, 100);
  }

  private calculateTransferFees(transferType: string, amount: number): {
    transferFee: number;
    expediteFee?: number;
  } {
    const fees = {
      transferFee: 0,
      expediteFee: undefined as number | undefined
    };
    
    switch (transferType) {
      case 'wire':
        fees.transferFee = 25;
        fees.expediteFee = 15;
        break;
      case 'ach':
        fees.transferFee = amount > 10000 ? 5 : 1;
        break;
      case 'internal':
        fees.transferFee = 0;
        break;
    }
    
    return fees;
  }

  async getTransferStatus(transferId: string): Promise<{
    found: boolean;
    transfer?: SecureTransfer;
    verificationStatus?: any;
  }> {
    let transfer = this.pendingTransfers.get(transferId) || this.completedTransfers.get(transferId);
    
    if (!transfer) {
      return { found: false };
    }
    
    let verificationStatus = undefined;
    if (transfer.verificationId) {
      verificationStatus = await smsVerificationService.getVerificationStatus(transfer.verificationId);
    }
    
    return {
      found: true,
      transfer,
      verificationStatus
    };
  }

  async getTransferHistory(userId: string): Promise<SecureTransfer[]> {
    const allTransfers = [
      ...Array.from(this.pendingTransfers.values()),
      ...Array.from(this.completedTransfers.values())
    ];
    
    return allTransfers.filter(transfer => 
      transfer.requesterInfo.userId === userId
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async cancelPendingTransfer(transferId: string, reason: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const transfer = this.pendingTransfers.get(transferId);
    
    if (!transfer) {
      return {
        success: false,
        message: 'Transfer not found'
      };
    }
    
    if (transfer.status === 'processing' || transfer.status === 'completed') {
      return {
        success: false,
        message: 'Cannot cancel transfer that is already processing or completed'
      };
    }
    
    transfer.status = 'failed';
    transfer.failureReason = `Cancelled: ${reason}`;
    transfer.updatedAt = new Date();
    
    this.pendingTransfers.set(transferId, transfer);
    
    return {
      success: true,
      message: 'Transfer cancelled successfully'
    };
  }
}

export const secureTransferService = new SecureTransferService();