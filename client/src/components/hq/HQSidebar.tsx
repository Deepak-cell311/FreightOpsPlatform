import { useLocation } from 'wouter';
import { Link } from 'wouter';
import { 
  LayoutDashboard, 
  Users, 
  HeadphonesIcon, 
  DollarSign, 
  Building2, 
  Settings,
  BarChart3
} from 'lucide-react';

export function HQSidebar() {
  const [location] = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/hq',
      icon: LayoutDashboard,
      current: location === '/hq' || location.startsWith('/hq/dashboard')
    },
    {
      name: 'Tenants',
      href: '/hq/tenants',
      icon: Users,
      current: location.startsWith('/hq/tenants')
    },
    {
      name: 'Revenue',
      href: '/hq/billing',
      icon: DollarSign,
      current: location.startsWith('/hq/billing') || location.startsWith('/hq/revenue')
    },
    {
      name: 'Banking',
      href: '/hq/banking',
      icon: Building2,
      current: location.startsWith('/hq/banking')
    },
    {
      name: 'Support',
      href: '/hq/support',
      icon: HeadphonesIcon,
      current: location.startsWith('/hq/support')
    },
    {
      name: 'Analytics',
      href: '/hq/features',
      icon: BarChart3,
      current: location.startsWith('/hq/features') || location.startsWith('/hq/usage')
    },
    {
      name: 'Settings',
      href: '/hq/settings',
      icon: Settings,
      current: location.startsWith('/hq/settings')
    }
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">HQ</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">FreightOps</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Platform HQ</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${item.current
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </a>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}