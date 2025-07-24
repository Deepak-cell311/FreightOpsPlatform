import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { memo, useEffect } from "react";
import { 
  Truck, 
  Users, 
  DollarSign, 
  BarChart3, 
  Shield, 
  Zap, 
  MapPin, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Star,
  TrendingUp,
  Building2,
  Globe,
  Smartphone
} from "lucide-react";
import logoImage from "@assets/file_000000002eb461fd852b4b0e04724190_1749352807925.png";

// Memoized header component for better performance
const HeaderSection = memo(() => (
  <header className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center py-4">
        <div className="flex items-center">
          <img 
            src={logoImage} 
            alt="FreightOps Pro" 
            className="h-16 w-auto object-contain"
            loading="eager"
            decoding="async"
          />
        </div>
        
        <div className="flex space-x-3">
          <Button 
            variant="ghost"
            onClick={() => window.location.href = '/login'}
            className="text-gray-600 hover:text-gray-900"
          >
            Sign In
          </Button>
          <Button 
            onClick={() => window.location.href = '/register'}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Get Started Free
          </Button>
        </div>
      </div>
    </div>
  </header>
));

HeaderSection.displayName = 'HeaderSection';

export default function Landing() {
  // Preload critical images for better performance
  useEffect(() => {
    const preloadImage = new Image();
    preloadImage.src = logoImage;
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <HeaderSection />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <Badge className="mb-6 bg-blue-100 text-blue-700 border-blue-200">
              🚀 Industry Leading Transportation Platform
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Complete Trucking
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Management Platform
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              All-in-one solution for fleet management, financial services, compliance monitoring, 
              and AI-powered insights. Built specifically for transportation companies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => window.location.href = '/register'}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => window.location.href = '/login'}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg"
              >
                View Demo
              </Button>
            </div>
            
            <div className="mt-12 flex items-center justify-center space-x-8">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                30-day free trial
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                24/7 support
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Your Fleet
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools designed specifically for transportation companies
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Fleet Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Complete vehicle and driver management with real-time tracking, maintenance scheduling, and compliance monitoring.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Financial Services</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Integrated banking, invoicing, and payment processing with real-time financial insights and reporting.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">DOT Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Automated compliance monitoring, safety reporting, and regulatory documentation management.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">AI Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Intelligent insights for route optimization, fuel efficiency, and predictive maintenance.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">HR & Payroll</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Complete employee management with payroll processing, benefits administration, and driver onboarding.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Mobile App</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Native mobile apps for drivers with ELD integration, hours of service tracking, and load management.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Transportation Leaders
            </h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">1,000+</div>
              <div className="text-gray-600">Active Fleets</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">50,000+</div>
              <div className="text-gray-600">Drivers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">$2B+</div>
              <div className="text-gray-600">Processed Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Fleet Operations?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of transportation companies already using FreightOps Pro
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/register'}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
          >
            Start Your Free Trial Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img 
                src={logoImage} 
                alt="FreightOps Pro" 
                className="h-10 w-auto mb-4 brightness-0 invert"
                loading="lazy"
              />
              <p className="text-gray-400">
                The complete transportation management platform for modern fleets.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
                <li><a href="#" className="hover:text-white">Mobile App</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FreightOps Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}