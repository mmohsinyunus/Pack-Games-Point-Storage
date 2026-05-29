import useSWR from 'swr';
import type { DashboardStats } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useDashboard(gameId?: string, from?: string, to?: string) {
  const params = new URLSearchParams();
  if (gameId) params.set('gameId', gameId);
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const key = `/api/dashboard?${params.toString()}`;

  const { data, error, isLoading } = useSWR<{ data: DashboardStats }>(key, fetcher);
  return {
    stats: data?.data,
    error: error || (data as { error?: string })?.error,
    isLoading,
  };
}
