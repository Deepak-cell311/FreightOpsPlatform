import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiration
const CHECK_INTERVAL = 60 * 1000; // Check every minute

export function useSessionManagement() {
  const { user, logoutMutation, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningShownRef = useRef(false);
  const lastActivityRef = useRef(Date.now());

  // Update last activity time
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;
    
    // Update localStorage expiration
    const stored = localStorage.getItem('freightops_session');
    if (stored) {
      try {
        const sessionData = JSON.parse(stored);
        sessionData.expiresAt = Date.now() + SESSION_TIMEOUT;
        localStorage.setItem('freightops_session', JSON.stringify(sessionData));
      } catch (error) {
        console.warn('Failed to update session expiration:', error);
      }
    }
  }, []);

  // Check session validity
  const checkSession = useCallback(() => {
    if (!isAuthenticated) return;

    const now = Date.now();
    const timeSinceActivity = now - lastActivityRef.current;
    const timeUntilExpiry = SESSION_TIMEOUT - timeSinceActivity;

    // Check localStorage session
    const stored = localStorage.getItem('freightops_session');
    if (stored) {
      try {
        const sessionData = JSON.parse(stored);
        if (sessionData.expiresAt <= now) {
          // Session expired
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          });
          logoutMutation.mutate();
          return;
        }
      } catch (error) {
        // Invalid session data
        logoutMutation.mutate();
        return;
      }
    }

    // Show warning if close to expiry
    if (timeUntilExpiry <= WARNING_TIME && !warningShownRef.current) {
      warningShownRef.current = true;
      toast({
        title: "Session Warning",
        description: "Your session will expire in 5 minutes. Please save your work.",
        variant: "default",
      });
    }

    // Auto-logout if session expired
    if (timeUntilExpiry <= 0) {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
      logoutMutation.mutate();
    }
  }, [isAuthenticated, logoutMutation, toast]);

  // Set up activity listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      updateActivity();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Set up session check interval
    const intervalId = setInterval(checkSession, CHECK_INTERVAL);

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearInterval(intervalId);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isAuthenticated, updateActivity, checkSession]);

  // Initialize session on user login
  useEffect(() => {
    if (user && isAuthenticated) {
      updateActivity();
    }
  }, [user, isAuthenticated, updateActivity]);

  return {
    updateActivity,
    checkSession,
  };
}