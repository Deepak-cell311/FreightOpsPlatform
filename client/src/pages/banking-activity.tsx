import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  Download, 
  Calendar,
  ArrowUpDown,
  TrendingUp,
  TrendingDown
} from "lucide-react";

export default function BankingActivity() {
  const transactions = [
    {
      id: 1,
      date: "2024-01-15",
      description: "CASH APP*DONMARIO DI...",
      category: "Business Expense",
      amount: 5.75,
      type: "credit",
      status: "completed",
      balance: 6.59
    },
    {
      id: 2,
      date: "2024-01-14",
      description: "REFILL INC",
      category: "Fuel",
      amount: -53.48,
      type: "debit",
      status: "completed",
      balance: 0.84
    },
    {
      id: 3,
      date: "2024-01-13",
      description: "WEB NETWORKS SOLUT...",
      category: "Software & Subscriptions",
      amount: -29.99,
      type: "debit",
      status: "completed",
      balance: 54.32
    },
    {
      id: 4,
      date: "2024-01-12",
      description: "CASH APP*DONMARIO DI...",
      category: "Business Income",
      amount: 84.31,
      type: "credit",
      status: "completed",
      balance: 84.31
    },
    {
      id: 5,
      date: "2024-01-11",
      description: "ACH TRANSFER - PENDING",
      category: "Transfer",
      amount: 1000.00,
      type: "credit",
      status: "pending",
      balance: 0.00
    }
  ];

  const filterOptions = [
    "All Transactions",
    "Credits Only",
    "Debits Only",
    "Pending",
    "This Week",
    "This Month",
    "Last 30 Days"
  ];

  return (
    <div className="w-full min-h-full px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Activity</h1>
            <p className="text-gray-600 mt-2">View all account transactions and activity</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </Button>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                  <p className="text-3xl font-bold text-gray-900">47</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <ArrowUpDown className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Money In</p>
                  <p className="text-3xl font-bold text-green-600">${transactionData?.totalIncome?.toLocaleString() || '0.00'}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Money Out</p>
                  <p className="text-3xl font-bold text-red-600">${transactionData?.totalExpenses?.toLocaleString() || '0.00'}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-full">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">3</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-full">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search transactions..." 
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline">
                  Sort by Date
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction List */}
        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      transaction.status === 'completed' ? 'bg-green-500' :
                      transaction.status === 'pending' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <Badge 
                          variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                          className={
                            transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{transaction.date}</span>
                        <span>•</span>
                        <span>{transaction.category}</span>
                        <span>•</span>
                        <span>Balance: ${transaction.balance.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.type === 'credit' ? 'Credit' : 'Debit'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button variant="outline">
                Load More Transactions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}