import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, CheckCircle, Clock, FileText, Users } from "lucide-react";
import { TruckingLoadingSkeleton } from "@/components/trucking-loading-skeleton";

interface ComplianceData {
  overallScore: number;
  dotCompliance: number;
  driverCompliance: number;
  vehicleCompliance: number;
  hoursCompliance: number;
  violations: number;
  expiringSoon: number;
}

export default function ComplianceManagement() {
  const { data: complianceData, isLoading } = useQuery<ComplianceData>({
    queryKey: ["/api/operations/compliance"],
    // Real compliance data from API
    retry: false,
  });

  if (isLoading) {
    return <TruckingLoadingSkeleton variant="load" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compliance Management</h1>
          <p className="text-muted-foreground">DOT compliance and safety management</p>
        </div>
        <Button>
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Compliance Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Overall Compliance Score
          </CardTitle>
          <CardDescription>Current compliance status across all categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">{complianceData?.overallScore || 0}%</div>
              <p className="text-muted-foreground">Excellent compliance rating</p>
            </div>
            <Progress value={complianceData?.overallScore || 0} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DOT Compliance</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceData?.dotCompliance || 0}%</div>
            <Progress value={complianceData?.dotCompliance || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Driver Compliance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceData?.driverCompliance || 0}%</div>
            <Progress value={complianceData?.driverCompliance || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehicle Compliance</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceData?.vehicleCompliance || 0}%</div>
            <Progress value={complianceData?.vehicleCompliance || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Compliance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceData?.hoursCompliance || 0}%</div>
            <Progress value={complianceData?.hoursCompliance || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Active Violations
            </CardTitle>
            <CardDescription>Issues requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div>
                  <div className="font-medium text-red-800">HOS Violation - Driver 001</div>
                  <div className="text-sm text-red-600">Exceeded 11-hour driving limit</div>
                </div>
                <Badge variant="destructive">Critical</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div>
                  <div className="font-medium text-amber-800">Inspection Due - Truck 015</div>
                  <div className="text-sm text-amber-600">Annual inspection overdue by 3 days</div>
                </div>
                <Badge variant="secondary">Warning</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Expiring Soon
            </CardTitle>
            <CardDescription>Documents and certifications expiring within 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <div className="font-medium">CDL License - John Smith</div>
                  <div className="text-sm text-muted-foreground">Expires in 15 days</div>
                </div>
                <Button size="sm" variant="outline">Renew</Button>
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <div className="font-medium">DOT Registration</div>
                  <div className="text-sm text-muted-foreground">Expires in 22 days</div>
                </div>
                <Button size="sm" variant="outline">Renew</Button>
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Drug Test - Sarah Johnson</div>
                  <div className="text-sm text-muted-foreground">Due in 8 days</div>
                </div>
                <Button size="sm" variant="outline">Schedule</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Compliance Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Compliance Activities</CardTitle>
          <CardDescription>Latest compliance-related actions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <div className="font-medium">Vehicle Inspection Completed</div>
                <div className="text-sm text-muted-foreground">Truck 012 - Annual DOT inspection passed</div>
              </div>
              <div className="text-sm text-muted-foreground">2 hours ago</div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <div className="font-medium">Driver Training Completed</div>
                <div className="text-sm text-muted-foreground">Mike Wilson - Hazmat certification renewed</div>
              </div>
              <div className="text-sm text-muted-foreground">1 day ago</div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <div className="font-medium">Compliance Report Generated</div>
                <div className="text-sm text-muted-foreground">Monthly DOT compliance summary</div>
              </div>
              <div className="text-sm text-muted-foreground">3 days ago</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}