import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  MapPin, 
  Navigation, 
  Zap, 
  Clock,
  RefreshCw,
  Maximize2,
  Minimize2
} from "lucide-react";

// Google Maps API types
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface Vehicle {
  id: string;
  name: string;
  driver: string;
  status: 'moving' | 'stopped' | 'idle' | 'offline';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  speed: number;
  heading: number;
  lastUpdate: string;
  fuel?: number;
  mileage?: number;
}

interface LiveMapProps {
  vehicles: Vehicle[];
  height?: string;
  showControls?: boolean;
  selectedVehicle?: string;
  onVehicleSelect?: (vehicleId: string) => void;
}

export default function LiveMap({ 
  vehicles, 
  height = "400px", 
  showControls = true,
  selectedVehicle,
  onVehicleSelect
}: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedVehicleData, setSelectedVehicleData] = useState<Vehicle | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const loadingAttempted = useRef(false);

  // Display only real vehicles - no mock data
  const displayVehicles = useMemo(() => {
    return vehicles;
  }, [vehicles]);

  useEffect(() => {
    if (!loadingAttempted.current) {
      loadingAttempted.current = true;
      loadGoogleMaps();
    }
  }, []);

  useEffect(() => {
    if (isGoogleMapsLoaded && mapRef.current && !mapError) {
      const timer = setTimeout(() => {
        initializeGoogleMap();
      }, 100); // Small delay to ensure DOM is ready
      return () => clearTimeout(timer);
    }
  }, [isGoogleMapsLoaded, mapError]);

  // Stable reference to update markers without dependencies causing infinite loops
  const updateVehicleMarkersRef = useRef<() => void>();
  
  updateVehicleMarkersRef.current = () => {
    if (!mapInstance || !window.google || !window.google.maps) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    
    const newMarkers: any[] = [];

    displayVehicles.forEach((vehicle) => {
      const position = { lat: vehicle.location.lat, lng: vehicle.location.lng };
      
      // Create custom marker icon based on vehicle status
      const statusColor = getMarkerColor(vehicle.status);
      const icon = {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: statusColor,
        fillOpacity: 0.8,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      };

      const marker = new window.google.maps.Marker({
        position: position,
        map: mapInstance,
        title: vehicle.name,
        icon: icon,
        animation: vehicle.status === 'moving' ? window.google.maps.Animation.BOUNCE : null,
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    // Fit map bounds to show all vehicles
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach(marker => bounds.extend(marker.getPosition()));
      mapInstance.fitBounds(bounds);
      
      // Don't zoom in too much for single markers
      if (newMarkers.length === 1) {
        mapInstance.setZoom(12);
      }
    }
  };

  const updateVehicleMarkers = useCallback(() => {
    updateVehicleMarkersRef.current?.();
  }, []);

  useEffect(() => {
    if (mapInstance && window.google && window.google.maps && displayVehicles.length > 0) {
      updateVehicleMarkers();
    }
  }, [mapInstance, displayVehicles, updateVehicleMarkers]);

  const loadGoogleMaps = () => {
    // Check if already loaded
    if (window.google && window.google.maps && window.google.maps.Map) {
      setIsGoogleMapsLoaded(true);
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setMapError('Google Maps API key not configured');
      return;
    }

    // Avoid duplicate script loading
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=3.55`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      // Wait for Google Maps to be fully available
      if (window.google && window.google.maps) {
        setIsGoogleMapsLoaded(true);
        setMapError(null);
      } else {
        setMapError('Google Maps failed to initialize');
      }
    };
    
    script.onerror = () => {
      setMapError('Failed to load Google Maps API');
    };
    
    document.head.appendChild(script);
  };

  const initializeGoogleMap = () => {
    if (!mapRef.current || !window.google || !window.google.maps || !window.google.maps.Map) {
      console.error('Google Maps not properly loaded');
      return;
    }

    try {
      // Center map on US (approximate center)
      const center = { lat: 39.8283, lng: -98.5795 };
      
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 5,
        center: center,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "all",
            elementType: "labels",
            stylers: [{ visibility: "on" }]
          }
        ],
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
      });

      setMapInstance(map);
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
      // Show error message to user
      if (mapRef.current) {
        mapRef.current.innerHTML = `
          <div class="flex items-center justify-center h-full bg-red-50 border border-red-200 rounded-lg">
            <div class="text-center p-8">
              <div class="text-red-600 mb-4">
                <svg class="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-red-800 mb-2">Map Loading Error</h3>
              <p class="text-red-600 text-sm">Google Maps failed to initialize properly</p>
            </div>
          </div>
        `;
      }
    }
  };

  // Helper functions for map markers

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'moving': return '#4CAF50';
      case 'stopped': return '#F44336';
      case 'idle': return '#FF9800';
      case 'offline': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'moving': return 'bg-green-500';
      case 'stopped': return 'bg-red-500';
      case 'idle': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'moving': return 'Moving';
      case 'stopped': return 'Stopped';
      case 'idle': return 'Idle';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'relative'}`}>
      <Card className={isFullscreen ? 'h-full border-0 rounded-none' : ''}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Live Fleet Tracking
            </CardTitle>
            {showControls && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateVehicleMarkers()}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
          
          {/* Vehicle Status Legend */}
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Moving</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Stopped</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Idle</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span>Offline</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* Map Area */}
            <div className="lg:col-span-2">
              {mapError ? (
                <div 
                  style={{ height: isFullscreen ? 'calc(100vh - 200px)' : height }}
                  className="w-full border-l border-r flex items-center justify-center bg-red-50 border border-red-200"
                >
                  <div className="text-center p-8">
                    <div className="text-red-600 mb-4">
                      <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Map Loading Error</h3>
                    <p className="text-red-600 text-sm mb-2">{mapError}</p>
                    <button 
                      onClick={() => {
                        setMapError(null);
                        setIsGoogleMapsLoaded(false);
                        loadingAttempted.current = false;
                        loadGoogleMaps();
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      Retry Loading
                    </button>
                  </div>
                </div>
              ) : !isGoogleMapsLoaded ? (
                <div 
                  style={{ height: isFullscreen ? 'calc(100vh - 200px)' : height }}
                  className="w-full border-l border-r flex items-center justify-center bg-gray-100"
                >
                  <div className="text-center p-8">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600 mb-2">Loading Google Maps...</p>
                    <p className="text-xs text-gray-500">Initializing map interface</p>
                  </div>
                </div>
              ) : (
                <div
                  ref={mapRef}
                  style={{ height: isFullscreen ? 'calc(100vh - 200px)' : height }}
                  className="w-full border-l border-r"
                />
              )}
            </div>

            {/* Vehicle Details Panel */}
            <div className="border-l bg-gray-50 p-4 overflow-y-auto" style={{ height: isFullscreen ? 'calc(100vh - 200px)' : height }}>
              <h3 className="font-semibold mb-4">Fleet Status</h3>
              
              <div className="space-y-3">
                {displayVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedVehicle === vehicle.id
                        ? 'bg-blue-100 border border-blue-300'
                        : 'bg-white border border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedVehicleData(vehicle);
                      onVehicleSelect?.(vehicle.id);
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-gray-600" />
                        <span className="font-medium text-sm">{vehicle.name}</span>
                      </div>
                      <Badge 
                        variant="secondary"
                        className={`text-xs ${getStatusColor(vehicle.status)} text-white border-0`}
                      >
                        {getStatusText(vehicle.status)}
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{vehicle.location.address}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        <span>{vehicle.speed} mph</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(vehicle.lastUpdate).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {vehicle.fuel !== undefined && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Fuel</span>
                          <span>{vehicle.fuel}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              vehicle.fuel > 50 ? 'bg-green-500' : 
                              vehicle.fuel > 25 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${vehicle.fuel}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}