'use client';

import { useParams } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { AvatarChip } from '@/components/ui/AvatarChip';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { GameBreakdownChart } from '@/components/charts/GameBreakdownChart';
import { usePlayerScores } from '@/lib/hooks/usePlayers';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, Trophy, Gamepad2, Play, TrendingUp } from 'lucide-react';
import type { PlayerStats } from '@/lib/types';

export default function PlayerPage() {
  const { id } = useParams<{ id: string }>();
  const { stats, isLoading } = usePlayerScores(id);

  if (isLoading) return <LoadingSpinner size="lg" />;
  if (!stats) return <div className="text-gray-400">Player not found.</div>;

  const playerStats = stats as PlayerStats;

  return (
    <div className="space-y-6">
      <Link href="/players" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={14} />
        All Players
      </Link>

      {/* Profile header */}
      <GlassCard suit="♠" className="flex items-center gap-5">
        <AvatarChip name={playerStats.player.name} color={playerStats.player.avatarColor} size="xl" />
        <div>
          <h1 className="text-2xl font-bold text-white">{playerStats.player.name}</h1>
          <p className="text-gray-400 text-sm">{playerStats.player.email}</p>
        </div>
      </GlassCard>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Points', value: playerStats.totalPoints > 0 ? `+${playerStats.totalPoints}` : playerStats.totalPoints, icon: Trophy, color: 'text-amber-400' },
          { label: 'Games Played', value: playerStats.gamesPlayed, icon: Gamepad2, color: 'text-indigo-400' },
          { label: 'Rounds Played', value: playerStats.roundsPlayed, icon: Play, color: 'text-emerald-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <GlassCard key={label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="stat-value mt-1">{value}</p>
              </div>
              <Icon size={18} className={color} />
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Points by game */}
        <GlassCard suit="♦">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-400" />
            Points by Game
          </h2>
          {playerStats.pointsByGame.length ? (
            <>
              <div className="space-y-2 mb-4">
                {playerStats.pointsByGame.map((g) => (
                  <div key={g.gameId} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{g.suit}</span>
                      <span className="text-sm font-medium text-gray-200">{g.gameName}</span>
                    </div>
                    <span className={`font-bold text-sm ${
                      g.totalPoints > 0 ? 'text-emerald-400' :
                      g.totalPoints < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {g.totalPoints > 0 ? '+' : ''}{g.totalPoints}
                    </span>
                  </div>
                ))}
              </div>
              <GameBreakdownChart data={playerStats.pointsByGame} />
            </>
          ) : (
            <p className="text-gray-400 text-sm">No games played yet.</p>
          )}
        </GlassCard>

        {/* Recent activity */}
        <GlassCard suit="♣">
          <h2 className="text-base font-bold text-white mb-4">Recent Activity</h2>
          {playerStats.recentPoints.length ? (
            <div className="space-y-2">
              {playerStats.recentPoints.map((pt) => (
                <div key={pt.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
                  <div>
                    <p className="text-sm font-medium text-gray-200">{pt.roundName}</p>
                    <p className="text-xs text-gray-500">{pt.gameName} · {formatDateTime(pt.recordedAt)}</p>
                  </div>
                  <span className={`font-bold text-sm ${
                    pt.points > 0 ? 'text-emerald-400' :
                    pt.points < 0 ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {pt.points > 0 ? '+' : ''}{pt.points}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No activity yet.</p>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
