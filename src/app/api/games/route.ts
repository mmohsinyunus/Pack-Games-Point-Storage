import { NextResponse } from 'next/server';
import { appendRow, readAllRows } from '@/lib/google-sheets/client';
import { getSuitForIndex } from '@/lib/utils';
import type { Game } from '@/lib/types';

export async function GET() {
  try {
    const games = await readAllRows<Game>('Games');
    return NextResponse.json({ data: games });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const existing = await readAllRows<Game>('Games');
    const suit = getSuitForIndex(existing.length);

    const game: Game = {
      id: crypto.randomUUID(),
      name: name.trim(),
      description: description?.trim() ?? '',
      suit,
      createdAt: new Date().toISOString(),
    };

    await appendRow('Games', game as unknown as Record<string, unknown>);
    return NextResponse.json({ data: game }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
