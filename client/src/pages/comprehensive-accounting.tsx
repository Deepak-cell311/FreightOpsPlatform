import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { 
  DollarSign, 
  FileText, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Plus,
  Users,
  Building2,
  Receipt,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

interface AccountingSummary {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  accountsReceivable: number;
  accountsPayable: number;
  cashPosition: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  outstandingInvoices: number;
  overdueInvoices: number;
}

interface Customer {
  id: number;
  customerNumber: string;
  companyName: string;
  contactFirstName?: string;
  contactLastName?: string;
  email?: string;
  phone?: string;
  currentBalance: number;
  paymentTerms: string;
  isActive: boolean;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  customerId: number;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  status: string;
  loadId?: number;
}

interface Vendor {
  id: number;
  vendorNumber: string;
  companyName: string;
  contactFirstName?: string;
  contactLastName?: string;
  email?: string;
  phone?: string;
  currentBalance: number;
  paymentTerms: string;
  isActive: boolean;
}

interface Bill {
  id: number;
  billNumber: string;
  vendorId: number;
  vendorName: string;
  billDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  status: string;
}

interface Payment {
  id: number;
  paymentNumber: string;
  paymentDate: string;
  paymentMethod: string;
  paymentType: string;
  amount: number;
  customerName?: string;
  vendorName?: string;
  referenceNumber?: string;
  memo?: string;
  status: string;
}

interface BankTransaction {
  id: number;
  transactionId: string;
  transactionDate: string;
  description: string;
  amount: number;
  transactionType: string;
  category?: string;
  isReconciled: boolean;
  reconciledDate?: string;
}

export default function ComprehensiveAccounting() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [newInvoiceAmount, setNewInvoiceAmount] = useState('');
  const [newInvoiceCustomer, setNewInvoiceCustomer] = useState('');
  const [newBillAmount, setNewBillAmount] = useState('');
  const [newBillVendor, setNewBillVendor] = useState('');
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch accounting summary
  const { data: summary, isLoading: summaryLoading } = useQuery<AccountingSummary>({
    queryKey: ['/api/comprehensive-accounting/summary'],
    enabled: !!user,
  });

  // Fetch customers
  const { data: customers = [], isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ['/api/comprehensive-accounting/customers'],
    enabled: !!user,
  });

  // Fetch invoices
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ['/api/comprehensive-accounting/invoices'],
    enabled: !!user,
  });

  // Fetch vendors
  const { data: vendors = [], isLoading: vendorsLoading } = useQuery<Vendor[]>({
    queryKey: ['/api/comprehensive-accounting/vendors'],
    enabled: !!user,
  });

  // Fetch bills
  const { data: bills = [], isLoading: billsLoading } = useQuery<Bill[]>({
    queryKey: ['/api/comprehensive-accounting/bills'],
    enabled: !!user,
  });

  // Fetch payments
  const { data: payments = [], isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ['/api/comprehensive-accounting/payments'],
    enabled: !!user,
  });

  // Fetch bank transactions
  const { data: bankTransactions = [], isLoading: bankTransactionsLoading } = useQuery<BankTransaction[]>({
    queryKey: ['/api/comprehensive-accounting/bank-transactions'],
    enabled: !!user,
  });

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: { companyName: string; email?: string; phone?: string }) => {
      const response = await apiRequest('POST', '/api/comprehensive-accounting/customers', customerData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Customer Created",
        description: "New customer added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/comprehensive-accounting/customers'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create customer",
        variant: "destructive"
      });
    }
  });

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/comprehensive-accounting/invoices', {
        customerId: parseInt(newInvoiceCustomer),
        subtotal: parseFloat(newInvoiceAmount),
        taxAmount: parseFloat(newInvoiceAmount) * 0.08, // 8% tax
        totalAmount: parseFloat(newInvoiceAmount) * 1.08
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Invoice Created",
        description: `Invoice for $${newInvoiceAmount} created successfully`,
      });
      setNewInvoiceAmount('');
      setNewInvoiceCustomer('');
      queryClient.invalidateQueries({ queryKey: ['/api/comprehensive-accounting'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive"
      });
    }
  });

  // Record payment mutation
  const recordPaymentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/comprehensive-accounting/payments', {
        amount: parseFloat(newPaymentAmount),
        paymentMethod: newPaymentMethod,
        paymentType: 'customer_payment',
        customerId: selectedCustomer ? parseInt(selectedCustomer) : undefined
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Recorded",
        description: `Payment of $${newPaymentAmount} recorded successfully`,
      });
      setNewPaymentAmount('');
      setNewPaymentMethod('');
      setSelectedCustomer('');
      queryClient.invalidateQueries({ queryKey: ['/api/comprehensive-accounting'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive"
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'default';
      case 'overdue': return 'destructive';
      case 'pending': case 'draft': return 'secondary';
      case 'partial': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return <CheckCircle2 className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      case 'pending': case 'draft': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (summaryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounting</h1>
          <p className="text-muted-foreground">
            Complete financial management with integrated banking and transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Quick Actions
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="bills">Bills</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="banking">Banking</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Financial Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${(summary?.totalRevenue || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +${(summary?.monthlyRevenue || 0).toLocaleString()} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  ${(summary?.totalExpenses || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +${(summary?.monthlyExpenses || 0).toLocaleString()} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  (summary?.netIncome || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${(summary?.netIncome || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(summary?.netIncome || 0) >= 0 ? 'Profit' : 'Loss'} this period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cash Position</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(summary?.cashPosition || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Available cash flow
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Accounts Summary */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-green-600" />
                  Accounts Receivable
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  ${(summary?.accountsReceivable || 0).toLocaleString()}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Outstanding invoices:</span>
                    <span>{summary?.outstandingInvoices || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Overdue invoices:</span>
                    <span className="text-red-600">{summary?.overdueInvoices || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDownRight className="w-5 h-5 text-red-600" />
                  Accounts Payable
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 mb-2">
                  ${(summary?.accountsPayable || 0).toLocaleString()}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Unpaid bills:</span>
                    <span>{bills.filter(b => b.remainingBalance > 0).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Due this week:</span>
                    <span className="text-red-600">
                      {bills.filter(b => new Date(b.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoices.slice(0, 5).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{invoice.customerName}</div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.invoiceNumber} • {new Date(invoice.invoiceDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={getStatusColor(invoice.status)} className="flex items-center gap-1">
                          {getStatusIcon(invoice.status)}
                          {invoice.status}
                        </Badge>
                        <div className="font-bold">
                          ${invoice.totalAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{payment.customerName || payment.vendorName || 'General Payment'}</div>
                        <div className="text-sm text-muted-foreground">
                          {payment.paymentNumber} • {new Date(payment.paymentDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                        <div className="font-bold text-green-600">
                          ${payment.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          {/* Create Invoice */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Invoice
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="customer">Customer</Label>
                <Select value={newInvoiceCustomer} onValueChange={setNewInvoiceCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={newInvoiceAmount}
                  onChange={(e) => setNewInvoiceAmount(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={() => createInvoiceMutation.mutate()}
                  disabled={createInvoiceMutation.isPending || !newInvoiceAmount || !newInvoiceCustomer}
                  className="w-full"
                >
                  {createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Invoices List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Invoices</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : invoices.length > 0 ? (
                <div className="space-y-3">
                  {invoices
                    .filter(invoice => 
                      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="font-medium">{invoice.customerName}</div>
                          <Badge variant={getStatusColor(invoice.status)} className="flex items-center gap-1">
                            {getStatusIcon(invoice.status)}
                            {invoice.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.invoiceNumber} • Issued: {new Date(invoice.invoiceDate).toLocaleDateString()} • Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Paid: ${invoice.paidAmount.toLocaleString()} / Total: ${invoice.totalAmount.toLocaleString()}
                          {invoice.remainingBalance > 0 && (
                            <span className="text-red-600 ml-2">
                              (Balance: ${invoice.remainingBalance.toLocaleString()})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            ${invoice.totalAmount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No invoices found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          {/* Record Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Record Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="paymentCustomer">Customer (Optional)</Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="paymentAmount">Amount ($)</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  placeholder="0.00"
                  value={newPaymentAmount}
                  onChange={(e) => setNewPaymentAmount(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={newPaymentMethod} onValueChange={setNewPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="ach">ACH Transfer</SelectItem>
                    <SelectItem value="wire">Wire Transfer</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={() => recordPaymentMutation.mutate()}
                  disabled={recordPaymentMutation.isPending || !newPaymentAmount || !newPaymentMethod}
                  className="w-full"
                >
                  {recordPaymentMutation.isPending ? 'Recording...' : 'Record Payment'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payments List */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : payments.length > 0 ? (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="font-medium">
                            {payment.customerName || payment.vendorName || 'General Payment'}
                          </div>
                          <Badge variant={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {payment.paymentMethod}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {payment.paymentNumber} • {new Date(payment.paymentDate).toLocaleDateString()}
                          {payment.referenceNumber && ` • Ref: ${payment.referenceNumber}`}
                        </div>
                        {payment.memo && (
                          <div className="text-sm text-muted-foreground mt-1">
                            Note: {payment.memo}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-green-600">
                          ${payment.amount.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {payment.paymentType.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No payments recorded
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Customer Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : customers.length > 0 ? (
                <div className="space-y-3">
                  {customers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{customer.companyName}</div>
                        <div className="text-sm text-muted-foreground">
                          {customer.customerNumber}
                          {customer.email && ` • ${customer.email}`}
                          {customer.phone && ` • ${customer.phone}`}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Payment Terms: {customer.paymentTerms}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${customer.currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ${customer.currentBalance.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Current Balance
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No customers found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Vendor Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vendorsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : vendors.length > 0 ? (
                <div className="space-y-3">
                  {vendors.map((vendor) => (
                    <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{vendor.companyName}</div>
                        <div className="text-sm text-muted-foreground">
                          {vendor.vendorNumber}
                          {vendor.email && ` • ${vendor.email}`}
                          {vendor.phone && ` • ${vendor.phone}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${vendor.currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ${vendor.currentBalance.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Current Balance
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No vendors found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Bank Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bankTransactionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : bankTransactions.length > 0 ? (
                <div className="space-y-3">
                  {bankTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.transactionId} • {new Date(transaction.transactionDate).toLocaleDateString()}
                          {transaction.category && ` • ${transaction.category}`}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {transaction.isReconciled ? (
                            <Badge variant="default" className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Reconciled
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold text-lg ${
                          transaction.transactionType === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.transactionType === 'credit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.transactionType}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No bank transactions imported
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}