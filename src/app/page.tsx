'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Leaderboard } from '@/components/charts/Leaderboard';
import { PointsBarChart } from '@/components/charts/PointsBarChart';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { useGames } from '@/lib/hooks/useGames';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Trophy, Users, Gamepad2, Play, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const [gameFilter, setGameFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const { stats, isLoading } = useDashboard(
    gameFilter || undefined,
    dateFrom || undefined,
    dateTo || undefined
  );
  const { games } = useGames();

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span>♠</span>
            <span>Pack Points</span>
            <span className="text-red-400">♥</span>
          </h1>
          <p className="text-gray-400 mt-1">Track your game scores and climb the leaderboard</p>
        </div>
        <Link
          href="/rounds"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25"
        >
          <Play size={16} />
          New Round
        </Link>
      </div>

      {/* Filters */}
      <GlassCard className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs text-gray-400 mb-1">Filter by Game</label>
          <select
            value={gameFilter}
            onChange={(e) => setGameFilter(e.target.value)}
            className="input-field py-2 text-sm"
          >
            <option value="">All Games</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.suit} {g.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs text-gray-400 mb-1">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="input-field py-2 text-sm"
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs text-gray-400 mb-1">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="input-field py-2 text-sm"
          />
        </div>
        {(gameFilter || dateFrom || dateTo) && (
          <button
            onClick={() => { setGameFilter(''); setDateFrom(''); setDateTo(''); }}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors pb-1"
          >
            Clear filters
          </button>
        )}
      </GlassCard>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Players', value: stats?.totalPlayers ?? 0, icon: Users, suit: '♠', color: 'from-indigo-500/20 to-indigo-600/10' },
          { label: 'Games', value: stats?.totalGames ?? 0, icon: Gamepad2, suit: '♥', color: 'from-red-500/20 to-red-600/10' },
          { label: 'Rounds', value: stats?.totalRounds ?? 0, icon: Play, suit: '♦', color: 'from-amber-500/20 to-amber-600/10' },
          { label: 'Total Points', value: stats?.totalPoints ?? 0, icon: TrendingUp, suit: '♣', color: 'from-emerald-500/20 to-emerald-600/10' },
        ].map(({ label, value, icon: Icon, suit, color }) => (
          <GlassCard key={label} suit={suit} className={`bg-gradient-to-br ${color}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="stat-value mt-1">{value}</p>
              </div>
              <div className="p-2 rounded-xl bg-white/10">
                <Icon size={18} className="text-gray-300" />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <GlassCard suit="♠">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={18} className="text-amber-400" />
            <h2 className="text-base font-bold text-white">Leaderboard</h2>
          </div>
          {stats?.leaderboard.length ? (
            <Leaderboard scores={stats.leaderboard} showSuits />
          ) : (
            <EmptyState
              icon="🎴"
              title="No scores yet"
              description="Start recording points to see the leaderboard"
            />
          )}
        </GlassCard>

        {/* Chart */}
        <GlassCard suit="♦">
          <h2 className="text-base font-bold text-white mb-4">Points Overview</h2>
          {stats?.leaderboard.length ? (
            <PointsBarChart scores={stats.leaderboard} />
          ) : (
            <EmptyState icon="📊" title="No data yet" />
          )}
        </GlassCard>
      </div>

      {/* Recent rounds */}
      <GlassCard suit="♣">
        <h2 className="text-base font-bold text-white mb-4">Recent Rounds</h2>
        {stats?.recentRounds.length ? (
          <div className="space-y-2">
            {stats.recentRounds.map((round) => (
              <Link
                key={round.id}
                href={`/rounds/${round.id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/10 transition-colors group"
              >
                <div>
                  <p className="font-medium text-gray-200 text-sm group-hover:text-white">
                    {round.name}
                  </p>
                  <p className="text-xs text-gray-500">{round.gameName} · {formatDate(round.date)}</p>
                </div>
                <Badge variant={round.status === 'open' ? 'success' : round.status === 'closing' ? 'warning' : 'neutral'}>
                  {round.status}
                </Badge>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🎮"
            title="No rounds yet"
            description="Create your first round to get started"
            action={
              <Link href="/rounds" className="text-sm text-indigo-400 hover:text-indigo-300">
                Create a round →
              </Link>
            }
          />
        )}
      </GlassCard>
    </div>
  );
}
