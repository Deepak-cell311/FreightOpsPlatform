import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { MapPin, Navigation, Clock, CheckCircle, AlertTriangle, Phone, Truck, User, Target } from 'lucide-react';

interface GeolocationData {
  id: string;
  loadId: string;
  driverId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  accuracy: number;
  speed?: number;
  heading?: number;
  address?: string;
  distanceToDestination?: number;
  estimatedArrival?: Date;
  status: 'en_route' | 'at_pickup' | 'at_delivery' | 'completed' | 'delayed';
}

interface HandoffEvent {
  id: string;
  loadId: string;
  driverId: string;
  location: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  type: 'pickup_arrival' | 'pickup_completed' | 'delivery_arrival' | 'delivery_completed' | 'checkpoint';
  notes?: string;
  signatureRequired: boolean;
  signatureUrl?: string;
  contactPerson?: string;
  contactPhone?: string;
}

interface GeofenceZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  type: 'pickup' | 'delivery' | 'checkpoint' | 'rest_area' | 'fuel_stop';
  active: boolean;
}

export function GeolocationTracking({ loadId }: { loadId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isTracking, setIsTracking] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<GeolocationPosition | null>(null);
  const watchId = useRef<number | null>(null);
  const [geofences, setGeofences] = useState<GeofenceZone[]>([]);

  // Fetch current tracking data
  const { data: trackingData = [], isLoading } = useQuery<GeolocationData[]>({
    queryKey: ['/api/tracking/geolocation', loadId],
    refetchInterval: 30000, // Update every 30 seconds
  });

  // Fetch handoff events
  const { data: handoffEvents = [] } = useQuery<HandoffEvent[]>({
    queryKey: ['/api/tracking/handoffs', loadId],
    refetchInterval: 15000, // Update every 15 seconds
  });

  // Start geolocation tracking
  const startTrackingMutation = useMutation({
    mutationFn: async (position: GeolocationPosition) => {
      const response = await apiRequest('POST', '/api/tracking/update-location', {
        loadId,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        speed: position.coords.speed,
        heading: position.coords.heading,
        timestamp: new Date().toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tracking/geolocation', loadId] });
    },
    onError: (error) => {
      toast({
        title: "Location Update Failed",
        description: "Unable to update location. Check connection.",
        variant: "destructive",
      });
    },
  });

  // Create handoff event
  const createHandoffMutation = useMutation({
    mutationFn: async (handoffData: Partial<HandoffEvent>) => {
      const response = await apiRequest('POST', '/api/tracking/create-handoff', handoffData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tracking/handoffs', loadId] });
      toast({
        title: "Handoff Event Created",
        description: "Location handoff recorded successfully.",
      });
    },
  });

  // Start geolocation tracking
  const startTracking = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your device doesn't support location tracking.",
        variant: "destructive",
      });
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000, // Use cached location if less than 30 seconds old
    };

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentPosition(position);
        startTrackingMutation.mutate(position);
        checkGeofences(position);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          title: "Location Error",
          description: `Unable to get location: ${error.message}`,
          variant: "destructive",
        });
      },
      options
    );

    setIsTracking(true);
    toast({
      title: "Tracking Started",
      description: "Real-time location tracking is now active.",
    });
  };

  // Stop tracking
  const stopTracking = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setIsTracking(false);
    toast({
      title: "Tracking Stopped",
      description: "Location tracking has been disabled.",
    });
  };

  // Check if current position is within any geofences
  const checkGeofences = (position: GeolocationPosition) => {
    geofences.forEach((geofence) => {
      const distance = calculateDistance(
        position.coords.latitude,
        position.coords.longitude,
        geofence.latitude,
        geofence.longitude
      );

      if (distance <= geofence.radius && geofence.active) {
        // Driver entered geofence - create automatic handoff event
        createHandoffMutation.mutate({
          loadId,
          driverId: 'current', // This would come from authentication context
          location: geofence.name,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date(),
          type: geofence.type === 'pickup' ? 'pickup_arrival' : 'delivery_arrival',
          signatureRequired: true,
        });
      }
    });
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  // Format distance for display
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  // Manual handoff creation
  const createManualHandoff = (type: HandoffEvent['type']) => {
    if (!currentPosition) {
      toast({
        title: "Location Required",
        description: "Enable location tracking to create handoff events.",
        variant: "destructive",
      });
      return;
    }

    createHandoffMutation.mutate({
      loadId,
      driverId: 'current',
      location: 'Manual Location',
      latitude: currentPosition.coords.latitude,
      longitude: currentPosition.coords.longitude,
      timestamp: new Date(),
      type,
      signatureRequired: true,
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'at_pickup': case 'at_delivery': return 'bg-blue-100 text-blue-800';
      case 'en_route': return 'bg-yellow-100 text-yellow-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHandoffIcon = (type: string) => {
    switch (type) {
      case 'pickup_arrival': case 'pickup_completed': return <Target className="h-4 w-4 text-green-600" />;
      case 'delivery_arrival': case 'delivery_completed': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'checkpoint': return <MapPin className="h-4 w-4 text-yellow-600" />;
      default: return <Navigation className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tracking Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Geolocation Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={isTracking ? "default" : "secondary"}>
                  {isTracking ? "Active" : "Inactive"}
                </Badge>
              </div>
              {currentPosition && (
                <div className="text-sm text-gray-600">
                  Last update: {new Date().toLocaleTimeString()}
                  <br />
                  Accuracy: {currentPosition.coords.accuracy.toFixed(0)}m
                  {currentPosition.coords.speed && (
                    <span> • Speed: {(currentPosition.coords.speed * 2.237).toFixed(1)} mph</span>
                  )}
                </div>
              )}
            </div>
            <div className="space-x-2">
              {!isTracking ? (
                <Button onClick={startTracking} className="bg-green-600 hover:bg-green-700">
                  <Navigation className="h-4 w-4 mr-2" />
                  Start Tracking
                </Button>
              ) : (
                <Button onClick={stopTracking} variant="outline">
                  Stop Tracking
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Location Info */}
      {currentPosition && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Current Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium">Coordinates:</span>
                <br />
                <span className="text-sm text-gray-600">
                  {currentPosition.coords.latitude.toFixed(6)}, {currentPosition.coords.longitude.toFixed(6)}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium">Accuracy:</span>
                <br />
                <span className="text-sm text-gray-600">
                  ±{currentPosition.coords.accuracy.toFixed(0)} meters
                </span>
              </div>
            </div>
            
            {/* Manual Handoff Buttons */}
            <div className="mt-4 space-x-2">
              <Button 
                size="sm" 
                onClick={() => createManualHandoff('pickup_arrival')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Target className="h-3 w-3 mr-1" />
                Arrived at Pickup
              </Button>
              <Button 
                size="sm" 
                onClick={() => createManualHandoff('pickup_completed')}
                className="bg-green-700 hover:bg-green-800"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Pickup Complete
              </Button>
              <Button 
                size="sm" 
                onClick={() => createManualHandoff('delivery_arrival')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Target className="h-3 w-3 mr-1" />
                Arrived at Delivery
              </Button>
              <Button 
                size="sm" 
                onClick={() => createManualHandoff('delivery_completed')}
                className="bg-blue-700 hover:bg-blue-800"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Delivery Complete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Tracking Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Location History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading tracking data...</div>
          ) : trackingData.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No tracking data available</div>
          ) : (
            <div className="space-y-3">
              {trackingData.slice(0, 5).map((data) => (
                <div key={data.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Navigation className="h-4 w-4 text-gray-600" />
                    <div>
                      <div className="text-sm font-medium">
                        {data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(data.timestamp).toLocaleString()}
                        {data.speed && ` • ${(data.speed * 2.237).toFixed(1)} mph`}
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(data.status)}>
                    {data.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Handoff Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Load Handoff Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {handoffEvents.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No handoff events recorded</div>
          ) : (
            <div className="space-y-3">
              {handoffEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getHandoffIcon(event.type)}
                    <div>
                      <div className="text-sm font-medium">
                        {event.type.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {event.location} • {new Date(event.timestamp).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
                      </div>
                      {event.contactPerson && (
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <User className="h-3 w-3" />
                          {event.contactPerson}
                          {event.contactPhone && (
                            <>
                              <Phone className="h-3 w-3 ml-2" />
                              {event.contactPhone}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={event.signatureRequired ? "default" : "secondary"}>
                      {event.signatureRequired ? "Signature Required" : "Confirmed"}
                    </Badge>
                    {event.signatureUrl && (
                      <div className="text-xs text-blue-600 mt-1">
                        <a href={event.signatureUrl} target="_blank" rel="noopener noreferrer">
                          View Signature
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Geofence Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Geofence Zones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 mb-4">
            Automatic handoff detection when drivers enter designated zones
          </div>
          {geofences.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No geofence zones configured for this load
            </div>
          ) : (
            <div className="space-y-2">
              {geofences.map((geofence) => (
                <div key={geofence.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Target className="h-4 w-4 text-gray-600" />
                    <div>
                      <div className="text-sm font-medium">{geofence.name}</div>
                      <div className="text-xs text-gray-500">
                        Radius: {formatDistance(geofence.radius)} • Type: {geofence.type}
                      </div>
                    </div>
                  </div>
                  <Badge variant={geofence.active ? "default" : "secondary"}>
                    {geofence.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default GeolocationTracking;