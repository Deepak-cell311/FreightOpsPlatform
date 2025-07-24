import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, Wrench, AlertTriangle, CheckCircle } from "lucide-react";
import { TruckingLoadingSkeleton } from "@/components/trucking-loading-skeleton";

interface Vehicle {
  id: number;
  unit: string;
  type: string;
  status: string;
  driver: string | null;
  location: string;
  mileage: number;
}

interface FleetData {
  vehicles: Vehicle[];
  maintenance: {
    scheduled: number;
    overdue: number;
    upcoming: number;
    inProgress: number;
  };
  safety: {
    inspections: {
      passed: number;
      failed: number;
      pending: number;
    };
    violations: {
      total: number;
      resolved: number;
      pending: number;
    };
    accidents: {
      thisMonth: number;
      thisYear: number;
    };
  };
}

export default function FleetStatus() {
  const { data: fleetData, isLoading } = useQuery<FleetData>({
    queryKey: ["/api/dashboard/fleet-status"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <TruckingLoadingSkeleton variant="fleet" className="mb-6" />
        <TruckingLoadingSkeleton variant="dashboard" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">{status}</Badge>;
      case 'maintenance':
        return <Badge variant="secondary" className="bg-yellow-500">{status}</Badge>;
      case 'inactive':
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Fleet Status</h1>
      </div>

      {/* Fleet Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fleetData?.vehicles.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active fleet units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fleetData?.maintenance.scheduled || 0}</div>
            <p className="text-xs text-muted-foreground">
              {fleetData?.maintenance.overdue || 0} overdue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Safety Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.2%</div>
            <p className="text-xs text-muted-foreground">
              Fleet safety rating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fleetData?.safety.violations.pending || 0}</div>
            <p className="text-xs text-muted-foreground">
              Pending resolution
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle List */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Fleet</CardTitle>
          <CardDescription>Current status of all fleet vehicles</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit #</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Mileage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fleetData?.vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.unit}</TableCell>
                  <TableCell>{vehicle.type}</TableCell>
                  <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                  <TableCell>{vehicle.driver || "Unassigned"}</TableCell>
                  <TableCell>{vehicle.location}</TableCell>
                  <TableCell>{vehicle.mileage.toLocaleString()} mi</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Maintenance and Safety Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Overview</CardTitle>
            <CardDescription>Vehicle maintenance schedule and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Scheduled</span>
              <span className="font-semibold">{fleetData?.maintenance.scheduled || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Overdue</span>
              <span className="font-semibold text-red-600">{fleetData?.maintenance.overdue || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Upcoming (30 days)</span>
              <span className="font-semibold">{fleetData?.maintenance.upcoming || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>In Progress</span>
              <span className="font-semibold">{fleetData?.maintenance.inProgress || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Safety & Compliance</CardTitle>
            <CardDescription>Fleet safety metrics and compliance status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Inspections</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Passed</span>
                  <span className="text-green-600">{fleetData?.safety.inspections.passed || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Failed</span>
                  <span className="text-red-600">{fleetData?.safety.inspections.failed || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending</span>
                  <span>{fleetData?.safety.inspections.pending || 0}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Safety Record</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Accidents (This Month)</span>
                  <span>{fleetData?.safety.accidents.thisMonth || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Accidents (This Year)</span>
                  <span>{fleetData?.safety.accidents.thisYear || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}