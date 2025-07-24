import { useState, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';

// Navigation cache to prevent content loss during route transitions
const navigationCache = new Map<string, any>();
const componentInstances = new Map<string, React.ReactNode>();

export function useNavigationCache() {
  const [location] = useLocation();
  const [cachedData, setCachedData] = useState<any>(null);
  const lastLocationRef = useRef(location);

  // Cache data when location changes
  const cacheNavigationData = useCallback((key: string, data: any) => {
    navigationCache.set(key, data);
  }, []);

  // Retrieve cached data
  const getCachedData = useCallback((key: string) => {
    return navigationCache.get(key);
  }, []);

  // Clear cache for specific route
  const clearCache = useCallback((key?: string) => {
    if (key) {
      navigationCache.delete(key);
      componentInstances.delete(key);
    } else {
      navigationCache.clear();
      componentInstances.clear();
    }
  }, []);

  // Check if we're in a submenu transition
  const isSubmenuTransition = useCallback(() => {
    const currentBase = location.split('/')[1] || '';
    const lastBase = lastLocationRef.current.split('/')[1] || '';
    return currentBase === lastBase;
  }, [location]);

  return {
    location,
    cachedData,
    cacheNavigationData,
    getCachedData,
    clearCache,
    isSubmenuTransition
  };
}

// Component wrapper to maintain state during navigation
export function withNavigationCache<T extends object>(
  Component: React.ComponentType<T>,
  cacheKey: string
) {
  return function CachedComponent(props: T) {
    const { location, isSubmenuTransition } = useNavigationCache();
    
    // Use cached instance during submenu transitions
    if (isSubmenuTransition() && componentInstances.has(cacheKey)) {
      return componentInstances.get(cacheKey) as React.ReactNode;
    }

    // Create new instance and cache it
    const instance = <Component {...props} />;
    componentInstances.set(cacheKey, instance);
    
    return instance;
  };
}