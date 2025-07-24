import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Users, UserPlus, Calendar, DollarSign, Shield, FileText, 
  CheckCircle, AlertTriangle, Clock, Building, CreditCard,
  TrendingUp, Award, Heart, Eye, Plus, ExternalLink
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const employeeOnboardingSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().min(10, "Phone number is required"),
    ssn: z.string().min(9, "SSN is required"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    address: z.object({
      street1: z.string().min(1, "Street address is required"),
      street2: z.string().optional(),
      city: z.string().min(1, "City is required"),
      state: z.string().min(2, "State is required"),
      zipCode: z.string().min(5, "ZIP code is required"),
    }),
  }),
  employmentInfo: z.object({
    startDate: z.string().min(1, "Start date is required"),
    jobTitle: z.string().min(1, "Job title is required"),
    department: z.string().min(1, "Department is required"),
    payRate: z.number().min(1, "Pay rate is required"),
    payType: z.enum(["hourly", "salary"]),
    payFrequency: z.enum(["weekly", "biweekly", "monthly"]),
    workSchedule: z.object({
      hoursPerWeek: z.number().min(1, "Hours per week is required"),
      workDays: z.array(z.string()).min(1, "Work days are required"),
    }),
  }),
  benefitSelections: z.object({
    healthInsurance: z.boolean().optional(),
    dentalInsurance: z.boolean().optional(),
    visionInsurance: z.boolean().optional(),
    retirement401k: z.number().min(0).max(100).optional(),
    paidTimeOff: z.boolean().optional(),
  }),
  emergencyContact: z.object({
    name: z.string().min(1, "Emergency contact name is required"),
    relationship: z.string().min(1, "Relationship is required"),
    phone: z.string().min(10, "Emergency contact phone is required"),
  }),
  bankingInfo: z.object({
    accountType: z.enum(["checking", "savings"]),
    routingNumber: z.string().min(9, "Routing number is required"),
    accountNumber: z.string().min(1, "Account number is required"),
  }),
  taxWithholdings: z.object({
    federalAllowances: z.number().min(0),
    stateAllowances: z.number().min(0),
    extraWithholding: z.number().min(0),
    filingStatus: z.enum(["single", "married_filing_jointly", "married_filing_separately", "head_of_household"]),
  }),
});

const payrollRunSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  payDate: z.string().min(1, "Pay date is required"),
});

export default function EnterpriseHRPage() {
  const { toast } = useToast();
  const [showOnboardingDialog, setShowOnboardingDialog] = useState(false);
  const [showPayrollDialog, setShowPayrollDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  // Fetch Gusto integration status
  const { data: gustoStatus, isLoading: gustoLoading } = useQuery({
    queryKey: ["/api/tenant/hr/gusto-status"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/tenant/hr/gusto-status");
      return res.json();
    },
  });

  // Fetch Gusto employees
  const { data: gustoEmployees, isLoading: employeesLoading } = useQuery({
    queryKey: ["/api/tenant/hr/gusto/employees"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/tenant/hr/gusto/employees");
      return res.json();
    },
    enabled: gustoStatus?.gustoStatus?.configured,
  });

  // Fetch Gusto payrolls
  const { data: gustoPayrolls, isLoading: payrollsLoading } = useQuery({
    queryKey: ["/api/tenant/hr/gusto/payrolls"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/tenant/hr/gusto/payrolls");
      return res.json();
    },
    enabled: gustoStatus?.gustoStatus?.configured,
  });

  // Fetch compliance report
  const { data: complianceReport, isLoading: complianceLoading } = useQuery({
    queryKey: ["/api/tenant/hr/compliance-report"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/tenant/hr/compliance-report");
      return res.json();
    },
  });

  // Fetch tax liabilities
  const { data: taxLiabilities } = useQuery({
    queryKey: ["/api/tenant/hr/gusto/tax-liabilities"],
    queryFn: async () => {
      const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      const res = await apiRequest("GET", `/api/tenant/hr/gusto/tax-liabilities?start_date=${startDate}&end_date=${endDate}`);
      return res.json();
    },
    enabled: gustoStatus?.gustoStatus?.configured,
  });

  // Employee onboarding mutation
  const onboardEmployeeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof employeeOnboardingSchema>) => {
      const res = await apiRequest("POST", "/api/tenant/hr/onboard-employee", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Employee onboarding initiated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/hr/gusto/employees"] });
      setShowOnboardingDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initiate employee onboarding",
        variant: "destructive",
      });
    },
  });

  // Create payroll run mutation
  const createPayrollMutation = useMutation({
    mutationFn: async (data: z.infer<typeof payrollRunSchema>) => {
      const res = await apiRequest("POST", "/api/tenant/hr/payroll-run", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payroll run created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/hr/gusto/payrolls"] });
      setShowPayrollDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create payroll run",
        variant: "destructive",
      });
    },
  });

  // Submit payroll to Gusto mutation
  const submitPayrollMutation = useMutation({
    mutationFn: async (payrollId: string) => {
      const res = await apiRequest("POST", `/api/tenant/hr/submit-payroll/${payrollId}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payroll submitted to Gusto successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/hr/gusto/payrolls"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit payroll to Gusto",
        variant: "destructive",
      });
    },
  });

  const onboardingForm = useForm<z.infer<typeof employeeOnboardingSchema>>({
    resolver: zodResolver(employeeOnboardingSchema),
    defaultValues: {
      personalInfo: {
        address: {},
      },
      employmentInfo: {
        payType: "hourly",
        payFrequency: "biweekly",
        workSchedule: {
          hoursPerWeek: 40,
          workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        },
      },
      benefitSelections: {},
      emergencyContact: {},
      bankingInfo: {
        accountType: "checking",
      },
      taxWithholdings: {
        federalAllowances: 0,
        stateAllowances: 0,
        extraWithholding: 0,
        filingStatus: "single",
      },
    },
  });

  const payrollForm = useForm<z.infer<typeof payrollRunSchema>>({
    resolver: zodResolver(payrollRunSchema),
  });

  const onSubmitOnboarding = (data: z.infer<typeof employeeOnboardingSchema>) => {
    onboardEmployeeMutation.mutate(data);
  };

  const onSubmitPayroll = (data: z.infer<typeof payrollRunSchema>) => {
    createPayrollMutation.mutate(data);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="outline">Open</Badge>;
      case "processed":
        return <Badge variant="default">Processed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (gustoLoading || employeesLoading || payrollsLoading || complianceLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enterprise HR & Payroll</h1>
          <p className="text-muted-foreground">
            Complete employee management with Gusto integration
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showOnboardingDialog} onOpenChange={setShowOnboardingDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Onboard Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Employee Onboarding</DialogTitle>
                <DialogDescription>
                  Complete employee information for onboarding and Gusto integration
                </DialogDescription>
              </DialogHeader>
              <Form {...onboardingForm}>
                <form onSubmit={onboardingForm.handleSubmit(onSubmitOnboarding)} className="space-y-6">
                  <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="personal">Personal</TabsTrigger>
                      <TabsTrigger value="employment">Employment</TabsTrigger>
                      <TabsTrigger value="benefits">Benefits</TabsTrigger>
                      <TabsTrigger value="emergency">Emergency</TabsTrigger>
                      <TabsTrigger value="banking">Banking</TabsTrigger>
                    </TabsList>

                    <TabsContent value="personal" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={onboardingForm.control}
                          name="personalInfo.firstName"
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
                          control={onboardingForm.control}
                          name="personalInfo.lastName"
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
                        <FormField
                          control={onboardingForm.control}
                          name="personalInfo.email"
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
                          control={onboardingForm.control}
                          name="personalInfo.phone"
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
                        <FormField
                          control={onboardingForm.control}
                          name="personalInfo.ssn"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SSN</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={onboardingForm.control}
                          name="personalInfo.dateOfBirth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date of Birth</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium">Address</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={onboardingForm.control}
                            name="personalInfo.address.street1"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Street Address</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={onboardingForm.control}
                            name="personalInfo.address.street2"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Apt/Unit (Optional)</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={onboardingForm.control}
                            name="personalInfo.address.city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={onboardingForm.control}
                            name="personalInfo.address.state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={onboardingForm.control}
                            name="personalInfo.address.zipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ZIP Code</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="employment" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={onboardingForm.control}
                          name="employmentInfo.startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={onboardingForm.control}
                          name="employmentInfo.jobTitle"
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
                          control={onboardingForm.control}
                          name="employmentInfo.department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Department</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select department" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="operations">Operations</SelectItem>
                                  <SelectItem value="dispatch">Dispatch</SelectItem>
                                  <SelectItem value="maintenance">Maintenance</SelectItem>
                                  <SelectItem value="safety">Safety</SelectItem>
                                  <SelectItem value="administration">Administration</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={onboardingForm.control}
                          name="employmentInfo.payRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pay Rate</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={onboardingForm.control}
                          name="employmentInfo.payType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pay Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="hourly">Hourly</SelectItem>
                                  <SelectItem value="salary">Salary</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={onboardingForm.control}
                          name="employmentInfo.payFrequency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pay Frequency</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="biweekly">Biweekly</SelectItem>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="benefits" className="space-y-4">
                      <div className="space-y-4">
                        <h4 className="font-medium">Benefit Selections</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={onboardingForm.control}
                            name="benefitSelections.healthInsurance"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Health Insurance</FormLabel>
                                  <p className="text-sm text-muted-foreground">
                                    Comprehensive medical coverage
                                  </p>
                                </div>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={onboardingForm.control}
                            name="benefitSelections.dentalInsurance"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Dental Insurance</FormLabel>
                                  <p className="text-sm text-muted-foreground">
                                    Dental and oral health coverage
                                  </p>
                                </div>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={onboardingForm.control}
                            name="benefitSelections.visionInsurance"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Vision Insurance</FormLabel>
                                  <p className="text-sm text-muted-foreground">
                                    Eye care and vision coverage
                                  </p>
                                </div>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={onboardingForm.control}
                            name="benefitSelections.retirement401k"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>401(k) Contribution (%)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={onboardingForm.control}
                            name="benefitSelections.paidTimeOff"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Paid Time Off</FormLabel>
                                  <p className="text-sm text-muted-foreground">
                                    Vacation and sick leave benefits
                                  </p>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="emergency" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={onboardingForm.control}
                          name="emergencyContact.name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Emergency Contact Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={onboardingForm.control}
                          name="emergencyContact.relationship"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Relationship</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={onboardingForm.control}
                          name="emergencyContact.phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Emergency Contact Phone</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="banking" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={onboardingForm.control}
                          name="bankingInfo.accountType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="checking">Checking</SelectItem>
                                  <SelectItem value="savings">Savings</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={onboardingForm.control}
                          name="bankingInfo.routingNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Routing Number</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={onboardingForm.control}
                          name="bankingInfo.accountNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Number</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={onboardingForm.control}
                          name="taxWithholdings.filingStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Filing Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="single">Single</SelectItem>
                                  <SelectItem value="married_filing_jointly">Married Filing Jointly</SelectItem>
                                  <SelectItem value="married_filing_separately">Married Filing Separately</SelectItem>
                                  <SelectItem value="head_of_household">Head of Household</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={onboardingForm.control}
                          name="taxWithholdings.federalAllowances"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Federal Allowances</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={onboardingForm.control}
                          name="taxWithholdings.extraWithholding"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Extra Withholding</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowOnboardingDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={onboardEmployeeMutation.isPending}>
                      {onboardEmployeeMutation.isPending ? "Processing..." : "Start Onboarding"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={showPayrollDialog} onOpenChange={setShowPayrollDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Create Payroll
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Payroll Run</DialogTitle>
                <DialogDescription>
                  Set up a new payroll run for the pay period
                </DialogDescription>
              </DialogHeader>
              <Form {...payrollForm}>
                <form onSubmit={payrollForm.handleSubmit(onSubmitPayroll)} className="space-y-4">
                  <FormField
                    control={payrollForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pay Period Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={payrollForm.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pay Period End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={payrollForm.control}
                    name="payDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pay Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowPayrollDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createPayrollMutation.isPending}>
                      {createPayrollMutation.isPending ? "Creating..." : "Create Payroll Run"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Gusto Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Gusto Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                {gustoStatus?.gustoStatus?.configured ? (
                  <Badge className="bg-green-100 text-green-800">Connected</Badge>
                ) : (
                  <Badge variant="outline">Not Configured</Badge>
                )}
              </div>
              {gustoStatus?.gustoStatus?.configured && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Local Employees:</span>
                    <span className="ml-2 font-medium">{gustoStatus.gustoStatus.employees?.local || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gusto Employees:</span>
                    <span className="ml-2 font-medium">{gustoStatus.gustoStatus.employees?.gusto || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pending Payrolls:</span>
                    <span className="ml-2 font-medium">{gustoStatus.gustoStatus.payrolls?.pending || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Processed Payrolls:</span>
                    <span className="ml-2 font-medium">{gustoStatus.gustoStatus.payrolls?.processed || 0}</span>
                  </div>
                </div>
              )}
            </div>
            {!gustoStatus?.gustoStatus?.configured && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-2">
                  Connect your Gusto account to enable full payroll functionality
                </p>
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Setup Gusto
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="taxes">Tax Liabilities</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Management</CardTitle>
              <CardDescription>
                Manage employee information and onboarding status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gustoEmployees?.employees?.map((employee: any) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">
                        {employee.first_name} {employee.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{employee.email}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Status: {employee.onboarding_status}</span>
                        {employee.jobs?.[0] && (
                          <span>Role: {employee.jobs[0].title}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={employee.terminated ? "destructive" : "default"}
                      >
                        {employee.terminated ? "Terminated" : "Active"}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
                {(!gustoEmployees?.employees || gustoEmployees.employees.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    {gustoStatus?.gustoStatus?.configured
                      ? "No employees found. Start by onboarding your first employee."
                      : "Configure Gusto integration to manage employees."}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Management</CardTitle>
              <CardDescription>
                View and manage payroll runs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gustoPayrolls?.payrolls?.map((payroll: any) => (
                  <div
                    key={payroll.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">
                        Pay Period: {payroll.start_date} - {payroll.end_date}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Pay Date: {payroll.pay_date}
                      </p>
                      {payroll.totals && (
                        <div className="flex items-center gap-4 text-sm">
                          <span>Gross: {formatCurrency(parseFloat(payroll.totals.gross_pay))}</span>
                          <span>Net: {formatCurrency(parseFloat(payroll.totals.net_pay))}</span>
                          <span>Employees: {payroll.employee_compensations?.length || 0}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(payroll.payroll_status)}
                      {payroll.payroll_status === "open" && (
                        <Button
                          size="sm"
                          onClick={() => submitPayrollMutation.mutate(payroll.id)}
                          disabled={submitPayrollMutation.isPending}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Submit
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
                {(!gustoPayrolls?.payrolls || gustoPayrolls.payrolls.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    {gustoStatus?.gustoStatus?.configured
                      ? "No payroll runs found. Create your first payroll run to get started."
                      : "Configure Gusto integration to manage payroll."}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">I-9 Compliance</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {complianceReport?.complianceReport?.i9Compliance?.completed || 0}/
                  {complianceReport?.complianceReport?.i9Compliance?.total || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Completed forms
                </p>
                {complianceReport?.complianceReport?.i9Compliance && (
                  <Progress 
                    value={(complianceReport.complianceReport.i9Compliance.completed / complianceReport.complianceReport.i9Compliance.total) * 100} 
                    className="mt-2"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Benefits Enrollment</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {complianceReport?.complianceReport?.benefitsCompliance?.missingEnrollments?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Pending enrollments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tax Filings</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {complianceReport?.complianceReport?.taxCompliance?.overdueForms?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Overdue forms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payroll Issues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(complianceReport?.complianceReport?.payrollCompliance?.overtimeViolations?.length || 0) +
                   (complianceReport?.complianceReport?.payrollCompliance?.minimumWageViolations?.length || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Compliance issues
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Benefits Administration</CardTitle>
              <CardDescription>
                Manage employee benefits and enrollment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      <h4 className="font-medium">Health Insurance</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Comprehensive medical coverage with dental and vision options
                    </p>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Employee Cost:</span>
                      <span className="ml-2 font-medium">{benefitRates?.health || 'Contact HR'}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Company Cost:</span>
                      <span className="ml-2 font-medium">{benefitRates?.comprehensive || 'Contact HR'}</span>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-blue-500" />
                      <h4 className="font-medium">401(k) Retirement</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Retirement savings with company matching up to 3%
                    </p>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Match:</span>
                      <span className="ml-2 font-medium">100% up to 3%</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Vesting:</span>
                      <span className="ml-2 font-medium">Immediate</span>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-green-500" />
                      <h4 className="font-medium">Paid Time Off</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Vacation, sick leave, and personal time policies
                    </p>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Vacation:</span>
                      <span className="ml-2 font-medium">120 hours/year</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Sick:</span>
                      <span className="ml-2 font-medium">80 hours/year</span>
                    </div>
                  </div>
                </div>

                {complianceReport?.complianceReport?.benefitsCompliance?.missingEnrollments?.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Pending Benefit Enrollments</h4>
                    <div className="space-y-2">
                      {complianceReport.complianceReport.benefitsCompliance.missingEnrollments.map((enrollment: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">Employee ID: {enrollment.employeeId}</p>
                            <p className="text-sm text-muted-foreground">
                              Eligible for: {enrollment.eligibleBenefits.join(", ")}
                            </p>
                          </div>
                          <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Enroll
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Liabilities</CardTitle>
              <CardDescription>
                View upcoming tax obligations and filings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taxLiabilities?.taxLiabilities?.map((liability: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{liability.type || 'Tax Liability'}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {liability.due_date ? new Date(liability.due_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {formatCurrency(liability.amount || 0)}
                      </p>
                      <Badge variant={liability.status === 'overdue' ? 'destructive' : 'outline'}>
                        {liability.status || 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
                {(!taxLiabilities?.taxLiabilities || taxLiabilities.taxLiabilities.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    {gustoStatus?.gustoStatus?.configured
                      ? "No tax liabilities found for the current period."
                      : "Configure Gusto integration to view tax liabilities."}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}