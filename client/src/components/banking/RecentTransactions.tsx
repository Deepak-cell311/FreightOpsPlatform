import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, MoreHorizontal, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export function RecentTransactions() {
  const { user } = useAuth();
  
  const { data: bankingStatus } = useQuery({
    queryKey: ['/api/banking/application-status'],
    enabled: !!user,
  });

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['/api/railsr/companies', user?.companyId, 'transactions'],
    enabled: !!user?.companyId && !!bankingStatus?.hasApplication,
    refetchInterval: 30000,
  });

  const transactions = transactionsData || [];

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getTransactionIcon = (type: string) => {
    return type === 'credit' ? (
      <ArrowDownLeft className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowUpRight className="h-4 w-4 text-red-600" />
    );
  };

  const getAmountColor = (type: string) => {
    return type === 'credit' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="animate-pulse bg-gray-200 h-8 w-8 rounded-full"></div>
                    <div>
                      <div className="animate-pulse bg-gray-200 h-4 w-32 rounded mb-1"></div>
                      <div className="animate-pulse bg-gray-200 h-3 w-20 rounded"></div>
                    </div>
                  </div>
                  <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No recent transactions</p>
              <p className="text-sm mt-1">Transactions will appear here when they occur</p>
            </div>
          ) : (
            transactions.slice(0, 8).map((transaction: any) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {transaction.description || 'Transaction'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{formatDate(transaction.date)}</span>
                      <Badge variant="outline" className="text-xs">
                        {transaction.type}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium text-sm ${getAmountColor(transaction.type)}`}>
                    {transaction.type === 'credit' ? '+' : '-'}
                    {formatAmount(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {transaction.status}
                  </p>
                </div>
              </div>
            ))
          )}
          
          {transactions.length > 8 && (
            <div className="text-center pt-4">
              <Button variant="outline" size="sm">
                View All Transactions
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}