import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const onlyUnresolved = searchParams.get('unresolved') === '1';
  const where = onlyUnresolved ? { resolved: false } : {};
  const alerts = await db.alert.findMany({
    where,
    orderBy: { triggeredAt: 'desc' },
    take: 200,
  });
  return NextResponse.json({ alerts });
}

export async function PATCH(req: Request) {
  const { id, resolved } = (await req.json()) as { id: string; resolved: boolean };
  const updated = await db.alert.update({ where: { id }, data: { resolved } });
  return NextResponse.json({ alert: updated });
}
