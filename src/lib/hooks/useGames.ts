import useSWR, { mutate } from 'swr';
import type { Game } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useGames() {
  const { data, error, isLoading } = useSWR<{ data: Game[] }>('/api/games', fetcher);
  return {
    games: data?.data ?? [],
    error: error || (data as { error?: string })?.error,
    isLoading,
    refresh: () => mutate('/api/games'),
  };
}

export function useGame(id: string | null) {
  const { data, error, isLoading } = useSWR(
    id ? `/api/games/${id}` : null,
    fetcher
  );
  return { gameStats: data?.data, error, isLoading };
}
