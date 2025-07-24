import { memo, lazy, Suspense } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
// HQ auth now uses unified auth system with role-based access
import Landing from "@/pages/landing";
import SimpleLogin from "@/pages/simple-login";
import Register from "@/pages/register";
import TenantDashboard from "@/pages/tenant-dashboard";
import HQMain from "@/hq/hq-main";
import HQLogin from "@/pages/hq-login";

// Lazy load profile pages
const TruckProfile = lazy(() => import("@/pages/truck-profile"));
const TrailerProfile = lazy(() => import("@/pages/trailer-profile"));
const DriverProfile = lazy(() => import("@/pages/driver-profile"));
const EmployeeProfile = lazy(() => import("@/pages/employee-profile"));
const CustomerProfile = lazy(() => import("@/pages/customer-profile"));
const PayrollDashboard = lazy(() => import("@/pages/payroll-dashboard-new"));
const HRUnified = lazy(() => import("@/pages/hr-unified"));
const PayrollUnified = lazy(() => import("@/pages/payroll"));

const StableRouter = memo(() => {
  const { isAuthenticated, user, isLoading } = useAuth();
  // HQ authentication now uses unified system with platform_owner role check
  const [location] = useLocation();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // HQ routes - unified authentication with platform_owner role
  if (location.startsWith('/hq')) {
    if (location === '/hq/login') {
      return <HQLogin />;
    }
    
    // Check if user is authenticated with platform_owner role
    if (!isAuthenticated || user?.role !== 'platform_owner') {
      return <HQLogin />;
    }
    
    return <HQMain />;
  }

  // Authentication routes
  if (location === '/login') {
    return <SimpleLogin />;
  }
  
  if (location === '/register') {
    return <Register />;
  }

  // Public routes for unauthenticated users
  if (!isAuthenticated) {
    if (location === '/') {
      return <Landing />;
    }
    return <SimpleLogin />;
  }



  // Profile page routes for authenticated users
  if (location.startsWith('/trucks/') && location.split('/').length === 3) {
    return (
      <Suspense fallback={<div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mt-8" />}>
        <TruckProfile />
      </Suspense>
    );
  }
  
  if (location.startsWith('/trailers/') && location.split('/').length === 3) {
    return (
      <Suspense fallback={<div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mt-8" />}>
        <TrailerProfile />
      </Suspense>
    );
  }
  
  if (location.startsWith('/drivers/') && location.split('/').length === 3) {
    return (
      <Suspense fallback={<div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mt-8" />}>
        <DriverProfile />
      </Suspense>
    );
  }
  
  if (location.startsWith('/employees/') && location.split('/').length === 3) {
    return (
      <Suspense fallback={<div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mt-8" />}>
        <EmployeeProfile />
      </Suspense>
    );
  }
  
  if (location.startsWith('/customers/') && location.split('/').length === 3) {
    return (
      <Suspense fallback={<div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mt-8" />}>
        <CustomerProfile />
      </Suspense>
    );
  }



  // HR and Payroll routes
  if (location === '/hr' || location.startsWith('/hr/')) {
    return (
      <Suspense fallback={<div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mt-8" />}>
        <HRUnified />
      </Suspense>
    );
  }
  
  if (location === '/payroll' || location.startsWith('/payroll/')) {
    return (
      <Suspense fallback={<div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mt-8" />}>
        <PayrollUnified />
      </Suspense>
    );
  }

  // Authenticated users go to tenant dashboard (including at root)
  return <TenantDashboard />;
});

StableRouter.displayName = 'StableRouter';

export default StableRouter;