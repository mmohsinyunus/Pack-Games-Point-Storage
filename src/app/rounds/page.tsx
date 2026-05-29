'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { RoundForm } from '@/components/forms/RoundForm';
import { useRounds } from '@/lib/hooks/useRounds';
import { useGames } from '@/lib/hooks/useGames';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Plus, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RoundsPage() {
  const { rounds, isLoading } = useRounds();
  const { games } = useGames();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('');
  const router = useRouter();

  if (isLoading) return <LoadingSpinner size="lg" />;

  const filtered = filter ? rounds.filter((r) => r.gameId === filter) : rounds;
  const sortedRounds = [...filtered].reverse();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Rounds</h1>
          <p className="text-gray-400 text-sm mt-0.5">{rounds.length} total</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} />
          New Round
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('')}
          className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            !filter ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'glass text-gray-400 hover:text-white'
          }`}
        >
          All
        </button>
        {games.map((g) => (
          <button
            key={g.id}
            onClick={() => setFilter(g.id)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-1 ${
              filter === g.id ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'glass text-gray-400 hover:text-white'
            }`}
          >
            {g.suit} {g.name}
          </button>
        ))}
      </div>

      {sortedRounds.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon="🎮"
            title="No rounds yet"
            description="Create your first round to start recording points"
            action={
              <Button onClick={() => setShowForm(true)}>
                <Plus size={16} />
                New Round
              </Button>
            }
          />
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {sortedRounds.map((round) => (
            <Link
              key={round.id}
              href={`/rounds/${round.id}`}
              className="block glass rounded-2xl p-4 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-gray-100 group-hover:text-white truncate">
                      {round.name}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500">
                    {round.gameName} · {formatDate(round.date)}
                    {round.closedAt && ` · Closed ${formatDate(round.closedAt)}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <Badge variant={round.status === 'open' ? 'success' : round.status === 'closing' ? 'warning' : 'neutral'}>
                    {round.status}
                  </Badge>
                  <ChevronRight size={16} className="text-gray-500 group-hover:text-gray-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Create New Round">
        <RoundForm
          games={games}
          onSuccess={(id) => {
            setShowForm(false);
            router.push(`/rounds/${id}`);
          }}
        />
      </Modal>
    </div>
  );
}
