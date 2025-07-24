import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { 
  CreditCard, 
  Building2, 
  DollarSign,
  Plus,
  Send,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Settings,
  FileText,
  Shield,
  TrendingUp,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';

// Import the Railsr Banking Dashboard component
import RailsrBankingDashboard from '@/components/banking/RailsrBankingDashboard';

export default function BankingModule() {
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();

  // Check banking status
  const { data: bankingStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/banking/application-status'],
    enabled: !!user,
  });

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Banking Module</h1>
          <p className="text-muted-foreground">
            Professional banking services powered by Railsr
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            {bankingStatus?.hasApplication ? 'Active' : 'Setup Required'}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setActiveTab('settings')}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Accounts
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="cards" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Cards
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <RailsrBankingDashboard />
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-6">
          <AccountManagement />
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <TransactionHistory />
        </TabsContent>

        {/* Cards Tab */}
        <TabsContent value="cards" className="space-y-6">
          <CardManagement />
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <PaymentCenter />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <ReportsAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Account Management Component
function AccountManagement() {
  const { user } = useAuth();
  
  const { data: accounts, isLoading } = useQuery({
    queryKey: ['/api/railsr/companies', user?.companyId, 'accounts'],
    enabled: !!user?.companyId,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Account Management</h2>
        <Button onClick={() => alert('Add Account functionality - Coming soon!')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Primary Account */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Primary Business Account</span>
              <Badge variant="default">Primary</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Account Number</label>
                <div className="font-mono text-lg">**** 1234</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Routing Number</label>
                <div className="font-mono">083900314</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Account Type</label>
                <div>Business Checking</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Status</label>
                <Badge variant="outline" className="text-green-600">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Features */}
        <Card>
          <CardHeader>
            <CardTitle>Account Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">ACH Transfers</span>
                <Badge variant="outline" className="text-green-600">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Wire Transfers</span>
                <Badge variant="outline" className="text-green-600">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Check Deposits</span>
                <Badge variant="outline" className="text-green-600">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">International Transfers</span>
                <Badge variant="outline" className="text-blue-600">Contact Support</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Transaction History Component
function TransactionHistory() {
  const { user } = useAuth();
  
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/railsr/companies', user?.companyId, 'transactions'],
    enabled: !!user?.companyId,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => alert('Export transactions functionality - Coming soon!')}>
            <FileText className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            window.location.reload();
          }}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Transaction Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Date Range</label>
              <select className="w-full mt-1 p-2 border rounded">
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>Custom range</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Transaction Type</label>
              <select className="w-full mt-1 p-2 border rounded">
                <option>All types</option>
                <option>Credits</option>
                <option>Debits</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Status</label>
              <select className="w-full mt-1 p-2 border rounded">
                <option>All statuses</option>
                <option>Completed</option>
                <option>Pending</option>
                <option>Failed</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Amount Range</label>
              <select className="w-full mt-1 p-2 border rounded">
                <option>All amounts</option>
                <option>Under $100</option>
                <option>$100 - $1,000</option>
                <option>Over $1,000</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading transactions...</div>
            ) : (
              <div className="space-y-3">
                {/* Sample transactions - replace with real data */}
                {[
                  { id: 1, date: '2024-01-15', description: 'Fuel Payment - Shell', amount: -245.67, type: 'debit', status: 'completed' },
                  { id: 2, date: '2024-01-14', description: 'Load Payment - ABC Shipper', amount: 1500.00, type: 'credit', status: 'completed' },
                  { id: 3, date: '2024-01-13', description: 'Maintenance - Truck Repair', amount: -890.50, type: 'debit', status: 'completed' },
                  { id: 4, date: '2024-01-12', description: 'Insurance Premium', amount: -425.00, type: 'debit', status: 'pending' }
                ].map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'credit' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? 
                          <ArrowDownLeft className="w-4 h-4" /> : 
                          <ArrowUpRight className="w-4 h-4" />
                        }
                      </div>
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground">{transaction.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : ''}${transaction.amount.toLocaleString()}
                      </div>
                      <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Card Management Component
function CardManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Card Management</h2>
        <Button onClick={() => alert('Issue New Card functionality - Coming soon!')}>
          <Plus className="w-4 h-4 mr-2" />
          Issue New Card
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Active Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm">Business Debit Card</div>
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="font-mono text-lg mb-2">**** **** **** 1234</div>
                <div className="flex items-center justify-between text-sm">
                  <span>EXPIRES 12/25</span>
                  <span>JOHN DOE</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Card Status</span>
                <Badge variant="outline" className="text-green-600">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Daily Limit</span>
                <span className="font-medium">$2,500</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Card Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start" onClick={() => alert('View Card Details - Coming soon!')}>
                <Eye className="w-4 h-4 mr-2" />
                View Card Details
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => alert('Update Limits - Coming soon!')}>
                <Settings className="w-4 h-4 mr-2" />
                Update Limits
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => alert('Freeze Card - Coming soon!')}>
                <Shield className="w-4 h-4 mr-2" />
                Freeze Card
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => alert('Replace Card - Coming soon!')}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Replace Card
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Payment Center Component
function PaymentCenter() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Payment Center</h2>
        <Button onClick={() => {
          const amount = prompt('Enter payment amount:');
          const recipient = prompt('Enter recipient name:');
          const description = prompt('Enter payment description:');
          if (amount && recipient) {
            fetch('/api/banking/payments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ amount: parseFloat(amount), recipient, description })
            }).then(res => res.json()).then(data => {
              if (data.success) {
                alert('Payment scheduled successfully!');
              } else {
                alert('Failed to schedule payment: ' + data.message);
              }
            }).catch(err => alert('Error: ' + err.message));
          }
        }}>
          <Send className="w-4 h-4 mr-2" />
          New Payment
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Send className="w-4 h-4 mr-2" />
                Send ACH Transfer
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Wire Transfer
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Bulk Payments
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="w-4 h-4 mr-2" />
                Scheduled Payments
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending</span>
                <Badge variant="secondary">3</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Processing</span>
                <Badge variant="outline">1</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Completed Today</span>
                <Badge variant="default">12</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Failed</span>
                <Badge variant="destructive">0</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Limits */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Limits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Daily ACH Limit</span>
                  <span className="font-medium">$25,000</span>
                </div>
                <div className="text-xs text-muted-foreground">Used: $2,500 (10%)</div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Monthly Wire Limit</span>
                  <span className="font-medium">$100,000</span>
                </div>
                <div className="text-xs text-muted-foreground">Used: $15,000 (15%)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Reports & Analytics Component
function ReportsAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reports & Analytics</h2>
        <Button>
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Financial Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-green-600">$45,230</div>
                  <div className="text-sm text-muted-foreground">Total Inflows</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">$23,150</div>
                  <div className="text-sm text-muted-foreground">Total Outflows</div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="text-2xl font-bold">$22,080</div>
                <div className="text-sm text-muted-foreground">Net Cash Flow</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Account Statements
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="w-4 h-4 mr-2" />
                Cash Flow Analysis
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="w-4 h-4 mr-2" />
                Card Spending Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Compliance Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}