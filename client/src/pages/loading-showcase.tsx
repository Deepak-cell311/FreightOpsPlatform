import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TruckingLoadingSkeleton } from '@/components/trucking-loading-skeleton';
import { RefreshCw, Play, Pause } from 'lucide-react';

export default function LoadingShowcase() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="space-y-8 p-6" key={refreshKey}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trucking Loading Animations</h1>
          <p className="text-muted-foreground">Playful loading skeletons with transportation themes</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={togglePlayback} variant="outline" size="sm">
            {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Restart
          </Button>
        </div>
      </div>

      {/* Truck Animation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Animated Truck Drive
            <Badge variant="secondary">truck</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className={isPlaying ? '' : 'opacity-50 pointer-events-none'}>
          <TruckingLoadingSkeleton variant="truck" size="lg" />
          <p className="text-sm text-gray-600 mt-4">
            Features moving truck with trailer, spinning wheels, and road surface with animated lines
          </p>
        </CardContent>
      </Card>

      {/* Road Animation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Highway Road Surface
            <Badge variant="secondary">road</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className={isPlaying ? '' : 'opacity-50 pointer-events-none'}>
          <TruckingLoadingSkeleton variant="road" className="h-20" />
          <p className="text-sm text-gray-600 mt-4">
            Animated road with center divider lines and passing truck silhouette
          </p>
        </CardContent>
      </Card>

      {/* Dashboard Loading */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Dashboard Stats Loading
            <Badge variant="secondary">dashboard</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className={isPlaying ? '' : 'opacity-50 pointer-events-none'}>
          <TruckingLoadingSkeleton variant="dashboard" />
          <p className="text-sm text-gray-600 mt-4">
            Staggered loading animation for dashboard statistics with truck icon
          </p>
        </CardContent>
      </Card>

      {/* Fleet Management Loading */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Fleet Status Loading
            <Badge variant="secondary">fleet</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className={isPlaying ? '' : 'opacity-50 pointer-events-none'}>
          <TruckingLoadingSkeleton variant="fleet" />
          <p className="text-sm text-gray-600 mt-4">
            Fleet management loading with vehicle status indicators and animated trucks
          </p>
        </CardContent>
      </Card>

      {/* Load Management Loading */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Load Management Loading
            <Badge variant="secondary">load</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className={isPlaying ? '' : 'opacity-50 pointer-events-none'}>
          <TruckingLoadingSkeleton variant="load" />
          <p className="text-sm text-gray-600 mt-4">
            Load cards with route visualization and moving trucks between pickup and delivery points
          </p>
        </CardContent>
      </Card>

      {/* Trailer Loading */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Trailer Animation
            <Badge variant="secondary">trailer</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className={isPlaying ? '' : 'opacity-50 pointer-events-none'}>
          <TruckingLoadingSkeleton variant="trailer" size="lg" />
          <p className="text-sm text-gray-600 mt-4">
            Standalone trailer animation with cargo bounce effect and spinning wheels
          </p>
        </CardContent>
      </Card>

      {/* Size Variations */}
      <Card>
        <CardHeader>
          <CardTitle>Size Variations</CardTitle>
        </CardHeader>
        <CardContent className={isPlaying ? '' : 'opacity-50 pointer-events-none'}>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-2">Small</h4>
              <TruckingLoadingSkeleton variant="truck" size="sm" />
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Medium (Default)</h4>
              <TruckingLoadingSkeleton variant="truck" size="md" />
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Large</h4>
              <TruckingLoadingSkeleton variant="truck" size="lg" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Dashboard Loading</h4>
              <code className="text-sm bg-white p-2 rounded block">
                {`{isLoading ? (
  <TruckingLoadingSkeleton variant="dashboard" />
) : (
  <DashboardContent />
)}`}
              </code>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Fleet Status Loading</h4>
              <code className="text-sm bg-white p-2 rounded block">
                {`{vehiclesLoading ? (
  <TruckingLoadingSkeleton variant="fleet" />
) : (
  <VehicleList vehicles={vehicles} />
)}`}
              </code>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Load Management Loading</h4>
              <code className="text-sm bg-white p-2 rounded block">
                {`{loadsLoading ? (
  <TruckingLoadingSkeleton variant="load" />
) : (
  <LoadsList loads={loads} />
)}`}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Animation Features */}
      <Card>
        <CardHeader>
          <CardTitle>Animation Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Visual Effects</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Smooth truck movement across screen</li>
                <li>• Spinning wheel animations</li>
                <li>• Animated road lines and dashes</li>
                <li>• Shimmer loading effects</li>
                <li>• Status indicator animations</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Interactive Elements</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Staggered loading sequences</li>
                <li>• Route progress visualization</li>
                <li>• Cargo bounce effects</li>
                <li>• Color-coded status indicators</li>
                <li>• Responsive size variations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}