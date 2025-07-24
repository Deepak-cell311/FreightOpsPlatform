/**
 * HQ Role-Based Access Control (RBAC) System
 * Manages FreightOps Pro employee permissions and access levels
 */

import { Request, Response, NextFunction } from 'express';

// HQ Employee Role Definitions
export const HQ_ROLES = {
  PLATFORM_OWNER: 'platform_owner',
  HQ_ADMIN: 'hq_admin',
  OPERATIONS_MANAGER: 'operations_manager',
  CUSTOMER_SUCCESS: 'customer_success',
  FINANCIAL_ANALYST: 'financial_analyst',
  SUPPORT_SPECIALIST: 'support_specialist',
  DEVELOPER: 'developer',
  QA_ENGINEER: 'qa_engineer',
  SALES_MANAGER: 'sales_manager',
  MARKETING_COORDINATOR: 'marketing_coordinator',
  HR_MANAGER: 'hr_manager',
  HR_COORDINATOR: 'hr_coordinator'
} as const;

export type HQRole = typeof HQ_ROLES[keyof typeof HQ_ROLES];

// Permission Categories
export const PERMISSIONS = {
  // Platform Management
  PLATFORM_ADMIN: 'platform:admin',
  PLATFORM_CONFIG: 'platform:config',
  PLATFORM_DEPLOY: 'platform:deploy',
  
  // Tenant Management
  TENANT_VIEW: 'tenant:view',
  TENANT_CREATE: 'tenant:create',
  TENANT_EDIT: 'tenant:edit',
  TENANT_DELETE: 'tenant:delete',
  TENANT_BILLING: 'tenant:billing',
  
  // Financial Operations
  FINANCIAL_VIEW: 'financial:view',
  FINANCIAL_EDIT: 'financial:edit',
  FINANCIAL_REPORTS: 'financial:reports',
  FINANCIAL_AUDIT: 'financial:audit',
  
  // Customer Support
  SUPPORT_VIEW: 'support:view',
  SUPPORT_RESPOND: 'support:respond',
  SUPPORT_ESCALATE: 'support:escalate',
  SUPPORT_ADMIN: 'support:admin',
  
  // System Operations
  SYSTEM_MONITOR: 'system:monitor',
  SYSTEM_LOGS: 'system:logs',
  SYSTEM_BACKUP: 'system:backup',
  SYSTEM_DEPLOY: 'system:deploy',
  
  // User Management
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',
  
  // Analytics & Reporting
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_ADVANCED: 'analytics:advanced',
  ANALYTICS_EXPORT: 'analytics:export',
  
  // Development & QA
  DEV_ACCESS: 'dev:access',
  DEV_DEPLOY: 'dev:deploy',
  QA_ACCESS: 'qa:access',
  QA_MANAGE: 'qa:manage',
  
  // Sales & Marketing
  SALES_VIEW: 'sales:view',
  SALES_MANAGE: 'sales:manage',
  MARKETING_VIEW: 'marketing:view',
  MARKETING_MANAGE: 'marketing:manage',
  
  // HR Management
  HR_EMPLOYEE_VIEW: 'hr:employee:view',
  HR_EMPLOYEE_CREATE: 'hr:employee:create',
  HR_EMPLOYEE_EDIT: 'hr:employee:edit',
  HR_EMPLOYEE_DELETE: 'hr:employee:delete',
  HR_PAYROLL_VIEW: 'hr:payroll:view',
  HR_PAYROLL_EDIT: 'hr:payroll:edit',
  HR_BENEFITS_MANAGE: 'hr:benefits:manage',
  HR_PERFORMANCE_REVIEW: 'hr:performance:review'
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role-Permission Mapping
export const ROLE_PERMISSIONS: Record<HQRole, Permission[]> = {
  [HQ_ROLES.PLATFORM_OWNER]: [
    // Full access to everything
    PERMISSIONS.PLATFORM_ADMIN,
    PERMISSIONS.PLATFORM_CONFIG,
    PERMISSIONS.PLATFORM_DEPLOY,
    PERMISSIONS.TENANT_VIEW,
    PERMISSIONS.TENANT_CREATE,
    PERMISSIONS.TENANT_EDIT,
    PERMISSIONS.TENANT_DELETE,
    PERMISSIONS.TENANT_BILLING,
    PERMISSIONS.FINANCIAL_VIEW,
    PERMISSIONS.FINANCIAL_EDIT,
    PERMISSIONS.FINANCIAL_REPORTS,
    PERMISSIONS.FINANCIAL_AUDIT,
    PERMISSIONS.SUPPORT_VIEW,
    PERMISSIONS.SUPPORT_RESPOND,
    PERMISSIONS.SUPPORT_ESCALATE,
    PERMISSIONS.SUPPORT_ADMIN,
    PERMISSIONS.SYSTEM_MONITOR,
    PERMISSIONS.SYSTEM_LOGS,
    PERMISSIONS.SYSTEM_BACKUP,
    PERMISSIONS.SYSTEM_DEPLOY,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_ADVANCED,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.DEV_ACCESS,
    PERMISSIONS.DEV_DEPLOY,
    PERMISSIONS.QA_ACCESS,
    PERMISSIONS.QA_MANAGE,
    PERMISSIONS.SALES_VIEW,
    PERMISSIONS.SALES_MANAGE,
    PERMISSIONS.MARKETING_VIEW,
    PERMISSIONS.MARKETING_MANAGE
  ],
  
  [HQ_ROLES.HQ_ADMIN]: [
    PERMISSIONS.PLATFORM_CONFIG,
    PERMISSIONS.TENANT_VIEW,
    PERMISSIONS.TENANT_CREATE,
    PERMISSIONS.TENANT_EDIT,
    PERMISSIONS.TENANT_BILLING,
    PERMISSIONS.FINANCIAL_VIEW,
    PERMISSIONS.FINANCIAL_EDIT,
    PERMISSIONS.FINANCIAL_REPORTS,
    PERMISSIONS.SUPPORT_VIEW,
    PERMISSIONS.SUPPORT_RESPOND,
    PERMISSIONS.SUPPORT_ESCALATE,
    PERMISSIONS.SUPPORT_ADMIN,
    PERMISSIONS.SYSTEM_MONITOR,
    PERMISSIONS.SYSTEM_LOGS,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_ADVANCED,
    PERMISSIONS.ANALYTICS_EXPORT
  ],
  
  [HQ_ROLES.OPERATIONS_MANAGER]: [
    PERMISSIONS.TENANT_VIEW,
    PERMISSIONS.TENANT_EDIT,
    PERMISSIONS.FINANCIAL_VIEW,
    PERMISSIONS.FINANCIAL_REPORTS,
    PERMISSIONS.SUPPORT_VIEW,
    PERMISSIONS.SUPPORT_RESPOND,
    PERMISSIONS.SUPPORT_ESCALATE,
    PERMISSIONS.SYSTEM_MONITOR,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_ADVANCED
  ],
  
  [HQ_ROLES.CUSTOMER_SUCCESS]: [
    PERMISSIONS.TENANT_VIEW,
    PERMISSIONS.SUPPORT_VIEW,
    PERMISSIONS.SUPPORT_RESPOND,
    PERMISSIONS.SUPPORT_ESCALATE,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.SALES_VIEW
  ],
  
  [HQ_ROLES.FINANCIAL_ANALYST]: [
    PERMISSIONS.TENANT_VIEW,
    PERMISSIONS.TENANT_BILLING,
    PERMISSIONS.FINANCIAL_VIEW,
    PERMISSIONS.FINANCIAL_EDIT,
    PERMISSIONS.FINANCIAL_REPORTS,
    PERMISSIONS.FINANCIAL_AUDIT,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_ADVANCED,
    PERMISSIONS.ANALYTICS_EXPORT
  ],
  
  [HQ_ROLES.SUPPORT_SPECIALIST]: [
    PERMISSIONS.TENANT_VIEW,
    PERMISSIONS.SUPPORT_VIEW,
    PERMISSIONS.SUPPORT_RESPOND,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.ANALYTICS_VIEW
  ],
  
  [HQ_ROLES.DEVELOPER]: [
    PERMISSIONS.TENANT_VIEW,
    PERMISSIONS.SYSTEM_MONITOR,
    PERMISSIONS.SYSTEM_LOGS,
    PERMISSIONS.DEV_ACCESS,
    PERMISSIONS.DEV_DEPLOY,
    PERMISSIONS.QA_ACCESS,
    PERMISSIONS.ANALYTICS_VIEW
  ],
  
  [HQ_ROLES.QA_ENGINEER]: [
    PERMISSIONS.TENANT_VIEW,
    PERMISSIONS.SYSTEM_MONITOR,
    PERMISSIONS.QA_ACCESS,
    PERMISSIONS.QA_MANAGE,
    PERMISSIONS.ANALYTICS_VIEW
  ],
  
  [HQ_ROLES.SALES_MANAGER]: [
    PERMISSIONS.TENANT_VIEW,
    PERMISSIONS.FINANCIAL_VIEW,
    PERMISSIONS.FINANCIAL_REPORTS,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_ADVANCED,
    PERMISSIONS.SALES_VIEW,
    PERMISSIONS.SALES_MANAGE
  ],
  
  [HQ_ROLES.MARKETING_COORDINATOR]: [
    PERMISSIONS.TENANT_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.MARKETING_VIEW,
    PERMISSIONS.MARKETING_MANAGE
  ],
  
  [HQ_ROLES.HR_MANAGER]: [
    PERMISSIONS.HR_EMPLOYEE_VIEW,
    PERMISSIONS.HR_EMPLOYEE_CREATE,
    PERMISSIONS.HR_EMPLOYEE_EDIT,
    PERMISSIONS.HR_EMPLOYEE_DELETE,
    PERMISSIONS.HR_PAYROLL_VIEW,
    PERMISSIONS.HR_PAYROLL_EDIT,
    PERMISSIONS.HR_BENEFITS_MANAGE,
    PERMISSIONS.HR_PERFORMANCE_REVIEW,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_EDIT
  ],
  
  [HQ_ROLES.HR_COORDINATOR]: [
    PERMISSIONS.HR_EMPLOYEE_VIEW,
    PERMISSIONS.HR_EMPLOYEE_EDIT,
    PERMISSIONS.HR_PAYROLL_VIEW,
    PERMISSIONS.HR_BENEFITS_MANAGE,
    PERMISSIONS.HR_PERFORMANCE_REVIEW
  ]
};

// Department-based access levels
export const DEPARTMENTS = {
  EXECUTIVE: 'executive',
  ADMINISTRATION: 'administration',
  OPERATIONS: 'operations',
  CUSTOMER_SUCCESS: 'customer_success',
  FINANCE: 'finance',
  SUPPORT: 'support',
  HR: 'hr',
  ENGINEERING: 'engineering',
  QA: 'qa',
  SALES: 'sales',
  MARKETING: 'marketing'
} as const;

export type Department = typeof DEPARTMENTS[keyof typeof DEPARTMENTS];

// Interface for HQ Employee session data
export interface HQEmployee {
  id: string;
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: HQRole;
  department: Department;
  position: string;
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// RBAC Middleware Functions
export function requireHQRole(allowedRoles: HQRole[] | HQRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req.session as any)?.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if user has HQ employee role
    if (!user.employeeId) {
      return res.status(403).json({ error: 'HQ employee access required' });
    }
    
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!roles.includes(user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions', 
        required: roles,
        current: user.role
      });
    }
    
    next();
  };
}

export function requirePermission(requiredPermissions: Permission[] | Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req.session as any)?.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if user has HQ employee role
    if (!user.employeeId) {
      return res.status(403).json({ error: 'HQ employee access required' });
    }
    
    const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    
    const hasPermission = permissions.every(permission => 
      userPermissions.includes(permission)
    );
    
    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Insufficient permissions', 
        required: permissions,
        available: userPermissions
      });
    }
    
    next();
  };
}

export function requireDepartment(allowedDepartments: Department[] | Department) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req.session as any)?.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if user has HQ employee role
    if (!user.employeeId) {
      return res.status(403).json({ error: 'HQ employee access required' });
    }
    
    const departments = Array.isArray(allowedDepartments) ? allowedDepartments : [allowedDepartments];
    
    if (!departments.includes(user.department)) {
      return res.status(403).json({ 
        error: 'Department access required', 
        required: departments,
        current: user.department
      });
    }
    
    next();
  };
}

// Utility functions
export function hasPermission(user: HQEmployee, permission: Permission): boolean {
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return userPermissions.includes(permission);
}

export function hasRole(user: HQEmployee, role: HQRole): boolean {
  return user.role === role;
}

export function hasAnyRole(user: HQEmployee, roles: HQRole[]): boolean {
  return roles.includes(user.role);
}

export function getUserPermissions(role: HQRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

// Role hierarchy for inheritance
export const ROLE_HIERARCHY: Record<HQRole, HQRole[]> = {
  [HQ_ROLES.PLATFORM_OWNER]: [], // Top level
  [HQ_ROLES.HQ_ADMIN]: [HQ_ROLES.PLATFORM_OWNER],
  [HQ_ROLES.OPERATIONS_MANAGER]: [HQ_ROLES.HQ_ADMIN, HQ_ROLES.PLATFORM_OWNER],
  [HQ_ROLES.CUSTOMER_SUCCESS]: [HQ_ROLES.OPERATIONS_MANAGER, HQ_ROLES.HQ_ADMIN, HQ_ROLES.PLATFORM_OWNER],
  [HQ_ROLES.FINANCIAL_ANALYST]: [HQ_ROLES.OPERATIONS_MANAGER, HQ_ROLES.HQ_ADMIN, HQ_ROLES.PLATFORM_OWNER],
  [HQ_ROLES.SUPPORT_SPECIALIST]: [HQ_ROLES.CUSTOMER_SUCCESS, HQ_ROLES.OPERATIONS_MANAGER, HQ_ROLES.HQ_ADMIN, HQ_ROLES.PLATFORM_OWNER],
  [HQ_ROLES.DEVELOPER]: [HQ_ROLES.HQ_ADMIN, HQ_ROLES.PLATFORM_OWNER],
  [HQ_ROLES.QA_ENGINEER]: [HQ_ROLES.DEVELOPER, HQ_ROLES.HQ_ADMIN, HQ_ROLES.PLATFORM_OWNER],
  [HQ_ROLES.SALES_MANAGER]: [HQ_ROLES.OPERATIONS_MANAGER, HQ_ROLES.HQ_ADMIN, HQ_ROLES.PLATFORM_OWNER],
  [HQ_ROLES.MARKETING_COORDINATOR]: [HQ_ROLES.SALES_MANAGER, HQ_ROLES.OPERATIONS_MANAGER, HQ_ROLES.HQ_ADMIN, HQ_ROLES.PLATFORM_OWNER]
};

export function canAccessRole(userRole: HQRole, targetRole: HQRole): boolean {
  if (userRole === targetRole) return true;
  
  const hierarchy = ROLE_HIERARCHY[userRole] || [];
  return hierarchy.includes(targetRole);
}