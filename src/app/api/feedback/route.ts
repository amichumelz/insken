import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      trainerId = 'coach-a',
      phase = 'post',
      participantName,
      participantId,
      sessionName,
      rating = 5,
      trainerKnowledge = 5,
      contentClarity = 5,
      practicalUse = 5,
      comment = '',
    } = body;

    const safeRating = Math.max(1, Math.min(5, Number(rating) || 5));
    const safeParticipant = participantName?.trim() || 'Peserta Anonymous';
    const safePartId = participantId?.trim() || `ASEAN-${Math.floor(10000 + Math.random() * 90000)}`;
    const safeSession = sessionName || 'Bengkel A.I. PMKS';

    // Store in AuditLog with action FEEDBACK
    // Format for icNumber: <coachId>|<pre|post>|<participantId>|<rating>|<comment>
    await db.auditLog.create({
      data: {
        action: 'FEEDBACK',
        participant: safeParticipant,
        icNumber: `${trainerId}|${phase}|${safePartId}|${safeRating}|${comment.trim()}`,
        detail: `[${phase.toUpperCase()}] Rating: ${safeRating}/5. Pengetahuan: ${trainerKnowledge}/5. Kejelasan: ${contentClarity}/5. ${comment ? `Komen: "${comment}"` : ''}`,
      },
    });

    // Also update TRAINER_KPI entry
    await db.auditLog.create({
      data: {
        action: 'TRAINER_KPI',
        participant: `System (Feedback)`,
        icNumber: `${trainerId}|sessions:+0|rating:+${(safeRating - 4.5).toFixed(2)}`,
        detail: `Updated trainer ${trainerId} feedback score`,
      },
    });

    return NextResponse.json({
      ok: true,
      message: 'Maklum balas anda telah berjaya dihantar. Terima kasih atas maklum balas!',
    });
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { ok: false, message: 'Ralat semasa menghantar maklum balas.' },
      { status: 500 }
    );
  }
}
