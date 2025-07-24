import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CreditCard, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface SubscriptionStatus {
  planId: string;
  planName: string;
  currentDrivers: number;
  includedDrivers: number;
  extraDrivers: number;
  baseCost: number;
  extraCost: number;
  totalCost: number;
  upgradeRecommended: boolean;
  trialStatus: {
    isTrialActive: boolean;
    trialDaysLeft: number;
    trialEndDate: Date | null;
  };
}

export function SubscriptionStatusCard() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);
  
  const fetchSubscriptionStatus = async () => {
    try {
      const response = await apiRequest('GET', '/api/subscription/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else {
        throw new Error('Failed to fetch subscription status');
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription status',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!status) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600">No subscription found</p>
        </CardContent>
      </Card>
    );
  }
  
  const usagePercentage = (status.currentDrivers / status.includedDrivers) * 100;
  const isNearLimit = usagePercentage >= 80;
  const isOverLimit = status.currentDrivers > status.includedDrivers;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Subscription Status
          </span>
          <div className="flex space-x-2">
            {status.trialStatus.isTrialActive && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                Trial Active
              </Badge>
            )}
            <Badge variant={isOverLimit ? 'destructive' : 'default'}>
              {status.planName}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Trial Status */}
        {status.trialStatus.isTrialActive && (
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-green-900">
                Free Trial Active
              </span>
            </div>
            <p className="text-sm text-green-800">
              {status.trialStatus.trialDaysLeft} days remaining in your free trial
            </p>
            <p className="text-xs text-green-700 mt-1">
              Full access to all features until {status.trialStatus.trialEndDate ? new Date(status.trialStatus.trialEndDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        )}
        
        {/* Driver Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-gray-600" />
              <span className="text-sm font-medium">Driver Usage</span>
            </div>
            <span className="text-sm text-gray-600">
              {status.currentDrivers} / {status.includedDrivers}
            </span>
          </div>
          
          <Progress 
            value={Math.min(usagePercentage, 100)} 
            className="h-2"
          />
          
          {isOverLimit && (
            <div className="flex items-center mt-2 text-orange-600">
              <AlertTriangle className="w-4 h-4 mr-1" />
              <span className="text-sm">
                {status.extraDrivers} extra driver{status.extraDrivers > 1 ? 's' : ''} 
                (+${status.extraCost}/month)
              </span>
            </div>
          )}
          
          {isNearLimit && !isOverLimit && (
            <div className="flex items-center mt-2 text-amber-600">
              <AlertTriangle className="w-4 h-4 mr-1" />
              <span className="text-sm">
                Approaching driver limit
              </span>
            </div>
          )}
        </div>
        
        {/* Cost Breakdown */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Base Plan</span>
            <span className="font-medium">
              {status.trialStatus.isTrialActive ? 'Free' : `$${status.baseCost}/month`}
            </span>
          </div>
          
          {status.extraCost > 0 && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Extra Drivers</span>
              <span className="font-medium text-orange-600">
                {status.trialStatus.isTrialActive ? 'Free' : `+$${status.extraCost}/month`}
              </span>
            </div>
          )}
          
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="font-medium">
              {status.trialStatus.isTrialActive ? 'Trial Total' : 'Total'}
            </span>
            <span className="font-bold text-lg">
              {status.trialStatus.isTrialActive ? 'Free' : `$${status.totalCost}/month`}
            </span>
          </div>
          
          {status.trialStatus.isTrialActive && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">After trial ends</span>
                <span className="font-medium">${status.totalCost}/month</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Upgrade Recommendation */}
        {status.upgradeRecommended && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center mb-2">
              <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Upgrade Recommended
              </span>
            </div>
            <p className="text-sm text-blue-800 mb-3">
              Based on your driver count, upgrading to Pro would save you money.
            </p>
            <Button size="sm" variant="outline" className="w-full">
              Upgrade to Pro
            </Button>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1">
            Manage Plan
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            Billing History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}