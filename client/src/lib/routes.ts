export const ROUTES = {
  dashboard: '/dashboard',
  dispatch: '/dispatch',
  fleet: '/fleet',
  accounting: '/accounting',
  accountingManagement: '/accounting',
  hr: '/hr',
  payroll: '/payroll',
  operations: '/operations',
  billing: '/banking',
  settings: '/settings'
};

export const SUB_MENUS = {
  accounting: [
    { href: '/accounting', label: 'Overview' },
    { href: '/accounting/invoices', label: 'Invoices' },
    { href: '/accounting/expenses', label: 'Expenses' },
    { href: '/accounting/reports', label: 'Reports' }
  ],
  fleet: [
    { href: '/fleet', label: 'Overview' },
    { href: '/fleet/applications', label: 'Driver Applications' },
    { href: '/fleet/performance', label: 'Performance' },
    { href: '/fleet/onboarding', label: 'Onboarding' },
    { href: '/fleet/documents', label: 'Documents' }
  ],
  dispatch: [
    { href: '/dispatch', label: 'Overview' },
    { href: '/dispatch/active', label: 'Active Loads' },
    { href: '/dispatch/create', label: 'Create Load' },
    { href: '/dispatch/routes', label: 'Route Planning' },
    { href: '/dispatch/assignments', label: 'Driver Assignment' }
  ],
  hr: [
    { href: '/hr', label: 'Overview' },
    { href: '/hr/employees', label: 'Employees' },
    { href: '/hr/applications', label: 'Applications' },
    { href: '/hr/benefits', label: 'Benefits' }
  ],
  payroll: [
    { href: '/payroll', label: 'Overview' },
    { href: '/payroll/runs', label: 'Payroll Runs' },
    { href: '/payroll/reports', label: 'Reports' },
    { href: '/payroll/taxes', label: 'Taxes' }
  ],
  banking: [
    { href: '/banking', label: 'Overview' },
    { href: '/banking/accounts', label: 'Accounts' },
    { href: '/banking/transfers', label: 'Transfers' },
    { href: '/banking/cards', label: 'Cards' }
  ],
  operations: [
    { href: '/operations', label: 'Overview' },
    { href: '/operations/monitoring', label: 'Monitoring' },
    { href: '/operations/compliance', label: 'Compliance' },
    { href: '/operations/analytics', label: 'Analytics' }
  ],
  settings: [
    { href: '/settings', label: 'Overview' },
    { href: '/settings/profile', label: 'Profile' },
    { href: '/settings/security', label: 'Security' },
    { href: '/settings/notifications', label: 'Notifications' }
  ]
};