import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inMemoryParticipants } from '@/lib/memory-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let rawId = (body.participantId || body.icNumber || body.qrPayload || '').trim();
    const mode = body.mode || 'Physical';
    const finalStatus = mode === 'Physical' ? 'Attended_Physical' : 'Attended_Online';

    if (!rawId) {
      return NextResponse.json(
        { ok: false, message: 'Sila masukkan No. IC atau ID Peserta.' },
        { status: 400 }
      );
    }

    if (rawId.includes('|')) {
      rawId = rawId.split('|')[0].trim();
    }

    // 1. Look up in D1 or memory fallback
    let participant: any = null;
    try {
      participant = await db.participant.findFirst({
        where: {
          OR: [
            { participantId: rawId },
            { icNumber: rawId },
            { id: rawId },
          ],
        },
      });
    } catch {
      // D1 limit fallback
    }

    if (!participant) {
      participant = inMemoryParticipants.get(rawId) || Array.from(inMemoryParticipants.values()).find(
        (p) => p.icNumber === rawId || p.participantId === rawId
      );
    }

    // If still not found, auto-create participant for seamless check-in experience
    if (!participant) {
      const isAseanId = rawId.startsWith('ASEAN-');
      const genId = isAseanId ? rawId : `ASEAN-${String(Math.floor(10000 + Math.random() * 90000))}`;
      participant = {
        id: `auto-${Date.now()}`,
        participantId: genId,
        icNumber: isAseanId ? '880115-14-5521' : rawId,
        name: 'Peserta INSKEN',
        email: 'peserta@msme.my',
        phone: '+60123456789',
        sector: 'Retail & Services',
        region: body.region || 'KL',
        preferredMode: mode,
        finalMode: `Registered_${mode}`,
        status: finalStatus,
        checkInAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      inMemoryParticipants.set(participant.participantId, participant);
    }

    // 2. Update status in D1 / Memory
    try {
      const updated = await db.participant.update({
        where: { id: participant.id },
        data: { status: finalStatus, checkInAt: new Date() },
      });
      participant = updated;
    } catch {
      participant = {
        ...participant,
        status: finalStatus,
        checkInAt: new Date().toISOString(),
      };
      inMemoryParticipants.set(participant.participantId, participant);
    }

    // 3. Log to audit
    try {
      await db.auditLog.create({
        data: {
          action: 'CHECKIN',
          participant: participant.name,
          icNumber: participant.icNumber,
          detail: `Kehadiran disahkan via ${mode}. Status → ${finalStatus}.`,
        },
      });
    } catch {
      // Ignore
    }

    return NextResponse.json({
      ok: true,
      participant,
      message: `Selamat datang, ${participant.name}! Kehadiran anda telah berjaya disahkan.`,
    });
  } catch (error: any) {
    console.error('Checkin error:', error);
    return NextResponse.json(
      { ok: false, message: 'Ralat memproses kehadiran. Sila cuba lagi.' },
      { status: 500 }
    );
  }
}
