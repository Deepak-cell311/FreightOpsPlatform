import { useState, useEffect } from 'react';

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    screenWidth: 0,
    screenHeight: 0,
    orientation: 'portrait',
  });

  useEffect(() => {
    const updateResponsiveState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const orientation = width > height ? 'landscape' : 'portrait';
      
      // Define breakpoints
      const isMobile = width < 768; // Below tablet
      const isTablet = width >= 768 && width < 1024; // Tablet range
      const isDesktop = width >= 1024; // Desktop and above
      
      setState({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
        orientation,
      });
    };

    // Initial check
    updateResponsiveState();

    // Listen for resize events
    window.addEventListener('resize', updateResponsiveState);
    window.addEventListener('orientationchange', updateResponsiveState);

    return () => {
      window.removeEventListener('resize', updateResponsiveState);
      window.removeEventListener('orientationchange', updateResponsiveState);
    };
  }, []);

  return state;
}

// Hook for detecting when mobile device is in desktop mode
export function useDesktopMode() {
  const { isDesktop, isMobile, orientation, screenWidth } = useResponsive();
  
  // Consider it desktop mode if:
  // 1. Screen width is desktop size (1024px+), OR
  // 2. Device is explicitly requesting desktop mode (detected by user agent), OR
  // 3. Tablet or larger device in any orientation, OR
  // 4. Mobile device with desktop site request
  const isDesktopMode = isDesktop || 
                       (screenWidth >= 1024) || 
                       (screenWidth >= 768 && orientation === 'landscape') ||
                       checkDesktopModeRequest();
  
  return {
    isDesktopMode,
    shouldShowMobileNav: !isDesktopMode,
    shouldShowDesktopNav: isDesktopMode,
  };
}

// Function to detect if user has requested desktop mode
function checkDesktopModeRequest(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent;
  
  // Safari on iOS when "Request Desktop Website" is enabled
  // The user agent changes from Mobile Safari to Desktop Safari
  if (/iPad|iPhone|iPod/.test(userAgent) && !/Mobile/.test(userAgent)) {
    return true;
  }
  
  // Chrome on Android when "Desktop site" is enabled
  // Mobile indicator is removed from user agent
  if (/Android/.test(userAgent) && !/Mobile/.test(userAgent)) {
    return true;
  }
  
  // Firefox on mobile when desktop mode is requested
  if (/Mobile/.test(userAgent) && /Tablet/.test(userAgent)) {
    return true;
  }
  
  // Check for desktop user agent strings on mobile devices
  if ((/iPad|iPhone|iPod|Android/.test(userAgent)) && 
      (/Macintosh|Windows NT|X11/.test(userAgent))) {
    return true;
  }
  
  return false;
}