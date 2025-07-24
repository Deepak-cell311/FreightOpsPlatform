import { useState, useEffect } from "react";
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
  Truck, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Package, 
  FileText, 
  Plus,
  Filter,
  MapPin,
  Clock,
  Star,
  AlertCircle
} from "lucide-react";

interface Load {
  id: string;
  loadNumber: string;
  customerId: string;
  carrierId?: string;
  status: string;
  pickupLocation: any;
  deliveryLocation: any;
  customerRate: number;
  carrierRate: number;
  margin: number;
  weight: number;
  createdAt: string;
  updatedAt: string;
}

interface Carrier {
  id: string;
  carrierName: string;
  carrierDotNumber: string;
  carrierMcNumber?: string;
  contactPerson: string;
  email: string;
  phone: string;
  onTimePerformance: number;
  equipmentTypes: string[];
  preferredLanes: string[];
  status: string;
}

interface Customer {
  id: string;
  customerName: string;
  customerType: string;
  contactPerson: string;
  email: string;
  phone: string;
  creditLimit: number;
  shippingLocations: string[];
  commodityTypes: string[];
  status: string;
}

export default function BrokerOperationsDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("loads");
  const [showNewLoadDialog, setShowNewLoadDialog] = useState(false);
  const [showNewCarrierDialog, setShowNewCarrierDialog] = useState(false);
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);
  const [loadFilters, setLoadFilters] = useState({ status: "", startDate: "", endDate: "" });

  // Fetch loads with filters
  const { data: loadsData, isLoading: loadsLoading } = useQuery({
    queryKey: ["/api/broker/loads", loadFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (loadFilters.status) params.append('status', loadFilters.status);
      if (loadFilters.startDate) params.append('startDate', loadFilters.startDate);
      if (loadFilters.endDate) params.append('endDate', loadFilters.endDate);
      
      const response = await apiRequest("GET", `/api/broker/loads?${params.toString()}`);
      return response.json();
    }
  });

  // Fetch carriers
  const { data: carriersData, isLoading: carriersLoading } = useQuery({
    queryKey: ["/api/broker/carriers"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/broker/carriers");
      return response.json();
    }
  });

  // Fetch customers
  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ["/api/broker/customers"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/broker/customers");
      return response.json();
    }
  });

  // Fetch analytics
  const { data: analyticsData } = useQuery({
    queryKey: ["/api/broker/analytics"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/broker/analytics");
      return response.json();
    }
  });

  // Create load mutation
  const createLoadMutation = useMutation({
    mutationFn: async (loadData: any) => {
      const response = await apiRequest("POST", "/api/broker/loads", loadData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/broker/loads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/broker/analytics"] });
      setShowNewLoadDialog(false);
      toast({ title: "Load created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create load", description: error.message, variant: "destructive" });
    }
  });

  // Create carrier mutation
  const createCarrierMutation = useMutation({
    mutationFn: async (carrierData: any) => {
      const response = await apiRequest("POST", "/api/broker/carriers", carrierData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/broker/carriers"] });
      setShowNewCarrierDialog(false);
      toast({ title: "Carrier added successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to add carrier", description: error.message, variant: "destructive" });
    }
  });

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: any) => {
      const response = await apiRequest("POST", "/api/broker/customers", customerData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/broker/customers"] });
      setShowNewCustomerDialog(false);
      toast({ title: "Customer added successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to add customer", description: error.message, variant: "destructive" });
    }
  });

  // Update load status mutation
  const updateLoadStatusMutation = useMutation({
    mutationFn: async ({ loadId, status, location, notes }: any) => {
      const response = await apiRequest("PATCH", `/api/broker/loads/${loadId}/status`, {
        status, location, notes
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/broker/loads"] });
      toast({ title: "Load status updated" });
    }
  });

  const loads = loadsData?.loads || [];
  const carriers = carriersData?.carriers || [];
  const customers = customersData?.customers || [];
  const analytics = analyticsData?.analytics || {};

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'posted': return 'bg-blue-100 text-blue-800';
      case 'booked': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const LoadsTab = () => (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <Select value={loadFilters.status} onValueChange={(value) => setLoadFilters(prev => ({ ...prev, status: value }))}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="posted">Posted</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="in_transit">In Transit</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={loadFilters.startDate}
            onChange={(e) => setLoadFilters(prev => ({ ...prev, startDate: e.target.value }))}
            className="w-40"
          />
          <Input
            type="date"
            value={loadFilters.endDate}
            onChange={(e) => setLoadFilters(prev => ({ ...prev, endDate: e.target.value }))}
            className="w-40"
          />
        </div>
        <Dialog open={showNewLoadDialog} onOpenChange={setShowNewLoadDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Load
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Load</DialogTitle>
            </DialogHeader>
            <NewLoadForm onSubmit={(data) => createLoadMutation.mutate(data)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Loads Grid */}
      <div className="grid gap-4">
        {loadsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : loads.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No loads found</p>
            </CardContent>
          </Card>
        ) : (
          loads.map((load: Load) => (
            <Card key={load.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{load.loadNumber}</h3>
                    <Badge className={getStatusColor(load.status)}>
                      {load.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Margin</p>
                    <p className="font-semibold text-green-600">${load.margin?.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">Pickup</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {load.pickupLocation?.city}, {load.pickupLocation?.state}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(load.pickupLocation?.date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">Delivery</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {load.deliveryLocation?.city}, {load.deliveryLocation?.state}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(load.deliveryLocation?.date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium">Load Details</span>
                    </div>
                    <p className="text-sm text-gray-600">{load.weight?.toLocaleString()} lbs</p>
                    <p className="text-xs text-gray-500">Customer Rate: ${load.customerRate?.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Select onValueChange={(value) => updateLoadStatusMutation.mutate({ 
                    loadId: load.id, 
                    status: value, 
                    location: "", 
                    notes: "" 
                  })}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="posted">Posted</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Documents
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const CarriersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Carrier Network</h2>
        <Dialog open={showNewCarrierDialog} onOpenChange={setShowNewCarrierDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Carrier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Carrier</DialogTitle>
            </DialogHeader>
            <NewCarrierForm onSubmit={(data) => createCarrierMutation.mutate(data)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {carriersLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : carriers.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Truck className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No carriers in network</p>
            </CardContent>
          </Card>
        ) : (
          carriers.map((carrier: Carrier) => (
            <Card key={carrier.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{carrier.carrierName}</h3>
                    <p className="text-sm text-gray-500">DOT: {carrier.carrierDotNumber}</p>
                    {carrier.carrierMcNumber && (
                      <p className="text-sm text-gray-500">MC: {carrier.carrierMcNumber}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold">{carrier.onTimePerformance}%</span>
                    </div>
                    <p className="text-xs text-gray-500">On-time Performance</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Contact</p>
                    <p className="text-sm text-gray-600">{carrier.contactPerson}</p>
                    <p className="text-sm text-gray-600">{carrier.email}</p>
                    <p className="text-sm text-gray-600">{carrier.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Equipment Types</p>
                    <div className="flex flex-wrap gap-1">
                      {carrier.equipmentTypes?.map((type, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Badge className={carrier.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {carrier.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const CustomersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customer Portfolio</h2>
        <Dialog open={showNewCustomerDialog} onOpenChange={setShowNewCustomerDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <NewCustomerForm onSubmit={(data) => createCustomerMutation.mutate(data)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {customersLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : customers.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No customers found</p>
            </CardContent>
          </Card>
        ) : (
          customers.map((customer: Customer) => (
            <Card key={customer.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{customer.customerName}</h3>
                    <p className="text-sm text-gray-500">Type: {customer.customerType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Credit Limit</p>
                    <p className="font-semibold">${customer.creditLimit?.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Contact</p>
                    <p className="text-sm text-gray-600">{customer.contactPerson}</p>
                    <p className="text-sm text-gray-600">{customer.email}</p>
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Commodity Types</p>
                    <div className="flex flex-wrap gap-1">
                      {customer.commodityTypes?.map((type, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Badge className={customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {customer.status}
                </Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout 
      title="Broker Operations" 
      description="Comprehensive freight brokerage management"
    >
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Broker Operations</h1>
          <p className="text-gray-600">Comprehensive freight brokerage management</p>
        </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loads</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeLoads || 0}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(analytics.monthlyRevenue || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carrier Network</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.carrierCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              +5 new this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgMargin || 0}%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="loads">Load Management</TabsTrigger>
          <TabsTrigger value="carriers">Carrier Network</TabsTrigger>
          <TabsTrigger value="customers">Customer Portfolio</TabsTrigger>
        </TabsList>
        
        <TabsContent value="loads" className="mt-6">
          <LoadsTab />
        </TabsContent>
        
        <TabsContent value="carriers" className="mt-6">
          <CarriersTab />
        </TabsContent>
        
        <TabsContent value="customers" className="mt-6">
          <CustomersTab />
        </TabsContent>
      </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Form Components
function NewLoadForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    loadNumber: `LOAD-${Date.now()}`,
    customerId: "",
    carrierId: "",
    pickupLocation: { city: "", state: "", date: "" },
    deliveryLocation: { city: "", state: "", date: "" },
    customerRate: 0,
    carrierRate: 0,
    weight: 0,
    commodity: "",
    equipment: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="loadNumber">Load Number</Label>
          <Input
            id="loadNumber"
            value={formData.loadNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, loadNumber: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="commodity">Commodity</Label>
          <Input
            id="commodity"
            value={formData.commodity}
            onChange={(e) => setFormData(prev => ({ ...prev, commodity: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pickupCity">Pickup City</Label>
          <Input
            id="pickupCity"
            value={formData.pickupLocation.city}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              pickupLocation: { ...prev.pickupLocation, city: e.target.value }
            }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="pickupState">Pickup State</Label>
          <Input
            id="pickupState"
            value={formData.pickupLocation.state}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              pickupLocation: { ...prev.pickupLocation, state: e.target.value }
            }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="deliveryCity">Delivery City</Label>
          <Input
            id="deliveryCity"
            value={formData.deliveryLocation.city}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              deliveryLocation: { ...prev.deliveryLocation, city: e.target.value }
            }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="deliveryState">Delivery State</Label>
          <Input
            id="deliveryState"
            value={formData.deliveryLocation.state}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              deliveryLocation: { ...prev.deliveryLocation, state: e.target.value }
            }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="customerRate">Customer Rate ($)</Label>
          <Input
            id="customerRate"
            type="number"
            value={formData.customerRate}
            onChange={(e) => setFormData(prev => ({ ...prev, customerRate: Number(e.target.value) }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="carrierRate">Carrier Rate ($)</Label>
          <Input
            id="carrierRate"
            type="number"
            value={formData.carrierRate}
            onChange={(e) => setFormData(prev => ({ ...prev, carrierRate: Number(e.target.value) }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="weight">Weight (lbs)</Label>
          <Input
            id="weight"
            type="number"
            value={formData.weight}
            onChange={(e) => setFormData(prev => ({ ...prev, weight: Number(e.target.value) }))}
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full">Create Load</Button>
    </form>
  );
}

function NewCarrierForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    carrierName: "",
    carrierDotNumber: "",
    carrierMcNumber: "",
    contactPerson: "",
    email: "",
    phone: "",
    equipmentTypes: [],
    preferredLanes: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="carrierName">Carrier Name</Label>
        <Input
          id="carrierName"
          value={formData.carrierName}
          onChange={(e) => setFormData(prev => ({ ...prev, carrierName: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="carrierDotNumber">DOT Number</Label>
          <Input
            id="carrierDotNumber"
            value={formData.carrierDotNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, carrierDotNumber: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="carrierMcNumber">MC Number</Label>
          <Input
            id="carrierMcNumber"
            value={formData.carrierMcNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, carrierMcNumber: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="contactPerson">Contact Person</Label>
        <Input
          id="contactPerson"
          value={formData.contactPerson}
          onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full">Add Carrier</Button>
    </form>
  );
}

function NewCustomerForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    customerName: "",
    customerType: "shipper",
    contactPerson: "",
    email: "",
    phone: "",
    creditLimit: 0,
    commodityTypes: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="customerName">Customer Name</Label>
        <Input
          id="customerName"
          value={formData.customerName}
          onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="customerType">Customer Type</Label>
        <Select value={formData.customerType} onValueChange={(value) => setFormData(prev => ({ ...prev, customerType: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="shipper">Shipper</SelectItem>
            <SelectItem value="consignee">Consignee</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="contactPerson">Contact Person</Label>
        <Input
          id="contactPerson"
          value={formData.contactPerson}
          onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="creditLimit">Credit Limit ($)</Label>
        <Input
          id="creditLimit"
          type="number"
          value={formData.creditLimit}
          onChange={(e) => setFormData(prev => ({ ...prev, creditLimit: Number(e.target.value) }))}
          required
        />
      </div>

      <Button type="submit" className="w-full">Add Customer</Button>
    </form>
  );
}