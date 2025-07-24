
# ✅ Full Implementation: Load Creation with Dispatch Integration

This guide explains how to upgrade the FreightOps Pro Load Creation system to include dispatch planning, multi-driver leg assignments, and real-time sync with the driver app and dispatcher calendar.

---

## 🔧 1. Database Tables Required

### `loads` (existing)
Core load details.

### `dispatch_legs`
Stores pickup/drop/transfer/return legs of a load.

```sql
CREATE TABLE dispatch_legs (
  id SERIAL PRIMARY KEY,
  loadId VARCHAR NOT NULL,
  driverId VARCHAR,
  truckId VARCHAR,
  trailerId VARCHAR,
  chassisId VARCHAR,
  actionType VARCHAR CHECK (actionType IN ('pickup', 'dropoff', 'move', 'return')),
  location VARCHAR,
  eta TIMESTAMP,
  etd TIMESTAMP,
  completed BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT now()
);
```

### `load_assignments`
Maps drivers to load segments for analytics and scheduling.

```sql
CREATE TABLE load_assignments (
  id SERIAL PRIMARY KEY,
  loadId VARCHAR NOT NULL,
  driverId VARCHAR NOT NULL,
  truckId VARCHAR,
  trailerId VARCHAR,
  startTime TIMESTAMP,
  endTime TIMESTAMP,
  assignmentNotes TEXT,
  createdAt TIMESTAMP DEFAULT now()
);
```

---

## 🧩 2. UI Enhancements in Load Creation Form

### Add New Step: "📦 Dispatch Planner"

- Add a button: `+ Add Dispatch Leg`
- Each leg should allow:
  - `actionType` (pickup, dropoff, etc.)
  - `driverId` (from driver list)
  - `truckId`, `trailerId`, `chassisId` (optional)
  - `ETA`, `ETD`
  - `location`

### Add Toggle: "👥 Multi-Driver Load?"

- If enabled, form shows table of `legs` and driver per leg
- Allow editable timeline entries for each leg

---

## ⚙️ 3. Backend Logic at Load Submission

1. Insert new row in `loads`
2. Insert all planned `dispatch_legs`
3. For each driver used, create `load_assignments` entry

```ts
await supabase.from('loads').insert(newLoad);

for (const leg of dispatchLegs) {
  await supabase.from('dispatch_legs').insert(leg);
}

for (const driver of involvedDrivers) {
  await supabase.from('load_assignments').insert(driverAssignment);
}
```

---

## 📱 4. Sync with Driver App

In the mobile app:
- Query `dispatch_legs` where `driverId = current user`
- Group by `loadId`
- Display: action, location, ETA
- Driver can tap "Mark as Complete"

---

## 🗓️ 5. Dispatcher Calendar Sync

Scheduled Loads page:
- Pull `dispatch_legs` by date
- Render per driver with status color
- Optionally show asset tag (truck/chassis)

---

## 🔄 6. Real-Time Updates

Use Supabase subscriptions:
- Dispatchers see leg completion in real time
- Drivers are notified of updates (assignment change, cancellation)

---

## 🛠️ 7. Optional Upgrades

- Leg reorder via drag-and-drop
- Status field per leg: "In Progress", "Onsite", "Delayed"
- Add log audit per leg (arrival, departure timestamps)
- Allow dispatcher override or reassignment

---

## ✅ Outcome

You now have a smart load creation form that:
- Builds dispatch legs and timelines
- Handles multi-driver handoff
- Syncs to calendar and driver apps
- Ensures dispatcher visibility at every step

Use this to replace the current static load creation system.

---

## 🧩 React Component Structure for Dispatch-Integrated Load Creation

This section describes all React components needed to build the new load creation flow.

### 1. `CreateLoadForm.tsx`
Main wrapper component. Handles:
- Trailer type selection
- General fields
- Conditional trailer-specific components
- Dispatch planner
- Submission

### 2. `GeneralLoadFields.tsx`
Universal fields:
- Load number
- Customer
- Pickup/dropoff
- Rate, reference numbers, weight, hazmat

### 3. `TrailerTypeFields/` Folder
Renders only relevant fields for selected trailer type:
- `ContainerFields.tsx`
- `ReeferFields.tsx`
- `FlatbedFields.tsx`
- `TankerFields.tsx`
- `DryVanFields.tsx`

Each receives and updates form state.

### 4. `DispatchPlanner.tsx`
Dynamic leg planning inside load form:
- `+ Add Leg` button
- Select: driver, truck, trailer, chassis
- Action type: pickup/drop/move
- ETA / ETD
- Remove leg

### 5. `useLoadForm.ts` (optional)
Manages:
- State and validation
- Field change handling
- Submission logic for Supabase

### 6. `dispatchUtils.ts`
Utility functions to:
- Insert into `loads`, `dispatch_legs`, and `load_assignments`
- Batch inserts
- Handle errors and rollback

---

## 📱 Driver App Integration

### `DriverMobileView.tsx`
Shows all `dispatch_legs` where `driverId` matches current user:
- Action
- ETA / location
- “Mark Complete” button

---

## 📅 Dispatcher Calendar

### `ScheduledLoadsCalendar.tsx`
Calendar view for dispatchers:
- Render by date
- Color by driver or status
- Optional: allow rescheduling with drag-and-drop

---

## Optional Add-Ons

| Feature                  | Component              |
|--------------------------|------------------------|
| Import Rate Con (PDF)    | `RateConUploader.tsx` + OCR |
| Batch Load Creation      | `BatchLoadForm.tsx`    |
| Load Progress Tracker    | `LoadTimeline.tsx`     |

All components use Supabase for DB operations and context-aware tenant access.
