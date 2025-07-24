import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building, Users, Truck, Package, Phone, Mail, MapPin, Calendar, Activity } from "lucide-react";
import { Link } from "wouter";

export default function HQTenantProfile() {
  const [match, params] = useRoute("/hq/customers/:companyId");
  const companyId = params?.companyId;

  const { data: tenantProfile, isLoading } = useQuery({
    queryKey: ["/api/hq/customers", companyId],
    enabled: !!companyId,
  });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!tenantProfile) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Tenant not found</h2>
          <p className="text-gray-600 mt-2">The requested tenant profile could not be found.</p>
          <Link href="/hq">
            <Button className="mt-4">Return to HQ Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const company = tenantProfile;
  const users = tenantProfile.users || [];
  const operations = tenantProfile.operations || {};
  const compliance = tenantProfile.compliance || {};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <Link href="/hq">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to HQ Dashboard
          </Button>
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
            <div className="flex items-center space-x-4 mt-2 text-gray-600">
              <span className="flex items-center">
                <Building className="h-4 w-4 mr-1" />
                DOT {company.dotNumber}
              </span>
              <span className="flex items-center">
                <Package className="h-4 w-4 mr-1" />
                {company.mcNumber}
              </span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Active
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Legal Name</label>
                  <p className="text-gray-900 font-medium">{company.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {company.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900 flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {company.phone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">DOT Number</label>
                  <p className="text-gray-900 font-mono">{company.dotNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">MC Number</label>
                  <p className="text-gray-900 font-mono">{company.mcNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Registration Date</label>
                  <p className="text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(company.registrationDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-gray-500">Physical Address</label>
                <p className="text-gray-900 flex items-start mt-1">
                  <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                  {company.address || 'Not provided'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Users ({users?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users?.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        Joined {new Date(user.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Operations Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Operations Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Truck className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-blue-700">{operations?.totalTrucks || 0}</p>
                  <p className="text-sm text-blue-600">Trucks</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Users className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-green-700">{operations?.totalDrivers || 0}</p>
                  <p className="text-sm text-green-600">Drivers</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <Package className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-orange-700">{operations?.totalLoads || 0}</p>
                  <p className="text-sm text-orange-600">Total Loads</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Activity className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-purple-700">{operations?.activeLoads || 0}</p>
                  <p className="text-sm text-purple-600">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Status */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">DOT Status</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {compliance?.dotStatus || 'Active'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">MC Status</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {compliance?.mcStatus || 'Active'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Insurance</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {compliance?.insuranceStatus || 'Current'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Safety Rating</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {compliance?.safetyRating || 'Satisfactory'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Last Activity</label>
                <p className="text-gray-900 text-sm">
                  {new Date(company.lastUpdated).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Account Status</label>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 ml-2">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}