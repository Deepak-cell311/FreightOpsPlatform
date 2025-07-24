import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check, Truck, Users, CreditCard, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// FreightOps Pro - Motor Carrier Subscription Plans
const SUBSCRIPTION_PLANS = {
  starter: {
    name: "Starter",
    monthlyPrice: 99,
    yearlyPrice: 999,
    description: "Essential trucking management for small carriers",
    driverLimit: 5,
    extraDriverPrice: 10,
    features: [
      "Up to 5 drivers included",
      "Unlimited vehicles & loads",
      "Complete dispatch system",
      "Fleet & maintenance management",
      "Driver management & payroll",
      "Billing & invoicing module",
      "Onboarding & HR tools",
      "Reporting & metrics",
      "QuickBooks + ELD + Banking integrations",
      "Access to support panel"
    ],
    popular: false
  },
  pro: {
    name: "Pro",
    monthlyPrice: 199,
    yearlyPrice: 1999,
    description: "Complete trucking operations for growing carriers",
    driverLimit: 15,
    extraDriverPrice: 8,
    features: [
      "Up to 15 drivers included",
      "Unlimited vehicles & loads",
      "Advanced dispatch system",
      "Complete fleet & maintenance management",
      "Advanced driver management & payroll",
      "Advanced billing & invoicing",
      "Complete onboarding & HR tools",
      "Advanced reporting & metrics",
      "All integrations included",
      "Priority support panel",
      "Multi-location support",
      "Advanced API integrations"
    ],
    popular: true
  }
};

export default function SubscriptionCheckout() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/subscribe/:planId?');
  const { toast } = useToast();
  
  const [selectedPlan, setSelectedPlan] = useState(params?.planId || 'pro');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (params?.planId && SUBSCRIPTION_PLANS[params.planId as keyof typeof SUBSCRIPTION_PLANS]) {
      setSelectedPlan(params.planId);
    }
  }, [params?.planId]);
  
  const handleSubscribe = async () => {
    if (!email || !companyName) {
      toast({
        title: 'Missing Information',
        description: 'Please provide your email and company name',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiRequest('POST', '/api/subscription/create-subscription-checkout', {
        planId: selectedPlan,
        billingCycle,
        email,
        companyName
      });
      
      const data = await response.json();
      
      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: 'Subscription Error',
        description: 'Failed to create subscription. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const selectedPlanConfig = SUBSCRIPTION_PLANS[selectedPlan as keyof typeof SUBSCRIPTION_PLANS];
  const currentPrice = billingCycle === 'yearly' ? selectedPlanConfig.yearlyPrice : selectedPlanConfig.monthlyPrice;
  const savings = billingCycle === 'yearly' ? ((selectedPlanConfig.monthlyPrice * 12) - selectedPlanConfig.yearlyPrice) : 0;
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Choose Your FreightOps Plan
          </h1>
          <p className="text-gray-600">
            Motor carrier focused pricing designed for your business needs
          </p>
          
          {/* Trial Period Banner */}
          <div className="bg-blue-50 p-4 rounded-lg mt-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-semibold text-blue-900">30-Day Free Trial</span>
            </div>
            <p className="text-blue-800 text-sm">
              Start your free trial today! Full access to all features for 30 days.
            </p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {Object.entries(SUBSCRIPTION_PLANS).map(([planId, plan]) => (
            <Card 
              key={planId}
              className={`cursor-pointer transition-all ${
                selectedPlan === planId 
                  ? 'ring-2 ring-blue-500 border-blue-500' 
                  : 'hover:border-gray-300'
              } ${plan.popular ? 'relative' : ''}`}
              onClick={() => setSelectedPlan(planId)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-blue-600">
                  ${billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}
                  <span className="text-sm font-normal text-gray-600">
                    /{billingCycle === 'yearly' ? 'year' : 'month'}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  ${plan.extraDriverPrice}/month per extra driver beyond {plan.driverLimit}
                </div>
                <p className="text-gray-600 text-sm">{plan.description}</p>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Complete Your Subscription</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Billing Cycle Selection */}
            <div>
              <Label className="text-sm font-medium">Billing Cycle</Label>
              <RadioGroup value={billingCycle} onValueChange={setBillingCycle} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly">Monthly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yearly" id="yearly" />
                  <Label htmlFor="yearly" className="flex items-center">
                    Yearly
                    {savings > 0 && (
                      <Badge variant="outline" className="ml-2 text-green-600">
                        Save ${savings}
                      </Badge>
                    )}
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Company Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter your company name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            
            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{selectedPlanConfig.name}</span>
                <span className="font-bold">${currentPrice}</span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                30-day free trial included
              </div>
              {billingCycle === 'yearly' && savings > 0 && (
                <div className="text-sm text-green-600 font-medium">
                  You save ${savings} annually
                </div>
              )}
            </div>
            
            {/* Subscribe Button */}
            <Button
              onClick={handleSubscribe}
              disabled={isLoading || !email || !companyName}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Start Free Trial
                </>
              )}
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              Your free trial starts immediately. Cancel anytime during the trial period.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}