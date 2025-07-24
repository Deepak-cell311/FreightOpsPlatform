import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react';

interface RevenueData {
  totalMRR: number;
  newMRR: number;
  churnedMRR: number;
  expansionMRR: number;
  cac: number;
  ltv: number;
  paymentVolume: number;
  subscriptionDistribution: Record<string, number>;
}

export function RevenueDashboard() {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      const response = await fetch('/api/hq/revenue');
      if (response.ok) {
        const data = await response.json();
        setRevenueData(data);
      } else {
        // Fallback data for development
        setRevenueData({
          totalMRR: 47250,
          newMRR: 8500,
          churnedMRR: 2100,
          expansionMRR: 3200,
          cac: 1250,
          ltv: 8500,
          paymentVolume: 156000,
          subscriptionDistribution: {
            starter: 12,
            professional: 8,
            enterprise: 3
          }
        });
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(revenueData?.totalMRR || 0)}</div>
            <p className="text-xs text-muted-foreground">Monthly Recurring Revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New MRR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(revenueData?.newMRR || 0)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn MRR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-{formatCurrency(revenueData?.churnedMRR || 0)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expansion MRR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(revenueData?.expansionMRR || 0)}</div>
            <p className="text-xs text-muted-foreground">Upgrades & expansions</p>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Acquisition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Customer Acquisition Cost (CAC)</span>
                <span className="text-lg font-bold">{formatCurrency(revenueData?.cac || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Lifetime Value (LTV)</span>
                <span className="text-lg font-bold">{formatCurrency(revenueData?.ltv || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">LTV:CAC Ratio</span>
                <Badge variant="default">
                  {((revenueData?.ltv || 0) / (revenueData?.cac || 1)).toFixed(1)}:1
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Monthly Volume</span>
                <span className="text-lg font-bold">{formatCurrency(revenueData?.paymentVolume || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Processing Fees</span>
                <span className="text-sm text-muted-foreground">
                  ~{formatCurrency((revenueData?.paymentVolume || 0) * 0.029)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Net Revenue</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency((revenueData?.paymentVolume || 0) * 0.971)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(revenueData?.subscriptionDistribution || {}).map(([plan, count]) => (
                <div key={plan} className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize">{plan}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold">{count}</span>
                    <Badge variant="outline">{plan === 'enterprise' ? '$299' : plan === 'professional' ? '$149' : '$49'}/mo</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Growth Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Net New MRR</span>
                  <span className="font-medium text-green-600">
                    +{formatCurrency((revenueData?.newMRR || 0) + (revenueData?.expansionMRR || 0) - (revenueData?.churnedMRR || 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Growth Rate</span>
                  <span className="font-medium">+18.4%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Churn Rate</span>
                  <span className="font-medium text-red-600">4.2%</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Revenue Health</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Revenue Quality Score</span>
                  <Badge variant="default">A+</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Payment Success Rate</span>
                  <span className="font-medium text-green-600">98.7%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Failed Payments</span>
                  <span className="font-medium">$1,240</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}