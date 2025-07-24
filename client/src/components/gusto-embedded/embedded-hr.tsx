import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Users, Plus, FileText, Calendar, Award, Shield, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";

// Gusto Embedded HR Component - White Label UX
export function EmbeddedHR() {
  const queryClient = useQueryClient();
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  
  // Fetch HR dashboard data
  const { data: hrData, isLoading } = useQuery({
    queryKey: ['/api/gusto/hr/dashboard'],
    retry: false,
  });
  
  // Fetch employees
  const { data: employees } = useQuery({
    queryKey: ['/api/gusto/employees'],
    retry: false,
  });
  
  // Fetch pending HR tasks
  const { data: hrTasks } = useQuery({
    queryKey: ['/api/gusto/hr/tasks'],
    retry: false,
  });
  
  // Employee form
  const employeeForm = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      startDate: '',
      position: '',
      department: '',
      salary: '',
      employmentType: 'full-time',
      workLocation: '',
    },
  });
  
  // Add employee mutation
  const addEmployeeMutation = useMutation({
    mutationFn: async (employeeData: any) => {
      return apiRequest('POST', '/api/gusto/employees', employeeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gusto/employees'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gusto/hr/dashboard'] });
      setShowAddEmployee(false);
      employeeForm.reset();
    },
  });
  
  // Complete HR task mutation
  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return apiRequest('POST', `/api/gusto/hr/tasks/${taskId}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gusto/hr/tasks'] });
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
      {/* HR Dashboard Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">HR Dashboard</CardTitle>
              <CardDescription>
                Manage employees, benefits, and HR processes
              </CardDescription>
            </div>
            <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                  <DialogDescription>
                    Enter employee information to create their profile and start onboarding
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={employeeForm.handleSubmit((data) => addEmployeeMutation.mutate(data))} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        {...employeeForm.register('firstName', { required: true })}
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        {...employeeForm.register('lastName', { required: true })}
                        placeholder="Smith"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...employeeForm.register('email', { required: true })}
                        placeholder="john.smith@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        {...employeeForm.register('phone')}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        {...employeeForm.register('position', { required: true })}
                        placeholder="Driver, Dispatcher, Mechanic"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select onValueChange={(value) => employeeForm.setValue('department', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="operations">Operations</SelectItem>
                          <SelectItem value="dispatch">Dispatch</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="administration">Administration</SelectItem>
                          <SelectItem value="safety">Safety</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        {...employeeForm.register('startDate', { required: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salary">Annual Salary</Label>
                      <Input
                        id="salary"
                        type="number"
                        {...employeeForm.register('salary', { required: true })}
                        placeholder="65000"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employmentType">Employment Type</Label>
                      <Select onValueChange={(value) => employeeForm.setValue('employmentType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Full-time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="temporary">Temporary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workLocation">Work Location</Label>
                      <Input
                        id="workLocation"
                        {...employeeForm.register('workLocation')}
                        placeholder="Main Terminal, Remote, etc."
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowAddEmployee(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addEmployeeMutation.isPending}>
                      {addEmployeeMutation.isPending ? 'Adding...' : 'Add Employee'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="font-semibold">{hrData?.totalEmployees || 0}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">New Hires (30 days)</p>
                <p className="font-semibold">{hrData?.newHires || 0}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Pending Tasks</p>
                <p className="font-semibold">{hrData?.pendingTasks || 0}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Benefits Enrolled</p>
                <p className="font-semibold">{hrData?.benefitsEnrolled || 0}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* HR Management Tabs */}
      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>
        
        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Directory</CardTitle>
              <CardDescription>
                Manage employee profiles and information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employees?.map((employee: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {employee.firstName?.[0]}{employee.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">{employee.firstName} {employee.lastName}</p>
                        <p className="text-sm text-gray-600">{employee.position} • {employee.department}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Start Date</p>
                        <p className="text-sm">{employee.startDate}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="text-sm">{employee.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                        {employee.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        View Profile
                      </Button>
                    </div>
                  </div>
                ))}
                {(!employees || employees.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4" />
                    <p>No employees found. Add your first employee to get started.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Onboarding Tab */}
        <TabsContent value="onboarding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Onboarding</CardTitle>
              <CardDescription>
                Track new employee onboarding progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hrTasks?.filter((task: any) => task.category === 'onboarding').map((task: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-semibold">{task.title}</p>
                        <p className="text-sm text-gray-600">{task.employeeName} • {task.dueDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={task.priority === 'high' ? 'destructive' : 'default'}>
                        {task.priority} priority
                      </Badge>
                      <Button 
                        size="sm" 
                        onClick={() => completeTaskMutation.mutate(task.id)}
                        disabled={completeTaskMutation.isPending}
                      >
                        Complete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>HR Documents</CardTitle>
              <CardDescription>
                Manage employee documents and forms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold">I-9 Forms</h3>
                  <p className="text-sm text-gray-600 mb-4">Employment eligibility verification</p>
                  <Button size="sm" variant="outline">Manage</Button>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-semibold">W-4 Forms</h3>
                  <p className="text-sm text-gray-600 mb-4">Tax withholding allowances</p>
                  <Button size="sm" variant="outline">Manage</Button>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <h3 className="font-semibold">Direct Deposit</h3>
                  <p className="text-sm text-gray-600 mb-4">Banking information forms</p>
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
              <CardTitle>HR Compliance</CardTitle>
              <CardDescription>
                Monitor compliance requirements and deadlines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-yellow-50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-5 w-5 text-yellow-600" />
                    <h3 className="font-semibold">DOT Medical Certifications</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    3 drivers have medical certifications expiring within 30 days
                  </p>
                  <Button size="sm">Review Certifications</Button>
                </div>
                
                <div className="border rounded-lg p-4 bg-green-50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Award className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold">Safety Training</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    All employees up to date on required safety training
                  </p>
                  <Button size="sm" variant="outline">View Training Records</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}