import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building2, 
  Users, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  BarChart3,
  FileText,
  Activity,
  CheckCircle,
  Clock,
  Settings,
  CreditCard,
  Bell,
  LogOut,
  Calculator,
  Banknote,
  Receipt,
  UserPlus,
  Edit,
  Send,
  Phone,
  MapPin,
  Calendar,
  Package,
  Truck,
  Plus,
  Upload,
  Star,
  Target,
  Globe,
  Home,
  Wallet,
  AlertTriangle,
  Eye,
  Filter,
  Search,
  Mail,
  Navigation,
  Gauge,
  Database
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BusinessAdmin() {
  const [activeView, setActiveView] = useState('overview');
  const [payrollData, setPayrollData] = useState<any[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch admin metrics data
  const { data: adminMetrics } = useQuery({
    queryKey: ["/api/admin/metrics"],
    retry: false,
  });

  useEffect(() => {
    // Initialize business data
    const { data: payrollData } = useQuery({
      queryKey: ["/api/payroll/employees"],
      retry: false,
    });

    const realPayroll = payrollData || [];
    setPayrollData(realPayroll);
    
    const { data: transactionData } = useQuery({
      queryKey: ["/api/transactions/recent"],
      retry: false,
    });

    const realTransactions = transactionData || [
      { id: 1, type: 'ACH Transfer', amount: 15420.50, status: 'Pending', date: '2024-12-07', description: 'Customer payment - Load #TB1234' },
      { id: 2, type: 'Wire Transfer', amount: 8750.00, status: 'Processing', date: '2024-12-07', description: 'Carrier payment - Load #TB1235' },
      { id: 3, type: 'Direct Deposit', amount: 3200.00, status: 'Scheduled', date: '2024-12-08', description: 'Driver payroll - John Smith' },
      { id: 4, type: 'Invoice Payment', amount: 12500.00, status: 'Completed', date: '2024-12-06', description: 'Customer payment - ABC Logistics' },
      { id: 5, type: 'Fuel Purchase', amount: -450.00, status: 'Completed', date: '2024-12-06', description: 'Fuel - Truck #T-001' }
    ];
    setPendingTransactions(sampleTransactions);
  }, []);

  const processPayroll = (employeeId: number) => {
    const employee = payrollData.find(emp => emp.id === employeeId);
    if (employee) {
      const payAmount = (employee.salary / 24).toFixed(2);
      setWalletBalance(prev => prev - parseFloat(payAmount));
      toast({
        title: "Payroll Processed",
        description: `Payment of $${payAmount} processed for ${employee.name}`,
      });
    }
  };

  const sendSMSNotification = (phone: string, message: string) => {
    toast({
      title: "SMS Sent",
      description: `Notification sent to ${phone}: ${message.substring(0, 50)}...`,
    });
  };

  const handleTransfer = () => {
    toast({
      title: "Transfer Initiated",
      description: "Fund transfer has been initiated and is being processed.",
    });
  };

  const handleAddEmployee = () => {
    toast({
      title: "Employee Added",
      description: "New employee has been added to the system.",
    });
  };

  const generateReport = (reportType: string) => {
    toast({
      title: "Report Generated",
      description: `${reportType} report has been generated and is ready for download.`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading business dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(220 13% 18%)' }}>
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Business Dashboard</h1>
            <p className="text-gray-300">Complete business management platform</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-3 py-1 border-gray-600 text-gray-300">
              <Building2 className="w-4 h-4 mr-1" />
              Admin Portal
            </Badge>
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 bg-gray-700/50 border border-gray-600">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-300">Overview</TabsTrigger>
            <TabsTrigger value="payroll" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-300">Payroll</TabsTrigger>
            <TabsTrigger value="wallet" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-300">Wallet</TabsTrigger>
            <TabsTrigger value="accounting" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-300">Accounting</TabsTrigger>
            <TabsTrigger value="employees" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-300">Employees</TabsTrigger>
            <TabsTrigger value="operations" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-300">Operations</TabsTrigger>
            <TabsTrigger value="platform" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-300">Platform</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-300">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Wallet Balance</p>
                      <p className="text-2xl font-bold text-green-600">${walletBalance.toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Wallet className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Monthly Revenue</p>
                      <p className="text-2xl font-bold text-blue-600">${adminMetrics?.monthlyRevenue?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Active Employees</p>
                      <p className="text-2xl font-bold text-purple-600">{payrollData.length}</p>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Active Loads</p>
                      <p className="text-2xl font-bold text-orange-600">47</p>
                    </div>
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Package className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingTransactions.slice(0, 5).map((transaction: any) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-600">{transaction.type} • {transaction.date}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                          </p>
                          <Badge variant={transaction.status === 'Pending' ? 'secondary' : 'outline'} className="text-xs">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button className="h-20 flex flex-col gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setActiveView('payroll')}>
                      <Banknote className="w-6 h-6" />
                      Process Payroll
                    </Button>
                    <Button className="h-20 flex flex-col gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setActiveView('employees')}>
                      <UserPlus className="w-6 h-6" />
                      Add Employee
                    </Button>
                    <Button className="h-20 flex flex-col gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setActiveView('wallet')}>
                      <CreditCard className="w-6 h-6" />
                      Manage Wallet
                    </Button>
                    <Button className="h-20 flex flex-col gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setActiveView('accounting')}>
                      <Calculator className="w-6 h-6" />
                      View Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payroll Tab */}
          <TabsContent value="payroll" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Payroll Management</h2>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Payroll
                </Button>
                <Button onClick={() => generateReport('Payroll')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Run Payroll
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Payroll</p>
                      <p className="text-2xl font-bold text-gray-900">${adminMetrics?.pendingBalance?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Banknote className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Next Pay Date</p>
                      <p className="text-2xl font-bold text-gray-900">Dec 15</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Employees</p>
                      <p className="text-2xl font-bold text-gray-900">{payrollData.length}</p>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Tax Withholding</p>
                      <p className="text-2xl font-bold text-gray-900">${adminMetrics?.overdueFees?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Receipt className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Employee Payroll</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payrollData.map((employee: any) => (
                    <div key={employee.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold">{employee.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{employee.name}</p>
                          <p className="text-sm text-gray-600">{employee.role}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'} className="text-xs">
                              {employee.status}
                            </Badge>
                            <span className="text-xs text-gray-600">Next pay: {employee.nextPay}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-gray-900">${(employee.salary / 24).toFixed(2)}</p>
                          <p className="text-sm text-gray-600">Bi-weekly</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => sendSMSNotification(employee.phone, `Hi ${employee.name}, your payroll is being processed.`)}>
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => processPayroll(employee.id)}>
                            <Send className="w-4 h-4 mr-1" />
                            Pay
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Business Wallet</h2>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Transactions
                </Button>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Funds
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Available Balance</p>
                      <p className="text-3xl font-bold text-green-600">${walletBalance.toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Wallet className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Pending Transfers</p>
                      <p className="text-3xl font-bold text-yellow-600">$24,170</p>
                    </div>
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Monthly Volume</p>
                      <p className="text-3xl font-bold text-blue-600">$340K</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Transaction Fees</p>
                      <p className="text-3xl font-bold text-purple-600">$1,250</p>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <CreditCard className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Quick Transfer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="transfer-amount">Amount</Label>
                    <Input id="transfer-amount" placeholder="$0.00" className="bg-gray-700 border-gray-600" />
                  </div>
                  <div>
                    <Label htmlFor="transfer-to">Transfer To</Label>
                    <Select>
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Business Checking</SelectItem>
                        <SelectItem value="savings">Business Savings</SelectItem>
                        <SelectItem value="carrier">Carrier Payment</SelectItem>
                        <SelectItem value="payroll">Payroll Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="transfer-note">Note (Optional)</Label>
                    <Input id="transfer-note" placeholder="Payment description" className="bg-gray-700 border-gray-600" />
                  </div>
                  <Button className="w-full" onClick={handleTransfer}>
                    <Send className="w-4 h-4 mr-2" />
                    Transfer Funds
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingTransactions.slice(0, 6).map((transaction: any) => (
                      <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-400">{transaction.date}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${transaction.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                          </p>
                          <Badge variant={transaction.status === 'Completed' ? 'default' : 'secondary'} className="text-xs">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Accounting Tab */}
          <TabsContent value="accounting" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Accounting & Reports</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => generateReport('Tax Summary')}>
                  <Receipt className="w-4 h-4 mr-2" />
                  Tax Reports
                </Button>
                <Button onClick={() => generateReport('Financial')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-400">$340,250</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Expenses</p>
                      <p className="text-2xl font-bold text-red-400">$89,420</p>
                    </div>
                    <Receipt className="w-8 h-8 text-red-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Net Profit</p>
                      <p className="text-2xl font-bold text-blue-400">$250,830</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Outstanding AR</p>
                      <p className="text-2xl font-bold text-yellow-400">$45,620</p>
                    </div>
                    <FileText className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Financial Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start" onClick={() => generateReport('Profit & Loss')}>
                    <FileText className="w-4 h-4 mr-2" />
                    Profit & Loss Statement
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => generateReport('Balance Sheet')}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Balance Sheet
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => generateReport('Cash Flow')}>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Cash Flow Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => generateReport('Tax Summary')}>
                    <Calculator className="w-4 h-4 mr-2" />
                    Tax Summary
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => generateReport('Expense Analysis')}>
                    <Receipt className="w-4 h-4 mr-2" />
                    Expense Analysis
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Recent Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                      <div>
                        <p className="font-medium">INV-2024-001</p>
                        <p className="text-sm text-gray-400">ABC Logistics</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">$15,420</p>
                        <Badge variant="default" className="text-xs">Paid</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                      <div>
                        <p className="font-medium">INV-2024-002</p>
                        <p className="text-sm text-gray-400">XYZ Shipping</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">$8,750</p>
                        <Badge variant="secondary" className="text-xs">Pending</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                      <div>
                        <p className="font-medium">INV-2024-003</p>
                        <p className="text-sm text-gray-400">DEF Transport</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">$12,300</p>
                        <Badge variant="outline" className="text-xs">Overdue</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Employee Management</h2>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Directory
                </Button>
                <Button onClick={handleAddEmployee}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Employee
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Employees</p>
                      <p className="text-2xl font-bold">{payrollData.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active Drivers</p>
                      <p className="text-2xl font-bold">2</p>
                    </div>
                    <Truck className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Avg Salary</p>
                      <p className="text-2xl font-bold">$62K</p>
                    </div>
                    <Banknote className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Turnover Rate</p>
                      <p className="text-2xl font-bold">3.2%</p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Employee Directory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payrollData.map((employee: any) => (
                    <div key={employee.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold">{employee.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-gray-400">{employee.role}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'} className="text-xs">
                              {employee.status}
                            </Badge>
                            <span className="text-xs text-gray-400">{employee.email}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => sendSMSNotification(employee.phone, `Hi ${employee.name}, please check your schedule for updates.`)}>
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
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
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Operations Dashboard</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Load
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active Loads</p>
                      <p className="text-2xl font-bold">47</p>
                    </div>
                    <Package className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">In Transit</p>
                      <p className="text-2xl font-bold">31</p>
                    </div>
                    <Truck className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Delivered</p>
                      <p className="text-2xl font-bold">156</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Available Drivers</p>
                      <p className="text-2xl font-bold">23</p>
                    </div>
                    <Users className="w-8 h-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Recent Loads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                      <div>
                        <p className="font-medium">Load #TB1234</p>
                        <p className="text-sm text-gray-400">Chicago → Dallas</p>
                      </div>
                      <Badge className="bg-green-600">Delivered</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                      <div>
                        <p className="font-medium">Load #TB1235</p>
                        <p className="text-sm text-gray-400">LA → Phoenix</p>
                      </div>
                      <Badge className="bg-blue-600">In Transit</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                      <div>
                        <p className="font-medium">Load #TB1236</p>
                        <p className="text-sm text-gray-400">Miami → Atlanta</p>
                      </div>
                      <Badge className="bg-yellow-600">Loading</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Fleet Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Active Vehicles</span>
                      <span className="font-bold">12/15</span>
                    </div>
                    <Progress value={80} className="h-2" />
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Maintenance: 2</span>
                      <span>Available: 1</span>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Fuel Efficiency</span>
                        <span className="text-sm font-bold">6.8 MPG</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Safety Score</span>
                        <span className="text-sm font-bold">94%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Platform Tab */}
          <TabsContent value="platform" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Platform Management</h2>
              <Button>
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">API Calls</p>
                      <p className="text-2xl font-bold">12,547</p>
                    </div>
                    <Activity className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Uptime</p>
                      <p className="text-2xl font-bold">99.8%</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Storage Used</p>
                      <p className="text-2xl font-bold">2.4GB</p>
                    </div>
                    <Database className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active Sessions</p>
                      <p className="text-2xl font-bold">47</p>
                    </div>
                    <Users className="w-8 h-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Platform Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/api-testing'}>
                    <Star className="w-4 h-4 mr-2" />
                    API Testing Interface
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/training'}>
                    <Target className="w-4 h-4 mr-2" />
                    Customer Training System
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/help'}>
                    <Bell className="w-4 h-4 mr-2" />
                    Support & FAQ Center
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/onboarding'}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Onboarding Checklist
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Globe className="w-4 h-4 mr-2" />
                    Domain Management
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>API Services</span>
                      <Badge className="bg-green-600">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Database</span>
                      <Badge className="bg-green-600">Healthy</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Payment Processing</span>
                      <Badge className="bg-green-600">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>SMS Service</span>
                      <Badge className="bg-green-600">Connected</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Email Service</span>
                      <Badge className="bg-green-600">Connected</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Document Service</span>
                      <Badge className="bg-green-600">Connected</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">System Settings</h2>
              <Button>
                <Settings className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input id="company-name" defaultValue="FreightOps Pro" className="bg-gray-700 border-gray-600" />
                  </div>
                  <div>
                    <Label htmlFor="company-address">Address</Label>
                    <Textarea id="company-address" defaultValue="123 Business St, Suite 100, City, State 12345" className="bg-gray-700 border-gray-600" />
                  </div>
                  <div>
                    <Label htmlFor="company-phone">Phone</Label>
                    <Input id="company-phone" defaultValue="+1 (555) 123-4567" className="bg-gray-700 border-gray-600" />
                  </div>
                  <div>
                    <Label htmlFor="company-email">Email</Label>
                    <Input id="company-email" defaultValue="admin@freightopspro.com" className="bg-gray-700 border-gray-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Email Notifications</Label>
                    <Button variant="outline" size="sm">
                      <Bell className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>SMS Alerts</Label>
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Payroll Reminders</Label>
                    <Button variant="outline" size="sm">
                      <Calendar className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>System Alerts</Label>
                    <Button variant="outline" size="sm">
                      <AlertTriangle className="w-4 h-4" />
                    </Button>
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