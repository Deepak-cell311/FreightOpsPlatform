import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, QrCode, Link, Copy } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function BankingDeposits() {
  const [depositAmount, setDepositAmount] = useState("");
  const { toast } = useToast();

  const accountInfo = {
    accountNumber: "5648971",
    routingNumber: "812345678",
    accountName: "FreightOps LLC",
    bankName: "Railsr Bank"
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  const generateDepositLink = () => {
    toast({
      title: "Payment Link Generated",
      description: "Deposit link has been created and copied to clipboard",
    });
  };

  return (
    <div className="w-full min-h-full px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Deposits & Funding</h1>
          <p className="text-gray-600">Receive money and fund your Railsr account</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Account Details for Deposits */}
          <Card>
            <CardHeader>
              <CardTitle>Account Details for Deposits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Account Number</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={accountInfo.accountNumber} readOnly />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(accountInfo.accountNumber, "Account number")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label>Routing Number</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={accountInfo.routingNumber} readOnly />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(accountInfo.routingNumber, "Routing number")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label>Account Name</Label>
                <Input value={accountInfo.accountName} readOnly />
              </div>

              <div>
                <Label>Bank Name</Label>
                <Input value={accountInfo.bankName} readOnly />
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Deposit Instructions</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Use these details for ACH transfers and direct deposits</li>
                  <li>• Processing time: 1-3 business days</li>
                  <li>• No fees for incoming transfers</li>
                  <li>• Available 24/7 for automated deposits</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Payment Link Generator */}
          <Card>
            <CardHeader>
              <CardTitle>Generate Payment Link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="depositAmount">Amount (Optional)</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Payment description"
                />
              </div>

              <Button onClick={generateDepositLink} className="w-full">
                <Link className="h-4 w-4 mr-2" />
                Generate Payment Link
              </Button>

              <Button variant="outline" className="w-full">
                <QrCode className="h-4 w-4 mr-2" />
                Generate QR Code
              </Button>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Payment Link Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Share via email, SMS, or social media</li>
                  <li>• Secure encrypted payment processing</li>
                  <li>• Automatic deposit notifications</li>
                  <li>• Custom branding available</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deposit Methods */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Deposit Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 border rounded-lg">
                <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-3">
                  <Download className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">ACH Transfer</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Direct bank-to-bank transfers using account and routing numbers
                </p>
                <Badge variant="outline">1-3 Business Days</Badge>
              </div>

              <div className="text-center p-6 border rounded-lg">
                <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-3">
                  <Link className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Payment Links</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Share secure payment links for customer payments
                </p>
                <Badge variant="outline">Instant</Badge>
              </div>

              <div className="text-center p-6 border rounded-lg">
                <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-3">
                  <QrCode className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">QR Codes</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Generate QR codes for in-person payments
                </p>
                <Badge variant="outline">Instant</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Deposits */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No recent deposits found
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}