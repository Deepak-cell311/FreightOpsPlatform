import { Link, useLocation } from 'wouter';
import { Home, Users, CreditCard, Plug, LifeBuoy, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  { title: 'Dashboard', icon: Home, href: '/hq/dashboard' },
  { title: 'Tenants', icon: Users, href: '/hq/tenants' },
  { title: 'Billing', icon: CreditCard, href: '/hq/billing' },
  { title: 'Integrations', icon: Plug, href: '/hq/integrations' },
  { title: 'Support', icon: LifeBuoy, href: '/hq/support' },
  { title: 'Settings', icon: Settings, href: '/hq/settings' }
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">FreightOps HQ</h1>
        <p className="text-sm text-gray-600">Platform Administration</p>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => {
          const isActive = location === item.href || location.startsWith(item.href + '/');
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href}>
              <a className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}>
                <Icon className={cn(
                  "w-5 h-5 mr-3",
                  isActive ? "text-blue-700" : "text-gray-400"
                )} />
                {item.title}
              </a>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}