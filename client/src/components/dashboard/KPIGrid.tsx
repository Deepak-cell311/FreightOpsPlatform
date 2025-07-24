import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Truck, DollarSign, MapPin } from 'lucide-react';

interface KPIData {
  totalRevenue: number;
  activeLoads: number;
  totalMiles: number;
  dispatchCount: number;
  revenueChange: number;
  loadsChange: number;
  milesChange: number;
  dispatchChange: number;
}

interface KPIGridProps {
  data?: KPIData;
}

const KPIGrid: React.FC<KPIGridProps> = ({ data }) => {
  const kpis = [
    {
      title: 'Total Revenue',
      value: data?.totalRevenue ? `$${data.totalRevenue.toLocaleString()}` : '$0',
      change: data?.revenueChange || 0,
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Active Loads',
      value: data?.activeLoads?.toString() || '0',
      change: data?.loadsChange || 0,
      icon: Truck,
      color: 'text-blue-600',
    },
    {
      title: 'Total Miles',
      value: data?.totalMiles ? data.totalMiles.toLocaleString() : '0',
      change: data?.milesChange || 0,
      icon: MapPin,
      color: 'text-purple-600',
    },
    {
      title: 'Dispatches',
      value: data?.dispatchCount?.toString() || '0',
      change: data?.dispatchChange || 0,
      icon: TrendingUp,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <Icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className={`text-xs ${kpi.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {kpi.change >= 0 ? '+' : ''}{kpi.change}% from last month
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default KPIGrid;