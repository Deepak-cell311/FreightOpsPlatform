import { useAuth } from "@/hooks/use-auth";
import { useSessionTimeout } from "@/hooks/use-session-timeout";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import TenantSidebar from "./tenant-sidebar";
import TenantTopNavigation from "./tenant-top-navigation";
import { Button } from "@/components/ui/button";
import { Bell, Menu } from "lucide-react";

interface TenantLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export default function TenantLayout({ children, title, description }: TenantLayoutProps) {
  const { user, isLoading: userLoading, isAuthenticated } = useAuth();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [location] = useLocation();

  // Initialize session timeout
  const { triggerActivity, getRemainingTime } = useSessionTimeout({
    timeoutMinutes: 30,
    warningMinutes: 5,
    checkIntervalSeconds: 60
  });

  // Enhanced desktop mode detection
  function useDesktopMode() {
    const [isDesktopMode, setIsDesktopMode] = useState(false);

    useEffect(() => {
      const checkDesktopMode = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const userAgent = navigator.userAgent;
        
        const isDesktopRequest = 
          (/iPad|iPhone|iPod/.test(userAgent) && !/Mobile/.test(userAgent)) ||
          (/Android/.test(userAgent) && !/Mobile/.test(userAgent) && !/wv/.test(userAgent)) ||
          (/Chrome/.test(userAgent) && /Android/.test(userAgent) && width >= 1024) ||
          width >= 1024 ||
          (width >= 768 && width > height && width >= 1024);
        
        setIsDesktopMode(isDesktopRequest);
      };

      checkDesktopMode();
      window.addEventListener('resize', checkDesktopMode);
      window.addEventListener('orientationchange', checkDesktopMode);

      return () => {
        window.removeEventListener('resize', checkDesktopMode);
        window.removeEventListener('orientationchange', checkDesktopMode);
      };
    }, []);

    return isDesktopMode;
  }

  const isDesktopMode = useDesktopMode();

  // Show loading state
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Handle activity tracking
  useEffect(() => {
    const handleActivity = () => triggerActivity();
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [triggerActivity]);

  // Desktop Layout
  if (isDesktopMode) {
    return (
      <div className="flex h-screen bg-gray-100">
        <TenantSidebar user={user} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <TenantTopNavigation 
            user={user}
            title={title}
            description={description}
          />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Mobile Layout
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
                {description && (
                  <p className="text-sm text-gray-600">{description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}