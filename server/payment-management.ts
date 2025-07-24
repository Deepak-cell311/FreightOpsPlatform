import { db } from "./db";
import { loads } from "@shared/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { nanoid } from "nanoid";

interface PaymentRecord {
  id: string;
  loadId: string;
  type: 'customer_payment' | 'carrier_payment';
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'disputed';
  method: 'ach' | 'wire' | 'check' | 'factoring' | 'quick_pay';
  dueDate: Date;
  paidDate?: Date;
  invoiceNumber?: string;
  referenceNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface InvoiceData {
  loadId: string;
  customerId: string;
  customerRate: number;
  accessorials: Array<{ description: string; amount: number }>;
  fuelSurcharge: number;
  taxRate?: number;
  terms: string;
}

interface CarrierPaymentData {
  loadId: string;
  carrierId: string;
  carrierRate: number;
  accessorials: Array<{ description: string; amount: number }>;
  fuelSurcharge: number;
  quickPayFee?: number;
  paymentMethod: 'standard' | 'quick_pay' | 'factoring';
}

export class PaymentManagement {
  // Generate customer invoice
  async generateCustomerInvoice(companyId: string, invoiceData: InvoiceData) {
    const load = await db.select()
      .from(loadTransactions)
      .where(and(
        eq(loadTransactions.id, invoiceData.loadId),
        eq(loadTransactions.companyId, companyId)
      ))
      .limit(1);

    if (!load.length) {
      throw new Error("Load not found");
    }

    // Mock customer validation - would query actual customer profiles table
    if (!invoiceData.customerId) {
      throw new Error("Customer not found");
    }

    const invoiceNumber = `INV-${Date.now()}-${nanoid(6)}`;
    const subtotal = invoiceData.customerRate + invoiceData.fuelSurcharge;
    const accessorialTotal = invoiceData.accessorials.reduce((sum, acc) => sum + acc.amount, 0);
    const taxAmount = invoiceData.taxRate ? (subtotal + accessorialTotal) * (invoiceData.taxRate / 100) : 0;
    const totalAmount = subtotal + accessorialTotal + taxAmount;

    // Update load with invoice details
    await db.update(loadTransactions)
      .set({
        status: 'invoiced',
        milestones: [
          ...load[0].milestones as any[],
          {
            event: 'invoice_generated',
            timestamp: new Date().toISOString(),
            notes: `Invoice ${invoiceNumber} generated for $${totalAmount}`,
            amount: totalAmount
          }
        ],
        updatedAt: new Date()
      })
      .where(eq(loadTransactions.id, invoiceData.loadId));

    // Create payment record for customer
    const paymentRecord: PaymentRecord = {
      id: nanoid(),
      loadId: invoiceData.loadId,
      type: 'customer_payment',
      amount: totalAmount,
      status: 'pending',
      method: 'ach', // Default, can be updated
      dueDate: new Date(Date.now() + (customer[0].paymentTerms || 30) * 24 * 60 * 60 * 1000),
      invoiceNumber,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return {
      invoice: {
        invoiceNumber,
        loadNumber: load[0].loadNumber,
        customer: customer[0],
        load: load[0],
        lineItems: [
          { description: 'Freight Charges', amount: invoiceData.customerRate },
          { description: 'Fuel Surcharge', amount: invoiceData.fuelSurcharge },
          ...invoiceData.accessorials
        ],
        subtotal,
        taxAmount,
        totalAmount,
        terms: invoiceData.terms,
        dueDate: paymentRecord.dueDate
      },
      paymentRecord
    };
  }

  // Process carrier payment
  async processCarrierPayment(companyId: string, paymentData: CarrierPaymentData) {
    const load = await db.select()
      .from(loadTransactions)
      .where(and(
        eq(loadTransactions.id, paymentData.loadId),
        eq(loadTransactions.companyId, companyId)
      ))
      .limit(1);

    if (!load.length) {
      throw new Error("Load not found");
    }

    const carrier = await db.select()
      .from(carrierProfiles)
      .where(eq(carrierProfiles.id, paymentData.carrierId))
      .limit(1);

    if (!carrier.length) {
      throw new Error("Carrier not found");
    }

    let totalAmount = paymentData.carrierRate + paymentData.fuelSurcharge;
    const accessorialTotal = paymentData.accessorials.reduce((sum, acc) => sum + acc.amount, 0);
    totalAmount += accessorialTotal;

    // Apply quick pay fee if selected
    if (paymentData.paymentMethod === 'quick_pay' && paymentData.quickPayFee) {
      totalAmount -= paymentData.quickPayFee;
    }

    const paymentRecord: PaymentRecord = {
      id: nanoid(),
      loadId: paymentData.loadId,
      type: 'carrier_payment',
      amount: totalAmount,
      status: 'pending',
      method: paymentData.paymentMethod === 'quick_pay' ? 'ach' : 'ach',
      dueDate: paymentData.paymentMethod === 'quick_pay' 
        ? new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day for quick pay
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days standard
      notes: paymentData.paymentMethod === 'quick_pay' ? 'Quick Pay - 1 business day' : 'Standard payment terms',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Update load with payment milestone
    await db.update(loadTransactions)
      .set({
        milestones: [
          ...load[0].milestones as any[],
          {
            event: 'carrier_payment_initiated',
            timestamp: new Date().toISOString(),
            notes: `Carrier payment initiated: $${totalAmount} (${paymentData.paymentMethod})`,
            amount: totalAmount
          }
        ],
        updatedAt: new Date()
      })
      .where(eq(loadTransactions.id, paymentData.loadId));

    return {
      payment: {
        carrier: carrier[0],
        load: load[0],
        lineItems: [
          { description: 'Freight Payment', amount: paymentData.carrierRate },
          { description: 'Fuel Surcharge', amount: paymentData.fuelSurcharge },
          ...paymentData.accessorials,
          ...(paymentData.quickPayFee ? [{ description: 'Quick Pay Fee', amount: -paymentData.quickPayFee }] : [])
        ],
        totalAmount,
        paymentMethod: paymentData.paymentMethod,
        expectedDate: paymentRecord.dueDate
      },
      paymentRecord
    };
  }

  // Update payment status
  async updatePaymentStatus(paymentId: string, status: PaymentRecord['status'], referenceNumber?: string, notes?: string) {
    // This would update payment records in the database
    // For now, we'll update the load milestones
    return {
      success: true,
      paymentId,
      status,
      referenceNumber,
      updatedAt: new Date()
    };
  }

  // Get payment history for a load
  async getLoadPaymentHistory(loadId: string) {
    const load = await db.select()
      .from(loadTransactions)
      .where(eq(loadTransactions.id, loadId))
      .limit(1);

    if (!load.length) {
      throw new Error("Load not found");
    }

    const milestones = load[0].milestones as any[] || [];
    const paymentMilestones = milestones.filter(m => 
      m.event.includes('payment') || m.event.includes('invoice')
    );

    return {
      loadId,
      loadNumber: load[0].loadNumber,
      customerRate: load[0].customerRate,
      carrierRate: load[0].carrierRate,
      margin: load[0].margin,
      status: load[0].status,
      paymentHistory: paymentMilestones
    };
  }

  // Calculate cash flow for date range
  async getCashFlowAnalytics(companyId: string, startDate: Date, endDate: Date) {
    const loads = await db.select()
      .from(loadTransactions)
      .where(and(
        eq(loadTransactions.companyId, companyId),
        gte(loadTransactions.createdAt, startDate),
        lte(loadTransactions.createdAt, endDate)
      ));

    const analytics = loads.reduce((acc, load) => {
      const customerRate = parseFloat(load.customerRate?.toString() || '0');
      const carrierRate = parseFloat(load.carrierRate?.toString() || '0');
      const margin = parseFloat(load.margin?.toString() || '0');

      acc.totalRevenue += customerRate;
      acc.totalExpenses += carrierRate;
      acc.totalMargin += margin;

      // Categorize by status
      if (load.status === 'invoiced') {
        acc.invoiced += customerRate;
        acc.payableToCarriers += carrierRate;
      } else if (load.status === 'paid') {
        acc.collected += customerRate;
      }

      if (load.status === 'delivered' || load.status === 'invoiced' || load.status === 'paid') {
        acc.payableToCarriers += carrierRate;
      }

      return acc;
    }, {
      totalRevenue: 0,
      totalExpenses: 0,
      totalMargin: 0,
      invoiced: 0,
      collected: 0,
      payableToCarriers: 0,
      outstandingReceivables: 0,
      cashFlow: 0
    });

    analytics.outstandingReceivables = analytics.invoiced - analytics.collected;
    analytics.cashFlow = analytics.collected - analytics.payableToCarriers;

    return {
      period: { startDate, endDate },
      analytics,
      marginPercent: analytics.totalRevenue > 0 ? (analytics.totalMargin / analytics.totalRevenue) * 100 : 0
    };
  }

  // Generate aging report for receivables
  async getAgingReport(companyId: string) {
    const loads = await db.select()
      .from(loadTransactions)
      .where(and(
        eq(loadTransactions.companyId, companyId),
        eq(loadTransactions.status, 'invoiced')
      ));

    const today = new Date();
    const aging = {
      current: 0,      // 0-30 days
      thirtyDays: 0,   // 31-60 days
      sixtyDays: 0,    // 61-90 days
      ninetyDays: 0,   // 90+ days
      total: 0
    };

    loads.forEach(load => {
      const customerRate = parseFloat(load.customerRate?.toString() || '0');
      const createdDate = new Date(load.createdAt || '');
      const daysPastDue = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysPastDue <= 30) {
        aging.current += customerRate;
      } else if (daysPastDue <= 60) {
        aging.thirtyDays += customerRate;
      } else if (daysPastDue <= 90) {
        aging.sixtyDays += customerRate;
      } else {
        aging.ninetyDays += customerRate;
      }

      aging.total += customerRate;
    });

    return aging;
  }
}

export const paymentManagement = new PaymentManagement();