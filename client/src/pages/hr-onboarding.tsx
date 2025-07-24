import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertCircle, User } from "lucide-react";

export default function HROnboarding() {
  const onboardingTasks = [
    {
      id: 1,
      employeeName: "Alex Rodriguez",
      position: "Driver",
      startDate: "2024-01-15",
      progress: 85,
      status: "In Progress",
      completedTasks: 17,
      totalTasks: 20,
      nextTask: "DOT Physical Exam"
    },
    {
      id: 2,
      employeeName: "Maria Garcia",
      position: "Dispatcher",
      startDate: "2024-01-22",
      progress: 100,
      status: "Complete",
      completedTasks: 15,
      totalTasks: 15,
      nextTask: "All tasks completed"
    },
    {
      id: 3,
      employeeName: "David Kim",
      position: "Mechanic",
      startDate: "2024-02-01",
      progress: 45,
      status: "Pending",
      completedTasks: 9,
      totalTasks: 20,
      nextTask: "Safety Training"
    }
  ];

  const onboardingSteps = [
    { name: "Personal Information", completed: true },
    { name: "Employment Documents", completed: true },
    { name: "Safety Training", completed: true },
    { name: "DOT Physical", completed: false },
    { name: "Drug & Alcohol Testing", completed: false },
    { name: "Equipment Assignment", completed: false },
    { name: "Final Review", completed: false }
  ];

  return (
    <div className="w-full min-h-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Onboarding</h1>
          <p className="text-gray-600 mt-2">Track new employee onboarding progress</p>
        </div>
        <Button>Start New Onboarding</Button>
      </div>

      {/* Onboarding Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Onboarding</p>
                <p className="text-3xl font-bold text-gray-900">3</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed This Month</p>
                <p className="text-3xl font-bold text-green-600">8</p>
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
                <p className="text-sm font-medium text-gray-500">Avg. Completion Time</p>
                <p className="text-3xl font-bold text-blue-600">12</p>
                <p className="text-sm text-gray-500">days</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Overdue Tasks</p>
                <p className="text-3xl font-bold text-red-600">2</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Onboarding Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Current Onboarding Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {onboardingTasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{task.employeeName}</h3>
                      <p className="text-sm text-gray-600">{task.position} • Start: {task.startDate}</p>
                    </div>
                    <Badge 
                      variant={task.status === 'Complete' ? 'default' : task.status === 'In Progress' ? 'secondary' : 'outline'}
                      className={
                        task.status === 'Complete' ? 'bg-green-100 text-green-800' :
                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {task.status}
                    </Badge>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{task.completedTasks}/{task.totalTasks} tasks</span>
                    </div>
                    <Progress value={task.progress} className="h-2" />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Next: <span className="font-medium">{task.nextTask}</span>
                    </p>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Onboarding Checklist Template */}
        <Card>
          <CardHeader>
            <CardTitle>Standard Onboarding Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {onboardingSteps.map((step, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    step.completed ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    )}
                  </div>
                  <span className={`text-sm ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.name}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <Button variant="outline" className="w-full">
                Customize Checklist
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}