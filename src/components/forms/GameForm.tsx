'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { mutate } from 'swr';

interface FormData {
  name: string;
  description: string;
}

export function GameForm({ onSuccess }: { onSuccess?: () => void }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    const res = await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      setError('root', { message: json.error ?? 'Failed to register game' });
      return;
    }
    await mutate('/api/games');
    reset();
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Game Name *</label>
        <input
          {...register('name', { required: 'Game name is required' })}
          placeholder="e.g. Rummy 500, Poker, Teen Patti"
          className="input-field"
        />
        {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
        <textarea
          {...register('description')}
          placeholder="Optional description or rules"
          rows={3}
          className="input-field resize-none"
        />
      </div>

      {errors.root && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          {errors.root.message}
        </p>
      )}

      <Button type="submit" loading={isSubmitting} className="w-full">
        Register Game
      </Button>
    </form>
  );
}
