import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inMemoryParticipants } from '@/lib/memory-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') ?? '').toLowerCase().trim();
    const region = searchParams.get('region') ?? '';
    const status = searchParams.get('status') ?? '';
    const limit = Math.min(Number(searchParams.get('limit') ?? '50'), 200);
    const offset = Number(searchParams.get('offset') ?? '0');

    const where: any = {};

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { icNumber: { contains: q } },
        { participantId: { contains: q } },
        { email: { contains: q } },
      ];
    }
    if (region && region !== 'all') where.region = region;
    if (status && status !== 'all') where.status = status;

    let items: any[] = [];
    let total = 0;

    try {
      [items, total] = await Promise.all([
        db.participant.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        db.participant.count({ where }),
      ]);
    } catch {
      // DB error or offline, will fallback to memory
      items = [];
      total = 0;
    }

    if (items && items.length > 0) {
      // Sync into inMemoryParticipants for resilient caching
      for (const item of items) {
        if (item.participantId) {
          inMemoryParticipants.set(item.participantId, {
            id: item.id,
            participantId: item.participantId,
            icNumber: item.icNumber,
            name: item.name,
            email: item.email,
            phone: item.phone,
            sector: item.sector,
            region: item.region,
            preferredMode: item.preferredMode,
            finalMode: item.finalMode,
            status: item.status,
            checkInAt: item.checkInAt ? new Date(item.checkInAt).toISOString() : null,
            createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
          });
        }
      }
      return NextResponse.json({ items, total });
    }

    // In-memory fallback
    let allMem = Array.from(inMemoryParticipants.values());

    if (q) {
      allMem = allMem.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.icNumber.toLowerCase().includes(q) ||
        p.participantId.toLowerCase().includes(q) ||
        (p.email && p.email.toLowerCase().includes(q))
      );
    }
    if (region && region !== 'all') allMem = allMem.filter((p) => p.region === region);
    if (status && status !== 'all') allMem = allMem.filter((p) => p.status === status);

    // Sort by createdAt descending
    allMem.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const memSlice = allMem.slice(offset, offset + limit);
    return NextResponse.json({ items: memSlice, total: allMem.length });
  } catch (error: any) {
    const allMem = Array.from(inMemoryParticipants.values());
    allMem.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json({ items: allMem.slice(0, 50), total: allMem.length });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as { id?: string; participantId?: string; sector?: string };
    const { id, participantId, sector } = body;

    if ((!id && !participantId) || !sector || !sector.trim()) {
      return NextResponse.json(
        { ok: false, error: 'Participant identification and sector are required.' },
        { status: 400 },
      );
    }

    const trimmedSector = sector.trim();

    // Update in DB
    let updated: any = null;
    try {
      if (id) {
        updated = await db.participant.update({
          where: { id },
          data: { sector: trimmedSector },
        });
      } else if (participantId) {
        updated = await db.participant.update({
          where: { participantId },
          data: { sector: trimmedSector },
        });
      }
    } catch {
      // Ignore DB error
    }

    // Update in memory
    const targetKey = participantId || updated?.participantId;
    if (targetKey && inMemoryParticipants.has(targetKey)) {
      const existing = inMemoryParticipants.get(targetKey)!;
      inMemoryParticipants.set(targetKey, { ...existing, sector: trimmedSector });
    } else {
      // Look up by id in memory
      for (const [key, val] of inMemoryParticipants.entries()) {
        if (val.id === id) {
          inMemoryParticipants.set(key, { ...val, sector: trimmedSector });
          break;
        }
      }
    }

    return NextResponse.json({ ok: true, participant: updated });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const participantId = searchParams.get('participantId');

    if (participantId) {
      inMemoryParticipants.delete(participantId);
      try {
        await db.participant.deleteMany({
          where: { participantId },
        });
      } catch {
        // Ignore
      }
    } else if (id) {
      for (const [key, val] of inMemoryParticipants.entries()) {
        if (val.id === id) {
          inMemoryParticipants.delete(key);
          break;
        }
      }
      try {
        await db.participant.delete({
          where: { id },
        });
      } catch {
        // Ignore
      }
    }

    return NextResponse.json({ ok: true, message: 'Participant deleted.' });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
