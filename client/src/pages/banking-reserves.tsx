import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PiggyBank, TrendingUp, Calendar, DollarSign, Target, Plus, Edit, Trash2, AlertCircle } from "lucide-react";

export default function BankingReserves() {
  const reserves = [
    {
      id: "emergency-fund",
      name: "Emergency Fund",
      description: "Emergency operating expenses reserve",
      targetAmount: 25000.00,
      currentAmount: 18750.00,
      monthlyContribution: 1250.00,
      autoContribute: true,
      category: "safety",
      priority: "high",
      targetDate: "2025-03-01"
    },
    {
      id: "equipment-replacement",
      name: "Equipment Replacement",
      description: "Vehicle and equipment replacement fund",
      targetAmount: 75000.00,
      currentAmount: 32100.00,
      monthlyContribution: 2500.00,
      autoContribute: true,
      category: "capital",
      priority: "medium",
      targetDate: "2025-12-31"
    },
    {
      id: "tax-reserve",
      name: "Tax Reserve",
      description: "Quarterly tax payment reserve",
      targetAmount: 15000.00,
      currentAmount: 12800.00,
      monthlyContribution: 1000.00,
      autoContribute: true,
      category: "tax",
      priority: "high",
      targetDate: "2025-03-15"
    },
    {
      id: "maintenance-fund",
      name: "Maintenance Fund",
      description: "Vehicle maintenance and repairs",
      targetAmount: 20000.00,
      currentAmount: 8450.00,
      monthlyContribution: 800.00,
      autoContribute: false,
      category: "operational",
      priority: "medium",
      targetDate: "2025-06-30"
    }
  ];

  const totalReserves = reserves.reduce((sum, reserve) => sum + reserve.currentAmount, 0);
  const totalTargets = reserves.reduce((sum, reserve) => sum + reserve.targetAmount, 0);
  const totalMonthlyContributions = reserves.reduce((sum, reserve) => sum + reserve.monthlyContribution, 0);

  const recentActivity = [
    {
      id: "1",
      type: "contribution",
      reserveName: "Emergency Fund",
      amount: 1250.00,
      date: "Dec 09, 2024",
      description: "Monthly automatic contribution"
    },
    {
      id: "2",
      type: "contribution",
      reserveName: "Equipment Replacement",
      amount: 2500.00,
      date: "Dec 09, 2024",
      description: "Monthly automatic contribution"
    },
    {
      id: "3",
      type: "withdrawal",
      reserveName: "Maintenance Fund",
      amount: -850.00,
      date: "Dec 08, 2024",
      description: "Truck #3 brake repair"
    },
    {
      id: "4",
      type: "contribution",
      reserveName: "Tax Reserve",
      amount: 1000.00,
      date: "Dec 08, 2024",
      description: "Monthly automatic contribution"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'safety': return <AlertCircle className="h-4 w-4" />;
      case 'capital': return <TrendingUp className="h-4 w-4" />;
      case 'tax': return <DollarSign className="h-4 w-4" />;
      case 'operational': return <Target className="h-4 w-4" />;
      default: return <PiggyBank className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full min-h-full px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reserves</h1>
          <p className="text-gray-600">Manage your business reserves and savings goals</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <PiggyBank className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Reserves</div>
                  <div className="text-2xl font-bold text-gray-900">${totalReserves.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Target Amount</div>
                  <div className="text-2xl font-bold text-gray-900">${totalTargets.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Progress</div>
                  <div className="text-2xl font-bold text-gray-900">{((totalReserves / totalTargets) * 100).toFixed(1)}%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Monthly Contributions</div>
                  <div className="text-2xl font-bold text-gray-900">${totalMonthlyContributions.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="reserves" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reserves">Reserve Accounts</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="settings">Auto-Contribute Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="reserves" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Reserve Accounts</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create New Reserve
              </Button>
            </div>

            <div className="grid gap-6">
              {reserves.map((reserve) => {
                const progressPercent = (reserve.currentAmount / reserve.targetAmount) * 100;
                const monthsToTarget = Math.ceil((reserve.targetAmount - reserve.currentAmount) / reserve.monthlyContribution);
                
                return (
                  <Card key={reserve.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            {getCategoryIcon(reserve.category)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{reserve.name}</h3>
                              <Badge className={getPriorityColor(reserve.priority)}>
                                {reserve.priority} priority
                              </Badge>
                              {reserve.autoContribute && (
                                <Badge variant="outline" className="text-blue-600 border-blue-200">
                                  Auto-contribute
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{reserve.description}</p>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-medium">
                                  ${reserve.currentAmount.toFixed(2)} / ${reserve.targetAmount.toFixed(2)}
                                </span>
                              </div>
                              <Progress value={progressPercent} className="h-2" />
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>{progressPercent.toFixed(1)}% complete</span>
                                <span>{monthsToTarget} months to target</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 lg:items-end">
                          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 text-sm">
                            <div className="lg:text-right">
                              <div className="text-gray-500">Monthly Contribution</div>
                              <div className="font-semibold text-green-600">+${reserve.monthlyContribution.toFixed(2)}</div>
                            </div>
                            <div className="lg:text-right">
                              <div className="text-gray-500">Target Date</div>
                              <div className="font-medium">{new Date(reserve.targetDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              Add Funds
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Reserve Activity</CardTitle>
                <p className="text-sm text-gray-600">Latest contributions and withdrawals from your reserves</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          activity.type === 'contribution' ? 'bg-green-50' : 'bg-red-50'
                        }`}>
                          {activity.type === 'contribution' ? (
                            <TrendingUp className={`h-4 w-4 ${
                              activity.type === 'contribution' ? 'text-green-600' : 'text-red-600'
                            }`} />
                          ) : (
                            <DollarSign className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{activity.reserveName}</div>
                          <div className="text-xs text-gray-500">{activity.description}</div>
                          <div className="text-xs text-gray-400">{activity.date}</div>
                        </div>
                      </div>
                      <div className={`font-semibold ${
                        activity.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {activity.amount > 0 ? '+' : ''}${Math.abs(activity.amount).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Auto-Contribute Settings</CardTitle>
                <p className="text-sm text-gray-600">Configure automatic monthly contributions to your reserves</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="contribution-date">Monthly Contribution Date</Label>
                    <Select defaultValue="1">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1st of each month</SelectItem>
                        <SelectItem value="15">15th of each month</SelectItem>
                        <SelectItem value="last">Last day of each month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="funding-source">Funding Source</Label>
                    <Select defaultValue="checking">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Main Business Checking</SelectItem>
                        <SelectItem value="savings">Business Savings</SelectItem>
                        <SelectItem value="external">External Bank Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Individual Reserve Settings</h4>
                  {reserves.map((reserve) => (
                    <div key={reserve.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(reserve.category)}
                        <div>
                          <div className="font-medium">{reserve.name}</div>
                          <div className="text-sm text-gray-600">${reserve.monthlyContribution.toFixed(2)}/month</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={reserve.autoContribute ? "default" : "secondary"}>
                          {reserve.autoContribute ? "Enabled" : "Disabled"}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Total Monthly Auto-Contributions</div>
                      <div className="text-sm text-gray-600">Amount automatically moved to reserves each month</div>
                    </div>
                    <div className="text-xl font-bold text-blue-600">
                      ${reserves.filter(r => r.autoContribute).reduce((sum, r) => sum + r.monthlyContribution, 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}