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
  Database,
  Menu,
  ChevronDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BusinessDashboard() {
  const [activeView, setActiveView] = useState('overview');
  const [walletBalance, setWalletBalance] = useState(125847.92);
  const [payrollData, setPayrollData] = useState<any[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    role: '',
    salary: '',
    phone: '',
    email: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    // Initialize business data
    const { data: payrollData } = useQuery({
      queryKey: ["/api/payroll/summary"],
      retry: false,
    });

    const realPayroll = payrollData || [
      { id: 1, name: 'John Smith', role: 'Driver', salary: 65000, status: 'Active', lastPaid: '2024-12-01', nextPay: '2024-12-15', phone: '+1234567890', email: 'john@company.com' },
      { id: 2, name: 'Maria Garcia', role: 'Dispatcher', salary: 55000, status: 'Active', lastPaid: '2024-12-01', nextPay: '2024-12-15', phone: '+1234567891', email: 'maria@company.com' },
      { id: 3, name: 'Robert Johnson', role: 'Mechanic', salary: 58000, status: 'Active', lastPaid: '2024-12-01', nextPay: '2024-12-15', phone: '+1234567892', email: 'robert@company.com' },
      { id: 4, name: 'Lisa Chen', role: 'Driver', salary: 62000, status: 'Active', lastPaid: '2024-12-01', nextPay: '2024-12-15', phone: '+1234567893', email: 'lisa@company.com' },
      { id: 5, name: 'Michael Davis', role: 'Safety Manager', salary: 70000, status: 'Active', lastPaid: '2024-12-01', nextPay: '2024-12-15', phone: '+1234567894', email: 'michael@company.com' }
    ];
    setPayrollData(realPayroll);
    
    const { data: transactionData } = useQuery({
      queryKey: ["/api/transactions/summary"],
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
      description: `Notification sent to ${phone}`,
    });
  };

  const addEmployee = () => {
    if (newEmployee.name && newEmployee.role && newEmployee.salary) {
      const employee = {
        id: payrollData.length + 1,
        name: newEmployee.name,
        role: newEmployee.role,
        salary: parseInt(newEmployee.salary),
        status: 'Active',
        lastPaid: 'N/A',
        nextPay: '2024-12-15',
        phone: newEmployee.phone,
        email: newEmployee.email
      };
      setPayrollData([...payrollData, employee]);
      setNewEmployee({ name: '', role: '', salary: '', phone: '', email: '' });
      setShowAddEmployee(false);
      toast({
        title: "Employee Added",
        description: `${employee.name} has been added to payroll`,
      });
    }
  };

  const transferFunds = (amount: number, type: string) => {
    if (amount <= walletBalance) {
      setWalletBalance(prev => prev - amount);
      const newTransaction = {
        id: pendingTransactions.length + 1,
        type: type,
        amount: -amount,
        status: 'Processing',
        date: new Date().toISOString().split('T')[0],
        description: `${type} - $${amount.toLocaleString()}`
      };
      setPendingTransactions([newTransaction, ...pendingTransactions]);
      toast({
        title: "Transfer Initiated",
        description: `${type} of $${amount.toLocaleString()} initiated`,
      });
    } else {
      toast({
        title: "Insufficient Funds",
        description: "Not enough balance for this transfer",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(220 13% 18%)' }}>
      <div className="container mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">SaaS Management</h1>
            <p className="text-gray-300 text-sm md:text-base">Manage your trucking software platform and customer subscriptions</p>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Badge variant="outline" className="px-2 md:px-3 py-1 border-gray-600 text-gray-300 text-xs md:text-sm">
              <Building2 className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              Business Admin
            </Badge>
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs md:text-sm">
              <LogOut className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 bg-gray-700/50 border border-gray-600">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-300">Overview</TabsTrigger>
            <TabsTrigger value="customers" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-300">Customers</TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-300">Billing</TabsTrigger>
            <TabsTrigger value="financials" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-300">Financials</TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-300">Team</TabsTrigger>
            <TabsTrigger value="support" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-300">Support</TabsTrigger>
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
                      <p className="text-gray-600 text-sm">Monthly Recurring Revenue</p>
                      <p className="text-2xl font-bold text-green-600">${businessMetrics?.monthlyRevenue?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Active Customers</p>
                      <p className="text-2xl font-bold text-blue-600">850</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Support Tickets</p>
                      <p className="text-2xl font-bold text-purple-600">23</p>
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
                      <p className="text-gray-600 text-sm">Platform Uptime</p>
                      <p className="text-2xl font-bold text-orange-600">99.9%</p>
                    </div>
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Activity className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Recent Customer Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div>
                        <p className="font-medium text-gray-900">New Customer Signup</p>
                        <p className="text-sm text-gray-600">ABC Trucking • 2 hours ago</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{businessMetrics?.growthRate || 'Contact for details'}</p>
                        <Badge variant="outline" className="text-xs">Active</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div>
                        <p className="font-medium text-gray-900">Payment Received</p>
                        <p className="text-sm text-gray-600">XYZ Logistics • 5 hours ago</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{businessMetrics?.monthlyIncrease || 'Contact for details'}</p>
                        <Badge variant="outline" className="text-xs">Paid</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div>
                        <p className="font-medium text-gray-900">Support Ticket Resolved</p>
                        <p className="text-sm text-gray-600">Metro Freight • 1 day ago</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">Resolved</p>
                        <Badge variant="outline" className="text-xs">Closed</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div>
                        <p className="font-medium text-gray-900">Feature Request</p>
                        <p className="text-sm text-gray-600">FastTrack Solutions • 2 days ago</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-600">In Review</p>
                        <Badge variant="secondary" className="text-xs">Pending</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button className="h-20 flex flex-col gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setActiveView('customers')}>
                      <Building2 className="w-6 h-6" />
                      Manage Customers
                    </Button>
                    <Button className="h-20 flex flex-col gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setActiveView('support')}>
                      <Users className="w-6 h-6" />
                      Support Queue
                    </Button>
                    <Button className="h-20 flex flex-col gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setActiveView('billing')}>
                      <CreditCard className="w-6 h-6" />
                      Billing Center
                    </Button>
                    <Button className="h-20 flex flex-col gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setActiveView('platform')}>
                      <Activity className="w-6 h-6" />
                      Platform Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Customer Management</h2>
              <div className="flex gap-4">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-2" />
                  Export Customer Data
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add New Customer
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Customers</p>
                      <p className="text-2xl font-bold text-gray-900">850</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Building2 className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Active Subscriptions</p>
                      <p className="text-2xl font-bold text-gray-900">832</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-blue-600" />
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
                      <p className="text-2xl font-bold text-gray-900">$7,625</p>
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
                          <span className="text-lg font-bold text-white">{employee.name.charAt(0)}</span>
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
              <h2 className="text-2xl font-bold text-white">Business Wallet</h2>
              <div className="flex gap-4">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Funds
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Send className="w-4 h-4 mr-2" />
                  Transfer
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
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Quick Transfer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      className="h-16 flex flex-col gap-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => transferFunds(5000, 'ACH Transfer')}
                    >
                      <DollarSign className="w-5 h-5" />
                      <span className="text-sm">ACH $5,000</span>
                    </Button>
                    <Button 
                      className="h-16 flex flex-col gap-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => transferFunds(10000, 'Wire Transfer')}
                    >
                      <Send className="w-5 h-5" />
                      <span className="text-sm">Wire $10,000</span>
                    </Button>
                    <Button 
                      className="h-16 flex flex-col gap-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => transferFunds(2500, 'Payroll Transfer')}
                    >
                      <Banknote className="w-5 h-5" />
                      <span className="text-sm">Payroll $2,500</span>
                    </Button>
                    <Button 
                      className="h-16 flex flex-col gap-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => transferFunds(1000, 'Expense Payment')}
                    >
                      <Receipt className="w-5 h-5" />
                      <span className="text-sm">Expense $1,000</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Recent Wallet Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingTransactions.slice(0, 6).map((transaction: any) => (
                      <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            transaction.status === 'Completed' ? 'bg-green-500' : 
                            transaction.status === 'Processing' ? 'bg-blue-500' : 'bg-yellow-500'
                          }`}></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{transaction.type}</p>
                            <p className="text-xs text-gray-600">{transaction.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">{transaction.status}</p>
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
              <h2 className="text-2xl font-bold text-white">Accounting & Reports</h2>
              <div className="flex gap-4">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-2" />
                  Export Reports
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Calculator className="w-4 h-4 mr-2" />
                  Generate Invoice
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Monthly Revenue</p>
                      <p className="text-2xl font-bold text-green-600">$89,420</p>
                      <p className="text-sm text-green-600">↗ +12.5%</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Monthly Expenses</p>
                      <p className="text-2xl font-bold text-red-600">$45,280</p>
                      <p className="text-sm text-red-600">↗ +8.2%</p>
                    </div>
                    <div className="p-2 bg-red-100 rounded-lg">
                      <TrendingDown className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Net Profit</p>
                      <p className="text-2xl font-bold text-blue-600">$44,140</p>
                      <p className="text-sm text-blue-600">↗ +18.3%</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Tax Liability</p>
                      <p className="text-2xl font-bold text-purple-600">$13,242</p>
                      <p className="text-sm text-gray-600">Q4 2024</p>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Receipt className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Financial Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <Button variant="outline" className="justify-start h-12">
                      <FileText className="w-5 h-5 mr-3" />
                      Profit & Loss Statement
                    </Button>
                    <Button variant="outline" className="justify-start h-12">
                      <BarChart3 className="w-5 h-5 mr-3" />
                      Balance Sheet
                    </Button>
                    <Button variant="outline" className="justify-start h-12">
                      <DollarSign className="w-5 h-5 mr-3" />
                      Cash Flow Report
                    </Button>
                    <Button variant="outline" className="justify-start h-12">
                      <Receipt className="w-5 h-5 mr-3" />
                      Tax Summary
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Expense Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Fuel & Maintenance</span>
                      <span className="font-bold text-gray-900">$18,420</span>
                    </div>
                    <Progress value={65} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Payroll</span>
                      <span className="font-bold text-gray-900">$15,200</span>
                    </div>
                    <Progress value={48} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Insurance</span>
                      <span className="font-bold text-gray-900">$6,800</span>
                    </div>
                    <Progress value={32} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Equipment</span>
                      <span className="font-bold text-gray-900">$4,860</span>
                    </div>
                    <Progress value={24} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Employee Management</h2>
              <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Employee
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                  <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={newEmployee.name}
                        onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select value={newEmployee.role} onValueChange={(value) => setNewEmployee({...newEmployee, role: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Driver">Driver</SelectItem>
                          <SelectItem value="Dispatcher">Dispatcher</SelectItem>
                          <SelectItem value="Mechanic">Mechanic</SelectItem>
                          <SelectItem value="Safety Manager">Safety Manager</SelectItem>
                          <SelectItem value="Administrator">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="salary">Annual Salary</Label>
                      <Input 
                        id="salary" 
                        type="number"
                        value={newEmployee.salary}
                        onChange={(e) => setNewEmployee({...newEmployee, salary: e.target.value})}
                        placeholder="Enter annual salary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        value={newEmployee.phone}
                        onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={newEmployee.email}
                        onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                        placeholder="Enter email address"
                      />
                    </div>
                    <Button onClick={addEmployee} className="w-full bg-blue-600 hover:bg-blue-700">
                      Add Employee
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">All Employees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payrollData.map((employee: any) => (
                    <div key={employee.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-white">{employee.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{employee.name}</p>
                          <p className="text-sm text-gray-600">{employee.role}</p>
                          <p className="text-sm text-gray-600">{employee.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-gray-900">${employee.salary.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">Annual</p>
                          <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'} className="text-xs">
                            {employee.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => sendSMSNotification(employee.phone, `Hi ${employee.name}, this is a test message from FreightOps Pro.`)}>
                            <Phone className="w-4 h-4" />
                          </Button>
                        </div>
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
              <h2 className="text-2xl font-bold text-white">Fleet Operations</h2>
              <div className="flex gap-4">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Load
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Truck className="w-4 h-4 mr-2" />
                  Add Vehicle
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Active Loads</p>
                      <p className="text-2xl font-bold text-blue-600">47</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Fleet Vehicles</p>
                      <p className="text-2xl font-bold text-green-600">23</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Truck className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Miles</p>
                      <p className="text-2xl font-bold text-purple-600">185K</p>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Navigation className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Fuel Efficiency</p>
                      <p className="text-2xl font-bold text-orange-600">6.8 MPG</p>
                    </div>
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Gauge className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Recent Loads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { id: 'TB1234', route: 'Chicago → Denver', driver: 'John Smith', status: 'In Transit', revenue: '$3,200' },
                      { id: 'TB1235', route: 'Denver → Phoenix', driver: 'Lisa Chen', status: 'Delivered', revenue: '$2,800' },
                      { id: 'TB1236', route: 'Phoenix → LA', driver: 'Robert Johnson', status: 'Loading', revenue: '$2,400' },
                      { id: 'TB1237', route: 'LA → Seattle', driver: 'Maria Garcia', status: 'Scheduled', revenue: '$3,600' }
                    ].map((load) => (
                      <div key={load.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div>
                          <p className="font-medium text-gray-900">Load #{load.id}</p>
                          <p className="text-sm text-gray-600">{load.route}</p>
                          <p className="text-sm text-gray-600">Driver: {load.driver}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{load.revenue}</p>
                          <Badge variant={load.status === 'Delivered' ? 'default' : 'secondary'} className="text-xs">
                            {load.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Fleet Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { vehicle: 'Truck T-001', driver: 'John Smith', status: 'On Route', location: 'Denver, CO' },
                      { vehicle: 'Truck T-002', driver: 'Lisa Chen', status: 'Loading', location: 'Phoenix, AZ' },
                      { vehicle: 'Truck T-003', driver: 'Robert Johnson', status: 'Maintenance', location: 'Yard' },
                      { vehicle: 'Truck T-004', driver: 'Maria Garcia', status: 'Available', location: 'Seattle, WA' }
                    ].map((vehicle, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div>
                          <p className="font-medium text-gray-900">{vehicle.vehicle}</p>
                          <p className="text-sm text-gray-600">Driver: {vehicle.driver}</p>
                          <p className="text-sm text-gray-600">{vehicle.location}</p>
                        </div>
                        <Badge variant={vehicle.status === 'Available' ? 'default' : 'secondary'} className="text-xs">
                          {vehicle.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Platform Tab */}
          <TabsContent value="platform" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Platform Management</h2>
              <div className="flex gap-4">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Database className="w-4 h-4 mr-2" />
                  Backup Data
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Settings className="w-4 h-4 mr-2" />
                  System Settings
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">System Health</p>
                      <p className="text-2xl font-bold text-green-600">99.8%</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Activity className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Active Users</p>
                      <p className="text-2xl font-bold text-blue-600">18</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Storage Used</p>
                      <p className="text-2xl font-bold text-purple-600">68%</p>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Database className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">API Calls</p>
                      <p className="text-2xl font-bold text-orange-600">24.7K</p>
                    </div>
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Globe className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Integration Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { service: 'Stripe Payments', status: 'Connected', color: 'green' },
                      { service: 'SendGrid Email', status: 'Connected', color: 'green' },
                      { service: 'Twilio SMS', status: 'Connected', color: 'green' },
                      { service: 'DocuSeal API', status: 'Connected', color: 'green' },
                      { service: 'Tax Bandit API', status: 'Connected', color: 'green' },
                      { service: 'Banking API', status: 'Pending', color: 'yellow' }
                    ].map((integration, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full bg-${integration.color}-500`}></div>
                          <span className="font-medium text-gray-900">{integration.service}</span>
                        </div>
                        <Badge variant={integration.status === 'Connected' ? 'default' : 'secondary'} className="text-xs">
                          {integration.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">System Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { time: '09:45', event: 'User login: john@company.com', type: 'info' },
                      { time: '09:32', event: 'Payroll processed successfully', type: 'success' },
                      { time: '09:18', event: 'Email sent to maria@company.com', type: 'info' },
                      { time: '09:05', event: 'Database backup completed', type: 'success' },
                      { time: '08:47', event: 'System maintenance started', type: 'warning' }
                    ].map((log, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <span className="text-gray-500 w-12">{log.time}</span>
                        <div className={`w-2 h-2 rounded-full ${
                          log.type === 'success' ? 'bg-green-500' : 
                          log.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}></div>
                        <span className="text-gray-700">{log.event}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Business Settings</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Settings className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input id="company-name" defaultValue="FreightOps Pro Logistics" />
                  </div>
                  <div>
                    <Label htmlFor="dot-number">DOT Number</Label>
                    <Input id="dot-number" defaultValue="DOT-1234567" />
                  </div>
                  <div>
                    <Label htmlFor="mc-number">MC Number</Label>
                    <Input id="mc-number" defaultValue="MC-987654" />
                  </div>
                  <div>
                    <Label htmlFor="address">Business Address</Label>
                    <Textarea id="address" defaultValue="123 Logistics Lane, Transport City, TX 75001" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive email alerts for important events</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Bell className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">SMS Alerts</p>
                      <p className="text-sm text-gray-600">Get text messages for urgent notifications</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Push Notifications</p>
                      <p className="text-sm text-gray-600">Browser notifications for real-time updates</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Bell className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Security Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" placeholder="Enter current password" />
                  </div>
                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" placeholder="Enter new password" />
                  </div>
                  <div className="md:col-span-2">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Update Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}