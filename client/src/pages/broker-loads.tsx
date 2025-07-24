import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Truck, MapPin, DollarSign, Calendar, FileText, Edit, Trash2, Clock, Package2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const loadSchema = z.object({
  loadNumber: z.string().min(1, "Load number is required"),
  customerId: z.string().min(1, "Customer is required"),
  carrierId: z.string().min(1, "Carrier is required"),
  pickupLocation: z.object({
    name: z.string().min(1, "Pickup location name is required"),
    address: z.string().min(1, "Pickup address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "ZIP code is required"),
    appointmentTime: z.string().optional(),
  }),
  deliveryLocation: z.object({
    name: z.string().min(1, "Delivery location name is required"),
    address: z.string().min(1, "Delivery address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "ZIP code is required"),
    appointmentTime: z.string().optional(),
  }),
  commodity: z.string().min(1, "Commodity is required"),
  weight: z.number().min(1, "Weight is required"),
  pieces: z.number().min(1, "Number of pieces is required"),
  specialInstructions: z.string().optional(),
  customerRate: z.number().min(0, "Customer rate must be positive"),
  carrierRate: z.number().min(0, "Carrier rate must be positive"),
  fuelSurcharge: z.number().min(0).optional(),
  accessorials: z.array(z.object({
    description: z.string(),
    amount: z.number(),
  })).optional(),
  status: z.enum(["booked", "dispatched", "in_transit", "delivered", "invoiced", "paid"]),
});

type LoadFormData = z.infer<typeof loadSchema>;

export default function BrokerLoadsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLoad, setEditingLoad] = useState<any>(null);

  const form = useForm<LoadFormData>({
    resolver: zodResolver(loadSchema),
    defaultValues: {
      loadNumber: "",
      customerId: "",
      carrierId: "",
      pickupLocation: {
        name: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        appointmentTime: "",
      },
      deliveryLocation: {
        name: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        appointmentTime: "",
      },
      commodity: "",
      weight: 0,
      pieces: 1,
      specialInstructions: "",
      customerRate: 0,
      carrierRate: 0,
      fuelSurcharge: 0,
      accessorials: [],
      status: "booked",
    },
  });

  const { data: loads = [], isLoading: loadsLoading } = useQuery({
    queryKey: ["/api/broker/loads"],
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["/api/broker/customers"],
  });

  const { data: carriers = [] } = useQuery({
    queryKey: ["/api/broker/carriers"],
  });

  const createLoadMutation = useMutation({
    mutationFn: async (data: LoadFormData) => {
      const response = await apiRequest("POST", "/api/broker/loads", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/broker/loads"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Load created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateLoadMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<LoadFormData> }) => {
      const response = await apiRequest("PUT", `/api/broker/loads/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/broker/loads"] });
      setIsDialogOpen(false);
      setEditingLoad(null);
      form.reset();
      toast({
        title: "Success",
        description: "Load updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteLoadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/broker/loads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/broker/loads"] });
      toast({
        title: "Success",
        description: "Load deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoadFormData) => {
    if (editingLoad) {
      updateLoadMutation.mutate({ id: editingLoad.id, data });
    } else {
      createLoadMutation.mutate(data);
    }
  };

  const handleEdit = (load: any) => {
    setEditingLoad(load);
    form.reset({
      loadNumber: load.loadNumber,
      customerId: load.customerId,
      carrierId: load.carrierId,
      pickupLocation: load.pickupLocation || {
        name: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        appointmentTime: "",
      },
      deliveryLocation: load.deliveryLocation || {
        name: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        appointmentTime: "",
      },
      commodity: load.commodity || "",
      weight: load.weight || 0,
      pieces: load.pieces || 1,
      specialInstructions: load.specialInstructions || "",
      customerRate: load.customerRate || 0,
      carrierRate: load.carrierRate || 0,
      fuelSurcharge: load.fuelSurcharge || 0,
      accessorials: load.accessorials || [],
      status: load.status || "booked",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this load?")) {
      deleteLoadMutation.mutate(id);
    }
  };

  const filteredLoads = loads.filter((load: any) => {
    const matchesSearch = load.loadNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         load.commodity?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || load.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "booked": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "dispatched": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "in_transit": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
      case "delivered": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "invoiced": return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100";
      case "paid": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
    }
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c: any) => c.id === customerId);
    return customer?.customerName || "Unknown Customer";
  };

  const getCarrierName = (carrierId: string) => {
    const carrier = carriers.find((c: any) => c.id === carrierId);
    return carrier?.carrierName || "Unknown Carrier";
  };

  const calculateMargin = (customerRate: number, carrierRate: number) => {
    return customerRate - carrierRate;
  };

  const calculateMarginPercentage = (customerRate: number, carrierRate: number) => {
    if (customerRate === 0) return 0;
    return ((customerRate - carrierRate) / customerRate) * 100;
  };

  // Generate load number
  const generateLoadNumber = () => {
    const prefix = "LD";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, "0");
    return `${prefix}${timestamp}${random}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Load Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track and manage your freight shipments
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingLoad(null);
              form.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Load
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingLoad ? "Edit Load" : "Create New Load"}
                </DialogTitle>
                <DialogDescription>
                  {editingLoad 
                    ? "Update load information and tracking details"
                    : "Create a new load booking for shipment"
                  }
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Basic Load Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Load Information</h3>
                      
                      <FormField
                        control={form.control}
                        name="loadNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Load Number</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input placeholder="LD123456" {...field} />
                              </FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => field.onChange(generateLoadNumber())}
                              >
                                Generate
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select customer" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {customers.map((customer: any) => (
                                  <SelectItem key={customer.id} value={customer.id}>
                                    {customer.customerName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="carrierId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Carrier</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select carrier" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {carriers.map((carrier: any) => (
                                  <SelectItem key={carrier.id} value={carrier.id}>
                                    {carrier.carrierName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="commodity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Commodity</FormLabel>
                            <FormControl>
                              <Input placeholder="General Freight" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="weight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Weight (lbs)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  placeholder="45000" 
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="pieces"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pieces</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  placeholder="1" 
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="booked">Booked</SelectItem>
                                <SelectItem value="dispatched">Dispatched</SelectItem>
                                <SelectItem value="in_transit">In Transit</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="invoiced">Invoiced</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Pickup and Delivery */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Pickup Location</h3>
                      
                      <FormField
                        control={form.control}
                        name="pickupLocation.name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input placeholder="ABC Warehouse" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="pickupLocation.address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Industrial Blvd" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name="pickupLocation.city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="Atlanta" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="pickupLocation.state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input placeholder="GA" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name="pickupLocation.zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP Code</FormLabel>
                              <FormControl>
                                <Input placeholder="30309" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="pickupLocation.appointmentTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Appointment</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <h3 className="text-lg font-semibold pt-4">Delivery Location</h3>
                      
                      <FormField
                        control={form.control}
                        name="deliveryLocation.name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input placeholder="XYZ Distribution" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="deliveryLocation.address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="456 Commerce St" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name="deliveryLocation.city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="Nashville" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="deliveryLocation.state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input placeholder="TN" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name="deliveryLocation.zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP Code</FormLabel>
                              <FormControl>
                                <Input placeholder="37201" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="deliveryLocation.appointmentTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Appointment</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Financial Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Financial Details</h3>
                      
                      <FormField
                        control={form.control}
                        name="customerRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer Rate ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                step="0.01"
                                placeholder="2500.00" 
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="carrierRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Carrier Rate ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                step="0.01"
                                placeholder="2000.00" 
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fuelSurcharge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fuel Surcharge ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                step="0.01"
                                placeholder="150.00" 
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Margin Calculation</div>
                        <div className="font-semibold">
                          ${calculateMargin(form.watch("customerRate") || 0, form.watch("carrierRate") || 0).toFixed(2)}
                          <span className="text-sm text-gray-500 ml-2">
                            ({calculateMarginPercentage(form.watch("customerRate") || 0, form.watch("carrierRate") || 0).toFixed(1)}%)
                          </span>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="specialInstructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Special Instructions</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Special handling requirements, delivery notes, etc."
                                className="h-24"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingLoad(null);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createLoadMutation.isPending || updateLoadMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {editingLoad ? "Update Load" : "Create Load"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search loads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="dispatched">Dispatched</SelectItem>
              <SelectItem value="in_transit">In Transit</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="invoiced">Invoiced</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loads Grid */}
        {loadsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredLoads.length === 0 ? (
          <Card className="p-12 text-center">
            <Package2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No loads found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filter" 
                : "Get started by creating your first load"
              }
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create First Load
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLoads.map((load: any) => (
              <Card key={load.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{load.loadNumber}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        {load.commodity}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(load)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(load.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getStatusColor(load.status)}>
                      {load.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {load.weight?.toLocaleString()} lbs
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <div className="font-medium">{load.pickupLocation?.name}</div>
                        <div className="text-gray-500 text-xs">
                          {load.pickupLocation?.city}, {load.pickupLocation?.state}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-red-600" />
                      <div className="flex-1">
                        <div className="font-medium">{load.deliveryLocation?.name}</div>
                        <div className="text-gray-500 text-xs">
                          {load.deliveryLocation?.city}, {load.deliveryLocation?.state}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Customer</span>
                      <span className="font-medium">{getCustomerName(load.customerId)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Carrier</span>
                      <span className="font-medium">{getCarrierName(load.carrierId)}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Customer Rate:</span>
                        <div className="font-semibold text-green-600">
                          ${load.customerRate?.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Carrier Rate:</span>
                        <div className="font-semibold text-blue-600">
                          ${load.carrierRate?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Margin:</span>
                        <div className="text-right">
                          <div className="font-semibold text-purple-600">
                            ${calculateMargin(load.customerRate || 0, load.carrierRate || 0).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {calculateMarginPercentage(load.customerRate || 0, load.carrierRate || 0).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {load.milestones && load.milestones.length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Latest Update</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {load.milestones[load.milestones.length - 1]?.event}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}