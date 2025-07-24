import { useLocation } from "wouter";
import { useEffect, useCallback, memo, useMemo } from "react";

// Tenant-only imports - no HQ components
import Dispatch from "@/pages/dispatch";
import Fleet from "@/pages/fleet";
import Billing from "@/pages/billing";
import Wallet from "@/pages/wallet";
import QuickBooksAccounting from "@/pages/quickbooks-accounting";
import BankingModule from "@/pages/banking-module";
import Settings from "@/pages/settings";
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
import Reports from "@/pages/reports";
import HRModule from "@/pages/hr-module";
import PayrollModule from "@/pages/payroll-module";
import CustomerModule from "@/components/modules/customer-module";
import VendorModule from "@/components/modules/vendor-module";
import ComplianceModule from "@/components/modules/compliance-module";


interface TenantContentRouterProps {
  title: string;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  user?: any;
}

function TenantContentRouter({ title, setTitle, setDescription, user }: TenantContentRouterProps) {
  const [location] = useLocation();

  const updateTitleAndDescription = useCallback(() => {
    switch (location) {
      case '/dispatch':
        setTitle('Dispatch');
        setDescription('Load management and dispatch operations');
        break;
      
      case '/fleet':
        setTitle('Fleet Management');
        setDescription('Vehicle and driver management');
        break;
      
      case '/customers':
        setTitle('Customer Management');
        setDescription('Manage customers and rate agreements');
        break;
      
      case '/vendors':
        setTitle('Vendor Management');
        setDescription('Manage vendors and track payments');
        break;
      
      case '/compliance':
        setTitle('Compliance Management');
        setDescription('DOT and safety compliance tracking');
        break;
      
      case '/billing':
        setTitle('Billing');
        setDescription('Invoice and payment management');
        break;
      
      case '/wallet':
        setTitle('Wallet');
        setDescription('Digital wallet and transactions');
        break;
      
      case '/accounting':
        setTitle('Accounting');
        setDescription('Financial records and reporting');
        break;
      
      case '/reports':
        setTitle('Reports & Analytics');
        setDescription('Generate and export business reports');
        break;
      
      case '/banking':
      case '/banking/overview':
        setTitle('Banking Overview');
        setDescription('Banking accounts and financial transactions');
        break;
      
      case '/banking/accounts':
        setTitle('Banking Accounts');
        setDescription('Account management and balances');
        break;
      
      case '/banking/transfers':
        setTitle('Transfers');
        setDescription('Money transfers and wire payments');
        break;
      
      case '/banking/deposits':
        setTitle('Deposits');
        setDescription('Deposit management and history');
        break;
      
      case '/banking/withdrawals':
        setTitle('Withdrawals');
        setDescription('Withdrawal requests and history');
        break;
      
      case '/banking/cards':
        setTitle('Cards');
        setDescription('Debit and credit card management');
        break;
      
      case '/banking/activity':
        setTitle('Banking Activity');
        setDescription('Transaction history and activity');
        break;
      
      case '/banking/send-money':
        setTitle('Send Money');
        setDescription('Send payments and transfers');
        break;
      
      case '/banking/payroll':
        setTitle('Payroll Banking');
        setDescription('Payroll payments and management');
        break;
      
      case '/settings':
        setTitle('Settings');
        setDescription('Account and system preferences');
        break;
      
      case '/settings/profile':
        setTitle('Profile Settings');
        setDescription('Personal profile and account information');
        break;
      
      case '/settings/security':
        setTitle('Security Settings');
        setDescription('Security preferences and authentication');
        break;
      
      case '/settings/users':
        setTitle('User Management');
        setDescription('Manage user accounts and permissions');
        break;
      
      case '/settings/notifications':
        setTitle('Notifications');
        setDescription('Configure notification preferences');
        break;
      
      case '/settings/billing':
        setTitle('Billing Settings');
        setDescription('Manage billing and subscription settings');
        break;
      
      // Dispatch submenus
      case '/dispatch/active':
        setTitle('Active Loads');
        setDescription('Monitor and manage active load assignments');
        break;
      
      case '/dispatch/create':
        setTitle('Create Load');
        setDescription('Create new load assignments and dispatch orders');
        break;
      
      case '/dispatch/routes':
        setTitle('Route Planning');
        setDescription('Plan and optimize delivery routes');
        break;
      
      case '/dispatch/assignments':
        setTitle('Driver Assignment');
        setDescription('Assign drivers to loads and routes');
        break;
      
      // Accounting submenus
      case '/accounting/invoices':
        setTitle('Invoices');
        setDescription('Manage customer invoices and billing');
        break;
      
      case '/accounting/expenses':
        setTitle('Expenses');
        setDescription('Track and manage business expenses');
        break;
      
      case '/accounting/reports':
        setTitle('Financial Reports');
        setDescription('Generate financial reports and analytics');
        break;
      
      // HR submenus
      case '/hr/employees':
        setTitle('Employees');
        setDescription('Manage employee records and information');
        break;
      
      case '/hr/applications':
        setTitle('HR Applications');
        setDescription('Review and process employment applications');
        break;
      
      case '/hr/benefits':
        setTitle('Benefits');
        setDescription('Manage employee benefits and packages');
        break;
      
      // Payroll submenus
      case '/payroll/runs':
        setTitle('Payroll Runs');
        setDescription('Process and manage payroll runs');
        break;
      
      case '/payroll/reports':
        setTitle('Payroll Reports');
        setDescription('Generate payroll reports and summaries');
        break;
      
      case '/payroll/taxes':
        setTitle('Payroll Taxes');
        setDescription('Manage payroll tax obligations');
        break;
      
      // Banking submenus
      case '/banking/accounts':
        setTitle('Bank Accounts');
        setDescription('Manage banking accounts and balances');
        break;
      
      case '/banking/transfers':
        setTitle('Transfers');
        setDescription('Handle money transfers and payments');
        break;
      
      case '/banking/cards':
        setTitle('Corporate Cards');
        setDescription('Manage corporate credit cards');
        break;
      
      // Operations submenus
      case '/operations/monitoring':
        setTitle('Operations Monitoring');
        setDescription('Monitor operational performance and metrics');
        break;
      
      case '/operations/compliance':
        setTitle('Compliance Management');
        setDescription('Ensure regulatory compliance and safety');
        break;
      
      case '/operations/analytics':
        setTitle('Operations Analytics');
        setDescription('Analyze operational data and trends');
        break;
      
      case '/fleet/applications':
        setTitle('Driver Applications');
        setDescription('Review and process driver applications');
        break;
      
      case '/fleet/performance':
        setTitle('Performance');
        setDescription('Track driver and vehicle performance metrics');
        break;
      
      case '/fleet/onboarding':
        setTitle('Onboarding');
        setDescription('Driver onboarding and training programs');
        break;
      
      case '/fleet/documents':
        setTitle('Documents');
        setDescription('Manage driver documentation and certifications');
        break;
      
      default:
        setTitle('Dashboard');
        setDescription('Transportation management overview');
        break;
    }
  }, [location, setTitle, setDescription]);

  useEffect(() => {
    updateTitleAndDescription();
  }, [updateTitleAndDescription]);

  const renderContent = () => {
    switch (location) {
      // Dispatch module and submenus
      case '/dispatch':
        return <Dispatch />;
      case '/dispatch/active':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Active Loads</h2><p className="text-gray-600">Monitor and manage active load assignments</p></div>;
      case '/dispatch/create':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Create Load</h2><p className="text-gray-600">Create new load assignments and dispatch orders</p></div>;
      case '/dispatch/routes':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Route Planning</h2><p className="text-gray-600">Plan and optimize delivery routes</p></div>;
      case '/dispatch/assignments':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Driver Assignment</h2><p className="text-gray-600">Assign drivers to loads and routes</p></div>;
      
      // Fleet module and submenus
      case '/fleet':
        return <Fleet />;
      case '/fleet/applications':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Driver Applications</h2><p className="text-gray-600">Review and process driver applications</p></div>;
      case '/fleet/performance':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Performance</h2><p className="text-gray-600">Track driver and vehicle performance metrics</p></div>;
      case '/fleet/onboarding':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Onboarding</h2><p className="text-gray-600">Driver onboarding and training programs</p></div>;
      case '/fleet/documents':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Documents</h2><p className="text-gray-600">Manage driver documentation and certifications</p></div>;
      
      // Phase 1 Critical Business Modules
      case '/customers':
        return <CustomerModule />;
      case '/vendors':
        return <VendorModule />;
      case '/compliance':
        return <ComplianceModule />;
      
      // Accounting module and submenus
      case '/accounting':
        return <QuickBooksAccounting />;
      case '/accounting/invoices':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Invoices</h2><p className="text-gray-600">Manage customer invoices and billing</p></div>;
      case '/accounting/expenses':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Expenses</h2><p className="text-gray-600">Track and manage business expenses</p></div>;
      case '/accounting/reports':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Financial Reports</h2><p className="text-gray-600">Generate financial reports and analytics</p></div>;
      
      // HR module and submenus
      case '/hr':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">HR Management</h2><p className="text-gray-600">Manage employee records, applications, and benefits</p></div>;
      case '/hr/employees':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Employees</h2><p className="text-gray-600">Manage employee records and information</p></div>;
      case '/hr/applications':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">HR Applications</h2><p className="text-gray-600">Review and process employment applications</p></div>;
      case '/hr/benefits':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Benefits</h2><p className="text-gray-600">Manage employee benefits and packages</p></div>;
      
      // Payroll module and submenus
      case '/payroll':
        return <PayrollModule />;
      case '/payroll/runs':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Payroll Runs</h2><p className="text-gray-600">Process and manage payroll runs</p></div>;
      case '/payroll/reports':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Payroll Reports</h2><p className="text-gray-600">Generate payroll reports and summaries</p></div>;
      case '/payroll/taxes':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Payroll Taxes</h2><p className="text-gray-600">Manage payroll tax obligations</p></div>;
      
      // Banking module and submenus
      case '/banking':
        return <BankingModule />;
      case '/banking/accounts':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Bank Accounts</h2><p className="text-gray-600">Manage banking accounts and balances</p></div>;
      case '/banking/transfers':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Transfers</h2><p className="text-gray-600">Handle money transfers and payments</p></div>;
      case '/banking/cards':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Corporate Cards</h2><p className="text-gray-600">Manage corporate credit cards</p></div>;
      
      // Operations module and submenus
      case '/operations':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Operations Overview</h2><p className="text-gray-600">Monitor operational performance and metrics</p></div>;
      case '/operations/monitoring':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Operations Monitoring</h2><p className="text-gray-600">Monitor operational performance and metrics</p></div>;
      case '/operations/compliance':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Compliance Management</h2><p className="text-gray-600">Ensure regulatory compliance and safety</p></div>;
      case '/operations/analytics':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Operations Analytics</h2><p className="text-gray-600">Analyze operational data and trends</p></div>;
      // Settings module and submenus
      case '/settings':
        return <Settings />;
      case '/settings/profile':
        return <SettingsProfile />;
      case '/settings/security':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Security Settings</h2><p className="text-gray-600">Configure security preferences and authentication</p></div>;
      case '/settings/notifications':
        return <div className="p-6"><h2 className="text-xl font-bold mb-4">Notifications</h2><p className="text-gray-600">Configure notification preferences</p></div>;
      
      // Billing module and submenus
      case '/billing':
        return <BankingModule />;
      default:
        // Return null for dashboard - let TenantDashboard handle it
        return null;
    }
  };

  return <div className="w-full">{renderContent()}</div>;
}

export default memo(TenantContentRouter);