import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Search, Menu } from "lucide-react";

interface HQTopNavigationProps {
  user?: any;
  onMenuToggle?: () => void;
}

const getSubMenuItems = (pathname: string) => {
  if (pathname.startsWith('/hq/admin') || pathname === '/dashboard') {
    return [
      { label: 'Overview', href: '/hq/admin' },
      { label: 'System Health', href: '/hq/admin/health' },
      { label: 'Platform Metrics', href: '/hq/admin/metrics' }
    ];
  }
  
  if (pathname.startsWith('/hq/companies')) {
    return [
      { label: 'All', href: '/hq/companies' },
      { label: 'Trial', href: '/hq/companies/trial' },
      { label: 'Active', href: '/hq/companies/active' },
      { label: 'Suspended', href: '/hq/companies/suspended' }
    ];
  }
  
  if (pathname.startsWith('/hq/billing')) {
    return [
      { label: 'Overview', href: '/hq/billing' },
      { label: 'Subscriptions', href: '/hq/billing/subscriptions' },
      { label: 'Invoices', href: '/hq/billing/invoices' },
      { label: 'Reports', href: '/hq/billing/reports' }
    ];
  }
  
  if (pathname.startsWith('/hq/integrations')) {
    return [
      { label: 'All Integrations', href: '/hq/integrations' },
      { label: 'API Keys', href: '/hq/integrations/keys' },
      { label: 'Webhooks', href: '/hq/integrations/webhooks' },
      { label: 'Logs', href: '/hq/integrations/logs' }
    ];
  }
  
  if (pathname.startsWith('/hq/support')) {
    return [
      { label: 'Tickets', href: '/hq/support' },
      { label: 'Live Chat', href: '/hq/support/chat' },
      { label: 'Knowledge Base', href: '/hq/support/kb' },
      { label: 'Analytics', href: '/hq/support/analytics' }
    ];
  }
  
  if (pathname.startsWith('/hq/settings')) {
    return [
      { label: 'General', href: '/hq/settings' },
      { label: 'Preferences', href: '/hq/settings/preferences' },
      { label: 'Roles', href: '/hq/settings/roles' },
      { label: 'Keys', href: '/hq/settings/keys' },
      { label: 'Alerts', href: '/hq/settings/alerts' }
    ];
  }
  
  return [];
};

const getPageTitle = (pathname: string) => {
  if (pathname.startsWith('/hq/admin') || pathname === '/dashboard') return 'Dashboard';
  if (pathname.startsWith('/hq/companies')) return 'Tenant Management';
  if (pathname.startsWith('/hq/billing')) return 'Billing & Revenue';
  if (pathname.startsWith('/hq/integrations')) return 'Integrations';
  if (pathname.startsWith('/hq/support')) return 'Support Center';
  if (pathname.startsWith('/hq/settings')) return 'Platform Settings';
  return 'FreightOps HQ';
};

const getPageDescription = (pathname: string) => {
  if (pathname.startsWith('/hq/admin') || pathname === '/dashboard') return 'Platform oversight and management';
  if (pathname.startsWith('/hq/companies')) return 'Manage tenant companies and onboarding';
  if (pathname.startsWith('/hq/billing')) return 'Monitor revenue and subscription management';
  if (pathname.startsWith('/hq/integrations')) return 'Manage third-party integrations and APIs';
  if (pathname.startsWith('/hq/support')) return 'Customer support and ticket management';
  if (pathname.startsWith('/hq/settings')) return 'Configure platform settings and preferences';
  return 'Administrative control panel';
};

export default function HQTopNavigation({ user, onMenuToggle }: HQTopNavigationProps) {
  const [location] = useLocation();
  const subMenuItems = getSubMenuItems(location);
  const pageTitle = getPageTitle(location);
  const pageDescription = getPageDescription(location);

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Main Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-sm text-gray-600 mt-1">{pageDescription}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            System Operational
          </Badge>
          <Button variant="ghost" size="sm">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Sub Navigation */}
      {subMenuItems.length > 0 && (
        <div className="border-t border-gray-100">
          <div className="flex items-center px-6 py-2 space-x-1 overflow-x-auto">
            {subMenuItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`whitespace-nowrap ${
                    isActive 
                      ? "bg-blue-600 text-white hover:bg-blue-700" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => window.location.href = item.href}
                >
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}