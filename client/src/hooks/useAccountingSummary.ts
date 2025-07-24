import { useQuery } from '@tanstack/react-query';

export function useAccountingSummary() {
  return useQuery({
    queryKey: ['accountingSummary'],
    queryFn: async () => {
      const res = await fetch('/api/accounting/summary');
      if (!res.ok) throw new Error('Failed to fetch accounting summary');
      return res.json();
    }
  });
}