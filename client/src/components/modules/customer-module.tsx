import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, DollarSign, Activity, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";

interface Customer {
  id: string;
  companyId: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  customerType: string;
  status: string;
  creditLimit: string;
  paymentTerms: number;
  createdAt: string;
}

interface CustomerRate {
  id: string;
  companyId: string;
  customerId: string;
  origin: string;
  destination: string;
  equipmentType: string;
  rate: string;
  rateType: string;
  status: string;
  createdAt: string;
}

const CustomerModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => apiRequest('GET', '/api/customers').then(res => res.json())
  });

  const { data: customerRates = [], isLoading: ratesLoading } = useQuery({
    queryKey: ['customer-rates'],
    queryFn: () => apiRequest('GET', '/api/customers/rates').then(res => res.json())
  });

  const activeCustomers = customers.filter((c: Customer) => c.status === 'active');
  const totalCreditLimit = customers.reduce((sum: number, c: Customer) => sum + parseFloat(c.creditLimit), 0);
  const avgPaymentTerms = customers.length > 0 ? customers.reduce((sum: number, c: Customer) => sum + c.paymentTerms, 0) / customers.length : 0;

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'shipper': return 'bg-blue-100 text-blue-800';
      case 'broker': return 'bg-green-100 text-green-800';
      case 'freight_forwarder': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600">Manage customers and rate agreements</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="rates">Rate Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customers.length}</div>
                <p className="text-xs text-muted-foreground">
                  {activeCustomers.length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Credit Limit</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalCreditLimit.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Total approved credit
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Payment Terms</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(avgPaymentTerms)} days</div>
                <p className="text-xs text-muted-foreground">
                  Average payment terms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rate Agreements</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerRates.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active rate agreements
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Directory</CardTitle>
            </CardHeader>
            <CardContent>
              {customersLoading ? (
                <div className="text-center py-8">Loading customers...</div>
              ) : customers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No customers found</p>
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Customer
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {customers.map((customer: Customer) => (
                    <div key={customer.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-lg">{customer.name}</h3>
                            <Badge className={getStatusColor(customer.status)}>
                              {customer.status}
                            </Badge>
                            <Badge className={getCustomerTypeColor(customer.customerType)}>
                              {customer.customerType}
                            </Badge>
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Contact:</span> {customer.contactPerson}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Email:</span> {customer.email}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Phone:</span> {customer.phone}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            Credit Limit: ${parseFloat(customer.creditLimit).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            Payment Terms: Net {customer.paymentTerms}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rate Management</CardTitle>
            </CardHeader>
            <CardContent>
              {ratesLoading ? (
                <div className="text-center py-8">Loading rates...</div>
              ) : customerRates.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No rate agreements found</p>
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Rate Agreement
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {customerRates.map((rate: CustomerRate) => (
                    <div key={rate.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{rate.origin} → {rate.destination}</h3>
                            <Badge className={getStatusColor(rate.status)}>
                              {rate.status}
                            </Badge>
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Equipment:</span> {rate.equipmentType}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Rate Type:</span> {rate.rateType}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">
                            ${parseFloat(rate.rate).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {rate.rateType === 'per_mile' ? 'per mile' : 'flat rate'}
                          </div>
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

export default CustomerModule;