import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Users, 
  UserPlus, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Download,
  DollarSign,
  Calendar,
  TrendingUp,
  Building
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Form schemas
const employeeApplicationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  ssn: z.string().min(9, "Valid SSN is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "Valid zip code is required"),
  cdlNumber: z.string().min(1, "CDL number is required"),
  cdlClass: z.enum(["A", "B", "C"]),
  cdlState: z.string().min(1, "CDL state is required"),
  cdlExpirationDate: z.string().min(1, "CDL expiration date is required"),
});

const gustoEmployeeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  ssn: z.string().min(9, "Valid SSN is required"),
  startDate: z.string().min(1, "Start date is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  payRate: z.string().min(1, "Pay rate is required"),
  paymentUnit: z.enum(["Hour", "Year", "Month", "Week", "Day"]),
});

export default function HRDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Queries
  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['/api/hr/tenant/applications'],
    queryFn: () => apiRequest('GET', '/api/hr/tenant/applications'),
  });

  const { data: gustoIntegration } = useQuery({
    queryKey: ['/api/hr/tenant/gusto/integration'],
    queryFn: () => apiRequest('GET', '/api/hr/tenant/gusto/integration'),
  });

  const { data: payrolls } = useQuery({
    queryKey: ['/api/hr/tenant/gusto/payrolls'],
    queryFn: () => apiRequest('GET', '/api/hr/tenant/gusto/payrolls'),
  });

  // Mutations
  const createApplicationMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/hr/tenant/applications', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/tenant/applications'] });
      toast({ title: "Application created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error creating application", description: error.message, variant: "destructive" });
    },
  });

  const updateApplicationStatusMutation = useMutation({
    mutationFn: ({ applicationId, status, notes }: any) => 
      apiRequest('PATCH', `/api/hr/tenant/applications/${applicationId}/status`, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/tenant/applications'] });
      toast({ title: "Application status updated" });
    },
  });

  const orderBackgroundChecksMutation = useMutation({
    mutationFn: ({ applicationId, checkTypes }: any) => 
      apiRequest('POST', `/api/hr/tenant/applications/${applicationId}/background-checks`, { checkTypes }),
    onSuccess: () => {
      toast({ title: "Background checks ordered successfully" });
    },
  });

  const createGustoEmployeeMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/hr/tenant/gusto/employees', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/tenant/gusto/employees'] });
      toast({ title: "Employee created in Gusto successfully" });
    },
  });

  const syncGustoEmployeesMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/hr/tenant/gusto/sync-employees'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hr/tenant/gusto/employees'] });
      toast({ title: "Employees synced with Gusto successfully" });
    },
  });

  // Forms
  const applicationForm = useForm({
    resolver: zodResolver(employeeApplicationSchema),
  });

  const gustoEmployeeForm = useForm({
    resolver: zodResolver(gustoEmployeeSchema),
  });

  // Handlers
  const handleCreateApplication = (data: any) => {
    createApplicationMutation.mutate({
      ...data,
      employmentHistory: [],
      safetyRecord: { accidents: [], violations: [], suspensions: [] },
      references: [],
      consent: {
        backgroundCheck: true,
        drugScreen: true,
        mvr: true,
        psp: true,
        digitalSignature: "Digital signature placeholder",
        signatureDate: new Date().toISOString(),
        ipAddress: "127.0.0.1"
      }
    });
  };

  const handleUpdateApplicationStatus = (applicationId: string, status: string, notes?: string) => {
    updateApplicationStatusMutation.mutate({ applicationId, status, notes });
  };

  const handleOrderBackgroundChecks = (applicationId: string, checkTypes: string[]) => {
    orderBackgroundChecksMutation.mutate({ applicationId, checkTypes });
  };

  const handleCreateGustoEmployee = (data: any) => {
    createGustoEmployeeMutation.mutate({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      ssn: data.ssn,
      startDate: data.startDate,
      homeAddress: {
        street_1: "123 Main St",
        city: "City",
        state: "State",
        zip: "12345"
      },
      jobData: {
        title: data.jobTitle,
        hire_date: data.startDate,
        location_id: "default-location"
      },
      compensationData: {
        rate: data.payRate,
        payment_unit: data.paymentUnit,
        flsa_status: "Nonexempt",
        effective_date: data.startDate
      }
    });
  };

  // Status badge helper
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      submitted: { label: "Submitted", variant: "secondary" as const },
      under_review: { label: "Under Review", variant: "default" as const },
      background_check: { label: "Background Check", variant: "default" as const },
      approved: { label: "Approved", variant: "success" as const },
      rejected: { label: "Rejected", variant: "destructive" as const },
      onboarding: { label: "Onboarding", variant: "default" as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "default" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Overview metrics
  const totalApplications = applications?.applications?.length || 0;
  const pendingApplications = applications?.applications?.filter((app: any) => app.applicationStatus === 'submitted').length || 0;
  const approvedApplications = applications?.applications?.filter((app: any) => app.applicationStatus === 'approved').length || 0;
  const onboardingApplications = applications?.applications?.filter((app: any) => app.applicationStatus === 'onboarding').length || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">HR Management</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Comprehensive employee lifecycle management with Gusto integration and DOT compliance
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalApplications}</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingApplications}</div>
                  <p className="text-xs text-muted-foreground">Requires attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{approvedApplications}</div>
                  <p className="text-xs text-muted-foreground">Ready for onboarding</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Onboarding</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{onboardingApplications}</div>
                  <p className="text-xs text-muted-foreground">Active onboarding</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>Latest driver applications and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {applications?.applications?.slice(0, 5).map((app: any) => (
                      <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">{app.firstName} {app.lastName}</p>
                          <p className="text-sm text-muted-foreground">{app.email}</p>
                        </div>
                        {getStatusBadge(app.applicationStatus)}
                      </div>
                    )) || (
                      <p className="text-muted-foreground">No applications yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gusto Integration Status</CardTitle>
                  <CardDescription>Payroll and benefits management integration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {gustoIntegration ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Status</span>
                          <Badge variant="success">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Last Sync</span>
                          <span className="text-sm text-muted-foreground">
                            {gustoIntegration.lastSyncDate ? new Date(gustoIntegration.lastSyncDate).toLocaleDateString() : 'Never'}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => syncGustoEmployeesMutation.mutate()}
                          disabled={syncGustoEmployeesMutation.isPending}
                        >
                          Sync Employees
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Building className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground mb-4">Gusto integration not configured</p>
                        <Button size="sm">Setup Gusto Integration</Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Driver Applications</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    New Application
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Driver Application</DialogTitle>
                    <DialogDescription>
                      Start the DOT-compliant driver application process
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...applicationForm}>
                    <form onSubmit={applicationForm.handleSubmit(handleCreateApplication)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={applicationForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={applicationForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={applicationForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={applicationForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={applicationForm.control}
                          name="cdlNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CDL Number</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={applicationForm.control}
                          name="cdlClass"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CDL Class</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select class" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="A">Class A</SelectItem>
                                  <SelectItem value="B">Class B</SelectItem>
                                  <SelectItem value="C">Class C</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={applicationForm.control}
                          name="cdlState"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CDL State</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button type="submit" disabled={createApplicationMutation.isPending}>
                          {createApplicationMutation.isPending ? "Creating..." : "Create Application"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applicant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          CDL Info
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applied
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {applications?.applications?.map((app: any) => (
                        <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {app.firstName} {app.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{app.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              Class {app.cdlClass} - {app.cdlNumber}
                            </div>
                            <div className="text-sm text-gray-500">{app.cdlState}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(app.applicationStatus)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(app.applicationDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {app.applicationStatus === 'submitted' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleUpdateApplicationStatus(app.id, 'approved')}
                                >
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleOrderBackgroundChecks(app.id, ['PSP', 'MVR', 'CDLIS', 'drug_screen'])}
                                >
                                  Order Checks
                                </Button>
                              </>
                            )}
                          </td>
                        </tr>
                      )) || (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                            No applications found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payroll Tab */}
          <TabsContent value="payroll" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Payroll Management</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Employee to Gusto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Employee in Gusto</DialogTitle>
                    <DialogDescription>
                      Add a new employee to the Gusto payroll system
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...gustoEmployeeForm}>
                    <form onSubmit={gustoEmployeeForm.handleSubmit(handleCreateGustoEmployee)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={gustoEmployeeForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={gustoEmployeeForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={gustoEmployeeForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={gustoEmployeeForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={gustoEmployeeForm.control}
                          name="jobTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Job Title</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={gustoEmployeeForm.control}
                          name="payRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pay Rate</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={gustoEmployeeForm.control}
                          name="paymentUnit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Unit</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select unit" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Hour">Hour</SelectItem>
                                  <SelectItem value="Year">Year</SelectItem>
                                  <SelectItem value="Month">Month</SelectItem>
                                  <SelectItem value="Week">Week</SelectItem>
                                  <SelectItem value="Day">Day</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button type="submit" disabled={createGustoEmployeeMutation.isPending}>
                          {createGustoEmployeeMutation.isPending ? "Creating..." : "Create Employee"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Payroll Summary</CardTitle>
                <CardDescription>Recent payroll runs and employee information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payrolls?.payrolls?.length > 0 ? (
                    payrolls.payrolls.map((payroll: any) => (
                      <div key={payroll.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">
                            Pay Period: {new Date(payroll.pay_period.start_date).toLocaleDateString()} - {new Date(payroll.pay_period.end_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Check Date: {new Date(payroll.check_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">${payroll.totals?.gross_pay || '0.00'}</p>
                          <Badge variant={payroll.processed ? "success" : "secondary"}>
                            {payroll.processed ? "Processed" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No payroll data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onboarding Tab */}
          <TabsContent value="onboarding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Onboarding Pipeline</CardTitle>
                <CardDescription>Track new hire onboarding progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No active onboarding processes</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Employee Documents</CardTitle>
                <CardDescription>Manage DOT-compliant employee documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No documents uploaded yet</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>DOT Compliance Dashboard</CardTitle>
                <CardDescription>Monitor regulatory compliance status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Compliance monitoring coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}