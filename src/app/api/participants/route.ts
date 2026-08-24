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
