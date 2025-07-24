import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import { 
  CreditCard, 
  DollarSign, 
  Building2, 
  Plus, 
  Eye, 
  EyeOff, 
  Download,
  ArrowUpDown,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Truck,
  Users,
  Receipt
} from "lucide-react";

interface BankingAccount {
  id: string;
  name: string;
  accountNumber: string;
  routingNumber: string;
  balance: number;
  available: number;
  hold: number;
  status: string;
  type: string;
}

interface BankingCard {
  id: string;
  last4: string;
  status: string;
  type: string;
  limits: {
    dailyPurchase: number;
    monthlyPurchase: number;
  };
}

interface BankingTransaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  status: string;
  direction: string;
  counterparty?: {
    name: string;
  };
  tags?: {
    loadId?: string;
    paymentType?: string;
  };
}

export function RailsrBankingDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  // Fetch banking status
  const { data: bankingStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/banking/status"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/banking/status");
      return await res.json();
    },
  });

  // Fetch accounts
  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ["/api/banking/accounts"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/banking/accounts");
      return await res.json();
    },
    enabled: bankingStatus?.connected,
  });

  // Fetch cards
  const { data: cards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ["/api/banking/cards"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/banking/cards");
      return await res.json();
    },
    enabled: bankingStatus?.connected,
  });

  // Fetch recent transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/banking/transactions", selectedAccount],
    queryFn: async () => {
      if (!selectedAccount) return [];
      const res = await apiRequest("GET", `/api/banking/accounts/${selectedAccount}/transactions`);
      return await res.json();
    },
    enabled: !!selectedAccount,
  });

  // Initialize banking mutation
  const initializeBankingMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/banking/initialize", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banking/status"] });
      toast({
        title: "Banking Initialized",
        description: "Your business banking account has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Banking Setup Failed",
        description: error.message || "Failed to initialize banking services",
        variant: "destructive",
      });
    },
  });

  // Issue card mutation
  const issueCardMutation = useMutation({
    mutationFn: async (data: { accountId: string; cardType: string; limits?: any }) => {
      const res = await apiRequest("POST", "/api/banking/cards", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banking/cards"] });
      toast({
        title: "Card Issued",
        description: "New debit card has been issued successfully.",
      });
    },
  });

  // Process payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/banking/payments", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banking/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/banking/accounts"] });
      toast({
        title: "Payment Processed",
        description: "Payment has been initiated successfully.",
      });
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100); // Railsr amounts are in cents
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Open': { variant: 'default' as const, label: 'Active' },
      'Active': { variant: 'default' as const, label: 'Active' },
      'Pending': { variant: 'secondary' as const, label: 'Pending' },
      'Frozen': { variant: 'destructive' as const, label: 'Frozen' },
      'Closed': { variant: 'outline' as const, label: 'Closed' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Banking not initialized
  if (!bankingStatus?.connected) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Building2 className="h-6 w-6" />
            Business Banking Setup
          </CardTitle>
          <p className="text-sm text-gray-600">
            Initialize your business banking account to access financial services
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-medium">Business Checking</h3>
              <p className="text-sm text-gray-500">FDIC insured accounts</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CreditCard className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium">Debit Cards</h3>
              <p className="text-sm text-gray-500">Virtual & physical cards</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <ArrowUpDown className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-medium">ACH Transfers</h3>
              <p className="text-sm text-gray-500">Automated payments</p>
            </div>
          </div>

          <Separator />

          <div className="text-center">
            <Button 
              onClick={() => initializeBankingMutation.mutate({
                companyName: user?.companyName,
                email: user?.email,
              })}
              disabled={initializeBankingMutation.isPending}
              size="lg"
            >
              {initializeBankingMutation.isPending ? "Setting up..." : "Initialize Business Banking"}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Powered by Railsr • FCA Regulated • Bank-grade security
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main banking dashboard
  return (
    <div className="space-y-6">
      {/* Account Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accounts.map((account: BankingAccount) => (
          <Card key={account.id} className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {account.name}
              </CardTitle>
              {getStatusBadge(account.status)}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {formatCurrency(account.available)}
                </div>
                <p className="text-xs text-gray-500">
                  Available Balance
                </p>
                
                {account.hold > 0 && (
                  <div className="text-sm">
                    <span className="text-gray-500">On Hold: </span>
                    <span className="font-medium">{formatCurrency(account.hold)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAccount(account.id);
                      setShowAccountDetails(!showAccountDetails);
                    }}
                  >
                    {showAccountDetails && selectedAccount === account.id ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAccount(account.id)}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>

                {showAccountDetails && selectedAccount === account.id && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-500">Account: </span>
                      <span className="font-mono">***{account.accountNumber.slice(-4)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Routing: </span>
                      <span className="font-mono">{account.routingNumber}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="matching">Load Matching</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Transactions
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No transactions found</p>
                  <p className="text-sm">Transactions will appear here once you start using your account</p>
                </div>
              ) : (
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {transactions.map((transaction: BankingTransaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            transaction.direction === 'Credit' ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-gray-500">
                              {transaction.counterparty?.name || 'Internal transfer'}
                            </p>
                            {transaction.tags?.loadId && (
                              <Badge variant="outline" className="text-xs mt-1">
                                Load #{transaction.tags.loadId.slice(-6)}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            transaction.direction === 'Credit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.direction === 'Credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Debit Cards
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Issue Card
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Issue New Debit Card</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Card Type</Label>
                        <select className="w-full mt-1 p-2 border rounded">
                          <option value="virtual">Virtual Card</option>
                          <option value="physical">Physical Card</option>
                        </select>
                      </div>
                      <div>
                        <Label>Daily Purchase Limit</Label>
                        <Input type="number" placeholder="5000" />
                      </div>
                      <div>
                        <Label>Monthly Purchase Limit</Label>
                        <Input type="number" placeholder="50000" />
                      </div>
                      <Button 
                        onClick={() => issueCardMutation.mutate({
                          accountId: accounts[0]?.id,
                          cardType: 'virtual',
                        })}
                        disabled={issueCardMutation.isPending}
                        className="w-full"
                      >
                        {issueCardMutation.isPending ? "Issuing..." : "Issue Card"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cardsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : cards.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No cards issued</p>
                  <p className="text-sm">Issue your first debit card to start making payments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cards.map((card: BankingCard) => (
                    <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <CreditCard className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium">•••• •••• •••• {card.last4}</p>
                          <p className="text-sm text-gray-500">{card.type}</p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        {getStatusBadge(card.status)}
                        <div className="text-sm text-gray-500">
                          Daily: {formatCurrency(card.limits.dailyPurchase)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Center</CardTitle>
              <p className="text-sm text-gray-600">
                Process payments for loads, driver payroll, and expenses
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-24 flex-col">
                  <Truck className="h-6 w-6 mb-2" />
                  Pay for Load
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  Driver Payroll
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <Receipt className="h-6 w-6 mb-2" />
                  Pay Expense
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matching" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Transaction Matching
              </CardTitle>
              <p className="text-sm text-gray-600">
                Automatically match bank transactions with loads and expenses
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Automatic Matching Active</p>
                      <p className="text-sm text-gray-600">Transactions are being matched with loads in real-time</p>
                    </div>
                  </div>
                  <Badge variant="outline">24 matched today</Badge>
                </div>

                <Button variant="outline" className="w-full">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Review Unmatched Transactions (3)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}