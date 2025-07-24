import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Route, MapPin, Clock, DollarSign, Fuel, TrendingUp } from "lucide-react";
import { TruckingLoadingSkeleton } from "@/components/trucking-loading-skeleton";

interface RouteOptimizationData {
  currentRoutes: number;
  optimizedRoutes: number;
  fuelSavings: number;
  timeSavings: number;
  costSavings: number;
  efficiencyScore: number;
}

export default function RouteOptimization() {
  const { data: routeData, isLoading } = useQuery<RouteOptimizationData>({
    queryKey: ["/api/operations/route-optimization"],
    // Real route optimization data from API
    retry: false,
  });

  if (isLoading) {
    return <TruckingLoadingSkeleton variant="load" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Route Optimization</h1>
          <p className="text-muted-foreground">Optimize routes for efficiency and cost savings</p>
        </div>
        <Button>
          <Route className="w-4 h-4 mr-2" />
          Optimize Routes
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routeData?.currentRoutes || 0}</div>
            <p className="text-xs text-muted-foreground">
              {routeData?.optimizedRoutes || 0} optimized
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuel Savings</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routeData?.fuelSavings || 0}%</div>
            <p className="text-xs text-muted-foreground">
              vs unoptimized routes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Savings</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routeData?.timeSavings || 0}h</div>
            <p className="text-xs text-muted-foreground">
              average per route
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${routeData?.costSavings?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Details */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Route Efficiency Score</CardTitle>
            <CardDescription>Overall optimization performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Efficiency</span>
                <span>{routeData?.efficiencyScore || 0}%</span>
              </div>
              <Progress value={routeData?.efficiencyScore || 0} />
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">+12% improvement this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Optimization Opportunities</CardTitle>
            <CardDescription>Routes ready for optimization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Route A-15</span>
                <Badge variant="outline">15% savings</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Route B-22</span>
                <Badge variant="outline">8% savings</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Route C-07</span>
                <Badge variant="outline">22% savings</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Optimizations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Optimizations</CardTitle>
          <CardDescription>Latest route optimization results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Chicago → Detroit Route</div>
                  <div className="text-sm text-muted-foreground">Optimized 2 hours ago</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-green-600">{routeData?.monthlySavings ? `$${routeData.monthlySavings}` : 'No data'}</div>
                <div className="text-sm text-muted-foreground">18% efficiency gain</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Atlanta → Miami Route</div>
                  <div className="text-sm text-muted-foreground">Optimized 5 hours ago</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-green-600">{routeData?.weeklySavings ? `$${routeData.weeklySavings}` : 'No data'}</div>
                <div className="text-sm text-muted-foreground">12% efficiency gain</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}