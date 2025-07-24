import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Info, Clock } from "lucide-react";

export function AlertsPanel() {
  // In a real app, these would come from API
  const alerts = [
    {
      id: 1,
      type: "warning",
      title: "Truck Maintenance Due",
      description: "Truck #TK-101 requires scheduled maintenance within 3 days",
      time: "2 hours ago",
      icon: AlertTriangle,
      color: "red",
    },
    {
      id: 2,
      type: "info",
      title: "Load Delay Reported",
      description: "Load L-2024-001 delayed by 4 hours due to weather",
      time: "1 hour ago",
      icon: Clock,
      color: "yellow",
    },
    {
      id: 3,
      type: "info",
      title: "New Load Available",
      description: "High-priority load from Houston to Miami, $3,200",
      time: "30 minutes ago",
      icon: Info,
      color: "blue",
    },
  ];

  const getAlertColors = (color: string) => {
    switch (color) {
      case "red":
        return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800";
      case "yellow":
        return "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800";
      case "blue":
        return "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800";
      default:
        return "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700";
    }
  };

  const getIconColors = (color: string) => {
    switch (color) {
      case "red":
        return "text-red-600 dark:text-red-400";
      case "yellow":
        return "text-yellow-600 dark:text-yellow-400";
      case "blue":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getTextColors = (color: string) => {
    switch (color) {
      case "red":
        return {
          title: "text-red-800 dark:text-red-300",
          description: "text-red-700 dark:text-red-400",
          time: "text-red-600 dark:text-red-500",
        };
      case "yellow":
        return {
          title: "text-yellow-800 dark:text-yellow-300",
          description: "text-yellow-700 dark:text-yellow-400",
          time: "text-yellow-600 dark:text-yellow-500",
        };
      case "blue":
        return {
          title: "text-blue-800 dark:text-blue-300",
          description: "text-blue-700 dark:text-blue-400",
          time: "text-blue-600 dark:text-blue-500",
        };
      default:
        return {
          title: "text-gray-800 dark:text-gray-300",
          description: "text-gray-700 dark:text-gray-400",
          time: "text-gray-600 dark:text-gray-500",
        };
    }
  };

  return (
    <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle>Alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => {
          const alertColors = getAlertColors(alert.color);
          const iconColors = getIconColors(alert.color);
          const textColors = getTextColors(alert.color);

          return (
            <div
              key={alert.id}
              className={`flex items-start space-x-3 p-3 ${alertColors} border rounded-lg`}
            >
              <alert.icon className={`h-5 w-5 ${iconColors} mt-0.5`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${textColors.title}`}>
                  {alert.title}
                </p>
                <p className={`text-sm ${textColors.description} mt-1`}>
                  {alert.description}
                </p>
                <p className={`text-xs ${textColors.time} mt-1`}>
                  {alert.time}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
