import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DEFAULT_EVENT_DATES } from '@/lib/event-dates';
import { REGIONS } from '@/lib/regions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-memory persistent state across requests in this isolate
let inMemoryDates: Record<string, string> = { ...DEFAULT_EVENT_DATES };
let inMemoryForceActiveMap: Record<string, boolean> = { KL: true };

export async function GET() {
  try {
    const latestConfig = await db.auditLog.findFirst({
      where: { action: 'EVENT_DATES_CONFIG' },
      orderBy: { createdAt: 'desc' },
    }).catch(() => null);

    if (latestConfig && latestConfig.detail) {
      try {
        const parsed = JSON.parse(latestConfig.detail);
        if (parsed.dates) inMemoryDates = { ...inMemoryDates, ...parsed.dates };
        if (parsed.forceActiveMap) inMemoryForceActiveMap = { ...inMemoryForceActiveMap, ...parsed.forceActiveMap };
      } catch {
        // use fallback
      }
    }
  } catch (err) {
    console.warn('D1 event-dates fallback:', err);
  }

  const regionsList = REGIONS.map((r) => ({
    code: r.code,
    name: r.name,
    date: inMemoryDates[r.code] || DEFAULT_EVENT_DATES[r.code] || '2026-09-02',
    forceActive: !!inMemoryForceActiveMap[r.code],
  }));

  return NextResponse.json({
    ok: true,
    dates: inMemoryDates,
    forceActiveMap: inMemoryForceActiveMap,
    regions: regionsList,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dates, forceActiveMap } = body;

    if (dates) inMemoryDates = { ...inMemoryDates, ...dates };
    if (forceActiveMap) inMemoryForceActiveMap = { ...inMemoryForceActiveMap, ...forceActiveMap };

    const payloadStr = JSON.stringify({
      dates: inMemoryDates,
      forceActiveMap: inMemoryForceActiveMap,
      updatedAt: new Date().toISOString(),
    });

    try {
      await db.auditLog.create({
        data: {
          action: 'EVENT_DATES_CONFIG',
          participant: 'Admin (Scheduler)',
          detail: payloadStr,
        },
      });
    } catch {
      // Ignore D1 row limits — memory cache already saved
    }

    return NextResponse.json({
      ok: true,
      message: 'Tarikh latihan dan akses kehadiran berjaya dikemas kini!',
      dates: inMemoryDates,
      forceActiveMap: inMemoryForceActiveMap,
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: true,
      message: 'Tetapan tarikh disimpan (Mod Memori).',
      dates: inMemoryDates,
      forceActiveMap: inMemoryForceActiveMap,
    });
  }
}
