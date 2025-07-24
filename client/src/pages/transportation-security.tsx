import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield,
  Trophy,
  Award,
  Target,
  TrendingUp,
  CheckCircle2,
  Crown,
  Star,
  Truck,
  MapPin,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Lock
} from "lucide-react";
import { Link } from "wouter";

export default function TransportationSecurity() {
  return (
    <DashboardLayout title="Transportation Security">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/settings">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Settings
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Transportation Security & Achievements</h1>
          <p className="text-gray-500 mt-2">
            Fleet security, driver trust levels, and transportation achievement system
          </p>
        </div>

        {/* Trust Level & Security Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Crown className="h-5 w-5 mr-2 text-green-600" />
                Fleet Trust Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-700">Platinum</span>
                  <Badge className="bg-green-100 text-green-700">Level 4</Badge>
                </div>
                <Progress value={85} className="h-3" />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>85% to Diamond</span>
                  <span>Next: Level 5</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-600" />
                Security Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-700">94/100</span>
                  <Badge className="bg-blue-100 text-blue-700">Excellent</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Driver Verification</span>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex justify-between">
                    <span>Vehicle Security</span>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex justify-between">
                    <span>Load Monitoring</span>
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Target className="h-5 w-5 mr-2 text-purple-600" />
                Achievement Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-purple-700">12,850</span>
                  <Badge className="bg-purple-100 text-purple-700">Total</Badge>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>This Month</span>
                    <span className="font-semibold">+2,150</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Safety Bonus</span>
                    <span className="font-semibold">+500</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transportation Achievements */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Trophy className="h-6 w-6 mr-2 text-amber-600" />
              Transportation Achievements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  icon: Truck,
                  title: "Fleet Master",
                  description: "Successfully managed 50+ loads this month",
                  points: 1000,
                  color: "blue",
                  unlocked: true,
                  category: "Operations"
                },
                {
                  icon: Shield,
                  title: "Safety Champion",
                  description: "Zero safety incidents for 90 days",
                  points: 1500,
                  color: "green",
                  unlocked: true,
                  category: "Safety"
                },
                {
                  icon: Clock,
                  title: "On-Time Expert",
                  description: "98% on-time delivery rate",
                  points: 750,
                  color: "purple",
                  unlocked: true,
                  category: "Performance"
                },
                {
                  icon: MapPin,
                  title: "Route Optimizer",
                  description: "Reduced fuel costs by 15%",
                  points: 800,
                  color: "emerald",
                  unlocked: true,
                  category: "Efficiency"
                },
                {
                  icon: Star,
                  title: "Customer Favorite",
                  description: "4.9+ customer rating average",
                  points: 600,
                  color: "yellow",
                  unlocked: true,
                  category: "Service"
                },
                {
                  icon: Lock,
                  title: "Security Expert",
                  description: "Complete advanced security training",
                  points: 500,
                  color: "red",
                  unlocked: false,
                  category: "Security"
                }
              ].map((achievement, index) => {
                const IconComponent = achievement.icon;
                return (
                  <Card key={index} className={`${achievement.unlocked ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'} hover:shadow-md transition-shadow`}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${achievement.unlocked ? `bg-${achievement.color}-100` : 'bg-gray-200'}`}>
                          <IconComponent className={`h-5 w-5 ${achievement.unlocked ? `text-${achievement.color}-600` : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`font-semibold ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                              {achievement.title}
                            </h4>
                            {achievement.unlocked && (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <Badge variant="secondary" className="text-xs mb-2">
                            {achievement.category}
                          </Badge>
                          <p className={`text-sm ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'} mb-2`}>
                            {achievement.description}
                          </p>
                          <Badge variant={achievement.unlocked ? "default" : "secondary"} className="text-xs">
                            {achievement.points} pts
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Banking Security Integration */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Shield className="h-6 w-6 mr-2 text-blue-600" />
              Banking Security Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="freight-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="h-5 w-5 mr-2 text-blue-600" />
                    Enhanced Banking Privileges
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Daily Transfer Limit</span>
                      <span className="font-semibold text-blue-700">${securityData?.coverageAmount?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Instant Transfers</span>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Priority Support</span>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Advanced Analytics</span>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="freight-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Trust Level Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Reduced Verification</span>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Faster Load Approvals</span>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Premium Rates</span>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Express Payments</span>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Progress Tracking */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Target className="h-6 w-6 mr-2 text-purple-600" />
              Progress Tracking
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="freight-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Weekly Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Safety Score</span>
                        <span>94/100</span>
                      </div>
                      <Progress value={94} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>On-Time Delivery</span>
                        <span>18/20</span>
                      </div>
                      <Progress value={90} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="freight-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Monthly Targets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Load Completion</span>
                        <span>47/50</span>
                      </div>
                      <Progress value={94} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Fuel Efficiency</span>
                        <span>15% saved</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="freight-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Next Milestone</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-700">Diamond</div>
                      <div className="text-sm text-gray-600">Trust Level 5</div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Security Settings
          </Button>
          <Button variant="outline" className="flex items-center">
            <Trophy className="h-4 w-4 mr-2" />
            View All Achievements
          </Button>
          <Button variant="outline" className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Performance Analytics
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}