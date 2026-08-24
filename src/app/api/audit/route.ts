import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') ?? '';
  const limit = Math.min(Number(searchParams.get('limit') ?? '50'), 200);

  const where = action ? { action } : {};
  const logs = await db.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  const total = await db.auditLog.count({ where });

  // Action breakdown for the dashboard
  const breakdown = await db.auditLog.groupBy({
    by: ['action'],
    _count: { _all: true },
  });

  return NextResponse.json({
    logs,
    total,
    breakdown: breakdown.map((b) => ({ action: b.action, count: b._count._all })),
  });
}
