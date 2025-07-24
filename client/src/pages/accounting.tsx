import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Building2, 
  Users, 
  Package, 
  Truck, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Settings,
  ExternalLink
} from "lucide-react";

export default function Accounting() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get QuickBooks connection status
  const { data: qbStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/quickbooks/status"],
    retry: false,
  });

  // Get QuickBooks accounts
  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ["/api/quickbooks/accounts"],
    enabled: qbStatus?.connected,
  });

  // Get QuickBooks customers
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ["/api/quickbooks/customers"],
    enabled: qbStatus?.connected,
  });

  // Get QuickBooks vendors
  const { data: vendors = [], isLoading: vendorsLoading } = useQuery({
    queryKey: ["/api/quickbooks/vendors"],
    enabled: qbStatus?.connected,
  });

  // Get QuickBooks items
  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["/api/quickbooks/items"],
    enabled: qbStatus?.connected,
  });

  // Connect to QuickBooks mutation
  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/quickbooks/auth");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.authUrl) {
        window.open(data.authUrl, "_blank");
        toast({
          title: "QuickBooks Authorization",
          description: "Complete the authorization in the new window.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Connection Error",
        description: error.message || "Failed to initiate QuickBooks connection",
        variant: "destructive",
      });
    },
  });

  // Sync data mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/quickbooks/sync");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sync Complete",
        description: "QuickBooks data has been synchronized successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quickbooks"] });
    },
    onError: (error: any) => {
      toast({
        title: "Sync Error",
        description: error.message || "Failed to sync QuickBooks data",
        variant: "destructive",
      });
    },
  });

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/quickbooks/connection");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Disconnected",
        description: "QuickBooks has been disconnected successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quickbooks"] });
    },
    onError: (error: any) => {
      toast({
        title: "Disconnect Error",
        description: error.message || "Failed to disconnect QuickBooks",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = () => {
    if (!qbStatus?.configured) {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
    if (qbStatus?.connected) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusText = () => {
    if (!qbStatus?.configured) {
      return "Not Configured";
    }
    if (qbStatus?.connected) {
      return "Connected";
    }
    return "Disconnected";
  };

  const getStatusColor = () => {
    if (!qbStatus?.configured) {
      return "yellow";
    }
    if (qbStatus?.connected) {
      return "green";
    }
    return "red";
  };

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounting Integration</h1>
          <p className="text-muted-foreground">
            Connect and manage your QuickBooks accounting data
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <Badge variant={getStatusColor() as any}>{getStatusText()}</Badge>
        </div>
      </div>

      {/* Configuration Status */}
      {!qbStatus?.configured && (
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription>
            QuickBooks integration requires API credentials to be configured. Contact your system administrator to set up QB_CLIENT_ID and QB_CLIENT_SECRET environment variables.
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            QuickBooks Connection
          </CardTitle>
          <CardDescription>
            Manage your QuickBooks Online integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {qbStatus?.connected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{qbStatus.companyName}</p>
                  <p className="text-sm text-muted-foreground">
                    Last synced: {qbStatus.lastSyncAt ? new Date(qbStatus.lastSyncAt).toLocaleDateString() : 'Never'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => syncMutation.mutate()}
                    disabled={syncMutation.isPending}
                    variant="outline"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                    Sync Now
                  </Button>
                  <Button
                    onClick={() => disconnectMutation.mutate()}
                    disabled={disconnectMutation.isPending}
                    variant="destructive"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
              
              {/* Sync Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{qbStatus.syncCounts?.accounts || 0}</div>
                  <div className="text-sm text-muted-foreground">Accounts</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{qbStatus.syncCounts?.customers || 0}</div>
                  <div className="text-sm text-muted-foreground">Customers</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{qbStatus.syncCounts?.vendors || 0}</div>
                  <div className="text-sm text-muted-foreground">Vendors</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{qbStatus.syncCounts?.items || 0}</div>
                  <div className="text-sm text-muted-foreground">Items</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Connect QuickBooks Online</h3>
              <p className="text-muted-foreground mb-4">
                {qbStatus?.configured 
                  ? "Sync your accounting data with QuickBooks Online to streamline your financial management."
                  : "QuickBooks integration is not configured. Please contact your administrator to set up the necessary credentials."
                }
              </p>
              {qbStatus?.configured && (
                <Button
                  onClick={() => connectMutation.mutate()}
                  disabled={connectMutation.isPending}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect QuickBooks
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Overview */}
      {qbStatus?.connected && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Chart of Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Chart of Accounts
              </CardTitle>
              <CardDescription>
                {accountsLoading ? "Loading..." : `${accounts.length} accounts synchronized`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {accountsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : accounts.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {accounts.slice(0, 5).map((account: any) => (
                    <div key={account.id} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="font-medium">{account.name}</span>
                      <Badge variant="outline">{account.accountType}</Badge>
                    </div>
                  ))}
                  {accounts.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      +{accounts.length - 5} more accounts
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No accounts found</p>
              )}
            </CardContent>
          </Card>

          {/* Customers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customers
              </CardTitle>
              <CardDescription>
                {customersLoading ? "Loading..." : `${customers.length} customers synchronized`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {customersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : customers.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {customers.slice(0, 5).map((customer: any) => (
                    <div key={customer.id} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="font-medium">{customer.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ${customer.balance || 0}
                      </span>
                    </div>
                  ))}
                  {customers.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      +{customers.length - 5} more customers
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No customers found</p>
              )}
            </CardContent>
          </Card>

          {/* Vendors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Vendors
              </CardTitle>
              <CardDescription>
                {vendorsLoading ? "Loading..." : `${vendors.length} vendors synchronized`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vendorsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : vendors.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {vendors.slice(0, 5).map((vendor: any) => (
                    <div key={vendor.id} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="font-medium">{vendor.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ${vendor.balance || 0}
                      </span>
                    </div>
                  ))}
                  {vendors.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      +{vendors.length - 5} more vendors
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No vendors found</p>
              )}
            </CardContent>
          </Card>

          {/* Items/Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Items & Services
              </CardTitle>
              <CardDescription>
                {itemsLoading ? "Loading..." : `${items.length} items synchronized`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {itemsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : items.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {items.slice(0, 5).map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="font-medium">{item.name}</span>
                      <div className="text-right">
                        <Badge variant="outline">{item.type}</Badge>
                        {item.unitPrice && (
                          <div className="text-sm text-muted-foreground">
                            ${item.unitPrice}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {items.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      +{items.length - 5} more items
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No items found</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}