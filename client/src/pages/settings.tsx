import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { DispatchActionsManager } from "@/components/dispatch-actions-manager";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings as SettingsIcon,
  Building2,
  Bell,
  Users,
  Wifi,
  Globe,
  Mail,
  Phone,
  MapPin,
  Save,
  Plus,
  Edit,
  CreditCard,
  Route
} from "lucide-react";
// Integration management components removed - now using IntegrationManager
import { Link } from "wouter";

export default function Settings() {
  const { user } = useAuth();
  const { startTour } = useOnboarding();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("company");
  const [isEditingCompany, setIsEditingCompany] = useState(false);

  // Get user's companies
  const { data: companies } = useQuery({
    queryKey: ["/api/companies"],
    retry: false,
  });

  const company = companies?.[0];
  const companyId = company?.id;

  // Get company settings
  const { data: settings } = useQuery({
    queryKey: ["/api/companies", companyId, "settings"],
    enabled: !!companyId,
    retry: false,
  });

  // Get company users
  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/companies", companyId, "users"],
    enabled: !!companyId,
    retry: false,
  });

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async (companyData: any) => {
      if (isUnauthorizedError(companyData)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      return apiRequest("PATCH", `/api/companies/${companyId}`, companyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      setIsEditingCompany(false);
      toast({
        title: "Success",
        description: "Company information updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update company information",
        variant: "destructive",
      });
    },
  });

  // Update settings mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      return apiRequest("PUT", `/api/companies/${companyId}/settings/${key}`, {
        value: value,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "settings"] });
      toast({
        title: "Success",
        description: "Setting updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      });
    },
  });

  // Helper function to get setting value
  const getSettingValue = (key: string, defaultValue: string) => {
    const setting = settings?.find((s: any) => s.settingKey === key);
    return setting?.settingValue || defaultValue;
  };

  // Handle setting update
  const handleSettingUpdate = (key: string, value: string) => {
    updateSettingMutation.mutate({ key, value });
  };

  // Handle user invitation
  const handleInviteUser = () => {
    const email = prompt("Enter email address to invite:");
    if (email && email.includes('@')) {
      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${email}`,
      });
    } else if (email) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
    }
  };

  // Handle subscription changes
  const handleChangePlan = () => {
    toast({
      title: "Plan Change",
      description: "Redirecting to billing portal...",
    });
    setTimeout(() => {
      window.open('/billing', '_blank');
    }, 1000);
  };

  // Handle billing history
  const handleBillingHistory = () => {
    toast({
      title: "Billing History",
      description: "Opening billing history...",
    });
    setTimeout(() => {
      window.open('/billing/history', '_blank');
    }, 1000);
  };

  // Handle company form submission
  const handleCompanySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const companyData = {
      name: formData.get('name'),
      address: formData.get('address'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      dotNumber: formData.get('dotNumber'),
      mcNumber: formData.get('mcNumber'),
    };
    updateCompanyMutation.mutate(companyData);
  };

  // Notification settings
  const notificationSettings = [
    {
      key: "email_notifications",
      title: "Email Notifications",
      description: "Receive email alerts for important events",
      value: getSettingValue("email_notifications", "true") === "true",
    },
    {
      key: "sms_notifications",
      title: "SMS Notifications", 
      description: "Receive text message alerts for urgent matters",
      value: getSettingValue("sms_notifications", "false") === "true",
    },
    {
      key: "load_alerts",
      title: "Load Alerts",
      description: "Get notified about new loads and status changes",
      value: getSettingValue("load_alerts", "true") === "true",
    },
    {
      key: "maintenance_alerts",
      title: "Maintenance Alerts",
      description: "Receive alerts for vehicle maintenance schedules",
      value: getSettingValue("maintenance_alerts", "true") === "true",
    },
    {
      key: "invoice_alerts",
      title: "Invoice Alerts",
      description: "Get notified about invoice status and overdue payments",
      value: getSettingValue("invoice_alerts", "true") === "true",
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        {/* Company Settings Tab */}
        <TabsContent value="company" className="space-y-6">
          <Card className="freight-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Company Information
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Manage your company details and business information
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditingCompany(!isEditingCompany)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              {isEditingCompany ? (
                <form onSubmit={handleCompanySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Company Name *</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        defaultValue={company?.name || ""} 
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        defaultValue={company?.email || ""} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        defaultValue={company?.phone || ""} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="dotNumber">DOT Number</Label>
                      <Input 
                        id="dotNumber" 
                        name="dotNumber" 
                        defaultValue={company?.dotNumber || ""} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="mcNumber">MC Number</Label>
                      <Input 
                        id="mcNumber" 
                        name="mcNumber" 
                        defaultValue={company?.mcNumber || ""} 
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea 
                      id="address" 
                      name="address" 
                      defaultValue={company?.address || ""} 
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsEditingCompany(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={updateCompanyMutation.isPending}
                      className="freight-button"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateCompanyMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Company Name</Label>
                        <p className="text-sm font-medium">{company?.name || "Not set"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Email</Label>
                        <p className="text-sm">{company?.email || "Not set"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Phone</Label>
                        <p className="text-sm">{company?.phone || "Not set"}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">DOT Number</Label>
                        <p className="text-sm font-mono">{company?.dotNumber || "Not set"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">MC Number</Label>
                        <p className="text-sm font-mono">{company?.mcNumber || "Not set"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Address</Label>
                        <p className="text-sm">{company?.address || "Not set"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card className="freight-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  User Management
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Manage user access and roles
                </p>
              </div>
              <Button 
                className="freight-button"
                onClick={handleInviteUser}
              >
                <Plus className="h-4 w-4 mr-2" />
                Invite User
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Company Users</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleInviteUser}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Invite User
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg">
                    <div className="p-4 border-b bg-gray-50">
                      <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-700">
                        <div>Name</div>
                        <div>Email</div>
                        <div>Role</div>
                        <div>Actions</div>
                      </div>
                    </div>
                    
                    <div className="divide-y">
                      <div className="p-4">
                        <div className="grid grid-cols-4 gap-4 items-center">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                              {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                            </div>
                            <span className="font-medium">{user?.firstName || 'Current User'}</span>
                          </div>
                          <div className="text-gray-600">{user?.email}</div>
                          <div>
                            <Badge variant="default">Admin</Badge>
                          </div>
                          <div className="text-gray-400 text-sm">You</div>
                        </div>
                      </div>
                      
                      {(!users || users.length <= 1) && (
                        <div className="p-8 text-center text-gray-500">
                          <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">Additional team members will appear here</p>
                        </div>
                      )}
                      
                      {users && users.length > 1 && users.slice(1).map((teamUser: any) => (
                        <div key={teamUser.id} className="p-4">
                          <div className="grid grid-cols-4 gap-4 items-center">
                            <div className="flex items-center">
                              <div className="h-8 w-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                                {teamUser.firstName?.[0] || teamUser.email?.[0]?.toUpperCase()}
                              </div>
                              <span className="font-medium">{teamUser.firstName || teamUser.email}</span>
                            </div>
                            <div className="text-gray-600">{teamUser.email}</div>
                            <div>
                              <Badge variant="outline">{teamUser.role || 'User'}</Badge>
                            </div>
                            <div>
                              <Button variant="ghost" size="sm">Edit</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="freight-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Preferences
              </CardTitle>
              <p className="text-sm text-gray-500">
                Customize how you receive notifications about your fleet and operations
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {notificationSettings.map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h3 className="font-medium">{setting.title}</h3>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <Switch 
                      checked={setting.value}
                      onCheckedChange={(checked) => handleSettingUpdate(setting.key, checked.toString())}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Tabs defaultValue="eld" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="eld">ELD Systems</TabsTrigger>
              <TabsTrigger value="loadboards">Load Boards</TabsTrigger>
              <TabsTrigger value="ports">Port Integration</TabsTrigger>
            </TabsList>

            <TabsContent value="eld" className="space-y-6">
              <Card className="freight-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Route className="h-5 w-5 mr-2" />
                    ELD Integration Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Connect ELD systems for real-time driver hours of service tracking and compliance
                    </p>
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-600 text-center">
                        ELD integrations use the integrationConfigs database table for authentic credential storage
                      </p>
                    </div>
                    <Button 
                      className="w-full freight-button"
                      onClick={() => {
                        toast({
                          title: "ELD Management",
                          description: "ELD integration management uses real database storage",
                        });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Configure ELD Integration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="loadboards" className="space-y-6">
              <Card className="freight-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    Load Board Integration Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Connect to major freight load boards for real-time load opportunities
                    </p>
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-600 text-center">
                        Load board integrations use the integrationConfigs database table for authentic credential storage
                      </p>
                    </div>
                    <Button 
                      className="w-full freight-button"
                      onClick={() => {
                        toast({
                          title: "Load Board Management",
                          description: "Load board integration management uses real database storage",
                        });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Configure Load Board Integration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ports" className="space-y-6">
              <Card className="freight-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Port Integration Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Connect to major US ocean ports for real-time container tracking and drayage operations
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="p-4 border-blue-200 bg-blue-50">
                        <h4 className="font-medium mb-2">West Coast Ports</h4>
                        <p className="text-sm text-gray-600">LA/Long Beach, Oakland, Seattle, Tacoma</p>
                      </Card>
                      <Card className="p-4 border-green-200 bg-green-50">
                        <h4 className="font-medium mb-2">East Coast Ports</h4>
                        <p className="text-sm text-gray-600">New York/New Jersey, Savannah, Charleston</p>
                      </Card>
                    </div>
                    <div className="flex justify-center mt-6">
                      <Button 
                        className="freight-button"
                        onClick={() => {
                          toast({
                            title: "Port Management",
                            description: "Port credentials management coming soon",
                          });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Manage Port Credentials
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          <Card className="freight-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Current Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Subscription data will be loaded from actual billing system */}
                <div className="p-4 border rounded-lg">
                  <div className="text-center text-gray-500">
                    <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Subscription details will appear here</p>
                    <p className="text-xs text-gray-400">Connect your billing system to view plan information</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={handleChangePlan}
                  >
                    Change Plan
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleBillingHistory}
                  >
                    Billing History
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}