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
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button type="submit" className="w-full mt-4">Subscribe</Button>
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

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    apiRequest("POST", "/api/get-or-create-subscription")
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        console.error("Error creating subscription:", error);
      });
  }, []);

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
  });

  // Fetch wallet balance
  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ["/api/companies", companyId, "wallet", "balance"],
    enabled: !!companyId,
  });

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: async (transactionData: any) => {
      const response = await apiRequest("POST", `/api/companies/${companyId}/wallet/transactions`, transactionData);
      if (!response.ok) {
        throw new Error("Failed to create transaction");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "wallet"] });
      toast({
        title: "Success",
        description: "Transaction added successfully",
      });
      setIsAddTransactionOpen(false);
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Session Expired",
          description: "Please log in again",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to create transaction",
        variant: "destructive",
      });
    },
  });

  // Handle errors
  useEffect(() => {
    if (transactionsError && isUnauthorizedError(transactionsError)) {
      toast({
        title: "Session Expired",
        description: "Please log in again",
        variant: "destructive",
      });
    }
  }, [transactionsError, toast]);

  // Loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isLoading = transactionsLoading || balanceLoading;

  // Filter transactions
  const filteredTransactions = (transactions || []).filter((transaction: any) => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || transaction.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Categories for filter dropdown
  const categories = [
    { value: "all", label: "All Categories" },
    { value: "fuel", label: "Fuel" },
    { value: "maintenance", label: "Maintenance" },
    { value: "insurance", label: "Insurance" },
    { value: "permits", label: "Permits" },
    { value: "other", label: "Other" },
  ];

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
      amount: parseFloat(formData.get('amount') as string),
      category: formData.get('category'),
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
          </CardContent>
        </Card>

        <Card className="freight-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Credits</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(walletStats.totalCredits)}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="freight-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Debits</p>
                <p className="text-3xl font-bold text-red-600">
                  {formatCurrency(walletStats.totalDebits)}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="freight-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">This Month</p>
                <p className="text-3xl font-bold text-blue-600">
                  {walletStats.thisMonthTransactions}
                </p>
                <p className="text-sm text-gray-500">Transactions</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="w-full sm:w-48">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
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
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fuel">Fuel</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="permits">Permits</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
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
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Transactions Table */}
      <Card className="freight-card">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Description</th>
                    <th className="text-left p-2">Category</th>
                    <th className="text-left p-2">Reference</th>
                    <th className="text-right p-2">Amount</th>
                    <th className="text-center p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction: any) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 text-sm">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="p-2">
                        <div className="font-medium">{transaction.description}</div>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline" className="text-xs">
                          {transaction.category}
                        </Badge>
                      </td>
                      <td className="p-2 text-sm text-gray-600">
                        {transaction.reference || "-"}
                      </td>
                      <td className={`p-2 text-right font-medium ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                      </td>
                      <td className="p-2 text-center">
                        <Badge className="bg-green-100 text-green-800">
                          Completed
                        </Badge>
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
  );
}