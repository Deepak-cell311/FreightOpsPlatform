import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Truck, Users, Package, Clock, Route, Shield } from "lucide-react";
import { TruckingLoadingSkeleton } from "@/components/trucking-loading-skeleton";
import Dispatch from "@/pages/dispatch";
import Fleet from "@/pages/fleet";
import RouteOptimization from "@/pages/route-optimization";
import ComplianceManagement from "@/pages/compliance-management";

interface OperationsData {
  loads: {
    active: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
  drivers: {
    total: number;
    active: number;
    available: number;
    onDuty: number;
    hoursCompliance: number;
  };
  vehicles: {
    total: number;
    active: number;
    maintenance: number;
    available: number;
    utilization: number;
  };
  performance: {
    onTimeDelivery: number;
    fuelEfficiency: number;
    customerSatisfaction: number;
  };
}

export default function Operations() {
  const [location] = useLocation();
  const { data: operationsData, isLoading } = useQuery<OperationsData>({
    queryKey: ["/api/dashboard/operations"],
  });

  if (isLoading) {
    return <TruckingLoadingSkeleton variant="load" />;
  }

  // Handle submenu routing
  if (location === '/operations/load-management') {
    return <Dispatch />;
  }
  
  if (location === '/operations/driver-management') {
    return <Fleet />;
  }
  
  if (location === '/operations/route-optimization') {
    return <RouteOptimization />;
  }
  
  if (location === '/operations/compliance') {
    return <ComplianceManagement />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Operations Overview</h1>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loads</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operationsData?.loads.active || 0}</div>
            <p className="text-xs text-muted-foreground">
              {operationsData?.loads.pending || 0} pending assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operationsData?.drivers.active || 0}</div>
            <p className="text-xs text-muted-foreground">
              of {operationsData?.drivers.total || 0} total drivers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fleet Utilization</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operationsData?.vehicles.utilization || 0}%</div>
            <Progress value={operationsData?.vehicles.utilization || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operationsData?.performance.onTimeDelivery || 0}%</div>
            <Progress value={operationsData?.performance.onTimeDelivery || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Load Status</CardTitle>
            <CardDescription>Current load distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Active</span>
              <span className="font-semibold">{operationsData?.loads.active || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Pending</span>
              <span className="font-semibold">{operationsData?.loads.pending || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed</span>
              <span className="font-semibold">{operationsData?.loads.completed || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Cancelled</span>
              <span className="font-semibold text-red-600">{operationsData?.loads.cancelled || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Driver Status</CardTitle>
            <CardDescription>Driver availability and compliance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Total Drivers</span>
              <span className="font-semibold">{operationsData?.drivers.total || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Active</span>
              <span className="font-semibold">{operationsData?.drivers.active || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Available</span>
              <span className="font-semibold">{operationsData?.drivers.available || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>On Duty</span>
              <span className="font-semibold">{operationsData?.drivers.onDuty || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>HOS Compliance</span>
              <span className="font-semibold">{operationsData?.drivers.hoursCompliance || 0}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fleet Status</CardTitle>
            <CardDescription>Vehicle availability and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Total Vehicles</span>
              <span className="font-semibold">{operationsData?.vehicles.total || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Active</span>
              <span className="font-semibold">{operationsData?.vehicles.active || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Available</span>
              <span className="font-semibold">{operationsData?.vehicles.available || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>In Maintenance</span>
              <span className="font-semibold text-yellow-600">{operationsData?.vehicles.maintenance || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Key operational performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>On-Time Delivery</span>
                <span>{operationsData?.performance.onTimeDelivery || 0}%</span>
              </div>
              <Progress value={operationsData?.performance.onTimeDelivery || 0} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Fuel Efficiency</span>
                <span>{operationsData?.performance.fuelEfficiency || 0} MPG</span>
              </div>
              <Progress value={(operationsData?.performance.fuelEfficiency || 0) * 10} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Customer Satisfaction</span>
                <span>{operationsData?.performance.customerSatisfaction || 0}/5.0</span>
              </div>
              <Progress value={(operationsData?.performance.customerSatisfaction || 0) * 20} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}