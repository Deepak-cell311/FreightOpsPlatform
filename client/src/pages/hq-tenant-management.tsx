import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, 
  Users, 
  DollarSign, 
  BarChart3, 
  Settings,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Database,
  Server,
  Shield,
  Activity,
  Zap,
  Brain
} from "lucide-react";

interface TenantInfo {
  id: string;
  companyName: string;
  subscriptionTier: string;
  status: string;
  users: number;
  vehicles: number;
  loads: number;
  revenue: number;
  lastActivity: string;
  createdAt: string;
  region: string;
  apiUsage: number;
  storageUsed: number;
  supportTickets: number;
}

interface TenantMetrics {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  totalRevenue: number;
  avgRevenuePerTenant: number;
  churnRate: number;
  growthRate: number;
}

export default function TenantManagement() {
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [metrics, setMetrics] = useState<TenantMetrics | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTier, setFilterTier] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTenantData();
  }, []);

  const fetchTenantData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch tenant metrics
      const metricsResponse = await fetch("/hq/api/tenants/metrics");
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      }

      // Fetch tenant list
      const tenantsResponse = await fetch("/hq/api/tenants");
      if (tenantsResponse.ok) {
        const tenantsData = await tenantsResponse.json();
        setTenants(tenantsData.tenants || []);
      }

    } catch (error) {
      console.error("Error fetching tenant data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || tenant.status === filterStatus;
    const matchesTier = filterTier === "all" || tenant.subscriptionTier === filterTier;
    
    return matchesSearch && matchesStatus && matchesTier;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: "default",
      trial: "secondary",
      suspended: "destructive",
      cancelled: "outline"
    };
    return variants[status] || "outline";
  };

  const getTierBadge = (tier: string) => {
    const variants: Record<string, any> = {
      enterprise: "default",
      professional: "secondary",
      starter: "outline",
      trial: "destructive"
    };
    return variants[tier] || "outline";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Tenant Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tenant Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Enterprise multi-tenant platform administration</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add New Tenant</span>
        </Button>
      </div>

      {/* Platform Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalTenants}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{metrics.growthRate}%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeTenants}</div>
              <p className="text-xs text-muted-foreground">
                {((metrics.activeTenants / metrics.totalTenants) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                ${metrics.avgRevenuePerTenant.toFixed(0)} avg per tenant
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.churnRate}%</div>
              <p className="text-xs text-muted-foreground">
                <span className={metrics.churnRate < 5 ? "text-green-600" : "text-red-600"}>
                  {metrics.churnRate < 5 ? "Healthy" : "Needs attention"}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="tenants" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tenants">Tenant Directory</TabsTrigger>
          <TabsTrigger value="resources">Resource Management</TabsTrigger>
          <TabsTrigger value="billing">Billing & Subscriptions</TabsTrigger>
          <TabsTrigger value="analytics">Platform Analytics</TabsTrigger>
        </TabsList>

        {/* Tenant Directory */}
        <TabsContent value="tenants" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter Tenants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Tenants</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by company name or tenant ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tier-filter">Subscription Tier</Label>
                  <Select value={filterTier} onValueChange={setFilterTier}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Tiers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tiers</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tenant List */}
          <Card>
            <CardHeader>
              <CardTitle>Tenant Directory ({filteredTenants.length})</CardTitle>
              <CardDescription>
                Comprehensive view of all platform tenants and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTenants.map((tenant) => (
                  <div key={tenant.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-semibold">
                          {tenant.companyName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold">{tenant.companyName}</h4>
                          <p className="text-sm text-muted-foreground">ID: {tenant.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusBadge(tenant.status)}>
                          {tenant.status}
                        </Badge>
                        <Badge variant={getTierBadge(tenant.subscriptionTier)}>
                          {tenant.subscriptionTier}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{tenant.users}</div>
                        <div className="text-xs text-muted-foreground">Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{tenant.vehicles}</div>
                        <div className="text-xs text-muted-foreground">Vehicles</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{tenant.loads}</div>
                        <div className="text-xs text-muted-foreground">Loads</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">${tenant.revenue}</div>
                        <div className="text-xs text-muted-foreground">Revenue</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <span>Region: {tenant.region}</span>
                        <span>API Usage: {tenant.apiUsage}%</span>
                        <span>Storage: {tenant.storageUsed}GB</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resource Management */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="h-5 w-5" />
                  <span>Infrastructure Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>CPU Usage</span>
                    <span className="font-semibold">64%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Memory Usage</span>
                    <span className="font-semibold">78%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage Usage</span>
                    <span className="font-semibold">45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Network I/O</span>
                    <Badge variant="outline">Normal</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Database Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Query Performance</span>
                    <Badge variant="default">Excellent</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Connection Pool</span>
                    <span className="font-semibold">85/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Replication Lag</span>
                    <span className="font-semibold">12ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Backup Status</span>
                    <Badge variant="default">Current</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Monitoring</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Failed Logins</span>
                    <span className="font-semibold">3 (24h)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>API Rate Limits</span>
                    <Badge variant="outline">Normal</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>SSL Status</span>
                    <Badge variant="default">Valid</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Firewall Status</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Billing & Subscriptions */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Management</CardTitle>
              <CardDescription>
                Manage tenant subscriptions, billing, and revenue tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Revenue Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-green-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600">Monthly Revenue</p>
                        <p className="text-2xl font-bold text-green-800">${metrics?.totalRevenue?.toLocaleString() || '0'}</p>
                        <p className="text-xs text-green-600">+18.2% vs last month</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600">Active Subscriptions</p>
                        <p className="text-2xl font-bold text-blue-800">847</p>
                        <p className="text-xs text-blue-600">+23 this month</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-purple-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600">Churn Rate</p>
                        <p className="text-2xl font-bold text-purple-800">2.1%</p>
                        <p className="text-xs text-purple-600">-0.4% improvement</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-amber-50 to-amber-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-600">ARPU</p>
                        <p className="text-2xl font-bold text-amber-800">${metrics?.averageTicketSize?.toLocaleString() || '0'}</p>
                        <p className="text-xs text-amber-600">{metrics?.ticketGrowth || 'No growth data'}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-amber-600" />
                    </div>
                  </div>
                </div>
                
                {/* Subscription Tiers */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Subscription Distribution</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-slate-50 rounded">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">Starter</p>
                        <Badge variant="secondary">{tenantPricing?.basic || 'Contact for pricing'}</Badge>
                      </div>
                      <p className="text-2xl font-bold mt-2">312 tenants</p>
                      <p className="text-sm text-gray-600">Basic TMS features</p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">Professional</p>
                        <Badge className="bg-blue-100 text-blue-800">{tenantPricing?.standard || 'Contact for pricing'}</Badge>
                      </div>
                      <p className="text-2xl font-bold mt-2">423 tenants</p>
                      <p className="text-sm text-gray-600">Advanced features + API</p>
                    </div>
                    
                    <div className="p-3 bg-amber-50 rounded">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">Enterprise</p>
                        <Badge className="bg-amber-100 text-amber-800">{tenantPricing?.enterprise || 'Contact for pricing'}</Badge>
                      </div>
                      <p className="text-2xl font-bold mt-2">112 tenants</p>
                      <p className="text-sm text-gray-600">Full platform + white-label</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platform Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
              <CardDescription>
                Comprehensive analytics and insights across all tenants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Platform Health Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-emerald-600">System Uptime</p>
                        <p className="text-2xl font-bold text-emerald-800">99.97%</p>
                        <p className="text-xs text-emerald-600">SLA: 99.9%</p>
                      </div>
                      <Activity className="h-8 w-8 text-emerald-600" />
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-violet-50 to-violet-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-violet-600">API Requests/min</p>
                        <p className="text-2xl font-bold text-violet-800">14,250</p>
                        <p className="text-xs text-violet-600">Peak: 18,400</p>
                      </div>
                      <Zap className="h-8 w-8 text-violet-600" />
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-cyan-50 to-cyan-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-cyan-600">Data Processed</p>
                        <p className="text-2xl font-bold text-cyan-800">2.4TB</p>
                        <p className="text-xs text-cyan-600">Daily average</p>
                      </div>
                      <Database className="h-8 w-8 text-cyan-600" />
                    </div>
                  </div>
                </div>
                
                {/* Feature Adoption Analytics */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Feature Adoption Rates</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Fleet Management</span>
                        <span className="text-sm text-gray-600">94.2%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '94.2%'}}></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Dispatch System</span>
                        <span className="text-sm text-gray-600">89.7%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '89.7%'}}></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Banking Integration</span>
                        <span className="text-sm text-gray-600">76.3%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{width: '76.3%'}}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">AI Features</span>
                        <span className="text-sm text-gray-600">68.1%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{width: '68.1%'}}></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Container Tracking</span>
                        <span className="text-sm text-gray-600">45.2%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{width: '45.2%'}}></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Mobile App</span>
                        <span className="text-sm text-gray-600">83.6%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-teal-500 h-2 rounded-full" style={{width: '83.6%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Performance Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3 flex items-center">
                      <Brain className="h-4 w-4 mr-2 text-purple-500" />
                      AI-Powered Insights
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded">
                        <p className="font-medium text-blue-800">Growth Opportunity</p>
                        <p className="text-sm text-blue-700">Container tracking adoption could increase revenue by $47k/month</p>
                      </div>
                      
                      <div className="p-3 bg-green-50 rounded">
                        <p className="font-medium text-green-800">Performance Alert</p>
                        <p className="text-sm text-green-700">API response times improved 23% after infrastructure upgrade</p>
                      </div>
                      
                      <div className="p-3 bg-amber-50 rounded">
                        <p className="font-medium text-amber-800">Churn Risk</p>
                        <p className="text-sm text-amber-700">12 tenants show low engagement - recommend outreach</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                      Growth Metrics
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">New Signups (30d)</span>
                        <span className="font-semibold text-green-600">+47</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Revenue Growth</span>
                        <span className="font-semibold text-green-600">+18.2%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Support Tickets</span>
                        <span className="font-semibold text-red-600">-12.5%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Platform Usage</span>
                        <span className="font-semibold text-blue-600">+24.7%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}