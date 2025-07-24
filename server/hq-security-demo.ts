/**
 * HQ Security Demo API Routes
 * Demonstrates comprehensive role-based security features
 */

import { Request, Response, Router } from 'express';
import { 
  requireHQRole, 
  requirePermission, 
  requireDepartment, 
  HQ_ROLES, 
  PERMISSIONS, 
  DEPARTMENTS 
} from './hq-rbac';

const router = Router();

// Role-based access examples
router.get('/demo/platform-owner-only', requireHQRole(HQ_ROLES.PLATFORM_OWNER), (req: Request, res: Response) => {
  res.json({
    message: 'Success! You have Platform Owner access',
    accessLevel: 'PLATFORM_OWNER',
    availableActions: [
      'Manage all tenants',
      'Configure platform settings',
      'Access all financial data',
      'Manage HQ employees',
      'Deploy system updates'
    ]
  });
});

router.get('/demo/admin-access', requireHQRole([HQ_ROLES.PLATFORM_OWNER, HQ_ROLES.HQ_ADMIN]), (req: Request, res: Response) => {
  res.json({
    message: 'Success! You have Admin access',
    accessLevel: 'ADMIN',
    availableActions: [
      'Manage tenants',
      'View financial reports',
      'Handle support tickets',
      'Access system monitoring'
    ]
  });
});

// Permission-based access examples
router.get('/demo/tenant-management', requirePermission(PERMISSIONS.TENANT_EDIT), (req: Request, res: Response) => {
  res.json({
    message: 'Success! You have Tenant Management permissions',
    permission: 'TENANT_EDIT',
    availableActions: [
      'Create new tenants',
      'Edit tenant information',
      'Manage tenant billing',
      'View tenant analytics'
    ]
  });
});

router.get('/demo/financial-access', requirePermission([PERMISSIONS.FINANCIAL_VIEW, PERMISSIONS.FINANCIAL_REPORTS]), (req: Request, res: Response) => {
  res.json({
    message: 'Success! You have Financial Access permissions',
    permissions: ['FINANCIAL_VIEW', 'FINANCIAL_REPORTS'],
    availableActions: [
      'View financial dashboards',
      'Generate financial reports',
      'Access revenue analytics',
      'View profit/loss statements'
    ]
  });
});

// Department-based access examples
router.get('/demo/administration-only', requireDepartment(DEPARTMENTS.ADMINISTRATION), (req: Request, res: Response) => {
  res.json({
    message: 'Success! You are in Administration department',
    department: 'ADMINISTRATION',
    availableActions: [
      'Manage company policies',
      'Handle HR matters',
      'Access administrative tools',
      'Manage employee records'
    ]
  });
});

router.get('/demo/finance-department', requireDepartment(DEPARTMENTS.FINANCE), (req: Request, res: Response) => {
  res.json({
    message: 'Success! You are in Finance department',
    department: 'FINANCE',
    availableActions: [
      'Process financial transactions',
      'Generate financial reports',
      'Manage accounting systems',
      'Handle audit procedures'
    ]
  });
});

// Multi-level security example
router.get('/demo/senior-operations', 
  requireHQRole([HQ_ROLES.PLATFORM_OWNER, HQ_ROLES.HQ_ADMIN, HQ_ROLES.OPERATIONS_MANAGER]),
  requirePermission([PERMISSIONS.TENANT_VIEW, PERMISSIONS.SYSTEM_MONITOR]),
  requireDepartment([DEPARTMENTS.ADMINISTRATION, DEPARTMENTS.OPERATIONS]),
  (req: Request, res: Response) => {
    res.json({
      message: 'Success! You have Senior Operations access',
      securityLevels: ['ROLE_BASED', 'PERMISSION_BASED', 'DEPARTMENT_BASED'],
      availableActions: [
        'Senior operations management',
        'Cross-department coordination',
        'Strategic decision making',
        'Advanced system monitoring'
      ]
    });
  }
);

// User profile endpoint showing current permissions
router.get('/demo/my-profile', requireHQRole(Object.values(HQ_ROLES)), (req: Request, res: Response) => {
  const user = (req.session as any)?.user;
  
  if (!user) {
    return res.status(401).json({ error: 'No user session found' });
  }

  res.json({
    message: 'Your HQ Employee Profile',
    profile: {
      employeeId: user.employeeId,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      department: user.department,
      position: user.position,
      role: user.role,
      permissions: user.permissions,
      lastLogin: user.lastLogin
    },
    securityStatus: {
      authenticated: true,
      roleVerified: true,
      permissionsLoaded: true,
      departmentVerified: true
    }
  });
});

// Test unauthorized access
router.get('/demo/unauthorized-test', (req: Request, res: Response) => {
  res.json({
    message: 'This endpoint has NO security restrictions',
    warning: 'This demonstrates what happens without proper RBAC',
    recommendation: 'All HQ endpoints should use role-based security'
  });
});

export default router;