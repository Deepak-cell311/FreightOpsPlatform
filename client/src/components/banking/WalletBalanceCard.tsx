import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export function WalletBalanceCard() {
  const [showBalance, setShowBalance] = useState(true);

  const { user } = useAuth();
  
  const { data: bankingStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/banking/application-status'],
    enabled: !!user,
  });

  const { data: balanceData, isLoading } = useQuery({
    queryKey: ['/api/railsr/companies', user?.companyId, 'balance'],
    enabled: !!user?.companyId && !!bankingStatus?.hasApplication,
    refetchInterval: 15000,
  });

  const balance = balanceData?.available || 0;
  const totalBalance = balanceData?.balance || 0;
  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(balance);

  const previousBalance = balance * 0.95; // Simulated previous balance for trend
  const balanceChange = balance - previousBalance;
  const isPositiveChange = balanceChange >= 0;

  return (
    <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            <CardTitle className="text-lg font-medium">Account Balance</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
            onClick={() => setShowBalance(!showBalance)}
          >
            {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div>
            <div className="text-3xl font-bold mb-1">
              {isLoading ? (
                <div className="animate-pulse bg-white/20 h-8 w-32 rounded"></div>
              ) : showBalance ? (
                formattedBalance
              ) : (
                "••••••"
              )}
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <span className="text-sm">Available Balance</span>
              <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                USD
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            {isPositiveChange ? (
              <TrendingUp className="h-4 w-4 text-green-300" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-300" />
            )}
            <span className={isPositiveChange ? "text-green-300" : "text-red-300"}>
              {isPositiveChange ? "+" : ""}
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(balanceChange)}
            </span>
            <span className="text-blue-200">vs last period</span>
          </div>

          <div className="pt-2 border-t border-white/20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-200">Account</span>
              <span className="font-mono">•••• {bankingStatus?.accountNumber?.slice(-4) || '0000'}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-blue-200">Routing</span>
              <span className="font-mono">{bankingStatus?.routingNumber || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-blue-200">Total Balance</span>
              <span className="font-mono">{new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(totalBalance)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}