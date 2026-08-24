import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Phase 3: Attendance Tracking
 * Accepts either a participantId (from QR scan) or an IC + region lookup from online form.
 * Stamps the participant record with Attended_Physical / Attended_Online + timestamp.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    participantId?: string;
    icNumber?: string;
    mode?: 'Physical' | 'Online';
  };

  const { participantId, icNumber, mode = 'Physical' } = body;
  if (!participantId && !icNumber) {
    return NextResponse.json(
      { ok: false, error: 'participantId or icNumber required' },
      { status: 400 },
    );
  }

  const participant = participantId
    ? await db.participant.findUnique({ where: { participantId } })
    : await db.participant.findUnique({ where: { icNumber: icNumber! } });

  if (!participant) {
    return NextResponse.json(
      { ok: false, error: 'Participant not found in registry. Verify QR / IC.' },
      { status: 404 },
    );
  }

  if (participant.status.startsWith('Attended_')) {
    return NextResponse.json({
      ok: false,
      alreadyCheckedIn: true,
      participant,
      message: `Already checked in at ${participant.checkInAt?.toISOString()}.`,
    });
  }

  const finalStatus = mode === 'Physical' ? 'Attended_Physical' : 'Attended_Online';
  const updated = await db.participant.update({
    where: { id: participant.id },
    data: { status: finalStatus, checkInAt: new Date() },
  });

  await db.auditLog.create({
    data: {
      action: 'CHECKIN',
      participant: participant.name,
      icNumber: participant.icNumber,
      detail: `Check-in confirmed via ${mode} form. Status → ${finalStatus}.`,
    },
  });

  return NextResponse.json({
    ok: true,
    participant: updated,
    message: `Welcome ${participant.name}! ${mode} check-in confirmed.`,
  });
}
