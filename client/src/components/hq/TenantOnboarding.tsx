import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Mail, 
  Phone, 
  Calendar 
} from "lucide-react";

export function TenantOnboarding() {
  const onboardingQueue = [
    {
      id: 1,
      companyName: "Swift Logistics LLC",
      contactName: "John Smith",
      email: "john@swiftlogistics.com",
      phone: "+1 (555) 123-4567",
      stage: "Documentation Review",
      progress: 75,
      createdAt: "2025-01-08",
      priority: "high",
      status: "active"
    },
    {
      id: 2,
      companyName: "Mountain Transport Co",
      contactName: "Sarah Johnson",
      email: "sarah@mountaintransport.com",
      phone: "+1 (555) 234-5678",
      stage: "Account Setup",
      progress: 45,
      createdAt: "2025-01-07",
      priority: "medium",
      status: "pending"
    },
    {
      id: 3,
      companyName: "Coastal Freight Services",
      contactName: "Mike Wilson",
      email: "mike@coastalfreight.com",
      phone: "+1 (555) 345-6789",
      stage: "Banking Integration",
      progress: 90,
      createdAt: "2025-01-06",
      priority: "high",
      status: "active"
    },
    {
      id: 4,
      companyName: "Desert Haul Partners",
      contactName: "Lisa Davis",
      email: "lisa@deserthaul.com",
      phone: "+1 (555) 456-7890",
      stage: "Initial Contact",
      progress: 20,
      createdAt: "2025-01-05",
      priority: "low",
      status: "new"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'new': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default: return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenant Onboarding</h1>
          <p className="text-gray-600">Manage new tenant onboarding pipeline</p>
        </div>
        <Button>
          <Users className="w-4 h-4 mr-2" />
          Add New Tenant
        </Button>
      </div>

      {/* Onboarding Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">12</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed This Week</p>
                <p className="text-2xl font-bold text-green-600">5</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">8</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Time to Complete</p>
                <p className="text-2xl font-bold text-purple-600">7 days</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {onboardingQueue.map((tenant) => (
              <div key={tenant.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(tenant.status)}
                      <h3 className="font-semibold text-gray-900">{tenant.companyName}</h3>
                      <Badge className={getPriorityColor(tenant.priority)}>
                        {tenant.priority}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{tenant.contactName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{tenant.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{tenant.phone}</span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Stage: {tenant.stage}</span>
                        <span className="text-sm font-medium text-gray-900">{tenant.progress}%</span>
                      </div>
                      <Progress value={tenant.progress} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Started: {tenant.createdAt}
                      </span>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button size="sm">
                          Continue Setup
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}