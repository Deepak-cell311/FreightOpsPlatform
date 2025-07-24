import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Banknote, CreditCard, TrendingUp, AlertTriangle, RefreshCw, DollarSign } from 'lucide-react';

interface BankingData {
  totalBalance: number;
  pendingTransactions: number;
  monthlyVolume: number;
  accounts: Array<{
    id: string;
    tenantId: string;
    accountType: string;
    balance: number;
    status: string;
    lastSync: string;
  }>;
  recentTransactions: Array<{
    id: string;
    amount: number;
    type: string;
    status: string;
    description: string;
    createdAt: string;
  }>;
}

export function BankingConsole() {
  const [bankingData, setBankingData] = useState<BankingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchBankingData();
  }, []);

  const fetchBankingData = async () => {
    try {
      const response = await fetch('/api/hq/banking');
      if (response.ok) {
        const data = await response.json();
        setBankingData(data);
      } else {
        // Fallback data for development
        setBankingData({
          totalBalance: 2847650,
          pendingTransactions: 23,
          monthlyVolume: 8925400,
          accounts: [
            {
              id: 'acc_1',
              tenantId: 'tenant_1',
              accountType: 'business_checking',
              balance: 450000,
              status: 'active',
              lastSync: new Date().toISOString()
            },
            {
              id: 'acc_2',
              tenantId: 'tenant_2',
              accountType: 'business_checking',
              balance: 320000,
              status: 'active',
              lastSync: new Date().toISOString()
            }
          ],
          recentTransactions: [
            {
              id: 'txn_1',
              amount: 15000,
              type: 'credit',
              status: 'completed',
              description: 'Load payment - ABC Logistics',
              createdAt: new Date().toISOString()
            },
            {
              id: 'txn_2',
              amount: -2500,
              type: 'debit',
              status: 'completed',
              description: 'Fuel purchase - Shell',
              createdAt: new Date().toISOString()
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching banking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncBankingData = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/hq/banking/sync', {
        method: 'POST',
      });
      if (response.ok) {
        await fetchBankingData();
      }
    } catch (error) {
      console.error('Error syncing banking data:', error);
    } finally {
      setSyncing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'active': 'default',
      'pending': 'secondary',
      'suspended': 'destructive',
      'completed': 'default',
      'processing': 'secondary',
      'failed': 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banking Overview */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Banking Console</h2>
        <Button onClick={syncBankingData} disabled={syncing} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Banking Data'}
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(bankingData?.totalBalance || 0)}</div>
            <p className="text-xs text-muted-foreground">Across all tenant accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{bankingData?.pendingTransactions || 0}</div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(bankingData?.monthlyVolume || 0)}</div>
            <p className="text-xs text-muted-foreground">Transaction volume</p>
          </CardContent>
        </Card>
      </div>

      {/* Account Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tenant Banking Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            {bankingData?.accounts && bankingData.accounts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Sync</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankingData.accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.tenantId}</TableCell>
                      <TableCell className="capitalize">{account.accountType.replace('_', ' ')}</TableCell>
                      <TableCell>{formatCurrency(account.balance)}</TableCell>
                      <TableCell>{getStatusBadge(account.status)}</TableCell>
                      <TableCell>{new Date(account.lastSync).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Banknote className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No banking accounts found</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {bankingData?.recentTransactions && bankingData.recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {bankingData.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                        <DollarSign className={`h-4 w-4 ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-xs text-gray-500">{new Date(transaction.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                      </p>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No recent transactions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Banking Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Banking Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Account Management</h4>
              <p className="text-sm text-gray-600 mb-3">Manage tenant banking accounts</p>
              <Button variant="outline" size="sm">Manage Accounts</Button>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Transaction Monitoring</h4>
              <p className="text-sm text-gray-600 mb-3">Monitor and review transactions</p>
              <Button variant="outline" size="sm">View Transactions</Button>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Compliance Reporting</h4>
              <p className="text-sm text-gray-600 mb-3">Generate compliance reports</p>
              <Button variant="outline" size="sm">Generate Reports</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}