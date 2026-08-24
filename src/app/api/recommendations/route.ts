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

/**
 * Intelligence Recommendations — rule-based advice layer.
 * Mirrors PRD section 6 "AI-driven advice on marketing shifts".
 */
export async function GET() {
  const recs: Recommendation[] = [];

  const regionRows = await db.participant.groupBy({
    by: ['region', 'finalMode'],
    _count: { _all: true },
  });

  const totalParticipants = await db.participant.count();

  for (const r of REGIONS) {
    const rows = regionRows.filter((x) => x.region === r.code);
    const physical = rows.find((x) => x.finalMode === 'Registered_Physical')?._count._all ?? 0;
    const online = rows.find((x) => x.finalMode === 'Registered_Online')?._count._all ?? 0;
    const total = physical + online;
    const physicalPct = physical / r.physicalCap;
    const totalPct = total / r.total;

    // High priority: physical capacity near full + marketing still pushing physical
    if (physical >= r.physicalCap) {
      recs.push({
        id: `rec-${r.code}-physical-full`,
        priority: 'high',
        region: r.code,
        title: `Switch ${r.name} ad creative from Physical to Online`,
        detail: `Physical seats sold out (${physical}/${r.physicalCap}). All new leads are auto-falling back to Online. Continuing Physical-targeted ad spend wastes ~RM 3,200 / day at current CPL.`,
        action: 'Pause Physical-mode campaigns · Shift budget to Online-mode creative',
      });
    } else if (physicalPct >= 0.8) {
      recs.push({
        id: `rec-${r.code}-physical-warn`,
        priority: 'medium',
        region: r.code,
        title: `Throttle ${r.name} physical-mode ad spend`,
        detail: `Physical at ${Math.round(physicalPct * 100)}% capacity (${physical}/${r.physicalCap}). Reduce bid multiplier by 30% to extend runway to event day.`,
        action: 'Reduce Physical-mode campaign bids by 30%',
      });
    }

    // Low velocity: total allocation < 50%
    if (totalPct < 0.5) {
      recs.push({
        id: `rec-${r.code}-low-velocity`,
        priority: 'high',
        region: r.code,
        title: `Trigger B2B push for ${r.name} (${Math.round(totalPct * 100)}% of allocation)`,
        detail: `${r.name} is at ${total} / ${r.total} (${Math.round(totalPct * 100)}%). Below 50% threshold 7 days out. Activate chambers-of-commerce outreach and MSME association partnerships.`,
        action: 'Launch B2B partner email + WhatsApp broadcast to MSME associations',
      });
    }

    // Online underutilised: physical full + online has slack
    if (physical >= r.physicalCap && online < r.onlineTarget * 0.7) {
      recs.push({
        id: `rec-${r.code}-online-push`,
        priority: 'medium',
        region: r.code,
        title: `Amplify Online session demand in ${r.name}`,
        detail: `Physical exhausted but Online at ${Math.round((online / r.onlineTarget) * 100)}% of target (${online}/${r.onlineTarget}). Promote Online session to retail & F&B sectors for fastest fill.`,
        action: 'Boost Online-mode retargeting ads to top-3 sectors',
      });
    }
  }

  // Global recommendations
  if (totalParticipants >= GLOBAL_TARGET * 0.75) {
    recs.push({
      id: 'rec-global-milestone',
      priority: 'low',
      title: 'Prepare attendance playbook for full cohort',
      detail: `Global registrations at ${totalParticipants} (${Math.round((totalParticipants / GLOBAL_TARGET) * 100)}%). Begin venue logistics review and WhatsApp broadcast capacity test.`,
      action: 'Schedule venue logistics + WhatsApp broadcast dry-run',
    });
  }

  if (totalParticipants < GLOBAL_TARGET * 0.25) {
    recs.push({
      id: 'rec-global-cold-start',
      priority: 'high',
      title: 'Activate nationwide awareness campaign',
      detail: `Only ${totalParticipants} registrations (${Math.round((totalParticipants / GLOBAL_TARGET) * 100)}% of target). Activate nationwide Meta + Google awareness push targeting top-3 MSME sectors.`,
      action: 'Launch nationwide awareness campaign',
    });
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return NextResponse.json({ recommendations: recs });
}
