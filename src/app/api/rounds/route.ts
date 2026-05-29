import { NextResponse } from 'next/server';
import { appendRow, readAllRows } from '@/lib/google-sheets/client';
import type { Round, Game } from '@/lib/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get('gameId');

    const rounds = await readAllRows<Round>('Rounds');
    const filtered = gameId ? rounds.filter((r) => r.gameId === gameId) : rounds;
    return NextResponse.json({ data: filtered });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { gameId, name, date } = body;

    if (!gameId || !name?.trim()) {
      return NextResponse.json({ error: 'gameId and name are required' }, { status: 400 });
    }

    const games = await readAllRows<Game>('Games');
    const game = games.find((g) => g.id === gameId);
    if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 });

    const round: Round = {
      id: crypto.randomUUID(),
      gameId,
      gameName: game.name,
      name: name.trim(),
      date: date ?? new Date().toISOString().split('T')[0],
      status: 'open',
      createdAt: new Date().toISOString(),
      closedAt: null,
    };

    await appendRow('Rounds', round as unknown as Record<string, unknown>);
    return NextResponse.json({ data: round }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
