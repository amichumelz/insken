import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import QRCode from 'qrcode';
import { REGION_CONFIG, RegionCode } from '@/lib/regions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = decodeURIComponent(id).trim();

    // Look up by participantId or icNumber
    const participant = await db.participant.findFirst({
      where: {
        OR: [
          { participantId: cleanId },
          { icNumber: cleanId },
          { id: cleanId },
        ],
      },
    });

    if (!participant) {
      return NextResponse.json(
        { ok: false, message: 'Rekod peserta tidak dijumpai.' },
        { status: 404 }
      );
    }

    const regionCode = (participant.region in REGION_CONFIG ? participant.region : 'KL') as RegionCode;
    const regionConfig = REGION_CONFIG[regionCode];

    // Generate real QR code
    const qrPayload = `${participant.participantId}|${participant.icNumber}|${participant.region}|${participant.finalMode}`;
    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 360,
      color: {
        dark: '#0B1F3A',
        light: '#FFFFFF',
      },
    });

    // Check attendance status
    const isAttended = participant.status.startsWith('Attended_');

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
    });
  } catch (error: any) {
    console.error('Error fetching pass:', error);
    return NextResponse.json(
      { ok: false, message: 'Ralat semasa memproses pas peserta.' },
      { status: 500 }
    );
  }
}
