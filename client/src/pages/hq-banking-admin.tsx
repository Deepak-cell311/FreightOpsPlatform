import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  CreditCard, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Plus,
  Search,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Download,
  ArrowLeftRight,
  Ban,
  CheckCircle,
  Settings
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";

export default function HQBankingAdmin() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [transferType, setTransferType] = useState<string>("");
  const [newLimits, setNewLimits] = useState<any>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query all customers
  const { data: customersData, isLoading: customersLoading, refetch: refetchCustomers } = useQuery({
    queryKey: ['/api/hq/customers'],
    refetchInterval: 30000,
  });

  // Query all accounts
  const { data: accountsData, isLoading: accountsLoading, refetch: refetchAccounts } = useQuery({
    queryKey: ['/api/hq/accounts'],
    refetchInterval: 30000,
  });

  // Fraud Controls Queries
  const { data: bankingCompanies = [] } = useQuery({
    queryKey: ["/api/hq/banking-companies"],
    enabled: selectedTab === "controls"
  });

  const { data: bankingControlsData, refetch: refetchBankingControls } = useQuery({
    queryKey: ["/api/hq/banking-controls", selectedCompany],
    enabled: Boolean(selectedCompany)
  });

  // Force transfer mutation
  const forceTransferMutation = useMutation({
    mutationFn: async (data: { companyId: string; amount: number; type: string; description: string }) => {
      return apiRequest("POST", "/api/hq/force-transfer", data);
    },
    onSuccess: () => {
      toast({
        title: "Transfer Executed",
        description: "Emergency transfer has been completed successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/hq/banking-controls", selectedCompany] });
      setTransferAmount("");
      setTransferType("");
    },
    onError: (error: any) => {
      toast({
        title: "Transfer Failed",
        description: error.message || "Failed to execute emergency transfer",
        variant: "destructive"
      });
    }
  });

  // Update limits mutation
  const updateLimitsMutation = useMutation({
    mutationFn: async (data: { companyId: string; limits: any; type: 'account' | 'card' }) => {
      return apiRequest("POST", "/api/hq/update-banking-limits", data);
    },
    onSuccess: () => {
      toast({
        title: "Limits Updated",
        description: "Banking limits have been updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/hq/banking-controls", selectedCompany] });
      setNewLimits({});
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update banking limits",
        variant: "destructive"
      });
    }
  });

  // Freeze/unfreeze account mutation
  const accountActionMutation = useMutation({
    mutationFn: async (data: { companyId: string; action: 'freeze' | 'unfreeze' | 'restrict' }) => {
      return apiRequest("POST", "/api/hq/account-action", data);
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Account Updated",
        description: `Account has been ${variables.action}d successfully`
      });
      queryClient.invalidateQueries({ queryKey: ["/api/hq/banking-controls", selectedCompany] });
    },
    onError: (error: any) => {
      toast({
        title: "Action Failed",
        description: error.message || "Failed to perform account action",
        variant: "destructive"
      });
    }
  });

  const customers = customersData?.data || [];
  const accounts = accountsData?.data || [];

  // Calculate overview metrics
  const totalCustomers = customers.length;
  const totalAccounts = accounts.length;
  const totalBalance = accounts.reduce((sum: number, acc: any) => {
    return sum + (acc.attributes.balance || 0);
  }, 0) / 100; // Convert from cents

  const activeAccounts = accounts.filter((acc: any) => acc.attributes.status === 'Open').length;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Open': { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      'Closed': { variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' },
      'Frozen': { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      'Active': { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      'Approved': { variant: 'default' as const, color: 'bg-blue-100 text-blue-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Active;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Banking Administration</h1>
          <p className="text-gray-600">Railsr banking platform management and oversight</p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="controls">Fraud Controls</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overview Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Customers</p>
                      <p className="text-2xl font-bold">{totalCustomers}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Accounts</p>
                      <p className="text-2xl font-bold">{totalAccounts}</p>
                    </div>
                    <Building2 className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Balance</p>
                      <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Accounts</p>
                      <p className="text-2xl font-bold">{activeAccounts}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Account Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accounts.slice(0, 5).map((account: any) => (
                    <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">Account {account.attributes.accountNumber}</p>
                          <p className="text-sm text-gray-500">
                            Created {formatDate(account.attributes.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency((account.attributes.balance || 0) / 100)}</p>
                        {getStatusBadge(account.attributes.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            {/* Customers Management */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => refetchCustomers()}
                  disabled={customersLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
              
              <Dialog open={showCreateCustomer} onOpenChange={setShowCreateCustomer}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Customer
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Customer & Account</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john@example.com" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" placeholder="+1 (555) 123-4567" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ssn">SSN</Label>
                        <Input id="ssn" placeholder="123-45-6789" />
                      </div>
                      <div>
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input id="dob" type="date" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowCreateCustomer(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => {
                        toast({
                          title: "Customer Created",
                          description: "New customer and account created successfully",
                        });
                        setShowCreateCustomer(false);
                      }}>
                        Create Customer
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customersLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                        </TableCell>
                      </TableRow>
                    ) : customers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No customers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      customers
                        .filter((customer: any) => 
                          !searchTerm || 
                          customer.attributes.fullName?.first?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.attributes.fullName?.last?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.attributes.email?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((customer: any) => (
                          <TableRow key={customer.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {customer.attributes.fullName?.first} {customer.attributes.fullName?.last}
                                </p>
                                <p className="text-sm text-gray-500">ID: {customer.id}</p>
                              </div>
                            </TableCell>
                            <TableCell>{customer.attributes.email}</TableCell>
                            <TableCell>{customer.attributes.phone}</TableCell>
                            <TableCell>{getStatusBadge(customer.attributes.status)}</TableCell>
                            <TableCell>{formatDate(customer.attributes.createdAt)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6">
            {/* Accounts Management */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => refetchAccounts()}
                  disabled={accountsLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accountsLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                        </TableCell>
                      </TableRow>
                    ) : accounts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No accounts found
                        </TableCell>
                      </TableRow>
                    ) : (
                      accounts.map((account: any) => (
                        <TableRow key={account.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{account.attributes.accountNumber}</p>
                              <p className="text-sm text-gray-500">
                                Routing: {account.attributes.routingNumber}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">Customer ID: {account.relationships?.customer?.data?.id}</p>
                          </TableCell>
                          <TableCell className="font-mono">
                            {formatCurrency((account.attributes.balance || 0) / 100)}
                          </TableCell>
                          <TableCell>{getStatusBadge(account.attributes.status)}</TableCell>
                          <TableCell className="capitalize">{account.attributes.depositProduct || 'Checking'}</TableCell>
                          <TableCell>{formatDate(account.attributes.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="controls" className="space-y-6">
            {/* Fraud Controls & Emergency Banking Management */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Fraud Controls & Emergency Banking</h2>
                <p className="text-gray-600">Administrative controls for tenant banking issues and fraud prevention</p>
              </div>
              <Badge variant="destructive" className="text-red-600 border-red-600">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Admin Access
              </Badge>
            </div>

            {/* Company Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Company</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a company with banking..." />
                  </SelectTrigger>
                  <SelectContent>
                    {bankingCompanies.map((company: any) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name} - DOT: {company.dotNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedCompany && (
              <>
                {/* Emergency Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ArrowLeftRight className="h-5 w-5 text-red-600" />
                        Emergency Transfers
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="transferAmount">Amount ($)</Label>
                          <Input
                            id="transferAmount"
                            type="number"
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label htmlFor="transferType">Type</Label>
                          <Select value={transferType} onValueChange={setTransferType}>
                            <SelectTrigger>
                              <SelectValue placeholder="Transfer type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="force_debit">Force Debit</SelectItem>
                              <SelectItem value="force_credit">Force Credit</SelectItem>
                              <SelectItem value="freeze_funds">Freeze Funds</SelectItem>
                              <SelectItem value="emergency_withdrawal">Emergency Withdrawal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button 
                        onClick={() => {
                          if (transferAmount && transferType && selectedCompany) {
                            forceTransferMutation.mutate({
                              companyId: selectedCompany,
                              amount: parseFloat(transferAmount),
                              type: transferType,
                              description: "Emergency HQ administrative transfer"
                            });
                          }
                        }}
                        variant="destructive"
                        disabled={!transferAmount || !transferType || forceTransferMutation.isPending}
                        className="w-full"
                      >
                        {forceTransferMutation.isPending ? "Processing..." : "Execute Emergency Transfer"}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Ban className="h-5 w-5 text-orange-600" />
                        Account Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        <Button
                          onClick={() => accountActionMutation.mutate({ companyId: selectedCompany, action: 'freeze' })}
                          variant="destructive"
                          disabled={accountActionMutation.isPending}
                          className="w-full"
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Freeze Account
                        </Button>
                        <Button
                          onClick={() => accountActionMutation.mutate({ companyId: selectedCompany, action: 'unfreeze' })}
                          variant="outline"
                          disabled={accountActionMutation.isPending}
                          className="w-full"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Unfreeze Account
                        </Button>
                        <Button
                          onClick={() => accountActionMutation.mutate({ companyId: selectedCompany, action: 'restrict' })}
                          variant="secondary"
                          disabled={accountActionMutation.isPending}
                          className="w-full"
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Restrict Account
                        </Button>
                      </div>
                      {accountActionMutation.isPending && (
                        <p className="text-sm text-gray-600 text-center">Processing account action...</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Banking Limits Management */}
                {bankingControlsData && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-blue-600" />
                          Account Limits
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Daily ACH Limit</Label>
                            <Input
                              type="number"
                              placeholder={bankingControlsData.currentLimits?.dailyACHLimit || "10000"}
                              value={newLimits.dailyACHLimit || ""}
                              onChange={(e) => setNewLimits({...newLimits, dailyACHLimit: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>Monthly ACH Limit</Label>
                            <Input
                              type="number"
                              placeholder={bankingControlsData.currentLimits?.monthlyACHLimit || "100000"}
                              value={newLimits.monthlyACHLimit || ""}
                              onChange={(e) => setNewLimits({...newLimits, monthlyACHLimit: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>Daily Wire Limit</Label>
                            <Input
                              type="number"
                              placeholder={bankingControlsData.currentLimits?.dailyWireLimit || "50000"}
                              value={newLimits.dailyWireLimit || ""}
                              onChange={(e) => setNewLimits({...newLimits, dailyWireLimit: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>Check Writing Limit</Label>
                            <Input
                              type="number"
                              placeholder={bankingControlsData.currentLimits?.checkWritingLimit || "25000"}
                              value={newLimits.checkWritingLimit || ""}
                              onChange={(e) => setNewLimits({...newLimits, checkWritingLimit: e.target.value})}
                            />
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            if (Object.keys(newLimits).length > 0) {
                              updateLimitsMutation.mutate({
                                companyId: selectedCompany,
                                limits: newLimits,
                                type: 'account'
                              });
                            }
                          }}
                          disabled={updateLimitsMutation.isPending || Object.keys(newLimits).length === 0}
                          className="w-full"
                        >
                          {updateLimitsMutation.isPending ? "Updating..." : "Update Account Limits"}
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-green-600" />
                          Card Limits
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Daily Spend Limit</Label>
                            <Input
                              type="number"
                              placeholder={bankingControlsData.cardLimits?.dailySpendLimit || "5000"}
                              value={newLimits.dailySpendLimit || ""}
                              onChange={(e) => setNewLimits({...newLimits, dailySpendLimit: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>Monthly Spend Limit</Label>
                            <Input
                              type="number"
                              placeholder={bankingControlsData.cardLimits?.monthlySpendLimit || "50000"}
                              value={newLimits.monthlySpendLimit || ""}
                              onChange={(e) => setNewLimits({...newLimits, monthlySpendLimit: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>ATM Withdrawal Limit</Label>
                            <Input
                              type="number"
                              placeholder={bankingControlsData.cardLimits?.atmWithdrawalLimit || "1000"}
                              value={newLimits.atmWithdrawalLimit || ""}
                              onChange={(e) => setNewLimits({...newLimits, atmWithdrawalLimit: e.target.value})}
                            />
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            const cardLimits = {
                              dailySpendLimit: newLimits.dailySpendLimit,
                              monthlySpendLimit: newLimits.monthlySpendLimit,
                              atmWithdrawalLimit: newLimits.atmWithdrawalLimit
                            };
                            if (Object.values(cardLimits).some(v => v)) {
                              updateLimitsMutation.mutate({
                                companyId: selectedCompany,
                                limits: cardLimits,
                                type: 'card'
                              });
                            }
                          }}
                          disabled={updateLimitsMutation.isPending}
                          className="w-full"
                        >
                          {updateLimitsMutation.isPending ? "Updating..." : "Update Card Limits"}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Current Status */}
                {bankingControlsData && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Banking Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Account Status</p>
                          <Badge variant={bankingControlsData.accountStatus === 'active' ? 'default' : 'destructive'}>
                            {bankingControlsData.accountStatus}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Railsr Account ID</p>
                          <p className="font-mono text-sm">{bankingControlsData.railsrAccountId}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Daily ACH Limit</p>
                          <p className="font-semibold">${bankingControlsData.currentLimits?.dailyACHLimit?.toLocaleString() || 'N/A'}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Card Daily Limit</p>
                          <p className="font-semibold">${bankingControlsData.cardLimits?.dailySpendLimit?.toLocaleString() || 'N/A'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            {/* System Monitoring */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    System Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div>
                        <p className="font-medium text-yellow-800">High Transaction Volume</p>
                        <p className="text-sm text-yellow-600">Unusual activity detected on Account 5648971</p>
                      </div>
                      <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                        Warning
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div>
                        <p className="font-medium text-green-800">System Status</p>
                        <p className="text-sm text-green-600">All Railsr API endpoints operational</p>
                      </div>
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        Healthy
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Response Time</span>
                      <span className="font-mono text-sm">143ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Success Rate</span>
                      <span className="font-mono text-sm text-green-600">99.9%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Requests/Hour</span>
                      <span className="font-mono text-sm">1,247</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}