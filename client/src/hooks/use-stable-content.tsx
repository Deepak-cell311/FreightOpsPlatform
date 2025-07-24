import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';

// Cache to store component state across route changes
const componentCache = new Map<string, any>();

export function useStableContent<T>(
  key: string,
  fetcher: () => Promise<T> | T,
  dependencies: any[] = []
) {
  const [location] = useLocation();
  const [data, setData] = useState<T | null>(() => componentCache.get(key) || null);
  const [isLoading, setIsLoading] = useState(!componentCache.has(key));
  const fetcherRef = useRef(fetcher);
  const lastFetchKey = useRef<string>('');

  // Update fetcher ref when it changes
  fetcherRef.current = fetcher;

  useEffect(() => {
    const fetchKey = `${key}-${JSON.stringify(dependencies)}`;
    
    // Skip fetch if we already have this data
    if (lastFetchKey.current === fetchKey && componentCache.has(key)) {
      return;
    }

    let isCancelled = false;
    
    const loadData = async () => {
      setIsLoading(true);
      try {
        const result = await fetcherRef.current();
        
        if (!isCancelled) {
          setData(result);
          componentCache.set(key, result);
          lastFetchKey.current = fetchKey;
        }
      } catch (error) {
        console.error(`Error fetching ${key}:`, error);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [key, ...dependencies]);

  return { data, isLoading };
}

// Cache manager for manual cache operations
export const contentCache = {
  get: (key: string) => componentCache.get(key),
  set: (key: string, value: any) => {
    componentCache.set(key, value);
  },
  clear: (key?: string): void => {
    if (key) {
      componentCache.delete(key);
    } else {
      componentCache.clear();
    }
  },
  has: (key: string): boolean => componentCache.has(key)
};