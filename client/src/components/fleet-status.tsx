import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { TruckingLoadingSkeleton } from "@/components/trucking-loading-skeleton";

export function FleetStatus() {
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["/api/vehicles"],
  });

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Fleet Status</CardTitle>
        </CardHeader>
        <CardContent>
          <TruckingLoadingSkeleton variant="fleet" />
        </CardContent>
      </Card>
    );
  }

  const activeVehicles = vehicles?.filter((v: any) => v.status === 'in_use' || v.status === 'available') || [];
  const maintenanceVehicles = vehicles?.filter((v: any) => v.status === 'maintenance') || [];
  const totalVehicles = vehicles?.length || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
      case 'in_use':
        return 'bg-green-500';
      case 'maintenance':
        return 'bg-yellow-500';
      case 'out_of_service':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle>Fleet Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {activeVehicles.length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {maintenanceVehicles.length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Maintenance</p>
          </div>
        </div>

        {totalVehicles === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No vehicles found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {vehicles?.slice(0, 5).map((vehicle: any) => (
              <div
                key={vehicle.id}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 ${getStatusColor(vehicle.status)} rounded-full`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {vehicle.vehicleNumber || `Vehicle-${vehicle.id}`}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {vehicle.currentLocation || 'Location not available'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Next: {vehicle.nextMaintenanceMileage ? `${vehicle.nextMaintenanceMileage.toLocaleString()} mi` : 'Not scheduled'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
