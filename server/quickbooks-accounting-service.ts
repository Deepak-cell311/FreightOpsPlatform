import { eq, and, desc, asc, sql } from "drizzle-orm";
import { db } from "./db";
import { 
  chartOfAccounts, 
  generalLedger, 
  enhancedInvoices, 
  invoiceLineItems,
  enhancedBills,
  billLineItems,
  enhancedPayments,
  bankTransactionMatching,
  recurringTransactions 
} from "../shared/quickbooks-schema";
import { 
  ChartOfAccount,
  GeneralLedgerEntry,
  EnhancedInvoice,
  EnhancedBill,
  EnhancedPayment,
  InsertChartOfAccount,
  InsertEnhancedInvoice,
  InsertEnhancedBill,
  InsertEnhancedPayment
} from "../shared/quickbooks-schema";

export class QuickBooksAccountingService {
  
  // Chart of Accounts Management
  async getChartOfAccounts(companyId: string): Promise<ChartOfAccount[]> {
    return await db.select()
      .from(chartOfAccounts)
      .where(and(
        eq(chartOfAccounts.companyId, companyId),
        eq(chartOfAccounts.isActive, true)
      ))
      .orderBy(asc(chartOfAccounts.accountCode));
  }

  async createAccount(accountData: InsertChartOfAccount): Promise<ChartOfAccount> {
    const [account] = await db.insert(chartOfAccounts)
      .values(accountData)
      .returning();
    return account;
  }

  // Invoice Management with QuickBooks features
  async getInvoices(companyId: string, filters?: {
    status?: string;
    customerId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<EnhancedInvoice[]> {
    let query = db.select()
      .from(enhancedInvoices)
      .where(eq(enhancedInvoices.companyId, companyId));

    if (filters?.status) {
      query = query.where(eq(enhancedInvoices.status, filters.status));
    }
    if (filters?.customerId) {
      query = query.where(eq(enhancedInvoices.customerId, filters.customerId));
    }

    return await query.orderBy(desc(enhancedInvoices.createdAt));
  }

  async createInvoice(invoiceData: InsertEnhancedInvoice): Promise<{ invoice: EnhancedInvoice; journalEntries: GeneralLedgerEntry[] }> {
    // Auto-generate invoice number
    const invoiceCount = await this.getNextInvoiceNumber(invoiceData.companyId);
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount).padStart(4, '0')}`;

    const [invoice] = await db.insert(enhancedInvoices)
      .values({
        ...invoiceData,
        invoiceNumber,
        agingDays: this.calculateAgingDays(invoiceData.dueDate)
      })
      .returning();

    // Create journal entries (double-entry bookkeeping)
    const journalEntries = await this.createInvoiceJournalEntries(invoice);

    return { invoice, journalEntries };
  }

  async updateInvoiceStatus(invoiceId: string, status: string, amountPaid?: number): Promise<EnhancedInvoice> {
    const updateData: any = { status, updatedAt: new Date() };
    if (amountPaid !== undefined) {
      updateData.amountPaid = amountPaid;
    }

    const [invoice] = await db.update(enhancedInvoices)
      .set(updateData)
      .where(eq(enhancedInvoices.id, invoiceId))
      .returning();

    return invoice;
  }

  // Bill Management with vendor workflow
  async getBills(companyId: string, filters?: {
    status?: string;
    vendorId?: string;
    approvalStatus?: string;
  }): Promise<EnhancedBill[]> {
    let query = db.select()
      .from(enhancedBills)
      .where(eq(enhancedBills.companyId, companyId));

    if (filters?.status) {
      query = query.where(eq(enhancedBills.status, filters.status));
    }
    if (filters?.approvalStatus) {
      query = query.where(eq(enhancedBills.approvalStatus, filters.approvalStatus));
    }

    return await query.orderBy(desc(enhancedBills.createdAt));
  }

  async createBill(billData: InsertEnhancedBill): Promise<{ bill: EnhancedBill; journalEntries: GeneralLedgerEntry[] }> {
    const [bill] = await db.insert(enhancedBills)
      .values(billData)
      .returning();

    // Create journal entries for the bill
    const journalEntries = await this.createBillJournalEntries(bill);

    return { bill, journalEntries };
  }

  async approveBill(billId: string, approvedBy: string): Promise<EnhancedBill> {
    const [bill] = await db.update(enhancedBills)
      .set({
        approvalStatus: 'approved',
        approvedBy,
        updatedAt: new Date()
      })
      .where(eq(enhancedBills.id, billId))
      .returning();

    return bill;
  }

  // Payment Management with matching
  async getPayments(companyId: string, filters?: {
    type?: string;
    paymentMethod?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<EnhancedPayment[]> {
    let query = db.select()
      .from(enhancedPayments)
      .where(eq(enhancedPayments.companyId, companyId));

    if (filters?.type) {
      query = query.where(eq(enhancedPayments.type, filters.type));
    }

    return await query.orderBy(desc(enhancedPayments.createdAt));
  }

  async recordPayment(paymentData: InsertEnhancedPayment): Promise<{ payment: EnhancedPayment; journalEntries: GeneralLedgerEntry[] }> {
    // Auto-generate payment number
    const paymentCount = await this.getNextPaymentNumber(paymentData.companyId);
    const paymentNumber = `PAY-${new Date().getFullYear()}-${String(paymentCount).padStart(4, '0')}`;

    const [payment] = await db.insert(enhancedPayments)
      .values({
        ...paymentData,
        paymentNumber
      })
      .returning();

    // Create journal entries for the payment
    const journalEntries = await this.createPaymentJournalEntries(payment);

    // If this is an invoice payment, update the invoice
    if (payment.type === 'invoice_payment' && payment.referenceId) {
      await this.applyPaymentToInvoice(payment.referenceId, payment.amount);
    }

    return { payment, journalEntries };
  }

  // Bank Transaction Matching (QuickBooks-style)
  async matchBankTransaction(companyId: string, bankTransactionId: string, matchedType: string, matchedId: string, matchAmount: number, confidence: number): Promise<void> {
    await db.insert(bankTransactionMatching)
      .values({
        companyId,
        bankTransactionId,
        matchedType,
        matchedId,
        matchAmount,
        matchConfidence: confidence,
        isAutoMatched: confidence > 0.9
      });
  }

  // Financial Reports
  async getProfitLossReport(companyId: string, startDate: string, endDate: string): Promise<any> {
    const revenueAccounts = await this.getAccountsByType(companyId, 'Revenue');
    const expenseAccounts = await this.getAccountsByType(companyId, 'Expense');

    const revenue = await this.getTotalByAccounts(companyId, revenueAccounts.map(a => a.id), startDate, endDate, 'credit');
    const expenses = await this.getTotalByAccounts(companyId, expenseAccounts.map(a => a.id), startDate, endDate, 'debit');

    return {
      period: { startDate, endDate },
      revenue: revenue || 0,
      expenses: expenses || 0,
      netIncome: (revenue || 0) - (expenses || 0),
      revenueBreakdown: await this.getAccountBreakdown(companyId, revenueAccounts, startDate, endDate, 'credit'),
      expenseBreakdown: await this.getAccountBreakdown(companyId, expenseAccounts, startDate, endDate, 'debit')
    };
  }

  async getBalanceSheet(companyId: string, asOfDate: string): Promise<any> {
    const assetAccounts = await this.getAccountsByType(companyId, 'Asset');
    const liabilityAccounts = await this.getAccountsByType(companyId, 'Liability');
    const equityAccounts = await this.getAccountsByType(companyId, 'Equity');

    const assets = await this.getBalanceByAccounts(companyId, assetAccounts.map(a => a.id), asOfDate);
    const liabilities = await this.getBalanceByAccounts(companyId, liabilityAccounts.map(a => a.id), asOfDate);
    const equity = await this.getBalanceByAccounts(companyId, equityAccounts.map(a => a.id), asOfDate);

    return {
      asOfDate,
      assets: {
        total: assets || 0,
        breakdown: await this.getAccountBalanceBreakdown(companyId, assetAccounts, asOfDate)
      },
      liabilities: {
        total: liabilities || 0,
        breakdown: await this.getAccountBalanceBreakdown(companyId, liabilityAccounts, asOfDate)
      },
      equity: {
        total: equity || 0,
        breakdown: await this.getAccountBalanceBreakdown(companyId, equityAccounts, asOfDate)
      }
    };
  }

  async getARAgingReport(companyId: string): Promise<any> {
    const invoices = await db.select()
      .from(enhancedInvoices)
      .where(and(
        eq(enhancedInvoices.companyId, companyId),
        sql`${enhancedInvoices.totalAmount} > ${enhancedInvoices.amountPaid}`
      ));

    const aging = {
      current: 0,
      days1to30: 0,
      days31to60: 0,
      days61to90: 0,
      over90: 0
    };

    invoices.forEach(invoice => {
      const balance = Number(invoice.totalAmount) - Number(invoice.amountPaid);
      const days = this.calculateAgingDays(invoice.dueDate);

      if (days <= 0) aging.current += balance;
      else if (days <= 30) aging.days1to30 += balance;
      else if (days <= 60) aging.days31to60 += balance;
      else if (days <= 90) aging.days61to90 += balance;
      else aging.over90 += balance;
    });

    return aging;
  }

  // Recurring Transactions
  async createRecurringTransaction(companyId: string, templateName: string, transactionType: string, frequency: string, templateData: any): Promise<void> {
    const nextRunDate = this.calculateNextRunDate(frequency);
    
    await db.insert(recurringTransactions)
      .values({
        companyId,
        templateName,
        transactionType,
        frequency,
        nextRunDate,
        templateData: JSON.stringify(templateData)
      });
  }

  async processRecurringTransactions(): Promise<void> {
    const dueTransactions = await db.select()
      .from(recurringTransactions)
      .where(and(
        eq(recurringTransactions.isActive, true),
        sql`${recurringTransactions.nextRunDate} <= CURRENT_DATE`
      ));

    for (const transaction of dueTransactions) {
      const templateData = JSON.parse(transaction.templateData);
      
      if (transaction.transactionType === 'invoice') {
        await this.createInvoice(templateData);
      } else if (transaction.transactionType === 'bill') {
        await this.createBill(templateData);
      }

      // Update next run date
      const nextRunDate = this.calculateNextRunDate(transaction.frequency);
      await db.update(recurringTransactions)
        .set({ nextRunDate })
        .where(eq(recurringTransactions.id, transaction.id));
    }
  }

  // Dashboard Summary
  async getDashboardSummary(companyId: string): Promise<any> {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const [invoiceStats, billStats, paymentStats] = await Promise.all([
      this.getInvoiceStats(companyId, currentMonth),
      this.getBillStats(companyId, currentMonth),
      this.getPaymentStats(companyId, currentMonth)
    ]);

    return {
      totalRevenue: invoiceStats.totalRevenue,
      totalExpenses: billStats.totalExpenses,
      netProfit: invoiceStats.totalRevenue - billStats.totalExpenses,
      profitMargin: invoiceStats.totalRevenue > 0 ? ((invoiceStats.totalRevenue - billStats.totalExpenses) / invoiceStats.totalRevenue * 100) : 0,
      cashFlow: paymentStats.totalInflow - paymentStats.totalOutflow,
      outstandingInvoices: invoiceStats.outstanding,
      overdueInvoices: invoiceStats.overdue,
      unpaidBills: billStats.unpaid
    };
  }

  // Helper Methods
  private async getNextInvoiceNumber(companyId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(enhancedInvoices)
      .where(eq(enhancedInvoices.companyId, companyId));
    return (result[0]?.count || 0) + 1;
  }

  private async getNextPaymentNumber(companyId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(enhancedPayments)
      .where(eq(enhancedPayments.companyId, companyId));
    return (result[0]?.count || 0) + 1;
  }

  private calculateAgingDays(dueDate: Date): number {
    const today = new Date();
    const due = new Date(dueDate);
    return Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  }

  private calculateNextRunDate(frequency: string): Date {
    const today = new Date();
    switch (frequency) {
      case 'weekly': return new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly': return new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
      case 'quarterly': return new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());
      case 'yearly': return new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
      default: return new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
  }

  private async createInvoiceJournalEntries(invoice: EnhancedInvoice): Promise<GeneralLedgerEntry[]> {
    // Debit Accounts Receivable, Credit Revenue
    const entries = [
      {
        companyId: invoice.companyId,
        transactionDate: invoice.issueDate,
        accountId: 1200, // Accounts Receivable
        debit: invoice.totalAmount,
        credit: "0.00",
        description: `Invoice ${invoice.invoiceNumber}`,
        referenceType: 'invoice',
        referenceId: invoice.id,
        createdBy: invoice.companyId // Placeholder
      },
      {
        companyId: invoice.companyId,
        transactionDate: invoice.issueDate,
        accountId: 4000, // Revenue
        debit: "0.00",
        credit: invoice.totalAmount,
        description: `Invoice ${invoice.invoiceNumber}`,
        referenceType: 'invoice',
        referenceId: invoice.id,
        createdBy: invoice.companyId
      }
    ];

    const results = await db.insert(generalLedger).values(entries).returning();
    return results;
  }

  private async createBillJournalEntries(bill: EnhancedBill): Promise<GeneralLedgerEntry[]> {
    // Debit Expense, Credit Accounts Payable
    const entries = [
      {
        companyId: bill.companyId,
        transactionDate: bill.billDate,
        accountId: 5000, // Expenses
        debit: bill.totalAmount,
        credit: "0.00",
        description: `Bill ${bill.billNumber}`,
        referenceType: 'bill',
        referenceId: bill.id,
        createdBy: bill.companyId
      },
      {
        companyId: bill.companyId,
        transactionDate: bill.billDate,
        accountId: 2000, // Accounts Payable
        debit: "0.00",
        credit: bill.totalAmount,
        description: `Bill ${bill.billNumber}`,
        referenceType: 'bill',
        referenceId: bill.id,
        createdBy: bill.companyId
      }
    ];

    const results = await db.insert(generalLedger).values(entries).returning();
    return results;
  }

  private async createPaymentJournalEntries(payment: EnhancedPayment): Promise<GeneralLedgerEntry[]> {
    // Implementation depends on payment type
    return [];
  }

  private async applyPaymentToInvoice(invoiceId: string, paymentAmount: number): Promise<void> {
    const [invoice] = await db.select()
      .from(enhancedInvoices)
      .where(eq(enhancedInvoices.id, invoiceId));

    if (invoice) {
      const newAmountPaid = Number(invoice.amountPaid) + paymentAmount;
      const newStatus = newAmountPaid >= Number(invoice.totalAmount) ? 'paid' : 'partial';

      await db.update(enhancedInvoices)
        .set({
          amountPaid: newAmountPaid.toString(),
          status: newStatus,
          updatedAt: new Date()
        })
        .where(eq(enhancedInvoices.id, invoiceId));
    }
  }

  private async getAccountsByType(companyId: string, accountType: string): Promise<ChartOfAccount[]> {
    return await db.select()
      .from(chartOfAccounts)
      .where(and(
        eq(chartOfAccounts.companyId, companyId),
        eq(chartOfAccounts.accountType, accountType),
        eq(chartOfAccounts.isActive, true)
      ));
  }

  private async getTotalByAccounts(companyId: string, accountIds: number[], startDate: string, endDate: string, type: 'debit' | 'credit'): Promise<number> {
    const column = type === 'debit' ? generalLedger.debit : generalLedger.credit;
    
    const result = await db.select({ total: sql<number>`sum(${column})` })
      .from(generalLedger)
      .where(and(
        eq(generalLedger.companyId, companyId),
        sql`${generalLedger.accountId} = ANY(${accountIds})`,
        sql`${generalLedger.transactionDate} >= ${startDate}`,
        sql`${generalLedger.transactionDate} <= ${endDate}`
      ));

    return result[0]?.total || 0;
  }

  private async getAccountBreakdown(companyId: string, accounts: ChartOfAccount[], startDate: string, endDate: string, type: 'debit' | 'credit'): Promise<any[]> {
    // Implementation for detailed account breakdown
    return [];
  }

  private async getBalanceByAccounts(companyId: string, accountIds: number[], asOfDate: string): Promise<number> {
    // Implementation for balance calculation
    return 0;
  }

  private async getAccountBalanceBreakdown(companyId: string, accounts: ChartOfAccount[], asOfDate: string): Promise<any[]> {
    // Implementation for balance breakdown
    return [];
  }

  private async getInvoiceStats(companyId: string, month: string): Promise<any> {
    const invoices = await db.select()
      .from(enhancedInvoices)
      .where(and(
        eq(enhancedInvoices.companyId, companyId),
        sql`date_trunc('month', ${enhancedInvoices.issueDate}) = ${month + '-01'}`
      ));

    return {
      totalRevenue: invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0),
      outstanding: invoices.filter(inv => inv.status === 'sent').length,
      overdue: invoices.filter(inv => inv.status === 'overdue').length
    };
  }

  private async getBillStats(companyId: string, month: string): Promise<any> {
    const bills = await db.select()
      .from(enhancedBills)
      .where(and(
        eq(enhancedBills.companyId, companyId),
        sql`date_trunc('month', ${enhancedBills.billDate}) = ${month + '-01'}`
      ));

    return {
      totalExpenses: bills.reduce((sum, bill) => sum + Number(bill.totalAmount), 0),
      unpaid: bills.filter(bill => bill.status === 'received').length
    };
  }

  private async getPaymentStats(companyId: string, month: string): Promise<any> {
    const payments = await db.select()
      .from(enhancedPayments)
      .where(and(
        eq(enhancedPayments.companyId, companyId),
        sql`date_trunc('month', ${enhancedPayments.paymentDate}) = ${month + '-01'}`
      ));

    return {
      totalInflow: payments.filter(p => p.type === 'invoice_payment').reduce((sum, p) => sum + Number(p.amount), 0),
      totalOutflow: payments.filter(p => p.type === 'bill_payment').reduce((sum, p) => sum + Number(p.amount), 0)
    };
  }
}

export const quickBooksAccountingService = new QuickBooksAccountingService();