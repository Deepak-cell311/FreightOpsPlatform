import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EquipmentTable } from "@/components/equipment-table";
import DriversTable from "@/components/drivers-table";
import LiveMap from '@/components/live-map';
import { TruckingLoadingSkeleton } from "@/components/trucking-loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Wrench, 
  Calendar, 
  AlertTriangle, 
  Fuel, 
  Shield, 
  FileText, 
  Plus, 
  Activity, 
  BarChart3, 
  TrendingUp, 
  Zap, 
  Database, 
  Brain, 
  Truck, 
  MapPin, 
  Users, 
  Clock, 
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";

// Role-based access control
const FLEET_ROLES = ["fleet-admin", "dispatcher", "manager", "admin"];

// Fleet-specific hooks and data fetching
function useFleetData(companyId: string) {
  const { data: fleetAssets, isLoading: assetsLoading } = useQuery({
    queryKey: ['/api/fleet/assets', companyId],
    enabled: !!companyId,
  });

  const { data: driverHOS, isLoading: hosLoading } = useQuery({
    queryKey: ['/api/eld/logs', companyId],
    enabled: !!companyId,
  });

  const { data: complianceAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/fleet/compliance-alerts', companyId],
    enabled: !!companyId,
  });

  return {
    fleetAssets: fleetAssets || { trucks: [], trailers: [], drivers: [] },
    driverHOS: driverHOS || [],
    complianceAlerts: complianceAlerts || [],
    isLoading: assetsLoading || hosLoading || alertsLoading
  };
}

// Compliance Alert Component
function ComplianceAlertsCard({ alerts }: { alerts: any[] }) {
  if (!alerts || alerts.length === 0) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Fleet Compliance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">All Clear</Badge>
            <span className="text-sm text-green-700">No compliance issues detected</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-red-50 border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-800">
          <AlertCircle className="h-5 w-5" />
          Compliance Alerts ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <Alert key={index} className="border-red-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-sm text-gray-600">{alert.description}</p>
                  </div>
                  <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                    {alert.severity}
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Equipment Table with HOS integration
function EnhancedEquipmentTable({ trucks, drivers, driverHOS }: { trucks: any[], drivers: any[], driverHOS: any[] }) {
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortField, setSortField] = useState<string>('equipmentNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredTrucks = trucks.filter(truck => {
    if (filter === 'all') return true;
    return filter === 'active' ? truck.isActive : !truck.isActive;
  });

  const sortedTrucks = [...filteredTrucks].sort((a, b) => {
    const aVal = a[sortField] || '';
    const bVal = b[sortField] || '';
    const comparison = aVal.toString().localeCompare(bVal.toString());
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({trucks.length})
          </Button>
          <Button 
            variant={filter === 'active' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('active')}
          >
            Active ({trucks.filter(t => t.isActive).length})
          </Button>
          <Button 
            variant={filter === 'inactive' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('inactive')}
          >
            Inactive ({trucks.filter(t => !t.isActive).length})
          </Button>
        </div>
        <Button onClick={() => window.location.href = '/fleet-management'}>
          <Plus className="h-4 w-4 mr-2" />
          Add Truck/Trailer
        </Button>
      </div>

      <div className="border rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left cursor-pointer" onClick={() => {
                setSortField('equipmentNumber');
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
              }}>
                Equipment #
              </th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Assigned Driver</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTrucks.map((truck) => {
              const assignedDriver = drivers.find(d => d.assignedTruck === truck.id);
              const driverHOSData = assignedDriver ? driverHOS.find(h => h.driverId === assignedDriver.id) : null;
              const isOutOfHours = driverHOSData && (driverHOSData.hoursDrivenToday > 11 || driverHOSData.workHoursLast8Days > 70);

              return (
                <tr key={truck.id} className="border-t">
                  <td className="p-3 font-medium">{truck.equipmentNumber}</td>
                  <td className="p-3">{truck.equipmentType}</td>
                  <td className="p-3">
                    {assignedDriver ? (
                      <div className="flex items-center gap-2">
                        <span>{assignedDriver.firstName} {assignedDriver.lastName}</span>
                        {isOutOfHours && (
                          <Badge variant="destructive" className="text-xs">
                            Out of Hours
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">Unassigned</span>
                    )}
                  </td>
                  <td className="p-3">
                    <Badge variant={truck.isActive ? 'default' : 'secondary'}>
                      {truck.status || (truck.isActive ? 'Active' : 'Inactive')}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {truck.currentLocation || 'Unknown'}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">
                        {assignedDriver ? 'Unassign' : 'Assign'}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Enhanced Drivers Table with HOS integration
function EnhancedDriversTable({ drivers, driverHOS }: { drivers: any[], driverHOS: any[] }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Fleet Drivers</h3>
        <Button onClick={() => window.location.href = '/hr-onboarding'}>
          <Plus className="h-4 w-4 mr-2" />
          Add Driver
        </Button>
      </div>

      <div className="border rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Driver</th>
              <th className="p-3 text-left">CDL Status</th>
              <th className="p-3 text-left">Assigned Truck</th>
              <th className="p-3 text-left">HOS Available</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => {
              const hosData = driverHOS.find(h => h.driverId === driver.id);
              const hoursRemaining = hosData ? Math.max(0, 11 - hosData.hoursDrivenToday) : 11;
              const cdlExpiring = driver.cdlExpiration && new Date(driver.cdlExpiration) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

              return (
                <tr key={driver.id} className="border-t">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{driver.firstName} {driver.lastName}</span>
                      {cdlExpiring && (
                        <Badge variant="destructive" className="text-xs">
                          CDL Expiring
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={cdlExpiring ? 'destructive' : 'default'}>
                        {driver.cdlClass || 'CDL-A'}
                      </Badge>
                      {driver.hazmatEndorsement && (
                        <Badge variant="secondary" className="text-xs">HAZMAT</Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-sm">
                    {driver.assignedTruck || 'Unassigned'}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${hoursRemaining < 2 ? 'text-red-600' : hoursRemaining < 4 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {hoursRemaining.toFixed(1)}h
                      </span>
                      {hoursRemaining < 2 && (
                        <Badge variant="destructive" className="text-xs">
                          Low Hours
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant={driver.status === 'available' ? 'default' : 'secondary'}>
                      {driver.status || 'Available'}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Assign</Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Fleet() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState("vehicles");

  // Role-based access check
  const hasFleetAccess = user?.role && FLEET_ROLES.includes(user.role);

  // Multi-tenant scoped data fetching
  const { fleetAssets, driverHOS, complianceAlerts, isLoading } = useFleetData(user?.companyId || '');

  // Fleet metrics calculation
  const fleetMetrics = {
    totalTrucks: fleetAssets.trucks?.length || 0,
    activeTrucks: fleetAssets.trucks?.filter(t => t.isActive).length || 0,
    totalDrivers: fleetAssets.drivers?.length || 0,
    availableDrivers: fleetAssets.drivers?.filter(d => d.status === 'available').length || 0,
    averageFuelEfficiency: 6.8, // Simulated average MPG
    onTimePerformance: 94.2, // Simulated percentage
    maintenanceAlerts: complianceAlerts.filter(a => a.type === 'maintenance_overdue').length,
    hoursViolations: driverHOS.filter(h => h.violationAlerts.length > 0).length
  };

  // Auth and role check with redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access fleet management",
        variant: "destructive",
      });
      window.location.href = "/auth";
      return;
    }

    if (!authLoading && isAuthenticated && !hasFleetAccess) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access fleet management",
        variant: "destructive",
      });
      window.location.href = "/dashboard";
      return;
    }
  }, [isAuthenticated, authLoading, hasFleetAccess, toast]);

  if (authLoading || isLoading) {
    return <TruckingLoadingSkeleton variant="fleet" />;
  }

  if (!isAuthenticated || !user || !hasFleetAccess) {
    return null;
  }

  // Render different content based on route
  const renderFleetContent = () => {
    switch (location) {
      case '/fleet/vehicles':
        return <EquipmentTable />;
      
      case '/fleet/drivers':
        return <DriversTable />;
      
      case '/fleet/maintenance':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Maintenance Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Scheduled Maintenance</h3>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Service
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Due Soon</Badge>
                      <span className="text-sm text-gray-600">TRK-001</span>
                    </div>
                    <h4 className="font-medium">Oil Change</h4>
                    <p className="text-sm text-gray-600">Due: 145,000 miles</p>
                    <p className="text-sm text-gray-600">Current: 142,850 miles</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-red-50 border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="destructive">Overdue</Badge>
                      <span className="text-sm text-gray-600">TRK-003</span>
                    </div>
                    <h4 className="font-medium">DOT Inspection</h4>
                    <p className="text-sm text-gray-600">Due: Dec 15, 2024</p>
                    <p className="text-sm text-red-600">5 days overdue</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>
                      <span className="text-sm text-gray-600">TRK-002</span>
                    </div>
                    <h4 className="font-medium">Brake Service</h4>
                    <p className="text-sm text-gray-600">Completed: Dec 18, 2024</p>
                    <p className="text-sm text-gray-600">Next: Jun 18, 2025</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case '/fleet/inspections':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Vehicle Inspections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">DOT Inspections</h3>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Record Inspection
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Annual Inspection</h4>
                      <Badge variant="default" className="bg-green-100 text-green-800">Passed</Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Vehicle: TRK-001</p>
                      <p>Inspector: DOT Station #4429</p>
                      <p>Date: Nov 28, 2024</p>
                      <p>Next Due: Nov 28, 2025</p>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Roadside Inspection</h4>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Level 1</Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Vehicle: TRK-002</p>
                      <p>Location: I-40, Oklahoma</p>
                      <p>Date: Dec 10, 2024</p>
                      <p>Result: No violations</p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h4 className="font-medium text-blue-800 mb-2">Compliance Summary</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-blue-600">Safety Rating</p>
                      <p className="font-semibold">Satisfactory</p>
                    </div>
                    <div>
                      <p className="text-blue-600">Inspections YTD</p>
                      <p className="font-semibold">8 Passed</p>
                    </div>
                    <div>
                      <p className="text-blue-600">Violations</p>
                      <p className="font-semibold">0 OOS</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case '/fleet/fuel':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fuel className="h-5 w-5" />
                Fuel Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Advanced Fuel Analytics</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Purchase
                    </Button>
                  </div>
                </div>
                
                {/* KPI Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600">Fleet MPG</p>
                        <p className="text-2xl font-bold text-blue-800">7.2</p>
                        <p className="text-xs text-blue-600">+0.3 vs last month</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-green-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600">Cost Per Mile</p>
                        <p className="text-2xl font-bold text-green-800">${fleetMetrics?.profitPerMile?.toFixed(2) || '0.00'}</p>
                        <p className="text-xs text-green-600">{fleetMetrics?.profitVariance || 'No variance data'}</p>
                      </div>
                      <Activity className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-amber-50 to-amber-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-600">Monthly Spend</p>
                        <p className="text-2xl font-bold text-amber-800">${fleetMetrics?.monthlyMaintenance?.toLocaleString() || '0'}</p>
                        <p className="text-xs text-amber-600">Budget: {fleetMetrics?.monthlyBudget || 'Contact for budget details'}</p>
                      </div>
                      <Fuel className="h-8 w-8 text-amber-600" />
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-purple-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600">AI Optimization</p>
                        <p className="text-2xl font-bold text-purple-800">12%</p>
                        <p className="text-xs text-purple-600">Savings potential</p>
                      </div>
                      <Brain className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </div>
                
                {/* Real-time Fuel Data */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3 flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-orange-500" />
                      Real-time Fuel Monitoring
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">TRK-001</p>
                          <p className="text-sm text-gray-600">I-40 East, Mile 142</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">7.8 MPG</p>
                          <p className="text-sm text-gray-600">75% Tank</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded border-red-200">
                        <div>
                          <p className="font-medium">TRK-003</p>
                          <p className="text-sm text-gray-600">I-35 North, Mile 89</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-red-600">5.1 MPG</p>
                          <p className="text-sm text-red-600">Low Efficiency Alert</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3 flex items-center">
                      <Database className="h-4 w-4 mr-2 text-blue-500" />
                      Predictive Analytics
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium text-blue-800">Route Optimization</p>
                          <Badge className="bg-blue-100 text-blue-800">AI Powered</Badge>
                        </div>
                        <p className="text-sm text-blue-700">{fleetMetrics?.routeOptimizationSavings || 'Route optimization data being analyzed'}</p>
                      </div>
                      
                      <div className="p-3 bg-green-50 rounded">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium text-green-800">Maintenance Alert</p>
                          <Badge className="bg-green-100 text-green-800">Preventive</Badge>
                        </div>
                        <p className="text-sm text-green-700">TRK-002 air filter replacement due - 3% efficiency gain expected</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case '/fleet/compliance':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Fleet Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">AI-Powered Compliance Center</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Brain className="h-4 w-4 mr-2" />
                      AI Audit
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Reports
                    </Button>
                  </div>
                </div>
                
                {/* Compliance Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-green-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600">Safety Score</p>
                        <p className="text-2xl font-bold text-green-800">98.7%</p>
                        <p className="text-xs text-green-600">Industry leading</p>
                      </div>
                      <Shield className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600">HOS Compliance</p>
                        <p className="text-2xl font-bold text-blue-800">100%</p>
                        <p className="text-xs text-blue-600">0 violations YTD</p>
                      </div>
                      <Activity className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-purple-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600">Risk Score</p>
                        <p className="text-2xl font-bold text-purple-800">Low</p>
                        <p className="text-xs text-purple-600">AI assessed</p>
                      </div>
                      <Brain className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </div>
                
                {/* Real-time Monitoring */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3 flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-orange-500" />
                      Live Compliance Monitoring
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded border-green-200">
                        <div>
                          <p className="font-medium">Driver: Maria Garcia</p>
                          <p className="text-sm text-gray-600">TRK-001 • On Duty: 6h 15m</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                          <p className="text-sm text-gray-600 mt-1">4h 45m remaining</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-yellow-50 rounded border-yellow-200">
                        <div>
                          <p className="font-medium">Driver: David Wilson</p>
                          <p className="text-sm text-gray-600">TRK-002 • Break Due: 15 min</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-yellow-100 text-yellow-800">Alert</Badge>
                          <p className="text-sm text-gray-600 mt-1">30 min break req.</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded border-blue-200">
                        <div>
                          <p className="font-medium">Driver: Sarah Johnson</p>
                          <p className="text-sm text-gray-600">TRK-003 • Off Duty: 9h 45m</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-blue-100 text-blue-800">Resting</Badge>
                          <p className="text-sm text-gray-600 mt-1">Ready in 15m</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3 flex items-center">
                      <Brain className="h-4 w-4 mr-2 text-purple-500" />
                      AI Risk Assessment
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 rounded">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium text-green-800">Fleet Performance</p>
                          <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                        </div>
                        <p className="text-sm text-green-700">Zero safety incidents in 180 days. Maintain current protocols.</p>
                      </div>
                      
                      <div className="p-3 bg-blue-50 rounded">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium text-blue-800">Predictive Maintenance</p>
                          <Badge className="bg-blue-100 text-blue-800">Optimized</Badge>
                        </div>
                        <p className="text-sm text-blue-700">AI scheduling prevents 94% of potential breakdowns</p>
                      </div>
                      
                      <div className="p-3 bg-amber-50 rounded">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium text-amber-800">Route Risk Analysis</p>
                          <Badge className="bg-amber-100 text-amber-800">Monitoring</Badge>
                        </div>
                        <p className="text-sm text-amber-700">Weather conditions may affect I-40 routes today</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Compliance Metrics */}
                <div className="border rounded-lg p-4 bg-gradient-to-r from-slate-50 to-slate-100">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Database className="h-4 w-4 mr-2 text-slate-600" />
                    Enterprise Compliance Metrics
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-800">0</p>
                      <p className="text-sm text-slate-600">Out of Service</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-800">15</p>
                      <p className="text-sm text-slate-600">Clean Inspections</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-800">100%</p>
                      <p className="text-sm text-slate-600">ELD Compliance</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-800">A+</p>
                      <p className="text-sm text-slate-600">Safety Rating</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      default:
        // Fleet overview with tabs
        return (
          <Tabs defaultValue="vehicles" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
              <TabsTrigger value="drivers">Drivers</TabsTrigger>
              <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
            </TabsList>

            <TabsContent value="vehicles" className="space-y-6">
              {/* Advanced Vehicle Management */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Active Vehicles</p>
                      <p className="text-2xl font-bold text-blue-800">47</p>
                      <p className="text-xs text-blue-600">92% operational</p>
                    </div>
                    <Truck className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">On Route</p>
                      <p className="text-2xl font-bold text-green-800">34</p>
                      <p className="text-xs text-green-600">72% utilization</p>
                    </div>
                    <MapPin className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg bg-gradient-to-r from-amber-50 to-amber-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-600">Maintenance Due</p>
                      <p className="text-2xl font-bold text-amber-800">8</p>
                      <p className="text-xs text-amber-600">AI scheduled</p>
                    </div>
                    <Wrench className="h-8 w-8 text-amber-600" />
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg bg-gradient-to-r from-red-50 to-red-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600">Critical Issues</p>
                      <p className="text-2xl font-bold text-red-800">2</p>
                      <p className="text-xs text-red-600">Immediate attention</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </div>
              </div>
              
              {/* Vehicle Management Table */}
              <div className="border rounded-lg">
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Fleet Overview</h3>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Export Report</Button>
                      <Button size="sm">Add Vehicle</Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-8 gap-4 text-sm font-medium text-gray-700 mb-4">
                    <div>Unit #</div>
                    <div>Make/Model</div>
                    <div>Status</div>
                    <div>Location</div>
                    <div>Driver</div>
                    <div>Fuel Efficiency</div>
                    <div>Next Service</div>
                    <div>Actions</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-8 gap-4 items-center p-3 border rounded hover:bg-gray-50">
                      <div className="font-medium">T-001</div>
                      <div>2023 Kenworth T680</div>
                      <div><Badge className="bg-green-100 text-green-800">On Route</Badge></div>
                      <div className="text-sm">Kansas City, MO</div>
                      <div className="text-sm">John Smith</div>
                      <div className="text-sm">7.2 MPG</div>
                      <div className="text-sm">Jan 15, 2025</div>
                      <div>
                        <Button variant="outline" size="sm">Manage</Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-8 gap-4 items-center p-3 border rounded hover:bg-gray-50">
                      <div className="font-medium">T-002</div>
                      <div>2022 Freightliner Cascadia</div>
                      <div><Badge className="bg-blue-100 text-blue-800">Loading</Badge></div>
                      <div className="text-sm">Dallas, TX</div>
                      <div className="text-sm">Mike Johnson</div>
                      <div className="text-sm">6.8 MPG</div>
                      <div className="text-sm">Dec 28, 2024</div>
                      <div>
                        <Button variant="outline" size="sm">Manage</Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-8 gap-4 items-center p-3 border rounded hover:bg-gray-50">
                      <div className="font-medium">T-003</div>
                      <div>2024 Peterbilt 579</div>
                      <div><Badge variant="destructive">Maintenance</Badge></div>
                      <div className="text-sm">Houston, TX</div>
                      <div className="text-sm">-</div>
                      <div className="text-sm">8.1 MPG</div>
                      <div className="text-sm">Overdue</div>
                      <div>
                        <Button variant="outline" size="sm">Urgent</Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-8 gap-4 items-center p-3 border rounded hover:bg-gray-50">
                      <div className="font-medium">T-004</div>
                      <div>2023 Volvo VNL</div>
                      <div><Badge className="bg-green-100 text-green-800">Delivering</Badge></div>
                      <div className="text-sm">Atlanta, GA</div>
                      <div className="text-sm">Sarah Wilson</div>
                      <div className="text-sm">7.5 MPG</div>
                      <div className="text-sm">Feb 3, 2025</div>
                      <div>
                        <Button variant="outline" size="sm">Manage</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="drivers" className="space-y-6">
              <DriversTable />
            </TabsContent>

            <TabsContent value="tracking" className="space-y-6">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Live Fleet Tracking</h3>
                  <div className="h-96">
                    <LiveMap vehicles={[]} />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Fleet Management</h1>
          <p className="text-gray-600">
            Manage your vehicles, drivers, and track fleet performance
          </p>
        </div>

        {/* Render content based on current route */}
        {renderFleetContent()}
      </div>
    </div>
  );
}