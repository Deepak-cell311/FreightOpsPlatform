import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  Building2, 
  Search, 
  Eye, 
  Settings,
  DollarSign,
  Users,
  Truck,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus
} from "lucide-react";
import { useState } from "react";

export default function HQTenantManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: companies, isLoading } = useQuery({
    queryKey: ["/api/hq/customers"],
    retry: false,
  });

  const { data: companyMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/hq/dashboard/metrics"],
    retry: false,
  });

  const suspendCompanyMutation = useMutation({
    mutationFn: async ({ companyId, reason }: { companyId: string; reason: string }) => {
      return apiRequest("PATCH", `/api/hq/companies/${companyId}/suspend`, { reason });
    },
    onSuccess: () => {
      toast({
        title: "Company Suspended",
        description: "Company has been suspended successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/hq/companies"] });
    },
    onError: (error: any) => {
      toast({
        title: "Suspension Failed",
        description: error.message || "Failed to suspend company",
        variant: "destructive",
      });
    },
  });

  const activateCompanyMutation = useMutation({
    mutationFn: async (companyId: string) => {
      return apiRequest("PATCH", `/api/hq/companies/${companyId}/activate`, {});
    },
    onSuccess: () => {
      toast({
        title: "Company Activated",
        description: "Company has been activated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/hq/companies"] });
    },
    onError: (error: any) => {
      toast({
        title: "Activation Failed",
        description: error.message || "Failed to activate company",
        variant: "destructive",
      });
    },
  });

  const handleSuspendCompany = (companyId: string, name: string) => {
    const reason = prompt(`Enter reason for suspending ${name}:`);
    if (reason) {
      suspendCompanyMutation.mutate({ companyId, reason });
    }
  };

  const handleActivateCompany = (companyId: string) => {
    activateCompanyMutation.mutate(companyId);
  };

  const filteredCompanies = companies?.filter((company: any) => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.dotNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.mcNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const activeCompanies = companies?.filter((company: any) => company.status === 'active') || [];
  const pendingCompanies = companies?.filter((company: any) => company.status === 'pending') || [];
  const suspendedCompanies = companies?.filter((company: any) => company.status === 'suspended') || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Company Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Companies</p>
                <p className="text-2xl font-bold text-gray-900">{companies?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{activeCompanies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCompanies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Suspended</p>
                <p className="text-2xl font-bold text-gray-900">{suspendedCompanies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Company Directory</span>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search companies by name, DOT, or MC number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Companies List */}
          <div className="space-y-4">
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map((company: any) => (
                <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Link href={`/hq/customers/${company.id}`}>
                          <h4 className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer hover:underline">
                            {company.name}
                          </h4>
                        </Link>
                        <Badge variant={
                          company.status === 'active' ? "secondary" : 
                          company.status === 'pending' ? "outline" : "destructive"
                        }>
                          {company.status}
                        </Badge>
                        {company.businessType && (
                          <Badge variant="outline" className="bg-gray-100">
                            {company.businessType}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                        {company.dotNumber && (
                          <Link href={`/hq/customers/${company.id}`}>
                            <span className="text-blue-600 hover:text-blue-800 cursor-pointer hover:underline">
                              DOT: {company.dotNumber}
                            </span>
                          </Link>
                        )}
                        {company.mcNumber && (
                          <Link href={`/hq/customers/${company.id}`}>
                            <span className="text-blue-600 hover:text-blue-800 cursor-pointer hover:underline">
                              MC: {company.mcNumber}
                            </span>
                          </Link>
                        )}
                        {company.address && (
                          <>
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{company.address}</span>
                          </>
                        )}
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Joined: {new Date(company.createdAt).toLocaleDateString()}</span>
                      </div>
                      {company.subscriptionStatus && (
                        <div className="flex items-center mt-2">
                          <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                          <span className="text-sm text-green-600 font-medium">
                            {company.subscriptionStatus}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                    
                    {company.status === 'active' ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSuspendCompany(company.id, company.name)}
                        disabled={suspendCompanyMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Suspend
                      </Button>
                    ) : company.status === 'suspended' ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleActivateCompany(company.id)}
                        disabled={activateCompanyMutation.isPending}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Activate
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleActivateCompany(company.id)}
                        disabled={activateCompanyMutation.isPending}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No companies found' : 'No companies available'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Try adjusting your search criteria.' : 'Companies will appear here as they register.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Company Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Carriers</span>
                <span className="text-sm text-gray-600">
                  {companies?.filter((c: any) => c.businessType === 'carrier').length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Brokers</span>
                <span className="text-sm text-gray-600">
                  {companies?.filter((c: any) => c.businessType === 'broker').length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Shippers</span>
                <span className="text-sm text-gray-600">
                  {companies?.filter((c: any) => c.businessType === 'shipper').length || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-800">New company registration</p>
                  <p className="text-sm text-green-600">FreightMax LLC - 2 hours ago</p>
                </div>
                <Badge variant="outline" className="text-green-700">
                  Registration
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-800">Company approved</p>
                  <p className="text-sm text-blue-600">TransGlobal Inc - 4 hours ago</p>
                </div>
                <Badge variant="outline" className="text-blue-700">
                  Approval
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-yellow-800">Document verification pending</p>
                  <p className="text-sm text-yellow-600">Swift Carriers - 6 hours ago</p>
                </div>
                <Badge variant="outline" className="text-yellow-700">
                  Verification
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}