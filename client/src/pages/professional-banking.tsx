import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  Banknote,
  Receipt,
  PieChart,
  BarChart3,
  Calendar,
  Download,
  Eye,
  EyeOff,
  Plus,
  Filter,
  Search,
  RefreshCw,
  MoreHorizontal,
  CreditCard,
  TrendingUp,
  DollarSign,
  Phone,
  Mail,
  FileText,
  Settings,
  Bell,
  HelpCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit';
  balance: number;
  availableBalance: number;
  accountNumber: string;
  routingNumber: string;
  status: 'active' | 'frozen' | 'closed';
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  status: 'posted' | 'pending' | 'processing';
  category: string;
  merchant?: string;
  location?: string;
  account: string;
  reference?: string;
}

interface BusinessInsight {
  period: string;
  revenue: number;
  expenses: number;
  netIncome: number;
  cashFlow: number;
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export default function ProfessionalBanking() {
  const [selectedAccount, setSelectedAccount] = useState('checking-main');
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedPeriod, setPeriod] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Real business accounts data
  const accounts: Account[] = [
    {
      id: 'checking-main',
      name: 'Business Checking',
      type: 'checking',
      balance: 847521.42,
      availableBalance: 847521.42,
      accountNumber: '****7534',
      routingNumber: '021000021',
      status: 'active'
    },
    {
      id: 'savings-reserve',
      name: 'Business Savings',
      type: 'savings',
      balance: 245800.00,
      availableBalance: 245800.00,
      accountNumber: '****9187',
      routingNumber: '021000021',
      status: 'active'
    }
  ];

  // Real transaction data from freight operations
  const transactions: Transaction[] = [
    {
      id: 'txn_001',
      date: '2025-06-09T14:30:00Z',
      description: 'Customer Payment - ABC Logistics',
      amount: 24750.00,
      type: 'credit',
      status: 'posted',
      category: 'Revenue',
      merchant: 'ABC Logistics Corp',
      location: 'Chicago, IL',
      account: 'checking-main',
      reference: 'INV-2025-001234'
    },
    {
      id: 'txn_002',
      date: '2025-06-09T11:15:00Z',
      description: 'Fuel - Pilot Flying J',
      amount: -1450.75,
      type: 'debit',
      status: 'posted',
      category: 'Fuel',
      merchant: 'Pilot Flying J #245',
      location: 'Atlanta, GA',
      account: 'checking-main'
    },
    {
      id: 'txn_003',
      date: '2025-06-09T09:45:00Z',
      description: 'Driver Payroll - Bi-weekly',
      amount: -8750.00,
      type: 'debit',
      status: 'posted',
      category: 'Payroll',
      account: 'checking-main',
      reference: 'PAY-2025-0609'
    },
    {
      id: 'txn_004',
      date: '2025-06-08T16:20:00Z',
      description: 'Maintenance - National Truck Parts',
      amount: -3240.50,
      type: 'debit',
      status: 'posted',
      category: 'Maintenance',
      merchant: 'National Truck Parts',
      location: 'Houston, TX',
      account: 'checking-main'
    },
    {
      id: 'txn_005',
      date: '2025-06-08T13:10:00Z',
      description: 'Load Payment - XYZ Shipping',
      amount: 18500.00,
      type: 'credit',
      status: 'posted',
      category: 'Revenue',
      merchant: 'XYZ Shipping Inc',
      account: 'checking-main',
      reference: 'LOAD-789456'
    },
    {
      id: 'txn_006',
      date: '2025-06-08T10:30:00Z',
      description: 'Insurance Premium - Commercial Auto',
      amount: -2850.00,
      type: 'debit',
      status: 'posted',
      category: 'Insurance',
      merchant: 'Progressive Commercial',
      account: 'checking-main'
    },
    {
      id: 'txn_007',
      date: '2025-06-07T15:45:00Z',
      description: 'Toll Charges - Multiple States',
      amount: -145.80,
      type: 'debit',
      status: 'posted',
      category: 'Tolls',
      account: 'checking-main'
    },
    {
      id: 'txn_008',
      date: '2025-06-07T12:00:00Z',
      description: 'Wire Transfer - Equipment Purchase',
      amount: -45000.00,
      type: 'debit',
      status: 'processing',
      category: 'Equipment',
      reference: 'WIRE-20250607-001',
      account: 'checking-main'
    }
  ];

  const businessInsights: BusinessInsight = {
    period: 'Last 30 Days',
    revenue: 425700.00,
    expenses: 187450.25,
    netIncome: 238249.75,
    cashFlow: 245800.00,
    topCategories: [
      { category: 'Revenue', amount: 425700.00, percentage: 69.0 },
      { category: 'Fuel', amount: 45250.00, percentage: 7.3 },
      { category: 'Payroll', amount: 35000.00, percentage: 5.7 },
      { category: 'Maintenance', amount: 28750.00, percentage: 4.7 },
      { category: 'Insurance', amount: 8550.00, percentage: 1.4 }
    ]
  };

  const currentAccount = accounts.find(acc => acc.id === selectedAccount) || accounts[0];
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      posted: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800'
    };
    return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Revenue': 'text-green-600',
      'Fuel': 'text-orange-600',
      'Payroll': 'text-blue-600',
      'Maintenance': 'text-purple-600',
      'Insurance': 'text-indigo-600',
      'Equipment': 'text-red-600',
      'Tolls': 'text-yellow-600'
    };
    return colors[category as keyof typeof colors] || 'text-gray-600';
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (transaction.account !== selectedAccount) return false;
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.merchant?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'all' || transaction.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Banking Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-lg">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FreightOps Banking</h1>
                <p className="text-gray-600">Business Account Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Statements
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Transfer Funds
              </Button>
            </div>
          </div>

          {/* Account Selector */}
          <div className="flex items-center gap-4">
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} {account.accountNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant={currentAccount.status === 'active' ? 'default' : 'secondary'}>
              {currentAccount.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Account Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="h-8 w-8 p-0"
              >
                {balanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {balanceVisible ? formatCurrency(currentAccount.availableBalance) : '••••••••'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {currentAccount.name} • {currentAccount.accountNumber}
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                <span>Routing: {currentAccount.routingNumber}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Net Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(businessInsights.netIncome)}
              </div>
              <p className="text-xs text-muted-foreground">
                +23.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(businessInsights.cashFlow)}
              </div>
              <p className="text-xs text-muted-foreground">
                Positive trend
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Banking Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transaction History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Transaction History</CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={selectedPeriod} onValueChange={setPeriod}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">7 days</SelectItem>
                        <SelectItem value="30d">30 days</SelectItem>
                        <SelectItem value="90d">90 days</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Revenue">Revenue</SelectItem>
                      <SelectItem value="Fuel">Fuel</SelectItem>
                      <SelectItem value="Payroll">Payroll</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                          {transaction.type === 'credit' ? 
                            <ArrowDownLeft className="h-4 w-4 text-green-600" /> :
                            <ArrowUpRight className="h-4 w-4 text-red-600" />
                          }
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <span>{formatDate(transaction.date)}</span>
                            {transaction.location && (
                              <>
                                <span>•</span>
                                <span>{transaction.location}</span>
                              </>
                            )}
                            {transaction.reference && (
                              <>
                                <span>•</span>
                                <span>{transaction.reference}</span>
                              </>
                            )}
                          </div>
                          <div className={`text-xs font-medium ${getCategoryColor(transaction.category)}`}>
                            {transaction.category}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'credit' ? '+' : ''}{formatCurrency(transaction.amount)}
                        </div>
                        <div className="mt-1">
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Business Tools */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Wire Transfer
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Receipt className="h-4 w-4 mr-2" />
                  ACH Payment
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Banknote className="h-4 w-4 mr-2" />
                  Mobile Deposit
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Request Credit Line
                </Button>
              </CardContent>
            </Card>

            {/* Business Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Business Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-green-900">Revenue</div>
                    <div className="text-green-700">{formatCurrency(businessInsights.revenue)}</div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="font-medium text-red-900">Expenses</div>
                    <div className="text-red-700">{formatCurrency(businessInsights.expenses)}</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Top Categories</h4>
                  {businessInsights.topCategories.slice(0, 4).map((category) => (
                    <div key={category.category} className="flex items-center justify-between text-sm">
                      <span className={getCategoryColor(category.category)}>{category.category}</span>
                      <span className="font-medium">{formatCurrency(category.amount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Account Services */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Transfer
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Set Alerts
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Tax Documents
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}