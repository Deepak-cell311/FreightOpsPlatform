import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Building2, DollarSign, Activity, AlertTriangle, CheckCircle
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSessionTimeout } from "@/hooks/use-session-timeout";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import HQLayout from "@/components/hq-layout";

interface DashboardStats {
  totalCompanies: number;
  activeUsers: number;
  monthlyRevenue: number;
  systemHealth: number;
  companiesGrowth: string;
  usersGrowth: string;
  revenueGrowth: string;
}

interface RecentCompany {
  id: string;
  name: string;
  createdAt: Date;
  status: string;
}

interface SystemAlert {
  id: string;
  type: string;
  message: string;
  severity: string;
  timestamp: Date;
}

function HQAdmin() {
  const { isAuthenticated, user } = useAuth();
  const [location, setLocation] = useLocation();

  // Initialize session timeout with 30-minute timeout and 5-minute warning
  const { triggerActivity } = useSessionTimeout({
    timeoutMinutes: 30,
    warningMinutes: 5,
    checkIntervalSeconds: 60
  });

  // Check if user has HQ admin privileges
  const isHQAdmin = user && ['super_admin', 'hq_admin', 'admin', 'platform_owner'].includes(user.role);

  // Always call hooks - use enabled to control when they run
  const { data: dashboardStats = {} as DashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/hq/dashboard-stats"],
    enabled: Boolean(isAuthenticated && isHQAdmin)
  });

  const { data: recentCompanies = [] as RecentCompany[], isLoading: companiesLoading } = useQuery({
    queryKey: ["/api/hq/recent-companies"],
    enabled: Boolean(isAuthenticated && isHQAdmin)
  });

  const { data: systemAlerts = [] as SystemAlert[], isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/hq/system-alerts"],
    enabled: Boolean(isAuthenticated && isHQAdmin)
  });

  // Redirect logic
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }
    
    if (user && !isHQAdmin) {
      setLocation("/");
      return;
    }
  }, [isAuthenticated, user, isHQAdmin, setLocation]);

  // Early returns after all hooks are called
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isHQAdmin) {
    return null;
  }

  if (statsLoading || companiesLoading || alertsLoading) {
    return (
      <HQLayout user={user}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </HQLayout>
    );
  }

  return (
    <HQLayout user={user}>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalCompanies || 0}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.companiesGrowth || "+0%"} from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.activeUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.usersGrowth || "+0%"} from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${dashboardStats.monthlyRevenue || 0}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.revenueGrowth || "+0%"} from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.systemHealth || 0}%</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Companies</CardTitle>
              <CardDescription>Latest companies to join the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCompanies.slice(0, 5).map((company: RecentCompany) => (
                  <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{company.name}</p>
                        <p className="text-sm text-gray-600">
                          Joined {new Date(company.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={company.status === "active" ? "default" : "secondary"}>
                      {company.status}
                    </Badge>
                  </div>
                ))}
                {recentCompanies.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No recent companies</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Important system notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemAlerts.map((alert: SystemAlert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    {alert.severity === "high" ? (
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                    ) : alert.severity === "medium" ? (
                      <Activity className="w-4 h-4 text-yellow-500 mt-0.5" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.type}</p>
                      <p className="text-xs text-gray-600">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {systemAlerts.length === 0 && (
                  <div className="text-center py-4">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-gray-500">All systems running smoothly</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </HQLayout>
  );
}

export default HQAdmin;