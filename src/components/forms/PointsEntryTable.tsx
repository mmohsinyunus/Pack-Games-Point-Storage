'use client';

import { useState } from 'react';
import { AvatarChip } from '@/components/ui/AvatarChip';
import { Button } from '@/components/ui/Button';
import type { Player, Round } from '@/lib/types';
import { mutate } from 'swr';

interface PointsEntryTableProps {
  round: Round;
  players: Player[];
  initialPoints: Record<string, number>;
  onClose?: () => void;
}

export function PointsEntryTable({
  round,
  players,
  initialPoints,
  onClose,
}: PointsEntryTableProps) {
  const [points, setPoints] = useState<Record<string, string>>(() =>
    // Use empty string for 0 so unrecorded players show blank, not "0"
    Object.fromEntries(players.map((p) => [
      p.id,
      initialPoints[p.id] !== 0 && initialPoints[p.id] !== undefined
        ? String(initialPoints[p.id])
        : '',
    ]))
  );
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState('');
  const isReadOnly = round.status !== 'open';

  const handleChange = (playerId: string, value: string) => {
    setPoints((prev) => ({ ...prev, [playerId]: value }));
  };

  const savePoints = async (): Promise<void> => {
    setSaving(true);
    setError('');
    try {
      const toSave = players.filter((p) => {
        const v = points[p.id];
        if (v === '' || v === undefined) return false;
        if (isNaN(Number(v))) return false;
        return true;
      });

      if (toSave.length > 0) {
        await Promise.all(
          toSave.map((p) =>
            fetch('/api/points', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                roundId: round.id,
                playerId: p.id,
                gameId: round.gameId,
                points: Number(points[p.id]),
              }),
            })
          )
        );
      }
      await mutate(`/api/rounds/${round.id}`);
    } catch (e) {
      setError('Failed to save points. Please try again.');
      setSaving(false);
      throw e;
    }
    setSaving(false);
  };

  const closeRound = async () => {
    setClosing(true);
    setError('');
    try {
      await savePoints();
    } catch {
      setClosing(false);
      return;
    }
    try {
      const res = await fetch(`/api/rounds/${round.id}/close`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Failed to close round');
        return;
      }
      mutate(`/api/rounds/${round.id}`);
      mutate('/api/rounds');
      mutate('/api/players');
      mutate('/api/dashboard');
      onClose?.();
    } catch {
      setError('Failed to close round');
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-2 text-gray-400 font-medium">Player</th>
              <th className="text-right py-3 px-2 text-gray-400 font-medium">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {players.map((player) => (
              <tr key={player.id} className="group">
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <AvatarChip name={player.name} color={player.avatarColor} size="sm" />
                    <span className="font-medium text-gray-200">{player.name}</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-right">
                  {isReadOnly ? (
                    <span className={`font-bold text-base ${
                      Number(initialPoints[player.id] ?? 0) > 0
                        ? 'text-emerald-400'
                        : Number(initialPoints[player.id] ?? 0) < 0
                        ? 'text-red-400'
                        : 'text-gray-400'
                    }`}>
                      {initialPoints[player.id] ?? 0}
                    </span>
                  ) : (
                    <input
                      type="number"
                      value={points[player.id] ?? ''}
                      onChange={(e) => handleChange(player.id, e.target.value)}
                      placeholder="0"
                      className="input-field w-24 text-right py-1.5 px-2 text-sm"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          {error}
        </p>
      )}

      {!isReadOnly && (
        <div className="flex gap-3">
          <Button onClick={savePoints} loading={saving} variant="secondary" className="flex-1">
            Save Points
          </Button>
          <Button onClick={closeRound} loading={closing} className="flex-1">
            Close Round & Sum
          </Button>
        </div>
      )}
    </div>
  );
}
