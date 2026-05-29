'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import type { Game } from '@/lib/types';
import { mutate } from 'swr';

interface FormData {
  gameId: string;
  name: string;
  date: string;
}

interface RoundFormProps {
  games: Game[];
  defaultGameId?: string;
  onSuccess?: (roundId: string) => void;
}

export function RoundForm({ games, defaultGameId, onSuccess }: RoundFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    defaultValues: {
      gameId: defaultGameId ?? '',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: FormData) => {
    const res = await fetch('/api/rounds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      setError('root', { message: json.error ?? 'Failed to create round' });
      return;
    }
    mutate('/api/rounds');
    if (data.gameId) mutate(`/api/rounds?gameId=${data.gameId}`);
    reset();
    onSuccess?.(json.data.id);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Game *</label>
        <select
          {...register('gameId', { required: 'Please select a game' })}
          className="input-field"
        >
          <option value="">Select game…</option>
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              {g.suit} {g.name}
            </option>
          ))}
        </select>
        {errors.gameId && <p className="mt-1 text-xs text-red-400">{errors.gameId.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Round Name *</label>
        <input
          {...register('name', { required: 'Round name is required' })}
          placeholder="e.g. Round 1, Sunday Game"
          className="input-field"
        />
        {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
        <input
          {...register('date')}
          type="date"
          className="input-field"
        />
      </div>

      {errors.root && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          {errors.root.message}
        </p>
      )}

      <Button type="submit" loading={isSubmitting} className="w-full">
        Create Round
      </Button>
    </form>
  );
}
