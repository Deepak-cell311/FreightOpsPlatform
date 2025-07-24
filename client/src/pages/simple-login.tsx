import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Truck, Shield, Users, DollarSign, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";

export default function SimpleLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, customerId }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        // Force refresh the user query to get updated auth state
        await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        
        toast({
          title: "Login Successful",
          description: "Welcome to FreightOps Pro",
        });
        
        // Small delay to ensure auth state is updated
        setTimeout(() => {
          navigate("/dashboard");
        }, 100);
      } else {
        toast({
          title: "Login Failed",
          description: data.error || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Login Error",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Features */}
        <div className="hidden lg:block space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              FreightOps Pro
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Complete transportation management platform with integrated banking and compliance
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Fleet Management</h3>
                <p className="text-gray-600">Real-time tracking, maintenance, and driver management</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Integrated Banking</h3>
                <p className="text-gray-600">Railsr Banking-as-a-Service with corporate cards</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Compliance & Safety</h3>
                <p className="text-gray-600">FMCSA integration and automated compliance monitoring</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">HR & Payroll</h3>
                <p className="text-gray-600">Complete employee management with Gusto integration</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerId">Company ID</Label>
                  <Input
                    id="customerId"
                    type="text"
                    placeholder="Company ID, USDOT Number, or MC Number"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    required
                    autoComplete="organization"
                  />
                  <p className="text-sm text-gray-500">
                    Enter your Company ID, USDOT Number, or MC Number for additional security
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={!email || !password || !customerId}
                >
                  Sign In
                </Button>
              </form>

              <Separator />



              <div className="text-center text-sm">
                <span className="text-gray-600">Need help? </span>
                <Button
                  variant="link"
                  className="p-0 h-auto text-sm"
                  onClick={() => navigate("/register")}
                >
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => navigate("/hq-login")}
              className="text-sm"
            >
              HQ Admin Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}