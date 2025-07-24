import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  CreditCard,
  Shield,
  Truck
} from "lucide-react";

interface BankingApplicationData {
  businessInfo: {
    legalName: string;
    dbaName: string;
    ein: string;
    dotNumber: string;
    mcNumber: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    phone: string;
    email: string;
    website: string;
  };
  businessType: 'carrier' | 'broker' | 'shipper';
}

export default function BankingApplication() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationData, setApplicationData] = useState<BankingApplicationData>({
    businessInfo: {
      legalName: '',
      dbaName: '',
      ein: '',
      dotNumber: '',
      mcNumber: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      },
      phone: '',
      email: '',
      website: ''
    },
    businessType: 'carrier'
  });

  // Get current application status
  const { data: applicationStatus, isLoading } = useQuery({
    queryKey: ["/api/banking/application/status"],
    enabled: !!user,
  });

  // Submit banking application
  const submitApplication = useMutation({
    mutationFn: async (data: BankingApplicationData) => {
      const response = await apiRequest("POST", "/api/banking/application", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your banking application has been submitted for review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/banking/application/status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    },
  });

  // Upload document
  const uploadDocument = useMutation({
    mutationFn: async ({ documentType, file }: { documentType: string; file: File }) => {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', documentType);
      
      const response = await fetch("/api/banking/application/documents", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Document Uploaded",
        description: "Your document has been uploaded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/banking/application/status"] });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Draft</Badge>;
      case 'submitted':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Submitted</Badge>;
      case 'under_review':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Under Review</Badge>;
      case 'approved':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'requires_documents':
        return <Badge variant="secondary"><FileText className="w-3 h-3 mr-1" />Documents Required</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'draft': return 25;
      case 'submitted': return 50;
      case 'under_review': return 75;
      case 'approved': return 100;
      case 'rejected': return 100;
      case 'requires_documents': return 60;
      default: return 0;
    }
  };

  const requiredDocuments = [
    { key: 'articlesOfIncorporation', label: 'Articles of Incorporation', required: true },
    { key: 'operatingAuthority', label: 'Operating Authority (MC/DOT)', required: applicationData.businessType === 'carrier' },
    { key: 'insurance', label: 'Insurance Certificate', required: applicationData.businessType === 'carrier' },
    { key: 'bankStatements', label: 'Bank Statements (3 months)', required: true },
    { key: 'driversLicense', label: "Business Owner's Driver's License", required: true },
  ];

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setApplicationData(prev => ({
        ...prev,
        businessInfo: {
          ...prev.businessInfo,
          [parent]: {
            ...prev.businessInfo[parent as keyof typeof prev.businessInfo],
            [child]: value
          }
        }
      }));
    } else if (field.startsWith('address.')) {
      const addressField = field.replace('address.', '');
      setApplicationData(prev => ({
        ...prev,
        businessInfo: {
          ...prev.businessInfo,
          address: {
            ...prev.businessInfo.address,
            [addressField]: value
          }
        }
      }));
    } else {
      setApplicationData(prev => ({
        ...prev,
        businessInfo: {
          ...prev.businessInfo,
          [field]: value
        }
      }));
    }
  };

  const handleSubmit = () => {
    submitApplication.mutate(applicationData);
  };

  const handleFileUpload = (documentType: string, file: File) => {
    uploadDocument.mutate({ documentType, file });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If application exists, show status
  if (applicationStatus) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Banking Application</h1>
            <p className="text-gray-600">Track your banking application progress</p>
          </div>
          {getStatusBadge(applicationStatus.status)}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Application Progress</span>
            </CardTitle>
            <CardDescription>
              Application ID: {applicationStatus.id}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={getProgressPercentage(applicationStatus.status)} className="w-full" />
            
            {applicationStatus.status === 'requires_documents' && (
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Additional documents are required. Please upload the missing documents below.
                </AlertDescription>
              </Alert>
            )}

            {applicationStatus.status === 'approved' && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Congratulations! Your banking application has been approved. Your account will be activated within 24 hours.
                </AlertDescription>
              </Alert>
            )}

            {applicationStatus.status === 'rejected' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Your application has been declined. {applicationStatus.rejectionReason || 'Please contact support for more information.'}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Document Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Required Documents</CardTitle>
            <CardDescription>Upload all required documents for your application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requiredDocuments
                .filter(doc => doc.required)
                .map((document) => (
                <div key={document.key} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-medium">{document.label}</Label>
                    {applicationStatus.submittedDocuments?.includes(document.key) ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Upload className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(document.key, file);
                    }}
                    disabled={applicationStatus.submittedDocuments?.includes(document.key)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show application form
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Banking Application</h1>
        <p className="text-gray-600">Apply for banking services to manage your business finances</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Business Banking Application</span>
          </CardTitle>
          <CardDescription>
            Complete the form below to apply for banking services. All information will be securely transmitted to our banking partner.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={`step-${currentStep}`} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="step-1">Business Info</TabsTrigger>
              <TabsTrigger value="step-2">Address & Contact</TabsTrigger>
              <TabsTrigger value="step-3">Review & Submit</TabsTrigger>
            </TabsList>

            <TabsContent value="step-1" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="legalName">Legal Business Name *</Label>
                  <Input
                    id="legalName"
                    value={applicationData.businessInfo.legalName}
                    onChange={(e) => handleInputChange('legalName', e.target.value)}
                    placeholder="Enter legal business name"
                  />
                </div>
                <div>
                  <Label htmlFor="dbaName">DBA Name</Label>
                  <Input
                    id="dbaName"
                    value={applicationData.businessInfo.dbaName}
                    onChange={(e) => handleInputChange('dbaName', e.target.value)}
                    placeholder="Doing business as (optional)"
                  />
                </div>
                <div>
                  <Label htmlFor="ein">Federal EIN *</Label>
                  <Input
                    id="ein"
                    value={applicationData.businessInfo.ein}
                    onChange={(e) => handleInputChange('ein', e.target.value)}
                    placeholder="XX-XXXXXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="businessType">Business Type *</Label>
                  <Select
                    value={applicationData.businessType}
                    onValueChange={(value) => setApplicationData(prev => ({ ...prev, businessType: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="carrier">Motor Carrier</SelectItem>
                      <SelectItem value="broker">Freight Broker</SelectItem>
                      <SelectItem value="shipper">Shipper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {applicationData.businessType === 'carrier' && (
                  <>
                    <div>
                      <Label htmlFor="dotNumber">DOT Number</Label>
                      <Input
                        id="dotNumber"
                        value={applicationData.businessInfo.dotNumber}
                        onChange={(e) => handleInputChange('dotNumber', e.target.value)}
                        placeholder="DOT Number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mcNumber">MC Number</Label>
                      <Input
                        id="mcNumber"
                        value={applicationData.businessInfo.mcNumber}
                        onChange={(e) => handleInputChange('mcNumber', e.target.value)}
                        placeholder="MC Number"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setCurrentStep(2)}>Next Step</Button>
              </div>
            </TabsContent>

            <TabsContent value="step-2" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    value={applicationData.businessInfo.address.street}
                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={applicationData.businessInfo.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={applicationData.businessInfo.address.state}
                    onChange={(e) => handleInputChange('address.state', e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={applicationData.businessInfo.address.zipCode}
                    onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                    placeholder="ZIP Code"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={applicationData.businessInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={applicationData.businessInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="business@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={applicationData.businessInfo.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>Previous</Button>
                <Button onClick={() => setCurrentStep(3)}>Next Step</Button>
              </div>
            </TabsContent>

            <TabsContent value="step-3" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Review Your Application</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Legal Name:</strong> {applicationData.businessInfo.legalName}
                    </div>
                    <div>
                      <strong>Business Type:</strong> {applicationData.businessType}
                    </div>
                    <div>
                      <strong>EIN:</strong> {applicationData.businessInfo.ein}
                    </div>
                    <div>
                      <strong>Phone:</strong> {applicationData.businessInfo.phone}
                    </div>
                    <div className="md:col-span-2">
                      <strong>Address:</strong> {`${applicationData.businessInfo.address.street}, ${applicationData.businessInfo.address.city}, ${applicationData.businessInfo.address.state} ${applicationData.businessInfo.address.zipCode}`}
                    </div>
                  </div>
                </div>
              </div>
              
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  By submitting this application, you agree to our terms of service and authorize us to verify the information provided.
                </AlertDescription>
              </Alert>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>Previous</Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={submitApplication.isPending}
                >
                  {submitApplication.isPending ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}