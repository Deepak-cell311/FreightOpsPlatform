import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User, Clock, Shield, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DriverData {
  totalDrivers: number;
  availableDrivers: number;
  onDutyDrivers: number;
  avgHoursRemaining: number;
  safetyScore: number;
  hosViolations: number;
}

const DriverUtilization: React.FC = () => {
  const { data: driverData, isLoading } = useQuery({
    queryKey: ['/api/dashboard/drivers'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Driver Utilization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  const drivers: DriverData = driverData || {
    totalDrivers: 0,
    availableDrivers: 0,
    onDutyDrivers: 0,
    avgHoursRemaining: 0,
    safetyScore: 0,
    hosViolations: 0
  };

  const utilizationRate = drivers.totalDrivers > 0 
    ? Math.round((drivers.onDutyDrivers / drivers.totalDrivers) * 100) 
    : 0;

  const availabilityRate = drivers.totalDrivers > 0 
    ? Math.round((drivers.availableDrivers / drivers.totalDrivers) * 100) 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Driver Utilization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">On Duty</span>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="font-semibold">{drivers.onDutyDrivers}/{drivers.totalDrivers}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Utilization Rate</span>
            <span className="text-sm font-medium">{utilizationRate}%</span>
          </div>
          <Progress value={utilizationRate} className="h-2" />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Available Drivers</span>
          <Badge variant={availabilityRate >= 50 ? "default" : "secondary"}>
            {drivers.availableDrivers} ({availabilityRate}%)
          </Badge>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Avg Hours Remaining</span>
          <span className="font-semibold">{drivers.avgHoursRemaining.toFixed(1)}h</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Safety Score</span>
          <div className="flex items-center gap-2">
            <Shield className={`h-4 w-4 ${drivers.safetyScore >= 90 ? 'text-green-500' : drivers.safetyScore >= 75 ? 'text-yellow-500' : 'text-red-500'}`} />
            <span className="font-semibold">{drivers.safetyScore}%</span>
          </div>
        </div>

        {drivers.hosViolations > 0 && (
          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">
              {drivers.hosViolations} HOS violation{drivers.hosViolations > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DriverUtilization;