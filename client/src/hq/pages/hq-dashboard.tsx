import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  Activity,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

export default function HQDashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/hq/dashboard/metrics"],
    retry: false,
  });

  const { data: systemHealth, isLoading: healthLoading } = useQuery({
    queryKey: ["/api/hq/dashboard/system-health"],
    retry: false,
  });

  const { data: complianceAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/hq/dashboard/compliance-alerts"],
    retry: false,
  });

  const { data: recentTransactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/hq/financials/transactions"],
    retry: false,
  });

  if (metricsLoading || healthLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Companies</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.totalCompanies || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.activeUsers || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${metrics?.monthlyRevenue?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Compliance Alerts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {complianceAlerts?.totalAlerts || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health & Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Platform Status</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {systemHealth?.systemStatus || 'Healthy'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Companies</span>
                <span className="text-sm text-gray-600">{systemHealth?.activeCompanies || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Loads</span>
                <span className="text-sm text-gray-600">{systemHealth?.totalLoads || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pending Verifications</span>
                <Badge variant={systemHealth?.pendingVerifications > 0 ? "destructive" : "secondary"}>
                  {systemHealth?.pendingVerifications || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Platform Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Drivers</span>
                <span className="text-sm text-gray-600">{metrics?.totalDrivers || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Vehicles</span>
                <span className="text-sm text-gray-600">{metrics?.totalVehicles || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Loads</span>
                <span className="text-sm text-gray-600">{metrics?.totalLoads || 0}</span>
              </div>
              <div className="pt-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Detailed Analytics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Alerts */}
      {complianceAlerts && complianceAlerts.totalAlerts > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Compliance Alerts ({complianceAlerts.totalAlerts})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {complianceAlerts.expiringInsurance?.map((company: any) => (
                <div key={company.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-red-800">{company.name}</p>
                    <p className="text-sm text-red-600">Insurance expires soon</p>
                  </div>
                  <Badge variant="destructive">
                    <Clock className="h-3 w-3 mr-1" />
                    Expiring
                  </Badge>
                </div>
              ))}
              {complianceAlerts.expiringLicenses?.map((company: any) => (
                <div key={company.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium text-yellow-800">{company.name}</p>
                    <p className="text-sm text-yellow-600">Business license expires soon</p>
                  </div>
                  <Badge variant="destructive">
                    <Clock className="h-3 w-3 mr-1" />
                    Expiring
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Platform Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions && recentTransactions.length > 0 ? (
              recentTransactions.map((transaction: any) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{transaction.companyName}</p>
                    <p className="text-sm text-gray-600">{transaction.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      ${parseFloat(transaction.amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent transactions</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}