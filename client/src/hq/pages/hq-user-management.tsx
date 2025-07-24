import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Search, 
  UserX, 
  UserCheck, 
  Building2, 
  Calendar,
  Shield,
  MoreVertical,
  Eye,
  AlertTriangle
} from "lucide-react";
import { useState } from "react";

export default function HQUserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/hq/users"],
    retry: false,
  });

  const suspendUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: number; reason: string }) => {
      return apiRequest("PATCH", `/api/hq/users/${userId}/suspend`, { reason });
    },
    onSuccess: () => {
      toast({
        title: "User Suspended",
        description: "User has been suspended successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/hq/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Suspension Failed",
        description: error.message || "Failed to suspend user",
        variant: "destructive",
      });
    },
  });

  const activateUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest("PATCH", `/api/hq/users/${userId}/activate`, {});
    },
    onSuccess: () => {
      toast({
        title: "User Activated",
        description: "User has been activated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/hq/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Activation Failed",
        description: error.message || "Failed to activate user",
        variant: "destructive",
      });
    },
  });

  const handleSuspendUser = (userId: number, email: string) => {
    const reason = prompt(`Enter reason for suspending ${email}:`);
    if (reason) {
      suspendUserMutation.mutate({ userId, reason });
    }
  };

  const handleActivateUser = (userId: number) => {
    activateUserMutation.mutate(userId);
  };

  const filteredUsers = users?.filter((user: any) => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const activeUsers = users?.filter((user: any) => user.isActive) || [];
  const suspendedUsers = users?.filter((user: any) => !user.isActive) || [];
  const hqAdmins = users?.filter((user: any) => 
    user.role === 'hq_admin' || user.role === 'platform_owner' || user.role === 'super_admin'
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{activeUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Suspended</p>
                <p className="text-2xl font-bold text-gray-900">{suspendedUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">HQ Admins</p>
                <p className="text-2xl font-bold text-gray-900">{hqAdmins.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users by email or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{user.email}</h4>
                        <Badge variant={user.isActive ? "secondary" : "destructive"}>
                          {user.isActive ? "Active" : "Suspended"}
                        </Badge>
                        {(user.role === 'hq_admin' || user.role === 'platform_owner' || user.role === 'super_admin') && (
                          <Badge variant="outline" className="bg-purple-100 text-purple-800">
                            <Shield className="h-3 w-3 mr-1" />
                            HQ Admin
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        {user.companyName && (
                          <>
                            <Building2 className="h-4 w-4 mr-1" />
                            <span className="mr-4">{user.companyName}</span>
                          </>
                        )}
                        {user.lastLoginAt && (
                          <>
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Last login: {new Date(user.lastLoginAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    
                    {user.isActive ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSuspendUser(user.id, user.email)}
                        disabled={suspendUserMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Suspend
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleActivateUser(user.id)}
                        disabled={activateUserMutation.isPending}
                        className="text-green-600 hover:text-green-700"
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Activate
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No users found' : 'No users available'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Try adjusting your search criteria.' : 'Users will appear here as they register.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Recent User Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium text-yellow-800">Multiple failed login attempts</p>
                <p className="text-sm text-yellow-600">user@example.com - 5 minutes ago</p>
              </div>
              <Badge variant="outline" className="text-yellow-700">
                Security Alert
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-800">New user registration</p>
                <p className="text-sm text-green-600">newuser@transport.com - 1 hour ago</p>
              </div>
              <Badge variant="outline" className="text-green-700">
                Registration
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}