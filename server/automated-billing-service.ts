import { eq, and, sql, desc, lte } from "drizzle-orm";
import { db } from "./db";
import { loads, customers } from "../shared/schema";
import { v4 as uuidv4 } from "uuid";

export interface RecurringInvoiceTemplate {
  id: string;
  companyId: string;
  customerId: string;
  templateName: string;
  description: string;
  amount: number;
  taxRate: number;
  frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  nextRunDate: Date;
  endDate?: Date;
  isActive: boolean;
  lastInvoiceDate?: Date;
  invoiceCount: number;
  terms: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionInvoice {
  id: string;
  companyId: string;
  customerId: string;
  recurringTemplateId: string;
  invoiceNumber: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  createdAt: Date;
}

export class AutomatedBillingService {
  private recurringTemplates: Map<string, RecurringInvoiceTemplate> = new Map();
  private generatedInvoices: Map<string, SubscriptionInvoice> = new Map();

  // Create recurring invoice template
  async createRecurringTemplate(template: Omit<RecurringInvoiceTemplate, 'id' | 'createdAt' | 'updatedAt' | 'invoiceCount' | 'nextRunDate'>): Promise<RecurringInvoiceTemplate> {
    const id = uuidv4();
    const now = new Date();
    const nextRunDate = this.calculateNextRunDate(template.startDate, template.frequency);
    
    const recurringTemplate: RecurringInvoiceTemplate = {
      ...template,
      id,
      nextRunDate,
      invoiceCount: 0,
      createdAt: now,
      updatedAt: now
    };

    this.recurringTemplates.set(id, recurringTemplate);
    return recurringTemplate;
  }

  // Get all recurring templates for a company
  async getRecurringTemplates(companyId: string): Promise<RecurringInvoiceTemplate[]> {
    return Array.from(this.recurringTemplates.values())
      .filter(template => template.companyId === companyId);
  }

  // Process all due recurring invoices
  async processDueRecurringInvoices(): Promise<SubscriptionInvoice[]> {
    const today = new Date();
    const dueTemplates = Array.from(this.recurringTemplates.values())
      .filter(template => 
        template.isActive && 
        template.nextRunDate <= today &&
        (!template.endDate || template.nextRunDate <= template.endDate)
      );

    const generatedInvoices: SubscriptionInvoice[] = [];

    for (const template of dueTemplates) {
      try {
        const invoice = await this.generateInvoiceFromTemplate(template);
        generatedInvoices.push(invoice);
        
        // Update template for next run
        template.nextRunDate = this.calculateNextRunDate(template.nextRunDate, template.frequency);
        template.lastInvoiceDate = today;
        template.invoiceCount += 1;
        template.updatedAt = today;
        
        this.recurringTemplates.set(template.id, template);
      } catch (error) {
        console.error(`Failed to generate invoice for template ${template.id}:`, error);
      }
    }

    return generatedInvoices;
  }

  // Generate invoice from template
  private async generateInvoiceFromTemplate(template: RecurringInvoiceTemplate): Promise<SubscriptionInvoice> {
    const invoiceId = uuidv4();
    const invoiceNumber = await this.generateInvoiceNumber(template.companyId);
    const dueDate = this.calculateDueDate(new Date(), template.terms);
    
    const taxAmount = template.amount * (template.taxRate / 100);
    const totalAmount = template.amount + taxAmount;

    const invoice: SubscriptionInvoice = {
      id: invoiceId,
      companyId: template.companyId,
      customerId: template.customerId,
      recurringTemplateId: template.id,
      invoiceNumber,
      amount: template.amount,
      taxAmount,
      totalAmount,
      dueDate,
      status: 'draft',
      createdAt: new Date()
    };

    this.generatedInvoices.set(invoiceId, invoice);
    
    // Trigger email notification (placeholder)
    await this.sendRecurringInvoiceNotification(invoice, template);
    
    return invoice;
  }

  // Calculate next run date based on frequency
  private calculateNextRunDate(currentDate: Date, frequency: RecurringInvoiceTemplate['frequency']): Date {
    const nextDate = new Date(currentDate);
    
    switch (frequency) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'bi-weekly':
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }
    
    return nextDate;
  }

  // Calculate due date based on terms
  private calculateDueDate(invoiceDate: Date, terms: string): Date {
    const dueDate = new Date(invoiceDate);
    
    // Parse terms like "Net 30", "Net 15", etc.
    const netMatch = terms.match(/Net (\d+)/i);
    if (netMatch) {
      const days = parseInt(netMatch[1]);
      dueDate.setDate(dueDate.getDate() + days);
    } else {
      // Default to 30 days
      dueDate.setDate(dueDate.getDate() + 30);
    }
    
    return dueDate;
  }

  // Generate unique invoice number
  private async generateInvoiceNumber(companyId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = Array.from(this.generatedInvoices.values())
      .filter(inv => inv.companyId === companyId).length + 1;
    
    return `REC-${year}-${String(count).padStart(4, '0')}`;
  }

  // Send notification for recurring invoice
  private async sendRecurringInvoiceNotification(invoice: SubscriptionInvoice, template: RecurringInvoiceTemplate): Promise<void> {
    // Placeholder for email notification
    console.log(`Recurring invoice ${invoice.invoiceNumber} generated for template ${template.templateName}`);
    
    // In production, integrate with SendGrid or similar service
    // await sendEmail({
    //   to: customer.email,
    //   subject: `Invoice ${invoice.invoiceNumber} - ${template.templateName}`,
    //   template: 'recurring-invoice',
    //   data: { invoice, template }
    // });
  }

  // Update template status
  async updateTemplateStatus(templateId: string, isActive: boolean): Promise<void> {
    const template = this.recurringTemplates.get(templateId);
    if (template) {
      template.isActive = isActive;
      template.updatedAt = new Date();
      this.recurringTemplates.set(templateId, template);
    }
  }

  // Get generated invoices for a company
  async getGeneratedInvoices(companyId: string, templateId?: string): Promise<SubscriptionInvoice[]> {
    return Array.from(this.generatedInvoices.values())
      .filter(invoice => 
        invoice.companyId === companyId &&
        (!templateId || invoice.recurringTemplateId === templateId)
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Get billing analytics
  async getBillingAnalytics(companyId: string): Promise<{
    totalRecurringRevenue: number;
    activeTemplates: number;
    totalInvoicesGenerated: number;
    collectionRate: number;
    averageInvoiceValue: number;
    upcomingInvoices: SubscriptionInvoice[];
  }> {
    const templates = await this.getRecurringTemplates(companyId);
    const invoices = await this.getGeneratedInvoices(companyId);
    
    const activeTemplates = templates.filter(t => t.isActive).length;
    const totalRecurringRevenue = templates
      .filter(t => t.isActive)
      .reduce((sum, template) => {
        // Calculate monthly recurring revenue
        let monthlyAmount = template.amount;
        switch (template.frequency) {
          case 'weekly':
            monthlyAmount = template.amount * 4.33; // Avg weeks per month
            break;
          case 'bi-weekly':
            monthlyAmount = template.amount * 2.17; // Avg bi-weeks per month
            break;
          case 'quarterly':
            monthlyAmount = template.amount / 3;
            break;
          case 'yearly':
            monthlyAmount = template.amount / 12;
            break;
        }
        return sum + monthlyAmount;
      }, 0);

    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    const collectionRate = invoices.length > 0 ? (paidInvoices.length / invoices.length) * 100 : 0;
    
    const averageInvoiceValue = invoices.length > 0 
      ? invoices.reduce((sum, inv) => sum + inv.totalAmount, 0) / invoices.length
      : 0;

    // Get upcoming invoices (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const upcomingInvoices = templates
      .filter(t => t.isActive && t.nextRunDate <= thirtyDaysFromNow)
      .map(template => ({
        id: `upcoming-${template.id}`,
        companyId: template.companyId,
        customerId: template.customerId,
        recurringTemplateId: template.id,
        invoiceNumber: `UPCOMING-${template.templateName}`,
        amount: template.amount,
        taxAmount: template.amount * (template.taxRate / 100),
        totalAmount: template.amount + (template.amount * (template.taxRate / 100)),
        dueDate: this.calculateDueDate(template.nextRunDate, template.terms),
        status: 'draft' as const,
        createdAt: template.nextRunDate
      }));

    return {
      totalRecurringRevenue,
      activeTemplates,
      totalInvoicesGenerated: invoices.length,
      collectionRate,
      averageInvoiceValue,
      upcomingInvoices
    };
  }

  // Contract management for recurring billing
  async createContractTemplate(companyId: string, customerId: string, contractData: {
    contractName: string;
    serviceDescription: string;
    monthlyRate: number;
    setupFee?: number;
    contractLength: number; // months
    autoRenew: boolean;
    terms: string;
  }): Promise<RecurringInvoiceTemplate> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + contractData.contractLength);

    const template = await this.createRecurringTemplate({
      companyId,
      customerId,
      templateName: contractData.contractName,
      description: contractData.serviceDescription,
      amount: contractData.monthlyRate,
      taxRate: 8.5, // Default tax rate - make configurable
      frequency: 'monthly',
      startDate,
      endDate: contractData.autoRenew ? undefined : endDate,
      isActive: true,
      terms: contractData.terms,
      lineItems: [
        {
          description: contractData.serviceDescription,
          quantity: 1,
          rate: contractData.monthlyRate,
          amount: contractData.monthlyRate
        }
      ]
    });

    // Generate setup fee invoice if applicable
    if (contractData.setupFee && contractData.setupFee > 0) {
      await this.generateOneTimeInvoice(companyId, customerId, {
        description: `${contractData.contractName} - Setup Fee`,
        amount: contractData.setupFee,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      });
    }

    return template;
  }

  // Generate one-time invoice
  private async generateOneTimeInvoice(companyId: string, customerId: string, invoiceData: {
    description: string;
    amount: number;
    dueDate: Date;
    taxRate?: number;
  }): Promise<SubscriptionInvoice> {
    const invoiceId = uuidv4();
    const invoiceNumber = await this.generateInvoiceNumber(companyId);
    const taxRate = invoiceData.taxRate || 8.5;
    const taxAmount = invoiceData.amount * (taxRate / 100);
    const totalAmount = invoiceData.amount + taxAmount;

    const invoice: SubscriptionInvoice = {
      id: invoiceId,
      companyId,
      customerId,
      recurringTemplateId: 'one-time',
      invoiceNumber,
      amount: invoiceData.amount,
      taxAmount,
      totalAmount,
      dueDate: invoiceData.dueDate,
      status: 'draft',
      createdAt: new Date()
    };

    this.generatedInvoices.set(invoiceId, invoice);
    return invoice;
  }
}

export const automatedBillingService = new AutomatedBillingService();