import { useLocation } from "wouter";
import { useEffect, useCallback, memo, useMemo } from "react";

// Direct imports for faster loading - no lazy loading for main components
import EnterpriseDashboard from "@/pages/enterprise-dashboard";
import FinancialOverview from "@/pages/financial-overview";
import Operations from "@/pages/operations";
import FleetStatus from "@/pages/fleet-status";
import Performance from "@/pages/performance";
import Banking from "@/pages/banking";
import Security from "@/pages/security";
import Dispatch from "@/pages/dispatch";
import Fleet from "@/pages/fleet";
import Billing from "@/pages/billing";
import Wallet from "@/pages/wallet";
import HR from "@/pages/hr";
import HREmployees from "@/pages/hr-employees";
import HROnboarding from "@/pages/hr-onboarding";
import HRCompliance from "@/pages/hr-compliance";
import HRPayroll from "@/pages/hr-payroll";
import HRBenefits from "@/pages/hr-benefits";
import ComprehensiveAccounting from "@/pages/comprehensive-accounting";
import AccountingManagement from "@/pages/accounting-management";
import HRManagement from "@/pages/hr-management";
import SimpleBanking from "@/pages/simple-banking";
import BaaSBanking from "@/pages/baas-banking";
import EnterpriseBanking from "@/pages/enterprise-banking";
import ProfessionalBanking from "@/pages/professional-banking";
import SecureTransfers from "@/pages/secure-transfers";
import Settings from "@/pages/settings";
import SettingsSecurity from "@/pages/settings-security";
import SettingsProfile from "@/pages/settings-profile";
import BankingActivity from "@/pages/banking-activity";
import BankingSendMoney from "@/pages/banking-send-money";
import BankingCards from "@/pages/banking-cards";
import BankingOverview from "@/pages/banking-overview";
import BankingPayroll from "@/pages/banking-payroll";
import BankingAccounts from "@/pages/banking-accounts";
import BankingTransfers from "@/pages/banking-transfers";
import BankingDeposits from "@/pages/banking-deposits";
import BankingWithdrawals from "@/pages/banking-withdrawals";
import HQAdmin from "@/pages/hq-admin";

interface ContentRouterProps {
  title: string;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  user?: any;
}

function ContentRouter({ title, setTitle, setDescription, user }: ContentRouterProps) {
  const [location] = useLocation();
  
  // Memoize user role check to prevent re-renders
  const isHQAdmin = useMemo(() => 
    user?.role === 'hq_admin' || user?.role === 'super_admin' || user?.role === 'platform_owner',
    [user?.role]
  );

  const updateTitleAndDescription = useCallback(() => {
    switch (location) {
      case '/':
      case '/dashboard':
        setTitle('Dashboard');
        setDescription('Comprehensive business operations overview');
        break;
      
      case '/financial-overview':
        setTitle('Financial Overview');
        setDescription('Revenue, expenses, and financial performance metrics');
        break;
      
      case '/operations':
        setTitle('Operations');
        setDescription('Load management and operational efficiency');
        break;
      
      case '/fleet-status':
        setTitle('Fleet Status');
        setDescription('Vehicle status and fleet management overview');
        break;
      
      case '/performance':
        setTitle('Performance');
        setDescription('Key performance indicators and analytics');
        break;
      
      case '/banking':
      case '/banking/overview':
      case '/banking-overview':
        setTitle('Banking Overview');
        setDescription('Banking accounts and financial transactions');
        break;
      
      case '/banking/accounts':
        setTitle('Banking Accounts');
        setDescription('Account management and balances');
        break;
      
      case '/banking/transfers':
      case '/banking/send-money':
        setTitle('Transfers & Payments');
        setDescription('Send money, transfers, and payment operations');
        break;
      
      case '/banking/deposits':
        setTitle('Deposits');
        setDescription('Incoming payments and deposits');
        break;
      
      case '/banking/withdrawals':
        setTitle('Withdrawals');
        setDescription('Outgoing payments and withdrawals');
        break;
      
      case '/banking/cards':
        setTitle('Virtual Cards');
        setDescription('Virtual debit cards and card management');
        break;
      
      case '/security':
        setTitle('Security');
        setDescription('Security status and compliance monitoring');
        break;
      
      case '/dispatch':
        setTitle('Load Board');
        setDescription('Available loads and dispatch operations');
        break;
      
      case '/dispatch/active':
        setTitle('Active Loads');
        setDescription('Currently active and in-progress loads');
        break;
      
      case '/dispatch/completed':
        setTitle('Completed Loads');
        setDescription('Completed load history and records');
        break;
      
      case '/dispatch/drivers':
        setTitle('Driver Assignment');
        setDescription('Driver assignments and availability');
        break;
      
      case '/fleet':
        setTitle('Fleet Overview');
        setDescription('Fleet management dashboard and overview');
        break;
      
      case '/fleet/vehicles':
        setTitle('Vehicles');
        setDescription('Vehicle management and tracking');
        break;
      
      case '/fleet/drivers':
        setTitle('Drivers');
        setDescription('Driver management and records');
        break;
      
      case '/fleet/maintenance':
        setTitle('Maintenance');
        setDescription('Vehicle maintenance scheduling and records');
        break;
      
      case '/fleet/tracking':
        setTitle('Live Tracking');
        setDescription('Real-time vehicle location tracking');
        break;
      
      case '/hr':
        setTitle('HR Management');
        setDescription('Human resources and employee management');
        break;
      
      case '/hr/employees':
        setTitle('Employees');
        setDescription('Employee management and records');
        break;
      
      case '/hr/onboarding':
        setTitle('Employee Onboarding');
        setDescription('New employee onboarding process');
        break;
      
      case '/hr/compliance':
        setTitle('HR Compliance');
        setDescription('Compliance tracking and documentation');
        break;
      
      case '/hr/payroll':
        setTitle('HR Payroll');
        setDescription('Payroll management and processing');
        break;
      
      case '/hr/benefits':
        setTitle('Employee Benefits');
        setDescription('Benefits administration and enrollment');
        break;
      
      case '/accounting':
        setTitle('Accounting');
        setDescription('Financial accounting and bookkeeping');
        break;
      
      case '/billing':
        setTitle('Billing');
        setDescription('Customer billing and invoicing');
        break;
      
      case '/settings':
        setTitle('Settings');
        setDescription('Company settings and configuration');
        break;
      
      case '/settings/security':
        setTitle('Security Settings');
        setDescription('Security configuration and access control');
        break;
      
      case '/settings/profile':
        setTitle('Profile Settings');
        setDescription('Personal profile and account information');
        break;
      
      default:
        if (isHQAdmin) {
          setTitle('HQ Admin Dashboard');
          setDescription('System oversight and company management');
        } else {
          setTitle('Dashboard');
          setDescription('Comprehensive business operations overview');
        }
        break;
    }
  }, [location, setTitle, setDescription, isHQAdmin]);

  // Update title and description when location changes
  useEffect(() => {
    updateTitleAndDescription();
  }, [updateTitleAndDescription]);

  const renderContent = () => {
    switch (location) {
      case '/':
      case '/dashboard':
        return <EnterpriseDashboard />;
      
      case '/financial-overview':
        return <FinancialOverview />;
      
      case '/operations':
        return <Operations />;
      
      case '/fleet-status':
        return <FleetStatus />;
      
      case '/performance':
        return <Performance />;
      
      case '/banking':
      case '/banking/overview':
      case '/banking-overview':
        return <Banking />;
      
      case '/security':
        return <Security />;
      
      case '/dispatch':
      case '/dispatch/active':
      case '/dispatch/completed':
      case '/dispatch/drivers':
        return <Dispatch />;
      
      case '/fleet':
      case '/fleet/vehicles':
      case '/fleet/drivers':
      case '/fleet/maintenance':
      case '/fleet/tracking':
        return <Fleet />;
      
      case '/billing':
        return <Billing />;
      
      case '/wallet':
        return <BankingOverview />;
      
      case '/hr':
        return <HRManagement />;
      
      case '/hr/employees':
        return <HREmployees />;
      
      case '/hr/onboarding':
        return <HROnboarding />;
      
      case '/hr/compliance':
        return <HRCompliance />;
      
      case '/hr/payroll':
        return <HRPayroll />;
      
      case '/hr/benefits':
        return <HRBenefits />;
      
      case '/accounting':
        return <AccountingManagement />;
      
      case '/banking/activity':
        return <BankingActivity />;
      
      case '/banking/send-money':
      case '/banking/transfers':
        return <BankingTransfers />;
      
      case '/banking/cards':
        return <BankingCards />;
      
      case '/banking/payroll':
        return <BankingPayroll />;
      
      case '/banking/accounts':
        return <BankingAccounts />;
      
      case '/banking/deposits':
        return <BankingDeposits />;
      
      case '/banking/withdrawals':
        return <BankingWithdrawals />;
      
      case '/baas-banking':
        return <BaaSBanking />;
      
      case '/enterprise-banking':
        return <EnterpriseBanking />;
      
      case '/professional-banking':
        return <ProfessionalBanking />;
      
      case '/secure-transfers':
        return <SecureTransfers />;
      
      case '/settings':
        return <Settings />;
      
      case '/settings/security':
        return <SettingsSecurity />;
      
      case '/settings/profile':
        return <SettingsProfile />;
      
      case '/settings/integrations':
        return <Settings />;
      
      case '/settings/notifications':
        return <Settings />;
      
      case '/settings/billing':
        return <Settings />;
      
      case '/settings/users':
        return <Settings />;
      
      // HQ Admin Routes
      case '/hq/companies':
      case '/hq/analytics':
      case '/hq/billing':
      case '/hq/support':
      case '/hq/system-health':
        return <HQAdmin />;
      
      default:
        if (isHQAdmin) {
          return <HQAdmin />;
        } else {
          return <EnterpriseDashboard />;
        }
    }
  };

  return (
    <div className="w-full h-full">
      <div className="transition-opacity duration-300 ease-in-out">
        {renderContent()}
      </div>
    </div>
  );
}

export default memo(ContentRouter);