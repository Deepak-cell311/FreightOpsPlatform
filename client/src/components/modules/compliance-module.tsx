import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Shield, AlertTriangle, CheckCircle, Clock, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";

interface SafetyCompliance {
  id: string;
  companyId: string;
  safetyProgram: string;
  driverId: string | null;
  vehicleId: string | null;
  trainingType: string | null;
  certificationRequired: boolean;
  certificationObtained: boolean;
  certificationDate: string | null;
  expirationDate: string | null;
  trainingProvider: string | null;
  cost: string;
  status: string;
  notes: string | null;
  createdAt: string;
}

interface DotCompliance {
  id: string;
  companyId: string;
  complianceType: string;
  subType: string | null;
  entityId: string | null;
  entityType: string | null;
  status: string;
  dueDate: string | null;
  completedDate: string | null;
  expirationDate: string | null;
  testingFacility: string | null;
  result: string | null;
  violations: string | null;
  fines: string;
  correctionDeadline: string | null;
  correctionCompleted: boolean;
  notes: string | null;
  createdAt: string;
}

const ComplianceModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: safetyRecords = [], isLoading: safetyLoading } = useQuery({
    queryKey: ['safety-compliance'],
    queryFn: () => apiRequest('GET', '/api/compliance/safety').then(res => res.json())
  });

  const { data: dotRecords = [], isLoading: dotLoading } = useQuery({
    queryKey: ['dot-compliance'],
    queryFn: () => apiRequest('GET', '/api/compliance/dot').then(res => res.json())
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'non_compliant': return 'bg-red-100 text-red-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'non_compliant': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatComplianceType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatSafetyProgram = (program: string) => {
    return program.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const allRecords = [...safetyRecords, ...dotRecords];
  const compliantCount = allRecords.filter(r => r.status === 'compliant').length;
  const pendingCount = allRecords.filter(r => r.status === 'pending').length;
  const nonCompliantCount = allRecords.filter(r => r.status === 'non_compliant' || r.status === 'overdue').length;
  const complianceRate = allRecords.length > 0 ? (compliantCount / allRecords.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Management</h1>
          <p className="text-gray-600">DOT and safety compliance tracking</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Compliance Record
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="safety">Safety Compliance</TabsTrigger>
          <TabsTrigger value="dot">DOT Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(complianceRate)}%</div>
                <p className="text-xs text-muted-foreground">
                  {compliantCount} of {allRecords.length} compliant
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Items</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingCount}</div>
                <p className="text-xs text-muted-foreground">
                  Require attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Non-Compliant</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nonCompliantCount}</div>
                <p className="text-xs text-muted-foreground">
                  Immediate action required
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Safety Records</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{safetyRecords.length}</div>
                <p className="text-xs text-muted-foreground">
                  Safety programs tracked
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="safety" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Safety Compliance Programs</CardTitle>
            </CardHeader>
            <CardContent>
              {safetyLoading ? (
                <div className="text-center py-8">Loading safety compliance...</div>
              ) : safetyRecords.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No safety compliance records found</p>
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Safety Record
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {safetyRecords.map((record: SafetyCompliance) => (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(record.status)}
                            <h3 className="font-semibold text-lg">
                              {formatSafetyProgram(record.safetyProgram)}
                            </h3>
                            <Badge className={getStatusColor(record.status)}>
                              {record.status}
                            </Badge>
                          </div>
                          <div className="mt-2 space-y-1">
                            {record.trainingType && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Training Type:</span> {formatComplianceType(record.trainingType)}
                              </p>
                            )}
                            {record.trainingProvider && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Provider:</span> {record.trainingProvider}
                              </p>
                            )}
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Certification Required:</span> {record.certificationRequired ? 'Yes' : 'No'}
                            </p>
                            {record.certificationRequired && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Certification Obtained:</span> {record.certificationObtained ? 'Yes' : 'No'}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            Cost: ${parseFloat(record.cost).toLocaleString()}
                          </div>
                          {record.expirationDate && (
                            <div className="text-sm text-gray-500">
                              Expires: {new Date(record.expirationDate).toLocaleDateString()}
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

        <TabsContent value="dot" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>DOT Compliance Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              {dotLoading ? (
                <div className="text-center py-8">Loading DOT compliance...</div>
              ) : dotRecords.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No DOT compliance records found</p>
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Add DOT Record
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {dotRecords.map((record: DotCompliance) => (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(record.status)}
                            <h3 className="font-semibold text-lg">
                              {formatComplianceType(record.complianceType)}
                            </h3>
                            <Badge className={getStatusColor(record.status)}>
                              {record.status}
                            </Badge>
                          </div>
                          <div className="mt-2 space-y-1">
                            {record.subType && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Sub Type:</span> {formatComplianceType(record.subType)}
                              </p>
                            )}
                            {record.testingFacility && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Testing Facility:</span> {record.testingFacility}
                              </p>
                            )}
                            {record.result && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Result:</span> {record.result}
                              </p>
                            )}
                            {record.violations && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Violations:</span> {record.violations}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {parseFloat(record.fines) > 0 && (
                            <div className="text-sm text-red-600">
                              Fines: ${parseFloat(record.fines).toLocaleString()}
                            </div>
                          )}
                          {record.dueDate && (
                            <div className="text-sm text-gray-500">
                              Due: {new Date(record.dueDate).toLocaleDateString()}
                            </div>
                          )}
                          {record.completedDate && (
                            <div className="text-sm text-green-600">
                              Completed: {new Date(record.completedDate).toLocaleDateString()}
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

export default ComplianceModule;