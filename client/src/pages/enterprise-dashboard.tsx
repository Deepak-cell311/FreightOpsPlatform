import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Truck,
  Users,
  Route,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  Banknote,
  PieChart,
  BarChart3,
  Target,
  FileText,
  Shield,
  Zap,
} from "lucide-react";
import { Link } from "wouter";

interface DashboardMetrics {
  finance: {
    grossRevenue: number;
    netRevenue: number;
    activeRevenue: number;
    projectedRevenue: number;
    revenueTarget: number;
    loadedRevenue: number;
    emptyMiles: number;
    actualTarget: number;
  };
  operations: {
    activeLoads: number;
    totalDrivers: number;
    availableDrivers: number;
    onDutyDrivers: number;
    tractorAvailability: {
      available: number;
      unavailable: number;
      total: number;
    };
    assignedTrips: number;
    needsAttention: number;
  };
  banking: {
    availableBalance: number;
    pendingPayments: number;
    deliveredPayments: number;
    invoices: {
      missing: number;
      invoiceLoads: number;
    };
    loads: {
      missingDocuments: number;
      total: number;
    };
  };
  safety: {
    driverSafety: {
      warning: number;
      critical: number;
    };
    tractorSafety: {
      warning: number;
      critical: number;
    };
    trailerSafety: {
      warning: number;
      critical: number;
    };
  };
}

export default function EnterpriseDashboard() {
  const { user, isAuthenticated } = useAuth();

  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/enterprise-metrics"],
    enabled: isAuthenticated,
  });

  // Default metrics structure with zero values
  const defaultMetrics: DashboardMetrics = {
    finance: {
      grossRevenue: 0,
      netRevenue: 0,
      activeRevenue: 0,
      projectedRevenue: 0,
      revenueTarget: 150000,
      loadedRevenue: 0,
      emptyMiles: 0,
      actualTarget: 135000,
    },
    operations: {
      activeLoads: 0,
      totalDrivers: 0,
      availableDrivers: 0,
      onDutyDrivers: 0,
      tractorAvailability: {
        available: 0,
        unavailable: 0,
        total: 0,
      },
      assignedTrips: 0,
      needsAttention: 0,
    },
    banking: {
      availableBalance: 0,
      pendingPayments: 0,
      deliveredPayments: 0,
      invoices: {
        missing: 0,
        invoiceLoads: 0,
      },
      loads: {
        missingDocuments: 0,
        total: 0,
      },
    },
    safety: {
      driverSafety: {
        warning: 0,
        critical: 0,
      },
      tractorSafety: {
        warning: 0,
        critical: 0,
      },
      trailerSafety: {
        warning: 0,
        critical: 0,
      },
    },
  };

  const data = metrics || defaultMetrics;

  return (
    <div className="space-y-6">
        {isLoading && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
              <span className="text-sm text-blue-700 dark:text-blue-300">Loading latest data...</span>
            </div>
          </div>
        )}
        {/* Mobile Header - only show on mobile */}
        <div className="lg:hidden flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {user?.firstName} - {user?.companyName}
            </p>
          </div>
        </div>

        {/* Mobile Action Buttons - hidden on desktop */}
        <div className="lg:hidden flex gap-3 mb-6">
          <Link href="/dispatch">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Route className="w-4 h-4 mr-2" />
              New Load
            </Button>
          </Link>
          <Link href="/banking">
            <Button variant="outline">
              <CreditCard className="w-4 h-4 mr-2" />
              Banking
            </Button>
          </Link>
        </div>

        {/* Finance Performance Section */}
        <Card className="border-2 border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <DollarSign className="w-5 h-5" />
              Finance Performance for Company
              <Badge variant="secondary" className="ml-2">30 Days Left in Trial</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${data.finance.grossRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Gross Revenue</div>
                <div className="text-xs text-gray-500">Target: ${data.finance.revenueTarget.toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  ${data.finance.netRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Net Revenue</div>
                <div className="text-xs text-gray-500">Monthly target</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  ${data.finance.activeRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Active</div>
                <div className="text-xs text-gray-500">Projected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  ${data.finance.loadedRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Loaded</div>
                <div className="text-xs text-gray-500">Revenue / Loaded</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Empty Miles */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-full">
                  <Target className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {data.finance.emptyMiles}%
                  </div>
                  <div className="text-sm text-gray-600">Empty Miles</div>
                  <div className="text-xs text-gray-500">Target: ${data.finance.actualTarget.toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trip Operational Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5" />
                Trip Operational Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Open Trips</span>
                  <span className="font-medium">{data.operations.assignedTrips}</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full w-4/5"></div>
                </div>
                <div className="text-xs text-center text-blue-600">Needs Attention</div>
              </div>
            </CardContent>
          </Card>

          {/* Driver Availability */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5" />
                Driver Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 relative">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${(data.operations.availableDrivers / data.operations.totalDrivers) * 283} 283`}
                        className="text-green-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-medium">{data.operations.availableDrivers}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Need Loads</div>
                    <div className="text-xs text-gray-500">On Vacation</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Load Invoices */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5" />
                Load Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Invoices</div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{data.banking.deliveredPayments.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Delivered Payment</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">{data.banking.pendingPayments.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Pending Payment</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Loads</div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">{data.banking.invoices.missing}</div>
                      <div className="text-xs text-gray-500">Missing Documents</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{data.banking.loads.total}</div>
                      <div className="text-xs text-gray-500">Invoice Loads</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Banking & Financial Integration */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Banking & Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    ${data.banking.availableBalance.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Available Balance</div>
                  <Link href="/banking">
                    <Button variant="outline" size="sm" className="mt-2">
                      <Banknote className="w-4 h-4 mr-1" />
                      Transfer
                    </Button>
                  </Link>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    ${data.banking.pendingPayments.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Pending Payments</div>
                  <Link href="/billing">
                    <Button variant="outline" size="sm" className="mt-2">
                      <Clock className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                  </Link>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    ${data.banking.deliveredPayments.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Delivered Payments</div>
                  <Link href="/accounting">
                    <Button variant="outline" size="sm" className="mt-2">
                      <PieChart className="w-4 h-4 mr-1" />
                      Reports
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Tractor Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 relative">
                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        className="text-gray-200"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray={`${(data.operations.tractorAvailability.available / data.operations.tractorAvailability.total) * 283} 283`}
                        className="text-green-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold">{data.operations.tractorAvailability.available}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-green-600 font-medium">Available</div>
                    <div className="text-red-600 font-medium">Unavailable</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Safety Standings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Driver Safety Standing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-red-600">{data.safety.driverSafety.critical}</div>
                  <div className="text-sm text-red-600">Warning</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{data.safety.driverSafety.warning}</div>
                  <div className="text-sm text-orange-600">Critical</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Tractor Safety Standing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{data.safety.tractorSafety.warning}</div>
                  <div className="text-sm text-green-600">Warning</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{data.safety.tractorSafety.critical}</div>
                  <div className="text-sm text-green-600">Critical</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Trailer Safety Standing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{data.safety.trailerSafety.warning}</div>
                  <div className="text-sm text-green-600">Warning</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{data.safety.trailerSafety.critical}</div>
                  <div className="text-sm text-green-600">Critical</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/dispatch">
                <Button variant="outline" className="w-full justify-start">
                  <Route className="w-4 h-4 mr-2" />
                  Create Load
                </Button>
              </Link>
              <Link href="/fleet">
                <Button variant="outline" className="w-full justify-start">
                  <Truck className="w-4 h-4 mr-2" />
                  Fleet Status
                </Button>
              </Link>
              <Link href="/banking">
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Banking
                </Button>
              </Link>
              <Link href="/hr">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Drivers
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}