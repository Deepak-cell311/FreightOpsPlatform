import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Truck, 
  Package, 
  ArrowRight,
  Clock,
  Save,
  X
} from "lucide-react";

interface DispatchAction {
  id: string;
  name: string;
  type: 'pickup' | 'delivery' | 'return' | 'fuel' | 'inspection' | 'custom';
  description: string;
  locationTemplate: string; // e.g., "{pickupLocation}", "{deliveryLocation}", "Terminal"
  isDefault: boolean;
  estimatedDuration: number; // minutes
  requiresSignature: boolean;
  requiresDocuments: boolean;
  order: number;
}

const actionTypes = [
  { value: 'pickup', label: 'Pick Up Load', icon: Package },
  { value: 'delivery', label: 'Deliver Load', icon: ArrowRight },
  { value: 'return', label: 'Return to Base', icon: Truck },
  { value: 'fuel', label: 'Fuel Stop', icon: Clock },
  { value: 'inspection', label: 'Inspection', icon: Clock },
  { value: 'custom', label: 'Custom Action', icon: MapPin }
];

export function DispatchActionsManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<DispatchAction | null>(null);
  const [newAction, setNewAction] = useState<Partial<DispatchAction>>({
    type: 'pickup',
    estimatedDuration: 30,
    requiresSignature: false,
    requiresDocuments: false,
    order: 1
  });

  // Get dispatch actions
  const { data: actions = [], isLoading } = useQuery({
    queryKey: ["/api/dispatch-actions", user?.companyId],
    queryFn: async () => {
      if (!user?.companyId) return [];
      const res = await apiRequest("GET", `/api/dispatch-actions/${user.companyId}`);
      return await res.json();
    },
    enabled: !!user?.companyId,
  });

  // Create dispatch action
  const createActionMutation = useMutation({
    mutationFn: async (actionData: Partial<DispatchAction>) => {
      if (!user?.companyId) throw new Error("No company ID");
      const res = await apiRequest("POST", `/api/dispatch-actions/${user.companyId}`, actionData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dispatch-actions", user?.companyId] });
      setIsCreateDialogOpen(false);
      setNewAction({
        type: 'pickup',
        estimatedDuration: 30,
        requiresSignature: false,
        requiresDocuments: false,
        order: 1
      });
      toast({
        title: "Action Created",
        description: "Dispatch action template created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create dispatch action",
        variant: "destructive",
      });
    },
  });

  // Update dispatch action
  const updateActionMutation = useMutation({
    mutationFn: async (actionData: DispatchAction) => {
      if (!user?.companyId) throw new Error("No company ID");
      const res = await apiRequest("PUT", `/api/dispatch-actions/${user.companyId}/${actionData.id}`, actionData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dispatch-actions", user?.companyId] });
      setEditingAction(null);
      toast({
        title: "Action Updated",
        description: "Dispatch action template updated successfully",
      });
    },
  });

  // Delete dispatch action
  const deleteActionMutation = useMutation({
    mutationFn: async (actionId: string) => {
      if (!user?.companyId) throw new Error("No company ID");
      const res = await apiRequest("DELETE", `/api/dispatch-actions/${user.companyId}/${actionId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dispatch-actions", user?.companyId] });
      toast({
        title: "Action Deleted",
        description: "Dispatch action template deleted successfully",
      });
    },
  });

  const handleCreateAction = () => {
    if (!newAction.name || !newAction.description || !newAction.locationTemplate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createActionMutation.mutate({
      ...newAction,
      order: actions.length + 1
    });
  };

  const handleUpdateAction = () => {
    if (!editingAction) return;
    updateActionMutation.mutate(editingAction);
  };

  const getActionIcon = (type: string) => {
    const actionType = actionTypes.find(at => at.value === type);
    return actionType?.icon || MapPin;
  };

  const getActionTypeLabel = (type: string) => {
    const actionType = actionTypes.find(at => at.value === type);
    return actionType?.label || 'Custom Action';
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
        <span className="text-sm text-gray-500">Loading dispatch actions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Action Templates</h3>
          <p className="text-sm text-gray-500">
            Create reusable dispatch actions that auto-populate when creating loads
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Action
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Dispatch Action</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="actionName">Action Name *</Label>
                <Input
                  id="actionName"
                  placeholder="e.g., Pick up from customer"
                  value={newAction.name || ""}
                  onChange={(e) => setNewAction(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="actionType">Action Type *</Label>
                <Select 
                  value={newAction.type} 
                  onValueChange={(value: any) => setNewAction(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {actionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  placeholder="Brief description of this action"
                  value={newAction.description || ""}
                  onChange={(e) => setNewAction(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="locationTemplate">Location Template *</Label>
                <Input
                  id="locationTemplate"
                  placeholder="{pickupLocation}, {deliveryLocation}, or fixed location"
                  value={newAction.locationTemplate || ""}
                  onChange={(e) => setNewAction(prev => ({ ...prev, locationTemplate: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {"{pickupLocation}"} or {"{deliveryLocation}"} for dynamic locations
                </p>
              </div>

              <div>
                <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={newAction.estimatedDuration || 30}
                  onChange={(e) => setNewAction(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) }))}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateAction}
                  disabled={createActionMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createActionMutation.isPending ? "Creating..." : "Create Action"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Default Actions Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">System Default Actions</h4>
              <p className="text-sm text-blue-700">
                When creating loads, the system automatically generates: Pick up from {"{pickupLocation}"}, 
                Deliver to {"{deliveryLocation}"}, and Return to terminal. You can add custom actions below.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions List */}
      <div className="space-y-3">
        {actions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No custom dispatch actions created yet.</p>
            <p className="text-sm">System will use default pickup, delivery, and return actions.</p>
          </div>
        ) : (
          actions
            .sort((a: DispatchAction, b: DispatchAction) => a.order - b.order)
            .map((action: DispatchAction) => {
              const ActionIcon = getActionIcon(action.type);
              return (
                <Card key={action.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <ActionIcon className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{action.name}</h4>
                            <Badge variant="outline">{getActionTypeLabel(action.type)}</Badge>
                            {action.isDefault && <Badge variant="secondary">Default</Badge>}
                          </div>
                          <p className="text-sm text-gray-600">{action.description}</p>
                          <p className="text-xs text-gray-500">
                            Location: {action.locationTemplate} • Duration: {action.estimatedDuration}min
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingAction(action)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteActionMutation.mutate(action.id)}
                          disabled={deleteActionMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
        )}
      </div>

      {/* Edit Dialog */}
      {editingAction && (
        <Dialog open={!!editingAction} onOpenChange={() => setEditingAction(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Dispatch Action</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editName">Action Name</Label>
                <Input
                  id="editName"
                  value={editingAction.name}
                  onChange={(e) => setEditingAction(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="editDescription">Description</Label>
                <Input
                  id="editDescription"
                  value={editingAction.description}
                  onChange={(e) => setEditingAction(prev => prev ? { ...prev, description: e.target.value } : null)}
                />
              </div>

              <div>
                <Label htmlFor="editLocation">Location Template</Label>
                <Input
                  id="editLocation"
                  value={editingAction.locationTemplate}
                  onChange={(e) => setEditingAction(prev => prev ? { ...prev, locationTemplate: e.target.value } : null)}
                />
              </div>

              <div>
                <Label htmlFor="editDuration">Duration (minutes)</Label>
                <Input
                  id="editDuration"
                  type="number"
                  value={editingAction.estimatedDuration}
                  onChange={(e) => setEditingAction(prev => prev ? { ...prev, estimatedDuration: parseInt(e.target.value) } : null)}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingAction(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateAction}
                  disabled={updateActionMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateActionMutation.isPending ? "Updating..." : "Update Action"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}