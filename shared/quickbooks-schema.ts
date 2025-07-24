import { pgTable, uuid, varchar, text, numeric, timestamp, serial, date, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Chart of Accounts - Core accounting structure like QuickBooks
export const chartOfAccounts = pgTable("chart_of_accounts", {
  id: serial("id").primaryKey(),
  companyId: uuid("company_id").notNull(),
  accountName: varchar("account_name", { length: 255 }).notNull(),
  accountCode: varchar("account_code", { length: 20 }).notNull(),
  accountType: varchar("account_type", { length: 50 }).notNull(), // Asset, Liability, Revenue, Expense, Equity
  parentAccountId: integer("parent_account_id"),
  isActive: boolean("is_active").default(true),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// General Ledger - All financial transactions
export const generalLedger = pgTable("general_ledger", {
  id: serial("id").primaryKey(),
  companyId: uuid("company_id").notNull(),
  transactionDate: date("transaction_date").notNull(),
  accountId: integer("account_id").notNull(),
  debit: numeric("debit", { precision: 12, scale: 2 }).default("0.00"),
  credit: numeric("credit", { precision: 12, scale: 2 }).default("0.00"),
  description: text("description").notNull(),
  referenceType: varchar("reference_type", { length: 50 }), // invoice, bill, payment, adjustment
  referenceId: uuid("reference_id"),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Enhanced Invoices with QuickBooks features
export const enhancedInvoices = pgTable("enhanced_invoices", {
  id: uuid("id").primaryKey(),
  companyId: uuid("company_id").notNull(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
  customerId: uuid("customer_id").notNull(),
  loadId: uuid("load_id"),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).default("0.00"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  amountPaid: numeric("amount_paid", { precision: 12, scale: 2 }).default("0.00"),
  status: varchar("status", { length: 20 }).default("draft"), // draft, sent, paid, overdue, cancelled
  terms: varchar("terms", { length: 50 }).default("Net 30"),
  memo: text("memo"),
  isRecurring: boolean("is_recurring").default(false),
  recurringFrequency: varchar("recurring_frequency", { length: 20 }),
  agingDays: integer("aging_days").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Invoice Line Items
export const invoiceLineItems = pgTable("invoice_line_items", {
  id: serial("id").primaryKey(),
  invoiceId: uuid("invoice_id").notNull(),
  description: text("description").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).default("1.00"),
  rate: numeric("rate", { precision: 12, scale: 2 }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  accountId: integer("account_id"), // Link to chart of accounts
  createdAt: timestamp("created_at").defaultNow()
});

// Enhanced Bills with vendor management
export const enhancedBills = pgTable("enhanced_bills", {
  id: uuid("id").primaryKey(),
  companyId: uuid("company_id").notNull(),
  billNumber: varchar("bill_number", { length: 50 }),
  vendorId: uuid("vendor_id").notNull(),
  billDate: date("bill_date").notNull(),
  dueDate: date("due_date").notNull(),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).default("0.00"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  amountPaid: numeric("amount_paid", { precision: 12, scale: 2 }).default("0.00"),
  status: varchar("status", { length: 20 }).default("received"), // received, approved, paid, overdue
  terms: varchar("terms", { length: 50 }).default("Net 30"),
  approvalStatus: varchar("approval_status", { length: 20 }).default("pending"),
  approvedBy: uuid("approved_by"),
  memo: text("memo"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Bill Line Items
export const billLineItems = pgTable("bill_line_items", {
  id: serial("id").primaryKey(),
  billId: uuid("bill_id").notNull(),
  description: text("description").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).default("1.00"),
  rate: numeric("rate", { precision: 12, scale: 2 }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  accountId: integer("account_id"), // Link to chart of accounts
  category: varchar("category", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow()
});

// Enhanced Payments with matching
export const enhancedPayments = pgTable("enhanced_payments", {
  id: uuid("id").primaryKey(),
  companyId: uuid("company_id").notNull(),
  paymentNumber: varchar("payment_number", { length: 50 }),
  type: varchar("type", { length: 20 }).notNull(), // invoice_payment, bill_payment, adjustment
  referenceId: uuid("reference_id"), // invoice or bill ID
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // check, ach, card, cash
  paymentDate: date("payment_date").notNull(),
  bankAccountId: uuid("bank_account_id"),
  checkNumber: varchar("check_number", { length: 50 }),
  referenceNumber: varchar("reference_number", { length: 100 }),
  memo: text("memo"),
  status: varchar("status", { length: 20 }).default("processed"),
  isMatched: boolean("is_matched").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

// Bank Transaction Matching
export const bankTransactionMatching = pgTable("bank_transaction_matching", {
  id: serial("id").primaryKey(),
  companyId: uuid("company_id").notNull(),
  bankTransactionId: uuid("bank_transaction_id").notNull(),
  matchedType: varchar("matched_type", { length: 20 }), // invoice, bill, payment
  matchedId: uuid("matched_id"),
  matchAmount: numeric("match_amount", { precision: 12, scale: 2 }),
  matchConfidence: numeric("match_confidence", { precision: 5, scale: 2 }),
  isAutoMatched: boolean("is_auto_matched").default(false),
  matchedBy: uuid("matched_by"),
  matchedAt: timestamp("matched_at").defaultNow()
});

// Recurring Transactions
export const recurringTransactions = pgTable("recurring_transactions", {
  id: uuid("id").primaryKey(),
  companyId: uuid("company_id").notNull(),
  templateName: varchar("template_name", { length: 100 }).notNull(),
  transactionType: varchar("transaction_type", { length: 20 }).notNull(), // invoice, bill
  frequency: varchar("frequency", { length: 20 }).notNull(), // weekly, monthly, quarterly, yearly
  nextRunDate: date("next_run_date").notNull(),
  templateData: text("template_data"), // JSON template
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Zod schemas for validation
export const insertChartOfAccountsSchema = createInsertSchema(chartOfAccounts);
export const insertGeneralLedgerSchema = createInsertSchema(generalLedger);
export const insertEnhancedInvoiceSchema = createInsertSchema(enhancedInvoices);
export const insertInvoiceLineItemSchema = createInsertSchema(invoiceLineItems);
export const insertEnhancedBillSchema = createInsertSchema(enhancedBills);
export const insertBillLineItemSchema = createInsertSchema(billLineItems);
export const insertEnhancedPaymentSchema = createInsertSchema(enhancedPayments);
export const insertBankTransactionMatchingSchema = createInsertSchema(bankTransactionMatching);
export const insertRecurringTransactionSchema = createInsertSchema(recurringTransactions);

// Type definitions
export type ChartOfAccount = typeof chartOfAccounts.$inferSelect;
export type GeneralLedgerEntry = typeof generalLedger.$inferSelect;
export type EnhancedInvoice = typeof enhancedInvoices.$inferSelect;
export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type EnhancedBill = typeof enhancedBills.$inferSelect;
export type BillLineItem = typeof billLineItems.$inferSelect;
export type EnhancedPayment = typeof enhancedPayments.$inferSelect;
export type BankTransactionMatch = typeof bankTransactionMatching.$inferSelect;
export type RecurringTransaction = typeof recurringTransactions.$inferSelect;

// Insert type definitions
export type InsertChartOfAccount = z.infer<typeof insertChartOfAccountsSchema>;
export type InsertGeneralLedgerEntry = z.infer<typeof insertGeneralLedgerSchema>;
export type InsertEnhancedInvoice = z.infer<typeof insertEnhancedInvoiceSchema>;
export type InsertInvoiceLineItem = z.infer<typeof insertInvoiceLineItemSchema>;
export type InsertEnhancedBill = z.infer<typeof insertEnhancedBillSchema>;
export type InsertBillLineItem = z.infer<typeof insertBillLineItemSchema>;
export type InsertEnhancedPayment = z.infer<typeof insertEnhancedPaymentSchema>;
export type InsertBankTransactionMatch = z.infer<typeof insertBankTransactionMatchingSchema>;
export type InsertRecurringTransaction = z.infer<typeof insertRecurringTransactionSchema>;