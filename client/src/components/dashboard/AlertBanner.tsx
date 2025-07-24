import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';

interface AlertData {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionRequired: boolean;
  createdAt: string;
}

interface AlertBannerProps {
  alerts: AlertData[];
  onDismiss?: (alertId: string) => void;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onDismiss }) => {
  if (!alerts || alerts.length === 0) return null;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return AlertCircle;
      case 'warning':
        return AlertTriangle;
      case 'success':
        return CheckCircle;
      default:
        return Info;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'success':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-2">
      {alerts.map((alert) => {
        const Icon = getAlertIcon(alert.type);
        return (
          <Alert key={alert.id} variant={getAlertVariant(alert.type)}>
            <Icon className="h-4 w-4" />
            <AlertDescription className="flex justify-between items-start">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{alert.title}</span>
                  <Badge 
                    className={`${getPriorityColor(alert.priority)} text-white text-xs`}
                  >
                    {alert.priority.toUpperCase()}
                  </Badge>
                  {alert.actionRequired && (
                    <Badge variant="outline" className="text-xs">
                      Action Required
                    </Badge>
                  )}
                </div>
                <p className="text-sm">{alert.message}</p>
              </div>
              
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onDismiss(alert.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
};

export default AlertBanner;