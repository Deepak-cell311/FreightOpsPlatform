
# 📦 FreightOps Pro – Replit Implementation Instructions (Production Grade)

## 🔧 Overview

You are to implement the production fixes and upgrades for the FreightOps Pro system using the roadmap outlined in `FREIGHTOPS_PRO_FINAL_IMPLEMENTATION_PLAN.md`. This includes patching APIs, fixing frontend routing, syncing Neon DB, removing placeholders, and deploying to Vercel.

---

## ✅ STEP-BY-STEP REPLIT IMPLEMENTATION CHECKLIST

### 1. 🔄 Fix Broken Services
Location: `client/src/services`

Update and implement:
- `enterprise-fleet-service.ts`
- `dispatch-service.ts`
- `integration-service.ts`

Example Neon integration:
```ts
import { sql } from '@neondatabase/serverless'

export async function getFleetOverview(companyId: string) {
  return await sql`SELECT * FROM vehicles WHERE company_id = ${companyId}`;
}
```

---

### 2. 🧩 Implement Missing API Endpoints
Location: `server/api`

| Endpoint                      | File                             |
|------------------------------|----------------------------------|
| `/api/fleet/vehicles`        | `fleet.ts`                       |
| `/api/dispatch/assignments`  | `dispatch.ts`                    |
| `/api/analytics/safety`      | `analytics.ts`                   |
| `/api/integrations/keys`     | `integrations.ts`                |

- Enforce tenant isolation and use Neon queries.

---

### 3. 🧱 Fix Schema (Neon)
In Neon and `schema.ts`:

- Replace `equipment` with actual `trucks`, `trailers`, `vehicles`
- Add tables:
  - `maintenance_records`
  - `dispatch_legs`
  - `integration_credentials`
- Ensure relationships use proper FK constraints
- Use Neon migrations or SQL CLI

---

### 4. 🧠 Smart Load Creation
In `LoadCreate.tsx`, implement dynamic fields:

- Switch by `loadType`: reefer, container, flatbed, tanker
- Add specific fields per load
- Express Pass for Houston containers
- Batch creation support from BOL uploads

---

### 5. 🔀 Frontend Routing Fixes
- Ensure proper `wouter` routing in:
  - `/fleet`
  - `/dispatch`
  - `/settings`
- HQ should use nested sidebar layout (not tabs)

---

### 6. 🔐 Auth System + Multi-Tenant
- Fix role checks and redirect logic
- Store sessions in Neon (no Supabase)
- Validate `tenantId` on all sensitive queries

---

### 7. 🧪 Test Data Setup (Neon)
Seed manually or with a script:

- 3 drivers with HOS/CDL
- 5 loads with varying types
- 3 trucks and 2 trailers
- 2 payroll entries per driver

---

### 8. 🚀 Deployment to Vercel
- Push latest repo to GitHub
- Connect to Vercel
- Configure `.env` variables:
  - Neon connection
  - JWT keys
  - Tenant ID fallback
- Run `vercel --prod`

---

### ✅ Completion Criteria
- No placeholders left
- Smart Load creation works
- APIs respond with Neon data
- Auth works per role and tenant
- All routing and components functional
- HQ shows live dashboard metrics
