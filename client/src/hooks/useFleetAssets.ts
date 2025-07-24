import { useQuery } from '@tanstack/react-query';

export function useFleetAssets() {
  return useQuery({
    queryKey: ['fleetAssets'],
    queryFn: async () => {
      const res = await fetch('/api/fleet/assets');
      if (!res.ok) throw new Error('Failed to fetch fleet assets');
      return res.json();
    }
  });
}