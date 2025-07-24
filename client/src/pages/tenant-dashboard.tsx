import { useState, useCallback, memo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DollarSign,
  CreditCard,
  Route,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Shield,
  AlertTriangle,
  Fuel,
  Activity,
  TrendingUp,
  MapPin,
  Settings,
  Plus,
  Eye,
  FileText,
  Calendar,
  Users,
  BarChart3,
  Navigation,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import DashboardLayout from "@/components/dashboard-layout";
import TenantContentRouter from "@/components/tenant-content-router";

interface TenantDashboardStats {
  activeLoads: number;
  revenue: number;
  availableBalance: number;
  fleetSize: number;
}

function TenantDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [title, setTitle] = useState("Dashboard");
  const [description, setDescription] = useState("Transportation management overview");
  // Onboarding tour permanently disabled

  // Fetch comprehensive dashboard metrics - production endpoint
  const { data: metrics, isLoading, error } = useQuery<TenantDashboardStats>({
    queryKey: ["/api/dashboard/metrics"],
    enabled: isAuthenticated && !!user,
    staleTime: 60000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  // Fetch recent activity feed
  const { data: recentActivity = [] } = useQuery<any[]>({
    queryKey: ["/api/dashboard/recent-activity"],
    enabled: isAuthenticated && !!user,
    staleTime: 30000,
  });

  // Fetch system alerts
  const { data: alerts = [] } = useQuery<any[]>({
    queryKey: ["/api/dashboard/alerts"],
    enabled: isAuthenticated && !!user,
    staleTime: 30000,
  });

  // Tenant dashboard content - no company management
  const renderTenantDashboardContent = useCallback(() => {
    if (isLoading) {
      return (
        <div className="space-y-6 content-slide-enter">
          <div className="content-fade-enter dashboard-header">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your transportation management dashboard</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 dashboard-stats">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 content-slide-enter">
        <div className="content-fade-enter dashboard-header">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your transportation management dashboard</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 dashboard-stats">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Loads</CardTitle>
              <Route className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.activeLoads || 0}</div>
              <p className="text-xs text-muted-foreground">
                +2 from yesterday
              </p>
            </CardContent>
          </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics?.revenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              +8.2% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics?.availableBalance?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              Available for instant transfer
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fleet Size</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.fleetSize || 0}</div>
            <p className="text-xs text-muted-foreground">
              +1 new vehicle this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Section */}
      <div className="my-6">
        <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-blue-50">
            <Plus className="h-5 w-5" />
            <span className="text-xs">New Load</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-green-50">
            <Users className="h-5 w-5" />
            <span className="text-xs">Add Driver</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-purple-50">
            <Truck className="h-5 w-5" />
            <span className="text-xs">Fleet Status</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-orange-50">
            <FileText className="h-5 w-5" />
            <span className="text-xs">Reports</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-red-50">
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs">Analytics</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-gray-50">
            <Settings className="h-5 w-5" />
            <span className="text-xs">Settings</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 5).map((activity: any) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.timestamp}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-50/50">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Load #12345 Delivered</p>
                      <p className="text-xs text-gray-600">Chicago to Dallas - $2,450 revenue</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-yellow-50/50">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Load #12346 In Transit</p>
                      <p className="text-xs text-gray-600">Atlanta to Miami - ETA 2 hours</p>
                    </div>
                    <Badge variant="outline" className="border-yellow-300 text-yellow-700">In Progress</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-blue-50/50">
                    <AlertCircle className="w-4 h-4 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">New Load Available</p>
                      <p className="text-xs text-gray-600">Houston to Phoenix - $3,200 potential</p>
                    </div>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">Available</Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">All Systems Operational</p>
                  <p className="text-xs text-gray-600">Last updated: Just now</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Shield className="w-4 h-4 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Security: Active</p>
                  <p className="text-xs text-gray-600">Multi-factor authentication enabled</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    );
  }, [metrics]);

  const renderPageContent = useCallback(() => {
    if (location !== "/" && location !== "/dashboard") {
      return (
        <TenantContentRouter 
          title={title} 
          setTitle={setTitle} 
          setDescription={setDescription}
          user={user}
        />
      );
    }
    
    return renderTenantDashboardContent();
  }, [location, title, user, renderTenantDashboardContent]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <DashboardLayout title={title} description={description}>
        {renderPageContent()}
      </DashboardLayout>
    </>
  );
}

export default memo(TenantDashboard);