import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, Clock, DollarSign, Truck, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  type: 'container_demurrage' | 'chassis_return' | 'driver_hours' | 'maintenance' | 'delivery_delay' | 'system_maintenance' | 'platform_outage' | 'feature_announcement';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  loadId?: string;
  driverId?: string;
  truckId?: string;
  containerId?: string;
  expiresAt: Date;
  createdAt: Date;
  isRead: boolean;
  estimatedCost?: number;
  actionRequired: boolean;
  actionUrl?: string;
  isSystemWide?: boolean;
  createdByHQ?: boolean;
  scheduledMaintenanceStart?: Date;
  scheduledMaintenanceEnd?: Date;
  affectedServices?: string[];
  acknowledgedAt?: Date;
}

const alertIcons = {
  container_demurrage: DollarSign,
  chassis_return: Truck,
  driver_hours: Clock,
  maintenance: AlertTriangle,
  delivery_delay: Calendar,
  system_maintenance: AlertTriangle,
  platform_outage: AlertTriangle,
  feature_announcement: Bell
};

const severityColors = {
  low: 'bg-blue-100 border-blue-300 text-blue-800',
  medium: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  high: 'bg-orange-100 border-orange-300 text-orange-800',
  critical: 'bg-red-100 border-red-300 text-red-800'
};

export function AlertNotificationSystem() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const queryClient = useQueryClient();

  // Fetch active alerts
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['/api/alerts'],
    queryFn: async () => {
      if (!user) return [];
      const res = await apiRequest('GET', '/api/alerts');
      return await res.json();
    },
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mark alert as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const res = await apiRequest('PATCH', `/api/alerts/${alertId}/read`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
    },
  });

  // Dismiss alert mutation
  const dismissAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const res = await apiRequest('DELETE', `/api/alerts/${alertId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
    },
  });

  // Update unread count
  useEffect(() => {
    const unread = alerts.filter((alert: Alert) => !alert.isRead).length;
    setUnreadCount(unread);
  }, [alerts]);

  // Auto-show notifications for critical alerts
  useEffect(() => {
    const criticalAlerts = alerts.filter((alert: Alert) => 
      alert.severity === 'critical' && !alert.isRead
    );
    if (criticalAlerts.length > 0 && !isOpen) {
      setIsOpen(true);
    }
  }, [alerts, isOpen]);

  const handleMarkAsRead = (alertId: string) => {
    markAsReadMutation.mutate(alertId);
  };

  const handleDismiss = (alertId: string) => {
    dismissAlertMutation.mutate(alertId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const diff = new Date(expiresAt).getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours < 0) return 'Expired';
    if (hours === 0) return `${minutes}m remaining`;
    return `${hours}h ${minutes}m remaining`;
  };

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5 text-red-500" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Alert Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b bg-gray-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Alerts & Notifications</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">{unreadCount} unread notifications</p>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading alerts...</div>
            ) : alerts.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No active alerts</div>
            ) : (
              alerts.map((alert: Alert) => {
                const IconComponent = alertIcons[alert.type?.toLowerCase()] || AlertTriangle;
                return (
                  <Card 
                    key={alert.id} 
                    className={cn(
                      "m-2 border-l-4",
                      !alert.isRead && "bg-blue-50",
                      severityColors[alert.severity]
                    )}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <IconComponent className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm text-gray-900 truncate">
                              {alert.title}
                            </h4>
                            <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                              {alert.severity.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{formatTimeRemaining(alert.expiresAt)}</span>
                            {alert.estimatedCost && (
                              <span className="font-medium text-red-600">
                                Cost: {formatCurrency(alert.estimatedCost)}
                              </span>
                            )}
                          </div>

                          <div className="flex gap-1 mt-2">
                            {!alert.isRead && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-6"
                                onClick={() => handleMarkAsRead(alert.id)}
                              >
                                Mark Read
                              </Button>
                            )}
                            {alert.actionRequired && alert.actionUrl && (
                              <Button
                                size="sm"
                                className="text-xs h-6"
                                onClick={() => window.location.href = alert.actionUrl!}
                              >
                                Take Action
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs h-6"
                              onClick={() => handleDismiss(alert.id)}
                            >
                              Dismiss
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {alerts.length > 0 && (
            <div className="p-3 border-t bg-gray-50 rounded-b-lg">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  // Navigate to full alerts page
                  window.location.href = '/alerts';
                }}
              >
                View All Alerts
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}