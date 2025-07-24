import { useState, useEffect } from "react";
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
  DollarSign, 
  Calendar, 
  Users, 
  Clock, 
  TrendingUp,
  Calculator,
  FileText,
  Play,
  Pause
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

export default function PayrollManagement() {
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
          <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
          <p className="text-muted-foreground">Manage employee payroll and time tracking</p>
        </div>
        <div className="flex gap-2">
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

          <Dialog open={showPayrollRunDialog} onOpenChange={setShowPayrollRunDialog}>
            <DialogTrigger asChild>
              <Button>
                <Calculator className="w-4 h-4 mr-2" />
                Process Payroll
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Process Payroll Run</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="payPeriodStart">Pay Period Start</Label>
                  <Input
                    id="payPeriodStart"
                    type="date"
                    value={payrollRunData.payPeriodStart}
                    onChange={(e) => setPayrollRunData({ ...payrollRunData, payPeriodStart: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="payPeriodEnd">Pay Period End</Label>
                  <Input
                    id="payPeriodEnd"
                    type="date"
                    value={payrollRunData.payPeriodEnd}
                    onChange={(e) => setPayrollRunData({ ...payrollRunData, payPeriodEnd: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="payDate">Pay Date</Label>
                  <Input
                    id="payDate"
                    type="date"
                    value={payrollRunData.payDate}
                    onChange={(e) => setPayrollRunData({ ...payrollRunData, payDate: e.target.value })}
                  />
                </div>
                <Button onClick={handleProcessPayroll} disabled={processPayrollMutation.isPending} className="w-full">
                  Process Payroll Run
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="payroll-runs">Payroll Runs</TabsTrigger>
          <TabsTrigger value="individual-payroll">Individual Payroll</TabsTrigger>
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
                <CardTitle className="text-sm font-medium">Last Payroll Run</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${payrollRuns[0]?.totalGrossPay?.toLocaleString() || "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Gross pay distributed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tax Withholding</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${payrollRuns[0]?.totalTaxes?.toLocaleString() || "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Taxes withheld
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Pay</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${payrollRuns[0]?.totalNetPay?.toLocaleString() || "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Take-home pay
                </p>
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

        <TabsContent value="payroll-runs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Runs History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payrollRuns.map((run: PayrollRun) => (
                  <div key={run.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">
                        {new Date(run.payPeriodStart).toLocaleDateString()} - {new Date(run.payPeriodEnd).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Pay Date: {new Date(run.payDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {run.totalEmployees} employees
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-medium">${run.totalGrossPay.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        Net: ${run.totalNetPay.toLocaleString()}
                      </div>
                      <Badge variant={run.status === 'completed' ? 'default' : 'secondary'}>
                        {run.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual-payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Individual Payroll Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payrolls.map((payroll: Payroll) => {
                  const employee = employees.find((emp: Employee) => emp.id === payroll.employeeId);
                  return (
                    <div key={payroll.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{employee?.name || 'Unknown Employee'}</div>
                        <div className="text-sm text-muted-foreground">
                          {payroll.payType} | {payroll.totalHours}h worked
                          {payroll.totalMiles > 0 && ` | ${payroll.totalMiles} miles`}
                        </div>
                        <Badge className={getPayTypeColor(payroll.payType)}>
                          {payroll.payType}
                        </Badge>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="font-medium">${payroll.grossPay.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          Net: ${payroll.netPay.toLocaleString()}
                        </div>
                        <Badge variant={payroll.status === 'paid' ? 'default' : 'secondary'}>
                          {payroll.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}