import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Truck, Plus, FileText, Wrench, ClipboardCheck, DollarSign, AlertTriangle, CheckCircle } from "lucide-react";
import { TruckingLoadingSkeleton } from "@/components/trucking-loading-skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const equipmentSchema = z.object({
  equipmentNumber: z.string().min(1, "Equipment number is required"),
  equipmentType: z.string().min(1, "Equipment type is required"),
  vinNumber: z.string().min(1, "VIN is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.string().min(4, "Year is required"),
  currentMileage: z.number().min(0),
  plateNumber: z.string().optional(),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

interface Equipment {
  id: string;
  equipmentNumber: string;
  equipmentType: string;
  vinNumber: string;
  make: string;
  model: string;
  year: string;
  currentMileage: number;
  plateNumber?: string;
  status: string;
  documentsComplete: boolean;
  registrationValid: boolean;
  insuranceValid: boolean;
  inspectionValid: boolean;
  createdAt: string;
}

const statusColors = {
  'available': 'bg-green-100 text-green-800',
  'in_use': 'bg-blue-100 text-blue-800',
  'maintenance': 'bg-yellow-100 text-yellow-800',
  'pending_documents': 'bg-red-100 text-red-800',
  'out_of_service': 'bg-gray-100 text-gray-800'
};

const equipmentTypes = [
  { value: 'tractor', label: 'Tractor' },
  { value: 'trailer', label: 'Trailer' },
  { value: 'straight_truck', label: 'Straight Truck' },
  { value: 'van', label: 'Van' },
  { value: 'reefer', label: 'Reefer' },
  { value: 'flatbed', label: 'Flatbed' },
  { value: 'container', label: 'Container' },
  { value: 'other', label: 'Other' }
];

export function EquipmentTable() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: equipment, isLoading } = useQuery({
    queryKey: ["/api/equipment"],
  });

  const createEquipmentMutation = useMutation({
    mutationFn: async (data: EquipmentFormData) => {
      return apiRequest("POST", "/api/equipment", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Equipment Created",
        description: "Equipment has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create equipment",
        variant: "destructive",
      });
    },
  });

  const form = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      equipmentNumber: "",
      equipmentType: "",
      vinNumber: "",
      make: "",
      model: "",
      year: "",
      currentMileage: 0,
      plateNumber: "",
    },
  });

  const onSubmit = (data: EquipmentFormData) => {
    createEquipmentMutation.mutate(data);
  };

  const getComplianceStatus = (eq: Equipment) => {
    if (eq.documentsComplete && eq.registrationValid && eq.insuranceValid && eq.inspectionValid) {
      return { icon: CheckCircle, color: "text-green-600", text: "Compliant" };
    } else {
      return { icon: AlertTriangle, color: "text-red-600", text: "Missing Documents" };
    }
  };

  if (isLoading) {
    return <TruckingLoadingSkeleton variant="fleet-status" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Equipment Management</h2>
          <p className="text-muted-foreground">
            Comprehensive fleet equipment with document tracking and compliance monitoring
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Equipment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Equipment</DialogTitle>
              <DialogDescription>
                Create a new equipment record with compliance tracking
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="equipmentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipment Number</FormLabel>
                      <FormControl>
                        <Input placeholder="TRK-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="equipmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipment Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select equipment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {equipmentTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
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
                  name="vinNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VIN Number</FormLabel>
                      <FormControl>
                        <Input placeholder="1HGBH41JXMN109186" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make</FormLabel>
                        <FormControl>
                          <Input placeholder="Freightliner" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input placeholder="Cascadia" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input placeholder="2023" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currentMileage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Mileage</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="plateNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plate Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC-1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createEquipmentMutation.isPending}>
                    {createEquipmentMutation.isPending ? "Creating..." : "Create Equipment"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipment #</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Vehicle Info</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Compliance</TableHead>
              <TableHead>Mileage</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipment?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <Truck className="h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No equipment found</p>
                    <p className="text-sm text-muted-foreground">
                      Add your first piece of equipment to get started
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              equipment?.map((eq: Equipment) => {
                const compliance = getComplianceStatus(eq);
                const ComplianceIcon = compliance.icon;
                
                return (
                  <TableRow key={eq.id}>
                    <TableCell className="font-medium">
                      {eq.equipmentNumber}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {equipmentTypes.find(t => t.value === eq.equipmentType)?.label || eq.equipmentType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{eq.year} {eq.make} {eq.model}</div>
                        <div className="text-muted-foreground">VIN: {eq.vinNumber}</div>
                        {eq.plateNumber && (
                          <div className="text-muted-foreground">Plate: {eq.plateNumber}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[eq.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
                        {eq.status?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <ComplianceIcon className={`h-4 w-4 ${compliance.color}`} />
                        <span className={`text-sm ${compliance.color}`}>
                          {compliance.text}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {eq.currentMileage?.toLocaleString() || 0} mi
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedEquipment(eq)}
                          title="View Documents"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Maintenance Records"
                        >
                          <Wrench className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="DVIR Reports"
                        >
                          <ClipboardCheck className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Expense Tracking"
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Equipment Profile Dialog */}
      {selectedEquipment && (
        <Dialog open={!!selectedEquipment} onOpenChange={() => setSelectedEquipment(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Equipment Profile: {selectedEquipment.equipmentNumber}</DialogTitle>
              <DialogDescription>
                Complete equipment information with documents, maintenance, and compliance tracking
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Equipment Details</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Type:</span> {selectedEquipment.equipmentType}</div>
                    <div><span className="font-medium">Make/Model:</span> {selectedEquipment.year} {selectedEquipment.make} {selectedEquipment.model}</div>
                    <div><span className="font-medium">VIN:</span> {selectedEquipment.vinNumber}</div>
                    <div><span className="font-medium">Current Mileage:</span> {selectedEquipment.currentMileage?.toLocaleString()} mi</div>
                    {selectedEquipment.plateNumber && (
                      <div><span className="font-medium">Plate:</span> {selectedEquipment.plateNumber}</div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Compliance Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {selectedEquipment.registrationValid ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">Registration</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedEquipment.insuranceValid ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">Insurance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedEquipment.inspectionValid ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">DOT Inspection</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Documents
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <Wrench className="h-4 w-4 mr-2" />
                      Maintenance
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <ClipboardCheck className="h-4 w-4 mr-2" />
                      DVIR
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Expenses
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Recent Activity</h3>
                  <div className="text-sm text-muted-foreground">
                    <p>Equipment created on {new Date(selectedEquipment.createdAt).toLocaleDateString()}</p>
                    <p>Status: {selectedEquipment.status.replace('_', ' ')}</p>
                    <p>Last updated: {new Date(selectedEquipment.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}