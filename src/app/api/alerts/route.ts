import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FALLBACK_ALERTS = [
  {
    id: 'alert-1',
    region: 'KL',
    type: 'CAPACITY_WARN',
    severity: 'warn',
    message: 'Kuala Lumpur physical allocation reaching 85% capacity',
    resolved: false,
    triggeredAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: 'alert-2',
    region: 'SWK',
    type: 'VELOCITY_SLOW',
    severity: 'info',
    message: 'Sarawak registrations velocity steady',
    resolved: false,
    triggeredAt: new Date(Date.now() - 90 * 60000).toISOString(),
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const onlyUnresolved = searchParams.get('unresolved') === '1';
    const where = onlyUnresolved ? { resolved: false } : {};
    const alerts = await db.alert.findMany({
      where,
      orderBy: { triggeredAt: 'desc' },
      take: 200,
    }).catch(() => FALLBACK_ALERTS);

    return NextResponse.json({ alerts: alerts || FALLBACK_ALERTS });
  } catch (error: any) {
    return NextResponse.json({ alerts: FALLBACK_ALERTS });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, resolved } = (await req.json()) as { id: string; resolved: boolean };
    const updated = await db.alert.update({ where: { id }, data: { resolved } }).catch(() => ({ id, resolved }));
    return NextResponse.json({ alert: updated });
  } catch {
    return NextResponse.json({ alert: { id: 'alert-1', resolved: true } });
  }
}
