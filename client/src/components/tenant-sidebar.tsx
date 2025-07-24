import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  LayoutDashboard,
  Truck,
  Wallet,
  Calculator,
  Settings,
  CreditCard,
  Receipt,
  Route,
  LogOut,
  User,
  Moon,
  Sun,
  ChevronUp,
  Users,
  FileText,
  Building,
  Shield,
} from "lucide-react";
import { ROUTES, SUB_MENUS } from "@/lib/routes";
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

// Centralized navigation using ROUTES configuration
const tenantNavigation: NavigationItem[] = [
  { name: "Dashboard", href: ROUTES.dashboard, icon: LayoutDashboard },
  { name: "Dispatch", href: ROUTES.dispatch, icon: Route },
  { name: "Fleet", href: ROUTES.fleet, icon: Truck },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Vendors", href: "/vendors", icon: Building },
  { name: "Compliance", href: "/compliance", icon: Shield },
  { name: "HR", href: ROUTES.hr, icon: Users },
  { name: "Payroll", href: ROUTES.payroll, icon: Receipt },
  { name: "Accounting", href: ROUTES.accountingManagement, icon: Calculator },
  { name: "Operations", href: ROUTES.operations, icon: FileText },
  { name: "Banking", href: ROUTES.billing, icon: CreditCard },
  { name: "Settings", href: ROUTES.settings, icon: Settings },
];

interface TenantSidebarProps {
  user?: any;
}

export default function TenantSidebar({ user }: TenantSidebarProps) {
  const [location] = useLocation();
  const [, setLocation] = useLocation();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const isActiveRoute = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    try {
      // Clear all local storage and session storage first
      localStorage.clear();
      sessionStorage.clear();
      
      // Call logout API
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Force redirect to login page
      window.location.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API fails, clear local data and redirect
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace('/login');
    }
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

      {/* Navigation */}
      <nav className="flex-1 px-2 pb-4 space-y-2 overflow-y-auto">
        {tenantNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.href);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                isActive
                  ? "bg-slate-800 text-white shadow-lg"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "mr-3 h-5 w-5 transition-colors duration-200",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                )}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Menu */}
      <div className="px-2 pb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2.5"
            >
              <User className="mr-3 h-5 w-5" />
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium truncate">
                  {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  {user?.companyName}
                </div>
              </div>
              <ChevronUp className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === 'light' ? (
                <Moon className="mr-2 h-4 w-4" />
              ) : (
                <Sun className="mr-2 h-4 w-4" />
              )}
              Toggle theme
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="flex flex-shrink-0">
      <div className="flex flex-col w-64">
        <NavigationContent />
      </div>
    </div>
  );
}