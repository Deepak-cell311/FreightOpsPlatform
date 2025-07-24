import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, Plus, Send, Download, CreditCard, Users, Repeat, Eye } from "lucide-react";
import { WalletBalanceCard } from "@/components/banking/WalletBalanceCard";
import { RecentTransactions } from "@/components/banking/RecentTransactions";
import { QuickActions } from "@/components/banking/QuickActions";
import { CompanyCards } from "@/components/banking/CompanyCards";

export default function BankingOverview() {
  // Fetch real banking data
  const { data: bankingData } = useQuery({
    queryKey: ["/api/banking/overview"],
    retry: false,
  });

  return (
    <div className="w-full min-h-full px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Overview</h1>
          <p className="text-gray-600">Your business banking dashboard</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Balance and Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            <WalletBalanceCard />
            <QuickActions />
            <RecentTransactions />
          </div>

          {/* Right Column - Cards and Secondary Info */}
          <div className="space-y-6">
            <CompanyCards />
            
            {/* Account Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Available Balance</span>
                  <span className="font-semibold text-green-600">${bankingData?.availableBalance?.toLocaleString() || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending Transactions</span>
                  <span className="font-semibold text-amber-600">${bankingData?.pendingTransactions?.toLocaleString() || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Reserved Funds</span>
                  <span className="font-semibold text-blue-600">${bankingData?.reservedFunds?.toLocaleString() || '0.00'}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Total Balance</span>
                    <span className="text-lg font-bold text-gray-900">${bankingData?.totalBalance?.toLocaleString() || '0.00'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Payments */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Upcoming Payments</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  View All
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <div>
                    <div className="font-medium text-sm">Payroll - December</div>
                    <div className="text-xs text-gray-500">Due: Dec 15, 2024</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-600">${bankingData?.overduePayments?.toLocaleString() || '0.00'}</div>
                    <Badge variant="outline" className="text-xs">Scheduled</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div>
                    <div className="font-medium text-sm">Fuel Payment - Shell</div>
                    <div className="text-xs text-gray-500">Due: Dec 12, 2024</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-600">${bankingData?.urgentExpenses?.toLocaleString() || '0.00'}</div>
                    <Badge variant="outline" className="text-xs">Pending</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div>
                    <div className="font-medium text-sm">Insurance Premium</div>
                    <div className="text-xs text-gray-500">Due: Dec 20, 2024</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-600">$1,875.00</div>
                    <Badge variant="outline" className="text-xs">Upcoming</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Cards Activity */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Cards Activity</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  Manage Cards
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-medium text-sm">Business Card ••••4567</div>
                      <div className="text-xs text-gray-500">Fleet Manager - John Smith</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-600">-$125.50</div>
                    <div className="text-xs text-gray-500">2 hours ago</div>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-medium text-sm">Business Card ••••8901</div>
                      <div className="text-xs text-gray-500">Operations - Sarah Johnson</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-600">-$87.25</div>
                    <div className="text-xs text-gray-500">5 hours ago</div>
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