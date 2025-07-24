import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Plus, Search, DollarSign, AlertCircle, CheckCircle, Clock, Users, CreditCard, BarChart3, Download } from "lucide-react";

export default function Billing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);

  // Get user's companies
  const { data: companies } = useQuery<any[]>({
    queryKey: ["/api/companies"],
    enabled: !!user,
  });

  const companyId = companies && Array.isArray(companies) && companies.length > 0 ? companies[0].id : undefined;

  // Fetch invoices
  const { data: invoices, isLoading: invoicesLoading, error: invoicesError } = useQuery({
    queryKey: ["/api/companies", companyId, "invoices"],
    enabled: !!companyId,
    retry: false,
  });

  // Fetch loads for invoice creation
  const { data: loads, isLoading: loadsLoading, error: loadsError } = useQuery({
    queryKey: ["/api/companies", companyId, "loads"],
    enabled: !!companyId,
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    const errors = [invoicesError, loadsError].filter((error): error is Error => error !== null);
    errors.forEach(error => {
      if (isUnauthorizedError(error)) {
        console.log("Unauthorized access - user may need to log in again");
      }
    });
  }, [invoicesError, loadsError]);

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: any) => {
      const response = await apiRequest("POST", `/api/companies/${companyId}/invoices`, invoiceData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Invoice Created",
        description: "Invoice has been created successfully",
      });
      setIsCreateInvoiceOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "invoices"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice",
        variant: "destructive",
      });
    },
  });

  const isLoading = invoicesLoading || loadsLoading;

  // Safe data handling
  const safeInvoices = Array.isArray(invoices) ? invoices : [];
  const safeLoads = Array.isArray(loads) ? loads : [];

  // Filter invoices based on search and status
  const filteredInvoices = safeInvoices.filter((invoice: any) => {
    const matchesSearch = invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || invoice.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

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

  // Calculate billing statistics
  const billingStats = {
    totalInvoices: safeInvoices.length,
    pendingInvoices: safeInvoices.filter((i: any) => i.status === 'pending').length,
    paidInvoices: safeInvoices.filter((i: any) => i.status === 'paid').length,
    overdueInvoices: safeInvoices.filter((i: any) => i.status === 'overdue').length,
    totalRevenue: safeInvoices.reduce((sum: number, invoice: any) => {
      return invoice.status === 'paid' ? sum + parseFloat(invoice.amount || 0) : sum;
    }, 0),
    pendingAmount: safeInvoices.reduce((sum: number, invoice: any) => {
      return invoice.status === 'pending' || invoice.status === 'sent' ? sum + parseFloat(invoice.amount || 0) : sum;
    }, 0),
  };

  // Individual content renderers for each submenu
  const renderInvoicesContent = () => (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Invoice Management</h2>
        <p className="text-gray-600">Manage all your invoices and billing details</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Invoices</p>
                <p className="text-2xl font-bold">{billingStats.totalInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold">{billingStats.pendingInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Paid</p>
                <p className="text-2xl font-bold">{billingStats.paidInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Overdue</p>
                <p className="text-2xl font-bold">{billingStats.overdueInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Detailed invoice management interface with filtering and actions</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderCustomersContent = () => (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
        <p className="text-gray-600">Manage customer information and billing details</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Customers</p>
                <p className="text-2xl font-bold">24</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-bold">22</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Outstanding</p>
                <p className="text-2xl font-bold">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search customers by name, email, or company..."
            className="pl-10"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="outstanding">Outstanding</SelectItem>
          </SelectContent>
        </Select>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Customer list */}
            <div className="border rounded-lg">
              <div className="p-4 border-b bg-gray-50">
                <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-700">
                  <div>Customer</div>
                  <div>Contact</div>
                  <div>Credit Terms</div>
                  <div>Outstanding</div>
                  <div>Status</div>
                  <div>Actions</div>
                </div>
              </div>
              
              <div className="divide-y">
                <div className="p-4 hover:bg-gray-50">
                  <div className="grid grid-cols-6 gap-4 text-sm">
                    <div>
                      <div className="font-medium">ABC Logistics Inc.</div>
                      <div className="text-gray-500">MC-123456</div>
                    </div>
                    <div>
                      <div className="font-medium">John Martinez</div>
                      <div className="text-gray-500">john@abclogistics.com</div>
                      <div className="text-gray-500">(555) 123-4567</div>
                    </div>
                    <div>
                      <div className="font-medium">Net 30</div>
                      <div className="text-gray-500">{creditLimit?.amount || 'No limit set'}</div>
                    </div>
                    <div>
                      <div className="font-medium text-green-600">{billingData?.currentBalance || 'Contact for details'}</div>
                      <div className="text-gray-500">Current</div>
                    </div>
                    <div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 hover:bg-gray-50">
                  <div className="grid grid-cols-6 gap-4 text-sm">
                    <div>
                      <div className="font-medium">XYZ Freight Solutions</div>
                      <div className="text-gray-500">MC-789012</div>
                    </div>
                    <div>
                      <div className="font-medium">Sarah Johnson</div>
                      <div className="text-gray-500">sarah@xyzfreight.com</div>
                      <div className="text-gray-500">(555) 987-6543</div>
                    </div>
                    <div>
                      <div className="font-medium">Net 15</div>
                      <div className="text-gray-500">{creditLimit?.secondary || 'No limit set'}</div>
                    </div>
                    <div>
                      <div className="font-medium text-red-600">{billingData?.pastDue || 'Contact for details'}</div>
                      <div className="text-gray-500">15 days overdue</div>
                    </div>
                    <div>
                      <Badge className="bg-red-100 text-red-800">Outstanding</Badge>
                    </div>
                    <div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 hover:bg-gray-50">
                  <div className="grid grid-cols-6 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Global Transport LLC</div>
                      <div className="text-gray-500">MC-345678</div>
                    </div>
                    <div>
                      <div className="font-medium">Mike Chen</div>
                      <div className="text-gray-500">mike@globaltransport.com</div>
                      <div className="text-gray-500">(555) 456-7890</div>
                    </div>
                    <div>
                      <div className="font-medium">Net 45</div>
                      <div className="text-gray-500">{creditLimit?.tertiary || 'No limit set'}</div>
                    </div>
                    <div>
                      <div className="font-medium text-yellow-600">{billingData?.pending || 'Contact for details'}</div>
                      <div className="text-gray-500">Due in 5 days</div>
                    </div>
                    <div>
                      <Badge className="bg-yellow-100 text-yellow-800">Due Soon</Badge>
                    </div>
                    <div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 hover:bg-gray-50">
                  <div className="grid grid-cols-6 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Premier Logistics Group</div>
                      <div className="text-gray-500">MC-901234</div>
                    </div>
                    <div>
                      <div className="font-medium">Lisa Rodriguez</div>
                      <div className="text-gray-500">lisa@premierlogistics.com</div>
                      <div className="text-gray-500">(555) 234-5678</div>
                    </div>
                    <div>
                      <div className="font-medium">Net 30</div>
                      <div className="text-gray-500">{creditLimit?.quaternary || 'No limit set'}</div>
                    </div>
                    <div>
                      <div className="font-medium text-green-600">{billingData?.activeBalance || 'Contact for details'}</div>
                      <div className="text-gray-500">Current</div>
                    </div>
                    <div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div>Showing 1-4 of 24 customers</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPaymentsContent = () => (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Payment Processing</h2>
        <p className="text-gray-600">Track and process all payments</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Received</p>
                <p className="text-2xl font-bold">{formatCurrency(billingStats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold">{formatCurrency(billingStats.pendingAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">This Month</p>
                <p className="text-2xl font-bold">{formatCurrency(12450)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Payment filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Input placeholder="Search payments..." className="max-w-sm" />
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            
            {/* Payment list */}
            <div className="border rounded-lg">
              <div className="p-4 border-b bg-gray-50">
                <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-700">
                  <div>Date</div>
                  <div>Customer</div>
                  <div>Invoice</div>
                  <div>Method</div>
                  <div>Amount</div>
                  <div>Status</div>
                </div>
              </div>
              
              <div className="divide-y">
                <div className="p-4 hover:bg-gray-50">
                  <div className="grid grid-cols-6 gap-4 text-sm">
                    <div className="text-gray-600">Dec 14, 2024</div>
                    <div className="font-medium">ABC Logistics Inc.</div>
                    <div className="font-medium">INV-001234</div>
                    <div>ACH Transfer</div>
                    <div className="font-medium text-green-600">{recentInvoices?.[0]?.amount || 'No data'}</div>
                    <div>
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 hover:bg-gray-50">
                  <div className="grid grid-cols-6 gap-4 text-sm">
                    <div className="text-gray-600">Dec 13, 2024</div>
                    <div className="font-medium">Global Transport LLC</div>
                    <div className="font-medium">INV-001233</div>
                    <div>Wire Transfer</div>
                    <div className="font-medium text-green-600">{recentInvoices?.[1]?.amount || 'No data'}</div>
                    <div>
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 hover:bg-gray-50">
                  <div className="grid grid-cols-6 gap-4 text-sm">
                    <div className="text-gray-600">Dec 12, 2024</div>
                    <div className="font-medium">Premier Logistics Group</div>
                    <div className="font-medium">INV-001232</div>
                    <div>Check</div>
                    <div className="font-medium text-yellow-600">$1,950.00</div>
                    <div>
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 hover:bg-gray-50">
                  <div className="grid grid-cols-6 gap-4 text-sm">
                    <div className="text-gray-600">Dec 11, 2024</div>
                    <div className="font-medium">Fast Freight Solutions</div>
                    <div className="font-medium">INV-001231</div>
                    <div>Credit Card</div>
                    <div className="font-medium text-red-600">$875.00</div>
                    <div>
                      <Badge className="bg-red-100 text-red-800">Failed</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 hover:bg-gray-50">
                  <div className="grid grid-cols-6 gap-4 text-sm">
                    <div className="text-gray-600">Dec 10, 2024</div>
                    <div className="font-medium">Metro Logistics Corp</div>
                    <div className="font-medium">INV-001230</div>
                    <div>ACH Transfer</div>
                    <div className="font-medium text-green-600">$3,150.00</div>
                    <div>
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div>Showing 1-5 of 142 payments</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );





  const renderReportsContent = () => (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Billing Reports</h2>
        <p className="text-gray-600">Generate and view detailed billing reports</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Financial Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Comprehensive billing and financial reporting tools</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderBillingOverview = () => (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Billing Overview</h2>
        <p className="text-gray-600">Complete billing management dashboard</p>
      </div>
      
      {/* Billing Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="freight-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(billingStats.totalRevenue)}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">
                From {billingStats.paidInvoices} paid invoices
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="freight-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Amount</p>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(billingStats.pendingAmount)}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">
                {billingStats.pendingInvoices} pending invoices
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="freight-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Paid Invoices</p>
                <p className="text-3xl font-bold text-green-600">{billingStats.paidInvoices}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">
                {billingStats.totalInvoices > 0 
                  ? Math.round((billingStats.paidInvoices / billingStats.totalInvoices) * 100)
                  : 0}% payment rate
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="freight-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Overdue</p>
                <p className="text-3xl font-bold text-red-600">{billingStats.overdueInvoices}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-red-600">Require immediate attention</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Recent billing activities and invoice updates</p>
        </CardContent>
      </Card>
    </div>
  );

  // Render different content based on current route
  const renderBillingContent = () => {
    switch (location) {
      case '/billing/invoices':
        return renderInvoicesContent();
      case '/billing/customers':
        return renderCustomersContent();
      case '/billing/payments':
        return renderPaymentsContent();

      case '/billing/reports':
        return renderReportsContent();
      default:
        return renderBillingOverview();
    }
  };

  return (
    <div className="transition-all duration-300 ease-in-out">
      {renderBillingContent()}
    </div>
  );
}