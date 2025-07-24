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

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 border-red-300 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default: return 'bg-blue-100 border-blue-300 text-blue-800';
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

      queryClient.invalidateQueries({ queryKey: ['/api/loads/scheduled', selectedDate] });
      
      toast({
        title: "Load Scheduled",
        description: `${draggedLoad.loadNumber} assigned to driver for ${formatHour(hour)}`,
      });

    } catch (error) {
      toast({
        title: "Scheduling Failed",
        description: "Unable to schedule load",
        variant: "destructive",
      });
    }

    setDraggedLoad(null);
  };

  if (authLoading) {
    return <TruckingLoadingSkeleton variant="dispatch" />;
  }

  if (!isAuthenticated) {
    return <div>Please log in to access dispatch.</div>;
  }

  return (
    <div className="min-h-screen w-screen bg-gray-50 overflow-x-auto">
      <div className="w-full min-w-full p-6">
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
                className="w-auto"
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Loads</p>
                  <p className="text-2xl font-bold text-gray-900">{loads.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Scheduled Today</p>
                  <p className="text-2xl font-bold text-gray-900">{scheduledLoads.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <User className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Available Drivers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {drivers.filter((d: any) => d.status === 'available').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Active Trucks</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {trucks.filter((t: any) => t.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dispatch Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Dispatch Schedule - {new Date(selectedDate).toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="border-b">
                    <th className="w-24 text-left p-2 font-medium text-gray-700">Time</th>
                    {timeSlots.map(hour => (
                      <th key={hour} className="w-32 text-center p-2 font-medium text-gray-700">
                        {formatHour(hour)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((driver: any) => (
                    <tr key={driver.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium text-gray-800 bg-gray-100">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="truncate">{driver.name}</span>
                        </div>
                      </td>
                      {timeSlots.map(hour => {
                        const loadsForSlot = getLoadsForDriverAndTime(driver.id, hour);
                        return (
                          <td 
                            key={hour} 
                            className="p-1 border-l border-gray-200 h-16 align-top"
                            onDrop={(e) => handleDrop(e, driver.id, hour)}
                            onDragOver={handleDragOver}
                          >
                            <div className="h-full space-y-1">
                              {loadsForSlot.map((load: any) => (
                                <div
                                  key={load.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, load)}
                                  className={`p-1 rounded text-xs cursor-move border ${getPriorityColor(load.priority || 'normal')}`}
                                >
                                  <div className="font-medium truncate">{load.loadNumber}</div>
                                  <div className="text-xs truncate">{load.origin} → {load.destination}</div>
                                </div>
                              ))}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Unscheduled Loads */}
        {loads.filter((load: any) => !load.assignedDriverId || !load.scheduledTime).length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Unscheduled Loads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {loads
                  .filter((load: any) => !load.assignedDriverId || !load.scheduledTime)
                  .map((load: any) => (
                    <div 
                      key={load.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, load)}
                      className={`p-3 rounded-lg border cursor-move ${getPriorityColor(load.priority || 'normal')}`}
                    >
                      <div className="font-semibold">{load.loadNumber}</div>
                      <div className="text-sm mt-1">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {load.origin} → {load.destination}
                      </div>
                      <div className="text-xs mt-2 text-gray-600">
                        Due: {new Date(load.deliveryDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}