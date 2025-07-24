import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Settings, Pause, Play, Edit, Users, Trash2, AlertTriangle } from 'lucide-react';
import { CollaborationButton } from '@/components/collaboration/CollaborationButton';
import { useToast } from '@/hooks/use-toast';

interface Tenant {
  id: string;
  companyId: string;
  tenantName: string;
  subscriptionTier: string;
  monthlyRevenue: number;
  userCount: number;
  lastActivity: string;
  healthScore: number;
  riskLevel: string;
  supportTier: string;
}

export function TenantManager() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingTenant, setDeletingTenant] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [confirmationInput, setConfirmationInput] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await fetch('/api/hq/tenants');
      if (response.ok) {
        const data = await response.json();
        setTenants(data);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTenant = async (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setDeleteDialogOpen(true);
    
    // Generate confirmation code
    try {
      const response = await fetch(`/api/hq/tenants/${tenant.companyId}/deletion-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConfirmationCode(data.confirmationCode);
      }
    } catch (error) {
      console.error('Error generating deletion code:', error);
      toast({
        title: "Error",
        description: "Failed to generate deletion code",
        variant: "destructive"
      });
    }
  };

  const confirmDeleteTenant = async () => {
    if (!selectedTenant || !confirmationCode) return;
    
    if (confirmationInput !== confirmationCode) {
      toast({
        title: "Invalid Code",
        description: "The confirmation code does not match",
        variant: "destructive"
      });
      return;
    }

    setDeletingTenant(selectedTenant.companyId);
    
    try {
      const response = await fetch(`/api/hq/tenants/${selectedTenant.companyId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationCode })
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Tenant Deleted",
          description: `${data.deletedTenant} has been completely removed`,
          variant: "default"
        });
        
        // Remove tenant from list
        setTenants(tenants.filter(t => t.companyId !== selectedTenant.companyId));
        setDeleteDialogOpen(false);
        setSelectedTenant(null);
        setConfirmationCode('');
        setConfirmationInput('');
      } else {
        const error = await response.json();
        toast({
          title: "Deletion Failed",
          description: error.error || "Failed to delete tenant",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting tenant:', error);
      toast({
        title: "Error",
        description: "Failed to delete tenant",
        variant: "destructive"
      });
    } finally {
      setDeletingTenant(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getSubscriptionBadge = (tier: string) => {
    const variants = {
      'starter': 'secondary',
      'professional': 'default',
      'enterprise': 'default'
    } as const;

    return (
      <Badge variant={variants[tier as keyof typeof variants] || 'secondary'}>
        {tier.toUpperCase()}
      </Badge>
    );
  };

  const getRiskBadge = (risk: string) => {
    const variants = {
      'low': 'default',
      'medium': 'secondary',
      'high': 'destructive'
    } as const;

    return (
      <Badge variant={variants[risk as keyof typeof variants] || 'secondary'}>
        {risk.toUpperCase()}
      </Badge>
    );
  };

  const filteredTenants = tenants.filter(tenant => 
    tenant.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.subscriptionTier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tenant Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Tenant Management</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search tenants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <CollaborationButton
              resourceType="tenant_management"
              resourceId="hq_tenant_overview"
              resourceName="Tenant Management Dashboard"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTenants.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No tenants found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Health Score</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">{tenant.tenantName}</TableCell>
                  <TableCell>{getSubscriptionBadge(tenant.subscriptionTier)}</TableCell>
                  <TableCell>{formatCurrency(tenant.monthlyRevenue || 0)}</TableCell>
                  <TableCell>{tenant.userCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${tenant.healthScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{tenant.healthScore}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{getRiskBadge(tenant.riskLevel)}</TableCell>
                  <TableCell>
                    {tenant.lastActivity ? 
                      new Date(tenant.lastActivity).toLocaleDateString() : 
                      'Never'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Pause className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteTenant(tenant)}
                        disabled={deletingTenant === tenant.companyId}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <CollaborationButton
                        resourceType="tenant"
                        resourceId={tenant.id}
                        resourceName={tenant.tenantName}
                        className="ml-2"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-600">Total Tenants</p>
            <p className="text-2xl font-bold text-blue-800">{tenants.length}</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-600">Total Revenue</p>
            <p className="text-2xl font-bold text-green-800">
              {formatCurrency(tenants.reduce((sum, t) => sum + (t.monthlyRevenue || 0), 0))}
            </p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-sm font-medium text-purple-600">Total Users</p>
            <p className="text-2xl font-bold text-purple-800">
              {tenants.reduce((sum, t) => sum + t.userCount, 0)}
            </p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className="text-sm font-medium text-orange-600">Avg Health Score</p>
            <p className="text-2xl font-bold text-orange-800">
              {Math.round(tenants.reduce((sum, t) => sum + t.healthScore, 0) / tenants.length || 0)}%
            </p>
          </div>
        </div>
      </CardContent>

      {/* Tenant Deletion Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Tenant: {selectedTenant?.tenantName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>WARNING:</strong> This action will permanently delete ALL tenant data including:
                <ul className="list-disc ml-4 mt-2">
                  <li>All users and their accounts</li>
                  <li>All drivers and fleet data</li>
                  <li>All loads and dispatch records</li>
                  <li>All financial records and accounting data</li>
                  <li>All audit logs and system data</li>
                </ul>
                <strong>This action cannot be undone!</strong>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Enter the confirmation code to proceed:
              </label>
              <div className="bg-gray-100 p-2 rounded text-sm font-mono break-all">
                {confirmationCode || 'Generating code...'}
              </div>
              <Input
                placeholder="Enter confirmation code"
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                className="font-mono"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setSelectedTenant(null);
                  setConfirmationCode('');
                  setConfirmationInput('');
                }}
                disabled={deletingTenant !== null}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDeleteTenant}
                disabled={!confirmationCode || !confirmationInput || deletingTenant !== null}
              >
                {deletingTenant ? 'Deleting...' : 'Delete Tenant'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}