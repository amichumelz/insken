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

  // Attended breakdown by region + status (Physical vs Online) — used by Regional Progress Grid
  const attendedByRegionStatus = await db.participant.groupBy({
    by: ['region', 'status'],
    where: { status: { in: ['Attended_Physical', 'Attended_Online'] } },
    _count: { _all: true },
  });
  const attendedPhysicalMap = new Map(
    attendedByRegionStatus
      .filter((r) => r.status === 'Attended_Physical')
      .map((r) => [r.region, r._count._all]),
  );
  const attendedOnlineMap = new Map(
    attendedByRegionStatus
      .filter((r) => r.status === 'Attended_Online')
      .map((r) => [r.region, r._count._all]),
  );

  const regionStats = REGIONS.map((r) => {
    const rows = regionRows.filter((x) => x.region === r.code);
    const physical =
      rows.find((x) => x.finalMode === 'Registered_Physical')?._count._all ?? 0;
    const online =
      rows.find((x) => x.finalMode === 'Registered_Online')?._count._all ?? 0;
    const total = physical + online;
    const attended = attendedMap.get(r.code) ?? 0;
    const attendedPhysical = attendedPhysicalMap.get(r.code) ?? 0;
    const attendedOnline = attendedOnlineMap.get(r.code) ?? 0;
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
      attendedPhysical,
      attendedOnline,
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

  // Monthly registration trend — last 12 months
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const recent = await db.participant.findMany({
    where: { createdAt: { gte: twelveMonthsAgo } },
    select: { createdAt: true, region: true, finalMode: true },
  });

  // Build month buckets from 12 months ago to current month
  const monthMap = new Map<string, { month: string; total: number; physical: number; online: number }>();
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
    monthMap.set(key, { month: label, total: 0, physical: 0, online: 0 });
  }
  for (const p of recent) {
    const key = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, '0')}`;
    const entry = monthMap.get(key);
    if (entry) {
      entry.total += 1;
      if (p.finalMode === 'Registered_Physical') entry.physical += 1;
      else entry.online += 1;
    }
  }
  const trend = Array.from(monthMap.values());

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
