'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AvatarChip } from '@/components/ui/AvatarChip';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { PlayerForm } from '@/components/forms/PlayerForm';
import { usePlayers } from '@/lib/hooks/usePlayers';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { UserPlus, TrendingUp } from 'lucide-react';

export default function PlayersPage() {
  const { players, isLoading } = usePlayers();
  const [showForm, setShowForm] = useState(false);

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Players</h1>
          <p className="text-gray-400 text-sm mt-0.5">{players.length} registered</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <UserPlus size={16} />
          Register Player
        </Button>
      </div>

      {players.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon="👤"
            title="No players yet"
            description="Register your first player to get started"
            action={
              <Button onClick={() => setShowForm(true)}>
                <UserPlus size={16} />
                Register Player
              </Button>
            }
          />
        </GlassCard>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player, idx) => {
            const suits = ['♠', '♥', '♦', '♣'];
            return (
              <Link key={player.id} href={`/players/${player.id}`}>
                <GlassCard
                  suit={suits[idx % suits.length]}
                  hover
                  className="h-full"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <AvatarChip name={player.name} color={player.avatarColor} size="lg" />
                    <div>
                      <h3 className="font-bold text-white">{player.name}</h3>
                      <p className="text-xs text-gray-400">{player.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <TrendingUp size={12} />
                      <span>Total Points</span>
                    </div>
                    <span className={`text-lg font-bold ${
                      Number(player.totalPoints) > 0 ? 'text-emerald-400' :
                      Number(player.totalPoints) < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {Number(player.totalPoints) > 0 ? '+' : ''}{Number(player.totalPoints)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Joined {formatDate(player.createdAt)}
                  </p>
                </GlassCard>
              </Link>
            );
          })}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Register New Player">
        <PlayerForm onSuccess={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
