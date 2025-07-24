import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  Plus, Search, MapPin, Calendar, DollarSign, Package, Weight, 
  Copy, Edit, Trash2, Calculator, Truck, Clock, AlertTriangle, 
  FileText, Upload, RefreshCw, Container, Ship, Train, 
  CheckCircle2, XCircle, AlertCircle
} from "lucide-react";

interface Load {
  id: string;
  loadNumber: string;
  customerName: string;
  pickupLocation: string;
  deliveryLocation: string;
  pickupDate: string;
  deliveryDate: string;
  status: string;
  commodity: string;
  weight: number;
  rate: string;
  priority: string;
}

export function ProfessionalLoadsTable() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isContainer, setIsContainer] = useState(false);
const [containerNumber, setContainerNumber] = useState("");
const [portOfLoading, setPortOfLoading] = useState("");
const [portOfDischarge, setPortOfDischarge] = useState("");
const [vesselName, setVesselName] = useState("");
const [customsClearanceRequired, setCustomsClearanceRequired] = useState(false);
const [chassisRequired, setChassisRequired] = useState(false);
const [railRouting, setRailRouting] = useState("");
const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedLoadForBilling, setSelectedLoadForBilling] = useState<Load | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLoad, setEditingLoad] = useState<Load | null>(null);
  
  // OCR state for rate confirmation upload
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [extractedLoadData, setExtractedLoadData] = useState<any>(null);
  
  // Bulk upload state
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkUploadData, setBulkUploadData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'manual' | 'ocr' | 'bulk'>('manual');

  // OCR rate confirmation upload handler
  const handleRateConfirmationUpload = async (file: File) => {
    setIsOCRProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('rateConfirmation', file);
      
      const response = await fetch('/api/loads/extract-from-rate-confirmation', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process rate confirmation');
      }
      
      const extractedData = await response.json();
      
      if (extractedData.success && extractedData.loadData) {
        setExtractedLoadData(extractedData.loadData);
        setActiveTab('manual');
        
        toast({
          title: "Rate Confirmation Processed",
          description: `Extracted load details successfully. Please review and submit.`,
        });
      } else {
        throw new Error(extractedData.error || 'Failed to extract data');
      }
    } catch (error: any) {
      console.error('OCR processing error:', error);
      toast({
        title: "OCR Processing Failed",
        description: error.message || "Could not extract data from rate confirmation",
        variant: "destructive",
      });
    } finally {
      setIsOCRProcessing(false);
    }
  };

  // Bulk spreadsheet upload handler
  const handleBulkSpreadsheetUpload = async (file: File) => {
    setIsBulkProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('spreadsheet', file);
      
      const response = await fetch('/api/loads/bulk-upload-spreadsheet', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process spreadsheet');
      }
      
      const bulkData = await response.json();
      
      if (bulkData.success && bulkData.loads) {
        setBulkUploadData(bulkData.loads);
        
        toast({
          title: "Spreadsheet Processed",
          description: `Extracted ${bulkData.loads.length} loads. Review and create all loads.`,
        });
      } else {
        throw new Error(bulkData.error || 'Failed to extract loads from spreadsheet');
      }
    } catch (error: any) {
      console.error('Bulk upload error:', error);
      toast({
        title: "Bulk Upload Failed",
        description: error.message || "Could not process spreadsheet",
        variant: "destructive",
      });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Create all bulk loads
  const handleCreateBulkLoads = async () => {
    try {
      const promises = bulkUploadData.map(loadData => 
        apiRequest("POST", "/api/loads", loadData)
      );
      
      await Promise.all(promises);
      
      queryClient.invalidateQueries({ queryKey: ["/api/loads"] });
      setIsCreateOpen(false);
      setBulkUploadData([]);
      
      toast({
        title: "Bulk Loads Created",
        description: `Successfully created ${bulkUploadData.length} loads.`,
      });
    } catch (error: any) {
      toast({
        title: "Bulk Creation Failed",
        description: error.message || "Failed to create some loads",
        variant: "destructive",
      });
    }
  };

  // Handle form submission for load creation
  const handleCreateLoad = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createLoadMutation.mutate(formData);
  };

  // Create load mutation
  const createLoadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const loadData = {
        loadNumber: formData.get("loadNumber") as string,
        customerName: formData.get("customerName") as string,
        pickupLocation: formData.get("pickupLocation") as string,
        deliveryLocation: formData.get("deliveryLocation") as string,
        pickupDate: formData.get("pickupDate") as string,
        deliveryDate: formData.get("deliveryDate") as string,
        commodity: formData.get("commodity") as string,
        weight: parseInt(formData.get("weight") as string) || 0,
        pieces: parseInt(formData.get("pieces") as string) || 1,
        rate: parseFloat(formData.get("rate") as string) || 0,
        specialInstructions: formData.get("specialInstructions") as string || "",
        status: "pending",
        priority: "normal"
      };
      
      const response = await apiRequest("POST", "/api/loads", loadData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loads"] });
      setIsCreateOpen(false);
      setExtractedLoadData(null);
      
      toast({
        title: "Load Created",
        description: "Load has been created successfully.",
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

  // Copy load mutation
  const copyLoadMutation = useMutation({
    mutationFn: async (load: Load) => {
      const response = await apiRequest("POST", "/api/loads", {
        ...load,
        id: undefined,
        loadNumber: `${load.loadNumber}-COPY`,
        status: "pending"
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loads"] });
      toast({
        title: "Load Copied",
        description: "Load has been copied successfully.",
      });
    },
  });

  // Delete load mutation
  const deleteLoadMutation = useMutation({
    mutationFn: async (loadId: string) => {
      const response = await apiRequest("DELETE", `/api/loads/${loadId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loads"] });
      toast({
        title: "Load Deleted",
        description: "Load has been deleted successfully.",
      });
    },
  });

  // Update load mutation
  const updateLoadMutation = useMutation({
    mutationFn: async (load: Load) => {
      const response = await apiRequest("PUT", `/api/loads/${load.id}`, load);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loads"] });
      setEditingLoad(null);
      toast({
        title: "Load Updated",
        description: "Load has been updated successfully.",
      });
    },
  });

  // Fetch loads
  const { data: loads = [], isLoading } = useQuery<Load[]>({
    queryKey: ["/api/loads"],
  });

  // Filter loads based on search and status
  const filteredLoads = loads.filter(load => {
    const matchesSearch = searchTerm === "" || 
      load.loadNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.pickupLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.deliveryLocation?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || load.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'secondary' as const },
      dispatched: { label: 'Dispatched', variant: 'default' as const },
      in_transit: { label: 'In Transit', variant: 'default' as const },
      delivered: { label: 'Delivered', variant: 'default' as const },
      cancelled: { label: 'Cancelled', variant: 'destructive' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRowColorClass = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-50';
      case 'in_transit': return 'bg-blue-50';
      case 'dispatched': return 'bg-purple-50';
      case 'cancelled': return 'bg-red-50';
      default: return 'bg-orange-50';
    }
  };

  if (isLoading) {
    return <div>Loading loads...</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader className="border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900">
            Shipment Overview
          </CardTitle>
          <div className="flex gap-2">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Load
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">Create New Load</DialogTitle>
                  <p className="text-sm text-gray-600">Choose your preferred method to create loads</p>
                </DialogHeader>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab('manual')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'manual'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Manual Entry
                    </button>
                    <button
                      onClick={() => setActiveTab('ocr')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'ocr'
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Upload Rate Confirmation
                    </button>
                    <button
                      onClick={() => setActiveTab('bulk')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'bulk'
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Bulk Upload Spreadsheet
                    </button>
                  </nav>
                </div>

                {/* OCR Success Message */}
                {extractedLoadData && activeTab === 'manual' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-900">Data extracted from rate confirmation</span>
                    </div>
                    <div className="text-sm text-green-800">
                      Form fields have been pre-populated. Please review and modify as needed.
                    </div>
                  </div>
                )}

                {/* Tab Content */}
                {activeTab === 'ocr' && (
                  <div className="space-y-4">
                    <div className="text-center p-8">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleRateConfirmationUpload(file);
                            }
                          }}
                          className="hidden"
                          id="rate-confirmation-upload"
                        />
                        <label htmlFor="rate-confirmation-upload" className="cursor-pointer">
                          <div className="flex flex-col items-center gap-4">
                            {isOCRProcessing ? (
                              <>
                                <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full"></div>
                                <div className="text-lg font-medium">Processing document...</div>
                                <div className="text-sm text-gray-500">Using AI to extract load details</div>
                              </>
                            ) : (
                              <>
                                <FileText className="h-12 w-12 text-gray-400" />
                                <div className="text-lg font-medium">Upload Rate Confirmation</div>
                                <div className="text-sm text-gray-500">PNG, JPG, PDF up to 10MB</div>
                                <div className="text-xs text-gray-400">AI will automatically extract load details</div>
                              </>
                            )}
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'bulk' && (
                  <div className="space-y-4">
                    {bulkUploadData.length === 0 ? (
                      <div className="text-center p-8">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                          <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleBulkSpreadsheetUpload(file);
                              }
                            }}
                            className="hidden"
                            id="bulk-spreadsheet-upload"
                          />
                          <label htmlFor="bulk-spreadsheet-upload" className="cursor-pointer">
                            <div className="flex flex-col items-center gap-4">
                              {isBulkProcessing ? (
                                <>
                                  <div className="animate-spin w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full"></div>
                                  <div className="text-lg font-medium">Processing spreadsheet...</div>
                                  <div className="text-sm text-gray-500">Converting rows to individual loads</div>
                                </>
                              ) : (
                                <>
                                  <Upload className="h-12 w-12 text-gray-400" />
                                  <div className="text-lg font-medium">Upload Load Spreadsheet</div>
                                  <div className="text-sm text-gray-500">Excel (.xlsx, .xls) or CSV files</div>
                                  <div className="text-xs text-gray-400">Each row will become a separate load</div>
                                </>
                              )}
                            </div>
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-900">
                              Spreadsheet processed successfully
                            </span>
                          </div>
                          <div className="text-sm text-green-800">
                            Found {bulkUploadData.length} loads in your spreadsheet. Review and create all loads.
                          </div>
                        </div>
                        
                        <div className="max-h-96 overflow-y-auto border rounded-lg">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="px-3 py-2 text-left">Load #</th>
                                <th className="px-3 py-2 text-left">Customer</th>
                                <th className="px-3 py-2 text-left">Origin</th>
                                <th className="px-3 py-2 text-left">Destination</th>
                                <th className="px-3 py-2 text-left">Rate</th>
                                <th className="px-3 py-2 text-left">Pickup Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {bulkUploadData.map((load, index) => (
                                <tr key={index} className="border-t">
                                  <td className="px-3 py-2">{load.loadNumber || `BULK-${index + 1}`}</td>
                                  <td className="px-3 py-2">{load.customerName || 'N/A'}</td>
                                  <td className="px-3 py-2">{load.pickupLocation || 'N/A'}</td>
                                  <td className="px-3 py-2">{load.deliveryLocation || 'N/A'}</td>
                                  <td className="px-3 py-2">${load.rate || '0'}</td>
                                  <td className="px-3 py-2">{load.pickupDate || 'N/A'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        <div className="flex justify-end gap-3 pt-4 border-t">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setBulkUploadData([])}
                          >
                            Reset
                          </Button>
                          <Button onClick={handleCreateBulkLoads}>
                            Create All {bulkUploadData.length} Loads
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Manual Entry Form */}
                {activeTab === 'manual' && (
                  <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isContainer) {
            // Optional container validation here
          }
          handleSubmit();
        }} onSubmit={handleCreateLoad} className="space-y-6">
                  {/* Basic Load Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Load Information
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium">Load Number *</label>
                        <Input 
                          name="loadNumber" 
                          required 
                          placeholder="e.g., FL-2024-001"
                          defaultValue={extractedLoadData?.loadNumber || ""}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Customer Name *</label>
                        <Input 
                          name="customerName" 
                          required 
                          placeholder="Customer company name"
                          defaultValue={extractedLoadData?.customerName || ""}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Rate *</label>
                        <Input 
                          name="rate" 
                          type="number" 
                          required 
                          placeholder="0.00"
                          defaultValue={extractedLoadData?.rate || ""}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pickup Information */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-green-600" />
                      Pickup Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Pickup Address *</label>
                        <Input 
                          name="pickupLocation" 
                          required 
                          placeholder="123 Main St, City, State ZIP"
                          defaultValue={extractedLoadData?.pickupAddress || ""}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Pickup Date *</label>
                        <Input 
                          name="pickupDate" 
                          type="date" 
                          required
                          defaultValue={extractedLoadData?.pickupDate || ""}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Information */}
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-red-600" />
                      Delivery Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Delivery Address *</label>
                        <Input 
                          name="deliveryLocation" 
                          required 
                          placeholder="456 Oak Ave, City, State ZIP"
                          defaultValue={extractedLoadData?.deliveryAddress || ""}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Delivery Date *</label>
                        <Input 
                          name="deliveryDate" 
                          type="date" 
                          required
                          defaultValue={extractedLoadData?.deliveryDate || ""}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cargo Information */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      Cargo Details
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium">Commodity *</label>
                        <Input 
                          name="commodity" 
                          required 
                          placeholder="General freight"
                          defaultValue={extractedLoadData?.commodity || "General Freight"}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Weight (lbs)</label>
                        <Input 
                          name="weight" 
                          type="number" 
                          placeholder="40000"
                          defaultValue={extractedLoadData?.weight || ""}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Pieces</label>
                        <Input 
                          name="pieces" 
                          type="number" 
                          placeholder="1"
                          defaultValue={extractedLoadData?.pieces || "1"}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  {extractedLoadData?.specialInstructions && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">Special Instructions</h3>
                      <textarea 
                        name="specialInstructions"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        rows={3}
                        defaultValue={extractedLoadData.specialInstructions}
                      />
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateOpen(false);
                        setExtractedLoadData(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createLoadMutation.isPending}>
                      {createLoadMutation.isPending ? "Creating..." : "Create Load"}
                    </Button>
                  </div>
                  
      {isContainer && (
        <>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Input type="text" placeholder="Container Number" value={containerNumber} onChange={e => setContainerNumber(e.target.value)} />
            <Input type="text" placeholder="Port of Loading" value={portOfLoading} onChange={e => setPortOfLoading(e.target.value)} />
            <Input type="text" placeholder="Port of Discharge" value={portOfDischarge} onChange={e => setPortOfDischarge(e.target.value)} />
            <Input type="text" placeholder="Vessel Name" value={vesselName} onChange={e => setVesselName(e.target.value)} />
            <label>
              <input type="checkbox" checked={chassisRequired} onChange={e => setChassisRequired(e.target.checked)} />
              Chassis Required
            </label>
            <label>
              <input type="checkbox" checked={customsClearanceRequired} onChange={e => setCustomsClearanceRequired(e.target.checked)} />
              Customs Clearance Required
            </label>
            <Input type="text" placeholder="Rail Routing" value={railRouting} onChange={e => setRailRouting(e.target.value)} />
          </div>
        </>
      )}
    </form>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Status Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-gray-900">{loads.length}</div>
            <div className="text-sm text-gray-500 mt-1">Total</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-orange-600">{loads.filter(l => l.status === 'pending').length}</div>
            <div className="text-sm text-gray-500 mt-1">Pending</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-blue-600">{loads.filter(l => l.status === 'in_transit').length}</div>
            <div className="text-sm text-gray-500 mt-1">In Transit</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-green-600">{loads.filter(l => l.status === 'delivered').length}</div>
            <div className="text-sm text-gray-500 mt-1">Delivered</div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="mt-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setSelectedStatus("all")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedStatus === "all"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All Loads ({loads.length})
            </button>
            <button
              onClick={() => setSelectedStatus("pending")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedStatus === "pending"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Pending ({loads.filter(l => l.status === 'pending').length})
            </button>
            <button
              onClick={() => setSelectedStatus("dispatched")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedStatus === "dispatched"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Dispatched ({loads.filter(l => l.status === 'dispatched').length})
            </button>
            <button
              onClick={() => setSelectedStatus("in_transit")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedStatus === "in_transit"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              In Transit ({loads.filter(l => l.status === 'in_transit').length})
            </button>
            <button
              onClick={() => setSelectedStatus("delivered")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedStatus === "delivered"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Delivered ({loads.filter(l => l.status === 'delivered').length})
            </button>
            <button
              onClick={() => setSelectedStatus("cancelled")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedStatus === "cancelled"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Cancelled ({loads.filter(l => l.status === 'cancelled').length})
            </button>
          </div>
        </div>

        {/* Search and Additional Filters */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search loads by number, customer, origin, destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-96"
            />
          </div>
          <div className="text-sm text-gray-500">
            Showing {filteredLoads.length} of {loads.length} loads
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Professional Table */}
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold text-gray-700">Load #</TableHead>
              <TableHead className="font-semibold text-gray-700">Customer</TableHead>
              <TableHead className="font-semibold text-gray-700">Origin</TableHead>
              <TableHead className="font-semibold text-gray-700">Destination</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
              <TableHead className="font-semibold text-gray-700">Commodity</TableHead>
              <TableHead className="font-semibold text-gray-700">Weight</TableHead>
              <TableHead className="font-semibold text-gray-700">Rate</TableHead>
              <TableHead className="font-semibold text-gray-700">Pickup Date</TableHead>
              <TableHead className="font-semibold text-gray-700">Delivery Date</TableHead>
              <TableHead className="font-semibold text-gray-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLoads.map((load) => (
              <TableRow 
                key={load.id} 
                className={`hover:shadow-sm transition-all duration-200 border-b border-gray-100 ${getRowColorClass(load.status || 'pending')}`}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-12 rounded-full ${
                      load.status === 'delivered' ? 'bg-green-500' :
                      load.status === 'in_transit' ? 'bg-purple-500' :
                      load.status === 'dispatched' ? 'bg-blue-500' :
                      load.status === 'cancelled' ? 'bg-red-500' :
                      'bg-orange-500'
                    }`}></div>
                    <div>
                      <button 
                        onClick={() => setLocation(`/load/${load.id}`)}
                        className="font-bold text-blue-600 text-lg hover:text-blue-800 underline hover:no-underline transition-colors"
                      >
                        {load.loadNumber}
                      </button>
                      <div className="text-xs text-gray-500 mt-1">
                        Load #{load.id?.slice(-6) || 'N/A'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-gray-900">{load.customerName || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="h-3 w-3 text-green-600" />
                    {load.pickupLocation}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="h-3 w-3 text-red-600" />
                    {load.deliveryLocation}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(load.status || 'pending')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Package className="h-3 w-3" />
                    {load.commodity || "General Freight"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Weight className="h-3 w-3" />
                    {load.weight?.toLocaleString() || 0} lbs
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 font-semibold text-green-600">
                    <DollarSign className="h-3 w-3" />
                    {formatCurrency(parseFloat(load.rate) || 0)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar className="h-3 w-3" />
                    {formatDate(load.pickupDate)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
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
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingLoad(load)}
                      title="Edit Load"
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLoadForBilling(load)}
                      title="Manage Billing"
                      className="h-8 w-8 p-0 bg-green-50 border-green-200 hover:bg-green-100"
                    >
                      <Calculator className="h-3 w-3 text-green-600" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteLoadMutation.mutate(load.id)}
                      title="Delete Load"
                      disabled={deleteLoadMutation.isPending}
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200"
                    >
                      <Trash2 className="h-3 w-3 hover:text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredLoads.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No loads found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}