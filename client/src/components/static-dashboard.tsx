import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useLocation, Link } from "wouter";
import DashboardLayout from "./dashboard-layout";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import PageTransition from "./page-transition";
import ContentRouter from "./content-router";

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
        (width >= 1024 && /Chrome/.test(userAgent) && !/Mobile/.test(userAgent));
      
      // Set desktop mode if screen is wide OR if desktop site is specifically requested
      setIsDesktopMode(width >= 1024 || isDesktopRequest);
    };

    checkDesktopMode();
    window.addEventListener('resize', checkDesktopMode);
    return () => window.removeEventListener('resize', checkDesktopMode);
  }, []);

  return isDesktopMode;
}

// Contextual submenu component that shows different options based on current page
function ContextualSubmenu() {
  const [location] = useLocation();

  // Define submenu configurations for different page types
  const getSubmenuItems = () => {
    // Dashboard gets main overview items
    if (location === '/' || location === '/dashboard') {
      return [
        { href: '/financial-overview', label: 'Financial Overview' },
        { href: '/operations', label: 'Operations' },
        { href: '/fleet-status', label: 'Fleet Status' },
        { href: '/performance', label: 'Performance' },
        { href: '/banking-overview', label: 'Banking' },
        { href: '/security', label: 'Security' }
      ];
    }
    
    // Accounting section gets accounting-specific options
    if (location.startsWith('/accounting')) {
      return [
        { href: '/accounting', label: 'Dashboard' },
        { href: '/accounting/transactions', label: 'Transactions' },
        { href: '/accounting/reports', label: 'Reports' },
        { href: '/accounting/reconciliation', label: 'Reconciliation' },
        { href: '/accounting/tax', label: 'Tax Management' },
        { href: '/accounting/settings', label: 'Settings' }
      ];
    }
    
    // Banking section gets Novo-style banking options
    if (location.startsWith('/banking') || location.startsWith('/baas-banking') || location.startsWith('/enterprise-banking') || location.startsWith('/professional-banking') || location.startsWith('/secure-transfers')) {
      return [
        { href: '/banking/overview', label: 'Overview' },
        { href: '/banking/accounts', label: 'Accounts' },
        { href: '/banking/transfers', label: 'Transfers' },
        { href: '/banking/deposits', label: 'Deposits' },
        { href: '/banking/withdrawals', label: 'Withdrawals' },
        { href: '/banking/cards', label: 'Cards' },
        { href: '/banking/activity', label: 'Activity' },
        { href: '/banking/send-money', label: 'Send Money' }
      ];
    }
    
    // Billing section gets billing-specific options
    if (location.startsWith('/billing')) {
      return [
        { href: '/billing', label: 'Dashboard' },
        { href: '/billing/invoices', label: 'Invoices' },
        { href: '/billing/customers', label: 'Customers' },
        { href: '/billing/payments', label: 'Payments' },
        { href: '/billing/subscriptions', label: 'Subscriptions' },
        { href: '/billing/reports', label: 'Reports' }
      ];
    }
    
    // Operations section gets operations-specific options
    if (location.startsWith('/operations')) {
      return [
        { href: '/operations', label: 'Overview' },
        { href: '/operations/driver-management', label: 'Driver Management' },
        { href: '/operations/route-optimization', label: 'Route Optimization' },
        { href: '/operations/compliance', label: 'Compliance' }
      ];
    }
    
    // Dispatch section gets dispatch-specific options
    if (location.startsWith('/dispatch')) {
      return [
        { href: '/dispatch', label: 'Overview' },
        { href: '/dispatch/load-management', label: 'Load Management' },
        { href: '/dispatch/scheduling', label: 'Scheduling' },
        { href: '/dispatch/drivers', label: 'Drivers' },
        { href: '/dispatch/customers', label: 'Customers' },
        { href: '/dispatch/reports', label: 'Reports' },
        { href: '/dispatch/tracking', label: 'Live Tracking' }
      ];
    }
    
    // Fleet section gets fleet-specific options
    if (location.startsWith('/fleet')) {
      return [
        { href: '/fleet', label: 'Overview' },
        { href: '/fleet/vehicles', label: 'Vehicles' },
        { href: '/fleet/drivers', label: 'Drivers' },
        { href: '/fleet/maintenance', label: 'Maintenance' },
        { href: '/fleet/tracking', label: 'Live Tracking' }
      ];
    }
    
    // HR section gets HR-specific options
    if (location.startsWith('/hr')) {
      return [
        { href: '/hr', label: 'Dashboard' },
        { href: '/hr/employees', label: 'Employees' },
        { href: '/hr/onboarding', label: 'Onboarding' },
        { href: '/hr/compliance', label: 'Compliance' },
        { href: '/hr/payroll', label: 'Payroll' },
        { href: '/hr/benefits', label: 'Benefits' }
      ];
    }
    
    // Settings section gets settings-specific options
    if (location.startsWith('/settings')) {
      return [
        { href: '/settings', label: 'Company' },
        { href: '/settings/security', label: 'Security' },
        { href: '/settings/integrations', label: 'Integrations' },
        { href: '/settings/notifications', label: 'Notifications' },
        { href: '/settings/billing', label: 'Billing' },
        { href: '/settings/users', label: 'Users' }
      ];
    }
    
    // No submenu for other sections
    return [];
  };

  const submenuItems = getSubmenuItems();
  
  // Always render with consistent height to prevent jumping
  return (
    <div className="bg-slate-800 px-6 py-2 h-[48px] flex items-center">
      {submenuItems.length > 0 ? (
        <nav className="flex space-x-6 overflow-x-auto w-full">
          {submenuItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors duration-200 py-2 border-b-2 whitespace-nowrap ${
                location === item.href 
                  ? 'text-white border-blue-500' 
                  : 'text-slate-300 hover:text-white border-transparent hover:border-blue-500'
              }`}
            >
              {item.label}
            </Link>
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

export default function StaticDashboard() {
  const { user, isLoading: userLoading, error: userError } = useAuth();
  const { toast } = useToast();
  const isDesktopMode = useDesktopMode();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [title, setTitle] = useState("Dashboard");
  const [description, setDescription] = useState("Comprehensive business operations overview");

  // Fetch companies for the current user
  const { 
    data: companies, 
    isLoading: companiesLoading, 
    error: companiesError 
  } = useQuery({
    queryKey: ["/api/companies"],
    enabled: !!user && !userError
  });

  // Handle auth error
  useEffect(() => {
    if (userError && isUnauthorizedError(userError)) {
      window.location.href = "/api/logout";
      return;
    }
  }, [userError]);

  // Handle companies error
  useEffect(() => {
    if (companiesError && !isUnauthorizedError(companiesError)) {
      toast({
        variant: "destructive",
        title: "Error loading companies",
        description: "There was a problem loading your company information.",
      });
      return;
    }
  }, [companiesError, toast]);

  // Set default company if available
  useEffect(() => {
    if (companies && Array.isArray(companies) && companies.length > 0 && !selectedCompanyId) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId]);

  // Show loading state
  if (userLoading || companiesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show error state if no companies
  if (!companies || !Array.isArray(companies) || companies.length === 0) {
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

  const selectedCompany = Array.isArray(companies) ? companies.find((c: any) => c.id === selectedCompanyId) : null;

  return (
    <div className="flex flex-col h-screen">
      {/* Top Header - static with contextual submenu */}
      <header className="bg-slate-900 shadow-sm border-b border-slate-700 flex-shrink-0">
        {/* Main header bar */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {description && (
              <p className="text-sm text-slate-300 mt-1">{description}</p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="hidden xl:flex border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
              Export Report
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              New Load
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-300 hover:bg-slate-700 hover:text-white">
              <Bell className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <img
                className="w-8 h-8 rounded-full"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
                alt={user ? `${user.firstName || 'User'} ${user.lastName || ''}` : "User"}
              />
              <span className="text-sm font-medium text-white">
                {user ? `${user.firstName || 'User'} ${user.lastName || ''}` : "User"}
              </span>
            </div>
          </div>
        </div>
        
        {/* Submenu navigation - contextual to current page */}
        <ContextualSubmenu />
      </header>

      {/* Page Content - Dynamic content area that changes without reload */}
      <main className="flex-1 overflow-y-auto bg-gray-50 min-h-0">
        <div className="transition-all duration-300 ease-in-out">
          <ContentRouter 
            title={title} 
            setTitle={setTitle} 
            setDescription={setDescription}
            user={user}
          />
        </div>
      </main>
    </div>
  );
}