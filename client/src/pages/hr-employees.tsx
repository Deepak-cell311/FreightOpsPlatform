import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function HREmployees() {
  const employees = [
    {
      id: 1,
      name: "John Smith",
      position: "Senior Driver",
      department: "Operations",
      status: "Active",
      hireDate: "2023-01-15",
      email: "john.smith@company.com",
      phone: "(555) 123-4567"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      position: "Dispatcher",
      department: "Dispatch",
      status: "Active",
      hireDate: "2023-03-22",
      email: "sarah.johnson@company.com",
      phone: "(555) 234-5678"
    },
    {
      id: 3,
      name: "Mike Wilson",
      position: "Maintenance Tech",
      department: "Fleet",
      status: "On Leave",
      hireDate: "2022-11-08",
      email: "mike.wilson@company.com",
      phone: "(555) 345-6789"
    }
  ];

  return (
    <div className="w-full min-h-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600 mt-2">Manage employee records and information</p>
        </div>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search employees..." 
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employee Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900">24</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-3xl font-bold text-green-600">22</p>
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
                <p className="text-sm font-medium text-gray-500">On Leave</p>
                <p className="text-3xl font-bold text-yellow-600">2</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">New Hires (30d)</p>
                <p className="text-3xl font-bold text-blue-600">3</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <UserPlus className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Position</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Department</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Hire Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{employee.name}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{employee.position}</td>
                    <td className="py-3 px-4 text-gray-600">{employee.department}</td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={employee.status === 'Active' ? 'default' : 'secondary'}
                        className={employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                      >
                        {employee.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{employee.hireDate}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600">
                        <div>{employee.email}</div>
                        <div>{employee.phone}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}