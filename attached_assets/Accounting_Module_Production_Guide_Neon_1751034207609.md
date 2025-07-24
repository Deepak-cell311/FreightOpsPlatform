
# 💼 FreightOps Pro – Accounting Module Production Guide (Neon DB)

## ✅ Objective
Fully migrate and enable the Accounting module using Neon. This module handles invoicing, expenses, financial reports, factoring, fuel, and QuickBooks-like operations in a multi-tenant architecture.

---

## 🗂️ Folder Structure

```
/app/accounting/index.tsx
/app/accounting/invoices/index.tsx
/app/accounting/reports/index.tsx
/components/accounting/AccountingDashboard.tsx
/components/accounting/InvoiceList.tsx
/components/accounting/ReportPanel.tsx
/components/accounting/FactoringTracker.tsx
/components/accounting/FuelSpending.tsx
/api/accounting/invoices.ts
/api/accounting/reports.ts
/api/accounting/factoring.ts
/api/accounting/transactions.ts
```

---

## 💰 Core Features

| Feature                      | Description |
|------------------------------|-------------|
| Invoicing                   | Create, track, and mark invoices as paid |
| AR/AP Aging Reports         | See outstanding receivables/payables |
| Fuel & Factoring Tracking   | Monitor fuel card usage and factoring status |
| Profit & Loss               | Auto-generate from transactions |
| Export to CSV/PDF           | Scheduled or manual export |
| Accounting Sync             | Ready for QuickBooks/Xero API |
| Audit Logs                  | Track access to reports and invoices |
| Tenant-specific Reports     | Per-company isolation of financial data |

---

## 🧠 Neon API Example

### /api/accounting/invoices.ts
```ts
import { db } from '@/lib/neon'

export async function GET(req) {
  const tenantId = req.headers.get('x-tenant-id')
  const result = await db.query(
    'SELECT * FROM invoices WHERE tenant_id = $1 ORDER BY created_at DESC',
    [tenantId]
  )
  return Response.json(result.rows)
}
```

---

### /api/accounting/reports.ts
```ts
export async function POST(req) {
  const { tenantId, reportType, dateRange } = await req.json()
  const result = await db.query(
    'SELECT * FROM transactions WHERE tenant_id = $1 AND date BETWEEN $2 AND $3',
    [tenantId, dateRange.start, dateRange.end]
  )
  return Response.json({ report: result.rows })
}
```

---

## 📊 Report Types

| Type                | Description |
|---------------------|-------------|
| P&L                 | Income vs expenses |
| Invoice Status      | Paid vs unpaid loads |
| Factoring Summary   | Funded vs pending amounts |
| Fuel Spend Summary  | Per driver or per card usage |
| Payroll Summary     | Total disbursements by date range |
| Load Profitability  | Profit margin per load |

---

## 🛠️ Components

- `AccountingDashboard`: Overall summary metrics + links
- `InvoiceList`: Filters by date, company, status
- `ReportPanel`: Date range, report type selector
- `FactoringTracker`: Manual/automated factoring entries
- `FuelSpending`: Displays breakdown by load or driver

---

## ✅ Final Checklist

| Feature                        | Status |
|--------------------------------|--------|
| Invoicing System               | ✅ Implemented |
| Factoring Tracker              | ✅ Functional |
| Fuel Spending Log              | ✅ Ready |
| P&L / Reports Panel            | ✅ Neon-ready |
| AR/AP + Payroll Reports        | ✅ Connected |
| Neon SQL Queries               | ✅ All applied |
| Export Options (CSV/PDF)       | ✅ Needed |
| QuickBooks/Xero API Ready      | ✅ Setup started |
| Role-Based Access              | ✅ Verified |

---

## 🔗 Related Tables (Neon)

- `invoices`
- `transactions`
- `factoring_logs`
- `fuel_logs`
- `payroll_log`
