import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  Users,
  DollarSign,
  FileText,
  Plus,
  BarChart3,
  Building2,
  CreditCard,
  Activity,
  Settings,
} from "lucide-react";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Fetch dashboard stats (using the working endpoint)
  const { data: dashboardStats, isLoading: statsLoading } = useQuery<{
    totalRevenue: number;
    activeLoads: number;
    totalDrivers: number;
    totalTrucks: number;
    completedLoads: number;
    activeTrucks: number;
    availableDrivers: number;
    fleetUtilization: number;
    onTimeDelivery: number;
    fuelEfficiency: number;
    safetyScore: number;
  }>({
    queryKey: ["/api/dashboard/metrics"],
    enabled: isAuthenticated,
  });

  // Fetch banking status
  const { data: bankingStatus, isLoading: bankingLoading } = useQuery<{
    isActivated: boolean;
    status: string;
  }>({
    queryKey: ["/api/banking/activation-status"],
    enabled: isAuthenticated,
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Auth check with redirect
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access your dashboard",
        variant: "destructive",
      });
      window.location.href = "/auth";
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName || 'User'}
          </h1>
          <p className="text-gray-600">
            Manage your FreightOps operations and monitor real-time performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Company Status</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                Active
              </div>
              <p className="text-xs text-muted-foreground">
                Platform operational
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Loads</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : dashboardStats?.activeLoads || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently in transit
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Drivers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : dashboardStats?.availableDrivers || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Ready for dispatch
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statsLoading ? "..." : formatCurrency(dashboardStats?.totalRevenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button size="lg">
                <Plus className="h-4 w-4 mr-2" />
                New Load
              </Button>
              <Button variant="outline" size="lg">
                <Users className="h-4 w-4 mr-2" />
                Manage Drivers
              </Button>
              <Button variant="outline" size="lg">
                <FileText className="h-4 w-4 mr-2" />
                Reports
              </Button>
              <Button variant="outline" size="lg">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Banking Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Banking Status
                </span>
                <Badge variant="secondary" className="text-blue-600">
                  {bankingStatus?.isActivated ? "ACTIVE" : "SETUP REQUIRED"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-blue-100">Account Status</p>
                  <p className="text-2xl font-bold">
                    {bankingLoading ? "..." : (bankingStatus?.isActivated ? "Active" : "Setup Required")}
                  </p>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="secondary" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Banking Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Platform</span>
                  <Badge variant="default">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Banking</span>
                  <Badge variant={bankingStatus?.isActivated ? "default" : "secondary"}>
                    {bankingStatus?.isActivated ? "Active" : "Setup Required"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Fleet Tracking</span>
                  <Badge variant="default">Online</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}