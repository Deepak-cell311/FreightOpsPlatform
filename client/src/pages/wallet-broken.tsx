import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Wallet, Plus, Search, TrendingUp, TrendingDown, DollarSign, CreditCard } from "lucide-react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.warn('Missing VITE_STRIPE_PUBLIC_KEY environment variable');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "You are subscribed!",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button type="submit" disabled={!stripe} className="w-full">
        Subscribe
      </Button>
    </form>
  );
};

export default function WalletPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState("");

  // Get user's companies
  const { data: companies } = useQuery({
    queryKey: ["/api/companies"],
    enabled: !!user,
  });

  const companyId = companies?.[0]?.id || null;

  // Fetch wallet transactions
  const { data: transactions, isLoading: transactionsLoading, error: transactionsError } = useQuery({
    queryKey: ["/api/companies", companyId, "wallet", "transactions"],
    enabled: !!companyId,
    retry: false,
  });

  // Fetch wallet balance
  const { data: balanceData, isLoading: balanceLoading, error: balanceError } = useQuery({
    queryKey: ["/api/companies", companyId, "wallet", "balance"],
    enabled: !!companyId,
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    const errors = [transactionsError, balanceError].filter(Boolean);
    errors.forEach(error => {
      if (error && isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    });
  }, [transactionsError, balanceError, toast]);

  // Get subscription client secret
  useEffect(() => {
    if (isSubscribeOpen && !clientSecret) {
      apiRequest("POST", "/api/get-or-create-subscription")
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          console.error("Error creating subscription:", error);
          toast({
            title: "Error",
            description: "Failed to initialize payment",
            variant: "destructive",
          });
        });
    }
  }, [isSubscribeOpen, clientSecret, toast]);

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: async (transactionData: any) => {
      return apiRequest("POST", `/api/companies/${companyId}/wallet/transactions`, transactionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "wallet"] });
      setIsAddTransactionOpen(false);
      toast({
        title: "Success",
        description: "Transaction recorded successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to record transaction",
        variant: "destructive",
      });
    },
  });

  const isLoading = transactionsLoading || balanceLoading;

  // Filter transactions
  const filteredTransactions = (transactions || []).filter((transaction: any) => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || transaction.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  // Get category badge color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'payment_received': return 'freight-status-in-transit';
      case 'fuel_expense': return 'freight-status-maintenance';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'payroll': return 'bg-purple-100 text-purple-800';
      case 'other': return 'freight-status-available';
      default: return 'freight-status-available';
    }
  };

  // Format currency
  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate wallet statistics
  const walletStats = {
    balance: balanceData?.balance || 0,
    totalCredits: (transactions || []).reduce((sum: number, tx: any) => {
      return tx.type === 'credit' ? sum + parseFloat(tx.amount || 0) : sum;
    }, 0),
    totalDebits: (transactions || []).reduce((sum: number, tx: any) => {
      return tx.type === 'debit' ? sum + parseFloat(tx.amount || 0) : sum;
    }, 0),
    thisMonthTransactions: (transactions || []).filter((tx: any) => {
      const txDate = new Date(tx.createdAt);
      const now = new Date();
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    }).length,
  };

  const handleCreateTransaction = (formData: FormData) => {
    const transactionData = {
      type: formData.get('type'),
      category: formData.get('category'),
      amount: parseFloat(formData.get('amount') as string) || 0,
      description: formData.get('description'),
      reference: formData.get('reference'),
    };
    createTransactionMutation.mutate(transactionData);
  };

  return (
    <div className="w-full min-h-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Wallet Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="freight-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Current Balance</p>
                  <p className={`text-3xl font-bold ${
                    walletStats.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(walletStats.balance)}
                  </p>
                </div>
                <div className="p-3 bg-primary-50 rounded-full">
                  <Wallet className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-gray-500">
                  {walletStats.balance >= 0 ? 'Available funds' : 'Outstanding balance'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="freight-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Income</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(walletStats.totalCredits)}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-gray-500">All-time credits</span>
              </div>
            </CardContent>
          </Card>

          <Card className="freight-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                  <p className="text-3xl font-bold text-red-600">
                    {formatCurrency(walletStats.totalDebits)}
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-full">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-gray-500">All-time debits</span>
              </div>
            </CardContent>
          </Card>

          <Card className="freight-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">This Month</p>
                  <p className="text-3xl font-bold text-blue-600">{walletStats.thisMonthTransactions}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-gray-500">Transactions</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="payment_received">Payment Received</SelectItem>
                <SelectItem value="fuel_expense">Fuel Expense</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="payroll">Payroll</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
              <DialogTrigger asChild>
                <Button className="freight-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Transaction</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateTransaction(new FormData(e.currentTarget));
                }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Type *</Label>
                      <Select name="type" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="credit">Credit (Income)</SelectItem>
                          <SelectItem value="debit">Debit (Expense)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select name="category" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="payment_received">Payment Received</SelectItem>
                          <SelectItem value="fuel_expense">Fuel Expense</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="payroll">Payroll</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="amount">Amount *</Label>
                    <Input 
                      id="amount" 
                      name="amount" 
                      type="number" 
                      step="0.01" 
                      required 
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea 
                      id="description" 
                      name="description" 
                      required
                      placeholder="Transaction description"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="reference">Reference (Optional)</Label>
                    <Input 
                      id="reference" 
                      name="reference"
                      placeholder="Invoice #, Load #, etc."
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddTransactionOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createTransactionMutation.isPending}
                      className="freight-button"
                    >
                      {createTransactionMutation.isPending ? "Adding..." : "Add Transaction"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isSubscribeOpen} onOpenChange={setIsSubscribeOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Manage Subscription
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Manage Subscription</DialogTitle>
                </DialogHeader>
                {clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <SubscribeForm />
                  </Elements>
                ) : (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <Button variant="outline">
              <CreditCard className="w-4 h-4 mr-2" />
              Issue Company Card
            </Button>
          </div>
        </div>

        {/* Company Cards Section */}
        <div className="mb-8">
          <Card className="freight-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Company Cards & Role-Based Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Card Statistics */}
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Active Cards</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Driver Cards:</span>
                        <Badge variant="secondary">8 Active</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Manager Cards:</span>
                        <Badge variant="secondary">3 Active</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Admin Cards:</span>
                        <Badge variant="secondary">2 Active</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Security Features</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Crypto purchases blocked</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>PIN transactions enabled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>ATM access allowed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Digital payments enabled</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role-Based Spending Controls */}
                <div className="space-y-4">
                  <h4 className="font-medium">Role-Based Spending Limits</h4>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium text-sm">Driver Role</h5>
                      <Badge variant="outline">Most Restricted</Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      Limited to: Fuel, maintenance, supplies, tolls, permits, hotels, rentals
                    </p>
                    <div className="text-xs text-gray-500">
                      Default limit: Contact for details
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium text-sm">Manager Role</h5>
                      <Badge variant="outline">Business Expenses</Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      Driver categories plus lodging and travel
                    </p>
                    <div className="text-xs text-gray-500">
                      Default limit: Contact for details
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium text-sm">Admin Role</h5>
                      <Badge variant="outline">Full Access</Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      Complete business access except crypto
                    </p>
                    <div className="text-xs text-gray-500">
                      Default limit: Contact for details
                    </div>
                  </div>
                </div>

                {/* Active Cards Management */}
                <div className="space-y-4">
                  <h4 className="font-medium">Card Management</h4>
                  
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-medium text-sm">John Smith</h5>
                          <p className="text-xs text-gray-600">Driver • Card ending in 4567</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <span>Monthly: {cardLimits?.driver?.current || '0'} / {cardLimits?.driver?.limit || 'Contact for limits'}</span>
                        <span>Driver Role</span>
                      </div>
                      <Button size="sm" variant="outline" className="w-full text-xs">
                        Edit Controls
                      </Button>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-medium text-sm">Sarah Johnson</h5>
                          <p className="text-xs text-gray-600">Manager • Card ending in 8901</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <span>Monthly: {cardLimits?.manager?.current || '0'} / {cardLimits?.manager?.limit || 'Contact for limits'}</span>
                        <span>Manager Role</span>
                      </div>
                      <Button size="sm" variant="outline" className="w-full text-xs">
                        Edit Controls
                      </Button>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-medium text-sm">Mike Davis</h5>
                          <p className="text-xs text-gray-600">Admin • Card ending in 2345</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <span>Monthly: {cardLimits?.executive?.current || '0'} / {cardLimits?.executive?.limit || 'Contact for limits'}</span>
                        <span>Admin Role</span>
                      </div>
                      <Button size="sm" variant="outline" className="w-full text-xs">
                        Edit Controls
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Admin privileges allow you to modify spending limits and purchase categories for any card
                  </div>
                  <Button className="freight-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Issue New Card
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card className="freight-card">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : filteredTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="freight-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Reference</th>
                      <th>Type</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTransactions.map((transaction: any) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="text-sm">
                          {formatDate(transaction.createdAt)}
                        </td>
                        <td>
                          <p className="font-medium">{transaction.description}</p>
                        </td>
                        <td>
                          <Badge className={getCategoryColor(transaction.category)}>
                            {transaction.category?.replace('_', ' ') || 'Other'}
                          </Badge>
                        </td>
                        <td className="text-sm text-gray-500">
                          {transaction.reference || '-'}
                        </td>
                        <td>
                          <div className="flex items-center space-x-1">
                            {transaction.type === 'credit' ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <span className={`text-sm font-medium ${
                              transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'credit' ? 'Credit' : 'Debit'}
                            </span>
                          </div>
                        </td>
                        <td className={`font-semibold ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No transactions found</p>
                <p className="text-sm">Add your first transaction to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
