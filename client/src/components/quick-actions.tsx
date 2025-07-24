import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, FileText, BarChart3, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function QuickActions() {
  const { toast } = useToast();

  const handleAction = (action: string) => {
    toast({
      title: "Feature Available",
      description: `${action} feature would open here`,
    });
  };

  const actions = [
    {
      title: "Create New Load",
      icon: Plus,
      color: "bg-primary-50 hover:bg-primary-100 border-primary-200 dark:bg-primary-900/20 dark:hover:bg-primary-900/30 dark:border-primary-800",
      iconColor: "text-primary-600 dark:text-primary-400",
      onClick: () => handleAction("Create Load"),
    },
    {
      title: "Add Driver",
      icon: Users,
      color: "bg-gray-50 hover:bg-gray-100 border-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700",
      iconColor: "text-gray-600 dark:text-gray-400",
      onClick: () => handleAction("Add Driver"),
    },
    {
      title: "Generate Invoice",
      icon: FileText,
      color: "bg-gray-50 hover:bg-gray-100 border-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700",
      iconColor: "text-gray-600 dark:text-gray-400",
      onClick: () => handleAction("Generate Invoice"),
    },
    {
      title: "View Reports",
      icon: BarChart3,
      color: "bg-gray-50 hover:bg-gray-100 border-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700",
      iconColor: "text-gray-600 dark:text-gray-400",
      onClick: () => handleAction("View Reports"),
    },
  ];

  return (
    <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => (
          <Button
            key={action.title}
            variant="ghost"
            onClick={action.onClick}
            className={`w-full flex items-center justify-between px-4 py-3 ${action.color} border rounded-lg transition-colors`}
          >
            <div className="flex items-center space-x-3">
              <action.icon className={`h-5 w-5 ${action.iconColor}`} />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {action.title}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-600" />
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
