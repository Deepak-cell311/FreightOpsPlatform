import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Check, 
  Building2, 
  Building,
  Truck, 
  Users, 
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Info,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import logoImage from "@assets/file_000000002eb461fd852b4b0e04724190_1749352807925.png";

// Multi-step registration schemas
const businessTypeSchema = z.object({
  businessType: z.enum(["carrier", "broker", "dispatcher"], {
    required_error: "Please select your business type",
  })
});

const dotVerificationSchema = z.object({
  dotNumber: z.string().optional(),
  mcNumber: z.string().optional(),
}).refine((data) => data.dotNumber || data.mcNumber, {
  message: "Either DOT number or MC number is required",
  path: ["dotNumber"],
});

const containerServiceSchema = z.object({
  handlesContainers: z.boolean(),
  containerServiceTier: z.enum(["none", "premium"]).optional(),
});

const finalRegistrationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  }),
  adminBypassCode: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type BusinessTypeForm = z.infer<typeof businessTypeSchema>;
type DotVerificationForm = z.infer<typeof dotVerificationSchema>;
type ContainerServiceForm = z.infer<typeof containerServiceSchema>;
type FinalRegistrationForm = z.infer<typeof finalRegistrationSchema>;

// Interface for FMCSA verification data
interface FMCSAVerificationData {
  companyName: string;
  address: string;
  phone: string;
  dotNumber: string;
  mcNumber?: string;
  safetyRating?: string;
  insuranceRequired?: string;
  operatingStatus?: string;
}

export default function Register() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>("");
  const [fmcsaData, setFmcsaData] = useState<FMCSAVerificationData | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [containerServiceData, setContainerServiceData] = useState<ContainerServiceForm | null>(null);

  // Step 1: Business Type Selection Form
  const businessTypeForm = useForm<BusinessTypeForm>({
    resolver: zodResolver(businessTypeSchema),
  });

  // Step 2: DOT Verification Form
  const dotVerificationForm = useForm<DotVerificationForm>({
    resolver: zodResolver(dotVerificationSchema),
  });

  // Step 3: Container Service Form
  const containerServiceForm = useForm<ContainerServiceForm>({
    resolver: zodResolver(containerServiceSchema),
    defaultValues: {
      handlesContainers: false,
      containerServiceTier: "none"
    }
  });

  // Step 4: Final Registration Form
  const finalRegistrationForm = useForm<FinalRegistrationForm>({
    resolver: zodResolver(finalRegistrationSchema),
  });

  // FMCSA verification mutation
  const verifyDotMutation = useMutation({
    mutationFn: async (data: DotVerificationForm) => {
      const response = await apiRequest("POST", "/api/fmcsa/verify", data);
      return response.json();
    },
    onSuccess: (data) => {
      // Transform the backend response to match frontend expectations
      if (data.success && data.carrierData) {
        const carrier = data.carrierData;
        const transformedData: FMCSAVerificationData = {
          companyName: carrier.legalName || carrier.dbaName || '',
          address: `${carrier.physicalAddress?.street || ''} ${carrier.physicalAddress?.city || ''}, ${carrier.physicalAddress?.state || ''} ${carrier.physicalAddress?.zip || ''}`.trim(),
          phone: carrier.phone || '',
          dotNumber: carrier.dotNumber || '',
          mcNumber: carrier.mcNumber || '',
          safetyRating: carrier.safetyRating || '',
          operatingStatus: carrier.allowedToOperate || ''
        };
        setFmcsaData(transformedData);
        setCurrentStep(3);
        toast({
          title: "Verification Successful",
          description: "Company information retrieved from FMCSA database",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: "No company data found for the provided number",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Could not verify DOT number",
        variant: "destructive",
      });
    },
  });

  // Final registration mutation
  const registerMutation = useMutation({
    mutationFn: async (data: FinalRegistrationForm) => {
      const registrationData = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        companyName: fmcsaData?.companyName || `${data.firstName} ${data.lastName} ${selectedBusinessType}`,
        businessType: selectedBusinessType || 'carrier',
        phone: data.phone,
        address: fmcsaData?.address || "",
        dotNumber: fmcsaData?.dotNumber || "",
        mcNumber: fmcsaData?.mcNumber || "",
        adminCode: data.adminBypassCode
      };
      const response = await apiRequest("POST", "/api/register", registrationData);
      return response.json();
    },
    onSuccess: (response) => {
      toast({
        title: "Registration Successful",
        description: "Welcome to FreightOps Pro! Redirecting to dashboard...",
      });
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    },
    onError: (error: any) => {
      let errorMessage = error.message || "Failed to create account";
      let errorTitle = "Registration Failed";
      
      // Handle specific error types
      if (error.message?.includes("USDOT number") && error.message?.includes("already registered")) {
        errorTitle = "Company Already Registered";
        errorMessage = error.message + " You may already have an account or need to contact your company administrator.";
      } else if (error.message?.includes("MC number") && error.message?.includes("already registered")) {
        errorTitle = "Company Already Registered";
        errorMessage = error.message + " You may already have an account or need to contact your company administrator.";
      } else if (error.message?.includes("email already exists")) {
        errorTitle = "Email Already in Use";
        errorMessage = "An account with this email already exists. Try signing in instead.";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleBusinessTypeSubmit = (data: BusinessTypeForm) => {
    setSelectedBusinessType(data.businessType);
    if (data.businessType === "dispatcher") {
      setCurrentStep(3); // Skip DOT verification for dispatch companies
    } else {
      setCurrentStep(2); // Go to DOT verification for carriers and brokers
    }
  };

  const handleDotVerification = (data: DotVerificationForm) => {
    setIsVerifying(true);
    verifyDotMutation.mutate(data);
  };

  const handleContainerServiceSubmit = (data: ContainerServiceForm) => {
    setContainerServiceData(data);
    setCurrentStep(4); // Move to final registration
  };

  const handleFinalRegistration = (data: FinalRegistrationForm) => {
    const registrationData = {
      ...data,
      businessType: selectedBusinessType,
      fmcsaData,
      containerService: containerServiceData
    };
    registerMutation.mutate(registrationData);
  };

  const businessTypes = [
    {
      id: "carrier",
      name: "Motor Carrier",
      description: "Trucking company that owns and operates vehicles",
      icon: Truck,
      price: 150,
      features: [
        "Complete fleet management system",
        "Driver management & HR tools", 
        "ELD compliance & integration",
        "Load tracking & dispatch",
        "Safety & compliance monitoring",
        "Maintenance scheduling",
        "FMCSA integration",
        "Financial management",
        "Insurance tracking",
        "Unlimited vehicles & drivers"
      ]
    },
    {
      id: "broker",
      name: "Freight Broker",
      description: "Connects shippers with carriers",
      icon: Building2,
      price: 150,
      features: [
        "Carrier network management",
        "Load board integrations",
        "Customer relationship management",
        "Margin tracking & analysis",
        "Document management",
        "Carrier verification (FMCSA)",
        "Load matching & optimization",
        "Financial reporting",
        "Commission tracking",
        "Unlimited loads & customers"
      ]
    },
    {
      id: "dispatcher",
      name: "Dispatch Company",
      description: "Provides dispatching services to owner-operators",
      icon: Users,
      price: 50,
      features: [
        "Basic load dispatching",
        "Route optimization",
        "Driver communication",
        "Load documentation",
        "Basic reporting",
        "Customer management",
        "Simple invoicing",
        "Up to 5 drivers"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <img src={logoImage} alt="FreightOps Pro" className="h-20 w-auto mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join FreightOps Pro</h1>
          <p className="text-gray-600">Get started with the leading trucking management platform</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <div className={`w-12 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
            </div>
            <div className={`w-12 h-0.5 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {currentStep > 3 ? <Check className="w-4 h-4" /> : '3'}
            </div>
            <div className={`w-12 h-0.5 ${currentStep >= 4 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {currentStep > 4 ? <Check className="w-4 h-4" /> : '4'}
            </div>
          </div>
        </div>

        {/* Step 1: Business Type Selection */}
        {currentStep === 1 && (
          <Card className="mx-auto max-w-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">What type of business are you?</CardTitle>
              <p className="text-gray-600">Select the option that best describes your company</p>
            </CardHeader>
            <CardContent>
              <Form {...businessTypeForm}>
                <form onSubmit={businessTypeForm.handleSubmit(handleBusinessTypeSubmit)} className="space-y-6">
                  <FormField
                    control={businessTypeForm.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid gap-4">
                            {businessTypes.map((type) => {
                              const Icon = type.icon;
                              return (
                                <label
                                  key={type.id}
                                  className={`relative flex cursor-pointer rounded-lg border p-6 transition-all hover:bg-gray-50 ${
                                    field.value === type.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    value={type.id}
                                    checked={field.value === type.id}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    className="sr-only"
                                  />
                                  <div className="flex items-start space-x-4">
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                                      field.value === type.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <h3 className="text-lg font-semibold text-gray-900">{type.name}</h3>
                                          <div className="flex items-center gap-2 mt-1">
                                            <span className="text-2xl font-bold text-blue-600">${type.price}</span>
                                            <span className="text-sm text-gray-500">/month</span>
                                            {type.id === "dispatcher" && (
                                              <Badge variant="outline" className="text-xs">Basic Plan</Badge>
                                            )}
                                          </div>
                                        </div>
                                        {field.value === type.id && (
                                          <CheckCircle className="w-5 h-5 text-blue-600" />
                                        )}
                                      </div>
                                      <p className="text-gray-600 mb-3 mt-2">{type.description}</p>
                                      <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-gray-900">What's included:</h4>
                                        <div className="grid grid-cols-1 gap-1">
                                          {type.features.slice(0, 6).map((feature, idx) => (
                                            <div key={idx} className="flex items-center text-sm text-gray-600">
                                              <Check className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                                              {feature}
                                            </div>
                                          ))}
                                          {type.features.length > 6 && (
                                            <div className="text-xs text-gray-500 mt-1">
                                              +{type.features.length - 6} more features
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" className="px-8">
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: DOT/MC Verification */}
        {currentStep === 2 && (
          <Card className="mx-auto max-w-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Verify Your Company</CardTitle>
              <p className="text-gray-600">
                Enter either your DOT or MC number to verify your company information
              </p>
            </CardHeader>
            <CardContent>
              <Form {...dotVerificationForm}>
                <form onSubmit={dotVerificationForm.handleSubmit(handleDotVerification)} className="space-y-6">
                  <FormField
                    control={dotVerificationForm.control}
                    name="dotNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DOT Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your DOT number (e.g., 1234567)" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your U.S. Department of Transportation number
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="text-center text-sm text-gray-500">
                    OR
                  </div>
                  
                  <FormField
                    control={dotVerificationForm.control}
                    name="mcNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MC Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your MC number (e.g., MC-123456)" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your Motor Carrier authority number
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-900 font-medium mb-2">
                          Don't know your DOT or MC number?
                        </p>
                        <p className="text-sm text-blue-800 mb-3">
                          You can look up your company information using the FMCSA Safer web search tool.
                        </p>
                        <a
                          href="https://safer.fmcsa.dot.gov/CompanySnapshot.aspx"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-blue-700 hover:text-blue-900 underline"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Search FMCSA Safer Database
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      We'll verify your company information with the FMCSA database to ensure accuracy and compliance.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setCurrentStep(1)}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={verifyDotMutation.isPending}
                      className="px-8"
                    >
                      {verifyDotMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify & Continue <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Container Service Detection */}
        {currentStep === 3 && (
          <Card className="mx-auto max-w-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Do you handle shipping containers?</CardTitle>
              <p className="text-gray-600">This helps us customize your platform features</p>
            </CardHeader>
            <CardContent>
              <Form {...containerServiceForm}>
                <form onSubmit={containerServiceForm.handleSubmit(handleContainerServiceSubmit)} className="space-y-6">
                  <FormField
                    control={containerServiceForm.control}
                    name="handlesContainers"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormControl>
                          <div className="grid grid-cols-2 gap-4">
                            <div 
                              className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                                field.value === true ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => {
                                field.onChange(true);
                                containerServiceForm.setValue('containerServiceTier', 'premium');
                              }}
                            >
                              <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <Building2 className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">Yes, we handle containers</h3>
                                <p className="text-sm text-gray-600">We transport shipping containers from ports</p>
                              </div>
                            </div>
                            <div 
                              className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                                field.value === false ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => {
                                field.onChange(false);
                                containerServiceForm.setValue('containerServiceTier', 'none');
                              }}
                            >
                              <div className="text-center">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <Truck className="w-6 h-6 text-gray-600" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">No, we don't handle containers</h3>
                                <p className="text-sm text-gray-600">We handle other freight types</p>
                              </div>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {containerServiceForm.watch('handlesContainers') && (
                    <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center mb-3">
                        <Info className="w-5 h-5 text-blue-600 mr-2" />
                        <h4 className="font-semibold text-blue-900">Container Management Add-On Available</h4>
                      </div>
                      <div className="space-y-3 text-sm">
                        <p className="text-blue-800">
                          Since you handle containers, we can add our premium container management features:
                        </p>
                        <ul className="list-disc list-inside text-blue-700 space-y-1 ml-4">
                          <li>13-field container tracking integration</li>
                          <li>Port-specific chassis provider management</li>
                          <li>SSL-specific demurrage tracking (MSC, COSCO, MAERSK, HAPAG)</li>
                          <li>Automatic chassis assignment alerts</li>
                          <li>Container cost optimization dashboard</li>
                          <li>Real-time port operations monitoring</li>
                        </ul>
                        <div className="mt-4 p-3 bg-white rounded border">
                          <p className="font-semibold text-blue-900">Premium Container Management: Contact for pricing</p>
                          <p className="text-xs text-blue-600 mt-1">Can be added or removed anytime from your account settings</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setCurrentStep(selectedBusinessType === "dispatcher" ? 1 : 2)}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button type="submit" className="px-8">
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Final Registration */}
        {currentStep === 4 && (
          <Card className="mx-auto max-w-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Complete Your Registration</CardTitle>
              <p className="text-gray-600">
                {fmcsaData ? "Verify your details and create your account" : "Create your FreightOps Pro account"}
              </p>
            </CardHeader>
            <CardContent>
              {/* FMCSA Verified Company Info */}
              {fmcsaData && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <h4 className="font-semibold text-green-900">Company Verified</h4>
                  </div>
                  <div className="text-sm text-green-800 space-y-1">
                    <p><strong>Company:</strong> {fmcsaData.companyName}</p>
                    <p><strong>Address:</strong> {fmcsaData.address}</p>
                    <p><strong>DOT:</strong> {fmcsaData.dotNumber}</p>
                    {fmcsaData.mcNumber && <p><strong>MC:</strong> {fmcsaData.mcNumber}</p>}
                    {fmcsaData.safetyRating && <p><strong>Safety Rating:</strong> {fmcsaData.safetyRating}</p>}
                  </div>
                </div>
              )}

              <Form {...finalRegistrationForm}>
                <form onSubmit={finalRegistrationForm.handleSubmit(handleFinalRegistration)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={finalRegistrationForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={finalRegistrationForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={finalRegistrationForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={finalRegistrationForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={finalRegistrationForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                {...field} 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={finalRegistrationForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={finalRegistrationForm.control}
                    name="adminBypassCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Bypass Code (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter admin code for free access" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={finalRegistrationForm.control}
                    name="acceptTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I accept the Terms of Service and Privacy Policy *
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Your FreightOps Pro Plan</h4>
                    {(() => {
                      const selectedPlan = businessTypes.find(type => type.id === selectedBusinessType);
                      if (!selectedPlan) return null;
                      
                      return (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{selectedPlan.name}</span>
                            <span className="text-lg font-bold text-blue-600">${selectedPlan.price}/month</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {selectedPlan.id === "dispatcher" ? "Basic plan" : "Full platform access"} • 14-day free trial • Cancel anytime
                          </p>
                          <div className="space-y-1">
                            <h5 className="text-sm font-medium text-gray-900">Plan includes:</h5>
                            {selectedPlan.features.slice(0, 4).map((feature, idx) => (
                              <div key={idx} className="flex items-center text-xs text-gray-600">
                                <Check className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                                {feature}
                              </div>
                            ))}
                            {selectedPlan.features.length > 4 && (
                              <div className="text-xs text-gray-500 mt-1">
                                +{selectedPlan.features.length - 4} more features included
                              </div>
                            )}
                          </div>
                          {selectedPlan.id !== "dispatcher" && (
                            <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                              Additional users: Contact for pricing
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setCurrentStep(selectedBusinessType === "dispatcher" ? 1 : 2)}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={registerMutation.isPending}
                      className="px-8"
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Account
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Sign in here
          </a>
        </div>
      </div>
    </div>
  );
}