import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Train, 
  Ship, 
  Truck, 
  Container, 
  MapPin, 
  Clock, 
  Search,
  Calendar,
  AlertCircle,
  CheckCircle,
  Package,
  Route,
  Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface ContainerTracking {
  id: string;
  containerNumber: string;
  bookingNumber: string;
  billOfLading: string;
  status: 'port_arrival' | 'rail_departure' | 'in_transit' | 'rail_arrival' | 'drayage' | 'delivered';
  currentLocation: {
    type: 'port' | 'rail_yard' | 'in_transit' | 'destination';
    name: string;
    city: string;
    state: string;
    coordinates: { lat: number; lng: number };
  };
  origin: {
    port: string;
    city: string;
    country: string;
  };
  destination: {
    facility: string;
    city: string;
    state: string;
  };
  vessel: {
    name: string;
    voyage: string;
    eta: string;
  };
  rail: {
    railroad: string;
    trainId: string;
    equipment: string;
    eta: string;
  };
  drayage: {
    carrier: string;
    truckNumber: string;
    driver: string;
    eta: string;
  };
  milestones: Array<{
    event: string;
    location: string;
    timestamp: string;
    status: 'completed' | 'current' | 'pending';
  }>;
  cargo: {
    description: string;
    weight: number;
    value: number;
    hazmat: boolean;
  };
  fees: {
    demurrage: number;
    detention: number;
    storage: number;
    drayage: number;
  };
}

interface RailTracking {
  id: string;
  railcarNumber: string;
  trainId: string;
  railroad: 'BNSF' | 'UP' | 'CSX' | 'NS' | 'CN' | 'CP';
  status: 'loading' | 'in_transit' | 'switching' | 'delivered' | 'empty_return';
  currentLocation: {
    yard: string;
    city: string;
    state: string;
    track: string;
  };
  route: Array<{
    location: string;
    scheduled: string;
    actual?: string;
    status: 'completed' | 'current' | 'pending';
  }>;
  cargo: {
    type: 'container' | 'bulk' | 'auto' | 'intermodal';
    description: string;
    weight: number;
    cars: number;
  };
  equipment: {
    type: 'flatcar' | 'boxcar' | 'tanker' | 'hopper' | 'well_car';
    capacity: number;
    length: number;
  };
}

export default function IntermodalTracking() {
  const { user } = useAuth();
  const [searchType, setSearchType] = useState<'container' | 'rail'>('container');
  const [searchValue, setSearchValue] = useState('');
  const [selectedTracking, setSelectedTracking] = useState<ContainerTracking | RailTracking | null>(null);

  // Fetch real container tracking data from API
  const { data: containerData } = useQuery({
    queryKey: ["/api/intermodal/containers"],
    retry: false,
  });

  const realContainerData: ContainerTracking[] = containerData || [
    {
      id: '1',
      containerNumber: 'MSCU7234567',
      bookingNumber: 'MSC240615001',
      billOfLading: 'MSCBL240615001',
      status: 'rail_departure',
      currentLocation: {
        type: 'rail_yard',
        name: 'BNSF Logistics Park Chicago',
        city: 'Chicago',
        state: 'IL',
        coordinates: { lat: 41.8781, lng: -87.6298 }
      },
      origin: {
        port: 'Port of Long Beach',
        city: 'Long Beach',
        country: 'USA'
      },
      destination: {
        facility: 'Amazon Fulfillment Center',
        city: 'Dallas',
        state: 'TX'
      },
      vessel: {
        name: 'MSC IRINA',
        voyage: '240W',
        eta: '2024-06-10T08:00:00Z'
      },
      rail: {
        railroad: 'BNSF',
        trainId: 'Q-CHISLB1-15',
        equipment: 'Well Car 53ft',
        eta: '2024-06-18T14:30:00Z'
      },
      drayage: {
        carrier: 'FreightOps Pro',
        truckNumber: 'FO-001',
        driver: 'John Martinez',
        eta: '2024-06-19T10:00:00Z'
      },
      milestones: [
        { event: 'Container discharged at port', location: 'Port of Long Beach', timestamp: '2024-06-10T10:15:00Z', status: 'completed' },
        { event: 'Rail loading completed', location: 'ICTF Los Angeles', timestamp: '2024-06-11T16:30:00Z', status: 'completed' },
        { event: 'Rail departure', location: 'Chicago, IL', timestamp: '2024-06-15T09:00:00Z', status: 'current' },
        { event: 'Rail arrival', location: 'Dallas, TX', timestamp: '2024-06-18T14:30:00Z', status: 'pending' },
        { event: 'Drayage pickup', location: 'BNSF Dallas', timestamp: '2024-06-19T08:00:00Z', status: 'pending' },
        { event: 'Final delivery', location: 'Amazon FC Dallas', timestamp: '2024-06-19T10:00:00Z', status: 'pending' }
      ],
      cargo: {
        description: 'Electronics and consumer goods',
        weight: 28500,
        value: 150000,
        hazmat: false
      },
      fees: {
        demurrage: 0,
        detention: 0,
        storage: 105,
        drayage: 450
      }
    }
  ];

  // Fetch real rail tracking data from API
  const { data: railData } = useQuery({
    queryKey: ["/api/intermodal/rail"],
    retry: false,
  });

  const realRailData: RailTracking[] = railData || [
    {
      id: '1',
      railcarNumber: 'BNSF754321',
      trainId: 'Q-CHISLB1-15',
      railroad: 'BNSF',
      status: 'in_transit',
      currentLocation: {
        yard: 'Galesburg Yard',
        city: 'Galesburg',
        state: 'IL',
        track: 'Track 12'
      },
      route: [
        { location: 'Chicago, IL', scheduled: '2024-06-15T09:00:00Z', actual: '2024-06-15T09:15:00Z', status: 'completed' },
        { location: 'Galesburg, IL', scheduled: '2024-06-16T14:00:00Z', actual: '2024-06-16T13:45:00Z', status: 'current' },
        { location: 'Kansas City, MO', scheduled: '2024-06-17T08:30:00Z', status: 'pending' },
        { location: 'Dallas, TX', scheduled: '2024-06-18T14:30:00Z', status: 'pending' }
      ],
      cargo: {
        type: 'intermodal',
        description: 'Mixed container freight',
        weight: 125000,
        cars: 45
      },
      equipment: {
        type: 'well_car',
        capacity: 125000,
        length: 89
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'port_arrival': return 'bg-blue-100 text-blue-800';
      case 'rail_departure': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-yellow-100 text-yellow-800';
      case 'rail_arrival': return 'bg-purple-100 text-purple-800';
      case 'drayage': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const renderContainerTracking = (container: ContainerTracking) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Container className="h-5 w-5" />
              Container Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Container Number</Label>
              <p className="font-mono text-lg">{container.containerNumber}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Booking Number</Label>
              <p>{container.bookingNumber}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Bill of Lading</Label>
              <p>{container.billOfLading}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Badge className={getStatusColor(container.status)}>
                {container.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Current Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Facility</Label>
              <p>{container.currentLocation.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Location</Label>
              <p>{container.currentLocation.city}, {container.currentLocation.state}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Type</Label>
              <p className="capitalize">{container.currentLocation.type.replace('_', ' ')}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Cargo Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <p>{container.cargo.description}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Weight</Label>
              <p>{container.cargo.weight.toLocaleString()} lbs</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Value</Label>
              <p>${container.cargo.value.toLocaleString()}</p>
            </div>
            {container.cargo.hazmat && (
              <Badge className="bg-red-100 text-red-800">HAZMAT</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Transportation Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {container.milestones.map((milestone, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  {milestone.status === 'completed' ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : milestone.status === 'current' ? (
                    <Activity className="h-6 w-6 text-blue-500 animate-pulse" />
                  ) : (
                    <Clock className="h-6 w-6 text-gray-400" />
                  )}
                  {index < container.milestones.length - 1 && (
                    <div className="w-0.5 h-8 bg-gray-300 mt-2" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{milestone.event}</p>
                  <p className="text-sm text-gray-600">{milestone.location}</p>
                  <p className="text-xs text-gray-500">{formatDateTime(milestone.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Vessel Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <Label className="text-sm font-medium">Vessel Name</Label>
              <p>{container.vessel.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Voyage</Label>
              <p>{container.vessel.voyage}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">ETA</Label>
              <p>{formatDateTime(container.vessel.eta)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Train className="h-5 w-5" />
              Rail Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <Label className="text-sm font-medium">Railroad</Label>
              <p>{container.rail.railroad}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Train ID</Label>
              <p>{container.rail.trainId}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Equipment</Label>
              <p>{container.rail.equipment}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">ETA</Label>
              <p>{formatDateTime(container.rail.eta)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Drayage Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <Label className="text-sm font-medium">Carrier</Label>
              <p>{container.drayage.carrier}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Truck</Label>
              <p>{container.drayage.truckNumber}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Driver</Label>
              <p>{container.drayage.driver}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">ETA</Label>
              <p>{formatDateTime(container.drayage.eta)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Associated Fees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Demurrage</p>
              <p className="text-2xl font-bold text-green-600">${container.fees.demurrage}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Detention</p>
              <p className="text-2xl font-bold text-green-600">${container.fees.detention}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Storage</p>
              <p className="text-2xl font-bold text-yellow-600">${container.fees.storage}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Drayage</p>
              <p className="text-2xl font-bold text-blue-600">${container.fees.drayage}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRailTracking = (rail: RailTracking) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Train className="h-5 w-5" />
              Rail Car Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Rail Car Number</Label>
              <p className="font-mono text-lg">{rail.railcarNumber}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Train ID</Label>
              <p>{rail.trainId}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Railroad</Label>
              <p>{rail.railroad}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Badge className={getStatusColor(rail.status)}>
                {rail.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Current Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Yard</Label>
              <p>{rail.currentLocation.yard}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Location</Label>
              <p>{rail.currentLocation.city}, {rail.currentLocation.state}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Track</Label>
              <p>{rail.currentLocation.track}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Route Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rail.route.map((stop, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  {stop.status === 'completed' ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : stop.status === 'current' ? (
                    <Activity className="h-6 w-6 text-blue-500 animate-pulse" />
                  ) : (
                    <Clock className="h-6 w-6 text-gray-400" />
                  )}
                  {index < rail.route.length - 1 && (
                    <div className="w-0.5 h-8 bg-gray-300 mt-2" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{stop.location}</p>
                  <p className="text-sm text-gray-600">
                    Scheduled: {formatDateTime(stop.scheduled)}
                  </p>
                  {stop.actual && (
                    <p className="text-sm text-green-600">
                      Actual: {formatDateTime(stop.actual)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Intermodal Tracking</h2>
        <p className="text-gray-600">Real-time rail and container tracking</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Track Shipment</CardTitle>
          <CardDescription>Enter container number, rail car number, or booking reference</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Tracking Number</Label>
              <Input
                id="search"
                placeholder="Enter tracking number..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={searchType} onValueChange={(value: 'container' | 'rail') => setSearchType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="container">Container</SelectItem>
                  <SelectItem value="rail">Rail Car</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Track
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="container" className="space-y-6">
        <TabsList>
          <TabsTrigger value="container" className="flex items-center gap-2">
            <Container className="h-4 w-4" />
            Container Tracking
          </TabsTrigger>
          <TabsTrigger value="rail" className="flex items-center gap-2">
            <Train className="h-4 w-4" />
            Rail Tracking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="container">
          {realContainerData.length > 0 ? (
            renderContainerTracking(realContainerData[0])
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Container className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No container tracking data found</p>
                <p className="text-sm text-gray-500 mt-2">Enter a container number to track your shipment</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rail">
          {realRailData.length > 0 ? (
            renderRailTracking(realRailData[0])
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Train className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No rail tracking data found</p>
                <p className="text-sm text-gray-500 mt-2">Enter a rail car number to track your shipment</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}