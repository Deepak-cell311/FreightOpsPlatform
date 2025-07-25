import { pgTable, uuid, varchar, integer, decimal, boolean, timestamp, text, serial, date, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Companies
export const companies = pgTable("companies", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zipcode"),
  dotNumber: varchar("dotnumber"),
  mcNumber: varchar("mcnumber"),
  ein: varchar("ein"),
  businessType: varchar("businesstype"),
  yearsInBusiness: integer("yearsinbusiness"),
  numberOfTrucks: integer("numberoftrucks"),
  walletBalance: decimal("walletbalance").default("0"),
  subscriptionStatus: varchar("subscriptionstatus").default("trial"),
  subscriptionPlan: varchar("subscriptionplan").default("starter"),
  stripeCustomerId: varchar("stripecustomerid"),
  railsrEnduserId: varchar("railsrenduser_id"),
  railsrLedgerId: varchar("railsrledger_id"),
  bankAccountNumber: varchar("bank_account_number"),
  bankRoutingNumber: varchar("bank_routing_number"),
  gustoCompanyId: varchar("gustocompanyid"),
  gustoAccessToken: varchar("gustoaccesstoken"),
  gustoRefreshToken: varchar("gustorefreshtoken"),
  gustoTokenExpiry: timestamp("gustotokenexpiry"),
  createdAt: timestamp("createdat").defaultNow(),
  updatedAt: timestamp("updatedat").defaultNow(),
  isActive: boolean("isactive").default(true),
  handlesContainers: boolean("handlescontainers").default(false),
  containerTrackingEnabled: boolean("containertrackingenabled").default(false),
  scacCode: varchar("scac_code"),
});

// Users
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique(),
  firstName: varchar("firstname"),
  lastName: varchar("lastname"),
  password: varchar("password").notNull(),
  phone: varchar("phone"),
  role: varchar("role").default("user"),
  companyId: varchar("companyid", { length: 50 }).references(() => companies.id),
  isActive: boolean("isactive").default(true),
  lastLogin: timestamp("lastlogin"),
  createdAt: timestamp("createdat").defaultNow(),
  updatedAt: timestamp("updatedat").defaultNow(),
});

// Drivers - Matches actual database structure exactly
export const drivers = pgTable("drivers", {
  id: varchar("id").primaryKey().notNull(),
  companyId: varchar("companyid", { length: 50 }).references(() => companies.id).notNull(),
  firstName: varchar("firstname").notNull(),
  lastName: varchar("lastname").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  licenseNumber: varchar("licensenumber").notNull(),
  licenseClass: varchar("licenseclass").notNull(),
  licenseExpiry: timestamp("licenseexpiry").notNull(),
  dateOfBirth: timestamp("dateofbirth").notNull(),
  address: varchar("address").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  zipCode: varchar("zipcode").notNull(),
  emergencyContact: varchar("emergencycontact").notNull(),
  emergencyPhone: varchar("emergencyphone").notNull(),
  hireDate: timestamp("hiredate").notNull(),
  status: varchar("status").default("available"),
  payRate: decimal("payrate").notNull(),
  payType: varchar("paytype").notNull(),
  hoursRemaining: decimal("hoursremaining"),
  currentLocation: varchar("currentlocation"),
  isActive: boolean("isactive").default(true),
  createdAt: timestamp("createdat").defaultNow(),
  updatedAt: timestamp("updatedat").defaultNow(),
});

// Equipment table removed - using trucks table for fleet management

// Trucks table - Matches actual database structure exactly
export const trucks = pgTable("trucks", {
  id: varchar("id").primaryKey().notNull(),
  companyId: varchar("companyid", { length: 50 }).references(() => companies.id).notNull(),
  truckNumber: varchar("trucknumber").notNull(),
  make: varchar("make").notNull(),
  model: varchar("model").notNull(),
  year: integer("year").notNull(),
  vin: varchar("vin").notNull(),
  licensePlate: varchar("licenseplate").notNull(),
  registrationState: varchar("registrationstate"),
  status: varchar("status"),
  createdAt: timestamp("createdat").defaultNow(),
  updatedAt: timestamp("updatedat").defaultNow(),
  // Core fields matching database structure
  fuelType: varchar("fueltype"),
  fuelEfficiency: decimal("fuelefficiency"),
  maintenanceStatus: varchar("maintenancestatus"),
  lastMaintenanceDate: timestamp("lastmaintenancedate"),
  nextMaintenanceDate: timestamp("nextmaintenancedate"),
  insuranceProvider: varchar("insuranceprovider"),
  insurancePolicyNumber: varchar("insurancepolicynumber"),
  insuranceExpiry: timestamp("insuranceexpiry"),
  isActive: boolean("isactive").default(true),
});

// Equipment documents removed - using trucks table for fleet management

// Equipment maintenance removed - using trucks table for fleet management

// Equipment expenses removed - using trucks table for fleet management

// Equipment relations removed - using trucks table for fleet management

// Loads
export const loads = pgTable("loads", {
  id: varchar("id").primaryKey().notNull(),
  companyId: varchar("companyid", { length: 50 }).references(() => companies.id).notNull(),
  loadNumber: varchar("loadnumber").notNull(),
  status: varchar("status").default("available"), // available, assigned, picked_up, in_transit, delivered, cancelled
  priority: varchar("priority").default("standard"), // standard, urgent, critical

  // Customer Information
  customerName: varchar("customername").notNull(),
  customerContact: varchar("customercontact").notNull(),
  customerPhone: varchar("customerphone").notNull(),
  customerEmail: varchar("customeremail").notNull(),

  // Pickup Information
  pickupLocation: varchar("pickuplocation").notNull(),
  pickupAddress: text("pickupaddress").notNull(),
  pickupCity: varchar("pickupcity").notNull(),
  pickupState: varchar("pickupstate").notNull(),
  pickupZip: varchar("pickupzip").notNull(),
  pickupDate: varchar("pickupdate").notNull(),
  pickupTime: varchar("pickuptime").notNull(),
  pickupWindow: varchar("pickup_window").notNull(),
  pickupContact: varchar("pickup_contact").notNull(),
  pickupPhone: varchar("pickup_phone").notNull(),
  pickupInstructions: text("pickup_instructions"),

  // Delivery Information
  deliveryLocation: varchar("deliverylocation").notNull(),
  deliveryAddress: text("deliveryaddress").notNull(),
  deliveryCity: varchar("deliverycity").notNull(),
  deliveryState: varchar("deliverystate").notNull(),
  deliveryZip: varchar("deliveryzip").notNull(),
  deliveryDate: varchar("deliverydate").notNull(),
  deliveryTime: varchar("deliverytime").notNull(),
  deliveryWindow: varchar("delivery_window").notNull(),
  deliveryContact: varchar("delivery_contact").notNull(),
  deliveryPhone: varchar("delivery_phone").notNull(),
  deliveryInstructions: text("delivery_instructions"),

  // Load Details
  commodity: varchar("commodity").notNull(),
  commodityType: varchar("commodity_type").default("general_freight"), // general_freight, hazmat, refrigerated, oversized, livestock, automotive
  weight: integer("weight").notNull(),
  pieces: integer("pieces").notNull(),
  length: decimal("length", { precision: 8, scale: 2 }).notNull(),
  width: decimal("width", { precision: 8, scale: 2 }).notNull(),
  height: decimal("height", { precision: 8, scale: 2 }).notNull(),
  specialRequirements: text("special_requirements"),

  // Financial
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  rateType: varchar("rate_type").default("flat"), // flat, per_mile, percentage
  fuelSurcharge: decimal("fuel_surcharge", { precision: 10, scale: 2 }).default("0"),
  accessorialCharges: decimal("accessorial_charges", { precision: 10, scale: 2 }).default("0"),
  totalRate: decimal("total_rate", { precision: 10, scale: 2 }).notNull(),
  fuelCost: decimal("fuel_cost", { precision: 10, scale: 2 }).default("0"),
  driverPay: decimal("driver_pay", { precision: 10, scale: 2 }).default("0"),

  // Operational
  distance: integer("distance").notNull(),
  estimatedMiles: integer("estimated_miles").notNull(),
  estimatedDuration: integer("estimated_duration").notNull(), // in hours
  assignedDriverId: varchar("assigned_driver_id").references(() => drivers.id),
  assignedTruckId: varchar("assigned_truck_id").references(() => trucks.id),
  dispatchNotes: text("dispatch_notes"),

  // Tracking
  lastUpdate: varchar("last_update"),
  estimatedArrival: varchar("estimated_arrival"),
  proofOfDelivery: varchar("proof_of_delivery"),

  // Smart Load Creation Fields
  trailerType: varchar("trailer_type"), // container, reefer, tanker, flatbed, dryvan
  loadCommodity: varchar("load_commodity"),

  // Container Load Fields
  isContainerLoad: boolean("is_container_load").default(false),
  containerNumber: varchar("container_number"),
  bolNumber: varchar("bol_number"),
  lfsNumber: varchar("lfs_number"),
  ssl: varchar("ssl"), // Steamship Line
  vesselName: varchar("vessel_name"),
  portOfLoading: varchar("port_of_loading"),
  portOfDischarge: varchar("port_of_discharge"),
  containerSize: varchar("container_size"), // 20ft, 40ft, 45ft
  grossWeight: integer("gross_weight"),
  hazmat: boolean("hazmat").default(false),
  containerCurrentLocation: varchar("container_current_location"),
  isCustomerHold: boolean("is_customer_hold").default(false),
  isAvailableForPickup: boolean("is_available_for_pickup").default(true),
  chassisRequired: boolean("chassis_required").default(false),
  chassisId: varchar("chassis_id"),
  chassisType: varchar("chassis_type"), // Standard, Triaxle, Tank
  chassisProvider: varchar("chassis_provider"), // TRAC, FlexiVan, DCLI
  chassisFreeDays: integer("chassis_free_days").default(3),
  chassisPerDiemRate: decimal("chassis_per_diem_rate", { precision: 10, scale: 2 }).default("0"),
  containerFreeDays: integer("container_free_days").default(5),
  containerDemurrageRate: decimal("container_demurrage_rate", { precision: 10, scale: 2 }).default("0"),
  expressPassRequired: boolean("express_pass_required").default(false),
  terminal: varchar("terminal"),

  // Reefer Load Fields
  temperature: integer("temperature"),
  isFSMACompliant: boolean("is_fsma_compliant").default(false),
  preloadChecklistComplete: boolean("preload_checklist_complete").default(false),

  // Tanker Load Fields
  liquidType: varchar("liquid_type"), // Fuel, Milk, Water, Chemicals
  washType: varchar("wash_type"), // Pre-clean type
  volume: integer("volume"), // gallons or liters

  // Flatbed Load Fields
  loadLength: decimal("load_length", { precision: 5, scale: 2 }),
  loadWidth: decimal("load_width", { precision: 5, scale: 2 }),
  loadHeight: decimal("load_height", { precision: 5, scale: 2 }),
  tarpRequired: boolean("tarp_required").default(false),
  securementType: varchar("securement_type"), // Chains, Straps, Coil Racks

  // Dry Van Load Fields
  palletCount: integer("pallet_count"),
  isStackable: boolean("is_stackable").default(true),
  sealNumber: varchar("seal_number"),

  // Legacy Intermodal Fields (maintained for compatibility)
  railCarNumber: varchar("rail_car_number"),
  portCode: varchar("port_code"),
  railroad: varchar("railroad"),
  chassisNumber: varchar("chassis_number"),
  steamshipLine: varchar("steamship_line"),
  bookingNumber: varchar("booking_number"),
  billOfLading: varchar("bill_of_lading"),
  containerType: varchar("container_type"),
  temperatureSettings: jsonb("temperature_settings"),
  intermodalTracking: jsonb("intermodal_tracking"),
  lastPortUpdate: timestamp("last_port_update"),
  lastRailUpdate: timestamp("last_rail_update"),

  // Dispatch Integration
  isMultiDriverLoad: boolean("is_multi_driver_load").default(false),
  dispatchStatus: varchar("dispatch_status").default("planning"), // planning, assigned, in_progress, completed

  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  dispatchedAt: timestamp("dispatched_at"),
  pickedUpAt: timestamp("picked_up_at"),
  deliveredAt: timestamp("delivered_at"),
});

// Dispatch legs table for multi-driver loads and detailed dispatch planning
export const dispatchLegs = pgTable("dispatch_legs", {
  id: varchar("id").primaryKey().notNull(),
  loadId: varchar("load_id").references(() => loads.id).notNull(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id).notNull(),
  driverId: varchar("driver_id").references(() => drivers.id),
  truckId: varchar("truck_id").references(() => trucks.id),
  trailerId: varchar("trailer_id"),
  chassisId: varchar("chassis_id"),
  actionType: varchar("action_type").notNull(), // pickup, dropoff, move, return
  location: text("location").notNull(),
  eta: timestamp("eta"),
  etd: timestamp("etd"),
  actualArrival: timestamp("actual_arrival"),
  actualDeparture: timestamp("actual_departure"),
  completed: boolean("completed").default(false),
  legOrder: integer("leg_order").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Load assignments table for driver scheduling and multi-driver coordination
export const loadAssignments = pgTable("load_assignments", {
  id: varchar("id").primaryKey().notNull(),
  loadId: varchar("load_id").references(() => loads.id).notNull(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id).notNull(),
  driverId: varchar("driver_id").references(() => drivers.id).notNull(),
  truckId: varchar("truck_id").references(() => trucks.id),
  trailerId: varchar("trailer_id"),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  assignmentNotes: text("assignment_notes"),
  status: varchar("status").default("assigned"), // assigned, active, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Load Billing - Comprehensive billing management for loads
export const loadBilling = pgTable("load_billing", {
  id: uuid("id").primaryKey().defaultRandom(),
  loadId: varchar("load_id").references(() => loads.id).notNull(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id).notNull(),

  // Base Rate Information
  baseRate: decimal("base_rate", { precision: 10, scale: 2 }).notNull(),
  rateType: varchar("rate_type").default("flat"), // flat, per_mile, percentage
  ratePerMile: decimal("rate_per_mile", { precision: 8, scale: 2 }),
  totalMiles: integer("total_miles"),

  // Billing Status
  billingStatus: varchar("billing_status").default("pending"), // pending, invoiced, paid, disputed
  invoiceNumber: varchar("invoice_number"),
  invoiceDate: timestamp("invoice_date"),
  dueDate: timestamp("due_date"),
  paidDate: timestamp("paid_date"),

  // Customer Information
  customerName: varchar("customer_name").notNull(),
  customerAddress: text("customer_address"),
  customerTerms: varchar("customer_terms").default("NET30"), // NET15, NET30, NET45, COD

  // Totals (calculated fields)
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).default("0"),
  totalAccessorials: decimal("total_accessorials", { precision: 10, scale: 2 }).default("0"),
  totalExpenses: decimal("total_expenses", { precision: 10, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).default("0"),

  // Payment Information
  paymentMethod: varchar("payment_method"), // check, ach, wire, factoring
  factorCompany: varchar("factor_company"),
  factorRate: decimal("factor_rate", { precision: 5, scale: 2 }),

  // Notes and Documentation
  billingNotes: text("billing_notes"),
  internalNotes: text("internal_notes"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
  lastModifiedBy: varchar("last_modified_by").references(() => users.id),
});

// Load Accessorials - Additional charges for special services
export const loadAccessorials = pgTable("load_accessorials", {
  id: uuid("id").primaryKey().defaultRandom(),
  loadId: varchar("load_id").references(() => loads.id).notNull(),
  billingId: uuid("billing_id").references(() => loadBilling.id).notNull(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id).notNull(),

  // Accessorial Details
  type: varchar("type").notNull(), // detention, layover, fuel_surcharge, lumper, tarp, oversize_permit, etc.
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 8, scale: 2 }).notNull(),
  quantity: decimal("quantity", { precision: 8, scale: 2 }).default("1"),
  rate: decimal("rate", { precision: 8, scale: 2 }),

  // Billing Information
  isBillable: boolean("is_billable").default(true),
  customerApproved: boolean("customer_approved").default(false),
  approvalDate: timestamp("approval_date"),
  approvedBy: varchar("approved_by"),

  // Documentation
  documentation: jsonb("documentation"), // Photos, receipts, etc.
  notes: text("notes"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
});

// Load Expenses - Driver and operational expenses
export const loadExpenses = pgTable("load_expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  loadId: varchar("load_id").references(() => loads.id).notNull(),
  billingId: uuid("billing_id").references(() => loadBilling.id).notNull(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id).notNull(),

  // Expense Details
  category: varchar("category").notNull(), // fuel, tolls, permits, repairs, driver_pay, lumper, parking, etc.
  subcategory: varchar("subcategory"), // For detailed categorization
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 8, scale: 2 }).notNull(),

  // Driver/Truck Information
  driverId: varchar("driver_id").references(() => drivers.id),
  truckId: varchar("truck_id").references(() => trucks.id),

  // Receipt Information
  receiptNumber: varchar("receipt_number"),
  receiptDate: timestamp("receipt_date"),
  vendor: varchar("vendor"),
  location: varchar("location"),

  // Reimbursement Status
  reimbursementStatus: varchar("reimbursement_status").default("pending"), // pending, approved, paid, denied
  reimbursementDate: timestamp("reimbursement_date"),
  reimbursementMethod: varchar("reimbursement_method"), // payroll, advance, comcheck

  // Tax Information
  isTaxDeductible: boolean("is_tax_deductible").default(true),
  taxCategory: varchar("tax_category"),

  // Documentation
  documentation: jsonb("documentation"), // Receipt images, etc.
  notes: text("notes"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
  submittedBy: varchar("submitted_by").references(() => users.id),
});

// Invoices table for accounting module - matches database exactly
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id).notNull(),
  invoiceNumber: varchar("invoice_number").notNull(),
  loadId: integer("load_id"),
  customerId: integer("customer_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").default("pending"),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),
  paidDate: date("paid_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bills table for accounting module - matches database structure exactly
export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id).notNull(),
  billNumber: varchar("bill_number").notNull(),
  vendorId: integer("vendor_id"),
  billDate: date("bill_date").notNull(),
  dueDate: date("due_date").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0"),
  remainingBalance: decimal("remaining_balance", { precision: 10, scale: 2 }).default("0"),
  status: varchar("status").default("pending"), // pending, paid, overdue, cancelled
  vendorInvoiceNumber: varchar("vendor_invoice_number"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subscription Management Tables for Revenue Generation
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id).notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id").notNull(),
  stripeCustomerId: varchar("stripe_customer_id").notNull(),
  planId: varchar("plan_id").notNull(), // starter, pro
  planName: varchar("plan_name").notNull(),
  status: varchar("status").default("active"), // active, cancelled, past_due, unpaid
  billingCycle: varchar("billing_cycle").default("monthly"), // monthly, yearly
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  canceledAt: timestamp("canceled_at"),
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const subscriptionAddons = pgTable("subscription_addons", {
  id: uuid("id").primaryKey().defaultRandom(),
  subscriptionId: uuid("subscription_id").references(() => subscriptions.id).notNull(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id).notNull(),
  addonId: varchar("addon_id").notNull(), // ai_bundle, container_management, etc.
  addonName: varchar("addon_name").notNull(),
  price: decimal("price", { precision: 8, scale: 2 }).notNull(),
  status: varchar("status").default("active"),
  addedAt: timestamp("added_at").defaultNow(),
  removedAt: timestamp("removed_at"),
});

// Relations
export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  drivers: many(drivers),
  trucks: many(trucks),
  loads: many(loads),
}));

export const usersRelations = relations(users, ({ one }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
}));

export const driversRelations = relations(drivers, ({ one, many }) => ({
  company: one(companies, {
    fields: [drivers.companyId],
    references: [companies.id],
  }),
  // Relations will be added when needed
}));

export const trucksRelations = relations(trucks, ({ one }) => ({
  company: one(companies, {
    fields: [trucks.companyId],
    references: [companies.id],
  }),
}));

export const loadsRelations = relations(loads, ({ one, many }) => ({
  company: one(companies, {
    fields: [loads.companyId],
    references: [companies.id],
  }),
  // Relations will be added when needed
  billing: one(loadBilling, {
    fields: [loads.id],
    references: [loadBilling.loadId],
  }),
  accessorials: many(loadAccessorials),
  expenses: many(loadExpenses),
}));

export const loadBillingRelations = relations(loadBilling, ({ one, many }) => ({
  load: one(loads, {
    fields: [loadBilling.loadId],
    references: [loads.id],
  }),
  company: one(companies, {
    fields: [loadBilling.companyId],
    references: [companies.id],
  }),
  accessorials: many(loadAccessorials),
  expenses: many(loadExpenses),
  // User relations commented out until fields are added to schema
  // createdByUser: one(users, {
  //   fields: [loadBilling.createdBy],
  //   references: [users.id],
  // }),
  // lastModifiedByUser: one(users, {
  //   fields: [loadBilling.lastModifiedBy],
  //   references: [users.id],
  // }),
}));

export const loadAccessorialsRelations = relations(loadAccessorials, ({ one }) => ({
  load: one(loads, {
    fields: [loadAccessorials.loadId],
    references: [loads.id],
  }),
  billing: one(loadBilling, {
    fields: [loadAccessorials.billingId],
    references: [loadBilling.id],
  }),
  company: one(companies, {
    fields: [loadAccessorials.companyId],
    references: [companies.id],
  }),
  // createdByUser: one(users, {
  //   fields: [loadAccessorials.createdBy],
  //   references: [users.id],
  // }),
}));

export const loadExpensesRelations = relations(loadExpenses, ({ one }) => ({
  load: one(loads, {
    fields: [loadExpenses.loadId],
    references: [loads.id],
  }),
  billing: one(loadBilling, {
    fields: [loadExpenses.billingId],
    references: [loadBilling.id],
  }),
  company: one(companies, {
    fields: [loadExpenses.companyId],
    references: [companies.id],
  }),
  // driver: one(drivers, {
  //   fields: [loadExpenses.driverId],
  //   references: [drivers.id],
  // }),
  truck: one(trucks, {
    fields: [loadExpenses.truckId],
    references: [trucks.id],
  }),
  createdByUser: one(users, {
    fields: [loadExpenses.createdBy],
    references: [users.id],
  }),
  submittedByUser: one(users, {
    fields: [loadExpenses.submittedBy],
    references: [users.id],
  }),
}));

// Types
export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = typeof drivers.$inferInsert;

export type Truck = typeof trucks.$inferSelect;
export type InsertTruck = typeof trucks.$inferInsert;

export type Load = typeof loads.$inferSelect;
export type InsertLoad = typeof loads.$inferInsert;

export type DispatchLeg = typeof dispatchLegs.$inferSelect;
export type InsertDispatchLeg = typeof dispatchLegs.$inferInsert;

export type LoadAssignment = typeof loadAssignments.$inferSelect;
export type InsertLoadAssignment = typeof loadAssignments.$inferInsert;

export type LoadBilling = typeof loadBilling.$inferSelect;
export type InsertLoadBilling = typeof loadBilling.$inferInsert;

export type LoadAccessorial = typeof loadAccessorials.$inferSelect;
export type InsertLoadAccessorial = typeof loadAccessorials.$inferInsert;

export type LoadExpense = typeof loadExpenses.$inferSelect;
export type InsertLoadExpense = typeof loadExpenses.$inferInsert;

// Zod schemas
export const insertCompanySchema = createInsertSchema(companies);
export const insertUserSchema = createInsertSchema(users);
export const insertDriverSchema = createInsertSchema(drivers);
export const insertTruckSchema = createInsertSchema(trucks);
export const insertLoadSchema = createInsertSchema(loads);
export const insertDispatchLegSchema = createInsertSchema(dispatchLegs);
export const insertLoadAssignmentSchema = createInsertSchema(loadAssignments);
export const insertLoadBillingSchema = createInsertSchema(loadBilling);
export const insertLoadAccessorialSchema = createInsertSchema(loadAccessorials);
export const insertLoadExpenseSchema = createInsertSchema(loadExpenses);

// Equipment types removed - using trucks table for fleet management

// HQ Management Tables

// HQ Tenants - Master list of all tenant companies for HQ management
export const hqTenants = pgTable("hq_tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id).notNull().unique(),

  // Subscription Information
  subscriptionTier: varchar("subscription_tier").notNull(), // starter, professional, enterprise
  subscriptionStatus: varchar("subscription_status").default("active"), // active, suspended, cancelled, trial
  subscriptionStartDate: timestamp("subscription_start_date").defaultNow(),
  subscriptionEndDate: timestamp("subscription_end_date"),
  monthlyRevenue: decimal("monthly_revenue", { precision: 10, scale: 2 }).default("0"),

  // Usage Metrics
  activeUsers: integer("active_users").default(0),
  totalDrivers: integer("total_drivers").default(0),
  totalVehicles: integer("total_vehicles").default(0),
  totalLoads: integer("total_loads").default(0),
  monthlyLoads: integer("monthly_loads").default(0),

  // Banking & Financial Status
  bankingStatus: varchar("banking_status").default("pending"), // pending, approved, active, suspended
  stripeCustomerId: varchar("stripe_customer_id"),
  railsrAccountId: varchar("railsr_account_id"),
  lastPaymentDate: timestamp("last_payment_date"),
  nextBillingDate: timestamp("next_billing_date"),
  accountCount: integer("account_count").default(0),
  cardCount: integer("card_count").default(0),
  totalBalance: decimal("total_balance", { precision: 12, scale: 2 }).default("0.00"),

  // Support & Health
  supportTickets: integer("support_tickets").default(0),
  lastLoginDate: timestamp("last_login_date"),
  healthScore: integer("health_score").default(100), // 0-100 based on usage, payments, support

  // Container Service Add-on
  hasContainerService: boolean("has_container_service").default(false),
  containerServiceRevenue: decimal("container_service_revenue", { precision: 8, scale: 2 }).default("0"),

  // Notes and Management
  accountManagerNotes: text("account_manager_notes"),
  riskLevel: varchar("risk_level").default("low"), // low, medium, high, critical

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// HR MANAGEMENT SYSTEM - Complete Employee, Payroll, Benefits, and Tax Management

// Employees - Complete employee records with HR data
export const employees = pgTable("employees", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id).notNull(),
  employeeId: varchar("employee_id").notNull(), // Company-specific employee number

  // Personal Information
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  middleName: varchar("middle_name"),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  ssn: varchar("ssn").notNull(), // Encrypted

  // Address Information
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  zipCode: varchar("zip_code").notNull(),

  // Employment Information
  hireDate: date("hire_date").notNull(),
  terminationDate: date("termination_date"),
  department: varchar("department").notNull(),
  position: varchar("position").notNull(),
  employmentType: varchar("employment_type").notNull(), // full_time, part_time, contractor, intern
  workLocation: varchar("work_location").default("office"), // office, remote, hybrid, field
  status: varchar("status").default("active"), // active, inactive, on_leave, terminated
  reportsTo: uuid("reports_to").references(() => employees.id),

  // Payroll Information
  payType: varchar("pay_type").notNull(), // hourly, salary, commission
  payRate: decimal("pay_rate", { precision: 10, scale: 2 }).notNull(),
  payFrequency: varchar("pay_frequency").default("bi_weekly"), // weekly, bi_weekly, semi_monthly, monthly
  overtimeEligible: boolean("overtime_eligible").default(true),
  payGroup: varchar("pay_group").default("standard"),

  // Tax Information
  federalFilingStatus: varchar("federal_filing_status").notNull(), // single, married_joint, married_separate, head_of_household
  federalExemptions: integer("federal_exemptions").default(0),
  stateFilingStatus: varchar("state_filing_status"),
  stateExemptions: integer("state_exemptions").default(0),
  additionalFederalWithholding: decimal("additional_federal_withholding", { precision: 8, scale: 2 }).default("0"),
  additionalStateWithholding: decimal("additional_state_withholding", { precision: 8, scale: 2 }).default("0"),

  // Emergency Contact
  emergencyContactName: varchar("emergency_contact_name").notNull(),
  emergencyContactRelationship: varchar("emergency_contact_relationship").notNull(),
  emergencyContactPhone: varchar("emergency_contact_phone").notNull(),
  emergencyContactEmail: varchar("emergency_contact_email"),

  // System Information
  gustoEmployeeId: varchar("gusto_employee_id"), // Integration with Gusto
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // createdBy: varchar("created_by").references(() => users.id), // Commented out - doesn't exist in database
});

// Employee Benefits - Benefits enrollment and management
export const employeeBenefits = pgTable("employee_benefits", {
  id: uuid("id").primaryKey().defaultRandom(),
  employeeId: uuid("employee_id").references(() => employees.id).notNull(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id).notNull(),

  // Health Insurance
  healthInsuranceEnrolled: boolean("health_insurance_enrolled").default(false),
  healthInsurancePlan: varchar("health_insurance_plan"),
  healthInsurancePremium: decimal("health_insurance_premium", { precision: 8, scale: 2 }).default("0"),
  healthInsuranceEmployeeContribution: decimal("health_insurance_employee_contribution", { precision: 8, scale: 2 }).default("0"),
  healthInsuranceEffectiveDate: date("health_insurance_effective_date"),

  // Dental Insurance
  dentalInsuranceEnrolled: boolean("dental_insurance_enrolled").default(false),
  dentalInsurancePlan: varchar("dental_insurance_plan"),
  dentalInsurancePremium: decimal("dental_insurance_premium", { precision: 8, scale: 2 }).default("0"),
  dentalInsuranceEmployeeContribution: decimal("dental_insurance_employee_contribution", { precision: 8, scale: 2 }).default("0"),

  // Vision Insurance
  visionInsuranceEnrolled: boolean("vision_insurance_enrolled").default(false),
  visionInsurancePlan: varchar("vision_insurance_plan"),
  visionInsurancePremium: decimal("vision_insurance_premium", { precision: 8, scale: 2 }).default("0"),
  visionInsuranceEmployeeContribution: decimal("vision_insurance_employee_contribution", { precision: 8, scale: 2 }).default("0"),

  // Retirement Benefits
  retirement401kEnrolled: boolean("retirement_401k_enrolled").default(false),
  retirement401kContributionPercent: decimal("retirement_401k_contribution_percent", { precision: 5, scale: 2 }).default("0"),
  retirement401kContributionAmount: decimal("retirement_401k_contribution_amount", { precision: 8, scale: 2 }).default("0"),
  companyMatchPercent: decimal("company_match_percent", { precision: 5, scale: 2 }).default("0"),
  companyMatchAmount: decimal("company_match_amount", { precision: 8, scale: 2 }).default("0"),
  vestingSchedule: varchar("vesting_schedule"),

  // PTO and Leave
  ptoAccrualRate: decimal("pto_accrual_rate", { precision: 5, scale: 2 }).default("0"), // Hours per pay period
  ptoBalance: decimal("pto_balance", { precision: 6, scale: 2 }).default("0"),
  ptoMaxAccrual: decimal("pto_max_accrual", { precision: 6, scale: 2 }).default("0"),
  sickLeaveBalance: decimal("sick_leave_balance", { precision: 6, scale: 2 }).default("0"),
  personalDaysBalance: integer("personal_days_balance").default(0),

  // Other Benefits
  lifeInsuranceAmount: decimal("life_insurance_amount", { precision: 10, scale: 2 }).default("0"),
  disabilityInsuranceEnrolled: boolean("disability_insurance_enrolled").default(false),

  // Benefit Year
  benefitYearStart: date("benefit_year_start"),
  benefitYearEnd: date("benefit_year_end"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Company Benefits Configuration - What benefits each company offers
export const companyBenefitsConfig = pgTable("company_benefits_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id).notNull().unique(),

  // Gusto Integration
  gustoCompanyId: varchar("gusto_company_id"),
  gustoApiConnected: boolean("gusto_api_connected").default(false),
  lastGustoSync: timestamp("last_gusto_sync"),

  // Health Insurance Plans
  healthInsuranceEnabled: boolean("health_insurance_enabled").default(false),
  healthInsurancePlans: jsonb("health_insurance_plans").default([]), // Array of plan objects
  healthInsuranceCarrier: varchar("health_insurance_carrier"),
  healthInsuranceEmployerContribution: decimal("health_insurance_employer_contribution", { precision: 5, scale: 2 }).default("50"), // Percentage

  // Dental Insurance
  dentalInsuranceEnabled: boolean("dental_insurance_enabled").default(false),
  dentalInsurancePlans: jsonb("dental_insurance_plans").default([]),
  dentalInsuranceCarrier: varchar("dental_insurance_carrier"),
  dentalInsuranceEmployerContribution: decimal("dental_insurance_employer_contribution", { precision: 5, scale: 2 }).default("50"),

  // Vision Insurance
  visionInsuranceEnabled: boolean("vision_insurance_enabled").default(false),
  visionInsurancePlans: jsonb("vision_insurance_plans").default([]),
  visionInsuranceCarrier: varchar("vision_insurance_carrier"),
  visionInsuranceEmployerContribution: decimal("vision_insurance_employer_contribution", { precision: 5, scale: 2 }).default("50"),

  // 401(k) Retirement Plan
  retirement401kEnabled: boolean("retirement_401k_enabled").default(false),
  retirement401kProvider: varchar("retirement_401k_provider"),
  retirement401kMaxEmployerMatch: decimal("retirement_401k_max_employer_match", { precision: 5, scale: 2 }).default("3"), // Percentage
  retirement401kVestingSchedule: varchar("retirement_401k_vesting_schedule").default("immediate"), // immediate, graded, cliff
  retirement401kEligibilityMonths: integer("retirement_401k_eligibility_months").default(3),

  // Life Insurance
  lifeInsuranceEnabled: boolean("life_insurance_enabled").default(false),
  lifeInsuranceAmount: decimal("life_insurance_amount", { precision: 10, scale: 2 }).default("50000"),
  lifeInsuranceEmployerPaid: boolean("life_insurance_employer_paid").default(true),

  // Disability Insurance
  disabilityInsuranceEnabled: boolean("disability_insurance_enabled").default(false),
  shortTermDisabilityEnabled: boolean("short_term_disability_enabled").default(false),
  longTermDisabilityEnabled: boolean("long_term_disability_enabled").default(false),

  // PTO Policies
  ptoPolicy: varchar("pto_policy").default("accrual"), // accrual, bank, unlimited
  ptoAccrualRate: decimal("pto_accrual_rate", { precision: 5, scale: 2 }).default("4.62"), // Hours per pay period (120 hours/year)
  ptoMaxAccrual: decimal("pto_max_accrual", { precision: 6, scale: 2 }).default("240"), // Max hours
  ptoCarryoverAllowed: boolean("pto_carryover_allowed").default(true),
  ptoCarryoverMax: decimal("pto_carryover_max", { precision: 6, scale: 2 }).default("40"),

  // Sick Leave
  sickLeavePolicy: varchar("sick_leave_policy").default("accrual"),
  sickLeaveAccrualRate: decimal("sick_leave_accrual_rate", { precision: 5, scale: 2 }).default("3.08"), // 80 hours/year
  sickLeaveMaxAccrual: decimal("sick_leave_max_accrual", { precision: 6, scale: 2 }).default("80"),

  // Holiday Schedule
  holidaySchedule: jsonb("holiday_schedule").default([]), // Array of holiday objects
  personalDaysPerYear: integer("personal_days_per_year").default(2),

  // Other Benefits
  fsaEnabled: boolean("fsa_enabled").default(false), // Flexible Spending Account
  hsaEnabled: boolean("hsa_enabled").default(false), // Health Savings Account
  commutingBenefitsEnabled: boolean("commuting_benefits_enabled").default(false),
  wellnessProgramEnabled: boolean("wellness_program_enabled").default(false),

  // Open Enrollment
  openEnrollmentStart: date("open_enrollment_start"),
  openEnrollmentEnd: date("open_enrollment_end"),
  benefitYearStart: date("benefit_year_start"),
  benefitYearEnd: date("benefit_year_end"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Benefits Enrollment Events - Track when employees enroll/change benefits
export const benefitsEnrollmentEvents = pgTable("benefits_enrollment_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  employeeId: uuid("employee_id").references(() => employees.id).notNull(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id).notNull(),

  // Event Information
  eventType: varchar("event_type").notNull(), // enrollment, change, termination, life_event
  eventDate: date("event_date").notNull(),
  effectiveDate: date("effective_date").notNull(),
  reason: varchar("reason"), // new_hire, open_enrollment, life_event, termination
  lifeEventType: varchar("life_event_type"), // marriage, birth, adoption, divorce, death

  // Previous Benefits (for changes)
  previousBenefits: jsonb("previous_benefits"),

  // New Benefits
  newBenefits: jsonb("new_benefits").notNull(),

  // Processing Status
  status: varchar("status").default("pending"), // pending, approved, processed, rejected
  processedBy: varchar("processed_by").references(() => users.id),
  processedAt: timestamp("processed_at"),

  // Gusto Integration
  gustoEnrollmentId: varchar("gusto_enrollment_id"),
  syncedToGusto: boolean("synced_to_gusto").default(false),
  gustoSyncDate: timestamp("gusto_sync_date"),

  // Notes
  notes: text("notes"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payroll Runs - Individual payroll processing runs
export const payrollRuns = pgTable("payroll_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id).notNull(),

  // Payroll Run Information
  payrollDate: date("payroll_date").notNull(),
  payPeriodStart: date("pay_period_start").notNull(),
  payPeriodEnd: date("pay_period_end").notNull(),
  checkDate: date("check_date").notNull(),
  payrollType: varchar("payroll_type").default("regular"), // regular, bonus, correction

  // Status and Processing
  status: varchar("status").default("draft"), // draft, processing, approved, submitted, paid, cancelled
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  submittedAt: timestamp("submitted_at"),
  paidAt: timestamp("paid_at"),

  // Totals
  totalGrossPay: decimal("total_gross_pay", { precision: 12, scale: 2 }).default("0"),
  totalNetPay: decimal("total_net_pay", { precision: 12, scale: 2 }).default("0"),
  totalTaxes: decimal("total_taxes", { precision: 10, scale: 2 }).default("0"),
  totalDeductions: decimal("total_deductions", { precision: 10, scale: 2 }).default("0"),
  totalEmployerTaxes: decimal("total_employer_taxes", { precision: 10, scale: 2 }).default("0"),
  employeeCount: integer("employee_count").default(0),

  // Integration
  gustoPayrollId: varchar("gusto_payroll_id"),

  // Notes
  notes: text("notes"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
});

// Driver Payroll Entries - Links drivers to payroll for accounting integration
export const driverPayrollEntries = pgTable("driver_payroll_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  driverId: varchar("driver_id").references(() => drivers.id).notNull(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id).notNull(),
  payrollRunId: uuid("payroll_run_id").references(() => payrollRuns.id).notNull(),

  // Pay Calculation Data
  hoursWorked: decimal("hours_worked", { precision: 6, scale: 2 }).default("0"),
  milesDriven: decimal("miles_driven", { precision: 10, scale: 2 }).default("0"),
  payRate: decimal("pay_rate", { precision: 10, scale: 2 }).notNull(),
  payType: varchar("pay_type").notNull(), // 'hourly' | 'mile'

  // Calculated Pay
  grossPay: decimal("gross_pay", { precision: 10, scale: 2 }).notNull(),
  netPay: decimal("net_pay", { precision: 10, scale: 2 }).notNull(),

  // Load-based earnings
  loadBasedEarnings: decimal("load_based_earnings", { precision: 10, scale: 2 }).default("0"),
  bonusEarnings: decimal("bonus_earnings", { precision: 10, scale: 2 }).default("0"),

  // Reimbursements and deductions
  reimbursements: decimal("reimbursements", { precision: 8, scale: 2 }).default("0"),
  deductions: decimal("deductions", { precision: 8, scale: 2 }).default("0"),

  // Integration tracking
  gustoEmployeeCompensationId: varchar("gusto_employee_compensation_id"),

  // Notes
  notes: text("notes"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Employee Paystubs - Individual employee paystub records
export const employeePaystubs = pgTable("employee_paystubs", {
  id: uuid("id").primaryKey().defaultRandom(),
  payrollRunId: uuid("payroll_run_id").references(() => payrollRuns.id).notNull(),
  employeeId: uuid("employee_id").references(() => employees.id).notNull(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id).notNull(),

  // Pay Period Information
  payPeriodStart: date("pay_period_start").notNull(),
  payPeriodEnd: date("pay_period_end").notNull(),
  payDate: date("pay_date").notNull(),

  // Hours and Earnings
  regularHours: decimal("regular_hours", { precision: 6, scale: 2 }).default("0"),
  overtimeHours: decimal("overtime_hours", { precision: 6, scale: 2 }).default("0"),
  doubleTimeHours: decimal("double_time_hours", { precision: 6, scale: 2 }).default("0"),
  holidayHours: decimal("holiday_hours", { precision: 6, scale: 2 }).default("0"),
  sickHours: decimal("sick_hours", { precision: 6, scale: 2 }).default("0"),
  vacationHours: decimal("vacation_hours", { precision: 6, scale: 2 }).default("0"),

  // Gross Pay Breakdown
  regularPay: decimal("regular_pay", { precision: 10, scale: 2 }).default("0"),
  overtimePay: decimal("overtime_pay", { precision: 10, scale: 2 }).default("0"),
  doubleTimePay: decimal("double_time_pay", { precision: 10, scale: 2 }).default("0"),
  holidayPay: decimal("holiday_pay", { precision: 10, scale: 2 }).default("0"),
  bonusPay: decimal("bonus_pay", { precision: 10, scale: 2 }).default("0"),
  commissionPay: decimal("commission_pay", { precision: 10, scale: 2 }).default("0"),
  reimbursements: decimal("reimbursements", { precision: 8, scale: 2 }).default("0"),
  grossPay: decimal("gross_pay", { precision: 10, scale: 2 }).notNull(),

  // Tax Withholdings
  federalIncomeTax: decimal("federal_income_tax", { precision: 8, scale: 2 }).default("0"),
  stateIncomeTax: decimal("state_income_tax", { precision: 8, scale: 2 }).default("0"),
  socialSecurityTax: decimal("social_security_tax", { precision: 8, scale: 2 }).default("0"),
  medicareTax: decimal("medicare_tax", { precision: 8, scale: 2 }).default("0"),
  suiTax: decimal("sui_tax", { precision: 8, scale: 2 }).default("0"),
  localTax: decimal("local_tax", { precision: 8, scale: 2 }).default("0"),

  // Pre-tax Deductions
  healthInsuranceDeduction: decimal("health_insurance_deduction", { precision: 8, scale: 2 }).default("0"),
  dentalInsuranceDeduction: decimal("dental_insurance_deduction", { precision: 8, scale: 2 }).default("0"),
  visionInsuranceDeduction: decimal("vision_insurance_deduction", { precision: 8, scale: 2 }).default("0"),
  retirement401kDeduction: decimal("retirement_401k_deduction", { precision: 8, scale: 2 }).default("0"),

  // Post-tax Deductions
  garnishments: decimal("garnishments", { precision: 8, scale: 2 }).default("0"),
  unionDues: decimal("union_dues", { precision: 8, scale: 2 }).default("0"),
  otherDeductions: decimal("other_deductions", { precision: 8, scale: 2 }).default("0"),

  // Totals
  totalTaxes: decimal("total_taxes", { precision: 8, scale: 2 }).default("0"),
  totalDeductions: decimal("total_deductions", { precision: 8, scale: 2 }).default("0"),
  netPay: decimal("net_pay", { precision: 10, scale: 2 }).notNull(),

  // Year-to-Date Totals
  ytdGrossPay: decimal("ytd_gross_pay", { precision: 12, scale: 2 }).default("0"),
  ytdNetPay: decimal("ytd_net_pay", { precision: 12, scale: 2 }).default("0"),
  ytdFederalIncomeTax: decimal("ytd_federal_income_tax", { precision: 10, scale: 2 }).default("0"),
  ytdStateIncomeTax: decimal("ytd_state_income_tax", { precision: 10, scale: 2 }).default("0"),
  ytdSocialSecurityTax: decimal("ytd_social_security_tax", { precision: 10, scale: 2 }).default("0"),
  ytdMedicareTax: decimal("ytd_medicare_tax", { precision: 10, scale: 2 }).default("0"),

  // Integration
  gustoPaystubId: varchar("gusto_paystub_id"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Employee Time Tracking - Track work hours for payroll
export const employeeTimeEntries = pgTable("employee_time_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  employeeId: uuid("employee_id").references(() => employees.id).notNull(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id).notNull(),

  // Time Entry Details
  entryDate: date("entry_date").notNull(),
  clockInTime: timestamp("clock_in_time"),
  clockOutTime: timestamp("clock_out_time"),
  breakMinutes: integer("break_minutes").default(0),

  // Hours Breakdown
  regularHours: decimal("regular_hours", { precision: 6, scale: 2 }).default("0"),
  overtimeHours: decimal("overtime_hours", { precision: 6, scale: 2 }).default("0"),
  doubleTimeHours: decimal("double_time_hours", { precision: 6, scale: 2 }).default("0"),

  // Entry Type and Status
  entryType: varchar("entry_type").default("regular"), // regular, sick, vacation, holiday, personal
  status: varchar("status").default("pending"), // pending, approved, rejected
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),

  // Notes and Location
  notes: text("notes"),
  workLocation: varchar("work_location"),
  ipAddress: varchar("ip_address"),

  // Payroll Processing
  payrollRunId: uuid("payroll_run_id").references(() => payrollRuns.id),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Employee Leave Requests - PTO, sick leave, and other time off
export const employeeLeaveRequests = pgTable("employee_leave_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  employeeId: uuid("employee_id").references(() => employees.id).notNull(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id).notNull(),

  // Leave Request Details
  leaveType: varchar("leave_type").notNull(), // pto, sick, personal, maternity, paternity, jury_duty, bereavement
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  totalDays: decimal("total_days", { precision: 4, scale: 2 }).notNull(),
  totalHours: decimal("total_hours", { precision: 6, scale: 2 }).notNull(),

  // Status and Approval
  status: varchar("status").default("pending"), // pending, approved, denied, cancelled
  requestedAt: timestamp("requested_at").defaultNow(),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  approvalNotes: text("approval_notes"),

  // Request Details
  reason: text("reason"),
  isPartialDay: boolean("is_partial_day").default(false),

  // Balance Impact
  balanceUsed: decimal("balance_used", { precision: 6, scale: 2 }).default("0"),
  balanceRemaining: decimal("balance_remaining", { precision: 6, scale: 2 }),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Employee Documents - HR document management
export const employeeDocuments = pgTable("employee_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  employeeId: uuid("employee_id").references(() => employees.id).notNull(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id).notNull(),

  // Document Details
  documentName: varchar("document_name").notNull(),
  documentType: varchar("document_type").notNull(), // i9, w4, direct_deposit, handbook, contract, performance_review, disciplinary_action
  fileName: varchar("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type"),

  // Document Metadata
  uploadedBy: varchar("uploaded_by").references(() => users.id).notNull(),
  isRequired: boolean("is_required").default(false),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  expirationDate: date("expiration_date"),

  // Security and Access
  isConfidential: boolean("is_confidential").default(false),
  accessLevel: varchar("access_level").default("employee"), // employee, manager, hr_only, admin_only

  // E-signature
  requiresSignature: boolean("requires_signature").default(false),
  signedAt: timestamp("signed_at"),
  signedBy: varchar("signed_by"),
  signatureUrl: text("signature_url"),

  // Integration
  docusealDocumentId: varchar("docuseal_document_id"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tax Forms and Compliance - W2s, 1099s, and other tax documents
export const employeeTaxForms = pgTable("employee_tax_forms", {
  id: uuid("id").primaryKey().defaultRandom(),
  employeeId: uuid("employee_id").references(() => employees.id).notNull(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id).notNull(),

  // Form Information
  taxYear: integer("tax_year").notNull(),
  formType: varchar("form_type").notNull(), // w2, 1099_nec, 1099_misc, w4, state_w4

  // W-2 Information
  grossWages: decimal("gross_wages", { precision: 12, scale: 2 }),
  federalTaxWithheld: decimal("federal_tax_withheld", { precision: 10, scale: 2 }),
  socialSecurityWages: decimal("social_security_wages", { precision: 12, scale: 2 }),
  socialSecurityTaxWithheld: decimal("social_security_tax_withheld", { precision: 10, scale: 2 }),
  medicareWages: decimal("medicare_wages", { precision: 12, scale: 2 }),
  medicareTaxWithheld: decimal("medicare_tax_withheld", { precision: 10, scale: 2 }),
  stateTaxWithheld: decimal("state_tax_withheld", { precision: 10, scale: 2 }),

  // Filing Information
  isGenerated: boolean("is_generated").default(false),
  generatedAt: timestamp("generated_at"),
  isSubmitted: boolean("is_submitted").default(false),
  submittedAt: timestamp("submitted_at"),

  // Document Storage
  documentUrl: text("document_url"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});



// Duplicate HQ tables removed - using unified schema definitions below



// Removed duplicate HQ types and schemas - these are defined below after table definitions

// Alert Notifications System
export const alerts = pgTable("alerts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id),
  type: varchar("type", { length: 50 }).notNull(), // container_demurrage, chassis_return, driver_hours, maintenance, delivery_delay, system_maintenance, platform_outage, feature_announcement
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  severity: varchar("severity", { length: 20 }).notNull(), // low, medium, high, critical
  loadId: varchar("load_id", { length: 255 }).references(() => loads.id),
  driverId: varchar("driver_id", { length: 255 }).references(() => drivers.id),
  truckId: varchar("truck_id", { length: 255 }).references(() => trucks.id),
  containerId: varchar("container_id", { length: 255 }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isRead: boolean("is_read").default(false),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  actionRequired: boolean("action_required").default(false),
  actionUrl: varchar("action_url", { length: 500 }),
  isDismissed: boolean("is_dismissed").default(false),
  isSystemWide: boolean("is_system_wide").default(false), // HQ alerts for all tenants
  createdByHQ: boolean("created_by_hq").default(false),
  scheduledMaintenanceStart: timestamp("scheduled_maintenance_start"),
  scheduledMaintenanceEnd: timestamp("scheduled_maintenance_end"),
  affectedServices: text("affected_services"), // JSON array of affected service names
  acknowledgedAt: timestamp("acknowledged_at"),
});

export const alertsRelations = relations(alerts, ({ one }) => ({
  company: one(companies, {
    fields: [alerts.companyId],
    references: [companies.id],
  }),
  load: one(loads, {
    fields: [alerts.loadId],
    references: [loads.id],
  }),
  driver: one(drivers, {
    fields: [alerts.driverId],
    references: [drivers.id],
  }),
  truck: one(trucks, {
    fields: [alerts.truckId],
    references: [trucks.id],
  }),
}));

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;
export const insertAlertSchema = createInsertSchema(alerts);

// HR SYSTEM TYPE DEFINITIONS

// Employee Types
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;
export const insertEmployeeSchema = createInsertSchema(employees);

// Employee Benefits Types
export type EmployeeBenefits = typeof employeeBenefits.$inferSelect;
export type InsertEmployeeBenefits = typeof employeeBenefits.$inferInsert;

// Benefits Configuration Types
export type CompanyBenefitsConfig = typeof companyBenefitsConfig.$inferSelect;
export type InsertCompanyBenefitsConfig = typeof companyBenefitsConfig.$inferInsert;
export type BenefitsEnrollmentEvent = typeof benefitsEnrollmentEvents.$inferSelect;
export type InsertBenefitsEnrollmentEvent = typeof benefitsEnrollmentEvents.$inferInsert;
export const insertEmployeeBenefitsSchema = createInsertSchema(employeeBenefits);

// Payroll Run Types
export type PayrollRun = typeof payrollRuns.$inferSelect;
export type InsertPayrollRun = typeof payrollRuns.$inferInsert;
export const insertPayrollRunSchema = createInsertSchema(payrollRuns);

// Employee Paystub Types
export type EmployeePaystub = typeof employeePaystubs.$inferSelect;
export type InsertEmployeePaystub = typeof employeePaystubs.$inferInsert;
export const insertEmployeePaystubSchema = createInsertSchema(employeePaystubs);

// Employee Time Entry Types
export type EmployeeTimeEntry = typeof employeeTimeEntries.$inferSelect;
export type InsertEmployeeTimeEntry = typeof employeeTimeEntries.$inferInsert;
export const insertEmployeeTimeEntrySchema = createInsertSchema(employeeTimeEntries);

// Employee Leave Request Types
export type EmployeeLeaveRequest = typeof employeeLeaveRequests.$inferSelect;
export type InsertEmployeeLeaveRequest = typeof employeeLeaveRequests.$inferInsert;
export const insertEmployeeLeaveRequestSchema = createInsertSchema(employeeLeaveRequests);

// Employee Document Types
export type EmployeeDocument = typeof employeeDocuments.$inferSelect;
export type InsertEmployeeDocument = typeof employeeDocuments.$inferInsert;
export const insertEmployeeDocumentSchema = createInsertSchema(employeeDocuments);

// Employee Tax Form Types
export type EmployeeTaxForm = typeof employeeTaxForms.$inferSelect;
export type InsertEmployeeTaxForm = typeof employeeTaxForms.$inferInsert;
export const insertEmployeeTaxFormSchema = createInsertSchema(employeeTaxForms);

// Integration management tables
export const integrationConfigs = pgTable("integration_configs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  companyId: varchar("companyId", { length: 50 }).notNull(),
  service: varchar("service", { length: 255 }).notNull(),
  apiKey: text("apiKey"),
  enabled: boolean("enabled").default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow()
});

export const integrationConfigsRelations = relations(integrationConfigs, ({ one }) => ({
  company: one(companies, {
    fields: [integrationConfigs.companyId],
    references: [companies.id]
  })
}));

export type IntegrationConfig = typeof integrationConfigs.$inferSelect;
export type InsertIntegrationConfig = typeof integrationConfigs.$inferInsert;
export const insertIntegrationConfigSchema = createInsertSchema(integrationConfigs);

// HR SYSTEM RELATIONS

// Employee Relations
export const employeesRelations = relations(employees, ({ one, many }) => ({
  company: one(companies, {
    fields: [employees.companyId],
    references: [companies.id],
  }),
  reportsTo: one(employees, {
    fields: [employees.reportsTo],
    references: [employees.id],
  }),
  directReports: many(employees),
  benefits: one(employeeBenefits),
  paystubs: many(employeePaystubs),
  timeEntries: many(employeeTimeEntries),
  leaveRequests: many(employeeLeaveRequests),
  documents: many(employeeDocuments),
  taxForms: many(employeeTaxForms),
}));

// Employee Benefits Relations
export const employeeBenefitsRelations = relations(employeeBenefits, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeBenefits.employeeId],
    references: [employees.id],
  }),
  company: one(companies, {
    fields: [employeeBenefits.companyId],
    references: [companies.id],
  }),
}));

// Payroll Run Relations
export const payrollRunsRelations = relations(payrollRuns, ({ one, many }) => ({
  company: one(companies, {
    fields: [payrollRuns.companyId],
    references: [companies.id],
  }),
  paystubs: many(employeePaystubs),
}));

// Employee Paystub Relations
export const employeePaystubsRelations = relations(employeePaystubs, ({ one }) => ({
  payrollRun: one(payrollRuns, {
    fields: [employeePaystubs.payrollRunId],
    references: [payrollRuns.id],
  }),
  employee: one(employees, {
    fields: [employeePaystubs.employeeId],
    references: [employees.id],
  }),
  company: one(companies, {
    fields: [employeePaystubs.companyId],
    references: [companies.id],
  }),
}));

// Employee Time Entry Relations
export const employeeTimeEntriesRelations = relations(employeeTimeEntries, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeTimeEntries.employeeId],
    references: [employees.id],
  }),
  company: one(companies, {
    fields: [employeeTimeEntries.companyId],
    references: [companies.id],
  }),
  payrollRun: one(payrollRuns, {
    fields: [employeeTimeEntries.payrollRunId],
    references: [payrollRuns.id],
  }),
}));

// Employee Leave Request Relations
export const employeeLeaveRequestsRelations = relations(employeeLeaveRequests, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeLeaveRequests.employeeId],
    references: [employees.id],
  }),
  company: one(companies, {
    fields: [employeeLeaveRequests.companyId],
    references: [companies.id],
  }),
}));

// Employee Document Relations
export const employeeDocumentsRelations = relations(employeeDocuments, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeDocuments.employeeId],
    references: [employees.id],
  }),
  company: one(companies, {
    fields: [employeeDocuments.companyId],
    references: [companies.id],
  }),
}));

// Employee Tax Form Relations
export const employeeTaxFormsRelations = relations(employeeTaxForms, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeTaxForms.employeeId],
    references: [employees.id],
  }),
  company: one(companies, {
    fields: [employeeTaxForms.companyId],
    references: [companies.id],
  }),
}));

// Audit Logs for Admin Actions
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action").notNull(), // 'login', 'create_tenant', 'modify_billing', etc.
  resource: varchar("resource"), // 'tenant', 'user', 'billing', etc.
  resourceId: varchar("resource_id"), // ID of the affected resource
  details: jsonb("details"), // Additional context about the action
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id),
});

// Audit Log Types and Schema
export type AuditLog = typeof auditLogs.$inferSelect;
export const insertAuditLogSchema = createInsertSchema(auditLogs);
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// ========== REAL-TIME COLLABORATION SYSTEM ==========

// Collaboration Sessions - track active collaboration sessions
export const collaborationSessions = pgTable("collaboration_sessions", {
  id: varchar("id").primaryKey(),
  resourceType: varchar("resource_type").notNull(), // 'tenant', 'support_ticket', 'company'
  resourceId: varchar("resource_id").notNull(), // ID of the resource being collaborated on
  sessionName: varchar("session_name").notNull(), // e.g., "FreightOps LLC - Support Review"
  hostUserId: varchar("host_user_id").references(() => users.id).notNull(),
  status: varchar("status").default("active"), // 'active', 'ended', 'paused'
  participantCount: integer("participant_count").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  endedAt: timestamp("ended_at"),
});

// Collaboration Participants - track who's in each session
export const collaborationParticipants = pgTable("collaboration_participants", {
  id: varchar("id").primaryKey(),
  sessionId: varchar("session_id").references(() => collaborationSessions.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  role: varchar("role").default("participant"), // 'host', 'participant', 'observer'
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
  isActive: boolean("is_active").default(true),
  permissions: jsonb("permissions").default({}), // What they can do in the session
});

// Real-time Annotations - annotations placed on UI elements
export const realTimeAnnotations = pgTable("real_time_annotations", {
  id: varchar("id").primaryKey(),
  sessionId: varchar("session_id").references(() => collaborationSessions.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  annotationType: varchar("annotation_type").notNull(), // 'highlight', 'comment', 'arrow', 'circle', 'text'
  targetElement: varchar("target_element").notNull(), // CSS selector or element ID
  position: jsonb("position").notNull(), // {x, y, width, height} for positioning
  content: text("content"), // Comment text or annotation content
  color: varchar("color").default("#FF6B6B"), // Annotation color
  style: jsonb("style").default({}), // Additional styling properties
  isVisible: boolean("is_visible").default(true),
  isResolved: boolean("is_resolved").default(false),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Collaboration Comments - threaded comments on annotations or resources
export const collaborationComments = pgTable("collaboration_comments", {
  id: varchar("id").primaryKey(),
  sessionId: varchar("session_id").references(() => collaborationSessions.id).notNull(),
  annotationId: varchar("annotation_id").references(() => realTimeAnnotations.id), // Optional - for annotation comments
  parentCommentId: varchar("parent_comment_id"), // For threaded replies
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  mentions: jsonb("mentions").default([]), // Array of user IDs mentioned in comment
  attachments: jsonb("attachments").default([]), // File attachments
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Collaboration Actions - track real-time actions for undo/redo
export const collaborationActions = pgTable("collaboration_actions", {
  id: varchar("id").primaryKey(),
  sessionId: varchar("session_id").references(() => collaborationSessions.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  actionType: varchar("action_type").notNull(), // 'create_annotation', 'update_status', 'assign_user', etc.
  resourceType: varchar("resource_type").notNull(), // 'tenant', 'support_ticket', 'annotation'
  resourceId: varchar("resource_id").notNull(),
  actionData: jsonb("action_data").notNull(), // The actual action data
  previousState: jsonb("previous_state"), // For undo functionality
  isUndoable: boolean("is_undoable").default(true),
  undoneAt: timestamp("undone_at"),
  undoneBy: varchar("undone_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Collaboration Notifications - notify users of collaboration events
export const collaborationNotifications = pgTable("collaboration_notifications", {
  id: varchar("id").primaryKey(),
  sessionId: varchar("session_id").references(() => collaborationSessions.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(), // Who should receive notification
  type: varchar("type").notNull(), // 'mention', 'assignment', 'status_change', 'session_invite'
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  actionUrl: varchar("action_url"), // URL to navigate to
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Collaboration Types and Schemas
export type CollaborationSession = typeof collaborationSessions.$inferSelect;
export type CollaborationParticipant = typeof collaborationParticipants.$inferSelect;
export type RealTimeAnnotation = typeof realTimeAnnotations.$inferSelect;
export type CollaborationComment = typeof collaborationComments.$inferSelect;
export type CollaborationAction = typeof collaborationActions.$inferSelect;
export type CollaborationNotification = typeof collaborationNotifications.$inferSelect;

export const insertCollaborationSessionSchema = createInsertSchema(collaborationSessions);
export const insertCollaborationParticipantSchema = createInsertSchema(collaborationParticipants);
export const insertRealTimeAnnotationSchema = createInsertSchema(realTimeAnnotations);
export const insertCollaborationCommentSchema = createInsertSchema(collaborationComments);
export const insertCollaborationActionSchema = createInsertSchema(collaborationActions);
export const insertCollaborationNotificationSchema = createInsertSchema(collaborationNotifications);

export type InsertCollaborationSession = z.infer<typeof insertCollaborationSessionSchema>;
export type InsertCollaborationParticipant = z.infer<typeof insertCollaborationParticipantSchema>;
export type InsertRealTimeAnnotation = z.infer<typeof insertRealTimeAnnotationSchema>;
export type InsertCollaborationComment = z.infer<typeof insertCollaborationCommentSchema>;
export type InsertCollaborationAction = z.infer<typeof insertCollaborationActionSchema>;
export type InsertCollaborationNotification = z.infer<typeof insertCollaborationNotificationSchema>;

// ===== PHASE 1 CRITICAL BUSINESS MODULES =====

// Customer Module - Customer management for transportation companies
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().notNull(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id).notNull(),
  name: varchar("name").notNull(),
  contactPerson: varchar("contact_person"),
  email: varchar("email"),
  phone: varchar("phone"),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  creditLimit: decimal("credit_limit", { precision: 10, scale: 2 }).default("0"),
  paymentTerms: integer("payment_terms").default(30), // NET30, NET15, etc.
  status: varchar("status").default("active"), // active, inactive, suspended
  customerType: varchar("customer_type").default("shipper"), // shipper, broker, freight_forwarder
  mcNumber: varchar("mc_number"),
  dotNumber: varchar("dot_number"),
  fedexId: varchar("fedex_id"),
  billingAddress: text("billing_address"),
  billingCity: varchar("billing_city"),
  billingState: varchar("billing_state"),
  billingZipCode: varchar("billing_zip_code"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customer Rates - Rate management for customers
export const customerRates = pgTable("customer_rates", {
  id: varchar("id").primaryKey().notNull(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id).notNull(),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  origin: varchar("origin"),
  destination: varchar("destination"),
  equipmentType: varchar("equipment_type"), // dry_van, flatbed, reefer, etc.
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  rateType: varchar("rate_type").default("flat"), // flat, per_mile, percentage
  minimumRate: decimal("minimum_rate", { precision: 10, scale: 2 }),
  fuelSurcharge: decimal("fuel_surcharge", { precision: 5, scale: 2 }).default("0"),
  effectiveDate: timestamp("effective_date").notNull(),
  expirationDate: timestamp("expiration_date"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vendor Module - Vendor management for transportation companies
export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().notNull(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id).notNull(),
  name: varchar("name").notNull(),
  contactPerson: varchar("contact_person"),
  email: varchar("email"),
  phone: varchar("phone"),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  vendorType: varchar("vendor_type").notNull(), // fuel, maintenance, insurance, equipment
  paymentTerms: integer("payment_terms").default(30),
  status: varchar("status").default("active"),
  taxId: varchar("tax_id"),
  w9OnFile: boolean("w9_on_file").default(false),
  insuranceCertificate: boolean("insurance_certificate").default(false),
  contractedRates: boolean("contracted_rates").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vendor Payments - Payment tracking for vendors
export const vendorPayments = pgTable("vendor_payments", {
  id: varchar("id").primaryKey().notNull(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id).notNull(),
  vendorId: varchar("vendor_id").references(() => vendors.id).notNull(),
  invoiceNumber: varchar("invoice_number"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date"),
  paymentDate: timestamp("payment_date"),
  paymentMethod: varchar("payment_method"), // check, ach, wire, credit_card
  status: varchar("status").default("pending"), // pending, paid, overdue, disputed
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Compliance Module - Safety and DOT compliance tracking
export const complianceRecords = pgTable("compliance_records", {
  id: varchar("id").primaryKey().notNull(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id).notNull(),
  type: varchar("type").notNull(), // safety, dot, fmcsa, ifta, permits
  title: varchar("title").notNull(),
  description: text("description"),
  status: varchar("status").default("pending"), // pending, compliant, non_compliant, overdue
  dueDate: timestamp("due_date"),
  completedDate: timestamp("completed_date"),
  renewalDate: timestamp("renewal_date"),
  reminderDate: timestamp("reminder_date"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  priority: varchar("priority").default("medium"), // low, medium, high, critical
  category: varchar("category"), // driver, vehicle, company, operational
  entityId: varchar("entity_id"), // driver ID, vehicle ID, etc.
  entityType: varchar("entity_type"), // driver, vehicle, company
  documentRequired: boolean("document_required").default(false),
  documentUploaded: boolean("document_uploaded").default(false),
  cost: decimal("cost", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// DOT Compliance - Specific DOT compliance tracking
export const dotCompliance = pgTable("dot_compliance", {
  id: varchar("id").primaryKey().notNull(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id).notNull(),
  complianceType: varchar("compliance_type").notNull(), // drug_testing, driver_qualification, hos, vehicle_maintenance
  subType: varchar("sub_type"), // pre_employment, random, post_accident, etc.
  entityId: varchar("entity_id"), // driver ID, vehicle ID, etc.
  entityType: varchar("entity_type"), // driver, vehicle, company
  status: varchar("status").default("pending"),
  dueDate: timestamp("due_date"),
  completedDate: timestamp("completed_date"),
  expirationDate: timestamp("expiration_date"),
  testingFacility: varchar("testing_facility"),
  result: varchar("result"), // pass, fail, pending, n/a
  violations: text("violations"),
  fines: decimal("fines", { precision: 10, scale: 2 }).default("0"),
  correctionDeadline: timestamp("correction_deadline"),
  correctionCompleted: boolean("correction_completed").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Safety Compliance - Safety program compliance
export const safetyCompliance = pgTable("safety_compliance", {
  id: varchar("id").primaryKey().notNull(),
  companyId: varchar("company_id", { length: 50 }).references(() => companies.id).notNull(),
  safetyProgram: varchar("safety_program").notNull(), // driver_training, vehicle_inspection, accident_reporting
  driverId: varchar("driver_id").references(() => drivers.id),
  vehicleId: varchar("vehicle_id").references(() => trucks.id),
  trainingType: varchar("training_type"), // defensive_driving, hazmat, cargo_securement
  certificationRequired: boolean("certification_required").default(false),
  certificationObtained: boolean("certification_obtained").default(false),
  certificationDate: timestamp("certification_date"),
  expirationDate: timestamp("expiration_date"),
  trainingProvider: varchar("training_provider"),
  cost: decimal("cost", { precision: 8, scale: 2 }).default("0"),
  status: varchar("status").default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Phase 1 Types and Schemas
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;
export const insertCustomerSchema = createInsertSchema(customers);

export type CustomerRate = typeof customerRates.$inferSelect;
export type InsertCustomerRate = typeof customerRates.$inferInsert;
export const insertCustomerRateSchema = createInsertSchema(customerRates);

export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = typeof vendors.$inferInsert;
export const insertVendorSchema = createInsertSchema(vendors);

export type VendorPayment = typeof vendorPayments.$inferSelect;
export type InsertVendorPayment = typeof vendorPayments.$inferInsert;
export const insertVendorPaymentSchema = createInsertSchema(vendorPayments);

export type ComplianceRecord = typeof complianceRecords.$inferSelect;
export type InsertComplianceRecord = typeof complianceRecords.$inferInsert;
export const insertComplianceRecordSchema = createInsertSchema(complianceRecords);

export type DotCompliance = typeof dotCompliance.$inferSelect;
export type InsertDotCompliance = typeof dotCompliance.$inferInsert;
export const insertDotComplianceSchema = createInsertSchema(dotCompliance);

export type SafetyCompliance = typeof safetyCompliance.$inferSelect;
export type InsertSafetyCompliance = typeof safetyCompliance.$inferInsert;
export const insertSafetyComplianceSchema = createInsertSchema(safetyCompliance);