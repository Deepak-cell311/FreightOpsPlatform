import { useEffect, useRef, useCallback, useState } from 'react';
import { useToast } from './use-toast';

interface SessionTimeoutOptions {
  timeoutMinutes: number;
  warningMinutes: number;
  checkIntervalSeconds: number;
}

export function useSessionTimeout({ 
  timeoutMinutes = 120, // 2 hours default
  warningMinutes = 5, 
  checkIntervalSeconds = 60 
}: SessionTimeoutOptions) {
  const { toast } = useToast();
  const lastActivityRef = useRef<number>(Date.now());
  const warningShownRef = useRef<boolean>(false);
  const timeoutIdRef = useRef<NodeJS.Timeout>();
  const intervalIdRef = useRef<NodeJS.Timeout>();
  const [sessionExpired, setSessionExpired] = useState(false);

  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = warningMinutes * 60 * 1000;

  // Update activity timestamp
  const triggerActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;
    setSessionExpired(false);
    
    // Update localStorage session expiration
    const stored = localStorage.getItem('freightops_session');
    if (stored) {
      try {
        const sessionData = JSON.parse(stored);
        sessionData.expiresAt = Date.now() + timeoutMs;
        localStorage.setItem('freightops_session', JSON.stringify(sessionData));
      } catch (error) {
        console.warn('Failed to update session timestamp:', error);
      }
    }
  }, [timeoutMs]);

  // Handle session timeout
  const handleTimeout = useCallback(() => {
    setSessionExpired(true);
    localStorage.clear();
    
    toast({
      title: "Session Expired",
      description: "Your session has expired due to inactivity. Please log in again.",
      variant: "destructive",
      duration: 5000,
    });

    // Force logout after a brief delay
    setTimeout(() => {
      window.location.href = "/api/logout";
    }, 2000);
  }, [toast]);

  // Check session status
  const checkSession = useCallback(() => {
    const now = Date.now();
    const timeSinceActivity = now - lastActivityRef.current;
    const timeUntilExpiry = timeoutMs - timeSinceActivity;

    // Check localStorage session validity
    const stored = localStorage.getItem('freightops_session');
    if (stored) {
      try {
        const sessionData = JSON.parse(stored);
        if (sessionData.expiresAt && sessionData.expiresAt <= now) {
          handleTimeout();
          return;
        }
      } catch (error) {
        handleTimeout();
        return;
      }
    }

    // Show warning if approaching timeout
    if (timeUntilExpiry <= warningMs && timeUntilExpiry > 0 && !warningShownRef.current) {
      warningShownRef.current = true;
      const minutesLeft = Math.ceil(timeUntilExpiry / (60 * 1000));
      
      toast({
        title: "Session Warning",
        description: `Your session will expire in ${minutesLeft} minutes. Please save your work.`,
        variant: "default",
        duration: 10000,
      });
    }

    // Handle timeout
    if (timeUntilExpiry <= 0) {
      handleTimeout();
    }
  }, [timeoutMs, warningMs, handleTimeout, toast]);

  // Get remaining time in minutes
  const getRemainingTime = useCallback(() => {
    const now = Date.now();
    const timeSinceActivity = now - lastActivityRef.current;
    const timeUntilExpiry = timeoutMs - timeSinceActivity;
    return Math.max(0, Math.ceil(timeUntilExpiry / (60 * 1000)));
  }, [timeoutMs]);

  // Set up activity listeners and session checking
  useEffect(() => {
    const events = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 
      'touchstart', 'click', 'focus', 'blur'
    ];
    
    // Activity handler
    const handleActivity = () => {
      triggerActivity();
    };

    // Add event listeners for user activity
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Set up periodic session checking
    intervalIdRef.current = setInterval(checkSession, checkIntervalSeconds * 1000);

    // Initial activity trigger
    triggerActivity();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [triggerActivity, checkSession, checkIntervalSeconds]);

  return {
    triggerActivity,
    getRemainingTime,
    sessionExpired,
    checkSession,
  };
}