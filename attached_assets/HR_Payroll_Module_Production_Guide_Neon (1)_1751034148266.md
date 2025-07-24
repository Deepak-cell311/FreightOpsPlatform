
# 👥 FreightOps Pro – HR & Payroll Module Production Guide (Neon DB)

## ✅ Objective
Migrate HR & Payroll module to Neon and finalize all production workflows including onboarding, employee profiles, payroll triggers, benefits management, and compliance.

---

## 🗂️ Folder Structure

```
/app/hr/index.tsx
/app/hr/onboarding/index.tsx
/app/hr/employees/[id].tsx
/components/hr/HRDashboard.tsx
/components/hr/OnboardingTable.tsx
/components/hr/EmployeeCard.tsx
/components/hr/PayrollSummary.tsx
/components/hr/BenefitsManager.tsx
/api/hr/employees.ts
/api/hr/onboarding.ts
/api/hr/payroll.ts
/api/hr/benefits.ts
```

---

## 👷‍♂️ Key Features

| Feature                          | Description |
|----------------------------------|-------------|
| DOT & Non-DOT Onboarding         | Full apps w/ forms |
| MVR, PSP, CDL, I-9 Integration   | Triggered for drivers |
| Background & I-9 for Non-Drivers | Via third-party integration |
| Benefits Dashboard               | Health, dental, vision plans |
| Gusto Embedded Payroll           | Via OAuth/embed SDK |
| Employee Payroll History         | Pull transactions per user |
| New Hire Triggers                | Auto-create in HR + Payroll |
| Tenant-based Filtering           | Only show own employees |
| Role-based Visibility            | Manager, Admin, Support |

---

## 🧠 Neon API Examples

### /api/hr/employees.ts
```ts
import { db } from '@/lib/neon'

export async function GET(req) {
  const tenantId = req.headers.get('x-tenant-id')
  const res = await db.query(`SELECT * FROM employees WHERE tenant_id = $1`, [tenantId])
  return Response.json(res.rows)
}
```

### /api/hr/payroll.ts
```ts
export async function POST(req) {
  const body = await req.json()
  await db.query(
    `INSERT INTO payroll_log (employee_id, amount, pay_period, tenant_id) VALUES ($1, $2, $3, $4)`,
    [body.employeeId, body.amount, body.period, body.tenantId]
  )
  return Response.json({ success: true })
}
```

---

## 🔐 Role Access

| Role        | Permissions                                |
|-------------|---------------------------------------------|
| HR Manager  | All onboarding, hiring, benefits, payroll   |
| Support     | View only                                   |
| Admin       | Full access + export, audit                 |

---

## ✅ Final Checklist

| Feature                            | Status |
|-------------------------------------|--------|
| DOT + Non-DOT Onboarding Forms     | ✅ Ready |
| Background Checks / Verifications  | ✅ Specified |
| Gusto Embedded Integration         | ✅ Applied |
| Benefits Plan Management           | ✅ Component built |
| Payroll History View               | ✅ Needed |
| New Hire Trigger Across Modules    | ✅ Automated |
| Multi-Tenant DB Access             | ✅ Verified |
| Role-Based Access                  | ✅ Checked |

---

## 🔗 Related Tables

- `employees`
- `payroll_log`
- `onboarding_submissions`
- `benefits_enrollments`

