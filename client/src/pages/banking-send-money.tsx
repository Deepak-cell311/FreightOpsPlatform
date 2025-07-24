import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Building2, User, DollarSign, Send, CreditCard, Clock, CheckCircle, AlertTriangle, Zap, Shield, FileText, Truck, Calendar, Receipt, Phone, MapPin, Copy } from "lucide-react";
import { useState } from "react";

export default function BankingSendMoneyRailsr() {
  const [selectedMethod, setSelectedMethod] = useState("ach");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  // Fetch real Railsr banking account data
  const { data: railsrAccount } = useQuery({
    queryKey: ["/api/banking/railsr-account"],
    retry: false,
  });

  const { data: paymentMethods } = useQuery({
    queryKey: ["/api/banking/payment-methods"],
    retry: false,
  });

  const { data: frequentPayees } = useQuery({
    queryKey: ["/api/banking/frequent-payees"],
    retry: false,
  });

  const frequentPayees = [
    {
      id: "payee_001",
      name: "Western Star Logistics",
      type: "vendor",
      accountNumber: "••••4521",
      routingNumber: "121000248",
      lastPaid: "Dec 5, 2024",
      amount: 3250.00,
      category: "fuel"
    },
    {
      id: "payee_002", 
      name: "John Smith (Driver)",
      type: "employee",
      accountNumber: "••••7890",
      routingNumber: "052001633",
      lastPaid: "Dec 1, 2024",
      amount: 1850.00,
      category: "payroll"
    },
    {
      id: "payee_003",
      name: "ABC Equipment Leasing",
      type: "vendor",
      accountNumber: "••••9876",
      routingNumber: "063100277",
      lastPaid: "Nov 28, 2024",
      amount: 2100.00,
      category: "equipment"
    }
  ];

  const transferMethods = {
    ach: {
      name: "ACH Transfer",
      icon: Building2,
      description: "Standard bank transfer",
      timeframe: "1-3 business days",
      fee: "Free",
      color: "bg-blue-50 border-blue-200 text-blue-800",
      limits: { min: 1, max: 25000 }
    },
    wire: {
      name: "Wire Transfer", 
      icon: Zap,
      description: "Same-day delivery",
      timeframe: "Same business day",
      fee: paymentMethods?.wire?.fee || "Contact for rates",
      color: "bg-purple-50 border-purple-200 text-purple-800",
      limits: { min: 100, max: 250000 }
    },
    check: {
      name: "Physical Check",
      icon: FileText,
      description: "Printed and mailed",
      timeframe: "3-5 business days",
      fee: paymentMethods?.instant?.fee || "Contact for rates",
      color: "bg-green-50 border-green-200 text-green-800",
      limits: { min: 25, max: 50000 }
    },
    instant: {
      name: "Instant Transfer",
      icon: Zap,
      description: "Real-time via RTP",
      timeframe: "Within minutes",
      fee: paymentMethods?.check?.fee || "Contact for rates",
      color: "bg-orange-50 border-orange-200 text-orange-800",
      limits: { min: 1, max: 10000 }
    }
  };

  const getMethodDetails = () => transferMethods[selectedMethod as keyof typeof transferMethods];

  return (
    <div className="w-full min-h-full px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Send Money</h1>
          <p className="text-gray-600">Transfer funds via ACH, wire, check, or instant payment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Transfer Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Balance Header */}
            <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-blue-100 text-sm">Available Balance</div>
                    <div className="text-2xl font-bold">${railsrAccount?.balance?.toFixed(2) || '0.00'}</div>
                    <div className="text-blue-200 text-xs">Account ••••{railsrAccount?.accountNumber?.slice(-4) || '0000'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-100 text-sm">Railsr Banking</div>
                    <div className="text-blue-200 text-xs">FDIC Insured</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transfer Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Transfer Method</CardTitle>
                <p className="text-sm text-gray-600">Select how you want to send money</p>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod} className="grid grid-cols-2 gap-4">
                  {Object.entries(transferMethods).map(([key, method]) => {
                    const IconComponent = method.icon;
                    return (
                      <div key={key} className="flex items-center space-x-2">
                        <RadioGroupItem value={key} id={key} />
                        <Label 
                          htmlFor={key} 
                          className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedMethod === key ? method.color : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <IconComponent className="h-5 w-5" />
                            <div>
                              <div className="font-medium">{method.name}</div>
                              <div className="text-xs opacity-75">{method.description}</div>
                              <div className="text-xs mt-1">
                                <span className="font-medium">{method.timeframe}</span> • {method.fee}
                              </div>
                            </div>
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Transfer Details Form */}
            <Card>
              <CardHeader>
                <CardTitle>Transfer Details</CardTitle>
                <p className="text-sm text-gray-600">
                  {getMethodDetails().name} • {getMethodDetails().timeframe} • {getMethodDetails().fee}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Amount Input */}
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="amount"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10 text-lg font-semibold"
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Limits: ${getMethodDetails().limits.min} - ${getMethodDetails().limits.max.toLocaleString()}
                  </div>
                </div>

                {/* Recipient Selection */}
                <Tabs defaultValue="existing" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="existing">Existing Payee</TabsTrigger>
                    <TabsTrigger value="new">New Recipient</TabsTrigger>
                  </TabsList>

                  <TabsContent value="existing" className="space-y-4">
                    <div>
                      <Label>Select Payee</Label>
                      <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose from frequent payees" />
                        </SelectTrigger>
                        <SelectContent>
                          {frequentPayees.map((payee) => (
                            <SelectItem key={payee.id} value={payee.id}>
                              <div className="flex items-center gap-2">
                                {payee.type === 'employee' ? <User className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                                <div>
                                  <div className="font-medium">{payee.name}</div>
                                  <div className="text-xs text-gray-500">Last: ${payee.amount.toFixed(2)} on {payee.lastPaid}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="new" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="recipient-name">Recipient Name</Label>
                        <Input id="recipient-name" placeholder="Full name or business name" />
                      </div>
                      <div>
                        <Label htmlFor="recipient-type">Recipient Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="employee">Employee</SelectItem>
                            <SelectItem value="vendor">Vendor/Supplier</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {selectedMethod !== 'check' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="routing-number">Routing Number</Label>
                          <Input id="routing-number" placeholder="9-digit routing number" />
                        </div>
                        <div>
                          <Label htmlFor="account-number">Account Number</Label>
                          <Input id="account-number" placeholder="Account number" />
                        </div>
                      </div>
                    )}

                    {selectedMethod === 'check' && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="mailing-address">Mailing Address</Label>
                          <Textarea 
                            id="mailing-address" 
                            placeholder="Street address, city, state, ZIP code"
                            rows={3}
                          />
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Payment Purpose */}
                <div>
                  <Label htmlFor="purpose">Payment Purpose</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payroll">Payroll</SelectItem>
                      <SelectItem value="vendor">Vendor Payment</SelectItem>
                      <SelectItem value="fuel">Fuel/Gas</SelectItem>
                      <SelectItem value="maintenance">Vehicle Maintenance</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="loan">Loan Payment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Memo/Notes */}
                <div>
                  <Label htmlFor="memo">Memo/Reference</Label>
                  <Input 
                    id="memo" 
                    placeholder="Optional reference or note"
                  />
                </div>

                {/* Scheduling Options */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="schedule" />
                    <Label htmlFor="schedule">Schedule for later</Label>
                  </div>
                  
                  {selectedMethod === 'wire' && (
                    <div className="flex items-center space-x-2">
                      <Checkbox id="urgent" checked={isUrgent} onCheckedChange={setIsUrgent} />
                      <Label htmlFor="urgent">Urgent delivery (additional fees apply)</Label>
                    </div>
                  )}
                </div>

                {/* Security Notice */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium text-blue-900">Security Notice</div>
                      <div className="text-blue-800">
                        This transfer will be processed through Railsr's secure banking infrastructure. 
                        All transactions are encrypted and monitored for fraud protection.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3">
                  <Send className="h-5 w-5 mr-2" />
                  Send ${amount || '0.00'} via {getMethodDetails().name}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Transfer Summary & Recent Activity */}
          <div className="space-y-6">
            {/* Transfer Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Transfer Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transfer Amount</span>
                  <span className="font-semibold">${amount || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transfer Fee</span>
                  <span className="font-semibold">{getMethodDetails().fee}</span>
                </div>
                {isUrgent && selectedMethod === 'wire' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Urgent Fee</span>
                    <span className="font-semibold">{paymentMethods?.urgent?.fee || "Contact for rates"}</span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total Cost</span>
                    <span>${(parseFloat(amount || '0') + 
                      (getMethodDetails().fee === 'Free' ? 0 : parseFloat(getMethodDetails().fee.replace('$', ''))) +
                      (isUrgent && selectedMethod === 'wire' ? 15 : 0)
                    ).toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 pt-2">
                  Delivery: {getMethodDetails().timeframe}
                  {isUrgent && selectedMethod === 'wire' && ' (Expedited)'}
                </div>
              </CardContent>
            </Card>

            {/* Frequent Payees Quick Access */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Frequent Payees</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  Manage
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {frequentPayees.slice(0, 3).map((payee) => (
                    <div key={payee.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <div className="flex items-center gap-2">
                        {payee.type === 'employee' ? 
                          <User className="h-4 w-4 text-blue-600" /> : 
                          <Building2 className="h-4 w-4 text-gray-600" />
                        }
                        <div>
                          <div className="font-medium text-sm">{payee.name}</div>
                          <div className="text-xs text-gray-500">{payee.accountNumber}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">${payee.amount.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">{payee.lastPaid}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Railsr Banking Info */}
            <Card>
              <CardHeader>
                <CardTitle>Banking Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Your Account</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">••••{railsrAccount?.accountNumber?.slice(-4) || '0000'}</span>
                    <Button variant="ghost" size="sm" className="p-1">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Routing Number</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{railsrAccount?.routingNumber || '000000000'}</span>
                    <Button variant="ghost" size="sm" className="p-1">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Bank Name</span>
                  <span className="text-sm">Railsr</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-xs text-gray-500">
                    FDIC insured up to applicable limits. Member FDIC.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}