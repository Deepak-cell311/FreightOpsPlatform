import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Building2, 
  CheckCircle, 
  Clock, 
  Shield, 
  Mail,
  DollarSign,
  Users,
  Zap
} from 'lucide-react';

interface IssuedCard {
  id: string;
  accountId: string;
  cardNumber: string;
  cardType: 'virtual' | 'physical';
  holderName: string;
  holderEmail: string;
  status: 'active' | 'pending' | 'blocked';
  limits: {
    daily: number;
    monthly: number;
  };
  issuedAt: string;
  activatedAt?: string;
}

export default function EnterpriseBanking() {
  const [testCompanyId, setTestCompanyId] = useState(`test-company-${Date.now()}`);
  const [testAccountId, setTestAccountId] = useState(`account-${Date.now()}`);
  const [blockReason, setBlockReason] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for company cards
  const { data: cardsData, isLoading: cardsLoading } = useQuery({
    queryKey: ['/api/banking/cards', testCompanyId],
    enabled: false // Only fetch when explicitly triggered
  });

  // Simulate account approval mutation
  const approvalMutation = useMutation({
    mutationFn: async ({ accountId, companyId }: { accountId: string; companyId: string }) => {
      const response = await fetch('/api/banking/simulate-account-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, companyId })
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Account Approved",
          description: `${data.issuedCards.length} cards automatically issued`,
        });
        // Refetch cards
        queryClient.invalidateQueries({ queryKey: ['/api/banking/cards', testCompanyId] });
      }
    }
  });

  // Card activation mutation
  const activationMutation = useMutation({
    mutationFn: async (cardId: string) => {
      const response = await fetch(`/api/banking/cards/${cardId}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Card Activated",
        description: "Physical card is now active and ready to use",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/banking/cards', testCompanyId] });
    }
  });

  // Card blocking mutation
  const blockMutation = useMutation({
    mutationFn: async ({ cardId, reason }: { cardId: string; reason: string }) => {
      const response = await fetch(`/api/banking/cards/${cardId}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Card Blocked",
        description: "Card has been blocked for security",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/banking/cards', testCompanyId] });
    }
  });

  const handleApproval = () => {
    approvalMutation.mutate({ accountId: testAccountId, companyId: testCompanyId });
  };

  const handleFetchCards = () => {
    queryClient.fetchQuery({
      queryKey: ['/api/banking/cards', testCompanyId]
    });
  };

  const getStatusBadge = (status: string, cardType: string) => {
    if (status === 'active') {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    } else if (status === 'pending' && cardType === 'physical') {
      return <Badge className="bg-yellow-100 text-yellow-800">Shipping</Badge>;
    } else if (status === 'blocked') {
      return <Badge className="bg-red-100 text-red-800">Blocked</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
  };

  const cards = cardsData?.cards || [];
  const virtualCards = cards.filter((c: IssuedCard) => c.cardType === 'virtual');
  const physicalCards = cards.filter((c: IssuedCard) => c.cardType === 'physical');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Enterprise Banking</h1>
              <p className="text-gray-600">Automatic card issuance for approved banking accounts</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Zap className="h-4 w-4 text-green-500" />
              Instant virtual card activation
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="h-4 w-4 text-green-500" />
              No card issuance fees
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 text-blue-500" />
              Automatic email notifications
            </div>
          </div>
        </div>

        {/* Banking Workflow */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Account Approval Simulation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Account Approval Workflow
              </CardTitle>
              <CardDescription>
                Simulate banking account approval to trigger automatic card issuance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyId">Company ID</Label>
                <Input
                  id="companyId"
                  value={testCompanyId}
                  onChange={(e) => setTestCompanyId(e.target.value)}
                  placeholder="Enter company ID"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accountId">Account ID</Label>
                <Input
                  id="accountId"
                  value={testAccountId}
                  onChange={(e) => setTestAccountId(e.target.value)}
                  placeholder="Enter account ID"
                />
              </div>

              <Button 
                onClick={handleApproval}
                disabled={approvalMutation.isPending}
                className="w-full"
              >
                {approvalMutation.isPending ? 'Processing...' : 'Approve Account & Issue Cards'}
              </Button>

              {approvalMutation.data?.success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                    <CheckCircle className="h-4 w-4" />
                    Cards Successfully Issued
                  </div>
                  <p className="text-sm text-green-700">
                    {approvalMutation.data.issuedCards.length} cards automatically issued for authorized signers
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Card Management
              </CardTitle>
              <CardDescription>
                View and manage issued cards for the company
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleFetchCards}
                variant="outline"
                className="w-full"
                disabled={cardsLoading}
              >
                {cardsLoading ? 'Loading...' : 'Fetch Company Cards'}
              </Button>

              {cards.length > 0 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="font-medium text-blue-900">Virtual Cards</div>
                      <div className="text-blue-700">{virtualCards.length} active</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="font-medium text-purple-900">Physical Cards</div>
                      <div className="text-purple-700">{physicalCards.length} issued</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cards Display */}
        {cards.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Issued Cards ({cards.length})
              </CardTitle>
              <CardDescription>
                Cards automatically issued for authorized signers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cards.map((card: IssuedCard) => (
                  <div key={card.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className={`h-4 w-4 ${card.cardType === 'virtual' ? 'text-blue-500' : 'text-purple-500'}`} />
                        <span className="font-medium">{card.cardType.toUpperCase()}</span>
                      </div>
                      {getStatusBadge(card.status, card.cardType)}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{card.holderName}</div>
                      <div className="text-sm text-gray-600">{card.holderEmail}</div>
                      <div className="font-mono text-sm">{card.cardNumber}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>Daily: ${card.limits.daily.toLocaleString()}</div>
                      <div>Monthly: ${card.limits.monthly.toLocaleString()}</div>
                    </div>
                    
                    <div className="flex gap-2">
                      {card.status === 'pending' && card.cardType === 'physical' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => activationMutation.mutate(card.id)}
                          disabled={activationMutation.isPending}
                        >
                          Activate
                        </Button>
                      )}
                      
                      {card.status === 'active' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => blockMutation.mutate({ cardId: card.id, reason: 'Security test block' })}
                          disabled={blockMutation.isPending}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          Block
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Automatic Banking Features</CardTitle>
            <CardDescription>
              Enterprise-grade banking capabilities with automatic card issuance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Instant Virtual Cards</h4>
                  <p className="text-sm text-gray-600">Virtual cards are active immediately upon account approval</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Zero Cost Issuance</h4>
                  <p className="text-sm text-gray-600">Both virtual and physical cards issued at no cost</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-gray-600">Automatic notifications for all card activities</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Security Controls</h4>
                  <p className="text-sm text-gray-600">Real-time card blocking and fraud monitoring</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">3-5 Day Shipping</h4>
                  <p className="text-sm text-gray-600">Physical cards arrive with activation instructions</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Multi-Signer Support</h4>
                  <p className="text-sm text-gray-600">Cards issued for all authorized company signers</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}