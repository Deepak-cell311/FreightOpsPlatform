import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

export function RecentLoads() {
  const { data: loads, isLoading } = useQuery({
    queryKey: ["/api/loads"],
  });

  if (isLoading) {
    return (
      <Card className="lg:col-span-2 shadow-sm border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Recent Loads</CardTitle>
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_transit':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'loading':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'delivered':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'assigned':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <Card className="lg:col-span-2 shadow-sm border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Loads</CardTitle>
          <Button variant="ghost" className="text-sm text-primary-600 hover:text-primary-700">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!loads || loads.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No loads found</p>
            <Button className="mt-4" variant="outline">
              Create First Load
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Load ID
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Origin
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loads.slice(0, 5).map((load: any) => (
                  <tr key={load.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-3 py-4 text-sm font-mono text-gray-900 dark:text-white">
                      {load.loadNumber || `L-${load.id}`}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-900 dark:text-white">
                      {load.originAddress}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-900 dark:text-white">
                      {load.destinationAddress}
                    </td>
                    <td className="px-3 py-4">
                      <Badge className={`${getStatusColor(load.status)} border-0`}>
                        {formatStatus(load.status)}
                      </Badge>
                    </td>
                    <td className="px-3 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      ${load.totalRevenue ? parseFloat(load.totalRevenue).toLocaleString() : '0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
