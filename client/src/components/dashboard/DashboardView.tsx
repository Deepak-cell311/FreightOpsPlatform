import React from 'react';
import { AlertBanner } from './AlertBanner';
import { KPIGrid } from './KPIGrid';
import { RevenueChart } from './RevenueChart';
import { FleetStatusCard } from './FleetStatusCard';
import { DriverUtilization } from './DriverUtilization';
import { LiveLoadStream } from './LiveLoadStream';
import { QuickActionsPanel } from './QuickActionsPanel';

export function DashboardView() {
  return (
    <div className="dashboard-grid space-y-6 p-6">
      <AlertBanner />
      <KPIGrid />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <FleetStatusCard />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DriverUtilization />
        <LiveLoadStream />
      </div>
      <QuickActionsPanel />
    </div>
  );
}