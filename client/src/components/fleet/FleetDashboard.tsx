import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TruckList } from './TruckList';
import { TrailerList } from './TrailerList';
import { AssignmentOverview } from './AssignmentOverview';
import { CreateTruckForm } from './CreateTruckForm';
import { CreateTrailerForm } from './CreateTrailerForm';
import { Truck, Trailer, Plus, AlertTriangle, CheckCircle } from 'lucide-react';

interface FleetStats {
  totalTrucks: number;
  activeTrucks: number;
  totalTrailers: number;
  availableTrailers: number;
  maintenanceAlerts: number;
  complianceIssues: number;
}

export function FleetDashboard() {
  const [stats, setStats] = useState<FleetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateTruck, setShowCreateTruck] = useState(false);
  const [showCreateTrailer, setShowCreateTrailer] = useState(false);

  useEffect(() => {
    fetchFleetStats();
  }, []);

  const fetchFleetStats = async () => {
    try {
      const response = await fetch('/api/fleet/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch fleet stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Fleet Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateTruck(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Truck
          </Button>
          <Button onClick={() => setShowCreateTrailer(true)} variant="outline" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Trailer
          </Button>
        </div>
      </div>

      {/* Fleet Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trucks</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTrucks}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeTrucks} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trailers</CardTitle>
              <Trailer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTrailers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.availableTrailers} available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{stats.maintenanceAlerts}</div>
              <p className="text-xs text-muted-foreground">
                alerts pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.complianceIssues}</div>
              <p className="text-xs text-muted-foreground">
                issues found
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Fleet Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trucks">Trucks</TabsTrigger>
          <TabsTrigger value="trailers">Trailers</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TruckList limit={5} />
            <TrailerList limit={5} />
          </div>
        </TabsContent>

        <TabsContent value="trucks">
          <TruckList />
        </TabsContent>

        <TabsContent value="trailers">
          <TrailerList />
        </TabsContent>

        <TabsContent value="assignments">
          <AssignmentOverview />
        </TabsContent>
      </Tabs>

      {/* Create Forms */}
      {showCreateTruck && (
        <CreateTruckForm 
          onClose={() => setShowCreateTruck(false)}
          onSuccess={() => {
            setShowCreateTruck(false);
            fetchFleetStats();
          }}
        />
      )}

      {showCreateTrailer && (
        <CreateTrailerForm 
          onClose={() => setShowCreateTrailer(false)}
          onSuccess={() => {
            setShowCreateTrailer(false);
            fetchFleetStats();
          }}
        />
      )}
    </div>
  );
}