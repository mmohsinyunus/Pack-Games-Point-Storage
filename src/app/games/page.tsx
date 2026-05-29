'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { GameForm } from '@/components/forms/GameForm';
import { useGames } from '@/lib/hooks/useGames';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function GamesPage() {
  const { games, isLoading } = useGames();
  const [showForm, setShowForm] = useState(false);

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Games</h1>
          <p className="text-gray-400 text-sm mt-0.5">{games.length} registered</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} />
          Register Game
        </Button>
      </div>

      {games.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon="🎴"
            title="No games yet"
            description="Register your first game type to start tracking points"
            action={
              <Button onClick={() => setShowForm(true)}>
                <Plus size={16} />
                Register Game
              </Button>
            }
          />
        </GlassCard>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => (
            <Link key={game.id} href={`/games/${game.id}`}>
              <GlassCard suit={game.suit} hover className="h-full">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{game.suit}</span>
                  <div>
                    <h3 className="font-bold text-white">{game.name}</h3>
                    <p className="text-xs text-gray-400">Registered {formatDate(game.createdAt)}</p>
                  </div>
                </div>
                {game.description && (
                  <p className="text-sm text-gray-400 line-clamp-2">{game.description}</p>
                )}
              </GlassCard>
            </Link>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Register New Game">
        <GameForm onSuccess={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
