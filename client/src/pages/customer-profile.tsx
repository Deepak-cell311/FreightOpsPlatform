import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { 
  Building2, 
  Edit, 
  Save, 
  X, 
  Calendar, 
  Phone, 
  Mail,
  MapPin,
  CreditCard,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Star,
  TrendingUp,
  Package,
  Truck,
  BarChart3
} from "lucide-react";

interface CustomerProfile {
  id: string;
  customerCode: string;
  companyName: string;
  customerType: 'shipper' | 'consignee' | 'broker' | 'both';
  status: 'active' | 'inactive' | 'on_hold' | 'credit_hold';
  primaryContactName: string;
  primaryContactTitle: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  shippingLocations: Array<{
    id: string;
    name: string;
    address: string;
    contactName: string;
    contactPhone: string;
    hours: string;
    specialInstructions: string;
  }>;
  creditInfo: {
    creditLimit: number;
    availableCredit: number;
    paymentTerms: string;
    paymentTermsDays: number;
    creditRating: string;
    lastCreditCheck: string;
  };
  preferences: {
    preferredEquipmentTypes: string[];
    commodityTypes: string[];
    specialRequirements: string[];
    insuranceRequirements: string;
    temperatureRequirements?: string;
  };
  pricing: {
    defaultRateStructure: 'per_mile' | 'flat_rate' | 'percentage';
    standardRate: number;
    fuelSurchargeRate: number;
    minimumCharge: number;
    accessorialRates: Array<{
      service: string;
      rate: number;
      unit: string;
    }>;
  };
  performance: {
    totalLoads: number;
    totalRevenue: number;
    averageLoadValue: number;
    onTimePerformance: number;
    customerRating: number;
    lastLoadDate: string;
    preferredLanes: string[];
  };
  documents: Array<{
    id: string;
    name: string;
    type: string;
    uploadDate: string;
    expiryDate?: string;
    url: string;
  }>;
  recentLoads: Array<{
    id: string;
    loadNumber: string;
    pickupDate: string;
    deliveryDate: string;
    origin: string;
    destination: string;
    revenue: number;
    status: string;
    commodity: string;
  }>;
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue';
    loadNumbers: string[];
  }>;
  notes: string;
  salesRep: string;
  accountManager: string;
  createdAt: string;
  updatedAt: string;
}

export default function CustomerProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Extract customer ID from URL
  const customerId = location.split('/').pop();

  // Fetch customer profile
  const { data: customer, isLoading } = useQuery<CustomerProfile>({
    queryKey: ['/api/customers', customerId],
    enabled: !!customerId && !!user,
  });

  // Update customer mutation
  const updateCustomerMutation = useMutation({
    mutationFn: async (updateData: Partial<CustomerProfile>) => {
      return await apiRequest('PUT', `/api/customers/${customerId}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers', customerId] });
      toast({ title: "Customer profile updated successfully" });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Update failed", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Customer not found</h2>
          <Button onClick={() => setLocation('/customers')} className="mt-4">
            Return to Customers
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'credit_hold': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{customer.companyName}</h1>
            <p className="text-gray-600">Customer ID: {customer.customerCode}</p>
            <p className="text-gray-600 capitalize">{customer.customerType.replace('_', ' ')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={getStatusColor(customer.status)}>
            {customer.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <Button
            variant={isEditing ? "outline" : "default"}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="credit">Credit</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="loads">Load History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Company Name</Label>
                  <Input value={customer.companyName} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Customer Code</Label>
                  <Input value={customer.customerCode} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Customer Type</Label>
                  {isEditing ? (
                    <Select defaultValue={customer.customerType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shipper">Shipper</SelectItem>
                        <SelectItem value="consignee">Consignee</SelectItem>
                        <SelectItem value="broker">Broker</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={customer.customerType} disabled />
                  )}
                </div>
                <div>
                  <Label>Status</Label>
                  {isEditing ? (
                    <Select defaultValue={customer.status}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="credit_hold">Credit Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={customer.status} disabled />
                  )}
                </div>
                <div>
                  <Label>Sales Rep</Label>
                  <Input value={customer.salesRep} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Account Manager</Label>
                  <Input value={customer.accountManager} disabled={!isEditing} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Primary Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Primary Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Contact Name</Label>
                  <Input value={customer.primaryContactName} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Title</Label>
                  <Input value={customer.primaryContactTitle} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Email</Label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <Input value={customer.primaryContactEmail} disabled={!isEditing} />
                  </div>
                </div>
                <div>
                  <Label>Phone</Label>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <Input value={customer.primaryContactPhone} disabled={!isEditing} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                  <Label>Street Address</Label>
                  <Input value={customer.billingAddress.street} disabled={!isEditing} />
                </div>
                <div>
                  <Label>City</Label>
                  <Input value={customer.billingAddress.city} disabled={!isEditing} />
                </div>
                <div>
                  <Label>State</Label>
                  <Input value={customer.billingAddress.state} disabled={!isEditing} />
                </div>
                <div>
                  <Label>ZIP Code</Label>
                  <Input value={customer.billingAddress.zipCode} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input value={customer.billingAddress.country} disabled={!isEditing} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg bg-blue-50">
                  <Package className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{customer.performance.totalLoads}</div>
                  <div className="text-sm text-gray-600">Total Loads</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-green-50">
                  <DollarSign className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <div className="text-2xl font-bold text-green-600">${customer.performance.totalRevenue.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-purple-50">
                  <Clock className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{customer.performance.onTimePerformance}%</div>
                  <div className="text-sm text-gray-600">On-Time Performance</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-orange-50">
                  <Star className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                  <div className="text-2xl font-bold text-orange-600">{customer.performance.customerRating}/5</div>
                  <div className="text-sm text-gray-600">Customer Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Preferred Equipment Types</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {customer.preferences.preferredEquipmentTypes.map((type, index) => (
                      <Badge key={index} variant="outline">{type}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Commodity Types</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {customer.preferences.commodityTypes.map((commodity, index) => (
                      <Badge key={index} variant="outline">{commodity}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Special Requirements</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {customer.preferences.specialRequirements.map((req, index) => (
                      <Badge key={index} variant="outline">{req}</Badge>
                    ))}
                  </div>
                </div>
                {customer.preferences.temperatureRequirements && (
                  <div>
                    <Label>Temperature Requirements</Label>
                    <Input value={customer.preferences.temperatureRequirements} disabled={!isEditing} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Shipping Locations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customer.shippingLocations.map((location) => (
                  <div key={location.id} className="p-4 border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">{location.name}</p>
                        <p className="text-sm text-gray-600">{location.address}</p>
                        <p className="text-sm text-gray-600">Hours: {location.hours}</p>
                      </div>
                      <div>
                        <p className="text-sm"><strong>Contact:</strong> {location.contactName}</p>
                        <p className="text-sm"><strong>Phone:</strong> {location.contactPhone}</p>
                        {location.specialInstructions && (
                          <p className="text-sm text-blue-600 mt-2">
                            <strong>Special Instructions:</strong> {location.specialInstructions}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Credit Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Credit Limit</Label>
                  <Input 
                    value={`$${customer.creditInfo.creditLimit.toLocaleString()}`} 
                    disabled={!isEditing} 
                  />
                </div>
                <div>
                  <Label>Available Credit</Label>
                  <Input 
                    value={`$${customer.creditInfo.availableCredit.toLocaleString()}`} 
                    disabled={!isEditing} 
                  />
                </div>
                <div>
                  <Label>Credit Rating</Label>
                  <Input value={customer.creditInfo.creditRating} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Payment Terms</Label>
                  <Input value={customer.creditInfo.paymentTerms} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Payment Terms (Days)</Label>
                  <Input value={customer.creditInfo.paymentTermsDays} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Last Credit Check</Label>
                  <Input 
                    type="date" 
                    value={customer.creditInfo.lastCreditCheck} 
                    disabled={!isEditing} 
                  />
                </div>
              </div>
              
              {/* Credit Utilization */}
              <div className="mt-6">
                <Label>Credit Utilization</Label>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{
                      width: `${((customer.creditInfo.creditLimit - customer.creditInfo.availableCredit) / customer.creditInfo.creditLimit) * 100}%`
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {(((customer.creditInfo.creditLimit - customer.creditInfo.availableCredit) / customer.creditInfo.creditLimit) * 100).toFixed(1)}% utilized
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customer.invoices.map((invoice) => (
                  <div key={invoice.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Invoice #{invoice.invoiceNumber}</p>
                        <p className="text-sm text-gray-600">
                          Loads: {invoice.loadNumbers.join(', ')}
                        </p>
                        <p className="text-sm text-gray-600">
                          Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${invoice.amount.toLocaleString()}</p>
                        <Badge className={getInvoiceStatusColor(invoice.status)}>
                          {invoice.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Pricing Structure</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Rate Structure</Label>
                  <Input value={customer.pricing.defaultRateStructure.replace('_', ' ')} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Standard Rate</Label>
                  <Input value={`$${customer.pricing.standardRate}`} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Fuel Surcharge Rate</Label>
                  <Input value={`${customer.pricing.fuelSurchargeRate}%`} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Minimum Charge</Label>
                  <Input value={`$${customer.pricing.minimumCharge}`} disabled={!isEditing} />
                </div>
              </div>
              
              {/* Accessorial Rates */}
              <div className="mt-6">
                <h4 className="font-medium mb-3">Accessorial Rates</h4>
                <div className="space-y-2">
                  {customer.pricing.accessorialRates.map((rate, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 p-3 border rounded">
                      <div>
                        <Label>Service</Label>
                        <Input value={rate.service} disabled={!isEditing} />
                      </div>
                      <div>
                        <Label>Rate</Label>
                        <Input value={`$${rate.rate}`} disabled={!isEditing} />
                      </div>
                      <div>
                        <Label>Unit</Label>
                        <Input value={rate.unit} disabled={!isEditing} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Load History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customer.recentLoads.map((load) => (
                  <div key={load.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Load #{load.loadNumber}</p>
                        <p className="text-sm text-gray-600">{load.origin} → {load.destination}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(load.pickupDate).toLocaleDateString()} - {new Date(load.deliveryDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">Commodity: {load.commodity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${load.revenue.toLocaleString()}</p>
                        <Badge variant="outline">{load.status}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Customer Documents</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customer.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-gray-600">
                          {doc.type} • Uploaded {new Date(doc.uploadDate).toLocaleDateString()}
                          {doc.expiryDate && ` • Expires ${new Date(doc.expiryDate).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">View</Button>
                      <Button variant="outline" size="sm">Download</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="Add notes about this customer..."
            value={customer.notes}
            disabled={!isEditing}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      {isEditing && (
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => updateCustomerMutation.mutate({})}
            disabled={updateCustomerMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}