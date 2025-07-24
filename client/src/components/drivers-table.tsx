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
import { Plus, Search, Edit, Trash2, Phone, Mail, Calendar, MapPin } from "lucide-react";
import { Link } from "wouter";

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseExpiration: string;
  dotMedicalExpiration: string;
  status: string;
  phone: string;
  email: string;
  currentLocation?: { lat: number; lng: number };
  createdAt: string;
  updatedAt: string;
}

export default function DriversTable() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  // Fetch drivers
  const { data: drivers = [], isLoading } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
    staleTime: 5 * 60 * 1000,
  });

  // Filter drivers
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || driver.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Create driver mutation
  const createDriverMutation = useMutation({
    mutationFn: async (driverData: any) => {
      return apiRequest("POST", "/api/drivers", driverData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      setIsCreateOpen(false);
      toast({
        title: "Success",
        description: "Driver added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add driver",
        variant: "destructive",
      });
    },
  });

  // Update driver mutation
  const updateDriverMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      return apiRequest("PUT", `/api/drivers/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      setEditingDriver(null);
      toast({
        title: "Success",
        description: "Driver updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update driver",
        variant: "destructive",
      });
    },
  });

  // Delete driver mutation
  const deleteDriverMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/drivers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      toast({
        title: "Success",
        description: "Driver deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete driver",
        variant: "destructive",
      });
    },
  });

  const handleCreateDriver = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const driverData = {
      name: formData.get("name"),
      licenseNumber: formData.get("licenseNumber"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      status: formData.get("status") || "available",
    };
    createDriverMutation.mutate(driverData);
  };

  const handleUpdateDriver = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingDriver) return;
    const formData = new FormData(e.currentTarget);
    const driverData = {
      id: editingDriver.id,
      name: formData.get("name"),
      licenseNumber: formData.get("licenseNumber"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      status: formData.get("status"),
    };
    updateDriverMutation.mutate(driverData);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { variant: "default" as const, text: "Available" },
      driving: { variant: "destructive" as const, text: "Driving" },
      off_duty: { variant: "secondary" as const, text: "Off Duty" },
      maintenance: { variant: "outline" as const, text: "Maintenance" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: "outline" as const, text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Drivers</CardTitle>
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
            <MapPin className="h-5 w-5" />
            Drivers ({filteredDrivers.length})
          </CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Driver
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Driver</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateDriver} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input name="name" required />
                </div>
                <div>
                  <label className="text-sm font-medium">License Number</label>
                  <Input name="licenseNumber" required />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input name="phone" type="tel" required />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input name="email" type="email" required />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select name="status" className="w-full p-2 border rounded">
                    <option value="available">Available</option>
                    <option value="driving">Driving</option>
                    <option value="off_duty">Off Duty</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={createDriverMutation.isPending}>
                    {createDriverMutation.isPending ? "Adding..." : "Add Driver"}
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
              placeholder="Search drivers..."
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
            <option value="driving">Driving</option>
            <option value="off_duty">Off Duty</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>License</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>License Exp</TableHead>
              <TableHead>Medical Exp</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDrivers.map((driver) => (
              <TableRow key={driver.id}>
                <TableCell>
                  <Link href={`/fleet/drivers/${driver.id}`}>
                    <Button variant="link" className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-800">
                      {driver.name}
                    </Button>
                  </Link>
                </TableCell>
                <TableCell>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {driver.licenseNumber}
                  </code>
                </TableCell>
                <TableCell>
                  {getStatusBadge(driver.status)}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="h-3 w-3" />
                      <a href={`tel:${driver.phone}`} className="text-blue-600 hover:underline">
                        {driver.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Mail className="h-3 w-3" />
                      <a href={`mailto:${driver.email}`} className="text-blue-600 hover:underline">
                        {driver.email}
                      </a>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    {formatDate(driver.licenseExpiration)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    {formatDate(driver.dotMedicalExpiration)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingDriver(driver)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteDriverMutation.mutate(driver.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredDrivers.length === 0 && drivers.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No drivers yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first driver to the fleet.</p>
            <div className="mt-6">
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Driver
              </Button>
            </div>
          </div>
        )}
        
        {filteredDrivers.length === 0 && drivers.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            No drivers found matching your search criteria.
          </div>
        )}

        {/* Edit Driver Dialog */}
        <Dialog open={!!editingDriver} onOpenChange={() => setEditingDriver(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Driver</DialogTitle>
            </DialogHeader>
            {editingDriver && (
              <form onSubmit={handleUpdateDriver} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input name="name" defaultValue={editingDriver.name} required />
                </div>
                <div>
                  <label className="text-sm font-medium">License Number</label>
                  <Input name="licenseNumber" defaultValue={editingDriver.licenseNumber} required />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input name="phone" type="tel" defaultValue={editingDriver.phone} required />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input name="email" type="email" defaultValue={editingDriver.email} required />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select name="status" defaultValue={editingDriver.status} className="w-full p-2 border rounded">
                    <option value="available">Available</option>
                    <option value="driving">Driving</option>
                    <option value="off_duty">Off Duty</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={updateDriverMutation.isPending}>
                    {updateDriverMutation.isPending ? "Updating..." : "Update Driver"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditingDriver(null)}>
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