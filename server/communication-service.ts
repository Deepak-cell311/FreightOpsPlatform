import AWS from 'aws-sdk';
import twilio from 'twilio';

export interface EmailTemplate {
  templateId: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
}

export interface SMSTemplate {
  templateId: string;
  message: string;
  variables: string[];
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveredAt: Date;
}

export class CommunicationService {
  private ses: AWS.SES;
  private twilioClient: twilio.Twilio;
  private fromEmail: string;
  private fromPhone: string;

  constructor() {
    // AWS SES Configuration
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });

    this.ses = new AWS.SES({ apiVersion: '2010-12-01' });
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@freightops.com';

    // Twilio Configuration
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromPhone = process.env.TWILIO_PHONE_NUMBER || '';

    if (accountSid && authToken) {
      this.twilioClient = twilio(accountSid, authToken);
    } else {
      console.warn('Twilio credentials not configured');
    }
  }

  // Send invoice notification email via AWS SES
  async sendInvoiceNotification(
    customerEmail: string,
    customerName: string,
    invoiceData: {
      invoiceNumber: string;
      amount: number;
      dueDate: string;
      description: string;
    }
  ): Promise<NotificationResult> {
    if (!process.env.AWS_ACCESS_KEY_ID) {
      throw new Error("AWS SES credentials not configured");
    }

    const subject = `Invoice ${invoiceData.invoiceNumber} - FreightOps`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background-color: #f9fafb; }
          .invoice-details { background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .amount { font-size: 24px; font-weight: bold; color: #2563eb; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Invoice Notification</h1>
          </div>
          <div class="content">
            <h2>Dear ${customerName},</h2>
            <p>We have issued a new invoice for your transportation services. Please find the details below:</p>
            
            <div class="invoice-details">
              <h3>Invoice Details</h3>
              <p><strong>Invoice Number:</strong> ${invoiceData.invoiceNumber}</p>
              <p><strong>Description:</strong> ${invoiceData.description}</p>
              <p><strong>Amount:</strong> <span class="amount">$${invoiceData.amount.toLocaleString()}</span></p>
              <p><strong>Due Date:</strong> ${invoiceData.dueDate}</p>
            </div>
            
            <p>Please process payment by the due date to avoid any late fees. If you have any questions about this invoice, please contact our billing department.</p>
            
            <a href="#" class="button">View Invoice Online</a>
            
            <p>Thank you for your business!</p>
            <p>FreightOps Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>FreightOps | 123 Transport Way | Logistics City, LC 12345</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Invoice Notification - FreightOps

Dear ${customerName},

We have issued a new invoice for your transportation services:

Invoice Number: ${invoiceData.invoiceNumber}
Description: ${invoiceData.description}
Amount: $${invoiceData.amount.toLocaleString()}
Due Date: ${invoiceData.dueDate}

Please process payment by the due date to avoid late fees.

Thank you for your business!
FreightOps Team
    `;

    try {
      const params = {
        Destination: {
          ToAddresses: [customerEmail]
        },
        Message: {
          Body: {
            Html: {
              Charset: "UTF-8",
              Data: htmlContent
            },
            Text: {
              Charset: "UTF-8",
              Data: textContent
            }
          },
          Subject: {
            Charset: "UTF-8",
            Data: subject
          }
        },
        Source: this.fromEmail,
        ReplyToAddresses: [this.fromEmail]
      };

      const result = await this.ses.sendEmail(params).promise();
      
      return {
        success: true,
        messageId: result.MessageId,
        deliveredAt: new Date()
      };
    } catch (error: any) {
      console.error("SES send error:", error);
      return {
        success: false,
        error: error.message,
        deliveredAt: new Date()
      };
    }
  }

  // Send payment reminder email
  async sendPaymentReminder(
    customerEmail: string,
    customerName: string,
    overdueInvoices: Array<{
      invoiceNumber: string;
      amount: number;
      daysPastDue: number;
    }>
  ): Promise<NotificationResult> {
    const totalAmount = overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const subject = `Payment Reminder - ${overdueInvoices.length} Overdue Invoice(s)`;
    
    const invoiceList = overdueInvoices.map(inv => 
      `Invoice ${inv.invoiceNumber}: $${inv.amount.toLocaleString()} (${inv.daysPastDue} days overdue)`
    ).join('\n');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background-color: #f9fafb; }
          .alert { background-color: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .invoice-list { background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .total { font-size: 20px; font-weight: bold; color: #dc2626; }
          .urgent { color: #dc2626; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Reminder</h1>
          </div>
          <div class="content">
            <h2>Dear ${customerName},</h2>
            <div class="alert">
              <p class="urgent">URGENT: You have ${overdueInvoices.length} overdue invoice(s) requiring immediate attention.</p>
            </div>
            
            <div class="invoice-list">
              <h3>Overdue Invoices</h3>
              ${overdueInvoices.map(inv => `
                <p>Invoice ${inv.invoiceNumber}: $${inv.amount.toLocaleString()} (${inv.daysPastDue} days overdue)</p>
              `).join('')}
              <hr>
              <p><strong>Total Amount Due: <span class="total">$${totalAmount.toLocaleString()}</span></strong></p>
            </div>
            
            <p>Please remit payment immediately to avoid:</p>
            <ul>
              <li>Service suspension</li>
              <li>Late payment fees</li>
              <li>Collection agency involvement</li>
              <li>Credit rating impact</li>
            </ul>
            
            <p>If you have already sent payment, please disregard this notice. For payment arrangements or questions, contact us immediately.</p>
            
            <p>FreightOps Billing Department<br>
            Phone: (555) 123-4567<br>
            Email: billing@freightops.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const params = {
        Destination: { ToAddresses: [customerEmail] },
        Message: {
          Body: {
            Html: { Charset: "UTF-8", Data: htmlContent },
            Text: {
              Charset: "UTF-8",
              Data: `Payment Reminder - FreightOps\n\nDear ${customerName},\n\nURGENT: You have overdue invoices:\n\n${invoiceList}\n\nTotal Due: $${totalAmount.toLocaleString()}\n\nPlease remit payment immediately.\n\nFreightOps Billing: (555) 123-4567`
            }
          },
          Subject: { Charset: "UTF-8", Data: subject }
        },
        Source: this.fromEmail
      };

      const result = await this.ses.sendEmail(params).promise();
      return {
        success: true,
        messageId: result.MessageId,
        deliveredAt: new Date()
      };
    } catch (error: any) {
      console.error("Payment reminder send error:", error);
      return {
        success: false,
        error: error.message,
        deliveredAt: new Date()
      };
    }
  }

  // Send SMS notification via Twilio
  async sendSMSNotification(
    phoneNumber: string,
    message: string,
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<NotificationResult> {
    if (!this.twilioClient) {
      throw new Error("Twilio credentials not configured");
    }

    const urgencyPrefix = {
      'low': '',
      'medium': '[NOTICE] ',
      'high': '[URGENT] ',
      'critical': '[CRITICAL] '
    };

    const fullMessage = `${urgencyPrefix[urgencyLevel]}${message}\n\nFreightOps`;

    try {
      const result = await this.twilioClient.messages.create({
        body: fullMessage,
        from: this.fromPhone,
        to: phoneNumber
      });

      return {
        success: true,
        messageId: result.sid,
        deliveredAt: new Date()
      };
    } catch (error: any) {
      console.error("Twilio SMS error:", error);
      return {
        success: false,
        error: error.message,
        deliveredAt: new Date()
      };
    }
  }

  // Send load status update SMS to driver
  async sendDriverLoadUpdate(
    driverPhone: string,
    driverName: string,
    loadInfo: {
      loadNumber: string;
      status: string;
      pickupLocation: string;
      deliveryLocation: string;
      instructions?: string;
    }
  ): Promise<NotificationResult> {
    const message = `Hi ${driverName}, Load ${loadInfo.loadNumber} status: ${loadInfo.status.toUpperCase()}. ${loadInfo.pickupLocation} → ${loadInfo.deliveryLocation}${loadInfo.instructions ? '. Instructions: ' + loadInfo.instructions : ''}`;

    return this.sendSMSNotification(driverPhone, message, 'medium');
  }

  // Send critical alert SMS
  async sendCriticalAlert(
    phoneNumber: string,
    alertType: string,
    details: string
  ): Promise<NotificationResult> {
    const message = `${alertType}: ${details}. Immediate action required. Check dashboard for details.`;
    return this.sendSMSNotification(phoneNumber, message, 'critical');
  }

  // Send welcome email to new customers
  async sendWelcomeEmail(
    customerEmail: string,
    customerName: string,
    companyInfo: {
      companyName: string;
      accountNumber: string;
      contactPhone: string;
    }
  ): Promise<NotificationResult> {
    const subject = `Welcome to FreightOps - Account Setup Complete`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to FreightOps</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background-color: #f9fafb; }
          .welcome-box { background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #2563eb; }
          .account-info { background-color: #eff6ff; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to FreightOps!</h1>
          </div>
          <div class="content">
            <div class="welcome-box">
              <h2>Dear ${customerName},</h2>
              <p>Welcome to FreightOps! We're excited to partner with ${companyInfo.companyName} for your transportation and logistics needs.</p>
            </div>
            
            <div class="account-info">
              <h3>Your Account Information</h3>
              <p><strong>Company:</strong> ${companyInfo.companyName}</p>
              <p><strong>Account Number:</strong> ${companyInfo.accountNumber}</p>
              <p><strong>Support Phone:</strong> ${companyInfo.contactPhone}</p>
            </div>
            
            <h3>What's Next?</h3>
            <ul>
              <li>Access your online portal to track shipments</li>
              <li>Review our service capabilities and coverage areas</li>
              <li>Set up automated notifications for your shipments</li>
              <li>Connect with your dedicated account manager</li>
            </ul>
            
            <a href="#" class="button">Access Your Portal</a>
            
            <p>Our team is ready to provide exceptional service. If you have any questions or need assistance, don't hesitate to reach out.</p>
            
            <p>Welcome aboard!</p>
            <p>The FreightOps Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const params = {
        Destination: { ToAddresses: [customerEmail] },
        Message: {
          Body: {
            Html: { Charset: "UTF-8", Data: htmlContent },
            Text: {
              Charset: "UTF-8",
              Data: `Welcome to FreightOps!\n\nDear ${customerName},\n\nWelcome to FreightOps! Your account for ${companyInfo.companyName} is now active.\n\nAccount Number: ${companyInfo.accountNumber}\nSupport: ${companyInfo.contactPhone}\n\nWe're excited to serve your transportation needs!\n\nThe FreightOps Team`
            }
          },
          Subject: { Charset: "UTF-8", Data: subject }
        },
        Source: this.fromEmail
      };

      const result = await this.ses.sendEmail(params).promise();
      return {
        success: true,
        messageId: result.MessageId,
        deliveredAt: new Date()
      };
    } catch (error: any) {
      console.error("Welcome email send error:", error);
      return {
        success: false,
        error: error.message,
        deliveredAt: new Date()
      };
    }
  }

  // Bulk email sending for announcements
  async sendBulkAnnouncement(
    recipients: Array<{ email: string; name: string }>,
    subject: string,
    htmlContent: string,
    textContent: string
  ): Promise<{
    successful: number;
    failed: number;
    results: NotificationResult[];
  }> {
    const results: NotificationResult[] = [];
    let successful = 0;
    let failed = 0;

    for (const recipient of recipients) {
      try {
        const params = {
          Destination: { ToAddresses: [recipient.email] },
          Message: {
            Body: {
              Html: { Charset: "UTF-8", Data: htmlContent.replace('{{name}}', recipient.name) },
              Text: { Charset: "UTF-8", Data: textContent.replace('{{name}}', recipient.name) }
            },
            Subject: { Charset: "UTF-8", Data: subject }
          },
          Source: this.fromEmail
        };

        const result = await this.ses.sendEmail(params).promise();
        results.push({
          success: true,
          messageId: result.MessageId,
          deliveredAt: new Date()
        });
        successful++;
      } catch (error: any) {
        results.push({
          success: false,
          error: error.message,
          deliveredAt: new Date()
        });
        failed++;
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { successful, failed, results };
  }

  // Verify email/phone number before sending
  async verifyEmailAddress(email: string): Promise<{ valid: boolean; reason?: string }> {
    try {
      const params = { Identities: [email] };
      const result = await this.ses.getIdentityVerificationAttributes(params).promise();
      
      const verification = result.VerificationAttributes[email];
      if (verification && verification.VerificationStatus === 'Success') {
        return { valid: true };
      }
      
      return { valid: false, reason: 'Email not verified in SES' };
    } catch (error: any) {
      return { valid: false, reason: error.message };
    }
  }

  async verifyPhoneNumber(phoneNumber: string): Promise<{ valid: boolean; reason?: string }> {
    if (!this.twilioClient) {
      return { valid: false, reason: 'Twilio not configured' };
    }

    try {
      const lookup = await this.twilioClient.lookups.phoneNumbers(phoneNumber).fetch();
      return { valid: true };
    } catch (error: any) {
      return { valid: false, reason: error.message };
    }
  }
}

export const communicationService = new CommunicationService();