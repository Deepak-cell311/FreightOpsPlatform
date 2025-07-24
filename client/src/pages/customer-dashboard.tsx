import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/dashboard-layout";
import { 
  Truck, 
  DollarSign,
  TrendingUp,
  MapPin,
  Clock,
  CreditCard,
  Users,
  BarChart3,
  Package,
  Route,
  Fuel,
  Shield,
  CheckCircle,
  AlertTriangle,
  Activity
} from "lucide-react";

export default function CustomerDashboard() {
  const [activeAlerts] = useState([
    { id: 1, type: "warning", message: "Driver John Smith needs CDL renewal in 30 days", timestamp: "2 hours ago" },
    { id: 2, type: "info", message: "New load available: Chicago to Atlanta", timestamp: "4 hours ago" },
    { id: 3, type: "success", message: "Payment received from ABC Logistics", timestamp: "6 hours ago" }
  ]);

  const fleetStats = {
    totalVehicles: 24,
    activeLoads: 18,
    availableDrivers: 6,
    totalRevenue: 48750,
    monthlyGrowth: 12.5,
    onTimeDelivery: 96.8,
    fuelEfficiency: 7.2,
    maintenanceAlerts: 3
  };

  return (
    <DashboardLayout 
      title="Dashboard" 
      description="Complete fleet management and operations overview"
    >
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="freight-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Loads</p>
                  <p className="text-3xl font-bold text-blue-600">{fleetStats.activeLoads}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+8% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="freight-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-green-600">${fleetStats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+{fleetStats.monthlyGrowth}% growth</span>
              </div>
            </CardContent>
          </Card>

          <Card className="freight-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Fleet Vehicles</p>
                  <p className="text-3xl font-bold text-purple-600">{fleetStats.totalVehicles}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-full">
                  <Truck className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-gray-500">{fleetStats.availableDrivers} available drivers</span>
              </div>
            </CardContent>
          </Card>

          <Card className="freight-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">On-Time Delivery</p>
                  <p className="text-3xl font-bold text-orange-600">{fleetStats.onTimeDelivery}%</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-2">
                <Progress value={fleetStats.onTimeDelivery} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Activity */}
          <Card className="freight-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity & Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                    <div className="flex-shrink-0">
                      {alert.type === "warning" && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                      {alert.type === "info" && <Activity className="h-5 w-5 text-blue-500" />}
                      {alert.type === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-500">{alert.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="freight-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start freight-button">
                  <Route className="h-4 w-4 mr-2" />
                  Create New Load
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Truck className="h-4 w-4 mr-2" />
                  Assign Driver
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Issue Company Card
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fleet Status & Financial Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fleet Status */}
          <Card className="freight-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Fleet Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Vehicles in Transit</span>
                  <Badge className="freight-status-in-transit">18 Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Available Vehicles</span>
                  <Badge className="freight-status-available">6 Ready</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Maintenance Required</span>
                  <Badge className="freight-status-maintenance">3 Pending</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Fuel Efficiency</span>
                  <span className="text-sm font-medium text-green-600">{fleetStats.fuelEfficiency} MPG</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Overview */}
          <Card className="freight-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Monthly Revenue</span>
                  <span className="text-sm font-bold text-green-600">${fleetStats.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Outstanding Invoices</span>
                  <span className="text-sm font-medium text-orange-600">${fleetStats.currentEarnings?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Fuel Expenses</span>
                  <span className="text-sm font-medium text-red-600">${fleetStats.currentExpenses?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Net Profit Margin</span>
                  <span className="text-sm font-bold text-blue-600">23.5%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security & Compliance Footer */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Security Status: Active</p>
                <p className="text-xs text-blue-700">All systems operational • Last security check: 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                FMCSA Compliant
              </Badge>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                SOC 2 Certified
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}