import { NextResponse } from 'next/server';
import { appendRow, readAllRows } from '@/lib/google-sheets/client';
import type { Player } from '@/lib/types';

export async function GET() {
  try {
    const players = await readAllRows<Player>('Players');
    return NextResponse.json({ data: players });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, avatarColor } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'name and email are required' }, { status: 400 });
    }

    // Check uniqueness
    const existing = await readAllRows<Player>('Players');
    if (existing.some((p) => p.email.toLowerCase() === email.toLowerCase().trim())) {
      return NextResponse.json({ error: 'A player with this email already exists' }, { status: 409 });
    }

    const player: Player = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      avatarColor: avatarColor || '#6366f1',
      totalPoints: 0,
      createdAt: new Date().toISOString(),
    };

    await appendRow('Players', player as unknown as Record<string, unknown>);
    return NextResponse.json({ data: player }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
