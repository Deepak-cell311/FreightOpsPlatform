import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Search, Plus, Eye, Copy, Download } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function BankingAccounts() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: accountData, isLoading } = useQuery({
    queryKey: ['/api/freightops/account/details'],
    refetchInterval: 30000,
  });

  const { data: balanceData } = useQuery({
    queryKey: ['/api/freightops/balance'],
    refetchInterval: 15000,
  });

  const balance = balanceData?.balance || 0;
  const account = accountData || {};

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  return (
    <div className="w-full min-h-full px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Management</h1>
          <p className="text-gray-600">Manage your Railsr banking accounts and details</p>
        </div>

        {/* Primary Account */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Primary Business Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Account Number</label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-lg">•••• 8971</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("5648971", "Account number")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Routing Number</label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-lg">812345678</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("812345678", "Routing number")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Available Balance</label>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(balance)}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Account Status</label>
                <div className="mt-1">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Type</label>
                  <p className="mt-1">Business Checking</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Holder</label>
                  <p className="mt-1">FreightOps LLC</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Opened</label>
                  <p className="mt-1">March 15, 2024</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Statement
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-3">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">FDIC Insured</h3>
                <p className="text-sm text-gray-600">Your deposits are protected up to FDIC limits</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-3">
                  <Download className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">ACH Transfers</h3>
                <p className="text-sm text-gray-600">Send and receive money electronically</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-3">
                  <Plus className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">No Monthly Fees</h3>
                <p className="text-sm text-gray-600">No maintenance or minimum balance fees</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Account Activity</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search activity..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Account Activity</p>
              <p>Recent account changes and updates will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}