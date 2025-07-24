import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  Camera,
  CreditCard,
  Building,
  User,
  FileText,
  Shield,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from "lucide-react";

interface BankingApplicationStatus {
  hasApplication: boolean;
  status: 'none' | 'pending' | 'approved' | 'rejected' | 'docs_required' | 'identity_required';
  applicationId?: string;
  requiredDocuments?: string[];
  message?: string;
}

interface ApplicationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

export default function BankingOnboarding() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [applicationData, setApplicationData] = useState({
    businessInfo: {
      legalName: '',
      dbaName: '',
      ein: '',
      businessType: '',
      stateOfIncorporation: '',
      address: '',
      phone: '',
      website: ''
    },
    ownerInfo: {
      firstName: '',
      lastName: '',
      ssn: '',
      dateOfBirth: '',
      address: '',
      phone: '',
      email: '',
      ownershipPercentage: 100
    },
    documents: {
      articlesOfIncorporation: null,
      operatingAgreement: null,
      bankStatements: null,
      taxReturns: null
    },
    identity: {
      driverLicense: null,
      passportOrId: null,
      faceVerification: null
    }
  });

  const { data: bankingStatus, isLoading } = useQuery({
    queryKey: ['/api/banking/application-status'],
    refetchInterval: 5000 // Check status every 5 seconds
  });

  const submitApplicationMutation = useMutation({
    mutationFn: (data) => apiRequest('/api/banking/submit-application', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your banking application has been submitted for review."
      });
    }
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: ({ type, file }) => {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', type);
      return apiRequest('/api/banking/upload-document', {
        method: 'POST',
        body: formData
      });
    }
  });

  const steps: ApplicationStep[] = [
    {
      id: 'intro',
      title: 'Activate Banking Module',
      description: 'Enable banking services for your company',
      completed: false,
      current: currentStep === 0
    },
    {
      id: 'business',
      title: 'Business Information',
      description: 'Provide your company details',
      completed: false,
      current: currentStep === 1
    },
    {
      id: 'owner',
      title: 'Owner Information', 
      description: 'Primary business owner details',
      completed: false,
      current: currentStep === 2
    },
    {
      id: 'documents',
      title: 'Upload Documents',
      description: 'Required business documentation',
      completed: false,
      current: currentStep === 3
    },
    {
      id: 'identity',
      title: 'Identity Verification',
      description: 'ID verification and facial recognition',
      completed: false,
      current: currentStep === 4
    },
    {
      id: 'review',
      title: 'Review & Submit',
      description: 'Final review before submission',
      completed: false,
      current: currentStep === 5
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If banking is already active, show welcome message
  if (bankingStatus?.status === 'approved') {
    return <BankingWelcome />;
  }

  // If application is processing, show status
  if (bankingStatus?.status === 'pending') {
    return <ApplicationProcessing status={bankingStatus} />;
  }

  // If docs or identity required, show requirements
  if (bankingStatus?.status === 'docs_required' || bankingStatus?.status === 'identity_required') {
    return <AdditionalRequirements status={bankingStatus} />;
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      await submitApplicationMutation.mutateAsync(applicationData);
      setCurrentStep(steps.length); // Move to processing state
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please check your information and try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Banking Module Activation
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Complete the application process to enable banking services for {user?.companyName}
          </p>
          
          <Progress value={(currentStep / (steps.length - 1)) * 100} className="mb-4" />
          
          <div className="flex justify-between text-sm">
            {steps.map((step, index) => (
              <div key={step.id} className={`flex items-center space-x-2 ${
                index <= currentStep ? 'text-primary' : 'text-gray-400'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  index < currentStep ? 'bg-primary text-white' :
                  index === currentStep ? 'bg-primary/20 border-2 border-primary' :
                  'bg-gray-200 dark:bg-gray-700'
                }`}>
                  {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                <span className="hidden md:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="min-h-[600px]">
          <CardContent className="p-8">
            {currentStep === 0 && <IntroStep onNext={handleNext} />}
            {currentStep === 1 && (
              <BusinessInfoStep 
                data={applicationData.businessInfo}
                onChange={(data) => setApplicationData(prev => ({ ...prev, businessInfo: data }))}
                onNext={handleNext}
                onPrevious={handlePrevious}
              />
            )}
            {currentStep === 2 && (
              <OwnerInfoStep
                data={applicationData.ownerInfo}
                onChange={(data) => setApplicationData(prev => ({ ...prev, ownerInfo: data }))}
                onNext={handleNext}
                onPrevious={handlePrevious}
              />
            )}
            {currentStep === 3 && (
              <DocumentsStep
                data={applicationData.documents}
                onChange={(data) => setApplicationData(prev => ({ ...prev, documents: data }))}
                onNext={handleNext}
                onPrevious={handlePrevious}
                uploadMutation={uploadDocumentMutation}
              />
            )}
            {currentStep === 4 && (
              <IdentityStep
                data={applicationData.identity}
                onChange={(data) => setApplicationData(prev => ({ ...prev, identity: data }))}
                onNext={handleNext}
                onPrevious={handlePrevious}
              />
            )}
            {currentStep === 5 && (
              <ReviewStep
                data={applicationData}
                onSubmit={handleSubmit}
                onPrevious={handlePrevious}
                isSubmitting={submitApplicationMutation.isPending}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function IntroStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
        <CreditCard className="w-10 h-10 text-primary" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">Activate Banking Module</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          To enable banking services for your company, an admin must complete the banking application process. 
          This includes business verification, document upload, and identity verification.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="text-center">
          <Building className="w-8 h-8 text-primary mx-auto mb-2" />
          <h3 className="font-semibold">Business Verification</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Verify your company information</p>
        </div>
        <div className="text-center">
          <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
          <h3 className="font-semibold">Document Upload</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Submit required business documents</p>
        </div>
        <div className="text-center">
          <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
          <h3 className="font-semibold">Identity Verification</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Complete ID and facial verification</p>
        </div>
      </div>

      <Button onClick={onNext} size="lg" className="mt-8">
        Start Application
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}

function BusinessInfoStep({ data, onChange, onNext, onPrevious }) {
  const handleInputChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const isValid = data.legalName && data.ein && data.businessType && data.address && data.phone;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Business Information</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Provide your company's legal business information
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="legalName">Legal Business Name *</Label>
          <Input
            id="legalName"
            value={data.legalName}
            onChange={(e) => handleInputChange('legalName', e.target.value)}
            placeholder="Enter legal business name"
          />
        </div>
        <div>
          <Label htmlFor="dbaName">DBA Name</Label>
          <Input
            id="dbaName"
            value={data.dbaName}
            onChange={(e) => handleInputChange('dbaName', e.target.value)}
            placeholder="Doing business as (if different)"
          />
        </div>
        <div>
          <Label htmlFor="ein">EIN (Federal Tax ID) *</Label>
          <Input
            id="ein"
            value={data.ein}
            onChange={(e) => handleInputChange('ein', e.target.value)}
            placeholder="XX-XXXXXXX"
          />
        </div>
        <div>
          <Label htmlFor="businessType">Business Type *</Label>
          <select
            id="businessType"
            value={data.businessType}
            onChange={(e) => handleInputChange('businessType', e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select business type</option>
            <option value="llc">LLC</option>
            <option value="corporation">Corporation</option>
            <option value="partnership">Partnership</option>
            <option value="sole_proprietorship">Sole Proprietorship</option>
          </select>
        </div>
        <div>
          <Label htmlFor="stateOfIncorporation">State of Incorporation</Label>
          <Input
            id="stateOfIncorporation"
            value={data.stateOfIncorporation}
            onChange={(e) => handleInputChange('stateOfIncorporation', e.target.value)}
            placeholder="State where business is incorporated"
          />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={data.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="https://www.example.com"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Business Address *</Label>
        <Textarea
          id="address"
          value={data.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Full business address including city, state, and ZIP"
          className="min-h-[80px]"
        />
      </div>

      <div>
        <Label htmlFor="phone">Business Phone *</Label>
        <Input
          id="phone"
          value={data.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="(XXX) XXX-XXXX"
        />
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button onClick={onNext} disabled={!isValid}>
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function OwnerInfoStep({ data, onChange, onNext, onPrevious }) {
  // Similar structure to BusinessInfoStep but for owner information
  const handleInputChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const isValid = data.firstName && data.lastName && data.ssn && data.dateOfBirth && data.address && data.phone && data.email;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Owner Information</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Information about the primary business owner (25% or more ownership)
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={data.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="First name"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={data.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Last name"
          />
        </div>
        <div>
          <Label htmlFor="ssn">SSN *</Label>
          <Input
            id="ssn"
            value={data.ssn}
            onChange={(e) => handleInputChange('ssn', e.target.value)}
            placeholder="XXX-XX-XXXX"
            type="password"
          />
        </div>
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            value={data.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            type="date"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            value={data.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="(XXX) XXX-XXXX"
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            value={data.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="email@example.com"
            type="email"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Home Address *</Label>
        <Textarea
          id="address"
          value={data.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Full home address including city, state, and ZIP"
          className="min-h-[80px]"
        />
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button onClick={onNext} disabled={!isValid}>
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function DocumentsStep({ data, onChange, onNext, onPrevious, uploadMutation }) {
  // Document upload functionality
  const handleFileUpload = async (type: string, file: File) => {
    try {
      const result = await uploadMutation.mutateAsync({ type, file });
      onChange({ ...data, [type]: result.fileUrl });
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Upload Documents</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Upload required business documentation for verification
        </p>
      </div>

      {/* Document upload sections */}
      <div className="grid gap-6">
        {[
          { key: 'articlesOfIncorporation', label: 'Articles of Incorporation', required: true },
          { key: 'operatingAgreement', label: 'Operating Agreement', required: true },
          { key: 'bankStatements', label: 'Bank Statements (Last 3 months)', required: true },
          { key: 'taxReturns', label: 'Tax Returns (Last 2 years)', required: false }
        ].map(doc => (
          <Card key={doc.key} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{doc.label}</h3>
                {doc.required && <Badge variant="secondary">Required</Badge>}
              </div>
              <div className="flex items-center space-x-2">
                {data[doc.key] ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(doc.key, file);
                    }}
                    className="hidden"
                    id={doc.key}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById(doc.key)?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {data[doc.key] ? 'Replace' : 'Upload'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button onClick={onNext}>
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function IdentityStep({ data, onChange, onNext, onPrevious }) {
  // Identity verification functionality
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Identity Verification</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Complete identity verification with ID upload and facial recognition
        </p>
      </div>

      {/* Identity verification sections */}
      <div className="grid gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold">Government-Issued ID</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Upload a clear photo of your driver's license or passport
              </p>
            </div>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Upload ID
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Camera className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold">Facial Verification</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Take a selfie to verify your identity
              </p>
            </div>
            <Button variant="outline">
              <Camera className="w-4 h-4 mr-2" />
              Take Selfie
            </Button>
          </div>
        </Card>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button onClick={onNext}>
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function ReviewStep({ data, onSubmit, onPrevious, isSubmitting }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Review & Submit</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Review your application before submission
        </p>
      </div>

      {/* Review sections */}
      <div className="space-y-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Business Information</h3>
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            <div>Legal Name: {data.businessInfo.legalName}</div>
            <div>EIN: {data.businessInfo.ein}</div>
            <div>Business Type: {data.businessInfo.businessType}</div>
            <div>Phone: {data.businessInfo.phone}</div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2">Owner Information</h3>
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            <div>Name: {data.ownerInfo.firstName} {data.ownerInfo.lastName}</div>
            <div>Email: {data.ownerInfo.email}</div>
            <div>Phone: {data.ownerInfo.phone}</div>
          </div>
        </Card>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </div>
    </div>
  );
}

function ApplicationProcessing({ status }: { status: BankingApplicationStatus }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center p-8">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Processing Your Application</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Your banking application is being reviewed. This typically takes 1-2 business days.
        </p>
        <div className="animate-pulse">
          <div className="h-2 bg-gray-200 rounded-full mb-2"></div>
          <div className="h-2 bg-gray-200 rounded-full w-3/4 mx-auto"></div>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Application ID: {status.applicationId}
        </p>
      </Card>
    </div>
  );
}

function AdditionalRequirements({ status }: { status: BankingApplicationStatus }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center p-8">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Additional Requirements</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {status.message || 'Additional documentation or verification is required.'}
        </p>
        {status.requiredDocuments && (
          <div className="text-left mb-6">
            <h3 className="font-semibold mb-2">Required:</h3>
            <ul className="list-disc list-inside text-sm">
              {status.requiredDocuments.map((doc, index) => (
                <li key={index}>{doc}</li>
              ))}
            </ul>
          </div>
        )}
        <Button className="w-full">
          Complete Requirements
        </Button>
      </Card>
    </div>
  );
}

function BankingWelcome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full text-center p-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Welcome to Banking Module!</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Congratulations! Your banking application has been approved. You now have access to 
          comprehensive banking services including accounts, transfers, cards, and financial management tools.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div>
            <CreditCard className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold">Business Accounts</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Manage your business accounts</p>
          </div>
          <div>
            <ArrowRight className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold">Transfers</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Send and receive payments</p>
          </div>
          <div>
            <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold">Security</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Advanced fraud protection</p>
          </div>
        </div>

        <Button size="lg" className="w-full md:w-auto">
          Explore Banking Features
        </Button>
      </Card>
    </div>
  );
}