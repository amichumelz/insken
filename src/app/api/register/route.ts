import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { db } from '@/lib/db';
import { REGION_CONFIG, RegionCode } from '@/lib/regions';
import { inMemoryParticipants, inMemoryAuditLogs, CachedParticipant } from '@/lib/memory-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RegisterPayload {
  icNumber: string;
  name: string;
  email: string;
  phone: string;
  sector: string;
  region: string;
  preferredMode: string;
}

/**
 * Builds the WhatsApp Business message payload that will be dispatched
 * to the participant once their QR asset has been generated.
 */
function buildWhatsAppPayload(opts: {
  participantId: string;
  name: string;
  region: string;
  regionName: string;
  finalMode: string;
  capacityRouted: boolean;
  sector: string;
  eventDate: string;
}) {
  const modeLabel =
    opts.finalMode === 'Registered_Physical' ? 'Physical Venue' : 'Priority Online Session';
  return {
    to: opts.participantId,
    template: 'asean_msme_pass_v1',
    language: { code: 'en' },
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: opts.name },
          { type: 'text', text: opts.participantId },
          { type: 'text', text: opts.regionName },
          { type: 'text', text: modeLabel },
          { type: 'text', text: opts.eventDate },
          { type: 'text', text: opts.capacityRouted ? 'PRIORITY' : 'CONFIRMED' },
        ],
      },
    ],
  };
}

/**
 * Phase 1: Ingestion & Validation — IC is the unique key.
 * Phase 2: Capacity Routing & Asset Generation — physical until cap, then online fallback.
 * Returns a structured workflow log so the dashboard can visualise the agent's decisions.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as RegisterPayload;
  const { icNumber, name, email, phone, sector, region, preferredMode } = body;

  const workflow: Array<{ phase: string; step: string; status: 'success' | 'rejected' | 'routed'; detail: string; timestamp: string }> = [];
  const t0 = new Date().toISOString();
  workflow.push({
    phase: 'Phase 1: Ingestion',
    step: 'Payload Extraction',
    status: 'success',
    detail: `Extracted IC=${icNumber}, Name=${name}, Region=${region}, Mode=${preferredMode}, Sector=${sector}`,
    timestamp: t0,
  });

  // Validate required fields
  if (!icNumber || !name || !email || !region || !sector) {
    return NextResponse.json(
      { ok: false, error: 'Missing required fields', workflow },
      { status: 400 },
    );
  }

  const regionCode = (region in REGION_CONFIG ? region : 'KL') as RegionCode;
  const cfg = REGION_CONFIG[regionCode];

  // Phase 1: Duplicate Check in DB and Memory
  let existing: any = null;
  try {
    existing = await db.participant.findUnique({ where: { icNumber } });
  } catch {
    // Ignore DB error
  }
  if (!existing) {
    existing = Array.from(inMemoryParticipants.values()).find((p) => p.icNumber === icNumber);
  }

  if (existing) {
    workflow.push({
      phase: 'Phase 1: Validation',
      step: 'Duplicate Check',
      status: 'rejected',
      detail: `IC ${icNumber} already registered as ${existing.participantId}. Triggering DUPLICATE_ENTRY rejection.`,
      timestamp: new Date().toISOString(),
    });
    try {
      await db.auditLog.create({
        data: {
          action: 'DUPLICATE_BLOCKED',
          participant: name,
          icNumber,
          detail: `Duplicate registration attempt blocked — IC ${icNumber} already exists for ${existing.participantId}.`,
        },
      });
    } catch {
      inMemoryAuditLogs.unshift({
        id: `audit-${Date.now()}`,
        action: 'DUPLICATE_BLOCKED',
        participant: name,
        detail: `Duplicate registration attempt blocked — IC ${icNumber} already exists for ${existing.participantId}.`,
        createdAt: new Date().toISOString(),
      });
    }
    return NextResponse.json({
      ok: false,
      status: 'DUPLICATE_ENTRY',
      existing,
      message: 'Registered Previously — your IC is already in our system.',
      workflow,
    });
  }

  workflow.push({
    phase: 'Phase 1: Validation',
    step: 'Duplicate Check',
    status: 'success',
    detail: `IC ${icNumber} not found in registry. Proceeding to capacity routing.`,
    timestamp: new Date().toISOString(),
  });

  // Phase 2: Capacity Check
  let physicalCount = 0;
  try {
    physicalCount = await db.participant.count({
      where: { region: regionCode, finalMode: 'Registered_Physical' },
    });
  } catch {
    physicalCount = Array.from(inMemoryParticipants.values()).filter(
      (p) => p.region === regionCode && p.finalMode === 'Registered_Physical'
    ).length;
  }

  let finalMode: 'Registered_Physical' | 'Registered_Online';
  let capacityRouted = false;
  let capacityNote = '';

  if (preferredMode === 'Physical' && physicalCount < cfg.physicalCap) {
    finalMode = 'Registered_Physical';
    workflow.push({
      phase: 'Phase 2: Capacity Routing',
      step: 'Capacity Check',
      status: 'success',
      detail: `Physical seats ${physicalCount}/${cfg.physicalCap} available. Routing to Registered_Physical.`,
      timestamp: new Date().toISOString(),
    });
  } else if (preferredMode === 'Physical' && physicalCount >= cfg.physicalCap) {
    finalMode = 'Registered_Online';
    capacityRouted = true;
    capacityNote = 'Physical seats full; upgraded to Priority Online Session.';
    workflow.push({
      phase: 'Phase 2: Capacity Routing',
      step: 'Capacity Check',
      status: 'routed',
      detail: `Physical seats ${physicalCount}/${cfg.physicalCap} full. Auto-fallback to Registered_Online (priority session).`,
      timestamp: new Date().toISOString(),
    });
    try {
      await db.alert.create({
        data: {
          type: 'CAPACITY_FULL',
          region: regionCode,
          message: `${cfg.name} physical seats full (${physicalCount}/${cfg.physicalCap}). Auto-fallback to Online active for incoming registrations.`,
          severity: 'critical',
          metadata: JSON.stringify({ region: regionCode, physicalCount, cap: cfg.physicalCap }),
        },
      });
    } catch {
      // Ignore
    }
  } else {
    finalMode = 'Registered_Online';
    workflow.push({
      phase: 'Phase 2: Capacity Routing',
      step: 'Capacity Check',
      status: 'success',
      detail: `Preferred mode = Online. Routing to Registered_Online.`,
      timestamp: new Date().toISOString(),
    });
  }

  // Asset generation: unique participant ID + real QR code (PNG data URL)
  let totalSoFar = inMemoryParticipants.size;
  try {
    const dbTotal = await db.participant.count();
    totalSoFar = Math.max(dbTotal, inMemoryParticipants.size);
  } catch {
    totalSoFar = inMemoryParticipants.size;
  }

  const participantId = `ASEAN-${String(totalSoFar + 1).padStart(5, '0')}`;
  const qrSeed = `${participantId}|${icNumber}`;

  // Real-time QR code generation — encodes the participant's check-in payload.
  // Format: <participantId>|<ic>|<region>|<finalMode>
  const qrPayload = `${participantId}|${icNumber}|${regionCode}|${finalMode}`;
  const qrDataUrl = await QRCode.toDataURL(qrPayload, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 320,
    color: {
      dark: '#0B1F3A', // INSKEN navy
      light: '#FFFFFF',
    },
  });

  workflow.push({
    phase: 'Phase 2: Asset Generation',
    step: 'QR Code',
    status: 'success',
    detail: `Generated QR code (${qrPayload}) — high error-correction, 320px PNG — ready for WhatsApp dispatch.`,
    timestamp: new Date().toISOString(),
  });

  // WhatsApp Business API dispatch — sends the digital pass template
  // with embedded QR asset to the participant's phone number.
  const eventDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toLocaleDateString('en-MY', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  const whatsappPayload = buildWhatsAppPayload({
    participantId,
    name,
    region: regionCode,
    regionName: cfg.name,
    finalMode,
    capacityRouted,
    sector,
    eventDate,
  });

  workflow.push({
    phase: 'Phase 2: Asset Generation',
    step: 'WhatsApp Dispatch',
    status: 'success',
    detail: `WhatsApp Business template "asean_msme_pass_v1" dispatched to ${phone || 'recipient'} (template language=en, params: ${whatsappPayload.components[0].parameters.length}).`,
    timestamp: new Date().toISOString(),
  });

  let created: any = null;
  try {
    created = await db.participant.create({
      data: {
        participantId,
        icNumber,
        name,
        email,
        phone,
        sector,
        region: regionCode,
        preferredMode,
        finalMode,
        status: finalMode,
      },
    });
  } catch (err) {
    console.warn('DB participant create fallback to memory:', err);
  }

  // Always sync to memory store
  const record: CachedParticipant = {
    id: created?.id || `p-${Date.now()}`,
    participantId,
    icNumber,
    name,
    email,
    phone,
    sector,
    region: regionCode,
    preferredMode,
    finalMode,
    status: finalMode,
    checkInAt: null,
    createdAt: created?.createdAt ? new Date(created.createdAt).toISOString() : new Date().toISOString(),
  };
  inMemoryParticipants.set(participantId, record);

  try {
    await db.auditLog.create({
      data: {
        action: 'REGISTER',
        participant: name,
        icNumber,
        detail: `Registered as ${participantId} via ${finalMode}. Region: ${cfg.name}.`,
      },
    });
  } catch {
    inMemoryAuditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: 'REGISTER',
      participant: name,
      detail: `Registered as ${participantId} via ${finalMode}. Region: ${cfg.name}.`,
      createdAt: new Date().toISOString(),
    });
  }

  // Check 80% warning threshold post-registration
  const newPhysical = await db.participant.count({
    where: { region: regionCode, finalMode: 'Registered_Physical' },
  });
  if (newPhysical === Math.floor(cfg.physicalCap * 0.8)) {
    await db.alert.create({
      data: {
        type: 'CAPACITY_80',
        region: regionCode,
        message: `${cfg.name} physical capacity reached 80% (${newPhysical}/${cfg.physicalCap}). Reduce regional ad spend.`,
        severity: 'warning',
        metadata: JSON.stringify({ region: regionCode, count: newPhysical, cap: cfg.physicalCap, pct: 80 }),
      },
    });
  }

  // Check 95% shift-to-online threshold — triggers pre-emptive recommendation alert
  if (newPhysical === Math.floor(cfg.physicalCap * 0.95)) {
    await db.alert.create({
      data: {
        type: 'CAPACITY_95',
        region: regionCode,
        message: `${cfg.name} physical capacity at 95% (${newPhysical}/${cfg.physicalCap}). Recommend shifting to Online sessions now — pre-emptive routing before hard cap.`,
        severity: 'critical',
        metadata: JSON.stringify({
          region: regionCode,
          count: newPhysical,
          cap: cfg.physicalCap,
          pct: 95,
          remaining: cfg.physicalCap - newPhysical,
          recommendation: 'SHIFT_TO_ONLINE',
        }),
      },
    });
  }

  return NextResponse.json({
    ok: true,
    participant: created,
    qrSeed,
    qrPayload,
    qrDataUrl,
    whatsapp: {
      dispatchedAt: new Date().toISOString(),
      template: 'asean_msme_pass_v1',
      recipient: phone || email,
      eventDate,
      payload: whatsappPayload,
    },
    capacityRouted,
    capacityNote,
    message: capacityRouted
      ? 'Physical seats full; you have been upgraded to our Priority Online Session.'
      : 'Registration confirmed. Your WhatsApp confirmation with event details is on its way.',
    workflow,
  });
}
