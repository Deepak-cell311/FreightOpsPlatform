
# 🧠 FreightOps HQ Module – Production Deployment & Migration Guide (Neon)

## 🔧 1. DATABASE MIGRATION FROM SUPABASE ➜ NEON

**Setup Instructions**
- Create Neon DB project: `hq_platform`
- Enable connection pooling
- Migrate the following tables:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE hq_tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL,
  tenant_name VARCHAR NOT NULL,
  subscription_tier VARCHAR NOT NULL,
  monthly_revenue DECIMAL(10,2),
  user_count INTEGER DEFAULT 0,
  feature_usage JSONB DEFAULT '{}',
  last_activity TIMESTAMP,
  health_score DECIMAL(3,2) DEFAULT 0.0,
  risk_level VARCHAR DEFAULT 'low',
  support_tier VARCHAR DEFAULT 'standard',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE hq_system_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_type VARCHAR NOT NULL,
  metric_name VARCHAR NOT NULL,
  metric_value DECIMAL(15,2),
  measurement_date DATE NOT NULL,
  tenant_id UUID REFERENCES hq_tenants(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE hq_support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  ticket_number VARCHAR UNIQUE NOT NULL,
  subject VARCHAR NOT NULL,
  description TEXT,
  priority VARCHAR DEFAULT 'medium',
  status VARCHAR DEFAULT 'open',
  assigned_to VARCHAR,
  customer_email VARCHAR,
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  resolved_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE hq_banking_overview (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  unit_account_id VARCHAR,
  account_status VARCHAR,
  account_balance DECIMAL(12,2) DEFAULT 0,
  monthly_volume DECIMAL(15,2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  risk_score DECIMAL(3,2) DEFAULT 0.0,
  compliance_status VARCHAR DEFAULT 'compliant',
  last_transaction TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE hq_feature_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  feature_name VARCHAR NOT NULL,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMP,
  usage_trend VARCHAR DEFAULT 'stable',
  billing_impact DECIMAL(8,2) DEFAULT 0,
  recorded_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
```

## ⚙️ 2. API ROUTES

```ts
// /api/hq/tenants
const tenants = await db.query('SELECT * FROM hq_tenants');

// /api/hq/support/tickets
await db.query('INSERT INTO hq_support_tickets (...) VALUES (...)');
```

Guard with:
```ts
if (!session || session.role !== 'hq_admin') return res.status(403);
```

## 🧩 3. COMPONENTS TO BUILD OR FIX

| Component           | Description                                     |
|--------------------|-------------------------------------------------|
| `HQOverview.tsx`    | KPIs, tenant usage, churn trendline             |
| `TenantManager.tsx` | Table of tenants with controls (suspend, edit)  |
| `RevenueDashboard.tsx` | Stripe-based revenue chart + CAC calculator |
| `SupportTickets.tsx` | Open/resolved tickets, reply UI, escalate     |
| `BankingConsole.tsx`  | Balance + Unit banking sync                   |
| `FeatureUsage.tsx`    | Table + graph of per-tenant feature usage     |

## 🔐 4. ROLE/AUTH GUARD

Check `user.role === 'hq_admin' || 'platform_owner'` before granting access. Store user roles in:
- Neon `users` table
- Session token and middleware guard

## 🔁 5. UPGRADE SUGGESTIONS

- Suspend or pause tenant directly
- Broadcast update messages platform-wide
- Alert center with KPIs and escalation notices
- LTV / CAC metrics with tracking
- Mobile summary panel (`/hq/mobile`)

## 🔌 6. INTEGRATIONS TO ENABLE

| Integration  | Description                            |
|--------------|----------------------------------------|
| Stripe       | Track plan, revenue, payments          |
| Unit API     | Show balances + compliance             |
| QuickBooks   | Sync tiers, financials, metrics        |
| Twilio       | SMS alerts for critical support events |

## ✅ 7. MASTER CHECKLIST

| Issue                      | Solution                                     |
|---------------------------|----------------------------------------------|
| 🚫 Supabase queries fail   | Replace with Neon `pg` queries                |
| 🔒 Broken auth             | Use session-based auth guards                 |
| ❌ Missing components      | Build missing TSX files from table above      |
| ⚠️ Banking UI errors       | Replace `useSupabase` with `useNeon` context  |
| ❌ No metrics visible      | Build query for `hq_system_metrics`           |
| 🔄 No integration sync     | Enable sync jobs for Unit, Stripe             |

## 📁 8. FILE STRUCTURE SUGGESTION

```
/app/hq/
  dashboard/
  tenants/
  banking/
  support/
  metrics/
/components/hq/
  HQOverview.tsx
  SupportTickets.tsx
/lib/neon.ts
/context/UserContext.tsx
```

## 📌 Final Notes

- This MD is all Replit needs to repair the HQ module
- Supports full Neon backend
- All components, APIs, tables, and fixes included


---

## 🧠 Recommended Upgrades for HQ Module

### 1. 📡 Global Activity Feed
Track all platform-wide activity across tenants and admins.

**Table:**
```sql
CREATE TABLE hq_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID,
  user_id UUID,
  action_type VARCHAR,
  description TEXT,
  ip_address VARCHAR,
  timestamp TIMESTAMP DEFAULT now()
);
```

**Component:** `/components/hq/ActivityFeed.tsx`

---

### 2. 🧠 AI-Powered Tenant Risk Scoring
Calculate and track behavior-based risk over time.

**Add to:** `hq_tenants.risk_score`, `last_login`, and `login_frequency`.

**Metrics to Include:**
- Login frequency decline
- Failed payments
- Escalated tickets
- Plan downgrade events

---

### 3. 🧪 Feature Flag Management
Enable/disable features per tenant.

**Table:**
```sql
CREATE TABLE hq_feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID,
  feature_key VARCHAR,
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);
```

**UI:** Switches in `TenantManager.tsx`  
**Logic:** Use feature flags to conditionally enable UI features.

---

### 4. 🚨 Escalation Ladder for Support
Auto-prioritize unresolved tickets.

**Logic:**
- If status = 'open' and created > 48h → escalate
- Alert assigned_to via email or Twilio
- Add `sla_timer` field in ticket UI

---

### 5. 🕵️‍♂️ Tenant Audit Viewer
Quick access to tenant summary and logs.

**Modal Fields:**
- Active users
- Last login
- Monthly revenue
- Active fleet / drivers
- Latest support tickets

---

### 6. 📉 Smart Churn Tracker
Track why users cancel.

**Add to:** `hq_tenants.churn_reason`  
**Graph:** `/components/hq/RevenueDashboard.tsx` (churn reasons by month)

---

### 7. 💰 Dynamic Billing Simulator
Simulate impact of pricing changes.

**UI Input:**
- Active tenants
- Plan distribution
- Add-on usage

**Output:**
- Simulated MRR
- CAC recovery window
- Feature cost impact

---

### 8. 🛡 Compliance Dashboard
Rollup from various compliance checks.

**Checks:**
- Banking status
- ELD log failures
- DOT onboarding audit

**Visual:**
- ✅ Compliant
- ⚠️ Warning
- ❌ At Risk

---

These upgrades can dramatically increase platform oversight, security, and financial forecasting.

