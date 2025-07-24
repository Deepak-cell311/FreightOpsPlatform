import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  FileText, 
  CreditCard, 
  Building, 
  Lock,
  Clock,
  XCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface VerificationStatus {
  companyId: string;
  verificationLevel: string;
  identityVerified: boolean;
  businessVerified: boolean;
  bankingEnabled: boolean;
  payrollEnabled: boolean;
  complianceScore: number;
  documents: any[];
}

interface SecurityChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  category: string;
}

interface VerificationRequirement {
  type: string;
  description: string;
  required: boolean;
  status: string;
  documents: string[];
}

export default function VerificationPage() {
  const { toast } = useToast();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [checklist, setChecklist] = useState<SecurityChecklistItem[]>([]);
  const [requirements, setRequirements] = useState<VerificationRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File }>({});

  useEffect(() => {
    loadVerificationData();
  }, []);

  const loadVerificationData = async () => {
    try {
      setLoading(true);
      const [statusRes, checklistRes, requirementsRes] = await Promise.all([
        apiRequest('GET', '/api/verification/status'),
        apiRequest('GET', '/api/verification/security-checklist'),
        apiRequest('GET', '/api/verification/requirements')
      ]);

      const status = await statusRes.json();
      const checklistData = await checklistRes.json();
      const requirementsData = await requirementsRes.json();

      setVerificationStatus(status);
      setChecklist(checklistData);
      setRequirements(requirementsData);
    } catch (error) {
      console.error('Failed to load verification data:', error);
      toast({
        title: "Error",
        description: "Failed to load verification data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (documentType: string, file: File) => {
    setSelectedFiles(prev => ({ ...prev, [documentType]: file }));
  };

  const uploadDocument = async (documentType: string) => {
    const file = selectedFiles[documentType];
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploadingDoc(documentType);
      
      // Convert file to base64
      const fileData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data:type;base64, prefix
        };
        reader.readAsDataURL(file);
      });

      const response = await apiRequest('POST', '/api/verification/upload', {
        documentType,
        fileName: file.name,
        fileData
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Document uploaded successfully",
        });
        
        // Reload verification data
        await loadVerificationData();
        
        // Clear selected file
        setSelectedFiles(prev => {
          const updated = { ...prev };
          delete updated[documentType];
          return updated;
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Document upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingDoc(null);
    }
  };

  const initiateStripeOnboarding = async () => {
    try {
      const response = await apiRequest('POST', '/api/verification/stripe-onboarding');
      const data = await response.json();
      
      if (data.accountLinkUrl) {
        window.location.href = data.accountLinkUrl;
      }
    } catch (error) {
      console.error('Stripe onboarding error:', error);
      toast({
        title: "Error",
        description: "Failed to initiate banking verification",
        variant: "destructive"
      });
    }
  };

  const enableBanking = async () => {
    try {
      const response = await apiRequest('POST', '/api/verification/enable-banking');
      const data = await response.json();
      
      if (data.enabled) {
        toast({
          title: "Success",
          description: "Banking features enabled successfully",
        });
        await loadVerificationData();
      }
    } catch (error) {
      console.error('Enable banking error:', error);
      toast({
        title: "Error",
        description: "Failed to enable banking features",
        variant: "destructive"
      });
    }
  };

  const enablePayroll = async () => {
    try {
      const response = await apiRequest('POST', '/api/verification/enable-payroll');
      const data = await response.json();
      
      if (data.enabled) {
        toast({
          title: "Success",
          description: "Payroll features enabled successfully",
        });
        await loadVerificationData();
      }
    } catch (error) {
      console.error('Enable payroll error:', error);
      toast({
        title: "Error",
        description: "Failed to enable payroll features",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getVerificationLevelColor = (level: string) => {
    switch (level) {
      case 'full':
        return 'bg-green-500';
      case 'enhanced':
        return 'bg-blue-500';
      case 'basic':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const completedItems = checklist.filter(item => item.completed).length;
  const totalItems = checklist.length;
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Verification</h1>
        <p className="text-gray-600">Complete verification to unlock banking and payroll features</p>
      </div>

      {/* Verification Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verification Level</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getVerificationLevelColor(verificationStatus?.verificationLevel || 'none')}`}></div>
              <span className="text-2xl font-bold capitalize">{verificationStatus?.verificationLevel || 'None'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verificationStatus?.complianceScore || 0}%</div>
            <Progress value={verificationStatus?.complianceScore || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Features Enabled</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm">Banking</span>
                {verificationStatus?.bankingEnabled ? (
                  <Badge variant="default" className="bg-green-500">Enabled</Badge>
                ) : (
                  <Badge variant="secondary">Disabled</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Payroll</span>
                {verificationStatus?.payrollEnabled ? (
                  <Badge variant="default" className="bg-green-500">Enabled</Badge>
                ) : (
                  <Badge variant="secondary">Disabled</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="checklist" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="checklist">Security Checklist</TabsTrigger>
          <TabsTrigger value="documents">Document Upload</TabsTrigger>
          <TabsTrigger value="banking">Banking Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Verification Checklist</CardTitle>
              <div className="flex items-center space-x-2">
                <Progress value={progressPercentage} className="flex-1" />
                <span className="text-sm text-gray-600">{completedItems}/{totalItems} completed</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                  {item.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-gray-400 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      {item.required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                      <Badge variant="outline" className="text-xs capitalize">{item.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Upload</CardTitle>
              <p className="text-sm text-gray-600">Upload required verification documents</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {requirements.map((requirement) => (
                <div key={requirement.type} className="border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    {getStatusIcon(requirement.status)}
                    <h3 className="font-medium">{requirement.description}</h3>
                    {requirement.required && (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      Accepted documents: {requirement.documents.join(', ')}
                    </div>
                    
                    {requirement.status !== 'completed' && (
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <Label htmlFor={`file-${requirement.type}`} className="sr-only">
                            Upload {requirement.type}
                          </Label>
                          <Input
                            id={`file-${requirement.type}`}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileSelect(requirement.type, file);
                            }}
                          />
                        </div>
                        <Button
                          onClick={() => uploadDocument(requirement.type)}
                          disabled={!selectedFiles[requirement.type] || uploadingDoc === requirement.type}
                          size="sm"
                        >
                          {uploadingDoc === requirement.type ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Banking & Financial Services</CardTitle>
              <p className="text-sm text-gray-600">Complete banking verification to enable financial features</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Banking features require identity verification and business documentation to comply with financial regulations.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Banking Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-2">
                      <li>• Business bank account connection</li>
                      <li>• ACH transfers and payments</li>
                      <li>• Virtual business cards</li>
                      <li>• Transaction management</li>
                    </ul>
                    <div className="mt-4">
                      {verificationStatus?.bankingEnabled ? (
                        <Badge variant="default" className="bg-green-500">Enabled</Badge>
                      ) : (
                        <div className="space-y-2">
                          <Button onClick={initiateStripeOnboarding} className="w-full">
                            Setup Banking Verification
                          </Button>
                          {verificationStatus?.identityVerified && verificationStatus?.businessVerified && (
                            <Button onClick={enableBanking} variant="outline" className="w-full">
                              Enable Banking
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Payroll Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-2">
                      <li>• Employee payroll processing</li>
                      <li>• Tax withholding and filing</li>
                      <li>• Direct deposit setup</li>
                      <li>• Benefits management</li>
                    </ul>
                    <div className="mt-4">
                      {verificationStatus?.payrollEnabled ? (
                        <Badge variant="default" className="bg-green-500">Enabled</Badge>
                      ) : (
                        <Button 
                          onClick={enablePayroll} 
                          disabled={!verificationStatus?.bankingEnabled}
                          className="w-full"
                        >
                          Enable Payroll
                        </Button>
                      )}
                      {!verificationStatus?.bankingEnabled && (
                        <p className="text-xs text-gray-500 mt-2">Banking must be enabled first</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}