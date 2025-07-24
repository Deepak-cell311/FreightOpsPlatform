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
  User, 
  Edit, 
  Save, 
  X, 
  Calendar, 
  Phone, 
  Mail,
  MapPin,
  Truck,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Star,
  Award,
  Upload,
  Download,
  Eye
} from "lucide-react";

interface DriverProfile {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth: string;
  hireDate: string;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  cdlNumber: string;
  cdlClass: string;
  cdlExpiry: string;
  medicalCertExpiry: string;
  endorsements: string[];
  assignedTruckId?: string;
  assignedTruckUnit?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  payRate: number;
  payType: 'hourly' | 'mileage' | 'salary';
  totalMiles: number;
  totalLoads: number;
  safetyScore: number;
  performanceRating: number;
  lastLoadDate: string;
  currentLocation: string;
  homeTerminal: string;
  notes: string;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    uploadDate: string;
    expiryDate?: string;
    url: string;
  }>;
  violations: Array<{
    id: string;
    date: string;
    type: string;
    description: string;
    severity: 'minor' | 'major' | 'serious';
  }>;
  recentLoads: Array<{
    id: string;
    loadNumber: string;
    pickupDate: string;
    deliveryDate: string;
    origin: string;
    destination: string;
    miles: number;
    revenue: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function DriverProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  // Extract driver ID from URL
  const driverId = location.split('/').pop();

  // Fetch driver profile
  const { data: driver, isLoading } = useQuery<DriverProfile>({
    queryKey: ['/api/drivers', driverId],
    enabled: !!driverId && !!user,
  });

  // Update driver mutation
  const updateDriverMutation = useMutation({
    mutationFn: async (updateData: Partial<DriverProfile>) => {
      return await apiRequest('PUT', `/api/drivers/${driverId}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drivers', driverId] });
      toast({ title: "Driver profile updated successfully" });
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

  if (!driver) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Driver not found</h2>
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
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'bg-yellow-100 text-yellow-800';
      case 'major': return 'bg-orange-100 text-orange-800';
      case 'serious': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with Photo and Basic Info */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="h-10 w-10 text-gray-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{driver.firstName} {driver.lastName}</h1>
            <p className="text-gray-600">Employee ID: {driver.employeeId}</p>
            <p className="text-gray-600">CDL: {driver.cdlNumber}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={getStatusColor(driver.status)}>
            {driver.status.replace('_', ' ').toUpperCase()}
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
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="loads">Load History</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input value={driver.firstName} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input value={driver.lastName} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input type="date" value={driver.dateOfBirth} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Email</Label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <Input value={driver.email} disabled={!isEditing} />
                  </div>
                </div>
                <div>
                  <Label>Phone</Label>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <Input value={driver.phone} disabled={!isEditing} />
                  </div>
                </div>
                <div>
                  <Label>Hire Date</Label>
                  <Input type="date" value={driver.hireDate} disabled={!isEditing} />
                </div>
              </div>
              
              {/* Address */}
              <div className="mt-4">
                <Label>Address</Label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                  <div className="md:col-span-2">
                    <Input placeholder="Street Address" value={driver.address} disabled={!isEditing} />
                  </div>
                  <div>
                    <Input placeholder="City" value={driver.city} disabled={!isEditing} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="State" value={driver.state} disabled={!isEditing} />
                    <Input placeholder="ZIP" value={driver.zipCode} disabled={!isEditing} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CDL and Certifications */}
          <Card>
            <CardHeader>
              <CardTitle>CDL & Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>CDL Number</Label>
                  <Input value={driver.cdlNumber} disabled={!isEditing} />
                </div>
                <div>
                  <Label>CDL Class</Label>
                  <Input value={driver.cdlClass} disabled={!isEditing} />
                </div>
                <div>
                  <Label>CDL Expiry</Label>
                  <Input type="date" value={driver.cdlExpiry} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Medical Certificate Expiry</Label>
                  <Input type="date" value={driver.medicalCertExpiry} disabled={!isEditing} />
                </div>
                <div className="md:col-span-2">
                  <Label>Endorsements</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {driver.endorsements.map((endorsement, index) => (
                      <Badge key={index} variant="outline">{endorsement}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Expiry Warnings */}
              <div className="mt-4 space-y-2">
                {new Date(driver.cdlExpiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800">CDL Expiring Soon</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      CDL expires on {new Date(driver.cdlExpiry).toLocaleDateString()}
                    </p>
                  </div>
                )}
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
                    <Input value={driver.assignedTruckUnit || 'Unassigned'} disabled />
                  </div>
                </div>
                <div>
                  <Label>Current Location</Label>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <Input value={driver.currentLocation} disabled={!isEditing} />
                  </div>
                </div>
                <div>
                  <Label>Home Terminal</Label>
                  <Input value={driver.homeTerminal} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Last Load Completion</Label>
                  <Input value={new Date(driver.lastLoadDate).toLocaleDateString()} disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Contact Name</Label>
                  <Input value={driver.emergencyContactName} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Contact Phone</Label>
                  <Input value={driver.emergencyContactPhone} disabled={!isEditing} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Driver Documents</span>
                </CardTitle>
                <Button onClick={() => setShowDocumentUpload(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {driver.documents.map((doc) => (
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
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
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
                  <Star className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{driver.safetyScore}/100</div>
                  <div className="text-sm text-gray-600">Safety Score</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-green-50">
                  <Award className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <div className="text-2xl font-bold text-green-600">{driver.performanceRating}/5</div>
                  <div className="text-sm text-gray-600">Performance Rating</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-purple-50">
                  <Truck className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{driver.totalLoads}</div>
                  <div className="text-sm text-gray-600">Total Loads</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-orange-50">
                  <MapPin className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                  <div className="text-2xl font-bold text-orange-600">{driver.totalMiles.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Miles</div>
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
                {driver.recentLoads.map((load) => (
                  <div key={load.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Load #{load.loadNumber}</p>
                        <p className="text-sm text-gray-600">{load.origin} → {load.destination}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(load.pickupDate).toLocaleDateString()} - {new Date(load.deliveryDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${load.revenue.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{load.miles} miles</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Safety Violations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {driver.violations.length > 0 ? (
                  driver.violations.map((violation) => (
                    <div key={violation.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{violation.type}</p>
                            <Badge className={getSeverityColor(violation.severity)}>
                              {violation.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{violation.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(violation.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-3" />
                    <p className="text-lg font-medium text-green-600">Clean Record</p>
                    <p className="text-gray-600">No safety violations on file</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Payroll Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Pay Type</Label>
                  <Input value={driver.payType} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Pay Rate</Label>
                  <Input 
                    value={`$${driver.payRate}${driver.payType === 'hourly' ? '/hr' : driver.payType === 'mileage' ? '/mile' : '/year'}`} 
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
            placeholder="Add notes about this driver..."
            value={driver.notes}
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
            onClick={() => updateDriverMutation.mutate({})}
            disabled={updateDriverMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      )}

      {/* Document Upload Modal */}
      <Dialog open={showDocumentUpload} onOpenChange={setShowDocumentUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Document Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cdl">CDL License</SelectItem>
                  <SelectItem value="medical">Medical Certificate</SelectItem>
                  <SelectItem value="endorsement">Endorsement</SelectItem>
                  <SelectItem value="training">Training Certificate</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Document Name</Label>
              <Input placeholder="Enter document name" />
            </div>
            <div>
              <Label>Expiry Date (if applicable)</Label>
              <Input type="date" />
            </div>
            <div>
              <Label>File</Label>
              <Input type="file" accept=".pdf,.jpg,.jpeg,.png" />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowDocumentUpload(false)}>
                Cancel
              </Button>
              <Button>Upload</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}