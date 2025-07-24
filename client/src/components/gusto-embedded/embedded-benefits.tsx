import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Heart, Shield, Eye, DollarSign, Users, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Gusto Embedded Benefits Component - White Label UX
export function EmbeddedBenefits() {
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  
  // Fetch benefits overview
  const { data: benefitsData, isLoading } = useQuery({
    queryKey: ['/api/gusto/benefits/overview'],
    retry: false,
  });
  
  // Fetch available plans
  const { data: availablePlans } = useQuery({
    queryKey: ['/api/gusto/benefits/plans'],
    retry: false,
  });
  
  // Fetch enrollment status
  const { data: enrollmentData } = useQuery({
    queryKey: ['/api/gusto/benefits/enrollment'],
    retry: false,
  });
  
  // Request benefits quote mutation
  const requestQuoteMutation = useMutation({
    mutationFn: async (quoteData: any) => {
      return apiRequest('POST', '/api/gusto/benefits/quote', quoteData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gusto/benefits/plans'] });
      setShowQuoteDialog(false);
    },
  });
  
  // Enroll employee mutation
  const enrollEmployeeMutation = useMutation({
    mutationFn: async (enrollmentData: any) => {
      return apiRequest('POST', '/api/gusto/benefits/enroll', enrollmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gusto/benefits/enrollment'] });
    },
  });
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Benefits Overview Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Benefits Administration</CardTitle>
              <CardDescription>
                Manage employee health insurance, dental, vision, and retirement plans
              </CardDescription>
            </div>
            <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
              <DialogTrigger asChild>
                <Button>
                  Request Benefits Quote
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Benefits Quote</DialogTitle>
                  <DialogDescription>
                    Get quotes for health, dental, vision, and retirement plans
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    We'll gather quotes from top carriers and present you with the best options for your team.
                  </p>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowQuoteDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => requestQuoteMutation.mutate({ companySize: benefitsData?.totalEmployees })}>
                      Request Quote
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Eligible Employees</p>
                <p className="font-semibold">{benefitsData?.eligibleEmployees || 0}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Enrolled</p>
                <p className="font-semibold">{benefitsData?.enrolledEmployees || 0}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Monthly Cost</p>
                <p className="font-semibold">${benefitsData?.monthlyCost || '0.00'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Open Enrollment</p>
                <p className="font-semibold">{benefitsData?.openEnrollmentStatus || 'Closed'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Benefits Management Tabs */}
      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="plans">Available Plans</TabsTrigger>
          <TabsTrigger value="enrollment">Employee Enrollment</TabsTrigger>
          <TabsTrigger value="carriers">Carrier Management</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>
        
        {/* Available Plans Tab */}
        <TabsContent value="plans" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Medical Insurance */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  <CardTitle>Medical Insurance</CardTitle>
                </div>
                <CardDescription>Health coverage plans for employees and families</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {availablePlans?.medical?.map((plan: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{plan.name}</h3>
                      <Badge variant="outline">{plan.carrier.name}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                      <div>Employee: ${plan.premium.employee}/mo</div>
                      <div>Family: ${plan.premium.employee_family}/mo</div>
                      <div>Deductible: ${plan.deductible.individual}</div>
                      <div>Out-of-pocket: ${plan.out_of_pocket_max.individual}</div>
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      {plan.isSelected ? 'Selected' : 'Select Plan'}
                    </Button>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <Heart className="h-12 w-12 mx-auto mb-4" />
                    <p>Request a quote to see available medical plans</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Dental Insurance */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <CardTitle>Dental Insurance</CardTitle>
                </div>
                <CardDescription>Dental coverage for preventive and major care</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {availablePlans?.dental?.map((plan: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{plan.name}</h3>
                      <Badge variant="outline">{plan.carrier.name}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                      <div>Employee: ${plan.premium.employee}/mo</div>
                      <div>Family: ${plan.premium.employee_family}/mo</div>
                      <div>Annual Max: ${plan.annual_maximum}</div>
                      <div>Preventive: {plan.preventive_coverage}%</div>
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      {plan.isSelected ? 'Selected' : 'Select Plan'}
                    </Button>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="h-12 w-12 mx-auto mb-4" />
                    <p>Request a quote to see available dental plans</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Vision Insurance */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-green-600" />
                  <CardTitle>Vision Insurance</CardTitle>
                </div>
                <CardDescription>Eye care coverage for exams and eyewear</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {availablePlans?.vision?.map((plan: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{plan.name}</h3>
                      <Badge variant="outline">{plan.carrier.name}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                      <div>Employee: ${plan.premium.employee}/mo</div>
                      <div>Family: ${plan.premium.employee_family}/mo</div>
                      <div>Exam Copay: ${plan.exam_copay}</div>
                      <div>Frame Allowance: ${plan.frame_allowance}</div>
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      {plan.isSelected ? 'Selected' : 'Select Plan'}
                    </Button>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <Eye className="h-12 w-12 mx-auto mb-4" />
                    <p>Request a quote to see available vision plans</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Retirement Plans */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                  <CardTitle>401(k) Retirement</CardTitle>
                </div>
                <CardDescription>Retirement savings with company matching</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {availablePlans?.retirement?.map((plan: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{plan.name}</h3>
                      <Badge variant="outline">{plan.provider}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                      <div>Company Match: {plan.company_match}%</div>
                      <div>Vesting: {plan.vesting_schedule}</div>
                      <div>Admin Fee: ${plan.admin_fee}/mo</div>
                      <div>Investment Options: {plan.investment_count}</div>
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      {plan.isSelected ? 'Selected' : 'Select Plan'}
                    </Button>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="h-12 w-12 mx-auto mb-4" />
                    <p>Request a quote to see available retirement plans</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Employee Enrollment Tab */}
        <TabsContent value="enrollment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Enrollment Status</CardTitle>
              <CardDescription>
                Track employee benefit enrollment and completion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Overall Enrollment Progress</h3>
                  <span className="text-sm text-gray-600">
                    {benefitsData?.enrolledEmployees || 0} of {benefitsData?.eligibleEmployees || 0} enrolled
                  </span>
                </div>
                <Progress 
                  value={benefitsData?.enrollmentPercentage || 0} 
                  className="h-2"
                />
                
                {enrollmentData?.employees?.map((employee: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {employee.firstName?.[0]}{employee.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">{employee.firstName} {employee.lastName}</p>
                        <p className="text-sm text-gray-600">{employee.position}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Enrollment Status</p>
                        <Badge variant={employee.enrollmentStatus === 'completed' ? 'default' : 'secondary'}>
                          {employee.enrollmentStatus}
                        </Badge>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Benefits Selected</p>
                        <p className="text-sm">{employee.benefitsCount || 0} plans</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {employee.enrollmentStatus === 'pending' && (
                        <Button 
                          size="sm"
                          onClick={() => enrollEmployeeMutation.mutate({ employeeId: employee.id })}
                        >
                          Send Reminder
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4" />
                    <p>No employees eligible for benefits enrollment yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Carrier Management Tab */}
        <TabsContent value="carriers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Insurance Carriers</CardTitle>
              <CardDescription>
                Manage relationships with insurance providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Heart className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Blue Cross Blue Shield</h3>
                  <Badge variant="default" className="mb-3">Active</Badge>
                  <p className="text-sm text-gray-600 mb-4">Medical & Dental Coverage</p>
                  <Button size="sm" variant="outline">Manage</Button>
                </div>
                
                <div className="border rounded-lg p-4 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Eye className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">VSP Vision Care</h3>
                  <Badge variant="default" className="mb-3">Active</Badge>
                  <p className="text-sm text-gray-600 mb-4">Vision Insurance</p>
                  <Button size="sm" variant="outline">Manage</Button>
                </div>
                
                <div className="border rounded-lg p-4 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <DollarSign className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Fidelity 401(k)</h3>
                  <Badge variant="default" className="mb-3">Active</Badge>
                  <p className="text-sm text-gray-600 mb-4">Retirement Plans</p>
                  <Button size="sm" variant="outline">Manage</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Benefits Compliance</CardTitle>
              <CardDescription>
                Monitor ACA requirements and compliance status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-green-50">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold">ACA Compliance</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Company meets Affordable Care Act requirements for employer-sponsored health insurance.
                  </p>
                  <Badge variant="default">Compliant</Badge>
                </div>
                
                <div className="border rounded-lg p-4 bg-yellow-50">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <h3 className="font-semibold">COBRA Notifications</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    2 former employees need COBRA continuation coverage notifications.
                  </p>
                  <Button size="sm">Send Notifications</Button>
                </div>
                
                <div className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">Open Enrollment</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Next open enrollment period: November 1 - December 15, 2025
                  </p>
                  <Button size="sm" variant="outline">Schedule Enrollment</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}