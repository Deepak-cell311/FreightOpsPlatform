import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, FileText, Shield, Calendar } from "lucide-react";

export default function HRCompliance() {
  const complianceItems = [
    {
      id: 1,
      category: "DOT Compliance",
      requirement: "Driver Medical Certificates",
      status: "Current",
      dueDate: "2024-03-15",
      employees: 12,
      riskLevel: "Low"
    },
    {
      id: 2,
      category: "Safety Training",
      requirement: "Hazmat Certification Renewal",
      status: "Expiring Soon",
      dueDate: "2024-02-28",
      employees: 5,
      riskLevel: "Medium"
    },
    {
      id: 3,
      category: "DOT Compliance",
      requirement: "Drug & Alcohol Testing",
      status: "Overdue",
      dueDate: "2024-01-30",
      employees: 2,
      riskLevel: "High"
    },
    {
      id: 4,
      category: "Background Checks",
      requirement: "Annual Background Verification",
      status: "In Progress",
      dueDate: "2024-04-01",
      employees: 8,
      riskLevel: "Low"
    }
  ];

  const recentAudits = [
    {
      id: 1,
      type: "DOT Compliance Audit",
      date: "2024-01-15",
      result: "Passed",
      score: 95,
      findings: 2
    },
    {
      id: 2,
      type: "Safety Training Review",
      date: "2024-01-10",
      result: "Passed",
      score: 88,
      findings: 5
    },
    {
      id: 3,
      type: "HR Records Audit",
      date: "2023-12-20",
      result: "Needs Attention",
      score: 76,
      findings: 8
    }
  ];

  return (
    <div className="w-full min-h-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HR Compliance</h1>
          <p className="text-gray-600 mt-2">Monitor compliance requirements and audit status</p>
        </div>
        <Button>Generate Compliance Report</Button>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Requirements</p>
                <p className="text-3xl font-bold text-gray-900">24</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Compliant</p>
                <p className="text-3xl font-bold text-green-600">18</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
                <p className="text-3xl font-bold text-yellow-600">4</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Overdue</p>
                <p className="text-3xl font-bold text-red-600">2</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Compliance Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.requirement}</h3>
                      <p className="text-sm text-gray-600">{item.category}</p>
                    </div>
                    <Badge 
                      variant={
                        item.status === 'Current' ? 'default' :
                        item.status === 'Expiring Soon' ? 'secondary' :
                        item.status === 'Overdue' ? 'destructive' :
                        'outline'
                      }
                      className={
                        item.status === 'Current' ? 'bg-green-100 text-green-800' :
                        item.status === 'Expiring Soon' ? 'bg-yellow-100 text-yellow-800' :
                        item.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Due: {item.dueDate}
                      </span>
                      <span className="text-gray-600">
                        {item.employees} employees
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        item.riskLevel === 'Low' ? 'bg-green-500' :
                        item.riskLevel === 'Medium' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                      <span className="text-xs text-gray-500">{item.riskLevel} Risk</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Audits */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Audits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAudits.map((audit) => (
                <div key={audit.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{audit.type}</h3>
                      <p className="text-sm text-gray-600">{audit.date}</p>
                    </div>
                    <Badge 
                      variant={audit.result === 'Passed' ? 'default' : 'secondary'}
                      className={audit.result === 'Passed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                    >
                      {audit.result}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">
                        Score: <span className="font-medium">{audit.score}%</span>
                      </span>
                      <span className="text-sm text-gray-600">
                        {audit.findings} findings
                      </span>
                    </div>
                    <Button variant="outline" size="sm">
                      View Report
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <Button variant="outline" className="w-full">
                Schedule New Audit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}