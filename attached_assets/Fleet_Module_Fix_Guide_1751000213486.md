
# 📦 FreightOps Pro — Fleet Module Production Readiness Guide

This document outlines **everything Replit needs to do** to fix and finalize the Fleet module for production usage in a TMS-grade application.

---

## ✅ Core Goals

1. Multi-tenant-safe fleet views
2. Role-based access
3. Real-time ELD Hours of Service (HOS) sync
4. Driver & truck assignment logic
5. Compliance, audit, and document tracking
6. TMS enhancements (fuel, maintenance, live map)

---

## 🔧 Fix Instructions by Area

### 1. Fleet Page (`src/pages/fleet.tsx`)
- [ ] Replace with the fixed version provided: `fleet_fixed.tsx`
- [ ] Confirm `useAuth()` and `useLocation()` are working
- [ ] Ensure `Tabs` don't reset state on tab switch
- [ ] Show action buttons:
  - **Add Truck/Trailer** → `/fleet-management`
  - **Add Driver** → `/hr-onboarding`
- [ ] Inject “Compliance Alerts” mock card with:
  - CDL expiration
  - ELD limit exceed
  - Maintenance overdue

---

### 2. Tenant Scope & RBAC
- [ ] Wrap all DB calls in Supabase with `companyId === user.companyId`
- [ ] Restrict page access to roles: `"fleet-admin"`, `"dispatcher"`, `"manager"`

---

### 3. Equipment Table & Drivers Table
- [ ] `EquipmentTable`: Fix sorting, add filter by active/inactive
- [ ] `DriversTable`: Show assigned truck, HOS available hours
- [ ] Add buttons: Edit, Assign/Unassign

---

### 4. ELD & Hours of Service Integration
- [ ] Add `/api/eld/logs` to fetch daily logs per driver
- [ ] Audit if `hoursDrivenToday > 11` or `workHoursLast8Days > 70`
- [ ] Block assignment if driver is out-of-hours
- [ ] Allow override by admin with warning prompt

---

### 5. Truck & Driver Creation
- [ ] Ensure `/fleet-management` has working create/edit UI for:
  - Truck
  - Trailer
- [ ] Ensure `/hr-onboarding` form allows DOT driver creation
- [ ] Assign new drivers to fleet role automatically

---

### 6. Compliance Enhancements
- [ ] Track:
  - Expiring CDLs, medical cards, inspections
- [ ] Display badge alerts on:
  - Driver rows (e.g. CDL expired)
  - Truck rows (e.g. maintenance due)

---

### 7. Live Map
- [ ] Confirm Google Maps API is connected in `.env`
- [ ] Track vehicle position via GPS/ELD source
- [ ] Show trucks with driver name and current load

---

## 🧪 QA Checklist

- [ ] Log in as tenant → View own fleet
- [ ] Add new driver → Show in table
- [ ] Assign truck → Save & persist to DB
- [ ] Show compliance alerts
- [ ] Live Map loads correctly

---

## 📎 File to Replace

- Replace `src/pages/fleet.tsx` with:
  - [`fleet_fixed.tsx`](fleet_fixed.tsx)

---

## 🔐 Required Env Variables

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
SUPABASE_URL=your_instance_url
SUPABASE_ANON_KEY=your_anon_key
```

---

