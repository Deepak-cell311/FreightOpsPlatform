import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Receipt, 
  Calculator,
  FileText,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";

interface LoadBillingProps {
  loadId: string;
  loadNumber: string;
  customerName: string;
  onClose?: () => void;
}

export default function LoadBillingManagement({ loadId, loadNumber, customerName, onClose }: LoadBillingProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingAccessorial, setEditingAccessorial] = useState<any>(null);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [isCreateAccessorialOpen, setIsCreateAccessorialOpen] = useState(false);
  const [isCreateExpenseOpen, setIsCreateExpenseOpen] = useState(false);

  // Fetch load billing data
  const { data: billing, isLoading: billingLoading } = useQuery({
    queryKey: ["/api/load-billing", loadId],
    enabled: !!loadId,
  });

  // Fetch accessorials
  const { data: accessorials = [], isLoading: accessorialsLoading } = useQuery({
    queryKey: ["/api/load-accessorials", loadId],
    enabled: !!loadId,
  });

  // Fetch expenses
  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ["/api/load-expenses", loadId],
    enabled: !!loadId,
  });

  // Update billing mutation
  const updateBillingMutation = useMutation({
    mutationFn: async (billingData: any) => {
      return apiRequest("PUT", `/api/load-billing/${billing?.id}`, billingData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/load-billing", loadId] });
      toast({
        title: "Billing Updated",
        description: "Load billing information has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update billing information.",
        variant: "destructive",
      });
    },
  });

  // Create accessorial mutation
  const createAccessorialMutation = useMutation({
    mutationFn: async (accessorialData: any) => {
      return apiRequest("POST", "/api/load-accessorials", {
        ...accessorialData,
        loadId,
        billingId: billing?.id,
        companyId: user?.companyId,
        createdBy: user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/load-accessorials", loadId] });
      queryClient.invalidateQueries({ queryKey: ["/api/load-billing", loadId] });
      setIsCreateAccessorialOpen(false);
      toast({
        title: "Accessorial Added",
        description: "Accessorial charge has been added successfully.",
      });
    },
  });

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (expenseData: any) => {
      return apiRequest("POST", "/api/load-expenses", {
        ...expenseData,
        loadId,
        billingId: billing?.id,
        companyId: user?.companyId,
        createdBy: user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/load-expenses", loadId] });
      queryClient.invalidateQueries({ queryKey: ["/api/load-billing", loadId] });
      setIsCreateExpenseOpen(false);
      toast({
        title: "Expense Added",
        description: "Expense has been added successfully.",
      });
    },
  });

  // Delete accessorial mutation
  const deleteAccessorialMutation = useMutation({
    mutationFn: async (accessorialId: string) => {
      return apiRequest("DELETE", `/api/load-accessorials/${accessorialId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/load-accessorials", loadId] });
      queryClient.invalidateQueries({ queryKey: ["/api/load-billing", loadId] });
      toast({
        title: "Accessorial Deleted",
        description: "Accessorial charge has been removed.",
      });
    },
  });

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      return apiRequest("DELETE", `/api/load-expenses/${expenseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/load-expenses", loadId] });
      queryClient.invalidateQueries({ queryKey: ["/api/load-billing", loadId] });
      toast({
        title: "Expense Deleted",
        description: "Expense has been removed.",
      });
    },
  });

  // Calculate totals
  const calculateTotals = () => {
    const baseRate = parseFloat(billing?.baseRate || "0");
    const totalAccessorials = accessorials.reduce((sum: number, acc: any) => 
      sum + parseFloat(acc.amount || "0"), 0);
    const totalExpenses = expenses.reduce((sum: number, exp: any) => 
      sum + parseFloat(exp.amount || "0"), 0);
    const subtotal = baseRate + totalAccessorials;
    const total = subtotal + totalExpenses;

    return {
      baseRate,
      totalAccessorials,
      totalExpenses,
      subtotal,
      total,
    };
  };

  const totals = calculateTotals();

  const getBillingStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: Clock, text: "Pending" },
      invoiced: { variant: "default" as const, icon: FileText, text: "Invoiced" },
      paid: { variant: "default" as const, icon: CheckCircle, text: "Paid" },
      disputed: { variant: "destructive" as const, icon: AlertCircle, text: "Disputed" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  if (billingLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Load Billing Management</h2>
          <p className="text-gray-600">
            Load #{loadNumber} • {customerName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {billing && getBillingStatusBadge(billing.billingStatus)}
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Billing Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Billing Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <DollarSign className="h-6 w-6 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                ${totals.baseRate.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Base Rate</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-6 w-6 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold text-green-600">
                ${totals.totalAccessorials.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Accessorials</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <Receipt className="h-6 w-6 mx-auto text-red-600 mb-2" />
              <div className="text-2xl font-bold text-red-600">
                ${totals.totalExpenses.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Expenses</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <CreditCard className="h-6 w-6 mx-auto text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                ${totals.total.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Details Tabs */}
      <Tabs defaultValue="billing" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="billing">Billing Info</TabsTrigger>
          <TabsTrigger value="accessorials">Accessorials ({accessorials.length})</TabsTrigger>
          <TabsTrigger value="expenses">Expenses ({expenses.length})</TabsTrigger>
        </TabsList>

        {/* Billing Information Tab */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>
                Manage base rate and billing details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="baseRate">Base Rate</Label>
                  <Input
                    id="baseRate"
                    type="number"
                    step="0.01"
                    defaultValue={billing?.baseRate || "0"}
                    onChange={(e) => {
                      // Auto-save on change
                      updateBillingMutation.mutate({
                        baseRate: parseFloat(e.target.value),
                      });
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="rateType">Rate Type</Label>
                  <Select
                    defaultValue={billing?.rateType || "flat"}
                    onValueChange={(value) => {
                      updateBillingMutation.mutate({ rateType: value });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat">Flat Rate</SelectItem>
                      <SelectItem value="per_mile">Per Mile</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="customerTerms">Payment Terms</Label>
                  <Select
                    defaultValue={billing?.customerTerms || "NET30"}
                    onValueChange={(value) => {
                      updateBillingMutation.mutate({ customerTerms: value });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COD">COD</SelectItem>
                      <SelectItem value="NET15">NET 15</SelectItem>
                      <SelectItem value="NET30">NET 30</SelectItem>
                      <SelectItem value="NET45">NET 45</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="billingStatus">Billing Status</Label>
                  <Select
                    defaultValue={billing?.billingStatus || "pending"}
                    onValueChange={(value) => {
                      updateBillingMutation.mutate({ billingStatus: value });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="invoiced">Invoiced</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="disputed">Disputed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="billingNotes">Billing Notes</Label>
                <Textarea
                  id="billingNotes"
                  placeholder="Add billing notes..."
                  defaultValue={billing?.billingNotes || ""}
                  onBlur={(e) => {
                    updateBillingMutation.mutate({ billingNotes: e.target.value });
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accessorials Tab */}
        <TabsContent value="accessorials">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Accessorial Charges</CardTitle>
                  <CardDescription>
                    Additional charges for special services
                  </CardDescription>
                </div>
                <Dialog open={isCreateAccessorialOpen} onOpenChange={setIsCreateAccessorialOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Accessorial
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Accessorial Charge</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target as HTMLFormElement);
                        createAccessorialMutation.mutate({
                          type: formData.get("type"),
                          description: formData.get("description"),
                          amount: parseFloat(formData.get("amount") as string),
                          isBillable: formData.get("isBillable") === "on",
                        });
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select name="type" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select accessorial type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="detention">Detention</SelectItem>
                            <SelectItem value="layover">Layover</SelectItem>
                            <SelectItem value="fuel_surcharge">Fuel Surcharge</SelectItem>
                            <SelectItem value="lumper">Lumper Fee</SelectItem>
                            <SelectItem value="tarp">Tarp Fee</SelectItem>
                            <SelectItem value="oversize_permit">Oversize Permit</SelectItem>
                            <SelectItem value="storage">Storage</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Input name="description" required placeholder="Describe the accessorial charge" />
                      </div>
                      <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input name="amount" type="number" step="0.01" required placeholder="0.00" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isBillable"
                          name="isBillable"
                          defaultChecked
                          className="rounded"
                        />
                        <Label htmlFor="isBillable">Billable to customer</Label>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateAccessorialOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createAccessorialMutation.isPending}>
                          Add Accessorial
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {accessorialsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : accessorials.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No accessorial charges added yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Billable</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessorials.map((accessorial: any) => (
                      <TableRow key={accessorial.id}>
                        <TableCell className="font-medium">
                          {accessorial.type?.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </TableCell>
                        <TableCell>{accessorial.description}</TableCell>
                        <TableCell>${parseFloat(accessorial.amount || "0").toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={accessorial.isBillable ? "default" : "secondary"}>
                            {accessorial.isBillable ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingAccessorial(accessorial)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteAccessorialMutation.mutate(accessorial.id)}
                              disabled={deleteAccessorialMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Load Expenses</CardTitle>
                  <CardDescription>
                    Track expenses related to this load
                  </CardDescription>
                </div>
                <Dialog open={isCreateExpenseOpen} onOpenChange={setIsCreateExpenseOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Expense
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Load Expense</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target as HTMLFormElement);
                        createExpenseMutation.mutate({
                          category: formData.get("category"),
                          description: formData.get("description"),
                          amount: parseFloat(formData.get("amount") as string),
                          vendor: formData.get("vendor"),
                          receiptNumber: formData.get("receiptNumber"),
                        });
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select name="category" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select expense category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fuel">Fuel</SelectItem>
                            <SelectItem value="tolls">Tolls</SelectItem>
                            <SelectItem value="permits">Permits</SelectItem>
                            <SelectItem value="repairs">Repairs</SelectItem>
                            <SelectItem value="driver_pay">Driver Pay</SelectItem>
                            <SelectItem value="lumper">Lumper</SelectItem>
                            <SelectItem value="parking">Parking</SelectItem>
                            <SelectItem value="meals">Meals</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Input name="description" required placeholder="Describe the expense" />
                      </div>
                      <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input name="amount" type="number" step="0.01" required placeholder="0.00" />
                      </div>
                      <div>
                        <Label htmlFor="vendor">Vendor</Label>
                        <Input name="vendor" placeholder="Vendor/Company name" />
                      </div>
                      <div>
                        <Label htmlFor="receiptNumber">Receipt Number</Label>
                        <Input name="receiptNumber" placeholder="Receipt or reference number" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateExpenseOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createExpenseMutation.isPending}>
                          Add Expense
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {expensesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No expenses recorded yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Receipt #</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense: any) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">
                          {expense.category?.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>${parseFloat(expense.amount || "0").toFixed(2)}</TableCell>
                        <TableCell>{expense.vendor || "-"}</TableCell>
                        <TableCell>{expense.receiptNumber || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingExpense(expense)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteExpenseMutation.mutate(expense.id)}
                              disabled={deleteExpenseMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}