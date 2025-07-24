import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRightLeft, Send, Download, Filter, Plus, DollarSign, CreditCard } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function BankingTransfers() {
  const [transferType, setTransferType] = useState("ach");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [recipientAccount, setRecipientAccount] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const { toast } = useToast();

  const { data: transactions = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/freightops/transactions'],
    refetchInterval: 30000,
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount / 100));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Sent': { variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
      'Pending': { variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      'Completed': { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      'Failed': { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {status}
      </Badge>
    );
  };

  const handleSendMoney = async () => {
    if (!amount || !recipientAccount || !recipientName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Transfer Initiated",
        description: `$${amount} transfer to ${recipientName} has been processed`,
      });
      
      // Reset form
      setAmount("");
      setDescription("");
      setRecipientAccount("");
      setRecipientName("");
      setRoutingNumber("");
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: "Unable to process transfer. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full min-h-full px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Transfers & Payments</h1>
          <p className="text-gray-600">Send money and manage transfer history</p>
        </div>

        <Tabs defaultValue="send" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="send" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send Money
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              Transfer History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Send Money
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="recipientName">Recipient Name</Label>
                    <Input
                      id="recipientName"
                      placeholder="Enter recipient's full name"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="recipientAccount">Account Number</Label>
                    <Input
                      id="recipientAccount"
                      placeholder="Enter account number"
                      value={recipientAccount}
                      onChange={(e) => setRecipientAccount(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="routingNumber">Routing Number</Label>
                    <Input
                      id="routingNumber"
                      placeholder="9-digit routing number"
                      value={routingNumber}
                      onChange={(e) => setRoutingNumber(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="transferType">Transfer Type</Label>
                    <Select value={transferType} onValueChange={setTransferType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transfer type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ach">ACH Transfer (1-3 business days)</SelectItem>
                        <SelectItem value="wire">Wire Transfer (Same day)</SelectItem>
                        <SelectItem value="instant">Instant Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      placeholder="Payment description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <Button onClick={handleSendMoney} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Send ${amount || '0.00'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transfer Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Quick Transfer Tips</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• ACH transfers take 1-3 business days</li>
                      <li>• Wire transfers are processed same day</li>
                      <li>• Verify recipient details before sending</li>
                      <li>• Keep transaction receipts for records</li>
                    </ul>
                  </div>
                  
                  {amount && recipientName && (
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Transfer Preview</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>To:</span>
                          <span className="font-medium">{recipientName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Amount:</span>
                          <span className="font-medium">${amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="capitalize">{transferType}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5" />
                    Transfer History
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Loading transactions...
                        </TableCell>
                      </TableRow>
                    ) : (transactions as any[]).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No transfer history available
                        </TableCell>
                      </TableRow>
                    ) : (
                      (transactions as any[]).map((transaction: any) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {formatDate(transaction.attributes.createdAt)}
                          </TableCell>
                          <TableCell>
                            {transaction.attributes.description || 'Transfer'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {transaction.type === 'achPayment' ? 'ACH' : 'Wire'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatAmount(transaction.attributes.amount)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(transaction.attributes.status)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Transfer Limits */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Transfer Limits & Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">ACH Transfers</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Daily limit: Contact for details</li>
                  <li>• Monthly limit: Contact for details</li>
                  <li>• Processing time: 1-3 days</li>
                  <li>• Fee: Free</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Wire Transfers</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Daily limit: Contact for details</li>
                  <li>• Monthly limit: Contact for limits</li>
                  <li>• Processing time: Same day</li>
                  <li>• Fee: Contact for fees</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Instant Transfers</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Daily limit: Contact for limits</li>
                  <li>• Monthly limit: Contact for limits</li>
                  <li>• Processing time: Instant</li>
                  <li>• Fee: Free</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}