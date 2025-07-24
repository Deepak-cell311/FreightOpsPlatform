import React, { useState } from 'react';
import { AlertTriangle, Bell, Calendar, Settings, Send, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface SystemAlert {
  id: string;
  type: 'system_maintenance' | 'platform_outage' | 'feature_announcement';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  scheduledMaintenanceStart?: Date;
  scheduledMaintenanceEnd?: Date;
  affectedServices: string[];
  actionRequired: boolean;
  actionUrl?: string;
  expiresAt: Date;
  isActive: boolean;
  recipientCount: number;
  acknowledgedCount: number;
}

const alertTypes = [
  { value: 'system_maintenance', label: 'System Maintenance', icon: Settings },
  { value: 'platform_outage', label: 'Platform Outage', icon: AlertTriangle },
  { value: 'feature_announcement', label: 'Feature Announcement', icon: Bell }
];

const severityLevels = [
  { value: 'low', label: 'Low - Informational', color: 'bg-blue-100 text-blue-800' },
  { value: 'medium', label: 'Medium - Notice', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High - Important', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical - Urgent', color: 'bg-red-100 text-red-800' }
];

const availableServices = [
  'Dispatch System', 'Fleet Management', 'Banking Services', 'Load Management',
  'Driver Portal', 'Customer Portal', 'API Services', 'Mobile App', 'Reporting'
];

export function HQNotificationManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newAlert, setNewAlert] = useState({
    type: 'system_maintenance' as const,
    title: '',
    message: '',
    severity: 'medium' as const,
    scheduledMaintenanceStart: '',
    scheduledMaintenanceEnd: '',
    affectedServices: [] as string[],
    actionRequired: false,
    actionUrl: '',
    expiresInHours: 24
  });

  // Fetch active system alerts
  const { data: systemAlerts = [], isLoading } = useQuery({
    queryKey: ['/api/hq/system-alerts'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/hq/system-alerts');
      return await res.json();
    },
    refetchInterval: 30000,
  });

  // Create system alert mutation
  const createAlertMutation = useMutation({
    mutationFn: async (alertData: any) => {
      const res = await apiRequest('POST', '/api/hq/system-alerts', alertData);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "System Alert Created",
        description: `Alert sent to ${data.recipientCount} tenants successfully.`,
      });
      setIsCreating(false);
      setNewAlert({
        type: 'system_maintenance',
        title: '',
        message: '',
        severity: 'medium',
        scheduledMaintenanceStart: '',
        scheduledMaintenanceEnd: '',
        affectedServices: [],
        actionRequired: false,
        actionUrl: '',
        expiresInHours: 24
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hq/system-alerts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Alert",
        description: error.message || "Failed to create system alert",
        variant: "destructive",
      });
    },
  });

  // Deactivate alert mutation
  const deactivateAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const res = await apiRequest('PATCH', `/api/hq/system-alerts/${alertId}/deactivate`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Alert Deactivated",
        description: "System alert has been deactivated for all tenants.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hq/system-alerts'] });
    },
  });

  const handleCreateAlert = () => {
    if (!newAlert.title || !newAlert.message) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and message for the alert.",
        variant: "destructive",
      });
      return;
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + newAlert.expiresInHours);

    const alertData = {
      ...newAlert,
      expiresAt: expiresAt.toISOString(),
      scheduledMaintenanceStart: newAlert.scheduledMaintenanceStart ? new Date(newAlert.scheduledMaintenanceStart).toISOString() : null,
      scheduledMaintenanceEnd: newAlert.scheduledMaintenanceEnd ? new Date(newAlert.scheduledMaintenanceEnd).toISOString() : null,
    };

    createAlertMutation.mutate(alertData);
  };

  const toggleService = (service: string) => {
    setNewAlert(prev => ({
      ...prev,
      affectedServices: prev.affectedServices.includes(service)
        ? prev.affectedServices.filter(s => s !== service)
        : [...prev.affectedServices, service]
    }));
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Notifications</h2>
          <p className="text-gray-600">Manage platform-wide alerts and maintenance notifications</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
          <Send className="h-4 w-4" />
          Create System Alert
        </Button>
      </div>

      {/* Create Alert Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Create System-Wide Alert
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="alert-type">Alert Type</Label>
                <Select
                  value={newAlert.type}
                  onValueChange={(value: any) => setNewAlert(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {alertTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="severity">Severity Level</Label>
                <Select
                  value={newAlert.severity}
                  onValueChange={(value: any) => setNewAlert(prev => ({ ...prev, severity: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {severityLevels.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        <Badge className={level.color}>{level.label}</Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="title">Alert Title</Label>
              <Input
                id="title"
                value={newAlert.title}
                onChange={(e) => setNewAlert(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Scheduled Maintenance Window"
              />
            </div>

            <div>
              <Label htmlFor="message">Alert Message</Label>
              <Textarea
                id="message"
                value={newAlert.message}
                onChange={(e) => setNewAlert(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Detailed message about the alert..."
                rows={4}
              />
            </div>

            {newAlert.type === 'system_maintenance' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-time">Maintenance Start</Label>
                  <Input
                    id="start-time"
                    type="datetime-local"
                    value={newAlert.scheduledMaintenanceStart}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, scheduledMaintenanceStart: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end-time">Maintenance End</Label>
                  <Input
                    id="end-time"
                    type="datetime-local"
                    value={newAlert.scheduledMaintenanceEnd}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, scheduledMaintenanceEnd: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <div>
              <Label>Affected Services</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {availableServices.map(service => (
                  <Badge
                    key={service}
                    variant={newAlert.affectedServices.includes(service) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleService(service)}
                  >
                    {service}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="action-required"
                checked={newAlert.actionRequired}
                onCheckedChange={(checked) => setNewAlert(prev => ({ ...prev, actionRequired: checked }))}
              />
              <Label htmlFor="action-required">Requires Action from Tenants</Label>
            </div>

            {newAlert.actionRequired && (
              <div>
                <Label htmlFor="action-url">Action URL</Label>
                <Input
                  id="action-url"
                  value={newAlert.actionUrl}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, actionUrl: e.target.value }))}
                  placeholder="https://status.freightops.com/maintenance"
                />
              </div>
            )}

            <div>
              <Label htmlFor="expires">Expires In (Hours)</Label>
              <Input
                id="expires"
                type="number"
                value={newAlert.expiresInHours}
                onChange={(e) => setNewAlert(prev => ({ ...prev, expiresInHours: parseInt(e.target.value) || 24 }))}
                min="1"
                max="168"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateAlert} disabled={createAlertMutation.isPending}>
                <Send className="h-4 w-4 mr-2" />
                {createAlertMutation.isPending ? 'Sending...' : 'Send to All Tenants'}
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading active alerts...</div>
          ) : systemAlerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No active system alerts</div>
          ) : (
            <div className="space-y-4">
              {systemAlerts.map((alert: SystemAlert) => (
                <div key={alert.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={severityLevels.find(s => s.value === alert.severity)?.color}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <h3 className="font-semibold">{alert.title}</h3>
                        {alert.isActive && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-700 mb-3">{alert.message}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <strong>Recipients:</strong> {alert.recipientCount} tenants
                        </div>
                        <div>
                          <strong>Acknowledged:</strong> {alert.acknowledgedCount}/{alert.recipientCount}
                        </div>
                        {alert.scheduledMaintenanceStart && (
                          <>
                            <div>
                              <strong>Start:</strong> {formatDateTime(alert.scheduledMaintenanceStart)}
                            </div>
                            <div>
                              <strong>End:</strong> {formatDateTime(alert.scheduledMaintenanceEnd!)}
                            </div>
                          </>
                        )}
                      </div>

                      {alert.affectedServices.length > 0 && (
                        <div className="mt-3">
                          <strong className="text-sm text-gray-600">Affected Services:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {alert.affectedServices.map(service => (
                              <Badge key={service} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {alert.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deactivateAlertMutation.mutate(alert.id)}
                        disabled={deactivateAlertMutation.isPending}
                      >
                        Deactivate
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}