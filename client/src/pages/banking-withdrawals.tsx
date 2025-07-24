import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Send, Download, Clock } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function BankingWithdrawals() {
  const [withdrawalType, setWithdrawalType] = useState("ach");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const { data: balanceData } = useQuery({
    queryKey: ['/api/freightops/balance'],
    refetchInterval: 15000,
  });

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['/api/freightops/transactions'],
    refetchInterval: 30000,
  });

  const balance = balanceData?.balance || 0;
  const transactions = transactionsData?.data || [];
  const withdrawals = transactions.filter((t: any) => t.attributes.direction === 'Debit');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

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

  return (
    <div className="w-full min-h-full px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Withdrawals & Outgoing Payments</h1>
          <p className="text-gray-600">Send money and manage outgoing transfers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Withdrawal Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  New Withdrawal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Download className="h-4 w-4" />
                    <span className="text-sm font-medium">Available Balance</span>
                  </div>
                  <p className="text-xl font-bold text-blue-900 mt-1">
                    {formatCurrency(balance)}
                  </p>
                </div>

                <div>
                  <Label htmlFor="withdrawalType">Withdrawal Type</Label>
                  <Select value={withdrawalType} onValueChange={setWithdrawalType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select withdrawal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ach">ACH Transfer</SelectItem>
                      <SelectItem value="wire">Wire Transfer</SelectItem>
                      <SelectItem value="check">Check Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Payment description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="recipient">Recipient Name</Label>
                  <Input
                    id="recipient"
                    placeholder="Recipient name"
                  />
                </div>

                <div>
                  <Label htmlFor="recipientAccount">Recipient Account</Label>
                  <Input
                    id="recipientAccount"
                    placeholder="Account number"
                  />
                </div>

                <div>
                  <Label htmlFor="routingNumber">Routing Number</Label>
                  <Input
                    id="routingNumber"
                    placeholder="9-digit routing number"
                  />
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2 text-yellow-800">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="text-xs">
                      <p className="font-medium">Processing Information</p>
                      <p>ACH transfers take 1-3 business days. Wire transfers process same day.</p>
                    </div>
                  </div>
                </div>

                <Button className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Withdrawal
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Withdrawal History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Withdrawal History
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
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
                          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                        </TableCell>
                      </TableRow>
                    ) : withdrawals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No withdrawals found
                        </TableCell>
                      </TableRow>
                    ) : (
                      withdrawals.slice(0, 10).map((withdrawal: any) => (
                        <TableRow key={withdrawal.id}>
                          <TableCell>{formatDate(withdrawal.attributes.createdAt)}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {withdrawal.attributes.description || 'Withdrawal'}
                              </p>
                              <p className="text-sm text-gray-500">
                                ID: {withdrawal.id}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              ACH Transfer
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-red-600">
                            -{formatAmount(withdrawal.attributes.amount)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(withdrawal.attributes.status)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Withdrawal Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Withdrawal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Processing Times</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• ACH transfers: 1-3 business days</li>
                  <li>• Wire transfers: Same business day</li>
                  <li>• Check payments: 5-7 business days</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Daily Limits</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• ACH transfers: Contact for limits</li>
                  <li>• Wire transfers: Contact for limits</li>
                  <li>• Check payments: Contact for limits</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Fees</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• ACH transfers: Contact for fees</li>
                  <li>• Wire transfers: Contact for fees</li>
                  <li>• Check payments: Contact for fees</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}