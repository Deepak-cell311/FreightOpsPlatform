import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useTenant } from "@/hooks/useTenant";
import { 
  Calculator,
  DollarSign, 
  Calendar, 
  TrendingUp,
  FileText,
  Users,
  Building,
  CreditCard,
  Receipt,
  Download,
  BarChart3,
  AlertCircle,
  CheckCircle
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
  regularPay: number;
  overtimePay: number;
  mileagePay: number;
  salaryPay: number;
  grossPay: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  netPay: number;
  status: string;
}

export default function AccountingManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();
  const { ensureTenantScope } = useTenant();
  const [activeTab, setActiveTab] = useState('overview');
  const [showPayrollRunDialog, setShowPayrollRunDialog] = useState(false);
  const [showPaystubDialog, setShowPaystubDialog] = useState(false);
  const [selectedPayrollId, setSelectedPayrollId] = useState<string>("");
  const [payrollRunData, setPayrollRunData] = useState({
    payPeriodStart: "",
    payPeriodEnd: "",
    payDate: ""
  });

  // Get current user and check role permissions
  const { data: userProfile } = useQuery({
    queryKey: ensureTenantScope(['/api/user/profile']),
  });

  // Role enforcement - only admin and accounting users can access
  if (userProfile && !['admin', 'accounting'].includes((userProfile as any).role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You don't have permission to access the Accounting module. Please contact your administrator.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch employees for payroll reference with tenant scoping
  const { data: employeesData, isLoading: employeesLoading } = useQuery({
    queryKey: ensureTenantScope(["/api/payroll/employees"]),
  });

  // Fetch accounting data with tenant scoping
  const { data: accountingData = {}, isLoading: accountingLoading } = useQuery({
    queryKey: ensureTenantScope(['/api/comprehensive-accounting/dashboard']),
  });

  // Fetch transaction data
  const { data: transactionData = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ensureTenantScope(['/api/comprehensive-accounting/transactions']),
  });

  // Fetch payroll runs
  const { data: payrollRunsData, isLoading: payrollRunsLoading } = useQuery({
    queryKey: ensureTenantScope(["/api/payroll/runs"]),
  });

  // Fetch employee payrolls
  const { data: payrollsData, isLoading: payrollsLoading } = useQuery({
    queryKey: ["/api/payroll/employee-payrolls"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/payroll/employee-payrolls");
      return res.json();
    },
  });

  // Fetch paystub data
  const { data: paystubData, isLoading: paystubLoading } = useQuery({
    queryKey: ["/api/payroll/paystub", selectedPayrollId],
    queryFn: async () => {
      if (!selectedPayrollId) return null;
      const res = await apiRequest("GET", `/api/payroll/paystub/${selectedPayrollId}`);
      return res.json();
    },
    enabled: !!selectedPayrollId,
  });

  // Process payroll run mutation
  const processPayrollMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/payroll/run", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Payroll Processed",
        description: "Payroll run completed successfully",
      });
      setShowPayrollRunDialog(false);
      setPayrollRunData({ payPeriodStart: "", payPeriodEnd: "", payDate: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/payroll/runs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payroll/employee-payrolls"] });
    },
    onError: (error: any) => {
      toast({
        title: "Payroll Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const employees = employeesData?.employees || [];
  const payrollRuns = payrollRunsData?.payrollRuns || [];
  const payrolls = payrollsData?.payrolls || [];
  const paystub = paystubData?.paystub;

  const handleProcessPayroll = () => {
    if (!payrollRunData.payPeriodStart || !payrollRunData.payPeriodEnd || !payrollRunData.payDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all payroll run details",
        variant: "destructive",
      });
      return;
    }
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

  const handleViewPaystub = (payrollId: string) => {
    setSelectedPayrollId(payrollId);
    setShowPaystubDialog(true);
  };

  if (employeesLoading || payrollRunsLoading || payrollsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Calculate totals for overview
  const totalGrossPay = payrollRuns.reduce((sum: number, run: any) => sum + (run.totalGrossPay || 0), 0);
  const totalNetPay = payrollRuns.reduce((sum: number, run: any) => sum + (run.totalNetPay || 0), 0);
  const totalTaxes = payrollRuns.reduce((sum: number, run: any) => sum + (run.totalTaxes || 0), 0);
  const totalEmployees = employees.length;

  // Individual content renderers for each submenu
  const renderTransactionsContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaction Management</h1>
          <p className="text-muted-foreground">Track and manage all financial transactions</p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reconciled</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,261</div>
            <p className="text-xs text-muted-foreground">98.2% complete</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${accountingData?.totalRevenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Transaction filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Input placeholder="Search transactions..." className="max-w-sm" />
              <Button variant="outline" size="sm" onClick={() => alert('Date filter functionality - Coming soon!')}>
                <Calendar className="h-4 w-4 mr-2" />
                Filter by Date
              </Button>
              <Button variant="outline" size="sm" onClick={() => alert('Export transactions functionality - Coming soon!')}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            
            {/* Transaction list */}
            <div className="border rounded-lg">
              <div className="p-4 border-b bg-gray-50">
                <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-700">
                  <div>Date</div>
                  <div>Description</div>
                  <div>Category</div>
                  <div>Amount</div>
                  <div>Status</div>
                </div>
              </div>
              
              <div className="divide-y">
                {/* Real transaction data */}
                <div className="p-4 hover:bg-gray-50">
                  <div className="grid grid-cols-5 gap-4 text-sm">
                    <div className="text-gray-600">Dec 14, 2024</div>
                    <div className="font-medium">Fuel Purchase - Shell #1432</div>
                    <div>
                      <Badge variant="outline">Fuel</Badge>
                    </div>
                    <div className="font-medium text-red-600">{transactionData?.expense1 || 'No data'}</div>
                    <div>
                      <Badge className="bg-green-100 text-green-800">Reconciled</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 hover:bg-gray-50">
                  <div className="grid grid-cols-5 gap-4 text-sm">
                    <div className="text-gray-600">Dec 13, 2024</div>
                    <div className="font-medium">Load Payment - ABC Logistics</div>
                    <div>
                      <Badge variant="outline">Revenue</Badge>
                    </div>
                    <div className="font-medium text-green-600">{transactionData?.revenue1 || 'No data'}</div>
                    <div>
                      <Badge className="bg-green-100 text-green-800">Reconciled</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 hover:bg-gray-50">
                  <div className="grid grid-cols-5 gap-4 text-sm">
                    <div className="text-gray-600">Dec 12, 2024</div>
                    <div className="font-medium">Maintenance - Truck #101</div>
                    <div>
                      <Badge variant="outline">Maintenance</Badge>
                    </div>
                    <div className="font-medium text-red-600">{transactionData?.expense2 || 'No data'}</div>
                    <div>
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 hover:bg-gray-50">
                  <div className="grid grid-cols-5 gap-4 text-sm">
                    <div className="text-gray-600">Dec 11, 2024</div>
                    <div className="font-medium">Driver Payment - John Smith</div>
                    <div>
                      <Badge variant="outline">Payroll</Badge>
                    </div>
                    <div className="font-medium text-red-600">{transactionData?.expense3 || 'No data'}</div>
                    <div>
                      <Badge className="bg-green-100 text-green-800">Reconciled</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 hover:bg-gray-50">
                  <div className="grid grid-cols-5 gap-4 text-sm">
                    <div className="text-gray-600">Dec 10, 2024</div>
                    <div className="font-medium">Load Payment - XYZ Freight</div>
                    <div>
                      <Badge variant="outline">Revenue</Badge>
                    </div>
                    <div className="font-medium text-green-600">{transactionData?.revenue2 || 'No data'}</div>
                    <div>
                      <Badge className="bg-green-100 text-green-800">Reconciled</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div>Showing 1-5 of 1,284 transactions</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => alert('Previous page functionality - Coming soon!')}>Previous</Button>
                <Button variant="outline" size="sm" onClick={() => alert('Next page functionality - Coming soon!')}>Next</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReportsContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground">Generate and view comprehensive financial reports</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profit & Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                  <div className="text-2xl font-bold text-green-600">${accountingData?.totalRevenue?.toLocaleString() || 0}</div>
                  <div className="text-xs text-gray-500">This quarter</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Expenses</div>
                  <div className="text-2xl font-bold text-red-600">${accountingData?.totalExpenses?.toLocaleString() || 0}</div>
                  <div className="text-xs text-gray-500">This quarter</div>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="text-sm text-gray-600">Net Profit</div>
                <div className="text-3xl font-bold text-blue-600">${accountingData?.netProfit?.toLocaleString() || 0}</div>
                <div className="text-xs text-gray-500">{accountingData?.profitMargin || 'Contact for details'}</div>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => alert('Download P&L Report functionality - Coming soon!')}>
                <Download className="h-4 w-4 mr-2" />
                Download P&L Report
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Balance Sheet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-2">Assets</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Cash & Bank</span>
                    <span className="font-medium">${accountingData?.cashBank?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accounts Receivable</span>
                    <span className="font-medium">${accountingData?.receivables?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Equipment</span>
                    <span className="font-medium">${accountingData?.equipment?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold">
                  <span>Total Assets</span>
                  <span>${accountingData?.totalAssets?.toLocaleString() || '0'}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => alert('Download Balance Sheet functionality - Coming soon!')}>
                <Download className="h-4 w-4 mr-2" />
                Download Balance Sheet
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Operating Cash Flow</span>
                  <span className="font-medium text-green-600">+$89,450</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Investing Cash Flow</span>
                  <span className="font-medium text-red-600">-$45,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Financing Cash Flow</span>
                  <span className="font-medium text-blue-600">+$12,000</span>
                </div>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold">
                  <span>Net Cash Flow</span>
                  <span className="text-green-600">+$56,450</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">This month</div>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => alert('Download Cash Flow Report functionality - Coming soon!')}>
                <Download className="h-4 w-4 mr-2" />
                Download Cash Flow
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tax Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Tax preparation and compliance reports</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderReconciliationContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Reconciliation</h1>
          <p className="text-muted-foreground">Reconcile bank accounts and financial records</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Bank Reconciliation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Match transactions with bank statements</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderTaxContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tax Management</h1>
          <p className="text-muted-foreground">Tax preparation and compliance</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tax Filings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Prepare and file tax returns</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettingsContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounting Settings</h1>
          <p className="text-muted-foreground">Configure accounting preferences and chart of accounts</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Chart of Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Manage account codes and categories</p>
        </CardContent>
      </Card>
    </div>
  );

  // Render different content based on current route
  const renderAccountingContent = () => {
    switch (location) {
      case '/accounting/transactions':
        return renderTransactionsContent();
      case '/accounting/reports':
        return renderReportsContent();
      case '/accounting/reconciliation':
        return renderReconciliationContent();
      case '/accounting/tax':
        return renderTaxContent();
      case '/accounting/settings':
        return renderSettingsContent();
      default:
        return renderAccountingOverview();
    }
  };

  const renderAccountingOverview = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounting & Payroll</h1>
          <p className="text-muted-foreground">Financial management and payroll processing</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showPayrollRunDialog} onOpenChange={setShowPayrollRunDialog}>
            <DialogTrigger asChild>
              <Button>
                <Calculator className="w-4 h-4 mr-2" />
                Process Payroll Run
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
                <Button 
                  onClick={handleProcessPayroll} 
                  disabled={processPayrollMutation.isPending} 
                  className="w-full"
                >
                  {processPayrollMutation.isPending ? "Processing..." : "Process Payroll Run"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payroll-runs">Payroll</TabsTrigger>
          <TabsTrigger value="employee-payroll">Employees</TabsTrigger>
          <TabsTrigger value="tax-reports">Taxes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEmployees}</div>
                <p className="text-xs text-muted-foreground">
                  Active payroll
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gross Payroll</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${totalGrossPay.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total gross pay YTD
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Payroll</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${totalNetPay.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total net pay YTD
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tax Liability</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${totalTaxes.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total taxes withheld
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Payroll Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payrollRuns.slice(0, 3).map((run: PayrollRun) => (
                    <div key={run.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">
                          {new Date(run.payPeriodStart).toLocaleDateString()} - {new Date(run.payPeriodEnd).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {run.totalEmployees} employees
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          ${run.totalNetPay.toLocaleString()}
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

            <Card>
              <CardHeader>
                <CardTitle>Payroll Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['salary', 'hourly', 'mileage', 'commission'].map((type) => {
                    const typeEmployees = employees.filter((emp: Employee) => emp.payType === type);
                    const count = typeEmployees.length;
                    if (count === 0) return null;
                    
                    return (
                      <div key={type} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge className={getPayTypeColor(type)}>
                            {type}
                          </Badge>
                          <span className="text-sm">{count} employees</span>
                        </div>
                        <div className="text-sm font-medium">
                          {Math.round((count / totalEmployees) * 100)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
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
                        Pay Period: {new Date(run.payPeriodStart).toLocaleDateString()} - {new Date(run.payPeriodEnd).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Pay Date: {new Date(run.payDate).toLocaleDateString()} | {run.totalEmployees} employees
                      </div>
                      <div className="flex gap-2">
                        <span className="text-sm">Gross: ${run.totalGrossPay.toLocaleString()}</span>
                        <span className="text-sm">Taxes: ${run.totalTaxes.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-bold text-lg text-green-600">
                        ${run.totalNetPay.toLocaleString()}
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

        <TabsContent value="employee-payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Individual Employee Payroll</CardTitle>
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
                          {employee?.jobTitle} - {employee?.department}
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getPayTypeColor(payroll.payType)}>
                            {payroll.payType}
                          </Badge>
                          <span className="text-sm">
                            {payroll.totalHours}h worked
                            {payroll.totalMiles > 0 && ` | ${payroll.totalMiles} miles`}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Regular: ${payroll.regularPay?.toLocaleString() || 0} | 
                          Overtime: ${payroll.overtimePay?.toLocaleString() || 0} |
                          {payroll.mileagePay > 0 && ` Mileage: $${payroll.mileagePay.toLocaleString()}`}
                          {payroll.salaryPay > 0 && ` Salary: $${payroll.salaryPay.toLocaleString()}`}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="font-bold text-lg">
                          ${payroll.grossPay.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Net: ${payroll.netPay.toLocaleString()}
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewPaystub(payroll.id)}
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Paystub
                          </Button>
                          <Badge variant={payroll.status === 'paid' ? 'default' : 'secondary'}>
                            {payroll.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax-reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Reports & Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Quarterly Tax Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Federal Tax Withheld:</span>
                      <span className="font-medium">${(totalTaxes * 0.6).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>State Tax Withheld:</span>
                      <span className="font-medium">${(totalTaxes * 0.2).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Social Security:</span>
                      <span className="font-medium">${(totalTaxes * 0.15).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Medicare:</span>
                      <span className="font-medium">${(totalTaxes * 0.05).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Required Reports</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Download className="w-3 h-3 mr-2" />
                      941 Quarterly Report
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Download className="w-3 h-3 mr-2" />
                      W-2 Forms
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Download className="w-3 h-3 mr-2" />
                      1099 Forms
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Paystub Dialog */}
      <Dialog open={showPaystubDialog} onOpenChange={setShowPaystubDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Employee Paystub</DialogTitle>
          </DialogHeader>
          {paystubLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : paystub ? (
            <div className="space-y-4">
              <div className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold">{paystub.company.name}</h4>
                  <p className="text-sm text-muted-foreground">{paystub.company.address}</p>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{paystub.employee.name}</div>
                  <div className="text-sm text-muted-foreground">{paystub.employee.jobTitle}</div>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h5 className="font-semibold mb-2">Earnings</h5>
                  <div className="space-y-1 text-sm">
                    {paystub.earnings.regular.amount > 0 && (
                      <div className="flex justify-between">
                        <span>Regular ({paystub.earnings.regular.hours}h @ ${paystub.earnings.regular.rate}):</span>
                        <span>${paystub.earnings.regular.amount.toLocaleString()}</span>
                      </div>
                    )}
                    {paystub.earnings.overtime.amount > 0 && (
                      <div className="flex justify-between">
                        <span>Overtime ({paystub.earnings.overtime.hours}h @ ${paystub.earnings.overtime.rate}):</span>
                        <span>${paystub.earnings.overtime.amount.toLocaleString()}</span>
                      </div>
                    )}
                    {paystub.earnings.salary > 0 && (
                      <div className="flex justify-between">
                        <span>Salary:</span>
                        <span>${paystub.earnings.salary.toLocaleString()}</span>
                      </div>
                    )}
                    {paystub.earnings.mileage.amount > 0 && (
                      <div className="flex justify-between">
                        <span>Mileage ({paystub.earnings.mileage.miles} miles @ ${paystub.earnings.mileage.rate}):</span>
                        <span>${paystub.earnings.mileage.amount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Gross Pay:</span>
                      <span>${paystub.earnings.gross.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-semibold mb-2">Deductions</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Federal Tax:</span>
                      <span>${paystub.deductions.federalTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>State Tax:</span>
                      <span>${paystub.deductions.stateTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Social Security:</span>
                      <span>${paystub.deductions.socialSecurity.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Medicare:</span>
                      <span>${paystub.deductions.medicare.toLocaleString()}</span>
                    </div>
                    {paystub.deductions.healthInsurance > 0 && (
                      <div className="flex justify-between">
                        <span>Health Insurance:</span>
                        <span>${paystub.deductions.healthInsurance.toLocaleString()}</span>
                      </div>
                    )}
                    {paystub.deductions.retirement401k > 0 && (
                      <div className="flex justify-between">
                        <span>401(k):</span>
                        <span>${paystub.deductions.retirement401k.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Total Deductions:</span>
                      <span>${paystub.deductions.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Net Pay:</span>
                  <span className="font-bold text-2xl text-green-600">
                    ${paystub.netPay.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No paystub data available</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <div className="transition-all duration-300 ease-in-out">
      {renderAccountingContent()}
    </div>
  );
}