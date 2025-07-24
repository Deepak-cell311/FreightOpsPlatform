import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building, DollarSign, FileText, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";

interface Vendor {
  id: number;
  companyId: string;
  vendorNumber: string;
  companyName: string;
  contactFirstName: string;
  contactLastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  paymentTerms: string;
  currentBalance: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  taxId: string;
}

interface VendorPayment {
  id: string;
  companyId: string;
  vendorId: number;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
  paymentDate: string;
  paymentMethod: string;
  status: string;
  description: string;
  createdAt: string;
}

const VendorModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: vendors = [], isLoading: vendorsLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => apiRequest('GET', '/api/vendors').then(res => res.json())
  });

  const { data: vendorPayments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['vendor-payments'],
    queryFn: () => apiRequest('GET', '/api/vendors/payments').then(res => res.json())
  });

  const activeVendors = vendors.filter((v: Vendor) => v.isActive);
  const totalBalance = vendors.reduce((sum: number, v: Vendor) => sum + parseFloat(v.currentBalance), 0);
  const pendingPayments = vendorPayments.filter((p: VendorPayment) => p.status === 'pending');
  const totalPendingAmount = pendingPayments.reduce((sum: number, p: VendorPayment) => sum + parseFloat(p.amount), 0);

  const getStatusColor = (status: boolean) => {
    return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'disputed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPaymentMethod = (method: string) => {
    if (!method) return 'Not specified';
    return method.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
          <p className="text-gray-600">Manage vendors and track payments</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vendors.length}</div>
                <p className="text-xs text-muted-foreground">
                  {activeVendors.length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalBalance.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Current vendor balances
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingPayments.length}</div>
                <p className="text-xs text-muted-foreground">
                  ${totalPendingAmount.toLocaleString()} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payment Records</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vendorPayments.length}</div>
                <p className="text-xs text-muted-foreground">
                  Total payment records
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Directory</CardTitle>
            </CardHeader>
            <CardContent>
              {vendorsLoading ? (
                <div className="text-center py-8">Loading vendors...</div>
              ) : vendors.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No vendors found</p>
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Vendor
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {vendors.map((vendor: Vendor) => (
                    <div key={vendor.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-lg">{vendor.companyName}</h3>
                            <Badge className={getStatusColor(vendor.isActive)}>
                              {vendor.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Vendor #:</span> {vendor.vendorNumber}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Contact:</span> {vendor.contactFirstName} {vendor.contactLastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Email:</span> {vendor.email}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Phone:</span> {vendor.phone}
                            </p>
                            {vendor.address && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Address:</span> {vendor.address}, {vendor.city}, {vendor.state} {vendor.zipCode}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            Balance: ${parseFloat(vendor.currentBalance).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            Payment Terms: {vendor.paymentTerms}
                          </div>
                          {vendor.taxId && (
                            <div className="text-sm text-gray-500">
                              Tax ID: {vendor.taxId}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="text-center py-8">Loading payments...</div>
              ) : vendorPayments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No payment records found</p>
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Record Payment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {vendorPayments.map((payment: VendorPayment) => (
                    <div key={payment.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-lg">
                              {payment.invoiceNumber || 'No Invoice #'}
                            </h3>
                            <Badge className={getPaymentStatusColor(payment.status)}>
                              {payment.status}
                            </Badge>
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Vendor ID:</span> {payment.vendorId}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Payment Method:</span> {formatPaymentMethod(payment.paymentMethod)}
                            </p>
                            {payment.description && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Description:</span> {payment.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">
                            ${parseFloat(payment.amount).toLocaleString()}
                          </div>
                          {payment.dueDate && (
                            <div className="text-sm text-gray-500">
                              Due: {new Date(payment.dueDate).toLocaleDateString()}
                            </div>
                          )}
                          {payment.paymentDate && (
                            <div className="text-sm text-gray-500">
                              Paid: {new Date(payment.paymentDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorModule;