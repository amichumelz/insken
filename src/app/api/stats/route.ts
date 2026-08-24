import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { REGION_CONFIG, REGIONS, GLOBAL_TARGET } from '@/lib/regions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const totalParticipants = await db.participant.count();
  const attendedPhysical = await db.participant.count({ where: { status: 'Attended_Physical' } });
  const attendedOnline = await db.participant.count({ where: { status: 'Attended_Online' } });
  const registeredPhysical = await db.participant.count({ where: { status: 'Registered_Physical' } });
  const registeredOnline = await db.participant.count({ where: { status: 'Registered_Online' } });

  const duplicateBlocked = await db.auditLog.count({ where: { action: 'DUPLICATE_BLOCKED' } });
  const activeAlerts = await db.alert.count({ where: { resolved: false } });
  const criticalAlerts = await db.alert.count({ where: { resolved: false, severity: 'critical' } });

  const regionRows = await db.participant.groupBy({
    by: ['region', 'finalMode'],
    _count: { _all: true },
  });

  const attendedByRegion = await db.participant.groupBy({
    by: ['region'],
    where: { status: { in: ['Attended_Physical', 'Attended_Online'] } },
    _count: { _all: true },
  });
  const attendedMap = new Map(attendedByRegion.map((r) => [r.region, r._count._all]));

  const regionStats = REGIONS.map((r) => {
    const rows = regionRows.filter((x) => x.region === r.code);
    const physical =
      rows.find((x) => x.finalMode === 'Registered_Physical')?._count._all ?? 0;
    const online =
      rows.find((x) => x.finalMode === 'Registered_Online')?._count._all ?? 0;
    const total = physical + online;
    const attended = attendedMap.get(r.code) ?? 0;
    const physicalPct = Math.round((physical / r.physicalCap) * 100);
    const totalPct = Math.round((total / r.total) * 100);
    const attendedPct = total > 0 ? Math.round((attended / total) * 100) : 0;

    let state: string = 'Normal';
    if (physical >= r.physicalCap) state = 'Full';
    else if (physicalPct >= 80) state = 'Warn';
    else if (totalPct < 50) state = 'LowVelocity';

    return {
      code: r.code,
      name: r.name,
      physical,
      online,
      total,
      physicalCap: r.physicalCap,
      onlineTarget: r.onlineTarget,
      totalCap: r.total,
      attended,
      physicalPct,
      totalPct,
      attendedPct,
      state,
    };
  });

  const sectorRows = await db.participant.groupBy({
    by: ['sector'],
    _count: { _all: true },
    orderBy: { _count: { sector: 'desc' } },
  });
  const sectorStats = sectorRows.map((s) => ({
    sector: s.sector,
    count: s._count._all,
    pct: Math.round((s._count._all / totalParticipants) * 100),
  }));

  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const recent = await db.participant.findMany({
    where: { createdAt: { gte: fourteenDaysAgo } },
    select: { createdAt: true, region: true, finalMode: true },
  });
  const dayMap = new Map<string, { date: string; total: number; physical: number; online: number }>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    dayMap.set(key, { date: key, total: 0, physical: 0, online: 0 });
  }
  for (const p of recent) {
    const key = p.createdAt.toISOString().slice(0, 10);
    const entry = dayMap.get(key);
    if (entry) {
      entry.total += 1;
      if (p.finalMode === 'Registered_Physical') entry.physical += 1;
      else entry.online += 1;
    }
  }
  const trend = Array.from(dayMap.values());

  const milestonePcts = [0.25, 0.5, 0.75, 1];
  const milestones = milestonePcts.map((p) => ({
    pct: Math.round(p * 100),
    target: Math.round(GLOBAL_TARGET * p),
    reached: totalParticipants >= GLOBAL_TARGET * p,
  }));

  return NextResponse.json({
    global: {
      total: totalParticipants,
      target: GLOBAL_TARGET,
      pct: Math.round((totalParticipants / GLOBAL_TARGET) * 100),
      attended: attendedPhysical + attendedOnline,
      attendedPhysical,
      attendedOnline,
      registeredPhysical,
      registeredOnline,
      duplicateBlocked,
      activeAlerts,
      criticalAlerts,
      milestones,
    },
    regions: regionStats,
    sectors: sectorStats,
    trend,
  });
}
