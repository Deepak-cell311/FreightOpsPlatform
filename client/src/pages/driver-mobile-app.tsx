import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Smartphone, 
  MapPin, 
  Clock, 
  DollarSign, 
  Camera, 
  Upload, 
  Navigation, 
  Bell, 
  CheckCircle, 
  AlertTriangle,
  Play,
  Pause,
  FileText,
  Route,
  Truck,
  Package,
  Target,
  Zap,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Users,
  Star,
  TrendingUp,
  Download,
  QrCode,
  Wifi,
  Battery,
  Signal
} from "lucide-react";

interface DriverApp {
  id: number;
  companyId: string;
  appName: string;
  appIcon: string;
  primaryColor: string;
  secondaryColor: string;
  isActive: boolean;
  currentLoads: number;
  activeDrivers: number;
  totalDocuments: number;
  averageRating: number;
  payrollIntegration: boolean;
  gpsTracking: boolean;
  geofencing: boolean;
  messaging: boolean;
  documentUpload: boolean;
  loadTendering: boolean;
  eld: boolean;
  settings: any;
}

interface DriverLoad {
  id: number;
  loadNumber: string;
  status: string;
  pickupCity: string;
  pickupState: string;
  deliveryCity: string;
  deliveryState: string;
  scheduledPickup: string;
  scheduledDelivery: string;
  miles: number;
  pay: number;
  commodity: string;
  weight: number;
  trailer: string;
  stops: LoadStop[];
  documents: LoadDocument[];
}

interface LoadStop {
  id: number;
  stopNumber: number;
  stopType: string;
  companyName: string;
  address: string;
  city: string;
  state: string;
  scheduledArrival: string;
  actualArrival?: string;
  isCompleted: boolean;
  geofenceRadius: number;
  latitude: number;
  longitude: number;
}

interface LoadDocument {
  id: number;
  documentType: string;
  fileName: string;
  isRequired: boolean;
  isSubmitted: boolean;
  uploadedAt?: string;
}

interface DriverPay {
  currentPeriodEarnings: number;
  completedLoads: number;
  totalMiles: number;
  averagePayPerMile: number;
  bonuses: number;
  projectedPay: number;
  payPeriodStart: string;
  payPeriodEnd: string;
}

interface GeofenceEvent {
  id: number;
  eventType: string;
  stopName: string;
  triggeredAt: string;
  isAutomatic: boolean;
}

const statusColors = {
  available: "bg-green-100 text-green-800",
  assigned: "bg-blue-100 text-blue-800",
  in_transit: "bg-yellow-100 text-yellow-800",
  at_pickup: "bg-orange-100 text-orange-800",
  loaded: "bg-purple-100 text-purple-800",
  at_delivery: "bg-cyan-100 text-cyan-800",
  delivered: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800"
};

export default function DriverMobileApp() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedLoad, setSelectedLoad] = useState<DriverLoad | null>(null);
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isDriving, setIsDriving] = useState(false);

  // Fetch driver apps
  const { data: driverApps = [], isLoading: appsLoading } = useQuery({
    queryKey: ["/api/driver-apps"],
  });

  // Fetch current driver loads
  const { data: currentLoads = [], isLoading: loadsLoading } = useQuery({
    queryKey: ["/api/driver/loads/current"],
  });

  // Fetch driver pay information
  const { data: driverPay } = useQuery({
    queryKey: ["/api/driver/pay/current"],
  });

  // Fetch recent geofence events
  const { data: geofenceEvents = [] } = useQuery({
    queryKey: ["/api/driver/geofence-events"],
  });

  // Fetch driver notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/driver/notifications"],
  });

  // GPS location tracking
  useEffect(() => {
    if (gpsEnabled && "geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          
          // Send location to server if driving
          if (isDriving) {
            updateLocationMutation.mutate({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              speed: position.coords.speed || 0,
              heading: position.coords.heading || 0,
              accuracy: position.coords.accuracy,
              isMoving: (position.coords.speed || 0) > 5, // Moving if speed > 5 mph
              isOnDuty: true
            });
          }
        },
        (error) => {
          console.error("GPS Error:", error);
          toast({
            title: "GPS Error",
            description: "Unable to get your location. Please check GPS settings.",
            variant: "destructive",
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [gpsEnabled, isDriving]);

  // Update driver location mutation
  const updateLocationMutation = useMutation({
    mutationFn: async (locationData: any) => {
      await apiRequest("POST", "/api/driver/location", locationData);
    },
    onError: (error) => {
      console.error("Location update failed:", error);
    },
  });

  // Accept load mutation
  const acceptLoadMutation = useMutation({
    mutationFn: async (loadId: number) => {
      await apiRequest("POST", `/api/driver/loads/${loadId}/accept`);
    },
    onSuccess: () => {
      toast({
        title: "Load Accepted",
        description: "You have successfully accepted the load.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/loads/current"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update load status mutation
  const updateLoadStatusMutation = useMutation({
    mutationFn: async ({ loadId, status, stopId, notes }: any) => {
      await apiRequest("POST", `/api/driver/loads/${loadId}/status`, {
        status,
        stopId,
        notes,
        location: currentLocation
      });
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Load status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/loads/current"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ loadId, documentType, file }: any) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);
      formData.append("loadId", loadId.toString());
      
      await apiRequest("POST", "/api/driver/documents/upload", formData);
    },
    onSuccess: () => {
      toast({
        title: "Document Uploaded",
        description: "Document has been uploaded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/loads/current"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (loadId: number, documentType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadDocumentMutation.mutate({ loadId, documentType, file });
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getDistanceToStop = (stop: LoadStop) => {
    if (!currentLocation) return null;
    return calculateDistance(currentLocation.lat, currentLocation.lng, stop.latitude, stop.longitude);
  };

  const isInGeofence = (stop: LoadStop) => {
    const distance = getDistanceToStop(stop);
    if (!distance) return false;
    return distance * 1609.34 <= stop.geofenceRadius; // Convert miles to meters
  };

  if (appsLoading || loadsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md mx-auto bg-gray-50 min-h-screen">
      {/* Mobile App Header */}
      <div className="bg-primary text-white p-4 rounded-b-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold">FreightOps Driver</h1>
              <p className="text-primary-100 text-sm">Status: {isDriving ? "On Duty" : "Off Duty"}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-xs">
              <Signal className="h-4 w-4" />
              <Wifi className="h-4 w-4" />
              <Battery className="h-4 w-4" />
            </div>
            <Button
              size="sm"
              variant={isDriving ? "destructive" : "secondary"}
              onClick={() => setIsDriving(!isDriving)}
            >
              {isDriving ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="px-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Home</TabsTrigger>
          <TabsTrigger value="loads">Loads</TabsTrigger>
          <TabsTrigger value="pay">Pay</TabsTrigger>
          <TabsTrigger value="documents">Docs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{currentLoads.length}</div>
                <div className="text-sm text-muted-foreground">Active Loads</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${driverPay?.currentPeriodEarnings?.toLocaleString() || "0"}
                </div>
                <div className="text-sm text-muted-foreground">This Period</div>
              </CardContent>
            </Card>
          </div>

          {/* GPS Status */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MapPin className={`h-5 w-5 ${currentLocation ? 'text-green-500' : 'text-red-500'}`} />
                  <div>
                    <p className="font-medium">GPS Tracking</p>
                    <p className="text-sm text-muted-foreground">
                      {currentLocation ? "Location active" : "Location unavailable"}
                    </p>
                  </div>
                </div>
                <Switch checked={gpsEnabled} onCheckedChange={setGpsEnabled} />
              </div>
            </CardContent>
          </Card>

          {/* Current Load Quick View */}
          {currentLoads.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Load</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">#{currentLoads[0].loadNumber}</span>
                  <Badge className={statusColors[currentLoads[0].status as keyof typeof statusColors]}>
                    {currentLoads[0].status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Route:</span>
                    <span>{currentLoads[0].pickupCity}, {currentLoads[0].pickupState} → {currentLoads[0].deliveryCity}, {currentLoads[0].deliveryState}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pay:</span>
                    <span className="font-medium text-green-600">${currentLoads[0].pay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Miles:</span>
                    <span>{currentLoads[0].miles}</span>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => setSelectedLoad(currentLoads[0])}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Recent Notifications */}
          {notifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.slice(0, 3).map((notification: any) => (
                  <div key={notification.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`mt-1 h-2 w-2 rounded-full ${notification.priority === 'high' ? 'bg-red-500' : 'bg-blue-500'}`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.sentAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="loads" className="space-y-4 mt-6">
          {currentLoads.map((load: DriverLoad) => (
            <Card key={load.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-primary" />
                    <span className="font-semibold">#{load.loadNumber}</span>
                  </div>
                  <Badge className={statusColors[load.status as keyof typeof statusColors]}>
                    {load.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Route className="h-4 w-4 text-muted-foreground" />
                    <span>{load.pickupCity}, {load.pickupState} → {load.deliveryCity}, {load.deliveryState}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commodity:</span>
                    <span>{load.commodity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weight:</span>
                    <span>{load.weight?.toLocaleString()} lbs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pay:</span>
                    <span className="font-semibold text-green-600">${load.pay}</span>
                  </div>
                </div>

                {/* Next Stop */}
                {load.stops && load.stops.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Next Stop</p>
                        <p className="text-xs text-muted-foreground">{load.stops[0].companyName}</p>
                        <p className="text-xs">{load.stops[0].city}, {load.stops[0].state}</p>
                      </div>
                      {currentLocation && (
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {getDistanceToStop(load.stops[0])?.toFixed(1)} mi
                          </p>
                          {isInGeofence(load.stops[0]) && (
                            <Badge variant="secondary" className="text-xs">
                              <Target className="h-3 w-3 mr-1" />
                              In Range
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedLoad(load)}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          // Open navigation app
                          const url = `https://maps.google.com/maps?daddr=${load.stops[0].latitude},${load.stops[0].longitude}`;
                          window.open(url, '_blank');
                        }}
                      >
                        <Navigation className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex space-x-2 mt-3">
                  {load.status === 'assigned' && (
                    <Button
                      size="sm"
                      onClick={() => updateLoadStatusMutation.mutate({
                        loadId: load.id,
                        status: 'in_transit'
                      })}
                      disabled={updateLoadStatusMutation.isPending}
                    >
                      Start Trip
                    </Button>
                  )}
                  {load.status === 'at_pickup' && (
                    <Button
                      size="sm"
                      onClick={() => updateLoadStatusMutation.mutate({
                        loadId: load.id,
                        status: 'loaded'
                      })}
                      disabled={updateLoadStatusMutation.isPending}
                    >
                      Mark Loaded
                    </Button>
                  )}
                  {load.status === 'at_delivery' && (
                    <Button
                      size="sm"
                      onClick={() => updateLoadStatusMutation.mutate({
                        loadId: load.id,
                        status: 'delivered'
                      })}
                      disabled={updateLoadStatusMutation.isPending}
                    >
                      Mark Delivered
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {currentLoads.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">No Active Loads</h3>
                <p className="text-muted-foreground">Check back for new load assignments</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pay" className="space-y-4 mt-6">
          {/* Pay Period Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Pay Period</CardTitle>
              <CardDescription>
                {driverPay?.payPeriodStart && new Date(driverPay.payPeriodStart).toLocaleDateString()} - {driverPay?.payPeriodEnd && new Date(driverPay.payPeriodEnd).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  ${driverPay?.currentPeriodEarnings?.toLocaleString() || "0"}
                </div>
                <div className="text-sm text-muted-foreground">Total Earnings</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xl font-semibold">{driverPay?.completedLoads || 0}</div>
                  <div className="text-xs text-muted-foreground">Loads Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold">{driverPay?.totalMiles?.toLocaleString() || 0}</div>
                  <div className="text-xs text-muted-foreground">Miles Driven</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Mileage Pay</span>
                  <span>${((driverPay?.totalMiles || 0) * (driverPay?.averagePayPerMile || 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Bonuses</span>
                  <span>${driverPay?.bonuses?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Projected Pay</span>
                    <span className="text-green-600">${driverPay?.projectedPay?.toLocaleString() || "0"}</span>
                  </div>
                </div>
              </div>

              <Progress 
                value={((driverPay?.currentPeriodEarnings || 0) / (driverPay?.projectedPay || 1)) * 100} 
                className="w-full"
              />
              <p className="text-center text-xs text-muted-foreground">
                {Math.round(((driverPay?.currentPeriodEarnings || 0) / (driverPay?.projectedPay || 1)) * 100)}% of projected pay
              </p>
            </CardContent>
          </Card>

          {/* Pay Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pay Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Average per mile</span>
                <span className="text-sm font-medium">${driverPay?.averagePayPerMile?.toFixed(3) || "0.000"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Safety bonus</span>
                <span className="text-sm font-medium">${driverPayData?.standardRate || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">On-time bonus</span>
                <span className="text-sm font-medium">${driverPayData?.bonusRate || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Fuel efficiency bonus</span>
                <span className="text-sm font-medium">${driverPayData?.mileageRate || '0.00'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">On-time delivery rate</span>
                <div className="flex items-center space-x-2">
                  <Progress value={95} className="w-20" />
                  <span className="text-sm font-medium">95%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Safety score</span>
                <div className="flex items-center space-x-2">
                  <Progress value={98} className="w-20" />
                  <span className="text-sm font-medium">98%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Fuel efficiency</span>
                <div className="flex items-center space-x-2">
                  <Progress value={87} className="w-20" />
                  <span className="text-sm font-medium">8.2 MPG</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4 mt-6">
          {currentLoads.map((load: DriverLoad) => (
            <Card key={load.id}>
              <CardHeader>
                <CardTitle className="text-lg">Load #{load.loadNumber}</CardTitle>
                <CardDescription>{load.pickupCity} → {load.deliveryCity}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {load.documents?.map((doc: LoadDocument) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{doc.documentType.replace('_', ' ')}</p>
                        {doc.isSubmitted && (
                          <p className="text-xs text-green-600">✓ Uploaded {doc.uploadedAt && new Date(doc.uploadedAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {doc.isRequired && !doc.isSubmitted && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                      {doc.isSubmitted ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*,.pdf';
                              input.onchange = (e) => handleFileUpload(load.id, doc.documentType, e as any);
                              input.click();
                            }}
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.capture = 'environment';
                              input.onchange = (e) => handleFileUpload(load.id, doc.documentType, e as any);
                              input.click();
                            }}
                          >
                            <Camera className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {currentLoads.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">No Documents</h3>
                <p className="text-muted-foreground">Documents will appear when you have active loads</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Load Details Modal */}
      {selectedLoad && (
        <Dialog open={!!selectedLoad} onOpenChange={() => setSelectedLoad(null)}>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Load #{selectedLoad.loadNumber}</DialogTitle>
              <DialogDescription>
                {selectedLoad.pickupCity}, {selectedLoad.pickupState} → {selectedLoad.deliveryCity}, {selectedLoad.deliveryState}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Load Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Commodity:</span>
                  <p className="font-medium">{selectedLoad.commodity}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Weight:</span>
                  <p className="font-medium">{selectedLoad.weight?.toLocaleString()} lbs</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Distance:</span>
                  <p className="font-medium">{selectedLoad.miles} miles</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Pay:</span>
                  <p className="font-medium text-green-600">${selectedLoad.pay}</p>
                </div>
              </div>

              {/* Stops */}
              <div>
                <h3 className="font-semibold mb-2">Stops</h3>
                <div className="space-y-2">
                  {selectedLoad.stops?.map((stop: LoadStop, index: number) => (
                    <div key={stop.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            {stop.stopNumber}. {stop.companyName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {stop.address}, {stop.city}, {stop.state}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(stop.scheduledArrival).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={stop.stopType === 'pickup' ? 'default' : 'secondary'}>
                            {stop.stopType}
                          </Badge>
                          {currentLocation && (
                            <p className="text-xs mt-1">
                              {getDistanceToStop(stop)?.toFixed(1)} mi
                            </p>
                          )}
                        </div>
                      </div>
                      {isInGeofence(stop) && (
                        <div className="mt-2 flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => updateLoadStatusMutation.mutate({
                              loadId: selectedLoad.id,
                              status: stop.stopType === 'pickup' ? 'at_pickup' : 'at_delivery',
                              stopId: stop.id
                            })}
                            disabled={updateLoadStatusMutation.isPending}
                          >
                            Arrive at {stop.stopType}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Trailer and Reference Numbers */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Trailer:</span>
                  <p className="font-medium">{selectedLoad.trailer || "TBD"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">PRO #:</span>
                  <p className="font-medium">{selectedLoad.stops?.[0]?.proNumber || "TBD"}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}