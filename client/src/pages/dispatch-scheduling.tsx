import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { Calendar, Clock, MapPin, Truck, User, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ScheduledLoad {
  id: string;
  loadNumber: string;
  customerName: string;
  pickupLocation: string;
  deliveryLocation: string;
  appointmentTime: string; // ISO datetime string
  duration: number; // Duration in hours
  assignedDriverId?: string;
  assignedTruckId?: string;
  status: 'scheduled' | 'dispatched' | 'in_transit' | 'delivered';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface Driver {
  id: string;
  name: string;
  status: 'available' | 'on_duty' | 'driving' | 'off_duty';
  currentLocation?: string;
}

interface CalendarSlot {
  hour: number;
  loads: ScheduledLoad[];
}

export default function DispatchScheduling() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [draggedLoad, setDraggedLoad] = useState<ScheduledLoad | null>(null);

  const { data: loads = [], isLoading: loadsLoading } = useQuery<ScheduledLoad[]>({
    queryKey: ['/api/loads/scheduled', selectedDate],
  });

  const { data: drivers = [] } = useQuery<Driver[]>({
    queryKey: ['/api/drivers'],
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
    return loads.filter(load => {
      if (load.assignedDriverId !== driverId) return false;
      const loadHour = new Date(load.appointmentTime).getHours();
      return loadHour === hour;
    });
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, load: ScheduledLoad) => {
    setDraggedLoad(load);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent, targetDriverId: string, targetHour: number) => {
    e.preventDefault();
    if (!draggedLoad) return;

    const targetDate = new Date(selectedDate);
    targetDate.setHours(targetHour, 0, 0, 0);

    // Update load with new time and driver assignment
    updateSchedule.mutate({
      loadId: draggedLoad.id,
      updates: {
        appointmentTime: targetDate.toISOString(),
        assignedDriverId: targetDriverId
      }
    });

    setDraggedLoad(null);
  }, [draggedLoad, selectedDate]);

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const updateSchedule = useMutation({
    mutationFn: async (data: { loadId: string; updates: Partial<ScheduledLoad> }) => {
      const response = await apiRequest("PATCH", `/api/loads/${data.loadId}/schedule`, data.updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Schedule Updated",
        description: "Load appointment time updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/loads/scheduled'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update schedule",
        variant: "destructive",
      });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-4 border-red-500 bg-red-50';
      case 'high': return 'border-l-4 border-orange-500 bg-orange-50';
      case 'medium': return 'border-l-4 border-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-4 border-green-500 bg-green-50';
      default: return 'border-l-4 border-gray-500 bg-gray-50';
    }
  };

  // Navigate to previous/next day
  const navigateDay = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  if (loadsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Schedule</h1>
          <p className="text-gray-600">Drag and drop loads to reschedule appointments</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button onClick={() => navigateDay('prev')} variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-center">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
            <p className="text-sm text-gray-500 mt-1">
              {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <Button onClick={() => navigateDay('next')} variant="outline" size="sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="min-w-max">
          {/* Time Header */}
          <div className="flex bg-white border-b sticky top-0 z-10">
            <div className="w-48 p-4 border-r bg-gray-50">
              <h3 className="font-medium text-gray-900">Driver</h3>
            </div>
            {timeSlots.map((hour) => (
              <div key={hour} className="w-32 p-2 border-r text-center">
                <div className="text-sm font-medium text-gray-700">
                  {formatHour(hour)}
                </div>
              </div>
            ))}
          </div>

          {/* Driver Rows */}
          {drivers.map((driver) => (
            <div key={driver.id} className="flex border-b bg-white hover:bg-gray-50">
              {/* Driver Info */}
              <div className="w-48 p-4 border-r bg-gray-50">
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
              </div>

              {/* Time Slots */}
              {timeSlots.map((hour) => {
                const slotsLoads = getLoadsForDriverAndTime(driver.id, hour);
                return (
                  <div
                    key={`${driver.id}-${hour}`}
                    className="w-32 min-h-16 border-r border-gray-200 p-1"
                    onDrop={(e) => handleDrop(e, driver.id, hour)}
                    onDragOver={handleDragOver}
                  >
                    {slotsLoads.map((load) => (
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
                          {load.pickupLocation.split(',')[0]} → {load.deliveryLocation.split(',')[0]}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Empty State */}
          {drivers.length === 0 && (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No drivers available</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="border-t bg-white p-4">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            Total Loads: {loads.length} | 
            Scheduled: {loads.filter(l => l.status === 'scheduled').length} |
            Urgent: {loads.filter(l => l.priority === 'urgent').length}
          </div>
          <div>
            Drivers: {drivers.length} | 
            Available: {drivers.filter(d => d.status === 'available').length}
          </div>
        </div>
      </div>
    </div>
  );
}