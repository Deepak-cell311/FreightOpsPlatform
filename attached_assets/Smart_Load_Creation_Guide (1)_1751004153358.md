
# 🚛 Smart Load Creation System (For Replit Implementation)

This document outlines how to build a smart, dynamic load creation system inside FreightOps Pro using React (Vite) and Supabase. It adapts fields based on trailer type and includes container logic, chassis integration, and optional Express Pass workflows.

---

## 1. 📋 Trailer Type Selection

Add a `Select` component to determine which fieldset to show.

```tsx
<Select value={trailerType} onChange={e => setTrailerType(e.target.value)}>
  <option value="">Select Trailer Type</option>
  <option value="container">Container</option>
  <option value="reefer">Reefer</option>
  <option value="tanker">Tanker</option>
  <option value="flatbed">Flatbed</option>
  <option value="dryvan">Dry Van</option>
</Select>
```

---

## 2. 📦 Conditional Fieldsets (React Components)

### Container Fields
```tsx
{trailerType === "container" && (
  <ContainerFields
    containerNumber={containerNumber}
    bolNumber={bolNumber}
    portOfLoading={portOfLoading}
    vesselName={vesselName}
    chassisType={chassisType}
    ...
  />
)}
```

Repeat for `<ReeferFields />`, `<FlatbedFields />`, etc.

---

## 3. 🔄 Smart Chassis Logic

Auto-select chassis provider/type based on Steamship Line (`ssl`):

```tsx
const chassisLogic = {
  "MSC": { provider: "TRAC", type: "Standard" },
  "CMA CGM": { provider: "DCLI", type: "Standard" },
  "Hapag-Lloyd": { provider: "FlexiVan", type: "Triaxle" },
};

useEffect(() => {
  if (ssl) {
    const result = chassisLogic[ssl];
    setChassisProvider(result?.provider);
    setChassisType(result?.type);
  }
}, [ssl]);
```

---

## 4. ⚡ Express Pass Workflow (Houston Terminals)

- Add a checkbox: `expressPassRequired`
- Show dropdown: `terminal` (e.g., Barbours Cut, Bayport)
- On submit: trigger backend function to generate express pass
- Store metadata in `express_pass_requests` table (optional)

---

## 5. 🧱 Required Database Fields (loads table)

Ensure `loads` table includes:

```sql
trailerType VARCHAR,
containerNumber VARCHAR,
portOfLoading VARCHAR,
vesselName VARCHAR,
ssl VARCHAR,
chassisType VARCHAR,
chassisProvider VARCHAR,
chassisFreeDays INTEGER,
chassisPerDiemRate NUMERIC,
containerFreeDays INTEGER,
containerDemurrageRate NUMERIC,
expressPassRequired BOOLEAN,
terminal VARCHAR,
...
```

---

## 6. ✅ Submission Flow

POST to `/api/loads/create` (or Supabase insert) with:
- All conditional fields based on trailer type
- Always include `companyId`, `userId` for tenancy

---

## 7. 🧩 Modular Components

Split form into:
- `GeneralLoadFields.tsx`
- `ContainerFields.tsx`
- `ReeferFields.tsx`
- `FlatbedFields.tsx`
- `TankerFields.tsx`

Use `trailerType` to conditionally mount.

---

## ✅ Final Notes

- Wrap form in a modal or drawer
- Prefill fields when duplicating an existing load
- Use Zod or Yup for per-trailer validation schemas

This is now a production-grade system for containerized, reefer, and specialized load workflows in a TMS.


---

## 🚀 Load Creation Enhancements

### 1. 🧾 Create Load from Load Confirmation (Rate Con)

Add functionality to create a load by importing or parsing a load confirmation:

#### UI Additions
- Button: `Import Load Confirmation`
- Accept PDF, TXT, or pasted text

#### Backend/Logic
- Use PDF.js or OCR parser (optional via API route or Supabase function)
- Extract fields: `pickupLocation`, `dropoffLocation`, `commodity`, `rate`, `referenceNumber`
- Auto-populate form fields on `Create Load` modal
- Save parsed documents in `load_documents` table (optional)

---

### 2. 📦 Batch Load Creation

Allow user to create multiple similar loads in one go:

#### UI Additions
- Toggle: `Batch Load Creation`
- Field: `Number of Loads`
- Table or expandable form with editable rows (each representing a load)

#### Backend Logic
```ts
for (let i = 0; i < loadCount; i++) {
  await supabase.from('loads').insert({ ...rowData[i] });
}
```

#### Optional Enhancements
- Upload loads via CSV or Excel template
- “Duplicate this load” X times with changes to: containerNumber, rate, chassisId, etc.

---

