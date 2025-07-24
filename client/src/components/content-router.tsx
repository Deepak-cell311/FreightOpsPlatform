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
import DispatchDrivers from "@/pages/dispatch-drivers";
import DispatchCustomers from "@/pages/dispatch-customers";
import DispatchReports from "@/pages/dispatch-reports";
import DispatchScheduling from "@/pages/dispatch-scheduling";
import Fleet from "@/pages/fleet";
import Billing from "@/pages/billing";
import Wallet from "@/pages/wallet";
import HR from "@/pages/hr";
import HREmployees from "@/pages/hr-employees";
import HROnboarding from "@/pages/hr-onboarding";
import HRCompliance from "@/pages/hr-compliance";
import HRPayroll from "@/pages/hr-payroll";
import HRBenefits from "@/pages/hr-benefits";
import PayrollDashboard from "@/pages/payroll-dashboard-new";
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
import BankingApplicationStatus from "@/pages/banking-application-status";
import HQAdmin from "@/pages/hq-admin";
import LoadDetail from "@/pages/load-detail";
import { ProfessionalLoadsTable } from "@/components/professional-loads-table";

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
      
      case '/operations/load-management':
        setTitle('Load Management');
        setDescription('Manage loads, routes, and shipments');
        break;
      
      case '/operations/driver-management':
        setTitle('Driver Management');
        setDescription('Driver scheduling and performance tracking');
        break;
      
      case '/operations/route-optimization':
        setTitle('Route Optimization');
        setDescription('Optimize routes for efficiency and cost savings');
        break;
      
      case '/operations/compliance':
        setTitle('Operations Compliance');
        setDescription('DOT compliance and safety management');
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
        setTitle('Dispatch Overview');
        setDescription('Dispatch center overview and operations');
        break;
      
      case '/dispatch/load-management':
        setTitle('Load Management');
        setDescription('Manage loads, assignments, and tracking');
        break;
      
      case '/dispatch/drivers':
        setTitle('Driver Management');
        setDescription('Driver assignments and availability');
        break;
      
      case '/dispatch/customers':
        setTitle('Customer Management');
        setDescription('Customer accounts and load history');
        break;
      
      case '/dispatch/reports':
        setTitle('Dispatch Reports');
        setDescription('Performance reports and analytics');
        break;
      
      case '/dispatch/scheduling':
        setTitle('Route Scheduling');
        setDescription('Schedule and optimize routes for maximum efficiency');
        break;

      
      case '/fleet':
        setTitle('Fleet Management');
        setDescription('Fleet management dashboard and overview');
        break;
      
      case '/fleet/vehicles':
        setTitle('Vehicle Management');
        setDescription('Manage your fleet vehicles and equipment');
        break;
      
      case '/fleet/maintenance':
        setTitle('Maintenance Management');
        setDescription('Schedule and track vehicle maintenance');
        break;
      
      case '/fleet/inspections':
        setTitle('Vehicle Inspections');
        setDescription('DOT inspections and safety compliance');
        break;
      
      case '/fleet/drivers':
        setTitle('Driver Management');
        setDescription('Manage drivers and vehicle assignments');
        break;
      
      case '/fleet/fuel':
        setTitle('Fuel Management');
        setDescription('Track fuel consumption and costs');
        break;
      
      case '/fleet/compliance':
        setTitle('Compliance Management');
        setDescription('DOT compliance and regulatory tracking');
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
      
      case '/payroll':
        setTitle('HR & Payroll Management');
        setDescription('Complete HR and payroll solution with white-label embedded interface');
        break;
      
      case '/accounting':
        setTitle('Accounting Management');
        setDescription('Financial accounting and bookkeeping');
        break;
      
      case '/accounting/transactions':
        setTitle('Transaction Management');
        setDescription('Track and categorize financial transactions');
        break;
      
      case '/accounting/reports':
        setTitle('Financial Reports');
        setDescription('Generate comprehensive financial reports');
        break;
      
      case '/accounting/reconciliation':
        setTitle('Bank Reconciliation');
        setDescription('Reconcile bank statements and accounts');
        break;
      
      case '/accounting/tax':
        setTitle('Tax Management');
        setDescription('Tax preparation and compliance tracking');
        break;
      
      case '/accounting/settings':
        setTitle('Accounting Settings');
        setDescription('Configure accounting preferences and rules');
        break;
      
      case '/billing':
        setTitle('Billing Management');
        setDescription('Customer billing and invoicing');
        break;
      
      case '/billing/invoices':
        setTitle('Invoice Management');
        setDescription('Create and manage customer invoices');
        break;
      
      case '/billing/payments':
        setTitle('Payment Processing');
        setDescription('Process and track customer payments');
        break;
      
      case '/billing/customers':
        setTitle('Customer Billing');
        setDescription('Manage customer billing information');
        break;
      
      case '/billing/subscriptions':
        setTitle('Subscription Management');
        setDescription('Handle recurring billing and subscriptions');
        break;
      
      case '/billing/reports':
        setTitle('Billing Reports');
        setDescription('Generate billing and revenue reports');
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
      case '/operations/load-management':
      case '/operations/driver-management':
      case '/operations/route-optimization':
      case '/operations/compliance':
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
        return <Dispatch />;
      
      case '/dispatch/load-management':
        return <ProfessionalLoadsTable />;
      
      case '/dispatch/drivers':
        return <DispatchDrivers />;
      
      case '/dispatch/customers':
        return <DispatchCustomers />;
      
      case '/dispatch/reports':
        return <DispatchReports />;
      
      case '/dispatch/tracking':
        return <Dispatch />;
      
      case '/dispatch/scheduling':
        return <DispatchScheduling />;
      
      case '/fleet':
      case '/fleet/vehicles':
      case '/fleet/maintenance':
      case '/fleet/inspections':
      case '/fleet/drivers':
      case '/fleet/fuel':
      case '/fleet/compliance':
        return <Fleet />;
      
      case '/billing':
      case '/billing/invoices':
      case '/billing/customers':
      case '/billing/payments':
      case '/billing/subscriptions':
      case '/billing/reports':
        return <Billing />;
      
      case '/wallet':
        return <BankingOverview />;
      
      case '/hr':
        return <HR />;
      
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
      
      case '/payroll':
        return <PayrollDashboard />;
      
      case '/accounting':
      case '/accounting/transactions':
      case '/accounting/reports':
      case '/accounting/reconciliation':
      case '/accounting/tax':
      case '/accounting/settings':
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
      
      case '/banking/application-status':
        return <BankingApplicationStatus />;
      
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
        // Check for load detail route pattern
        if (location.startsWith('/load/')) {
          return <LoadDetail />;
        }
        
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