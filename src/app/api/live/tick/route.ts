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
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    events: [],
    summary: {
      registrations: 0,
      checkins: 0,
      duplicates: 0,
      feedback: 0,
      trainerKpi: 0,
    },
  });
}
