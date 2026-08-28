import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { REGION_CONFIG, RegionCode } from '@/lib/regions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FIRST_NAMES = [
  'Ahmad', 'Siti', 'Lim', 'Tan', 'Wong', 'Raj', 'Priya', 'Muhammad', 'Nurul', 'Wei',
  'Hafiz', 'Mei', 'Kumar', 'Aishah', 'Daniel', 'Fatimah', 'Chong', 'Anu', 'Suria', 'Koh',
  'Azlan', 'Lina', 'Ravi', 'Nadia', 'Chin', 'Arun', 'Farah', 'Bala', 'Hasan', 'Yee',
  'Syafiq', 'Nabilah', 'Jia', 'Liang', 'Suresh', 'Devi', 'Imran', 'Kavitha', 'Faiz', 'Melati',
];
const LAST_NAMES = [
  'bin Abdullah', 'binti Hassan', 'Wei Ming', 'Hock Lee', 'Kumar', 'a/l Subramaniam',
  'binti Omar', 'bin Rahman', 'Sze Ling', 'Chen Hui', 'binti Yusof', 'bin Ibrahim',
  'Kaur', 'Pillai', 'binti Aziz', 'bin Ismail', 'Yong', 'Tan', 'Lee', 'Wong',
];
const SECTORS = [
  'Retail', 'Food & Beverage', 'Professional Services',
  'Tech & Digital', 'Manufacturing', 'Agriculture', 'Others',
];
const SESSION_NAMES = [
  'AI for Retail Marketing',
  'ChatGPT for MSME Operations',
  'AI Tools for F&B',
  'Generative A.I. Fundamentals',
  'Workflow Automation 101',
  'No-Code A.I. Tools for MSMEs',
  'Automation for Service Businesses',
];
const FEEDBACK_COMMENTS_PRE = [
  'Was nervous about the technical depth, but the pre-session onboarding survey helped me understand what to expect.',
  'Coach sent a helpful primer video 3 days before — felt well-prepared. The agenda was clearly communicated.',
  'Appreciated the quick WhatsApp check-in before the session. The pre-assessment was short and respectful of my time.',
  'Loved that the coach asked about my business goals before the session. Felt personalised, not generic.',
  'Pre-session materials were good but I would have preferred a shorter intro video.',
  'Coach called me directly to understand my business before the session. Felt very well prepared.',
  'Looking forward to applying the framework to my own retail shop. The expectations were clearly set.',
];
const FEEDBACK_COMMENTS_POST = [
  'Absolutely transformative. I left with a working AI marketing calendar for my boutique. Coach was patient with every question.',
  'Already saved 6 hours/week by automating customer replies. The hands-on templates alone were worth the entire session.',
  'Great session, learned 3 new tools I had never heard of. Would have liked more time on the practical exercise though.',
  'Best MSME training I have attended. The coach stayed 30 mins after to help me set up my first AI workflow. Highly recommend.',
  'Built my first Zapier automation in the session — already saving 4 hours/week on invoicing. Very practical.',
  'Learned useful tools but the pacing was a bit fast. The reference guide helped afterwards.',
  'My salon now has automated booking reminders thanks to this session. Coach followed up a week later to check on my progress.',
  'Solid content and clear delivery. Would have liked more sector-specific examples for manufacturing, but the framework is gold.',
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * POST /api/live/tick
 * Simulates a single "moment" of program activity. Each call randomly:
 *   - registers a few new participants
 *   - checks in a few pending participants
 *   - sometimes generates a duplicate attempt (audit log)
 *   - generates occasional new feedback for both trainers
 *   - occasionally nudges trainer KPIs (sessions conducted, avg rating)
 *
 * Returns a summary of what happened so the UI can show a "live event" toast.
 */
export async function POST() {
  const events: Array<{ kind: 'register' | 'checkin' | 'duplicate' | 'feedback' | 'trainer_kpi'; detail: string }> = [];
  const now = Date.now();
  const totalSoFar = await db.participant.count();
  const REGIONS = Object.values(REGION_CONFIG);

  // ── 1) Register 1-3 new participants per tick ─────────────────────────
  const regCount = randInt(1, 3);
  for (let i = 0; i < regCount; i++) {
    const region = rand(REGIONS);
    const seed = (totalSoFar + i + 1) * 17 + Math.floor(now / 1000) + i;
    const name = `${rand(FIRST_NAMES)} ${rand(LAST_NAMES)}`;
    const sector = rand(SECTORS);
    const ic = `${String(70 + randInt(0, 25)).padStart(2, '0')}${String(randInt(1, 12)).padStart(2, '0')}${String(randInt(1, 28)).padStart(2, '0')}-${rand(['14', '01', '07', '12', '13'])}-${String(randInt(1000, 9999)).padStart(4, '0')}-${String(randInt(0, 9))}`;

    // ~15% chance of duplicate (use an existing IC)
    let useExisting = false;
    if (Math.random() < 0.15) {
      const existing = await db.participant.findFirst({ orderBy: { createdAt: 'desc' }, take: 1 });
      if (existing) {
        await db.auditLog.create({
          data: {
            action: 'DUPLICATE_BLOCKED',
            participant: name,
            icNumber: existing.icNumber,
            detail: `Duplicate registration attempt blocked — IC ${existing.icNumber} already exists for ${existing.participantId}.`,
          },
        });
        events.push({ kind: 'duplicate', detail: `${name} blocked (IC already registered)` });
        useExisting = true;
      }
    }
    if (useExisting) continue;

    // Capacity routing — prefer physical until cap, then online fallback
    const physicalCount = await db.participant.count({
      where: { region: region.code, finalMode: 'Registered_Physical' },
    });
    const finalMode =
      physicalCount < region.physicalCap && Math.random() < 0.65
        ? 'Registered_Physical'
        : 'Registered_Online';
    const status = finalMode;

    // Use a random participant ID from a high range to avoid collisions across concurrent ticks
    const safeParticipantId = `ASEAN-${String(randInt(40000, 99999))}`;
    try {
      await db.participant.create({
        data: {
          participantId: safeParticipantId,
          icNumber: ic,
          name,
          email: `${name.toLowerCase().replace(/[^a-z]/g, '.').slice(0, 18)}${randInt(1, 9999)}@${rand(['gmail.com', 'outlook.com', 'msme.my'])}`,
          phone: `+60${randInt(10, 19)}-${randInt(100, 999)} ${randInt(1000, 9999)}`,
          sector,
          region: region.code,
          preferredMode: 'Physical',
          finalMode,
          status,
        },
      });
    } catch (err) {
      // Unique-constraint collision on IC or participantId — treat as a duplicate attempt
      await db.auditLog.create({
        data: {
          action: 'DUPLICATE_BLOCKED',
          participant: name,
          icNumber: ic,
          detail: `Duplicate registration attempt blocked — IC ${ic} already exists.`,
        },
      });
      events.push({ kind: 'duplicate', detail: `${name} blocked (IC collision: ${ic})` });
      continue;
    }
    await db.auditLog.create({
      data: {
        action: 'REGISTER',
        participant: name,
        icNumber: ic,
        detail: `Registered as ${safeParticipantId} via ${finalMode}. Region: ${region.name}.`,
      },
    });
    events.push({ kind: 'register', detail: `${name} → ${safeParticipantId} (${region.code}, ${finalMode.replace('Registered_', '')})` });
  }

  // ── 2) Check-in 2-6 pending participants per tick ────────────────────
  const pending = await db.participant.findMany({
    where: { status: { in: ['Registered_Physical', 'Registered_Online'] } },
    take: 50,
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, status: true, finalMode: true, participantId: true, region: true },
  });
  const checkinCount = Math.min(randInt(2, 6), pending.length);
  for (let i = 0; i < checkinCount; i++) {
    const p = pending[i];
    if (!p) break;
    const newStatus = p.finalMode === 'Registered_Physical' ? 'Attended_Physical' : 'Attended_Online';
    await db.participant.update({
      where: { id: p.id },
      data: { status: newStatus, checkInAt: new Date() },
    });
    await db.auditLog.create({
      data: {
        action: 'CHECKIN',
        participant: p.name,
        icNumber: '',
        detail: `Live check-in: ${p.name} (${p.participantId}) → ${newStatus.replace('Attended_', '')} · ${p.region}.`,
      },
    });
    events.push({ kind: 'checkin', detail: `${p.name} (${p.participantId}) checked in ${newStatus.replace('Attended_', '')}` });
  }

  // ── 3) Occasionally append new feedback to trainers (in-memory state) ──
  // Trainer feedback is stored statically in the trainers API; we persist
  // a "live feedback" ringbuffer in AuditLog so the trainers API can surface
  // the most recent few on top of the static list.
  if (Math.random() < 0.6) {
    const coachId = Math.random() < 0.5 ? 'coach-a' : 'coach-b';
    const phase = Math.random() < 0.5 ? 'pre' : 'post';
    const name = `${rand(FIRST_NAMES)} ${rand(LAST_NAMES)}`;
    const comment = phase === 'pre' ? rand(FEEDBACK_COMMENTS_PRE) : rand(FEEDBACK_COMMENTS_POST);
    const pid = `ASEAN-${String(randInt(1000, 30000)).padStart(5, '0')}`;
    await db.auditLog.create({
      data: {
        action: 'FEEDBACK',
        participant: name,
        icNumber: `${coachId}|${phase}|${pid}|${randInt(3, 5)}|${comment.slice(0, 200)}`,
        detail: `Live ${phase}-session feedback for ${coachId}: "${comment.slice(0, 120)}…"`,
      },
    });
    events.push({ kind: 'feedback', detail: `New ${phase}-session feedback for ${coachId}` });
  }

  // ── 4) Occasionally nudge trainer KPIs (small live updates) ──────────
  if (Math.random() < 0.25) {
    // Persist a KPI delta in AuditLog so trainers API can pick it up
    const coachId = Math.random() < 0.5 ? 'coach-a' : 'coach-b';
    const delta = randInt(1, 2);
    const ratingDelta = (Math.random() - 0.4) * 0.2; // -0.08..+0.12
    await db.auditLog.create({
      data: {
        action: 'TRAINER_KPI',
        participant: '',
        icNumber: `${coachId}|sessions:+${delta}|rating:${ratingDelta >= 0 ? '+' : ''}${ratingDelta.toFixed(3)}`,
        detail: `Live KPI nudge for ${coachId}: +${delta} session, rating Δ ${ratingDelta.toFixed(3)}`,
      },
    });
    events.push({ kind: 'trainer_kpi', detail: `${coachId} +${delta} session, rating Δ ${ratingDelta.toFixed(2)}` });
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    events,
    summary: {
      registrations: events.filter((e) => e.kind === 'register').length,
      checkins: events.filter((e) => e.kind === 'checkin').length,
      duplicates: events.filter((e) => e.kind === 'duplicate').length,
      feedback: events.filter((e) => e.kind === 'feedback').length,
      trainerKpi: events.filter((e) => e.kind === 'trainer_kpi').length,
    },
  });
}
