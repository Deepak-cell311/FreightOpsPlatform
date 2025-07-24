import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useSessionTimeout } from "@/hooks/use-session-timeout";
import { useEffect, useState } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link, useLocation } from "wouter";
import Sidebar from "./sidebar";
import TenantSidebar from "./tenant-sidebar";
import TopNavigation from "./top-navigation";
import { Button } from "@/components/ui/button";
import { Bell, Menu } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import PageTransition from "./page-transition";
import { AlertNotificationSystem } from "./alert-notification-system";

// Contextual submenu component that shows different options based on current page
function ContextualSubmenu() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  // Get banking activation status
  const { data: bankingStatus } = useQuery<{
    isActivated: boolean;
    hasApplication: boolean;
    applicationStatus: string;
  }>({
    queryKey: ['/api/banking/activation-status'],
    enabled: !!user,
    retry: false
  });

  // Define submenu configurations for different page types
  const getSubmenuItems = () => {
    // No submenu for dashboard - show main overview directly
    
    if (location === '/accounting' || location.startsWith('/accounting')) {
      return [
        { href: '/accounting', label: 'Dashboard' },
        { href: '/accounting/transactions', label: 'Transactions' },
        { href: '/accounting/reports', label: 'Reports' },
        { href: '/accounting/reconciliation', label: 'Reconciliation' },
        { href: '/accounting/tax', label: 'Tax Management' },
        { href: '/accounting/settings', label: 'Settings' }
      ];
    }
    
    if (location.startsWith('/banking') || location.startsWith('/wallet') || location.startsWith('/baas-banking') || location.startsWith('/enterprise-banking') || location.startsWith('/professional-banking') || location.startsWith('/secure-transfers')) {
      // Only show banking submenu items if banking is activated
      if (bankingStatus?.isActivated) {
        return [
          { href: '/banking/overview', label: 'Overview' },
          { href: '/banking/accounts', label: 'Accounts' },
          { href: '/banking/transfers', label: 'Transfers & Payments' },
          { href: '/banking/deposits', label: 'Deposits' },
          { href: '/banking/withdrawals', label: 'Withdrawals' },
          { href: '/banking/cards', label: 'Virtual Cards' },
          { href: '/banking/activity', label: 'Activity' }
        ];
      } else {
        // Show only basic banking setup when not activated
        return [
          { href: '/banking', label: 'Banking Setup' },
          { href: '/banking/application-status', label: 'Application Status' }
        ];
      }
    }
    
    if (location === '/billing' || location.startsWith('/billing')) {
      return [
        { href: '/billing', label: 'Dashboard' },
        { href: '/billing/invoices', label: 'Invoices' },
        { href: '/billing/customers', label: 'Customers' },
        { href: '/billing/payments', label: 'Payments' },
        { href: '/billing/reports', label: 'Reports' }
      ];
    }
    
    if (location === '/dispatch' || location.startsWith('/dispatch')) {
      return [
        { href: '/dispatch', label: 'Overview' },
        { href: '/dispatch/load-management', label: 'Load Management' },
        { href: '/dispatch/scheduling', label: 'Scheduling' },
        { href: '/dispatch/drivers', label: 'Drivers' },
        { href: '/dispatch/customers', label: 'Customers' },
        { href: '/dispatch/reports', label: 'Reports' }
      ];
    }
    
    if (location === '/fleet' || location.startsWith('/fleet')) {
      return [
        { href: '/fleet', label: 'Overview' },
        { href: '/fleet/vehicles', label: 'Vehicles' },
        { href: '/fleet/maintenance', label: 'Maintenance' },
        { href: '/fleet/inspections', label: 'Inspections' },
        { href: '/fleet/drivers', label: 'Drivers' },
        { href: '/fleet/fuel', label: 'Fuel' },
        { href: '/fleet/compliance', label: 'Compliance' }
      ];
    }
    
    if (location === '/hr' || location.startsWith('/hr')) {
      return [
        { href: '/hr', label: 'Dashboard' },
        { href: '/hr/employees', label: 'Employees' },
        { href: '/hr/onboarding', label: 'Onboarding' },
        { href: '/hr/payroll', label: 'Payroll' },
        { href: '/hr/compliance', label: 'Compliance' },
        { href: '/hr/benefits', label: 'Benefits' }
      ];
    }
    
    // Wallet functionality moved to banking section
    
    if (location === '/operations' || location.startsWith('/operations')) {
      return [
        { href: '/operations', label: 'Overview' },
        { href: '/operations/loads', label: 'Load Management' },
        { href: '/operations/drivers', label: 'Driver Status' },
        { href: '/operations/vehicles', label: 'Vehicle Status' },
        { href: '/operations/performance', label: 'Performance' },
        { href: '/operations/reports', label: 'Reports' }
      ];
    }
    
    if (location === '/performance' || location.startsWith('/performance')) {
      return [
        { href: '/performance', label: 'Overview' },
        { href: '/performance/drivers', label: 'Driver Performance' },
        { href: '/performance/vehicles', label: 'Vehicle Performance' },
        { href: '/performance/efficiency', label: 'Fuel Efficiency' },
        { href: '/performance/delivery', label: 'Delivery Metrics' },
        { href: '/performance/safety', label: 'Safety Metrics' }
      ];
    }
    
    if (location === '/financial-overview' || location.startsWith('/financial')) {
      return [
        { href: '/financial-overview', label: 'Overview' },
        { href: '/financial/revenue', label: 'Revenue' },
        { href: '/financial/expenses', label: 'Expenses' },
        { href: '/financial/profitability', label: 'Profitability' },
        { href: '/financial/cash-flow', label: 'Cash Flow' },
        { href: '/financial/forecasting', label: 'Forecasting' }
      ];
    }
    
    if (location === '/fleet-status' || location.startsWith('/fleet-status')) {
      return [
        { href: '/fleet-status', label: 'Overview' },
        { href: '/fleet-status/active', label: 'Active Vehicles' },
        { href: '/fleet-status/maintenance', label: 'Maintenance' },
        { href: '/fleet-status/utilization', label: 'Utilization' },
        { href: '/fleet-status/assignments', label: 'Assignments' }
      ];
    }
    
    if (location === '/security' || location.startsWith('/security')) {
      return [
        { href: '/security', label: 'Overview' },
        { href: '/security/access', label: 'Access Control' },
        { href: '/security/audit', label: 'Audit Logs' },
        { href: '/security/compliance', label: 'Compliance' },
        { href: '/security/alerts', label: 'Security Alerts' }
      ];
    }

    if (location === '/settings' || location.startsWith('/settings')) {
      return [
        { href: '/settings', label: 'General' },
        { href: '/settings/security', label: 'Security' },
        { href: '/settings/profile', label: 'Profile' },
        { href: '/settings/notifications', label: 'Notifications' }
      ];
    }
    
    return [];
  };

  const submenuItems = getSubmenuItems();
  
  // Always render with consistent height to prevent jumping
  return (
    <div className="bg-slate-800 px-6 py-2 h-[48px] flex items-center">
      {submenuItems.length > 0 ? (
        <nav className="flex space-x-6 overflow-x-auto w-full">
          {submenuItems.map((item) => (
            <button
              key={item.href}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setLocation(item.href);
              }}
              className={`text-sm font-medium transition-colors duration-200 py-2 border-b-2 whitespace-nowrap cursor-pointer ${
                location === item.href 
                  ? 'text-white border-blue-500' 
                  : 'text-slate-300 hover:text-white border-transparent hover:border-blue-500'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      ) : (
        <div className="text-slate-400 text-sm">
          {/* Empty state to maintain consistent height */}
        </div>
      )}
    </div>
  );
}

// Enhanced desktop mode detection for mobile browsers requesting desktop site
function useDesktopMode() {
  const [isDesktopMode, setIsDesktopMode] = useState(false);

  useEffect(() => {
    const checkDesktopMode = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent;
      
      // Check if user agent indicates desktop mode request
      const isDesktopRequest = 
        // Safari on iOS when "Request Desktop Website" is enabled
        (/iPad|iPhone|iPod/.test(userAgent) && !/Mobile/.test(userAgent)) ||
        // Chrome on Android when "Desktop site" is enabled - more specific check
        (/Android/.test(userAgent) && !/Mobile/.test(userAgent) && !/wv/.test(userAgent)) ||
        // Additional Chrome desktop mode indicators
        (/Chrome/.test(userAgent) && /Android/.test(userAgent) && width >= 1024) ||
        // Screen width is desktop size
        width >= 1024 ||
        // Tablet or larger in landscape with sufficient width
        (width >= 768 && width > height && width >= 1024);
      
      setIsDesktopMode(isDesktopRequest);
    };

    checkDesktopMode();
    window.addEventListener('resize', checkDesktopMode);
    window.addEventListener('orientationchange', checkDesktopMode);

    return () => {
      window.removeEventListener('resize', checkDesktopMode);
      window.removeEventListener('orientationchange', checkDesktopMode);
    };
  }, []);

  return isDesktopMode;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export default function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  const { user, isLoading: userLoading, isAuthenticated, logoutMutation } = useAuth();
  const { toast } = useToast();
  const isDesktopMode = useDesktopMode();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [location] = useLocation();

  // Initialize session timeout with 2-hour timeout and 5-minute warning
  const { triggerActivity, getRemainingTime } = useSessionTimeout({
    timeoutMinutes: 120,
    warningMinutes: 5,
    checkIntervalSeconds: 60
  });

  // Skip authentication for demo purposes
  // useEffect(() => {
  //   if (!userLoading && !isAuthenticated) {
  //     toast({
  //       title: "Unauthorized", 
  //       description: "You are logged out. Logging in again...",
  //       variant: "destructive",
  //     });
  //     setTimeout(() => {
  //       window.location.href = "/api/login";
  //     }, 500);
  //     return;
  //   }
  // }, [isAuthenticated, userLoading, toast]);

  // Check if current path is HQ route
  const isHQRoute = location.startsWith('/hq');
  
  // Check if user is HQ admin
  const isHQAdmin = user?.role === 'platform_owner' || 
                   user?.role === 'hq_admin' || 
                   user?.role === 'super_admin';
  
  // Only fetch companies for HQ routes and HQ admins, never for tenant routes
  const { data: companies, isLoading: companiesLoading, error: companiesError } = useQuery({
    queryKey: ["/api/companies"],
    enabled: !!user && (isHQRoute || isHQAdmin), // Only enable for HQ routes or HQ admins
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (companiesError && isUnauthorizedError(companiesError)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [companiesError, toast]);

  // Set default company if available (only for HQ admins)
  useEffect(() => {
    if (isHQAdmin && companies && Array.isArray(companies) && companies.length > 0 && !selectedCompanyId) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId, isHQAdmin]);

  // Show loading state
  if (userLoading || (isHQAdmin && companiesLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show error state if no companies (only for HQ admins)
  if (isHQAdmin && (!companies || !Array.isArray(companies) || companies.length === 0)) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-orange-500" />
              <h1 className="text-2xl font-bold text-gray-900">No Company Found</h1>
            </div>
            <p className="mt-4 text-sm text-gray-600 mb-4">
              You need to be associated with a company to access the dashboard.
            </p>
            <Button onClick={() => window.location.href = "/api/logout"}>
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedCompany = Array.isArray(companies) ? companies.find((c: any) => c && c.id === selectedCompanyId) : null;

  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-x-auto">
      {/* Sidebar - Always visible */}
      {isHQAdmin ? (
        <Sidebar user={user} company={selectedCompany} />
      ) : (
        <TenantSidebar user={user} />
      )}
      
      {/* Main Content Area - positioned next to sidebar */}
      <div className="flex flex-col flex-1 min-w-0 w-full">
        {/* Top Header - connected to sidebar with submenu */}
        <header className="bg-slate-900 shadow-sm border-b border-slate-700 flex-shrink-0">
          {/* Main header bar - Fixed height to prevent resizing */}
          <div className="flex items-center justify-between px-6 py-4 h-[80px]">
            <div className="min-h-[48px] flex flex-col justify-center">
              <h1 className="text-2xl font-bold text-white truncate max-w-[400px]">{title}</h1>
              <div className="h-[20px] flex items-center">
                {description && (
                  <p className="text-sm text-slate-300 truncate max-w-[500px]">{description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4 h-[48px]">
              <div className="flex items-center space-x-2 min-w-[120px]">
                <AlertNotificationSystem />
                <img
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
                  alt={user ? `${user.firstName || 'User'} ${user.lastName || ''}` : "User"}
                />
                <span className="text-sm font-medium text-white truncate max-w-[100px]">
                  {user ? `${user.firstName || 'User'} ${user.lastName || ''}` : "User"}
                </span>
              </div>
            </div>
          </div>
          
          {/* Submenu navigation - contextual to current page */}
          <ContextualSubmenu />
        </header>

        {/* Page Content - Fixed height to prevent jumping */}
        <main className="flex-1 overflow-y-auto bg-gray-50 min-h-0 w-full min-w-0">
          <PageTransition>
            {children}
          </PageTransition>
          
          {/* Footer with Logo */}
          <footer className="bg-white border-t border-gray-200 py-4 px-6 mt-8">
            <div className="flex justify-center">
              <img 
                src="/@assets/file_000000002eb461fd852b4b0e04724190_1749352807925.png" 
                alt="Company Logo" 
                className="h-8 object-contain opacity-60"
              />
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
