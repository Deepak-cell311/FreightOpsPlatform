import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, DollarSign, Users, FileText, CheckCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Gusto Embedded Payroll Component - White Label UX
export function EmbeddedPayroll() {
  const queryClient = useQueryClient();
  const [selectedPayPeriod, setSelectedPayPeriod] = useState<string>("");
  
  // Fetch current payroll status
  const { data: payrollStatus, isLoading } = useQuery({
    queryKey: ['/api/gusto/payroll/status'],
    retry: false,
  });
  
  // Fetch upcoming payroll run
  const { data: upcomingPayroll } = useQuery({
    queryKey: ['/api/gusto/payroll/upcoming'],
    retry: false,
  });
  
  // Fetch employee time entries
  const { data: timeEntries } = useQuery({
    queryKey: ['/api/gusto/time-entries'],
    retry: false,
  });
  
  // Run payroll mutation
  const runPayrollMutation = useMutation({
    mutationFn: async (payrollData: any) => {
      return apiRequest('POST', '/api/gusto/payroll/run', payrollData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gusto/payroll/status'] });
    },
  });
  
  // Approve payroll mutation
  const approvePayrollMutation = useMutation({
    mutationFn: async (payrollId: string) => {
      return apiRequest('POST', `/api/gusto/payroll/${payrollId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gusto/payroll/status'] });
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
      {/* Payroll Status Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Payroll Dashboard</CardTitle>
              <CardDescription>
                Manage payroll runs, review time entries, and process payments
              </CardDescription>
            </div>
            <Badge variant={payrollStatus?.status === 'ready' ? 'default' : 'secondary'}>
              {payrollStatus?.status === 'ready' ? 'Ready to Run' : 'In Progress'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Next Pay Date</p>
                <p className="font-semibold">{upcomingPayroll?.payDate || 'Not scheduled'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Employees</p>
                <p className="font-semibold">{payrollStatus?.employeeCount || 0}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Gross Pay</p>
                <p className="font-semibold">${payrollStatus?.totalGrossPay || '0.00'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="font-semibold">{payrollStatus?.totalHours || 0}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Payroll Tabs */}
      <Tabs defaultValue="run-payroll" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="run-payroll">Run Payroll</TabsTrigger>
          <TabsTrigger value="time-entries">Time Entries</TabsTrigger>
          <TabsTrigger value="review">Review & Approve</TabsTrigger>
          <TabsTrigger value="history">Payroll History</TabsTrigger>
        </TabsList>
        
        {/* Run Payroll Tab */}
        <TabsContent value="run-payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Run Payroll</CardTitle>
              <CardDescription>
                Process payroll for the current pay period
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pay-period">Pay Period</Label>
                  <Input
                    id="pay-period"
                    value={upcomingPayroll?.payPeriod || ''}
                    readOnly
                    placeholder="Current pay period"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pay-date">Pay Date</Label>
                  <Input
                    id="pay-date"
                    value={upcomingPayroll?.payDate || ''}
                    readOnly
                    placeholder="Next pay date"
                  />
                </div>
              </div>
              
              {/* Payroll Summary */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-3">Payroll Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Gross Pay</p>
                    <p className="font-semibold">${payrollStatus?.totalGrossPay || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Federal Tax</p>
                    <p className="font-semibold">${payrollStatus?.federalTax || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">State Tax</p>
                    <p className="font-semibold">${payrollStatus?.stateTax || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Net Pay</p>
                    <p className="font-semibold text-green-600">${payrollStatus?.totalNetPay || '0.00'}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={() => runPayrollMutation.mutate(upcomingPayroll)}
                  disabled={runPayrollMutation.isPending || payrollStatus?.status !== 'ready'}
                  className="flex-1"
                >
                  {runPayrollMutation.isPending ? 'Processing...' : 'Run Payroll'}
                </Button>
                <Button variant="outline" className="flex-1">
                  Preview Payroll
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Time Entries Tab */}
        <TabsContent value="time-entries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Entries</CardTitle>
              <CardDescription>
                Review and approve employee time entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeEntries?.map((entry: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-semibold">{entry.employeeName}</p>
                        <p className="text-sm text-gray-600">{entry.position}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Regular Hours</p>
                        <p className="font-semibold">{entry.regularHours}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Overtime Hours</p>
                        <p className="font-semibold">{entry.overtimeHours}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Total Pay</p>
                        <p className="font-semibold">${entry.totalPay}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={entry.status === 'approved' ? 'default' : 'secondary'}>
                        {entry.status}
                      </Badge>
                      {entry.status === 'pending' && (
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Review & Approve Tab */}
        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Review & Approve</CardTitle>
              <CardDescription>
                Final review before processing payroll
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 bg-blue-50">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">Payroll Ready for Approval</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Review the payroll details below and approve to process payments.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Pay Period</p>
                    <p className="font-semibold">{upcomingPayroll?.payPeriod}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Employees</p>
                    <p className="font-semibold">{payrollStatus?.employeeCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Net Pay</p>
                    <p className="font-semibold">${payrollStatus?.totalNetPay}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Direct Deposits</p>
                    <p className="font-semibold">{payrollStatus?.directDepositCount}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={() => approvePayrollMutation.mutate(upcomingPayroll?.id)}
                  disabled={approvePayrollMutation.isPending}
                  className="flex-1"
                >
                  {approvePayrollMutation.isPending ? 'Processing...' : 'Approve & Process'}
                </Button>
                <Button variant="outline" className="flex-1">
                  Download Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Payroll History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll History</CardTitle>
              <CardDescription>
                View past payroll runs and reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <p>Payroll history will appear here after processing your first payroll.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}