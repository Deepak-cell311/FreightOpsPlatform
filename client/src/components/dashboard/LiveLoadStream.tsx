import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, MapPin, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadData {
  id: string;
  loadNumber: string;
  customerName: string;
  pickupLocation: string;
  deliveryLocation: string;
  status: string;
  driverName?: string;
  updatedAt: string;
}

const LiveLoadStream: React.FC = () => {
  const { data: loadsData, isLoading } = useQuery({
    queryKey: ['/api/dashboard/loads'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Load Stream
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const loads: LoadData[] = loadsData?.loads || [];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'in_progress':
        return 'bg-blue-500';
      case 'delivered':
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Live Load Stream
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          {loads.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent load activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {loads.map((load) => (
                <div key={load.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        Load #{load.loadNumber}
                      </div>
                      <div className="text-xs text-gray-600">
                        {load.customerName}
                      </div>
                    </div>
                    <Badge 
                      className={`${getStatusColor(load.status)} text-white text-xs`}
                    >
                      {formatStatus(load.status)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">
                        {load.pickupLocation} → {load.deliveryLocation}
                      </span>
                    </div>
                    
                    {load.driverName && (
                      <div className="flex items-center gap-1">
                        <span>Driver: {load.driverName}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(load.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LiveLoadStream;