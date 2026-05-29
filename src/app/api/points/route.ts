import { NextResponse } from 'next/server';
import { appendRow, readAllRows, updateRow } from '@/lib/google-sheets/client';
import type { PointEntry, Round } from '@/lib/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roundId = searchParams.get('roundId');
    const playerId = searchParams.get('playerId');
    const gameId = searchParams.get('gameId');

    const points = await readAllRows<PointEntry>('Points');
    let filtered = points;
    if (roundId) filtered = filtered.filter((p) => p.roundId === roundId);
    if (playerId) filtered = filtered.filter((p) => p.playerId === playerId);
    if (gameId) filtered = filtered.filter((p) => p.gameId === gameId);

    return NextResponse.json({ data: filtered });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { roundId, playerId, gameId, points: pts } = body;

    if (!roundId || !playerId || !gameId || pts === undefined || pts === null) {
      return NextResponse.json(
        { error: 'roundId, playerId, gameId, points are required' },
        { status: 400 }
      );
    }

    // Validate round is open
    const rounds = await readAllRows<Round>('Rounds');
    const round = rounds.find((r) => r.id === roundId);
    if (!round) return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    if (round.status !== 'open') {
      return NextResponse.json({ error: 'Round is not open for editing' }, { status: 409 });
    }

    const allPoints = await readAllRows<PointEntry>('Points');
    const existing = allPoints.find((p) => p.roundId === roundId && p.playerId === playerId);

    if (existing) {
      // Upsert: update in place
      const updated: PointEntry = {
        ...existing,
        points: Number(pts),
        recordedAt: new Date().toISOString(),
      };
      await updateRow('Points', existing.id, updated as unknown as Record<string, unknown>);
      return NextResponse.json({ data: updated });
    }

    // New entry
    const entry: PointEntry = {
      id: crypto.randomUUID(),
      roundId,
      playerId,
      gameId,
      points: Number(pts),
      recordedAt: new Date().toISOString(),
    };
    await appendRow('Points', entry as unknown as Record<string, unknown>);
    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
