'use client';

import { useParams } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Leaderboard } from '@/components/charts/Leaderboard';
import { Badge } from '@/components/ui/Badge';
import { useGame } from '@/lib/hooks/useGames';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import type { Round } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { RoundForm } from '@/components/forms/RoundForm';
import { mutate } from 'swr';

export default function GamePage() {
  const { id } = useParams<{ id: string }>();
  const { gameStats, isLoading } = useGame(id);
  const [showRoundForm, setShowRoundForm] = useState(false);

  if (isLoading) return <LoadingSpinner size="lg" />;
  if (!gameStats) return <div className="text-gray-400">Game not found.</div>;

  const { game, roundsCount, playersCount, leaderboard, rounds } = gameStats as {
    game: { id: string; name: string; suit: string; description: string };
    roundsCount: number;
    playersCount: number;
    leaderboard: import('@/lib/types').PlayerScore[];
    rounds: Round[];
  };

  return (
    <div className="space-y-6">
      <Link href="/games" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={14} />
        All Games
      </Link>

      {/* Game header */}
      <GlassCard suit={game.suit} className="flex items-center gap-4">
        <span className="text-5xl">{game.suit}</span>
        <div>
          <h1 className="text-2xl font-bold text-white">{game.name}</h1>
          {game.description && <p className="text-gray-400 text-sm mt-1">{game.description}</p>}
        </div>
      </GlassCard>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard>
          <p className="text-xs text-gray-400">Total Rounds</p>
          <p className="stat-value">{roundsCount}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs text-gray-400">Players</p>
          <p className="stat-value">{playersCount}</p>
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Leaderboard for this game */}
        <GlassCard suit="♠">
          <h2 className="text-base font-bold text-white mb-4">Game Leaderboard</h2>
          <Leaderboard scores={leaderboard} />
        </GlassCard>

        {/* Rounds list */}
        <GlassCard suit="♣">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">Rounds</h2>
            <Button size="sm" onClick={() => setShowRoundForm(true)}>
              <Plus size={14} />
              New Round
            </Button>
          </div>
          {rounds.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No rounds yet.</p>
          ) : (
            <div className="space-y-2">
              {[...rounds].reverse().map((r) => (
                <Link
                  key={r.id}
                  href={`/rounds/${r.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/10 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-200 group-hover:text-white">{r.name}</p>
                    <p className="text-xs text-gray-500">{formatDate(r.date)}</p>
                  </div>
                  <Badge variant={r.status === 'open' ? 'success' : r.status === 'closing' ? 'warning' : 'neutral'}>
                    {r.status}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      <Modal open={showRoundForm} onClose={() => setShowRoundForm(false)} title="Create New Round">
        <RoundForm
          games={[game as import('@/lib/types').Game]}
          defaultGameId={game.id}
          onSuccess={() => {
            setShowRoundForm(false);
            mutate(`/api/games/${game.id}`);
          }}
        />
      </Modal>
    </div>
  );
}
