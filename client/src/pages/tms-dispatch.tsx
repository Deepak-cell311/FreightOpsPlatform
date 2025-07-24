import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Route,
  Package
} from "lucide-react";
import { Link } from "wouter";

export default function TMSDispatch() {
  // Fetch real load data from API
  const { data: loadsData, isLoading: loadsLoading } = useQuery({
    queryKey: ["/api/loads"],
    retry: false,
  });

  const loads = loadsData || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-blue-100 text-blue-800">Available</Badge>;
      case "dispatched":
        return <Badge className="bg-yellow-100 text-yellow-800">Dispatched</Badge>;
      case "in_transit":
        return <Badge className="bg-green-100 text-green-800">In Transit</Badge>;
      case "delivered":
        return <Badge className="bg-gray-100 text-gray-800">Delivered</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const availableLoads = loads.filter(load => load.status === "available").length;
  const dispatchedLoads = loads.filter(load => load.status === "dispatched").length;
  const inTransitLoads = loads.filter(load => load.status === "in_transit").length;
  const totalRevenue = loads.reduce((sum, load) => sum + load.revenue, 0);

  return (
    <DashboardLayout title="Dispatch Center">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dispatch Center</h1>
            <p className="text-gray-500 mt-1">
              Manage loads, assign drivers, and track shipments
            </p>
          </div>
          <Button className="freight-button">
            <Plus className="h-4 w-4 mr-2" />
            Create New Load
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="freight-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Available Loads</p>
                  <p className="text-2xl font-bold">{availableLoads}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="freight-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dispatched</p>
                  <p className="text-2xl font-bold">{dispatchedLoads}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="freight-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Navigation className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">In Transit</p>
                  <p className="text-2xl font-bold">{inTransitLoads}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="freight-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="freight-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search loads by ID, origin, destination..."
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Date Range
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Load List */}
        <Card className="freight-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Route className="h-5 w-5 mr-2" />
              Active Loads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loads.map((load) => (
                <div key={load.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    {/* Load ID and Status */}
                    <div className="lg:col-span-2">
                      <div className="font-medium text-blue-600">{load.id}</div>
                      <div className="mt-1">{getStatusBadge(load.status)}</div>
                    </div>

                    {/* Route */}
                    <div className="lg:col-span-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">{load.origin}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <MapPin className="h-4 w-4 text-red-600" />
                        <span className="text-sm">{load.destination}</span>
                      </div>
                    </div>

                    {/* Driver and Truck */}
                    <div className="lg:col-span-2">
                      {load.driver ? (
                        <div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">{load.driver}</span>
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            <Truck className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{load.truck}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          <div>No driver assigned</div>
                          <div>No truck assigned</div>
                        </div>
                      )}
                    </div>

                    {/* Dates */}
                    <div className="lg:col-span-2">
                      <div className="text-sm">
                        <div>Pickup: {load.pickupDate}</div>
                        <div>Delivery: {load.deliveryDate}</div>
                      </div>
                    </div>

                    {/* Load Details */}
                    <div className="lg:col-span-2">
                      <div className="text-sm">
                        <div className="font-medium">${load.revenue.toLocaleString()}</div>
                        <div className="text-gray-600">{load.miles} miles</div>
                        <div className="text-gray-600">{load.weight}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="lg:col-span-1">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {load.driver && (
                          <Button size="sm" variant="ghost">
                            <Phone className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Load Info */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Commodity: {load.commodity}</span>
                      {load.status === "available" && (
                        <Button size="sm" className="freight-button">
                          Assign Driver
                        </Button>
                      )}
                      {load.status === "in_transit" && (
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>On schedule</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="freight-card cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Truck className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <h3 className="font-medium">Fleet Status</h3>
              <p className="text-sm text-gray-600 mt-1">View available trucks and drivers</p>
            </CardContent>
          </Card>

          <Card className="freight-card cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Navigation className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <h3 className="font-medium">Live Tracking</h3>
              <p className="text-sm text-gray-600 mt-1">Monitor shipments in real-time</p>
            </CardContent>
          </Card>

          <Card className="freight-card cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <h3 className="font-medium">Alerts</h3>
              <p className="text-sm text-gray-600 mt-1">Review delays and exceptions</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}