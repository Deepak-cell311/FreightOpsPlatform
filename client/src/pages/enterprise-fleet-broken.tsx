import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Truck, 
  User, 
  Wrench, 
  FileText
} from "lucide-react";

interface Driver {
  id: string;
  employeeId: string;
  name: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'on_duty' | 'off_duty' | 'driving' | 'violation';
  cdlInfo: {
    number: string;
    class: 'A' | 'B' | 'C';
    endorsements: string[];
    expiration: string;
  };
  medicalCert: {
    expiration: string;
    status: 'valid' | 'expired' | 'expiring_soon';
  };
  hoursOfService: {
    driving: number;
    onDuty: number;
    offDuty: number;
    sleeper: number;
    remaining: number;
    violations: string[];
    lastStatusChange: string;
  };
  location: {
    lat: number;
    lng: number;
    address: string;
    timestamp: string;
  };
  assignedVehicle?: {
    id: string;
    unitNumber: string;
  };
  performance: {
    onTimePercentage: number;
    safetyScore: number;
    fuelEfficiency: number;
    customerRating: number;
    milesThisMonth: number;
  };
  hireDate: string;
  lastTraining: string;
  nextTrainingDue: string;
}

interface Vehicle {
  id: string;
  unitNumber: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  status: 'active' | 'maintenance' | 'out_of_service' | 'available' | 'assigned';
  mileage: number;
  fuelLevel: number;
  location: {
    lat: number;
    lng: number;
    address: string;
    timestamp: string;
  };
  assignedDriver?: {
    id: string;
    name: string;
  };
  maintenance: {
    lastService: string;
    nextService: string;
    serviceInterval: number;
    milesUntilService: number;
    inspectionDue: string;
    registrationExpiry: string;
  };
  specifications: {
    engineType: string;
    fuelType: 'diesel' | 'gas' | 'electric' | 'hybrid';
    gvwr: number;
    equipmentType: string[];
  };
  performance: {
    mpg: number;
    utilizationRate: number;
    maintenanceCost: number;
    revenueGenerated: number;
  };
  violations: {
    type: string;
    date: string;
    description: string;
    resolved: boolean;
  }[];
  insurance: {
    provider: string;
    policyNumber: string;
    expiration: string;
  };
}

interface Trailer {
  id: string;
  unitNumber: string;
  type: 'dry_van' | 'refrigerated' | 'flatbed' | 'step_deck' | 'lowboy' | 'tanker';
  length: number;
  status: 'active' | 'maintenance' | 'out_of_service' | 'available' | 'assigned';
  location: {
    lat: number;
    lng: number;
    address: string;
    timestamp: string;
  };
  assignedVehicle?: {
    id: string;
    unitNumber: string;
  };
  maintenance: {
    lastInspection: string;
    nextInspection: string;
    registrationExpiry: string;
  };
  specifications: {
    capacity: {
      weight: number;
      volume: number;
      pallets: number;
    };
    features: string[];
  };
  reeferUnit?: {
    make: string;
    model: string;
    fuelLevel: number;
    operational: boolean;
    temperatureRange: {
      min: number;
      max: number;
    };
    lastService: string;
  };
}

interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehicleNumber: string;
  type: 'preventive' | 'repair' | 'inspection' | 'recall';
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  description: string;
  scheduledDate: string;
  completedDate?: string;
  mileage: number;
  cost: number;
  vendor: string;
  technician: string;
  partsUsed: {
    name: string;
    quantity: number;
    cost: number;
  }[];
  laborHours: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  notes: string;
}

interface ComplianceItem {
  id: string;
  entityType: 'driver' | 'vehicle' | 'trailer';
  entityId: string;
  entityName: string;
  itemType: 'license' | 'medical_cert' | 'registration' | 'inspection' | 'insurance' | 'permit';
  description: string;
  expirationDate: string;
  status: 'valid' | 'expired' | 'expiring_soon' | 'missing';
  daysUntilExpiration: number;
  lastUpdated: string;
  remindersSent: number;
}

export default function EnterpriseFleet() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Fetch fleet metrics data
  const { data: fleetMetrics } = useQuery({
    queryKey: ["/api/fleet/metrics"],
    retry: false,
  });

  // Fetch real drivers data from API
  const { data: drivers = [], isLoading: driversLoading } = useQuery({
    queryKey: ["/api/drivers"],
    select: (data) => data || []
  });

  // Fetch real driver data from API
  const { data: driversData } = useQuery({
    queryKey: ["/api/drivers"],
    retry: false,
  });

  const drivers: Driver[] = driversData || [];
  
  // Fetch vehicles data from API
  const { data: vehiclesData } = useQuery({
    queryKey: ["/api/vehicles"],
    retry: false,
  });

  const vehicles: Vehicle[] = vehiclesData || [];

  // Fetch trailers data from API
  const { data: trailersData } = useQuery({
    queryKey: ["/api/trailers"],
    retry: false,
  });

  const trailers: Trailer[] = trailersData || [];

  // Fetch maintenance data from API
  const { data: maintenanceData } = useQuery({
    queryKey: ["/api/maintenance"],
    retry: false,
  });

  const maintenanceRecords: MaintenanceRecord[] = maintenanceData || [];

  // Fetch compliance data from API
  const { data: complianceData } = useQuery({
    queryKey: ["/api/compliance"],
    retry: false,
  });

  const complianceItems: ComplianceItem[] = complianceData || [];

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Filtered drivers
  const filteredDrivers = drivers.filter((driver: any) => {
    if (statusFilter !== "all" && statusFilter !== driver.status) return false;
    if (searchTerm && !driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !driver.email?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Filtered vehicles  
  const filteredVehicles = vehicles.filter((vehicle: any) => {
    if (statusFilter !== "all" && statusFilter !== vehicle.status) return false;
    if (searchTerm && !vehicle.unitNumber?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Enterprise Fleet Management</h1>
        <p className="mt-2 text-sm text-gray-700">
          Comprehensive fleet operations, compliance monitoring, and performance analytics
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drivers.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{filteredDrivers.length} active</span>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{filteredVehicles.length} operational</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trailers</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trailers.length}</div>
            <p className="text-xs text-muted-foreground">Fleet equipment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Items</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceItems.length}</div>
            <p className="text-xs text-muted-foreground">Active monitoring</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="drivers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Driver Management</CardTitle>
              <CardDescription>
                Monitor driver status, compliance, and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredDrivers.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No drivers found</p>
                    <p className="text-sm">Add drivers to your fleet to get started</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Driver data will be loaded from the database</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Fleet</CardTitle>
              <CardDescription>
                Track vehicle status, maintenance, and utilization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredVehicles.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No vehicles found</p>
                    <p className="text-sm">Add vehicles to your fleet to get started</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Vehicle data will be loaded from the database</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Schedule</CardTitle>
              <CardDescription>
                Track service intervals and maintenance history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceRecords.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No maintenance records</p>
                    <p className="text-sm">Maintenance data will appear here</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Maintenance data will be loaded from the database</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Monitoring</CardTitle>
              <CardDescription>
                Track licenses, certifications, and regulatory requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceItems.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No compliance items</p>
                    <p className="text-sm">Compliance monitoring data will appear here</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Compliance data will be loaded from the database</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fleet Analytics</CardTitle>
              <CardDescription>
                Performance metrics and operational insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500">Analytics data will be loaded from live fleet metrics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fleet Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Active Drivers</span>
                    <span className="font-semibold">{drivers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Vehicles</span>
                    <span className="font-semibold">{vehicles.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trailers</span>
                    <span className="font-semibold">{trailers.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>All Systems</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Data Sync</span>
                    <Badge variant="default" className="bg-blue-100 text-blue-800">Live</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': case 'valid': return 'bg-green-100 text-green-800 border-green-200';
      case 'driving': case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'off_duty': case 'available': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'maintenance': case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'out_of_service': case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'expiring_soon': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'violation': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      vehicle.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fleet Management</h1>
          <p className="text-gray-600">Comprehensive fleet operations, compliance, and performance management</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Reports
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Compliance Alert Bar */}
      {complianceItems.filter(item => item.status === 'expiring_soon' || item.status === 'expired').length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800">
                  {complianceItems.filter(item => item.status === 'expiring_soon' || item.status === 'expired').length} Compliance Items Need Attention
                </p>
                <p className="text-sm text-orange-600">
                  {complianceItems.find(item => item.status === 'expiring_soon')?.description} expires in {complianceItems.find(item => item.status === 'expiring_soon')?.daysUntilExpiration} days
                </p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">
                View All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Fleet Overview Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">38 active</span> • 4 inactive
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fleet Vehicles</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">38</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">35 operational</span> • 3 maintenance
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fleet Utilization</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87.5%</div>
                <p className="text-xs text-muted-foreground">+2.3% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Safety Score</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">96.8%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+1.2%</span> this quarter
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Driver Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">On Duty</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={65} className="w-24" />
                      <span className="text-sm font-medium">65%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Off Duty</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={25} className="w-24" />
                      <span className="text-sm font-medium">25%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Driving</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={10} className="w-24" />
                      <span className="text-sm font-medium">10%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium text-sm">TRK-003 - Preventive Service</p>
                      <p className="text-xs text-gray-600">In Progress</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Today</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium text-sm">TRK-005 - DOT Inspection</p>
                      <p className="text-xs text-gray-600">Scheduled</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Aug 20</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium text-sm">TRK-007 - Oil Change</p>
                      <p className="text-xs text-gray-600">Overdue</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800">Overdue</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-6">
          {/* Driver Management Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Driver Management
                <div className="flex items-center space-x-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="driving">Driving</SelectItem>
                      <SelectItem value="off_duty">Off Duty</SelectItem>
                      <SelectItem value="violation">Violation</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search drivers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredDrivers.map((driver) => (
                  <Card key={driver.id} className="border border-gray-200 hover:border-blue-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Driver Info */}
                        <div className="col-span-2">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getStatusBadgeColor(driver.status)}>
                              {driver.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            {driver.hoursOfService.violations.length > 0 && (
                              <Badge className="bg-red-100 text-red-800">
                                HOS Violation
                              </Badge>
                            )}
                          </div>
                          <p className="font-semibold text-lg">{driver.name}</p>
                          <p className="text-sm text-gray-600">{driver.employeeId}</p>
                        </div>

                        {/* CDL & Medical */}
                        <div className="col-span-2">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">CDL Class {driver.cdlInfo.class}</p>
                            <p className="text-xs text-gray-600">Exp: {new Date(driver.cdlInfo.expiration).toLocaleDateString()}</p>
                            <div className="flex items-center space-x-1">
                              <Badge className={getStatusBadgeColor(driver.medicalCert.status)} variant="secondary">
                                Medical: {driver.medicalCert.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Hours of Service */}
                        <div className="col-span-2">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">HOS Remaining: {driver.hoursOfService.remaining}h</p>
                            <div className="grid grid-cols-2 gap-1 text-xs">
                              <span>Drive: {driver.hoursOfService.driving}h</span>
                              <span>On Duty: {driver.hoursOfService.onDuty}h</span>
                            </div>
                            <Progress value={(11 - driver.hoursOfService.remaining) / 11 * 100} className="h-1" />
                          </div>
                        </div>

                        {/* Location & Equipment */}
                        <div className="col-span-2">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span className="text-sm">{driver.location.address}</span>
                            </div>
                            {driver.assignedVehicle && (
                              <div className="flex items-center space-x-1">
                                <Truck className="w-3 h-3 text-gray-400" />
                                <span className="text-sm">{driver.assignedVehicle.unitNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Performance */}
                        <div className="col-span-2">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1">
                              <Award className="w-3 h-3 text-green-600" />
                              <span className="text-sm">{driver.performance.onTimePercentage}% On-Time</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Shield className="w-3 h-3 text-blue-600" />
                              <span className="text-sm">{driver.performance.safetyScore}% Safety</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Fuel className="w-3 h-3 text-yellow-600" />
                              <span className="text-sm">{driver.performance.fuelEfficiency} MPG</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="col-span-2">
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedDriver(driver)}>
                              <User className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Phone className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Navigation className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-6">
          {/* Vehicle Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Vehicle Fleet
                <div className="flex items-center space-x-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="out_of_service">Out of Service</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search vehicles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredVehicles.map((vehicle) => (
                  <Card key={vehicle.id} className="border border-gray-200 hover:border-blue-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Vehicle Info */}
                        <div className="col-span-2">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getStatusBadgeColor(vehicle.status)}>
                              {vehicle.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <p className="font-semibold text-lg">{vehicle.unitNumber}</p>
                          <p className="text-sm text-gray-600">{vehicle.make} {vehicle.model}</p>
                          <p className="text-xs text-gray-500">{vehicle.year} • {vehicle.vin.slice(-8)}</p>
                        </div>

                        {/* Assignment & Location */}
                        <div className="col-span-2">
                          {vehicle.assignedDriver ? (
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1">
                                <User className="w-3 h-3 text-blue-600" />
                                <span className="text-sm font-medium">{vehicle.assignedDriver.name}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                <span className="text-sm">{vehicle.location.address}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center">
                              <Badge variant="outline">Unassigned</Badge>
                            </div>
                          )}
                        </div>

                        {/* Condition */}
                        <div className="col-span-2">
                          <div className="space-y-1">
                            <p className="text-sm">Mileage: {vehicle.mileage.toLocaleString()}</p>
                            <div className="flex items-center space-x-1">
                              <Fuel className="w-3 h-3 text-yellow-600" />
                              <span className="text-sm">{vehicle.fuelLevel}% Fuel</span>
                            </div>
                            <p className="text-xs text-gray-600">
                              Next Service: {vehicle.maintenance.milesUntilService.toLocaleString()} mi
                            </p>
                          </div>
                        </div>

                        {/* Maintenance */}
                        <div className="col-span-2">
                          <div className="space-y-1">
                            <p className="text-sm">Last: {new Date(vehicle.maintenance.lastService).toLocaleDateString()}</p>
                            <p className="text-sm">Next: {new Date(vehicle.maintenance.nextService).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-600">
                              Inspection: {new Date(vehicle.maintenance.inspectionDue).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Performance */}
                        <div className="col-span-2">
                          <div className="space-y-1">
                            <p className="text-sm">{vehicle.performance.mpg} MPG</p>
                            <p className="text-sm">{vehicle.performance.utilizationRate}% Utilized</p>
                            <p className="text-xs text-gray-600">
                              Revenue: ${vehicle.performance.revenueGenerated.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Equipment */}
                        <div className="col-span-1">
                          <div className="flex flex-wrap gap-1">
                            {vehicle.specifications.equipmentType.slice(0, 2).map((equipment) => (
                              <Badge key={equipment} variant="secondary" className="text-xs">
                                {equipment}
                              </Badge>
                            ))}
                            {vehicle.specifications.equipmentType.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{vehicle.specifications.equipmentType.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="col-span-1">
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedVehicle(vehicle)}>
                              <Truck className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Wrench className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceRecords.map((record) => (
                  <Card key={record.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-2">
                          <Badge className={getStatusBadgeColor(record.status)}>
                            {record.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <p className="font-semibold mt-1">{record.vehicleNumber}</p>
                          <p className="text-sm text-gray-600">{record.type}</p>
                        </div>
                        <div className="col-span-4">
                          <p className="font-medium">{record.description}</p>
                          <p className="text-sm text-gray-600">{record.vendor}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm">Scheduled: {new Date(record.scheduledDate).toLocaleDateString()}</p>
                          <p className="text-sm">Mileage: {record.mileage.toLocaleString()}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm font-medium">${record.cost}</p>
                          <p className="text-sm text-gray-600">{record.laborHours}h labor</p>
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm">
                              <FileText className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Calendar className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceItems.map((item) => (
                  <Card key={item.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-2">
                          <Badge className={getStatusBadgeColor(item.status)}>
                            {item.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <p className="font-semibold mt-1">{item.entityName}</p>
                          <p className="text-sm text-gray-600">{item.entityType}</p>
                        </div>
                        <div className="col-span-3">
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-gray-600">{item.itemType.replace('_', ' ')}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm">Expires: {new Date(item.expirationDate).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-600">{item.daysUntilExpiration} days remaining</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm">Reminders: {item.remindersSent}</p>
                          <p className="text-sm text-gray-600">Updated: {new Date(item.lastUpdated).toLocaleDateString()}</p>
                        </div>
                        <div className="col-span-3">
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm">
                              <FileText className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Calendar className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average MPG</CardTitle>
                <Fuel className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7.0</div>
                <p className="text-xs text-muted-foreground">+0.2 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Maintenance Cost</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${fleetData?.fuelCostPerMile?.toFixed(2) || '0.00'}</div>
                <p className="text-xs text-muted-foreground">per mile • {fleetMetrics?.fuelEfficiencyVariance || 'Contact for details'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Driver Retention</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.2%</div>
                <p className="text-xs text-muted-foreground">+5.1% year over year</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98.7%</div>
                <p className="text-xs text-muted-foreground">All items current</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Driver Detail Dialog */}
      {selectedDriver && (
        <Dialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Driver Profile - {selectedDriver.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Basic Information</h4>
                    <div className="space-y-1 text-sm">
                      <div>Employee ID: {selectedDriver.employeeId}</div>
                      <div>Phone: {selectedDriver.phone}</div>
                      <div>Email: {selectedDriver.email}</div>
                      <div>Hire Date: {new Date(selectedDriver.hireDate).toLocaleDateString()}</div>
                      <div>Status: <Badge className={getStatusBadgeColor(selectedDriver.status)}>{selectedDriver.status}</Badge></div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">CDL Information</h4>
                    <div className="space-y-1 text-sm">
                      <div>License: {selectedDriver.cdlInfo.number}</div>
                      <div>Class: {selectedDriver.cdlInfo.class}</div>
                      <div>Expiration: {new Date(selectedDriver.cdlInfo.expiration).toLocaleDateString()}</div>
                      <div>Endorsements:</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedDriver.cdlInfo.endorsements.map((endorsement) => (
                          <Badge key={endorsement} variant="secondary" className="text-xs">
                            {endorsement}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Performance Metrics</h4>
                    <div className="space-y-1 text-sm">
                      <div>On-Time: {selectedDriver.performance.onTimePercentage}%</div>
                      <div>Safety Score: {selectedDriver.performance.safetyScore}%</div>
                      <div>Fuel Efficiency: {selectedDriver.performance.fuelEfficiency} MPG</div>
                      <div>Customer Rating: {selectedDriver.performance.customerRating}/5.0</div>
                      <div>Miles This Month: {selectedDriver.performance.milesThisMonth.toLocaleString()}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Vehicle Detail Dialog */}
      {selectedVehicle && (
        <Dialog open={!!selectedVehicle} onOpenChange={() => setSelectedVehicle(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Vehicle Profile - {selectedVehicle.unitNumber}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Vehicle Information</h4>
                    <div className="space-y-1 text-sm">
                      <div>Make/Model: {selectedVehicle.make} {selectedVehicle.model}</div>
                      <div>Year: {selectedVehicle.year}</div>
                      <div>VIN: {selectedVehicle.vin}</div>
                      <div>Status: <Badge className={getStatusBadgeColor(selectedVehicle.status)}>{selectedVehicle.status}</Badge></div>
                      <div>Mileage: {selectedVehicle.mileage.toLocaleString()}</div>
                      <div>Fuel Level: {selectedVehicle.fuelLevel}%</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Maintenance Schedule</h4>
                    <div className="space-y-1 text-sm">
                      <div>Last Service: {new Date(selectedVehicle.maintenance.lastService).toLocaleDateString()}</div>
                      <div>Next Service: {new Date(selectedVehicle.maintenance.nextService).toLocaleDateString()}</div>
                      <div>Miles Until Service: {selectedVehicle.maintenance.milesUntilService.toLocaleString()}</div>
                      <div>Inspection Due: {new Date(selectedVehicle.maintenance.inspectionDue).toLocaleDateString()}</div>
                      <div>Registration Expires: {new Date(selectedVehicle.maintenance.registrationExpiry).toLocaleDateString()}</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Performance</h4>
                    <div className="space-y-1 text-sm">
                      <div>MPG: {selectedVehicle.performance.mpg}</div>
                      <div>Utilization: {selectedVehicle.performance.utilizationRate}%</div>
                      <div>Maintenance Cost: ${selectedVehicle.performance.maintenanceCost.toLocaleString()}</div>
                      <div>Revenue Generated: ${selectedVehicle.performance.revenueGenerated.toLocaleString()}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}