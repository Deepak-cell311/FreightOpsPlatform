import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { 
  Building2, 
  CreditCard, 
  DollarSign, 
  Shield, 
  CheckCircle2,
  AlertCircle,
  Truck,
  Users,
  ExternalLink
} from "lucide-react";

interface EmbeddedSession {
  sessionToken: string;
  embeddedUrl: string;
  expiresAt: string;
}

interface CustomerStatus {
  status: string;
  kycStatus: string;
  accountStatus: string;
  complianceFlags: string[];
}

export function RailsrEmbeddedBanking() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const bankingIframeRef = useRef<HTMLIFrameElement>(null);
  const [activeSession, setActiveSession] = useState<EmbeddedSession | null>(null);
  const [embeddedFeature, setEmbeddedFeature] = useState<'banking' | 'cards' | 'payments'>('banking');

  // Check customer banking status
  const { data: customerStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/banking/embedded/status"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/banking/embedded/status");
      return await res.json();
    },
  });

  // Initialize embedded banking onboarding
  const initializeOnboardingMutation = useMutation({
    mutationFn: async (companyData: any) => {
      const res = await apiRequest("POST", "/api/banking/embedded/onboarding", companyData);
      return await res.json();
    },
    onSuccess: (data) => {
      setActiveSession(data);
      toast({
        title: "Banking Onboarding Started",
        description: "Complete the secure onboarding process in the embedded interface.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Onboarding Failed",
        description: error.message || "Failed to start banking onboarding",
        variant: "destructive",
      });
    },
  });

  // Create embedded banking session
  const createBankingSessionMutation = useMutation({
    mutationFn: async (features: string[]) => {
      const res = await apiRequest("POST", "/api/banking/embedded/session", { features });
      return await res.json();
    },
    onSuccess: (data) => {
      setActiveSession(data);
    },
  });

  // Create embedded payment session for loads
  const createPaymentSessionMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const res = await apiRequest("POST", "/api/banking/embedded/payment", paymentData);
      return await res.json();
    },
    onSuccess: (data) => {
      setActiveSession(data);
      setEmbeddedFeature('payments');
    },
  });

  // Handle embedded banking events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://embed.railsr.com' && event.origin !== 'https://embed.railsbank.com') {
        return;
      }

      const { type, data } = event.data;

      switch (type) {
        case 'unit.onboarding.complete':
          queryClient.invalidateQueries({ queryKey: ["/api/banking/embedded/status"] });
          toast({
            title: "Banking Account Approved",
            description: "Your business banking account is now active and ready to use.",
          });
          setActiveSession(null);
          break;

        case 'unit.payment.complete':
          queryClient.invalidateQueries({ queryKey: ["/api/loads"] });
          toast({
            title: "Payment Processed",
            description: `Payment of $${(data.amount / 100).toFixed(2)} completed successfully.`,
          });
          setActiveSession(null);
          break;

        case 'unit.card.issued':
          queryClient.invalidateQueries({ queryKey: ["/api/banking/embedded/status"] });
          toast({
            title: "Card Issued",
            description: "New debit card has been issued and is ready for use.",
          });
          break;

        case 'unit.session.expired':
          setActiveSession(null);
          toast({
            title: "Session Expired",
            description: "Banking session has expired. Please create a new session.",
            variant: "destructive",
          });
          break;

        case 'unit.error':
          toast({
            title: "Banking Error",
            description: data.message || "An error occurred with the banking interface.",
            variant: "destructive",
          });
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [queryClient, toast]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'approved': { variant: 'default' as const, label: 'Active', icon: CheckCircle2 },
      'pending': { variant: 'secondary' as const, label: 'Pending Review', icon: AlertCircle },
      'rejected': { variant: 'destructive' as const, label: 'Rejected', icon: AlertCircle },
      'none': { variant: 'outline' as const, label: 'Not Started', icon: Building2 },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Banking not initialized - show onboarding
  if (!customerStatus?.customerId) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Shield className="h-6 w-6 text-green-600" />
            Secure Business Banking
          </CardTitle>
          <p className="text-sm text-gray-600">
            FDIC-insured business banking with embedded compliance and fraud protection
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-medium">Railsr Compliance</h3>
              <p className="text-sm text-gray-500">KYC, fraud protection, regulatory compliance handled automatically</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Building2 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium">FreightOps Integration</h3>
              <p className="text-sm text-gray-500">Custom UI integrated with your load and driver management</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-medium">Instant Payments</h3>
              <p className="text-sm text-gray-500">Pay drivers and customers directly from load management</p>
            </div>
          </div>

          <Separator />

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">Best of Both Worlds</h4>
                <p className="text-sm text-green-700 mt-1">
                  Railsr handles all compliance, fraud detection, and regulatory requirements while you get 
                  a banking interface that feels like part of FreightOps with your custom freight workflows.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button 
              onClick={() => initializeOnboardingMutation.mutate({
                companyName: user?.companyName || "FreightOps Company",
                email: user?.email,
              })}
              disabled={initializeOnboardingMutation.isPending}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              {initializeOnboardingMutation.isPending ? "Starting Secure Onboarding..." : "Start Secure Banking Setup"}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Powered by Railsr • FCA Regulated • Bank-grade security • Compliance handled automatically
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show embedded banking interface
  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Business Banking Status
            {getStatusBadge(customerStatus.status)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium">Account Status</h4>
              <p className="text-sm text-gray-600">{customerStatus.accountStatus}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium">KYC Status</h4>
              <p className="text-sm text-gray-600">{customerStatus.kycStatus}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium">Compliance</h4>
              <p className="text-sm text-gray-600">
                {customerStatus.complianceFlags?.length ? 
                  `${customerStatus.complianceFlags.length} flags` : 
                  'All clear'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Banking Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Banking Dashboard
            <div className="flex gap-2">
              <Button
                variant={embeddedFeature === 'banking' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setEmbeddedFeature('banking');
                  createBankingSessionMutation.mutate(['accounts', 'transactions']);
                }}
              >
                <Building2 className="h-4 w-4 mr-1" />
                Accounts
              </Button>
              <Button
                variant={embeddedFeature === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setEmbeddedFeature('cards');
                  createBankingSessionMutation.mutate(['cards']);
                }}
              >
                <CreditCard className="h-4 w-4 mr-1" />
                Cards
              </Button>
            </div>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Secure banking interface with embedded compliance - Railsr handles fraud detection and regulatory requirements
          </p>
        </CardHeader>
        <CardContent>
          {activeSession ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Secure Banking Session Active</span>
                </div>
                <Badge variant="outline" className="text-green-700">
                  Railsr Protected
                </Badge>
              </div>
              
              <div className="border rounded-lg overflow-hidden" style={{ height: '500px' }}>
                <iframe
                  ref={bankingIframeRef}
                  src={activeSession.embeddedUrl}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  title="Railsr Embedded Banking"
                  allow="payment; microphone; camera"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  className="w-full h-full"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Start Banking Session</h3>
              <p className="text-gray-600 mb-4">
                Click on Accounts or Cards above to access your secure banking interface
              </p>
              <p className="text-sm text-gray-500">
                All banking operations are protected by Railsr's compliance and fraud detection systems
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions for Freight Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Freight Banking Actions</CardTitle>
          <p className="text-sm text-gray-600">
            Custom freight workflows with embedded banking compliance
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-20 flex-col">
                  <Truck className="h-6 w-6 mb-2" />
                  Pay for Load
                  <span className="text-xs text-gray-500">Embedded payment with fraud protection</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Pay for Load</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Load Number</Label>
                    <Input placeholder="Enter load number" />
                  </div>
                  <div>
                    <Label>Customer Bank Details</Label>
                    <Input placeholder="Routing number" className="mb-2" />
                    <Input placeholder="Account number" />
                  </div>
                  <Button 
                    onClick={() => createPaymentSessionMutation.mutate({
                      loadId: 'load_123',
                      amount: 2500.00,
                      description: 'Payment for Load #123'
                    })}
                    disabled={createPaymentSessionMutation.isPending}
                    className="w-full"
                  >
                    {createPaymentSessionMutation.isPending ? "Starting Secure Payment..." : "Start Secure Payment"}
                  </Button>
                  <p className="text-xs text-gray-500">
                    Payment will be processed through Railsr's secure embedded interface with fraud protection
                  </p>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              Driver Payroll
              <span className="text-xs text-gray-500">Embedded ACH with compliance</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}