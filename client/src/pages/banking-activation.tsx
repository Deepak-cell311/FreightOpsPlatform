import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Building,
  FileText,
  Shield,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from "lucide-react";

export default function BankingActivation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [applicationData, setApplicationData] = useState({
    businessName: user?.companyName || '',
    ein: '',
    businessType: '',
    ownerName: `${user?.firstName || ''} ${user?.lastName || ''}`,
    ownerEmail: user?.email || '',
    agreed: false
  });

  const submitMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/banking/submit-application', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      setCurrentStep(5); // Move to success step
      toast({
        title: "Application Submitted",
        description: "Your banking application has been submitted for review."
      });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  });

  const steps = [
    "Get Started",
    "Business Info", 
    "Owner Details",
    "Review",
    "Submit",
    "Complete"
  ];

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

  const handleSubmit = () => {
    submitMutation.mutate(applicationData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Activate Banking Module
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Enable banking services for {user?.companyName}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={(currentStep / (steps.length - 1)) * 100} className="mb-4" />
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
            {steps.map((step, index) => (
              <span key={index} className={index <= currentStep ? 'text-primary font-medium' : ''}>
                {step}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <Card className="min-h-[500px]">
          <CardContent className="p-8">
            {currentStep === 0 && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Ready to Activate Banking?</h2>
                  <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    To activate banking services, we need to verify your business information and 
                    submit an application to our banking partner. This process typically takes 1-2 business days.
                  </p>
                </div>
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center">
                    <Building className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold">Business Verification</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Verify company details</p>
                  </div>
                  <div className="text-center">
                    <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold">Quick Application</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Simple form submission</p>
                  </div>
                  <div className="text-center">
                    <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold">Secure Process</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Bank-grade security</p>
                  </div>
                </div>
                <Button onClick={handleNext} size="lg" className="mt-8">
                  Start Application
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Business Information</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Confirm your business details
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="businessName">Legal Business Name</Label>
                    <Input
                      id="businessName"
                      value={applicationData.businessName}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, businessName: e.target.value }))}
                      placeholder="Enter legal business name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ein">Federal Tax ID (EIN)</Label>
                    <Input
                      id="ein"
                      value={applicationData.ein}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, ein: e.target.value }))}
                      placeholder="XX-XXXXXXX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessType">Business Type</Label>
                    <select
                      id="businessType"
                      value={applicationData.businessType}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, businessType: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select business type</option>
                      <option value="llc">LLC</option>
                      <option value="corporation">Corporation</option>
                      <option value="partnership">Partnership</option>
                      <option value="sole_proprietorship">Sole Proprietorship</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={handlePrevious}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button 
                    onClick={handleNext} 
                    disabled={!applicationData.businessName || !applicationData.ein || !applicationData.businessType}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Owner Information</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Primary business owner details
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ownerName">Owner Name</Label>
                    <Input
                      id="ownerName"
                      value={applicationData.ownerName}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, ownerName: e.target.value }))}
                      placeholder="Full name of business owner"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ownerEmail">Email Address</Label>
                    <Input
                      id="ownerEmail"
                      type="email"
                      value={applicationData.ownerEmail}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, ownerEmail: e.target.value }))}
                      placeholder="Owner email address"
                    />
                  </div>
                </div>
                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={handlePrevious}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button 
                    onClick={handleNext} 
                    disabled={!applicationData.ownerName || !applicationData.ownerEmail}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Review Application</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Please review your information before submitting
                  </p>
                </div>
                <div className="space-y-4">
                  <Card className="p-4 bg-gray-50 dark:bg-gray-800">
                    <h3 className="font-semibold mb-3">Business Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Business Name:</strong> {applicationData.businessName}</div>
                      <div><strong>EIN:</strong> {applicationData.ein}</div>
                      <div><strong>Business Type:</strong> {applicationData.businessType}</div>
                    </div>
                  </Card>
                  <Card className="p-4 bg-gray-50 dark:bg-gray-800">
                    <h3 className="font-semibold mb-3">Owner Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Owner Name:</strong> {applicationData.ownerName}</div>
                      <div><strong>Email:</strong> {applicationData.ownerEmail}</div>
                    </div>
                  </Card>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="agreement"
                      checked={applicationData.agreed}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, agreed: e.target.checked }))}
                    />
                    <Label htmlFor="agreement" className="text-sm">
                      I confirm that the information provided is accurate and authorize the submission 
                      of this banking application.
                    </Label>
                  </div>
                </div>
                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={handlePrevious}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button onClick={handleNext} disabled={!applicationData.agreed}>
                    Continue to Submit
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Ready to Submit</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Your application is ready for submission. Once submitted, our banking partner 
                    will review your application and respond within 1-2 business days.
                  </p>
                </div>
                <div className="flex justify-center space-x-4 pt-6">
                  <Button variant="outline" onClick={handlePrevious}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Review
                  </Button>
                  <Button onClick={handleSubmit} disabled={submitMutation.isPending} size="lg">
                    {submitMutation.isPending ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Application Submitted!</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Your banking application has been successfully submitted. You will receive an email 
                    confirmation shortly, and our banking partner will review your application within 1-2 business days.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">What happens next?</span>
                    </div>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <div>• Application review (1-2 business days)</div>
                      <div>• Email notification of approval or additional requirements</div>
                      <div>• Banking module activation upon approval</div>
                    </div>
                  </div>
                </div>
                <Button onClick={() => window.location.reload()} size="lg">
                  Return to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}