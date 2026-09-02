import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DEFAULT_EVENT_DATES } from '@/lib/event-dates';
import { REGIONS } from '@/lib/regions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const latestConfig = await db.auditLog.findFirst({
      where: { action: 'EVENT_DATES_CONFIG' },
      orderBy: { createdAt: 'desc' },
    });

    let dates = { ...DEFAULT_EVENT_DATES };
    let forceActiveMap: Record<string, boolean> = { KL: true };

    if (latestConfig && latestConfig.detail) {
      try {
        const parsed = JSON.parse(latestConfig.detail);
        if (parsed.dates) dates = { ...dates, ...parsed.dates };
        if (parsed.forceActiveMap) forceActiveMap = { ...parsed.forceActiveMap };
      } catch {
        // use fallback
      }
    }

    const regionsList = REGIONS.map((r) => ({
      code: r.code,
      name: r.name,
      date: dates[r.code] || DEFAULT_EVENT_DATES[r.code] || '2026-09-02',
      forceActive: !!forceActiveMap[r.code],
    }));

    return NextResponse.json({
      ok: true,
      dates,
      forceActiveMap,
      regions: regionsList,
    });
  } catch (error: any) {
    console.error('Error fetching event dates:', error);
    return NextResponse.json({
      ok: true,
      dates: DEFAULT_EVENT_DATES,
      forceActiveMap: { KL: true },
      regions: REGIONS.map((r) => ({
        code: r.code,
        name: r.name,
        date: DEFAULT_EVENT_DATES[r.code],
        forceActive: r.code === 'KL',
      })),
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dates, forceActiveMap } = body;

    const payloadStr = JSON.stringify({
      dates: dates || DEFAULT_EVENT_DATES,
      forceActiveMap: forceActiveMap || {},
      updatedAt: new Date().toISOString(),
    });

    await db.auditLog.create({
      data: {
        action: 'EVENT_DATES_CONFIG',
        participant: 'Admin (Scheduler)',
        detail: payloadStr,
      },
    });

    return NextResponse.json({
      ok: true,
      message: 'Tarikh latihan dan akses kehadiran berjaya dikemas kini!',
      dates,
      forceActiveMap,
    });
  } catch (error: any) {
    console.error('Error saving event dates:', error);
    return NextResponse.json(
      { ok: false, message: error?.message || 'Ralat menyimpan tarikh latihan.' },
      { status: 500 }
    );
  }
}
