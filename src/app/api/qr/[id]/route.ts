import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import QRCode from 'qrcode';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Strip optional .png extension if provided
    const cleanId = decodeURIComponent(id).replace(/\.png$/i, '').trim();

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
      return new NextResponse('Participant not found', { status: 404 });
    }

    const qrPayload = `${participant.participantId}|${participant.icNumber}|${participant.region}|${participant.finalMode}`;

    const pngBuffer = await QRCode.toBuffer(qrPayload, {
      type: 'png',
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 600,
      color: {
        dark: '#0B1F3A',
        light: '#FFFFFF',
      },
    });

    return new NextResponse(pngBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `inline; filename="INSKEN-QR-${participant.participantId}.png"`,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      },
    });
  } catch (error: any) {
    console.error('Error generating direct QR image:', error);
    return new NextResponse('Error generating QR', { status: 500 });
  }
}
