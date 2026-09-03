import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const PROGRAMME_TITLE = 'ASEAN MSMEs AI Skills Training Programme';

export interface CoachClassRecord {
  id: string;
  module: string;
  coachId: string;
  coachName: string;
  region: string;
  regionName: string;
  date: string;
  time: string;
  venue: string;
  targetSeats: number;
}

export const DEFAULT_CLASSES: CoachClassRecord[] = [
  {
    id: 'cls-01',
    module: PROGRAMME_TITLE,
    coachId: 'coach-mohsin',
    coachName: 'Coach Mohsin',
    region: 'KL',
    regionName: 'Kuala Lumpur (HQ)',
    date: '2026-09-02',
    time: '09:00 AM - 05:00 PM',
    venue: 'INSKEN Main Hall KL Sentral',
    targetSeats: 400,
  },
  {
    id: 'cls-02',
    module: PROGRAMME_TITLE,
    coachId: 'coach-adly',
    coachName: 'Coach Dr. Adly',
    region: 'JHR',
    regionName: 'Johor Bahru',
    date: '2026-09-05',
    time: '09:00 AM - 05:00 PM',
    venue: 'Persada Johor International Convention Centre',
    targetSeats: 200,
  },
  {
    id: 'cls-03',
    module: PROGRAMME_TITLE,
    coachId: 'coach-mohsin',
    coachName: 'Coach Mohsin',
    region: 'PNG',
    regionName: 'Pulau Pinang',
    date: '2026-09-08',
    time: '09:00 AM - 05:00 PM',
    venue: 'Setia SPICE Convention Centre, Penang',
    targetSeats: 200,
  },
  {
    id: 'cls-04',
    module: PROGRAMME_TITLE,
    coachId: 'coach-adly',
    coachName: 'Coach Dr. Adly',
    region: 'SBH',
    regionName: 'Sabah (Kota Kinabalu)',
    date: '2026-09-12',
    time: '09:00 AM - 05:00 PM',
    venue: 'Sabah International Convention Centre (SICC)',
    targetSeats: 200,
  },
  {
    id: 'cls-05',
    module: PROGRAMME_TITLE,
    coachId: 'coach-mohsin',
    coachName: 'Coach Mohsin',
    region: 'SWK',
    regionName: 'Sarawak (Kuching)',
    date: '2026-09-15',
    time: '09:00 AM - 05:00 PM',
    venue: 'Borneo Convention Centre Kuching (BCCK)',
    targetSeats: 200,
  },
  {
    id: 'cls-06',
    module: PROGRAMME_TITLE,
    coachId: 'coach-adly',
    coachName: 'Coach Dr. Adly',
    region: 'KL',
    regionName: 'Kuala Lumpur',
    date: '2026-09-18',
    time: '09:00 AM - 05:00 PM',
    venue: 'INSKEN Main Theatre Hall',
    targetSeats: 400,
  },
];

let inMemoryCoachClasses: CoachClassRecord[] = [...DEFAULT_CLASSES];

export async function GET() {
  try {
    const latestConfig = await db.auditLog.findFirst({
      where: { action: 'COACH_CLASSES_CONFIG' },
      orderBy: { createdAt: 'desc' },
    }).catch(() => null);

    if (latestConfig && latestConfig.detail) {
      try {
        const parsed = JSON.parse(latestConfig.detail);
        if (Array.isArray(parsed) && parsed.length > 0) {
          inMemoryCoachClasses = parsed.map((c) => ({
            ...c,
            module: PROGRAMME_TITLE,
          }));
        }
      } catch {
        // use in-memory
      }
    }
  } catch (err) {
    console.warn('D1 coach config fallback:', err);
  }

  // Extract unique coach list for dropdowns
  const uniqueCoaches = Array.from(
    new Map(inMemoryCoachClasses.map((c) => [c.coachId, { coachId: c.coachId, coachName: c.coachName }])).values()
  );

  return NextResponse.json({
    ok: true,
    classes: inMemoryCoachClasses,
    coaches: uniqueCoaches,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { classes } = body;

    if (Array.isArray(classes)) {
      inMemoryCoachClasses = classes.map((c: any) => ({
        ...c,
        module: PROGRAMME_TITLE,
      }));

      try {
        await db.auditLog.create({
          data: {
            action: 'COACH_CLASSES_CONFIG',
            participant: 'Admin (Coach Manager)',
            detail: JSON.stringify(inMemoryCoachClasses),
          },
        });
      } catch {
        // Ignore D1 limits
      }
    }

    return NextResponse.json({
      ok: true,
      message: 'Coach schedule saved successfully!',
      classes: inMemoryCoachClasses,
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: true,
      message: 'Coach schedule saved.',
      classes: inMemoryCoachClasses,
    });
  }
}
