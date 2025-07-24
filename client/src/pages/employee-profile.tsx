import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, 
  Edit, 
  Save, 
  X, 
  Calendar, 
  Phone, 
  Mail,
  MapPin,
  Building2,
  FileText,
  DollarSign,
  Clock,
  Award,
  Shield,
  Upload,
  Download,
  Eye,
  Users,
  Briefcase
} from "lucide-react";

interface EmployeeProfile {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth: string;
  hireDate: string;
  terminationDate?: string;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  department: string;
  position: string;
  reportsTo?: string;
  directReports: string[];
  employmentType: 'full_time' | 'part_time' | 'contractor' | 'intern';
  workLocation: 'office' | 'remote' | 'hybrid' | 'field';
  payroll: {
    payType: 'hourly' | 'salary' | 'commission';
    payRate: number;
    overtimeEligible: boolean;
    benefitsEligible: boolean;
    taxExemptions: number;
  };
  benefits: {
    healthInsurance: boolean;
    dentalInsurance: boolean;
    visionInsurance: boolean;
    retirement401k: boolean;
    paidTimeOff: number;
    sickLeave: number;
  };
  performance: {
    lastReviewDate: string;
    nextReviewDate: string;
    performanceRating: number;
    goals: Array<{
      id: string;
      description: string;
      status: 'in_progress' | 'completed' | 'overdue';
      dueDate: string;
    }>;
  };
  training: {
    certifications: Array<{
      id: string;
      name: string;
      issuer: string;
      issueDate: string;
      expiryDate?: string;
      status: 'active' | 'expired' | 'pending';
    }>;
    completedTraining: Array<{
      id: string;
      courseName: string;
      completionDate: string;
      score?: number;
      certificateUrl?: string;
    }>;
  };
  documents: Array<{
    id: string;
    name: string;
    type: string;
    uploadDate: string;
    expiryDate?: string;
    url: string;
  }>;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  permissions: {
    systemAccess: string[];
    modules: string[];
    adminRights: boolean;
  };
  timeTracking: {
    hoursThisWeek: number;
    hoursThisMonth: number;
    overtimeThisWeek: number;
    lastClockIn?: string;
    lastClockOut?: string;
  };
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export default function EmployeeProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  // Extract employee ID from URL
  const employeeId = location.split('/').pop();

  // Fetch employee profile
  const { data: employee, isLoading } = useQuery<EmployeeProfile>({
    queryKey: ['/api/employees', employeeId],
    enabled: !!employeeId && !!user,
  });

  // Update employee mutation
  const updateEmployeeMutation = useMutation({
    mutationFn: async (updateData: Partial<EmployeeProfile>) => {
      return await apiRequest('PUT', `/api/employees/${employeeId}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees', employeeId] });
      toast({ title: "Employee profile updated successfully" });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Update failed", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Employee not found</h2>
          <Button onClick={() => setLocation('/employees')} className="mt-4">
            Return to Employees
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCertificationStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with Photo and Basic Info */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="h-10 w-10 text-gray-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{employee.firstName} {employee.lastName}</h1>
            <p className="text-gray-600">{employee.position}</p>
            <p className="text-gray-600">{employee.department}</p>
            <p className="text-gray-600">Employee ID: {employee.employeeId}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={getStatusColor(employee.status)}>
            {employee.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <Button
            variant={isEditing ? "outline" : "default"}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input value={employee.firstName} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input value={employee.lastName} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input type="date" value={employee.dateOfBirth} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Email</Label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <Input value={employee.email} disabled={!isEditing} />
                  </div>
                </div>
                <div>
                  <Label>Phone</Label>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <Input value={employee.phone} disabled={!isEditing} />
                  </div>
                </div>
              </div>
              
              {/* Address */}
              <div className="mt-4">
                <Label>Address</Label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                  <div className="md:col-span-2">
                    <Input placeholder="Street Address" value={employee.address} disabled={!isEditing} />
                  </div>
                  <div>
                    <Input placeholder="City" value={employee.city} disabled={!isEditing} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="State" value={employee.state} disabled={!isEditing} />
                    <Input placeholder="ZIP" value={employee.zipCode} disabled={!isEditing} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Employment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Employee ID</Label>
                  <Input value={employee.employeeId} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Department</Label>
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <Input value={employee.department} disabled={!isEditing} />
                  </div>
                </div>
                <div>
                  <Label>Position</Label>
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <Input value={employee.position} disabled={!isEditing} />
                  </div>
                </div>
                <div>
                  <Label>Employment Type</Label>
                  {isEditing ? (
                    <Select defaultValue={employee.employmentType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Full Time</SelectItem>
                        <SelectItem value="part_time">Part Time</SelectItem>
                        <SelectItem value="contractor">Contractor</SelectItem>
                        <SelectItem value="intern">Intern</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={employee.employmentType.replace('_', ' ')} disabled />
                  )}
                </div>
                <div>
                  <Label>Work Location</Label>
                  {isEditing ? (
                    <Select defaultValue={employee.workLocation}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="field">Field</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={employee.workLocation} disabled />
                  )}
                </div>
                <div>
                  <Label>Status</Label>
                  {isEditing ? (
                    <Select defaultValue={employee.status}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                        <SelectItem value="terminated">Terminated</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={employee.status} disabled />
                  )}
                </div>
                <div>
                  <Label>Hire Date</Label>
                  <Input type="date" value={employee.hireDate} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Reports To</Label>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <Input value={employee.reportsTo || 'None'} disabled={!isEditing} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Contact Name</Label>
                  <Input value={employee.emergencyContact.name} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Relationship</Label>
                  <Input value={employee.emergencyContact.relationship} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={employee.emergencyContact.phone} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={employee.emergencyContact.email || ''} disabled={!isEditing} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Payroll Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Pay Type</Label>
                  <Input value={employee.payroll.payType} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Pay Rate</Label>
                  <Input 
                    value={`$${employee.payroll.payRate}${employee.payroll.payType === 'hourly' ? '/hr' : employee.payroll.payType === 'salary' ? '/year' : ''}`} 
                    disabled={!isEditing} 
                  />
                </div>
                <div>
                  <Label>Tax Exemptions</Label>
                  <Input value={employee.payroll.taxExemptions} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Overtime Eligible</Label>
                  <Input value={employee.payroll.overtimeEligible ? 'Yes' : 'No'} disabled />
                </div>
                <div>
                  <Label>Benefits Eligible</Label>
                  <Input value={employee.payroll.benefitsEligible ? 'Yes' : 'No'} disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Benefits Package</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Insurance Coverage</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Health Insurance</span>
                      <Badge className={employee.benefits.healthInsurance ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {employee.benefits.healthInsurance ? 'Enrolled' : 'Not Enrolled'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Dental Insurance</span>
                      <Badge className={employee.benefits.dentalInsurance ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {employee.benefits.dentalInsurance ? 'Enrolled' : 'Not Enrolled'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Vision Insurance</span>
                      <Badge className={employee.benefits.visionInsurance ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {employee.benefits.visionInsurance ? 'Enrolled' : 'Not Enrolled'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>401(k) Retirement</span>
                      <Badge className={employee.benefits.retirement401k ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {employee.benefits.retirement401k ? 'Enrolled' : 'Not Enrolled'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Time Off Benefits</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span>Paid Time Off</span>
                        <span className="font-medium">{employee.benefits.paidTimeOff} days</span>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span>Sick Leave</span>
                        <span className="font-medium">{employee.benefits.sickLeave} days</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Performance Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <Label>Last Review Date</Label>
                  <Input type="date" value={employee.performance.lastReviewDate} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Next Review Date</Label>
                  <Input type="date" value={employee.performance.nextReviewDate} disabled={!isEditing} />
                </div>
                <div>
                  <Label>Performance Rating</Label>
                  <Input value={`${employee.performance.performanceRating}/5`} disabled={!isEditing} />
                </div>
              </div>
              
              {/* Goals */}
              <div>
                <h4 className="font-medium mb-3">Current Goals</h4>
                <div className="space-y-3">
                  {employee.performance.goals.map((goal) => (
                    <div key={goal.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{goal.description}</p>
                          <p className="text-sm text-gray-600">Due: {new Date(goal.dueDate).toLocaleDateString()}</p>
                        </div>
                        <Badge variant="outline">{goal.status.replace('_', ' ')}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employee.training.certifications.map((cert) => (
                  <div key={cert.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{cert.name}</p>
                        <p className="text-sm text-gray-600">Issued by: {cert.issuer}</p>
                        <p className="text-sm text-gray-600">
                          Issued: {new Date(cert.issueDate).toLocaleDateString()}
                          {cert.expiryDate && ` • Expires: ${new Date(cert.expiryDate).toLocaleDateString()}`}
                        </p>
                      </div>
                      <Badge className={getCertificationStatusColor(cert.status)}>
                        {cert.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Completed Training</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employee.training.completedTraining.map((training) => (
                  <div key={training.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{training.courseName}</p>
                        <p className="text-sm text-gray-600">
                          Completed: {new Date(training.completionDate).toLocaleDateString()}
                          {training.score && ` • Score: ${training.score}%`}
                        </p>
                      </div>
                      {training.certificateUrl && (
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Certificate
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Employee Documents</span>
                </CardTitle>
                <Button onClick={() => setShowDocumentUpload(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employee.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-gray-600">
                          {doc.type} • Uploaded {new Date(doc.uploadDate).toLocaleDateString()}
                          {doc.expiryDate && ` • Expires ${new Date(doc.expiryDate).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Time Tracking</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg bg-blue-50">
                  <Clock className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{employee.timeTracking.hoursThisWeek}</div>
                  <div className="text-sm text-gray-600">Hours This Week</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-green-50">
                  <Calendar className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <div className="text-2xl font-bold text-green-600">{employee.timeTracking.hoursThisMonth}</div>
                  <div className="text-sm text-gray-600">Hours This Month</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-orange-50">
                  <Clock className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                  <div className="text-2xl font-bold text-orange-600">{employee.timeTracking.overtimeThisWeek}</div>
                  <div className="text-sm text-gray-600">Overtime This Week</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-purple-50">
                  <Shield className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <div className="text-sm font-bold text-purple-600">
                    {employee.timeTracking.lastClockIn ? 'Clocked In' : 'Clocked Out'}
                  </div>
                  <div className="text-sm text-gray-600">Current Status</div>
                </div>
              </div>
              
              {employee.timeTracking.lastClockIn && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    Last clocked in: {new Date(employee.timeTracking.lastClockIn).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="Add notes about this employee..."
            value={employee.notes}
            disabled={!isEditing}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      {isEditing && (
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => updateEmployeeMutation.mutate({})}
            disabled={updateEmployeeMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      )}

      {/* Document Upload Modal */}
      <Dialog open={showDocumentUpload} onOpenChange={setShowDocumentUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Document Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Employment Contract</SelectItem>
                  <SelectItem value="id">ID Document</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="performance">Performance Review</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Document Name</Label>
              <Input placeholder="Enter document name" />
            </div>
            <div>
              <Label>Expiry Date (if applicable)</Label>
              <Input type="date" />
            </div>
            <div>
              <Label>File</Label>
              <Input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowDocumentUpload(false)}>
                Cancel
              </Button>
              <Button>Upload</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}