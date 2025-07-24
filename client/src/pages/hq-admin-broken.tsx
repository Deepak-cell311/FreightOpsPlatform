import { useAuth } from "@/hooks/use-auth";
import { useSessionTimeout } from "@/hooks/use-session-timeout";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { HQLayout } from "@/components/hq/HQLayout";

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

  return <HQLayout user={user} />;
}

export default HQAdmin;
      <div className="content-fade-enter">
        <h1 className="text-3xl font-bold tracking-tight">HQ Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform oversight and management</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-slide-in-delayed stagger-delay-1 hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalCompanies || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats?.companiesGrowth || "+0%"} from last month
            </p>
          </CardContent>
        </Card>

        <Card className="card-slide-in-delayed stagger-delay-2 hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats?.usersGrowth || "+0%"} from last month
            </p>
          </CardContent>
        </Card>

        <Card className="card-slide-in-delayed stagger-delay-3 hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardStats?.monthlyRevenue || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats?.revenueGrowth || "+0%"} from last month
            </p>
          </CardContent>
        </Card>

        <Card className="card-slide-in-delayed stagger-delay-4 hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.systemHealth || 0}%</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="card-slide-in-delayed stagger-delay-5 hover-lift">
          <CardHeader>
            <CardTitle>Recent Companies</CardTitle>
            <CardDescription>Latest companies to join the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCompanies.slice(0, 5).map((company: RecentCompany, index: number) => (
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

        <Card className="card-slide-in-delayed stagger-delay-6 hover-lift">
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
  );

  const renderContent = () => {
    // Handle HQ routes and their subpages
    if (location.startsWith("/hq/companies")) {
      return renderCompaniesContent();
    }
    if (location.startsWith("/hq/banking") || location.startsWith("/banking")) {
      return renderBankingContent();
    }
    if (location.startsWith("/hq/analytics")) {
      return (
        <div className="space-y-6 content-slide-enter">
          <div className="content-fade-enter">
            <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
            <p className="text-muted-foreground">View comprehensive platform analytics</p>
          </div>
        </div>
      );
    }
    
    // Default HQ dashboard content
    return renderDashboardContent();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-slate-800/95 backdrop-blur-xl border-r border-slate-700 z-50 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <h1 className="text-white font-bold text-sm lg:text-base truncate">HQ Admin</h1>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg cursor-pointer nav-hover-smooth nav-item-enter ${
                    item.active
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg nav-item-active"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white hover-lift"
                  }`}
                >
                  <Icon className={`h-5 w-5 transition-colors duration-200 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'} ${
                    item.active ? "text-white" : "text-slate-400 group-hover:text-white"
                  }`} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User Info and Logout */}
          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-medium">
                  {user?.email?.[0]?.toUpperCase() || 'A'}
                </span>
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{user?.email || 'Admin'}</p>
                  <p className="text-slate-400 text-xs truncate">{user?.role || 'Administrator'}</p>
                </div>
              )}
            </div>
            
            {!sidebarCollapsed && (
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-gray-600 hover:text-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HQ Dashboard</h1>
                <p className="text-gray-600">Platform administration and monitoring</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                System Healthy
              </Badge>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default HQAdmin;