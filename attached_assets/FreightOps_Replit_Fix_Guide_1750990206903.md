
# FreightOps Platform — Replit Developer Fix Guide

This document provides exact instructions to fix and enable full functionality across modules: Dispatch, Fleet, Accounting, HR, and Payroll.

---

## ✅ GLOBAL ACTIONS (ALL MODULES)

### 1. Set Up Custom Hooks
**Why:** Reduce duplication and enable reliable data fetching via `useQuery` or `useEffect`.

**Create:** `src/hooks/` directory with files:
- `useFleetAssets.ts`
- `usePayrollSummary.ts`
- `useAccountingSummary.ts`
- `useDispatchLoads.ts`

Example:
```tsx
export function useFleetAssets() {
  return useQuery(['fleetAssets'], async () => {
    const res = await fetch('/api/fleet/assets');
    return res.json();
  });
}
```

---

### 2. Build Required API Endpoints
**Why:** Most components call `/api/...` paths that don’t exist in this ZIP.

**Create `server/routes/` files:**
- `fleet.js` – `GET /api/fleet/assets`, `POST /api/fleet/create`
- `dispatch.js` – `GET /api/dispatch/loads`, `POST /api/dispatch/assign`
- `accounting.js` – `GET /api/accounting/summary`, `/invoices`, `/ar-aging`
- `hr.js` – `GET /api/hr/employees`, `/benefits`, `/applications`
- `payroll.js` – `GET /api/payroll/summary`, `/payruns`

Ensure each returns data scoped by `companyId`.

---

### 3. Refactor Sidebar Routing
**Why:** Some menu links break or point to wrong components.

**Steps:**
1. Add `lib/routes.ts`:
```ts
export const ROUTES = {
  dispatch: '/dispatch',
  fleet: '/fleet',
  accounting: '/accounting',
  hr: '/hr',
  payroll: '/payroll'
};
```
2. Import `ROUTES` in sidebar component and in route `<Switch>`.

---

## 🔧 MODULE FIXES

### DISPATCH
- Hook: `useDispatchLoads.ts`
- Fix buttons for “Assign”, “Update Status”
- Backend: `/api/dispatch/assign`, `/update-status`

---

### FLEET
- Hook: `useFleetAssets.ts`
- Repair `DriversTable`, `EquipmentTable`, `LiveMap`
- Add `driver-truck` sync in Supabase
- Backend: `/api/fleet/assets`

---

### ACCOUNTING
- Hook: `useAccountingSummary.ts`
- Build KPI cards (total revenue, invoice aging)
- Build `/api/accounting/summary`, `/invoices`, `/pnl`

---

### HR / PAYROLL
- Hook: `usePayrollSummary.ts`
- Reconnect benefits, applications, and employee records
- Gusto integration: `/api/gusto/connect`, `/payroll/summary`

---

## 🔄 MULTI-TENANT LOGIC
**All Supabase and API queries** must use the logged-in user’s `companyId` or `tenantId`.

Add this logic:
```ts
const session = supabase.auth.getSession();
const companyId = session?.user?.user_metadata?.companyId;
```
Use `companyId` in filters.

---

## 📦 COMPONENT CHECKLIST (FROM ZIP)

| Component | Exists | Needs Fix |
|----------|--------|-----------|
| `drivers-table.tsx` | ✅ | Hook integration |
| `equipment-table.tsx` | ✅ | Hook integration |
| `live-map.tsx` | ✅ | GPS feed missing |
| `dispatch-map.tsx` | ✅ | Load plotting |
| `kpi-cards.tsx` | ✅ | Accounting stats missing |

---

## ✅ DEV ACTION SUMMARY

- [ ] Add missing API route handlers
- [ ] Build custom `useX` hooks per module
- [ ] Centralize routing in `routes.ts`
- [ ] Update side menu to use map
- [ ] Connect all Supabase/API calls to tenant ID
- [ ] Fix Gusto + payroll syncing
- [ ] Test data fetch, error fallback, and subpages

---

