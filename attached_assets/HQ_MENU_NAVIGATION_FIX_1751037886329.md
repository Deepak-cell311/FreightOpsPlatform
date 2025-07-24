# HQ Module Navigation Fix Guide

## Current Issue
The HQ module loads but the side menu and sub-menu navigation are not displaying properly. The current implementation uses a single page component with hardcoded routing logic instead of a proper sidebar navigation structure.

## Required Side Menu Structure

### Main Navigation Items
```
Dashboard
├── Overview
├── System Health
└── Platform Metrics

Companies
├── All Companies
├── Company Management
├── Onboarding Pipeline
└── Compliance Status

Users
├── All Users
├── User Management
├── Role Management
└── Access Control

Banking
├── Platform Accounts
├── Money Transfers
├── Transaction Monitoring
└── Compliance Reports

Analytics
├── Revenue Analytics
├── Usage Analytics
├── Performance Metrics
└── Custom Reports

Settings
├── Platform Settings
├── System Configuration
├── API Management
└── Security Settings
```

## Implementation Requirements

### 1. Create HQ Sidebar Component
Location: `client/src/components/hq/HQSidebar.tsx`

```typescript
interface HQSidebarItem {
  icon: LucideIcon;
  label: string;
  href: string;
  subItems?: {
    label: string;
    href: string;
  }[];
}

const sidebarItems: HQSidebarItem[] = [
  {
    icon: BarChart3,
    label: "Dashboard",
    href: "/hq/dashboard",
    subItems: [
      { label: "Overview", href: "/hq/dashboard" },
      { label: "System Health", href: "/hq/dashboard/health" },
      { label: "Platform Metrics", href: "/hq/dashboard/metrics" }
    ]
  },
  {
    icon: Building2,
    label: "Companies",
    href: "/hq/companies",
    subItems: [
      { label: "All Companies", href: "/hq/companies" },
      { label: "Company Management", href: "/hq/companies/manage" },
      { label: "Onboarding Pipeline", href: "/hq/companies/onboarding" },
      { label: "Compliance Status", href: "/hq/companies/compliance" }
    ]
  },
  {
    icon: Users,
    label: "Users",
    href: "/hq/users",
    subItems: [
      { label: "All Users", href: "/hq/users" },
      { label: "User Management", href: "/hq/users/manage" },
      { label: "Role Management", href: "/hq/users/roles" },
      { label: "Access Control", href: "/hq/users/access" }
    ]
  },
  {
    icon: CreditCard,
    label: "Banking",
    href: "/hq/banking",
    subItems: [
      { label: "Platform Accounts", href: "/hq/banking/accounts" },
      { label: "Money Transfers", href: "/hq/banking/transfers" },
      { label: "Transaction Monitoring", href: "/hq/banking/transactions" },
      { label: "Compliance Reports", href: "/hq/banking/compliance" }
    ]
  },
  {
    icon: Activity,
    label: "Analytics",
    href: "/hq/analytics",
    subItems: [
      { label: "Revenue Analytics", href: "/hq/analytics/revenue" },
      { label: "Usage Analytics", href: "/hq/analytics/usage" },
      { label: "Performance Metrics", href: "/hq/analytics/performance" },
      { label: "Custom Reports", href: "/hq/analytics/reports" }
    ]
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/hq/settings",
    subItems: [
      { label: "Platform Settings", href: "/hq/settings" },
      { label: "System Configuration", href: "/hq/settings/system" },
      { label: "API Management", href: "/hq/settings/api" },
      { label: "Security Settings", href: "/hq/settings/security" }
    ]
  }
];
```

### 2. Update HQ Layout Structure
Location: `client/src/components/hq/HQLayout.tsx`

Replace the current tab-based layout with a proper sidebar navigation layout:

```typescript
export function HQLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 transition-all duration-300`}>
        <HQSidebar collapsed={sidebarCollapsed} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-semibold">FreightOps HQ</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                System Operational
              </Badge>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### 3. Create Individual Page Components
Create separate components for each main section:

- `client/src/components/hq/pages/HQDashboard.tsx`
- `client/src/components/hq/pages/HQCompanies.tsx`
- `client/src/components/hq/pages/HQUsers.tsx`
- `client/src/components/hq/pages/HQBanking.tsx`
- `client/src/components/hq/pages/HQAnalytics.tsx`
- `client/src/components/hq/pages/HQSettings.tsx`

### 4. Update Routing in App.tsx
Add proper routing for all HQ subroutes:

```typescript
// Add to Router component
<Route path="/hq/:section?/:subsection?" component={HQAdmin} />
```

### 5. Update HQ Admin Component
Location: `client/src/pages/hq-admin.tsx`

Remove the hardcoded content rendering and replace with proper route-based component rendering:

```typescript
function HQAdmin() {
  const [location] = useLocation();
  const { isAuthenticated, user } = useAuth();
  
  // Extract section and subsection from URL
  const pathParts = location.split('/').filter(Boolean);
  const section = pathParts[1] || 'dashboard';
  const subsection = pathParts[2];
  
  const renderContent = () => {
    switch (section) {
      case 'dashboard':
        return <HQDashboard subsection={subsection} />;
      case 'companies':
        return <HQCompanies subsection={subsection} />;
      case 'users':
        return <HQUsers subsection={subsection} />;
      case 'banking':
        return <HQBanking subsection={subsection} />;
      case 'analytics':
        return <HQAnalytics subsection={subsection} />;
      case 'settings':
        return <HQSettings subsection={subsection} />;
      default:
        return <HQDashboard />;
    }
  };
  
  return (
    <HQLayout>
      {renderContent()}
    </HQLayout>
  );
}
```

## Key Features to Implement

### 1. Collapsible Sidebar
- Toggle between expanded (264px) and collapsed (64px) states
- Show icons only when collapsed
- Smooth transition animations

### 2. Active State Management
- Highlight current page and section
- Show expanded submenu for active section
- Breadcrumb navigation in header

### 3. Responsive Design
- Mobile: Overlay sidebar that can be toggled
- Desktop: Fixed sidebar with collapse functionality
- Tablet: Adaptive layout based on screen size

### 4. Sub-menu Expansion
- Expand/collapse sub-menus on click
- Show active sub-item highlighting
- Persist expanded state during navigation

### 5. User Context
- Show current user info in sidebar footer
- Role-based menu item visibility
- Quick access to user profile and logout

## CSS Classes Needed

```css
/* Add to global CSS */
.hq-sidebar-transition {
  transition: width 0.3s ease-in-out;
}

.hq-menu-item {
  @apply flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors;
}

.hq-menu-item.active {
  @apply bg-blue-50 text-blue-700 font-medium;
}

.hq-submenu-item {
  @apply flex items-center gap-3 px-6 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors;
}

.hq-submenu-item.active {
  @apply text-blue-600 bg-blue-50 font-medium;
}
```

## Implementation Priority

1. **High Priority**: Create HQSidebar component with basic navigation
2. **High Priority**: Update HQLayout to use sidebar instead of tabs
3. **Medium Priority**: Implement individual page components
4. **Medium Priority**: Add sub-menu functionality
5. **Low Priority**: Add responsive design and animations

This structure will provide a professional, enterprise-grade navigation experience consistent with modern admin dashboards.