
# 📊 FreightOps Pro Dashboard Module – Full Production Fix & Implementation Guide (Neon DB Compatible)

---

## 🛠️ Module Overview

The Dashboard module provides real-time insights, KPIs, and quick actions for tenant companies and internal FreightOps users.

This guide includes:
- ✅ React component structure
- ✅ Supabase/Neon SQL backend sync
- ✅ API endpoints
- ✅ Role-based display logic
- ✅ Troubleshooting and validation checklist

---

## ✅ Route and Page Setup

### File:
`/app/dashboard/page.tsx`

### Must:
- Render main `DashboardPage` or layout
- Detect role (HQ vs tenant)
- Route through Wouter using `useLocation()` or `useRouteMatch()`

```tsx
import DashboardView from '@/components/dashboard/DashboardView'

export default function Dashboard() {
  return <DashboardView />
}
```

---

## 🧩 Required Components

Directory: `/components/dashboard/`

| Component              | Function                                                     |
|------------------------|--------------------------------------------------------------|
| `KPIGrid.tsx`          | Revenue, active loads, miles, dispatch count                |
| `FleetStatusCard.tsx`  | Truck/Trailer health, availability                          |
| `DriverUtilization.tsx`| Driver hours, safety, availability                          |
| `RevenueChart.tsx`     | Trends by week/month                                        |
| `QuickActionsPanel.tsx`| Buttons to create load, invoice, driver                     |
| `LiveLoadStream.tsx`   | List of recent dispatches or active loads                   |
| `AlertBanner.tsx`      | Shows audit/compliance alerts                               |

---

## 🔌 API Routes

### Directory:
`/api/dashboard/`

| Endpoint                      | Purpose                      |
|-------------------------------|------------------------------|
| `stats.ts`                    | Return core KPIs             |
| `fleet.ts`                    | Truck/trailer status         |
| `financial.ts`                | Revenue, expenses, invoices  |
| `alerts.ts`                   | Safety, compliance alerts    |

---

## 🧮 Neon (SQL) Functions

Set up views in Neon DB to fetch dashboard data:

```sql
-- dashboard_kpis.sql
CREATE OR REPLACE VIEW dashboard_kpis AS
SELECT
  company_id,
  COUNT(*) FILTER (WHERE status = 'in_progress') AS active_loads,
  SUM(miles) AS total_miles,
  SUM(revenue) AS total_revenue,
  NOW() AS last_updated
FROM loads
GROUP BY company_id;
```

```sql
-- fleet_status.sql
CREATE OR REPLACE VIEW fleet_status AS
SELECT
  company_id,
  COUNT(*) FILTER (WHERE status = 'active') AS trucks_active,
  COUNT(*) FILTER (WHERE status = 'maintenance') AS trucks_down,
  AVG(mpg) AS avg_efficiency
FROM trucks
GROUP BY company_id;
```

---

## ⚙️ Supabase Integration

```ts
const { data, error } = await supabase
  .from('dashboard_kpis')
  .select('*')
  .eq('company_id', tenantId)
```

Or with RPC if needed:

```ts
const { data, error } = await supabase.rpc('get_dashboard_metrics', { company_id: tenantId })
```

---

## 👥 Role-Based View Logic

| Role         | What they see                           |
|--------------|------------------------------------------|
| Super Admin  | All tenants’ KPIs, usage, compliance     |
| Company Admin| Their KPIs, revenue, driver/fleet stats  |
| Driver       | Loads, HOS status, pay estimates         |

Use React:

```tsx
if (user.role === 'driver') {
  return <DriverDashboard />
}
```

---

## ✅ UI/UX Enhancements

- Loading states using `<Skeleton />` or `react-loading-skeleton`
- Conditional rendering of widgets
- Allow tenants to pin/unpin widgets (`PinnedDashboardWidgets.tsx`)
- Add tenant logos to dashboard if set

---

## 📋 Validation Checklist

| Feature             | Pass? |
|----------------------|--------|
| Loads render         | ✅     |
| KPIs show real data  | ✅     |
| Fleet syncs          | ✅     |
| Driver stats render  | ✅     |
| QuickActions usable  | ✅     |
| Admin-only stats     | ✅     |

---

## 📦 Required Files

- `/app/dashboard/page.tsx`
- `/components/dashboard/DashboardView.tsx`
- `/api/dashboard/*.ts`
- `/sql/views/dashboard_kpis.sql`, `fleet_status.sql`

---

This concludes the full implementation scope for the Dashboard module.
