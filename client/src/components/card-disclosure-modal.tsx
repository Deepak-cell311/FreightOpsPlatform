import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, DollarSign, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface DisclosureData {
  title: string;
  content: string;
  required: boolean;
  regulatoryReference: string;
}

interface FeeSchedule {
  cardIssuanceFee: number;
  monthlyMaintenanceFee: number;
  atmWithdrawalFee: number;
  internationalTransactionFee: number;
  replacementCardFee: number;
  expeditedShippingFee?: number;
  totalFee: number;
}

interface CardDisclosureModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
  cardType: 'physical' | 'virtual';
  onComplete: (accepted: boolean) => void;
}

export function CardDisclosureModal({ 
  isOpen, 
  onClose, 
  accountId, 
  cardType, 
  onComplete 
}: CardDisclosureModalProps) {
  const [disclosures, setDisclosures] = useState<DisclosureData[]>([]);
  const [termsAndConditions, setTermsAndConditions] = useState<string>('');
  const [feeSchedule, setFeeSchedule] = useState<FeeSchedule | null>(null);
  const [acceptedDisclosures, setAcceptedDisclosures] = useState<{ [key: string]: boolean }>({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && accountId) {
      loadDisclosures();
    }
  }, [isOpen, accountId, cardType]);

  const loadDisclosures = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('GET', `/api/enterprise-banking/card/disclosures?accountId=${accountId}&cardType=${cardType}`);
      const data = await response.json();
      
      if (data.success) {
        setDisclosures(data.disclosures.disclosures);
        setTermsAndConditions(data.disclosures.termsAndConditions);
        setFeeSchedule(data.disclosures.feeSchedule);
        
        // Initialize acceptance state
        const initialAcceptance: { [key: string]: boolean } = {};
        data.disclosures.disclosures.forEach((disclosure: DisclosureData) => {
          initialAcceptance[disclosure.title] = false;
        });
        setAcceptedDisclosures(initialAcceptance);
      }
    } catch (error) {
      console.error('Error loading disclosures:', error);
      setError('Failed to load card disclosures. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisclosureAcceptance = (title: string, accepted: boolean) => {
    setAcceptedDisclosures(prev => ({
      ...prev,
      [title]: accepted
    }));
  };

  const allRequiredAccepted = () => {
    const requiredDisclosures = disclosures.filter(d => d.required);
    return requiredDisclosures.every(d => acceptedDisclosures[d.title]) && acceptedTerms;
  };

  const handleSubmit = async () => {
    if (!allRequiredAccepted()) {
      setError('Please accept all required disclosures and terms before proceeding.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const disclosureAcceptances = disclosures.map(disclosure => ({
        disclosureTitle: disclosure.title,
        accepted: acceptedDisclosures[disclosure.title] || false,
        timestamp: new Date(),
        ipAddress: window.location.hostname,
        userAgent: navigator.userAgent
      }));

      const response = await apiRequest('POST', '/api/enterprise-banking/card/accept-disclosures', {
        accountId,
        cardId: `pending-${Date.now()}`, // Temporary ID for pending cards
        disclosureAcceptances
      });

      const data = await response.json();
      if (data.success) {
        onComplete(true);
        onClose();
      } else {
        setError('Failed to record disclosure acceptance. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting disclosures:', error);
      setError('Failed to submit disclosures. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading card disclosures...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6 text-blue-600" />
            Card Application Disclosures & Terms
            <Badge variant="outline" className="ml-2">
              {cardType === 'physical' ? 'Physical Card' : 'Virtual Card'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Fee Schedule Card */}
          {feeSchedule && (
            <Card className="mb-6 border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Fee Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>Card Issuance:</span>
                    <span className="font-medium">${feeSchedule.cardIssuanceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Maintenance:</span>
                    <span className="font-medium">${feeSchedule.monthlyMaintenanceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ATM Withdrawal:</span>
                    <span className="font-medium">${feeSchedule.atmWithdrawalFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>International Transaction:</span>
                    <span className="font-medium">{(feeSchedule.internationalTransactionFee * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Card Replacement:</span>
                    <span className="font-medium">${feeSchedule.replacementCardFee.toFixed(2)}</span>
                  </div>
                  {feeSchedule.expeditedShippingFee && (
                    <div className="flex justify-between">
                      <span>Expedited Shipping:</span>
                      <span className="font-medium">${feeSchedule.expeditedShippingFee.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Initial Fee:</span>
                  <span className="text-green-600">${feeSchedule.totalFee.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Regulatory Disclosures */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Required Regulatory Disclosures
            </h3>
            
            {disclosures.map((disclosure, index) => (
              <Card key={index} className="border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{disclosure.title}</CardTitle>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {disclosure.regulatoryReference}
                      </Badge>
                    </div>
                    <Badge variant={disclosure.required ? "destructive" : "secondary"}>
                      {disclosure.required ? "Required" : "Optional"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap text-sm text-gray-700 mb-4 max-h-32 overflow-y-auto bg-gray-50 p-3 rounded">
                    {disclosure.content}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`disclosure-${index}`}
                      checked={acceptedDisclosures[disclosure.title] || false}
                      onCheckedChange={(checked) => 
                        handleDisclosureAcceptance(disclosure.title, checked as boolean)
                      }
                    />
                    <label 
                      htmlFor={`disclosure-${index}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I have read and {disclosure.required ? 'agree to' : 'acknowledge'} this disclosure
                      {acceptedDisclosures[disclosure.title] && (
                        <CheckCircle className="inline ml-2 h-4 w-4 text-green-600" />
                      )}
                    </label>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Terms and Conditions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Terms and Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm text-gray-700 mb-4 max-h-64 overflow-y-auto bg-gray-50 p-4 rounded">
                {termsAndConditions}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms-acceptance"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                />
                <label 
                  htmlFor="terms-acceptance"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I have read and agree to the Terms and Conditions
                  {acceptedTerms && (
                    <CheckCircle className="inline ml-2 h-4 w-4 text-green-600" />
                  )}
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Summary */}
          <Alert className={`mb-4 ${allRequiredAccepted() ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'}`}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {allRequiredAccepted() 
                ? "All required disclosures and terms have been accepted. You may proceed with card issuance."
                : "Please review and accept all required disclosures and terms to continue."
              }
            </AlertDescription>
          </Alert>
        </ScrollArea>

        <div className="p-6 pt-4 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              By proceeding, you acknowledge that all disclosures have been provided and accepted in compliance with federal banking regulations.
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!allRequiredAccepted() || isSubmitting}
                className="min-w-32"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </div>
                ) : (
                  'Accept & Continue'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}