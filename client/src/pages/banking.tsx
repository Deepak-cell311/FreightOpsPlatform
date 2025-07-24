import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Send, 
  Eye,
  Repeat,
  CreditCard,
  FileText,
  PiggyBank,
  Target,
  Truck,
  Zap
} from "lucide-react";
import BankingActivation from "./banking-activation";

export default function Banking() {
  const { user } = useAuth();
  
  // Check banking activation status
  const { data: bankingStatus, isLoading } = useQuery({
    queryKey: ['/api/banking/activation-status'],
    retry: false
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If banking is not activated, show activation flow
  if (!bankingStatus || !bankingStatus.isActivated) {
    return <BankingActivation />;
  }
  // Fetch real banking data from API
  const { data: bankingData } = useQuery({
    queryKey: ["/api/banking/overview"],
    retry: false,
  });

  const totalBalance = bankingData?.totalBalance || 0;
  const availableBalance = bankingData?.availableBalance || 0;
  const reserves = bankingData?.reserves || 0;
  
  const recentTransactions = [
    {
      id: 1,
      description: "WEB NETWORKS SOLUT...",
      date: "Jan 9, 2024",
      amount: 0.00,
      type: "pending"
    },
    {
      id: 2,
      description: "CASH APP*DONMARIO DI...",
      amount: 5.75,
      type: "completed"
    },
    {
      id: 3,
      description: "REFILL INC",
      date: "POI Withdrawal",
      amount: -53.48,
      type: "completed"
    },
    {
      id: 4,
      description: "CASH APP*DONMARIO DI...",
      date: "17 Days",
      amount: 54.04,
      type: "completed"
    },
    {
      id: 5,
      description: "REFILL INC",
      date: "POI Withdrawal - Denied",
      amount: -53.48,
      type: "denied"
    }
  ];

  const reserveCategories = [
    { name: "Salary", percentage: 0, amount: 0.00 },
    { name: "Operating Expenses", percentage: 0, amount: 0.00 },
    { name: "Truck Payment", percentage: 0, amount: 0.00 }
  ];

  return (
    <div className="w-full min-h-full px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header with Account Balance */}
        <div className="mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-gray-900 mb-2">${totalBalance.toFixed(2)}</div>
              <div className="text-lg text-gray-600 mb-4">Total Account Balance</div>
              
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-sm">
                <div>
                  <div className="text-gray-500">Available Balance</div>
                  <div className="font-semibold">${availableBalance.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Reserves</div>
                  <div className="font-semibold">${reserves.toFixed(2)}</div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 mt-2">
                You have no Pending Transactions
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center mb-6">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                Add money
              </Button>
              <Button variant="outline" className="px-6 py-2 rounded-lg">
                Send money
              </Button>
            </div>

            {/* Money Movement */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-blue-600 font-semibold text-lg">${bankingData?.monthlyIncome?.toFixed(2) || '0.00'}</div>
                <div className="text-xs text-gray-500">Money In</div>
              </div>
              <div>
                <div className="text-gray-900 font-semibold text-lg">${reserves?.toFixed(2) || '0.00'}</div>
                <div className="text-xs text-gray-500">Money Out</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Transactions</CardTitle>
                <div className="flex gap-4 text-sm text-gray-500 mt-2">
                  <span className="border-b-2 border-blue-500 pb-1">Recent Transactions</span>
                  <span>Pending Transactions</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600">
                View all activity →
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center py-2">
                    <div>
                      <div className="font-medium text-sm">{transaction.description}</div>
                      <div className="text-xs text-gray-500">{transaction.date}</div>
                    </div>
                    <div className={`font-semibold text-sm ${
                      transaction.amount > 0 ? 'text-green-600' : 
                      transaction.amount < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* For You Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">For You</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{bankingData?.earningsPotential || 'No earnings data'}</div>
                      <div className="text-xs text-gray-600">Invite someone and you'll both get a cash bonus</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-600 p-0">
                    Refer a business →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reserves */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Reserves</CardTitle>
              <Button variant="ghost" size="sm" className="text-blue-600">
                All Reserves →
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reserveCategories.map((reserve, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{reserve.name}</span>
                    <span className="text-sm font-medium">${reserve.amount.toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center font-medium">
                    <span>Total of Reserves</span>
                    <span>${bankingData?.expensesByCategory || '0.00'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Make a Payment */}
          <Card className="xl:col-span-3">
            <CardHeader>
              <CardTitle className="text-lg">Make a Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CreditCard className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="text-xs">Add Payee</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Truck className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="text-xs">Western Car Rate Monitor</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CreditCard className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="text-xs">Ramp Capital</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <DollarSign className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="text-xs">$</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Zap className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="text-xs">Ssupply</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}