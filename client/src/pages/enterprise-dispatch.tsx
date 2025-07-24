import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Truck, 
  MapPin, 
  Clock, 
  DollarSign, 
  User, 
  Plus,
  Search,
  Filter,
  Calendar,
  Package,
  Route,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Phone,
  Mail,
  Navigation,
  FileText,
  Zap,
  TrendingUp,
  BarChart3,
  Settings,
  Upload,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Load {
  id: string;
  loadNumber: string;
  status: 'available' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  priority: 'standard' | 'urgent' | 'critical';
  
  // Customer Information
  customerName: string;
  customerContact: string;
  customerPhone: string;
  customerEmail: string;
  
  // Pickup Information
  pickupLocation: string;
  pickupAddress: string;
  pickupCity: string;
  pickupState: string;
  pickupZip: string;
  pickupDate: string;
  pickupTime: string;
  pickupWindow: string;
  pickupContact: string;
  pickupPhone: string;
  pickupInstructions?: string;
  
  // Delivery Information
  deliveryLocation: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZip: string;
  deliveryDate: string;
  deliveryTime: string;
  deliveryWindow: string;
  deliveryContact: string;
  deliveryPhone: string;
  deliveryInstructions?: string;
  
  // Load Details
  commodity: string;
  commodityType: 'general_freight' | 'hazmat' | 'refrigerated' | 'oversized' | 'livestock' | 'automotive';
  weight: number;
  pieces: number;
  length: number;
  width: number;
  height: number;
  specialRequirements?: string;
  
  // Financial
  rate: number;
  rateType: 'flat' | 'per_mile' | 'percentage';
  fuelSurcharge: number;
  accessorialCharges: number;
  totalRate: number;
  
  // Operational
  distance: number;
  estimatedMiles: number;
  estimatedDuration: number;
  assignedDriver?: string;
  assignedTruck?: string;
  dispatchNotes?: string;
  
  // Tracking
  currentLocation?: string;
  lastUpdate?: string;
  estimatedArrival?: string;
  proofOfDelivery?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  dispatchedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
}

interface Driver {
  id: string;
  driverNumber: string;
  firstName: string;
  lastName: string;
  name: string;
  status: 'available' | 'on_trip' | 'off_duty' | 'in_maintenance';
  
  // Contact Information
  phone: string;
  email: string;
  emergencyContact: string;
  emergencyPhone: string;
  
  // License and Certification
  licenseNumber: string;
  licenseClass: string;
  licenseExpiration: string;
  dotMedicalExpiration: string;
  hazmatEndorsement: boolean;
  hazmatExpiration?: string;
  
  // Current Assignment
  currentLocation?: string;
  currentTruck?: string;
  currentLoad?: string;
  
  // Performance Metrics
  rating: number;
  totalMiles: number;
  totalLoads: number;
  onTimePercentage: number;
  safetyScore: number;
  
  // Operational
  hireDate: string;
  lastActivity: string;
  homeTerminal: string;
  preferredLanes: string[];
  
  // Status tracking
  isActive: boolean;
  lastLogin?: string;
  currentLogStatus: 'on_duty' | 'driving' | 'sleeper' | 'off_duty';
  hoursRemaining: number;
}

interface Truck {
  id: string;
  truckNumber: string;
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_service';
  
  // Vehicle Information
  make: string;
  model: string;
  year: number;
  vinNumber: string;
  plateNumber: string;
  
  // Specifications
  truckType: 'tractor' | 'straight_truck' | 'van';
  maxWeight: number;
  maxLength: number;
  maxWidth: number;
  maxHeight: number;
  fuelType: string;
  
  // Current Status
  currentLocation?: string;
  assignedDriver?: string;
  currentMileage: number;
  fuelLevel?: number;
  
  // Maintenance
  nextMaintenanceMileage: number;
  nextMaintenanceDate: string;
  lastInspectionDate: string;
  registrationExpiration: string;
  insuranceExpiration: string;
  
  // Performance
  mpg: number;
  totalMiles: number;
  engineHours: number;
  
  // Operational
  homeTerminal: string;
  isActive: boolean;
  lastUpdate: string;
}

export default function EnterpriseDispatch() {
  const [loads, setLoads] = useState<Load[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [showNewLoadForm, setShowNewLoadForm] = useState(false);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('board');
  
  // Filters and search
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('pickupDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data with React Query
  const { data: loadsData, isLoading: loadsLoading } = useQuery({
    queryKey: ['/api/loads'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: driversData, isLoading: driversLoading } = useQuery({
    queryKey: ['/api/drivers'],
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: trucksData, isLoading: trucksLoading } = useQuery({
    queryKey: ['/api/trucks'],
    refetchInterval: 60000,
  });

  // Update local state when data changes
  useEffect(() => {
    if (loadsData) setLoads(loadsData);
  }, [loadsData]);

  useEffect(() => {
    if (driversData) setDrivers(driversData);
  }, [driversData]);

  useEffect(() => {
    if (trucksData) setTrucks(trucksData);
  }, [trucksData]);

  // Mutations
  const createLoadMutation = useMutation({
    mutationFn: (loadData: Partial<Load>) => apiRequest('POST', '/api/loads', loadData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/loads'] });
      setShowNewLoadForm(false);
      toast({ title: "Load Created", description: "New load added successfully" });
    },
  });

  const assignLoadMutation = useMutation({
    mutationFn: ({ loadId, driverId, truckId }: { loadId: string; driverId: string; truckId: string }) =>
      apiRequest('POST', '/api/loads/assign', { loadId, driverId, truckId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/loads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/drivers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trucks'] });
      setShowAssignmentDialog(false);
      setSelectedLoad(null);
      toast({ title: "Load Assigned", description: "Load successfully assigned to driver" });
    },
  });

  // Filtered and sorted loads
  const filteredAndSortedLoads = useMemo(() => {
    let filtered = loads.filter(load => {
      const matchesStatus = filterStatus === 'all' || load.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || load.priority === filterPriority;
      const matchesSearch = searchTerm === '' || 
        load.loadNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        load.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        load.deliveryLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        load.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        load.commodity.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesPriority && matchesSearch;
    });

    // Sort loads
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Load];
      let bValue: any = b[sortBy as keyof Load];
      
      if (sortBy === 'pickupDate' || sortBy === 'deliveryDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [loads, filterStatus, filterPriority, searchTerm, sortBy, sortOrder]);

  // Available resources
  const availableDrivers = drivers.filter(driver => driver.status === 'available');
  const availableTrucks = trucks.filter(truck => truck.status === 'available');

  // Statistics
  const stats = useMemo(() => ({
    totalLoads: loads.length,
    availableLoads: loads.filter(l => l.status === 'available').length,
    assignedLoads: loads.filter(l => l.status === 'assigned').length,
    inTransitLoads: loads.filter(l => l.status === 'in_transit').length,
    deliveredLoads: loads.filter(l => l.status === 'delivered').length,
    totalRevenue: loads.filter(l => l.status === 'delivered').reduce((sum, l) => sum + l.totalRate, 0),
    avgRate: loads.length > 0 ? loads.reduce((sum, l) => sum + l.totalRate, 0) / loads.length : 0,
    criticalLoads: loads.filter(l => l.priority === 'critical').length,
    urgentLoads: loads.filter(l => l.priority === 'urgent').length,
    availableDrivers: availableDrivers.length,
    availableTrucks: availableTrucks.length,
  }), [loads, availableDrivers, availableTrucks]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'picked_up': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'in_transit': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'delivered': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'urgent': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loadsLoading || driversLoading || trucksLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dispatch Center</h1>
          <p className="text-muted-foreground">Comprehensive load and resource management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowNewLoadForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Load
          </Button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Loads</p>
                <p className="text-2xl font-bold">{stats.availableLoads}</p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Transit</p>
                <p className="text-2xl font-bold">{stats.inTransitLoads}</p>
              </div>
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Drivers</p>
                <p className="text-2xl font-bold">{stats.availableDrivers}</p>
              </div>
              <User className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Trucks</p>
                <p className="text-2xl font-bold">{stats.availableTrucks}</p>
              </div>
              <Truck className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue Today</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Loads</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalLoads}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="board">Load Board</TabsTrigger>
          <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="planning">Route Planning</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="space-y-4">
          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search loads, customers, locations..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="picked_up">Picked Up</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pickupDate">Pickup Date</SelectItem>
                  <SelectItem value="deliveryDate">Delivery Date</SelectItem>
                  <SelectItem value="rate">Rate</SelectItem>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>

          {/* Load Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAndSortedLoads.map((load) => (
              <Card key={load.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{load.loadNumber}</CardTitle>
                      {load.priority !== 'standard' && (
                        <Badge className={getPriorityColor(load.priority)}>
                          {load.priority}
                        </Badge>
                      )}
                    </div>
                    <Badge className={getStatusColor(load.status)}>
                      {load.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <CardDescription className="font-medium">{load.customerName}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">Pickup</p>
                        <p className="text-sm text-muted-foreground">{load.pickupLocation}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(load.pickupDate)} at {load.pickupTime}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">Delivery</p>
                        <p className="text-sm text-muted-foreground">{load.deliveryLocation}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(load.deliveryDate)} at {load.deliveryTime}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Commodity</p>
                      <p className="font-medium">{load.commodity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Weight</p>
                      <p className="font-medium">{load.weight.toLocaleString()} lbs</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Distance</p>
                      <p className="font-medium">{load.distance} miles</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rate</p>
                      <p className="font-bold text-green-600">{formatCurrency(load.totalRate)}</p>
                    </div>
                  </div>

                  {load.assignedDriver && (
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-600 font-medium">
                        Assigned to: {load.assignedDriver}
                      </p>
                      {load.assignedTruck && (
                        <p className="text-xs text-blue-600">
                          Truck: {load.assignedTruck}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedLoad(load)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    
                    {load.status === 'available' && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedLoad(load);
                          setShowAssignmentDialog(true);
                        }}
                      >
                        Assign
                      </Button>
                    )}
                    
                    {load.status === 'in_transit' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                      >
                        <Navigation className="h-4 w-4 mr-1" />
                        Track
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAndSortedLoads.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900">No loads found</p>
              <p className="text-gray-500">Try adjusting your filters or search criteria</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Tracking</CardTitle>
              <CardDescription>Real-time location tracking for active loads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Interactive map will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>On-Time Delivery Rate</span>
                    <span className="font-bold">96.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Revenue per Load</span>
                    <span className="font-bold">{formatCurrency(stats.avgRate)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Load Utilization</span>
                    <span className="font-bold">87.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Revenue chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="planning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Route Optimization</CardTitle>
              <CardDescription>Optimize routes for fuel efficiency and delivery times</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Route planning interface will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assignment Dialog */}
      {showAssignmentDialog && selectedLoad && (
        <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Assign Load {selectedLoad.loadNumber}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Select Driver</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose available driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDrivers.map(driver => (
                        <SelectItem key={driver.id} value={driver.id}>
                          <div className="flex items-center gap-2">
                            <span>{driver.name}</span>
                            <Badge variant="outline">Rating: {driver.rating}/5</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Select Truck</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose available truck" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTrucks.map(truck => (
                        <SelectItem key={truck.id} value={truck.id}>
                          <div className="flex items-center gap-2">
                            <span>{truck.truckNumber}</span>
                            <span>({truck.make} {truck.model})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Dispatch Notes</Label>
                <Textarea 
                  placeholder="Enter any special instructions or notes for the driver..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowAssignmentDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    // Handle assignment logic here
                    setShowAssignmentDialog(false);
                  }}
                >
                  Assign Load
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}