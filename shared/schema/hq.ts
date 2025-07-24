import { pgTable, varchar, text, timestamp, uuid, decimal, integer, jsonb, date, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { companies } from "./core";

// HQ Tenants - Platform tenant management
export const hqTenants = pgTable("hq_tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  tenantName: varchar("tenant_name").notNull(),
  subscriptionTier: varchar("subscription_tier").notNull(),
  monthlyRevenue: decimal("monthly_revenue", { precision: 10, scale: 2 }),
  userCount: integer("user_count").default(0),
  featureUsage: jsonb("feature_usage").default({}),
  lastActivity: timestamp("last_activity"),
  healthScore: decimal("health_score", { precision: 3, scale: 2 }).default("0.0"),
  riskLevel: varchar("risk_level").default("low"),
  supportTier: varchar("support_tier").default("standard"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// HQ System Metrics - Overall platform performance tracking
export const hqSystemMetrics = pgTable("hq_system_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  metricType: varchar("metric_type").notNull(),
  metricName: varchar("metric_name").notNull(),
  metricValue: decimal("metric_value", { precision: 15, scale: 2 }),
  measurementDate: date("measurement_date").notNull(),
  tenantId: uuid("tenant_id").references(() => hqTenants.id),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// HQ Support Tickets - Customer support management
export const hqSupportTickets = pgTable("hq_support_tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  ticketNumber: varchar("ticket_number").notNull().unique(),
  subject: varchar("subject").notNull(),
  description: text("description"),
  priority: varchar("priority").default("medium"),
  status: varchar("status").default("open"),
  assignedTo: varchar("assigned_to"),
  customerEmail: varchar("customer_email"),
  resolutionNotes: text("resolution_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// HQ Banking Overview - Financial monitoring
export const hqBankingOverview = pgTable("hq_banking_overview", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  railsrAccountId: varchar("railsr_account_id"),
  accountStatus: varchar("account_status"),
  accountBalance: decimal("account_balance", { precision: 12, scale: 2 }).default("0"),
  monthlyVolume: decimal("monthly_volume", { precision: 15, scale: 2 }).default("0"),
  transactionCount: integer("transaction_count").default(0),
  riskScore: decimal("risk_score", { precision: 3, scale: 2 }).default("0.0"),
  complianceStatus: varchar("compliance_status").default("compliant"),
  lastTransaction: timestamp("last_transaction"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// HQ Employees - FreightOps Pro employee management
export const hqEmployees = pgTable("hq_employees", {
  id: uuid("id").primaryKey().defaultRandom(),
  employeeId: varchar("employee_id").notNull().unique(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull().unique(),
  phone: varchar("phone"),
  password: varchar("password").notNull(),
  role: varchar("role").notNull(),
  department: varchar("department").notNull(),
  position: varchar("position").notNull(),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// HQ Feature Usage - Track feature usage by tenant
export const hqFeatureUsage = pgTable("hq_feature_usage", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  featureName: varchar("feature_name").notNull(),
  usageCount: integer("usage_count").default(0),
  lastUsed: timestamp("last_used"),
  usageTrend: varchar("usage_trend").default("stable"),
  billingImpact: decimal("billing_impact", { precision: 8, scale: 2 }).default("0"),
  recordedDate: date("recorded_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// HQ Billing Events - Revenue and billing tracking
export const hqBillingEvents = pgTable("hq_billing_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  eventType: varchar("event_type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  subscriptionTier: varchar("subscription_tier"),
  billingCycle: varchar("billing_cycle"),
  stripeEventId: varchar("stripe_event_id"),
  eventData: jsonb("event_data").default({}),
  processedAt: timestamp("processed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const hqTenantsRelations = relations(hqTenants, ({ one, many }) => ({
  company: one(companies, {
    fields: [hqTenants.companyId],
    references: [companies.id],
  }),
  metrics: many(hqSystemMetrics),
  supportTickets: many(hqSupportTickets),
  featureUsage: many(hqFeatureUsage),
  billingEvents: many(hqBillingEvents),
}));

export const hqSystemMetricsRelations = relations(hqSystemMetrics, ({ one }) => ({
  tenant: one(hqTenants, {
    fields: [hqSystemMetrics.tenantId],
    references: [hqTenants.id],
  }),
}));

// Types
export type HQTenant = typeof hqTenants.$inferSelect;
export type InsertHQTenant = typeof hqTenants.$inferInsert;
export type HQSystemMetrics = typeof hqSystemMetrics.$inferSelect;
export type InsertHQSystemMetrics = typeof hqSystemMetrics.$inferInsert;
export type HQSupportTicket = typeof hqSupportTickets.$inferSelect;
export type InsertHQSupportTicket = typeof hqSupportTickets.$inferInsert;
export type HQBankingOverview = typeof hqBankingOverview.$inferSelect;
export type InsertHQBankingOverview = typeof hqBankingOverview.$inferInsert;
export type HQFeatureUsage = typeof hqFeatureUsage.$inferSelect;
export type InsertHQFeatureUsage = typeof hqFeatureUsage.$inferInsert;
export type HQBillingEvent = typeof hqBillingEvents.$inferSelect;
export type InsertHQBillingEvent = typeof hqBillingEvents.$inferInsert;

// Schemas
export const insertHQTenantSchema = createInsertSchema(hqTenants);
export const insertHQSystemMetricsSchema = createInsertSchema(hqSystemMetrics);
export const insertHQSupportTicketSchema = createInsertSchema(hqSupportTickets);
export const insertHQBankingOverviewSchema = createInsertSchema(hqBankingOverview);
export const insertHQFeatureUsageSchema = createInsertSchema(hqFeatureUsage);
export const insertHQBillingEventSchema = createInsertSchema(hqBillingEvents);