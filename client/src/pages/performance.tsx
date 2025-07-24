import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Target, Award, Clock } from "lucide-react";

interface PerformanceData {
  kpis: {
    onTimeDelivery: number;
    fuelEfficiency: number;
    driverSafety: number;
    customerSatisfaction: number;
    loadUtilization: number;
  };
  trends: {
    revenue: number[];
    efficiency: number[];
    safety: number[];
  };
  benchmarks: {
    industryAverage: {
      onTimeDelivery: number;
      fuelEfficiency: number;
      safety: number;
    };
    topPerformers: {
      onTimeDelivery: number;
      fuelEfficiency: number;
      safety: number;
    };
  };
}

export default function Performance() {
  const { data: performanceData, isLoading } = useQuery<PerformanceData>({
    queryKey: ["/api/dashboard/performance"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const chartData = performanceData?.trends.revenue.map((value, index) => ({
    week: `Week ${index + 1}`,
    revenue: value,
    efficiency: performanceData.trends.efficiency[index],
    safety: performanceData.trends.safety[index]
  })) || [];

  const kpiData = [
    {
      name: "On-Time Delivery",
      value: performanceData?.kpis.onTimeDelivery || 0,
      target: 95,
      industry: performanceData?.benchmarks.industryAverage.onTimeDelivery || 0
    },
    {
      name: "Fuel Efficiency",
      value: performanceData?.kpis.fuelEfficiency || 0,
      target: 7.5,
      industry: performanceData?.benchmarks.industryAverage.fuelEfficiency || 0
    },
    {
      name: "Driver Safety",
      value: performanceData?.kpis.driverSafety || 0,
      target: 99,
      industry: performanceData?.benchmarks.industryAverage.safety || 0
    },
    {
      name: "Customer Satisfaction",
      value: performanceData?.kpis.customerSatisfaction || 0,
      target: 4.8,
      industry: 4.2
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Performance Metrics</h1>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceData?.kpis.onTimeDelivery || 0}%</div>
            <Progress value={performanceData?.kpis.onTimeDelivery || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Target: 95%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuel Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceData?.kpis.fuelEfficiency || 0} MPG</div>
            <Progress value={(performanceData?.kpis.fuelEfficiency || 0) * 10} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Target: 7.5 MPG
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Driver Safety</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceData?.kpis.driverSafety || 0}%</div>
            <Progress value={performanceData?.kpis.driverSafety || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Target: 99%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Load Utilization</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceData?.kpis.loadUtilization || 0}%</div>
            <Progress value={performanceData?.kpis.loadUtilization || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Target: 90%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>Weekly performance metrics over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Revenue Growth %" 
              />
              <Line 
                type="monotone" 
                dataKey="efficiency" 
                stroke="#82ca9d" 
                strokeWidth={2}
                name="Efficiency %" 
              />
              <Line 
                type="monotone" 
                dataKey="safety" 
                stroke="#ffc658" 
                strokeWidth={2}
                name="Safety Score %" 
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance vs Benchmarks */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Benchmarks</CardTitle>
          <CardDescription>Comparison with industry standards and top performers</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={kpiData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" name="Your Performance" />
              <Bar dataKey="industry" fill="#82ca9d" name="Industry Average" />
              <Bar dataKey="target" fill="#ffc658" name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Performance Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>Current performance against targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {kpiData.map((kpi) => (
              <div key={kpi.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{kpi.name}</span>
                  <span className="font-semibold">
                    {kpi.name === "Fuel Efficiency" || kpi.name === "Customer Satisfaction" 
                      ? kpi.value.toFixed(1) + (kpi.name === "Fuel Efficiency" ? " MPG" : "/5.0")
                      : kpi.value.toFixed(1) + "%"
                    }
                  </span>
                </div>
                <Progress 
                  value={kpi.name === "Fuel Efficiency" ? (kpi.value / 10) * 100 : 
                         kpi.name === "Customer Satisfaction" ? (kpi.value / 5) * 100 : 
                         kpi.value} 
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Target: {kpi.target}{kpi.name === "Fuel Efficiency" ? " MPG" : kpi.name === "Customer Satisfaction" ? "/5.0" : "%"}</span>
                  <span>Industry: {kpi.industry}{kpi.name === "Fuel Efficiency" ? " MPG" : kpi.name === "Customer Satisfaction" ? "/5.0" : "%"}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
            <CardDescription>Key findings and recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-green-600">Strengths</h4>
              <ul className="text-sm space-y-1">
                <li>• On-time delivery exceeding industry average</li>
                <li>• Driver safety performance above target</li>
                <li>• Customer satisfaction trending upward</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-yellow-600">Areas for Improvement</h4>
              <ul className="text-sm space-y-1">
                <li>• Fuel efficiency below industry benchmark</li>
                <li>• Load utilization has room for optimization</li>
                <li>• Route optimization opportunities identified</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-blue-600">Recommendations</h4>
              <ul className="text-sm space-y-1">
                <li>• Implement driver training for fuel efficiency</li>
                <li>• Optimize routing algorithms</li>
                <li>• Consider fleet modernization initiatives</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}