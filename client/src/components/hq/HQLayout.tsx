import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useSessionTimeout } from "@/hooks/use-session-timeout";
import { useEffect, useState } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link, useLocation } from "wouter";
import { HQSidebar } from "./HQSidebar";
import { HQTopNavigation } from "./HQTopNavigation";
import { Button } from "@/components/ui/button";
import { Bell, Menu } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import PageTransition from "../page-transition";
import { AlertNotificationSystem } from "../alert-notification-system";
import { HQOverview } from './HQOverview';
import { TenantManager } from './TenantManager';
import { TenantOnboarding } from './TenantOnboarding';
import { TenantBilling } from './TenantBilling';
import { TenantAnalytics } from './TenantAnalytics';
import { SupportTickets } from './SupportTickets';
import { SupportKnowledge } from './SupportKnowledge';
import { SupportAnalytics } from './SupportAnalytics';
import { RevenueDashboard } from './RevenueDashboard';
import { BankingConsole } from './BankingConsole';
import { FeatureUsage } from './FeatureUsage';

// Placeholder components for missing routes
const RevenueAnalytics = () => (
  <div className="p-6">
    <h2 className="text-xl font-bold mb-4">Revenue Analytics</h2>
    <p className="text-gray-600">Detailed revenue analysis and forecasting</p>
  </div>
);

const RevenueSubscriptions = () => (
  <div className="p-6">
    <h2 className="text-xl font-bold mb-4">Revenue Subscriptions</h2>
    <p className="text-gray-600">Manage subscription plans and billing cycles</p>
  </div>
);

const RevenuePayments = () => (
  <div className="p-6">
    <h2 className="text-xl font-bold mb-4">Revenue Payments</h2>
    <p className="text-gray-600">Track payment processing and transactions</p>
  </div>
);

const BankingAccounts = () => (
  <div className="p-6">
    <h2 className="text-xl font-bold mb-4">Banking Accounts</h2>
    <p className="text-gray-600">Manage tenant banking accounts and connections</p>
  </div>
);

const BankingTransactions = () => (
  <div className="p-6">
    <h2 className="text-xl font-bold mb-4">Banking Transactions</h2>
    <p className="text-gray-600">Monitor banking transactions and transfers</p>
  </div>
);

const BankingCompliance = () => (
  <div className="p-6">
    <h2 className="text-xl font-bold mb-4">Banking Compliance</h2>
    <p className="text-gray-600">Ensure banking compliance and regulatory requirements</p>
  </div>
);

// HQ Contextual Submenu - shows different options based on current HQ section
function HQContextualSubmenu() {
  const [location, setLocation] = useLocation();

  const getHQSubmenuItems = () => {
    if (location.startsWith('/hq/tenants')) {
      return [
        { href: '/hq/tenants', label: 'All Tenants' },
        { href: '/hq/tenants/onboarding', label: 'Onboarding' },
        { href: '/hq/tenants/billing', label: 'Billing' },
        { href: '/hq/tenants/analytics', label: 'Analytics' }
      ];
    }
    
    if (location.startsWith('/hq/revenue') || location.startsWith('/hq/billing')) {
      return [
        { href: '/hq/revenue', label: 'Overview' },
        { href: '/hq/revenue/analytics', label: 'Analytics' },
        { href: '/hq/revenue/subscriptions', label: 'Subscriptions' },
        { href: '/hq/revenue/payments', label: 'Payments' }
      ];
    }
    
    if (location.startsWith('/hq/support')) {
      return [
        { href: '/hq/support', label: 'Tickets' },
        { href: '/hq/support/knowledge', label: 'Knowledge Base' },
        { href: '/hq/support/analytics', label: 'Analytics' }
      ];
    }
    
    if (location.startsWith('/hq/banking')) {
      return [
        { href: '/hq/banking', label: 'Overview' },
        { href: '/hq/banking/accounts', label: 'Accounts' },
        { href: '/hq/banking/transactions', label: 'Transactions' },
        { href: '/hq/banking/compliance', label: 'Compliance' }
      ];
    }
    
    return [];
  };

  const submenuItems = getHQSubmenuItems();
  
  if (submenuItems.length === 0) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="px-6 py-2">
        <nav className="flex space-x-6 overflow-x-auto">
          {submenuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  location === item.href
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {item.label}
              </a>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

interface HQLayoutProps {
  user?: any;
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export function HQLayout({ user, title, description, children }: HQLayoutProps) {
  const { toast } = useToast();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize session timeout for HQ users
  const { triggerActivity } = useSessionTimeout({
    timeoutMinutes: 30,
    warningMinutes: 5,
    checkIntervalSeconds: 60
  });

  // Determine page title and description based on route
  const getPageTitle = () => {
    if (title) return title;
    if (location === '/hq' || location.startsWith('/hq/dashboard')) return 'FreightOps HQ Dashboard';
    if (location.startsWith('/hq/tenants')) return 'Tenant Management';
    if (location.startsWith('/hq/support')) return 'Support Center';
    if (location.startsWith('/hq/billing') || location.startsWith('/hq/revenue')) return 'Revenue Dashboard';
    if (location.startsWith('/hq/banking')) return 'Banking Console';
    if (location.startsWith('/hq/features')) return 'Feature Usage';
    return 'FreightOps HQ';
  };

  const getPageDescription = () => {
    if (description) return description;
    if (location === '/hq' || location.startsWith('/hq/dashboard')) return 'Platform oversight and management dashboard';
    if (location.startsWith('/hq/tenants')) return 'Manage tenant companies and onboarding';
    if (location.startsWith('/hq/support')) return 'Customer support and ticket management';
    if (location.startsWith('/hq/billing') || location.startsWith('/hq/revenue')) return 'Revenue analytics and billing management';
    if (location.startsWith('/hq/banking')) return 'Banking operations and account management';
    if (location.startsWith('/hq/features')) return 'Feature adoption and usage analytics';
    return 'Administrative control panel';
  };

  const renderContent = () => {
    if (children) return children;
    
    // Map URLs to content components with exact path matching
    switch (location) {
      // Dashboard routes
      case '/hq':
      case '/hq/dashboard':
        return <HQOverview />;
      
      // Tenant management routes  
      case '/hq/tenants':
        return <TenantManager />;
      case '/hq/tenants/onboarding':
        return <TenantOnboarding />;
      case '/hq/tenants/billing':
        return <TenantBilling />;
      case '/hq/tenants/analytics':
        return <TenantAnalytics />;
      
      // Support routes
      case '/hq/support':
        return <SupportTickets />;
      case '/hq/support/knowledge':
        return <SupportKnowledge />;
      case '/hq/support/analytics':
        return <SupportAnalytics />;
      
      // Revenue & billing routes
      case '/hq/revenue':
      case '/hq/billing':
        return <RevenueDashboard />;
      case '/hq/revenue/analytics':
        return <RevenueAnalytics />;
      case '/hq/revenue/subscriptions':
        return <RevenueSubscriptions />;
      case '/hq/revenue/payments':
        return <RevenuePayments />;
      
      // Banking routes
      case '/hq/banking':
        return <BankingConsole />;
      case '/hq/banking/accounts':
        return <BankingAccounts />;
      case '/hq/banking/transactions':
        return <BankingTransactions />;
      case '/hq/banking/compliance':
        return <BankingCompliance />;
      
      // Feature usage routes
      case '/hq/features':
      case '/hq/usage':
        return <FeatureUsage />;
      
      // Default to dashboard
      default:
        return <HQOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" onClick={() => triggerActivity()}>
      <AlertNotificationSystem />
      
      {/* Desktop Layout */}
      <div className="hidden lg:flex lg:h-screen">
        {/* HQ Sidebar */}
        <HQSidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* HQ Top Navigation */}
          <HQTopNavigation user={user} title={getPageTitle()} description={getPageDescription()} />
          
          {/* HQ Contextual Submenu */}
          <HQContextualSubmenu />
          
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <PageTransition>
              {renderContent()}
            </PageTransition>
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">FreightOps HQ</h1>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed left-0 top-0 w-64 h-full bg-white dark:bg-gray-800">
              <HQSidebar />
            </div>
          </div>
        )}

        {/* Mobile Content */}
        <main className="p-4">
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{getPageTitle()}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">{getPageDescription()}</p>
          </div>
          <PageTransition>
            {renderContent()}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}