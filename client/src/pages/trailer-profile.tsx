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
  Truck, 
  Edit, 
  Save, 
  X, 
  Calendar, 
  Gauge, 
  Wrench,
  FileText,
  AlertTriangle,
  MapPin,
  User,
  Shield,
  Clock,
  DollarSign,
  BarChart3,
  Package,
  Thermometer,
  Scale
} from "lucide-react";

interface TrailerProfile {
  id: string;
  trailerNumber: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  trailerType: 'dry_van' | 'reefer' | 'flatbed' | 'tanker' | 'lowboy' | 'container';
  status: 'active' | 'maintenance' | 'inactive' | 'out_of_service';
  assignedTruckId?: string;
  assignedTruckUnit?: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  currentLocation: string;
  mileage: number;
  length: number;
  width: number;
  height: number;
  weightCapacity: number;
  tareWeight: number;
  axleCount: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  nextMaintenanceMiles: number;
  insuranceProvider: string;
  insurancePolicy: string;
  insuranceExpiry: string;
  registrationExpiry: string;
  dotInspectionDate: string;
  annualInspectionDate: string;
  notes: string;
  purchaseDate: string;
  purchasePrice: number;
  monthlyPayment: number;
  reeferSpecs?: {
    make: string;
    model: string;
    serialNumber: string;
    fuelType: string;
    tempRange: string;
    lastServiceDate: string;
  };
  specifications: {
    doorType: string;
    floorType: string;
    suspension: string;
    brakeType: string;
    antiLock: boolean;
    airRide: boolean;
    logisticPosts: boolean;
    eTrack: boolean;
  };
  maintenanceHistory: Array<{
    id: string;
    date: string;
    type: string;
    description: string;
    cost: number;
    mileage: number;
  }>;
  loadHistory: Array<{
    id: string;
    loadNumber: string;
    pickupDate: string;
    deliveryDate: string;
    origin: string;
    destination: string;
    weight: number;
    commodity: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function TrailerProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Extract trailer ID from URL
  const trailerId = location.split('/').pop();

  // Fetch trailer profile
  const { data: trailer, isLoading } = useQuery<TrailerProfile>({
    queryKey: ['/api/trailers', trailerId],
    enabled: !!trailerId && !!user,
  });

  // Update trailer mutation
  const updateTrailerMutation = useMutation({
    mutationFn: async (updateData: Partial<TrailerProfile>) => {
      return await apiRequest('PUT', `/api/trailers/${trailerId}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trailers', trailerId] });
      toast({ title: "Trailer updated successfully" });
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

  if (!trailer) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Trailer not found</h2>
          <Button onClick={() => setLocation('/fleet')} className="mt-4">
            Return to Fleet
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'out_of_service': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrailerTypeIcon = (type: string) => {
    switch (type) {
      case 'reefer': return <Thermometer className="h-5 w-5" />;
      case 'flatbed': return <Package className="h-5 w-5" />;
      case 'tanker': return <Scale className="h-5 w-5" />;
      default: return <Truck className="h-5 w-5" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3">
            {getTrailerTypeIcon(trailer.trailerType)}
            <div>
              <h1 className="text-2xl font-bold">Trailer #{trailer.trailerNumber}</h1>
              <p className="text-gray-600">{trailer.year} {trailer.make} {trailer.model}</p>
              <p className="text-gray-600 capitalize">{trailer.trailerType.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={getStatusColor(trailer.status)}>
            {trailer.status.replace('_', ' ').toUpperCase()}
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="loads">Load History</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Trailer Number</Label>
                  <Input value={trailer.trailerNumber} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Make</Label>
                  <Input value={trailer.make} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Model</Label>
                  <Input value={trailer.model} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Year</Label>
                  <Input value={trailer.year} disabled={!isEditing} />
                </div>
                <div>
                  <Label>VIN</Label>
                  <Input value={trailer.vin} disabled={!isEditing} />
                </div>
                <div>
                  <Label>License Plate</Label>
                  <Input value={trailer.licensePlate} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Trailer Type</Label>
                  {isEditing ? (
                    <Select defaultValue={trailer.trailerType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dry_van">Dry Van</SelectItem>
                        <SelectItem value="reefer">Reefer</SelectItem>
                        <SelectItem value="flatbed">Flatbed</SelectItem>
                        <SelectItem value="tanker">Tanker</SelectItem>
                        <SelectItem value="lowboy">Lowboy</SelectItem>
                        <SelectItem value="container">Container</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={trailer.trailerType.replace('_', ' ')} disabled />
                  )}
                </div>
                <div>
                  <Label>Status</Label>
                  {isEditing ? (
                    <Select defaultValue={trailer.status}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="out_of_service">Out of Service</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={trailer.status} disabled />
                  )}
                </div>
                <div>
                  <Label>Current Location</Label>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <Input value={trailer.currentLocation} disabled={!isEditing} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>Current Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Assigned Truck</Label>
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-gray-500" />
                    <Input value={trailer.assignedTruckUnit || 'Unassigned'} disabled />
                  </div>
                </div>
                <div>
                  <Label>Assigned Driver</Label>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <Input value={trailer.assignedDriverName || 'Unassigned'} disabled />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dimensions & Capacity */}
          <Card>
            <CardHeader>
              <CardTitle>Dimensions & Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Length (ft)</Label>
                  <Input value={trailer.length} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Width (ft)</Label>
                  <Input value={trailer.width} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Height (ft)</Label>
                  <Input value={trailer.height} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Axle Count</Label>
                  <Input value={trailer.axleCount} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Weight Capacity (lbs)</Label>
                  <Input value={trailer.weightCapacity.toLocaleString()} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Tare Weight (lbs)</Label>
                  <Input value={trailer.tareWeight.toLocaleString()} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Total Mileage</Label>
                  <Input value={trailer.mileage.toLocaleString()} disabled={!isEditing} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Door Type</Label>
                  <Input value={trailer.specifications.doorType} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Floor Type</Label>
                  <Input value={trailer.specifications.floorType} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Suspension</Label>
                  <Input value={trailer.specifications.suspension} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Brake Type</Label>
                  <Input value={trailer.specifications.brakeType} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Anti-Lock Brakes</Label>
                  <Input value={trailer.specifications.antiLock ? 'Yes' : 'No'} disabled />
                </div>
                <div>
                  <Label>Air Ride Suspension</Label>
                  <Input value={trailer.specifications.airRide ? 'Yes' : 'No'} disabled />
                </div>
                <div>
                  <Label>Logistic Posts</Label>
                  <Input value={trailer.specifications.logisticPosts ? 'Yes' : 'No'} disabled />
                </div>
                <div>
                  <Label>E-Track</Label>
                  <Input value={trailer.specifications.eTrack ? 'Yes' : 'No'} disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reefer Specifications (if applicable) */}
          {trailer.trailerType === 'reefer' && trailer.reeferSpecs && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Thermometer className="h-5 w-5" />
                  <span>Reefer Specifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label>Reefer Make</Label>
                    <Input value={trailer.reeferSpecs.make} disabled={!isEditing} />
                  </div>
                  <div>
                    <Label>Reefer Model</Label>
                    <Input value={trailer.reeferSpecs.model} disabled={!isEditing} />
                  </div>
                  <div>
                    <Label>Serial Number</Label>
                    <Input value={trailer.reeferSpecs.serialNumber} disabled={!isEditing} />
                  </div>
                  <div>
                    <Label>Fuel Type</Label>
                    <Input value={trailer.reeferSpecs.fuelType} disabled={!isEditing} />
                  </div>
                  <div>
                    <Label>Temperature Range</Label>
                    <Input value={trailer.reeferSpecs.tempRange} disabled={!isEditing} />
                  </div>
                  <div>
                    <Label>Last Service Date</Label>
                    <Input 
                      type="date" 
                      value={trailer.reeferSpecs.lastServiceDate} 
                      disabled={!isEditing} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wrench className="h-5 w-5" />
                <span>Maintenance Schedule</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Last Maintenance</Label>
                    <Input 
                      type="date" 
                      value={trailer.lastMaintenanceDate} 
                      disabled={!isEditing} 
                    />
                  </div>
                  <div>
                    <Label>Next Maintenance Due</Label>
                    <Input 
                      type="date" 
                      value={trailer.nextMaintenanceDate} 
                      disabled={!isEditing} 
                    />
                  </div>
                </div>
                <div>
                  <Label>Next Maintenance at Miles</Label>
                  <Input 
                    value={trailer.nextMaintenanceMiles.toLocaleString()} 
                    disabled={!isEditing} 
                  />
                </div>
                
                {/* Maintenance History */}
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Maintenance History</h4>
                  <div className="space-y-3">
                    {trailer.maintenanceHistory.map((record) => (
                      <div key={record.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{record.type}</p>
                            <p className="text-sm text-gray-600">{record.description}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(record.date).toLocaleDateString()} • {record.mileage.toLocaleString()} miles
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${record.cost.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Documents & Compliance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Insurance Provider</Label>
                  <Input value={trailer.insuranceProvider} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Policy Number</Label>
                  <Input value={trailer.insurancePolicy} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Insurance Expiry</Label>
                  <Input 
                    type="date" 
                    value={trailer.insuranceExpiry} 
                    disabled={!isEditing} 
                  />
                </div>
                <div>
                  <Label>Registration Expiry</Label>
                  <Input 
                    type="date" 
                    value={trailer.registrationExpiry} 
                    disabled={!isEditing} 
                  />
                </div>
                <div>
                  <Label>Last DOT Inspection</Label>
                  <Input 
                    type="date" 
                    value={trailer.dotInspectionDate} 
                    disabled={!isEditing} 
                  />
                </div>
                <div>
                  <Label>Annual Inspection</Label>
                  <Input 
                    type="date" 
                    value={trailer.annualInspectionDate} 
                    disabled={!isEditing} 
                  />
                </div>
              </div>
              
              {/* Compliance Status */}
              <div className="mt-6 space-y-3">
                <h4 className="font-medium">Compliance Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>Insurance</span>
                    <Badge className="bg-green-100 text-green-800">Valid</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>Registration</span>
                    <Badge className="bg-green-100 text-green-800">Valid</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>DOT Inspection</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Due Soon</Badge>
                  </div>
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
                {trailer.loadHistory.map((load) => (
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
                        <p className="font-medium">{load.weight.toLocaleString()} lbs</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Financial Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Purchase Date</Label>
                  <Input 
                    type="date" 
                    value={trailer.purchaseDate} 
                    disabled={!isEditing} 
                  />
                </div>
                <div>
                  <Label>Purchase Price</Label>
                  <Input 
                    value={`$${trailer.purchasePrice.toLocaleString()}`} 
                    disabled={!isEditing} 
                  />
                </div>
                <div>
                  <Label>Monthly Payment</Label>
                  <Input 
                    value={`$${trailer.monthlyPayment.toLocaleString()}`} 
                    disabled={!isEditing} 
                  />
                </div>
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
            placeholder="Add notes about this trailer..."
            value={trailer.notes}
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
            onClick={() => updateTrailerMutation.mutate({})}
            disabled={updateTrailerMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}