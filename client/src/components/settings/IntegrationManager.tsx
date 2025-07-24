import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, CheckCircle2, Settings, ExternalLink, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Integration {
  service: string;
  name: string;
  category: string;
  description: string;
  requiresOAuth: boolean;
  planLevel: string;
  configured: boolean;
  enabled: boolean;
  lastSync: string | null;
}

interface IntegrationConfig {
  service: string;
  enabled: boolean;
  configured: boolean;
  metadata?: any;
  updatedAt?: string;
}

const IntegrationManager: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Fetch all available integrations
  const { data: integrationsData, isLoading } = useQuery({
    queryKey: ['/api/integrations/list'],
  });

  const integrations: Integration[] = integrationsData?.integrations || [];

  // Toggle integration enabled/disabled
  const toggleIntegrationMutation = useMutation({
    mutationFn: async ({ service, enabled }: { service: string; enabled: boolean }) => {
      const response = await apiRequest('PATCH', `/api/integrations/${service}/toggle`, { enabled });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations/list'] });
      toast({
        title: "Integration Updated",
        description: "Integration status updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update integration status.",
        variant: "destructive",
      });
    },
  });

  // Save integration configuration
  const saveIntegrationMutation = useMutation({
    mutationFn: async ({ service, apiKey, enabled }: { service: string; apiKey: string; enabled: boolean }) => {
      const response = await apiRequest('POST', `/api/integrations/${service}`, {
        apiKey,
        enabled,
        metadata: {}
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations/list'] });
      setIsConfigDialogOpen(false);
      setApiKey('');
      setSelectedIntegration(null);
      toast({
        title: "Integration Configured",
        description: "Integration has been configured successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to configure integration.",
        variant: "destructive",
      });
    },
  });

  // Test integration connection
  const testConnectionMutation = useMutation({
    mutationFn: async (service: string) => {
      const response = await apiRequest('POST', `/api/integrations/${service}/test`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Connection Test",
        description: data.success ? data.message : "Connection test failed",
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: () => {
      toast({
        title: "Test Failed",
        description: "Failed to test integration connection.",
        variant: "destructive",
      });
    },
  });

  const handleConfigureIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);
    setIsConfigDialogOpen(true);
  };

  const handleSaveConfiguration = () => {
    if (!selectedIntegration || !apiKey.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter an API key.",
        variant: "destructive",
      });
      return;
    }

    saveIntegrationMutation.mutate({
      service: selectedIntegration.service,
      apiKey: apiKey.trim(),
      enabled: true
    });
  };

  const handleTestConnection = (service: string) => {
    setIsTestingConnection(true);
    testConnectionMutation.mutate(service, {
      onSettled: () => setIsTestingConnection(false)
    });
  };

  const getStatusIcon = (integration: Integration) => {
    if (!integration.configured) {
      return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
    return integration.enabled ? 
      <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
      <AlertCircle className="h-4 w-4 text-orange-500" />;
  };

  const getStatusText = (integration: Integration) => {
    if (!integration.configured) return "Not Configured";
    return integration.enabled ? "Active" : "Disabled";
  };

  const groupedIntegrations = integrations.reduce((groups, integration) => {
    const category = integration.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(integration);
    return groups;
  }, {} as Record<string, Integration[]>);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Integration Management</h2>
        <p className="text-gray-600">Configure and manage third-party service integrations</p>
      </div>

      <Tabs defaultValue={Object.keys(groupedIntegrations)[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {Object.keys(groupedIntegrations).map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(groupedIntegrations).map(([category, categoryIntegrations]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoryIntegrations.map((integration) => (
                <Card key={integration.service} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(integration)}
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                      </div>
                      <Badge variant={integration.enabled ? "default" : "secondary"}>
                        {getStatusText(integration)}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {integration.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Plan Level:</span>
                      <Badge variant="outline">{integration.planLevel}</Badge>
                    </div>

                    {integration.lastSync && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Last Sync:</span>
                        <span className="text-sm text-gray-600">
                          {new Date(integration.lastSync).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={integration.enabled}
                          onCheckedChange={(enabled) => 
                            toggleIntegrationMutation.mutate({ 
                              service: integration.service, 
                              enabled 
                            })
                          }
                          disabled={!integration.configured || toggleIntegrationMutation.isPending}
                        />
                        <Label className="text-sm">Enable</Label>
                      </div>

                      <div className="flex space-x-2">
                        {integration.configured && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTestConnection(integration.service)}
                            disabled={isTestingConnection || testConnectionMutation.isPending}
                          >
                            <TestTube className="h-3 w-3 mr-1" />
                            Test
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant={integration.configured ? "outline" : "default"}
                          onClick={() => handleConfigureIntegration(integration)}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          {integration.configured ? "Edit" : "Configure"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Configure {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              {selectedIntegration?.requiresOAuth ? 
                "This integration requires OAuth authentication. You'll be redirected to authorize access." :
                "Enter your API credentials to configure this integration."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {selectedIntegration?.requiresOAuth ? (
              <div className="text-center py-4">
                <Button className="w-full" onClick={() => {
                  // OAuth flow would be handled here
                  toast({
                    title: "OAuth Setup",
                    description: "OAuth authentication flow would be initiated here.",
                  });
                }}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Authorize with {selectedIntegration.name}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="apiKey" className="text-right">
                  API Key
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="col-span-3"
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
              Cancel
            </Button>
            {!selectedIntegration?.requiresOAuth && (
              <Button 
                onClick={handleSaveConfiguration}
                disabled={saveIntegrationMutation.isPending}
              >
                Save Configuration
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntegrationManager;