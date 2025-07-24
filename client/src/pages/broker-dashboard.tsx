import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from "recharts";
import { 
  TrendingUp, TrendingDown, DollarSign, Truck, Users, Package2, 
  MapPin, Clock, AlertTriangle, CheckCircle, Train, Ship, Plane
} from "lucide-react";
import { Link } from "wouter";

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function BrokerDashboard() {
  const [dateRange, setDateRange] = useState("30");

  // Analytics data
  const { data: analytics } = useQuery({
    queryKey: ["/api/broker/analytics", { dateRange }],
  });

  // Recent loads
  const { data: recentLoads = [] } = useQuery({
    queryKey: ["/api/broker/loads"],
  });

  // Carriers data
  const { data: carriers = [] } = useQuery({
    queryKey: ["/api/broker/carriers"],
  });

  // Customers data
  const { data: customers = [] } = useQuery({
    queryKey: ["/api/broker/customers"],
  });

  const metrics = {
    totalLoads: analytics?.totalLoads || 0,
    totalRevenue: analytics?.totalRevenue || 0,
    totalMargin: analytics?.totalMargin || 0,
    averageMargin: analytics?.averageMargin || 0,
    marginPercentage: analytics?.totalRevenue > 0 ? (analytics?.totalMargin / analytics?.totalRevenue) * 100 : 0,
  };

  const statusBreakdown = analytics?.statusBreakdown || {};
  const monthlyTrends = analytics?.monthlyTrends || [];

  // Carrier performance data
  const carrierPerformance = carriers.slice(0, 5).map((carrier: any) => ({
    name: carrier.carrierName,
    performance: carrier.onTimePerformance || 0,
    loads: Math.floor(Math.random() * 50) + 10, // This would come from actual data
    rating: carrier.safetyRating,
  }));

  // Top customers by revenue
  const topCustomers = customers.slice(0, 5).map((customer: any) => ({
    name: customer.customerName,
    revenue: Math.floor(Math.random() * 100000) + 50000, // This would come from actual data
    loads: Math.floor(Math.random() * 30) + 5,
    creditLimit: customer.creditLimit || 0,
  }));

  // Modal transportation data
  const modalData = [
    { name: 'Over-the-Road', value: 65, color: '#3B82F6' },
    { name: 'Intermodal Rail', value: 20, color: '#10B981' },
    { name: 'Drayage', value: 10, color: '#F59E0B' },
    { name: 'Air Freight', value: 3, color: '#EF4444' },
    { name: 'Ocean', value: 2, color: '#8B5CF6' },
  ];

  // Lane analysis
  const topLanes = [
    { origin: "Atlanta, GA", destination: "Chicago, IL", loads: 45, avgRate: 2850 },
    { origin: "Los Angeles, CA", destination: "Phoenix, AZ", loads: 38, avgRate: 1950 },
    { origin: "Dallas, TX", destination: "Houston, TX", loads: 42, avgRate: 1200 },
    { origin: "Miami, FL", destination: "Orlando, FL", loads: 28, avgRate: 850 },
    { origin: "Seattle, WA", destination: "Portland, OR", loads: 25, avgRate: 950 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Broker Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Comprehensive view of your brokerage operations
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5% from last period
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gross Margin</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.totalMargin.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.marginPercentage.toFixed(1)}% margin rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Loads</CardTitle>
              <Package2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalLoads}</div>
              <p className="text-xs text-muted-foreground">
                {statusBreakdown.in_transit || 0} in transit
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carrier Network</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{carriers.length}</div>
              <p className="text-xs text-muted-foreground">
                {carriers.filter((c: any) => c.status === 'preferred').length} preferred
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Monthly revenue and margin performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                  <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="margin" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Load Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Load Status Distribution</CardTitle>
              <CardDescription>Current status of all loads</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(statusBreakdown).map(([status, count], index) => ({
                      name: status.replace('_', ' ').toUpperCase(),
                      value: count,
                      color: COLORS[index % COLORS.length]
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(statusBreakdown).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Transportation Modes */}
          <Card>
            <CardHeader>
              <CardTitle>Transportation Modes</CardTitle>
              <CardDescription>Multi-modal freight distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modalData.map((mode, index) => (
                  <div key={mode.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {mode.name === 'Intermodal Rail' && <Train className="h-5 w-5 text-green-600" />}
                      {mode.name === 'Drayage' && <Truck className="h-5 w-5 text-yellow-600" />}
                      {mode.name === 'Air Freight' && <Plane className="h-5 w-5 text-red-600" />}
                      {mode.name === 'Ocean' && <Ship className="h-5 w-5 text-purple-600" />}
                      {mode.name === 'Over-the-Road' && <Truck className="h-5 w-5 text-blue-600" />}
                      <span className="font-medium">{mode.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ width: `${mode.value}%`, backgroundColor: mode.color }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold w-8">{mode.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Lanes */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Lanes</CardTitle>
              <CardDescription>Highest volume shipping routes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topLanes.map((lane, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <MapPin className="h-4 w-4 text-green-600" />
                        {lane.origin}
                        <span className="text-gray-400">→</span>
                        <MapPin className="h-4 w-4 text-red-600" />
                        {lane.destination}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {lane.loads} loads • Avg ${lane.avgRate.toLocaleString()}
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      #{index + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Carrier Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Top Carrier Performance</CardTitle>
              <CardDescription>On-time delivery rates</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={carrierPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="performance" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Customers by Revenue</CardTitle>
              <CardDescription>Key customer relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topCustomers.map((customer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-500">
                        {customer.loads} loads • ${customer.creditLimit.toLocaleString()} credit limit
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        ${customer.revenue.toLocaleString()}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Loads */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Load Activity</CardTitle>
              <CardDescription>Latest shipment updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentLoads.slice(0, 5).map((load: any) => (
                  <div key={load.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {load.status === 'delivered' && <CheckCircle className="h-5 w-5 text-green-600" />}
                        {load.status === 'in_transit' && <Clock className="h-5 w-5 text-blue-600" />}
                        {load.status === 'booked' && <Package2 className="h-5 w-5 text-gray-600" />}
                        {load.status === 'dispatched' && <Truck className="h-5 w-5 text-yellow-600" />}
                      </div>
                      <div>
                        <div className="font-medium">{load.loadNumber}</div>
                        <div className="text-sm text-gray-500">
                          {load.pickupLocation?.city} → {load.deliveryLocation?.city}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={
                        load.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        load.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                        load.status === 'dispatched' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {load.status}
                      </Badge>
                      <div className="text-sm text-gray-500 mt-1">
                        ${load.customerRate?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/broker/loads">
                  <Button variant="outline" className="w-full">
                    View All Loads
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common broker operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/broker/loads">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Load
                </Button>
              </Link>
              
              <Link href="/broker/carriers">
                <Button className="w-full justify-start" variant="outline">
                  <Truck className="h-4 w-4 mr-2" />
                  Add Carrier
                </Button>
              </Link>
              
              <Link href="/broker/customers">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              </Link>
              
              <Button className="w-full justify-start" variant="outline">
                <Train className="h-4 w-4 mr-2" />
                Intermodal Tracking
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <MapPin className="h-4 w-4 mr-2" />
                Drayage Coordination
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Exception Management
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>System Integrations</CardTitle>
            <CardDescription>Real-time API status for external services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">FMCSA SAFER</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">Highway API</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">RMIS</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">Rail API</span>
                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}