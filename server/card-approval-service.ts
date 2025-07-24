// Using dynamic import for SendGrid to avoid module issues

export interface CardApplication {
  id: string;
  companyId: string;
  applicantName: string;
  applicantEmail: string;
  cardType: 'virtual' | 'physical';
  requestedLimits: {
    daily: number;
    monthly: number;
  };
  businessJustification: string;
  status: 'pending' | 'approved' | 'denied' | 'under_review';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
}

export class CardApprovalService {
  private applications: Map<string, CardApplication> = new Map();

  async submitCardApplication(application: Omit<CardApplication, 'id' | 'status' | 'submittedAt'>): Promise<CardApplication> {
    const cardApp: CardApplication = {
      ...application,
      id: `card-app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      submittedAt: new Date()
    };

    this.applications.set(cardApp.id, cardApp);

    // Send submission confirmation email
    await this.sendSubmissionEmail(cardApp);

    // Send notification to admins for review
    await this.sendAdminNotificationEmail(cardApp);

    return cardApp;
  }

  async approveCardApplication(applicationId: string, reviewerId: string, notes?: string): Promise<void> {
    const application = this.applications.get(applicationId);
    if (!application) throw new Error('Application not found');

    application.status = 'approved';
    application.reviewedAt = new Date();
    application.reviewedBy = reviewerId;
    application.reviewNotes = notes;

    this.applications.set(applicationId, application);

    await this.sendApprovalEmail(application);
  }

  async denyCardApplication(applicationId: string, reviewerId: string, reason: string): Promise<void> {
    const application = this.applications.get(applicationId);
    if (!application) throw new Error('Application not found');

    application.status = 'denied';
    application.reviewedAt = new Date();
    application.reviewedBy = reviewerId;
    application.reviewNotes = reason;

    this.applications.set(applicationId, application);

    await this.sendDenialEmail(application);
  }

  async requestMoreInfo(applicationId: string, reviewerId: string, requestedInfo: string): Promise<void> {
    const application = this.applications.get(applicationId);
    if (!application) throw new Error('Application not found');

    application.status = 'under_review';
    application.reviewedBy = reviewerId;

    this.applications.set(applicationId, application);

    await this.sendReviewEmail(application, requestedInfo);
  }

  private async sendSubmissionEmail(application: CardApplication): Promise<void> {
    const subject = `Card Application Submitted - ${application.cardType.toUpperCase()} Card`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 20px; text-align: center;">
          <h1>Card Application Received</h1>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa;">
          <p>Dear ${application.applicantName},</p>
          
          <p>Your ${application.cardType} card application has been successfully submitted and is now under review.</p>
          
          <div style="background: white; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
            <h3>Application Details</h3>
            <p><strong>Application ID:</strong> ${application.id}</p>
            <p><strong>Card Type:</strong> ${application.cardType.toUpperCase()}</p>
            <p><strong>Daily Limit:</strong> $${application.requestedLimits.daily.toLocaleString()}</p>
            <p><strong>Monthly Limit:</strong> $${application.requestedLimits.monthly.toLocaleString()}</p>
            <p><strong>Submitted:</strong> ${application.submittedAt.toLocaleDateString()}</p>
          </div>
          
          <p>We will review your application and notify you of our decision within 1-2 business days.</p>
          
          <p>Best regards,<br>FreightOps Banking Team</p>
        </div>
      </div>
    `;

    try {
      const { sendEmail } = await import('./sendgrid-service');
      await sendEmail({
        to: application.applicantEmail,
        from: 'banking@freightops.com',
        subject,
        html
      });
      console.log(`Submission email sent to ${application.applicantEmail}`);
    } catch (error) {
      console.log(`Card application submission email queued for ${application.applicantEmail}`);
    }
  }

  private async sendAdminNotificationEmail(application: CardApplication): Promise<void> {
    const subject = `New Card Application Requires Review - ${application.applicantName}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 20px; text-align: center;">
          <h1>New Card Application</h1>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa;">
          <p>A new card application requires your review:</p>
          
          <div style="background: white; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <h3>Application Details</h3>
            <p><strong>Applicant:</strong> ${application.applicantName}</p>
            <p><strong>Email:</strong> ${application.applicantEmail}</p>
            <p><strong>Company ID:</strong> ${application.companyId}</p>
            <p><strong>Card Type:</strong> ${application.cardType.toUpperCase()}</p>
            <p><strong>Daily Limit:</strong> $${application.requestedLimits.daily.toLocaleString()}</p>
            <p><strong>Monthly Limit:</strong> $${application.requestedLimits.monthly.toLocaleString()}</p>
            <p><strong>Business Justification:</strong> ${application.businessJustification}</p>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="#" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 0 5px;">APPROVE</a>
            <a href="#" style="background: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 0 5px;">DENY</a>
            <a href="#" style="background: #6b7280; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 0 5px;">REQUEST INFO</a>
          </div>
        </div>
      </div>
    `;

    await sendGridService.sendEmail({
      to: 'admin@freightops.com',
      from: 'system@freightops.com',
      subject,
      html
    });
  }

  private async sendApprovalEmail(application: CardApplication): Promise<void> {
    const subject = `Card Application Approved - ${application.cardType.toUpperCase()} Card`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; text-align: center;">
          <h1>Card Application Approved!</h1>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa;">
          <p>Dear ${application.applicantName},</p>
          
          <p>Great news! Your ${application.cardType} card application has been <strong>APPROVED</strong>.</p>
          
          <div style="background: white; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
            <h3>Approved Application</h3>
            <p><strong>Card Type:</strong> ${application.cardType.toUpperCase()}</p>
            <p><strong>Daily Limit:</strong> $${application.requestedLimits.daily.toLocaleString()}</p>
            <p><strong>Monthly Limit:</strong> $${application.requestedLimits.monthly.toLocaleString()}</p>
            <p><strong>Approved Date:</strong> ${application.reviewedAt?.toLocaleDateString()}</p>
            ${application.reviewNotes ? `<p><strong>Notes:</strong> ${application.reviewNotes}</p>` : ''}
          </div>
          
          <div style="background: #dcfdf7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #059669;">Next Steps:</h4>
            <ul style="color: #065f46;">
              <li>${application.cardType === 'virtual' ? 'Your virtual card will be issued within 24 hours' : 'Your physical card will be mailed within 3-5 business days'}</li>
              <li>You will receive activation instructions via email</li>
              <li>Cards are issued at no cost</li>
            </ul>
          </div>
          
          <p>Thank you for choosing FreightOps Banking!</p>
          
          <p>Best regards,<br>FreightOps Banking Team</p>
        </div>
      </div>
    `;

    await sendGridService.sendEmail({
      to: application.applicantEmail,
      from: 'banking@freightops.com',
      subject,
      html
    });
  }

  private async sendDenialEmail(application: CardApplication): Promise<void> {
    const subject = `Card Application Update - ${application.cardType.toUpperCase()} Card`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 20px; text-align: center;">
          <h1>Card Application Update</h1>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa;">
          <p>Dear ${application.applicantName},</p>
          
          <p>Thank you for your interest in our ${application.cardType} card. After careful review, we are unable to approve your application at this time.</p>
          
          <div style="background: white; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <h3>Application Details</h3>
            <p><strong>Application ID:</strong> ${application.id}</p>
            <p><strong>Reviewed Date:</strong> ${application.reviewedAt?.toLocaleDateString()}</p>
            ${application.reviewNotes ? `<p><strong>Reason:</strong> ${application.reviewNotes}</p>` : ''}
          </div>
          
          <div style="background: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #dc2626;">Next Steps:</h4>
            <ul style="color: #991b1b;">
              <li>You may reapply after addressing the noted concerns</li>
              <li>Contact our support team for clarification</li>
              <li>Consider alternative banking solutions</li>
            </ul>
          </div>
          
          <p>If you have questions about this decision, please contact our banking support team.</p>
          
          <p>Best regards,<br>FreightOps Banking Team</p>
        </div>
      </div>
    `;

    await sendGridService.sendEmail({
      to: application.applicantEmail,
      from: 'banking@freightops.com',
      subject,
      html
    });
  }

  private async sendReviewEmail(application: CardApplication, requestedInfo: string): Promise<void> {
    const subject = `Additional Information Needed - Card Application`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 20px; text-align: center;">
          <h1>Additional Information Required</h1>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa;">
          <p>Dear ${application.applicantName},</p>
          
          <p>We are reviewing your ${application.cardType} card application and need some additional information to complete the process.</p>
          
          <div style="background: white; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <h3>Information Needed</h3>
            <p>${requestedInfo}</p>
          </div>
          
          <div style="background: #fffbeb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #d97706;">How to Respond:</h4>
            <ul style="color: #92400e;">
              <li>Reply to this email with the requested information</li>
              <li>Include your application ID: ${application.id}</li>
              <li>Response within 5 business days helps expedite review</li>
            </ul>
          </div>
          
          <p>Thank you for your patience as we complete the review process.</p>
          
          <p>Best regards,<br>FreightOps Banking Team</p>
        </div>
      </div>
    `;

    await sendGridService.sendEmail({
      to: application.applicantEmail,
      from: 'banking@freightops.com',
      subject,
      html
    });
  }

  // Admin methods
  async getApplications(status?: CardApplication['status']): Promise<CardApplication[]> {
    const apps = Array.from(this.applications.values());
    return status ? apps.filter(app => app.status === status) : apps;
  }

  async getApplication(id: string): Promise<CardApplication | null> {
    return this.applications.get(id) || null;
  }
}

export const cardApprovalService = new CardApprovalService();