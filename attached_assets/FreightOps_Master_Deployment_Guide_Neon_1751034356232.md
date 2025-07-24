
# 🚀 FreightOps Pro – Master Production Deployment Guide (Neon DB)

## 🧠 Overview
This document provides the complete implementation guidance to deploy FreightOps Pro using Neon for all major modules: Dashboard, Dispatch, Fleet, HR/Payroll, and Accounting.

---

## 📦 Modules Covered

- [x] Dashboard
- [x] Dispatch System
- [x] Fleet Management
- [x] HR & Payroll
- [x] Accounting & Reports

---

## 🏗️ Global Architecture

| Layer     | Stack                                  |
|-----------|-----------------------------------------|
| Frontend  | React + Vite                            |
| Routing   | `wouter` or `react-router-dom`          |
| DB        | Neon (PostgreSQL)                       |
| API       | REST (`/api/*.ts`)                      |
| Auth      | Supabase Auth or custom token headers   |
| State     | Context API or Redux (modular)          |
| Multi-Tenant | `tenant_id` filtering in every query  |

---

## 🔐 Multi-Tenant Pattern

Ensure every query includes:
```ts
const tenantId = req.headers.get('x-tenant-id') // or from auth token

await db.query('SELECT * FROM table WHERE tenant_id = $1', [tenantId])
```

---

## 📊 Dashboard Module

- Tenant-aware metrics
- Widgets: Load count, active drivers, unpaid invoices, fuel spend
- Role-based chart visibility
- Charts with `@mui/x-charts` or Chart.js

---

## 🚛 Dispatch Module

- Smart Load Creation: Form updates based on trailer type
- Load Confirmation & Batch Mode
- Port/Container features: BOL, vessel, chassis, per diem, hold
- Multi-leg dispatch with driver assignment
- ELD hour check + admin override
- Load status reflected in Scheduler + Driver App

---

## 🚚 Fleet Module

- Truck & Trailer Registry: VIN, ownership, attachments
- Assigned/Unassigned Equipment view
- Driver-to-Truck bind
- DOT, registration, and insurance alerts
- ELD sync for out-of-hours checks
- Chassis tracking for container ops

---

## 👥 HR & Payroll Module

- DOT & non-DOT onboarding: full form w/ background triggers
- I-9, MVR, PSP, CDL verification support
- Auto-create users across HR, Payroll, and Driver DB
- Benefits dashboard + enrollment
- Embedded Gusto integration (OAuth)
- Payroll logs per employee
- Role filters: Admin, HR Manager, Support

---

## 💰 Accounting Module

- Invoice creation, status, and export
- Fuel card + factoring tracking
- Reports: P&L, AR/AP, Payroll Summary, Load Profitability
- Export to CSV/PDF
- Audit logging
- API-ready for QuickBooks/Xero

---

## 🔄 API Notes

Structure for `/api/*.ts` endpoints:
```ts
export async function GET(req) {
  const tenantId = req.headers.get('x-tenant-id')
  const result = await db.query('SELECT * FROM table WHERE tenant_id = $1', [tenantId])
  return Response.json(result.rows)
}
```

---

## 📁 File Organization

```
/app/{module}/...
/components/{module}/...
/api/{module}/...
/lib/neon.ts       // Neon connection handler
/context/UserContext.tsx
/layouts/...
```

---

## ✅ Final Deployment Checklist

- [x] Each module has tenant filters
- [x] Admin override workflows exist (e.g., ELD)
- [x] Load form supports conditional fields
- [x] Gusto embedded payroll and onboarding sync
- [x] Background checks connected via external API
- [x] Neon database schema migrated
- [x] All critical pages linked in navigation
- [x] Multi-leg dispatch and driver app syncing tested
- [x] Accounting export and reports fully functional

---

## 🧾 Suggested Schema Tables

- `loads`, `dispatches`, `drivers`, `trucks`, `trailers`
- `employees`, `onboarding_submissions`, `payroll_log`
- `invoices`, `transactions`, `factoring_logs`, `fuel_logs`
- `tenants`, `users`, `user_roles`

---

## 📢 Final Note

This master guide replaces Supabase as the DB and moves all queries to Neon using SQL-compatible `db.query(...)`. All module-specific guides are embedded into this workflow.

