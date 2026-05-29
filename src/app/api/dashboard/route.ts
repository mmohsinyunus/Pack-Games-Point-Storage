import { NextResponse } from 'next/server';
import { readAllRows } from '@/lib/google-sheets/client';
import type { Player, Game, Round, PointEntry, PlayerScore, DashboardStats } from '@/lib/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get('gameId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const [players, games, rounds, points] = await Promise.all([
      readAllRows<Player>('Players'),
      readAllRows<Game>('Games'),
      readAllRows<Round>('Rounds'),
      readAllRows<PointEntry>('Points'),
    ]);

    let filteredPoints = points;
    let filteredRounds = rounds;

    if (gameId) {
      filteredPoints = filteredPoints.filter((p) => p.gameId === gameId);
      filteredRounds = filteredRounds.filter((r) => r.gameId === gameId);
    }

    if (from) {
      const fromDate = new Date(from);
      filteredRounds = filteredRounds.filter((r) => new Date(r.date) >= fromDate);
      const roundIds = new Set(filteredRounds.map((r) => r.id));
      filteredPoints = filteredPoints.filter((p) => roundIds.has(p.roundId));
    }

    if (to) {
      const toDate = new Date(to);
      filteredRounds = filteredRounds.filter((r) => new Date(r.date) <= toDate);
      const roundIds = new Set(filteredRounds.map((r) => r.id));
      filteredPoints = filteredPoints.filter((p) => roundIds.has(p.roundId));
    }

    // Compute leaderboard
    const scoreMap = new Map<string, { points: number; rounds: Set<string>; games: Set<string> }>();
    for (const pt of filteredPoints) {
      if (!scoreMap.has(pt.playerId)) {
        scoreMap.set(pt.playerId, { points: 0, rounds: new Set(), games: new Set() });
      }
      const entry = scoreMap.get(pt.playerId)!;
      entry.points += Number(pt.points);
      entry.rounds.add(pt.roundId);
      entry.games.add(pt.gameId);
    }

    const leaderboard: PlayerScore[] = players
      .map((pl) => {
        const s = scoreMap.get(pl.id);
        return {
          playerId: pl.id,
          playerName: pl.name,
          avatarColor: pl.avatarColor,
          totalPoints: s?.points ?? 0,
          gamesPlayed: s?.games.size ?? 0,
          roundsPlayed: s?.rounds.size ?? 0,
          rank: 0,
        };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((s, i) => ({ ...s, rank: i + 1 }));

    const recentRounds = [...filteredRounds]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    // When a game/date filter is active, show counts within that filter
    const activePlayerIds = new Set(filteredPoints.map((p) => p.playerId));
    const activeGameIds = new Set(filteredPoints.map((p) => p.gameId));

    const stats: DashboardStats = {
      totalPlayers: gameId || from || to ? activePlayerIds.size : players.length,
      totalGames: gameId || from || to ? activeGameIds.size : games.length,
      totalRounds: filteredRounds.length,
      totalPoints: filteredPoints.reduce((sum, p) => sum + Number(p.points), 0),
      leaderboard,
      recentRounds,
    };

    return NextResponse.json({ data: stats });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
