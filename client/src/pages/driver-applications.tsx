import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  UserPlus, 
  Mail, 
  Shield, 
  Eye,
  Search,
  Filter,
  Download,
  Upload,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Users
} from "lucide-react";

interface DriverApplication {
  id: number;
  applicationNumber: string;
  applicationType: "dot" | "non_dot";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  notes?: string;
}

interface DriverVerification {
  id: number;
  applicationId: number;
  verificationType: string;
  status: string;
  provider?: string;
  results?: any;
  cost?: number;
  requestedAt: string;
  completedAt?: string;
  expiresAt?: string;
}

const statusColors = {
  submitted: "bg-blue-100 text-blue-800",
  under_review: "bg-yellow-100 text-yellow-800",
  mvr_pending: "bg-orange-100 text-orange-800",
  psp_pending: "bg-orange-100 text-orange-800",
  cdl_pending: "bg-orange-100 text-orange-800",
  background_pending: "bg-orange-100 text-orange-800",
  drug_test_pending: "bg-purple-100 text-purple-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  withdrawn: "bg-gray-100 text-gray-800"
};

const verificationStatusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-800",
  cancelled: "bg-gray-100 text-gray-800"
};

export default function DriverApplications() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("applications");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<DriverApplication | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteType, setInviteType] = useState<"dot" | "non_dot">("dot");
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | "request_verification">("approve");
  const [reviewNotes, setReviewNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [verificationType, setVerificationType] = useState("");

  // Fetch driver applications
  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ["/api/driver-applications"],
  });

  // Fetch verifications for selected application
  const { data: verifications = [] } = useQuery({
    queryKey: ["/api/driver-verifications", selectedApplication?.id],
    enabled: !!selectedApplication,
  });

  // Send invitation mutation
  const sendInviteMutation = useMutation({
    mutationFn: async (data: { email: string; type: "dot" | "non_dot" }) => {
      await apiRequest("POST", "/api/driver-applications/invite", data);
    },
    onSuccess: () => {
      toast({
        title: "Invitation Sent",
        description: "Driver application invitation has been sent successfully.",
      });
      setInviteDialogOpen(false);
      setInviteEmail("");
      queryClient.invalidateQueries({ queryKey: ["/api/driver-applications"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Review application mutation
  const reviewMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", `/api/driver-applications/${selectedApplication?.id}/review`, data);
    },
    onSuccess: () => {
      toast({
        title: "Application Reviewed",
        description: "Application status has been updated successfully.",
      });
      setReviewDialogOpen(false);
      setSelectedApplication(null);
      setReviewNotes("");
      setRejectionReason("");
      queryClient.invalidateQueries({ queryKey: ["/api/driver-applications"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Request verification mutation
  const requestVerificationMutation = useMutation({
    mutationFn: async (data: { applicationType: string; verificationType: string }) => {
      await apiRequest("POST", `/api/driver-applications/${selectedApplication?.id}/request-verification`, data);
    },
    onSuccess: () => {
      toast({
        title: "Verification Requested",
        description: "Background verification has been initiated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/driver-verifications", selectedApplication?.id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredApplications = applications.filter((app: DriverApplication) => {
    const matchesSearch = 
      app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleReviewSubmit = () => {
    const data: any = {
      action: reviewAction,
      notes: reviewNotes,
    };

    if (reviewAction === "reject") {
      data.rejectionReason = rejectionReason;
    } else if (reviewAction === "request_verification") {
      data.verificationType = verificationType;
    }

    reviewMutation.mutate(data);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "submitted":
      case "under_review":
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (applicationsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Driver Applications</h1>
          <p className="text-muted-foreground">
            Manage DOT and Non-DOT driver applications with automated background checks
          </p>
        </div>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Send Invitation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Driver Application Invitation</DialogTitle>
              <DialogDescription>
                Send an application invitation to a potential driver
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="driver@example.com"
                />
              </div>
              <div>
                <Label htmlFor="type">Application Type</Label>
                <Select value={inviteType} onValueChange={(value: "dot" | "non_dot") => setInviteType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dot">DOT Driver</SelectItem>
                    <SelectItem value="non_dot">Non-DOT Driver</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => sendInviteMutation.mutate({ email: inviteEmail, type: inviteType })}
                  disabled={!inviteEmail || sendInviteMutation.isPending}
                >
                  {sendInviteMutation.isPending && (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  )}
                  Send Invitation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search applications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="mvr_pending">MVR Pending</SelectItem>
                      <SelectItem value="psp_pending">PSP Pending</SelectItem>
                      <SelectItem value="cdl_pending">CDL Pending</SelectItem>
                      <SelectItem value="background_pending">Background Pending</SelectItem>
                      <SelectItem value="drug_test_pending">Drug Test Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Applications List */}
          <div className="grid gap-4">
            {filteredApplications.map((application: DriverApplication) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold">
                            {application.firstName} {application.lastName}
                          </h3>
                          <Badge variant={application.applicationType === "dot" ? "default" : "secondary"}>
                            {application.applicationType.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {application.email}
                          </span>
                          <span className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {application.phone}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(application.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-2">
                          <span className="text-xs text-muted-foreground">
                            Application #{application.applicationNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[application.status as keyof typeof statusColors]}`}>
                        {getStatusIcon(application.status)}
                        <span className="capitalize">{application.status.replace('_', ' ')}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedApplication(application)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredApplications.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">No applications found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Send invitations to potential drivers to get started"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="invitations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sent Invitations</CardTitle>
              <CardDescription>
                Track invitation status and resend if needed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4" />
                <p>No invitations sent yet</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{applications.length}</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {applications.filter((app: DriverApplication) => 
                    ["submitted", "under_review"].includes(app.status)
                  ).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Needs attention
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {applications.filter((app: DriverApplication) => app.status === "approved").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ready for onboarding
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verification Cost</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${applicationData?.totalCost || 0}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Application Review Dialog */}
      {selectedApplication && (
        <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Application Review - {selectedApplication.firstName} {selectedApplication.lastName}
              </DialogTitle>
              <DialogDescription>
                Application #{selectedApplication.applicationNumber} • 
                {selectedApplication.applicationType.toUpperCase()} Driver
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="w-full">
              <TabsList>
                <TabsTrigger value="details">Application Details</TabsTrigger>
                <TabsTrigger value="verifications">Background Checks</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Name:</span>
                        <span className="text-sm font-medium">
                          {selectedApplication.firstName} {selectedApplication.lastName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Email:</span>
                        <span className="text-sm">{selectedApplication.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Phone:</span>
                        <span className="text-sm">{selectedApplication.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Type:</span>
                        <Badge variant={selectedApplication.applicationType === "dot" ? "default" : "secondary"}>
                          {selectedApplication.applicationType.toUpperCase()}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Application Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[selectedApplication.status as keyof typeof statusColors]}`}>
                          {getStatusIcon(selectedApplication.status)}
                          <span className="capitalize">{selectedApplication.status.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Submitted:</span>
                        <span className="text-sm">
                          {new Date(selectedApplication.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {selectedApplication.reviewedAt && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Reviewed:</span>
                          <span className="text-sm">
                            {new Date(selectedApplication.reviewedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                {selectedApplication.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">HR Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedApplication.notes}</p>
                    </CardContent>
                  </Card>
                )}
                
                <div className="flex justify-end space-x-2">
                  <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>Review Application</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Review Application</DialogTitle>
                        <DialogDescription>
                          Take action on this driver application
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Action</Label>
                          <Select value={reviewAction} onValueChange={(value: any) => setReviewAction(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="approve">Approve Application</SelectItem>
                              <SelectItem value="reject">Reject Application</SelectItem>
                              <SelectItem value="request_verification">Request Background Check</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {reviewAction === "reject" && (
                          <div>
                            <Label htmlFor="rejection-reason">Rejection Reason</Label>
                            <Textarea
                              id="rejection-reason"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Explain why this application is being rejected..."
                            />
                          </div>
                        )}
                        
                        {reviewAction === "request_verification" && (
                          <div>
                            <Label>Verification Type</Label>
                            <Select value={verificationType} onValueChange={setVerificationType}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select verification type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mvr">Motor Vehicle Record (MVR)</SelectItem>
                                <SelectItem value="psp">Pre-Employment Screening Program (PSP)</SelectItem>
                                <SelectItem value="cdl">CDL Verification</SelectItem>
                                <SelectItem value="background">Background Check</SelectItem>
                                <SelectItem value="drug_test">Drug Test</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        <div>
                          <Label htmlFor="review-notes">Notes</Label>
                          <Textarea
                            id="review-notes"
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            placeholder="Add any internal notes..."
                          />
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleReviewSubmit} disabled={reviewMutation.isPending}>
                            {reviewMutation.isPending && (
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                            )}
                            Submit Review
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </TabsContent>
              
              <TabsContent value="verifications" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Background Checks & Verifications</h3>
                  <Button
                    size="sm"
                    onClick={() => requestVerificationMutation.mutate({
                      applicationType: selectedApplication.applicationType,
                      verificationType: "mvr"
                    })}
                    disabled={requestVerificationMutation.isPending}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Request Verification
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {verifications.map((verification: DriverVerification) => (
                    <Card key={verification.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">
                              {verification.verificationType.toUpperCase().replace('_', ' ')}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Requested {new Date(verification.requestedAt).toLocaleDateString()}
                              {verification.provider && ` • ${verification.provider}`}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {verification.cost && (
                              <span className="text-sm font-medium">${verification.cost}</span>
                            )}
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${verificationStatusColors[verification.status as keyof typeof verificationStatusColors]}`}>
                              <span className="capitalize">{verification.status.replace('_', ' ')}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {verifications.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground">No verifications requested</h3>
                      <p className="text-muted-foreground">
                        Start the background check process for this applicant
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Application Documents</h3>
                  <Button size="sm" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
                
                <Card>
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground">No documents uploaded</h3>
                    <p className="text-muted-foreground">
                      Application documents will appear here once uploaded
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}