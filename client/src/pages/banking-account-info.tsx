import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, CreditCard, Shield, Phone, Mail, MapPin, Edit, Copy, CheckCircle, AlertCircle } from "lucide-react";

export default function BankingAccountInfo() {
  // Fetch real account information from API
  const { data: accountInfo } = useQuery({
    queryKey: ["/api/banking/account-info"],
    retry: false,
  });

  const { data: businessProfile } = useQuery({
    queryKey: ["/api/banking/business-profile"],
    retry: false,
  });

  return (
    <div className="w-full min-h-full px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Information</h1>
          <p className="text-gray-600">Manage your account details and banking information</p>
        </div>

        <Tabs defaultValue="account-details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account-details" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Account Details
            </TabsTrigger>
            <TabsTrigger value="routing-info" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Routing Info
            </TabsTrigger>
            <TabsTrigger value="business-profile" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Business Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account-details" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Account Status</CardTitle>
                  <p className="text-sm text-gray-600">Current status and verification level</p>
                </div>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Account Type</Label>
                    <div className="text-gray-900 font-medium">Business Checking</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Account Opened</Label>
                    <div className="text-gray-900">November 15, 2024</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Business Name</Label>
                    <div className="text-gray-900 font-medium">FreightOps Transportation LLC</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">EIN</Label>
                    <div className="text-gray-900 font-mono">••-•••7890</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Contact Information</CardTitle>
                  <p className="text-sm text-gray-600">Primary contact details for your account</p>
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Primary Email</Label>
                        <div className="text-gray-900">admin@freightops.com</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                        <div className="text-gray-900">(555) 123-4567</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Business Address</Label>
                      <div className="text-gray-900">
                        <div>1234 Logistics Way</div>
                        <div>Suite 100</div>
                        <div>Trucking City, TX 75001</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="routing-info" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  Banking Information
                </CardTitle>
                <p className="text-sm text-gray-600">Use this information for ACH transfers and wire transfers</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Routing Number</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="text-gray-900 font-mono text-lg">211274450</div>
                        <Button variant="ghost" size="sm" className="p-1">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Account Number</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="text-gray-900 font-mono text-lg">1234567890123456</div>
                        <Button variant="ghost" size="sm" className="p-1">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Bank Name</Label>
                      <div className="text-gray-900 font-medium">Novo Platform Inc</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Account Type</Label>
                      <div className="text-gray-900">Business Checking</div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Wire Transfer Information</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="font-medium text-blue-900">Beneficiary Bank</Label>
                        <div className="text-blue-800">Novo Platform Inc</div>
                      </div>
                      <div>
                        <Label className="font-medium text-blue-900">SWIFT Code</Label>
                        <div className="text-blue-800 font-mono">NOVOUS33</div>
                      </div>
                      <div>
                        <Label className="font-medium text-blue-900">Bank Address</Label>
                        <div className="text-blue-800">New York, NY 10001</div>
                      </div>
                      <div>
                        <Label className="font-medium text-blue-900">Reference Format</Label>
                        <div className="text-blue-800 font-mono">FreightOps-[PURPOSE]</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business-profile" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Business Profile</CardTitle>
                  <p className="text-sm text-gray-600">Information about your business operations</p>
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Industry</Label>
                    <div className="text-gray-900">Transportation & Logistics</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Business Structure</Label>
                    <div className="text-gray-900">Limited Liability Company (LLC)</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Annual Revenue</Label>
                    <div className="text-gray-900">{businessProfile?.annualRevenue || 'Not specified'}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Employees</Label>
                    <div className="text-gray-900">25-50</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Primary Service</Label>
                    <div className="text-gray-900">Long-haul Trucking</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Service Area</Label>
                    <div className="text-gray-900">48 Contiguous States</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
                <p className="text-sm text-gray-600">DOT and regulatory compliance information</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <Label className="text-sm font-medium text-gray-700">DOT Number</Label>
                      <div className="text-gray-900 font-mono">DOT-1234567</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <Label className="text-sm font-medium text-gray-700">MC Number</Label>
                      <div className="text-gray-900 font-mono">MC-987654</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Operating Authority</Label>
                      <div className="text-gray-900">Active</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Insurance Coverage</Label>
                      <div className="text-gray-900">{businessProfile?.insuranceCoverage || 'Not specified'}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Security Settings
                </CardTitle>
                <p className="text-sm text-gray-600">Manage your account security and authentication</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">Two-Factor Authentication</div>
                        <div className="text-sm text-gray-600">Enabled via SMS</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                      <div>
                        <div className="font-medium">Login Notifications</div>
                        <div className="text-sm text-gray-600">Email alerts for new device logins</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">Device Trust</div>
                        <div className="text-sm text-gray-600">Remember trusted devices for 30 days</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">Session Management</div>
                        <div className="text-sm text-gray-600">Auto-logout after 4 hours of inactivity</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Security Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <div className="font-medium text-sm">Successful login from Chrome on Mac</div>
                      <div className="text-xs text-gray-500">Today at 6:15 AM • IP: 192.168.1.100</div>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200">Success</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <div className="font-medium text-sm">Two-factor authentication verified</div>
                      <div className="text-xs text-gray-500">Yesterday at 9:30 PM</div>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200">Success</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <div className="font-medium text-sm">Password changed successfully</div>
                      <div className="text-xs text-gray-500">Dec 05, 2024 at 2:15 PM</div>
                    </div>
                    <Badge variant="outline" className="text-blue-600 border-blue-200">Updated</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}