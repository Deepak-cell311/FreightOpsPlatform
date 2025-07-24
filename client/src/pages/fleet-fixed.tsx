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
  const { fleetAssets, driverHOS, complianceAlerts, isLoading } = useFleetData(user?.companyId);

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

  // Use real compliance alerts from API data
  const realComplianceAlerts = complianceAlerts || [];

  return (
    <div className="space-y-6">
      {/* Fleet Overview Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Fleet Management</h1>
          <p className="text-gray-600">Manage your vehicles, drivers, and compliance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = '/fleet-management'}>
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </Button>
          <Button onClick={() => window.location.href = '/hr-onboarding'}>
            <Users className="h-4 w-4 mr-2" />
            Add Driver
          </Button>
        </div>
      </div>

      {/* Compliance Alerts */}
      <ComplianceAlertsCard alerts={realComplianceAlerts} />

      {/* Fleet KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Vehicles</p>
                <p className="text-2xl font-bold">{fleetAssets.trucks?.filter(t => t.isActive).length || 0}</p>
              </div>
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Drivers</p>
                <p className="text-2xl font-bold">{fleetAssets.drivers?.filter(d => d.status === 'available').length || 0}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Compliance Issues</p>
                <p className="text-2xl font-bold text-red-600">{realComplianceAlerts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fleet Utilization</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(((fleetAssets.trucks?.filter(t => t.status === 'in_transit').length || 0) / 
                              Math.max(fleetAssets.trucks?.length || 1, 1)) * 100)}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fleet Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles" className="space-y-6">
          <EnhancedEquipmentTable 
            trucks={fleetAssets.trucks || []} 
            drivers={fleetAssets.drivers || []}
            driverHOS={driverHOS}
          />
        </TabsContent>

        <TabsContent value="drivers" className="space-y-6">
          <EnhancedDriversTable 
            drivers={fleetAssets.drivers || []}
            driverHOS={driverHOS}
          />
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Live Fleet Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <LiveMap />
              </div>
            </CardContent>
          </Card>

          {/* Real-time Fleet Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Driver Hours Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(fleetAssets.drivers || []).slice(0, 5).map((driver, index) => {
                    const hosData = driverHOS.find(h => h.driverId === driver.id);
                    const hoursRemaining = hosData ? Math.max(0, 11 - hosData.hoursDrivenToday) : 11;
                    
                    return (
                      <div key={driver.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{driver.firstName} {driver.lastName}</p>
                          <p className="text-sm text-gray-600">{driver.assignedTruck || 'Unassigned'}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${hoursRemaining < 2 ? 'text-red-600' : 'text-green-600'}`}>
                            {hoursRemaining.toFixed(1)}h remaining
                          </p>
                          <Badge variant={hoursRemaining < 2 ? 'destructive' : 'default'} className="text-xs">
                            {hoursRemaining < 2 ? 'Critical' : 'Available'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Fleet Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Vehicles in Transit</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {(fleetAssets.trucks || []).filter(t => t.status === 'in_transit').length}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Available for Dispatch</span>
                      <Badge className="bg-green-100 text-green-800">
                        {(fleetAssets.trucks || []).filter(t => t.status === 'available').length}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Under Maintenance</span>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {(fleetAssets.trucks || []).filter(t => t.status === 'maintenance').length}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}