import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, DollarSign, CreditCard, Ban, CheckCircle, Settings, ArrowLeftRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BankingControls {
  companyId: string;
  companyName: string;
  railsrAccountId: string;
  currentLimits: {
    dailyACHLimit: number;
    monthlyACHLimit: number;
    dailyWireLimit: number;
    monthlyWireLimit: number;
    checkWritingLimit: number;
    depositLimit: number;
  };
  accountStatus: string;
  cardLimits: {
    dailySpendLimit: number;
    monthlySpendLimit: number;
    atmWithdrawalLimit: number;
  };
}

export default function HQBankingControls() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [transferType, setTransferType] = useState<string>("");
  const [newLimits, setNewLimits] = useState<any>({});

  useEffect(() => {
    if (!isAuthenticated || !user || !['super_admin', 'hq_admin'].includes(user.role || '')) {
      setLocation('/hq/login');
    }
  }, [isAuthenticated, user, setLocation]);

  // Fetch companies with banking enabled
  const { data: bankingCompanies = [] } = useQuery({
    queryKey: ["/api/hq/banking-companies"],
    enabled: Boolean(isAuthenticated && user && ['super_admin', 'hq_admin'].includes(user.role || ''))
  });

  // Fetch banking controls for selected company
  const { data: bankingControls, isLoading } = useQuery({
    queryKey: ["/api/hq/banking-controls", selectedCompany],
    enabled: Boolean(selectedCompany && isAuthenticated && user && ['super_admin', 'hq_admin'].includes(user.role || ''))
  });

  // Force transfer mutation
  const forceTransferMutation = useMutation({
    mutationFn: async (data: { companyId: string; amount: number; type: string; description: string }) => {
      return apiRequest("POST", "/api/hq/force-transfer", data);
    },
    onSuccess: () => {
      toast({
        title: "Transfer Initiated",
        description: "Emergency transfer has been processed successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/hq/banking-controls", selectedCompany] });
      setTransferAmount("");
    },
    onError: (error: any) => {
      toast({
        title: "Transfer Failed",
        description: error.message || "Failed to process emergency transfer",
        variant: "destructive"
      });
    }
  });

  // Update limits mutation
  const updateLimitsMutation = useMutation({
    mutationFn: async (data: { companyId: string; limits: any; type: 'account' | 'card' }) => {
      return apiRequest("POST", "/api/hq/update-banking-limits", data);
    },
    onSuccess: () => {
      toast({
        title: "Limits Updated",
        description: "Banking limits have been updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/hq/banking-controls", selectedCompany] });
      setNewLimits({});
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update banking limits",
        variant: "destructive"
      });
    }
  });

  // Freeze/unfreeze account mutation
  const accountActionMutation = useMutation({
    mutationFn: async (data: { companyId: string; action: 'freeze' | 'unfreeze' | 'restrict' }) => {
      return apiRequest("POST", "/api/hq/account-action", data);
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Account Updated",
        description: `Account has been ${variables.action}d successfully`
      });
      queryClient.invalidateQueries({ queryKey: ["/api/hq/banking-controls", selectedCompany] });
    },
    onError: (error: any) => {
      toast({
        title: "Action Failed",
        description: error.message || "Failed to perform account action",
        variant: "destructive"
      });
    }
  });

  if (!isAuthenticated || !user || !['super_admin', 'hq_admin'].includes(user.role || '')) {
    return null;
  }

  const handleForceTransfer = () => {
    if (!selectedCompany || !transferAmount || !transferType) {
      toast({
        title: "Missing Information",
        description: "Please select company, enter amount, and choose transfer type",
        variant: "destructive"
      });
      return;
    }

    forceTransferMutation.mutate({
      companyId: selectedCompany,
      amount: parseFloat(transferAmount),
      type: transferType,
      description: "Emergency HQ intervention transfer"
    });
  };

  const handleUpdateAccountLimits = () => {
    if (!selectedCompany || Object.keys(newLimits).length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select company and enter new limits",
        variant: "destructive"
      });
      return;
    }

    updateLimitsMutation.mutate({
      companyId: selectedCompany,
      limits: newLimits,
      type: 'account'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Banking Controls</h1>
          <p className="text-gray-600 dark:text-gray-400">Emergency banking management for tenant accounts</p>
        </div>
        <Badge variant="destructive" className="text-red-600 border-red-600">
          <AlertTriangle className="w-4 h-4 mr-1" />
          Admin Access
        </Badge>
      </div>

      {/* Company Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Company</CardTitle>
          <CardDescription>Choose a company with active banking to manage</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a company..." />
            </SelectTrigger>
            <SelectContent>
              {bankingCompanies.map((company: any) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name} - DOT: {company.dotNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCompany && bankingControls && (
        <Tabs defaultValue="transfers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="transfers">Emergency Transfers</TabsTrigger>
            <TabsTrigger value="account-limits">Account Limits</TabsTrigger>
            <TabsTrigger value="card-limits">Card Limits</TabsTrigger>
            <TabsTrigger value="fraud-controls">Fraud Controls</TabsTrigger>
            <TabsTrigger value="account-actions">Account Actions</TabsTrigger>
          </TabsList>

          {/* Emergency Transfers */}
          <TabsContent value="transfers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowLeftRight className="w-5 h-5" />
                  Emergency Transfers
                </CardTitle>
                <CardDescription>
                  Force transfers for emergency situations or wallet issues
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="transfer-amount">Transfer Amount ($)</Label>
                    <Input
                      id="transfer-amount"
                      type="number"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="transfer-type">Transfer Type</Label>
                    <Select value={transferType} onValueChange={setTransferType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ach-credit">ACH Credit (Deposit)</SelectItem>
                        <SelectItem value="ach-debit">ACH Debit (Withdrawal)</SelectItem>
                        <SelectItem value="wire-incoming">Wire Transfer In</SelectItem>
                        <SelectItem value="wire-outgoing">Wire Transfer Out</SelectItem>
                        <SelectItem value="manual-adjustment">Manual Adjustment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={handleForceTransfer}
                      disabled={forceTransferMutation.isPending}
                      className="w-full"
                    >
                      {forceTransferMutation.isPending ? "Processing..." : "Execute Transfer"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Limits */}
          <TabsContent value="account-limits">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Account Transaction Limits
                </CardTitle>
                <CardDescription>
                  Modify ACH, wire, check, and deposit limits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Current Daily ACH Limit</Label>
                    <div className="text-2xl font-bold">${bankingControls.currentLimits?.dailyACHLimit?.toLocaleString() || 0}</div>
                  </div>
                  <div>
                    <Label htmlFor="new-daily-ach">New Daily ACH Limit ($)</Label>
                    <Input
                      id="new-daily-ach"
                      type="number"
                      value={newLimits.dailyACHLimit || ''}
                      onChange={(e) => setNewLimits({...newLimits, dailyACHLimit: parseFloat(e.target.value)})}
                      placeholder={bankingControls.currentLimits?.dailyACHLimit?.toString() || "0"}
                    />
                  </div>
                  <div>
                    <Label>Current Monthly ACH Limit</Label>
                    <div className="text-2xl font-bold">${bankingControls.currentLimits?.monthlyACHLimit?.toLocaleString() || 0}</div>
                  </div>
                  <div>
                    <Label htmlFor="new-monthly-ach">New Monthly ACH Limit ($)</Label>
                    <Input
                      id="new-monthly-ach"
                      type="number"
                      value={newLimits.monthlyACHLimit || ''}
                      onChange={(e) => setNewLimits({...newLimits, monthlyACHLimit: parseFloat(e.target.value)})}
                      placeholder={bankingControls.currentLimits?.monthlyACHLimit?.toString() || "0"}
                    />
                  </div>
                  <div>
                    <Label>Current Daily Wire Limit</Label>
                    <div className="text-2xl font-bold">${bankingControls.currentLimits?.dailyWireLimit?.toLocaleString() || 0}</div>
                  </div>
                  <div>
                    <Label htmlFor="new-daily-wire">New Daily Wire Limit ($)</Label>
                    <Input
                      id="new-daily-wire"
                      type="number"
                      value={newLimits.dailyWireLimit || ''}
                      onChange={(e) => setNewLimits({...newLimits, dailyWireLimit: parseFloat(e.target.value)})}
                      placeholder={bankingControls.currentLimits?.dailyWireLimit?.toString() || "0"}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleUpdateAccountLimits}
                  disabled={updateLimitsMutation.isPending}
                  className="w-full"
                >
                  {updateLimitsMutation.isPending ? "Updating..." : "Update Account Limits"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fraud Controls */}
          <TabsContent value="fraud-controls">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Fraud Detection & Prevention
                  </CardTitle>
                  <CardDescription>
                    Manage Railsr fraud controls and card security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Card Status</h3>
                      <div className="space-y-2">
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => accountActionMutation.mutate({ 
                            companyId: selectedCompany, 
                            action: 'freeze-cards' as any 
                          })}
                          disabled={accountActionMutation.isPending}
                          className="w-full"
                        >
                          Freeze All Cards (Fraud)
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => accountActionMutation.mutate({ 
                            companyId: selectedCompany, 
                            action: 'issue-replacement' as any 
                          })}
                          disabled={accountActionMutation.isPending}
                          className="w-full"
                        >
                          Issue Replacement Cards
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Fraud Settings</h3>
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateLimitsMutation.mutate({
                            companyId: selectedCompany,
                            limits: { fraudMonitoring: 'enhanced' },
                            type: 'fraud' as any
                          })}
                          disabled={updateLimitsMutation.isPending}
                          className="w-full"
                        >
                          Enable Enhanced Monitoring
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateLimitsMutation.mutate({
                            companyId: selectedCompany,
                            limits: { geoRestrictions: true },
                            type: 'fraud' as any
                          })}
                          disabled={updateLimitsMutation.isPending}
                          className="w-full"
                        >
                          Enable Geographic Restrictions
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Transaction Controls</h3>
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateLimitsMutation.mutate({
                            companyId: selectedCompany,
                            limits: { onlineTransactions: false },
                            type: 'fraud' as any
                          })}
                          disabled={updateLimitsMutation.isPending}
                          className="w-full"
                        >
                          Disable Online Transactions
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateLimitsMutation.mutate({
                            companyId: selectedCompany,
                            limits: { atmWithdrawals: false },
                            type: 'fraud' as any
                          })}
                          disabled={updateLimitsMutation.isPending}
                          className="w-full"
                        >
                          Disable ATM Withdrawals
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Velocity Limits</h3>
                      <div className="space-y-2">
                        <Label htmlFor="velocity-count">Max Transactions/Day</Label>
                        <Input
                          id="velocity-count"
                          type="number"
                          value={newLimits.maxTransactionsPerDay || ''}
                          onChange={(e) => setNewLimits({...newLimits, maxTransactionsPerDay: parseInt(e.target.value)})}
                          placeholder="10"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateLimitsMutation.mutate({
                            companyId: selectedCompany,
                            limits: { maxTransactionsPerDay: newLimits.maxTransactionsPerDay },
                            type: 'fraud' as any
                          })}
                          disabled={updateLimitsMutation.isPending}
                          className="w-full"
                        >
                          Update Velocity Limits
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Fraud Alerts</CardTitle>
                  <CardDescription>Monitor suspicious activity and fraud attempts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {/* This would be populated with real fraud alerts from Railsr */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Suspicious Transaction Blocked</div>
                        <div className="text-sm text-muted-foreground">Card ending in 4532 - unusual transaction detected</div>
                      </div>
                      <Badge variant="destructive">High Risk</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Velocity Limit Exceeded</div>
                        <div className="text-sm text-muted-foreground">15 transactions in 1 hour - above normal pattern</div>
                      </div>
                      <Badge variant="outline">Medium Risk</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Card Limits */}
          <TabsContent value="card-limits">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Debit Card Limits
                </CardTitle>
                <CardDescription>
                  Manage spending and withdrawal limits for company cards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Current Daily Spend Limit</Label>
                    <div className="text-2xl font-bold">${bankingControls.cardLimits?.dailySpendLimit?.toLocaleString() || 0}</div>
                  </div>
                  <div>
                    <Label htmlFor="new-daily-spend">New Daily Spend Limit ($)</Label>
                    <Input
                      id="new-daily-spend"
                      type="number"
                      value={newLimits.dailySpendLimit || ''}
                      onChange={(e) => setNewLimits({...newLimits, dailySpendLimit: parseFloat(e.target.value)})}
                      placeholder={bankingControls.cardLimits?.dailySpendLimit?.toString() || "0"}
                    />
                  </div>
                  <div>
                    <Label>Current ATM Withdrawal Limit</Label>
                    <div className="text-2xl font-bold">${bankingControls.cardLimits?.atmWithdrawalLimit?.toLocaleString() || 0}</div>
                  </div>
                  <div>
                    <Label htmlFor="new-atm-limit">New ATM Withdrawal Limit ($)</Label>
                    <Input
                      id="new-atm-limit"
                      type="number"
                      value={newLimits.atmWithdrawalLimit || ''}
                      onChange={(e) => setNewLimits({...newLimits, atmWithdrawalLimit: parseFloat(e.target.value)})}
                      placeholder={bankingControls.cardLimits?.atmWithdrawalLimit?.toString() || "0"}
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => updateLimitsMutation.mutate({
                    companyId: selectedCompany,
                    limits: newLimits,
                    type: 'card'
                  })}
                  disabled={updateLimitsMutation.isPending}
                  className="w-full"
                >
                  {updateLimitsMutation.isPending ? "Updating..." : "Update Card Limits"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Actions */}
          <TabsContent value="account-actions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Emergency Account Actions
                </CardTitle>
                <CardDescription>
                  Freeze, restrict, or restore account access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Current Account Status</h3>
                    <p className="text-sm text-muted-foreground">
                      Status: <Badge variant={bankingControls.accountStatus === 'active' ? 'default' : 'destructive'}>
                        {bankingControls.accountStatus}
                      </Badge>
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="destructive"
                    onClick={() => accountActionMutation.mutate({ companyId: selectedCompany, action: 'freeze' })}
                    disabled={accountActionMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Ban className="w-4 h-4" />
                    Freeze Account
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => accountActionMutation.mutate({ companyId: selectedCompany, action: 'restrict' })}
                    disabled={accountActionMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Restrict Transfers
                  </Button>
                  <Button 
                    variant="default"
                    onClick={() => accountActionMutation.mutate({ companyId: selectedCompany, action: 'unfreeze' })}
                    disabled={accountActionMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Restore Access
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
}