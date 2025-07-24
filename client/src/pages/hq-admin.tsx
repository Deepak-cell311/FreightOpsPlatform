import { useQuery } from "@tanstack/react-query";
import { useSessionTimeout } from "@/hooks/use-session-timeout";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { HQLayout } from "@/components/hq/HQLayout";

function HQAdmin() {
  const [location, setLocation] = useLocation();

  // Initialize session timeout with 30-minute timeout and 5-minute warning
  const { triggerActivity } = useSessionTimeout({
    timeoutMinutes: 30,
    warningMinutes: 5,
    checkIntervalSeconds: 60
  });

  // Check HQ authentication separately from tenant authentication
  const { data: hqUser, isLoading, isError } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      const response = await fetch('/api/user', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Not authenticated');
      }
      return response.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Check if user has HQ admin privileges
  const isHQAdmin = hqUser && ['super_admin', 'hq_admin', 'admin', 'platform_owner'].includes(hqUser.role);

  // Redirect logic
  useEffect(() => {
    if (isError || (!isLoading && !hqUser)) {
      setLocation("/hq-login");
      return;
    }
    
    if (hqUser && !isHQAdmin) {
      setLocation("/hq-login");
      return;
    }
  }, [isError, isLoading, hqUser, isHQAdmin, setLocation]);

  // Early returns after all hooks are called
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isError || !hqUser || !isHQAdmin) {
    return null;
  }

  return <HQLayout user={hqUser} />;
}

export default HQAdmin;