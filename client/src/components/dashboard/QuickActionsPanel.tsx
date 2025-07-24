import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Truck, FileText, User, DollarSign, Calendar } from 'lucide-react';
import { useLocation } from 'wouter';

const QuickActionsPanel: React.FC = () => {
  const [, setLocation] = useLocation();

  const actions = [
    {
      title: 'Create Load',
      description: 'Add new shipment',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => setLocation('/dispatch/load-management?action=create'),
    },
    {
      title: 'Add Driver',
      description: 'Register new driver',
      icon: User,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => setLocation('/fleet/drivers?action=add'),
    },
    {
      title: 'New Invoice',
      description: 'Create billing invoice',
      icon: FileText,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => setLocation('/accounting/invoices?action=create'),
    },
    {
      title: 'Add Vehicle',
      description: 'Register truck/trailer',
      icon: Truck,
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: () => setLocation('/fleet/vehicles?action=add'),
    },
    {
      title: 'Process Payment',
      description: 'Record payment',
      icon: DollarSign,
      color: 'bg-emerald-500 hover:bg-emerald-600',
      onClick: () => setLocation('/accounting/payments?action=add'),
    },
    {
      title: 'Schedule Dispatch',
      description: 'Plan route',
      icon: Calendar,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      onClick: () => setLocation('/dispatch/calendar'),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start h-auto p-3"
              onClick={action.onClick}
            >
              <div className={`p-2 rounded-md ${action.color} mr-3`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-xs text-gray-500">{action.description}</div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default QuickActionsPanel;