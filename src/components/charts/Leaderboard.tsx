'use client';

import { AvatarChip } from '@/components/ui/AvatarChip';
import type { PlayerScore } from '@/lib/types';

const MEDALS = ['🥇', '🥈', '🥉'];
const SUITS = ['♠', '♥', '♦', '♣'];

interface LeaderboardProps {
  scores: PlayerScore[];
  showSuits?: boolean;
}

export function Leaderboard({ scores, showSuits = false }: LeaderboardProps) {
  if (!scores.length) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">No scores recorded yet.</div>
    );
  }

  return (
    <div className="space-y-2">
      {scores.map((score, idx) => (
        <div
          key={score.playerId}
          className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
            idx === 0
              ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/20'
              : idx === 1
              ? 'bg-white/5 border border-white/10'
              : idx === 2
              ? 'bg-white/5 border border-white/10'
              : 'bg-white/5 border border-transparent'
          }`}
        >
          <div className="w-8 text-center text-lg shrink-0">
            {idx < 3 ? MEDALS[idx] : <span className="text-sm text-gray-500 font-bold">#{score.rank}</span>}
          </div>

          <AvatarChip name={score.playerName} color={score.avatarColor} size="sm" />

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-100 text-sm truncate">{score.playerName}</p>
            <p className="text-xs text-gray-400">
              {score.gamesPlayed} game{score.gamesPlayed !== 1 ? 's' : ''} ·{' '}
              {score.roundsPlayed} round{score.roundsPlayed !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="text-right shrink-0">
            <p
              className={`font-bold text-base ${
                score.totalPoints > 0
                  ? 'text-emerald-400'
                  : score.totalPoints < 0
                  ? 'text-red-400'
                  : 'text-gray-400'
              }`}
            >
              {score.totalPoints > 0 ? '+' : ''}{score.totalPoints}
            </p>
            {showSuits && (
              <p className="text-xs text-gray-500">{SUITS[idx % SUITS.length]}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
