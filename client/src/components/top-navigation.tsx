import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Bell, Search, Settings, Plus, Filter, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopNavigationProps {
  user?: any;
}

const moduleSubNavigation = {
  "/dispatch": [
    { name: "Load Board", href: "/dispatch", active: true },
    { name: "Active Loads", href: "/dispatch/active" },
    { name: "Create Load", href: "/dispatch/create" },
    { name: "Route Planning", href: "/dispatch/routes" },
    { name: "Driver Assignment", href: "/dispatch/assignments" }
  ],
  "/fleet": [
    { name: "Driver List", href: "/fleet", active: true },
    { name: "Applications", href: "/fleet/applications" },
    { name: "Performance", href: "/fleet/performance" },
    { name: "Onboarding", href: "/fleet/onboarding" },
    { name: "Documents", href: "/fleet/documents" }
  ],
  "/billing": [
    { name: "Customer Portal", href: "/billing", active: true },
    { name: "Invoices", href: "/billing/invoices" },
    { name: "Payment History", href: "/billing/payments" },
    { name: "Credit Management", href: "/billing/credit" },
    { name: "Rate Sheets", href: "/billing/rates" }
  ],
  "/payroll": [
    { name: "Payroll Dashboard", href: "/payroll", active: true },
    { name: "Pay Statements", href: "/payroll/statements" },
    { name: "Tax Documents", href: "/payroll/tax" },
    { name: "Benefits", href: "/payroll/benefits" },
    { name: "Time Tracking", href: "/payroll/time" }
  ],
  "/accounting": [
    { name: "Financial Overview", href: "/accounting", active: true },
    { name: "Expenses", href: "/accounting/expenses" },
    { name: "Revenue Tracking", href: "/accounting/revenue" },
    { name: "Tax Preparation", href: "/accounting/tax" },
    { name: "Financial Reports", href: "/accounting/reports" }
  ],
  "/reporting": [
    { name: "Business Intelligence", href: "/reporting", active: true },
    { name: "Operational Reports", href: "/reporting/operations" },
    { name: "Financial Reports", href: "/reporting/financial" },
    { name: "Driver Reports", href: "/reporting/drivers" },
    { name: "Custom Reports", href: "/reporting/custom" }
  ],
  "/hr": [
    { name: "Employee Management", href: "/hr", active: true },
    { name: "Recruitment", href: "/hr/recruitment" },
    { name: "Training Programs", href: "/hr/training" },
    { name: "Performance Reviews", href: "/hr/performance" },
    { name: "Compliance", href: "/hr/compliance" }
  ],
  "/integrations": [
    { name: "System Integrations", href: "/integrations", active: true },
    { name: "ELD Systems", href: "/integrations/eld" },
    { name: "Load Boards", href: "/integrations/loadboards" },
    { name: "Banking & Finance", href: "/integrations/banking" },
    { name: "API Management", href: "/integrations/api" }
  ],
  "/settings": [
    { name: "Company Settings", href: "/settings", active: true },
    { name: "User Management", href: "/settings/users" },
    { name: "Security", href: "/settings/security" },
    { name: "Notifications", href: "/settings/notifications" },
    { name: "Billing Settings", href: "/settings/billing" }
  ]
};

export default function TopNavigation({ user }: TopNavigationProps) {
  const [location] = useLocation();
  
  // Get the base path for determining which module we're in
  const pathParts = location.split("/");
  const basePath = pathParts[1] ? "/" + pathParts[1] : "/";
  
  // No sub-navigation for dashboard (/) - return empty array
  if (basePath === "/") {
    return null; // Don't render top navigation for dashboard
  }
  
  const currentSubNav = moduleSubNavigation[basePath as keyof typeof moduleSubNavigation] || [];

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Sub Navigation */}
        <div className="flex items-center space-x-1">
          {currentSubNav.map((item) => {
            const isActive = location === item.href || (item.active && location === basePath);
            return (
              <Button
                key={item.name}
                variant="ghost"
                size="sm"
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-all duration-200 relative",
                  isActive
                    ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
                onClick={() => window.location.href = item.href}
              >
                {item.name}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </Button>
            );
          })}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          {/* Module-specific action buttons */}
          {basePath === "/dispatch" && (
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Load
            </Button>
          )}
          
          {basePath === "/fleet" && (
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Driver
            </Button>
          )}
          
          {basePath === "/billing" && (
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          )}

          {basePath === "/reporting" && (
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}

          {/* Universal actions */}
          <Button variant="ghost" size="sm">
            <Search className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm">
            <Filter className="h-4 w-4" />
          </Button>
          
          {/* Bell notification removed per user request */}
          
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}