import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar, Users, Download, Calculator, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export default function HRPayroll() {
  const { user } = useAuth();

  const { data: payrollData, isLoading } = useQuery({
    queryKey: ["/api/payroll/runs"],
    enabled: !!user,
  });

  const { data: employeesData } = useQuery({
    queryKey: ["/api/payroll/employees"],
    enabled: !!user,
  });

  const payrollRuns = payrollData?.payrollRuns || [];
  const employees = employeesData?.employees || [];

  if (isLoading) {
    return (
      <div className="w-full min-h-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const upcomingPayroll = employees.slice(0, 3).map((emp: any, index: number) => ({
    employee: emp.name || `Employee ${index + 1}`,
    hoursWorked: 80,
    regularPay: (emp.hourlyRate || 30) * 80,
    overtimePay: (emp.hourlyRate || 30) * 0.5 * 10,
    grossPay: ((emp.hourlyRate || 30) * 80) + ((emp.hourlyRate || 30) * 0.5 * 10),
    netPay: (((emp.hourlyRate || 30) * 80) + ((emp.hourlyRate || 30) * 0.5 * 10)) * 0.75
  }));

  return (
    <div className="w-full min-h-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-600 mt-2">Process payroll and manage employee compensation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
          <Button>Run Payroll</Button>
        </div>
      </div>

      {/* Payroll Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900">{employees.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Current Pay Period</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${payrollRuns[0]?.totalGrossPay?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Processing Status</p>
                <p className="text-3xl font-bold text-gray-900">Ready</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Net Payroll</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${payrollRuns[0]?.totalNetPay?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Calculator className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payroll Runs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Payroll Runs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payrollRuns.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No payroll runs found</p>
              ) : (
                payrollRuns.slice(0, 5).map((run: any) => (
                  <div key={run.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium">
                        {new Date(run.payPeriodStart).toLocaleDateString()} - {new Date(run.payPeriodEnd).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {run.totalEmployees} employees • Pay Date: {new Date(run.payDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${run.totalGrossPay?.toLocaleString()}</p>
                      <Badge variant={run.status === 'paid' ? 'default' : 'secondary'}>
                        {run.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Payroll */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Payroll Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingPayroll.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No employees found</p>
              ) : (
                upcomingPayroll.map((payroll: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{payroll.employee}</p>
                      <p className="text-sm text-gray-600">
                        {payroll.hoursWorked}h worked
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${payroll.grossPay.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">Net: ${payroll.netPay.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="pt-4 mt-4 border-t">
              <Button className="w-full">
                Calculate Payroll for Current Period
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Actions */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Payroll Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Calculator className="h-6 w-6" />
                <span>Calculate Payroll</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Download className="h-6 w-6" />
                <span>Export Reports</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Users className="h-6 w-6" />
                <span>Manage Employees</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}