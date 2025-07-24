import { useLocation } from "wouter";
import { useEffect, useCallback, memo } from "react";

// HQ-only imports - completely separate from tenant pages
import HQDashboard from "@/hq/pages/hq-dashboard";
import HQTenantManagement from "@/hq/pages/hq-tenant-management";
import HQCompanyDetail from "@/hq/pages/hq-company-detail";
import HQBankingAdmin from "@/hq/pages/hq-banking-admin";
import HQFinancialManagement from "@/hq/pages/hq-financial-management";
import HQHRManagement from "@/hq/pages/hq-hr-management";
import HQBankingControls from "@/hq/pages/hq-banking-controls";
import HQUserManagement from "@/hq/pages/hq-user-management";
import HQSettings from "@/hq/pages/hq-settings";
import HQDataManagement from "@/hq/pages/hq-data-management";
import HQTenantProfile from "../../pages/hq-tenant-profile";

interface HQContentRouterProps {
  title: string;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  user?: any;
}

function HQContentRouter({ title, setTitle, setDescription, user }: HQContentRouterProps) {
  const [location] = useLocation();

  const updateTitleAndDescription = useCallback(() => {
    switch (location) {
      case '/hq':
        setTitle('HQ Dashboard');
        setDescription('Platform overview and system metrics');
        break;
      
      case '/hq/tenants':
        setTitle('Tenant Management');
        setDescription('Manage tenant companies and subscriptions');
        break;
      
      case '/hq/companies':
        setTitle('Company Details');
        setDescription('View and manage company information');
        break;
      
      case '/hq/banking':
        setTitle('Banking Administration');
        setDescription('Banking system administration and oversight');
        break;
      
      case '/hq/financial':
        setTitle('Financial Management');
        setDescription('Platform financial oversight and reporting');
        break;
      
      case '/hq/hr':
        setTitle('HR Management');
        setDescription('Human resources and employee management');
        break;
      
      case '/hq/banking-controls':
        setTitle('Banking Controls');
        setDescription('Banking security and compliance controls');
        break;
      
      case '/hq/users':
        setTitle('User Management');
        setDescription('Platform user administration');
        break;
      
      case '/hq/settings':
        setTitle('System Settings');
        setDescription('Platform configuration and settings');
        break;
      
      case '/hq/data':
        setTitle('Data Management');
        setDescription('Database and data administration');
        break;
      
      default:
        if (location.startsWith('/hq/customers/')) {
          setTitle('Tenant Profile');
          setDescription('Detailed tenant company information');
        } else {
          setTitle('HQ Dashboard');
          setDescription('Platform overview and system metrics');
        }
        break;
    }
  }, [location, setTitle, setDescription]);

  useEffect(() => {
    updateTitleAndDescription();
  }, [updateTitleAndDescription]);

  const renderContent = () => {
    switch (location) {
      case '/hq':
        return <HQDashboard />;
      case '/hq/tenants':
        return <HQTenantManagement />;
      case '/hq/companies':
        return <HQCompanyDetail />;
      case '/hq/banking':
        return <HQBankingAdmin />;
      case '/hq/financial':
        return <HQFinancialManagement />;
      case '/hq/hr':
        return <HQHRManagement />;
      case '/hq/banking-controls':
        return <HQBankingControls />;
      case '/hq/users':
        return <HQUserManagement />;
      case '/hq/settings':
        return <HQSettings />;
      case '/hq/data':
        return <HQDataManagement />;
      default:
        if (location.startsWith('/hq/customers/')) {
          return <HQTenantProfile />;
        }
        return <HQDashboard />;
    }
  };

  return <div className="w-full">{renderContent()}</div>;
}

export default memo(HQContentRouter);