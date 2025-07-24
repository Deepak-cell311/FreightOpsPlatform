import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { BarChart, Activity, TrendingUp, Users } from 'lucide-react';

interface FeatureUsageData {
  tenantId: string;
  tenantName: string;
  featureName: string;
  usageCount: number;
  limit: number;
  billingPeriod: string;
  lastUsed: string;
  trend: 'up' | 'down' | 'stable';
}

interface FeatureSummary {
  featureName: string;
  totalUsage: number;
  totalTenants: number;
  averageUsage: number;
  popularityScore: number;
}

export function FeatureUsage() {
  const [featureData, setFeatureData] = useState<FeatureUsageData[]>([]);
  const [featureSummary, setFeatureSummary] = useState<FeatureSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<string>('all');

  useEffect(() => {
    fetchFeatureUsage();
  }, []);

  const fetchFeatureUsage = async () => {
    try {
      const response = await fetch('/api/hq/features');
      if (response.ok) {
        const data = await response.json();
        setFeatureData(data.usage || []);
        setFeatureSummary(data.summary || []);
      } else {
        console.error('Failed to fetch feature usage data:', response.status);
        setFeatureData([]);
        setFeatureSummary([]);
      }
    } catch (error) {
      console.error('Error fetching feature usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = (usage: number, limit: number) => {
    return Math.min((usage / limit) * 100, 100);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getUsageBadge = (percentage: number) => {
    if (percentage >= 90) return <Badge variant="destructive">High</Badge>;
    if (percentage >= 70) return <Badge variant="secondary">Medium</Badge>;
    return <Badge variant="default">Low</Badge>;
  };

  const filteredData = selectedFeature === 'all' 
    ? featureData 
    : featureData.filter(item => item.featureName === selectedFeature);

  const uniqueFeatures = Array.from(new Set(featureData.map(item => item.featureName)));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feature Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Features</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueFeatures.length}</div>
            <p className="text-xs text-muted-foreground">Active features</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.from(new Set(featureData.map(item => item.tenantId))).length}
            </div>
            <p className="text-xs text-muted-foreground">Using features</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {featureData.reduce((sum, item) => sum + item.usageCount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Filter */}
      <div className="flex items-center space-x-2">
        <Button 
          variant={selectedFeature === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedFeature('all')}
          size="sm"
        >
          All Features
        </Button>
        {uniqueFeatures.map((feature) => (
          <Button
            key={feature}
            variant={selectedFeature === feature ? 'default' : 'outline'}
            onClick={() => setSelectedFeature(feature)}
            size="sm"
          >
            {feature}
          </Button>
        ))}
      </div>

      {/* Feature Usage Table */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Usage by Tenant</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredData.length === 0 ? (
            <div className="text-center py-8">
              <BarChart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No feature usage data found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Feature</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Limit</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead>Last Used</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item, index) => {
                  const percentage = getUsagePercentage(item.usageCount, item.limit);
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.tenantName}</TableCell>
                      <TableCell>{item.featureName}</TableCell>
                      <TableCell>{item.usageCount.toLocaleString()}</TableCell>
                      <TableCell>{item.limit.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={percentage} className="w-16" />
                          <span className="text-sm">{percentage.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{getUsageBadge(percentage)}</TableCell>
                      <TableCell>{getTrendIcon(item.trend)}</TableCell>
                      <TableCell>{new Date(item.lastUsed).toLocaleDateString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Feature Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Popularity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {featureSummary.map((feature) => (
              <div key={feature.featureName} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{feature.featureName}</h4>
                  <p className="text-sm text-gray-600">
                    {feature.totalTenants} tenants • {feature.totalUsage.toLocaleString()} total usage
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <Progress value={feature.popularityScore} className="w-20" />
                    <span className="text-sm font-medium">{feature.popularityScore}%</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Avg: {feature.averageUsage.toFixed(1)} per tenant
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}