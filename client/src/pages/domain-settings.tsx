import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Globe, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Copy, 
  ExternalLink,
  Trash2,
  RefreshCw,
  Settings,
  Lock,
  Zap
} from 'lucide-react';

interface DomainConfig {
  id: string;
  domain: string;
  status: 'pending' | 'verifying' | 'active' | 'failed';
  verificationMethod: 'dns' | 'file';
  verificationToken: string;
  sslStatus: 'pending' | 'active' | 'failed';
  redirects: {
    wwwRedirect: boolean;
    httpsRedirect: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

interface DNSInstructions {
  aRecord: { name: string; value: string; ttl: number };
  cnameRecord: { name: string; value: string; ttl: number };
  txtRecord: { name: string; value: string; ttl: number };
}

interface SSLInfo {
  status: 'active' | 'pending' | 'failed';
  issuer?: string;
  expiresAt?: string;
  autoRenew: boolean;
}

export default function DomainSettings() {
  const [newDomain, setNewDomain] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const [showDNSInstructions, setShowDNSInstructions] = useState(false);
  const [dnsInstructions, setDnsInstructions] = useState<DNSInstructions | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Validate domain format as user types
  const validateDomainMutation = useMutation({
    mutationFn: async (domain: string) => {
      if (!domain) return { valid: false, message: '' };
      const response = await apiRequest('POST', '/api/domains/validate', { domain });
      return response.json();
    },
    onSuccess: (data) => {
      if (!data.valid) {
        setValidationMessage(data.message || 'Invalid domain format');
      } else if (!data.available) {
        setValidationMessage(`Domain not available: ${data.conflictsWith}`);
      } else {
        setValidationMessage('Domain is available');
      }
    }
  });

  // Add custom domain
  const addDomainMutation = useMutation({
    mutationFn: async (domain: string) => {
      const response = await apiRequest('POST', '/api/domains', { domain });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Domain Added",
        description: `${data.domain.domain} has been added. Please configure DNS records.`,
      });
      setDnsInstructions(data.dnsInstructions);
      setShowDNSInstructions(true);
      setNewDomain('');
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add domain",
        variant: "destructive"
      });
    }
  });

  // Get domain status
  const { data: domainStatus } = useQuery({
    queryKey: ['/api/domains/domain_1/status'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/domains/domain_1/status');
      return response.json();
    },
    refetchInterval: 30000 // Check status every 30 seconds
  });

  // Verify domain
  const verifyDomainMutation = useMutation({
    mutationFn: async (domainId: string) => {
      const response = await apiRequest('POST', `/api/domains/${domainId}/verify`);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Domain Verified",
          description: data.message,
        });
      } else {
        toast({
          title: "Verification Failed",
          description: data.message,
          variant: "destructive"
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
    }
  });

  // Renew SSL certificate
  const renewSSLMutation = useMutation({
    mutationFn: async (domainId: string) => {
      const response = await apiRequest('POST', `/api/domains/${domainId}/ssl/renew`);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "SSL Certificate Renewed",
          description: `Certificate expires ${new Date(data.expiresAt).toLocaleDateString()}`,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
    }
  });

  // Update redirects
  const updateRedirectsMutation = useMutation({
    mutationFn: async ({ domainId, redirects }: { domainId: string; redirects: any }) => {
      const response = await apiRequest('PUT', `/api/domains/${domainId}/redirects`, redirects);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Redirects Updated",
        description: "Domain redirect settings have been saved",
      });
    }
  });

  const handleDomainChange = (value: string) => {
    setNewDomain(value);
    if (value.length > 3) {
      validateDomainMutation.mutate(value);
    } else {
      setValidationMessage('');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "DNS record copied to clipboard",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'pending': case 'verifying': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': case 'verifying': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Custom Domain</h1>
          <p className="text-muted-foreground">
            Configure your custom domain instead of using replit.app
          </p>
        </div>
        <Button variant="outline">
          <ExternalLink className="w-4 h-4 mr-2" />
          Domain Help
        </Button>
      </div>

      {/* Add New Domain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Add Custom Domain
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="domain">Domain Name</Label>
              <Input
                id="domain"
                placeholder="yourdomain.com"
                value={newDomain}
                onChange={(e) => handleDomainChange(e.target.value)}
                className={validationMessage && !validationMessage.includes('available') ? 'border-red-500' : ''}
              />
              {validationMessage && (
                <p className={`text-sm mt-1 ${
                  validationMessage.includes('available') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {validationMessage}
                </p>
              )}
            </div>
            <div className="flex items-end">
              <Button 
                onClick={() => addDomainMutation.mutate(newDomain)}
                disabled={addDomainMutation.isPending || !newDomain || !validationMessage.includes('available')}
                className="w-full"
              >
                {addDomainMutation.isPending ? 'Adding...' : 'Add Domain'}
              </Button>
            </div>
          </div>

          <Alert>
            <Globe className="h-4 w-4" />
            <AlertDescription>
              You'll need access to your domain's DNS settings to complete the setup. 
              We'll provide the exact DNS records to add after you submit your domain.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* DNS Configuration Instructions */}
      {showDNSInstructions && dnsInstructions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              DNS Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Add these DNS records to your domain provider to complete the setup:
            </p>

            <div className="space-y-4">
              {/* A Record */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">A Record</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(dnsInstructions.aRecord.value)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {dnsInstructions.aRecord.name}
                  </div>
                  <div>
                    <span className="font-medium">Value:</span> {dnsInstructions.aRecord.value}
                  </div>
                  <div>
                    <span className="font-medium">TTL:</span> {dnsInstructions.aRecord.ttl}
                  </div>
                </div>
              </div>

              {/* CNAME Record */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">CNAME Record</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(dnsInstructions.cnameRecord.value)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {dnsInstructions.cnameRecord.name}
                  </div>
                  <div>
                    <span className="font-medium">Value:</span> {dnsInstructions.cnameRecord.value}
                  </div>
                  <div>
                    <span className="font-medium">TTL:</span> {dnsInstructions.cnameRecord.ttl}
                  </div>
                </div>
              </div>

              {/* TXT Record */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">TXT Record (Verification)</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(dnsInstructions.txtRecord.value)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {dnsInstructions.txtRecord.name}
                  </div>
                  <div className="font-mono text-xs">
                    <span className="font-medium">Value:</span> {dnsInstructions.txtRecord.value}
                  </div>
                  <div>
                    <span className="font-medium">TTL:</span> {dnsInstructions.txtRecord.ttl}
                  </div>
                </div>
              </div>
            </div>

            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                DNS changes can take up to 24 hours to propagate. You can verify your domain 
                once the DNS records are active.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Current Domain Status */}
      {domainStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Domain Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Domain Overview */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(domainStatus.domain.status)}
                <div>
                  <h3 className="font-medium">{domainStatus.domain.domain}</h3>
                  <p className="text-sm text-muted-foreground">
                    Added {new Date(domainStatus.domain.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusColor(domainStatus.domain.status)}>
                  {domainStatus.domain.status}
                </Badge>
                {domainStatus.domain.status === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => verifyDomainMutation.mutate(domainStatus.domain.id)}
                    disabled={verifyDomainMutation.isPending}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Verify
                  </Button>
                )}
              </div>
            </div>

            {/* SSL Certificate Status */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="w-4 h-4" />
                SSL Certificate
              </h4>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(domainStatus.ssl.status)}
                  <div>
                    <p className="font-medium">
                      {domainStatus.ssl.status === 'active' ? 'SSL Active' : 'SSL Pending'}
                    </p>
                    {domainStatus.ssl.issuer && (
                      <p className="text-sm text-muted-foreground">
                        Issued by {domainStatus.ssl.issuer}
                        {domainStatus.ssl.expiresAt && 
                          ` • Expires ${new Date(domainStatus.ssl.expiresAt).toLocaleDateString()}`
                        }
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(domainStatus.ssl.status)}>
                    {domainStatus.ssl.status}
                  </Badge>
                  {domainStatus.ssl.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => renewSSLMutation.mutate(domainStatus.domain.id)}
                      disabled={renewSSLMutation.isPending}
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Renew
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Redirect Settings */}
            <div className="space-y-4">
              <h4 className="font-medium">Redirect Settings</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">HTTPS Redirect</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically redirect HTTP traffic to HTTPS
                    </p>
                  </div>
                  <Switch
                    checked={domainStatus.domain.redirects.httpsRedirect}
                    onCheckedChange={(checked) => 
                      updateRedirectsMutation.mutate({
                        domainId: domainStatus.domain.id,
                        redirects: { ...domainStatus.domain.redirects, httpsRedirect: checked }
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">WWW Redirect</p>
                    <p className="text-sm text-muted-foreground">
                      Redirect www subdomain to apex domain
                    </p>
                  </div>
                  <Switch
                    checked={domainStatus.domain.redirects.wwwRedirect}
                    onCheckedChange={(checked) => 
                      updateRedirectsMutation.mutate({
                        domainId: domainStatus.domain.id,
                        redirects: { ...domainStatus.domain.redirects, wwwRedirect: checked }
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" size="sm">
                <Zap className="w-4 h-4 mr-2" />
                Test Domain
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Site
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Domain
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Benefits of Custom Domain */}
      <Card>
        <CardHeader>
          <CardTitle>Why Use a Custom Domain?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Professional Branding</h4>
              <p className="text-sm text-muted-foreground">
                Use your own domain name for a professional appearance and brand consistency.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">SSL Security</h4>
              <p className="text-sm text-muted-foreground">
                Automatic SSL certificates ensure secure connections for all users.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Better SEO</h4>
              <p className="text-sm text-muted-foreground">
                Custom domains improve search engine optimization and user trust.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Email Integration</h4>
              <p className="text-sm text-muted-foreground">
                Use the same domain for email addresses and web presence.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}