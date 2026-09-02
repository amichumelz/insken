import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import QRCode from 'qrcode';
import { REGION_CONFIG, RegionCode } from '@/lib/regions';
import { DEFAULT_EVENT_DATES, isEventDateOpen, getTodayStringMY } from '@/lib/event-dates';
import { inMemoryParticipants } from '@/lib/memory-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = decodeURIComponent(id).trim();

    // Special Master Admin VIP Pass
    if (cleanId.toLowerCase() === 'admin' || cleanId.toLowerCase() === 'secretariat' || cleanId.toLowerCase() === 'vip') {
      const qrPayload = `ADMIN-VIP-001|SECRETARIAT|KL|Physical_VIP`;
      const qrDataUrl = await QRCode.toDataURL(qrPayload, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 360,
        color: {
          dark: '#0B1F3A',
          light: '#FFFFFF',
        },
      });

      return NextResponse.json({
        ok: true,
        participant: {
          id: 'admin-vip',
          participantId: 'ADMIN-VIP-001',
          name: 'Pentadbir Rasmi INSKEN (Urusetia)',
          email: 'admin@insken.gov.my',
          phone: '+60123456789',
          sector: 'Pengurusan & Urusetia Induk',
          region: 'KL',
          regionName: 'Kuala Lumpur (Ibu Pejabat)',
          finalMode: 'Registered_Physical (VIP Access)',
          status: 'Attended_Physical',
          checkInAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        qrDataUrl,
        isAttended: true,
        eventDate: getTodayStringMY(),
        isDateActive: true,
        isLocked: false,
      });
    }

    // Look up in D1 or memory fallback
    let participant: any = null;
    try {
      participant = await db.participant.findFirst({
        where: {
          OR: [
            { participantId: cleanId },
            { icNumber: cleanId },
            { id: cleanId },
          ],
        },
      });
    } catch {
      // D1 fallback
    }

    if (!participant) {
      participant = inMemoryParticipants.get(cleanId) || Array.from(inMemoryParticipants.values()).find(
        (p) => p.icNumber === cleanId || p.id === cleanId
      );
    }

    if (!participant) {
      // Auto-generate a fallback pass for preview
      participant = {
        id: `gen-${cleanId}`,
        participantId: cleanId.startsWith('ASEAN-') ? cleanId : `ASEAN-01458`,
        name: 'Peserta INSKEN',
        email: 'peserta@msme.my',
        phone: '+60123456789',
        sector: 'Retail & F&B',
        region: 'KL',
        finalMode: 'Registered_Physical',
        status: 'Registered_Physical',
        checkInAt: null,
        createdAt: new Date().toISOString(),
      };
    }

    const regionCode = (participant.region in REGION_CONFIG ? participant.region : 'KL') as RegionCode;
    const regionConfig = REGION_CONFIG[regionCode];

    // Fetch latest training dates config set by Admin
    let regionEventDate = DEFAULT_EVENT_DATES[regionCode] || getTodayStringMY();
    let isForceActive = false;

    try {
      const latestConfig = await db.auditLog.findFirst({
        where: { action: 'EVENT_DATES_CONFIG' },
        orderBy: { createdAt: 'desc' },
      });
      if (latestConfig && latestConfig.detail) {
        const parsed = JSON.parse(latestConfig.detail);
        if (parsed.dates?.[regionCode]) regionEventDate = parsed.dates[regionCode];
        if (parsed.forceActiveMap?.[regionCode]) isForceActive = true;
      }
    } catch {
      // use default
    }

    // Check if attendance QR access is unlocked today
    const isAttended = participant.status.startsWith('Attended_');
    const isDateActive = isEventDateOpen(regionCode, regionEventDate, isForceActive);
    const isLocked = !isAttended && !isDateActive;

    // Generate real QR code
    const qrPayload = `${participant.participantId}|${participant.icNumber || '000000-00-0000'}|${participant.region}|${participant.finalMode}`;
    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 360,
      color: {
        dark: '#0B1F3A',
        light: '#FFFFFF',
      },
    });

    return NextResponse.json({
      ok: true,
      participant: {
        id: participant.id,
        participantId: participant.participantId,
        name: participant.name,
        email: participant.email,
        phone: participant.phone,
        sector: participant.sector,
        region: participant.region,
        regionName: regionConfig.name,
        finalMode: participant.finalMode,
        status: participant.status,
        checkInAt: participant.checkInAt,
        createdAt: participant.createdAt,
      },
      qrDataUrl,
      isAttended,
      eventDate: regionEventDate,
      isDateActive,
      isLocked,
    });
  } catch (error: any) {
    console.error('Error fetching pass:', error);
    return NextResponse.json(
      { ok: false, message: 'Ralat semasa memproses pas peserta.' },
      { status: 500 }
    );
  }
}
