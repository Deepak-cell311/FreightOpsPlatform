import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TruckingLoadingSkeleton } from "@/components/trucking-loading-skeleton";
import { Truck, User, AlertTriangle, CheckCircle, Clock, MapPin, Package, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest } from '@/lib/queryClient';

export default function Dispatch() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [draggedLoad, setDraggedLoad] = useState<any>(null);

  // Fetch data for dispatch overview
  const { data: loads = [] } = useQuery({
    queryKey: ["/api/loads"],
    enabled: !!user,
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ["/api/drivers"],
    enabled: !!user,
  });

  const { data: trucks = [] } = useQuery({
    queryKey: ["/api/trucks"],
    enabled: !!user,
  });

  const { data: scheduledLoads = [] } = useQuery({
    queryKey: ['/api/loads/scheduled', selectedDate],
    queryFn: () => fetch(`/api/loads/scheduled?date=${selectedDate}`).then(res => res.json()),
    enabled: !!user,
  });

  // Generate hourly time slots from 6 AM to 10 PM
  const timeSlots = Array.from({ length: 16 }, (_, i) => 6 + i);

  // Format hour for display
  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  // Get loads for specific driver and time slot
  const getLoadsForDriverAndTime = (driverId: string, hour: number) => {
    return (scheduledLoads as any[])?.filter((load: any) => {
      if (load.assignedDriverId !== driverId) return false;
      if (!load.scheduledTime) return false;
      
      const loadHour = new Date(load.scheduledTime).getHours();
      return loadHour === hour;
    }) || [];
  };

  // Priority color mapping
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, load: any) => {
    setDraggedLoad(load);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, driverId: string, hour: number) => {
    e.preventDefault();
    
    if (!draggedLoad) return;

    const newScheduledTime = new Date(selectedDate);
    newScheduledTime.setHours(hour, 0, 0, 0);

    try {
      await apiRequest('PUT', `/api/loads/${draggedLoad.id}/schedule`, {
        assignedDriverId: driverId,
        scheduledTime: newScheduledTime.toISOString()
      });

      queryClient.invalidateQueries({ queryKey: ['/api/loads/scheduled'] });
      
      toast({
        title: "Load Rescheduled",
        description: `Load ${draggedLoad.loadNumber} scheduled for ${formatHour(hour)}`
      });
    } catch (error) {
      toast({
        title: "Scheduling Failed",
        description: "Unable to reschedule load",
        variant: "destructive"
      });
    }

    setDraggedLoad(null);
  };

  // Loading state
  if (authLoading) {
    return <TruckingLoadingSkeleton variant="dashboard" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the dispatch system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full bg-gray-50">
      <div className="w-full max-w-full p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dispatch Center</h1>
          <p className="text-gray-600 mt-2">Daily load scheduling and driver management</p>
        </div>

        {/* Date Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const prevDate = new Date(selectedDate);
                prevDate.setDate(prevDate.getDate() - 1);
                setSelectedDate(prevDate.toISOString().split('T')[0]);
              }}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const nextDate = new Date(selectedDate);
                nextDate.setDate(nextDate.getDate() + 1);
                setSelectedDate(nextDate.toISOString().split('T')[0]);
              }}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}>
            Today
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Loads</p>
                  <p className="text-2xl font-bold text-gray-900">{(loads as any[])?.length || 0}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Scheduled Today</p>
                  <p className="text-2xl font-bold text-green-600">{(scheduledLoads as any[])?.length || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Urgent Loads</p>
                  <p className="text-2xl font-bold text-red-600">
                    {(scheduledLoads as any[])?.filter((l: any) => l.priority === 'urgent')?.length || 0}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Drivers</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {(drivers as any[])?.filter((d: any) => d.status === 'available')?.length || 0}
                  </p>
                </div>
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Trucks</p>
                  <p className="text-2xl font-bold text-green-600">
                    {(trucks as any[])?.filter((t: any) => t.status === 'available')?.length || 0}
                  </p>
                </div>
                <Truck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Schedule */}
        <Card>
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto bg-gray-50" style={{ minHeight: '500px' }}>
              <table className="w-full border-collapse table-fixed" style={{ minWidth: '1200px' }}>
                {/* Time Header */}
                <thead>
                  <tr className="bg-white border-b sticky top-0 z-10">
                    <th className="w-48 p-4 border-r bg-gray-50 text-left font-medium text-gray-900">
                      Driver
                    </th>
                    {timeSlots.map((hour) => (
                      <th key={hour} className="w-32 p-2 border-r text-center bg-white font-medium text-gray-700">
                        {formatHour(hour)}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {/* Driver Rows */}
                  {(drivers as any[])?.map((driver: any) => (
                    <tr key={driver.id} className="border-b bg-white hover:bg-gray-50">
                      {/* Driver Info */}
                      <td className="w-48 p-4 border-r bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{driver.name}</h4>
                            <p className="text-sm text-gray-500">{driver.status}</p>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${
                            driver.status === 'available' ? 'bg-green-400' :
                            driver.status === 'on_duty' ? 'bg-blue-400' :
                            driver.status === 'driving' ? 'bg-yellow-400' : 'bg-gray-400'
                          }`} />
                        </div>
                      </td>

                      {/* Time Slots */}
                      {timeSlots.map((hour) => {
                        const slotLoads = getLoadsForDriverAndTime(driver.id, hour);
                        return (
                          <td
                            key={`${driver.id}-${hour}`}
                            className="w-32 border-r border-gray-200 p-1 align-top"
                            style={{ minHeight: '64px' }}
                            onDrop={(e) => handleDrop(e, driver.id, hour)}
                            onDragOver={handleDragOver}
                          >
                            {slotLoads.map((load: any) => (
                              <div
                                key={load.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, load)}
                                className={`
                                  p-2 rounded text-xs cursor-move mb-1 shadow-sm hover:shadow-md transition-shadow
                                  ${getPriorityColor(load.priority)}
                                `}
                              >
                                <div className="font-medium truncate">{load.loadNumber}</div>
                                <div className="text-gray-600 truncate">{load.customerName}</div>
                                <div className="text-gray-500 truncate text-xs">
                                  {load.pickupLocation?.split(',')[0]} → {load.deliveryLocation?.split(',')[0]}
                                </div>
                              </div>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Empty State */}
              {(!drivers || (drivers as any[]).length === 0) && (
                <div className="text-center py-12">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No drivers available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer Stats */}
        <div className="mt-6 bg-white rounded-lg border p-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              Total Loads: {(scheduledLoads as any[])?.length || 0} | 
              Scheduled: {(scheduledLoads as any[])?.filter((l: any) => l.status === 'scheduled')?.length || 0} |
              Urgent: {(scheduledLoads as any[])?.filter((l: any) => l.priority === 'urgent')?.length || 0}
            </div>
            <div>
              Drivers: {(drivers as any[])?.length || 0} | 
              Available: {(drivers as any[])?.filter((d: any) => d.status === 'available')?.length || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}