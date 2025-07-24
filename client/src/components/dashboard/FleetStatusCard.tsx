import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, AlertTriangle, CheckCircle, Wrench } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface FleetData {
  trucksActive: number;
  trucksDown: number;
  trucksTotal: number;
  avgEfficiency: number;
  maintenanceAlerts: number;
}

const FleetStatusCard: React.FC = () => {
  const { data: fleetData, isLoading } = useQuery({
    queryKey: ['/api/dashboard/fleet'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Fleet Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  const fleet: FleetData = fleetData || {
    trucksActive: 0,
    trucksDown: 0,
    trucksTotal: 0,
    avgEfficiency: 0,
    maintenanceAlerts: 0
  };

  const availabilityRate = fleet.trucksTotal > 0 
    ? Math.round((fleet.trucksActive / fleet.trucksTotal) * 100) 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Fleet Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Active Trucks</span>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="font-semibold">{fleet.trucksActive}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Down for Maintenance</span>
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-orange-500" />
            <span className="font-semibold">{fleet.trucksDown}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Availability Rate</span>
          <Badge variant={availabilityRate >= 90 ? "default" : availabilityRate >= 75 ? "secondary" : "destructive"}>
            {availabilityRate}%
          </Badge>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Avg Efficiency</span>
          <span className="font-semibold">{fleet.avgEfficiency.toFixed(1)} MPG</span>
        </div>

        {fleet.maintenanceAlerts > 0 && (
          <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-orange-700">
              {fleet.maintenanceAlerts} maintenance alert{fleet.maintenanceAlerts > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FleetStatusCard;