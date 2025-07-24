import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, CreditCard, Users, Truck, MapPin, FileText, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TrialExpiredModalProps {
  isOpen: boolean;
  currentServices: string[];
  currentPlan: string;
  monthlyPrice: number;
  onAcceptPayment: () => void;
  onDeclinePayment: () => void;
}

interface PlanTier {
  name: string;
  price: number;
  description: string;
  features: string[];
  recommended?: boolean;
}

interface AddOn {
  name: string;
  price: number;
  description: string;
  icon: any;
}

const planTiers: PlanTier[] = [
  {
    name: 'Essential',
    price: 99,
    description: 'Perfect for small carriers',
    features: [
      'Up to 5 drivers',
      'Basic load management',
      'Simple dispatch board',
      'Basic reporting',
      'Email support'
    ]
  },
  {
    name: 'Professional',
    price: 199,
    description: 'Most popular for growing companies',
    features: [
      'Up to 25 drivers',
      'Advanced load management',
      'Full dispatch system',
      'Financial management',
      'Google Maps tracking',
      'Advanced reporting',
      'Phone support'
    ],
    recommended: true
  },
  {
    name: 'Enterprise',
    price: 399,
    description: 'For large fleets',
    features: [
      'Unlimited drivers',
      'Complete TMS suite',
      'AI-powered insights',
      'Custom integrations',
      'Banking services',
      'Priority support',
      'Custom training'
    ]
  }
];

const addOns: AddOn[] = [
  {
    name: 'Container Management',
    price: 50,
    description: 'Port tracking, chassis management, demurrage alerts',
    icon: MapPin
  },
  {
    name: 'Advanced Banking',
    price: 75,
    description: 'Business banking, virtual cards, ACH processing',
    icon: CreditCard
  },
  {
    name: 'HR & Payroll',
    price: 40,
    description: 'Employee management, payroll processing, benefits',
    icon: Users
  },
  {
    name: 'AI Accountant',
    price: 60,
    description: 'Automated bookkeeping, tax optimization, insights',
    icon: Calculator
  }
];

export default function TrialExpiredModal({
  isOpen,
  currentServices,
  currentPlan,
  monthlyPrice,
  onAcceptPayment,
  onDeclinePayment
}: TrialExpiredModalProps) {
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('Professional');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const { toast } = useToast();

  const handlePaymentDecline = () => {
    setShowPlanSelection(true);
  };

  const handleAddOnToggle = (addOnName: string) => {
    setSelectedAddOns(prev => 
      prev.includes(addOnName) 
        ? prev.filter(name => name !== addOnName)
        : [...prev, addOnName]
    );
  };

  const calculateTotal = () => {
    const planPrice = planTiers.find(plan => plan.name === selectedPlan)?.price || 0;
    const addOnPrice = selectedAddOns.reduce((total, addOnName) => {
      const addOn = addOns.find(addon => addon.name === addOnName);
      return total + (addOn?.price || 0);
    }, 0);
    return planPrice + addOnPrice;
  };

  const handleCustomPlanSubmit = () => {
    const total = calculateTotal();
    toast({
      title: "Plan Selected",
      description: `${selectedPlan} plan with ${selectedAddOns.length} add-ons - $${total}/month`,
    });
    onAcceptPayment();
  };

  if (showPlanSelection) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Choose Your Plan
            </DialogTitle>
            <DialogDescription className="text-center">
              Select the perfect plan and add-ons for your business needs
            </DialogDescription>
          </DialogHeader>

          {/* Plan Selection */}
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            {planTiers.map((plan) => (
              <Card 
                key={plan.name}
                className={`cursor-pointer transition-all ${
                  selectedPlan === plan.name 
                    ? 'ring-2 ring-blue-500 border-blue-500' 
                    : 'hover:shadow-lg'
                } ${plan.recommended ? 'border-orange-500' : ''}`}
                onClick={() => setSelectedPlan(plan.name)}
              >
                <CardHeader className="text-center relative">
                  {plan.recommended && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-orange-500">
                      Recommended
                    </Badge>
                  )}
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-blue-600">
                    ${plan.price}<span className="text-sm text-gray-500">/month</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add-ons Selection */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Add-ons (Optional)</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {addOns.map((addOn) => {
                const Icon = addOn.icon;
                const isSelected = selectedAddOns.includes(addOn.name);
                return (
                  <Card 
                    key={addOn.name}
                    className={`cursor-pointer transition-all ${
                      isSelected 
                        ? 'ring-2 ring-green-500 border-green-500 bg-green-50' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleAddOnToggle(addOn.name)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5 text-blue-600" />
                          <div>
                            <h4 className="font-medium">{addOn.name}</h4>
                            <p className="text-sm text-gray-600">{addOn.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">+${addOn.price}/mo</div>
                          {isSelected && <Check className="h-4 w-4 text-green-500 ml-auto mt-1" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Total and Actions */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-lg font-semibold">Selected Plan: {selectedPlan}</div>
                {selectedAddOns.length > 0 && (
                  <div className="text-sm text-gray-600">
                    Add-ons: {selectedAddOns.join(', ')}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  ${calculateTotal()}/month
                </div>
                <div className="text-sm text-gray-500">Billed monthly</div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleCustomPlanSubmit}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Subscribe Now
              </Button>
              <Button 
                variant="outline" 
                onClick={onDeclinePayment}
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Trial Period Expired
          </DialogTitle>
          <DialogDescription className="text-center">
            Your 30-day trial has ended. Continue with your current services or choose a different plan.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <Card className="border-2 border-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Your Current Services</span>
                <Badge variant="secondary">{currentPlan}</Badge>
              </CardTitle>
              <CardDescription>
                You've been using these features during your trial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 mb-4">
                {currentServices.map((service, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    {service}
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    ${monthlyPrice}/month
                  </div>
                  <div className="text-sm text-gray-600">
                    Continue with your current setup
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3 mt-6">
          <Button 
            onClick={onAcceptPayment}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Continue Current Plan - ${monthlyPrice}/mo
          </Button>
          <Button 
            onClick={handlePaymentDecline}
            variant="outline"
            size="lg"
          >
            Choose Different Plan
          </Button>
        </div>

        <div className="text-center mt-4 text-sm text-gray-500">
          No commitment • Cancel anytime • 30-day money-back guarantee
        </div>
      </DialogContent>
    </Dialog>
  );
}