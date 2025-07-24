import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Users, Building2, DollarSign, TrendingUp, Calendar, 
  Shield, Heart, Award, FileText, AlertTriangle, 
  CheckCircle, Clock, CreditCard, Eye, UserPlus, 
  Download, Filter, Search, MoreHorizontal
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function BrokerHRDashboard() {
  const { toast } = useToast();
  const [selectedCarrier, setSelectedCarrier] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState("current_quarter");

  // Fetch broker carriers
  const { data: carriersData, isLoading: carriersLoading } = useQuery({
    queryKey: ["/api/broker/carriers"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/broker/carriers");
      return res.json();
    },
  });

  // Fetch aggregated HR analytics across all carriers
  const { data: hrAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/broker/hr/analytics", filterPeriod],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/broker/hr/analytics?period=${filterPeriod}`);
      return res.json();
    },
  });

  // Fetch payroll summary across carriers
  const { data: payrollSummary, isLoading: payrollLoading } = useQuery({
    queryKey: ["/api/broker/hr/payroll-summary", filterPeriod],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/broker/hr/payroll-summary?period=${filterPeriod}`);
      return res.json();
    },
  });

  // Fetch compliance overview
  const { data: complianceOverview, isLoading: complianceLoading } = useQuery({
    queryKey: ["/api/broker/hr/compliance-overview"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/broker/hr/compliance-overview");
      return res.json();
    },
  });

  // Fetch carrier-specific HR data when carrier is selected
  const { data: carrierHRData, isLoading: carrierDataLoading } = useQuery({
    queryKey: ["/api/broker/hr/carrier-details", selectedCarrier],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/broker/hr/carrier-details/${selectedCarrier}`);
      return res.json();
    },
    enabled: !!selectedCarrier,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  if (carriersLoading || analyticsLoading || payrollLoading || complianceLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Broker HR Analytics</h1>
          <p className="text-muted-foreground">
            Monitor HR metrics and payroll across your carrier network
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_month">Current Month</SelectItem>
              <SelectItem value="current_quarter">Current Quarter</SelectItem>
              <SelectItem value="current_year">Current Year</SelectItem>
              <SelectItem value="last_90_days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* High-Level Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workforce</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(hrAnalytics?.totalEmployees || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {carriersData?.carriers?.length || 0} carriers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(payrollSummary?.totalPayrollCost || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filterPeriod.replace('_', ' ')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getComplianceColor(complianceOverview?.averageComplianceScore || 0)}`}>
              {(complianceOverview?.averageComplianceScore || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Network average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Carriers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {carriersData?.carriers?.filter((c: any) => c.status === 'active').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              With HR integration
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="carriers">Carrier Details</TabsTrigger>
          <TabsTrigger value="payroll">Payroll Analytics</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Workforce Distribution</CardTitle>
                <CardDescription>
                  Employee distribution across carrier network
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hrAnalytics?.departmentBreakdown?.map((dept: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{dept.department}</span>
                        <span>{dept.employeeCount} employees</span>
                      </div>
                      <Progress value={(dept.employeeCount / (hrAnalytics?.totalEmployees || 1)) * 100} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payroll Trends</CardTitle>
                <CardDescription>
                  Monthly payroll costs across network
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payrollSummary?.monthlyTrends?.map((trend: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{trend.month}</span>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(trend.totalCost)}</p>
                        <p className="text-xs text-muted-foreground">
                          {trend.employeeCount} employees
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Carriers (HR)</CardTitle>
              <CardDescription>
                Carriers ranked by HR compliance and efficiency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hrAnalytics?.topPerformingCarriers?.map((carrier: any, index: number) => (
                  <div key={carrier.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{carrier.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {carrier.employeeCount} employees • {carrier.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getComplianceColor(carrier.complianceScore)}`}>
                        {carrier.complianceScore.toFixed(1)}%
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(carrier.avgWage)}/emp
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="carriers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Carrier HR Management</CardTitle>
              <CardDescription>
                Detailed HR metrics for individual carriers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Select value={selectedCarrier || ""} onValueChange={setSelectedCarrier}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Select a carrier" />
                    </SelectTrigger>
                    <SelectContent>
                      {carriersData?.carriers?.map((carrier: any) => (
                        <SelectItem key={carrier.id} value={carrier.id}>
                          {carrier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" disabled={!selectedCarrier}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Full Report
                  </Button>
                </div>

                {selectedCarrier && carrierHRData && (
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Employee Count</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{carrierHRData.employeeCount}</div>
                        <p className="text-xs text-muted-foreground">
                          {carrierHRData.newHires} new hires this month
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Monthly Payroll</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatCurrency(carrierHRData.monthlyPayroll)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(carrierHRData.avgEmployeePay)} average
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Compliance Score</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${getComplianceColor(carrierHRData.complianceScore)}`}>
                          {carrierHRData.complianceScore.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {carrierHRData.pendingItems} pending items
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {selectedCarrier && carrierHRData && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Recent HR Activities</h4>
                    <div className="space-y-2">
                      {carrierHRData.recentActivities?.map((activity: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <div>
                              <p className="font-medium">{activity.type}</p>
                              <p className="text-sm text-muted-foreground">{activity.description}</p>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(activity.date).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Network Payroll</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(payrollSummary?.totalPayrollCost || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {payrollSummary?.payrollRuns || 0} payroll runs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Average Wage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(payrollSummary?.averageWage || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per employee per month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Overtime Costs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(payrollSummary?.overtimeCosts || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((payrollSummary?.overtimeCosts || 0) / (payrollSummary?.totalPayrollCost || 1) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Benefits Costs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(payrollSummary?.benefitsCosts || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Employer contributions
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payroll Breakdown by Carrier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payrollSummary?.carrierBreakdown?.map((carrier: any) => (
                  <div key={carrier.carrierId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{carrier.carrierName}</p>
                      <p className="text-sm text-muted-foreground">
                        {carrier.employeeCount} employees
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCurrency(carrier.totalPayroll)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(carrier.avgWage)} avg wage
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  I-9 Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {complianceOverview?.i9Compliance?.completionRate || 0}%
                    </div>
                    <p className="text-sm text-muted-foreground">Completion rate</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completed</span>
                      <span>{complianceOverview?.i9Compliance?.completed || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Pending</span>
                      <span>{complianceOverview?.i9Compliance?.pending || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Expired</span>
                      <span>{complianceOverview?.i9Compliance?.expired || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Tax Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">
                      {complianceOverview?.taxCompliance?.onTimeRate || 0}%
                    </div>
                    <p className="text-sm text-muted-foreground">On-time filing rate</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Filed on time</span>
                      <span>{complianceOverview?.taxCompliance?.onTime || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Late filings</span>
                      <span>{complianceOverview?.taxCompliance?.late || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Overdue</span>
                      <span className="text-red-600">{complianceOverview?.taxCompliance?.overdue || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Benefits Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {complianceOverview?.benefitsCompliance?.enrollmentRate || 0}%
                    </div>
                    <p className="text-sm text-muted-foreground">Enrollment rate</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Enrolled</span>
                      <span>{complianceOverview?.benefitsCompliance?.enrolled || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Eligible not enrolled</span>
                      <span>{complianceOverview?.benefitsCompliance?.eligible || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Deadlines approaching</span>
                      <span className="text-orange-600">{complianceOverview?.benefitsCompliance?.approaching || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Compliance Issues by Carrier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceOverview?.carrierIssues?.map((carrier: any) => (
                  <div key={carrier.carrierId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{carrier.carrierName}</p>
                      <p className="text-sm text-muted-foreground">
                        {carrier.totalIssues} compliance issues
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`text-lg font-bold ${getComplianceColor(carrier.complianceScore)}`}>
                        {carrier.complianceScore.toFixed(1)}%
                      </div>
                      <div className="flex gap-1">
                        {carrier.criticalIssues > 0 && (
                          <Badge variant="destructive">{carrier.criticalIssues} Critical</Badge>
                        )}
                        {carrier.warningIssues > 0 && (
                          <Badge variant="outline">{carrier.warningIssues} Warnings</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Health Insurance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {hrAnalytics?.benefitsEnrollment?.health?.enrolledCount || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((hrAnalytics?.benefitsEnrollment?.health?.enrolledCount || 0) / (hrAnalytics?.totalEmployees || 1) * 100).toFixed(1)}% enrolled
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">401(k) Participation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {hrAnalytics?.benefitsEnrollment?.retirement?.enrolledCount || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((hrAnalytics?.benefitsEnrollment?.retirement?.enrolledCount || 0) / (hrAnalytics?.totalEmployees || 1) * 100).toFixed(1)}% participating
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Dental Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {hrAnalytics?.benefitsEnrollment?.dental?.enrolledCount || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((hrAnalytics?.benefitsEnrollment?.dental?.enrolledCount || 0) / (hrAnalytics?.totalEmployees || 1) * 100).toFixed(1)}% enrolled
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Vision Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {hrAnalytics?.benefitsEnrollment?.vision?.enrolledCount || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((hrAnalytics?.benefitsEnrollment?.vision?.enrolledCount || 0) / (hrAnalytics?.totalEmployees || 1) * 100).toFixed(1)}% enrolled
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Benefits Cost Analysis</CardTitle>
              <CardDescription>
                Total benefits costs and employer contributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Monthly Employer Contributions</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Health Insurance</span>
                      <span className="font-medium">
                        {formatCurrency(hrAnalytics?.benefitsCosts?.health?.employerContribution || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>401(k) Match</span>
                      <span className="font-medium">
                        {formatCurrency(hrAnalytics?.benefitsCosts?.retirement?.employerContribution || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dental Insurance</span>
                      <span className="font-medium">
                        {formatCurrency(hrAnalytics?.benefitsCosts?.dental?.employerContribution || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vision Insurance</span>
                      <span className="font-medium">
                        {formatCurrency(hrAnalytics?.benefitsCosts?.vision?.employerContribution || 0)}
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between font-bold">
                        <span>Total Monthly</span>
                        <span>
                          {formatCurrency(Object.values(hrAnalytics?.benefitsCosts || {}).reduce((sum: number, benefit: any) => sum + (benefit?.employerContribution || 0), 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Employee Contributions</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Health Insurance</span>
                      <span className="font-medium">
                        {formatCurrency(hrAnalytics?.benefitsCosts?.health?.employeeContribution || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>401(k) Contributions</span>
                      <span className="font-medium">
                        {formatCurrency(hrAnalytics?.benefitsCosts?.retirement?.employeeContribution || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dental Insurance</span>
                      <span className="font-medium">
                        {formatCurrency(hrAnalytics?.benefitsCosts?.dental?.employeeContribution || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vision Insurance</span>
                      <span className="font-medium">
                        {formatCurrency(hrAnalytics?.benefitsCosts?.vision?.employeeContribution || 0)}
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between font-bold">
                        <span>Total Monthly</span>
                        <span>
                          {formatCurrency(Object.values(hrAnalytics?.benefitsCosts || {}).reduce((sum: number, benefit: any) => sum + (benefit?.employeeContribution || 0), 0))}
                        </span>
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