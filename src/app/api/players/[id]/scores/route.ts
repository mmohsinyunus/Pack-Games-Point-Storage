import { NextResponse } from 'next/server';
import { readAllRows } from '@/lib/google-sheets/client';
import type { Player, Game, Round, PointEntry, PlayerStats } from '@/lib/types';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const [players, games, rounds, points] = await Promise.all([
      readAllRows<Player>('Players'),
      readAllRows<Game>('Games'),
      readAllRows<Round>('Rounds'),
      readAllRows<PointEntry>('Points'),
    ]);

    const player = players.find((p) => p.id === params.id);
    if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 });

    const playerPoints = points.filter((p) => p.playerId === params.id);
    const gameMap = new Map(games.map((g) => [g.id, g]));
    const roundMap = new Map(rounds.map((r) => [r.id, r]));

    const totalPoints = playerPoints.reduce((sum, p) => sum + Number(p.points), 0);
    const gamesSet = new Set(playerPoints.map((p) => p.gameId));
    const roundsSet = new Set(playerPoints.map((p) => p.roundId));

    // Points by game
    const byGame = new Map<string, number>();
    for (const pt of playerPoints) {
      byGame.set(pt.gameId, (byGame.get(pt.gameId) ?? 0) + Number(pt.points));
    }
    const pointsByGame = Array.from(byGame.entries()).map(([gId, pts]) => {
      const g = gameMap.get(gId);
      return {
        gameId: gId,
        gameName: g?.name ?? 'Unknown',
        suit: g?.suit ?? '♠',
        totalPoints: pts,
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);

    // Recent points with context
    const recentPoints = [...playerPoints]
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
      .slice(0, 20)
      .map((pt) => {
        const round = roundMap.get(pt.roundId);
        const game = gameMap.get(pt.gameId);
        return {
          ...pt,
          roundName: round?.name ?? 'Unknown Round',
          gameName: game?.name ?? 'Unknown Game',
        };
      });

    const stats: PlayerStats = {
      player,
      totalPoints,
      gamesPlayed: gamesSet.size,
      roundsPlayed: roundsSet.size,
      pointsByGame,
      recentPoints,
    };

    return NextResponse.json({ data: stats });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
