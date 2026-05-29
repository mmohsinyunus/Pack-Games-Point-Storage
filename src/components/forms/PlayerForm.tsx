'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { AVATAR_COLORS } from '@/lib/utils';
import { mutate } from 'swr';

interface FormData {
  name: string;
  email: string;
  avatarColor: string;
}

interface PlayerFormProps {
  onSuccess?: () => void;
}

export function PlayerForm({ onSuccess }: PlayerFormProps) {
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({ defaultValues: { avatarColor: AVATAR_COLORS[0] } });

  const onSubmit = async (data: FormData) => {
    const res = await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, avatarColor: selectedColor }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError('root', { message: json.error ?? 'Failed to register player' });
      return;
    }
    await mutate('/api/players');
    reset();
    setSelectedColor(AVATAR_COLORS[0]);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
        <input
          {...register('name', { required: 'Name is required' })}
          placeholder="Enter player name"
          className="input-field"
        />
        {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
        <input
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
          })}
          type="email"
          placeholder="player@example.com"
          className="input-field"
        />
        {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Avatar Color</label>
        <div className="flex gap-2 flex-wrap">
          {AVATAR_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                selectedColor === color ? 'ring-2 ring-offset-2 ring-offset-transparent ring-white scale-110' : ''
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {errors.root && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          {errors.root.message}
        </p>
      )}

      <Button type="submit" loading={isSubmitting} className="w-full">
        Register Player
      </Button>
    </form>
  );
}
