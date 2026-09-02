import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { REGION_CONFIG, RegionCode } from '@/lib/regions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { region = 'ALL' } = await req.json();

    const whereClause: any = {};
    if (region !== 'ALL') {
      whereClause.region = region;
    }

    // Get all registered participants
    const participants = await db.participant.findMany({
      where: whereClause,
      select: {
        id: true,
        participantId: true,
        name: true,
        phone: true,
        region: true,
        finalMode: true,
        sector: true,
      },
    });

    const totalCount = participants.length;

    // Simulate WhatsApp Business API Batch Dispatch with active QR links
    const baseUrl = req.headers.get('origin') || 'https://insken.workers.dev';
    const dispatches = participants.map((p) => ({
      to: p.phone || p.participantId,
      name: p.name,
      participantId: p.participantId,
      passUrl: `${baseUrl}/pass/${p.participantId}`,
      mode: p.finalMode.replace('Registered_', ''),
      status: 'SENT',
      timestamp: new Date().toISOString(),
    }));

    // Log to Audit Log
    const regionLabel = region === 'ALL' ? 'Semua Wilayah' : (REGION_CONFIG[region as RegionCode]?.name || region);
    await db.auditLog.create({
      data: {
        action: 'WHATSAPP_BLAST',
        participant: `Batch (${totalCount} Peserta)`,
        detail: `WhatsApp Event-Day QR Pass Blast dispatched to ${totalCount} confirmed participants for ${regionLabel}.`,
      },
    });

    return NextResponse.json({
      ok: true,
      totalCount,
      region,
      regionLabel,
      dispatches: dispatches.slice(0, 10), // return sample
      message: `WhatsApp Blast berjaya dihantar kepada ${totalCount} peserta (${regionLabel})!`,
    });
  } catch (error: any) {
    console.error('Error during WhatsApp blast:', error);
    return NextResponse.json(
      { ok: false, message: error?.message || 'Ralat semasa menghantar WhatsApp blast.' },
      { status: 500 }
    );
  }
}
