import { Card, CardContent } from "@/components/ui/card";
import { Truck, Users, DollarSign, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export function KPICards() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: "Active Loads",
      value: metrics?.activeLoads || 0,
      icon: BarChart3,
      color: "primary",
      change: "+12%",
      changeLabel: "from last week",
    },
    {
      title: "Available Drivers",
      value: metrics?.availableDrivers || 0,
      icon: Users,
      color: "green",
      change: "+2",
      changeLabel: "from yesterday",
    },
    {
      title: "Total Revenue",
      value: `$${((metrics?.totalRevenue || 0) / 1000).toFixed(1)}K`,
      icon: DollarSign,
      color: "yellow",
      change: "+8.2%",
      changeLabel: "from completed loads",
    },
    {
      title: "Fleet Utilization",
      value: `${metrics?.fleetUtilization || 0}%`,
      icon: Truck,
      color: "red",
      change: `${metrics?.activeTrucks || 0}/${metrics?.totalTrucks || 0}`,
      changeLabel: "active/total trucks",
    },
  ];

  const colorClasses = {
    primary: "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400",
    green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    yellow: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
    red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{kpi.title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
              </div>
              <div className={`p-3 rounded-full ${colorClasses[kpi.color as keyof typeof colorClasses]}`}>
                <kpi.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className={`font-medium ${kpi.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {kpi.change}
              </span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">{kpi.changeLabel}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
