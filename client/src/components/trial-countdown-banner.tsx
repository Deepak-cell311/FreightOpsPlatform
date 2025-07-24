import { useState, useEffect } from 'react';
import { Clock, X, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import TrialExpiredModal from './trial-expired-modal';

interface TrialInfo {
  trialStatus: 'active' | 'expired' | 'paid';
  daysRemaining: number;
  trialEndsAt: string;
  currentTier: string;
  currentServices: string[];
  monthlyPrice: number;
}

export default function TrialCountdownBanner() {
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const { data: trialInfo, isLoading } = useQuery<TrialInfo>({
    queryKey: ['/api/trial-status'],
    refetchInterval: 300000, // Check every 5 minutes
  });

  // Auto-show modal when trial expires
  useEffect(() => {
    if (trialInfo?.trialStatus === 'expired' && !dismissed) {
      setShowModal(true);
    }
  }, [trialInfo?.trialStatus, dismissed]);

  if (isLoading || !trialInfo || trialInfo.trialStatus === 'paid' || dismissed) {
    return null;
  }

  const { trialStatus, daysRemaining, currentTier, currentServices, monthlyPrice } = trialInfo;

  const handleAcceptPayment = () => {
    // Redirect to payment processing
    window.location.href = '/billing/subscriptions';
    setShowModal(false);
  };

  const handleDeclinePayment = () => {
    setShowModal(false);
    setDismissed(true);
  };

  if (trialStatus === 'expired') {
    return (
      <TrialExpiredModal
        isOpen={showModal}
        currentServices={currentServices}
        currentPlan={currentTier}
        monthlyPrice={monthlyPrice}
        onAcceptPayment={handleAcceptPayment}
        onDeclinePayment={handleDeclinePayment}
      />
    );
  }

  // Trial active banner
  const getStatusColor = () => {
    if (daysRemaining <= 3) return 'bg-red-600';
    if (daysRemaining <= 7) return 'bg-orange-600';
    return 'bg-blue-600';
  };

  const getStatusText = () => {
    if (daysRemaining <= 3) return 'Trial ending soon!';
    if (daysRemaining <= 7) return 'Trial ends in 1 week';
    return 'Trial active';
  };

  return (
    <div className={`${getStatusColor()} text-white px-4 py-2 text-sm`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Clock className="h-4 w-4" />
          <span className="font-medium">{getStatusText()}</span>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
          </Badge>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="hidden sm:inline text-sm opacity-90">
            Enjoying FreightOps Pro? Continue with full access
          </span>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            onClick={() => window.location.href = '/billing/subscriptions'}
          >
            <CreditCard className="h-3 w-3 mr-1" />
            Subscribe Now
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={() => setDismissed(true)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}