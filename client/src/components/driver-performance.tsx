import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

export function DriverPerformance() {
  const { data: drivers, isLoading } = useQuery({
    queryKey: ["/api/drivers"],
  });

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Top Performing Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sample top performers (in real app, would sort by performance metrics)
  const topDrivers = drivers?.slice(0, 3) || [];

  return (
    <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle>Top Performing Drivers</CardTitle>
      </CardHeader>
      <CardContent>
        {topDrivers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No drivers found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topDrivers.map((driver: any, index: number) => (
              <div
                key={driver.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={`https://images.unsplash.com/photo-150700321116${index + 9}-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400`}
                    alt="Driver"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {driver.firstName} {driver.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {driver.totalLoads || 0} loads completed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {driver.rating ? parseFloat(driver.rating).toFixed(1) : '4.8'}★
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {driver.onTimePercentage ? parseFloat(driver.onTimePercentage).toFixed(0) : '95'}% on-time
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
