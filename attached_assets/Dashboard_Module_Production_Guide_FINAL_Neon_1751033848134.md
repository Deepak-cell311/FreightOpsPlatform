
# 📊 FreightOps Pro – Dashboard Module Production Setup Guide (Neon)

## ✅ Goal
Upgrade the dashboard to full production readiness using Neon as the backend DB, with multi-tenant filters and dynamic KPIs.

---

## 🗂️ File Structure

Create the following structure:

```
/app/dashboard/DashboardView.tsx
/components/dashboard/KPIGrid.tsx
/components/dashboard/RevenueChart.tsx
/components/dashboard/FleetStatusCard.tsx
/components/dashboard/DriverUtilization.tsx
/components/dashboard/QuickActionsPanel.tsx
/components/dashboard/LiveLoadStream.tsx
/components/dashboard/AlertBanner.tsx
/api/dashboard/stats.ts
/api/dashboard/fleet.ts
/api/dashboard/drivers.ts
```

---

## 🔧 Step-by-Step Instructions

### 1. DashboardView.tsx
Main layout for rendering all widgets:
```tsx
const DashboardView = () => (
  <div className="dashboard-grid space-y-4">
    <AlertBanner />
    <KPIGrid />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <RevenueChart />
      <FleetStatusCard />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <DriverUtilization />
      <LiveLoadStream />
    </div>
    <QuickActionsPanel />
  </div>
)
```

---

### 2. KPIGrid.tsx
Show live stats:
```tsx
useEffect(() => {
  getDashboardStats().then(setStats)
}, [])

getDashboardStats = async () => {
  const res = await fetch('/api/dashboard/stats')
  return await res.json()
}
```

---

### 3. RevenueChart.tsx
Install Recharts:
```
npm install recharts
```

Use:
```tsx
<ResponsiveContainer width="100%" height={200}>
  <LineChart data={sampleData}>
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="revenue" stroke="#2563EB" />
  </LineChart>
</ResponsiveContainer>
```

---

### 4. FleetStatusCard.tsx
```ts
const res = await fetch('/api/dashboard/fleet')
const status = await res.json()
```

---

### 5. DriverUtilization.tsx
```ts
const res = await fetch('/api/dashboard/drivers')
const stats = await res.json()
```

---

### 6. QuickActionsPanel.tsx
```tsx
<button onClick={() => router.push('/dispatch/load/create')}>+ Load</button>
```

---

### 7. LiveLoadStream.tsx
```tsx
const res = await fetch('/api/loads/active')
const liveLoads = await res.json()
```

---

### 8. AlertBanner.tsx
```tsx
<p>Upcoming compliance reviews and recertifications</p>
```

---

## 🔌 API Hookup (Neon DB)

Use Neon SQL queries like:
```ts
import { db } from '@/lib/neon'

export async function getDashboardStats(tenantId: string) {
  const result = await db.query(`SELECT * FROM loads WHERE tenant_id = $1`, [tenantId])
  return result.rows
}
```

---

## 🔐 Role-Based Access

| Role        | Access                                 |
|-------------|----------------------------------------|
| Driver      | Mileage, load info only                |
| Dispatcher  | Live feed, quick actions               |
| Admin       | All KPI + quick actions                |

---

## ✅ Final Checklist

| Feature                | Status |
|------------------------|--------|
| KPI Grid               | ✅ Dynamic w/ API |
| Revenue Chart          | ✅ Recharts setup |
| Fleet Status Card      | ✅ Real data |
| Driver Utilization     | ✅ Hooked |
| Alert Banner           | ✅ Static/dynamic |
| Quick Actions          | ✅ Routing OK |
| Live Load Feed         | ✅ Ready |
