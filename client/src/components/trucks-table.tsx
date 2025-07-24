import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Truck, Calendar, Gauge, Fuel, Wrench, AlertTriangle, CheckCircle } from "lucide-react";
import { Link } from "wouter";

interface Truck {
  id: string;
  truckNumber: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  status: string;
  mileage: number;
  fuelType: string;
  nextMaintenanceDate?: string;
  lastInspectionDate?: string;
  registrationExpiration?: string;
  insuranceExpiration?: string;
  currentLocation?: { lat: number; lng: number };
  assignedDriverId?: string;
  createdAt: string;
  updatedAt: string;
}

export default function TrucksTable() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);

  // Fetch trucks
  const { data: trucks = [], isLoading } = useQuery<Truck[]>({
    queryKey: ["/api/trucks"],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch drivers for assignment
  const { data: drivers = [] } = useQuery({
    queryKey: ["/api/drivers"],
    staleTime: 5 * 60 * 1000,
  });

  // Filter trucks
  const filteredTrucks = trucks.filter(truck => {
    const matchesSearch = truck.truckNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         truck.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         truck.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         truck.vin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || truck.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Create truck mutation
  const createTruckMutation = useMutation({
    mutationFn: async (truckData: any) => {
      return apiRequest("POST", "/api/trucks", truckData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trucks"] });
      setIsCreateOpen(false);
      toast({
        title: "Success",
        description: "Truck added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add truck",
        variant: "destructive",
      });
    },
  });

  // Update truck mutation
  const updateTruckMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      return apiRequest("PUT", `/api/trucks/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trucks"] });
      setEditingTruck(null);
      toast({
        title: "Success",
        description: "Truck updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update truck",
        variant: "destructive",
      });
    },
  });

  // Delete truck mutation
  const deleteTruckMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/trucks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trucks"] });
      toast({
        title: "Success",
        description: "Truck deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete truck",
        variant: "destructive",
      });
    },
  });

  const handleCreateTruck = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const truckData = {
      truckNumber: formData.get("truckNumber"),
      make: formData.get("make"),
      model: formData.get("model"),
      year: parseInt(formData.get("year") as string),
      vin: formData.get("vin"),
      status: formData.get("status") || "available",
      mileage: parseInt(formData.get("mileage") as string) || 0,
      fuelType: formData.get("fuelType") || "diesel",
    };
    createTruckMutation.mutate(truckData);
  };

  const handleUpdateTruck = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTruck) return;
    const formData = new FormData(e.currentTarget);
    const truckData = {
      id: editingTruck.id,
      truckNumber: formData.get("truckNumber"),
      make: formData.get("make"),
      model: formData.get("model"),
      year: parseInt(formData.get("year") as string),
      vin: formData.get("vin"),
      status: formData.get("status"),
      mileage: parseInt(formData.get("mileage") as string),
      fuelType: formData.get("fuelType"),
    };
    updateTruckMutation.mutate(truckData);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { 
        variant: "default" as const, 
        text: "Available", 
        icon: CheckCircle,
        color: "text-green-600"
      },
      in_use: { 
        variant: "destructive" as const, 
        text: "In Use", 
        icon: Truck,
        color: "text-blue-600"
      },
      maintenance: { 
        variant: "outline" as const, 
        text: "Maintenance", 
        icon: Wrench,
        color: "text-yellow-600"
      },
      out_of_service: { 
        variant: "secondary" as const, 
        text: "Out of Service", 
        icon: AlertTriangle,
        color: "text-red-600"
      },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      variant: "outline" as const, 
      text: status,
      icon: Truck,
      color: "text-gray-600"
    };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('en-US').format(mileage);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getMaintenanceStatus = (truck: Truck) => {
    if (!truck.nextMaintenanceDate) return null;
    const nextMaintenance = new Date(truck.nextMaintenanceDate);
    const today = new Date();
    const daysDiff = Math.ceil((nextMaintenance.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysDiff < 0) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (daysDiff <= 7) {
      return <Badge variant="secondary">Due Soon</Badge>;
    } else if (daysDiff <= 30) {
      return <Badge variant="outline">Upcoming</Badge>;
    }
    return <Badge variant="default">Current</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fleet Vehicles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Fleet Vehicles ({filteredTrucks.length})
          </CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Vehicle</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTruck} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Truck Number</label>
                    <Input name="truckNumber" required placeholder="e.g., T-001" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <select name="status" className="w-full p-2 border rounded">
                      <option value="available">Available</option>
                      <option value="in_use">In Use</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="out_of_service">Out of Service</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Make</label>
                    <Input name="make" required placeholder="e.g., Freightliner" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Model</label>
                    <Input name="model" required placeholder="e.g., Cascadia" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Year</label>
                    <Input name="year" type="number" required min="1990" max="2030" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">VIN</label>
                  <Input name="vin" required placeholder="17-character VIN" maxLength={17} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Current Mileage</label>
                    <Input name="mileage" type="number" min="0" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Fuel Type</label>
                    <select name="fuelType" className="w-full p-2 border rounded">
                      <option value="diesel">Diesel</option>
                      <option value="gasoline">Gasoline</option>
                      <option value="electric">Electric</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={createTruckMutation.isPending}>
                    {createTruckMutation.isPending ? "Adding..." : "Add Vehicle"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="in_use">In Use</option>
            <option value="maintenance">Maintenance</option>
            <option value="out_of_service">Out of Service</option>
          </select>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Mileage</TableHead>
              <TableHead>Maintenance</TableHead>
              <TableHead>Fuel Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTrucks.map((truck) => (
              <TableRow key={truck.id}>
                <TableCell>
                  <div className="space-y-1">
                    <Link href={`/fleet/trucks/${truck.id}`}>
                      <Button variant="link" className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-800">
                        {truck.truckNumber}
                      </Button>
                    </Link>
                    <div className="text-sm text-gray-500">
                      {truck.make} {truck.model}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-sm">
                    <div>Year: {truck.year}</div>
                    <div className="font-mono text-xs">
                      VIN: {truck.vin}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(truck.status)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Gauge className="h-3 w-3" />
                    <span className="font-mono">
                      {formatMileage(truck.mileage)} mi
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {getMaintenanceStatus(truck)}
                    <div className="text-xs text-gray-500">
                      Next: {formatDate(truck.nextMaintenanceDate)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Fuel className="h-3 w-3" />
                    <span className="capitalize">{truck.fuelType}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTruck(truck)}
                      title="Edit Vehicle"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTruckMutation.mutate(truck.id)}
                      title="Delete Vehicle"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredTrucks.length === 0 && trucks.length === 0 && (
          <div className="text-center py-12">
            <Truck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No vehicles yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first vehicle to the fleet.</p>
            <div className="mt-6">
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Vehicle
              </Button>
            </div>
          </div>
        )}
        
        {filteredTrucks.length === 0 && trucks.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            No vehicles found matching your search criteria.
          </div>
        )}

        {/* Edit Truck Dialog */}
        <Dialog open={!!editingTruck} onOpenChange={() => setEditingTruck(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Vehicle</DialogTitle>
            </DialogHeader>
            {editingTruck && (
              <form onSubmit={handleUpdateTruck} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Truck Number</label>
                    <Input name="truckNumber" defaultValue={editingTruck.truckNumber} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <select name="status" defaultValue={editingTruck.status} className="w-full p-2 border rounded">
                      <option value="available">Available</option>
                      <option value="in_use">In Use</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="out_of_service">Out of Service</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Make</label>
                    <Input name="make" defaultValue={editingTruck.make} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Model</label>
                    <Input name="model" defaultValue={editingTruck.model} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Year</label>
                    <Input name="year" type="number" defaultValue={editingTruck.year} required min="1990" max="2030" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">VIN</label>
                  <Input name="vin" defaultValue={editingTruck.vin} required maxLength={17} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Current Mileage</label>
                    <Input name="mileage" type="number" defaultValue={editingTruck.mileage} min="0" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Fuel Type</label>
                    <select name="fuelType" defaultValue={editingTruck.fuelType} className="w-full p-2 border rounded">
                      <option value="diesel">Diesel</option>
                      <option value="gasoline">Gasoline</option>
                      <option value="electric">Electric</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={updateTruckMutation.isPending}>
                    {updateTruckMutation.isPending ? "Updating..." : "Update Vehicle"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditingTruck(null)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}