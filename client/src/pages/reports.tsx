import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Download, 
  Calendar, 
  DollarSign, 
  Truck, 
  MapPin,
  BarChart3,
  PieChart,
  TrendingUp,
  Plus,
  Eye,
  Trash2,
  Filter,
  Clock
} from "lucide-react";

interface Report {
  id: string;
  name: string;
  type: string;
  description: string;
  dateRange: {
    start: string;
    end: string;
  };
  filters: any;
  createdAt: string;
  lastGenerated: string;
  status: 'draft' | 'ready' | 'generating' | 'error';
}

export default function Reports() {
  const [selectedReportType, setSelectedReportType] = useState("financial");
  const [isCreating, setIsCreating] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [reportFilters, setReportFilters] = useState({
    includeSubcontractors: true,
    includeExpenses: true,
    groupBy: 'month'
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({
    queryKey: ["/api/reports"],
    retry: false,
  });

  const { data: reportTemplates } = useQuery({
    queryKey: ["/api/reports/templates"],
    retry: false,
  });

  const generateReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      return apiRequest("POST", "/api/reports/generate", reportData);
    },
    onSuccess: () => {
      toast({
        title: "Report Generated",
        description: "Your report has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      setIsCreating(false);
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate report",
        variant: "destructive",
      });
    },
  });

  const exportReportMutation = useMutation({
    mutationFn: async ({ reportId, format }: { reportId: string; format: string }) => {
      const response = await fetch(`/api/reports/${reportId}/export?format=${format}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Export Complete",
        description: "Report has been downloaded successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export report",
        variant: "destructive",
      });
    },
  });

  const reportTypes = [
    {
      id: "financial",
      name: "Financial Reports",
      icon: DollarSign,
      description: "Revenue, expenses, profit & loss statements",
      templates: ["P&L Statement", "Revenue Summary", "Expense Analysis", "Cash Flow"]
    },
    {
      id: "operational",
      name: "Operations Reports",
      icon: Truck,
      description: "Fleet utilization, driver performance, load metrics",
      templates: ["Fleet Utilization", "Driver Performance", "Load Analysis", "Route Efficiency"]
    },
    {
      id: "compliance",
      name: "Compliance Reports",
      icon: FileText,
      description: "Safety records, inspections, regulatory compliance",
      templates: ["Safety Summary", "Inspection Report", "HOS Compliance", "IFTA Report"]
    },
    {
      id: "customer",
      name: "Customer Reports",
      icon: BarChart3,
      description: "Customer analysis, service metrics, billing reports",
      templates: ["Customer Revenue", "Service Metrics", "Billing Summary", "Account Analysis"]
    }
  ];

  const handleCreateReport = async () => {
    const reportData = {
      name: `${selectedReportType} Report - ${new Date().toLocaleDateString()}`,
      type: selectedReportType,
      dateRange,
      filters: reportFilters,
      template: reportTemplates?.[selectedReportType]?.[0] || 'default'
    };

    generateReportMutation.mutate(reportData);
  };

  const handleExportReport = (reportId: string, format: string) => {
    exportReportMutation.mutate({ reportId, format });
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Generate, schedule, and export comprehensive business reports</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Report
        </Button>
      </div>

      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">My Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Reports</p>
                    <p className="text-2xl font-bold">{reports?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Download className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Downloads</p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Scheduled</p>
                    <p className="text-2xl font-bold">5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reports List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Reports</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {reports && reports.length > 0 ? (
                <div className="space-y-4">
                  {reports.map((report: Report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{report.name}</h4>
                          <p className="text-sm text-gray-500">{report.description}</p>
                          <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
                            <span>Created: {new Date(report.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Last Generated: {new Date(report.lastGenerated).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          report.status === 'ready' ? "secondary" : 
                          report.status === 'generating' ? "outline" : 
                          report.status === 'error' ? "destructive" : "outline"
                        }>
                          {report.status}
                        </Badge>
                        
                        {report.status === 'ready' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleExportReport(report.id, 'pdf')}
                              disabled={exportReportMutation.isPending}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              PDF
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleExportReport(report.id, 'excel')}
                              disabled={exportReportMutation.isPending}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Excel
                            </Button>
                          </>
                        )}
                        
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Yet</h3>
                  <p className="text-gray-500 mb-4">Create your first report to get insights into your business.</p>
                  <Button onClick={() => setIsCreating(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Report
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card key={type.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{type.name}</CardTitle>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {type.templates.map((template) => (
                        <div key={template} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm font-medium">{template}</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedReportType(type.id);
                              setIsCreating(true);
                            }}
                          >
                            Use Template
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <p className="text-sm text-gray-600">Automatically generated reports delivered to your inbox</p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Scheduled Reports</h3>
                <p className="text-gray-500 mb-4">Set up automated reports to be delivered regularly.</p>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Report Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl m-4">
            <CardHeader>
              <CardTitle>Create New Report</CardTitle>
              <p className="text-sm text-gray-600">Generate a custom report for your business needs</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Report Type</Label>
                  <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Group By</Label>
                  <Select 
                    value={reportFilters.groupBy} 
                    onValueChange={(value) => setReportFilters({ ...reportFilters, groupBy: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Daily</SelectItem>
                      <SelectItem value="week">Weekly</SelectItem>
                      <SelectItem value="month">Monthly</SelectItem>
                      <SelectItem value="quarter">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateReport}
                  disabled={generateReportMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {generateReportMutation.isPending ? "Generating..." : "Generate Report"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}