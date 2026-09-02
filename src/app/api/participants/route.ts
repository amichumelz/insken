import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';
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
    }),
    db.participant.count({ where }),
  ]);

  return NextResponse.json({ items, total });
}

/**
 * PATCH /api/participants
 * Updates a participant's sector (used by the Registry page to backfill the
 * sector field for participants who registered before this field existed,
 * or to correct a previously entered value).
 *
 * Body: { id: string, sector: string }
 */
export async function PATCH(req: NextRequest) {
  const body = (await req.json()) as { id?: string; sector?: string };
  const { id, sector } = body;

  if (!id || !sector || !sector.trim()) {
    return NextResponse.json(
      { ok: false, error: 'Both id and sector are required.' },
      { status: 400 },
    );
  }

  const trimmedSector = sector.trim();
  if (trimmedSector.length > 80) {
    return NextResponse.json(
      { ok: false, error: 'Sector value too long (max 80 characters).' },
      { status: 400 },
    );
  }

  // Make sure the participant exists before updating
  const existing = await db.participant.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { ok: false, error: 'Participant not found.' },
      { status: 404 },
    );
  }

  const updated = await db.participant.update({
    where: { id },
    data: { sector: trimmedSector },
  });

  // Audit the change so the data hygiene trail is preserved
  await db.auditLog.create({
    data: {
      action: 'SECTOR_UPDATE',
      participant: existing.name,
      icNumber: existing.icNumber,
      detail: `Sector updated for ${existing.participantId}: "${existing.sector}" → "${trimmedSector}".`,
    },
  });

  return NextResponse.json({ ok: true, participant: updated });
}

