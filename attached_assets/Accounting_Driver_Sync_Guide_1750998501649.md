
# FreightOps Pro — Accounting ↔ Driver Integration Guide

This guide explains how to sync the Driver system with Accounting features to ensure accurate payroll, reimbursements, per-mile rates, and driver-level financial reports.

---

## 📊 Objective

Ensure that every driver:
- Has a corresponding financial account in the accounting module
- Is linked to their pay structure, mileage logs, reimbursements, and load profitability
- Can be filtered or summarized in reporting (Payroll, P&L, Load Profitability)

---

## 🔁 Sync Strategy

### 1. Driver Table Augmentation

Ensure the `drivers` table includes:
```ts
driverId: varchar PK,
companyId: varchar,
name: string,
payRate: number,           // hourly or per mile
payType: 'hourly' | 'mile',
reimbursements: number,    // total reimbursed YTD
assignedTruck: string,
active: boolean,
createdAt: timestamp
```

---

### 2. Link to Payroll Records

Every time a payroll run is created:
- For each driver in company:
  - Sum up hours (if hourly) or miles driven (if per-mile)
  - Calculate gross pay: `rate * hours` or `rate * miles`
  - Store in `payroll_entries` table:
```ts
payroll_entries (
  id,
  driverId,
  companyId,
  amount,
  payrollCycleId,
  notes
)
```

---

### 3. Driver Cost Reporting

Each accounting summary page (Load P&L, Company P&L) should include:
- **Driver Pay** as cost-of-goods
- **Driver Reimbursements** as expense category
- **Driver Time/Miles** pulled from load logs or ELD

---

### 4. Real-Time Sync Triggers (Optional)

On Supabase:
- Add `AFTER INSERT` and `AFTER UPDATE` triggers on `drivers` and `loads`
- Recalculate payroll previews or accounting dashboard stats

---

### 5. UI Implementation

In Accounting Dashboard:
- Add `Driver Summary Card` with:
  - Active drivers this month
  - Total paid YTD
  - Reimbursement totals
- In Payroll page:
  - Link to `driverId` for each payroll entry

---

## 🧪 QA Checklist

- [ ] Create driver → check if appears in payroll module
- [ ] Update rate → preview pay calculation
- [ ] Generate payroll → verify per-driver breakdown
- [ ] Load profitability includes labor cost from driver

---
