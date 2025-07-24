import React from "react";
import ReactDOM from "react-dom/client";
import { Switch, Route, Router } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HQAuthProvider, useHQAuth } from "@/hooks/use-hq-auth";
import { Suspense, lazy } from "react";
import "./index.css";

// Lazy load HQ components
const HQLogin = lazy(() => import("@/pages/hq-login"));
const HQAdmin = lazy(() => import("@/pages/hq-admin"));
const HQBankingAdmin = lazy(() => import("@/pages/hq-banking-admin"));

function HQApp() {
  const { isAuthenticated, isLoading } = useHQAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mt-8" />}>
        <HQLogin />
      </Suspense>
    );
  }

  return (
    <Router>
      <Switch>
        <Route path="/hq/admin" component={() => (
          <Suspense fallback={<div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mt-8" />}>
            <HQAdmin />
          </Suspense>
        )} />
        <Route path="/hq/banking" component={() => (
          <Suspense fallback={<div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mt-8" />}>
            <HQBankingAdmin />
          </Suspense>
        )} />
        <Route path="/" component={() => (
          <Suspense fallback={<div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mt-8" />}>
            <HQAdmin />
          </Suspense>
        )} />
        <Route component={() => (
          <Suspense fallback={<div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mt-8" />}>
            <HQAdmin />
          </Suspense>
        )} />
      </Switch>
    </Router>
  );
}

function HQRoot() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <HQAuthProvider>
          <HQApp />
          <Toaster />
        </HQAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<HQRoot />);