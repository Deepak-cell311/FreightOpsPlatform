import { useQuery } from '@tanstack/react-query';

export function useDispatchLoads() {
  return useQuery({
    queryKey: ['dispatchLoads'],
    queryFn: async () => {
      const res = await fetch('/api/dispatch/loads');
      if (!res.ok) throw new Error('Failed to fetch dispatch loads');
      return res.json();
    }
  });
}