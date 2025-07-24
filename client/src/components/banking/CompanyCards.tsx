import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Eye, EyeOff, Copy, RefreshCw, Plus, Lock, Unlock } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface CardData {
  id: string;
  type: string;
  last4: string;
  status: string;
  expirationDate: string;
  bin: string;
  createdAt: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export function CompanyCards() {
  const [showCardNumbers, setShowCardNumbers] = useState(false);
  const { toast } = useToast();

  const { user } = useAuth();
  
  const { data: bankingStatus } = useQuery({
    queryKey: ['/api/banking/application-status'],
    enabled: !!user,
  });

  const { data: cardsData, isLoading, refetch } = useQuery({
    queryKey: ['/api/railsr/companies', user?.companyId, 'cards'],
    enabled: !!user?.companyId && !!bankingStatus?.hasApplication,
    refetchInterval: 30000,
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  const getCardIcon = (type: string) => {
    if (type.includes('virtual')) {
      return <CreditCard className="h-5 w-5 text-blue-600" />;
    }
    return <CreditCard className="h-5 w-5 text-green-600" />;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Active': { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      'Inactive': { variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      'Blocked': { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      'Pending': { variant: 'outline' as const, color: 'bg-blue-100 text-blue-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {status}
      </Badge>
    );
  };

  const formatCardType = (type: string) => {
    if (type.includes('virtual')) return 'Virtual Debit Card';
    if (type.includes('debit')) return 'Physical Debit Card';
    return 'Card';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Company Cards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const cards = cardsData || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Company Cards ({cards.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCardNumbers(!showCardNumbers)}
            >
              {showCardNumbers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {cards.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No cards issued yet</p>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Request Card
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {cards.map((card: CardData) => (
              <div key={card.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getCardIcon(card.type)}
                    <div>
                      <p className="font-medium">{formatCardType(card.type)}</p>
                      <p className="text-sm text-gray-500">
                        {showCardNumbers ? `**** **** **** ${card.last4}` : `•••• ${card.last4}`}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(card.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Expires</p>
                    <p className="font-mono">{card.expirationDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Card ID</p>
                    <p className="font-mono">{card.id}</p>
                  </div>
                </div>

                {card.shippingAddress && (
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Shipping Address</p>
                    <p className="text-sm">
                      {card.shippingAddress.street}, {card.shippingAddress.city}, {card.shippingAddress.state} {card.shippingAddress.postalCode}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(card.last4, 'Card number')}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  
                  {card.status === 'Active' ? (
                    <Button variant="outline" size="sm">
                      <Lock className="h-3 w-3 mr-1" />
                      Lock Card
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm">
                      <Unlock className="h-3 w-3 mr-1" />
                      Unlock Card
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}