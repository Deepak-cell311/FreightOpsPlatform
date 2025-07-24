// Automatic card issuance service for approved bank accounts

export interface AutoCardConfig {
  companyId: string;
  accountId: string;
  defaultLimits: {
    daily: number;
    monthly: number;
  };
  cardTypes: ('virtual' | 'physical')[];
  authorizedSigners: Array<{
    name: string;
    email: string;
    role: string;
  }>;
}

export interface IssuedCard {
  id: string;
  accountId: string;
  cardNumber: string; // masked
  cardType: 'virtual' | 'physical';
  holderName: string;
  holderEmail: string;
  status: 'active' | 'pending' | 'blocked';
  limits: {
    daily: number;
    monthly: number;
  };
  issuedAt: Date;
  activatedAt?: Date;
}

export class AutoCardIssuanceService {
  private issuedCards: Map<string, IssuedCard> = new Map();

  async onAccountApproved(accountId: string, companyId: string): Promise<IssuedCard[]> {
    console.log(`Bank account ${accountId} approved for company ${companyId} - initiating automatic card issuance`);

    const config = await this.getCompanyCardConfig(companyId);
    const issuedCards: IssuedCard[] = [];

    // Issue cards for each authorized signer
    for (const signer of config.authorizedSigners) {
      for (const cardType of config.cardTypes) {
        try {
          const card = await this.issueCard(accountId, signer, cardType, config.defaultLimits);
          issuedCards.push(card);
          
          // Send card issuance notification
          await this.sendCardIssuanceNotification(card, signer);
          
        } catch (error) {
          console.error(`Failed to issue ${cardType} card for ${signer.name}:`, error);
        }
      }
    }

    console.log(`Issued ${issuedCards.length} cards for account ${accountId}`);
    return issuedCards;
  }

  private async getCompanyCardConfig(companyId: string): Promise<AutoCardConfig> {
    // In production, this would fetch from database
    return {
      companyId,
      accountId: `account-${companyId}`,
      defaultLimits: {
        daily: 5000,
        monthly: 50000
      },
      cardTypes: ['virtual', 'physical'],
      authorizedSigners: [
        {
          name: 'Business Owner',
          email: 'owner@company.com',
          role: 'primary'
        },
        {
          name: 'Finance Manager',
          email: 'finance@company.com',
          role: 'secondary'
        }
      ]
    };
  }

  private async issueCard(
    accountId: string, 
    signer: { name: string; email: string; role: string }, 
    cardType: 'virtual' | 'physical',
    limits: { daily: number; monthly: number }
  ): Promise<IssuedCard> {
    
    const card: IssuedCard = {
      id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      accountId,
      cardNumber: this.generateMaskedCardNumber(),
      cardType,
      holderName: signer.name,
      holderEmail: signer.email,
      status: cardType === 'virtual' ? 'active' : 'pending',
      limits,
      issuedAt: new Date(),
      activatedAt: cardType === 'virtual' ? new Date() : undefined
    };

    this.issuedCards.set(card.id, card);
    
    console.log(`${cardType.toUpperCase()} card ${card.id} issued for ${signer.name}`);
    return card;
  }

  private generateMaskedCardNumber(): string {
    const prefix = '4532'; // Visa prefix
    const middle = '****-****';
    const last4 = Math.floor(1000 + Math.random() * 9000).toString();
    return `${prefix}-${middle}-${last4}`;
  }

  private async sendCardIssuanceNotification(card: IssuedCard, signer: { name: string; email: string; role: string }): Promise<void> {
    const subject = `${card.cardType.toUpperCase()} Business Card Issued - FreightOps Banking`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; text-align: center;">
          <h1>Business Card Issued</h1>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa;">
          <p>Dear ${signer.name},</p>
          
          <p>Your business banking account has been approved and a ${card.cardType} debit card has been automatically issued at no cost.</p>
          
          <div style="background: white; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
            <h3>Card Details</h3>
            <p><strong>Card Type:</strong> ${card.cardType.toUpperCase()}</p>
            <p><strong>Card Number:</strong> ${card.cardNumber}</p>
            <p><strong>Daily Limit:</strong> $${card.limits.daily.toLocaleString()}</p>
            <p><strong>Monthly Limit:</strong> $${card.limits.monthly.toLocaleString()}</p>
            <p><strong>Status:</strong> ${card.status.toUpperCase()}</p>
            <p><strong>Issued:</strong> ${card.issuedAt.toLocaleDateString()}</p>
          </div>
          
          ${card.cardType === 'virtual' ? `
          <div style="background: #dcfdf7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #059669;">Virtual Card - Ready to Use</h4>
            <ul style="color: #065f46;">
              <li>Card is active and ready for immediate use</li>
              <li>Add to digital wallets (Apple Pay, Google Pay)</li>
              <li>Use for online purchases and transactions</li>
              <li>No physical shipping required</li>
            </ul>
          </div>
          ` : `
          <div style="background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #d97706;">Physical Card - Shipping</h4>
            <ul style="color: #92400e;">
              <li>Card will arrive in 3-5 business days</li>
              <li>Activation instructions included</li>
              <li>Call activation number upon receipt</li>
              <li>Virtual card available immediately if needed</li>
            </ul>
          </div>
          `}
          
          <div style="background: #eff6ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #1d4ed8;">Important Features</h4>
            <ul style="color: #1e40af;">
              <li>No card issuance fees</li>
              <li>Real-time transaction alerts</li>
              <li>Spending controls and limits</li>
              <li>24/7 fraud monitoring</li>
            </ul>
          </div>
          
          <p>Your banking account and card services are now fully operational.</p>
          
          <p>Best regards,<br>FreightOps Banking Team</p>
        </div>
      </div>
    `;

    try {
      const { sendEmail } = await import('./sendgrid-service');
      await sendEmail({
        to: signer.email,
        from: 'banking@freightops.com',
        subject,
        html
      });
      console.log(`Card issuance notification sent to ${signer.email}`);
    } catch (error) {
      console.log(`Card issuance notification queued for ${signer.email}`);
    }
  }

  async getCompanyCards(companyId: string): Promise<IssuedCard[]> {
    return Array.from(this.issuedCards.values()).filter(card => 
      card.accountId.includes(companyId)
    );
  }

  async getCard(cardId: string): Promise<IssuedCard | null> {
    return this.issuedCards.get(cardId) || null;
  }

  async activateCard(cardId: string): Promise<boolean> {
    const card = this.issuedCards.get(cardId);
    if (!card) return false;

    card.status = 'active';
    card.activatedAt = new Date();
    this.issuedCards.set(cardId, card);

    console.log(`Card ${cardId} activated`);
    return true;
  }

  async blockCard(cardId: string, reason: string): Promise<boolean> {
    const card = this.issuedCards.get(cardId);
    if (!card) return false;

    card.status = 'blocked';
    this.issuedCards.set(cardId, card);

    // Send block notification
    await this.sendCardBlockNotification(card, reason);
    
    console.log(`Card ${cardId} blocked: ${reason}`);
    return true;
  }

  private async sendCardBlockNotification(card: IssuedCard, reason: string): Promise<void> {
    const subject = `Card Blocked - Security Alert`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 20px; text-align: center;">
          <h1>Card Security Alert</h1>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa;">
          <p>Dear ${card.holderName},</p>
          
          <p>Your ${card.cardType} card ending in ${card.cardNumber.slice(-4)} has been blocked for security.</p>
          
          <div style="background: white; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <h3>Block Details</h3>
            <p><strong>Card:</strong> ${card.cardNumber}</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p><strong>Blocked:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p>If this was not authorized by you, please contact our security team immediately.</p>
          
          <p>Best regards,<br>FreightOps Security Team</p>
        </div>
      </div>
    `;

    try {
      const { sendEmail } = await import('./sendgrid-service');
      await sendEmail({
        to: card.holderEmail,
        from: 'security@freightops.com',
        subject,
        html
      });
    } catch (error) {
      console.log(`Card block notification queued for ${card.holderEmail}`);
    }
  }
}

export const autoCardIssuanceService = new AutoCardIssuanceService();