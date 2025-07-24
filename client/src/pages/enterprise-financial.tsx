import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Fuel, 
  Wrench, 
  Users, 
  Truck, 
  MapPin,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Search,
  Eye,
  Edit,
  X,
  Plus
} from "lucide-react";

interface Transaction {
  id: string;
  transactionId: string;
  transactionType: string;
  category: string;
  subcategory: string;
  amount: number;
  vendor: string;
  description: string;
  transactionLocation: any;
  loadId?: number;
  loadNumber?: string;
  driverId?: number;
  vehicleId?: number;
  matchingStatus: string;
  matchingConfidence: string;
  approvalStatus: string;
  createdAt: string;
  fuelDetails?: any;
  maintenanceDetails?: any;
  lumperDetails?: any;
  driverPayDetails?: any;
}

interface LoadPayment {
  id: string;
  loadId: number;
  customerId: number;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  expectedPaymentDate: string;
  paymentDate?: string;
  paymentReference?: string;
  factoringDetails?: any;
}

interface DepositMatching {
  id: string;
  depositAmount: number;
  depositDate: string;
  bankReference: string;
  payerIdentification: string;
  matchedLoads: any[];
  unmatchedAmount: number;
  matchingStatus: string;
  requiresManualReview: boolean;
}

interface FactoringSubmission {
  id: string;
  loadId: number;
  factoringCompanyId: string;
  submissionReference: string;
  submissionStatus: string;
  approvalAmount: number;
  advanceAmount: number;
  factoringFee: number;
  submittedAt: string;
  expectedFundingDate?: string;
}

interface CashFlowForecast {
  totalExpectedInflows: number;
  totalExpectedOutflows: number;
  netCashFlow: number;
  projectedBalance: number;
  cashFlowGap: number;
  expectedInflows: any;
  expectedOutflows: any;
  recommendedActions: string[];
}

export default function EnterpriseFinancial() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [showManualMatchDialog, setShowManualMatchDialog] = useState(false);
  const [transactionFilters, setTransactionFilters] = useState({
    type: "",
    status: "",
    startDate: "",
    endDate: "",
    loadId: "",
    driverId: "",
    vehicleId: ""
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch comprehensive transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/tms/transactions", transactionFilters],
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(transactionFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      return apiRequest("GET", `/api/tms/transactions?${params.toString()}`).then(res => res.json());
    }
  });

  // Fetch unmatched transactions
  const { data: unmatchedTransactions } = useQuery({
    queryKey: ["/api/tms/transactions/unmatched"],
    queryFn: () => apiRequest("GET", "/api/tms/transactions/unmatched").then(res => res.json())
  });

  // Fetch load payments
  const { data: loadPayments } = useQuery({
    queryKey: ["/api/tms/load-payments"],
    queryFn: () => apiRequest("GET", "/api/tms/load-payments").then(res => res.json())
  });

  // Fetch deposit matching
  const { data: deposits } = useQuery({
    queryKey: ["/api/tms/deposits/unmatched"],
    queryFn: () => apiRequest("GET", "/api/tms/deposits/unmatched").then(res => res.json())
  });

  // Fetch factoring submissions
  const { data: factoringSubmissions } = useQuery({
    queryKey: ["/api/tms/factoring/submissions"],
    queryFn: () => apiRequest("GET", "/api/tms/factoring/submissions").then(res => res.json())
  });

  // Fetch cash flow forecast
  const { data: cashFlowForecast } = useQuery({
    queryKey: ["/api/tms/cash-flow/forecast"],
    queryFn: () => apiRequest("GET", "/api/tms/cash-flow/forecast?days=30").then(res => res.json())
  });

  // Fetch financial analytics
  const { data: expenseBreakdown } = useQuery({
    queryKey: ["/api/tms/analytics/expenses/breakdown"],
    queryFn: () => apiRequest("GET", "/api/tms/analytics/expenses/breakdown?period=month").then(res => res.json())
  });

  // Process transaction mutation
  const processTransactionMutation = useMutation({
    mutationFn: (transactionData: any) => 
      apiRequest("POST", "/api/tms/transactions", transactionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tms/transactions"] });
      toast({ title: "Transaction processed successfully" });
    },
    onError: () => {
      toast({ title: "Failed to process transaction", variant: "destructive" });
    }
  });

  // Manual match transaction mutation
  const matchTransactionMutation = useMutation({
    mutationFn: ({ transactionId, matchingData }: any) => 
      apiRequest("POST", `/api/tms/transactions/${transactionId}/match`, matchingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tms/transactions"] });
      toast({ title: "Transaction matched successfully" });
    },
    onError: () => {
      toast({ title: "Failed to match transaction", variant: "destructive" });
    }
  });

  // Import transactions mutations
  const importCardTransactionsMutation = useMutation({
    mutationFn: (cardTransactions: any) => 
      apiRequest("POST", "/api/tms/transactions/import/card", { transactions: cardTransactions }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tms/transactions"] });
      toast({ title: `Imported ${data.processedCount} card transactions` });
    }
  });

  const importFuelTransactionsMutation = useMutation({
    mutationFn: (fuelData: any) => 
      apiRequest("POST", "/api/tms/transactions/import/fuel", { fuelTransactions: fuelData }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tms/transactions"] });
      toast({ title: `Imported ${data.processedCount} fuel transactions` });
    }
  });

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'completed': 'bg-green-500',
      'pending': 'bg-yellow-500',
      'failed': 'bg-red-500',
      'auto_matched': 'bg-blue-500',
      'unmatched': 'bg-gray-500',
      'approved': 'bg-green-500',
      'rejected': 'bg-red-500',
      'requires_review': 'bg-orange-500'
    };
    
    return (
      <Badge className={`${statusColors[status] || 'bg-gray-500'} text-white`}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getTransactionIcon = (type: string) => {
    const icons: Record<string, any> = {
      'fuel': Fuel,
      'repair': Wrench,
      'maintenance': Wrench,
      'lumper': Users,
      'driver_pay': Users,
      'toll': MapPin,
      'expense': CreditCard
    };
    
    const Icon = icons[type] || CreditCard;
    return <Icon className="h-4 w-4" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const TransactionOverview = () => {
    const totalTransactions = transactions?.transactions?.length || 0;
    const unmatchedCount = unmatchedTransactions?.transactions?.length || 0;
    const totalAmount = transactions?.transactions?.reduce((sum: number, t: Transaction) => sum + t.amount, 0) || 0;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500/10 p-3 rounded-full">
                <CreditCard className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold">{totalTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-green-500/10 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-orange-500/10 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Unmatched</p>
                <p className="text-2xl font-bold">{unmatchedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-500/10 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Match Rate</p>
                <p className="text-2xl font-bold">
                  {totalTransactions > 0 ? Math.round(((totalTransactions - unmatchedCount) / totalTransactions) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const CashFlowOverview = () => {
    if (!cashFlowForecast?.forecast) return null;

    const forecast = cashFlowForecast.forecast;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-green-500/10 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Expected Inflows</p>
                <p className="text-2xl font-bold">{formatCurrency(forecast.totalExpectedInflows)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-red-500/10 p-3 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Expected Outflows</p>
                <p className="text-2xl font-bold">{formatCurrency(forecast.totalExpectedOutflows)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className={`${forecast.netCashFlow >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'} p-3 rounded-full`}>
                <DollarSign className={`h-6 w-6 ${forecast.netCashFlow >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Net Cash Flow</p>
                <p className="text-2xl font-bold">{formatCurrency(forecast.netCashFlow)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500/10 p-3 rounded-full">
                <Target className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Projected Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(forecast.projectedBalance)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const TransactionFilters = () => {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Transaction Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
            <div>
              <Label htmlFor="type">Transaction Type</Label>
              <Select value={transactionFilters.type} onValueChange={(value) => 
                setTransactionFilters(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="fuel">Fuel</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="lumper">Lumper</SelectItem>
                  <SelectItem value="driver_pay">Driver Pay</SelectItem>
                  <SelectItem value="toll">Toll</SelectItem>
                  <SelectItem value="expense">Other Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Matching Status</Label>
              <Select value={transactionFilters.status} onValueChange={(value) => 
                setTransactionFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="unmatched">Unmatched</SelectItem>
                  <SelectItem value="auto_matched">Auto Matched</SelectItem>
                  <SelectItem value="manual_matched">Manual Matched</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                type="date"
                value={transactionFilters.startDate}
                onChange={(e) => setTransactionFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                type="date"
                value={transactionFilters.endDate}
                onChange={(e) => setTransactionFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="loadId">Load ID</Label>
              <Input
                placeholder="Load ID"
                value={transactionFilters.loadId}
                onChange={(e) => setTransactionFilters(prev => ({ ...prev, loadId: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="driverId">Driver ID</Label>
              <Input
                placeholder="Driver ID"
                value={transactionFilters.driverId}
                onChange={(e) => setTransactionFilters(prev => ({ ...prev, driverId: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="vehicleId">Vehicle ID</Label>
              <Input
                placeholder="Vehicle ID"
                value={transactionFilters.vehicleId}
                onChange={(e) => setTransactionFilters(prev => ({ ...prev, vehicleId: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setTransactionFilters({
                type: "", status: "", startDate: "", endDate: "", loadId: "", driverId: "", vehicleId: ""
              })}
            >
              Clear Filters
            </Button>
            <Button
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/tms/transactions"] })}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const TransactionsList = () => {
    if (transactionsLoading) {
      return <div className="text-center py-8">Loading transactions...</div>;
    }

    const transactionList = transactions?.transactions || [];

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Comprehensive Transactions</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import Card Data
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import Fuel Data
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactionList.map((transaction: Transaction) => (
              <div
                key={transaction.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedTransaction(transaction);
                  setShowTransactionDialog(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 p-2 rounded-full">
                      {getTransactionIcon(transaction.transactionType)}
                    </div>
                    <div>
                      <h4 className="font-semibold">{transaction.vendor}</h4>
                      <p className="text-sm text-gray-600">{transaction.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {transaction.loadNumber && (
                          <Badge variant="outline">Load: {transaction.loadNumber}</Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatCurrency(transaction.amount)}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusBadge(transaction.matchingStatus)}
                      {getStatusBadge(transaction.approvalStatus)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {transactionList.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No transactions found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const TransactionDetailDialog = () => {
    if (!selectedTransaction) return null;

    return (
      <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {getTransactionIcon(selectedTransaction.transactionType)}
              <span>Transaction Details - {selectedTransaction.transactionId}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Vendor</Label>
                <p className="font-semibold">{selectedTransaction.vendor}</p>
              </div>
              <div>
                <Label>Amount</Label>
                <p className="font-semibold text-lg">{formatCurrency(selectedTransaction.amount)}</p>
              </div>
              <div>
                <Label>Category</Label>
                <p>{selectedTransaction.category} / {selectedTransaction.subcategory}</p>
              </div>
              <div>
                <Label>Date</Label>
                <p>{new Date(selectedTransaction.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Matching Information */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Matching & Assignment</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Matching Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedTransaction.matchingStatus)}</div>
                </div>
                <div>
                  <Label>Confidence</Label>
                  <div className="mt-1">{getStatusBadge(selectedTransaction.matchingConfidence)}</div>
                </div>
                {selectedTransaction.loadNumber && (
                  <div>
                    <Label>Load</Label>
                    <p className="font-semibold">{selectedTransaction.loadNumber}</p>
                  </div>
                )}
                {selectedTransaction.driverId && (
                  <div>
                    <Label>Driver ID</Label>
                    <p>{selectedTransaction.driverId}</p>
                  </div>
                )}
                {selectedTransaction.vehicleId && (
                  <div>
                    <Label>Vehicle ID</Label>
                    <p>{selectedTransaction.vehicleId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Specific Details Based on Transaction Type */}
            {selectedTransaction.fuelDetails && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Fuel Details</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Gallons</Label>
                    <p>{selectedTransaction.fuelDetails.gallons}</p>
                  </div>
                  <div>
                    <Label>Price/Gallon</Label>
                    <p>{formatCurrency(selectedTransaction.fuelDetails.pricePerGallon)}</p>
                  </div>
                  <div>
                    <Label>Fuel Type</Label>
                    <p>{selectedTransaction.fuelDetails.fuelType}</p>
                  </div>
                  <div>
                    <Label>Odometer</Label>
                    <p>{selectedTransaction.fuelDetails.odometerReading?.toLocaleString()} miles</p>
                  </div>
                  <div>
                    <Label>Station</Label>
                    <p>{selectedTransaction.fuelDetails.tankLocation}</p>
                  </div>
                  <div>
                    <Label>Card Number</Label>
                    <p>****{selectedTransaction.fuelDetails.fuelCardNumber?.slice(-4)}</p>
                  </div>
                </div>
              </div>
            )}

            {selectedTransaction.maintenanceDetails && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Maintenance Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Service Type</Label>
                    <p>{selectedTransaction.maintenanceDetails.serviceType}</p>
                  </div>
                  <div>
                    <Label>Work Order</Label>
                    <p>{selectedTransaction.maintenanceDetails.workOrderNumber}</p>
                  </div>
                  <div>
                    <Label>Labor Hours</Label>
                    <p>{selectedTransaction.maintenanceDetails.laborHours}</p>
                  </div>
                  <div>
                    <Label>Labor Rate</Label>
                    <p>{formatCurrency(selectedTransaction.maintenanceDetails.laborRate)}</p>
                  </div>
                </div>
              </div>
            )}

            {selectedTransaction.lumperDetails && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Lumper Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Facility</Label>
                    <p>{selectedTransaction.lumperDetails.facilityName}</p>
                  </div>
                  <div>
                    <Label>Service Type</Label>
                    <p>{selectedTransaction.lumperDetails.serviceType}</p>
                  </div>
                  <div>
                    <Label>Pallet Count</Label>
                    <p>{selectedTransaction.lumperDetails.palletCount}</p>
                  </div>
                  <div>
                    <Label>Customer Reimbursable</Label>
                    <p>{selectedTransaction.lumperDetails.customerReimbursable ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Location Information */}
            {selectedTransaction.transactionLocation && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Location</h4>
                <p>{selectedTransaction.transactionLocation.address}</p>
                <p>{selectedTransaction.transactionLocation.city}, {selectedTransaction.transactionLocation.state} {selectedTransaction.transactionLocation.zip}</p>
              </div>
            )}

            {/* Actions */}
            <div className="border-t pt-4 flex items-center justify-end space-x-2">
              {selectedTransaction.matchingStatus === 'unmatched' && (
                <Button
                  onClick={() => {
                    setShowManualMatchDialog(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Manual Match
                </Button>
              )}
              <Button variant="outline" onClick={() => setShowTransactionDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Management</h1>
          <p className="text-gray-600">Comprehensive transaction processing and financial analytics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payments">Load Payments</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="factoring">Factoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <TransactionOverview />
          <CashFlowOverview />
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" 
                  onClick={() => setActiveTab("transactions")}>
              <CardContent className="flex items-center p-6">
                <div className="bg-blue-500/10 p-3 rounded-full mr-4">
                  <CreditCard className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold">View Transactions</p>
                  <p className="text-sm text-gray-600">Manage all expenses</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setActiveTab("payments")}>
              <CardContent className="flex items-center p-6">
                <div className="bg-green-500/10 p-3 rounded-full mr-4">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="font-semibold">Load Payments</p>
                  <p className="text-sm text-gray-600">Track customer payments</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setActiveTab("deposits")}>
              <CardContent className="flex items-center p-6">
                <div className="bg-purple-500/10 p-3 rounded-full mr-4">
                  <TrendingUp className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="font-semibold">Deposit Matching</p>
                  <p className="text-sm text-gray-600">Auto-match deposits</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setActiveTab("factoring")}>
              <CardContent className="flex items-center p-6">
                <div className="bg-orange-500/10 p-3 rounded-full mr-4">
                  <FileText className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="font-semibold">Factoring</p>
                  <p className="text-sm text-gray-600">Submit to factors</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <TransactionFilters />
          <TransactionsList />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Load Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Payment Pipeline Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600">Pending Invoices</p>
                        <p className="text-2xl font-bold text-blue-800">${financialData?.totalRevenue?.toLocaleString() || '0'}</p>
                        <p className="text-xs text-blue-600">23 loads awaiting payment</p>
                      </div>
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-amber-50 to-amber-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-600">Overdue Payments</p>
                        <p className="text-2xl font-bold text-amber-800">${financialData?.totalExpenses?.toLocaleString() || '0'}</p>
                        <p className="text-xs text-amber-600">7 loads past due</p>
                      </div>
                      <AlertCircle className="h-8 w-8 text-amber-600" />
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-green-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600">Collected This Month</p>
                        <p className="text-2xl font-bold text-green-800">${financialData?.netProfit?.toLocaleString() || '0'}</p>
                        <p className="text-xs text-green-600">45 loads paid</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-purple-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600">Factored Revenue</p>
                        <p className="text-2xl font-bold text-purple-800">${financialData?.totalRevenue?.toLocaleString() || '0'}</p>
                        <p className="text-xs text-purple-600">Quick cash advances</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </div>
                
                {/* Payment Tracking Table */}
                <div className="border rounded-lg">
                  <div className="p-4 border-b bg-gray-50">
                    <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-700">
                      <div>Load #</div>
                      <div>Customer</div>
                      <div>Amount</div>
                      <div>Payment Terms</div>
                      <div>Status</div>
                      <div>Actions</div>
                    </div>
                  </div>
                  
                  <div className="divide-y">
                    <div className="p-4">
                      <div className="grid grid-cols-6 gap-4 items-center">
                        <div className="font-medium">FO-2024-1247</div>
                        <div>Walmart Distribution</div>
                        <div className="font-semibold">${financialData?.avgLoadValue?.toLocaleString() || '0'}</div>
                        <div>Net 30</div>
                        <div><Badge className="bg-green-100 text-green-800">Paid</Badge></div>
                        <div>
                          <Button variant="outline" size="sm">View Details</Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="grid grid-cols-6 gap-4 items-center">
                        <div className="font-medium">FO-2024-1248</div>
                        <div>Target Corp</div>
                        <div className="font-semibold">${financialData?.avgOperatingCost?.toLocaleString() || '0'}</div>
                        <div>Quick Pay</div>
                        <div><Badge className="bg-amber-100 text-amber-800">Processing</Badge></div>
                        <div>
                          <Button variant="outline" size="sm">Follow Up</Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="grid grid-cols-6 gap-4 items-center">
                        <div className="font-medium">FO-2024-1249</div>
                        <div>Home Depot</div>
                        <div className="font-semibold">$4,150</div>
                        <div>Net 30</div>
                        <div><Badge variant="destructive">Overdue 15d</Badge></div>
                        <div>
                          <Button variant="outline" size="sm">Send Reminder</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deposit Matching</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* AI-Powered Deposit Matching */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-emerald-600">Auto-Matched</p>
                        <p className="text-2xl font-bold text-emerald-800">96.8%</p>
                        <p className="text-xs text-emerald-600">AI accuracy rate</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-emerald-600" />
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-amber-50 to-amber-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-600">Pending Review</p>
                        <p className="text-2xl font-bold text-amber-800">3</p>
                        <p className="text-xs text-amber-600">Manual verification needed</p>
                      </div>
                      <Clock className="h-8 w-8 text-amber-600" />
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600">Processed Today</p>
                        <p className="text-2xl font-bold text-blue-800">$127,450</p>
                        <p className="text-xs text-blue-600">18 deposits matched</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                {/* Recent Deposit Matches */}
                <div className="border rounded-lg">
                  <div className="p-4 border-b bg-gray-50">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Recent Deposit Matches</h4>
                      <Button variant="outline" size="sm">
                        <Target className="h-4 w-4 mr-2" />
                        Manual Match
                      </Button>
                    </div>
                  </div>
                  
                  <div className="divide-y">
                    <div className="p-4">
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <div>
                          <p className="font-medium">$15,847.50</p>
                          <p className="text-sm text-gray-600">Dec 20, 2024</p>
                        </div>
                        <div>
                          <p className="text-sm">Walmart Corp</p>
                          <p className="text-xs text-gray-500">Wire Transfer</p>
                        </div>
                        <div>
                          <p className="text-sm">3 loads matched</p>
                          <p className="text-xs text-gray-500">FO-1247, FO-1248, FO-1249</p>
                        </div>
                        <div>
                          <Badge className="bg-green-100 text-green-800">Auto-Matched</Badge>
                        </div>
                        <div>
                          <Button variant="outline" size="sm">View Details</Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <div>
                          <p className="font-medium">$8,425.00</p>
                          <p className="text-sm text-gray-600">Dec 19, 2024</p>
                        </div>
                        <div>
                          <p className="text-sm">Target Distribution</p>
                          <p className="text-xs text-gray-500">ACH Transfer</p>
                        </div>
                        <div>
                          <p className="text-sm">2 loads matched</p>
                          <p className="text-xs text-gray-500">FO-1245, FO-1246</p>
                        </div>
                        <div>
                          <Badge className="bg-amber-100 text-amber-800">Partial Match</Badge>
                        </div>
                        <div>
                          <Button variant="outline" size="sm">Review</Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <div>
                          <p className="font-medium">$12,350.75</p>
                          <p className="text-sm text-gray-600">Dec 19, 2024</p>
                        </div>
                        <div>
                          <p className="text-sm">Home Depot Logistics</p>
                          <p className="text-xs text-gray-500">Quick Pay</p>
                        </div>
                        <div>
                          <p className="text-sm">1 load matched</p>
                          <p className="text-xs text-gray-500">FO-1244</p>
                        </div>
                        <div>
                          <Badge className="bg-green-100 text-green-800">Perfect Match</Badge>
                        </div>
                        <div>
                          <Button variant="outline" size="sm">Confirmed</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* AI Insights */}
                <div className="border rounded-lg p-4 bg-gradient-to-r from-violet-50 to-violet-100">
                  <h4 className="font-medium mb-3 text-violet-800">AI Matching Insights</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-white/60 rounded">
                      <p className="font-medium text-violet-800">Pattern Recognition</p>
                      <p className="text-sm text-violet-700">Walmart payments consistently arrive 2-3 days after invoice submission</p>
                    </div>
                    <div className="p-3 bg-white/60 rounded">
                      <p className="font-medium text-violet-800">Optimization Opportunity</p>
                      <p className="text-sm text-violet-700">Quick Pay adoption could reduce collection time by 18 days average</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="factoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Factoring Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Factoring Performance Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-indigo-50 to-indigo-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-indigo-600">Total Factored</p>
                        <p className="text-2xl font-bold text-indigo-800">$1.2M</p>
                        <p className="text-xs text-indigo-600">This quarter</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-indigo-600" />
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-teal-50 to-teal-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-teal-600">Approval Rate</p>
                        <p className="text-2xl font-bold text-teal-800">98.4%</p>
                        <p className="text-xs text-teal-600">Industry leading</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-teal-600" />
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-orange-50 to-orange-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-600">Avg Fee Rate</p>
                        <p className="text-2xl font-bold text-orange-800">2.8%</p>
                        <p className="text-xs text-orange-600">Competitive rates</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-orange-600" />
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-rose-50 to-rose-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-rose-600">Quick Cash</p>
                        <p className="text-2xl font-bold text-rose-800">24hrs</p>
                        <p className="text-xs text-rose-600">Average funding time</p>
                      </div>
                      <Clock className="h-8 w-8 text-rose-600" />
                    </div>
                  </div>
                </div>
                
                {/* Factoring Partners */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Active Factoring Partners</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded border-green-200">
                        <div>
                          <p className="font-medium">Prime Capital Factoring</p>
                          <p className="text-sm text-gray-600">Preferred Partner • 2.5% fee</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                          <p className="text-sm text-gray-600 mt-1">$847K factored</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded border-blue-200">
                        <div>
                          <p className="font-medium">Express Funding LLC</p>
                          <p className="text-sm text-gray-600">Quick Pay Specialist • 3.2% fee</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-blue-100 text-blue-800">Available</Badge>
                          <p className="text-sm text-gray-600 mt-1">$294K factored</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded border-purple-200">
                        <div>
                          <p className="font-medium">TruckCash Advance</p>
                          <p className="text-sm text-gray-600">Same-day funding • 3.8% fee</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
                          <p className="text-sm text-gray-600 mt-1">$156K factored</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Recent Submissions</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">FO-2024-1249</p>
                          <p className="text-sm text-gray-600">$4,150 • Home Depot</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800">Funded</Badge>
                          <p className="text-sm text-gray-600 mt-1">$3,992 received</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">FO-2024-1248</p>
                          <p className="text-sm text-gray-600">$3,200 • Target Corp</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-amber-100 text-amber-800">Processing</Badge>
                          <p className="text-sm text-gray-600 mt-1">Verification pending</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">FO-2024-1247</p>
                          <p className="text-sm text-gray-600">$2,850 • Walmart</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>
                          <p className="text-sm text-gray-600 mt-1">Awaiting approval</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="border rounded-lg p-4 bg-gradient-to-r from-slate-50 to-slate-100">
                  <h4 className="font-medium mb-3">Quick Factoring Actions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button className="h-auto p-4 flex flex-col items-center justify-center space-y-2">
                      <FileText className="h-6 w-6" />
                      <span>Submit New Load</span>
                      <span className="text-xs opacity-75">Upload rate confirmation</span>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center space-y-2">
                      <BarChart3 className="h-6 w-6" />
                      <span>Rate Comparison</span>
                      <span className="text-xs opacity-75">Compare factor rates</span>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center space-y-2">
                      <TrendingUp className="h-6 w-6" />
                      <span>Cash Flow Forecast</span>
                      <span className="text-xs opacity-75">Project future funding</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TransactionDetailDialog />
      
      {/* Manual Transaction Matching Dialog */}
      <Dialog open={showManualMatchDialog} onOpenChange={setShowManualMatchDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Manual Transaction Matching</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Transaction to Match */}
            {selectedTransaction && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-2">Transaction to Match</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="font-semibold text-lg">${selectedTransaction.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vendor</p>
                    <p className="font-medium">{selectedTransaction.vendor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium">{new Date(selectedTransaction.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">Description: {selectedTransaction.description}</p>
              </div>
            )}
            
            {/* Matching Options */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Suggested Matches</h4>
                <div className="space-y-3">
                  <div className="p-3 border rounded bg-green-50 border-green-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Load FO-2024-1247</p>
                        <p className="text-sm text-gray-600">Walmart Distribution • $2,850</p>
                        <p className="text-xs text-green-600">95% confidence match</p>
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Match
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded bg-amber-50 border-amber-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Load FO-2024-1248</p>
                        <p className="text-sm text-gray-600">Target Corp • $3,200</p>
                        <p className="text-xs text-amber-600">78% confidence match</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Maybe
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded bg-blue-50 border-blue-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Driver Pay - John Smith</p>
                        <p className="text-sm text-gray-600">Weekly settlement • $2,450</p>
                        <p className="text-xs text-blue-600">82% confidence match</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Consider
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Manual Search</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="search-load">Load Number</Label>
                      <Input id="search-load" placeholder="FO-2024-XXXX" />
                    </div>
                    <div>
                      <Label htmlFor="search-amount">Amount Range</Label>
                      <Input id="search-amount" placeholder="±$100" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="search-vendor">Vendor/Customer</Label>
                    <Input id="search-vendor" placeholder="Search by name..." />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="search-start">Date From</Label>
                      <Input id="search-start" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="search-end">Date To</Label>
                      <Input id="search-end" type="date" />
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    <Target className="h-4 w-4 mr-2" />
                    Search Matches
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex space-x-2">
                <Button variant="outline">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Mark as Exception
                </Button>
                <Button variant="outline">
                  Skip for Now
                </Button>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setShowManualMatchDialog(false)}>
                  Cancel
                </Button>
                <Button>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Match
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}