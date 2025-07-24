import { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, CreditCard, Calendar, Users, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function SubscriptionSuccess() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/subscription/success');
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      handleSubscriptionSuccess(sessionId);
    } else {
      setIsProcessing(false);
      toast({
        title: 'Invalid Session',
        description: 'No session ID found in URL',
        variant: 'destructive'
      });
    }
  }, []);
  
  const handleSubscriptionSuccess = async (sessionId: string) => {
    try {
      // Get the company ID from user context (you may need to implement this)
      const companyId = 'company-1'; // This should come from authenticated user context
      
      const response = await apiRequest('POST', '/api/subscription/handle-subscription-success', {
        sessionId,
        companyId
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data.subscription);
        
        toast({
          title: 'Subscription Activated!',
          description: 'Your FreightOps subscription is now active.',
          variant: 'default'
        });
      } else {
        throw new Error('Failed to process subscription');
      }
    } catch (error) {
      console.error('Subscription success error:', error);
      toast({
        title: 'Processing Error',
        description: 'There was an issue processing your subscription. Please contact support.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Processing Your Subscription</h2>
            <p className="text-gray-600">Please wait while we activate your FreightOps account...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Subscription Activated!</CardTitle>
            <p className="text-gray-600 mt-2">
              Welcome to FreightOps Pro! Your subscription is now active and ready to use.
            </p>
          </CardHeader>
          
          {subscriptionData && (
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CreditCard className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="font-medium">Plan</span>
                  </div>
                  <div className="text-xl font-bold text-blue-600">
                    {subscriptionData.planName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {subscriptionData.billingCycle === 'yearly' ? 'Annual' : 'Monthly'} billing
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Users className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="font-medium">Driver Limit</span>
                  </div>
                  <div className="text-xl font-bold text-blue-600">
                    {subscriptionData.planId === 'starter' ? '5' : '15'} drivers
                  </div>
                  <div className="text-sm text-gray-600">
                    Included in your plan
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-900">Free Trial</span>
                </div>
                <p className="text-blue-800 text-sm">
                  Your 30-day free trial starts now. You won't be charged until the trial period ends.
                </p>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">What's included:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Complete dispatch system
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Fleet & maintenance management
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Driver management & payroll
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Billing & invoicing module
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    QuickBooks + ELD + Banking integrations
                  </li>
                </ul>
              </div>
            </CardContent>
          )}
        </Card>
        
        <div className="text-center space-y-4">
          <Button 
            onClick={() => setLocation('/dashboard')}
            size="lg"
            className="mr-4"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setLocation('/settings')}
            size="lg"
          >
            Manage Subscription
          </Button>
        </div>
      </div>
    </div>
  );
}