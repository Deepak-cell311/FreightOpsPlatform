import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Users, 
  UserPlus, 
  FileText, 
  Calendar, 
  DollarSign, 
  Clock, 
  Award,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Play,
  User,
  Building
} from 'lucide-react';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hireDate: string;
  status: 'active' | 'inactive' | 'onboarding';
  salary: number;
  manager: string;
}

interface HRMetrics {
  totalEmployees: number;
  newHires: number;
  pendingTasks: number;
  benefitsEnrolled: number;
  onboardingInProgress: number;
  documentsNeeded: number;
  complianceScore: number;
  upcomingReviews: number;
}

interface PayrollMetrics {
  currentPeriod: string;
  status: string;
  dueDate: string;
  employeesProcessed: number;
  totalGross: number;
  totalNet: number;
  totalTaxes: number;
  directDeposits: number;
  checks: number;
}

interface PayrollRun {
  id: string;
  payPeriod: string;
  payDate: string;
  status: 'draft' | 'processing' | 'approved' | 'paid';
  employeeCount: number;
  totalGross: number;
  totalNet: number;
}

interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  clockIn: string;
  clockOut: string;
  totalHours: number;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export default function HRUnified() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [selectedTimeEntries, setSelectedTimeEntries] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Fetch HR overview metrics
  const { data: hrMetrics, isLoading: hrLoading } = useQuery<HRMetrics>({
    queryKey: ['/api/hr/overview'],
    enabled: true
  });

  // Fetch Gusto connection status
  const { data: gustoStatus, isLoading: gustoLoading } = useQuery<{ connected: boolean; gustoCompanyId?: string }>({
    queryKey: ['/api/gusto/status'],
    enabled: true
  });

  // Connect to Gusto mutation
  const connectGustoMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/gusto/connect');
      if (!response.ok) throw new Error('Failed to get Gusto auth URL');
      const data = await response.json();
      window.location.href = data.authUrl;
    }
  });

  // Fetch employees
  const { data: employeesData, isLoading: employeesLoading } = useQuery<{ employees: Employee[] }>({
    queryKey: ['/api/employees'],
    enabled: true
  });

  // Fetch payroll overview
  const { data: payrollMetrics, isLoading: payrollLoading } = useQuery<PayrollMetrics>({
    queryKey: ['/api/payroll/dashboard'],
    enabled: true
  });

  // Fetch payroll runs
  const { data: payrollRunsData, isLoading: payrollRunsLoading } = useQuery<{ payrollRuns: PayrollRun[] }>({
    queryKey: ['/api/payroll/runs'],
    enabled: true
  });

  // Fetch pending time entries
  const { data: timeEntriesData, isLoading: timeEntriesLoading } = useQuery<{ timeEntries: TimeEntry[] }>({
    queryKey: ['/api/time-entries/pending'],
    enabled: true
  });

  // Add employee mutation
  const addEmployeeMutation = useMutation({
    mutationFn: async (employeeData: FormData) => {
      const response = await fetch('/api/employees', {
        method: 'POST',
        body: employeeData
      });
      if (!response.ok) throw new Error('Failed to add employee');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hr/overview'] });
      setShowAddEmployee(false);
    }
  });

  // Approve time entries mutation
  const approveTimeEntriesMutation = useMutation({
    mutationFn: async (entryIds: string[]) => {
      const response = await fetch('/api/time-entries/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryIds })
      });
      if (!response.ok) throw new Error('Failed to approve time entries');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/time-entries/pending'] });
      setSelectedTimeEntries([]);
    }
  });

  const handleAddEmployee = async (formData: FormData) => {
    addEmployeeMutation.mutate(formData);
  };

  const handleApproveTimeEntries = () => {
    if (selectedTimeEntries.length > 0) {
      approveTimeEntriesMutation.mutate(selectedTimeEntries);
    }
  };

  const employees = employeesData?.employees || [];
  const payrollRuns = payrollRunsData?.payrollRuns || [];
  const timeEntries = timeEntriesData?.timeEntries || [];

  if (hrLoading || employeesLoading || payrollLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Human Resources</h1>
        <Button onClick={() => setShowAddEmployee(true)} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hrMetrics?.totalEmployees || employees.length}</div>
                <p className="text-xs text-muted-foreground">
                  +{hrMetrics?.newHires || 0} new this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hrMetrics?.pendingTasks || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {hrMetrics?.documentsNeeded || 0} documents needed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Benefits Enrolled</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hrMetrics?.benefitsEnrolled || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {hrMetrics?.onboardingInProgress || 0} onboarding
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hrMetrics?.complianceScore || 100}%</div>
                <p className="text-xs text-muted-foreground">
                  {hrMetrics?.upcomingReviews || 0} reviews due
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gusto Integration</CardTitle>
              </CardHeader>
              <CardContent>
                {gustoStatus?.connected ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium">Connected to Gusto</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Company ID: {gustoStatus.gustoCompanyId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Automatic payroll sync enabled
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-orange-500" />
                      <span className="text-sm font-medium">Connect Gusto Payroll</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Connect your Gusto account for automatic payroll sync
                    </p>
                    <Button 
                      onClick={() => connectGustoMutation.mutate()}
                      disabled={connectGustoMutation.isPending}
                      className="w-full"
                    >
                      {connectGustoMutation.isPending ? 'Connecting...' : 'Connect Gusto'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">New employee onboarded</span>
                    <span className="text-xs text-muted-foreground ml-auto">2 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Payroll run completed</span>
                    <span className="text-xs text-muted-foreground ml-auto">1 day ago</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Benefits enrollment reminder sent</span>
                    <span className="text-xs text-muted-foreground ml-auto">3 days ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Quarterly tax filing</span>
                    <Badge variant="outline">Jan 31</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Benefits open enrollment</span>
                    <Badge variant="outline">Nov 15</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Performance reviews</span>
                    <Badge variant="outline">Dec 15</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Directory</CardTitle>
              <CardDescription>
                Manage your team members and their information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hire Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">
                        {employee.firstName} {employee.lastName}
                      </TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>
                        <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                          {employee.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{employee.hireDate || 'N/A'}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {employees.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No employees found. Add your first employee to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Period</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{payrollMetrics?.currentPeriod || 'N/A'}</div>
                <p className="text-xs text-muted-foreground">
                  Status: {payrollMetrics?.status || 'Not started'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gross</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  ${payrollMetrics?.totalGross?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Net: ${payrollMetrics?.totalNet?.toLocaleString() || '0'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{payrollMetrics?.employeesProcessed || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {payrollMetrics?.directDeposits || 0} direct deposits
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payroll Runs</CardTitle>
              <CardDescription>
                View and manage payroll processing history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pay Period</TableHead>
                    <TableHead>Pay Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Gross Pay</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollRuns.map((run) => (
                    <TableRow key={run.id}>
                      <TableCell className="font-medium">{run.payPeriod}</TableCell>
                      <TableCell>{run.payDate}</TableCell>
                      <TableCell>
                        <Badge variant={run.status === 'paid' ? 'default' : 'secondary'}>
                          {run.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{run.employeeCount}</TableCell>
                      <TableCell>${run.totalGross?.toLocaleString()}</TableCell>
                      <TableCell>${run.totalNet?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {payrollRuns.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No payroll runs found. Create your first payroll run to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Time Entries</CardTitle>
              <CardDescription>
                Review and approve employee time entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {timeEntries.length > 0 && (
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-muted-foreground">
                    {selectedTimeEntries.length} of {timeEntries.length} selected
                  </div>
                  <Button 
                    onClick={handleApproveTimeEntries}
                    disabled={selectedTimeEntries.length === 0 || approveTimeEntriesMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve Selected
                  </Button>
                </div>
              )}
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Select</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedTimeEntries.includes(entry.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTimeEntries([...selectedTimeEntries, entry.id]);
                            } else {
                              setSelectedTimeEntries(selectedTimeEntries.filter(id => id !== entry.id));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{entry.employeeName}</TableCell>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{new Date(entry.clockIn).toLocaleTimeString()}</TableCell>
                      <TableCell>{new Date(entry.clockOut).toLocaleTimeString()}</TableCell>
                      <TableCell>{entry.totalHours}h</TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {timeEntries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No pending time entries found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Benefits Administration</CardTitle>
              <CardDescription>
                Manage employee benefits and enrollment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Available Plans</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Health Insurance</div>
                        <div className="text-sm text-muted-foreground">Premium Health Plan</div>
                      </div>
                      <Badge>16 enrolled</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Dental Coverage</div>
                        <div className="text-sm text-muted-foreground">Basic Dental Plan</div>
                      </div>
                      <Badge>14 enrolled</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Vision Coverage</div>
                        <div className="text-sm text-muted-foreground">Vision Plus Plan</div>
                      </div>
                      <Badge>12 enrolled</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">401(k) Retirement</div>
                        <div className="text-sm text-muted-foreground">4% company match</div>
                      </div>
                      <Badge>20 enrolled</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Enrollment Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Eligible Employees</span>
                      <span className="font-medium">25</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Enrolled in Benefits</span>
                      <span className="font-medium">18</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pending Enrollment</span>
                      <span className="font-medium">1</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Enrollment Rate</span>
                      <span className="font-medium">72%</span>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <h4 className="font-medium mb-2">Upcoming Deadlines</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Open Enrollment Period</span>
                        <Badge variant="outline">Nov 1-30</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>HSA Contribution Deadline</span>
                        <Badge variant="outline">Dec 31</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Employee Dialog */}
      <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Enter the employee's information to add them to the system.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleAddEmployee(formData);
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input id="position" name="position" defaultValue="Driver" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" name="department" defaultValue="Operations" />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowAddEmployee(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addEmployeeMutation.isPending}>
                {addEmployeeMutation.isPending ? 'Adding...' : 'Add Employee'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}