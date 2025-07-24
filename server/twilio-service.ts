import twilio from 'twilio';

interface SMSMessage {
  to: string;
  message: string;
  type: 'alert' | 'notification' | 'reminder' | 'emergency';
}

interface SMSTemplate {
  loadAssigned: (driverName: string, loadNumber: string, pickup: string, delivery: string) => string;
  loadCompleted: (customerName: string, loadNumber: string) => string;
  paymentReceived: (amount: number, loadNumber: string) => string;
  hosViolation: (driverName: string, violationType: string) => string;
  emergencyAlert: (driverName: string, location: string, issue: string) => string;
  paymentReminder: (customerName: string, amount: number, dueDate: string) => string;
  maintenanceReminder: (vehicleId: string, maintenanceType: string) => string;
  deliveryUpdate: (customerName: string, loadNumber: string, eta: string) => string;
}

export class TwilioService {
  private client: twilio.Twilio;
  private fromNumber: string;

  constructor() {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio credentials not configured');
    }

    this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  private templates: SMSTemplate = {
    loadAssigned: (driverName: string, loadNumber: string, pickup: string, delivery: string) =>
      `Hi ${driverName}, you've been assigned load #${loadNumber}. Pickup: ${pickup}. Delivery: ${delivery}. Check your app for details.`,
    
    loadCompleted: (customerName: string, loadNumber: string) =>
      `${customerName}, your load #${loadNumber} has been successfully delivered. Thank you for choosing FreightOps Pro!`,
    
    paymentReceived: (amount: number, loadNumber: string) =>
      `Payment of $${amount.toFixed(2)} received for load #${loadNumber}. Thank you!`,
    
    hosViolation: (driverName: string, violationType: string) =>
      `ALERT: ${driverName}, ${violationType} violation detected. Please contact dispatch immediately.`,
    
    emergencyAlert: (driverName: string, location: string, issue: string) =>
      `EMERGENCY: ${driverName} needs assistance at ${location}. Issue: ${issue}. Immediate response required.`,
    
    paymentReminder: (customerName: string, amount: number, dueDate: string) =>
      `${customerName}, payment of $${amount.toFixed(2)} is due on ${dueDate}. Please submit payment to avoid late fees.`,
    
    maintenanceReminder: (vehicleId: string, maintenanceType: string) =>
      `Maintenance reminder: Vehicle ${vehicleId} is due for ${maintenanceType}. Schedule service to maintain compliance.`,
    
    deliveryUpdate: (customerName: string, loadNumber: string, eta: string) =>
      `${customerName}, your load #${loadNumber} is on schedule. ETA: ${eta}. Track in real-time via our portal.`
  };

  async sendSMS(smsMessage: SMSMessage): Promise<boolean> {
    try {
      const message = await this.client.messages.create({
        body: smsMessage.message,
        from: this.fromNumber,
        to: smsMessage.to
      });

      console.log(`SMS sent successfully. SID: ${message.sid}`);
      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }

  async sendBulkSMS(messages: SMSMessage[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const message of messages) {
      const result = await this.sendSMS(message);
      if (result) {
        success++;
      } else {
        failed++;
      }
      // Rate limiting - wait 1 second between messages
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return { success, failed };
  }

  // Specific notification methods
  async notifyLoadAssigned(driverPhone: string, driverName: string, loadNumber: string, pickup: string, delivery: string): Promise<boolean> {
    return this.sendSMS({
      to: driverPhone,
      message: this.templates.loadAssigned(driverName, loadNumber, pickup, delivery),
      type: 'notification'
    });
  }

  async notifyLoadCompleted(customerPhone: string, customerName: string, loadNumber: string): Promise<boolean> {
    return this.sendSMS({
      to: customerPhone,
      message: this.templates.loadCompleted(customerName, loadNumber),
      type: 'notification'
    });
  }

  async notifyPaymentReceived(customerPhone: string, amount: number, loadNumber: string): Promise<boolean> {
    return this.sendSMS({
      to: customerPhone,
      message: this.templates.paymentReceived(amount, loadNumber),
      type: 'notification'
    });
  }

  async alertHOSViolation(driverPhone: string, driverName: string, violationType: string): Promise<boolean> {
    return this.sendSMS({
      to: driverPhone,
      message: this.templates.hosViolation(driverName, violationType),
      type: 'alert'
    });
  }

  async emergencyAlert(contactPhones: string[], driverName: string, location: string, issue: string): Promise<boolean> {
    const messages = contactPhones.map(phone => ({
      to: phone,
      message: this.templates.emergencyAlert(driverName, location, issue),
      type: 'emergency' as const
    }));

    const result = await this.sendBulkSMS(messages);
    return result.success > 0;
  }

  async sendPaymentReminder(customerPhone: string, customerName: string, amount: number, dueDate: string): Promise<boolean> {
    return this.sendSMS({
      to: customerPhone,
      message: this.templates.paymentReminder(customerName, amount, dueDate),
      type: 'reminder'
    });
  }

  async sendMaintenanceReminder(managerPhone: string, vehicleId: string, maintenanceType: string): Promise<boolean> {
    return this.sendSMS({
      to: managerPhone,
      message: this.templates.maintenanceReminder(vehicleId, maintenanceType),
      type: 'reminder'
    });
  }

  async sendDeliveryUpdate(customerPhone: string, customerName: string, loadNumber: string, eta: string): Promise<boolean> {
    return this.sendSMS({
      to: customerPhone,
      message: this.templates.deliveryUpdate(customerName, loadNumber, eta),
      type: 'notification'
    });
  }

  async sendCustomMessage(phone: string, message: string, type: SMSMessage['type'] = 'notification'): Promise<boolean> {
    return this.sendSMS({
      to: phone,
      message,
      type
    });
  }

  // Notification preferences and automation
  async sendAutomatedNotifications(companyId: string, eventType: string, data: any): Promise<void> {
    try {
      switch (eventType) {
        case 'load_assigned':
          if (data.driverPhone) {
            await this.notifyLoadAssigned(
              data.driverPhone,
              data.driverName,
              data.loadNumber,
              data.pickup,
              data.delivery
            );
          }
          break;

        case 'load_completed':
          if (data.customerPhone) {
            await this.notifyLoadCompleted(
              data.customerPhone,
              data.customerName,
              data.loadNumber
            );
          }
          break;

        case 'payment_received':
          if (data.customerPhone) {
            await this.notifyPaymentReceived(
              data.customerPhone,
              data.amount,
              data.loadNumber
            );
          }
          break;

        case 'hos_violation':
          if (data.driverPhone) {
            await this.alertHOSViolation(
              data.driverPhone,
              data.driverName,
              data.violationType
            );
          }
          break;

        case 'emergency':
          if (data.contactPhones && data.contactPhones.length > 0) {
            await this.emergencyAlert(
              data.contactPhones,
              data.driverName,
              data.location,
              data.issue
            );
          }
          break;

        case 'payment_reminder':
          if (data.customerPhone) {
            await this.sendPaymentReminder(
              data.customerPhone,
              data.customerName,
              data.amount,
              data.dueDate
            );
          }
          break;

        case 'maintenance_reminder':
          if (data.managerPhone) {
            await this.sendMaintenanceReminder(
              data.managerPhone,
              data.vehicleId,
              data.maintenanceType
            );
          }
          break;

        case 'delivery_update':
          if (data.customerPhone) {
            await this.sendDeliveryUpdate(
              data.customerPhone,
              data.customerName,
              data.loadNumber,
              data.eta
            );
          }
          break;

        default:
          console.warn(`Unknown notification event type: ${eventType}`);
      }
    } catch (error) {
      console.error(`Failed to send automated notification for ${eventType}:`, error);
    }
  }
}

export const twilioService = new TwilioService();