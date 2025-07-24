
---

## 🔌 Integration Management – Fix & Upgrade Plan

The Integrations tab is critical for controlling what 3rd-party services tenants can access, including:

- ELD systems (e.g., Motive, Samsara)
- Load boards (DAT, Truckstop)
- Port/Terminal APIs
- QuickBooks / Xero
- AI Dispatcher
- SMS (Twilio), Email (SES)

---

### 🔧 Tables Required

**`integration_configs`**  
Stores active keys and statuses per company.

```sql
CREATE TABLE integration_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  companyId UUID NOT NULL,
  service VARCHAR NOT NULL,
  apiKey TEXT,
  enabled BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP DEFAULT now()
);
```

---

## 🧩 React Components

| Component                 | Description                                         |
|---------------------------|-----------------------------------------------------|
| `IntegrationList.tsx`    | Lists all integrations, status toggle               |
| `IntegrationForm.tsx`    | Pop-up/modal to add or update credentials           |
| `ELDIntegrationCard.tsx` | For displaying provider-specific options (Motive, etc.) |
| `QuickBooksConnect.tsx`  | OAuth + connection setup UI                         |

---

## 🔁 API Endpoints

| Endpoint                               | Method | Description                          |
|----------------------------------------|--------|--------------------------------------|
| `/api/integrations/:service`          | GET    | Get config for a service             |
| `/api/integrations/:service`          | POST   | Add/Update credentials               |
| `/api/integrations/:service/toggle`   | PATCH  | Enable/disable service               |
| `/api/integrations/list`              | GET    | List all available integrations      |

---

## 🎯 Logic Needed

- Only show integrations available to that tenant’s current **plan level**
- If integration requires OAuth (e.g., QuickBooks), redirect to authorization flow
- For simple key-based integrations (e.g., Port API, Twilio), allow direct form input

---

## 🛡️ Access Control

- Super Admins can manage all integrations
- Tenant Admins can view and toggle their company’s active integrations
- Webmasters can edit public integration setup defaults

---

## 🌟 Optional Upgrades

- Logs of last sync time, success/fail status
- Test button to validate integration on setup
- Set default integrations per plan level (`starter`, `pro`, `enterprise`)

---


---

## ✅ Final Integration Instructions for Settings Page

This section ensures the main `/settings` page and subroutes render and function properly across tenant dashboards.

---

### 🛠️ 1. Verify Settings Route Structure

**Main file:**
- `/app/settings/page.tsx` (or similar)

**Expected behavior:**
- Loads tabs or sidebar with links to submodules (Company, Users, Integrations, Security, Billing, Notifications, Preferences)

**Fix:**
- Ensure it uses `useLocation` (Wouter) to handle tab changes or conditional render
- Use proper layout wrapper (`SettingsLayout.tsx`)

---

### 🧩 2. Add or Fix Missing Component Pages

Verify or create:

- `/components/settings/CompanySettings.tsx`
- `/components/settings/UserManagement.tsx`
- `/components/settings/IntegrationManager.tsx`
- `/components/settings/SecuritySettings.tsx`
- `/components/settings/BillingPanel.tsx`
- `/components/settings/NotificationSettings.tsx`
- `/components/settings/SystemPreferences.tsx`

Each should use:
- `useEffect` to fetch settings by tenant
- `useState` or `react-hook-form` to manage form state
- `supabase.from('company_settings')` or related table for reads/writes

---

### 🔌 3. Ensure Each Tab is Functional

| Tab             | Checkpoint                            | Fix if missing                              |
|------------------|----------------------------------------|----------------------------------------------|
| Company Profile  | DOT/MC fields editable, save button    | `PUT /api/settings/company`                  |
| Users            | Role table shown, assign/edit buttons  | `GET/PUT /api/settings/users`               |
| Integrations     | Toggle switches, credential forms      | Sync with `integration_configs`             |
| Security         | 2FA options, password rules            | `GET/PUT /api/settings/security`            |
| Billing          | Show plan, upgrade, payment info       | Stripe + `company_subscriptions`            |
| Notifications    | Email/SMS toggles                      | Stored under `company_settings.notifications` |
| Preferences      | Date/time, language, layout style      | Stored under `company_settings.preferences`  |

---

### 🧪 4. Add Test Buttons or Feedback

- Each form should show success/failure alerts
- Integration test buttons should call `/api/integrations/:service/test` (optional but recommended)

---

### 🚫 5. Common Bugs to Fix

- [ ] Empty forms not populating (check tenant ID passing)
- [ ] Settings not saving to Supabase (verify API call + Supabase insert/update)
- [ ] Wouter `useLocation` not detecting or rerouting correctly


---

## 🌟 Assistant Recommendations to Enhance Settings Module

Beyond just fixing what’s broken, here are suggestions to improve performance, usability, and maintainability:

---

### 🔄 1. Real-Time Update Feedback
- Add a global `toast` alert system (e.g., `react-hot-toast`) for save success/failure
- Instant user feedback improves experience across all tabs

---

### 🧩 2. Modularize Each Settings Panel
- Use `SettingsSectionWrapper.tsx` to enforce a consistent layout
- Pass `title`, `description`, and `children` to make each section plug-and-play

---

### 🧪 3. Add “Test” Buttons for Critical Integrations
- E.g., “Test QuickBooks Connection”, “Test Load Board Login”
- Can validate API keys or OAuth success immediately

---

### 🧼 4. Clear Per-Setting Versioning or History (Optional)
- Table: `settings_history (companyId, settingKey, oldValue, newValue, changedBy, timestamp)`
- Useful for audit and rollback

---

### 📚 5. Provide Context Help or Tooltips
- Use a small info icon next to settings with a description tooltip
- Educates users without cluttering the interface

---

### 🔐 6. Add Visibility Controls Based on Role
- Not all users should see every setting
- Use RBAC to hide/show sections conditionally

---

### 📦 7. Auto-Save Feature (Optional)
- Instead of requiring a “Save” button, auto-save when inputs are blurred or changed

---

### 📈 8. Future: Sync Settings to Global Dashboard Themes
- Let user customize UI preferences (dark/light, layout grid style, etc.)
- Save to `company_settings.preferences`

---

This concludes the finalized settings module fix + enhancement guide.
