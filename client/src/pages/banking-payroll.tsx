import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar, DollarSign, Clock, CheckCircle, AlertCircle, Play, Download } from "lucide-react";

export default function BankingPayroll() {
  // Fetch real payroll data
  const { data: payrollSummary } = useQuery({
    queryKey: ["/api/payroll/upcoming"],
    retry: false,
  });

  const upcomingPayroll = payrollSummary || {
    payPeriod: "December 1-15, 2024",
    payDate: "December 20, 2024",
    totalAmount: 18750.00,
    employeeCount: 12,
    status: "ready"
  };

  const employees = [
    {
      id: "emp-001",
      name: "John Smith",
      role: "Lead Driver",
      grossPay: 2850.00,
      taxes: 712.50,
      deductions: 285.00,
      netPay: 1852.50,
      status: "approved",
      hoursWorked: 95
    },
    {
      id: "emp-002",
      name: "Sarah Johnson",
      role: "Operations Manager",
      grossPay: 2400.00,
      taxes: 600.00,
      deductions: 240.00,
      netPay: 1560.00,
      status: "approved",
      hoursWorked: 80
    },
    {
      id: "emp-003",
      name: "Mike Rodriguez",
      role: "Driver",
      grossPay: 2100.00,
      taxes: 525.00,
      deductions: 210.00,
      netPay: 1365.00,
      status: "pending",
      hoursWorked: 70
    },
    {
      id: "emp-004",
      name: "Lisa Chen",
      role: "Dispatcher",
      grossPay: 1950.00,
      taxes: 487.50,
      deductions: 195.00,
      netPay: 1267.50,
      status: "approved",
      hoursWorked: 80
    }
  ];

  const payrollHistory = [
    {
      id: "pay-001",
      payPeriod: "November 16-30, 2024",
      payDate: "December 5, 2024",
      totalAmount: 17250.00,
      employeeCount: 12,
      status: "completed"
    },
    {
      id: "pay-002",
      payPeriod: "November 1-15, 2024",
      payDate: "November 20, 2024",
      totalAmount: 18950.00,
      employeeCount: 13,
      status: "completed"
    },
    {
      id: "pay-003",
      payPeriod: "October 16-31, 2024",
      payDate: "November 5, 2024",
      totalAmount: 19100.00,
      employeeCount: 13,
      status: "completed"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full min-h-full px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payroll</h1>
          <p className="text-gray-600">Manage employee payments and payroll processing</p>
        </div>

        {/* Upcoming Payroll Summary */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-blue-900">Next Payroll Run</CardTitle>
                  <p className="text-blue-700">{upcomingPayroll.payPeriod}</p>
                </div>
              </div>
              <Badge className={`${getStatusColor(upcomingPayroll.status)} border-0`}>
                Ready to Process
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="text-blue-600 text-sm mb-1">Pay Date</div>
                <div className="font-semibold text-blue-900">{upcomingPayroll.payDate}</div>
              </div>
              <div>
                <div className="text-blue-600 text-sm mb-1">Total Amount</div>
                <div className="font-semibold text-blue-900">${upcomingPayroll.totalAmount.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-blue-600 text-sm mb-1">Employees</div>
                <div className="font-semibold text-blue-900">{upcomingPayroll.employeeCount} people</div>
              </div>
              <div>
                <Button className="bg-blue-600 hover:bg-blue-700 w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Process Payroll
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="current" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">Current Pay Period</TabsTrigger>
            <TabsTrigger value="history">Payroll History</TabsTrigger>
            <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Employee Pay Details</CardTitle>
                  <p className="text-sm text-gray-600">Current pay period: {upcomingPayroll.payPeriod}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    Review All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employees.map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-sm text-gray-600">{employee.role}</div>
                          <div className="text-xs text-gray-500">{employee.hoursWorked} hours worked</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-6 text-right">
                        <div>
                          <div className="text-xs text-gray-500">Gross Pay</div>
                          <div className="font-medium">${employee.grossPay.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Taxes</div>
                          <div className="font-medium text-red-600">-${employee.taxes.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Deductions</div>
                          <div className="font-medium text-red-600">-${employee.deductions.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Net Pay</div>
                          <div className="font-semibold text-green-600">${employee.netPay.toFixed(2)}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(employee.status)}>
                          {employee.status === 'approved' ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                          {employee.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Previous Payroll Runs</CardTitle>
                <p className="text-sm text-gray-600">Historical payroll processing records</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payrollHistory.map((payroll) => (
                    <div key={payroll.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">{payroll.payPeriod}</div>
                          <div className="text-sm text-gray-600">Paid on {payroll.payDate}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6 text-right">
                        <div>
                          <div className="text-xs text-gray-500">Total Amount</div>
                          <div className="font-semibold">${payroll.totalAmount.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Employees</div>
                          <div className="font-medium">{payroll.employeeCount} people</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(payroll.status)}>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {payroll.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payroll Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">This Month</span>
                      <span className="font-semibold">${payrollData?.quarterly?.toLocaleString() || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Month</span>
                      <span className="font-semibold">${payrollData?.federal?.toLocaleString() || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">YTD Total</span>
                      <span className="font-semibold">${payrollData?.annual?.toLocaleString() || '0.00'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tax Withholdings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Federal Tax</span>
                      <span className="font-semibold">${payrollData?.benefits?.toLocaleString() || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">State Tax</span>
                      <span className="font-semibold">${payrollSummary?.stateTax || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">FICA</span>
                      <span className="font-semibold">${payrollSummary?.biWeeklyPayroll || '0.00'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Health Insurance</span>
                      <span className="font-semibold">${payrollSummary?.monthlyPayroll || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Retirement</span>
                      <span className="font-semibold">${payrollSummary?.retirementContribution || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Other Deductions</span>
                      <span className="font-semibold">$450.00</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}