import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, Edit, Trash2, Shield, Building, AlertCircle, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// HR Role definitions
const HR_ROLES = {
  PLATFORM_OWNER: 'Platform Owner',
  HQ_ADMIN: 'HQ Admin',
  OPERATIONS_MANAGER: 'Operations Manager',
  CUSTOMER_SUCCESS: 'Customer Success',
  FINANCIAL_ANALYST: 'Financial Analyst',
  SUPPORT_SPECIALIST: 'Support Specialist',
  DEVELOPER: 'Developer',
  QA_ENGINEER: 'QA Engineer',
  SALES_MANAGER: 'Sales Manager',
  MARKETING_COORDINATOR: 'Marketing Coordinator',
  HR_MANAGER: 'HR Manager',
  HR_COORDINATOR: 'HR Coordinator'
};

const DEPARTMENTS = {
  EXECUTIVE: 'Executive',
  ADMINISTRATION: 'Administration',
  OPERATIONS: 'Operations',
  CUSTOMER_SUCCESS: 'Customer Success',
  FINANCE: 'Finance',
  SUPPORT: 'Support',
  HR: 'HR',
  ENGINEERING: 'Engineering',
  QA: 'QA',
  SALES: 'Sales',
  MARKETING: 'Marketing'
};

interface HQEmployee {
  id: string;
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  department: string;
  position: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export default function HRModule() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [newEmployeeOpen, setNewEmployeeOpen] = useState(false);
  const [editEmployeeOpen, setEditEmployeeOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<HQEmployee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all employees
  const { data: employees = [], isLoading, error } = useQuery({
    queryKey: ['hr-employees'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/hr/employees');
      return response.json();
    }
  });

  // Create employee mutation
  const createEmployeeMutation = useMutation({
    mutationFn: async (employeeData: any) => {
      const response = await apiRequest('POST', '/api/hr/employees', employeeData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-employees'] });
      setNewEmployeeOpen(false);
      toast({
        title: "Employee Created",
        description: "New employee has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create employee",
        variant: "destructive",
      });
    }
  });

  // Update employee mutation
  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ employeeId, data }: { employeeId: string; data: any }) => {
      const response = await apiRequest('PUT', `/api/hr/employees/${employeeId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-employees'] });
      setEditEmployeeOpen(false);
      setSelectedEmployee(null);
      toast({
        title: "Employee Updated",
        description: "Employee information has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update employee",
        variant: "destructive",
      });
    }
  });

  // Deactivate employee mutation
  const deactivateEmployeeMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      const response = await apiRequest('POST', `/api/hr/employees/${employeeId}/deactivate`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-employees'] });
      toast({
        title: "Employee Deactivated",
        description: "Employee has been successfully deactivated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate employee",
        variant: "destructive",
      });
    }
  });

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter((employee: HQEmployee) => {
    const matchesSearch = 
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.includes(searchTerm);
    
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    const matchesRole = roleFilter === 'all' || employee.role === roleFilter;
    
    return matchesSearch && matchesDepartment && matchesRole;
  });

  // Handle form submission for new employee
  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const employeeData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      role: formData.get('role'),
      department: formData.get('department'),
      position: formData.get('position'),
      password: formData.get('password')
    };
    createEmployeeMutation.mutate(employeeData);
  };

  // Handle form submission for edit employee
  const handleEditEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    
    const formData = new FormData(e.target as HTMLFormElement);
    const employeeData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      role: formData.get('role'),
      department: formData.get('department'),
      position: formData.get('position')
    };
    updateEmployeeMutation.mutate({ 
      employeeId: selectedEmployee.employeeId, 
      data: employeeData 
    });
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'platform_owner': return 'bg-purple-500';
      case 'hq_admin': return 'bg-red-500';
      case 'hr_manager': return 'bg-blue-500';
      case 'hr_coordinator': return 'bg-green-500';
      case 'operations_manager': return 'bg-orange-500';
      case 'developer': return 'bg-cyan-500';
      default: return 'bg-gray-500';
    }
  };

  // Get department badge color
  const getDepartmentBadgeColor = (department: string) => {
    switch (department) {
      case 'Administration': return 'bg-purple-100 text-purple-800';
      case 'HR': return 'bg-blue-100 text-blue-800';
      case 'Operations': return 'bg-green-100 text-green-800';
      case 'Engineering': return 'bg-cyan-100 text-cyan-800';
      case 'Finance': return 'bg-yellow-100 text-yellow-800';
      case 'Sales': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading employee data. Please check your permissions and try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">HR Employee Management</h1>
          <p className="text-gray-600">Manage FreightOps Pro employees and roles</p>
        </div>
        <Dialog open={newEmployeeOpen} onOpenChange={setNewEmployeeOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Employee</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" required />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" required />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select name="role" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(HR_ROLES).map(([key, value]) => (
                        <SelectItem key={key} value={key.toLowerCase()}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select name="department" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DEPARTMENTS).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Input id="position" name="position" required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setNewEmployeeOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createEmployeeMutation.isPending}>
                  {createEmployeeMutation.isPending ? 'Creating...' : 'Create Employee'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{employees.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {employees.filter((emp: HQEmployee) => emp.isActive).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Departments</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(employees.map((emp: HQEmployee) => emp.department)).size}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">HR Department</CardTitle>
                <Shield className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {employees.filter((emp: HQEmployee) => emp.department === 'HR').length}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {Object.entries(DEPARTMENTS).map(([key, value]) => (
                  <SelectItem key={key} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {Object.entries(HR_ROLES).map(([key, value]) => (
                  <SelectItem key={key} value={key.toLowerCase()}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Employee List */}
          <div className="grid gap-4">
            {filteredEmployees.map((employee: HQEmployee) => (
              <Card key={employee.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {employee.firstName[0]}{employee.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold">
                          {employee.firstName} {employee.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {employee.employeeId} • {employee.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee.position}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getRoleBadgeColor(employee.role)}>
                        {HR_ROLES[employee.role.toUpperCase() as keyof typeof HR_ROLES] || employee.role}
                      </Badge>
                      <Badge variant="outline" className={getDepartmentBadgeColor(employee.department)}>
                        {employee.department}
                      </Badge>
                      <Badge variant={employee.isActive ? 'default' : 'secondary'}>
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setEditEmployeeOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deactivateEmployeeMutation.mutate(employee.employeeId)}
                        disabled={!employee.isActive}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(HR_ROLES).map(([key, value]) => (
                  <div key={key} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{value}</div>
                        <div className="text-sm text-gray-500">
                          {employees.filter((emp: HQEmployee) => emp.role === key.toLowerCase()).length} employees
                        </div>
                      </div>
                      <Badge className={getRoleBadgeColor(key.toLowerCase())}>
                        {key.toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(DEPARTMENTS).map(([key, value]) => (
                  <div key={key} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{value}</div>
                        <div className="text-sm text-gray-500">
                          {employees.filter((emp: HQEmployee) => emp.department === value).length} employees
                        </div>
                      </div>
                      <Badge variant="outline" className={getDepartmentBadgeColor(value)}>
                        {value}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Employee Dialog */}
      <Dialog open={editEmployeeOpen} onOpenChange={setEditEmployeeOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <form onSubmit={handleEditEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-firstName">First Name</Label>
                  <Input 
                    id="edit-firstName" 
                    name="firstName" 
                    defaultValue={selectedEmployee.firstName}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="edit-lastName">Last Name</Label>
                  <Input 
                    id="edit-lastName" 
                    name="lastName" 
                    defaultValue={selectedEmployee.lastName}
                    required 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input 
                  id="edit-email" 
                  name="email" 
                  type="email" 
                  defaultValue={selectedEmployee.email}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input 
                  id="edit-phone" 
                  name="phone" 
                  type="tel" 
                  defaultValue={selectedEmployee.phone || ''}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-role">Role</Label>
                  <Select name="role" defaultValue={selectedEmployee.role}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(HR_ROLES).map(([key, value]) => (
                        <SelectItem key={key} value={key.toLowerCase()}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-department">Department</Label>
                  <Select name="department" defaultValue={selectedEmployee.department}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DEPARTMENTS).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-position">Position</Label>
                <Input 
                  id="edit-position" 
                  name="position" 
                  defaultValue={selectedEmployee.position}
                  required 
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setEditEmployeeOpen(false);
                    setSelectedEmployee(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateEmployeeMutation.isPending}>
                  {updateEmployeeMutation.isPending ? 'Updating...' : 'Update Employee'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}