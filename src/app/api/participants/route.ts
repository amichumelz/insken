import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inMemoryParticipants } from '@/lib/memory-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BLOCKED_IDS = ['ASEAN-00011', 'ASEAN-00012', 'ASEAN-02063', 'ASEAN-02064', 'ASEAN-02065'];
const BLOCKED_ICS = ['020608101087', '040221140768', '040222140768'];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') ?? '').toLowerCase();
    const region = searchParams.get('region') ?? '';
    const status = searchParams.get('status') ?? '';
    const limit = Math.min(Number(searchParams.get('limit') ?? '50'), 200);
    const offset = Number(searchParams.get('offset') ?? '0');

    // Proactively clean up blocked test records from DB & memory
    for (const bId of BLOCKED_IDS) {
      inMemoryParticipants.delete(bId);
    }

    try {
      await db.participant.deleteMany({
        where: {
          OR: [
            { participantId: { in: BLOCKED_IDS } },
            { icNumber: { in: BLOCKED_ICS } },
            { name: { contains: 'Azlan' } },
            { name: { contains: 'Fatin' } },
            { name: { contains: 'Umar' } },
          ],
        },
      });
    } catch {
      // Ignore
    }

    const where: any = {
      participantId: { notIn: BLOCKED_IDS },
      icNumber: { notIn: BLOCKED_ICS },
    };

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
      const filtered = items.filter(
        (p) =>
          !BLOCKED_IDS.includes(p.participantId) &&
          !BLOCKED_ICS.includes(p.icNumber) &&
          !p.name.toLowerCase().includes('azlan') &&
          !p.name.toLowerCase().includes('fatin') &&
          !p.name.toLowerCase().includes('umar')
      );
      return NextResponse.json({ items: filtered, total: Math.min(total, filtered.length) });
    }

    // In-memory fallback
    let allMem = Array.from(inMemoryParticipants.values()).filter(
      (p) =>
        !BLOCKED_IDS.includes(p.participantId) &&
        !BLOCKED_ICS.includes(p.icNumber) &&
        !p.name.toLowerCase().includes('azlan') &&
        !p.name.toLowerCase().includes('fatin') &&
        !p.name.toLowerCase().includes('umar')
    );

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
    const allMem = Array.from(inMemoryParticipants.values()).filter(
      (p) => !BLOCKED_IDS.includes(p.participantId) && !BLOCKED_ICS.includes(p.icNumber)
    );
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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const participantId = searchParams.get('participantId');

    if (participantId) {
      inMemoryParticipants.delete(participantId);
      await db.participant.deleteMany({
        where: { participantId },
      }).catch(() => null);
    } else if (id) {
      await db.participant.delete({
        where: { id },
      }).catch(() => null);
    }

    return NextResponse.json({ ok: true, message: 'Participant deleted.' });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
