import useSWR, { mutate } from 'swr';
import type { Round } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useRounds(gameId?: string) {
  const key = gameId ? `/api/rounds?gameId=${gameId}` : '/api/rounds';
  const { data, error, isLoading } = useSWR<{ data: Round[] }>(key, fetcher);
  return {
    rounds: data?.data ?? [],
    error: error || (data as { error?: string })?.error,
    isLoading,
    refresh: () => mutate(key),
  };
}

export function useRound(id: string | null) {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    id ? `/api/rounds/${id}` : null,
    fetcher
  );
  return {
    roundData: data?.data,
    error: error || (data as { error?: string })?.error,
    isLoading,
    refresh: revalidate,
  };
}
