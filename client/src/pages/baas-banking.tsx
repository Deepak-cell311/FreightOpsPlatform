import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import DashboardLayout from "@/components/dashboard-layout";
import {
  Banknote,
  CreditCard,
  Building2,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  Calendar,
  Clock,
  Copy,
  CheckCircle,
  AlertCircle,
  Plus,
  Wallet,
  Receipt,
} from "lucide-react";

export default function BaaSBanking() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [showAccountSetup, setShowAccountSetup] = useState(false);
  const [showCardIssuance, setShowCardIssuance] = useState(false);
  const [copiedText, setCopiedText] = useState("");

  // Fetch BaaS account info
  const { data: account, isLoading: accountLoading } = useQuery({
    queryKey: ["/api/baas/account"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/baas/account");
      return response.json();
    },
    retry: false,
  });

  // Fetch real transaction data from banking API
  const { data: transactionData, isLoading: transactionLoading } = useQuery({
    queryKey: ["/api/baas/transactions"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/baas/transactions");
      return response.json();
    },
    enabled: !!account,
    retry: false,
  });

  const achPayments = transactionData?.achPayments || [];
  const wireTransfers = transactionData?.wireTransfers || [];

  // Create BaaS account mutation
  const createAccountMutation = useMutation({
    mutationFn: async (businessInfo: any) => {
      const response = await apiRequest("POST", "/api/baas/create-account", businessInfo);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/baas/account"] });
      setShowAccountSetup(false);
      toast({ title: "Banking account created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create account", description: error.message, variant: "destructive" });
    },
  });

  // Issue debit card mutation
  const issueCardMutation = useMutation({
    mutationFn: async (cardDetails: any) => {
      const response = await apiRequest("POST", "/api/baas/issue-card", cardDetails);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/baas/cards"] });
      setShowCardIssuance(false);
      toast({ title: "Debit card issued successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to issue card", description: error.message, variant: "destructive" });
    },
  });

  // Generate payment instructions
  const generateInstructionsMutation = useMutation({
    mutationFn: async (data: { invoiceAmount: number; invoiceNumber: string }) => {
      const response = await apiRequest("POST", "/api/baas/payment-instructions", data);
      return response.json();
    },
    onSuccess: (data) => {
      setPaymentInstructions(data);
      setShowInstructions(true);
    },
  });

  const [paymentInstructions, setPaymentInstructions] = useState<any>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    toast({ title: `${label} copied to clipboard` });
    setTimeout(() => setCopiedText(""), 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': case 'returned': case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!account && !accountLoading) {
    return (
      <DashboardLayout title="Business Banking" description="Real ACH and wire receiving for your trucking company">
        <div className="max-w-4xl mx-auto p-6">
          <Card className="text-center">
            <CardHeader>
              <Building2 className="h-16 w-16 mx-auto text-blue-600 mb-4" />
              <CardTitle className="text-2xl mb-2">Set Up Business Banking</CardTitle>
              <p className="text-gray-600">
                Get real routing and account numbers to receive ACH and wire payments from your customers
              </p>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowAccountSetup(true)} size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create Banking Account
              </Button>
            </CardContent>
          </Card>

          {/* Account Setup Dialog */}
          <Dialog open={showAccountSetup} onOpenChange={setShowAccountSetup}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Business Banking Account</DialogTitle>
              </DialogHeader>
              <AccountSetupForm onSubmit={(data) => createAccountMutation.mutate(data)} />
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Business Banking" description="Manage ACH, wire transfers, and debit cards">
      <div className="max-w-7xl mx-auto p-6">
        {/* Account Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(account?.balance || 0)}</div>
              <p className="text-xs text-muted-foreground">
                Available: {formatCurrency(account?.availableBalance || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(245750)}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ACH Payments</CardTitle>
              <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{achPayments?.payments?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wire Transfers</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wireTransfers?.wires?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ach">ACH Payments</TabsTrigger>
            <TabsTrigger value="wires">Wire Transfers</TabsTrigger>
            <TabsTrigger value="cards">Debit Cards</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Account Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-500">Routing Number</Label>
                      <div className="flex items-center justify-between">
                        <span className="font-mono">{account?.routingNumber}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(account?.routingNumber, "Routing number")}
                        >
                          {copiedText === "Routing number" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Account Number</Label>
                      <div className="flex items-center justify-between">
                        <span className="font-mono">{account?.accountNumber}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(account?.accountNumber, "Account number")}
                        >
                          {copiedText === "Account number" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Account Status</Label>
                    <Badge className={getStatusColor(account?.status || 'pending')}>
                      {account?.status || 'Pending'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Instructions Generator */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Receipt className="h-5 w-5 mr-2" />
                    Generate Payment Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentInstructionsForm 
                    onSubmit={(data) => generateInstructionsMutation.mutate(data)} 
                    isLoading={generateInstructionsMutation.isPending}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achPayments?.payments?.slice(0, 5).map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <ArrowDownLeft className="h-8 w-8 p-2 bg-green-100 text-green-600 rounded-full" />
                        <div>
                          <p className="font-medium">{payment.originator.name}</p>
                          <p className="text-sm text-gray-500">ACH Transfer</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">+{formatCurrency(payment.amount)}</p>
                        <p className="text-sm text-gray-500">{new Date(payment.effectiveDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ach" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowDownLeft className="h-5 w-5 mr-2" />
                  ACH Payments Received
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achPayments?.payments?.map((payment: any) => (
                    <div key={payment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-medium">{payment.originator.name}</p>
                            <p className="text-sm text-gray-500">{payment.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">+{formatCurrency(payment.amount)}</p>
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <Label className="text-gray-500">Effective Date</Label>
                          <p>{new Date(payment.effectiveDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <Label className="text-gray-500">Reference</Label>
                          <p>{payment.metadata.customerReference || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-500">Invoice</Label>
                          <p>{payment.metadata.invoiceNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-500">Fees</Label>
                          <p>{formatCurrency(payment.fees.processingFee)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wires" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowUpRight className="h-5 w-5 mr-2" />
                  Wire Transfers Received
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wireTransfers?.wires?.map((wire: any) => (
                    <div key={wire.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-medium">{wire.originator.name}</p>
                            <p className="text-sm text-gray-500">{wire.originator.bankName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">+{formatCurrency(wire.amount)}</p>
                          <Badge className={getStatusColor(wire.status)}>
                            {wire.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <Label className="text-gray-500">Received</Label>
                          <p>{new Date(wire.receivedAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <Label className="text-gray-500">Federal Reference</Label>
                          <p>{wire.wireDetails.federalReference}</p>
                        </div>
                        <div>
                          <Label className="text-gray-500">Invoice</Label>
                          <p>{wire.metadata.invoiceNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-500">Fees</Label>
                          <p>{formatCurrency(wire.fees.incomingWireFee)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cards" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Debit Cards</h2>
              <Button onClick={() => setShowCardIssuance(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Issue New Card
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-500 text-center">No debit cards issued yet</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Business Name</Label>
                    <p className="text-sm text-gray-600">{account?.accountHolder?.businessName}</p>
                  </div>
                  <div>
                    <Label>EIN</Label>
                    <p className="text-sm text-gray-600">{account?.accountHolder?.ein}</p>
                  </div>
                  <div>
                    <Label>Business Type</Label>
                    <p className="text-sm text-gray-600 capitalize">{account?.accountHolder?.businessType}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Payment Instructions Dialog */}
        <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Payment Instructions</DialogTitle>
            </DialogHeader>
            {paymentInstructions && (
              <div className="space-y-6">
                <Tabs defaultValue="ach">
                  <TabsList>
                    <TabsTrigger value="ach">ACH Transfer</TabsTrigger>
                    <TabsTrigger value="wire">Wire Transfer</TabsTrigger>
                    <TabsTrigger value="check">Check Payment</TabsTrigger>
                  </TabsList>
                  <TabsContent value="ach">
                    <Card>
                      <CardContent className="p-4">
                        <pre className="whitespace-pre-wrap text-sm">{paymentInstructions.ach}</pre>
                        <Button 
                          className="mt-4" 
                          onClick={() => copyToClipboard(paymentInstructions.ach, "ACH instructions")}
                        >
                          Copy Instructions
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="wire">
                    <Card>
                      <CardContent className="p-4">
                        <pre className="whitespace-pre-wrap text-sm">{paymentInstructions.wire}</pre>
                        <Button 
                          className="mt-4" 
                          onClick={() => copyToClipboard(paymentInstructions.wire, "Wire instructions")}
                        >
                          Copy Instructions
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="check">
                    <Card>
                      <CardContent className="p-4">
                        <pre className="whitespace-pre-wrap text-sm">{paymentInstructions.check}</pre>
                        <Button 
                          className="mt-4" 
                          onClick={() => copyToClipboard(paymentInstructions.check, "Check instructions")}
                        >
                          Copy Instructions
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Card Issuance Dialog */}
        <Dialog open={showCardIssuance} onOpenChange={setShowCardIssuance}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue Debit Card</DialogTitle>
            </DialogHeader>
            <CardIssuanceForm onSubmit={(data) => issueCardMutation.mutate(data)} />
          </DialogContent>
        </Dialog>

        {/* Account Setup Dialog */}
        <Dialog open={showAccountSetup} onOpenChange={setShowAccountSetup}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Business Banking Account</DialogTitle>
            </DialogHeader>
            <AccountSetupForm onSubmit={(data) => createAccountMutation.mutate(data)} />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function PaymentInstructionsForm({ onSubmit, isLoading }: { onSubmit: (data: any) => void; isLoading?: boolean }) {
  const [formData, setFormData] = useState({
    invoiceAmount: 0,
    invoiceNumber: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="invoiceNumber">Invoice Number</Label>
        <Input
          id="invoiceNumber"
          value={formData.invoiceNumber}
          onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
          placeholder="INV-001"
          required
        />
      </div>
      <div>
        <Label htmlFor="invoiceAmount">Invoice Amount</Label>
        <Input
          id="invoiceAmount"
          type="number"
          step="0.01"
          value={formData.invoiceAmount}
          onChange={(e) => setFormData(prev => ({ ...prev, invoiceAmount: parseFloat(e.target.value) }))}
          placeholder="0.00"
          required
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Generating..." : "Generate Instructions"}
      </Button>
    </form>
  );
}

function AccountSetupForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    businessName: "",
    ein: "",
    businessType: "llc",
    phone: "",
    website: "",
    industry: "Transportation",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            value={formData.businessName}
            onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="ein">EIN</Label>
          <Input
            id="ein"
            value={formData.ein}
            onChange={(e) => setFormData(prev => ({ ...prev, ein: e.target.value }))}
            placeholder="12-3456789"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="businessType">Business Type</Label>
          <Select value={formData.businessType} onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="llc">LLC</SelectItem>
              <SelectItem value="corporation">Corporation</SelectItem>
              <SelectItem value="partnership">Partnership</SelectItem>
              <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="(555) 123-4567"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="street">Street Address</Label>
        <Input
          id="street"
          value={formData.address.street}
          onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, street: e.target.value } }))}
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.address.city}
            onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, city: e.target.value } }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={formData.address.state}
            onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, state: e.target.value } }))}
            placeholder="CA"
            required
          />
        </div>
        <div>
          <Label htmlFor="zipCode">ZIP Code</Label>
          <Input
            id="zipCode"
            value={formData.address.zipCode}
            onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, zipCode: e.target.value } }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="website">Website (Optional)</Label>
        <Input
          id="website"
          value={formData.website}
          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
          placeholder="https://yourcompany.com"
        />
      </div>

      <Button type="submit" className="w-full">
        Create Banking Account
      </Button>
    </form>
  );
}

function CardIssuanceForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    cardholderName: "",
    purpose: "fuel",
    assignedDriver: "",
    spendingLimits: {
      daily: 500,
      monthly: 10000,
      perTransaction: 500,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="cardholderName">Cardholder Name</Label>
        <Input
          id="cardholderName"
          value={formData.cardholderName}
          onChange={(e) => setFormData(prev => ({ ...prev, cardholderName: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="purpose">Card Purpose</Label>
        <Select value={formData.purpose} onValueChange={(value) => setFormData(prev => ({ ...prev, purpose: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fuel">Fuel</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="general">General Expenses</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="assignedDriver">Assigned Driver (Optional)</Label>
        <Input
          id="assignedDriver"
          value={formData.assignedDriver}
          onChange={(e) => setFormData(prev => ({ ...prev, assignedDriver: e.target.value }))}
          placeholder="Driver name or ID"
        />
      </div>

      <div className="space-y-2">
        <Label>Spending Limits</Label>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="daily" className="text-sm">Daily ($)</Label>
            <Input
              id="daily"
              type="number"
              value={formData.spendingLimits.daily}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                spendingLimits: { ...prev.spendingLimits, daily: parseInt(e.target.value) }
              }))}
            />
          </div>
          <div>
            <Label htmlFor="monthly" className="text-sm">Monthly ($)</Label>
            <Input
              id="monthly"
              type="number"
              value={formData.spendingLimits.monthly}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                spendingLimits: { ...prev.spendingLimits, monthly: parseInt(e.target.value) }
              }))}
            />
          </div>
          <div>
            <Label htmlFor="perTransaction" className="text-sm">Per Transaction ($)</Label>
            <Input
              id="perTransaction"
              type="number"
              value={formData.spendingLimits.perTransaction}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                spendingLimits: { ...prev.spendingLimits, perTransaction: parseInt(e.target.value) }
              }))}
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full">
        Issue Debit Card
      </Button>
    </form>
  );
}