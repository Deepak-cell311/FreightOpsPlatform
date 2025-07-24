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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { 
  Truck, 
  Edit, 
  Save, 
  X, 
  Calendar, 
  Gauge, 
  Fuel, 
  Wrench,
  FileText,
  AlertTriangle,
  MapPin,
  User,
  Shield,
  Clock,
  DollarSign,
  BarChart3
} from "lucide-react";

interface TruckProfile {
  id: string;
  unitNumber: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  status: 'active' | 'maintenance' | 'inactive' | 'out_of_service';
  assignedDriverId?: string;
  assignedDriverName?: string;
  currentLocation: string;
  mileage: number;
  fuelLevel: number;
  fuelCapacity: number;
  mpgAverage: number;
  engineHours: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  nextMaintenanceMiles: number;
  insuranceProvider: string;
  insurancePolicy: string;
  insuranceExpiry: string;
  registrationExpiry: string;
  dotInspectionDate: string;
  notes: string;
  purchaseDate: string;
  purchasePrice: number;
  monthlyPayment: number;
  specifications: {
    engineType: string;
    transmission: string;
    axleConfiguration: string;
    grossWeight: number;
    sleeper: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export default function TruckProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Extract truck ID from URL
  const truckId = location.split('/').pop();

  // Fetch truck profile
  const { data: truck, isLoading } = useQuery<TruckProfile>({
    queryKey: ['/api/trucks', truckId],
    enabled: !!truckId && !!user,
  });

  // Update truck mutation
  const updateTruckMutation = useMutation({
    mutationFn: async (updateData: Partial<TruckProfile>) => {
      return await apiRequest('PUT', `/api/trucks/${truckId}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trucks', truckId] });
      toast({ title: "Truck updated successfully" });
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

  if (!truck) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Truck not found</h2>
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3">
            <Truck className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold">Unit #{truck.unitNumber}</h1>
              <p className="text-gray-600">{truck.year} {truck.make} {truck.model}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={getStatusColor(truck.status)}>
            {truck.status.replace('_', ' ').toUpperCase()}
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
          <TabsTrigger value="performance">Performance</TabsTrigger>
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
                  <Label>Unit Number</Label>
                  <Input value={truck.unitNumber} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Make</Label>
                  <Input value={truck.make} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Model</Label>
                  <Input value={truck.model} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Year</Label>
                  <Input value={truck.year} disabled={!isEditing} />
                </div>
                <div>
                  <Label>VIN</Label>
                  <Input value={truck.vin} disabled={!isEditing} />
                </div>
                <div>
                  <Label>License Plate</Label>
                  <Input value={truck.licensePlate} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Status</Label>
                  {isEditing ? (
                    <Select defaultValue={truck.status}>
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
                    <Input value={truck.status} disabled />
                  )}
                </div>
                <div>
                  <Label>Current Location</Label>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <Input value={truck.currentLocation} disabled={!isEditing} />
                  </div>
                </div>
                <div>
                  <Label>Assigned Driver</Label>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <Input value={truck.assignedDriverName || 'Unassigned'} disabled />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Current Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Gauge className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <div className="text-2xl font-bold">{truck.mileage.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Miles</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Fuel className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <div className="text-2xl font-bold">{truck.fuelLevel}%</div>
                  <div className="text-sm text-gray-600">Fuel Level</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <BarChart3 className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                  <div className="text-2xl font-bold">{truck.mpgAverage}</div>
                  <div className="text-sm text-gray-600">MPG Average</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Clock className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <div className="text-2xl font-bold">{truck.engineHours.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Engine Hours</div>
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
                  <Label>Engine Type</Label>
                  <Input value={truck.specifications.engineType} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Transmission</Label>
                  <Input value={truck.specifications.transmission} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Axle Configuration</Label>
                  <Input value={truck.specifications.axleConfiguration} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Gross Weight (lbs)</Label>
                  <Input value={truck.specifications.grossWeight} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Fuel Capacity (gal)</Label>
                  <Input value={truck.fuelCapacity} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Sleeper Cab</Label>
                  <Input value={truck.specifications.sleeper ? 'Yes' : 'No'} disabled />
                </div>
              </div>
            </CardContent>
          </Card>
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
                      value={truck.lastMaintenanceDate} 
                      disabled={!isEditing} 
                    />
                  </div>
                  <div>
                    <Label>Next Maintenance Due</Label>
                    <Input 
                      type="date" 
                      value={truck.nextMaintenanceDate} 
                      disabled={!isEditing} 
                    />
                  </div>
                </div>
                <div>
                  <Label>Next Maintenance at Miles</Label>
                  <Input 
                    value={truck.nextMaintenanceMiles.toLocaleString()} 
                    disabled={!isEditing} 
                  />
                </div>
                
                {/* Maintenance Alerts */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Upcoming Maintenance</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Next service due in {truck.nextMaintenanceMiles - truck.mileage} miles
                  </p>
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
                  <Input value={truck.insuranceProvider} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Policy Number</Label>
                  <Input value={truck.insurancePolicy} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Insurance Expiry</Label>
                  <Input 
                    type="date" 
                    value={truck.insuranceExpiry} 
                    disabled={!isEditing} 
                  />
                </div>
                <div>
                  <Label>Registration Expiry</Label>
                  <Input 
                    type="date" 
                    value={truck.registrationExpiry} 
                    disabled={!isEditing} 
                  />
                </div>
                <div>
                  <Label>Last DOT Inspection</Label>
                  <Input 
                    type="date" 
                    value={truck.dotInspectionDate} 
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

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg bg-blue-50">
                  <BarChart3 className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <div className="text-2xl font-bold text-blue-600">7.2</div>
                  <div className="text-sm text-gray-600">Current MPG</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-green-50">
                  <Gauge className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <div className="text-2xl font-bold text-green-600">98.5%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-purple-50">
                  <Clock className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <div className="text-2xl font-bold text-purple-600">2,450</div>
                  <div className="text-sm text-gray-600">Miles/Month</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-orange-50">
                  <DollarSign className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                  <div className="text-2xl font-bold text-orange-600">${truckData?.costPerMile?.toFixed(2) || '0.00'}</div>
                  <div className="text-sm text-gray-600">Cost/Mile</div>
                </div>
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
                    value={truck.purchaseDate} 
                    disabled={!isEditing} 
                  />
                </div>
                <div>
                  <Label>Purchase Price</Label>
                  <Input 
                    value={`$${truck.purchasePrice.toLocaleString()}`} 
                    disabled={!isEditing} 
                  />
                </div>
                <div>
                  <Label>Monthly Payment</Label>
                  <Input 
                    value={`$${truck.monthlyPayment.toLocaleString()}`} 
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
            placeholder="Add notes about this truck..."
            value={truck.notes}
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
            onClick={() => updateTruckMutation.mutate({})}
            disabled={updateTruckMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}