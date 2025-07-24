import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Eye, EyeOff, Truck, Building2, Lock, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function HQLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  // Redirect if already authenticated with platform_owner role
  useEffect(() => {
    if (isAuthenticated && user?.role === 'platform_owner') {
      setLocation("/hq");
    }
  }, [isAuthenticated, user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch('/hq/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, employeeId }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh auth state to reflect new authentication
        await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        toast({
          title: "Login Successful",
          description: "Welcome to HQ Admin Portal",
        });
        // Small delay to ensure auth state updates before navigation
        setTimeout(() => setLocation("/hq"), 100);
      } else {
        const errorMsg = data.error || "Invalid credentials";
        setError(errorMsg);
        toast({
          title: "Login Failed",
          description: errorMsg,
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMsg = "Network error. Please try again.";
      setError(errorMsg);
      toast({
        title: "Login Failed",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero section with graphics */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold">FreightOps Pro</h1>
            </div>
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              HQ Employee Portal<br />
              Platform Administration
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              FreightOps Pro employee access for platform management, tenant oversight, and system administration.
            </p>
          </div>
          
          {/* Feature highlights */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Building2 className="h-5 w-5" />
              </div>
              <span>Multi-tenant platform administration</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <BarChart3 className="h-5 w-5" />
              </div>
              <span>Advanced analytics & reporting</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Shield className="h-5 w-5" />
              </div>
              <span>Enterprise-grade security & compliance</span>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full"></div>
        <div className="absolute bottom-20 right-32 w-20 h-20 bg-white/5 rounded-full"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-white/5 rounded-full"></div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">HQ Admin Portal</h2>
            <p className="mt-2 text-gray-600">
              Access the enterprise administration dashboard
            </p>
          </div>

          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="employeeId" className="text-sm font-medium text-gray-700">
                    Employee ID
                  </Label>
                  <Input
                    id="employeeId"
                    type="text"
                    placeholder="708637"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                    disabled={isLoading}
                    className="mt-1 h-12 text-base"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Enter your 6-digit FreightOps Pro employee ID
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@freightopspro.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="mt-1 h-12 text-base"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-12 pr-12 text-base"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Lock className="h-4 w-4" />
                      <span>Access HQ Dashboard</span>
                    </div>
                  )}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Authorized personnel only • Secure enterprise access
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}