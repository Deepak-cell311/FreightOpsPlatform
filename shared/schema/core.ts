import { pgTable, varchar, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

// Companies table - Core business entities
export const companies = pgTable("companies", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipcode", { length: 10 }),
  dotNumber: varchar("dotnumber", { length: 20 }),
  mcNumber: varchar("mcnumber", { length: 20 }),
  ein: varchar("ein", { length: 20 }),
  businessType: varchar("businesstype", { length: 50 }),
  yearsInBusiness: varchar("yearsinbusiness", { length: 10 }),
  numberOfTrucks: varchar("numberoftrucks", { length: 10 }),
  walletBalance: varchar("walletbalance", { length: 50 }),
  subscriptionStatus: varchar("subscriptionstatus", { length: 50 }),
  subscriptionPlan: varchar("subscriptionplan", { length: 50 }),
  stripeCustomerId: varchar("stripecustomerid", { length: 255 }),
  railsrAccountId: varchar("railsraccountid", { length: 255 }),
  gustoCompanyId: varchar("gustocompanyid", { length: 255 }),
  gustoAccessToken: varchar("gustoaccesstoken", { length: 500 }),
  gustoRefreshToken: varchar("gustorefreshtoken", { length: 500 }),
  gustoTokenExpiry: timestamp("gustotokenexpiry"),
  createdAt: timestamp("createdat").defaultNow(),
  updatedAt: timestamp("updatedat").defaultNow(),
  isActive: boolean("isactive").default(true),
  handlesContainers: boolean("handlescontainers").default(false),
  containerTrackingEnabled: boolean("containertrackingenabled").default(false),
});

// Users table - Authentication and access control
export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("firstname", { length: 100 }),
  lastName: varchar("lastname", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  role: varchar("role", { length: 50 }).default("user"),
  companyId: varchar("companyid", { length: 255 }).references(() => companies.id),
  isActive: boolean("isactive").default(true),
  lastLogin: timestamp("lastlogin"),
  createdAt: timestamp("createdat").defaultNow(),
  updatedAt: timestamp("updatedat").defaultNow(),
});

// Relations
export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ one }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
}));

// Types
export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Schemas
export const insertCompanySchema = createInsertSchema(companies);
export const insertUserSchema = createInsertSchema(users);