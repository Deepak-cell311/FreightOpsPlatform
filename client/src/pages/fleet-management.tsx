import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from '@/lib/queryClient';
import { useState } from "react";
import { 
  Truck,
  MapPin,
  Clock,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Phone,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Calendar,
  Fuel,
  Wrench,
  Shield,
  FileText,
  TrendingUp,
  Activity,
  Settings,
  Star
} from "lucide-react";
import { Link } from "wouter";

// Form schemas
const addTruckSchema = z.object({
  unit: z.string().min(1, "Unit number is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(1900, "Valid year is required"),
  vin: z.string().min(17, "Valid VIN is required"),
  licensePlate: z.string().min(1, "License plate is required"),
});

const addDriverSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  cdlNumber: z.string().min(1, "CDL number is required"),
});

const assignDriverSchema = z.object({
  driverId: z.string().min(1, "Driver selection is required"),
});

export default function FleetManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTruck, setSelectedTruck] = useState<any>(null);
  const [isAddTruckOpen, setIsAddTruckOpen] = useState(false);
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [isAssignDriverOpen, setIsAssignDriverOpen] = useState(false);

  // Fetch real fleet data from API
  const { data: trucksData, isLoading: trucksLoading } = useQuery({
    queryKey: ["/api/fleet/trucks"],
    retry: false,
  });

  const { data: driversData, isLoading: driversLoading } = useQuery({
    queryKey: ["/api/fleet/drivers"], 
    retry: false,
  });

  const trucks = trucksData || [];
  const drivers = driversData || [];

  // Forms
  const addTruckForm = useForm<z.infer<typeof addTruckSchema>>({
    resolver: zodResolver(addTruckSchema),
    defaultValues: {
      unit: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      vin: "",
      licensePlate: "",
    },
  });

  const addDriverForm = useForm<z.infer<typeof addDriverSchema>>({
    resolver: zodResolver(addDriverSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      cdlNumber: "",
    },
  });

  const assignDriverForm = useForm<z.infer<typeof assignDriverSchema>>({
    resolver: zodResolver(assignDriverSchema),
    defaultValues: {
      driverId: "",
    },
  });

  // Mutations
  const addTruckMutation = useMutation({
    mutationFn: async (data: z.infer<typeof addTruckSchema>) => {
      return apiRequest('POST', '/api/fleet/trucks', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fleet/trucks"] });
      setIsAddTruckOpen(false);
      addTruckForm.reset();
      toast({
        title: "Success",
        description: "Truck added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add truck",
        variant: "destructive",
      });
    },
  });

  const addDriverMutation = useMutation({
    mutationFn: async (data: z.infer<typeof addDriverSchema>) => {
      return apiRequest('POST', '/api/fleet/drivers', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fleet/drivers"] });
      setIsAddDriverOpen(false);
      addDriverForm.reset();
      toast({
        title: "Success",
        description: "Driver added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add driver",
        variant: "destructive",
      });
    },
  });

  const assignDriverMutation = useMutation({
    mutationFn: async (data: z.infer<typeof assignDriverSchema>) => {
      return apiRequest('PUT', `/api/fleet/trucks/${selectedTruck.id}/assign-driver`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fleet/trucks"] });
      setIsAssignDriverOpen(false);
      assignDriverForm.reset();
      setSelectedTruck(null);
      toast({
        title: "Success",
        description: "Driver assigned successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign driver",
        variant: "destructive",
      });
    },
  });

  // Handle form submissions
  const onAddTruck = (data: z.infer<typeof addTruckSchema>) => {
    addTruckMutation.mutate(data);
  };

  const onAddDriver = (data: z.infer<typeof addDriverSchema>) => {
    addDriverMutation.mutate(data);
  };

  const onAssignDriver = (data: z.infer<typeof assignDriverSchema>) => {
    assignDriverMutation.mutate(data);
  };

  const handleAssignDriver = (truck: any) => {
    setSelectedTruck(truck);
    setIsAssignDriverOpen(true);
  };

  const getStatusBadge = (status: string, type: 'truck' | 'driver') => {
    if (type === 'truck') {
      switch (status) {
        case "available":
          return <Badge className="bg-green-100 text-green-800">Available</Badge>;
        case "in_transit":
          return <Badge className="bg-blue-100 text-blue-800">In Transit</Badge>;
        case "maintenance":
          return <Badge className="bg-orange-100 text-orange-800">Maintenance</Badge>;
        case "out_of_service":
          return <Badge className="bg-red-100 text-red-800">Out of Service</Badge>;
        default:
          return <Badge variant="secondary">{status}</Badge>;
      }
    } else {
      switch (status) {
        case "active":
          return <Badge className="bg-green-100 text-green-800">Active</Badge>;
        case "driving":
          return <Badge className="bg-blue-100 text-blue-800">Driving</Badge>;
        case "off_duty":
          return <Badge className="bg-gray-100 text-gray-800">Off Duty</Badge>;
        case "violation":
          return <Badge className="bg-red-100 text-red-800">Violation</Badge>;
        default:
          return <Badge variant="secondary">{status}</Badge>;
      }
    }
  };

  const availableTrucks = trucks.filter(truck => truck.status === "available").length;
  const activeTrucks = trucks.filter(truck => truck.status === "in_transit").length;
  const activeDrivers = drivers.filter(driver => driver.status === "driving").length;
  const avgFuelLevel = Math.round(trucks.reduce((sum, truck) => sum + truck.fuelLevel, 0) / trucks.length);

  return (
    <DashboardLayout title="Fleet Management">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fleet Management</h1>
            <p className="text-gray-500 mt-1">
              Monitor trucks, drivers, and fleet performance
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </Button>
            <Dialog open={isAddTruckOpen} onOpenChange={setIsAddTruckOpen}>
              <DialogTrigger asChild>
                <Button className="freight-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Truck
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Truck</DialogTitle>
                </DialogHeader>
                <Form {...addTruckForm}>
                  <form onSubmit={addTruckForm.handleSubmit(onAddTruck)} className="space-y-4">
                    <FormField
                      control={addTruckForm.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Number</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 101" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addTruckForm.control}
                        name="make"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Make</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Freightliner" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addTruckForm.control}
                        name="model"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Model</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Cascadia" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addTruckForm.control}
                        name="year"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="2024" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addTruckForm.control}
                        name="licensePlate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Plate</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., ABC123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={addTruckForm.control}
                      name="vin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>VIN</FormLabel>
                          <FormControl>
                            <Input placeholder="17-character VIN" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddTruckOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={addTruckMutation.isPending}>
                        {addTruckMutation.isPending ? "Adding..." : "Add Truck"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <Dialog open={isAddDriverOpen} onOpenChange={setIsAddDriverOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Add Driver
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Driver</DialogTitle>
                </DialogHeader>
                <Form {...addDriverForm}>
                  <form onSubmit={addDriverForm.handleSubmit(onAddDriver)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addDriverForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addDriverForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={addDriverForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john.doe@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addDriverForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addDriverForm.control}
                        name="cdlNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CDL Number</FormLabel>
                            <FormControl>
                              <Input placeholder="CDL123456" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddDriverOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={addDriverMutation.isPending}>
                        {addDriverMutation.isPending ? "Adding..." : "Add Driver"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="freight-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Truck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Available Trucks</p>
                  <p className="text-2xl font-bold">{availableTrucks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="freight-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Navigation className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Trucks</p>
                  <p className="text-2xl font-bold">{activeTrucks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="freight-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Users className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Drivers</p>
                  <p className="text-2xl font-bold">{activeDrivers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="freight-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Fuel className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Fuel Level</p>
                  <p className="text-2xl font-bold">{avgFuelLevel}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fleet Tabs */}
        <Tabs defaultValue="trucks" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trucks">Trucks</TabsTrigger>
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          {/* Trucks Tab */}
          <TabsContent value="trucks" className="space-y-4">
            <Card className="freight-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search trucks by unit, make, model..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Columns
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="freight-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Fleet Vehicles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trucks.map((truck) => (
                    <div key={truck.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                        {/* Truck Info */}
                        <div className="lg:col-span-3">
                          <div className="font-medium text-blue-600">Unit {truck.unit}</div>
                          <div className="text-sm text-gray-600">{truck.year} {truck.make} {truck.model}</div>
                          <div className="mt-1">{getStatusBadge(truck.status, 'truck')}</div>
                        </div>

                        {/* Driver Assignment */}
                        <div className="lg:col-span-2">
                          {truck.driver ? (
                            <div>
                              <div className="flex items-center space-x-1">
                                <Users className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium">{truck.driver}</span>
                              </div>
                              <div className="text-sm text-gray-500">Assigned</div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              <div>No driver assigned</div>
                              <Button size="sm" variant="outline" className="mt-1" onClick={() => handleAssignDriver(truck)}>
                                Assign Driver
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Location & Load */}
                        <div className="lg:col-span-2">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{truck.location}</span>
                          </div>
                          {truck.currentLoad && (
                            <div className="text-sm text-blue-600 mt-1">
                              Load: {truck.currentLoad}
                            </div>
                          )}
                        </div>

                        {/* Vehicle Stats */}
                        <div className="lg:col-span-3">
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <div className="text-gray-500">Mileage</div>
                              <div className="font-medium">{truck.mileage.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Fuel</div>
                              <div className="font-medium">{truck.fuelLevel}%</div>
                            </div>
                            <div>
                              <div className="text-gray-500">MPG</div>
                              <div className="font-medium">{truck.mpg}</div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="lg:col-span-2">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Wrench className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Maintenance Alert */}
                      {truck.status === "maintenance" && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center text-orange-600">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            <span className="text-sm">Scheduled maintenance in progress</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Drivers Tab */}
          <TabsContent value="drivers" className="space-y-4">
            <Card className="freight-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Driver Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {drivers.map((driver) => (
                    <div key={driver.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                        {/* Driver Info */}
                        <div className="lg:col-span-3">
                          <div className="font-medium text-blue-600">{driver.name}</div>
                          <div className="text-sm text-gray-600">CDL: {driver.cdlNumber}</div>
                          <div className="mt-1 flex items-center space-x-2">
                            {getStatusBadge(driver.status, 'driver')}
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-sm">{driver.rating}</span>
                            </div>
                          </div>
                        </div>

                        {/* Truck Assignment */}
                        <div className="lg:col-span-2">
                          {driver.truck ? (
                            <div>
                              <div className="flex items-center space-x-1">
                                <Truck className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium">{driver.truck}</span>
                              </div>
                              <div className="text-sm text-gray-500">Assigned</div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              <div>No truck assigned</div>
                              <Button size="sm" variant="outline" className="mt-1">
                                Assign Truck
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Location & Contact */}
                        <div className="lg:col-span-2">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{driver.location}</span>
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{driver.phone}</span>
                          </div>
                        </div>

                        {/* Performance Stats */}
                        <div className="lg:col-span-3">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <div className="text-gray-500">Hours/Week</div>
                              <div className="font-medium">{driver.hoursThisWeek}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Safety Score</div>
                              <div className="font-medium">{driver.safetyScore}%</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Total Miles</div>
                              <div className="font-medium">{driver.totalMiles.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">On-Time</div>
                              <div className="font-medium">{driver.onTimeDelivery}%</div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="lg:col-span-2">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Phone className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Compliance Alerts */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex space-x-4">
                            <span>CDL Exp: {driver.cdlExpiry}</span>
                            <span>Medical Exp: {driver.medicalExp}</span>
                          </div>
                          {driver.status === "violation" && (
                            <div className="flex items-center text-red-600">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              <span>Hours violation detected</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="freight-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wrench className="h-5 w-5 mr-2" />
                    Upcoming Maintenance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">Unit 001 - PM Service</div>
                        <div className="text-sm text-gray-600">Due: June 15, 2024</div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Due Soon</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">Unit 002 - DOT Inspection</div>
                        <div className="text-sm text-gray-600">Due: July 10, 2024</div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Scheduled</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="freight-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Maintenance History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">Unit 003 - Engine Repair</div>
                        <div className="text-sm text-gray-600">Completed: June 8, 2024</div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">Unit 001 - Tire Replacement</div>
                        <div className="text-sm text-gray-600">Completed: May 15, 2024</div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="freight-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <Shield className="h-5 w-5 mr-2" />
                    DOT Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">95%</div>
                    <div className="text-sm text-gray-600">Compliance Score</div>
                    <div className="mt-2">
                      <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="freight-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-600">
                    <FileText className="h-5 w-5 mr-2" />
                    Driver Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-gray-600">HOS Violations</div>
                    <div className="mt-2">
                      <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="freight-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-600">
                    <Clock className="h-5 w-5 mr-2" />
                    Expiring Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">2</div>
                    <div className="text-sm text-gray-600">Due in 30 days</div>
                    <div className="mt-2">
                      <Badge className="bg-yellow-100 text-yellow-800">Review</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Assign Driver Dialog */}
        <Dialog open={isAssignDriverOpen} onOpenChange={setIsAssignDriverOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Driver to {selectedTruck?.unit ? `Unit ${selectedTruck.unit}` : 'Truck'}</DialogTitle>
            </DialogHeader>
            <Form {...assignDriverForm}>
              <form onSubmit={assignDriverForm.handleSubmit(onAssignDriver)} className="space-y-4">
                <FormField
                  control={assignDriverForm.control}
                  name="driverId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Driver</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a driver" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {drivers.filter(driver => driver.status === 'active').map((driver) => (
                            <SelectItem key={driver.id} value={driver.id}>
                              {driver.firstName} {driver.lastName} - {driver.cdlNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAssignDriverOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={assignDriverMutation.isPending}>
                    {assignDriverMutation.isPending ? "Assigning..." : "Assign Driver"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}