/**
 * Unified Onboarding Interface
 * Complete employee application → driver → payroll → accounting → Gusto integration
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Truck, DollarSign, Shield, CheckCircle } from "lucide-react";

const onboardingSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Phone number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  ssn: z.string().optional(),
  
  // Employment Information
  position: z.enum(['driver', 'office', 'mechanic', 'dispatcher']),
  department: z.string().min(1, "Department is required"),
  hireDate: z.string().min(1, "Hire date is required"),
  
  // Driver-specific (conditional)
  cdlNumber: z.string().optional(),
  cdlClass: z.string().optional(),
  cdlExpiration: z.string().optional(),
  hazmatEndorsement: z.boolean().optional(),
  
  // Compensation
  payType: z.enum(['hourly', 'mile', 'salary']),
  payRate: z.coerce.number().min(0.01, "Pay rate must be greater than 0"),
  
  // Benefits
  wantsBenefits: z.boolean(),
  healthInsurance: z.boolean().optional(),
  dentalInsurance: z.boolean().optional(),
  visionInsurance: z.boolean().optional(),
  retirement401k: z.boolean().optional(),
  
  // Address
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "ZIP code is required"),
  
  // Emergency Contact
  emergencyContactName: z.string().min(1, "Emergency contact name is required"),
  emergencyContactRelationship: z.string().min(1, "Relationship is required"),
  emergencyContactPhone: z.string().min(10, "Emergency contact phone is required"),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export function UnifiedOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingResult, setOnboardingResult] = useState<any>(null);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      position: 'driver',
      payType: 'mile',
      wantsBenefits: true,
      hazmatEndorsement: false,
      healthInsurance: false,
      dentalInsurance: false,
      visionInsurance: false,
      retirement401k: false,
    }
  });

  const watchPosition = form.watch("position");
  const watchWantsBenefits = form.watch("wantsBenefits");

  const onboardingMutation = useMutation({
    mutationFn: async (data: OnboardingFormData) => {
      return apiRequest('/api/onboarding/submit', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (result) => {
      setOnboardingResult(result);
      setCurrentStep(5); // Success step
    },
    onError: (error) => {
      console.error('Onboarding failed:', error);
    }
  });

  const onSubmit = (data: OnboardingFormData) => {
    onboardingMutation.mutate(data);
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  if (currentStep === 5 && onboardingResult) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-green-700">Onboarding Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Employee successfully onboarded across all systems
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold">Systems Created:</Label>
                <ul className="space-y-1 text-sm">
                  {onboardingResult.employeeId && <li>✓ Employee Record</li>}
                  {onboardingResult.driverId && <li>✓ Driver Profile</li>}
                  {onboardingResult.userId && <li>✓ User Account</li>}
                  {onboardingResult.gustoEmployeeId && <li>✓ Gusto Payroll</li>}
                  <li>✓ Accounting Integration</li>
                </ul>
              </div>

              {onboardingResult.loginCredentials && (
                <div className="space-y-2">
                  <Label className="font-semibold">Login Information:</Label>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p><strong>Email:</strong> {onboardingResult.loginCredentials.email}</p>
                    <p><strong>Temp Password:</strong> {onboardingResult.loginCredentials.temporaryPassword}</p>
                    <p className="text-orange-600 text-xs mt-1">
                      Password must be changed on first login
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <Label className="font-semibold">Next Steps:</Label>
              <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                {onboardingResult.nextSteps?.map((step: string, index: number) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>

            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              Start New Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Employee Onboarding</h1>
        <p className="text-gray-600 mt-2">
          Complete application creates records across drivers, payroll, accounting, and Gusto systems
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
              `}>
                {step}
              </div>
              {step < 4 && (
                <div className={`
                  h-1 w-20 mx-2
                  ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>Personal Info</span>
          <span>Employment</span>
          <span>Compensation</span>
          <span>Review</span>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs value={currentStep.toString()} className="space-y-6">
          {/* Step 1: Personal Information */}
          <TabsContent value="1" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    {...form.register("firstName")}
                    placeholder="John"
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...form.register("lastName")}
                    placeholder="Doe"
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.lastName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    placeholder="john.doe@company.com"
                  />
                  {form.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    {...form.register("phone")}
                    placeholder="(555) 123-4567"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...form.register("dateOfBirth")}
                  />
                  {form.formState.errors.dateOfBirth && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.dateOfBirth.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="ssn">SSN (Optional)</Label>
                  <Input
                    id="ssn"
                    {...form.register("ssn")}
                    placeholder="XXX-XX-XXXX"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    {...form.register("address")}
                    placeholder="123 Main Street"
                  />
                  {form.formState.errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.address.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    {...form.register("city")}
                    placeholder="New York"
                  />
                  {form.formState.errors.city && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    {...form.register("state")}
                    placeholder="NY"
                    maxLength={2}
                  />
                  {form.formState.errors.state && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.state.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    {...form.register("zipCode")}
                    placeholder="10001"
                  />
                  {form.formState.errors.zipCode && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.zipCode.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContactName">Contact Name *</Label>
                  <Input
                    id="emergencyContactName"
                    {...form.register("emergencyContactName")}
                    placeholder="Jane Doe"
                  />
                  {form.formState.errors.emergencyContactName && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.emergencyContactName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="emergencyContactRelationship">Relationship *</Label>
                  <Input
                    id="emergencyContactRelationship"
                    {...form.register("emergencyContactRelationship")}
                    placeholder="Spouse"
                  />
                  {form.formState.errors.emergencyContactRelationship && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.emergencyContactRelationship.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="emergencyContactPhone">Contact Phone *</Label>
                  <Input
                    id="emergencyContactPhone"
                    {...form.register("emergencyContactPhone")}
                    placeholder="(555) 987-6543"
                  />
                  {form.formState.errors.emergencyContactPhone && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.emergencyContactPhone.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="button" onClick={nextStep}>
                Next: Employment Info
              </Button>
            </div>
          </TabsContent>

          {/* Step 2: Employment Information */}
          <TabsContent value="2" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Employment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position">Position *</Label>
                  <Select onValueChange={(value) => form.setValue("position", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="driver">Driver</SelectItem>
                      <SelectItem value="office">Office Staff</SelectItem>
                      <SelectItem value="mechanic">Mechanic</SelectItem>
                      <SelectItem value="dispatcher">Dispatcher</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.position && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.position.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    {...form.register("department")}
                    placeholder="Operations"
                  />
                  {form.formState.errors.department && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.department.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="hireDate">Hire Date *</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    {...form.register("hireDate")}
                  />
                  {form.formState.errors.hireDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.hireDate.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Driver-specific fields */}
            {watchPosition === 'driver' && (
              <Card>
                <CardHeader>
                  <CardTitle>CDL Information</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cdlNumber">CDL Number</Label>
                    <Input
                      id="cdlNumber"
                      {...form.register("cdlNumber")}
                      placeholder="CDL123456789"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cdlClass">CDL Class</Label>
                    <Select onValueChange={(value) => form.setValue("cdlClass", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select CDL class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CDL-A">CDL-A</SelectItem>
                        <SelectItem value="CDL-B">CDL-B</SelectItem>
                        <SelectItem value="CDL-C">CDL-C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="cdlExpiration">CDL Expiration</Label>
                    <Input
                      id="cdlExpiration"
                      type="date"
                      {...form.register("cdlExpiration")}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hazmatEndorsement"
                      checked={form.watch("hazmatEndorsement")}
                      onCheckedChange={(checked) => form.setValue("hazmatEndorsement", checked as boolean)}
                    />
                    <Label htmlFor="hazmatEndorsement">HAZMAT Endorsement</Label>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={prevStep}>
                Previous
              </Button>
              <Button type="button" onClick={nextStep}>
                Next: Compensation
              </Button>
            </div>
          </TabsContent>

          {/* Step 3: Compensation & Benefits */}
          <TabsContent value="3" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Compensation
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payType">Pay Type *</Label>
                  <Select onValueChange={(value) => form.setValue("payType", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pay type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="mile">Per Mile</SelectItem>
                      <SelectItem value="salary">Salary</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.payType && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.payType.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="payRate">
                    Pay Rate * 
                    {form.watch("payType") === 'hourly' && ' (per hour)'}
                    {form.watch("payType") === 'mile' && ' (per mile)'}
                    {form.watch("payType") === 'salary' && ' (annual)'}
                  </Label>
                  <Input
                    id="payRate"
                    type="number"
                    step="0.01"
                    {...form.register("payRate")}
                    placeholder="0.00"
                  />
                  {form.formState.errors.payRate && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.payRate.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="wantsBenefits"
                    checked={form.watch("wantsBenefits")}
                    onCheckedChange={(checked) => form.setValue("wantsBenefits", checked as boolean)}
                  />
                  <Label htmlFor="wantsBenefits">I want to enroll in benefits</Label>
                </div>

                {watchWantsBenefits && (
                  <div className="ml-6 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="healthInsurance"
                        checked={form.watch("healthInsurance")}
                        onCheckedChange={(checked) => form.setValue("healthInsurance", checked as boolean)}
                      />
                      <Label htmlFor="healthInsurance">Health Insurance</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="dentalInsurance"
                        checked={form.watch("dentalInsurance")}
                        onCheckedChange={(checked) => form.setValue("dentalInsurance", checked as boolean)}
                      />
                      <Label htmlFor="dentalInsurance">Dental Insurance</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="visionInsurance"
                        checked={form.watch("visionInsurance")}
                        onCheckedChange={(checked) => form.setValue("visionInsurance", checked as boolean)}
                      />
                      <Label htmlFor="visionInsurance">Vision Insurance</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="retirement401k"
                        checked={form.watch("retirement401k")}
                        onCheckedChange={(checked) => form.setValue("retirement401k", checked as boolean)}
                      />
                      <Label htmlFor="retirement401k">401(k) Retirement Plan</Label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={prevStep}>
                Previous
              </Button>
              <Button type="button" onClick={nextStep}>
                Review Application
              </Button>
            </div>
          </TabsContent>

          {/* Step 4: Review & Submit */}
          <TabsContent value="4" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Application</CardTitle>
                <p className="text-gray-600">
                  Please review all information before submitting. This will create records across all systems.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Upon submission, this application will automatically create:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Employee record in HR system</li>
                      {watchPosition === 'driver' && <li>Driver profile with CDL information</li>}
                      <li>User account with login credentials</li>
                      <li>Gusto payroll employee (if connected)</li>
                      <li>Accounting system integration</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold">Personal Information</h4>
                    <p>{form.watch("firstName")} {form.watch("lastName")}</p>
                    <p>{form.watch("email")}</p>
                    <p>{form.watch("phone")}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold">Employment</h4>
                    <p>Position: {form.watch("position")}</p>
                    <p>Department: {form.watch("department")}</p>
                    <p>Hire Date: {form.watch("hireDate")}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold">Compensation</h4>
                    <p>Pay Type: {form.watch("payType")}</p>
                    <p>Pay Rate: ${form.watch("payRate")}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold">Benefits</h4>
                    <p>{form.watch("wantsBenefits") ? "Enrolled in benefits" : "No benefits"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={prevStep}>
                Previous
              </Button>
              <Button 
                type="submit"
                disabled={onboardingMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {onboardingMutation.isPending ? "Processing..." : "Submit Application"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}