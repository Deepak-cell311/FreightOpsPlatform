import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  AlertTriangle, 
  Calendar, 
  Users,
  Download
} from "lucide-react";

export function TenantBilling() {
  const billingData = [
    {
      id: 1,
      companyName: "Swift Logistics LLC",
      plan: "Professional",
      monthlyRevenue: 2450,
      lastPayment: "2025-01-08",
      nextBilling: "2025-02-08",
      status: "active",
      outstanding: 0,
      users: 12
    },
    {
      id: 2,
      companyName: "Mountain Transport Co",
      plan: "Enterprise",
      monthlyRevenue: 5890,
      lastPayment: "2025-01-07",
      nextBilling: "2025-02-07",
      status: "active",
      outstanding: 0,
      users: 35
    },
    {
      id: 3,
      companyName: "Coastal Freight Services",
      plan: "Professional",
      monthlyRevenue: 3200,
      lastPayment: "2025-01-06",
      nextBilling: "2025-02-06",
      status: "overdue",
      outstanding: 3200,
      users: 18
    },
    {
      id: 4,
      companyName: "Desert Haul Partners",
      plan: "Starter",
      monthlyRevenue: 890,
      lastPayment: "2025-01-05",
      nextBilling: "2025-02-05",
      status: "active",
      outstanding: 0,
      users: 5
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Enterprise': return 'bg-purple-100 text-purple-800';
      case 'Professional': return 'bg-blue-100 text-blue-800';
      case 'Starter': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalRevenue = billingData.reduce((sum, tenant) => sum + tenant.monthlyRevenue, 0);
  const totalOutstanding = billingData.reduce((sum, tenant) => sum + tenant.outstanding, 0);
  const activeTenants = billingData.filter(tenant => tenant.status === 'active').length;
  const overdueTenants = billingData.filter(tenant => tenant.status === 'overdue').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenant Billing</h1>
          <p className="text-gray-600">Manage tenant subscriptions and billing</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <CreditCard className="w-4 h-4 mr-2" />
            Process Payments
          </Button>
        </div>
      </div>

      {/* Billing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Tenants</p>
                <p className="text-2xl font-bold text-blue-600">{activeTenants}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-red-600">${totalOutstanding.toLocaleString()}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Growth Rate</p>
                <p className="text-2xl font-bold text-purple-600">+12%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tenant Billing Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Company</th>
                  <th className="text-left py-3 px-4">Plan</th>
                  <th className="text-left py-3 px-4">Monthly Revenue</th>
                  <th className="text-left py-3 px-4">Users</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Next Billing</th>
                  <th className="text-left py-3 px-4">Outstanding</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {billingData.map((tenant) => (
                  <tr key={tenant.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{tenant.companyName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getPlanColor(tenant.plan)}>
                        {tenant.plan}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-green-600">
                        ${tenant.monthlyRevenue.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{tenant.users}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(tenant.status)}>
                        {tenant.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{tenant.nextBilling}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {tenant.outstanding > 0 ? (
                        <span className="font-medium text-red-600">
                          ${tenant.outstanding.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">$0</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {tenant.outstanding > 0 && (
                          <Button size="sm" variant="destructive">
                            Send Reminder
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}