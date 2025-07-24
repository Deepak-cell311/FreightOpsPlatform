
# 🚨 FreightOps Platform – Schema Fix Instructions for Replit Deployment

This document explains how to resolve schema-related issues currently affecting the FreightOps Pro deployment on Replit. DO NOT continue using the "minimal schema" Replit generated — it breaks production-critical features.

---

## ❌ Why the Minimal Schema Is Failing

| Problem | Impact |
|--------|--------|
| Removed foreign key references | Breaks joins and user-company relations |
| Removed important fields (e.g., isHazmat, fuelCost, benefits) | Breaks forms, pages, and data displays |
| No enums, default values, or validation rules | Creates runtime errors and invalid records |
| Missing tables (payroll, dispatch, accounting) | Entire modules fail to function |

---

## ✅ Correct Schema Strategy

Instead of the minimal schema, Replit must use the full schema provided across the modules.

### 1. ✅ Split Schema Files by Domain

Organize schema files like this:

```
/shared/schema/
├── core.ts         → users, companies, auth
├── fleet.ts        → trucks, trailers, assignments
├── hr.ts           → employees, payroll, benefits
├── dispatch.ts     → loads, legs, actions
├── accounting.ts   → invoices, transactions, reports
├── hq.ts           → tenants, activity logs, metrics
```

**All schema fields, types, and references are documented in the `.md` files previously delivered.**

---

### 2. ✅ Update `drizzle.config.ts`

Ensure it only picks up the correct schema files:
```ts
schema: ['./shared/schema/**/*.ts'],
out: './drizzle/migrations',
driver: 'pg',
dbCredentials: {
  connectionString: process.env.DATABASE_URL
}
```

---

### 3. ✅ Enable Required Neon Extensions

Run the following once in Neon:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

---

### 4. ✅ Replace Minimal Schema

If Replit added a generated file like:
```
shared/schema/minimal.ts
```
**→ DELETE or REMOVE IT** from imports and `drizzle.config.ts`.

Use the schema from the `.md` source files instead. Start with:
- `users`, `companies` from core
- `trucks`, `drivers`, `loads` from fleet and dispatch

---

### 5. ✅ Test `db:push` Safely

Before pushing schema:

```bash
npm run db:push -- --dry-run
```

Or:
```bash
drizzle-kit push:pg --skip-db-push
```

If it works cleanly, then:
```bash
npm run db:push
```

---

### 6. ✅ Lock Schema Consistency

Once schema is clean:
- Commit `shared/schema/**/*.ts`
- Remove Replit’s auto-gen schema
- Disable re-generation in Replit config if enabled

---

## ✅ Reference: Available Schema Files

- `HQ_Module_Production_Ready_Neon.md`
- `Fleet_Module_Production_Guide_Neon.md`
- `Dispatch_Module_Smart_Loads_Guide.md`
- `Accounting_Module_Production_Guide_Neon.md`
- `HR_Payroll_Module_Production_Guide_Neon.md`

---

**Following these steps will restore production functionality, data relationships, and eliminate schema mismatches.**

