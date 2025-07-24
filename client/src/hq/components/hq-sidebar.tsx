import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Building2, 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Shield,
  Database,
  DollarSign,
  UserCheck,
  Briefcase
} from "lucide-react";

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/hq', icon: BarChart3 },
  { name: 'Tenant Management', href: '/hq/tenants', icon: Building2 },
  { name: 'Company Details', href: '/hq/companies', icon: Briefcase },
  { name: 'Banking Admin', href: '/hq/banking', icon: CreditCard },
  { name: 'Financial Management', href: '/hq/financial', icon: DollarSign },
  { name: 'HR Management', href: '/hq/hr', icon: UserCheck },
  { name: 'Banking Controls', href: '/hq/banking-controls', icon: Shield },
  { name: 'User Management', href: '/hq/users', icon: Users },
  { name: 'System Settings', href: '/hq/settings', icon: Settings },
  { name: 'Data Management', href: '/hq/data', icon: Database },
];

interface HQSidebarProps {
  user?: any;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function HQSidebar({ user, sidebarOpen, setSidebarOpen }: HQSidebarProps) {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 flex z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={cn(
        "hidden md:flex md:flex-shrink-0",
        "md:w-64"
      )}>
        <div className="flex flex-col w-full">
          <div className="flex flex-col h-0 flex-1 bg-gray-900">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-white text-xl font-bold">HQ Admin</h1>
              </div>
              
              <nav className="mt-8 flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <Link key={item.name} href={item.href}>
                      <a className={cn(
                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                        isActive
                          ? "bg-gray-800 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      )}>
                        <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        {item.name}
                      </a>
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            {user && (
              <div className="flex-shrink-0 flex bg-gray-800 p-4">
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">
                      {user.email}
                    </p>
                    <p className="text-xs font-medium text-gray-300 group-hover:text-gray-200">
                      HQ Administrator
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={cn(
        "md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-white text-xl font-bold">HQ Admin</h1>
            </div>
            
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location === item.href;
                const Icon = item.icon;
                
                return (
                  <Link key={item.name} href={item.href}>
                    <a 
                      className={cn(
                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                        isActive
                          ? "bg-gray-800 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </a>
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {user && (
            <div className="flex-shrink-0 flex bg-gray-800 p-4">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">
                    {user.email}
                  </p>
                  <p className="text-xs font-medium text-gray-300">
                    HQ Administrator
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}