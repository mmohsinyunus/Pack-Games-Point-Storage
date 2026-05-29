'use client';

import { useParams } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PointsEntryTable } from '@/components/forms/PointsEntryTable';
import { Leaderboard } from '@/components/charts/Leaderboard';
import { useRound } from '@/lib/hooks/useRounds';
import { formatDate, formatDateTime } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, Trophy, CheckCircle } from 'lucide-react';
import type { Round, Player, PlayerScore } from '@/lib/types';

export default function RoundPage() {
  const { id } = useParams<{ id: string }>();
  const { roundData, isLoading, refresh } = useRound(id);

  if (isLoading) return <LoadingSpinner size="lg" />;
  if (!roundData) return <div className="text-gray-400">Round not found.</div>;

  const { round, scores, cumulativeScores, allPlayers } = roundData as {
    round: Round;
    scores: PlayerScore[];
    cumulativeScores: PlayerScore[] | null;
    allPlayers: Player[];
  };

  // Build initialPoints map from scores for PointsEntryTable
  const initialPoints: Record<string, number> = {};
  for (const s of scores) {
    initialPoints[s.playerId] = s.totalPoints;
  }

  return (
    <div className="space-y-6">
      <Link href="/rounds" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={14} />
        All Rounds
      </Link>

      {/* Round header */}
      <GlassCard className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-white">{round.name}</h1>
            <Badge variant={round.status === 'open' ? 'success' : round.status === 'closing' ? 'warning' : 'neutral'}>
              {round.status}
            </Badge>
          </div>
          <p className="text-gray-400 text-sm">
            {round.gameName} · {formatDate(round.date)}
          </p>
          {round.closedAt && (
            <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
              <CheckCircle size={12} className="text-emerald-400" />
              Closed {formatDateTime(round.closedAt)}
            </p>
          )}
        </div>
      </GlassCard>

      {round.status === 'closing' && (
        <div className="glass rounded-xl p-4 border border-amber-500/30 bg-amber-500/10">
          <p className="text-amber-300 text-sm">
            ⚠️ This round is being closed. If this persists, please refresh the page.
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Points entry / display */}
        <GlassCard suit="♠">
          <h2 className="text-base font-bold text-white mb-4">
            {round.status === 'open' ? 'Enter Points' : 'Round Points'}
          </h2>
          <PointsEntryTable
            round={round}
            players={allPlayers}
            initialPoints={initialPoints}
            onClose={refresh}
          />
        </GlassCard>

        {/* Cumulative leaderboard */}
        <GlassCard suit="♦">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={16} className="text-amber-400" />
            <h2 className="text-base font-bold text-white">
              {round.status === 'closed' ? 'Cumulative Standings' : 'Current Standings'}
            </h2>
          </div>
          {cumulativeScores ? (
            <Leaderboard scores={cumulativeScores} />
          ) : (
            <p className="text-gray-400 text-sm">Close the round to see cumulative totals.</p>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
