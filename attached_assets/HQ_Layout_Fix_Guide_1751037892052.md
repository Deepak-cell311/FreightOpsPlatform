
# 🧠 FreightOps HQ Layout Fix Guide – Production Navigation Structure

This guide outlines how to replace the broken tab-based navigation with a production-ready **side + top menu system** consistent with the FreightOps UX design.

---

## 🔍 Problem Summary

The current HQ dashboard incorrectly uses a static `TabMenu` for core navigation. This breaks the expected admin panel behavior and leads to:
- Inconsistent layout UX
- Lack of hierarchy between main sections and subpages
- Poor user experience when switching between modules

---

## ✅ Correct Navigation Structure

### 1. Persistent Sidebar Navigation (Left)
Use a `Sidebar.tsx` component to provide global navigation across HQ modules.

```tsx
const navigationItems = [
  { title: 'Dashboard', icon: 'Home', href: '/hq/dashboard' },
  { title: 'Tenants', icon: 'Users', href: '/hq/tenants' },
  { title: 'Billing', icon: 'CreditCard', href: '/hq/billing' },
  { title: 'Integrations', icon: 'Plug', href: '/hq/integrations' },
  { title: 'Support', icon: 'LifeBuoy', href: '/hq/support' },
  { title: 'Settings', icon: 'Settings', href: '/hq/settings' }
]
```

---

### 2. Dynamic Top Sub-Menu
Create a `TopSubMenu.tsx` component that changes based on the current main section.

Example:
- At `/hq/settings` ➜ Submenu: General | Preferences | Roles | Keys | Alerts
- At `/hq/tenants` ➜ Submenu: All | Trial | Active | Suspended

Detect current section via `usePathname()` or `useRouter()`:
```tsx
if (pathname.startsWith('/hq/settings')) {
  renderSubMenu(['General', 'Preferences', 'Roles'])
}
```

---

## 🧱 Component Structure

```
/components/layout/
├── HQLayout.tsx        → wraps Sidebar + TopSubMenu + page content
├── Sidebar.tsx         → left nav
├── TopSubMenu.tsx      → dynamic top nav based on section
```

Each HQ page should be wrapped like:
```tsx
<HQLayout>
  <CurrentPageContent />
</HQLayout>
```

---

## 🛠️ Tasks for Replit

| Task | Description |
|------|-------------|
| ✅ Remove `TabMenu.tsx` | No longer used |
| ✅ Create `Sidebar.tsx` | Based on above navItems |
| ✅ Create `TopSubMenu.tsx` | Render dynamic submenus using route |
| ✅ Add `HQLayout.tsx` | Layout wrapper for all /hq pages |
| ✅ Wrap all HQ pages in HQLayout | Dashboard, Tenants, Billing, etc. |
| ✅ Add selected styling | Highlight active sidebar and submenu |

---

## 🧪 Test Cases

- ✅ Navigate between main sections → sidebar updates
- ✅ Navigate within submenus → top menu updates
- ✅ Responsive behavior (collapse on mobile)
- ✅ Back button / direct link navigation works cleanly

---

## 🔧 Optional Upgrades

- Add breadcrumb trail (optional)
- Persist active state in session storage
- Animate submenu transitions

---

This structure follows modern admin UX and will align with the rest of FreightOps Pro design standards.

