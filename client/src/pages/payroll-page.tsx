import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  DollarSign, Calendar, Users, Clock, FileText, Download, 
  CheckCircle, AlertTriangle, Play, Pause, Settings,
  TrendingUp, Calculator, Receipt, CreditCard, Plus
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const payrollRunSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  payDate: z.string().min(1, "Pay date is required"),
});

const timeAdjustmentSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  adjustmentType: z.enum(["overtime", "bonus", "deduction", "reimbursement"]),
  amount: z.number().min(0, "Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  payrollRunId: z.string().optional(),
});

export default function PayrollPage() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<string | null>(null);

  // Fetch current payroll runs
  const { data: payrollRuns, isLoading: payrollLoading } = useQuery({
    queryKey: ["/api/tenant/hr/gusto/payrolls"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/tenant/hr/gusto/payrolls");
      return res.json();
    },
  });

  // Fetch payroll summary
  const { data: payrollSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ["/api/tenant/payroll/summary"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/tenant/payroll/summary");
      return res.json();
    },
  });

  // Fetch employees for adjustments
  const { data: employees } = useQuery({
    queryKey: ["/api/tenant/hr/gusto/employees"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/tenant/hr/gusto/employees");
      return res.json();
    },
  });

  // Fetch time entries
  const { data: timeEntries } = useQuery({
    queryKey: ["/api/tenant/payroll/time-entries"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/tenant/payroll/time-entries");
      return res.json();
    },
  });

  // Create payroll run mutation
  const createPayrollMutation = useMutation({
    mutationFn: async (data: z.infer<typeof payrollRunSchema>) => {
      const res = await apiRequest("POST", "/api/tenant/hr/payroll-run", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payroll run created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/hr/gusto/payrolls"] });
      setShowCreateDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create payroll run",
        variant: "destructive",
      });
    },
  });

  // Submit payroll mutation
  const submitPayrollMutation = useMutation({
    mutationFn: async (payrollId: string) => {
      const res = await apiRequest("POST", `/api/tenant/hr/submit-payroll/${payrollId}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payroll submitted to Gusto successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/hr/gusto/payrolls"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit payroll",
        variant: "destructive",
      });
    },
  });

  // Add time adjustment mutation
  const addAdjustmentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof timeAdjustmentSchema>) => {
      const res = await apiRequest("POST", "/api/tenant/payroll/adjustment", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payroll adjustment added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/payroll/time-entries"] });
      setShowAdjustmentDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add payroll adjustment",
        variant: "destructive",
      });
    },
  });

  const payrollForm = useForm<z.infer<typeof payrollRunSchema>>({
    resolver: zodResolver(payrollRunSchema),
  });

  const adjustmentForm = useForm<z.infer<typeof timeAdjustmentSchema>>({
    resolver: zodResolver(timeAdjustmentSchema),
    defaultValues: {
      adjustmentType: "bonus",
      amount: 0,
    },
  });

  const onSubmitPayroll = (data: z.infer<typeof payrollRunSchema>) => {
    createPayrollMutation.mutate(data);
  };

  const onSubmitAdjustment = (data: z.infer<typeof timeAdjustmentSchema>) => {
    addAdjustmentMutation.mutate(data);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="outline">Open</Badge>;
      case "processed":
        return <Badge variant="default">Processed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculatePayrollTotals = (payroll: any) => {
    if (!payroll?.employee_compensations) return { gross: 0, net: 0, taxes: 0 };
    
    return payroll.employee_compensations.reduce((totals: any, comp: any) => ({
      gross: totals.gross + (parseFloat(comp.gross_pay) || 0),
      net: totals.net + (parseFloat(comp.net_pay) || 0),
      taxes: totals.taxes + (parseFloat(comp.taxes) || 0),
    }), { gross: 0, net: 0, taxes: 0 });
  };

  if (payrollLoading || summaryLoading) {
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
          <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
          <p className="text-muted-foreground">
            Process payroll, manage time entries, and track compensation
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAdjustmentDialog} onOpenChange={setShowAdjustmentDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calculator className="mr-2 h-4 w-4" />
                Add Adjustment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Payroll Adjustment</DialogTitle>
                <DialogDescription>
                  Add overtime, bonuses, deductions, or reimbursements
                </DialogDescription>
              </DialogHeader>
              <Form {...adjustmentForm}>
                <form onSubmit={adjustmentForm.handleSubmit(onSubmitAdjustment)} className="space-y-4">
                  <FormField
                    control={adjustmentForm.control}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {employees?.employees?.map((employee: any) => (
                              <SelectItem key={employee.id} value={employee.id}>
                                {employee.first_name} {employee.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={adjustmentForm.control}
                    name="adjustmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adjustment Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="overtime">Overtime</SelectItem>
                            <SelectItem value="bonus">Bonus</SelectItem>
                            <SelectItem value="deduction">Deduction</SelectItem>
                            <SelectItem value="reimbursement">Reimbursement</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={adjustmentForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={adjustmentForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowAdjustmentDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addAdjustmentMutation.isPending}>
                      {addAdjustmentMutation.isPending ? "Adding..." : "Add Adjustment"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Payroll
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Payroll Run</DialogTitle>
                <DialogDescription>
                  Set up a new payroll run for the specified pay period
                </DialogDescription>
              </DialogHeader>
              <Form {...payrollForm}>
                <form onSubmit={payrollForm.handleSubmit(onSubmitPayroll)} className="space-y-4">
                  <FormField
                    control={payrollForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pay Period Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={payrollForm.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pay Period End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={payrollForm.control}
                    name="payDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pay Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createPayrollMutation.isPending}>
                      {createPayrollMutation.isPending ? "Creating..." : "Create Payroll Run"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Payroll Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Period Gross</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(payrollSummary?.currentPeriod?.grossPay || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {payrollSummary?.currentPeriod?.employeeCount || 0} employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Pay</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(payrollSummary?.currentPeriod?.netPay || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              After taxes and deductions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(payrollSummary?.currentPeriod?.totalHours || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {(payrollSummary?.currentPeriod?.overtimeHours || 0).toLocaleString()} overtime hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tax Withholdings</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(payrollSummary?.currentPeriod?.taxWithholdings || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Federal, state, and local taxes
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="runs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="runs">Payroll Runs</TabsTrigger>
          <TabsTrigger value="time">Time Entries</TabsTrigger>
          <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="runs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Runs</CardTitle>
              <CardDescription>
                Manage and process payroll runs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payrollRuns?.payrolls?.map((payroll: any) => {
                  const totals = calculatePayrollTotals(payroll);
                  return (
                    <div
                      key={payroll.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">
                          Pay Period: {payroll.start_date} - {payroll.end_date}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Pay Date: {payroll.pay_date}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span>Gross: {formatCurrency(totals.gross)}</span>
                          <span>Net: {formatCurrency(totals.net)}</span>
                          <span>Employees: {payroll.employee_compensations?.length || 0}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(payroll.payroll_status)}
                        {payroll.payroll_status === "open" && (
                          <Button
                            size="sm"
                            onClick={() => submitPayrollMutation.mutate(payroll.id)}
                            disabled={submitPayrollMutation.isPending}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Submit
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <FileText className="mr-2 h-4 w-4" />
                          Details
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {(!payrollRuns?.payrolls || payrollRuns.payrolls.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No payroll runs found. Create your first payroll run to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Entries</CardTitle>
              <CardDescription>
                Review and approve employee time entries for payroll
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Overtime</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeEntries?.entries?.map((entry: any) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.employeeName}</TableCell>
                      <TableCell>{new Date(entry.entryDate).toLocaleDateString()}</TableCell>
                      <TableCell>{entry.clockIn ? new Date(entry.clockIn).toLocaleTimeString() : "-"}</TableCell>
                      <TableCell>{entry.clockOut ? new Date(entry.clockOut).toLocaleTimeString() : "-"}</TableCell>
                      <TableCell>{entry.totalHours.toFixed(2)}</TableCell>
                      <TableCell>{entry.overtimeHours.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={entry.approved ? "default" : "outline"}>
                          {entry.approved ? "Approved" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {!entry.approved && (
                          <Button size="sm" variant="outline">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(!timeEntries?.entries || timeEntries.entries.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  No time entries found for the current period.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adjustments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Adjustments</CardTitle>
              <CardDescription>
                Review bonuses, deductions, and other payroll adjustments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollSummary?.adjustments?.map((adjustment: any) => (
                    <TableRow key={adjustment.id}>
                      <TableCell>{adjustment.employeeName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {adjustment.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(adjustment.amount)}</TableCell>
                      <TableCell>{adjustment.description}</TableCell>
                      <TableCell>{new Date(adjustment.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(!payrollSummary?.adjustments || payrollSummary.adjustments.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  No payroll adjustments found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payroll Register</CardTitle>
                <CardDescription>
                  Complete payroll summary by pay period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tax Summary</CardTitle>
                <CardDescription>
                  Federal and state tax withholdings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Employee Earnings</CardTitle>
                <CardDescription>
                  Individual employee earnings statements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Labor Cost Analysis</CardTitle>
                <CardDescription>
                  Department and project labor costs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Benefits Report</CardTitle>
                <CardDescription>
                  Employee benefits and deductions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">YTD Summary</CardTitle>
                <CardDescription>
                  Year-to-date payroll totals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}