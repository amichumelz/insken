import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { REGIONS } from '@/lib/regions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Live attendance tracking endpoint.
 * Highly optimized for Cloudflare D1 with minimal query overhead.
 */
export async function GET() {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOf24hAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Group all attended counts by status in 1 single query
  const statusCounts = await db.participant.groupBy({
    by: ['status'],
    where: { status: { in: ['Attended_Physical', 'Attended_Online'] } },
    _count: { _all: true },
  });

  const allTimePhysical = statusCounts.find((s) => s.status === 'Attended_Physical')?._count._all || 0;
  const allTimeOnline = statusCounts.find((s) => s.status === 'Attended_Online')?._count._all || 0;
  const allTimeTotal = allTimePhysical + allTimeOnline;

  // Today's attended counts in 1 single query
  const todayStatusCounts = await db.participant.groupBy({
    by: ['status'],
    where: {
      status: { in: ['Attended_Physical', 'Attended_Online'] },
      checkInAt: { gte: startOfToday },
    },
    _count: { _all: true },
  });

  const todayPhysical = todayStatusCounts.find((s) => s.status === 'Attended_Physical')?._count._all || 0;
  const todayOnline = todayStatusCounts.find((s) => s.status === 'Attended_Online')?._count._all || 0;
  const todayTotal = todayPhysical + todayOnline;

  // Recent 24h checkins for velocity
  const recentCheckins = await db.participant.findMany({
    where: { checkInAt: { gte: startOf24hAgo } },
    select: { checkInAt: true, region: true, status: true, name: true, participantId: true, sector: true },
    orderBy: { checkInAt: 'desc' },
    take: 200,
  });

  const hourMap = new Map<string, { hour: string; physical: number; online: number; total: number }>();
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 13);
    const label = `${String(d.getHours()).padStart(2, '0')}:00`;
    hourMap.set(key, { hour: label, physical: 0, online: 0, total: 0 });
  }
  for (const p of recentCheckins) {
    if (!p.checkInAt) continue;
    const key = p.checkInAt.toISOString().slice(0, 13);
    const entry = hourMap.get(key);
    if (entry) {
      entry.total += 1;
      if (p.status === 'Attended_Physical') entry.physical += 1;
      else entry.online += 1;
    }
  }
  const velocity = Array.from(hourMap.values());

  // Per-region attendance in 2 groupBy queries instead of 10 separate queries
  const [regionAllTime, regionToday] = await Promise.all([
    db.participant.groupBy({
      by: ['region'],
      where: { status: { in: ['Attended_Physical', 'Attended_Online'] } },
      _count: { _all: true },
    }),
    db.participant.groupBy({
      by: ['region'],
      where: {
        status: { in: ['Attended_Physical', 'Attended_Online'] },
        checkInAt: { gte: startOfToday },
      },
      _count: { _all: true },
    }),
  ]);

  const regionAttendance = REGIONS.map((r) => {
    const allTime = regionAllTime.find((x) => x.region === r.code)?._count._all || 0;
    const today = regionToday.find((x) => x.region === r.code)?._count._all || 0;
    return { code: r.code, name: r.name, today, allTime };
  });

  // Recent feed (last 15 check-ins)
  const recentFeed = await db.participant.findMany({
    where: { checkInAt: { not: null } },
    select: {
      participantId: true,
      name: true,
      sector: true,
      region: true,
      status: true,
      checkInAt: true,
    },
    orderBy: { checkInAt: 'desc' },
    take: 15,
  });

  const todayHours = velocity.slice(-Math.max(1, now.getHours() + 1));
  const peakHour = todayHours.reduce(
    (max, h) => (h.total > max.total ? h : max),
    { hour: '—', physical: 0, online: 0, total: 0 },
  );

  return NextResponse.json({
    timestamp: now.toISOString(),
    today: {
      total: todayTotal,
      physical: todayPhysical,
      online: todayOnline,
      peakHour: peakHour.hour,
      peakHourCount: peakHour.total,
    },
    allTime: {
      total: allTimeTotal,
      physical: allTimePhysical,
      online: allTimeOnline,
    },
    velocity,
    regionAttendance,
    feed: recentFeed.map((p) => ({
      participantId: p.participantId,
      name: p.name,
      sector: p.sector,
      region: p.region,
      status: p.status,
      checkInAt: p.checkInAt!.toISOString(),
    })),
  });
}
