import { NextResponse } from 'next/server';
import { readAllRows, updateRow } from '@/lib/google-sheets/client';
import type { Round, PointEntry, Player } from '@/lib/types';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const [rounds, points, players] = await Promise.all([
      readAllRows<Round>('Rounds'),
      readAllRows<PointEntry>('Points'),
      readAllRows<Player>('Players'),
    ]);

    const round = rounds.find((r) => r.id === params.id);
    if (!round) return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    if (round.status === 'closed') {
      return NextResponse.json({ error: 'Round is already closed' }, { status: 409 });
    }

    // Set sentinel status = 'closing'
    await updateRow('Rounds', params.id, {
      ...round,
      status: 'closing',
    } as unknown as Record<string, unknown>);

    // Sum points for this round per player
    const roundPoints = points.filter((p) => p.roundId === params.id);

    // Update each player's totalPoints
    const updatePromises = players.map(async (player) => {
      const pts = roundPoints.filter((p) => p.playerId === player.id);
      const delta = pts.reduce((sum, p) => sum + Number(p.points), 0);
      const updated: Player = {
        ...player,
        totalPoints: Number(player.totalPoints) + delta,
      };
      await updateRow('Players', player.id, updated as unknown as Record<string, unknown>);
    });

    await Promise.all(updatePromises);

    // Finalize round as closed
    const closedRound: Round = {
      ...round,
      status: 'closed',
      closedAt: new Date().toISOString(),
    };
    await updateRow('Rounds', params.id, closedRound as unknown as Record<string, unknown>);

    // Build cumulative scores for response
    const allGameRounds = rounds.filter(
      (r) => r.gameId === round.gameId && (r.status === 'closed' || r.id === params.id)
    );
    const allGamePoints = points.filter((p) => p.gameId === round.gameId);
    const cumMap = new Map<string, number>();
    for (const r of allGameRounds) {
      const rPts = allGamePoints.filter((p) => p.roundId === r.id);
      for (const pt of rPts) {
        cumMap.set(pt.playerId, (cumMap.get(pt.playerId) ?? 0) + Number(pt.points));
      }
    }

    const cumulativeScores = players
      .map((p) => ({
        playerId: p.id,
        playerName: p.name,
        avatarColor: p.avatarColor,
        totalPoints: cumMap.get(p.id) ?? 0,
        gamesPlayed: 1,
        roundsPlayed: allGameRounds.length,
        rank: 0,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((s, i) => ({ ...s, rank: i + 1 }));

    return NextResponse.json({ data: { round: closedRound, cumulativeScores } });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
