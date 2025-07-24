import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Plus, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  Settings,
  DollarSign,
  Calendar,
  Shield
} from "lucide-react";

export default function BankingCards() {
  const cards = [
    {
      id: 1,
      name: "Primary Business Card",
      cardNumber: "**** **** **** 4321",
      type: "Virtual",
      status: "Active",
      balance: 2500.00,
      limit: 5000.00,
      expiryDate: "12/26",
      holder: "Business Account",
      lastUsed: "2024-01-15",
      monthlySpend: 847.32
    },
    {
      id: 2,
      name: "Fuel Card",
      cardNumber: "**** **** **** 8765",
      type: "Physical",
      status: "Active",
      balance: 1200.00,
      limit: 2000.00,
      expiryDate: "08/25",
      holder: "Fleet Operations",
      lastUsed: "2024-01-14",
      monthlySpend: 653.21
    },
    {
      id: 3,
      name: "Employee Card - John Smith",
      cardNumber: "**** **** **** 1234",
      type: "Physical",
      status: "Blocked",
      balance: 0.00,
      limit: 1000.00,
      expiryDate: "03/25",
      holder: "John Smith",
      lastUsed: "2024-01-10",
      monthlySpend: 0.00
    }
  ];

  const pendingRequests = [
    {
      id: 1,
      type: "New Card Request",
      requestedBy: "Sarah Johnson",
      requestDate: "2024-01-14",
      cardType: "Virtual",
      limit: 1500.00,
      status: "Pending Approval"
    },
    {
      id: 2,
      type: "Limit Increase",
      requestedBy: "Mike Wilson",
      requestDate: "2024-01-13",
      cardType: "Physical",
      limit: 3000.00,
      status: "Under Review"
    }
  ];

  return (
    <div className="w-full min-h-full px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cards</h1>
            <p className="text-gray-600 mt-2">Manage business cards and spending limits</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Request New Card
          </Button>
        </div>

        {/* Card Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Cards</p>
                  <p className="text-3xl font-bold text-green-600">2</p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Limit</p>
                  <p className="text-3xl font-bold text-blue-600">${cardData?.totalLimit || '0'}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Available Credit</p>
                  <p className="text-3xl font-bold text-gray-900">${cardData?.totalSpent || '0'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-full">
                  <Shield className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Monthly Spend</p>
                  <p className="text-3xl font-bold text-yellow-600">${cardData?.pendingTransactions || '0'}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-full">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Cards */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Active Cards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {cards.map((card) => (
                    <div key={card.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{card.name}</h3>
                          <p className="text-gray-600">{card.cardNumber}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant={card.type === 'Virtual' ? 'secondary' : 'default'}
                              className="text-xs"
                            >
                              {card.type}
                            </Badge>
                            <Badge 
                              variant={card.status === 'Active' ? 'default' : 'destructive'}
                              className={card.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                            >
                              {card.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                          {card.status === 'Active' ? (
                            <Button variant="outline" size="sm">
                              <Lock className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm">
                              <Unlock className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Available</p>
                          <p className="font-semibold">${(card.limit - card.balance).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Limit</p>
                          <p className="font-semibold">${card.limit.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Monthly Spend</p>
                          <p className="font-semibold">${card.monthlySpend.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Expires</p>
                          <p className="font-semibold">{card.expiryDate}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Cardholder: {card.holder}</span>
                          <span className="text-gray-500">Last used: {card.lastUsed}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Requests & Quick Actions */}
          <div className="space-y-6">
            {/* Pending Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pending Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{request.type}</h4>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                          {request.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Requested by: {request.requestedBy}</p>
                        <p>Date: {request.requestDate}</p>
                        <p>Limit: ${request.limit.toFixed(2)}</p>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Deny
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Request Virtual Card
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Request Physical Card
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Card Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Card Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Card Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900">Virtual Cards</p>
                    <p className="text-blue-700">Perfect for online purchases and recurring subscriptions.</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900">Spending Controls</p>
                    <p className="text-green-700">Set custom limits and restrictions for each card.</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="font-medium text-yellow-900">Real-time Alerts</p>
                    <p className="text-yellow-700">Get notified instantly for all card transactions.</p>
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