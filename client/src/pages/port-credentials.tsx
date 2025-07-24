import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Ship, 
  Train, 
  Plus, 
  Trash2, 
  Key, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  Settings,
  Lock
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface PortCredentials {
  portCode: string;
  username: string;
  password: string;
  apiEndpoint: string;
  certificatePath?: string;
}

interface RailCredentials {
  railroad: 'BNSF' | 'UP' | 'CSX' | 'NS' | 'CN' | 'CP';
  username: string;
  password: string;
  apiKey?: string;
  customerId: string;
}

const PORT_OPTIONS = [
  { code: 'POLALB', name: 'Port of Los Angeles/Long Beach', endpoint: 'https://api.portofla.org', region: 'West Coast' },
  { code: 'HOUSTON', name: 'Port of Houston', endpoint: 'https://api.portofhouston.com', region: 'Gulf Coast' },
  { code: 'PANYNJ', name: 'Port Authority of NY/NJ', endpoint: 'https://api.panynj.gov', region: 'East Coast' },
  { code: 'SAVANNAH', name: 'Port of Savannah', endpoint: 'https://api.gaports.com', region: 'East Coast' },
  { code: 'CHARLESTON', name: 'Port of Charleston', endpoint: 'https://api.port-of-charleston.com', region: 'East Coast' },
  { code: 'NORFOLK', name: 'Port of Virginia (Norfolk)', endpoint: 'https://api.portofvirginia.com', region: 'East Coast' },
  { code: 'SEATTLE', name: 'Port of Seattle', endpoint: 'https://api.portseattle.org', region: 'West Coast' },
  { code: 'OAKLAND', name: 'Port of Oakland', endpoint: 'https://api.portofoakland.com', region: 'West Coast' },
  { code: 'MIAMI', name: 'Port of Miami', endpoint: 'https://api.miamidade.gov/portmiami', region: 'East Coast' },
  { code: 'JACKSONVILLE', name: 'JAXPORT (Jacksonville)', endpoint: 'https://api.jaxport.com', region: 'East Coast' },
  { code: 'BALTIMORE', name: 'Port of Baltimore', endpoint: 'https://api.marylandports.com', region: 'East Coast' },
  { code: 'NEWORLEANS', name: 'Port of New Orleans', endpoint: 'https://api.portno.com', region: 'Gulf Coast' },
  { code: 'BEAUMONT', name: 'Port of Beaumont', endpoint: 'https://api.portofbeaumont.com', region: 'Gulf Coast' },
  { code: 'MOBILE', name: 'Port of Mobile', endpoint: 'https://api.asdd.com', region: 'Gulf Coast' },
  { code: 'TACOMA', name: 'Port of Tacoma', endpoint: 'https://api.portoftacoma.com', region: 'West Coast' },
  { code: 'PORTLAND', name: 'Port of Portland', endpoint: 'https://api.portofportland.com', region: 'West Coast' }
];

const RAILROAD_OPTIONS = [
  { code: 'BNSF', name: 'BNSF Railway', description: 'Major western US railroad' },
  { code: 'UP', name: 'Union Pacific', description: 'Largest US railroad network' },
  { code: 'CSX', name: 'CSX Transportation', description: 'Eastern US freight railroad' },
  { code: 'NS', name: 'Norfolk Southern', description: 'Eastern US railroad network' },
  { code: 'CN', name: 'Canadian National', description: 'Cross-border rail network' },
  { code: 'CP', name: 'Canadian Pacific', description: 'Trans-continental railroad' }
];

export default function PortCredentials() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showPortDialog, setShowPortDialog] = useState(false);
  const [showRailDialog, setShowRailDialog] = useState(false);
  const [portForm, setPortForm] = useState<PortCredentials>({
    portCode: '',
    username: '',
    password: '',
    apiEndpoint: ''
  });
  const [railForm, setRailForm] = useState<RailCredentials>({
    railroad: 'BNSF',
    username: '',
    password: '',
    customerId: ''
  });

  // Fetch existing credentials
  const { data: portAccess = [], isLoading: portLoading } = useQuery({
    queryKey: ['/api/intermodal/port-access'],
    enabled: !!user
  });

  const { data: railAccess = [], isLoading: railLoading } = useQuery({
    queryKey: ['/api/intermodal/rail-access'],
    enabled: !!user
  });

  // Add port credentials
  const addPortMutation = useMutation({
    mutationFn: (credentials: PortCredentials) => 
      apiRequest('POST', '/api/intermodal/port-credentials', credentials),
    onSuccess: () => {
      toast({ title: "Success", description: "Port credentials added successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/intermodal/port-access'] });
      setShowPortDialog(false);
      setPortForm({ portCode: '', username: '', password: '', apiEndpoint: '' });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add port credentials",
        variant: "destructive"
      });
    }
  });

  // Add rail credentials
  const addRailMutation = useMutation({
    mutationFn: (credentials: RailCredentials) => 
      apiRequest('POST', '/api/intermodal/rail-credentials', credentials),
    onSuccess: () => {
      toast({ title: "Success", description: "Rail credentials added successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/intermodal/rail-access'] });
      setShowRailDialog(false);
      setRailForm({ railroad: 'BNSF', username: '', password: '', customerId: '' });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add rail credentials",
        variant: "destructive"
      });
    }
  });

  // Remove credentials
  const removePortMutation = useMutation({
    mutationFn: (portCode: string) => 
      apiRequest('DELETE', `/api/intermodal/port-access/${portCode}`),
    onSuccess: () => {
      toast({ title: "Success", description: "Port access removed" });
      queryClient.invalidateQueries({ queryKey: ['/api/intermodal/port-access'] });
    }
  });

  const removeRailMutation = useMutation({
    mutationFn: (railroad: string) => 
      apiRequest('DELETE', `/api/intermodal/rail-access/${railroad}`),
    onSuccess: () => {
      toast({ title: "Success", description: "Rail access removed" });
      queryClient.invalidateQueries({ queryKey: ['/api/intermodal/rail-access'] });
    }
  });

  const handlePortSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portForm.portCode || !portForm.username || !portForm.password) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    addPortMutation.mutate(portForm);
  };

  const handleRailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!railForm.username || !railForm.password || !railForm.customerId) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    addRailMutation.mutate(railForm);
  };

  const handlePortSelection = (portCode: string) => {
    const port = PORT_OPTIONS.find(p => p.code === portCode);
    if (port) {
      setPortForm(prev => ({
        ...prev,
        portCode: port.code,
        apiEndpoint: port.endpoint
      }));
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Port & Rail Access</h2>
        <p className="text-gray-600">Manage your port and railroad system credentials for real-time tracking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Security Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Encrypted Storage</p>
                  <p className="text-xs text-gray-600">All credentials are encrypted and stored securely</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Key className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Port Access Required</p>
                  <p className="text-xs text-gray-600">You need active accounts with each port/railroad</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Validation</p>
                  <p className="text-xs text-gray-600">Credentials are tested before storage</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Access Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Port Access</span>
                <Badge variant="outline">{portAccess.length} ports</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Rail Access</span>
                <Badge variant="outline">{railAccess.length} railroads</Badge>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-600">
                  Connect to ports and railroads to enable real-time container and rail car tracking
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ports" className="space-y-6">
        <TabsList>
          <TabsTrigger value="ports" className="flex items-center gap-2">
            <Ship className="h-4 w-4" />
            Port Access
          </TabsTrigger>
          <TabsTrigger value="railroads" className="flex items-center gap-2">
            <Train className="h-4 w-4" />
            Railroad Access
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ports">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Port Credentials</CardTitle>
                <CardDescription>
                  Add your port system credentials to track containers and book appointments
                </CardDescription>
              </div>
              <Dialog open={showPortDialog} onOpenChange={setShowPortDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Port Access
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Port Credentials</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handlePortSubmit} className="space-y-4">
                    <div>
                      <Label>Port</Label>
                      <Select onValueChange={handlePortSelection}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a port" />
                        </SelectTrigger>
                        <SelectContent>
                          {['West Coast', 'East Coast', 'Gulf Coast'].map(region => (
                            <div key={region}>
                              <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                                {region}
                              </div>
                              {PORT_OPTIONS.filter(port => port.region === region).map(port => (
                                <SelectItem key={port.code} value={port.code}>
                                  {port.name}
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Username</Label>
                      <Input
                        value={portForm.username}
                        onChange={(e) => setPortForm(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="Your port system username"
                        required
                      />
                    </div>
                    <div>
                      <Label>Password</Label>
                      <Input
                        type="password"
                        value={portForm.password}
                        onChange={(e) => setPortForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Your port system password"
                        required
                      />
                    </div>
                    <div>
                      <Label>API Endpoint</Label>
                      <Input
                        value={portForm.apiEndpoint}
                        onChange={(e) => setPortForm(prev => ({ ...prev, apiEndpoint: e.target.value }))}
                        placeholder="API endpoint URL"
                        disabled
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowPortDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={addPortMutation.isPending}>
                        {addPortMutation.isPending ? 'Validating...' : 'Add Credentials'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {portLoading ? (
                <div className="text-center py-8">Loading port access...</div>
              ) : portAccess.length === 0 ? (
                <div className="text-center py-8">
                  <Ship className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No port access configured</p>
                  <p className="text-sm text-gray-500 mt-2">Add your port credentials to enable container tracking</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {portAccess.map((port: any) => (
                    <div key={port.portCode} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{PORT_OPTIONS.find(p => p.code === port.portCode)?.name || port.portCode}</h4>
                        <p className="text-sm text-gray-600">Username: {port.username}</p>
                        <p className="text-xs text-gray-500">{port.apiEndpoint}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removePortMutation.mutate(port.portCode)}
                          disabled={removePortMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="railroads">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Railroad Credentials</CardTitle>
                <CardDescription>
                  Add your railroad system credentials to track rail cars and shipments
                </CardDescription>
              </div>
              <Dialog open={showRailDialog} onOpenChange={setShowRailDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Railroad Access
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Railroad Credentials</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleRailSubmit} className="space-y-4">
                    <div>
                      <Label>Railroad</Label>
                      <Select 
                        value={railForm.railroad} 
                        onValueChange={(value: any) => setRailForm(prev => ({ ...prev, railroad: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RAILROAD_OPTIONS.map(rail => (
                            <SelectItem key={rail.code} value={rail.code}>
                              {rail.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Customer ID</Label>
                      <Input
                        value={railForm.customerId}
                        onChange={(e) => setRailForm(prev => ({ ...prev, customerId: e.target.value }))}
                        placeholder="Your customer/account ID"
                        required
                      />
                    </div>
                    <div>
                      <Label>Username</Label>
                      <Input
                        value={railForm.username}
                        onChange={(e) => setRailForm(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="Your railroad system username"
                        required
                      />
                    </div>
                    <div>
                      <Label>Password</Label>
                      <Input
                        type="password"
                        value={railForm.password}
                        onChange={(e) => setRailForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Your railroad system password"
                        required
                      />
                    </div>
                    {(railForm.railroad === 'UP') && (
                      <div>
                        <Label>API Key (Optional)</Label>
                        <Input
                          value={railForm.apiKey || ''}
                          onChange={(e) => setRailForm(prev => ({ ...prev, apiKey: e.target.value }))}
                          placeholder="API key if available"
                        />
                      </div>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowRailDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={addRailMutation.isPending}>
                        {addRailMutation.isPending ? 'Validating...' : 'Add Credentials'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {railLoading ? (
                <div className="text-center py-8">Loading railroad access...</div>
              ) : railAccess.length === 0 ? (
                <div className="text-center py-8">
                  <Train className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No railroad access configured</p>
                  <p className="text-sm text-gray-500 mt-2">Add your railroad credentials to enable rail car tracking</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {railAccess.map((rail: any) => (
                    <div key={rail.railroad} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{RAILROAD_OPTIONS.find(r => r.code === rail.railroad)?.name || rail.railroad}</h4>
                        <p className="text-sm text-gray-600">Customer ID: {rail.customerId}</p>
                        <p className="text-xs text-gray-500">Username: {rail.username}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeRailMutation.mutate(rail.railroad)}
                          disabled={removeRailMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}