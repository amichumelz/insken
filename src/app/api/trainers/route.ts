import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Trainer, TrainerFeedback } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SESSION_NAMES = [
  'AI for Retail Marketing',
  'ChatGPT for MSME Operations',
  'AI Tools for F&B',
  'Generative A.I. Fundamentals',
  'Workflow Automation 101',
  'No-Code A.I. Tools for MSMEs',
  'Automation for Service Businesses',
];
const FIRST_NAMES = ['Ahmad', 'Siti', 'Lim', 'Tan', 'Priya', 'Daniel', 'Nurul', 'Hafiz', 'Kumar', 'Aishah'];

/**
 * Returns trainer profiles with KPIs, 12-month performance trends, and
 * pre/post-session feedback. Two coaches (Coach A & Coach B) for toggle.
 * Live feedback and KPI nudges (logged by /api/live/tick) are merged on top
 * of the static baseline so the dashboard shows live movement.
 */
export async function GET() {
  // Pull the last 24 hours of FEEDBACK and TRAINER_KPI audit entries to merge
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const liveEvents = await db.auditLog.findMany({
    where: {
      action: { in: ['FEEDBACK', 'TRAINER_KPI'] },
      createdAt: { gte: since },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  // Aggregate KPI deltas per coach
  const kpiDeltas: Record<string, { sessions: number; ratingSum: number; ratingN: number }> = {
    'coach-a': { sessions: 0, ratingSum: 0, ratingN: 0 },
    'coach-b': { sessions: 0, ratingSum: 0, ratingN: 0 },
  };
  const liveFeedback: Record<string, { pre: TrainerFeedback[]; post: TrainerFeedback[] }> = {
    'coach-a': { pre: [], post: [] },
    'coach-b': { pre: [], post: [] },
  };

  for (const ev of liveEvents) {
    if (ev.action === 'TRAINER_KPI' && ev.icNumber) {
      // Format: <coachId>|sessions:+X|rating:+/-0.123
      const [coachId, sessionsPart, ratingPart] = ev.icNumber.split('|');
      if (!coachId || !kpiDeltas[coachId]) continue;
      const sessionsMatch = sessionsPart?.match(/sessions:\+(\d+)/);
      const ratingMatch = ratingPart?.match(/rating:([+-]?[\d.]+)/);
      if (sessionsMatch) kpiDeltas[coachId].sessions += parseInt(sessionsMatch[1], 10);
      if (ratingMatch) {
        const r = parseFloat(ratingMatch[1]);
        kpiDeltas[coachId].ratingSum += r;
        kpiDeltas[coachId].ratingN += 1;
      }
    } else if (ev.action === 'FEEDBACK' && ev.icNumber) {
      // Format: <coachId>|<pre|post>|<participantId>|<rating>|<comment>
      const [coachId, phase, participantId, ratingStr, ...commentParts] = ev.icNumber.split('|');
      if (!coachId || !liveFeedback[coachId]) continue;
      const comment = commentParts.join('|') || ev.detail;
      const phaseKey = phase === 'pre' ? 'pre' : 'post';
      liveFeedback[coachId][phaseKey].push({
        id: `live-${ev.id}`,
        participantName: ev.participant || 'Anonymous',
        participantId: participantId || 'ASEAN-00000',
        session: SESSION_NAMES[Math.abs(participantId?.charCodeAt(0) || 0) % SESSION_NAMES.length] || SESSION_NAMES[0],
        rating: parseInt(ratingStr || '4', 10),
        comment,
        submittedAt: ev.createdAt.toISOString(),
      });
    }
  }

  const trainers: Trainer[] = [
    {
      id: 'coach-a',
      name: 'Mohsin',
      role: 'Lead A.I. Skills Coach',
      specialty: 'Generative A.I. for Retail & F&B',
      initials: 'MO',
      color: 'from-blue-500 to-indigo-600',
      joinedAt: '2024-03-15',
      kpi: {
        sessionsConducted: 48 + kpiDeltas['coach-a'].sessions,
        totalParticipants: 1240 + kpiDeltas['coach-a'].sessions * 26,
        attendanceRate: 92,
        completionRate: 87,
        avgRating:
          kpiDeltas['coach-a'].ratingN > 0
            ? Math.max(1, Math.min(5, 4.7 + kpiDeltas['coach-a'].ratingSum / kpiDeltas['coach-a'].ratingN))
            : 4.7,
        responseTimeMins: 14,
      },
      performance: [
        { month: 'Sep 25', sessions: 3, attendance: 88, rating: 4.5 },
        { month: 'Oct 25', sessions: 4, attendance: 90, rating: 4.6 },
        { month: 'Nov 25', sessions: 4, attendance: 89, rating: 4.5 },
        { month: 'Dec 25', sessions: 3, attendance: 91, rating: 4.7 },
        { month: 'Jan 26', sessions: 4, attendance: 92, rating: 4.7 },
        { month: 'Feb 26', sessions: 5, attendance: 93, rating: 4.8 },
        { month: 'Mar 26', sessions: 4, attendance: 92, rating: 4.7 },
        { month: 'Apr 26', sessions: 4, attendance: 91, rating: 4.6 },
        { month: 'May 26', sessions: 5, attendance: 93, rating: 4.8 },
        { month: 'Jun 26', sessions: 4, attendance: 92, rating: 4.7 },
        { month: 'Jul 26', sessions: 4, attendance: 94, rating: 4.9 },
        { month: 'Aug 26', sessions: 4 + kpiDeltas['coach-a'].sessions, attendance: 92, rating: kpiDeltas['coach-a'].ratingN > 0 ? Math.max(1, Math.min(5, 4.7 + kpiDeltas['coach-a'].ratingSum / kpiDeltas['coach-a'].ratingN)) : 4.7 },
      ],
      preFeedback: [...liveFeedback['coach-a'].pre, ...[
        {
          id: 'pre-a-1',
          participantName: 'Siti Nurhaliza',
          participantId: 'ASEAN-02301',
          session: 'AI for Retail Marketing',
          rating: 4,
          comment:
            'Was nervous about the technical depth, but the pre-session onboarding survey helped me understand what to expect. Looking forward to it.',
          submittedAt: '2026-08-20T09:14:00Z',
        },
        {
          id: 'pre-a-2',
          participantName: 'Tan Wei Ming',
          participantId: 'ASEAN-01845',
          session: 'ChatGPT for MSME Operations',
          rating: 5,
          comment:
            'Coach Mohsin sent a helpful primer video 3 days before — felt well-prepared before walking in. The agenda was clearly communicated.',
          submittedAt: '2026-08-19T15:32:00Z',
        },
        {
          id: 'pre-a-3',
          participantName: 'Priya a/l Subramaniam',
          participantId: 'ASEAN-01522',
          session: 'AI Tools for F&B',
          rating: 4,
          comment:
            'Appreciated the quick WhatsApp check-in before the session. The pre-assessment was short and respectful of my time.',
          submittedAt: '2026-08-18T11:08:00Z',
        },
        {
          id: 'pre-a-4',
          participantName: 'Muhammad Hafiz',
          participantId: 'ASEAN-01044',
          session: 'Generative A.I. Fundamentals',
          rating: 5,
          comment:
            'Loved that the coach asked about my business goals before the session. Felt personalised from the start, not like a generic workshop.',
          submittedAt: '2026-08-17T13:45:00Z',
        },
      ]].slice(0, 8),
      postFeedback: [...liveFeedback['coach-a'].post, ...[
        {
          id: 'post-a-1',
          participantName: 'Siti Nurhaliza',
          participantId: 'ASEAN-02301',
          session: 'AI for Retail Marketing',
          rating: 5,
          comment:
            'Absolutely transformative. I left with a working AI-generated marketing calendar for my boutique. Coach Mohsin was patient with every question.',
          submittedAt: '2026-08-21T17:22:00Z',
        },
        {
          id: 'post-a-2',
          participantName: 'Tan Wei Ming',
          participantId: 'ASEAN-01845',
          session: 'ChatGPT for MSME Operations',
          rating: 5,
          comment:
            'Already saved 6 hours/week by automating customer replies. The hands-on templates alone were worth the entire session.',
          submittedAt: '2026-08-20T19:14:00Z',
        },
        {
          id: 'post-a-3',
          participantName: 'Priya a/l Subramaniam',
          participantId: 'ASEAN-01522',
          session: 'AI Tools for F&B',
          rating: 4,
          comment:
            'Great session, learned 3 new tools I had never heard of. Would have liked more time on the menu-design exercise though.',
          submittedAt: '2026-08-19T18:55:00Z',
        },
        {
          id: 'post-a-4',
          participantName: 'Muhammad Hafiz',
          participantId: 'ASEAN-01044',
          session: 'Generative A.I. Fundamentals',
          rating: 5,
          comment:
            'Best MSME training I have attended. The coach stayed 30 mins after to help me set up my first AI workflow. Highly recommend.',
          submittedAt: '2026-08-18T20:08:00Z',
        },
      ]].slice(0, 8),
    },
    {
      id: 'coach-b',
      name: 'Dr. Adly',
      role: 'Senior A.I. Skills Coach',
      specialty: 'Automation & Workflow Optimisation',
      initials: 'DA',
      color: 'from-amber-500 to-orange-600',
      joinedAt: '2024-06-02',
      kpi: {
        sessionsConducted: 41 + kpiDeltas['coach-b'].sessions,
        totalParticipants: 980 + kpiDeltas['coach-b'].sessions * 24,
        attendanceRate: 88,
        completionRate: 82,
        avgRating:
          kpiDeltas['coach-b'].ratingN > 0
            ? Math.max(1, Math.min(5, 4.5 + kpiDeltas['coach-b'].ratingSum / kpiDeltas['coach-b'].ratingN))
            : 4.5,
        responseTimeMins: 22,
      },
      performance: [
        { month: 'Sep 25', sessions: 2, attendance: 82, rating: 4.2 },
        { month: 'Oct 25', sessions: 3, attendance: 84, rating: 4.3 },
        { month: 'Nov 25', sessions: 3, attendance: 85, rating: 4.3 },
        { month: 'Dec 25', sessions: 3, attendance: 86, rating: 4.4 },
        { month: 'Jan 26', sessions: 4, attendance: 87, rating: 4.4 },
        { month: 'Feb 26', sessions: 4, attendance: 88, rating: 4.5 },
        { month: 'Mar 26', sessions: 3, attendance: 87, rating: 4.4 },
        { month: 'Apr 26', sessions: 4, attendance: 88, rating: 4.5 },
        { month: 'May 26', sessions: 3, attendance: 89, rating: 4.6 },
        { month: 'Jun 26', sessions: 4, attendance: 90, rating: 4.6 },
        { month: 'Jul 26', sessions: 4, attendance: 88, rating: 4.5 },
        { month: 'Aug 26', sessions: 4 + kpiDeltas['coach-b'].sessions, attendance: 88, rating: kpiDeltas['coach-b'].ratingN > 0 ? Math.max(1, Math.min(5, 4.5 + kpiDeltas['coach-b'].ratingSum / kpiDeltas['coach-b'].ratingN)) : 4.5 },
      ],
      preFeedback: [...liveFeedback['coach-b'].pre, ...[
        {
          id: 'pre-b-1',
          participantName: 'Lim Mei Ling',
          participantId: 'ASEAN-02298',
          session: 'Workflow Automation 101',
          rating: 4,
          comment:
            'Coach Dr. Adly sent a pre-session questionnaire that helped me identify my top 3 bottlenecks. Looking forward to solving them.',
          submittedAt: '2026-08-20T10:22:00Z',
        },
        {
          id: 'pre-b-2',
          participantName: 'Raj a/l Kumar',
          participantId: 'ASEAN-01987',
          session: 'No-Code A.I. Tools for MSMEs',
          rating: 3,
          comment:
            'The pre-session materials were good but I would have preferred a shorter intro video — 20 mins felt long.',
          submittedAt: '2026-08-19T14:08:00Z',
        },
        {
          id: 'pre-b-3',
          participantName: 'Nurul Huda',
          participantId: 'ASEAN-01712',
          session: 'Automation for Service Businesses',
          rating: 5,
          comment:
            'Loved that the coach called me directly to understand my salon business before the session. Felt very well prepared.',
          submittedAt: '2026-08-18T09:45:00Z',
        },
      ]].slice(0, 8),
      postFeedback: [...liveFeedback['coach-b'].post, ...[
        {
          id: 'post-b-1',
          participantName: 'Lim Mei Ling',
          participantId: 'ASEAN-02298',
          session: 'Workflow Automation 101',
          rating: 5,
          comment:
            'Built my first Zapier automation in the session — already saving 4 hours/week on invoicing. Coach Dr. Adly was very practical.',
          submittedAt: '2026-08-21T16:50:00Z',
        },
        {
          id: 'post-b-2',
          participantName: 'Raj a/l Kumar',
          participantId: 'ASEAN-01987',
          session: 'No-Code A.I. Tools for MSMEs',
          rating: 4,
          comment:
            'Learned useful tools but the pacing was a bit fast for someone with no technical background. The reference guide helped afterwards.',
          submittedAt: '2026-08-20T18:30:00Z',
        },
        {
          id: 'post-b-3',
          participantName: 'Nurul Huda',
          participantId: 'ASEAN-01712',
          session: 'Automation for Service Businesses',
          rating: 5,
          comment:
            'My salon now has automated booking reminders thanks to this session. Coach Dr. Adly even followed up a week later to check on my progress.',
          submittedAt: '2026-08-19T19:15:00Z',
        },
        {
          id: 'post-b-4',
          participantName: 'Ahmad Rizki',
          participantId: 'ASEAN-01458',
          session: 'Workflow Automation 101',
          rating: 4,
          comment:
            'Solid content and clear delivery. Would have liked more sector-specific examples for manufacturing, but the framework itself is gold.',
          submittedAt: '2026-08-18T17:42:00Z',
        },
      ]].slice(0, 8),
    },
  ];

  return NextResponse.json({ trainers });
}
