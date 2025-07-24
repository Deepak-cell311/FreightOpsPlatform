import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
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
  Users
} from 'lucide-react';

interface RailsrBalance {
  balance: number;
  currency: string;
  available: number;
  pending: number;
}

interface RailsrTransaction {
  id: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  type: 'credit' | 'debit';
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
}

interface RailsrCard {
  id: string;
  cardNumber: string;
  expiryDate: string;
  cardholderName: string;
  status: 'active' | 'blocked' | 'expired';
  type: 'virtual' | 'physical';
}

export default function RailsrBankingDashboard() {
  const [cardOrderAmount, setCardOrderAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDescription, setTransferDescription] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch banking status
  const { data: bankingStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/banking/application-status'],
    enabled: !!user,
  });

  // Fetch account balance
  const { data: balance, isLoading: balanceLoading } = useQuery<RailsrBalance>({
    queryKey: ['/api/railsr/companies', user?.companyId, 'balance'],
    enabled: !!user?.companyId && !!bankingStatus?.hasApplication,
  });

  // Fetch recent transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery<RailsrTransaction[]>({
    queryKey: ['/api/railsr/companies', user?.companyId, 'transactions'],
    enabled: !!user?.companyId && !!bankingStatus?.hasApplication,
  });

  // Fetch company cards
  const { data: cards, isLoading: cardsLoading } = useQuery<RailsrCard[]>({
    queryKey: ['/api/railsr/companies', user?.companyId, 'cards'],
    enabled: !!user?.companyId && !!bankingStatus?.hasApplication,
  });

  // Initialize banking
  const initializeBankingMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/banking/submit-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: user?.companyName,
          businessType: 'Transportation',
          dotNumber: user?.dotNumber,
          mcNumber: user?.mcNumber
        })
      });
      if (!response.ok) throw new Error('Failed to initialize banking');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Banking Initialized",
        description: "Your Railsr banking integration is now active",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/banking/application-status'] });
    },
    onError: () => {
      toast({
        title: "Initialization Failed",
        description: "Unable to initialize banking. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Create driver card
  const createCardMutation = useMutation({
    mutationFn: async (driverId: string) => {
      const response = await fetch(`/api/railsr/companies/${user?.companyId}/drivers/${driverId}/card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardType: 'virtual',
          spendingLimit: parseFloat(cardOrderAmount) || 1000
        })
      });
      if (!response.ok) throw new Error('Failed to create card');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Card Created",
        description: "Driver card has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/railsr/companies', user?.companyId, 'cards'] });
    },
    onError: () => {
      toast({
        title: "Card Creation Failed",
        description: "Unable to create card. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Process payment
  const paymentMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/railsr/companies/${user?.companyId}/payments/vendor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(transferAmount),
          description: transferDescription,
          currency: 'USD'
        })
      });
      if (!response.ok) throw new Error('Payment failed');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Processed",
        description: `$${transferAmount} payment processed successfully`,
      });
      setTransferAmount('');
      setTransferDescription('');
      queryClient.invalidateQueries({ queryKey: ['/api/railsr/companies', user?.companyId, 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/railsr/companies', user?.companyId, 'transactions'] });
    },
    onError: () => {
      toast({
        title: "Payment Failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive"
      });
    }
  });

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!bankingStatus?.hasApplication) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Railsr Banking</h1>
            <p className="text-muted-foreground">Enterprise Banking-as-a-Service</p>
          </div>
        </div>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-blue-600" />
            <CardTitle className="text-blue-900">Initialize Railsr Banking</CardTitle>
            <p className="text-blue-700">
              Set up your integrated banking solution with Railsr's Banking-as-a-Service platform
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-white rounded-lg border">
                <CreditCard className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-medium">Business Accounts</h3>
                <p className="text-sm text-muted-foreground">Multi-currency ledgers</p>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-medium">Driver Cards</h3>
                <p className="text-sm text-muted-foreground">Corporate expense cards</p>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <Send className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-medium">Payments</h3>
                <p className="text-sm text-muted-foreground">ACH & wire transfers</p>
              </div>
            </div>
            <Button 
              onClick={() => initializeBankingMutation.mutate()}
              disabled={initializeBankingMutation.isPending}
              size="lg"
              className="w-full md:w-auto"
            >
              {initializeBankingMutation.isPending ? 'Initializing...' : 'Initialize Banking'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Railsr Banking</h1>
          <p className="text-muted-foreground">
            Enterprise Banking-as-a-Service Dashboard
          </p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-600">
          <CheckCircle className="w-4 h-4 mr-1" />
          Active
        </Badge>
      </div>

      {/* Account Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {balanceLoading ? 'Loading...' : `$${(balance?.available || 0).toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground">
              Total: ${(balance?.balance || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {balanceLoading ? 'Loading...' : `$${(balance?.pending || 0).toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground">
              Processing
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cards</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cardsLoading ? 'Loading...' : (cards?.length || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Driver cards issued
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Quick Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Payment description"
                value={transferDescription}
                onChange={(e) => setTransferDescription(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => paymentMutation.mutate()}
              disabled={paymentMutation.isPending || !transferAmount}
              className="w-full"
            >
              {paymentMutation.isPending ? 'Processing...' : 'Send Payment'}
            </Button>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Account Number</Label>
                <div className="font-mono">****{bankingStatus?.accountNumber?.slice(-4) || '0000'}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Routing Number</Label>
                <div className="font-mono">{bankingStatus?.routingNumber || 'N/A'}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Currency</Label>
                <div>USD</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Environment</Label>
                <div className="capitalize">{bankingStatus?.environment || 'Play'}</div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Railsr Integration</span>
                <Badge variant="outline" className="text-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="text-center py-8">Loading transactions...</div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.slice(0, 5).map((transaction) => (
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
                      <div className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </div>
                    <Badge variant={
                      transaction.status === 'completed' ? 'default' :
                      transaction.status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No transactions yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}