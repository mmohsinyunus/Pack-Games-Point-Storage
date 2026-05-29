import { NextResponse } from 'next/server';
import { readAllRows, updateRow } from '@/lib/google-sheets/client';
import type { Player } from '@/lib/types';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const players = await readAllRows<Player>('Players');
    const player = players.find((p) => p.id === params.id);
    if (!player) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: player });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const players = await readAllRows<Player>('Players');
    const player = players.find((p) => p.id === params.id);
    if (!player) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated: Player = {
      ...player,
      name: body.name?.trim() ?? player.name,
      avatarColor: body.avatarColor ?? player.avatarColor,
    };
    await updateRow('Players', params.id, updated as unknown as Record<string, unknown>);
    return NextResponse.json({ data: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
