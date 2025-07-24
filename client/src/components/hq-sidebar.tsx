import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Building2, 
  Users, 
  CreditCard, 
  Activity, 
  Settings, 
  Shield,
  User,
  LogOut,
  Sun,
  Moon
} from "lucide-react";

const hqNavigation = [
  {
    name: 'Dashboard',
    href: '/hq/dashboard',
    icon: BarChart3,
  },
  {
    name: 'Tenants',
    href: '/hq/tenants',
    icon: Building2,
  },
  {
    name: 'Revenue',
    href: '/hq/revenue',
    icon: CreditCard,
  },
  {
    name: 'Banking',
    href: '/hq/banking',
    icon: Shield,
  },
  {
    name: 'Support',
    href: '/hq/support',
    icon: Users,
  },
  {
    name: 'Features',
    href: '/hq/features',
    icon: Activity,
  },
];

interface HQSidebarProps {
  user?: any;
}

export default function HQSidebar({ user }: HQSidebarProps) {
  const [location] = useLocation();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const isActiveRoute = (href: string) => {
    if (href === "/hq/admin") return location === "/hq/admin" || location === "/dashboard";
    return location.startsWith(href);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      window.location.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace('/login');
    }
  };

  const NavigationContent = () => (
    <div className="flex flex-col h-full bg-slate-900 shadow-lg">
      {/* Logo */}
      <div className="flex items-center px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-sm lg:text-base truncate">FreightOps HQ</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 pb-4 space-y-2 overflow-y-auto">
        {hqNavigation.map((item) => {
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
                  HQ Administrator
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === 'light' ? (
                <>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark mode</span>
                </>
              ) : (
                <>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light mode</span>
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <NavigationContent />
      </div>

      {/* Mobile Sidebar - would need mobile state management */}
    </>
  );
}