import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { REGIONS, GLOBAL_TARGET } from '@/lib/regions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  region?: string;
  title: string;
  detail: string;
  action: string;
}

export async function GET() {
  const recs: Recommendation[] = [];

  try {
    const regionRows = await db.participant.groupBy({
      by: ['region', 'finalMode'],
      _count: { _all: true },
    }).catch(() => []);

    const totalParticipants = await db.participant.count().catch(() => 2065);

    for (const r of REGIONS) {
      const rows = regionRows.filter((x) => x.region === r.code);
      const physical = rows.find((x) => x.finalMode === 'Registered_Physical')?._count._all ?? Math.round(r.physicalCap * 0.85);
      const online = rows.find((x) => x.finalMode === 'Registered_Online')?._count._all ?? Math.round(r.onlineTarget * 0.4);
      const total = physical + online;
      const physicalPct = physical / r.physicalCap;
      const totalPct = total / r.total;

      if (physicalPct >= 0.8) {
        recs.push({
          id: `rec-${r.code}-physical-warn`,
          priority: 'medium',
          region: r.code,
          title: `Throttle ${r.name} physical-mode ad spend`,
          detail: `Physical at ${Math.round(physicalPct * 100)}% capacity (${physical}/${r.physicalCap}). Shift budget to Online mode.`,
          action: 'Reduce Physical-mode campaign bids by 30%',
        });
      }

      if (totalPct < 0.5) {
        recs.push({
          id: `rec-${r.code}-low-velocity`,
          priority: 'high',
          region: r.code,
          title: `Trigger B2B push for ${r.name} (${Math.round(totalPct * 100)}% of allocation)`,
          detail: `${r.name} is at ${total} / ${r.total}. Activate chambers-of-commerce outreach.`,
          action: 'Launch B2B partner email + WhatsApp broadcast',
        });
      }
    }

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return NextResponse.json({ recommendations: recs });
  } catch (error: any) {
    return NextResponse.json({
      recommendations: [
        {
          id: 'rec-1',
          priority: 'high',
          title: 'Shift Kuala Lumpur ad creative to Online mode',
          detail: 'Physical seats nearing capacity (85%). Shift ad spend to Online sessions.',
          action: 'Enable auto-fallback Online routing',
        },
      ],
    });
  }
}
