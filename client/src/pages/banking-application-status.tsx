import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  Building, 
  CreditCard,
  RefreshCw,
  ArrowRight
} from "lucide-react";

export default function BankingApplicationStatus() {
  const { user } = useAuth();

  // Get application status
  const { data: applicationStatus, isLoading, refetch } = useQuery<{
    hasApplication: boolean;
    status: string;
    applicationId?: string;
    requiredDocuments?: string[];
    message?: string;
  }>({
    queryKey: ['/api/banking/application-status'],
    retry: false,
    refetchInterval: 30000 // Check every 30 seconds
  });

  // Get banking activation status
  const { data: bankingStatus } = useQuery<{
    isActivated: boolean;
    hasApplication: boolean;
    applicationStatus: string;
  }>({
    queryKey: ['/api/banking/activation-status'],
    retry: false
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If banking is already activated, redirect to banking dashboard
  if (bankingStatus && bankingStatus.isActivated) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Banking Activated</h1>
            <p className="text-muted-foreground">Your banking services are active and ready to use.</p>
          </div>
          <Button onClick={() => window.location.href = '/banking'}>
            Go to Banking Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Banking Services Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your banking application has been approved and your account is ready for transactions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'under_review':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'requires_documents':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'requires_documents':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'submitted':
        return 25;
      case 'under_review':
        return 50;
      case 'requires_documents':
        return 75;
      case 'approved':
        return 100;
      case 'rejected':
        return 0;
      default:
        return 0;
    }
  };

  if (!applicationStatus || !applicationStatus.hasApplication) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Banking Application</h1>
            <p className="text-muted-foreground">Start your banking application to access financial services.</p>
          </div>
          <Button onClick={() => window.location.href = '/banking'}>
            Start Application
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              No Application Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You haven't started your banking application yet. Complete the application to access:
            </p>
            <ul className="text-sm space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Business banking account
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                ACH transfers and wire payments
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Virtual and physical cards
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Real-time transaction monitoring
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Application Status</h1>
          <p className="text-muted-foreground">Track your banking application progress.</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Status
        </Button>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(applicationStatus.status)}
              Application Status
            </div>
            <Badge className={getStatusColor(applicationStatus.status)}>
              {applicationStatus.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{getProgressValue(applicationStatus.status)}%</span>
            </div>
            <Progress value={getProgressValue(applicationStatus.status)} className="h-2" />
          </div>

          {applicationStatus.applicationId && (
            <div className="text-sm">
              <span className="font-medium">Application ID:</span> {applicationStatus.applicationId}
            </div>
          )}

          {applicationStatus.message && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm">{applicationStatus.message}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Required Documents */}
      {applicationStatus && applicationStatus.status === 'requires_documents' && applicationStatus.requiredDocuments && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Required Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Please provide the following documents to continue your application:
            </p>
            <ul className="space-y-2">
              {applicationStatus.requiredDocuments.map((doc: string, index: number) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  {doc}
                </li>
              ))}
            </ul>
            <Button className="mt-4" onClick={() => window.location.href = '/banking'}>
              Upload Documents
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applicationStatus && applicationStatus.status === 'submitted' && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium">Under Review</p>
                  <p className="text-sm text-muted-foreground">
                    Your application is being reviewed by our banking partner. This typically takes 1-3 business days.
                  </p>
                </div>
              </div>
            )}

            {applicationStatus && applicationStatus.status === 'under_review' && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium">Review in Progress</p>
                  <p className="text-sm text-muted-foreground">
                    We're processing your application. You'll be notified once the review is complete.
                  </p>
                </div>
              </div>
            )}

            {applicationStatus && applicationStatus.status === 'approved' && (
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Application Approved</p>
                  <p className="text-sm text-muted-foreground">
                    Your banking application has been approved! Your account is being set up and will be available shortly.
                  </p>
                </div>
              </div>
            )}

            {applicationStatus && applicationStatus.status === 'rejected' && (
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium">Application Requires Attention</p>
                  <p className="text-sm text-muted-foreground">
                    There was an issue with your application. Please contact support for assistance.
                  </p>
                  <Button variant="outline" className="mt-2" size="sm">
                    Contact Support
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}