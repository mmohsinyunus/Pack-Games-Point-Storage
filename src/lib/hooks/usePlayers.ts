import useSWR, { mutate } from 'swr';
import type { Player } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function usePlayers() {
  const { data, error, isLoading } = useSWR<{ data: Player[] }>('/api/players', fetcher);
  return {
    players: data?.data ?? [],
    error: error || (data as { error?: string })?.error,
    isLoading,
    refresh: () => mutate('/api/players'),
  };
}

export function usePlayer(id: string | null) {
  const { data, error, isLoading } = useSWR<{ data: Player }>(
    id ? `/api/players/${id}` : null,
    fetcher
  );
  return { player: data?.data, error, isLoading };
}

export function usePlayerScores(id: string | null) {
  const { data, error, isLoading } = useSWR(
    id ? `/api/players/${id}/scores` : null,
    fetcher
  );
  return { stats: data?.data, error, isLoading };
}
