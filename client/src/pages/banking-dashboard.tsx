import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Building2, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  Banknote,
  Receipt,
  PieChart,
  BarChart3,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Download,
  Eye,
  EyeOff,
  Plus,
  Filter,
  Search,
  RefreshCw,
  MoreHorizontal,
  Zap,
  Target,
  Users
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  status: 'completed' | 'pending' | 'failed';
  category: string;
  merchant?: string;
  cardLast4?: string;
}

interface AccountBalance {
  available: number;
  pending: number;
  total: number;
}

interface Card {
  id: string;
  last4: string;
  type: 'virtual' | 'physical';
  status: 'active' | 'blocked' | 'pending';
  holderName: string;
  expiryMonth: number;
  expiryYear: number;
  limits: {
    daily: number;
    monthly: number;
    dailyUsed: number;
    monthlyUsed: number;
  };
}

export default function BankingDashboard() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Fetch account data
  const { data: accountData, isLoading: accountLoading } = useQuery({
    queryKey: ['/api/banking/account-summary'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch transactions
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/banking/transactions', selectedTimeframe, searchTerm, filterType],
    refetchInterval: 30000
  });

  // Fetch cards
  const { data: cardsData, isLoading: cardsLoading } = useQuery({
    queryKey: ['/api/banking/cards'],
    refetchInterval: 60000
  });

  // Use real data from API endpoints
  const balance = accountData?.balance || { available: 0, pending: 0, total: 0 };
  const transactions = transactionsData?.transactions || [];
  const cards = cardsData?.cards || [];
      status: 'completed',
      category: 'Tolls',
      cardLast4: '4721'
    }
  ];

  const { data: cardsData } = useQuery({
    queryKey: ["/api/banking/cards"],
    retry: false,
  });

  const realCards: Card[] = cardsData || [];

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
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      active: 'bg-green-100 text-green-800',
      blocked: 'bg-red-100 text-red-800'
    };
    return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const filteredTransactions = transactions.filter((transaction: Transaction) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.merchant?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FreightOps Banking</h1>
                <p className="text-gray-600">Enterprise Business Account</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <div className="relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Account Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBalanceVisible(!balanceVisible)}
              >
                {balanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {balanceVisible ? formatCurrency(balance.available) : '••••••'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Available Balance
              </p>
              {balanceVisible && balance.pending > 0 && (
                <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="text-sm font-medium text-yellow-800">
                    {formatCurrency(balance.pending)} pending
                  </div>
                  <div className="text-xs text-yellow-600">
                    Funds will be available within 1-2 business days
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {accountData?.monthlyIncome ? `+${formatCurrency(accountData.monthlyIncome)}` : formatCurrency(0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {accountData?.monthlyGrowth ? `${accountData.monthlyGrowth > 0 ? '+' : ''}${accountData.monthlyGrowth}% from last month` : 'No data available'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cards</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realCards.filter(c => c.status === 'active').length}</div>
              <p className="text-xs text-muted-foreground">
                {realCards.length} total cards
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transactions Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Transactions</CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
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
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="credit">Credits</SelectItem>
                      <SelectItem value="debit">Debits</SelectItem>
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
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-gray-600">
                            {formatDate(transaction.date)}
                            {transaction.cardLast4 && ` • Card •••• ${transaction.cardLast4}`}
                          </div>
                          <div className="text-xs text-gray-500">{transaction.category}</div>
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  New Transfer
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Request New Card
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Statement
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Center
                </Button>
              </CardContent>
            </Card>

            {/* Active Cards */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Cards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {realCards.map((card) => (
                  <div key={card.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className={`h-4 w-4 ${card.type === 'virtual' ? 'text-blue-500' : 'text-purple-500'}`} />
                        <span className="text-sm font-medium">•••• {card.last4}</span>
                      </div>
                      {getStatusBadge(card.status)}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{card.holderName}</div>
                    <div className="text-xs text-gray-500">
                      Daily: {formatCurrency(card.limits.dailyUsed)} / {formatCurrency(card.limits.daily)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full" 
                        style={{ width: `${(card.limits.dailyUsed / card.limits.daily) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Security Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <div className="text-sm">
                    <div className="font-medium text-green-800">All systems secure</div>
                    <div className="text-green-600">No suspicious activity detected</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <div className="text-sm">
                    <div className="font-medium text-blue-800">SIM swap protection active</div>
                    <div className="text-blue-600">Enhanced verification enabled</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}