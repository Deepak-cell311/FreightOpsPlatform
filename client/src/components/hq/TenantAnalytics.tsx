import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity, 
  DollarSign, 
  Calendar 
} from "lucide-react";

export function TenantAnalytics() {
  const monthlyGrowth = [
    { month: 'Jan', tenants: 45, revenue: 125000 },
    { month: 'Feb', tenants: 52, revenue: 145000 },
    { month: 'Mar', tenants: 48, revenue: 135000 },
    { month: 'Apr', tenants: 61, revenue: 175000 },
    { month: 'May', tenants: 55, revenue: 165000 },
    { month: 'Jun', tenants: 67, revenue: 195000 },
  ];

  const planDistribution = [
    { name: 'Starter', value: 35, color: '#10B981' },
    { name: 'Professional', value: 45, color: '#3B82F6' },
    { name: 'Enterprise', value: 20, color: '#8B5CF6' },
  ];

  const featureUsage = [
    { feature: 'Fleet Management', usage: 85, growth: 12 },
    { feature: 'Dispatch System', usage: 78, growth: 8 },
    { feature: 'Accounting', usage: 92, growth: 15 },
    { feature: 'HR & Payroll', usage: 67, growth: -3 },
    { feature: 'Banking Integration', usage: 45, growth: 25 },
    { feature: 'Load Tracking', usage: 89, growth: 7 },
  ];

  const recentActivity = [
    { 
      tenant: 'Swift Logistics LLC',
      action: 'Upgraded to Professional',
      value: '+$1,200 MRR',
      time: '2 hours ago',
      type: 'upgrade'
    },
    { 
      tenant: 'Mountain Transport Co',
      action: 'Added 5 new users',
      value: '+$250 MRR',
      time: '4 hours ago',
      type: 'expansion'
    },
    { 
      tenant: 'Coastal Freight Services',
      action: 'Enabled Banking Integration',
      value: 'Feature Adoption',
      time: '1 day ago',
      type: 'feature'
    },
    { 
      tenant: 'Desert Haul Partners',
      action: 'Completed Onboarding',
      value: '+$890 MRR',
      time: '2 days ago',
      type: 'new'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upgrade': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'expansion': return <Users className="w-4 h-4 text-blue-500" />;
      case 'feature': return <Activity className="w-4 h-4 text-purple-500" />;
      case 'new': return <Calendar className="w-4 h-4 text-yellow-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenant Analytics</h1>
          <p className="text-gray-600">Analyze tenant performance and platform usage</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            Export Data
          </Button>
          <Button>
            Generate Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tenants</p>
                <p className="text-2xl font-bold text-blue-600">67</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% from last month
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Recurring Revenue</p>
                <p className="text-2xl font-bold text-green-600">$195k</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +18% from last month
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Churn Rate</p>
                <p className="text-2xl font-bold text-red-600">2.3%</p>
                <p className="text-xs text-red-600 flex items-center">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  -0.5% from last month
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Revenue per Tenant</p>
                <p className="text-2xl font-bold text-purple-600">$2,910</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +5% from last month
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Growth Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="tenants" fill="#3B82F6" name="Tenants" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" name="Revenue ($)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Feature Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Usage Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {featureUsage.map((feature) => (
              <div key={feature.feature} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{feature.feature}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{feature.usage}%</span>
                      <Badge className={feature.growth > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {feature.growth > 0 ? '+' : ''}{feature.growth}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={feature.usage} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.tenant}</p>
                      <p className="text-sm text-gray-600">{activity.action}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">{activity.value}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}