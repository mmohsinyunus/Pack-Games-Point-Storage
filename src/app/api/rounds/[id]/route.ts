import { NextResponse } from 'next/server';
import { readAllRows, updateRow } from '@/lib/google-sheets/client';
import type { Round, PointEntry, Player, PlayerScore } from '@/lib/types';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const [rounds, points, players] = await Promise.all([
      readAllRows<Round>('Rounds'),
      readAllRows<PointEntry>('Points'),
      readAllRows<Player>('Players'),
    ]);

    const round = rounds.find((r) => r.id === params.id);
    if (!round) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const roundPoints = points.filter((p) => p.roundId === params.id);

    const scores: PlayerScore[] = players.map((pl) => {
      const pt = roundPoints.find((p) => p.playerId === pl.id);
      return {
        playerId: pl.id,
        playerName: pl.name,
        avatarColor: pl.avatarColor,
        totalPoints: pt ? Number(pt.points) : 0,
        gamesPlayed: 0,
        roundsPlayed: 0,
        rank: 0,
      };
    });

    // For closed round compute cumulative (same game, all prior closed rounds)
    let cumulativeScores: PlayerScore[] | null = null;
    if (round.status === 'closed') {
      const gameRounds = rounds.filter(
        (r) => r.gameId === round.gameId && r.status === 'closed'
      );
      const allGamePoints = points.filter((p) => p.gameId === round.gameId);

      const cumMap = new Map<string, number>();
      for (const r of gameRounds) {
        const rPts = allGamePoints.filter((p) => p.roundId === r.id);
        for (const pt of rPts) {
          cumMap.set(pt.playerId, (cumMap.get(pt.playerId) ?? 0) + Number(pt.points));
        }
      }

      cumulativeScores = players
        .map((pl) => ({
          playerId: pl.id,
          playerName: pl.name,
          avatarColor: pl.avatarColor,
          totalPoints: cumMap.get(pl.id) ?? 0,
          gamesPlayed: 1,
          roundsPlayed: gameRounds.length,
          rank: 0,
        }))
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .map((s, i) => ({ ...s, rank: i + 1 }));
    }

    return NextResponse.json({ data: { round, scores, cumulativeScores, allPlayers: players } });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const rounds = await readAllRows<Round>('Rounds');
    const round = rounds.find((r) => r.id === params.id);
    if (!round) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated: Round = {
      ...round,
      name: body.name?.trim() ?? round.name,
      date: body.date ?? round.date,
    };
    await updateRow('Rounds', params.id, updated as unknown as Record<string, unknown>);
    return NextResponse.json({ data: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
