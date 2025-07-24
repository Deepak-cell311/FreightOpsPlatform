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
import { Plus, Search, Edit, Trash2, Copy, MapPin, Calendar, DollarSign, Truck, Users, Calculator, Receipt } from "lucide-react";
import { Link } from "wouter";
import LoadBillingManagement from "./load-billing-management";

interface LoadStop {
  id: string;
  type: 'pickup' | 'delivery';
  location: string;
  scheduledDate: string;
  actualDate?: string;
  status: 'pending' | 'completed' | 'in_progress';
  contactName?: string;
  contactPhone?: string;
  notes?: string;
}

interface Load {
  id: string;
  loadNumber: string;
  status: string;
  customer: string;
  rate: number;
  pickupLocation: string;
  deliveryLocation: string;
  pickupDate: string;
  deliveryDate: string;
  stops?: LoadStop[];
  assignedDrivers?: string[];
  assignedTrucks?: string[];
  weight?: number;
  commodity?: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export default function LoadsTable() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLoad, setEditingLoad] = useState<Load | null>(null);
  const [selectedLoadForBilling, setSelectedLoadForBilling] = useState<Load | null>(null);

  // Fetch loads
  const { data: loads = [], isLoading } = useQuery<Load[]>({
    queryKey: ["/api/loads"],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch drivers for assignment
  const { data: drivers = [] } = useQuery({
    queryKey: ["/api/drivers"],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch trucks for assignment
  const { data: trucks = [] } = useQuery({
    queryKey: ["/api/trucks"],
    staleTime: 5 * 60 * 1000,
  });

  // Filter loads
  const filteredLoads = loads.filter(load => {
    const matchesSearch = load.loadNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         load.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         load.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         load.deliveryLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || load.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Create load mutation
  const createLoadMutation = useMutation({
    mutationFn: async (loadData: any) => {
      return apiRequest("POST", "/api/loads", loadData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loads"] });
      setIsCreateOpen(false);
      toast({
        title: "Success",
        description: "Load created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create load",
        variant: "destructive",
      });
    },
  });

  // Update load mutation
  const updateLoadMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      return apiRequest("PUT", `/api/loads/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loads"] });
      setEditingLoad(null);
      toast({
        title: "Success",
        description: "Load updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update load",
        variant: "destructive",
      });
    },
  });

  // Copy load mutation
  const copyLoadMutation = useMutation({
    mutationFn: async (originalLoad: Load) => {
      const copyData = {
        ...originalLoad,
        loadNumber: `${originalLoad.loadNumber}-COPY`,
        status: 'pending',
        assignedDrivers: [],
        assignedTrucks: [],
        stops: originalLoad.stops?.map(stop => ({
          ...stop,
          id: crypto.randomUUID(),
          status: 'pending',
          actualDate: undefined
        }))
      };
      // Remove read-only fields for copying
      const { id, createdAt, updatedAt, ...cleanCopyData } = copyData;
      return apiRequest("POST", "/api/loads", cleanCopyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loads"] });
      toast({
        title: "Success",
        description: "Load copied successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to copy load",
        variant: "destructive",
      });
    },
  });

  // Delete load mutation
  const deleteLoadMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/loads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loads"] });
      toast({
        title: "Success",
        description: "Load deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete load",
        variant: "destructive",
      });
    },
  });

  const handleCreateLoad = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const loadData = {
      loadNumber: formData.get("loadNumber"),
      customer: formData.get("customer"),
      rate: parseFloat(formData.get("rate") as string),
      pickupLocation: formData.get("pickupLocation"),
      deliveryLocation: formData.get("deliveryLocation"),
      pickupDate: formData.get("pickupDate"),
      deliveryDate: formData.get("deliveryDate"),
      weight: parseFloat(formData.get("weight") as string) || undefined,
      commodity: formData.get("commodity"),
      specialInstructions: formData.get("specialInstructions"),
      status: "pending",
      stops: [],
      assignedDrivers: [],
      assignedTrucks: []
    };
    createLoadMutation.mutate(loadData);
  };

  const handleUpdateLoad = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingLoad) return;
    const formData = new FormData(e.currentTarget);
    const loadData = {
      id: editingLoad.id,
      loadNumber: formData.get("loadNumber"),
      customer: formData.get("customer"),
      rate: parseFloat(formData.get("rate") as string),
      pickupLocation: formData.get("pickupLocation"),
      deliveryLocation: formData.get("deliveryLocation"),
      pickupDate: formData.get("pickupDate"),
      deliveryDate: formData.get("deliveryDate"),
      weight: parseFloat(formData.get("weight") as string) || undefined,
      commodity: formData.get("commodity"),
      specialInstructions: formData.get("specialInstructions"),
      status: formData.get("status"),
    };
    updateLoadMutation.mutate(loadData);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, text: "Pending" },
      assigned: { variant: "default" as const, text: "Assigned" },
      in_transit: { variant: "destructive" as const, text: "In Transit" },
      delivered: { variant: "default" as const, text: "Delivered" },
      cancelled: { variant: "outline" as const, text: "Cancelled" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: "outline" as const, text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loads</CardTitle>
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
            Loads ({filteredLoads.length})
          </CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Load
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Load</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateLoad} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Load Number</label>
                    <Input name="loadNumber" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Customer</label>
                    <Input name="customer" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Rate ($)</label>
                    <Input name="rate" type="number" step="0.01" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Weight (lbs)</label>
                    <Input name="weight" type="number" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Commodity</label>
                  <Input name="commodity" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Pickup Location</label>
                    <Input name="pickupLocation" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Delivery Location</label>
                    <Input name="deliveryLocation" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Pickup Date</label>
                    <Input name="pickupDate" type="datetime-local" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Delivery Date</label>
                    <Input name="deliveryDate" type="datetime-local" required />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Special Instructions</label>
                  <textarea name="specialInstructions" className="w-full p-2 border rounded" rows={3}></textarea>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={createLoadMutation.isPending}>
                    {createLoadMutation.isPending ? "Creating..." : "Create Load"}
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
              placeholder="Search loads..."
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
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Load #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Pickup Date</TableHead>
              <TableHead>Delivery Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLoads.map((load) => (
              <TableRow key={load.id}>
                <TableCell>
                  <Link href={`/dispatch/loads/${load.id}`}>
                    <Button variant="link" className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-800">
                      {load.loadNumber}
                    </Button>
                  </Link>
                </TableCell>
                <TableCell className="font-medium">{load.customer}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3 text-green-600" />
                      {load.pickupLocation}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3 text-red-600" />
                      {load.deliveryLocation}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(load.status)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 font-semibold text-green-600">
                    <DollarSign className="h-3 w-3" />
                    {formatCurrency(load.rate)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    {formatDate(load.pickupDate)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    {formatDate(load.deliveryDate)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyLoadMutation.mutate(load)}
                      title="Copy Load"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingLoad(load)}
                      title="Edit Load"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLoadForBilling(load)}
                      title="Manage Billing"
                      className="bg-green-50 border-green-200 hover:bg-green-100"
                    >
                      <Calculator className="h-3 w-3 text-green-600" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteLoadMutation.mutate(load.id)}
                      title="Delete Load"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredLoads.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No loads found matching your criteria.
          </div>
        )}

        {/* Edit Load Dialog */}
        <Dialog open={!!editingLoad} onOpenChange={() => setEditingLoad(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Load</DialogTitle>
            </DialogHeader>
            {editingLoad && (
              <form onSubmit={handleUpdateLoad} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Load Number</label>
                    <Input name="loadNumber" defaultValue={editingLoad.loadNumber} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Customer</label>
                    <Input name="customer" defaultValue={editingLoad.customer} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Rate ($)</label>
                    <Input name="rate" type="number" step="0.01" defaultValue={editingLoad.rate} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Weight (lbs)</label>
                    <Input name="weight" type="number" defaultValue={editingLoad.weight} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Commodity</label>
                  <Input name="commodity" defaultValue={editingLoad.commodity} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Pickup Location</label>
                    <Input name="pickupLocation" defaultValue={editingLoad.pickupLocation} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Delivery Location</label>
                    <Input name="deliveryLocation" defaultValue={editingLoad.deliveryLocation} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Pickup Date</label>
                    <Input 
                      name="pickupDate" 
                      type="datetime-local" 
                      defaultValue={new Date(editingLoad.pickupDate).toISOString().slice(0, 16)} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Delivery Date</label>
                    <Input 
                      name="deliveryDate" 
                      type="datetime-local" 
                      defaultValue={new Date(editingLoad.deliveryDate).toISOString().slice(0, 16)} 
                      required 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select name="status" defaultValue={editingLoad.status} className="w-full p-2 border rounded">
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Special Instructions</label>
                  <textarea 
                    name="specialInstructions" 
                    className="w-full p-2 border rounded" 
                    rows={3}
                    defaultValue={editingLoad.specialInstructions}
                  ></textarea>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={updateLoadMutation.isPending}>
                    {updateLoadMutation.isPending ? "Updating..." : "Update Load"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditingLoad(null)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Billing Management Dialog */}
        <Dialog open={!!selectedLoadForBilling} onOpenChange={() => setSelectedLoadForBilling(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Load Billing Management</DialogTitle>
            </DialogHeader>
            {selectedLoadForBilling && (
              <LoadBillingManagement
                loadId={selectedLoadForBilling.id}
                loadNumber={selectedLoadForBilling.loadNumber}
                customerName={selectedLoadForBilling.customer}
                onClose={() => setSelectedLoadForBilling(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}