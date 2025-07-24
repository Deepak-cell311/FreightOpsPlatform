
# 🚛 FreightOps Pro – Fleet Module Production Guide (Neon DB)

## ✅ Objective
Migrate the Fleet module to Neon DB and finalize all production features including asset tracking, assignments, compliance alerts, and real-time availability.

---

## 🗂️ Folder Structure

```
/app/fleet/index.tsx
/app/fleet/create/truck.tsx
/app/fleet/create/trailer.tsx
/components/fleet/FleetDashboard.tsx
/components/fleet/TruckList.tsx
/components/fleet/TrailerList.tsx
/components/fleet/AssignmentOverview.tsx
/components/fleet/EquipmentTab.tsx
/components/fleet/CreateTruckForm.tsx
/components/fleet/CreateTrailerForm.tsx
/api/fleet/trucks.ts
/api/fleet/trailers.ts
/api/fleet/assignments.ts
/api/fleet/status.ts
```

---

## ⚙️ Features to Implement

| Feature                        | Description |
|--------------------------------|-------------|
| Truck & Trailer Registry       | VIN, status, make, model, mileage, etc. |
| Owned vs Leased Views          | Filter and display per ownership type |
| Driver Assignments             | Show assigned driver to each truck |
| Attachments                    | Link trailer to truck dynamically |
| Visual Status (Active/Inactive)| Greyed-out or highlighted cards |
| DOT & Insurance Alerts         | AlertPanel for expired documents |
| ELD Sync                       | Pull hours and prevent over-assign |
| Admin Override for ELD Hours   | Confirm prompt to override |
| Equipment Tab                  | Show assigned/unassigned assets |
| Trailer Types Dropdown         | Reefer, Dry Van, Tanker, Container |
| Chassis Tracking               | For container chassis management |

---

## 🔧 Neon DB API Examples

### /api/fleet/trucks.ts
```ts
import { db } from '@/lib/neon'

export async function GET(req) {
  const tenantId = req.headers.get('x-tenant-id')
  const result = await db.query(`SELECT * FROM trucks WHERE tenant_id = $1`, [tenantId])
  return Response.json(result.rows)
}
```

### /api/fleet/assignments.ts
```ts
export async function POST(req) {
  const body = await req.json()
  await db.query(
    `UPDATE trucks SET driver = $1 WHERE id = $2 AND tenant_id = $3`,
    [body.driverId, body.truckId, body.tenantId]
  )
  return Response.json({ success: true })
}
```

---

## 👥 Driver + Trailer Visibility

- Each truck should show:
  - Driver name
  - Assigned trailer (with type)
  - Active/Inactive status

---

## ⚠️ Compliance Warnings

- Alert UI: Show upcoming expirations:
```ts
SELECT * FROM trucks WHERE tenant_id = $1 AND registration_expiry < NOW() + interval '30 days'
```

---

## 🧠 ELD Hours Integration

- Use `hoursThisWeek` in driver table
- If >= 70, block assignment:
```tsx
if (driver.hoursThisWeek >= 70) {
  showWarning("Driver out of hours. Admin override required.")
}
```

---

## ✅ Final Checklist

| Feature                           | Status |
|------------------------------------|--------|
| Truck List                        | ✅ Done |
| Trailer List                      | ✅ Done |
| Create Asset Forms                | ✅ Structured |
| Ownership Filter                  | ✅ Done |
| Equipment Assignment View         | ✅ Done |
| Driver-to-Truck Bind              | ✅ Working |
| Trailer-to-Truck Bind             | ✅ Needed |
| Compliance Alerts                 | ✅ Added |
| ELD Warnings                      | ✅ Checked |
| Chassis Tracking for Containers   | ✅ Included |
| Neon SQL Queries                  | ✅ Applied |
