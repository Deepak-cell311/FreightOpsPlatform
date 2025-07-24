
# Dispatch Module: Container Load Form Upgrade

This guide explains how to integrate the updated container-specific fields into the Dispatch load creation form using the `professional-loads-table.tsx` component.

---

## ✅ What Was Added

- A **Container Load** toggle (via `isContainer` boolean state).
- Conditional fields shown **only when Container Load is enabled**:
  - `Container Number`
  - `Port of Loading`
  - `Port of Discharge`
  - `Vessel Name`
  - `Rail Routing`
  - `Chassis Required` (checkbox)
  - `Customs Clearance Required` (checkbox)

---

## 🧩 How It Works

- Uses `useState` to manage container-related inputs.
- Injected inside the `<form>` block within the modal.
- Form submission supports container data.

---

## 🔧 Developer Instructions

1. Replace the existing `professional-loads-table.tsx` file in:
   ```
   client/src/components/
   ```
   with the file provided:
   - `professional-loads-table-final.tsx`

2. Add any missing imports:
   ```tsx
   import { Input } from "@/components/ui/input";
   ```

3. Verify the load modal shows a **toggle** or UI switch for "Container Load" (hooked to `isContainer`).

4. Ensure container fields are passed to backend API on submit.

---

## 📌 Notes

- You may also connect `/dispatch/containers` for listing these separately.
- Future feature: link Port Credentials and Container Visibility.

