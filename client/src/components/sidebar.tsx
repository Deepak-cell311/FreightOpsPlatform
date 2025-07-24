import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  LayoutDashboard,
  Truck,
  Users,
  Wallet,
  Calculator,
  Settings,
  CreditCard,
  Receipt,
  Navigation,
  Route,
  LogOut,
  User,
  Moon,
  Sun,
  ChevronUp,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
}

// HQ Admin Navigation - Full system access with oversight functions
const hqAdminNavigation: NavigationItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Companies", href: "/hq/companies", icon: Users },
  { name: "Banking", href: "/banking", icon: CreditCard },
  { name: "Accounting", href: "/accounting", icon: Calculator },
  { name: "HR", href: "/hr", icon: Users },
  { name: "Analytics", href: "/hq/analytics", icon: Calculator },
  { name: "System Health", href: "/hq/system-health", icon: Settings },
  { name: "Support", href: "/hq/support", icon: Users },
];

// Regular User Navigation - Full FreightOps functionality
const userNavigation: NavigationItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Dispatch", href: "/dispatch", icon: Route },
  { name: "Fleet", href: "/fleet", icon: Truck },
  { name: "Billing", href: "/billing", icon: Receipt },
  { name: "Accounting", href: "/accounting", icon: Calculator },
  { name: "Banking", href: "/banking", icon: CreditCard },
  { name: "Payroll", href: "/payroll", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  user?: any;
  company?: any;
}

export default function Sidebar({ user, company }: SidebarProps) {
  const [location] = useLocation();
  const [, setLocation] = useLocation();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Determine which navigation to show based on user role
  const isHQAdmin = user?.role === 'hq_admin' || user?.role === 'admin' || user?.role === 'super_admin';
  const navigation = isHQAdmin ? hqAdminNavigation : userNavigation;

  const isActiveRoute = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    // Clear any stored auth tokens
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    // Redirect to login or home page
    setLocation('/login');
  };

  const NavigationContent = () => (
    <div className="flex flex-col h-full bg-slate-900 shadow-lg">
      {/* Logo */}
      <div className="flex items-center px-4 py-6">
        <div className="flex items-center justify-center">
          <img 
            src="/@assets/file_000000002eb461fd852b4b0e04724190_1749352807925.png" 
            alt="Company Logo" 
            className="h-12 lg:h-16 object-contain filter brightness-0 invert"
          />
        </div>
      </div>

      {/* Company Info & Trial Counter */}
      {company && (
        <div className="px-4 mb-6 pb-4 border-b border-slate-700">
          <div className="text-sm space-y-2">
            <p className="font-medium text-white truncate">{company.name}</p>
            <p className="text-xs text-slate-400">DOT: {company.dotNumber}</p>
            {company.subscriptionTier !== 'enterprise' && (
              <div className="bg-orange-900/50 text-orange-300 px-2 py-1 rounded text-xs">
                Trial: {Math.max(0, 30 - Math.floor((Date.now() - new Date(company.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24)))} days left
              </div>
            )}
            {company.subscriptionTier === 'enterprise' && (
              <div className="bg-green-900/50 text-green-300 px-2 py-1 rounded text-xs">
                Enterprise Access
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 pb-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              data-nav={item.name.toLowerCase()}
              className={cn(
                "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg cursor-pointer nav-hover-smooth nav-item-enter",
                isActiveRoute(item.href)
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg nav-item-active"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white hover-lift"
              )}
            >
              <Icon
                className={cn(
                  "mr-3 h-5 w-5 transition-colors duration-200",
                  isActiveRoute(item.href) ? "text-white" : "text-slate-400 group-hover:text-white"
                )}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Dropdown */}
      {user && (
        <div className="px-4 py-3 border-t border-slate-700">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between p-2 hover:bg-slate-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <img
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    src={user.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"}
                    alt={`${user.firstName} ${user.lastName}`}
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-white truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
                <ChevronUp className="h-4 w-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 mb-2 ml-4"
              align="start"
              side="top"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocation('/settings/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleTheme}>
                {theme === 'light' ? (
                  <Moon className="mr-2 h-4 w-4" />
                ) : (
                  <Sun className="mr-2 h-4 w-4" />
                )}
                <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex w-64 flex-col fixed inset-y-0 z-30">
      <NavigationContent />
    </div>
  );
}