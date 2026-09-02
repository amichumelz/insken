import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { REGIONS } from '@/lib/regions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Batch all status counts in 1 query
    const [statusCounts, alertCounts, duplicateBlocked, regionRows, attendedByRegionStatus, sectorRows, recentLogs] = await Promise.all([
      db.participant.groupBy({
        by: ['status'],
        _count: { _all: true },
      }).catch(() => []),
      db.alert.groupBy({
        by: ['resolved', 'severity'],
        _count: { _all: true },
      }).catch(() => []),
      db.auditLog.count({ where: { action: 'DUPLICATE_BLOCKED' } }).catch(() => 0),
      db.participant.groupBy({
        by: ['region', 'finalMode'],
        _count: { _all: true },
      }).catch(() => []),
      db.participant.groupBy({
        by: ['region', 'status'],
        where: { status: { in: ['Attended_Physical', 'Attended_Online'] } },
        _count: { _all: true },
      }).catch(() => []),
      db.participant.groupBy({
        by: ['sector'],
        _count: { _all: true },
        orderBy: { _count: { sector: 'desc' } },
      }).catch(() => []),
      db.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      }).catch(() => []),
    ]);

    const attendedPhysical = statusCounts.find((s) => s.status === 'Attended_Physical')?._count._all || 0;
    const attendedOnline = statusCounts.find((s) => s.status === 'Attended_Online')?._count._all || 0;
    const registeredPhysical = statusCounts.find((s) => s.status === 'Registered_Physical')?._count._all || 0;
    const registeredOnline = statusCounts.find((s) => s.status === 'Registered_Online')?._count._all || 0;
    const totalParticipants = attendedPhysical + attendedOnline + registeredPhysical + registeredOnline;

    const activeAlerts = alertCounts.filter((a) => !a.resolved).reduce((sum, a) => sum + a._count._all, 0);
    const criticalAlerts = alertCounts.filter((a) => !a.resolved && a.severity === 'critical').reduce((sum, a) => sum + a._count._all, 0);

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
      const attendedPhysical = attendedPhysicalMap.get(r.code) ?? 0;
      const attendedOnline = attendedOnlineMap.get(r.code) ?? 0;
      const attended = attendedPhysical + attendedOnline;
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

    const sectorStats = sectorRows.map((s) => ({
      sector: s.sector,
      count: s._count._all,
      pct: totalParticipants > 0 ? Math.round((s._count._all / totalParticipants) * 100) : 0,
    }));

    // Trend
    const monthlyTrend = [
      { month: 'Sep', physical: registeredPhysical, online: registeredOnline, total: totalParticipants },
    ];

    return NextResponse.json({
      totalParticipants,
      attendedPhysical,
      attendedOnline,
      registeredPhysical,
      registeredOnline,
      duplicateBlocked,
      activeAlerts,
      criticalAlerts,
      regions: regionStats,
      sectors: sectorStats,
      monthlyTrend,
      recentAuditLogs: recentLogs.map((l) => ({
        id: l.id,
        action: l.action,
        participant: l.participant,
        icNumber: l.icNumber,
        detail: l.detail,
        createdAt: l.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('Stats API error fallback:', error);
    return NextResponse.json({
      totalParticipants: 0,
      attendedPhysical: 0,
      attendedOnline: 0,
      registeredPhysical: 0,
      registeredOnline: 0,
      duplicateBlocked: 0,
      activeAlerts: 0,
      criticalAlerts: 0,
      regions: REGIONS.map((r) => ({
        code: r.code,
        name: r.name,
        physical: 0,
        online: 0,
        attendedPhysical: 0,
        attendedOnline: 0,
        total: 0,
        physicalCap: r.physicalCap,
        onlineTarget: r.onlineTarget,
        totalCap: r.total,
        attended: 0,
        physicalPct: 0,
        totalPct: 0,
        attendedPct: 0,
        state: 'Normal',
      })),
      sectors: [],
      monthlyTrend: [{ month: 'Sep', physical: 0, online: 0, total: 0 }],
      recentAuditLogs: [],
    });
  }
}
