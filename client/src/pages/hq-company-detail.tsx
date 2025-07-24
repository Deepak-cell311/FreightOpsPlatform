import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Building2, 
  DollarSign, 
  Truck, 
  FileText, 
  CreditCard, 
  Activity,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Shield,
  AlertTriangle,
  CheckCircle,
  Banknote,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface CompanyProfile {
  id: string;
  name: string;
  dotNumber: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  createdAt: Date;
  bankingEnabled: boolean;
  accountBalance: number;
  totalUsers: number;
  totalVehicles: number;
  totalDrivers: number;
  totalLoads: number;
  monthlyRevenue: number;
}

interface CompanyUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  lastLogin: Date;
}

interface BankingData {
  accountBalance: number;
  availableBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  monthlyTransactions: number;
  cards: any[];
  recentTransactions: any[];
}

interface FleetData {
  vehicles: any[];
  drivers: any[];
  activeLoads: any[];
  completedLoads: number;
}

export default function HQCompanyDetail() {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Get company ID from URL
  const companyId = window.location.pathname.split('/').pop();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/hq/login");
      return;
    }
    
    if (user && !['super_admin', 'hq_admin', 'admin'].includes(user.role || '')) {
      setLocation("/");
      return;
    }
  }, [isAuthenticated, user, setLocation]);

  // Fetch company summary data
  const { data: companySummary, isLoading: summaryLoading } = useQuery({
    queryKey: [`/api/hq/companies/${companyId}/summary`],
    enabled: Boolean(isAuthenticated && user && companyId && ['super_admin', 'hq_admin', 'admin'].includes(user.role || ''))
  });

  if (!isAuthenticated || !user || !['super_admin', 'hq_admin', 'admin'].includes(user.role || '')) {
    return null;
  }

  if (summaryLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const company = companySummary as any;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tenant Overview</h1>
          <p className="text-gray-600 dark:text-gray-400">System manager view for {company?.name || 'Company'}</p>
        </div>
        <Button variant="outline" onClick={() => setLocation("/hq/admin")}>
          Back to Dashboard
        </Button>
      </div>

      {/* Tenant Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(company?.accountBalance || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Status: {company?.bankingEnabled ? 'Active' : 'Inactive'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Active accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fleet Size</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company?.totalVehicles || 0}</div>
            <p className="text-xs text-muted-foreground">Registered trucks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={company?.status === 'approved' ? 'default' : 'secondary'}>
                {company?.status || 'pending'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Overall health</p>
          </CardContent>
        </Card>
      </div>

      {/* Company Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Tenant Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Basic Information</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Company Name:</span> {company?.name || 'N/A'}</div>
                <div><span className="font-medium">DOT Number:</span> {company?.dotNumber || 'Pending'}</div>
                <div><span className="font-medium">Status:</span> 
                  <Badge variant={company?.status === 'approved' ? 'default' : 'secondary'} className="ml-2">
                    {company?.status === 'approved' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                    {company?.status || 'pending'}
                  </Badge>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Contact Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{company?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>{company?.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{company?.address || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">System Metrics</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Account Created:</span> {company?.createdAt ? new Date(company.createdAt).toLocaleDateString() : 'N/A'}</div>
                <div><span className="font-medium">Total Drivers:</span> {company?.totalDrivers || 0}</div>
                <div><span className="font-medium">Monthly Loads:</span> {company?.totalLoads || 0}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}