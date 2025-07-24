import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Shield, DollarSign, Calendar, Users, Plus } from "lucide-react";

export default function HRBenefits() {
  const benefitPlans = [
    {
      id: 1,
      name: "Health Insurance",
      type: "Medical",
      provider: "Blue Cross Blue Shield",
      enrolled: 18,
      eligible: 24,
      monthlyPremium: 450,
      employerContribution: 80,
      status: "Active"
    },
    {
      id: 2,
      name: "Dental Coverage",
      type: "Dental",
      provider: "Delta Dental",
      enrolled: 15,
      eligible: 24,
      monthlyPremium: 35,
      employerContribution: 100,
      status: "Active"
    },
    {
      id: 3,
      name: "Vision Plan",
      type: "Vision",
      provider: "VSP",
      enrolled: 12,
      eligible: 24,
      monthlyPremium: 15,
      employerContribution: 50,
      status: "Active"
    },
    {
      id: 4,
      name: "401(k) Retirement",
      type: "Retirement",
      provider: "Fidelity",
      enrolled: 20,
      eligible: 24,
      monthlyPremium: 0,
      employerContribution: 50,
      status: "Active"
    }
  ];

  const upcomingEnrollments = [
    {
      employee: "Alex Rodriguez",
      plan: "Health Insurance",
      effectiveDate: "2024-02-15",
      status: "Pending"
    },
    {
      employee: "Maria Garcia",
      plan: "Dental Coverage",
      effectiveDate: "2024-02-01",
      status: "Approved"
    },
    {
      employee: "David Kim",
      plan: "Vision Plan",
      effectiveDate: "2024-02-01",
      status: "Pending"
    }
  ];

  return (
    <div className="w-full min-h-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Benefits</h1>
          <p className="text-gray-600 mt-2">Manage employee benefits and enrollment</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Open Enrollment</Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Plan
          </Button>
        </div>
      </div>

      {/* Benefits Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Plans</p>
                <p className="text-3xl font-bold text-gray-900">4</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Enrolled</p>
                <p className="text-3xl font-bold text-green-600">65</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Monthly Cost</p>
                <p className="text-3xl font-bold text-blue-600">${benefitsData?.totalCost?.toLocaleString() || '0'}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Enrollment Rate</p>
                <p className="text-3xl font-bold text-green-600">68%</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Benefit Plans */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Benefit Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {benefitPlans.map((plan) => (
                  <div key={plan.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                        <p className="text-sm text-gray-600">{plan.provider}</p>
                      </div>
                      <Badge 
                        variant="default"
                        className="bg-green-100 text-green-800"
                      >
                        {plan.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">
                          Enrollment: <span className="font-medium">{plan.enrolled}/{plan.eligible}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Rate: <span className="font-medium">{Math.round((plan.enrolled / plan.eligible) * 100)}%</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Monthly Premium: <span className="font-medium">${plan.monthlyPremium}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Employer: <span className="font-medium">{plan.employerContribution}%</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">View Details</Button>
                      <Button variant="outline" size="sm">Manage Enrollment</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Enrollments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEnrollments.map((enrollment, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{enrollment.employee}</h4>
                      <p className="text-sm text-gray-600">{enrollment.plan}</p>
                    </div>
                    <Badge 
                      variant={enrollment.status === 'Approved' ? 'default' : 'secondary'}
                      className={enrollment.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                    >
                      {enrollment.status}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Effective: {enrollment.effectiveDate}
                  </p>
                  
                  <div className="mt-2 pt-2 border-t">
                    <Button variant="outline" size="sm" className="w-full">
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full">
                View All Enrollments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}