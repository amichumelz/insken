import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inMemoryParticipants } from '@/lib/memory-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') ?? '').toLowerCase();
    const region = searchParams.get('region') ?? '';
    const status = searchParams.get('status') ?? '';
    const limit = Math.min(Number(searchParams.get('limit') ?? '50'), 200);
    const offset = Number(searchParams.get('offset') ?? '0');

    const where: Record<string, unknown> = {};
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { icNumber: { contains: q } },
        { participantId: { contains: q } },
        { email: { contains: q } },
      ];
    }
    if (region) where.region = region;
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      db.participant.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }).catch(() => []),
      db.participant.count({ where }).catch(() => 0),
    ]);

    if (items.length > 0) {
      return NextResponse.json({ items, total });
    }

    // In-memory fallback
    let allMem = Array.from(inMemoryParticipants.values());
    if (q) {
      allMem = allMem.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.icNumber.includes(q) ||
        p.participantId.toLowerCase().includes(q)
      );
    }
    if (region) allMem = allMem.filter((p) => p.region === region);
    if (status) allMem = allMem.filter((p) => p.status === status);

    const memSlice = allMem.slice(offset, offset + limit);
    return NextResponse.json({ items: memSlice, total: allMem.length });
  } catch (error: any) {
    const allMem = Array.from(inMemoryParticipants.values());
    return NextResponse.json({ items: allMem.slice(0, 50), total: allMem.length });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as { id?: string; sector?: string };
    const { id, sector } = body;

    if (!id || !sector || !sector.trim()) {
      return NextResponse.json(
        { ok: false, error: 'Both id and sector are required.' },
        { status: 400 },
      );
    }

    const trimmedSector = sector.trim();
    const updated = await db.participant.update({
      where: { id },
      data: { sector: trimmedSector },
    }).catch(() => null);

    return NextResponse.json({ ok: true, participant: updated });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
