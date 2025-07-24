import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TruckingLoadingSkeleton } from "@/components/trucking-loading-skeleton";
import { apiRequest } from "@/lib/queryClient";
import GeolocationTracking from "@/components/geolocation-tracking";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Package, 
  Truck, 
  User, 
  Phone, 
  Clock, 
  Navigation,
  FileText,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Edit,
  Save
} from "lucide-react";

export default function LoadDetail() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/load/:loadId");
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  const loadId = params?.loadId;

  // Fetch load details
  const { data: load, isLoading: loadLoading } = useQuery({
    queryKey: ["/api/loads", loadId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/loads/${loadId}`);
      return response.json();
    },
    enabled: !!loadId,
  });

  // Fetch load billing
  const { data: billing = [] } = useQuery({
    queryKey: ["/api/load-billing", loadId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/load-billing/${loadId}`);
      return response.json();
    },
    enabled: !!loadId,
  });

  // Update load mutation
  const updateLoadMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/loads/${loadId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loads", loadId] });
      setIsEditing(false);
      toast({
        title: "Load Updated",
        description: "Load details have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update load details.",
        variant: "destructive",
      });
    },
  });

  // Auth check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view load details",
        variant: "destructive",
      });
      setLocation("/auth");
    }
  }, [isAuthenticated, authLoading, toast, setLocation]);

  // Initialize edit data when load is loaded
  useEffect(() => {
    if (load) {
      setEditData(load);
    }
  }, [load]);

  if (authLoading || loadLoading) {
    return <TruckingLoadingSkeleton variant="load" />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (!match || !load) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Load Not Found</h2>
            <p className="text-gray-600 mb-4">The requested load could not be found.</p>
            <Button onClick={() => setLocation("/dispatch?submenu=load-management")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Load Management
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-green-100 text-green-800';
      case 'at_pickup': return 'bg-purple-100 text-purple-800';
      case 'at_delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSave = () => {
    updateLoadMutation.mutate(editData);
  };

  const handleInputChange = (field: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => setLocation("/dispatch?submenu=load-management")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Load Management
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Load #{load.loadNumber}</h1>
              <p className="text-gray-600">Detailed load information and tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={getStatusColor(load.status)}>
              {load.status?.toUpperCase() || 'UNKNOWN'}
            </Badge>
            {isEditing ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={updateLoadMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {updateLoadMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Load
              </Button>
            )}
          </div>
        </div>

        {/* Load Details Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="dispatch">Dispatch</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Load Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Load Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Load Number</label>
                      <div className="text-lg font-semibold">{load.loadNumber}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Customer</label>
                      {isEditing ? (
                        <Input 
                          value={editData.customer || ''} 
                          onChange={(e) => handleInputChange('customer', e.target.value)}
                        />
                      ) : (
                        <div className="text-lg">{load.customer || 'Not specified'}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Commodity</label>
                      {isEditing ? (
                        <Input 
                          value={editData.commodity || ''} 
                          onChange={(e) => handleInputChange('commodity', e.target.value)}
                        />
                      ) : (
                        <div>{load.commodity || 'Not specified'}</div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Weight</label>
                      {isEditing ? (
                        <Input 
                          type="number"
                          value={editData.weight || ''} 
                          onChange={(e) => handleInputChange('weight', parseInt(e.target.value) || 0)}
                        />
                      ) : (
                        <div>{load.weight ? `${load.weight.toLocaleString()} lbs` : 'Not specified'}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Priority</label>
                    {isEditing ? (
                      <Select value={editData.priority || ''} onValueChange={(value) => handleInputChange('priority', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={load.priority === 'urgent' ? 'destructive' : load.priority === 'high' ? 'default' : 'secondary'}>
                        {load.priority?.toUpperCase() || 'NORMAL'}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Route Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5" />
                    Route Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-green-600" />
                      Pickup Location
                    </label>
                    {isEditing ? (
                      <Input 
                        value={editData.pickupLocation || ''} 
                        onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                      />
                    ) : (
                      <div className="font-medium">{load.pickupLocation}</div>
                    )}
                    <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      {load.pickupDate ? new Date(load.pickupDate).toLocaleDateString() : 'Not scheduled'}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-red-600" />
                      Delivery Location
                    </label>
                    {isEditing ? (
                      <Input 
                        value={editData.deliveryLocation || ''} 
                        onChange={(e) => handleInputChange('deliveryLocation', e.target.value)}
                      />
                    ) : (
                      <div className="font-medium">{load.deliveryLocation}</div>
                    )}
                    <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      {load.deliveryDate ? new Date(load.deliveryDate).toLocaleDateString() : 'Not scheduled'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Distance</label>
                      <div>{load.distance ? `${load.distance} miles` : 'Not calculated'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Est. Duration</label>
                      <div>{load.estimatedDuration ? `${load.estimatedDuration} hours` : 'Not calculated'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Rate</label>
                      {isEditing ? (
                        <Input 
                          type="number"
                          step="0.01"
                          value={editData.rate || ''} 
                          onChange={(e) => handleInputChange('rate', parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        <div className="text-lg font-semibold text-green-600">
                          ${load.rate?.toLocaleString() || '0.00'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Rate Type</label>
                      <div>{load.rateType || 'Not specified'}</div>
                    </div>
                  </div>

                  {billing.length > 0 && (
                    <div className="pt-4 border-t">
                      <div className="text-sm font-medium text-gray-500 mb-2">Billing Status</div>
                      <Badge variant={billing[0].billingStatus === 'paid' ? 'default' : 'secondary'}>
                        {billing[0].billingStatus?.toUpperCase() || 'PENDING'}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Assignment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Assignment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Assigned Driver</label>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{load.assignedDriverName || 'Not assigned'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Assigned Truck</label>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-gray-400" />
                      <span>{load.assignedTruckNumber || 'Not assigned'}</span>
                    </div>
                  </div>

                  {load.dispatchNotes && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Dispatch Notes</label>
                      <div className="text-sm bg-gray-50 p-2 rounded">{load.dispatchNotes}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Dispatch Tab */}
          <TabsContent value="dispatch">
            <Card>
              <CardHeader>
                <CardTitle>Dispatch Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Dispatch leg management and driver assignments will be displayed here.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Billing Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {billing.length > 0 ? (
                  <div className="space-y-4">
                    {billing.map((bill: any) => (
                      <div key={bill.id} className="border rounded-lg p-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Base Rate</label>
                            <div className="text-lg font-semibold">${bill.baseRate?.toLocaleString()}</div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Total Amount</label>
                            <div className="text-lg font-semibold text-green-600">${bill.totalAmount?.toLocaleString()}</div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Status</label>
                            <Badge variant={bill.billingStatus === 'paid' ? 'default' : 'secondary'}>
                              {bill.billingStatus?.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No billing information available for this load.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tracking Tab */}
          <TabsContent value="tracking">
            <GeolocationTracking loadId={load.id} />
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Load Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Document management and upload functionality will be displayed here.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}