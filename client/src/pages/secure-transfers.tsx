import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  Shield, 
  Smartphone, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Building,
  Lock
} from 'lucide-react';

interface TransferData {
  fromAccountId: string;
  toAccountInfo: {
    accountNumber: string;
    routingNumber: string;
    accountName: string;
    bankName?: string;
  };
  amount: number;
  description: string;
  transferType: 'ach' | 'wire' | 'internal';
  requesterInfo: {
    userId: string;
    phoneNumber: string;
    email: string;
    name: string;
  };
}

export default function SecureTransfers() {
  const [step, setStep] = useState<'form' | 'verification' | 'completed'>('form');
  const [transferId, setTransferId] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [transferData, setTransferData] = useState<Partial<TransferData>>({
    fromAccountId: '',
    amount: 0,
    description: '',
    transferType: 'ach',
    requesterInfo: {
      userId: 'user_123',
      phoneNumber: '+1-555-0123',
      email: 'user@company.com',
      name: 'John Smith'
    },
    toAccountInfo: {
      accountNumber: '987654321',
      routingNumber: '021000021',
      accountName: 'ABC Supplier Corp',
      bankName: 'Chase Bank'
    }
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initiate transfer mutation
  const initiateTransfer = useMutation({
    mutationFn: async (data: TransferData) => {
      const response = await fetch('/api/transfers/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setTransferId(data.transferId);
        setVerificationId(data.verificationId);
        setStep('verification');
        toast({
          title: "SMS Verification Sent",
          description: data.message,
        });
      } else {
        toast({
          title: "Transfer Failed",
          description: data.message,
          variant: "destructive"
        });
      }
    }
  });

  // Verify transfer mutation
  const verifyTransfer = useMutation({
    mutationFn: async ({ transferId, verificationCode }: { transferId: string; verificationCode: string }) => {
      const response = await fetch('/api/transfers/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transferId, verificationCode })
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setStep('completed');
        toast({
          title: "Transfer Completed",
          description: data.message,
        });
      } else {
        toast({
          title: "Verification Failed",
          description: data.message,
          variant: "destructive"
        });
      }
    }
  });

  const handleInitiateTransfer = () => {
    if (!transferData.amount || !transferData.toAccountInfo?.accountNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    initiateTransfer.mutate(transferData as TransferData);
  };

  const handleVerifyCode = () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Verification Code Required",
        description: "Please enter the 6-digit code sent to your phone",
        variant: "destructive"
      });
      return;
    }
    
    verifyTransfer.mutate({ transferId, verificationCode });
  };

  const resetForm = () => {
    setStep('form');
    setTransferId('');
    setVerificationId('');
    setVerificationCode('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Secure Transfers</h1>
              <p className="text-gray-600">SMS-verified transfers with enhanced security</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Smartphone className="h-4 w-4 text-green-500" />
              SMS verification required
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Lock className="h-4 w-4 text-blue-500" />
              Bank-grade security
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Real-time processing
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`flex items-center gap-2 ${step === 'form' ? 'text-blue-600' : step === 'verification' || step === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'form' ? 'bg-blue-100 text-blue-600' : step === 'verification' || step === 'completed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                1
              </div>
              <span className="font-medium">Transfer Details</span>
            </div>
            
            <div className={`flex items-center gap-2 ${step === 'verification' ? 'text-blue-600' : step === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'verification' ? 'bg-blue-100 text-blue-600' : step === 'completed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                2
              </div>
              <span className="font-medium">SMS Verification</span>
            </div>
            
            <div className={`flex items-center gap-2 ${step === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'completed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                3
              </div>
              <span className="font-medium">Completed</span>
            </div>
          </div>
        </div>

        {/* Transfer Form */}
        {step === 'form' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Transfer Details
              </CardTitle>
              <CardDescription>
                Enter transfer information. SMS verification will be required to complete the transfer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">From Account</h3>
                  <div className="space-y-2">
                    <Label htmlFor="fromAccount">Account ID</Label>
                    <Input
                      id="fromAccount"
                      value={transferData.fromAccountId}
                      onChange={(e) => setTransferData({...transferData, fromAccountId: e.target.value})}
                      placeholder="Account ID"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Transfer Details</h3>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={transferData.amount}
                      onChange={(e) => setTransferData({...transferData, amount: parseFloat(e.target.value)})}
                      placeholder="5000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transferType">Transfer Type</Label>
                    <Select 
                      value={transferData.transferType} 
                      onValueChange={(value: 'ach' | 'wire' | 'internal') => setTransferData({...transferData, transferType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ach">ACH Transfer (Contact for fees)</SelectItem>
                        <SelectItem value="wire">Wire Transfer (Contact for fees)</SelectItem>
                        <SelectItem value="internal">Internal Transfer (Free)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Recipient Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountName">Recipient Name</Label>
                    <Input
                      id="accountName"
                      value={transferData.toAccountInfo?.accountName}
                      onChange={(e) => setTransferData({
                        ...transferData, 
                        toAccountInfo: {...transferData.toAccountInfo!, accountName: e.target.value}
                      })}
                      placeholder="ABC Supplier Corp"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={transferData.toAccountInfo?.bankName}
                      onChange={(e) => setTransferData({
                        ...transferData, 
                        toAccountInfo: {...transferData.toAccountInfo!, bankName: e.target.value}
                      })}
                      placeholder="Chase Bank"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={transferData.toAccountInfo?.accountNumber}
                      onChange={(e) => setTransferData({
                        ...transferData, 
                        toAccountInfo: {...transferData.toAccountInfo!, accountNumber: e.target.value}
                      })}
                      placeholder="987654321"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="routingNumber">Routing Number</Label>
                    <Input
                      id="routingNumber"
                      value={transferData.toAccountInfo?.routingNumber}
                      onChange={(e) => setTransferData({
                        ...transferData, 
                        toAccountInfo: {...transferData.toAccountInfo!, routingNumber: e.target.value}
                      })}
                      placeholder="021000021"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={transferData.description}
                  onChange={(e) => setTransferData({...transferData, description: e.target.value})}
                  placeholder="Business payment to supplier"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Verification Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={transferData.requesterInfo?.phoneNumber}
                      onChange={(e) => setTransferData({
                        ...transferData, 
                        requesterInfo: {...transferData.requesterInfo!, phoneNumber: e.target.value}
                      })}
                      placeholder="+1-555-0123"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={transferData.requesterInfo?.name}
                      onChange={(e) => setTransferData({
                        ...transferData, 
                        requesterInfo: {...transferData.requesterInfo!, name: e.target.value}
                      })}
                      placeholder="John Smith"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Security Notice</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      A 6-digit verification code will be sent to your phone number. This code expires in 10 minutes and is required to complete the transfer.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleInitiateTransfer}
                disabled={initiateTransfer.isPending}
                className="w-full"
                size="lg"
              >
                {initiateTransfer.isPending ? 'Sending Verification...' : 'Initiate Secure Transfer'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* SMS Verification */}
        {step === 'verification' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                SMS Verification Required
              </CardTitle>
              <CardDescription>
                Enter the 6-digit code sent to {transferData.requesterInfo?.phoneNumber}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Smartphone className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">Transfer Summary</h4>
                    <div className="text-sm text-blue-700 mt-2 space-y-1">
                      <p><strong>Amount:</strong> ${transferData.amount?.toLocaleString()}</p>
                      <p><strong>To:</strong> {transferData.toAccountInfo?.accountName}</p>
                      <p><strong>Account:</strong> ****{transferData.toAccountInfo?.accountNumber?.slice(-4)}</p>
                      <p><strong>Type:</strong> {transferData.transferType?.toUpperCase()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="text-center text-lg font-mono"
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleVerifyCode}
                  disabled={verifyTransfer.isPending || !verificationCode.trim()}
                  className="flex-1"
                >
                  {verifyTransfer.isPending ? 'Verifying...' : 'Verify & Complete Transfer'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              </div>

              <p className="text-sm text-gray-600 text-center">
                Didn't receive a code? Check your phone or contact support.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Transfer Completed */}
        {step === 'completed' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Transfer Completed Successfully
              </CardTitle>
              <CardDescription>
                Your secure transfer has been processed and is now complete
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-green-800">Transfer ID:</span>
                    <span className="font-mono text-sm text-green-700">{transferId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-green-800">Amount:</span>
                    <span className="font-bold text-green-700">${transferData.amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-green-800">Recipient:</span>
                    <span className="text-green-700">{transferData.toAccountInfo?.accountName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-green-800">Status:</span>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="font-medium">SMS Verified</div>
                  <div className="text-gray-600">Security confirmed</div>
                </div>
                <div className="text-center">
                  <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="font-medium">Processing</div>
                  <div className="text-gray-600">1-3 business days</div>
                </div>
                <div className="text-center">
                  <Building className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <div className="font-medium">Bank Confirmed</div>
                  <div className="text-gray-600">Funds transferred</div>
                </div>
              </div>

              <Button 
                onClick={resetForm}
                variant="outline"
                className="w-full"
              >
                Start New Transfer
              </Button>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}