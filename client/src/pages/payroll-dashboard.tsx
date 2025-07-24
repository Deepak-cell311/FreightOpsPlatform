import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmbeddedPayroll } from "@/components/gusto-embedded/embedded-payroll";
import { EmbeddedHR } from "@/components/gusto-embedded/embedded-hr";
import { EmbeddedBenefits } from "@/components/gusto-embedded/embedded-benefits";
import { 
  Users, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Plus,
  Clock,
  FileText,
  Shield,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Settings,
  Download,
  Upload,
  Bell,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  MoreHorizontal,
  Building,
  Heart,
  PieChart,
  Calculator,
  UserPlus,
  PlayCircle,
  PauseCircle,
  StopCircle,
  RotateCcw,
  Send,
  Archive,
  Briefcase,
  Home,
  MapPin,
  Phone,
  Mail,
  Globe,
  Percent,
  Target,
  Award,
  BookOpen,
  Clipboard,
  Star,
  Zap
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function PayrollDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showRunPayroll, setShowRunPayroll] = useState(false);
  const [showBenefitsEnrollment, setShowBenefitsEnrollment] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch payroll overview data
  const { data: payrollOverview, isLoading: overviewLoading } = useQuery({
    queryKey: ['/api/payroll/overview'],
    refetchInterval: 30000
  });

  // Fetch employees data
  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['/api/payroll/employees'],
    refetchInterval: 30000
  });

  // Fetch payroll runs
  const { data: payrollRuns, isLoading: runsLoading } = useQuery({
    queryKey: ['/api/payroll/runs'],
    refetchInterval: 30000
  });

  // Fetch benefits data
  const { data: benefits, isLoading: benefitsLoading } = useQuery({
    queryKey: ['/api/payroll/benefits'],
    refetchInterval: 30000
  });

  // Fetch time tracking data
  const { data: timeTracking, isLoading: timeLoading } = useQuery({
    queryKey: ['/api/payroll/time-tracking'],
    refetchInterval: 30000
  });

  // Fetch compliance data
  const { data: compliance, isLoading: complianceLoading } = useQuery({
    queryKey: ['/api/payroll/compliance'],
    refetchInterval: 30000
  });

  // Fetch tax forms
  const { data: taxForms, isLoading: taxFormsLoading } = useQuery({
    queryKey: ['/api/payroll/tax-forms'],
    refetchInterval: 30000
  });

  // Fetch contractors
  const { data: contractors, isLoading: contractorsLoading } = useQuery({
    queryKey: ['/api/payroll/contractors'],
    refetchInterval: 30000
  });

  // Add new employee mutation
  const addEmployeeMutation = useMutation({
    mutationFn: async (employeeData: any) => {
      return await apiRequest('POST', '/api/payroll/employees', employeeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payroll/employees'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payroll/overview'] });
      setShowAddEmployee(false);
      toast({
        title: "Employee Added",
        description: "New employee has been successfully added to payroll.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add employee. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Run payroll mutation
  const runPayrollMutation = useMutation({
    mutationFn: async (payrollData: any) => {
      return await apiRequest('POST', '/api/payroll/run', payrollData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payroll/runs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payroll/overview'] });
      setShowRunPayroll(false);
      toast({
        title: "Payroll Processed",
        description: "Payroll has been successfully processed and submitted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process payroll. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Clock in/out mutation
  const clockMutation = useMutation({
    mutationFn: async ({ employeeId, action }: { employeeId: string, action: 'in' | 'out' }) => {
      return await apiRequest('POST', `/api/payroll/time-tracking/${action}`, { employeeId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payroll/time-tracking'] });
      toast({
        title: "Time Recorded",
        description: "Time entry has been recorded successfully.",
      });
    }
  });

  // Benefits enrollment mutation
  const benefitsEnrollmentMutation = useMutation({
    mutationFn: async (enrollmentData: any) => {
      return await apiRequest('POST', '/api/payroll/benefits/enroll', enrollmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payroll/benefits'] });
      setShowBenefitsEnrollment(false);
      toast({
        title: "Benefits Enrolled",
        description: "Employee benefits enrollment completed successfully.",
      });
    }
  });

  if (overviewLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll & HR</h1>
          <p className="text-gray-600 mt-1">Complete payroll and human resources management</p>
        </div>
        <div className="flex space-x-3">
          <Dialog open={showRunPayroll} onOpenChange={setShowRunPayroll}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <PlayCircle className="w-4 h-4 mr-2" />
                Run Payroll
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Run Payroll</DialogTitle>
                <DialogDescription>
                  Process payroll for the selected pay period
                </DialogDescription>
              </DialogHeader>
              <RunPayrollForm onSubmit={runPayrollMutation.mutate} />
            </DialogContent>
          </Dialog>
          
          <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Complete employee information and payroll setup
                </DialogDescription>
              </DialogHeader>
              <AddEmployeeForm onSubmit={addEmployeeMutation.mutate} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrollOverview?.activeEmployees || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{payrollOverview?.newHiresThisMonth || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${payrollOverview?.monthlyPayroll?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {payrollOverview?.payrollChange > 0 ? '+' : ''}{payrollOverview?.payrollChange || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benefits Cost</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${payrollOverview?.benefitsCost?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {payrollOverview?.benefitsEnrollment || 0}% enrollment rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrollOverview?.complianceScore || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {payrollOverview?.complianceIssues || 0} issues pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="time">Time & Attendance</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="contractors">Contractors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab 
            payrollOverview={payrollOverview}
            recentPayrollRuns={payrollRuns?.slice(0, 3)}
            upcomingTasks={payrollOverview?.upcomingTasks}
          />
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <EmployeesTab 
            employees={employees}
            loading={employeesLoading}
            onEmployeeSelect={setSelectedEmployee}
          />
        </TabsContent>

        <TabsContent value="payroll" className="space-y-6">
          <PayrollTab 
            payrollRuns={payrollRuns}
            loading={runsLoading}
            onRunPayroll={() => setShowRunPayroll(true)}
          />
        </TabsContent>

        <TabsContent value="benefits" className="space-y-6">
          <BenefitsTab 
            benefits={benefits}
            loading={benefitsLoading}
            onEnrollEmployee={() => setShowBenefitsEnrollment(true)}
          />
        </TabsContent>

        <TabsContent value="time" className="space-y-6">
          <TimeTrackingTab 
            timeTracking={timeTracking}
            loading={timeLoading}
            onClockAction={clockMutation.mutate}
          />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <ComplianceTab 
            compliance={compliance}
            loading={complianceLoading}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <ReportsTab 
            taxForms={taxForms}
            loading={taxFormsLoading}
          />
        </TabsContent>

        <TabsContent value="contractors" className="space-y-6">
          <ContractorsTab 
            contractors={contractors}
            loading={contractorsLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Benefits Enrollment Dialog */}
      <Dialog open={showBenefitsEnrollment} onOpenChange={setShowBenefitsEnrollment}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Benefits Enrollment</DialogTitle>
            <DialogDescription>
              Enroll employee in available benefits plans
            </DialogDescription>
          </DialogHeader>
          <BenefitsEnrollmentForm onSubmit={benefitsEnrollmentMutation.mutate} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ payrollOverview, recentPayrollRuns, upcomingTasks }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Payroll Runs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Recent Payroll Runs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPayrollRuns?.map((run: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{run.payPeriod}</p>
                  <p className="text-sm text-gray-600">{run.employees} employees</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${run.totalAmount?.toLocaleString()}</p>
                  <Badge variant={run.status === 'completed' ? 'default' : 'secondary'}>
                    {run.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Upcoming Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingTasks?.map((task: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    task.priority === 'high' ? 'bg-red-500' :
                    task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-gray-600">{task.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{task.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payroll Analytics */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Payroll Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${payrollOverview?.yearToDatePayroll?.toLocaleString() || '0'}
              </div>
              <p className="text-sm text-gray-600">Year-to-Date Payroll</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${payrollOverview?.avgPayPerEmployee?.toLocaleString() || '0'}
              </div>
              <p className="text-sm text-gray-600">Average Pay Per Employee</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {payrollOverview?.payrollFrequency || 'Bi-weekly'}
              </div>
              <p className="text-sm text-gray-600">Pay Frequency</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Employees Tab Component
function EmployeesTab({ employees, loading, onEmployeeSelect }: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const filteredEmployees = employees?.filter((emp: any) => {
    const matchesSearch = emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || emp.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
            <SelectItem value="dispatch">Dispatch</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="admin">Administration</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Employee Directory ({filteredEmployees?.length || 0})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Benefits</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees?.map((employee: any) => (
                  <TableRow key={employee.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                          {employee.firstName?.[0]}{employee.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                          <p className="text-sm text-gray-600">{employee.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>
                      <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell>${employee.salary?.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {employee.benefits?.medical && <Badge variant="outline" className="text-xs">Medical</Badge>}
                        {employee.benefits?.dental && <Badge variant="outline" className="text-xs">Dental</Badge>}
                        {employee.benefits?.retirement && <Badge variant="outline" className="text-xs">401k</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => onEmployeeSelect(employee)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Add Employee Form Component
function AddEmployeeForm({ onSubmit }: any) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    position: '',
    department: '',
    salary: '',
    employeeType: 'full-time',
    startDate: '',
    ssn: '',
    taxWithholdings: {
      federal: '',
      state: '',
      localTax: ''
    },
    benefits: {
      medical: false,
      dental: false,
      vision: false,
      retirement: false
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="tax">Tax & Benefits</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="address">Home Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="ssn">Social Security Number *</Label>
            <Input
              id="ssn"
              value={formData.ssn}
              onChange={(e) => setFormData({...formData, ssn: e.target.value})}
              placeholder="XXX-XX-XXXX"
              required
            />
          </div>
        </TabsContent>

        <TabsContent value="employment" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="position">Job Title *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({...formData, department: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="dispatch">Dispatch</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="admin">Administration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employeeType">Employment Type</Label>
              <Select
                value={formData.employeeType}
                onValueChange={(value) => setFormData({...formData, employeeType: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                  <SelectItem value="temp">Temporary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="salary">Annual Salary *</Label>
            <Input
              id="salary"
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({...formData, salary: e.target.value})}
              placeholder="50000"
              required
            />
          </div>
        </TabsContent>

        <TabsContent value="tax" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="federalTax">Federal Tax Withholding</Label>
              <Input
                id="federalTax"
                value={formData.taxWithholdings.federal}
                onChange={(e) => setFormData({
                  ...formData,
                  taxWithholdings: {...formData.taxWithholdings, federal: e.target.value}
                })}
                placeholder="22%"
              />
            </div>
            <div>
              <Label htmlFor="stateTax">State Tax Withholding</Label>
              <Input
                id="stateTax"
                value={formData.taxWithholdings.state}
                onChange={(e) => setFormData({
                  ...formData,
                  taxWithholdings: {...formData.taxWithholdings, state: e.target.value}
                })}
                placeholder="5%"
              />
            </div>
            <div>
              <Label htmlFor="localTax">Local Tax (if applicable)</Label>
              <Input
                id="localTax"
                value={formData.taxWithholdings.localTax}
                onChange={(e) => setFormData({
                  ...formData,
                  taxWithholdings: {...formData.taxWithholdings, localTax: e.target.value}
                })}
                placeholder="1%"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-base font-medium">Benefits Enrollment</Label>
            <div className="space-y-3 mt-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="medical"
                  checked={formData.benefits.medical}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    benefits: {...formData.benefits, medical: checked as boolean}
                  })}
                />
                <Label htmlFor="medical">Medical Insurance (Contact for rates)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dental"
                  checked={formData.benefits.dental}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    benefits: {...formData.benefits, dental: checked as boolean}
                  })}
                />
                <Label htmlFor="dental">Dental Insurance (Contact for rates)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vision"
                  checked={formData.benefits.vision}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    benefits: {...formData.benefits, vision: checked as boolean}
                  })}
                />
                <Label htmlFor="vision">Vision Insurance (Contact for rates)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="retirement"
                  checked={formData.benefits.retirement}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    benefits: {...formData.benefits, retirement: checked as boolean}
                  })}
                />
                <Label htmlFor="retirement">401(k) Plan (3% company match)</Label>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4">
          <div>
            <Label htmlFor="emergencyName">Emergency Contact Name *</Label>
            <Input
              id="emergencyName"
              value={formData.emergencyContact.name}
              onChange={(e) => setFormData({
                ...formData,
                emergencyContact: {...formData.emergencyContact, name: e.target.value}
              })}
              required
            />
          </div>
          <div>
            <Label htmlFor="relationship">Relationship *</Label>
            <Input
              id="relationship"
              value={formData.emergencyContact.relationship}
              onChange={(e) => setFormData({
                ...formData,
                emergencyContact: {...formData.emergencyContact, relationship: e.target.value}
              })}
              placeholder="Spouse, Parent, Sibling, etc."
              required
            />
          </div>
          <div>
            <Label htmlFor="emergencyPhone">Emergency Contact Phone *</Label>
            <Input
              id="emergencyPhone"
              value={formData.emergencyContact.phone}
              onChange={(e) => setFormData({
                ...formData,
                emergencyContact: {...formData.emergencyContact, phone: e.target.value}
              })}
              required
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="submit">Add Employee</Button>
      </div>
    </form>
  );
}

// Run Payroll Form Component
function RunPayrollForm({ onSubmit }: any) {
  const [payrollData, setPayrollData] = useState({
    payPeriodStart: '',
    payPeriodEnd: '',
    payDate: '',
    payrollType: 'regular',
    includeBonuses: false,
    includeCommissions: false,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(payrollData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="payPeriodStart">Pay Period Start *</Label>
          <Input
            id="payPeriodStart"
            type="date"
            value={payrollData.payPeriodStart}
            onChange={(e) => setPayrollData({...payrollData, payPeriodStart: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="payPeriodEnd">Pay Period End *</Label>
          <Input
            id="payPeriodEnd"
            type="date"
            value={payrollData.payPeriodEnd}
            onChange={(e) => setPayrollData({...payrollData, payPeriodEnd: e.target.value})}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="payDate">Pay Date *</Label>
        <Input
          id="payDate"
          type="date"
          value={payrollData.payDate}
          onChange={(e) => setPayrollData({...payrollData, payDate: e.target.value})}
          required
        />
      </div>

      <div>
        <Label htmlFor="payrollType">Payroll Type</Label>
        <Select
          value={payrollData.payrollType}
          onValueChange={(value) => setPayrollData({...payrollData, payrollType: value})}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="regular">Regular Payroll</SelectItem>
            <SelectItem value="bonus">Bonus Payroll</SelectItem>
            <SelectItem value="correction">Correction Payroll</SelectItem>
            <SelectItem value="final">Final Payroll</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="includeBonuses"
            checked={payrollData.includeBonuses}
            onCheckedChange={(checked) => setPayrollData({...payrollData, includeBonuses: checked as boolean})}
          />
          <Label htmlFor="includeBonuses">Include pending bonuses</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="includeCommissions"
            checked={payrollData.includeCommissions}
            onCheckedChange={(checked) => setPayrollData({...payrollData, includeCommissions: checked as boolean})}
          />
          <Label htmlFor="includeCommissions">Include pending commissions</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          value={payrollData.notes}
          onChange={(e) => setPayrollData({...payrollData, notes: e.target.value})}
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          <PlayCircle className="w-4 h-4 mr-2" />
          Process Payroll
        </Button>
      </div>
    </form>
  );
}

// Payroll Tab Component
function PayrollTab({ payrollRuns, loading, onRunPayroll }: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Payroll History</h3>
        <Button onClick={onRunPayroll} className="bg-green-600 hover:bg-green-700">
          <PlayCircle className="w-4 h-4 mr-2" />
          Run New Payroll
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pay Period</TableHead>
                  <TableHead>Pay Date</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Gross Pay</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollRuns?.map((run: any) => (
                  <TableRow key={run.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{run.payPeriodStart} - {run.payPeriodEnd}</p>
                        <p className="text-sm text-gray-600">{run.payrollType}</p>
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(run.payDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{run.employeeCount}</TableCell>
                    <TableCell>${run.grossPay?.toLocaleString()}</TableCell>
                    <TableCell>${run.netPay?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={
                        run.status === 'completed' ? 'default' :
                        run.status === 'processing' ? 'secondary' :
                        run.status === 'failed' ? 'destructive' : 'outline'
                      }>
                        {run.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                        {run.status === 'failed' && (
                          <Button size="sm" variant="outline">
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Benefits Tab Component
function BenefitsTab({ benefits, loading, onEnrollEmployee }: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Benefits Administration</h3>
        <Button onClick={onEnrollEmployee}>
          <Plus className="w-4 h-4 mr-2" />
          Enroll Employee
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Medical Insurance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-500" />
              Medical Insurance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Enrolled:</span>
                <span className="font-semibold">{benefits?.medical?.enrolled || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Cost:</span>
                <span className="font-semibold">${benefits?.medical?.monthlyCost || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Coverage:</span>
                <span className="text-sm">{benefits?.medical?.coverage || 'Individual & Family'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dental Insurance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-blue-500" />
              Dental Insurance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Enrolled:</span>
                <span className="font-semibold">{benefits?.dental?.enrolled || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Cost:</span>
                <span className="font-semibold">${benefits?.dental?.monthlyCost || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Coverage:</span>
                <span className="text-sm">{benefits?.dental?.coverage || 'Basic & Major'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 401(k) Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-green-500" />
              401(k) Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Enrolled:</span>
                <span className="font-semibold">{benefits?.retirement?.enrolled || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Company Match:</span>
                <span className="font-semibold">{benefits?.retirement?.match || '3%'}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Contribution:</span>
                <span className="font-semibold">{benefits?.retirement?.avgContribution || '5%'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Benefits Enrollment Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Benefits Enrollment</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Medical</TableHead>
                  <TableHead>Dental</TableHead>
                  <TableHead>Vision</TableHead>
                  <TableHead>401(k)</TableHead>
                  <TableHead>Monthly Cost</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {benefits?.enrollments?.map((enrollment: any) => (
                  <TableRow key={enrollment.employeeId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{enrollment.employeeName}</p>
                        <p className="text-sm text-gray-600">{enrollment.department}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {enrollment.medical ? (
                        <Badge variant="default">Enrolled</Badge>
                      ) : (
                        <Badge variant="outline">Not Enrolled</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {enrollment.dental ? (
                        <Badge variant="default">Enrolled</Badge>
                      ) : (
                        <Badge variant="outline">Not Enrolled</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {enrollment.vision ? (
                        <Badge variant="default">Enrolled</Badge>
                      ) : (
                        <Badge variant="outline">Not Enrolled</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {enrollment.retirement ? (
                        <Badge variant="default">{enrollment.retirementPercent}%</Badge>
                      ) : (
                        <Badge variant="outline">Not Enrolled</Badge>
                      )}
                    </TableCell>
                    <TableCell>${enrollment.monthlyCost}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Benefits Enrollment Form Component
function BenefitsEnrollmentForm({ onSubmit }: any) {
  const [enrollmentData, setEnrollmentData] = useState({
    employeeId: '',
    medical: false,
    medicalPlan: '',
    dental: false,
    dentalPlan: '',
    vision: false,
    visionPlan: '',
    retirement: false,
    retirementPercent: '',
    dependents: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(enrollmentData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="employeeSelect">Select Employee *</Label>
        <Select
          value={enrollmentData.employeeId}
          onValueChange={(value) => setEnrollmentData({...enrollmentData, employeeId: value})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose employee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="emp1">John Smith - Operations</SelectItem>
            <SelectItem value="emp2">Jane Doe - Dispatch</SelectItem>
            <SelectItem value="emp3">Mike Johnson - Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        {/* Medical Insurance */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="medical"
              checked={enrollmentData.medical}
              onCheckedChange={(checked) => setEnrollmentData({...enrollmentData, medical: checked as boolean})}
            />
            <Label htmlFor="medical" className="text-base font-medium">Medical Insurance</Label>
          </div>
          {enrollmentData.medical && (
            <div className="ml-6">
              <Label htmlFor="medicalPlan">Select Plan</Label>
              <Select
                value={enrollmentData.medicalPlan}
                onValueChange={(value) => setEnrollmentData({...enrollmentData, medicalPlan: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose medical plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic Plan - Contact for pricing</SelectItem>
                  <SelectItem value="standard">Standard Plan - Contact for pricing</SelectItem>
                  <SelectItem value="premium">Premium Plan - Contact for pricing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Dental Insurance */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="dental"
              checked={enrollmentData.dental}
              onCheckedChange={(checked) => setEnrollmentData({...enrollmentData, dental: checked as boolean})}
            />
            <Label htmlFor="dental" className="text-base font-medium">Dental Insurance</Label>
          </div>
          {enrollmentData.dental && (
            <div className="ml-6">
              <Label htmlFor="dentalPlan">Select Plan</Label>
              <Select
                value={enrollmentData.dentalPlan}
                onValueChange={(value) => setEnrollmentData({...enrollmentData, dentalPlan: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose dental plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic Dental - $50/month</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive Dental - $75/month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Vision Insurance */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="vision"
              checked={enrollmentData.vision}
              onCheckedChange={(checked) => setEnrollmentData({...enrollmentData, vision: checked as boolean})}
            />
            <Label htmlFor="vision" className="text-base font-medium">Vision Insurance</Label>
          </div>
          {enrollmentData.vision && (
            <div className="ml-6">
              <Label htmlFor="visionPlan">Select Plan</Label>
              <Select
                value={enrollmentData.visionPlan}
                onValueChange={(value) => setEnrollmentData({...enrollmentData, visionPlan: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose vision plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic Vision - $25/month</SelectItem>
                  <SelectItem value="enhanced">Enhanced Vision - $40/month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* 401(k) Plan */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="retirement"
              checked={enrollmentData.retirement}
              onCheckedChange={(checked) => setEnrollmentData({...enrollmentData, retirement: checked as boolean})}
            />
            <Label htmlFor="retirement" className="text-base font-medium">401(k) Retirement Plan</Label>
          </div>
          {enrollmentData.retirement && (
            <div className="ml-6">
              <Label htmlFor="retirementPercent">Contribution Percentage</Label>
              <Input
                id="retirementPercent"
                type="number"
                min="1"
                max="25"
                value={enrollmentData.retirementPercent}
                onChange={(e) => setEnrollmentData({...enrollmentData, retirementPercent: e.target.value})}
                placeholder="5"
              />
              <p className="text-sm text-gray-600 mt-1">Company matches up to 3%</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="submit">Enroll in Benefits</Button>
      </div>
    </form>
  );
}

// Time Tracking Tab Component
function TimeTrackingTab({ timeTracking, loading, onClockAction }: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Time & Attendance</h3>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Timesheets
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import Time Data
          </Button>
        </div>
      </div>

      {/* Today's Time Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Today's Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Break Time</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeTracking?.todayActivity?.map((entry: any) => (
                  <TableRow key={entry.employeeId}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                          {entry.employeeName?.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <span className="font-medium">{entry.employeeName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{entry.clockIn || '-'}</TableCell>
                    <TableCell>{entry.clockOut || '-'}</TableCell>
                    <TableCell>{entry.breakTime || '0:00'}</TableCell>
                    <TableCell className="font-medium">{entry.totalHours || '0:00'}</TableCell>
                    <TableCell>
                      <Badge variant={
                        entry.status === 'clocked-in' ? 'default' :
                        entry.status === 'on-break' ? 'secondary' :
                        entry.status === 'clocked-out' ? 'outline' : 'destructive'
                      }>
                        {entry.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {entry.status === 'clocked-out' && (
                          <Button 
                            size="sm" 
                            onClick={() => onClockAction({ employeeId: entry.employeeId, action: 'in' })}
                          >
                            <PlayCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {entry.status === 'clocked-in' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onClockAction({ employeeId: entry.employeeId, action: 'out' })}
                          >
                            <StopCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Time Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Hours:</span>
                <span className="font-bold">{timeTracking?.weekSummary?.totalHours || '0:00'}</span>
              </div>
              <div className="flex justify-between">
                <span>Regular Hours:</span>
                <span>{timeTracking?.weekSummary?.regularHours || '0:00'}</span>
              </div>
              <div className="flex justify-between">
                <span>Overtime Hours:</span>
                <span className="text-orange-600 font-medium">{timeTracking?.weekSummary?.overtimeHours || '0:00'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Hours:</span>
                <span className="font-bold">{timeTracking?.monthSummary?.totalHours || '0:00'}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Daily Hours:</span>
                <span>{timeTracking?.monthSummary?.avgDailyHours || '0:00'}</span>
              </div>
              <div className="flex justify-between">
                <span>Attendance Rate:</span>
                <span className="text-green-600 font-medium">{timeTracking?.monthSummary?.attendanceRate || '0'}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {timeTracking?.alerts?.map((alert: any, index: number) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-yellow-50 rounded">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm">{alert.message}</span>
                </div>
              ))}
              {!timeTracking?.alerts?.length && (
                <div className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">No issues detected</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Compliance Tab Component
function ComplianceTab({ compliance, loading }: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">HR Compliance & Legal</h3>
        <Button variant="outline">
          <FileText className="w-4 h-4 mr-2" />
          Generate Compliance Report
        </Button>
      </div>

      {/* Compliance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Overall Compliance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            <div className="text-4xl font-bold text-green-600">
              {compliance?.overallScore || 0}%
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full" 
                  style={{ width: `${compliance?.overallScore || 0}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {compliance?.issuesCount || 0} issues need attention
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              I-9 Forms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Complete:</span>
                <span className="font-semibold text-green-600">
                  {compliance?.i9Forms?.complete || 0}/{compliance?.i9Forms?.total || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Pending:</span>
                <span className="font-semibold text-orange-600">
                  {compliance?.i9Forms?.pending || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Expired:</span>
                <span className="font-semibold text-red-600">
                  {compliance?.i9Forms?.expired || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Tax Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>W-4 Forms:</span>
                <span className="font-semibold text-green-600">
                  {compliance?.taxCompliance?.w4Complete || 0}/{compliance?.taxCompliance?.w4Total || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>State Tax Setup:</span>
                <span className="font-semibold text-green-600">
                  {compliance?.taxCompliance?.stateSetup || 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax Deposits:</span>
                <span className="font-semibold text-green-600">Current</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Labor Law
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Wage & Hour:</span>
                <span className="font-semibold text-green-600">Compliant</span>
              </div>
              <div className="flex justify-between">
                <span>Safety Training:</span>
                <span className="font-semibold text-green-600">
                  {compliance?.laborLaw?.safetyTraining || 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Policy Updates:</span>
                <span className="font-semibold text-yellow-600">
                  {compliance?.laborLaw?.policyUpdates || 0} pending
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Active Compliance Issues</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {compliance?.issues?.map((issue: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      issue.priority === 'high' ? 'bg-red-500' :
                      issue.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium">{issue.title}</p>
                      <p className="text-sm text-gray-600">{issue.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">{issue.dueDate}</span>
                    <Button size="sm">Resolve</Button>
                  </div>
                </div>
              ))}
              {!compliance?.issues?.length && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p>No compliance issues detected</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Reports Tab Component
function ReportsTab({ taxForms, loading }: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Payroll Reports & Tax Forms</h3>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button variant="outline" className="h-20 flex-col">
          <FileText className="w-6 h-6 mb-2" />
          <span>Payroll Summary</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col">
          <Calculator className="w-6 h-6 mb-2" />
          <span>Tax Liability</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col">
          <Download className="w-6 h-6 mb-2" />
          <span>Year End Forms</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col">
          <PieChart className="w-6 h-6 mb-2" />
          <span>Analytics</span>
        </Button>
      </div>

      {/* Tax Forms */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Forms & Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Form Type</TableHead>
                  <TableHead>Tax Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxForms?.map((form: any) => (
                  <TableRow key={form.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{form.formType}</p>
                        <p className="text-sm text-gray-600">{form.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>{form.taxYear}</TableCell>
                    <TableCell>
                      <Badge variant={
                        form.status === 'completed' ? 'default' :
                        form.status === 'pending' ? 'secondary' :
                        form.status === 'overdue' ? 'destructive' : 'outline'
                      }>
                        {form.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{form.dueDate}</TableCell>
                    <TableCell>{form.generatedDate || '-'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Send className="w-4 h-4" />
                        </Button>
                        {form.status === 'pending' && (
                          <Button size="sm">Generate</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Report History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {taxForms?.recentReports?.map((report: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-gray-600">Generated {report.date}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Contractors Tab Component
function ContractorsTab({ contractors, loading }: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Independent Contractors</h3>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Add Contractor
        </Button>
      </div>

      {/* Contractor Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contractors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contractors?.active || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{contractors?.newThisMonth || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${contractors?.totalPayments?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              This year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">1099 Forms</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contractors?.form1099Count || 0}</div>
            <p className="text-xs text-muted-foreground">
              To be generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contractors?.complianceRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              W-9 forms completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contractor List */}
      <Card>
        <CardHeader>
          <CardTitle>Contractor Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contractor</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>YTD Payments</TableHead>
                  <TableHead>W-9 Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contractors?.list?.map((contractor: any) => (
                  <TableRow key={contractor.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{contractor.name}</p>
                        <p className="text-sm text-gray-600">{contractor.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{contractor.services}</TableCell>
                    <TableCell>{format(new Date(contractor.startDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>${contractor.ytdPayments?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={contractor.w9Status === 'completed' ? 'default' : 'secondary'}>
                        {contractor.w9Status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}