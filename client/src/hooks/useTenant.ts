import { useAuth } from './use-auth';

export function useTenant() {
  const { user } = useAuth();
  
  const companyId = user?.companyId;
  const tenantId = user?.companyId;
  
  if (!companyId) {
    throw new Error('User not authenticated or missing company ID');
  }
  
  return {
    companyId,
    tenantId,
    ensureTenantScope: (queryKey: string[]) => {
      return [...queryKey, { companyId }];
    },
    withTenantFilter: (data: any) => {
      return { ...data, companyId };
    }
  };
}