import { NextResponse } from 'next/server';
import { readAllRows, updateRow } from '@/lib/google-sheets/client';
import type { Game, Round, PointEntry, Player, PlayerScore } from '@/lib/types';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const games = await readAllRows<Game>('Games');
    const game = games.find((g) => g.id === params.id);
    if (!game) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const [rounds, points, players] = await Promise.all([
      readAllRows<Round>('Rounds'),
      readAllRows<PointEntry>('Points'),
      readAllRows<Player>('Players'),
    ]);

    const gameRounds = rounds.filter((r) => r.gameId === params.id);
    const gamePoints = points.filter((p) => p.gameId === params.id);

    const playerMap = new Map(players.map((p) => [p.id, p]));
    const scoreMap = new Map<string, number>();
    for (const pt of gamePoints) {
      scoreMap.set(pt.playerId, (scoreMap.get(pt.playerId) ?? 0) + Number(pt.points));
    }

    const leaderboard: PlayerScore[] = Array.from(scoreMap.entries())
      .map(([playerId, totalPoints], idx) => {
        const p = playerMap.get(playerId);
        const roundsPlayed = new Set(gamePoints.filter((pt) => pt.playerId === playerId).map((pt) => pt.roundId)).size;
        return {
          playerId,
          playerName: p?.name ?? 'Unknown',
          avatarColor: p?.avatarColor ?? '#6366f1',
          totalPoints,
          gamesPlayed: 1,
          roundsPlayed,
          rank: idx + 1,
        };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((s, i) => ({ ...s, rank: i + 1 }));

    return NextResponse.json({
      data: {
        game,
        roundsCount: gameRounds.length,
        playersCount: leaderboard.length,
        leaderboard,
        rounds: gameRounds,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const games = await readAllRows<Game>('Games');
    const game = games.find((g) => g.id === params.id);
    if (!game) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated: Game = {
      ...game,
      name: body.name?.trim() ?? game.name,
      description: body.description?.trim() ?? game.description,
    };
    await updateRow('Games', params.id, updated as unknown as Record<string, unknown>);
    return NextResponse.json({ data: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
