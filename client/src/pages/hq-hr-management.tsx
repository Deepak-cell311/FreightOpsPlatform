import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Clock, 
  DollarSign, 
  FileText, 
  Award, 
  AlertTriangle, 
  CheckCircle,
  Plus,
  Settings,
  Eye,
  Download,
  Upload,
  Calculator,
  Calendar,
  TrendingUp,
  UserPlus,
  GraduationCap,
  Shield,
  Target,
  BarChart3
} from "lucide-react";

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  status: string;
  hireDate: string;
  payType: string;
  basePay: number;
  workLocation: string;
  reportingManager: string;
}

interface PayrollRun {
  id: string;
  payPeriod: {
    startDate: string;
    endDate: string;
    payDate: string;
  };
  status: string;
  totalGrossPay: number;
  totalNetPay: number;
  employeeCount: number;
}

interface TimeEntry {
  id: string;
  employeeId: string;
  date: string;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  status: string;
}

interface ComplianceMetrics {
  totalEmployees: number;
  i9Compliance: number;
  w4Compliance: number;
  backgroundChecks: number;
  drugTests: number;
  overallComplianceScore: number;
}

export default function HRManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchHRData();
  }, []);

  const fetchHRData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch employees
      const employeesResponse = await fetch("/hq/api/hr/employees");
      if (employeesResponse.ok) {
        const employeesData = await employeesResponse.json();
        setEmployees(employeesData.employees || []);
      }

      // Fetch payroll runs
      const payrollResponse = await fetch("/hq/api/hr/payroll");
      if (payrollResponse.ok) {
        const payrollData = await payrollResponse.json();
        setPayrollRuns(payrollData.payrollRuns || []);
      }

      // Fetch time entries
      const timeResponse = await fetch("/hq/api/hr/time-entries");
      if (timeResponse.ok) {
        const timeData = await timeResponse.json();
        setTimeEntries(timeData.timeEntries || []);
      }

      // Fetch compliance metrics
      const complianceResponse = await fetch("/hq/api/hr/compliance");
      if (complianceResponse.ok) {
        const complianceData = await complianceResponse.json();
        setComplianceMetrics(complianceData);
      }

    } catch (error) {
      console.error("Error fetching HR data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: "default",
      pending: "secondary",
      terminated: "destructive",
      on_leave: "outline",
      completed: "default",
      processing: "secondary",
      approved: "default",
      rejected: "destructive"
    };
    return variants[status] || "outline";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading HR Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">HR Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Enterprise human resources and payroll administration</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Reports</span>
          </Button>
          <Button className="flex items-center space-x-2">
            <UserPlus className="h-4 w-4" />
            <span>Add Employee</span>
          </Button>
        </div>
      </div>

      {/* HR Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payrollRuns.length > 0 ? formatCurrency(payrollRuns[0]?.totalGrossPay || 0) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Current pay period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceMetrics?.overallComplianceScore || 0}%</div>
            <p className="text-xs text-muted-foreground">
              HR compliance status
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Tracking</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timeEntries.reduce((sum, entry) => sum + entry.totalHours, 0).toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">
              This week total
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="time">Time & Attendance</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
        </TabsList>

        {/* HR Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Department Breakdown</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from(new Set(employees.map(e => e.department))).map((dept) => {
                    const deptEmployees = employees.filter(e => e.department === dept);
                    const percentage = (deptEmployees.length / employees.length) * 100;
                    return (
                      <div key={dept} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{dept}</div>
                          <div className="text-sm text-muted-foreground">{deptEmployees.length} employees</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{percentage.toFixed(1)}%</div>
                          <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Payroll */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>Recent Payroll Runs</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payrollRuns.slice(0, 5).map((payroll) => (
                    <div key={payroll.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">
                          {new Date(payroll.payPeriod.startDate).toLocaleDateString()} - {new Date(payroll.payPeriod.endDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {payroll.employeeCount} employees
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(payroll.totalNetPay)}</div>
                        <Badge variant={getStatusBadge(payroll.status)}>
                          {payroll.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Overview */}
          {complianceMetrics && (
            <Card>
              <CardHeader>
                <CardTitle>Compliance Overview</CardTitle>
                <CardDescription>Employee compliance status across all requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {((complianceMetrics.i9Compliance / complianceMetrics.totalEmployees) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">I-9 Verified</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {((complianceMetrics.w4Compliance / complianceMetrics.totalEmployees) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">W-4 On File</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {((complianceMetrics.backgroundChecks / complianceMetrics.totalEmployees) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Background Checks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {((complianceMetrics.drugTests / complianceMetrics.totalEmployees) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Drug Tests</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Employee Management */}
        <TabsContent value="employees" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Employee Directory</h2>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                        <div className="text-sm text-muted-foreground">
                          {employee.position} • {employee.department} • ID: {employee.employeeId}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(employee.basePay)}</div>
                        <div className="text-sm text-muted-foreground">{employee.payType}</div>
                      </div>
                      <Badge variant={getStatusBadge(employee.status)}>
                        {employee.status}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
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

        {/* Payroll Management */}
        <TabsContent value="payroll" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Payroll Management</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Run Payroll
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Pay Period</CardTitle>
              </CardHeader>
              <CardContent>
                {payrollRuns.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{formatCurrency(payrollRuns[0].totalGrossPay)}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(payrollRuns[0].payPeriod.startDate).toLocaleDateString()} - {new Date(payrollRuns[0].payPeriod.endDate).toLocaleDateString()}
                    </div>
                    <Badge variant={getStatusBadge(payrollRuns[0].status)}>
                      {payrollRuns[0].status}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tax Withholdings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Federal Tax:</span>
                    <span>{formatCurrency(45670)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>State Tax:</span>
                    <span>{formatCurrency(12340)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>FICA:</span>
                    <span>{formatCurrency(18950)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>{formatCurrency(76960)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Next Pay Date</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto text-blue-500 mb-2" />
                  <div className="text-xl font-bold">Dec 15, 2024</div>
                  <div className="text-sm text-muted-foreground">Bi-weekly payroll</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payroll History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payrollRuns.map((payroll) => (
                  <div key={payroll.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">
                        Pay Period: {new Date(payroll.payPeriod.startDate).toLocaleDateString()} - {new Date(payroll.payPeriod.endDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {payroll.employeeCount} employees • Pay Date: {new Date(payroll.payPeriod.payDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(payroll.totalNetPay)}</div>
                      <Badge variant={getStatusBadge(payroll.status)}>
                        {payroll.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time & Attendance */}
        <TabsContent value="time" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Time & Attendance</h2>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Timesheet
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {timeEntries.reduce((sum, entry) => sum + entry.totalHours, 0).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">This week</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Regular Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {timeEntries.reduce((sum, entry) => sum + entry.regularHours, 0).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Standard time</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Overtime Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {timeEntries.reduce((sum, entry) => sum + entry.overtimeHours, 0).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Time and half</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {timeEntries.filter(entry => entry.status === 'pending').length}
                </div>
                <div className="text-sm text-muted-foreground">Require review</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Time Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {timeEntries.slice(0, 10).map((entry) => {
                  const employee = employees.find(e => e.id === entry.employeeId);
                  return (
                    <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">
                          {employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(entry.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{entry.totalHours.toFixed(1)}h</div>
                        <div className="text-sm text-muted-foreground">
                          {entry.regularHours.toFixed(1)}h regular, {entry.overtimeHours.toFixed(1)}h OT
                        </div>
                      </div>
                      <Badge variant={getStatusBadge(entry.status)}>
                        {entry.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">HR Compliance</h2>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>

          {complianceMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Compliance Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{complianceMetrics.overallComplianceScore}%</div>
                    <div className="text-sm text-muted-foreground">Overall Compliance Score</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>I-9 Verification:</span>
                      <div className="flex items-center space-x-2">
                        <span>{complianceMetrics.i9Compliance}/{complianceMetrics.totalEmployees}</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>W-4 Forms:</span>
                      <div className="flex items-center space-x-2">
                        <span>{complianceMetrics.w4Compliance}/{complianceMetrics.totalEmployees}</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Background Checks:</span>
                      <div className="flex items-center space-x-2">
                        <span>{complianceMetrics.backgroundChecks}/{complianceMetrics.totalEmployees}</span>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Drug Tests:</span>
                      <div className="flex items-center space-x-2">
                        <span>{complianceMetrics.drugTests}/{complianceMetrics.totalEmployees}</span>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5" />
                    <span>Training & Certifications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>DOT Physical:</span>
                      <span className="text-green-600">92% Current</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>CDL Valid:</span>
                      <span className="text-green-600">98% Current</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Safety Training:</span>
                      <span className="text-orange-600">78% Current</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Hazmat Certification:</span>
                      <span className="text-red-600">45% Current</span>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    Schedule Training
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Benefits Administration */}
        <TabsContent value="benefits" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Benefits Administration</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Benefit Plan
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Health Insurance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">87%</div>
                  <div className="text-sm text-muted-foreground">Enrollment Rate</div>
                  <div className="text-sm">
                    {Math.round(employees.length * 0.87)} of {employees.length} enrolled
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">401(k) Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">73%</div>
                  <div className="text-sm text-muted-foreground">Participation Rate</div>
                  <div className="text-sm">
                    Average contribution: 6.2%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">PTO Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">156h</div>
                  <div className="text-sm text-muted-foreground">Average Balance</div>
                  <div className="text-sm">
                    Across all employees
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Open Enrollment</CardTitle>
              <CardDescription>Annual benefits enrollment period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Next Open Enrollment</h3>
                <p className="text-gray-600 dark:text-gray-400">November 1 - November 30, 2024</p>
                <Button className="mt-4">
                  Prepare Enrollment
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}