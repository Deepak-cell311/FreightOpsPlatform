import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Download, Plus, CreditCard, Users, Repeat } from "lucide-react";
import { useLocation } from "wouter";

export function QuickActions() {
  const [, setLocation] = useLocation();

  const actions = [
    {
      icon: Send,
      label: "Send Money",
      description: "Transfer funds via ACH",
      color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
      action: () => setLocation("/banking/send-money")
    },
    {
      icon: Download,
      label: "Receive",
      description: "Generate payment link",
      color: "bg-green-50 text-green-600 hover:bg-green-100",
      action: () => setLocation("/banking/deposits")
    },
    {
      icon: CreditCard,
      label: "Cards",
      description: "Manage debit cards",
      color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
      action: () => setLocation("/banking/cards")
    },
    {
      icon: Repeat,
      label: "Transfers",
      description: "Internal transfers",
      color: "bg-orange-50 text-orange-600 hover:bg-orange-100",
      action: () => setLocation("/banking/transfers")
    },
    {
      icon: Users,
      label: "Payroll",
      description: "Employee payments",
      color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
      action: () => setLocation("/payroll")
    },
    {
      icon: Plus,
      label: "More",
      description: "All services",
      color: "bg-gray-50 text-gray-600 hover:bg-gray-100",
      action: () => setLocation("/banking/accounts")
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`h-auto p-4 flex flex-col items-center gap-2 ${action.color}`}
              onClick={action.action}
            >
              <action.icon className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium text-sm">{action.label}</p>
                <p className="text-xs opacity-75">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}