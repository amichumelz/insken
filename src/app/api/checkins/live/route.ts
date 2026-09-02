import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { REGIONS } from '@/lib/regions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Live attendance tracking endpoint.
 * Returns: today's check-ins, 24-hour velocity, recent feed, per-region breakdown.
 */
export async function GET() {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOf24hAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Today's totals
  const todayPhysical = await db.participant.count({
    where: { status: 'Attended_Physical', checkInAt: { gte: startOfToday } },
  });
  const todayOnline = await db.participant.count({
    where: { status: 'Attended_Online', checkInAt: { gte: startOfToday } },
  });
  const todayTotal = todayPhysical + todayOnline;

  // All-time attended
  const allTimePhysical = await db.participant.count({ where: { status: 'Attended_Physical' } });
  const allTimeOnline = await db.participant.count({ where: { status: 'Attended_Online' } });
  const allTimeTotal = allTimePhysical + allTimeOnline;

  // Hourly velocity (last 24 hours)
  const recentCheckins = await db.participant.findMany({
    where: { checkInAt: { gte: startOf24hAgo } },
    select: { checkInAt: true, region: true, status: true, name: true, participantId: true, sector: true },
    orderBy: { checkInAt: 'desc' },
    take: 500,
  });

  const hourMap = new Map<string, { hour: string; physical: number; online: number; total: number }>();
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 13); // YYYY-MM-DDTHH
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

  // Per-region attendance breakdown (today + all-time)
  const regionAttendance = await Promise.all(
    REGIONS.map(async (r) => {
      const [today, allTime] = await Promise.all([
        db.participant.count({
          where: { region: r.code, status: { in: ['Attended_Physical', 'Attended_Online'] }, checkInAt: { gte: startOfToday } },
        }),
        db.participant.count({
          where: { region: r.code, status: { in: ['Attended_Physical', 'Attended_Online'] } },
        }),
      ]);
      return { code: r.code, name: r.name, today, allTime };
    }),
  );

  // Recent feed (last 20 check-ins)
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
    take: 20,
  });

  // Peak hour today
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
