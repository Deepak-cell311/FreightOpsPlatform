import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign, 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  Play,
  Download,
  CheckCircle,
  AlertCircle,
  Calculator,
  CreditCard,
  TrendingUp,
  PauseCircle
} from "lucide-react";

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

export default function Payroll() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showRunPayroll, setShowRunPayroll] = useState(false);
  const [selectedTimeEntries, setSelectedTimeEntries] = useState<string[]>([]);

  // Fetch payroll overview
  const { data: payrollMetrics, isLoading: metricsLoading } = useQuery<PayrollMetrics>({
    queryKey: ['/api/gusto/payroll/overview'],
    queryFn: async () => {
      const response = await fetch('/api/gusto/payroll/overview', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch payroll metrics');
      return response.json();
    }
  });

  // Fetch payroll runs
  const { data: payrollRuns, isLoading: runsLoading } = useQuery<PayrollRun[]>({
    queryKey: ['/api/payroll/runs'],
    queryFn: async () => {
      const response = await fetch('/api/payroll/runs', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch payroll runs');
      const data = await response.json();
      return data.payrollRuns || [];
    }
  });

  // Fetch upcoming payroll
  const { data: upcomingPayroll } = useQuery({
    queryKey: ['/api/gusto/payroll/upcoming'],
    queryFn: async () => {
      const response = await fetch('/api/gusto/payroll/upcoming', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch upcoming payroll');
      return response.json();
    }
  });

  // Fetch time entries for approval
  const { data: timeEntries, isLoading: timeEntriesLoading } = useQuery<TimeEntry[]>({
    queryKey: ['/api/time-entries/pending'],
    queryFn: async () => {
      const response = await fetch('/api/time-entries/pending', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch time entries');
      const data = await response.json();
      return data.timeEntries || [];
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'processing':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Processing</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'paid':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Paid</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleRunPayroll = async () => {
    try {
      const response = await fetch('/api/payroll/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          payPeriodStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          payPeriodEnd: new Date().toISOString().split('T')[0],
          checkDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
      });
      
      if (response.ok) {
        setShowRunPayroll(false);
        // Refresh data
      }
    } catch (error) {
      console.error('Error running payroll:', error);
    }
  };

  const handleApproveTimeEntries = async () => {
    try {
      const response = await fetch('/api/time-entries/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ entryIds: selectedTimeEntries })
      });
      
      if (response.ok) {
        setSelectedTimeEntries([]);
        // Refresh time entries
      }
    } catch (error) {
      console.error('Error approving time entries:', error);
    }
  };

  if (metricsLoading || runsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-600">Process and manage employee payroll</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Reports
          </Button>
          <Dialog open={showRunPayroll} onOpenChange={setShowRunPayroll}>
            <DialogTrigger asChild>
              <Button>
                <Play className="w-4 h-4 mr-2" />
                Run Payroll
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Run Payroll</DialogTitle>
                <DialogDescription>
                  Process payroll for the current pay period
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Pay Period Start</Label>
                    <Input type="date" defaultValue={new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} />
                  </div>
                  <div>
                    <Label>Pay Period End</Label>
                    <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>
                <div>
                  <Label>Check Date</Label>
                  <Input type="date" defaultValue={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowRunPayroll(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleRunPayroll}>
                    <Play className="w-4 h-4 mr-2" />
                    Run Payroll
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="runs">Payroll Runs</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Current Payroll Status */}
          <Card>
            <CardHeader>
              <CardTitle>Current Payroll Status</CardTitle>
              <CardDescription>
                {upcomingPayroll?.payPeriod || 'No upcoming payroll'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {payrollMetrics?.status || 'Ready'}
                  </div>
                  <p className="text-sm text-gray-500">Status</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {payrollMetrics?.employeesProcessed || 0}
                  </div>
                  <p className="text-sm text-gray-500">Employees</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    ${(payrollMetrics?.totalGross || 0).toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-500">Gross Pay</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {upcomingPayroll?.payDate || 'TBD'}
                  </div>
                  <p className="text-sm text-gray-500">Pay Date</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Net Pay</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(payrollMetrics?.totalNet || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Current period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tax Withholdings</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(payrollMetrics?.totalTaxes || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Federal + State + Local</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Direct Deposits</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{payrollMetrics?.directDeposits || 0}</div>
                <p className="text-xs text-muted-foreground">Electronic payments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paper Checks</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{payrollMetrics?.checks || 0}</div>
                <p className="text-xs text-muted-foreground">Physical checks</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => setShowRunPayroll(true)}>
                  <Play className="w-4 h-4 mr-2" />
                  Run Payroll
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="w-4 h-4 mr-2" />
                  Approve Time Entries
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Pay Stubs
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Download Tax Reports
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium">Payroll processing due</p>
                    <p className="text-gray-500">Due in 2 days</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium">Time entries pending approval</p>
                    <p className="text-gray-500">{timeEntries?.length || 0} entries</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-green-500" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium">Quarterly tax filing</p>
                    <p className="text-gray-500">Due next month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="runs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Runs</CardTitle>
              <CardDescription>View and manage payroll processing history</CardDescription>
            </CardHeader>
            <CardContent>
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
                  {payrollRuns?.map((run) => (
                    <TableRow key={run.id}>
                      <TableCell>{run.payPeriod}</TableCell>
                      <TableCell>{new Date(run.payDate).toLocaleDateString()}</TableCell>
                      <TableCell>{run.employeeCount}</TableCell>
                      <TableCell>${run.totalGross.toLocaleString()}</TableCell>
                      <TableCell>${run.totalNet.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(run.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Time Entry Approval</CardTitle>
                  <CardDescription>Review and approve employee time entries</CardDescription>
                </div>
                {selectedTimeEntries.length > 0 && (
                  <Button onClick={handleApproveTimeEntries}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Selected ({selectedTimeEntries.length})
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {timeEntriesLoading ? (
                <div className="text-center py-8">Loading time entries...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input 
                          type="checkbox" 
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTimeEntries(timeEntries?.map(entry => entry.id) || []);
                            } else {
                              setSelectedTimeEntries([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeEntries?.map((entry) => (
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
                          />
                        </TableCell>
                        <TableCell>{entry.employeeName}</TableCell>
                        <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(entry.clockIn).toLocaleTimeString()}</TableCell>
                        <TableCell>{entry.clockOut ? new Date(entry.clockOut).toLocaleTimeString() : 'Still clocked in'}</TableCell>
                        <TableCell>{entry.totalHours.toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(entry.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <PauseCircle className="w-4 h-4 text-red-600" />
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
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Reports</CardTitle>
              <CardDescription>Generate and download payroll reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Standard Reports</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      Payroll Summary Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Calculator className="w-4 h-4 mr-2" />
                      Tax Liability Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Employee Earnings Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Clock className="w-4 h-4 mr-2" />
                      Time and Attendance Report
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Compliance Reports</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      941 Quarterly Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      W-2 Annual Statements
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      State Tax Reports
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      Workers' Compensation
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Settings</CardTitle>
              <CardDescription>Configure payroll processing preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label>Default Pay Schedule</Label>
                  <Select defaultValue="biweekly">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="semimonthly">Semi-monthly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Overtime Threshold (hours per week)</Label>
                  <Input type="number" defaultValue="40" />
                </div>
                <div>
                  <Label>Overtime Rate Multiplier</Label>
                  <Input type="number" step="0.1" defaultValue="1.5" />
                </div>
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}