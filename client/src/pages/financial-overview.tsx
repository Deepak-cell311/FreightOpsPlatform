import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, TrendingDown, Target } from "lucide-react";

interface FinancialData {
  revenue: {
    total: number;
    monthly: number;
    weekly: number;
    daily: number;
    target: number;
    growth: number;
  };
  expenses: {
    total: number;
    fuel: number;
    maintenance: number;
    insurance: number;
    salaries: number;
    other: number;
  };
  profit: {
    gross: number;
    net: number;
    margin: number;
  };
  cashFlow: {
    current: number;
    projected30Days: number;
    projected90Days: number;
  };
}

export default function FinancialOverview() {
  const { data: financialData, isLoading } = useQuery<FinancialData>({
    queryKey: ["/api/dashboard/financial-overview"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const revenueProgress = financialData ? (financialData.revenue.total / financialData.revenue.target) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(financialData?.revenue.total || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +{financialData?.revenue.growth || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(financialData?.expenses.total || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly operating costs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(financialData?.profit.net || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {financialData?.profit.margin.toFixed(1) || 0}% margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Target</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueProgress.toFixed(1)}%
            </div>
            <Progress value={revenueProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(financialData?.revenue.target || 0)} target
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>Monthly revenue analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Monthly Revenue</span>
              <span className="font-semibold">
                {formatCurrency(financialData?.revenue.monthly || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Weekly Revenue</span>
              <span className="font-semibold">
                {formatCurrency(financialData?.revenue.weekly || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Daily Revenue</span>
              <span className="font-semibold">
                {formatCurrency(financialData?.revenue.daily || 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
            <CardDescription>Breakdown of operating expenses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Fuel Costs</span>
              <span className="font-semibold">
                {formatCurrency(financialData?.expenses.fuel || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Salaries</span>
              <span className="font-semibold">
                {formatCurrency(financialData?.expenses.salaries || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Maintenance</span>
              <span className="font-semibold">
                {formatCurrency(financialData?.expenses.maintenance || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Insurance</span>
              <span className="font-semibold">
                {formatCurrency(financialData?.expenses.insurance || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Other</span>
              <span className="font-semibold">
                {formatCurrency(financialData?.expenses.other || 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Projections */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Projections</CardTitle>
          <CardDescription>Projected cash flow for upcoming periods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold text-sm text-muted-foreground">Current</h3>
              <p className="text-2xl font-bold">
                {formatCurrency(financialData?.cashFlow.current || 0)}
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold text-sm text-muted-foreground">30 Days</h3>
              <p className="text-2xl font-bold">
                {formatCurrency(financialData?.cashFlow.projected30Days || 0)}
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold text-sm text-muted-foreground">90 Days</h3>
              <p className="text-2xl font-bold">
                {formatCurrency(financialData?.cashFlow.projected90Days || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}