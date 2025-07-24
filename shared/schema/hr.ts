import { pgTable, varchar, text, timestamp, uuid, decimal, integer, jsonb, date, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { companies, users, drivers } from "../schema";

// ===============================
// TENANT HR TABLES (Motor Carrier Companies)
// ===============================

// Employee Applications - TenStreet-style driver applications
export const employeeApplications = pgTable("employee_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: varchar("company_id").references(() => companies.id).notNull(),
  
  // Basic Information
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  ssn: varchar("ssn").notNull(), // Encrypted
  
  // Address Information
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  zipCode: varchar("zip_code").notNull(),
  yearsAtAddress: integer("years_at_address"),
  
  // Employment History (3 years DOT requirement)
  employmentHistory: jsonb("employment_history").notNull(), // Array of employment records
  unemploymentGaps: jsonb("unemployment_gaps"), // Any gaps > 30 days
  
  // CDL Information
  cdlNumber: varchar("cdl_number").notNull(),
  cdlClass: varchar("cdl_class").notNull(), // A, B, C
  cdlState: varchar("cdl_state").notNull(),
  cdlIssueDate: date("cdl_issue_date").notNull(),
  cdlExpirationDate: date("cdl_expiration_date").notNull(),
  cdlEndorsements: varchar("cdl_endorsements"), // H, X, N, P, S, T, etc.
  cdlRestrictions: varchar("cdl_restrictions"),
  
  // Medical Information
  medicalCertificateNumber: varchar("medical_certificate_number"),
  medicalExamDate: date("medical_exam_date"),
  medicalExpirationDate: date("medical_expiration_date"),
  medicalCertificateType: varchar("medical_certificate_type"), // Non-excepted, Excepted, etc.
  
  // DOT Safety Information
  accidentHistory: jsonb("accident_history"), // 3 years of accidents
  violationHistory: jsonb("violation_history"), // 3 years of violations
  driverLicenseSuspensions: jsonb("driver_license_suspensions"),
  
  // References
  references: jsonb("references").notNull(), // Array of references
  
  // Application Status
  applicationStatus: varchar("application_status").default("submitted"), // submitted, under_review, background_check, approved, rejected, onboarding
  applicationSource: varchar("application_source").default("direct"), // direct, tenstreet, indeed, etc.
  applicationDate: timestamp("application_date").defaultNow(),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  notes: text("notes"),
  
  // Consent and Signatures
  backgroundCheckConsent: boolean("background_check_consent").default(false),
  drugScreenConsent: boolean("drug_screen_consent").default(false),
  mvrConsent: boolean("mvr_consent").default(false),
  pspConsent: boolean("psp_consent").default(false),
  digitalSignature: text("digital_signature"),
  ipAddress: varchar("ip_address"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Background Checks - PSP, MVR, CDLIS, Drug Screen results
export const backgroundChecks = pgTable("background_checks", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").references(() => employeeApplications.id).notNull(),
  companyId: varchar("company_id").references(() => companies.id).notNull(),
  
  // Check Types
  checkType: varchar("check_type").notNull(), // PSP, MVR, CDLIS, drug_screen, criminal_background
  
  // PSP Report Data (Pre-employment Screening Program)
  pspReportId: varchar("psp_report_id"),
  pspCrashData: jsonb("psp_crash_data"), // 5 years of crash data
  pspInspectionData: jsonb("psp_inspection_data"), // 3 years of inspection data
  pspViolationData: jsonb("psp_violation_data"),
  
  // MVR Report Data (Motor Vehicle Record)
  mvrReportId: varchar("mvr_report_id"),
  mvrState: varchar("mvr_state"),
  mvrData: jsonb("mvr_data"), // Complete MVR report
  mvrViolations: jsonb("mvr_violations"),
  mvrPoints: integer("mvr_points"),
  
  // CDLIS Data (Commercial Driver License Information System)
  cdlisReportId: varchar("cdlis_report_id"),
  cdlisData: jsonb("cdlis_data"),
  cdlisProblems: jsonb("cdlis_problems"),
  
  // Drug Screen Results
  drugScreenId: varchar("drug_screen_id"),
  drugScreenResult: varchar("drug_screen_result"), // negative, positive, refused, invalid
  drugScreenDate: date("drug_screen_date"),
  drugScreenFacility: varchar("drug_screen_facility"),
  
  // Criminal Background Check
  criminalReportId: varchar("criminal_report_id"),
  criminalData: jsonb("criminal_data"),
  
  // Check Status
  checkStatus: varchar("check_status").notNull(), // pending, completed, failed, expired
  requestDate: timestamp("request_date").defaultNow(),
  completionDate: timestamp("completion_date"),
  expirationDate: timestamp("expiration_date"),
  
  // Vendor Information
  vendorName: varchar("vendor_name"), // TenStreet, HireRight, etc.
  vendorReportId: varchar("vendor_report_id"),
  
  // Results
  overallResult: varchar("overall_result"), // pass, fail, review_required
  resultSummary: text("result_summary"),
  disqualifyingFactors: jsonb("disqualifying_factors"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Employee Onboarding - TenStreet-style onboarding workflow
export const employeeOnboarding = pgTable("employee_onboarding", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").references(() => employeeApplications.id).notNull(),
  companyId: varchar("company_id").references(() => companies.id).notNull(),
  
  // Onboarding Status
  onboardingStatus: varchar("onboarding_status").default("pending"), // pending, in_progress, completed, cancelled
  currentStep: varchar("current_step").default("i9_verification"), // i9_verification, drug_screen, orientation, training, complete
  
  // I-9 Employment Eligibility Verification
  i9Status: varchar("i9_status").default("pending"), // pending, in_progress, completed, expired
  i9DocumentsSeen: jsonb("i9_documents_seen"), // List A, B, C documents
  i9CompletionDate: date("i9_completion_date"),
  i9VerifiedBy: varchar("i9_verified_by").references(() => users.id),
  
  // Drug Screen
  drugScreenStatus: varchar("drug_screen_status").default("pending"), // pending, scheduled, completed, failed
  drugScreenAppointment: timestamp("drug_screen_appointment"),
  drugScreenFacility: varchar("drug_screen_facility"),
  
  // Orientation
  orientationStatus: varchar("orientation_status").default("pending"), // pending, scheduled, completed, no_show
  orientationDate: timestamp("orientation_date"),
  orientationLocation: varchar("orientation_location"),
  orientationConductedBy: varchar("orientation_conducted_by").references(() => users.id),
  
  // Training Requirements
  trainingStatus: varchar("training_status").default("pending"), // pending, in_progress, completed
  trainingModules: jsonb("training_modules"), // List of required training modules
  trainingCompletionDate: timestamp("training_completion_date"),
  
  // Equipment Assignment
  equipmentAssigned: jsonb("equipment_assigned"), // Trucks, trailers, etc.
  equipmentAssignmentDate: timestamp("equipment_assignment_date"),
  
  // Document Collection
  documentsCollected: jsonb("documents_collected"), // List of collected documents
  documentsOutstanding: jsonb("documents_outstanding"), // List of missing documents
  
  // Payroll Setup
  payrollStatus: varchar("payroll_status").default("pending"), // pending, setup, completed
  gustoEmployeeId: varchar("gusto_employee_id"),
  payrollSetupDate: timestamp("payroll_setup_date"),
  
  // Completion
  onboardingCompletionDate: timestamp("onboarding_completion_date"),
  completedBy: varchar("completed_by").references(() => users.id),
  
  // Notes and Comments
  onboardingNotes: text("onboarding_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Employee Documents - DOT-compliant document management
export const employeeDocuments = pgTable("employee_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  employeeId: varchar("employee_id").references(() => drivers.id).notNull(),
  companyId: varchar("company_id").references(() => companies.id).notNull(),
  
  // Document Information
  documentType: varchar("document_type").notNull(), // cdl, medical_certificate, drug_screen, i9, mvr, psp, etc.
  documentCategory: varchar("document_category").notNull(), // qualification, medical, safety, payroll, etc.
  documentName: varchar("document_name").notNull(),
  documentDescription: text("document_description"),
  
  // File Information
  fileName: varchar("file_name").notNull(),
  fileSize: integer("file_size"),
  fileType: varchar("file_type").notNull(), // pdf, jpg, png, etc.
  fileUrl: varchar("file_url").notNull(),
  
  // Document Status
  documentStatus: varchar("document_status").default("active"), // active, expired, superseded, pending_review
  isRequired: boolean("is_required").default(false),
  
  // Expiration Management
  expirationDate: date("expiration_date"),
  renewalReminderDays: integer("renewal_reminder_days").default(30),
  lastReminderSent: timestamp("last_reminder_sent"),
  
  // Approval Workflow
  approvalStatus: varchar("approval_status").default("pending"), // pending, approved, rejected, needs_review
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  
  // Compliance Tracking
  dotCompliant: boolean("dot_compliant").default(true),
  complianceNotes: text("compliance_notes"),
  
  // Metadata
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  tags: jsonb("tags"), // For organization and search
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Gusto Integration Data - Payroll and benefits sync
export const gustoIntegration = pgTable("gusto_integration", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: varchar("company_id").references(() => companies.id).notNull(),
  
  // Gusto Company Information
  gustoCompanyId: varchar("gusto_company_id").notNull(),
  gustoCompanyName: varchar("gusto_company_name"),
  gustoCompanyStatus: varchar("gusto_company_status"),
  
  // Authentication
  accessToken: varchar("access_token").notNull(),
  refreshToken: varchar("refresh_token").notNull(),
  tokenExpiry: timestamp("token_expiry").notNull(),
  
  // Sync Status
  lastSyncDate: timestamp("last_sync_date"),
  syncStatus: varchar("sync_status").default("active"), // active, paused, error
  syncErrors: jsonb("sync_errors"),
  
  // Feature Configuration
  enabledFeatures: jsonb("enabled_features"), // employee_sync, payroll_sync, benefits_sync, etc.
  syncFrequency: varchar("sync_frequency").default("daily"), // real_time, hourly, daily, weekly
  
  // Mapping Configuration
  fieldMappings: jsonb("field_mappings"), // How FreightOps fields map to Gusto fields
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Employee Payroll - Gusto sync data
export const employeePayroll = pgTable("employee_payroll", {
  id: uuid("id").primaryKey().defaultRandom(),
  employeeId: varchar("employee_id").references(() => drivers.id).notNull(),
  companyId: varchar("company_id").references(() => companies.id).notNull(),
  
  // Gusto Employee Information
  gustoEmployeeId: varchar("gusto_employee_id").notNull(),
  gustoEmployeeUuid: varchar("gusto_employee_uuid"),
  
  // Compensation Information
  payRate: decimal("pay_rate", { precision: 8, scale: 2 }),
  payType: varchar("pay_type"), // hourly, salary, per_mile, percentage
  salaryAmount: decimal("salary_amount", { precision: 10, scale: 2 }),
  
  // Employment Information
  employmentStatus: varchar("employment_status").default("active"), // active, terminated, leave
  startDate: date("start_date"),
  terminationDate: date("termination_date"),
  terminationReason: text("termination_reason"),
  
  // Tax Information
  taxWithholdings: jsonb("tax_withholdings"),
  taxExemptions: jsonb("tax_exemptions"),
  
  // Benefits Information
  benefitEnrollments: jsonb("benefit_enrollments"),
  benefitDeductions: jsonb("benefit_deductions"),
  
  // Payment Information
  paymentMethod: varchar("payment_method").default("direct_deposit"), // direct_deposit, check, card
  bankAccountInfo: jsonb("bank_account_info"), // Encrypted
  
  // Sync Status
  gustoSyncStatus: varchar("gusto_sync_status").default("pending"), // pending, synced, error
  lastGustoSync: timestamp("last_gusto_sync"),
  gustoSyncErrors: jsonb("gusto_sync_errors"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ===============================
// SCHEMA EXPORTS
// ===============================

// Insert schemas
export const insertEmployeeApplication = createInsertSchema(employeeApplications);
export const insertBackgroundCheck = createInsertSchema(backgroundChecks);
export const insertEmployeeOnboarding = createInsertSchema(employeeOnboarding);
export const insertEmployeeDocument = createInsertSchema(employeeDocuments);
export const insertGustoIntegration = createInsertSchema(gustoIntegration);
export const insertEmployeePayroll = createInsertSchema(employeePayroll);

// Types
export type EmployeeApplication = typeof employeeApplications.$inferSelect;
export type InsertEmployeeApplication = typeof employeeApplications.$inferInsert;
export type BackgroundCheck = typeof backgroundChecks.$inferSelect;
export type InsertBackgroundCheck = typeof backgroundChecks.$inferInsert;
export type EmployeeOnboarding = typeof employeeOnboarding.$inferSelect;
export type InsertEmployeeOnboarding = typeof employeeOnboarding.$inferInsert;
export type EmployeeDocument = typeof employeeDocuments.$inferSelect;
export type InsertEmployeeDocument = typeof employeeDocuments.$inferInsert;
export type GustoIntegration = typeof gustoIntegration.$inferSelect;
export type InsertGustoIntegration = typeof gustoIntegration.$inferInsert;
export type EmployeePayroll = typeof employeePayroll.$inferSelect;
export type InsertEmployeePayroll = typeof employeePayroll.$inferInsert;

// Relations
export const employeeApplicationRelations = relations(employeeApplications, ({ one, many }) => ({
  company: one(companies, {
    fields: [employeeApplications.companyId],
    references: [companies.id],
  }),
  backgroundChecks: many(backgroundChecks),
  onboarding: one(employeeOnboarding),
}));

export const backgroundCheckRelations = relations(backgroundChecks, ({ one }) => ({
  application: one(employeeApplications, {
    fields: [backgroundChecks.applicationId],
    references: [employeeApplications.id],
  }),
  company: one(companies, {
    fields: [backgroundChecks.companyId],
    references: [companies.id],
  }),
}));

export const employeeOnboardingRelations = relations(employeeOnboarding, ({ one }) => ({
  application: one(employeeApplications, {
    fields: [employeeOnboarding.applicationId],
    references: [employeeApplications.id],
  }),
  company: one(companies, {
    fields: [employeeOnboarding.companyId],
    references: [companies.id],
  }),
}));

export const employeeDocumentRelations = relations(employeeDocuments, ({ one }) => ({
  employee: one(drivers, {
    fields: [employeeDocuments.employeeId],
    references: [drivers.id],
  }),
  company: one(companies, {
    fields: [employeeDocuments.companyId],
    references: [companies.id],
  }),
}));

export const gustoIntegrationRelations = relations(gustoIntegration, ({ one }) => ({
  company: one(companies, {
    fields: [gustoIntegration.companyId],
    references: [companies.id],
  }),
}));

export const employeePayrollRelations = relations(employeePayroll, ({ one }) => ({
  employee: one(drivers, {
    fields: [employeePayroll.employeeId],
    references: [drivers.id],
  }),
  company: one(companies, {
    fields: [employeePayroll.companyId],
    references: [companies.id],
  }),
}));