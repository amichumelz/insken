import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Trainer, TrainerFeedback } from '@/lib/types';
import { DEFAULT_CLASSES } from '@/app/api/config/coaches/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PROGRAMME_TITLE = 'ASEAN MSMEs AI Skills Training Programme';

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
  }).catch(() => []);

  // Aggregate KPI deltas per coach
  const kpiDeltas: Record<string, { sessions: number; ratingSum: number; ratingN: number }> = {
    'coach-mohsin': { sessions: 3, ratingSum: 14.4, ratingN: 3 },
    'coach-adly': { sessions: 3, ratingSum: 13.8, ratingN: 3 },
    'coach-a': { sessions: 0, ratingSum: 0, ratingN: 0 },
    'coach-b': { sessions: 0, ratingSum: 0, ratingN: 0 },
  };

  const liveFeedback: Record<string, { pre: TrainerFeedback[]; post: TrainerFeedback[] }> = {
    'coach-mohsin': { pre: [], post: [] },
    'coach-adly': { pre: [], post: [] },
    'coach-a': { pre: [], post: [] },
    'coach-b': { pre: [], post: [] },
  };

  for (const ev of liveEvents) {
    if (ev.action === 'TRAINER_KPI' && ev.icNumber) {
      let [coachId, sessionsPart, ratingPart] = ev.icNumber.split('|');
      if (coachId === 'coach-a') coachId = 'coach-mohsin';
      if (coachId === 'coach-b') coachId = 'coach-adly';

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
      let [coachId, phase, participantId, ratingStr, ...commentParts] = ev.icNumber.split('|');
      if (coachId === 'coach-a') coachId = 'coach-mohsin';
      if (coachId === 'coach-b') coachId = 'coach-adly';

      if (!coachId || !liveFeedback[coachId]) continue;
      const comment = commentParts.join('|') || ev.detail;
      const phaseKey = phase === 'pre' ? 'pre' : 'post';
      liveFeedback[coachId][phaseKey].push({
        id: `live-${ev.id}`,
        participantName: ev.participant || 'Anonymous',
        participantId: participantId || 'ASEAN-00000',
        session: PROGRAMME_TITLE,
        rating: parseInt(ratingStr || '5', 10),
        comment,
        submittedAt: ev.createdAt.toISOString(),
      });
    }
  }

  const buildKpi = (coachId: 'coach-mohsin' | 'coach-adly', baseAttendance: number, baseCompletion: number, baseRating: number, baseResponseMins: number) => {
    const sessions = kpiDeltas[coachId].sessions;
    const participants = sessions * 250;
    const hasFirstSession = sessions > 0;
    const hasFirstFeedback = kpiDeltas[coachId].ratingN > 0;
    return {
      sessionsConducted: sessions,
      totalParticipants: participants,
      attendanceRate: hasFirstSession ? baseAttendance : 92,
      completionRate: hasFirstSession ? baseCompletion : 88,
      avgRating: hasFirstFeedback
        ? Math.max(1, Math.min(5, Number((kpiDeltas[coachId].ratingSum / kpiDeltas[coachId].ratingN).toFixed(1))))
        : baseRating,
      responseTimeMins: hasFirstSession ? baseResponseMins : 15,
    };
  };

  const buildPerformance = (coachId: 'coach-mohsin' | 'coach-adly', baseAttendance: number, baseRating: number) => {
    const sessions = kpiDeltas[coachId].sessions;
    const months = [
      'Sep 25', 'Oct 25', 'Nov 25', 'Dec 25',
      'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26',
      'May 26', 'Jun 26', 'Jul 26', 'Aug 26', 'Sep 26',
    ];
    return months.map((month) => {
      const isCurrent = month === 'Sep 26' || month === 'Aug 26';
      return {
        month,
        sessions: isCurrent ? sessions : Math.floor(sessions / 2),
        attendance: isCurrent ? baseAttendance : baseAttendance - 4,
        rating: isCurrent ? baseRating : baseRating - 0.1,
      };
    });
  };

  const trainers: Trainer[] = [
    {
      id: 'coach-mohsin',
      name: 'Coach Mohsin',
      role: 'Lead A.I. Skills Coach',
      specialty: 'Generative A.I. for MSMEs & Sales Automation',
      initials: 'CM',
      color: 'from-blue-500 to-indigo-600',
      joinedAt: '2024-03-15',
      kpi: buildKpi('coach-mohsin', 94, 91, 4.8, 12),
      performance: buildPerformance('coach-mohsin', 94, 4.8),
      preFeedback: [
        ...liveFeedback['coach-mohsin'].pre,
        ...liveFeedback['coach-a'].pre,
        ...[
          {
            id: 'pre-m-1',
            participantName: 'Ahmad Farhan bin Rosli',
            participantId: 'ASEAN-00001',
            session: PROGRAMME_TITLE,
            rating: 5,
            comment:
              'Coach Mohsin sent clear pre-session instructions. Excited to learn practical AI tools for my retail business.',
            submittedAt: '2026-08-20T09:14:00Z',
          },
          {
            id: 'pre-m-2',
            participantName: 'Tan Wei Loon',
            participantId: 'ASEAN-00003',
            session: PROGRAMME_TITLE,
            rating: 5,
            comment:
              'The pre-session briefing material provided great context. Looking forward to streamlining our manufacturing workflows.',
            submittedAt: '2026-08-22T15:32:00Z',
          },
          {
            id: 'pre-m-3',
            participantName: 'Priya a/p Subramaniam',
            participantId: 'ASEAN-00006',
            session: PROGRAMME_TITLE,
            rating: 4,
            comment:
              'Appreciated the prompt pre-session onboarding. Agenda and schedule are very structured.',
            submittedAt: '2026-08-25T11:08:00Z',
          },
        ],
      ].slice(0, 8),
      postFeedback: [
        ...liveFeedback['coach-mohsin'].post,
        ...liveFeedback['coach-a'].post,
        ...[
          {
            id: 'post-m-1',
            participantName: 'Ahmad Farhan bin Rosli',
            participantId: 'ASEAN-00001',
            session: PROGRAMME_TITLE,
            rating: 5,
            comment:
              'Absolutely transformative session! Coach Mohsin explained ChatGPT and marketing automation with crystal clarity.',
            submittedAt: '2026-09-02T17:22:00Z',
          },
          {
            id: 'post-m-2',
            participantName: 'Tan Wei Loon',
            participantId: 'ASEAN-00003',
            session: PROGRAMME_TITLE,
            rating: 5,
            comment:
              'Highly practical step-by-step guidance. Already automated our customer enquiries template.',
            submittedAt: '2026-09-02T18:14:00Z',
          },
          {
            id: 'post-m-3',
            participantName: 'Priya a/p Subramaniam',
            participantId: 'ASEAN-00006',
            session: PROGRAMME_TITLE,
            rating: 5,
            comment:
              'The best training attended this year. Coach Mohsin stayed back to guide us through our first AI workflow setup.',
            submittedAt: '2026-09-02T19:05:00Z',
          },
        ],
      ].slice(0, 8),
    },
    {
      id: 'coach-adly',
      name: 'Coach Dr. Adly',
      role: 'Senior A.I. Skills Coach',
      specialty: 'Workflow Automation & Enterprise A.I. Implementation',
      initials: 'DA',
      color: 'from-amber-500 to-orange-600',
      joinedAt: '2024-06-02',
      kpi: buildKpi('coach-adly', 91, 86, 4.6, 18),
      performance: buildPerformance('coach-adly', 91, 4.6),
      preFeedback: [
        ...liveFeedback['coach-adly'].pre,
        ...liveFeedback['coach-b'].pre,
        ...[
          {
            id: 'pre-a-1',
            participantName: 'Nur Aisyah binti Zakaria',
            participantId: 'ASEAN-00002',
            session: PROGRAMME_TITLE,
            rating: 5,
            comment:
              'Coach Dr. Adly sent an insightful pre-session checklist that helped us identify operational bottlenecks before class.',
            submittedAt: '2026-08-21T10:22:00Z',
          },
          {
            id: 'pre-a-2',
            participantName: 'Mohd Danial bin Yusof',
            participantId: 'ASEAN-00004',
            session: PROGRAMME_TITLE,
            rating: 4,
            comment:
              'Very clear objectives communicated before the training started. Ready to learn automation tools.',
            submittedAt: '2026-08-23T14:08:00Z',
          },
          {
            id: 'pre-a-3',
            participantName: 'Hafiz bin Mansor',
            participantId: 'ASEAN-00007',
            session: PROGRAMME_TITLE,
            rating: 5,
            comment:
              'The pre-session case studies were relevant to F&B operations. Looking forward to the hands-on demos.',
            submittedAt: '2026-08-26T16:15:00Z',
          },
        ],
      ].slice(0, 8),
      postFeedback: [
        ...liveFeedback['coach-adly'].post,
        ...liveFeedback['coach-b'].post,
        ...[
          {
            id: 'post-a-1',
            participantName: 'Nur Aisyah binti Zakaria',
            participantId: 'ASEAN-00002',
            session: PROGRAMME_TITLE,
            rating: 5,
            comment:
              'Coach Dr. Adly is deeply knowledgeable and patient. The no-code automation exercises were immediately applicable.',
            submittedAt: '2026-09-02T17:45:00Z',
          },
          {
            id: 'post-a-2',
            participantName: 'Mohd Danial bin Yusof',
            participantId: 'ASEAN-00004',
            session: PROGRAMME_TITLE,
            rating: 5,
            comment:
              'Exceeded expectations! Clear frameworks on how MSMEs can implement AI safely without expensive software.',
            submittedAt: '2026-09-02T18:30:00Z',
          },
          {
            id: 'post-a-3',
            participantName: 'Hafiz bin Mansor',
            participantId: 'ASEAN-00007',
            session: PROGRAMME_TITLE,
            rating: 4,
            comment:
              'Great insights on prompt engineering and inventory tracking automation. Highly recommended!',
            submittedAt: '2026-09-02T19:20:00Z',
          },
        ],
      ].slice(0, 8),
    },
  ];

  return NextResponse.json({ trainers });
}
