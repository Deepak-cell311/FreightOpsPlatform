import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Building2, Smartphone, DollarSign, ArrowRight, Shield, Clock } from "lucide-react";

export default function BankingAddMoney() {
  // Fetch recent deposit data
  const { data: depositData } = useQuery({
    queryKey: ["/api/banking/recent-deposits"],
    retry: false,
  });

  return (
    <div className="w-full min-h-full px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Add Money</h1>
          <p className="text-gray-600">Add funds to your account using various methods</p>
        </div>

        <Tabs defaultValue="bank-transfer" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bank-transfer" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Bank Transfer
            </TabsTrigger>
            <TabsTrigger value="debit-card" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Debit Card
            </TabsTrigger>
            <TabsTrigger value="wire-transfer" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Wire Transfer
            </TabsTrigger>
            <TabsTrigger value="mobile-deposit" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Mobile Deposit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bank-transfer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  ACH Bank Transfer
                </CardTitle>
                <p className="text-sm text-gray-600">Free • 1-3 business days</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" placeholder="Enter amount" />
                  </div>
                  <div>
                    <Label htmlFor="bank-account">From Bank Account</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking-1234">Chase Checking ••••1234</SelectItem>
                        <SelectItem value="savings-5678">Wells Fargo Savings ••••5678</SelectItem>
                        <SelectItem value="add-new">+ Add New Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="memo">Memo (Optional)</Label>
                  <Input id="memo" placeholder="Reference or note" />
                </div>
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <div className="text-sm">
                    <div className="font-medium text-blue-900">Bank-level security</div>
                    <div className="text-blue-700">256-bit encryption and fraud monitoring</div>
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Transfer Money
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="debit-card" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  Debit Card Transfer
                </CardTitle>
                <p className="text-sm text-gray-600">1.5% fee • Instant</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="card-amount">Amount</Label>
                  <Input id="card-amount" placeholder="Enter amount" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input id="card-number" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div>
                    <Label htmlFor="expiry">Expiry</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input id="zip" placeholder="12345" />
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <div className="text-sm">
                    <div className="font-medium text-amber-900">Instant transfer</div>
                    <div className="text-amber-700">Funds available immediately with 1.5% fee</div>
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Add Money Instantly
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wire-transfer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Wire Transfer Instructions
                </CardTitle>
                <p className="text-sm text-gray-600">For large transfers • Same day processing</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="font-medium text-gray-700">Bank Name</Label>
                      <div className="text-gray-900">Novo Platform Inc</div>
                    </div>
                    <div>
                      <Label className="font-medium text-gray-700">Routing Number</Label>
                      <div className="text-gray-900 font-mono">211274450</div>
                    </div>
                    <div>
                      <Label className="font-medium text-gray-700">Account Number</Label>
                      <div className="text-gray-900 font-mono">1234567890123456</div>
                    </div>
                    <div>
                      <Label className="font-medium text-gray-700">Account Type</Label>
                      <div className="text-gray-900">Business Checking</div>
                    </div>
                  </div>
                  <div>
                    <Label className="font-medium text-gray-700">Reference</Label>
                    <div className="text-gray-900 font-mono">FreightOps-Wire-{new Date().getTime()}</div>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-900">
                    <div className="font-medium mb-1">Important Instructions:</div>
                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                      <li>Include the reference number to ensure proper crediting</li>
                      <li>Wire transfers typically process same business day</li>
                      <li>Contact your bank for wire transfer fees</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mobile-deposit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                  Mobile Check Deposit
                </CardTitle>
                <p className="text-sm text-gray-600">Deposit checks using your phone camera</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Smartphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Download the Mobile App</h3>
                  <p className="text-gray-600 mb-4">
                    Use our mobile app to deposit checks by taking photos of the front and back
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button variant="outline">
                      Download iOS App
                    </Button>
                    <Button variant="outline">
                      Download Android App
                    </Button>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Mobile Deposit Limits:</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• Daily limit: {depositLimits?.daily || 'Contact support'}</div>
                    <div>• Monthly limit: {depositLimits?.monthly || 'Contact support'}</div>
                    <div>• Funds available: Next business day</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Add Money Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <div className="font-medium text-sm">ACH Transfer from Chase ••••1234</div>
                  <div className="text-xs text-gray-500">Dec 09, 2024 • Completed</div>
                </div>
                <div className="text-green-600 font-semibold">{lastDeposit?.amount || 'No recent deposits'}</div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <div className="font-medium text-sm">Debit Card Transfer</div>
                  <div className="text-xs text-gray-500">Dec 08, 2024 • Completed</div>
                </div>
                <div className="text-green-600 font-semibold">+${depositData?.recentDeposit1 || '0.00'}</div>
              </div>
              <div className="flex justify-between items-center py-2">
                <div>
                  <div className="font-medium text-sm">Wire Transfer</div>
                  <div className="text-xs text-gray-500">Dec 07, 2024 • Completed</div>
                </div>
                <div className="text-green-600 font-semibold">+${depositData?.recentDeposit2 || '0.00'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}