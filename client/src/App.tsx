import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth, AuthProvider } from "@/hooks/use-auth";
import { Suspense, lazy, memo } from "react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import SimpleLogin from "@/pages/simple-login";
import HQAdmin from "@/pages/hq-admin";
import ErrorBoundary from "@/components/error-boundary";

const Register = lazy(() => import("@/pages/register"));
const PublicApplication = lazy(() => import("@/pages/public-application"));
const LoadDetail = lazy(() => import("@/pages/load-detail"));
import TenantDashboard from "@/pages/tenant-dashboard";
import HQLogin from "@/pages/hq-login";

import StableRouter from "@/components/stable-router";

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <TooltipProvider>
              <Router />
              <Toaster />
            </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

function Router() {
  const { user, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  

  
  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/hq-login', '/hq', '/', '/apply'];
  const isPublicRoute = publicRoutes.some(route => location.startsWith(route));
  
  // Only show loading spinner for protected routes, not public routes
  if (isLoading && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  // Redirect to login if not authenticated and trying to access protected route
  if (!user && !isPublicRoute && !isLoading) {
    console.log('User not authenticated, redirecting to login');
    navigate('/login');
    return null;
  }

  // If user is authenticated but on login page, redirect to dashboard
  if (user && location === '/login') {
    console.log('User already authenticated, redirecting to dashboard');
    navigate('/dashboard');
    return null;
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={SimpleLogin} />
      <Route path="/hq-login" component={HQLogin} />
      
      {/* Lazy loaded public routes */}
      <Route path="/register" component={() => (
        <Suspense fallback={<div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mt-8" />}>
          <Register />
        </Suspense>
      )} />
      <Route path="/apply/:companyId" component={() => (
        <Suspense fallback={<div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mt-8" />}>
          <PublicApplication />
        </Suspense>
      )} />
      <Route path="/apply/invitation/:token" component={() => (
        <Suspense fallback={<div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mt-8" />}>
          <PublicApplication />
        </Suspense>
      )} />
      
      {/* Load detail route */}
      <Route path="/load/:id" component={() => (
        <Suspense fallback={<div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mt-8" />}>
          <LoadDetail />
        </Suspense>
      )} />
      
      {/* HQ Routes - separate authentication system */}
      <Route path="/hq" component={HQAdmin} />
      <Route path="/hq/:section" component={HQAdmin} />
      <Route path="/hq/:section/:subsection" component={HQAdmin} />
      
      {/* Protected routes - require authentication */}
      {user && (
        <>
          
          {/* Tenant Routes - for all non-platform_owner users */}
          {user.role !== 'platform_owner' && (
            <>
              <Route path="/dashboard" component={TenantDashboard} />
              
              {/* Dispatch routes */}
              <Route path="/dispatch" component={TenantDashboard} />
              <Route path="/dispatch/active" component={TenantDashboard} />
              <Route path="/dispatch/create" component={TenantDashboard} />
              <Route path="/dispatch/routes" component={TenantDashboard} />
              <Route path="/dispatch/assignments" component={TenantDashboard} />
              
              {/* Fleet routes */}
              <Route path="/fleet" component={TenantDashboard} />
              <Route path="/fleet/applications" component={TenantDashboard} />
              <Route path="/fleet/performance" component={TenantDashboard} />
              <Route path="/fleet/onboarding" component={TenantDashboard} />
              <Route path="/fleet/documents" component={TenantDashboard} />
              
              {/* Phase 1 Critical Business Modules */}
              <Route path="/customers" component={TenantDashboard} />
              <Route path="/vendors" component={TenantDashboard} />
              <Route path="/compliance" component={TenantDashboard} />
              
              {/* HR routes */}
              <Route path="/hr" component={TenantDashboard} />
              <Route path="/hr/employees" component={TenantDashboard} />
              <Route path="/hr/applications" component={TenantDashboard} />
              <Route path="/hr/benefits" component={TenantDashboard} />
              
              {/* Payroll routes */}
              <Route path="/payroll" component={TenantDashboard} />
              <Route path="/payroll/runs" component={TenantDashboard} />
              <Route path="/payroll/reports" component={TenantDashboard} />
              <Route path="/payroll/taxes" component={TenantDashboard} />
              
              {/* Banking routes */}
              <Route path="/billing" component={TenantDashboard} />
              <Route path="/banking" component={TenantDashboard} />
              <Route path="/banking/accounts" component={TenantDashboard} />
              <Route path="/banking/transfers" component={TenantDashboard} />
              <Route path="/banking/cards" component={TenantDashboard} />
              
              {/* Accounting routes */}
              <Route path="/accounting" component={TenantDashboard} />
              <Route path="/accounting/invoices" component={TenantDashboard} />
              <Route path="/accounting/expenses" component={TenantDashboard} />
              <Route path="/accounting/reports" component={TenantDashboard} />
              <Route path="/accounting-management" component={TenantDashboard} />
              
              {/* Operations routes */}
              <Route path="/operations" component={TenantDashboard} />
              <Route path="/operations/monitoring" component={TenantDashboard} />
              <Route path="/operations/compliance" component={TenantDashboard} />
              <Route path="/operations/analytics" component={TenantDashboard} />
              
              {/* Settings routes */}
              <Route path="/settings" component={TenantDashboard} />
              <Route path="/settings/profile" component={TenantDashboard} />
              <Route path="/settings/security" component={TenantDashboard} />
              <Route path="/settings/notifications" component={TenantDashboard} />
              
              {/* Other routes */}
              <Route path="/reports" component={TenantDashboard} />
              <Route path="/wallet" component={TenantDashboard} />
            </>
          )}
        </>
      )}

      {/* Fallback route - redirect authenticated users to their dashboard */}
      <Route component={() => {
        if (user) {
          if (user.role === 'platform_owner') {
            navigate('/hq');
          } else {
            navigate('/dashboard');
          }
          return null;
        }
        return <NotFound />;
      }} />
    </Switch>
  );
}

export default App;