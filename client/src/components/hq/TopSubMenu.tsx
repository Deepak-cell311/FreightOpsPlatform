import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';

interface SubMenuItem {
  title: string;
  href: string;
}

const subMenuConfig: Record<string, SubMenuItem[]> = {
  '/hq/settings': [
    { title: 'General', href: '/hq/settings/general' },
    { title: 'Preferences', href: '/hq/settings/preferences' },
    { title: 'Roles', href: '/hq/settings/roles' },
    { title: 'Keys', href: '/hq/settings/keys' },
    { title: 'Alerts', href: '/hq/settings/alerts' }
  ],
  '/hq/tenants': [
    { title: 'All', href: '/hq/tenants' },
    { title: 'Trial', href: '/hq/tenants/trial' },
    { title: 'Active', href: '/hq/tenants/active' },
    { title: 'Suspended', href: '/hq/tenants/suspended' }
  ],
  '/hq/support': [
    { title: 'Tickets', href: '/hq/support' },
    { title: 'Knowledge Base', href: '/hq/support/kb' },
    { title: 'Analytics', href: '/hq/support/analytics' }
  ],
  '/hq/billing': [
    { title: 'Overview', href: '/hq/billing' },
    { title: 'Invoices', href: '/hq/billing/invoices' },
    { title: 'Reports', href: '/hq/billing/reports' }
  ],
  '/hq/integrations': [
    { title: 'Overview', href: '/hq/integrations' },
    { title: 'API Keys', href: '/hq/integrations/keys' },
    { title: 'Webhooks', href: '/hq/integrations/webhooks' }
  ]
};

export function TopSubMenu() {
  const [location] = useLocation();
  
  // Determine current main section
  const mainSection = Object.keys(subMenuConfig).find(section => 
    location.startsWith(section)
  );
  
  if (!mainSection) return null;
  
  const subMenuItems = subMenuConfig[mainSection];
  
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6">
        <nav className="flex space-x-8">
          {subMenuItems.map((item) => {
            const isActive = location === item.href || 
              (item.href !== mainSection && location.startsWith(item.href));
            
            return (
              <Link key={item.href} href={item.href}>
                <a className={cn(
                  "py-4 px-1 border-b-2 font-medium text-sm",
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}>
                  {item.title}
                </a>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}