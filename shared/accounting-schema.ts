import { pgTable, text, varchar, decimal, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Chart of Accounts
export const chartOfAccounts = pgTable("chart_of_accounts", {
  id: text("id").primaryKey().notNull(),
  companyId: text("company_id").notNull(),
  accountNumber: varchar("account_number", { length: 20 }).notNull(),
  accountName: varchar("account_name", { length: 255 }).notNull(),
  accountType: varchar("account_type", { length: 50 }).notNull(), // asset, liability, equity, revenue, expense
  accountSubtype: varchar("account_subtype", { length: 100 }),
  description: text("description"),
  parentAccountId: text("parent_account_id"),
  isActive: boolean("is_active").default(true),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Journal Entries
export const journalEntries = pgTable("journal_entries", {
  id: text("id").primaryKey().notNull(),
  companyId: text("company_id").notNull(),
  entryNumber: varchar("entry_number", { length: 50 }).notNull(),
  date: timestamp("date").notNull(),
  description: text("description").notNull(),
  reference: varchar("reference", { length: 100 }),
  totalDebit: decimal("total_debit", { precision: 12, scale: 2 }).notNull(),
  totalCredit: decimal("total_credit", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("draft"), // draft, posted, void
  createdBy: text("created_by").notNull(),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Journal Entry Lines
export const journalEntryLines = pgTable("journal_entry_lines", {
  id: text("id").primaryKey().notNull(),
  journalEntryId: text("journal_entry_id").notNull(),
  accountId: text("account_id").notNull(),
  description: text("description"),
  debitAmount: decimal("debit_amount", { precision: 12, scale: 2 }).default("0.00"),
  creditAmount: decimal("credit_amount", { precision: 12, scale: 2 }).default("0.00"),
  memo: text("memo"),
});

// Invoices
export const invoices = pgTable("invoices", {
  id: text("id").primaryKey().notNull(),
  companyId: text("company_id").notNull(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
  customerId: text("customer_id"),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }),
  customerAddress: jsonb("customer_address"),
  invoiceDate: timestamp("invoice_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0.00"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }).default("0.00"),
  status: varchar("status", { length: 20 }).default("draft"), // draft, sent, paid, overdue, void
  terms: text("terms"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoice Line Items
export const invoiceLineItems = pgTable("invoice_line_items", {
  id: text("id").primaryKey().notNull(),
  invoiceId: text("invoice_id").notNull(),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 4 }).default("0.0000"),
  accountId: text("account_id"), // Revenue account
});

// Bills/Vendor Invoices
export const bills = pgTable("bills", {
  id: text("id").primaryKey().notNull(),
  companyId: text("company_id").notNull(),
  billNumber: varchar("bill_number", { length: 50 }).notNull(),
  vendorId: text("vendor_id"),
  vendorName: varchar("vendor_name", { length: 255 }).notNull(),
  vendorEmail: varchar("vendor_email", { length: 255 }),
  billDate: timestamp("bill_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0.00"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }).default("0.00"),
  status: varchar("status", { length: 20 }).default("received"), // received, approved, paid, void
  reference: varchar("reference", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bill Line Items
export const billLineItems = pgTable("bill_line_items", {
  id: text("id").primaryKey().notNull(),
  billId: text("bill_id").notNull(),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 4 }).default("0.0000"),
  accountId: text("account_id"), // Expense account
});

// Payments
export const payments = pgTable("payments", {
  id: text("id").primaryKey().notNull(),
  companyId: text("company_id").notNull(),
  paymentNumber: varchar("payment_number", { length: 50 }).notNull(),
  paymentType: varchar("payment_type", { length: 20 }).notNull(), // customer_payment, vendor_payment
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // cash, check, credit_card, bank_transfer, ach
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  reference: varchar("reference", { length: 100 }),
  memo: text("memo"),
  bankAccountId: text("bank_account_id"),
  customerId: text("customer_id"),
  vendorId: text("vendor_id"),
  status: varchar("status", { length: 20 }).default("cleared"), // pending, cleared, failed, void
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment Applications (linking payments to invoices/bills)
export const paymentApplications = pgTable("payment_applications", {
  id: text("id").primaryKey().notNull(),
  paymentId: text("payment_id").notNull(),
  invoiceId: text("invoice_id"),
  billId: text("bill_id"),
  appliedAmount: decimal("applied_amount", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bank Accounts
export const bankAccounts = pgTable("bank_accounts", {
  id: text("id").primaryKey().notNull(),
  companyId: text("company_id").notNull(),
  accountName: varchar("account_name", { length: 255 }).notNull(),
  bankName: varchar("bank_name", { length: 255 }).notNull(),
  accountNumber: varchar("account_number", { length: 50 }).notNull(),
  routingNumber: varchar("routing_number", { length: 20 }),
  accountType: varchar("account_type", { length: 50 }).notNull(), // checking, savings, credit_card, loan
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0.00"),
  reconciledBalance: decimal("reconciled_balance", { precision: 12, scale: 2 }).default("0.00"),
  lastReconciledDate: timestamp("last_reconciled_date"),
  isActive: boolean("is_active").default(true),
  chartAccountId: text("chart_account_id"), // Link to chart of accounts
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bank Transactions
export const bankTransactions = pgTable("bank_transactions", {
  id: text("id").primaryKey().notNull(),
  bankAccountId: text("bank_account_id").notNull(),
  transactionDate: timestamp("transaction_date").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(), // Positive for credits, negative for debits
  transactionType: varchar("transaction_type", { length: 50 }).notNull(), // deposit, withdrawal, transfer, fee, interest
  reference: varchar("reference", { length: 100 }),
  runningBalance: decimal("running_balance", { precision: 12, scale: 2 }),
  isReconciled: boolean("is_reconciled").default(false),
  journalEntryId: text("journal_entry_id"), // Link to journal entry if posted
  paymentId: text("payment_id"), // Link to payment if applicable
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Financial Reports Cache
export const financialReports = pgTable("financial_reports", {
  id: text("id").primaryKey().notNull(),
  companyId: text("company_id").notNull(),
  reportType: varchar("report_type", { length: 50 }).notNull(), // profit_loss, balance_sheet, cash_flow, trial_balance
  reportData: jsonb("report_data").notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  generatedAt: timestamp("generated_at").defaultNow(),
  generatedBy: text("generated_by").notNull(),
});

// AI Insights
export const aiInsights = pgTable("ai_insights", {
  id: text("id").primaryKey().notNull(),
  companyId: text("company_id").notNull(),
  insightType: varchar("insight_type", { length: 50 }).notNull(), // cash_flow, expense_analysis, revenue_trend, anomaly_detection
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  severity: varchar("severity", { length: 20 }).notNull(), // low, medium, high, critical
  recommendations: jsonb("recommendations"),
  dataPoints: jsonb("data_points"),
  isRead: boolean("is_read").default(false),
  isActionable: boolean("is_actionable").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Schema exports
export const insertChartOfAccountsSchema = createInsertSchema(chartOfAccounts);
export const insertJournalEntrySchema = createInsertSchema(journalEntries);
export const insertJournalEntryLineSchema = createInsertSchema(journalEntryLines);
export const insertInvoiceSchema = createInsertSchema(invoices);
export const insertInvoiceLineItemSchema = createInsertSchema(invoiceLineItems);
export const insertBillSchema = createInsertSchema(bills);
export const insertBillLineItemSchema = createInsertSchema(billLineItems);
export const insertPaymentSchema = createInsertSchema(payments);
export const insertPaymentApplicationSchema = createInsertSchema(paymentApplications);
export const insertBankAccountSchema = createInsertSchema(bankAccounts);
export const insertBankTransactionSchema = createInsertSchema(bankTransactions);
export const insertFinancialReportSchema = createInsertSchema(financialReports);
export const insertAiInsightSchema = createInsertSchema(aiInsights);

// Type exports
export type ChartOfAccount = typeof chartOfAccounts.$inferSelect;
export type InsertChartOfAccount = z.infer<typeof insertChartOfAccountsSchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntryLine = typeof journalEntryLines.$inferSelect;
export type InsertJournalEntryLine = z.infer<typeof insertJournalEntryLineSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type InsertInvoiceLineItem = z.infer<typeof insertInvoiceLineItemSchema>;
export type Bill = typeof bills.$inferSelect;
export type InsertBill = z.infer<typeof insertBillSchema>;
export type BillLineItem = typeof billLineItems.$inferSelect;
export type InsertBillLineItem = z.infer<typeof insertBillLineItemSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type PaymentApplication = typeof paymentApplications.$inferSelect;
export type InsertPaymentApplication = z.infer<typeof insertPaymentApplicationSchema>;
export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertBankAccount = z.infer<typeof insertBankAccountSchema>;
export type BankTransaction = typeof bankTransactions.$inferSelect;
export type InsertBankTransaction = z.infer<typeof insertBankTransactionSchema>;
export type FinancialReport = typeof financialReports.$inferSelect;
export type InsertFinancialReport = z.infer<typeof insertFinancialReportSchema>;
export type AiInsight = typeof aiInsights.$inferSelect;
export type InsertAiInsight = z.infer<typeof insertAiInsightSchema>;