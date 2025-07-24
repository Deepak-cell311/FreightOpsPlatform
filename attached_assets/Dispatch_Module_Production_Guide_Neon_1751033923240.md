
# 🚛 FreightOps Pro – Dispatch Module Production Guide (Neon DB)

## ✅ Objective
Migrate and fully enable Dispatch functionality using Neon as the backend. Implement real-time tenant-aware dispatching with container, reefer, flatbed, and smart scheduling logic.

---

## 🗂️ Folder Structure

```
/app/dispatch/index.tsx
/app/dispatch/load/create.tsx
/components/dispatch/TopMenu.tsx
/components/dispatch/LoadCreationForm.tsx
/components/dispatch/ScheduleView.tsx
/components/dispatch/DriverAssignmentPanel.tsx
/components/dispatch/PortContainerFields.tsx
/components/dispatch/FlatbedFields.tsx
/components/dispatch/TankerFields.tsx
/components/dispatch/ReeferFields.tsx
/api/dispatch/create.ts
/api/dispatch/loads.ts
/api/dispatch/assign.ts
/api/dispatch/schedule.ts
```

---

## ⚙️ Dispatch Features Overview

| Feature                     | Description |
|-----------------------------|-------------|
| Smart Load Creation         | Fields change by load type |
| Container Management        | Vessel, container #, BOL, etc. |
| Driver Assignment System    | Assign by leg or trip |
| Multi-Leg Dispatching       | Split trips by stops or drivers |
| Schedule Calendar           | Interactive load board |
| Driver App Integration      | Loads push to assigned drivers |
| Load Confirmation Upload    | Load entry via PDF |
| Batch Dispatching           | Multi-load entry workflow |
| ELD Restriction Logic       | Prevent out-of-hours dispatching |

---

## 🔧 Key Component Instructions

### LoadCreationForm.tsx
- Dynamically render fields by load type:
```tsx
{loadType === 'container' && <PortContainerFields />}
{loadType === 'tanker' && <TankerFields />}
{loadType === 'reefer' && <ReeferFields />}
```

- Smart sync:
```ts
await fetch('/api/dispatch/create', {
  method: 'POST',
  body: JSON.stringify({
    ...formData,
    tenantId: session?.tenant_id,
  })
})
```

---

### PortContainerFields.tsx
```tsx
<FormField name="containerNumber" />
<FormField name="vessel" />
<FormField name="chassisType" />
<FormField name="hazmat" />
<FormField name="perDiemRate" />
<FormField name="freeDays" />
```

---

### DriverAssignmentPanel.tsx
- Fetch driver availability:
```ts
const result = await db.query(
  `SELECT * FROM drivers WHERE tenant_id = $1 AND status = 'active'`, [tenantId]
)
```

- Show warning if out of hours:
```tsx
if (driver.hoursThisWeek >= 70) {
  showWarning("Driver is out of hours. Admin override required.")
}
```

---

### ScheduleView.tsx
- Render from `/api/dispatch/schedule?tenant_id=abc`
- Show dispatches by date
- Color code by load type (REEFER, CONTAINER, etc.)

---

## 🔌 Neon Integration (API Example)

### /api/dispatch/create.ts
```ts
import { db } from '@/lib/neon'

export async function POST(req) {
  const body = await req.json()
  const result = await db.query(
    `INSERT INTO loads (...) VALUES (...) RETURNING *`,
    [body.tenantId, body.loadType, ...]
  )
  return Response.json({ success: true, load: result.rows[0] })
}
```

---

## 👥 Role Logic

| Role        | Permission                         |
|-------------|------------------------------------|
| Dispatcher  | Full access to loads, assign, schedule |
| Admin       | All + override driver hours         |
| Driver      | View assigned legs only             |

---

## ✅ Final Checklist

| Feature                      | Status |
|------------------------------|--------|
| Load Type Smart Form         | ✅ Done |
| Container Fields             | ✅ Included |
| Driver Assignment Logic      | ✅ Tenant-aware |
| Multi-Leg Dispatch           | ✅ Supported |
| Batch Upload Support         | ✅ Needed |
| Load Confirmation Upload     | ✅ Needed |
| Neon SQL Support             | ✅ Applied |
| ELD Restriction              | ✅ Warning included |
| Role Access                  | ✅ Verified |
| Scheduler Display            | ✅ Dynamic |
| Driver App Feed              | ✅ Pending binding |

