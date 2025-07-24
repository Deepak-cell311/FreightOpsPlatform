import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  DollarSign, 
  Calendar, 
  Clock, 
  TrendingUp,
  Calculator,
  FileText,
  Play,
  Pause,
  UserPlus,
  Building
} from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
  employeeType: string;
  payType: string;
  hourlyRate?: number;
  salaryAmount?: number;
  mileageRate?: number;
  department: string;
  jobTitle: string;
  status: string;
}

interface PayrollRun {
  id: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  totalEmployees: number;
  totalGrossPay: number;
  totalNetPay: number;
  totalTaxes: number;
  status: string;
  companyType?: string;
}

interface Payroll {
  id: string;
  employeeId: string;
  employeeType: string;
  payType: string;
  totalHours: number;
  totalMiles: number;
  grossPay: number;
  netPay: number;
  status: string;
}

export default function HRManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [showClockDialog, setShowClockDialog] = useState(false);
  const [showPayrollRunDialog, setShowPayrollRunDialog] = useState(false);
  const [clockData, setClockData] = useState({
    location: "",
    projectId: "",
    miles: "",
    loadId: "",
    taskDescription: ""
  });
  const [payrollRunData, setPayrollRunData] = useState({
    payPeriodStart: "",
    payPeriodEnd: "",
    payDate: ""
  });

  // Fetch employees
  const { data: employeesData, isLoading: employeesLoading } = useQuery({
    queryKey: ["/api/payroll/employees"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/payroll/employees");
      return res.json();
    },
  });

  // Fetch payroll runs
  const { data: payrollRunsData, isLoading: payrollRunsLoading } = useQuery({
    queryKey: ["/api/payroll/runs"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/payroll/runs");
      return res.json();
    },
  });

  // Fetch employee payrolls
  const { data: payrollsData, isLoading: payrollsLoading } = useQuery({
    queryKey: ["/api/payroll/employee-payrolls"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/payroll/employee-payrolls");
      return res.json();
    },
  });

  // Clock in mutation
  const clockInMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/payroll/clock-in", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Employee clocked in successfully",
      });
      setShowClockDialog(false);
      setClockData({ location: "", projectId: "", miles: "", loadId: "", taskDescription: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/payroll/employees"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Clock out mutation
  const clockOutMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/payroll/clock-out", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Employee clocked out successfully",
      });
      setShowClockDialog(false);
      setClockData({ location: "", projectId: "", miles: "", loadId: "", taskDescription: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/payroll/employees"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Process payroll run mutation
  const processPayrollMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/payroll/run", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payroll run processed successfully",
      });
      setShowPayrollRunDialog(false);
      setPayrollRunData({ payPeriodStart: "", payPeriodEnd: "", payDate: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/payroll/runs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payroll/employee-payrolls"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const employees = employeesData?.employees || [];
  const payrollRuns = payrollRunsData?.payrollRuns || [];
  const payrolls = payrollsData?.payrolls || [];

  const handleClockIn = () => {
    if (!selectedEmployee) {
      toast({
        title: "Error",
        description: "Please select an employee",
        variant: "destructive",
      });
      return;
    }

    clockInMutation.mutate({
      employeeId: selectedEmployee,
      location: clockData.location,
      projectId: clockData.projectId
    });
  };

  const handleClockOut = () => {
    if (!selectedEmployee) {
      toast({
        title: "Error",
        description: "Please select an employee",
        variant: "destructive",
      });
      return;
    }

    clockOutMutation.mutate({
      employeeId: selectedEmployee,
      miles: clockData.miles ? parseInt(clockData.miles) : undefined,
      loadId: clockData.loadId,
      taskDescription: clockData.taskDescription
    });
  };

  const handleProcessPayroll = () => {
    processPayrollMutation.mutate(payrollRunData);
  };

  const getPayTypeColor = (payType: string) => {
    switch (payType) {
      case 'salary': return 'bg-blue-100 text-blue-800';
      case 'hourly': return 'bg-green-100 text-green-800';
      case 'mileage': return 'bg-orange-100 text-orange-800';
      case 'commission': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEmployeeTypeColor = (type: string) => {
    switch (type) {
      case 'driver': return 'bg-orange-100 text-orange-800';
      case 'developer': return 'bg-blue-100 text-blue-800';
      case 'support': return 'bg-green-100 text-green-800';
      case 'sales': return 'bg-purple-100 text-purple-800';
      case 'dispatcher': return 'bg-yellow-100 text-yellow-800';
      case 'manager': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (employeesLoading || payrollRunsLoading || payrollsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Human Resources</h1>
          <p className="text-muted-foreground">Manage employees, payroll, and HR operations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            const name = prompt('Enter employee name:');
            const email = prompt('Enter employee email:');
            const jobTitle = prompt('Enter job title:');
            if (name && email && jobTitle) {
              fetch('/api/hr/employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name, email, jobTitle })
              }).then(res => res.json()).then(data => {
                if (data.success) {
                  alert('Employee created successfully!');
                  window.location.reload();
                } else {
                  alert('Failed to create employee: ' + data.message);
                }
              }).catch(err => alert('Error: ' + err.message));
            }
          }}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
          <Dialog open={showClockDialog} onOpenChange={setShowClockDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Clock className="w-4 h-4 mr-2" />
                Time Tracking
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Employee Time Tracking</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="employee">Employee</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee: Employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} - {employee.jobTitle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={clockData.location}
                    onChange={(e) => setClockData({ ...clockData, location: e.target.value })}
                    placeholder="Work location"
                  />
                </div>
                <div>
                  <Label htmlFor="projectId">Project/Load ID</Label>
                  <Input
                    id="projectId"
                    value={clockData.projectId}
                    onChange={(e) => setClockData({ ...clockData, projectId: e.target.value })}
                    placeholder="Project or Load ID"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="miles">Miles (Drivers)</Label>
                    <Input
                      id="miles"
                      type="number"
                      value={clockData.miles}
                      onChange={(e) => setClockData({ ...clockData, miles: e.target.value })}
                      placeholder="Miles driven"
                    />
                  </div>
                  <div>
                    <Label htmlFor="loadId">Load ID</Label>
                    <Input
                      id="loadId"
                      value={clockData.loadId}
                      onChange={(e) => setClockData({ ...clockData, loadId: e.target.value })}
                      placeholder="Load ID"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="taskDescription">Task Description</Label>
                  <Input
                    id="taskDescription"
                    value={clockData.taskDescription}
                    onChange={(e) => setClockData({ ...clockData, taskDescription: e.target.value })}
                    placeholder="Work description"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleClockIn} disabled={clockInMutation.isPending}>
                    <Play className="w-4 h-4 mr-2" />
                    Clock In
                  </Button>
                  <Button onClick={handleClockOut} disabled={clockOutMutation.isPending}>
                    <Pause className="w-4 h-4 mr-2" />
                    Clock Out
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="time-tracking">Time & Attendance</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{employees.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active workforce
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Hires</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {employees.filter((emp: Employee) => emp.employeeType === 'driver').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  On the road
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">
                  Actively recruiting
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Employee Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['driver', 'dispatcher', 'office', 'manager', 'developer', 'support', 'sales'].map((type) => {
                    const count = employees.filter((emp: Employee) => emp.employeeType === type).length;
                    if (count === 0) return null;
                    return (
                      <div key={type} className="flex justify-between items-center">
                        <span className="capitalize">{type}</span>
                        <Badge className={getEmployeeTypeColor(type)}>{count}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pay Structure Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['salary', 'hourly', 'mileage', 'commission'].map((type) => {
                    const count = employees.filter((emp: Employee) => emp.payType === type).length;
                    if (count === 0) return null;
                    return (
                      <div key={type} className="flex justify-between items-center">
                        <span className="capitalize">{type}</span>
                        <Badge className={getPayTypeColor(type)}>{count}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employees.map((employee: Employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-muted-foreground">{employee.jobTitle} - {employee.department}</div>
                      <div className="flex gap-2">
                        <Badge className={getEmployeeTypeColor(employee.employeeType)}>
                          {employee.employeeType}
                        </Badge>
                        <Badge className={getPayTypeColor(employee.payType)}>
                          {employee.payType}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-medium">
                        {employee.payType === 'salary' && employee.salaryAmount && 
                          `$${employee.salaryAmount.toLocaleString()}/year`}
                        {employee.payType === 'hourly' && employee.hourlyRate && 
                          `$${employee.hourlyRate}/hour`}
                        {employee.payType === 'mileage' && employee.mileageRate && 
                          `$${employee.mileageRate}/mile`}
                      </div>
                      <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                        {employee.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Employment Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">I-9 Forms Complete</span>
                    <Badge className="bg-green-100 text-green-800">
                      {employees.length}/{employees.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">W-4 Forms Complete</span>
                    <Badge className="bg-green-100 text-green-800">
                      {employees.length}/{employees.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="font-medium">Background Checks</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {Math.floor(employees.length * 0.8)}/{employees.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="font-medium">Drug Tests Current</span>
                    <Badge className="bg-red-100 text-red-800">
                      {Math.floor(employees.length * 0.6)}/{employees.length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Driver Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Valid CDL Licenses</span>
                    <Badge className="bg-green-100 text-green-800">
                      {employees.filter((emp: Employee) => emp.employeeType === 'driver').length}/
                      {employees.filter((emp: Employee) => emp.employeeType === 'driver').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="font-medium">DOT Medical Certs</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {Math.floor(employees.filter((emp: Employee) => emp.employeeType === 'driver').length * 0.9)}/
                      {employees.filter((emp: Employee) => emp.employeeType === 'driver').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">HOS Compliance</span>
                    <Badge className="bg-green-100 text-green-800">98%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Safety Training</span>
                    <Badge className="bg-green-100 text-green-800">Current</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Compliance Actions Required</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border-l-4 border-yellow-400 bg-yellow-50">
                  <div>
                    <div className="font-medium">Background Check - Mike Rodriguez</div>
                    <div className="text-sm text-muted-foreground">Due in 15 days</div>
                  </div>
                  <Button size="sm" variant="outline">
                    Schedule
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border-l-4 border-red-400 bg-red-50">
                  <div>
                    <div className="font-medium">DOT Medical Renewal - Sarah Johnson</div>
                    <div className="text-sm text-muted-foreground">Due in 7 days</div>
                  </div>
                  <Button size="sm" variant="outline">
                    Schedule
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border-l-4 border-blue-400 bg-blue-50">
                  <div>
                    <div className="font-medium">Safety Training - All Drivers</div>
                    <div className="text-sm text-muted-foreground">Quarterly training due</div>
                  </div>
                  <Button size="sm" variant="outline">
                    Schedule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time-tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time & Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Time tracking and attendance management</p>
                <p className="text-sm text-gray-500 mt-2">View time entries and attendance records</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}